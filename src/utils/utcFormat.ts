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
 * 注意：`eligible` 只代表「声明有效 + 已批准」，**不代表 Hub 已生效** ——
 * 管理面下发通道未接通，展示时必须同时出现 delivery 的「仅配置」提示。
 * 撤销/过期优先于 pending，避免把终态显示成「等待批准」。
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

/** cohort 占比（用于进度条/文案）；空名单固定 0（不是 100）。 */
export function cohortPercent(approved?: number | null, cap?: number | null): number {
  if (!approved || approved <= 0 || !cap || cap <= 0) return 0
  return Math.min(100, Math.round((approved / cap) * 100))
}
