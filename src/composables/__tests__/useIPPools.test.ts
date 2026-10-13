import { describe, it, expect, vi, beforeEach } from 'vitest'

// 防回归锁（B1 S3 IP 池删除传参）：后端是 `DELETE /ippools/{sequence}`，
// {sequence} 只认序号。旧实现「无序号回退 poolId」把 16 位全局 ID 发进
// {sequence} 槽 —— 纯数字 poolId 能过路由正则，按序号查不到行 → 404/误删同序号池。
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('../useNotify', () => ({
  useNotify: () => ({ success: vi.fn(), error: vi.fn() })
}))
vi.mock('src/utils/debug', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() }
}))
vi.mock('src/services/api', () => ({
  api: { delete: vi.fn(), get: vi.fn(), post: vi.fn() }
}))

import { api } from 'src/services/api'
import { useIPPools } from '../useIPPools'

describe('useIPPools.deletePool 传参', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } })
    vi.mocked(api.get).mockResolvedValue({ data: { success: false, message: 'skip' } })
  })

  it('缺序号直接报错，不发请求（不再回退 poolId）', async () => {
    const { deletePool } = useIPPools()

    await expect(deletePool(undefined)).rejects.toThrow('sequence_number is required')
    expect(api.delete).not.toHaveBeenCalled()
  })

  it('按序号打 DELETE /ippools/{sequence}', async () => {
    const { deletePool } = useIPPools()

    await deletePool(7)
    expect(api.delete).toHaveBeenCalledWith('/ippools/7')
  })
})
