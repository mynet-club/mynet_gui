import { api } from '../api'
import type { BaseResponse } from '../../types'
import type { RouteRequest } from '../../types/api'

export const routesService = {
  // 获取路由数据概览
  async getOverview(): Promise<any> {
    const response = await api.get('/route/data')
    return response.data.data
  },

  // 获取活跃路由列表
  async getActiveRoutes(params?: { page?: number; per_page?: number }): Promise<any> {
    const response = await api.get('/route/active', { params })
    return response.data.data
  },

  // 获取待处理连接
  async getPendingConnections(type: 'incoming' | 'outgoing' = 'incoming'): Promise<any> {
    const response = await api.get(`/route/connections/${type}`)
    return response.data.data
  },

  // 获取好友节点列表
  async getFriendNodes(): Promise<any> {
    const response = await api.get('/route/friend-nodes')
    return response.data.data
  },
 
  // 连接到节点
  async connectToNode(nodeId: string, message?: string): Promise<BaseResponse> {
    const response = await api.post(`/route/connect/${nodeId}`, { message })
    return response.data
  },

  // 批准连接
  async approveConnection(connectionId: string): Promise<BaseResponse> {
    const response = await api.post(`/route/accept-request/${connectionId}`)
    return response.data
  },

  // 拒绝连接
  async rejectConnection(connectionId: string): Promise<BaseResponse> {
    const response = await api.post(`/route/reject-request/${connectionId}`)
    return response.data
  },

  // 断开路由
  async disconnectRoute(routeId: string): Promise<BaseResponse> {
    const response = await api.delete(`/route/${routeId}`)
    return response.data
  },

  // 创建路由请求
  async createRouteRequest(requestData: RouteRequest): Promise<BaseResponse> {
    const response = await api.post('/route/send-request', requestData)
    return response.data
  },



  // 获取路由详情
  async getRouteDetails(routeId: string): Promise<any> {
    const response = await api.get(`/route/${routeId}`)
    return response.data.data
  },

  // 获取连接统计
  async getConnectionStats(routeId: string): Promise<any> {
    const response = await api.get(`/route/${routeId}/stats`)
    return response.data.data
  }
}
