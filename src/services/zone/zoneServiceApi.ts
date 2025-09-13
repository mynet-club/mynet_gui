import { api } from '../api'
import { withCache, generateApiCacheKey, invalidateByTag } from '../../utils/apiCache'
import type {
  ZoneService,
  CreateZoneServiceRequest,
  UpdateZoneServiceRequest,
  ShareZoneServiceRequest,
  RequestApprovalRequest,
  ZoneServiceListResponse,
  ZoneServiceResponse
} from '../../types/zoneService'

export const zoneServiceApi = {
  // 获取所有可见的服务列表 - 短期缓存
  getServices: withCache(
    async (params?: {
      zone_id?: number
      service_type?: string
      share_type?: 'public' | 'friend' | 'anonymous' | 'my'
      page?: number
      per_page?: number
    }): Promise<ZoneServiceListResponse> => {
      const response = await api.get('/zones/services', { params })
      return response.data
    },
    {
      ttl: 2 * 60 * 1000, // 2分钟缓存
      storage: 'memory',
      key: (args) => generateApiCacheKey('zones_services', args[0]),
      tags: ['zone_services']
    }
  ),

  // 获取公共服务 - 较长缓存
  getPublicServices: withCache(
    async (): Promise<ZoneServiceListResponse> => {
      const response = await api.get(`/zones/services/public`)
      return response.data
    },
    {
      ttl: 5 * 60 * 1000, // 5分钟缓存
      storage: 'memory',
      key: 'public_services',
      tags: ['zone_services', 'public_services']
    }
  ),

  // 获取好友分享的服务 - 短期缓存
  getFriendServices: withCache(
    async (): Promise<ZoneServiceListResponse> => {
      const response = await api.get(`/zones/services/friends`)
      return response.data
    },
    {
      ttl: 1 * 60 * 1000, // 1分钟缓存
      storage: 'memory',
      key: 'friend_services',
      tags: ['zone_services', 'friend_services']
    }
  ),

  // 获取匿名共享的服务 - 较长缓存
  getAnonymousServices: withCache(
    async (): Promise<ZoneServiceListResponse> => {
      const response = await api.get(`/zones/services/anonymous`)
      return response.data
    },
    {
      ttl: 3 * 60 * 1000, // 3分钟缓存
      storage: 'memory',
      key: 'anonymous_services',
      tags: ['zone_services', 'anonymous_services']
    }
  ),

  // 获取我的服务 - 短期缓存
  getMyServices: withCache(
    async (): Promise<ZoneServiceListResponse> => {
      const response = await api.get(`/zones/services/my`)
      return response.data
    },
    {
      ttl: 30 * 1000, // 30秒缓存
      storage: 'memory',
      key: 'my_services',
      tags: ['zone_services', 'my_services']
    }
  ),

  // 获取单个服务详情 - 中期缓存
  getService: withCache(
    async (serviceId: number): Promise<ZoneServiceResponse> => {
      const response = await api.get(`/zones/services/${serviceId}`)
      return response.data
    },
    {
      ttl: 3 * 60 * 1000, // 3分钟缓存
      storage: 'memory',
      key: (args) => `service_detail_${args[0]}`,
      tags: ['zone_services', 'service_details']
    }
  ),

  // 创建新服务 - 清除相关缓存
  async createService(data: CreateZoneServiceRequest): Promise<ZoneServiceResponse> {
    const response = await api.post('/zones/services/create', data)
    
    // 创建后清除相关缓存
    invalidateByTag('zone_services')
    invalidateByTag('my_services')
    
    return response.data
  },

  // 更新服务 - 清除相关缓存
  async updateService(serviceId: number, data: UpdateZoneServiceRequest): Promise<ZoneServiceResponse> {
    const response = await api.put(`/zones/services/update/${serviceId}`, data)
    
    // 更新后清除相关缓存
    invalidateByTag('zone_services')
    invalidateByTag('my_services')
    invalidateByTag('service_details')
    
    return response.data
  },

  // 删除服务 - 清除相关缓存
  async deleteService(serviceId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/zones/services/delete/${serviceId}`)
    
    // 删除后清除相关缓存
    invalidateByTag('zone_services')
    invalidateByTag('my_services')
    invalidateByTag('service_details')
    
    return response.data
  },

  // 分享服务给好友 - 清除相关缓存
  async shareService(serviceId: number, data: ShareZoneServiceRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/share`, data)
    
    // 分享后清除相关缓存
    invalidateByTag('friend_services')
    invalidateByTag('my_services')
    
    return response.data
  },

  // 申请公开服务 - 清除相关缓存
  async requestApproval(serviceId: number, data?: RequestApprovalRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/request-approval`, data)
    
    // 申请后清除相关缓存
    invalidateByTag('my_services')
    
    return response.data
  },

  // 审批服务公开申请 - 清除相关缓存
  async approveService(serviceId: number, approve: boolean, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/approve`, {
      approve,
      reason
    })
    
    // 审批后清除相关缓存
    invalidateByTag('zone_services')
    invalidateByTag('public_services')
    
    return response.data
  },

  // 取消分享 - 清除相关缓存
  async unshareService(serviceId: number, targetUserId?: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/unshare`, {
      target_user_id: targetUserId
    })
    
    // 取消分享后清除相关缓存
    invalidateByTag('friend_services')
    invalidateByTag('my_services')
    
    return response.data
  }
}
