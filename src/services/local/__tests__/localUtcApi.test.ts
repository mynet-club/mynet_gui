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
          configured: true,
          running: true,
          config_path: 'conf/utc/utcd.conf',
          config_version: 3,
          state_dir: 'utc-state',
          edge_candidates: ['edge-a:4433'],
          peers: [
            {
              name: 'n182',
              transport_id: 1234567890123456,
              udp_bind: '127.0.0.1:19001',
              udp_target: '127.0.0.1:9001'
            }
          ]
        }
      }
    } as never)

    const status = await localApi.getUtcStatus()

    expect(requestSpy).toHaveBeenCalledWith({ method: 'get', url: '/utc/status' })
    expect(status.enabled).toBe(true)
    expect(status.configured).toBe(true)
    expect(status.config_version).toBe(3)
    expect(status.peers).toHaveLength(1)
    expect(status.peers[0]?.transport_id).toBe(1234567890123456)
  })

  it('fetches local UTC pairs via GET /utc/pairs', async () => {
    const requestSpy = vi.spyOn(localHttp, 'request').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: {
          enabled: true,
          configured: true,
          running: true,
          count: 1,
          peers: [
            {
              name: 'n182',
              transport_id: 1234567890123456,
              udp_bind: '127.0.0.1:19001',
              udp_target: '127.0.0.1:9001'
            }
          ]
        }
      }
    } as never)

    const payload = await localApi.getUtcPairs()

    expect(requestSpy).toHaveBeenCalledWith({ method: 'get', url: '/utc/pairs' })
    expect(payload.count).toBe(1)
    expect(payload.peers[0]?.name).toBe('n182')
  })

  it('toggles local UTC acceleration via PUT /utc/acceleration', async () => {
    const requestSpy = vi.spyOn(localHttp, 'request').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: {
          enabled: true,
          configured: true,
          running: true,
          edge_candidates: [],
          peers: []
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
    expect(next.running).toBe(true)
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
        message: 'UTC 未配置：未找到 utcd.conf'
      }
    }
    vi.spyOn(localHttp, 'request').mockRejectedValue(err)

    await expect(localApi.putUtcAcceleration(true)).rejects.toMatchObject({
      name: 'LocalApiError',
      reasonCode: 'UTC_TOGGLE_FAILED',
      status: 409,
      message: 'UTC 未配置：未找到 utcd.conf'
    } satisfies Partial<LocalApiError>)
  })
})
