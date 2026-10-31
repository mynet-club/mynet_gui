/**
 * tips/小助手知识库（tips-kb）加载器
 *
 * 契约：mynet_ctl/docs/knowledge-base/spec/tips-kb-contract.md
 * （§3.3 浏览器侧获取路径、§3.4 合并语义、§3.5 失败回退）
 * 载荷形状判据：同目录 schemas/tips-kb.schema.json
 *
 * - 基线：`/tips-kb.json`（public/，随 GUI 发行版分发；真产物，同步自 mynet_ctl scripts/tips-kb/，见 public/tips-kb.README.md）
 * - 在线·本机面（isLocalMode：embed GUI / WebUI，localapi 在 127.0.0.1:8096）
 * - 在线·云端面（无 localapi、非嵌入）：业务后端 `GET /api/v1/kb/tips-kb.json`
 *   （O1 定案：响应不包信封，与 ctl 公开分发同字节）
 * - 条件拉取：ETag = 全文 sha256，`If-None-Match` → 304 跳过合并；
 *   `X-KB-Checksum`（或同值 ETag）与正文 sha256 不匹配 → 丢弃本次载荷
 * - 合并：id-keyed reconcile（§3.4），纯函数 mergeKbChunks；失败保留已合并结果，回退基线（§3.5）
 */

import { isLocalMode } from '../../config/localMode'

export interface TipsKbChunkSource {
  file: string
  section: string
}

export interface TipsKbChunk {
  id: string
  title: string
  tags: string[]
  body: string
  source: TipsKbChunkSource
  sha256?: string
}

export interface TipsKbManifest {
  version: string
  generated_at: string
  lang: string
  chunks: TipsKbChunk[]
}

export interface KbState {
  chunks: TipsKbChunk[]
  version: string
  /** online=在线合入成功（或 304 未变更）；cache=在线失败保留上次合并结果；baseline=仅基线 */
  origin: 'online' | 'cache' | 'baseline'
}

export interface KbSearchQuery {
  /** 标签过滤：chunk 必须包含全部指定标签 */
  tags?: string[]
  /** 关键词：与 title / tags 做不区分大小写的子串匹配 */
  keyword?: string
}

/** 随 GUI 产物分发的离线基线 */
export const KB_BASELINE_URL = '/tips-kb.json'
/** 本机面端点（mynetd localapi；8096 为 mynetd 本机 API 钉死端口） */
export const KB_LOCAL_URL = 'http://127.0.0.1:8096/api/v1/kb/tips-kb.json'

/**
 * 在线拉取来源：
 * - 本机面（isLocalMode，embed GUI/WebUI）→ localapi 8096
 * - 云端面（无 localapi、非嵌入）→ 业务后端 `GET /api/v1/kb/tips-kb.json`（O1 定案）；
 *   base 与 services/api.ts:15-18 同口径（同源 `/api/v1`，dev 由 VITE_API_BASE_URL 给）
 */
export function resolveOnlineUrl(): string {
  if (typeof window !== 'undefined' && isLocalMode()) return KB_LOCAL_URL
  const envUrl = import.meta.env.VITE_API_BASE_URL
  const base = envUrl ? `${envUrl}/api/v1` : '/api/v1'
  return `${base}/kb/tips-kb.json`
}

/**
 * id-keyed reconcile（契约 §3.4）：
 * - 按 id upsert，同 id 以 incoming（载荷）为准
 * - current 中 id 不在 incoming 的条目删除（manifest.chunks 的 id 集是权威全量）
 * - incoming 为空数组 = 撤回全部
 * - 幂等：同一载荷重复合并不改变有效集
 */
export function mergeKbChunks(
  current: readonly TipsKbChunk[],
  incoming: readonly TipsKbChunk[]
): TipsKbChunk[] {
  const byId = new Map<string, TipsKbChunk>()
  for (const chunk of current) {
    byId.set(chunk.id, chunk)
  }
  for (const chunk of incoming) {
    byId.set(chunk.id, chunk)
  }
  const keep = new Set(incoming.map((chunk) => chunk.id))
  return [...byId.values()].filter((chunk) => keep.has(chunk.id))
}

/** 载荷形状门槛（网络/文件边界校验）；不合法返回 null，由调用方按失败处理 */
export function parseKbManifest(data: unknown): TipsKbManifest | null {
  if (!data || typeof data !== 'object') return null
  const manifest = data as Record<string, unknown>
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) return null
  if (typeof manifest.generated_at !== 'string') return null
  if (typeof manifest.lang !== 'string') return null
  if (!Array.isArray(manifest.chunks)) return null
  for (const item of manifest.chunks) {
    if (!item || typeof item !== 'object') return null
    const chunk = item as Record<string, unknown>
    if (typeof chunk.id !== 'string' || chunk.id.length === 0) return null
    if (typeof chunk.title !== 'string' || chunk.title.length === 0) return null
    if (!Array.isArray(chunk.tags)) return null
    if (typeof chunk.body !== 'string' || chunk.body.length === 0) return null
    const source = chunk.source as Record<string, unknown> | null | undefined
    if (!source || typeof source.file !== 'string' || typeof source.section !== 'string') return null
  }
  return data as TipsKbManifest
}

