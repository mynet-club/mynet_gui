import { describe, expect, it } from 'vitest'
import { resolveCapabilityGate } from '../capabilityGate'

describe('resolveCapabilityGate', () => {
  it('treats effective_enabled=true as active and unblocked', () => {
    const res = resolveCapabilityGate({
      desired_enabled: true,
      effective_enabled: true,
      blocked_by: null,
      blocked_reason: null
    })
    expect(res.blocked).toBe(false)
    expect(res.tone).toBe('ok')
    expect(res.chipLabel).toBe('已生效')
    expect(res.showUpgradeAction).toBe(false)
  })

  it('does not flag user self-disabled state as an error block', () => {
    const res = resolveCapabilityGate({
      desired_enabled: false,
      effective_enabled: false,
      blocked_by: 'user',
      blocked_reason: '当前用户开关未开启'
    })
    expect(res.blocked).toBe(false)
    expect(res.tone).toBe('muted')
    expect(res.chipLabel).toBe('已关闭')
  })

  it('maps platform block to red non-upgrade state', () => {
    const res = resolveCapabilityGate({
      desired_enabled: true,
      effective_enabled: false,
      blocked_by: 'platform',
      blocked_reason: '平台已全局停用该服务'
    })
    expect(res.blocked).toBe(true)
    expect(res.tone).toBe('err')
    expect(res.chipLabel).toBe('平台停用')
    expect(res.showUpgradeAction).toBe(false)
  })

  it('maps tenant block to amber state with Console guidance', () => {
    const res = resolveCapabilityGate({
      desired_enabled: true,
      effective_enabled: false,
      blocked_by: 'tenant',
      blocked_reason: '当前网络区未开启该服务'
    })
    expect(res.blocked).toBe(true)
    expect(res.tone).toBe('warn')
    expect(res.chipLabel).toBe('区未开启')
    expect(res.actionHint).toContain('Console')
  })

  it('maps quota block to red state with upgrade action enabled', () => {
    const res = resolveCapabilityGate({
      desired_enabled: true,
      effective_enabled: false,
      blocked_by: 'quota',
      blocked_reason: '已达到 IP 资源包配额上限'
    })
    expect(res.blocked).toBe(true)
    expect(res.tone).toBe('err')
    expect(res.chipLabel).toBe('配额已满')
    expect(res.showUpgradeAction).toBe(true)
  })

  it('maps node block to amber state directing user to local panel', () => {
    const res = resolveCapabilityGate({
      desired_enabled: true,
      effective_enabled: false,
      blocked_by: 'node',
      blocked_reason: '本机服务未就绪'
    })
    expect(res.blocked).toBe(true)
    expect(res.tone).toBe('warn')
    expect(res.chipLabel).toBe('本机未就绪')
    expect(res.actionHint).toContain('本机面板')
  })
})
