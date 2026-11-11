import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiGet = vi.hoisted(() => vi.fn())
const apiPut = vi.hoisted(() => vi.fn())
const apiPost = vi.hoisted(() => vi.fn())

vi.mock('../../api', () => ({
  api: { get: apiGet, put: apiPut, post: apiPost }
}))

import { describeUtcError, utcService } from '../utcService'

const ok = <T>(data: T) => ({ data: { success: true, data } })

const item = {
  transport_id: 't-1',
  account_id: 'acc-1',
  desired_enabled: true,
  desired_revision: 1,
  observed_state: 'UNKNOWN' as const,
  observed_detail: null,
  updated_at: '2026-11-09T00:00:00Z'
}

describe('utcService acceleration endpoints', () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiPut.mockReset()
    apiPost.mockReset()
  })

  it('GET /utc/acceleration unwraps data_source and items', async () => {
    const payload = {
      data_source: { mode: 'memory', durable: false, note: '' },
      items: [item]
    }
    apiGet.mockResolvedValueOnce(ok(payload))

    const result = await utcService.getAcceleration()

    expect(apiGet).toHaveBeenCalledWith('/utc/acceleration', { params: undefined })
    expect(result).toEqual(payload)
  })

  it('GET failure surfaces backend message', async () => {
    apiGet.mockResolvedValueOnce({ data: { success: false, message: 'boom' } })

    await expect(utcService.getAcceleration()).rejects.toThrow('boom')
  })

  it('PUT /utc/acceleration/{id} sends enabled body and returns the item', async () => {
    const updated = { ...item, desired_enabled: false }
    apiPut.mockResolvedValueOnce(ok(updated))

    const result = await utcService.setAcceleration('t-1', false)

    expect(apiPut).toHaveBeenCalledWith('/utc/acceleration/t-1', { enabled: false })
    expect(result).toEqual(updated)
  })

  it('PUT encodes the transport id', async () => {
    apiPut.mockResolvedValueOnce(ok(item))

    await utcService.setAcceleration('t/1', true)

    expect(apiPut).toHaveBeenCalledWith('/utc/acceleration/t%2F1', { enabled: true })
  })

  it('PUT failure rejects instead of swallowing the error', async () => {
    apiPut.mockResolvedValueOnce({ data: { success: false, message: 'denied' } })

    await expect(utcService.setAcceleration('t-1', true)).rejects.toThrow('denied')
  })

  it('PUT failure without a message uses the generic fallback', async () => {
    apiPut.mockResolvedValueOnce({ data: { success: false } })

    await expect(utcService.setAcceleration('t-1', true)).rejects.toThrow('UTC 更新失败')
  })
})

const relayItem = {
  edge_id: '1001',
  tenant_id: '1001',
  inventory_revision: 2,
  pool_id: 'pool-east',
  region: 'cn-east',
  zone: null,
  visibility: 'tenant',
  address: '203.0.113.10',
  port: 4433,
  family: 4,
  modes: ['A-D'],
  shard_count: 4,
  reactor_count: 2,
  max_streams: 2048,
  max_mbps: 500,
  headroom_pct: 10,
  weight: 10,
  trust_tier: 'verified',
  cost_tier: 3,
  valid_from: '2026-11-11T00:00:00Z',
  valid_until: '2026-11-12T00:00:00Z',
  descriptor_digest: 'a'.repeat(64),
  spki_sha256_current: 'b'.repeat(64),
  cert_epoch: 1,
  declared_state: 'active' as const,
  approval_state: 'approved' as const,
  approved_at: '2026-11-11T00:00:00Z',
  approved_by: '42',
  revoked_at: null,
  revoked_by: null,
  revocation_reason: null,
  audit_ref: 'OPS-1',
  created_by: '42',
  updated_by: '42',
  eligible: true,
  eligibility_reasons: [],
  delivery_state: 'not_wired',
  created_at: '2026-11-11T00:00:00Z',
  updated_at: '2026-11-11T00:00:00Z'
}

const delivery = { state: 'not_wired', note: 'not wired' }
const dataSource = { mode: 'database', durable: true, note: '' }

