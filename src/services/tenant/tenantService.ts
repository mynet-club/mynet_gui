import { api } from '../api'
import type { IndexServicesResponse, Tenant } from '../../types'

/**
 * 用户面的网络区服务（代码层 = Tenant，中文界面叫「网络区」）。
 *
 * 只有两个动作：列出我归属的网络区、切换当前网络区。这一层是**纯 wire**——
 * 不做字段别名映射，也不写本地存储（状态与持久化都在 `stores/auth.ts`），
 * 否则同一份数据会出现两条路径各自映射，页面就会静默空渲染。
 *
 * 网络区的增删改与概览/统计属 console（operator）管理面；2026-10-04 越权收敛后
 * `/tenants*` 在用户面不可达，此前挂在本服务里的 7 个管理方法一并删除。
 */

/** 切换成功后后端只回这两个键（没有 tenant 对象） */
export interface SwitchTenantResult {
  tenant_id: number
  name: string
}

/**
 * 从 `{ success, data, message }` 信封里取 data；失败时把后端话术抛出去，
 * 交给调用方提示，而不是让它当成「空列表」继续渲染。
 */
const unwrap = (response: any) => {
  if (response.data?.success) return response.data.data
  throw new Error(
    response.data?.message ||
    response.response?.data?.message ||
    'Request failed'
  )
}

export const tenantService = {
  // 我归属的网络区列表（后端按 tenant_users 成员关系给，且只给启用中的）
  async getUserTenants(): Promise<Tenant[]> {
    const response = await api.get('/user/tenants/')
    return unwrap(response)
  },

  // 切换当前网络区
  async switchTenant(tenantId: number): Promise<SwitchTenantResult> {
    const response = await api.post('/user/tenants/switch', { tenant_id: tenantId })
    return unwrap(response)
  },

  // 获取索引服务列表
  async getIndexServices(): Promise<{ data: IndexServicesResponse }> {
    const response = await api.get('/services/indexes')
    return response.data
  }
}
