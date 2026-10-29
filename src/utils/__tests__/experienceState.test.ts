import { describe, it, expect } from 'vitest'
import {
  mapExperienceToUiState,
  describeUiState,
  isActionablePrimary
} from '../experienceState'
import type { UiState } from '../../types/local'

describe('experience/state → UI 状态层映射（冻结契约）', () => {
  it('NEEDS_LOGIN → needs_login', () => {
    expect(mapExperienceToUiState('NEEDS_LOGIN')).toBe('needs_login')
  })

  it('NEEDS_CONFIGURATION → needs_configuration（不是 needs_install）', () => {
    expect(mapExperienceToUiState('NEEDS_CONFIGURATION')).toBe('needs_configuration')
    expect(mapExperienceToUiState('NEEDS_INSTALL')).toBe('needs_install')
  })

  it('INITIALIZING → loading', () => {
    expect(mapExperienceToUiState('INITIALIZING')).toBe('loading')
  })

  it('READY / READY_OFFLINE → ready', () => {
    expect(mapExperienceToUiState('READY')).toBe('ready')
    expect(mapExperienceToUiState('READY_OFFLINE')).toBe('ready')
  })

  it('DEGRADED → degraded', () => {
    expect(mapExperienceToUiState('DEGRADED')).toBe('degraded')
  })

  it('未知枚举 → error，而不是猜 ready', () => {
    expect(mapExperienceToUiState('WHATEVER')).toBe('error')
    expect(mapExperienceToUiState('')).toBe('error')
  })
})

describe('describeUiState：状态必须有文字表达', () => {
  const states: UiState[] = ['loading', 'ready', 'degraded', 'needs_login', 'needs_configuration', 'needs_install', 'applying', 'error']

  it('每个状态都有非空文字', () => {
    for (const s of states) {
      const d = describeUiState(s)
      expect(d.text.length).toBeGreaterThan(0)
      expect(['ok', 'warn', 'error', 'info', 'muted']).toContain(d.tone)
    }
  })
})

describe('isActionablePrimary', () => {
  it('接受声明过的主操作', () => {
    for (const a of ['login', 'configure', 'install', 'start', 'fix-routes', 'retry'] as const) {
      expect(isActionablePrimary(a)).toBe(true)
    }
  })

  it('空串与未知操作不可点', () => {
    expect(isActionablePrimary('')).toBe(false)
    expect(isActionablePrimary('unknown')).toBe(false)
  })
})
