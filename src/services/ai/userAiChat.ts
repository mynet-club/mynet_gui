/**
 * C 端 AI（user-ai）客户端：流式 + 非流式兜底。
 *
 * ## 拓扑
 *
 * ```
 * 浏览器 ──POST /ai-stream/chat(scope=user)──▶ Node SSE 引擎 ──▶ PHP /user-ai/stream/*
 * ```
 *
 * 浏览器**不直连** PHP 的流式契约端点：那些端点要 `X-AI-Streaming-Service-Token`
 * （Node→PHP 的内部凭据），浏览器持有它等于把信任边界交出去。所以：
 * - 正常路径：打 Node `/ai-stream/chat`，只带用户自己的 `Authorization` 与 `X-Tenant-ID`；
 * - 兜底路径：Node 未部署/未开通（404/503/网络错误）时退到 `POST /api/v1/user-ai/ask`
 *   （同步问答，返回 answer + sources；没有 token 级流式，但功能不丢）。
 *
 * ## 身份
 *
 * 复用 `tokenManager` 的 access token 与 `user_info.tenant_id` —— 与 axios 拦截器同源，
 * 不在这里另建一套登录态。`tenant_slug` 只有非流式 ask 需要（框架的公开路由按 slug
 * 定位租户），按 tenant_id 从 `/tenants` 反查并做短缓存。
 */
import { LocalStorage } from 'quasar'
import { api } from '../api'
import { tokenManager } from '../../utils/tokenManager'
import { DataStreamParser, type AiStreamEvent } from './dataStreamParser'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatToolTrace {
  id?: string
  name: string
  state: 'running' | 'done' | 'error'
}

export interface StreamChatResult {
  text: string
  conversationId: number | null
  tools: ChatToolTrace[]
  error: string | null
}

export interface AskResult {
  answer: string
  sources: Array<Record<string, unknown>>
  denied: boolean
}

const DEFAULT_STREAM_PATH = '/ai-stream'

/** 流式入口根路径：`VITE_AI_STREAM_BASE` > 由 API 根推导（同源部署即 `/ai-stream`）。 */
export function streamBaseUrl(): string {
  const explicit = import.meta.env.VITE_AI_STREAM_BASE as string | undefined
  if (explicit) return explicit.replace(/\/+$/, '')

  const apiRoot = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  return `${apiRoot.replace(/\/+$/, '')}${DEFAULT_STREAM_PATH}`
}

export function chatEndpoint(): string {
  return `${streamBaseUrl()}/chat`
}

function currentTenantId(): string | null {
  try {
    const raw = LocalStorage.getItem('user_info') as string | null
    if (!raw) return null
    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    return user?.tenant_id ? String(user.tenant_id) : null
  } catch {
    return null
  }
}

/** 流式失败是否值得退到同步 ask（网络/未部署/未开通；认证失败不兜底）。 */
function shouldFallback(status: number): boolean {
  return status === 404 || status === 405 || status === 501 || status === 503 || status === 502
}

function errorMessageFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  const message = record.message ?? record.error
  return typeof message === 'string' && message !== '' ? message : null
}

/**
 * 发起一次流式对话。事件通过 `onEvent` 实时回调（用于工具状态展示），
 * 返回值是聚合结果（完整文本 + conversation_id + 工具轨迹）。
 */