/** 正文 sha256（十六进制），供 X-KB-Checksum 校验与测试构造 */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

interface FetchOutcome {
  manifest: TipsKbManifest | null
  notModified: boolean
  etag: string | null
}

const FETCH_FAILED: FetchOutcome = { manifest: null, notModified: false, etag: null }

/** ETag 头可能带 W/ 前缀与引号；If-None-Match 按契约带引号发出 */
function normalizeEtag(raw: string | null): string | null {
  if (!raw) return null
  return raw.trim().replace(/^W\//, '').replace(/^"|"$/g, '')
}

/** 只有 64 位十六进制才算全文 sha256（dev 静态服务器的 mtime 弱 ETag 不参与校验） */
function sha256Candidate(raw: string | null): string | null {
  const value = normalizeEtag(raw)
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null
}

async function fetchManifest(url: string, ifNoneMatch?: string | null): Promise<FetchOutcome> {
  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (ifNoneMatch) headers['If-None-Match'] = `"${ifNoneMatch}"`
    const res = await fetch(url, { headers })
    if (res.status === 304) {
      return { manifest: null, notModified: true, etag: ifNoneMatch ?? null }
    }
    if (!res.ok) return FETCH_FAILED
    const text = await res.text()
    const declared = sha256Candidate(res.headers.get('X-KB-Checksum')) ?? sha256Candidate(res.headers.get('ETag'))
    if (declared && (await sha256Hex(text)) !== declared) {
      // 校验不过：丢弃本次载荷（契约 §3.4 步骤 2）
      return FETCH_FAILED
    }
    const manifest = parseKbManifest(JSON.parse(text))
    if (!manifest) return FETCH_FAILED
    return { manifest, notModified: false, etag: declared ?? normalizeEtag(res.headers.get('ETag')) }
  } catch {
    return FETCH_FAILED
  }
}

interface KbCache {
  chunks: TipsKbChunk[]
  version: string
  origin: KbState['origin']
}

let cache: KbCache | null = null
/** 在线上次成功的全文 sha256，供 If-None-Match 条件拉取（单面会话，一个 etag 即够） */
let onlineEtag: string | null = null

/**
 * 加载并合并知识库：先确保基线在场，再尝试在线端点（本机面/云端面由 resolveOnlineUrl 决定）。
 * 304 跳过合并；在线失败/校验不过保留已合并结果（上次成功缓存），无缓存时有效集 = 基线（契约 §3.5）。
 * 可重复调用；每次调用都会重新尝试在线拉取。
 */
export async function loadKb(): Promise<KbState> {
  if (!cache) {
    const baseline = await fetchManifest(KB_BASELINE_URL)
    cache = {
      chunks: mergeKbChunks([], baseline.manifest ? baseline.manifest.chunks : []),
      version: baseline.manifest ? baseline.manifest.version : '',
      origin: 'baseline'
    }
  }

  const online = await fetchManifest(resolveOnlineUrl(), onlineEtag)
  if (online.notModified) {
    return { chunks: [...cache.chunks], version: cache.version, origin: cache.origin }
  }
  if (online.manifest) {
    onlineEtag = online.etag
    cache = {
      chunks: mergeKbChunks(cache.chunks, online.manifest.chunks),
      version: online.manifest.version,
      origin: 'online'
    }
  } else if (cache.origin === 'online') {
    // 失败保留已合并结果
    cache = { chunks: cache.chunks, version: cache.version, origin: 'cache' }
  }

  return { chunks: [...cache.chunks], version: cache.version, origin: cache.origin }
}

/** 按 id 取 chunk（需先 loadKb()；未加载时返回 undefined） */
export function getChunk(id: string): TipsKbChunk | undefined {
  return cache ? cache.chunks.find((chunk) => chunk.id === id) : undefined
}

/** 检索（v1：title/tags 关键词匹配，无向量检索）。需先 loadKb()。 */
export function search(query: KbSearchQuery = {}): TipsKbChunk[] {
  const chunks = cache ? cache.chunks : []
  const keyword = query.keyword ? query.keyword.trim().toLowerCase() : ''
  return chunks.filter((chunk) => {
    if (query.tags && query.tags.length > 0) {
      if (!query.tags.every((tag) => chunk.tags.includes(tag))) return false
    }
    if (keyword) {
      const haystack = [chunk.title, ...chunk.tags].join('\n').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
}
