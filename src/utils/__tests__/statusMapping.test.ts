import { describe, it, expect } from 'vitest'
import {
  getUserFriendlyStatus,
  isStatusConnectable,
  isStatusPending,
  isStatusUnavailable,
  getPrimaryActionText,
  getPrimaryActionConfig
} from '../statusMapping'
import { NODE_STATUS } from '../../types/node'

describe('NODE_STATUS 数值契约（与 mynet_api 节点状态机对齐）', () => {
  it('状态码取值被锁死，改动即红', () => {
    expect(NODE_STATUS).toEqual({
      UNCONFIGURED: -1,
      DISABLED: 0,
      ENABLED: 1,
      ONLINE: 2,
      MAINTENANCE: 99
    })
  })
})

describe('getUserFriendlyStatus：技术状态码 → 三色语义', () => {
  it('ONLINE → available', () => {
    const d = getUserFriendlyStatus(NODE_STATUS.ONLINE)
    expect(d.semantic).toBe('available')
    expect(d.text).toBe('在线')
    expect(d.detailText).toBe('可连接')
  })

  it('ENABLED（已启用未上线）→ pending', () => {
    const d = getUserFriendlyStatus(NODE_STATUS.ENABLED)
    expect(d.semantic).toBe('pending')
    expect(d.text).toBe('待连接')
  })

  it('MAINTENANCE → unavailable 且明细为「维护中」', () => {
    const d = getUserFriendlyStatus(NODE_STATUS.MAINTENANCE)
    expect(d.semantic).toBe('unavailable')
    expect(d.detailText).toBe('维护中')
  })

  it('DISABLED → unavailable 且明细为「已禁用」', () => {
    const d = getUserFriendlyStatus(NODE_STATUS.DISABLED)
    expect(d.semantic).toBe('unavailable')
    expect(d.detailText).toBe('已禁用')
  })

  it('UNCONFIGURED（-1）→ unavailable 且明细为「未配置」', () => {
    const d = getUserFriendlyStatus(NODE_STATUS.UNCONFIGURED)
    expect(d.semantic).toBe('unavailable')
    expect(d.detailText).toBe('未配置')
  })

  it('接受字符串状态码（后端 JSON 常给字符串）', () => {
    expect(getUserFriendlyStatus('2')).toEqual(getUserFriendlyStatus(NODE_STATUS.ONLINE))
    expect(getUserFriendlyStatus('-1').semantic).toBe('unavailable')
  })

  it('无法识别的状态码 → unknown（不猜）', () => {
    expect(getUserFriendlyStatus(12345).semantic).toBe('unknown')
    expect(getUserFriendlyStatus('not-a-number').semantic).toBe('unknown')
  })
})

describe('状态判定谓词', () => {
  it('isStatusConnectable 仅 ONLINE', () => {
    expect(isStatusConnectable(NODE_STATUS.ONLINE)).toBe(true)
    expect(isStatusConnectable('2')).toBe(true)
    expect(isStatusConnectable(NODE_STATUS.ENABLED)).toBe(false)
    expect(isStatusConnectable(NODE_STATUS.DISABLED)).toBe(false)
  })

  it('isStatusPending 仅 ENABLED', () => {
    expect(isStatusPending(NODE_STATUS.ENABLED)).toBe(true)
    expect(isStatusPending('1')).toBe(true)
    expect(isStatusPending(NODE_STATUS.ONLINE)).toBe(false)
  })

  it('isStatusUnavailable 覆盖 DISABLED / UNCONFIGURED / MAINTENANCE', () => {
    expect(isStatusUnavailable(NODE_STATUS.DISABLED)).toBe(true)
    expect(isStatusUnavailable(NODE_STATUS.UNCONFIGURED)).toBe(true)
    expect(isStatusUnavailable(NODE_STATUS.MAINTENANCE)).toBe(true)
    expect(isStatusUnavailable(NODE_STATUS.ONLINE)).toBe(false)
    expect(isStatusUnavailable(NODE_STATUS.ENABLED)).toBe(false)
  })

  it('三种不可用状态与「可连接 / 等待中」互斥', () => {
    const unavailables = [NODE_STATUS.DISABLED, NODE_STATUS.UNCONFIGURED, NODE_STATUS.MAINTENANCE]
    for (const s of unavailables) {
      expect(isStatusUnavailable(s)).toBe(true)
      expect(isStatusConnectable(s)).toBe(false)
      expect(isStatusPending(s)).toBe(false)
    }
  })
})

describe('主操作文案与按钮配置', () => {
  it('getPrimaryActionText 逐状态取值', () => {
    expect(getPrimaryActionText(NODE_STATUS.ONLINE)).toBe('管理')
    expect(getPrimaryActionText(NODE_STATUS.ENABLED)).toBe('等待上线')
    expect(getPrimaryActionText(NODE_STATUS.DISABLED)).toBe('启用')
    expect(getPrimaryActionText(NODE_STATUS.UNCONFIGURED)).toBe('配置')
    expect(getPrimaryActionText(NODE_STATUS.MAINTENANCE)).toBe('维护中')
    expect(getPrimaryActionText(12345)).toBe('查看')
  })

  it('getPrimaryActionConfig：仅 ONLINE / DISABLED / UNCONFIGURED 可点', () => {
    expect(getPrimaryActionConfig(NODE_STATUS.ONLINE)).toEqual({
      label: '连接',
      color: 'positive',
      icon: 'link',
      disabled: false
    })
    expect(getPrimaryActionConfig(NODE_STATUS.ENABLED).disabled).toBe(true)
    expect(getPrimaryActionConfig(NODE_STATUS.DISABLED).disabled).toBe(false)
    expect(getPrimaryActionConfig(NODE_STATUS.UNCONFIGURED).disabled).toBe(false)
    expect(getPrimaryActionConfig(NODE_STATUS.MAINTENANCE).disabled).toBe(true)
    expect(getPrimaryActionConfig(12345).disabled).toBe(true)
  })
})
