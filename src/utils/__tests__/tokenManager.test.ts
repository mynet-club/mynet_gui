import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 防回归锁（B1 S3 refresh 解包）：refresh 响应是后端信封
//   { success, code, message, data: { auth_token, refresh_token,
//     auth_token_expires_in, refresh_token_expires_in } }
// 两个 *_expires_in 是**剩余秒数**。旧实现找 expires_at/expires_in 永不命中、
// 恒落「默认 1 小时」，且把刷新窗当成与 access TTL 相同（后端是 7 天）。
vi.mock('quasar', () => ({
  LocalStorage: { set: vi.fn(), getItem: vi.fn(), remove: vi.fn() }
}))
vi.mock('src/utils/debug', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() }
}))
vi.mock('../../services/api', () => ({ api: { post: vi.fn() } }))

import { LocalStorage } from 'quasar'
import { api } from '../../services/api'
import { tokenManager } from '../tokenManager'

const envelope = (data: Record<string, unknown>) => ({
  data: { success: true, code: 200, message: 'ok', data }
})

describe('tokenManager 刷新响应解包', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // scheduleTokenRefresh 用 window.setTimeout（浏览器语境）
    vi.stubGlobal('window', { setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) })
    vi.mocked(LocalStorage.getItem).mockImplementation((key: string) =>
      key === 'refresh_token' ? 'old-refresh' : null
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('从 data.data 解包并把秒数换算成到期时刻', async () => {
    vi.mocked(api.post).mockResolvedValue(envelope({
      auth_token: 'new-auth',
      refresh_token: 'new-refresh',
      auth_token_expires_in: 7200,      // 2 小时（与默认兜底 1 小时可区分）
      refresh_token_expires_in: 604800  // 7 天刷新窗
    }))
    const save = vi.spyOn(tokenManager, 'saveTokenData').mockImplementation(() => {})

    const token = await tokenManager.refreshToken()

    expect(api.post).toHaveBeenCalledWith('/auth/refresh-token', { refresh_token: 'old-refresh' })
    expect(token).toBe('new-auth')

    const saved = save.mock.calls[0]?.[0]
    expect(saved?.auth_token).toBe('new-auth')
    expect(saved?.refresh_token).toBe('new-refresh')

    // epoch 毫秒到期时刻 = now + 秒数*1000
    const now = Date.now()
    expect(saved?.auth_token_expires_in).toBeGreaterThanOrEqual(now + 7200 * 1000 - 2000)
    expect(saved?.auth_token_expires_in).toBeLessThanOrEqual(now + 7200 * 1000 + 2000)
    // 刷新窗独立（不是「与 access 相同」）
    expect(saved?.refresh_token_expires_in).toBeGreaterThanOrEqual(now + 604800 * 1000 - 2000)
    expect(saved?.refresh_token_expires_in).toBeLessThanOrEqual(now + 604800 * 1000 + 2000)
  })

  it('过期字段缺失时兜底 1 小时（不再读不存在的 expires_at/expires_in）', async () => {
    vi.mocked(api.post).mockResolvedValue(envelope({
      auth_token: 'new-auth',
      refresh_token: 'new-refresh'
    }))
    const save = vi.spyOn(tokenManager, 'saveTokenData').mockImplementation(() => {})

    await tokenManager.refreshToken()

    const saved = save.mock.calls[0]?.[0]
    const now = Date.now()
    expect(saved?.auth_token_expires_in).toBeGreaterThanOrEqual(now + 60 * 60 * 1000 - 2000)
    expect(saved?.auth_token_expires_in).toBeLessThanOrEqual(now + 60 * 60 * 1000 + 2000)
  })
})