describe('utcService relay admin endpoints', () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiPut.mockReset()
    apiPost.mockReset()
  })

  it('GET /utc/admin/relay-inventory forwards filters and unwraps items', async () => {
    const payload = { scope: 'default', count: 1, delivery, items: [relayItem], data_source: dataSource }
    apiGet.mockResolvedValueOnce(ok(payload))

    const result = await utcService.listRelayInventory({ approval_state: 'approved', eligible: 1 })

    expect(apiGet).toHaveBeenCalledWith('/utc/admin/relay-inventory', {
      params: { approval_state: 'approved', eligible: 1 }
    })
    expect(result).toEqual(payload)
  })

  it('POST create sends the declaration and returns the wrapped item', async () => {
    const payload = { item: relayItem, delivery, data_source: dataSource }
    apiPost.mockResolvedValueOnce(ok(payload))

    const result = await utcService.createRelayInventory({
      edge_id: 1001,
      address: '203.0.113.10',
      port: 4433,
      family: 4,
      pool_id: 'pool-east',
      region: 'cn-east',
      visibility: 'tenant',
      modes: ['A-D'],
      shard_count: 4,
      reactor_count: 2,
      max_streams: 2048,
      max_mbps: 500,
      trust_tier: 'verified',
      cost_tier: 3,
      valid_until: '2026-11-12T00:00:00Z',
      descriptor_digest: 'a'.repeat(64),
      spki_sha256_current: 'b'.repeat(64),
      cert_epoch: 1,
      audit_ref: 'OPS-1'
    })

    expect(apiPost).toHaveBeenCalledWith('/utc/admin/relay-inventory', expect.objectContaining({
      edge_id: 1001,
      audit_ref: 'OPS-1'
    }))
    expect(result).toEqual(payload)
  })

  it('PUT update carries expected_revision and encodes the edge id', async () => {
    apiPut.mockResolvedValueOnce(ok({ item: relayItem, delivery, data_source: dataSource }))

    await utcService.updateRelayInventory('1001', {
      address: '203.0.113.10',
      port: 4433,
      family: 4,
      pool_id: 'pool-east',
      region: 'cn-east',
      visibility: 'tenant',
      modes: ['A-D'],
      shard_count: 4,
      reactor_count: 2,
      max_streams: 2048,
      max_mbps: 500,
      trust_tier: 'verified',
      cost_tier: 3,
      valid_until: '2026-11-12T00:00:00Z',
      descriptor_digest: 'a'.repeat(64),
      spki_sha256_current: 'b'.repeat(64),
      cert_epoch: 1,
      audit_ref: 'OPS-1',
      declared_state: 'active',
      expected_revision: 2
    })

    expect(apiPut).toHaveBeenCalledWith(
      '/utc/admin/relay-inventory/1001',
      expect.objectContaining({ expected_revision: 2, declared_state: 'active' })
    )
  })

  it('approve and revoke post the revision guard', async () => {
    apiPost.mockResolvedValue(ok({ item: relayItem, delivery, data_source: dataSource }))

    await utcService.approveRelayInventory('1001', 2, 'OPS-A')
    expect(apiPost).toHaveBeenLastCalledWith('/utc/admin/relay-inventory/1001/approve', {
      expected_revision: 2,
      audit_ref: 'OPS-A'
    })

    await utcService.revokeRelayInventory('1001', 2, 'retired', 'OPS-R')
    expect(apiPost).toHaveBeenLastCalledWith('/utc/admin/relay-inventory/1001/revoke', {
      expected_revision: 2,
      reason: 'retired',
      audit_ref: 'OPS-R'
    })
  })

  it('pair approvals map to the cohort endpoints', async () => {
    const pair = {
      id: 9,
      tenant_id: '1001',
      transport_id: 'tr-1',
      pair_id: 7,
      side: 0,
      state: 'approved' as const,
      revision: 1,
      reason: 'pilot',
      audit_ref: 'OPS-P',
      approved_by: '42',
      approved_at: '2026-11-11T00:00:00Z',
      revoked_by: null,
      revoked_at: null,
      updated_at: '2026-11-11T00:00:00Z'
    }
    const list = { scope: 'default', count: 1, counts: { approved: 1, cap: 4096 }, delivery, items: [pair], data_source: dataSource }
    apiGet.mockResolvedValueOnce(ok(list))

    const items = await utcService.listPairApprovals()
    expect(apiGet).toHaveBeenCalledWith('/utc/admin/pair-approvals', { params: undefined })
    expect(items.items[0].id).toBe(9)

    apiPost.mockResolvedValue(ok({ item: pair, delivery, data_source: dataSource }))
    await utcService.approvePair({ transport_id: 'tr-1', pair_id: 7, side: 0, reason: 'pilot', audit_ref: 'OPS-P' })
    expect(apiPost).toHaveBeenLastCalledWith('/utc/admin/pair-approvals', {
      transport_id: 'tr-1',
      pair_id: 7,
      side: 0,
      reason: 'pilot',
      audit_ref: 'OPS-P'
    })

    await utcService.revokePairApproval(9, 1, 'done', 'OPS-R')
    expect(apiPost).toHaveBeenLastCalledWith('/utc/admin/pair-approvals/9/revoke', {
      expected_revision: 1,
      reason: 'done',
      audit_ref: 'OPS-R'
    })
  })

  it('surface validation detail and error code instead of the generic message', () => {
    const error = {
      response: {
        status: 422,
        data: {
          message: 'The given data was invalid.',
          error_code: 'VALIDATION_ERROR',
          errors: { valid_until: ['valid_until must be at most 7 days after valid_from'] }
        }
      }
    }

    expect(describeUtcError(error)).toContain('valid_until must be at most 7 days after valid_from')

    const conflict = {
      response: { status: 409, data: { message: 'stale', error_code: 'STALE_REVISION' } }
    }
    expect(describeUtcError(conflict)).toBe('stale（STALE_REVISION）')
  })
})
