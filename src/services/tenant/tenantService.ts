import { api } from '../api'
import type { IndexServicesResponse } from '../../types'

export interface Tenant {
  id: number
  zone_id: number
  zone_name: string
  zone_domain: string
  zone_status: number
  zone_admin_id: number
  zone_admin_name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  zone_remarks: string
  can_access: boolean
  pivot: {
    user_id: number
    zone_id: number
    is_admin: number
  }
  // 兼容旧的属性名
  name?: string
  description?: string
  status?: 'active' | 'inactive'
  owner_id?: string
}

export interface TenantOverview {
  total_zones: number
  active_zones: number
  total_nodes: number
  total_routes: number
}

export interface TenantStatistics {
  zone_id: string
  node_count: number
  active_node_count: number
  route_count: number
  ip_pool_count: number
  user_count: number
}

export interface PaginatedTenantResponse {
  data: Tenant[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export const tenantService = {
  // 获取用户可访问的Zone列表
  async getUserTenants(): Promise<Tenant[]> {
    const response = await api.get('/user/tenants')
    return response.data.data
  },

  // 切换当前Zone
  async switchTenant(tenantId: number): Promise<{ message: string; tenant: Tenant }> {
    const response = await api.post('/user/tenants/switch', { tenant_id: tenantId })
    return response.data.data
  },

  // 获取Zone列表
  async getTenants(params?: {
    page?: number | undefined
    per_page?: number | undefined
    status?: 'active' | 'inactive' | undefined
    search?: string | undefined
  }): Promise<PaginatedTenantResponse> {
    const response = await api.get('/tenants', { params })
    return response.data.data
  },

  // 创建新Zone
  async createTenant(data: {
    name: string
    description?: string
  }): Promise<Tenant> {
    const response = await api.post('/tenants', data)
    return response.data.data
  },

  // 获取Zone概览
  async getTenantOverview(): Promise<TenantOverview> {
    const response = await api.get('/tenants/overview')
    return response.data.data
  },

  // 获取单个Zone详情
  async getZoneById(id: string): Promise<Tenant> {
    const response = await api.get(`/tenants/${id}`)
    return response.data.data
  },

  // 更新Zone
  async updateTenant(id: string, data: {
    name?: string
    description?: string
    status?: 'active' | 'inactive'
  }): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}`, data)
    return response.data.data
  },

  // 删除Zone
  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`)
  },

  // 获取Zone统计信息
  async getTenantStatistics(tenantId: string): Promise<TenantStatistics> {
    const response = await api.get(`/tenants/${tenantId}/statistics`)
    return response.data.data
  },

  // 获取索引服务列表
  async getIndexServices(): Promise<{ data: IndexServicesResponse }> {
    const response = await api.get('/services/indexes')
    return response.data
  }
}