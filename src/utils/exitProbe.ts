/**
 * 加速节点（出口）探测展示 —— dashboard / 加速页 / 托盘共用文案。
 * 数据源：acceleration/status.runtime.exit_probe（mynetd 15s 内存循环）。
 */
import type { ExitProbeStatus } from '../types/local'

export function formatExitNodeLine(p?: ExitProbeStatus | null): string {
  if (!p || (p.monitoring === false && !p.reachable)) {
    return ''
  }
  const who = p.node_id || p.target || ''
  if (p.monitoring === false) {
    return who ? `节点 ${who} · 未监测` : '未监测'
  }
  if (p.reachable) {
    const rtt = typeof p.rtt_ms === 'number' && p.rtt_ms > 0 ? ` ${Math.round(p.rtt_ms)}ms` : ''
    return who ? `节点可达${rtt}` : `可达${rtt}`
  }
  return who ? `节点不可达` : '不可达'
}

export function exitNodeTone(p?: ExitProbeStatus | null): 'ok' | 'warn' | 'error' | 'default' {
  if (!p) return 'default'
  if (p.monitoring === false) return 'default'
  if (p.reachable) return 'ok'
  return 'error'
}

/** 加速页/首页副文案：链路 + 时延 + 连续失败 */
export function formatExitNodeDetail(p?: ExitProbeStatus | null): string {
  if (!p || p.monitoring === false) return ''
  const bits: string[] = []
  if (p.link && p.link !== 'offline') bits.push(p.link)
  if (p.driver) bits.push(p.driver)
  if (typeof p.rtt_ms === 'number' && p.rtt_ms > 0) bits.push(`${Math.round(p.rtt_ms)}ms`)
  if (p.consecutive_fails && p.consecutive_fails > 0) bits.push(`连败 ${p.consecutive_fails}`)
  return bits.join(' · ')
}
