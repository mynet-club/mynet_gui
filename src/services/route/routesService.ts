import { api } from '../api'
import type { BaseResponse, RouteDataResponse } from '../../types'
import type { RouteRequest } from '../../types/api'

export interface BatchRouteRequestResult {
  created: Array<{
    id: number | string
    source_node_id: string
    target_node_id: string
    target_user_id: string
    vpn_type: string
    message?: string | null
    status: string
    created_at: string
    expires_at?: string | null
  }>
  skipped: Array<{
    source_node_id: string
    target_node_id: string
    target_user_id: string
    reason: string
    error_code?: string | null
  }>
  summary: {
    total: number
    created_count: number
    skipped_count: number
  }
}

export const routesService = {
  // 获取路由数据概览
  async getOverview(): Promise<RouteDataResponse> {
    const response = await api.get('/route/data')
    return response.data.data
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

  // 创建路由请求（单条）
  async createRouteRequest(requestData: RouteRequest): Promise<BaseResponse> {
    const response = await api.post('/route/send-request', requestData)
    return response.data
  },

  // 批量创建好友连接请求（单页多选）
  async createBatchRouteRequests(
    requests: RouteRequest[],
    message?: string
  ): Promise<BaseResponse<BatchRouteRequestResult>> {
    const response = await api.post('/route/send-requests', {
      requests,
      ...(message ? { message } : {})
    })
    return response.data
  },

  // 获取路由详情
  async getRouteDetails(routeId: string): Promise<any> {
    const response = await api.get(`/route/${routeId}`)
    return response.data.data
  }
}
