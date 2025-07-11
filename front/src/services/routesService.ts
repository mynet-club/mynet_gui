import { api } from './api'
import type { BaseResponse } from '../types'

export const routesService = {
  // 获取路由数据概览
  async getOverview(): Promise<any> {
    const response = await api.get('/routes/data')
    return response.data.data
  },

  // 获取活跃路由列表
  async getActiveRoutes(params?: { page?: number; per_page?: number }): Promise<any> {
    const response = await api.get('/routes/active', { params })
    return response.data.data
  },

  // 获取待处理连接
  async getPendingConnections(type: 'incoming' | 'outgoing' = 'incoming'): Promise<any> {
    const response = await api.get(`/routes/connections/${type}`)
    return response.data.data
  },

  // 获取好友节点列表
  async getFriendNodes(): Promise<any> {
    const response = await api.get('/routes/friend-nodes')
    return response.data.data
  },

  // 获取路由配置
  async getConfig(): Promise<any> {
    const response = await api.get('/routes/config')
    return response.data.data
  },

  // 连接到节点
  async connectToNode(nodeId: string, message?: string): Promise<BaseResponse> {
    const response = await api.post(`/routes/connect/${nodeId}`, { message })
    return response.data
  },

  // 批准连接
  async approveConnection(connectionId: string): Promise<BaseResponse> {
    const response = await api.post(`/routes/connections/${connectionId}/approve`)
    return response.data
  },

  // 拒绝连接
  async rejectConnection(connectionId: string): Promise<BaseResponse> {
    const response = await api.post(`/routes/connections/${connectionId}/reject`)
    return response.data
  },

  // 断开路由
  async disconnectRoute(routeId: string): Promise<BaseResponse> {
    const response = await api.delete(`/routes/${routeId}`)
    return response.data
  },

  // 下载路由配置
  async downloadConfig(): Promise<string> {
    const response = await api.get('/routes/config/download', {
      responseType: 'text'
    })
    return response.data
  },

  // 刷新路由配置
  async refreshConfig(): Promise<BaseResponse> {
    const response = await api.post('/routes/config/refresh')
    return response.data
  },

  // 获取路由详情
  async getRouteDetails(routeId: string): Promise<any> {
    const response = await api.get(`/routes/${routeId}`)
    return response.data.data
  },

  // 获取连接统计
  async getConnectionStats(routeId: string): Promise<any> {
    const response = await api.get(`/routes/${routeId}/stats`)
    return response.data.data
  }
}
