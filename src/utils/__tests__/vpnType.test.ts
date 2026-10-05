import { describe, it, expect } from 'vitest'
import { normalizeVpnType } from '../vpnType'

describe('normalizeVpnType：老库裸串 / 新库 JSON 数组 双形态归一', () => {
  it('空值 → 空串（不是 "NULL" / "UNDEFINED"）', () => {
    expect(normalizeVpnType(null)).toBe('')
    expect(normalizeVpnType(undefined)).toBe('')
  })

  it('老库裸字符串 → 大写', () => {
    expect(normalizeVpnType('gnb')).toBe('GNB')
    expect(normalizeVpnType('WG')).toBe('WG')
  })

  it('新库 JSON 数组 → 大写（本条修复的根因：对数组直接 .toUpperCase() 会 TypeError）', () => {
    expect(normalizeVpnType(['gnb'])).toBe('GNB')
  })

  it('多元素数组用 + 连接', () => {
    expect(normalizeVpnType(['gnb', 'wireguard'])).toBe('GNB+WIREGUARD')
  })

  it('数组里的空值被剔除，不产生前导 / 悬空 +', () => {
    expect(normalizeVpnType(['gnb', ''])).toBe('GNB')
    expect(normalizeVpnType(['', 'gnb'])).toBe('GNB')
    expect(normalizeVpnType([])).toBe('')
  })

  it('非字符串标量回退到 String().toUpperCase()', () => {
    expect(normalizeVpnType(123)).toBe('123')
  })
})
