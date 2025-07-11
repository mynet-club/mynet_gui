import { api } from './api'

export interface Zone {
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

export interface ZoneOverview {
  total_zones: number
  active_zones: number
  total_nodes: number
  total_routes: number
}

export interface ZoneStatistics {
  zone_id: string
  node_count: number
  active_node_count: number
  route_count: number
  ip_pool_count: number
  user_count: number
}

export interface PaginatedZoneResponse {
  data: Zone[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export const zoneService = {
  // 获取用户可访问的Zone列表
  async getUserZones(): Promise<Zone[]> {
    const response = await api.get(`/user/zones`)
    return response.data.data
  },

  // 切换当前Zone
  async switchZone(zoneId: number): Promise<{ message: string; zone: Zone }> {
    const response = await api.post('/user/switch-zone', { zone_id: zoneId })
    return response.data.data
  },

  // 获取Zone列表
  async getZones(params?: {
    page?: number | undefined
    per_page?: number | undefined
    status?: 'active' | 'inactive' | undefined
    search?: string | undefined
  }): Promise<PaginatedZoneResponse> {
    const response = await api.get('/zones', { params })
    return response.data.data
  },

  // 创建新Zone
  async createZone(data: {
    name: string
    description?: string
  }): Promise<Zone> {
    const response = await api.post('/zones', data)
    return response.data.data
  },

  // 获取Zone概览
  async getZoneOverview(): Promise<ZoneOverview> {
    const response = await api.get('/zones/overview')
    return response.data.data
  },

  // 获取单个Zone详情
  async getZoneById(id: string): Promise<Zone> {
    const response = await api.get(`/zones/${id}`)
    return response.data.data
  },

  // 更新Zone
  async updateZone(id: string, data: {
    name?: string
    description?: string
    status?: 'active' | 'inactive'
  }): Promise<Zone> {
    const response = await api.put(`/zones/${id}`, data)
    return response.data.data
  },

  // 删除Zone
  async deleteZone(id: string): Promise<void> {
    await api.delete(`/zones/${id}`)
  },

  // 获取Zone统计信息
  async getZoneStatistics(zoneId: string): Promise<ZoneStatistics> {
    const response = await api.get(`/zones/${zoneId}/statistics`)
    return response.data.data
  }
}