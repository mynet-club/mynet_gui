import { api } from '../api'
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
  // 获取所有可见的服务列表
  async getServices(params?: {
    zone_id?: number
    service_type?: string
    share_type?: 'public' | 'friend' | 'anonymous' | 'my'
    page?: number
    per_page?: number
  }): Promise<ZoneServiceListResponse> {
    const response = await api.get('/zones/services', { params })
    return response.data
  },

  // 获取公共服务
  async getPublicServices(): Promise<ZoneServiceListResponse> {
    const response = await api.get(`/zones/services/public`)
    return response.data
  },

  // 获取好友分享的服务
  async getFriendServices(): Promise<ZoneServiceListResponse> {
    const response = await api.get(`/zones/services/friends`)
    return response.data
  },

  // 获取匿名共享的服务
  async getAnonymousServices(): Promise<ZoneServiceListResponse> {
    const response = await api.get(`/zones/services/anonymous`)
    return response.data
  },

  // 获取我的服务
  async getMyServices(): Promise<ZoneServiceListResponse> {
    const response = await api.get(`/zones/services/my`)
    return response.data
  },

  // 获取单个服务详情
  async getService(serviceId: number): Promise<ZoneServiceResponse> {
    const response = await api.get(`/zones/services/${serviceId}`)
    return response.data
  },

  // 创建新服务
  async createService(data: CreateZoneServiceRequest): Promise<ZoneServiceResponse> {
    const response = await api.post('/zones/services', data)
    return response.data
  },

  // 更新服务
  async updateService(serviceId: number, data: UpdateZoneServiceRequest): Promise<ZoneServiceResponse> {
    const response = await api.put(`/zones/services/${serviceId}`, data)
    return response.data
  },

  // 删除服务
  async deleteService(serviceId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/zones/services/${serviceId}`)
    return response.data
  },

  // 分享服务给好友
  async shareService(serviceId: number, data: ShareZoneServiceRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/share`, data)
    return response.data
  },

  // 申请公开服务
  async requestApproval(serviceId: number, data?: RequestApprovalRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/request-approval`, data)
    return response.data
  },

  // 审批服务公开申请
  async approveService(serviceId: number, approve: boolean, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/approve`, {
      approve,
      reason
    })
    return response.data
  },

  // 取消分享
  async unshareService(serviceId: number, targetUserId?: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zones/services/${serviceId}/unshare`, {
      target_user_id: targetUserId
    })
    return response.data
  }
}
