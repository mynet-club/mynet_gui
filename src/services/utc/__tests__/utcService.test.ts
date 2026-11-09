import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiGet = vi.hoisted(() => vi.fn())
const apiPut = vi.hoisted(() => vi.fn())

vi.mock('../../api', () => ({
  api: { get: apiGet, put: apiPut }
}))

import { utcService } from '../utcService'

const ok = <T>(data: T) => ({ data: { success: true, data } })

const item = {
  transport_id: 't-1',
  account_id: 'acc-1',
  desired_enabled: true,
  observed_state: 'UNKNOWN' as const,
  updated_at: '2026-11-09T00:00:00Z'
}

describe('utcService acceleration endpoints', () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiPut.mockReset()
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
