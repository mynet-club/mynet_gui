import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'
import { localApi, localHttp, LocalApiError } from '../localApi'

describe('localApi UTC endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches local UTC status via GET /utc/status', async () => {
    const requestSpy = vi.spyOn(localHttp, 'request').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: {
          enabled: true,
          endpoint: { configured: true, running: true, config_path: '/etc/mynet/utcd.conf' },
          hub: {
            configured: true,
            running: true,
            scope: 'tenant-1',
            transport_id: 'tr-a',
            pairs: [
              {
                pair_id: 7345678901234567,
                peer_id: 'tr-b',
                side: 'A',
                mode: 'A-D',
                applied: true,
                pair_gen: 3,
                lease_epoch: 12,
                placement_epoch: 4,
                edge_id: 'edge-sg-1',
                valid_until: 1795000000
              }
            ]
          }
        }
      }
    } as never)

    const status = await localApi.getUtcStatus()

    expect(requestSpy).toHaveBeenCalledWith({ method: 'get', url: '/utc/status' })
    expect(status.enabled).toBe(true)
    expect(status.hub.pairs).toHaveLength(1)
    expect(status.hub.pairs[0]?.pair_id).toBe(7345678901234567)
    expect(status.hub.pairs[0]?.applied).toBe(true)
  })

  it('fetches local UTC pairs via GET /utc/pairs', async () => {
    const requestSpy = vi.spyOn(localHttp, 'request').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: {
          enabled: true,
          scope: 'tenant-1',
          transport_id: 'tr-a',
          count: 1,
          pairs: [
            {
              pair_id: 7345678901234567,
              peer_id: 'tr-b',
              side: 'A',
              mode: 'A-D',
              applied: false
            }
          ]
        }
      }
    } as never)

    const payload = await localApi.getUtcPairs()

    expect(requestSpy).toHaveBeenCalledWith({ method: 'get', url: '/utc/pairs' })
    expect(payload.count).toBe(1)
    expect(payload.pairs[0]?.pair_id).toBe(7345678901234567)
  })

  it('toggles local UTC acceleration via PUT /utc/acceleration', async () => {
    const requestSpy = vi.spyOn(localHttp, 'request').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: {
          enabled: true,
          endpoint: { configured: true, running: true },
          hub: { configured: false, running: false, pairs: [] }
        }
      }
    } as never)

    const next = await localApi.putUtcAcceleration(true)

    expect(requestSpy).toHaveBeenCalledWith({
      method: 'put',
      url: '/utc/acceleration',
      data: { enabled: true }
    })
    expect(next.enabled).toBe(true)
  })

  it('surfaces LocalApiError with reasonCode on 409 UTC_TOGGLE_FAILED', async () => {
    const err = new AxiosError('Request failed with status code 409')
    err.response = {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
      data: {
        success: false,
        reason_code: 'UTC_TOGGLE_FAILED',
        message: 'UTC 未配置：未找到 utcd.conf 或 hub.json'
      }
    }
    vi.spyOn(localHttp, 'request').mockRejectedValue(err)

    await expect(localApi.putUtcAcceleration(true)).rejects.toMatchObject({
      name: 'LocalApiError',
      reasonCode: 'UTC_TOGGLE_FAILED',
      status: 409,
      message: 'UTC 未配置：未找到 utcd.conf 或 hub.json'
    } satisfies Partial<LocalApiError>)
  })
})
