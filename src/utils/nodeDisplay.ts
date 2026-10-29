/**
 * 节点显示名：名称优先，避免裸 ID。
 * 1. 对端自带 node_name
 * 2. 云端清单映射
 * 3. 虚拟 IP
 * 4. 短 ID
 */
export type NodeNameSource = Record<string, string>

const NODE_NAMES_KEY = 'mynet:node-names'

/** 本机持久名称（localStorage 镜像，mynetd 文件为主，浏览器清空则重新学习）。 */
export function loadPersistedNames(): NodeNameSource {
  try {
    const raw = localStorage.getItem(NODE_NAMES_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? (o as NodeNameSource) : {}
  } catch {
    return {}
  }
}

export function persistNames(names: NodeNameSource): void {
  if (!names || !Object.keys(names).length) return
  try {
    localStorage.setItem(NODE_NAMES_KEY, JSON.stringify(names))
  } catch { /* quota/private mode */ }
}

/** 合并：新值覆盖旧值，但不删除已有条目（除非显式刷新）。 */
export function mergePersistedNames(next: NodeNameSource): NodeNameSource {
  const cur = loadPersistedNames()
  const merged = { ...cur, ...next }
  persistNames(merged)
  return merged
}

export function buildNodeNameMap(
  cloudNodes: { node_id?: string; id?: string; node_name?: string; name?: string }[]
): NodeNameSource {
  const map: NodeNameSource = {}
  for (const n of cloudNodes || []) {
    const id = String(n.node_id ?? n.id ?? '')
    const name = n.node_name || n.name
    if (id && name) map[id] = String(name)
  }
  return map
}

export function peerDisplayName(opts: {
  node_id?: string
  node_name?: string
  overlay?: string
  is_self?: boolean
}, names: NodeNameSource = {}): string {
  if (opts.is_self && !opts.node_name) return '本机'
  const id = String(opts.node_id || '')
  const fromPeer = (opts.node_name || '').trim()
  if (fromPeer && fromPeer !== id) return fromPeer
  const fromCloud = id ? names[id] : ''
  if (fromCloud) return fromCloud
  const ip = String(opts.overlay || '')
  if (ip) {
    const last = ip.split('.').pop() || ''
    // 网段行（无 node_id、末段 0）：显示网段，不冒充设备
    if (!id && last === '0') return `网段 ${ip}`
    // 无名称时用「设备 .182」而不是裸 16 位 ID
    return last && /^\d+$/.test(last) ? `设备 .${last}` : ip
  }
  if (id) return id.length > 12 ? `设备 ${id.slice(0, 6)}…` : `设备 ${id}`
  return '—'
}

export function peerSubtitle(opts: { node_id?: string; overlay?: string }, names: NodeNameSource = {}): string {
  const id = String(opts.node_id || '')
  const ip = String(opts.overlay || '')
  const name = id ? names[id] : ''
  if (name && name !== id) return ip || shortId(id)
  return ip && ip !== id ? ip : shortId(id)
}

function shortId(id: string): string {
  return id.length > 12 ? id.slice(0, 8) + '…' : id
}
