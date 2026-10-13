import { api } from '../api'
import type { BaseResponse, RouteDataResponse } from '../../types'
import type { RouteRequest } from '../../types/api'

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

}
