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

describe('utcService usage summaries', () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiPut.mockReset()
    apiPost.mockReset()
  })

  it('GET /utc/usage/summaries compacts tenant filters', async () => {
    const payload = {
      scope: 'default',
      count: 1,
      items: [],
      totals: { billable: 0, endpoint_a: 0, endpoint_b: 0, anchor: 0 },
      data_source: { mode: 'database', durable: true, note: '' }
    }
    apiGet.mockResolvedValueOnce(ok(payload))

    const result = await utcService.listUsageSummaries({
      pair_id: 7,
      direction: 'AB',
      state: 'reconciled',
      transport_id: ''
    })

    expect(apiGet).toHaveBeenCalledWith('/utc/usage/summaries', {
      params: { pair_id: 7, direction: 'AB', state: 'reconciled' }
    })
    expect(result).toEqual(payload)
  })
})

describe('utcService transport registration', () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiPut.mockReset()
    apiPost.mockReset()
  })

  it('POST /utc/transports sends transport_id/node_id/SPKI and unwraps the record', async () => {
    const record = {
      transport_id: '8283289760467957',
      node_id: '8283289760467957',
      spki_sha256: 'a'.repeat(64),
      account_id: 'acc-1',
      registered_at: '2026-11-21T00:00:00Z'
    }
    apiPost.mockResolvedValueOnce(ok(record))

    const result = await utcService.registerTransport({
      transport_id: '8283289760467957',
      node_id: '8283289760467957',
      spki_sha256: 'a'.repeat(64)
    })

    expect(apiPost).toHaveBeenCalledWith('/utc/transports', {
      transport_id: '8283289760467957',
      node_id: '8283289760467957',
      spki_sha256: 'a'.repeat(64)
    })
    expect(result).toEqual(record)
  })

  it('registration failure surfaces the backend message', async () => {
    apiPost.mockResolvedValueOnce({
      data: { success: false, message: 'UTC_REGISTRATION_CONFLICT' }
    })

    await expect(
      utcService.registerTransport({
        transport_id: '1',
        node_id: null,
        spki_sha256: 'b'.repeat(64)
      })
    ).rejects.toThrow('UTC_REGISTRATION_CONFLICT')
  })
})

describe('utcService error descriptions', () => {
  it('prefers the backend message', () => {
    const error = { response: { status: 500, data: { message: 'boom' } } }
    expect(describeUtcError(error)).toBe('boom')
  })

  it('surfaces field detail and error code for validation/conflict responses', () => {
    const validation = {
      response: {
        status: 422,
        data: { message: 'invalid', errors: { transport_id: ['required'] } }
      }
    }
    expect(describeUtcError(validation)).toBe('invalid：transport_id: required')

    const conflict = {
      response: { status: 409, data: { message: 'stale', error_code: 'STALE_REVISION' } }
    }
    expect(describeUtcError(conflict)).toBe('stale（STALE_REVISION）')
  })
})
