import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const apiPost = vi.hoisted(() => vi.fn())
const apiGet = vi.hoisted(() => vi.fn())

vi.mock('../../api', () => ({ api: { post: apiPost, get: apiGet } }))
vi.mock('../../../utils/tokenManager', () => ({
  tokenManager: { getAccessToken: () => 'user-token' },
}))
vi.mock('quasar', () => ({
  LocalStorage: { getItem: () => JSON.stringify({ tenant_id: '1001' }) },
}))

import {
  askUserAi,
  chatEndpoint,
  resetTenantSlugCache,
  resolveTenantSlug,
  shouldFallback,
  streamBaseUrl,
  streamUserAiChat,
} from '../userAiChat'

const encoder = new TextEncoder()

function sseResponse(frames: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const frame of frames) controller.enqueue(encoder.encode(frame))
      controller.close()
    },
  })

  return new Response(body, { status: 200, headers: { 'content-type': 'text/plain' } })
}

describe('userAiChat endpoint derivation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('derives /ai-stream from the API root', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(streamBaseUrl()).toBe('/ai-stream')
    expect(chatEndpoint()).toBe('/ai-stream/chat')
  })

  it('keeps the same origin/prefix when the app is mounted under /gui', () => {
    vi.stubEnv('VITE_API_BASE_URL', '/gui')
    expect(chatEndpoint()).toBe('/gui/ai-stream/chat')
  })

  it('honours an explicit VITE_AI_STREAM_BASE', () => {
    vi.stubEnv('VITE_AI_STREAM_BASE', 'https://ai.example.com/stream/')
    expect(chatEndpoint()).toBe('https://ai.example.com/stream/chat')
  })

  it('only falls back on deployment/routing failures, not auth failures', () => {
    expect(shouldFallback(404)).toBe(true)
    expect(shouldFallback(503)).toBe(true)
    expect(shouldFallback(401)).toBe(false)
    expect(shouldFallback(429)).toBe(false)
  })
})

describe('streamUserAiChat', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    apiPost.mockReset()
    apiGet.mockReset()
    resetTenantSlugCache()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('aggregates text, conversation id and tool traces from the data stream', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([
      '2:[{"type":"meta","conversation_id":42}]\n',
      '9:{"toolCallId":"c1","toolName":"mynet.user.nodes.list","args":{}}\n',
      'a:{"toolCallId":"c1","result":{"count":2}}\n',
      '0:"你有 2 个节点"\n',
      '0:"，都在线。"\n',
      'd:{"finishReason":"stop"}\n',
    ]))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await streamUserAiChat({ messages: [{ role: 'user', content: '我的节点在线吗' }] })

    expect(result.text).toBe('你有 2 个节点，都在线。')
    expect(result.conversationId).toBe(42)
    expect(result.tools).toEqual([{ id: 'c1', name: 'mynet.user.nodes.list', state: 'done' }])
    expect(result.error).toBeNull()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(chatEndpoint())
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer user-token')
    expect(init.headers['X-Tenant-ID']).toBe('1001')
    expect(JSON.parse(init.body)).toMatchObject({
      scope: 'user',
      conversation_id: null,
      messages: [{ role: 'user', content: '我的节点在线吗' }],
    })
  })

  it('records an in-stream error frame without dropping the text already received', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(sseResponse([
      '0:"部分回答"\n',
      '3:"出站守护拦截"\n',
    ])) as unknown as typeof fetch

    const result = await streamUserAiChat({ messages: [{ role: 'user', content: 'q' }] })

    expect(result.text).toBe('部分回答')
    expect(result.error).toBe('出站守护拦截')
  })

  it('throws with the HTTP status so the caller can decide to fall back', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, message: '流式服务已关闭' }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    )) as unknown as typeof fetch

    await expect(streamUserAiChat({ messages: [{ role: 'user', content: 'q' }] }))
      .rejects.toMatchObject({ message: '流式服务已关闭', status: 503 })
  })
})

describe('askUserAi / tenant slug', () => {
  beforeEach(() => {
    apiPost.mockReset()
    apiGet.mockReset()
    resetTenantSlugCache()
  })

  it('posts tenant_slug + question and unwraps the answer envelope', async () => {
    apiPost.mockResolvedValueOnce({
      data: { success: true, data: { answer: '答案', sources: [{ title: '手册' }], denied: false } },
    })

    const result = await askUserAi('怎么加节点', 'demo')

    expect(apiPost).toHaveBeenCalledWith('/user-ai/ask', { tenant_slug: 'demo', question: '怎么加节点' })
    expect(result).toEqual({ answer: '答案', sources: [{ title: '手册' }], denied: false })
  })

  it('resolves and caches tenant slug by tenant id via /user/tenants/', async () => {
    apiGet.mockResolvedValueOnce({ data: { data: [{ tenant_id: 1001, slug: 'demo' }] } })

    expect(await resolveTenantSlug()).toBe('demo')
    // 第二次命中缓存，不再打 /user/tenants/
    expect(await resolveTenantSlug()).toBe('demo')
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(apiGet).toHaveBeenCalledWith('/user/tenants/')
  })

  it('returns null when the tenant has no slug', async () => {
    apiGet.mockResolvedValueOnce({ data: { data: [{ tenant_id: 1001, slug: '' }] } })
    expect(await resolveTenantSlug()).toBeNull()
  })
})
