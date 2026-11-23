import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BYOK_HISTORY_STORAGE_KEY,
  BYOK_PROVIDER_PRESETS,
  BYOK_STORAGE_KEY,
  buildCompletionsEndpoint,
  buildLocalSystemPrompt,
  clearByokApiKey,
  clearByokHistory,
  loadByokConfig,
  loadByokHistory,
  parseOpenAiSseLine,
  saveByokConfig,
  saveByokHistory,
  streamByokChat,
} from '../byokChat'

const encoder = new TextEncoder()

function mockSseResponse(chunks: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
}

describe('byokChat presets & config persistence', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v) },
      removeItem: (k: string) => { store.delete(k) },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('includes mainstream Flash model presets', () => {
    const ids = BYOK_PROVIDER_PRESETS.map((p) => p.id)
    expect(ids).toContain('gemini')
    expect(ids).toContain('deepseek')
    expect(ids).toContain('qwen')
    expect(ids).toContain('zhipu')
    expect(ids).toContain('openai')
    expect(ids).toContain('openrouter')
    expect(ids).toContain('custom')
    expect(BYOK_PROVIDER_PRESETS.find((p) => p.id === 'gemini')?.models).toContain('gemini-2.5-flash')
    expect(BYOK_PROVIDER_PRESETS.find((p) => p.id === 'deepseek')?.defaultModel).toBe('deepseek-flash')
    expect(BYOK_PROVIDER_PRESETS.find((p) => p.id === 'qwen')?.models).toContain('qwen-flash')
    expect(BYOK_PROVIDER_PRESETS.find((p) => p.id === 'zhipu')?.models).toContain('glm-4-flash')
  })

  it('saves, loads, and clears chat history in localStorage', () => {
    saveByokHistory([
      { role: 'user', content: '状态正常吗' },
      { role: 'assistant', content: '**正常**' },
    ])
    expect(store.has(BYOK_HISTORY_STORAGE_KEY)).toBe(true)
    expect(loadByokHistory()).toEqual([
      { role: 'user', content: '状态正常吗' },
      { role: 'assistant', content: '**正常**' },
    ])
    clearByokHistory()
    expect(loadByokHistory()).toEqual([])
  })

  it('saves, loads, and clears API key in localStorage', () => {
    saveByokConfig({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiKey: 'demo-user-key-001',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    })
    expect(store.has(BYOK_STORAGE_KEY)).toBe(true)
    expect(loadByokConfig()).toMatchObject({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiKey: 'demo-user-key-001',
    })

    clearByokApiKey()
    expect(loadByokConfig().apiKey).toBe('')
  })

  it('builds chat completions endpoint cleanly', () => {
    expect(buildCompletionsEndpoint('https://api.deepseek.com/v1/')).toBe('https://api.deepseek.com/v1/chat/completions')
    expect(buildCompletionsEndpoint('https://api.example.com/v1/chat/completions')).toBe('https://api.example.com/v1/chat/completions')
    expect(buildCompletionsEndpoint('')).toBe('')
  })

  it('embeds sanitized snapshot in local system prompt', () => {
    const prompt = buildLocalSystemPrompt('## 本机诊断摘要\n- state: RUNNING')
    expect(prompt).toContain('[[action:<id>]]')
    expect(prompt).toContain('state: RUNNING')
  })
})

describe('parseOpenAiSseLine & streamByokChat', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('parses OpenAI SSE lines and [DONE] marker', () => {
    expect(parseOpenAiSseLine('')).toBeNull()
    expect(parseOpenAiSseLine(': keepalive')).toBeNull()
    expect(parseOpenAiSseLine('data: [DONE]')).toEqual({ delta: '', done: true })
    expect(parseOpenAiSseLine('data: {"choices":[{"delta":{"content":"你好"}}]}')).toEqual({ delta: '你好', done: false })
  })

  it('streams chunks from OpenAI-compatible Flash endpoint with user API key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockSseResponse([
      'data: {"choices":[{"delta":{"content":"本机"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"隧道正常"}}]}\n\n',
      'data: [DONE]\n\n',
    ]))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const received: string[] = []
    const res = await streamByokChat({
      config: {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        apiKey: 'demo-user-key-002',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      },
      messages: [{ role: 'user', content: '状态正常吗' }],
      onDelta: (c) => received.push(c),
    })

    expect(res.text).toBe('本机隧道正常')
    expect(received).toEqual(['本机', '隧道正常'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions')
    expect(init.headers.Authorization).toBe('Bearer demo-user-key-002')
    expect(JSON.parse(init.body)).toMatchObject({
      model: 'gemini-2.5-flash',
      stream: true,
    })
  })

  it('rejects when API key is missing for preset providers', async () => {
    await expect(streamByokChat({
      config: {
        provider: 'deepseek',
        model: 'deepseek-chat',
        apiKey: '',
        baseUrl: 'https://api.deepseek.com/v1',
      },
      messages: [{ role: 'user', content: 'hi' }],
    })).rejects.toThrow('API Key')
  })
})
