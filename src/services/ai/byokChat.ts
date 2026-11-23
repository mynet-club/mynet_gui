export type ByokProviderId =
  | 'gemini'
  | 'deepseek'
  | 'qwen'
  | 'zhipu'
  | 'openai'
  | 'openrouter'
  | 'custom'

export interface ByokProviderPreset {
  id: ByokProviderId
  label: string
  baseUrl: string
  defaultModel: string
  models: readonly string[]
  keyPlaceholder: string
  hint: string
}

export const BYOK_PROVIDER_PRESETS: readonly ByokProviderPreset[] = [
  {
    id: 'gemini',
    label: 'Google Gemini (Flash)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'],
    keyPlaceholder: '输入 Google AI Studio Key',
    hint: '原生支持浏览器直连与高速 Flash 模型',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek (Flash)',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-flash',
    models: ['deepseek-flash', 'deepseek-chat', 'deepseek-reasoner'],
    keyPlaceholder: '输入 DeepSeek Key',
    hint: 'DeepSeek 开放平台（默认 deepseek-flash）',
  },
  {
    id: 'qwen',
    label: '通义千问 (Qwen Flash)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-flash',
    models: ['qwen-flash', 'qwen-turbo', 'qwen-plus'],
    keyPlaceholder: '输入阿里云百炼 Key',
    hint: '阿里云百炼 OpenAI 兼容模式',
  },
  {
    id: 'zhipu',
    label: '智谱清言 (GLM Flash)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    models: ['glm-4-flash', 'glm-4.5-flash', 'glm-4-air'],
    keyPlaceholder: '输入智谱 BigModel Key',
    hint: '智谱开放平台，支持轻量 Flash 模型',
  },
  {
    id: 'openai',
    label: 'OpenAI (Mini)',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1-nano'],
    keyPlaceholder: '输入 OpenAI Key',
    hint: 'OpenAI 官方接口',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (多模型聚合)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash',
    models: [
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash-lite',
      'deepseek/deepseek-chat',
      'openai/gpt-4o-mini',
    ],
    keyPlaceholder: '输入 OpenRouter Key',
    hint: '多模型聚合平台，原生支持浏览器直连各类 Flash 模型',
  },
  {
    id: 'custom',
    label: '自定义 OpenAI 兼容接口',
    baseUrl: '',
    defaultModel: '',
    models: [],
    keyPlaceholder: '可选或填写接口 Key',
    hint: '支持火山豆包、硅基流动、本地 Ollama 或自建兼容网关',
  },
]

export interface ByokConfig {
  provider: ByokProviderId
  model: string
  apiKey: string
  baseUrl: string
}

export interface ByokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const BYOK_STORAGE_KEY = 'mynet_local_byok_ai_v1'
export const BYOK_HISTORY_STORAGE_KEY = 'mynet_local_byok_history_v1'
const MAX_HISTORY_MESSAGES = 50

export interface ByokHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export function getProviderPreset(id: string): ByokProviderPreset {
  return BYOK_PROVIDER_PRESETS.find((p) => p.id === id) ?? BYOK_PROVIDER_PRESETS[0]!
}

export function defaultByokConfig(): ByokConfig {
  const preset = BYOK_PROVIDER_PRESETS[0]!
  return {
    provider: preset.id,
    model: preset.defaultModel,
    apiKey: '',
    baseUrl: preset.baseUrl,
  }
}

export function loadByokConfig(): ByokConfig {
  const fallback = defaultByokConfig()
  try {
    const raw = localStorage.getItem(BYOK_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<ByokConfig>
    const preset = getProviderPreset(parsed.provider ?? fallback.provider)
    return {
      provider: preset.id,
      model: typeof parsed.model === 'string' && parsed.model.trim() !== '' ? parsed.model.trim() : preset.defaultModel,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey.trim() : '',
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl.trim() !== '' ? parsed.baseUrl.trim() : preset.baseUrl,
    }
  } catch {
    return fallback
  }
}

export function saveByokConfig(config: ByokConfig): void {
  localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify({
    provider: config.provider,
    model: config.model.trim(),
    apiKey: config.apiKey.trim(),
    baseUrl: config.baseUrl.trim(),
  }))
}

export function clearByokApiKey(): void {
  const current = loadByokConfig()
  saveByokConfig({ ...current, apiKey: '' })
}

export function loadByokHistory(): ByokHistoryItem[] {
  try {
    const raw = localStorage.getItem(BYOK_HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is ByokHistoryItem => (
        Boolean(item)
        && typeof item === 'object'
        && (item.role === 'user' || item.role === 'assistant')
        && typeof item.content === 'string'
      ))
      .slice(-MAX_HISTORY_MESSAGES)
  } catch {
    return []
  }
}

