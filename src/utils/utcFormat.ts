const BYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']

export function formatBytes(value?: number | null): string {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) {
    return '0 B'
  }

  let size = value
  let unit = 0
  while (size >= 1024 && unit < BYTE_UNITS.length - 1) {
    size /= 1024
    unit += 1
  }

  const digits = size >= 100 || unit === 0 ? 0 : size >= 10 ? 1 : 2
  return `${size.toFixed(digits)} ${BYTE_UNITS[unit]}`
}

export function usagePercent(used?: number | null, quota?: number | null): number {
  if (!quota || quota <= 0 || !used || used <= 0) return 0
  return Math.min(100, Math.round((used / quota) * 100))
}

export function formatUtcTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export function sideLabel(side?: number | null): string {
  if (side === 0) return 'A'
  if (side === 1) return 'B'
  return '—'
}

export function faultTone(state?: string | null): 'negative' | 'warning' | 'info' {
  if (state === 'open' || state === 'failed' || state === 'fenced') return 'negative'
  if (state === 'retrying' || state === 'degraded') return 'warning'
  return 'info'
}

export type UtcAccelerationState = 'applied' | 'pending' | 'disabled'

/** desired 只是用户意图；只有 hub/agent 回传 APPLIED 才能算实际生效。 */
export function accelerationState(
  desiredEnabled?: boolean | null,
  observedState?: string | null
): UtcAccelerationState {
  if (!desiredEnabled) return 'disabled'
  return observedState === 'APPLIED' ? 'applied' : 'pending'
}

// ── Relay 管理面（M5-03 产品化表层）────────────────────────────

export type UtcRelayState = 'eligible' | 'pending' | 'draining' | 'revoked' | 'expired'

/**
 * 配置层面的可调度状态。
 *
 * 注意：`eligible` 只代表「声明有效 + 已建立」，**不代表 Hub 已生效** ——
 * 管理面下发通道未接通，展示时必须同时出现 delivery 的「仅配置」提示。
 * 撤销/过期优先于 pending，避免把终态显示成「等待建立」。
 */
export function relayInventoryState(
  approvalState?: string | null,
  declaredState?: string | null,
  eligible?: boolean | null,
  reasons?: string[] | null
): UtcRelayState {
  if (approvalState === 'revoked' || declaredState === 'revoked') return 'revoked'
  if (declaredState === 'draining') return 'draining'
  if (eligible) return 'eligible'
  if (reasons?.includes('EXPIRED')) return 'expired'
  return 'pending'
}

/** `not_wired` 是当前唯一真实取值；其他值只用于向前兼容展示。 */
export function relayDeliveryIsWired(state?: string | null): boolean {
  return state !== undefined && state !== null && state !== '' && state !== 'not_wired'
}

/** endpoint:port；IPv6 字面量加方括号，避免 `::1:443` 误读。 */
export function formatEndpoint(address?: string | null, port?: number | null): string {
  if (!address) return '—'
  const host = address.includes(':') ? `[${address}]` : address
  return port ? `${host}:${port}` : host
}

/** hub/status 返回的 endpoint 可能已自带 `:port`（如 222.131.68.131:19447），避免重复拼接。 */
export function formatHubEdgeEndpoint(endpoint?: string | null, port?: number | null): string {
  if (!endpoint) return '—'
  if (port && !endpoint.includes(':')) {
    return `${endpoint}:${port}`
  }
  return endpoint
}

/** Core 运行时长格式化（秒 → 可读文本）。 */
export function formatUptime(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return '—'
  }
  const s = Math.floor(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remS = s % 60
  if (m < 60) return remS > 0 ? `${m}m ${remS}s` : `${m}m`
  const h = Math.floor(m / 60)
  const remM = m % 60
  if (h < 24) return remM > 0 ? `${h}h ${remM}m` : `${h}h`
  const d = Math.floor(h / 24)
  const remH = h % 24
  return remH > 0 ? `${d}d ${remH}h` : `${d}d`
}

/** cohort 占比（用于进度条/文案）；空名单固定 0（不是 100）。 */
export function cohortPercent(approved?: number | null, cap?: number | null): number {
  if (!approved || approved <= 0 || !cap || cap <= 0) return 0
  return Math.min(100, Math.round((approved / cap) * 100))
}

// ── 单对端 TCP 状态（intent 可见性）────────────────────────────

export type UtcPairState = 'tcp' | 'fallback' | 'pending' | 'degraded' | 'rejected' | 'revoking' | 'off'

/**
 * 把后端的 pair state 映射成用户可读标签与色调。
 *
 * 关键：`fallback` 必须写成“原生 UDP”，不能写成“已开启” —— 用户看到总开关是开的，
 * 但如果这对没有 pair，实际就是走 UDP，必须显式说明。
 */
export function utcPairStateMeta(state?: string | null): {
  label: string
  tone: 'positive' | 'grey' | 'warning' | 'negative' | 'primary'
} {
  switch (state) {
    case 'tcp':
      return { label: 'TCP 已连通', tone: 'positive' }
    case 'fallback':
      return { label: '原生 UDP', tone: 'grey' }
    case 'pending':
      return { label: '等待云端确认', tone: 'warning' }
    case 'degraded':
      return { label: '链路异常', tone: 'warning' }
    case 'rejected':
      return { label: '云端拒绝', tone: 'negative' }
    case 'revoking':
      return { label: '断开中', tone: 'warning' }
    case 'off':
      return { label: '未选择 TCP', tone: 'grey' }
    default:
      return { label: '未知', tone: 'grey' }
  }
}

// ── approved-pair 查找（本地动作 → 云端撤销用）────────────────

/** 在 approved-pair 列表里找同时包含两个 transport 的 approved 记录。 */
export function findApprovedPair(
  items: Array<{ id?: number; pair_id: number; transport_id: string; state: string; revision: number }>,
  transportA: string,
  transportB: string
): { id: number; pair_id: number; revision: number } | null {
  const a = String(transportA)
  const b = String(transportB)
  const byPair = new Map<number, { id?: number; transport_id: string; state: string; revision: number }[]>()
  for (const item of items) {
    if (item.state !== 'approved') continue
    const list = byPair.get(item.pair_id) || []
    list.push({
      id: item.id,
      transport_id: String(item.transport_id),
      state: item.state,
      revision: item.revision
    })
    byPair.set(item.pair_id, list)
  }
  for (const [pairId, sides] of byPair) {
    if (sides.length < 2) continue
    const ids = sides.map((s) => s.transport_id).sort()
    if (ids[0] === [a, b].sort()[0] && ids[1] === [a, b].sort()[1]) {
      const chosen = sides.reduce((best, s) => (s.revision >= best.revision ? s : best))
      if (typeof chosen.id !== 'number') return null
      return { id: chosen.id, pair_id: pairId, revision: chosen.revision }
    }
  }
  return null
}

// ── UTC 投影 mode 标签（gnb utc-v2）──────────────────────────

/** 0=DIRECT 原生 UDP；1=A-S 中继导出；2=A-D 本地 utcd 导出（TCP）。 */
export function utcModeLabel(mode?: number | null): string {
  switch (mode) {
    case 0:
      return '原生 UDP'
    case 1:
      return '中继导出（A-S）'
    case 2:
      return 'TCP 导出（A-D）'
    default:
      return '未知模式'
  }
}
