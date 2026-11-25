import { describe, expect, it, vi } from 'vitest'
import type { LocalUtcPairView, LocalUtcStatus } from '../../types/local'
import { applyPairIntent, type PairActionDeps } from '../utcPairAction'

const status: LocalUtcStatus = {
  enabled: true,
  configured: true,
  running: true,
  edge_candidates: [],
  peers: []
}

const pendingPair: LocalUtcPairView = {
  peer_id: 2000,
  intent: 'on',
  intent_state: 'pending',
  mode: 0,
  bridge_up: false,
  lease_valid: false,
  state: 'pending'
}

function makeDeps(overrides: Partial<PairActionDeps> = {}) {
  const calls: string[] = []
  const deps: PairActionDeps = {
    putLocalIntent: vi.fn(async (peerId: number, intent: 'on' | 'off') => {
      calls.push(`local:${peerId}:${intent}`)
      return { status, pairs: [pendingPair] }
    }),
    getClientConfig: vi.fn(async () => {
      calls.push('client-config')
      return {
        transport_id: '1000',
        edge_candidates: ['edge-a:4433'],
        peers: [{ name: 'n182', transport_id: 2000 }]
      }
    }),
    createPairApproval: vi.fn(async (a: string, b: string) => {
      calls.push(`approve:${a}:${b}`)
      return {}
    }),
    setAcceleration: vi.fn(async (transportId: string, enabled: boolean) => {
      calls.push(`accel:${transportId}:${enabled}`)
      return {}
    }),
    listPairApprovals: vi.fn(async () => {
      calls.push('list-approvals')
      return {
        items: [
          { id: 11, pair_id: 9001, transport_id: '1000', state: 'approved', revision: 2 },
          { id: 22, pair_id: 9001, transport_id: '2000', state: 'approved', revision: 3 }
        ]
      }
    }),
    revokePairApproval: vi.fn(async (pairId: number, revision: number) => {
      calls.push(`revoke:${pairId}:${revision}`)
      return {}
    }),
    syncUtcConfig: vi.fn(async (payload: { peers: unknown[] }) => {
      calls.push(`sync:${payload.peers.length}`)
      return status
    }),
    recordResult: vi.fn(async (peerId: number, result: 'pending' | 'rejected', reason: string) => {
      calls.push(`result:${peerId}:${result}:${reason}`)
      return {}
    }),
    ...overrides
  }
  return { deps, calls }
}

describe('applyPairIntent', () => {
  it('records local intent first, then approves and enables the cloud pair, then rewrites utcd.conf', async () => {
    const { deps, calls } = makeDeps()
    const result = await applyPairIntent(2000, 'on', deps)

    expect(calls).toEqual([
      'local:2000:on',
      'client-config',
      'approve:1000:2000',
      'accel:1000:true',
      'result:2000:pending:waiting_projection',
      'client-config',
      'sync:1'
    ])
    expect(result.peersSynced).toBe(true)
    expect(result.message).toContain('Core 拉取投影')
  })

  it('revokes the approved pair with its max revision when disconnecting', async () => {
    const { deps, calls } = makeDeps()
    const result = await applyPairIntent(2000, 'off', deps)

    expect(calls).toEqual([
      'local:2000:off',
      'client-config',
      'list-approvals',
      'revoke:22:3',
      'client-config',
      'sync:1'
    ])
    expect(deps.createPairApproval).not.toHaveBeenCalled()
    expect(deps.setAcceleration).not.toHaveBeenCalled()
    expect(result.message).toContain('回落原生 UDP')
  })

  it('skips revoke when no approved pair exists', async () => {
    const { deps, calls } = makeDeps({
      listPairApprovals: vi.fn(async () => ({ items: [] }))
    })
    await applyPairIntent(2000, 'off', deps)
    expect(calls.some((c) => c.startsWith('revoke:'))).toBe(false)
  })

  it('keeps the local intent but throws when the cloud transport is unknown', async () => {
    const { deps, calls } = makeDeps({
      getClientConfig: vi.fn(async () => ({ transport_id: '', edge_candidates: [], peers: [] }))
    })
    await expect(applyPairIntent(2000, 'on', deps)).rejects.toThrow('未登记本机 transport')
    expect(calls).toEqual([
      'local:2000:on',
      'result:2000:pending:云端未登记本机 transport，无法写回配对'
    ])
  })

  it('does not enable acceleration when pair approval fails (e.g. 403)', async () => {
    const { deps } = makeDeps({
      createPairApproval: vi.fn(async () => {
        throw Object.assign(new Error('forbidden'), { response: { status: 403 } })
      })
    })
    await expect(applyPairIntent(2000, 'on', deps)).rejects.toThrow('forbidden')
    expect(deps.setAcceleration).not.toHaveBeenCalled()
    expect(deps.syncUtcConfig).not.toHaveBeenCalled()
    expect(deps.recordResult).toHaveBeenCalledWith(2000, 'rejected', 'forbidden')
  })

  it('keeps the pair result when utcd.conf sync fails', async () => {
    const { deps } = makeDeps({
      syncUtcConfig: vi.fn(async () => {
        throw new Error('utcd down')
      })
    })
    const result = await applyPairIntent(2000, 'on', deps)
    expect(result.peersSynced).toBe(false)
    expect(result.message).not.toBe('')
  })

  it('disables local utcd when disconnecting the last remaining pair', async () => {
    let configCalls = 0
    const disableLocalUtc = vi.fn(async () => ({ ...status, enabled: false, running: false }))
    const { deps } = makeDeps({
      getClientConfig: vi.fn(async () => {
        configCalls++
        return {
          transport_id: '1000',
          edge_candidates: ['edge-a:4433'],
          peers: configCalls === 1 ? [{ name: 'n182', transport_id: 2000 }] : []
        }
      }),
      disableLocalUtc
    })
    const result = await applyPairIntent(2000, 'off', deps)
    expect(disableLocalUtc).toHaveBeenCalledTimes(1)
    expect(deps.syncUtcConfig).not.toHaveBeenCalled()
    expect(result.peersSynced).toBe(true)
    expect(result.localStatus.enabled).toBe(false)
  })
})