export function saveByokHistory(items: ByokHistoryItem[]): void {
  try {
    const trimmed = items
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content.trim() !== '')
      .slice(-MAX_HISTORY_MESSAGES)
    localStorage.setItem(BYOK_HISTORY_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    /* localStorage 配额满时静默忽略 */
  }
}

export function clearByokHistory(): void {
  try {
    localStorage.removeItem(BYOK_HISTORY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function buildCompletionsEndpoint(baseUrl: string): string {
  const cleaned = baseUrl.trim().replace(/\/+$/, '')
  if (cleaned === '') return ''
  if (cleaned.endsWith('/chat/completions')) return cleaned
  return `${cleaned}/chat/completions`
}

export function buildLocalSystemPrompt(diagnosticSnapshot?: string): string {
  const parts = [
    '你是 MyNet 本机客户端 AI 排障与配置助手，使用简洁清晰的中文回答用户问题。',
    '安全红线：',
    '1. 绝不要求用户粘贴私钥、密码或凭据。',
    '2. 涉及修改本机网络、隧道或配置的操作，只能从下方「可用修复动作」目录中用 [[action:<id>]] 语法推荐，让用户在页面上确认后执行；不要编造目录外的动作 id。',
  ]
  if (diagnosticSnapshot && diagnosticSnapshot.trim() !== '') {
    parts.push('', diagnosticSnapshot.trim())
  }
  return parts.join('\n')
}

function extractErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const rec = body as Record<string, unknown>
    const errObj = rec.error as Record<string, unknown> | string | undefined
    if (typeof errObj === 'string' && errObj.trim() !== '') return errObj
    if (errObj && typeof errObj === 'object' && typeof errObj.message === 'string' && errObj.message.trim() !== '') {
      return errObj.message
    }
    if (typeof rec.message === 'string' && rec.message.trim() !== '') return rec.message
  }
  return `模型接口返回错误（HTTP ${status}）`
}

export function parseOpenAiSseLine(line: string): { delta: string; done: boolean } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith(':')) return null
  if (!trimmed.startsWith('data:')) return null

  const payload = trimmed.slice(5).trim()
  if (payload === '[DONE]') return { delta: '', done: true }
  if (payload === '') return null

  try {
    const parsed = JSON.parse(payload) as {
      choices?: Array<{
        delta?: { content?: string | null; reasoning_content?: string | null }
        message?: { content?: string | null }
      }>
    }
    const choice = parsed.choices?.[0]
    const delta = choice?.delta?.content ?? choice?.message?.content ?? ''
    return { delta: typeof delta === 'string' ? delta : '', done: false }
  } catch {
    return null
  }
}

export async function streamByokChat(options: {
  config: ByokConfig
  messages: ByokMessage[]
  signal?: AbortSignal
  onDelta?: (chunk: string) => void
}): Promise<{ text: string }> {
  const endpoint = buildCompletionsEndpoint(options.config.baseUrl)
  if (!endpoint) {
    throw new Error('请先填写有效的 API Base URL')
  }
  if (!options.config.model.trim()) {
    throw new Error('请先选择或填写模型名称')
  }
  const key = options.config.apiKey.trim()
  if (options.config.provider !== 'custom' && !key) {
    throw new Error('请先输入 API Key')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, application/json',
  }
  if (key !== '') {
    headers.Authorization = `Bearer ${key}`
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: options.signal,
      body: JSON.stringify({
        model: options.config.model.trim(),
        messages: options.messages,
        stream: true,
      }),
    })
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err
    throw new Error(
      '无法连接到模型接口（可能是网络不可达或该服务商未开放浏览器 CORS；可换用 Gemini Flash / DeepSeek / 智谱 / OpenRouter 或本地兼容网关）',
    )
  }

  if (!response.ok) {
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    throw new Error(extractErrorMessage(body, response.status))
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const text = json.choices?.[0]?.message?.content ?? ''
    if (text) options.onDelta?.(text)
    return { text }
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('模型接口未返回可读流')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  const processLines = (flush = false): boolean => {
    const lines = buffer.split('\n')
    buffer = flush ? '' : (lines.pop() ?? '')
    for (const line of lines) {
      const parsed = parseOpenAiSseLine(line)
      if (!parsed) continue
      if (parsed.done) return true
      if (parsed.delta) {
        fullText += parsed.delta
        options.onDelta?.(parsed.delta)
      }
    }
    return false
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    if (processLines(false)) break
  }
  buffer += decoder.decode()
  processLines(true)

  return { text: fullText }
}
