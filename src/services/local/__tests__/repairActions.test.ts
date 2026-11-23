import { beforeEach, describe, expect, it, vi } from 'vitest'

const runCommand = vi.hoisted(() => vi.fn())

vi.mock('../localApi', () => ({ localGatewayApi: { runCommand } }))

import {
  AGENT_ALLOWED_SUBCOMMANDS,
  REPAIR_ACTIONS,
  RepairActionError,
  actionCatalogForPrompt,
  assertActionAllowed,
  getRepairAction,
  runRepairAction,
} from '../repairActions'

describe('repair action catalog', () => {
  it('has unique ids', () => {
    const ids = REPAIR_ACTIONS.map((action) => action.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every argv[0] inside the local API allowlist', () => {
    for (const action of REPAIR_ACTIONS) {
      expect(AGENT_ALLOWED_SUBCOMMANDS).toContain(action.argv[0])
    }
  })

  it('never puts secrets in argv', () => {
    for (const action of REPAIR_ACTIONS) {
      for (const arg of action.argv) {
        expect(arg).not.toMatch(/^--(private|password|token|secret)/)
      }
    }
  })

  it('marks only read-only probes as non-mutating', () => {
    const readOnly = REPAIR_ACTIONS.filter((action) => !action.mutating).map((action) => action.id)
    expect(readOnly.sort()).toEqual(['check', 'parity', 'status'])
  })

  it('renders a prompt catalog containing every action id and its risk', () => {
    const catalog = actionCatalogForPrompt()

    for (const action of REPAIR_ACTIONS) {
      expect(catalog).toContain(`- ${action.id}: ${action.title}`)
    }
    expect(catalog).toContain('[[action:<id>]]')
    expect(catalog).toContain('需用户确认')
    expect(catalog).toContain('只读')
  })

  it('documents an impact for every action', () => {
    for (const action of REPAIR_ACTIONS) {
      expect(action.impact.trim()).not.toBe('')
      expect(action.argv.length).toBeGreaterThan(0)
    }
  })
})

describe('runRepairAction', () => {
  beforeEach(() => {
    runCommand.mockReset()
  })

  it('rejects unknown action ids without touching localapi', async () => {
    await expect(runRepairAction('rm-rf')).rejects.toMatchObject({
      reason: 'unknown_action',
    })
    expect(runCommand).not.toHaveBeenCalled()
  })

  it('refuses a mutating action without explicit confirmation', async () => {
    await expect(runRepairAction('restart-gnb')).rejects.toBeInstanceOf(RepairActionError)
    await expect(runRepairAction('restart-gnb')).rejects.toMatchObject({
      reason: 'confirmation_required',
    })
    expect(runCommand).not.toHaveBeenCalled()
  })

  it('runs a read-only action without confirmation', async () => {
    runCommand.mockResolvedValueOnce({ stdout: 'ok', stderr: '' })

    const result = await runRepairAction('check')

    expect(runCommand).toHaveBeenCalledWith(['check'], 30000)
    expect(result).toEqual({ stdout: 'ok', stderr: '' })
  })

  it('runs a confirmed mutating action with the catalog argv', async () => {
    runCommand.mockResolvedValueOnce({ stdout: 'restarted', stderr: 'warn' })

    const result = await runRepairAction('restart-gnb', { confirmed: true, timeoutMs: 60000 })

    expect(runCommand).toHaveBeenCalledWith(['service', 'restart', 'gnb'], 60000)
    expect(result).toEqual({ stdout: 'restarted', stderr: 'warn' })
  })

  it('rejects argv carrying a secret flag even if the catalog is edited later', () => {
    expect(getRepairAction('check')).not.toBeNull()

    expect(() => assertActionAllowed({
      id: 'bad',
      title: 'bad',
      description: 'bad',
      impact: 'bad',
      argv: ['config', 'keys', 'set', '--private', 'abc'],
      mutating: true,
    })).toThrowError(/秘密参数/)

    expect(() => assertActionAllowed({
      id: 'bad2',
      title: 'bad',
      description: 'bad',
      impact: 'bad',
      argv: ['evil-subcommand'],
      mutating: true,
    })).toThrowError(/白名单/)
  })
})
