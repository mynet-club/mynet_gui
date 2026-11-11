import { describe, expect, it } from 'vitest'
import {
  accelerationState,
  cohortPercent,
  faultTone,
  formatBytes,
  formatEndpoint,
  relayDeliveryIsWired,
  relayInventoryState,
  sideLabel,
  usagePercent
} from '../utcFormat'

describe('utcFormat', () => {
  it('formats byte values with binary units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1.00 KiB')
    expect(formatBytes(1024 * 1024 * 3.5)).toBe('3.50 MiB')
    expect(formatBytes(1024 * 1024 * 1024 * 12)).toBe('12.0 GiB')
  })

  it('never reports more than 100% usage', () => {
    expect(usagePercent(50, 100)).toBe(50)
    expect(usagePercent(500, 100)).toBe(100)
    expect(usagePercent(50, 0)).toBe(0)
  })

  it('maps sides and fault states', () => {
    expect(sideLabel(0)).toBe('A')
    expect(sideLabel(1)).toBe('B')
    expect(sideLabel(null)).toBe('—')
    expect(faultTone('open')).toBe('negative')
    expect(faultTone('retrying')).toBe('warning')
    expect(faultTone('closed')).toBe('info')
  })

  it('never reports desired ON with UNKNOWN observed as applied', () => {
    expect(accelerationState(true, 'UNKNOWN')).toBe('pending')
    expect(accelerationState(true, null)).toBe('pending')
    expect(accelerationState(true, 'APPLIED')).toBe('applied')
    expect(accelerationState(false, 'APPLIED')).toBe('disabled')
    expect(accelerationState(false, 'UNKNOWN')).toBe('disabled')
    expect(accelerationState(undefined, undefined)).toBe('disabled')
  })

  it('never treats a configured-but-unapproved relay as schedulable', () => {
    expect(relayInventoryState('pending', 'active', false, ['NOT_APPROVED'])).toBe('pending')
    expect(relayInventoryState('approved', 'active', true, [])).toBe('eligible')
    expect(relayInventoryState('approved', 'draining', false, ['DRAINING'])).toBe('draining')
    expect(relayInventoryState('revoked', 'revoked', false, ['REVOKED'])).toBe('revoked')
    expect(relayInventoryState('approved', 'active', false, ['EXPIRED'])).toBe('expired')
    // 撤销优先于过期/pending，终态不能被显示成“等待批准”
    expect(relayInventoryState('revoked', 'active', false, ['EXPIRED'])).toBe('revoked')
  })

  it('treats not_wired delivery as config-only', () => {
    expect(relayDeliveryIsWired('not_wired')).toBe(false)
    expect(relayDeliveryIsWired(null)).toBe(false)
    expect(relayDeliveryIsWired('wired')).toBe(true)
  })

  it('formats IPv4/IPv6 endpoints without ambiguity', () => {
    expect(formatEndpoint('203.0.113.10', 4433)).toBe('203.0.113.10:4433')
    expect(formatEndpoint('2001:db8::1', 4433)).toBe('[2001:db8::1]:4433')
    expect(formatEndpoint(null, 4433)).toBe('—')
  })

  it('reports an empty cohort as 0%, not 100%', () => {
    expect(cohortPercent(0, 4096)).toBe(0)
    expect(cohortPercent(2048, 4096)).toBe(50)
    expect(cohortPercent(5000, 4096)).toBe(100)
    expect(cohortPercent(10, 0)).toBe(0)
  })
})