export async function streamUserAiChat(options: {
  messages: ChatMessage[]
  conversationId?: number | null
  signal?: AbortSignal
  onEvent?: (event: AiStreamEvent) => void
}): Promise<StreamChatResult> {
  const token = tokenManager.getAccessToken()
  const tenantId = currentTenantId()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/plain, text/event-stream',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (tenantId) headers['X-Tenant-ID'] = tenantId

  const response = await fetch(chatEndpoint(), {
    method: 'POST',
    headers,
    credentials: 'include',
    signal: options.signal,
    body: JSON.stringify({
      scope: 'user',
      conversation_id: options.conversationId ?? null,
      messages: options.messages,
    }),
  })

  if (!response.ok) {
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    const message = errorMessageFromBody(body) ?? `AI 服务不可用（HTTP ${response.status}）`
    const error = new Error(message) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('AI 服务未返回可读流')
  }

  const parser = new DataStreamParser()
  const decoder = new TextDecoder()
  const tools: ChatToolTrace[] = []
  let text = ''
  let conversationId: number | null = options.conversationId ?? null
  let streamError: string | null = null

  const handle = (events: AiStreamEvent[]): void => {
    for (const event of events) {
      options.onEvent?.(event)

      switch (event.type) {
        case 'text':
          text += event.text
          break
        case 'data':
          for (const item of event.data) {
            if (item && typeof item === 'object') {
              const record = item as Record<string, unknown>
              if (record.type === 'meta' && typeof record.conversation_id === 'number') {
                conversationId = record.conversation_id
              }
            }
          }
          break
        case 'tool-call': {
          const name = event.toolName ?? event.id ?? 'tool'
          const existing = tools.find((trace) => trace.id !== undefined && trace.id === event.id)
          if (existing) {
            existing.state = 'running'
          } else {
            tools.push({ id: event.id, name, state: 'running' })
          }
          break
        }
        case 'tool-result': {
          const trace = tools.find((item) => item.id !== undefined && item.id === event.id)
          if (trace) {
            const failed = Boolean(event.result && typeof event.result === 'object'
              && (event.result as Record<string, unknown>).error)
            trace.state = failed ? 'error' : 'done'
          }
          break
        }
        case 'error':
          streamError = event.message
          break
        default:
          break
      }
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    handle(parser.push(decoder.decode(value, { stream: true })))
  }
  handle(parser.push(decoder.decode()))
  handle(parser.flush())

  return { text, conversationId, tools, error: streamError }
}

/** 非流式兜底：同步问答（Node 未部署/未开通时仍可用）。 */
export async function askUserAi(question: string, tenantSlug: string, visitorKey?: string): Promise<AskResult> {
  const response = await api.post('/user-ai/ask', {
    tenant_slug: tenantSlug,
    question,
    ...(visitorKey ? { visitor_key: visitorKey } : {}),
  })

  const data = response.data?.data ?? {}
  return {
    answer: typeof data.answer === 'string' ? data.answer : '',
    sources: Array.isArray(data.sources) ? data.sources : [],
    denied: Boolean(data.denied),
  }
}

let tenantSlugCache: { id: string; slug: string } | null = null

/** 按 tenant_id 反查 slug（非流式 ask 的定位参数）；单次缓存，换区自动失效。 */
export async function resolveTenantSlug(tenantId?: string | null): Promise<string | null> {
  const id = tenantId ?? currentTenantId()
  if (!id) return null
  if (tenantSlugCache?.id === id) return tenantSlugCache.slug

  // 用户面归属列表唯一真源是 GET /api/v1/user/tenants/（旧 /tenants 组已下架）
  const response = await api.get('/user/tenants/')
  const rows = response.data?.data?.items ?? response.data?.data ?? []
  const found = (Array.isArray(rows) ? rows : []).find(
    (row: Record<string, unknown>) => String(row.tenant_id) === String(id),
  )
  const slug = typeof found?.slug === 'string' && found.slug !== '' ? found.slug : null
  if (slug) tenantSlugCache = { id, slug }

  return slug
}

export function resetTenantSlugCache(): void {
  tenantSlugCache = null
}

/** 当前账号可用的 C 端工具（白名单 ∩ 能力，服务端算好）。 */
export async function fetchUserAiCapabilities(): Promise<Array<Record<string, unknown>>> {
  const response = await api.get('/user-ai/capabilities')
  const data = response.data?.data
  return Array.isArray(data?.tools) ? data.tools : Array.isArray(data) ? data : []
}

export { shouldFallback }
