import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  mergeKbChunks,
  parseKbManifest,
  resolveOnlineUrl,
  sha256Hex,
  KB_BASELINE_URL,
  KB_LOCAL_URL,
  type TipsKbChunk,
  type TipsKbManifest
} from '../kbService'

/**
 * tips-kb 合并语义（契约 §3.4）、加载降级（§3.5）与云端面条件拉取（§3.3，O1 定案）判据。
 */

const chunk = (id: string, extra: Partial<TipsKbChunk> = {}): TipsKbChunk => ({
  id,
  title: `标题-${id}`,
  tags: ['help', 'overview'],
  body: `正文-${id}`,
  source: { file: `docs/${id}.md`, section: '文件标题' },
  ...extra
})

const manifest = (chunks: TipsKbChunk[], version = 'v-test.1'): TipsKbManifest => ({
  version,
  generated_at: '2026-10-26T00:00:00Z',
  lang: 'zh-CN',
  chunks
})

/** 契约口径：响应不包信封，body 即 manifest JSON 文本 */
const jsonResponse = (data: unknown, headers: Record<string, string> = {}) => {
  const lower: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v
  return {
    ok: true,
    status: 200,
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
    text: async () => JSON.stringify(data)
  }
}

const notModifiedResponse = () => ({
  ok: false,
  status: 304,
  headers: { get: () => null },
  text: async () => ''
})

describe('mergeKbChunks（id-keyed reconcile 纯函数）', () => {
  it('新增：载荷里的新 id 进入有效集', () => {
    const result = mergeKbChunks([chunk('a')], [chunk('a'), chunk('b')])
    expect(result.map((c) => c.id).sort()).toEqual(['a', 'b'])
  })

  it('更新：同 id 以载荷为准', () => {
    const result = mergeKbChunks(
      [chunk('a', { title: '旧标题' })],
      [chunk('a', { title: '新标题' })]
    )
    expect(result).toHaveLength(1)
    expect(result[0]?.title).toBe('新标题')
  })

  it('删除缺席：不在载荷 id 集的本地条目被删除', () => {
    const result = mergeKbChunks([chunk('a'), chunk('b')], [chunk('a')])
    expect(result.map((c) => c.id)).toEqual(['a'])
  })

  it('空 chunks = 撤回全部', () => {
    expect(mergeKbChunks([chunk('a'), chunk('b')], [])).toEqual([])
  })

  it('幂等：同一载荷重复合并不改变有效集', () => {
    const incoming = [chunk('a', { title: '新标题' }), chunk('b')]
    const once = mergeKbChunks([chunk('a', { title: '旧标题' }), chunk('gone')], incoming)
    const twice = mergeKbChunks(once, incoming)
    expect(twice).toEqual(once)
    expect(twice).toEqual(incoming)
  })

  it('失败保留语义：不调用合并即保留原集（由 loader 在拉取失败时不触发合并）', () => {
    const kept = [chunk('a'), chunk('b')]
    expect(mergeKbChunks(kept, kept)).toEqual(kept)
    expect(parseKbManifest(null)).toBeNull()
  })
})

describe('resolveOnlineUrl（本机面 / 云端面选路，§3.3）', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('本机面（127.0.0.1）打 localapi 8096', () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1' } })
    expect(resolveOnlineUrl()).toBe(KB_LOCAL_URL)
  })

  it('云端面（非本机、非嵌入）打业务后端 /api/v1/kb/tips-kb.json（O1）', () => {
    vi.stubGlobal('window', { location: { hostname: 'my.mynet.club' } })
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(resolveOnlineUrl()).toBe('/api/v1/kb/tips-kb.json')
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    expect(resolveOnlineUrl()).toBe('https://api.example.com/api/v1/kb/tips-kb.json')
    vi.unstubAllEnvs()
  })
})

