import { describe, expect, it } from 'vitest'
import { extractActionIds, stripActionMarkers } from '../actionMarkers'

const KNOWN = ['check', 'restart-gnb', 'apply']

describe('action markers', () => {
  it('extracts only known ids, de-duplicated and in order', () => {
    const text = '先跑 [[action:check]]，再 [[action:restart-gnb]]，最后 [[action:check]]'

    expect(extractActionIds(text, KNOWN)).toEqual(['check', 'restart-gnb'])
  })

  it('ignores ids that are not in the catalog', () => {
    expect(extractActionIds('危险：[[action:rm-rf]]', KNOWN)).toEqual([])
  })

  it('ignores malformed markers', () => {
    expect(extractActionIds('[[action:Check]] [[action:check extra]] action:check', KNOWN)).toEqual([])
  })

  it('strips markers from the displayed answer', () => {
    const display = stripActionMarkers('建议执行 [[action:restart-gnb]]\n即可恢复。')

    expect(display).toBe('建议执行\n即可恢复。')
    expect(display).not.toContain('[[')
  })
})
