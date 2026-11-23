import { api } from '../api'
import type { 
  SocialDataResponse,
  Friend, 
  SearchUser, 
  FriendRequest, 
  BaseResponse, 
  Node
} from '../../types'

export const socialService = {
  // 获取组网数据概览
  async getOverview(): Promise<SocialDataResponse> {
    const response = await api.get('/social/data')
    return response.data.data
  },

  // 获取好友列表
  async getFriends(params?: { page?: number; per_page?: number; search?: string }): Promise<{ data: Friend[]; meta: any }> {
    const response = await api.get('/social/friends', { params })
    return response.data
  },

  // 搜索用户
  async searchUsers(query: string): Promise<SearchUser[]> {
    const response = await api.post('/social/search-users', { query })
    return response.data.data
  },

  // 获取好友请求（统一走 /social/data，避免调用后端不存在的 /social/friend-requests 端点）
  async getFriendRequests(type: 'received' | 'sent' = 'received'): Promise<FriendRequest[]> {
    const overview = await this.getOverview()
    return type === 'received'
      ? (overview.pending_requests || [])
      : (overview.outgoing_requests || [])
  },

  // 发送好友请求
  async sendFriendRequest(targetId: string, message?: string): Promise<BaseResponse> {
    const response = await api.post('/social/friend-request', { target_id: targetId, message })
    return response.data
  },

  // 接受好友请求
  async acceptFriendRequest(requestId: string): Promise<BaseResponse> {
    const response = await api.post('/social/friend-request/accept', { request_id: requestId })
    return response.data
  },

  // 拒绝好友请求
  async rejectFriendRequest(requestId: string): Promise<BaseResponse> {
    const response = await api.post('/social/friend-request/reject', { request_id: requestId })
    return response.data
  },
 
  // 取消好友请求
  async cancelFriendRequest(requestId: number): Promise<BaseResponse> {
    const response = await api.post('/social/friend-request/cancel', { request_id: requestId })
    return response.data
  },
  // 删除好友
  async removeFriend(friendId: string): Promise<BaseResponse> {
    const response = await api.post('/social/friend/remove', { friend_id: friendId })
    return response.data
  },

  // 获取好友的节点
  async getFriendNodes(friendId: string): Promise<Node[]> {
    const response = await api.get(`/social/friends/${friendId}/nodes`)
    return response.data.data
  },

  // 获取所有好友的节点
  async getAllFriendNodes(): Promise<any> {
    const response = await api.get('/social/friends/all/nodes')
    return response.data
  }
}
