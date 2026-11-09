import { describe, expect, it } from 'vitest'
import { faultTone, formatBytes, sideLabel, usagePercent } from '../utcFormat'

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
})
