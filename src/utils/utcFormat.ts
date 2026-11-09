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