describe('kbService 加载与降级', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('本机端点不可达 → 用基线', async () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1' } })
    const baseline = manifest([chunk('help-what-is-mynet')], 'v-base.1')
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        const url = String(input)
        if (url === KB_LOCAL_URL) throw new TypeError('fetch failed')
        expect(url).toBe(KB_BASELINE_URL)
        return jsonResponse(baseline)
      })
    )
    const kb = await import('../kbService')
    const state = await kb.loadKb()
    expect(state.origin).toBe('baseline')
    expect(state.version).toBe('v-base.1')
    expect(state.chunks.map((c) => c.id)).toEqual(['help-what-is-mynet'])
    expect(kb.getChunk('help-what-is-mynet')?.title).toBe('标题-help-what-is-mynet')
  })

  it('云端面在线成功合入后为权威（基线独有 id 随之删除）', async () => {
    const baseline = manifest([chunk('old-id'), chunk('shared', { title: '基线标题' })], 'v-base.1')
    const online = manifest([chunk('shared', { title: '在线标题' }), chunk('new-id')], 'v-on.2')
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        const url = String(input)
        return url === KB_BASELINE_URL ? jsonResponse(baseline) : jsonResponse(online)
      })
    )
    const kb = await import('../kbService')
    const state = await kb.loadKb()
    expect(state.origin).toBe('online')
    expect(state.version).toBe('v-on.2')
    expect(state.chunks.map((c) => c.id).sort()).toEqual(['new-id', 'shared'])
    expect(kb.getChunk('shared')?.title).toBe('在线标题')
  })

  it('失败保留：在线曾成功后再次拉取失败，保留上次合并结果', async () => {
    const baseline = manifest([chunk('base-only')], 'v-base.1')
    const online = manifest([chunk('online-only')], 'v-on.1')
    let onlineUp = true
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        const url = String(input)
        if (url !== KB_BASELINE_URL) {
          if (!onlineUp) throw new TypeError('fetch failed')
          return jsonResponse(online)
        }
        return jsonResponse(baseline)
      })
    )
    const kb = await import('../kbService')
    expect((await kb.loadKb()).origin).toBe('online')
    onlineUp = false
    const state = await kb.loadKb()
    expect(state.origin).toBe('cache')
    expect(state.chunks.map((c) => c.id)).toEqual(['online-only'])
  })

  it('条件拉取：ETag=全文 sha256，If-None-Match → 304 跳过合并', async () => {
    const baseline = manifest([chunk('base-only')], 'v-base.1')
    const online = manifest([chunk('online-only')], 'v-on.1')
    const bodyText = JSON.stringify(online)
    const digest = await sha256Hex(bodyText)
    const seen: Array<Record<string, string>> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown, init?: { headers?: Record<string, string> }) => {
        const url = String(input)
        if (url === KB_BASELINE_URL) return jsonResponse(baseline)
        seen.push(init?.headers ?? {})
        if (seen.length === 1) {
          return {
            ok: true,
            status: 200,
            headers: { get: (name: string) => (name === 'ETag' ? `"${digest}"` : null) },
            text: async () => bodyText
          }
        }
        return notModifiedResponse()
      })
    )
    const kb = await import('../kbService')
    expect((await kb.loadKb()).chunks.map((c) => c.id)).toEqual(['online-only'])
    const state = await kb.loadKb()
    expect(state.origin).toBe('online')
    expect(state.chunks.map((c) => c.id)).toEqual(['online-only'])
    expect(seen[0]?.['If-None-Match']).toBeUndefined()
    expect(seen[1]?.['If-None-Match']).toBe(`"${digest}"`)
  })

  it('X-KB-Checksum 与正文 sha256 不匹配 → 丢弃本次载荷', async () => {
    const baseline = manifest([chunk('base-only')], 'v-base.1')
    const online = manifest([chunk('online-only')], 'v-on.1')
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        const url = String(input)
        if (url === KB_BASELINE_URL) return jsonResponse(baseline)
        return jsonResponse(online, { 'X-KB-Checksum': 'f'.repeat(64) })
      })
    )
    const kb = await import('../kbService')
    const state = await kb.loadKb()
    expect(state.origin).toBe('baseline')
    expect(state.chunks.map((c) => c.id)).toEqual(['base-only'])
  })

  it('search：tags 为全量包含过滤，keyword 匹配 title/tags', async () => {
    const baseline = manifest([
      chunk('a', { title: '连接排障指南', tags: ['connectivity', 'troubleshoot'] }),
      chunk('b', { title: '如何注册', tags: ['help', 'registration'] })
    ])
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(baseline)))
    const kb = await import('../kbService')
    await kb.loadKb()
    expect(kb.search({ tags: ['help'] }).map((c) => c.id)).toEqual(['b'])
    expect(kb.search({ keyword: '排障' }).map((c) => c.id)).toEqual(['a'])
    expect(kb.search({ keyword: 'REGISTRATION' }).map((c) => c.id)).toEqual(['b'])
    expect(kb.search({ tags: ['help'], keyword: '注册' }).map((c) => c.id)).toEqual(['b'])
    expect(kb.search()).toHaveLength(2)
  })
})
