import { api } from '../api'
import type { 
  SocialDataResponse,
  Friend, 
  SearchUser, 
  FriendRequest, 
  BaseResponse, 
  Invitation,
  Node
} from '../../types'

export const socialService = {
  // 获取社交数据概览
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

  // 获取好友请求
  async getFriendRequests(type: 'received' | 'sent' = 'received'): Promise<FriendRequest[]> {
    const endpoint = type === 'received' ? '/social/friend-requests' : '/social/sent-friend-requests'
    const response = await api.get(endpoint)
    return response.data.data
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

  // 删除好友
  async removeFriend(friendId: string): Promise<BaseResponse> {
    const response = await api.post('/social/friend/remove', { friend_id: friendId })
    return response.data
  },

  // 获取邀请码列表
  async getInvitations(): Promise<Invitation[]> {
    const response = await api.get('/social/invitations')
    return response.data.data
  },

  // 生成邀请码
  async createInvitation(expiresIn?: number): Promise<Invitation> {
    const response = await api.post('/social/invitation', { expires_in: expiresIn })
    return response.data.data
  },

  // 获取好友的节点
  async getFriendNodes(friendId: string): Promise<Node[]> {
    const response = await api.get(`/social/friends/${friendId}/nodes`)
    return response.data.data
  }
}
