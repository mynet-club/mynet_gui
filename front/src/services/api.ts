import axios from 'axios'
import { LocalStorage } from 'quasar'
import { 
  mockUsers, 
  mockZones, 
  mockNodes, 
  mockRoutes, 
  mockDashboardData, 
  mockDelay 
} from './mockData'
import { zoneService } from './zoneService'
import type { 
  Node, 
  SocialOverview, 
  Friend, 
  SearchUser, 
  FriendRequest, 
  BaseResponse, 
  Invitation 
} from '../types'

// 配置是否使用模拟数据
const USE_MOCK_DATA = false // 切换到真实API

// 创建并导出api实例供其他服务使用
export const api = axios.create({
  baseURL: USE_MOCK_DATA ? '/mock-api' : 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token刷新状态
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

// 处理队列中的请求
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// 模拟Token刷新
const refreshToken = async (): Promise<string> => {
  await mockDelay(1000)
  const newToken = 'mock_token_' + Date.now()
  LocalStorage.set('auth_token', newToken)
  return newToken
}

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = LocalStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加X-Zone-ID头部
    const userInfo = LocalStorage.getItem('user_info') as string | null
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo)
        if (user.zone_id) {
          config.headers['X-Zone-ID'] = user.zone_id
          console.log('🔧 [API] Injected X-Zone-ID header:', user.zone_id)
        }
      } catch (error) {
        console.warn('🔧 [API] Failed to parse user info for zone_id:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          // 确保刷新token后也注入X-Zone-ID头部
          const userInfo = LocalStorage.getItem('user_info') as string | null
          if (userInfo) {
            try {
              const user = JSON.parse(userInfo)
              if (user.zone_id) {
                originalRequest.headers['X-Zone-ID'] = user.zone_id
              }
            } catch (error) {
              console.warn('🔧 [API] Failed to parse user info for zone_id during token refresh:', error)
            }
          }
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        // 确保刷新token后也注入X-Zone-ID头部
        const userInfo = LocalStorage.getItem('user_info') as string | null
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo)
            if (user.zone_id) {
              originalRequest.headers['X-Zone-ID'] = user.zone_id
            }
          } catch (error) {
            console.warn('🔧 [API] Failed to parse user info for zone_id during token refresh:', error)
          }
        }
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        LocalStorage.remove('auth_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// 模拟API响应
const mockApiResponse = <T>(data: T, delay = 500) => {
  return new Promise<{ data: T }>((resolve) => {
    setTimeout(() => {
      resolve({ data })
    }, delay)
  })
}

// API服务
export const apiService = {
  // 认证相关
  async login(credentials: { email: string; password: string }) {
    if (USE_MOCK_DATA) {
      await mockDelay(1000)
      const user = mockUsers.find(u => u.email === credentials.email)
      if (user) {
        const token = 'mock_token_' + Date.now()
        return {
          data: {
            access_token: token,
            user: user,
            expires_at: Date.now() + 7200000 // 2小时
          }
        }
      } else {
        throw new Error('Invalid credentials')
      }
    }
    
    try {
      const response = await api.post('/auth/login', credentials)
      
      console.log('🔧 [API] Raw login response:', response.data)
      
      // 处理真实API响应格式
      if (response.data.success) {
        // 计算过期时间：如果后端返回了过期时间，使用后端的；否则默认2小时
        let expiresAt = Date.now() + 7200000 // 默认2小时
        
        console.log('🔧 [API] Default expires_at (2h from now):', new Date(expiresAt).toLocaleString())
        
        // 尝试从响应中获取过期时间
        if (response.data.data.expires_at) {
          console.log('🔧 [API] Backend expires_at found:', response.data.data.expires_at, typeof response.data.data.expires_at)
          // 如果后端返回的是时间戳
          if (typeof response.data.data.expires_at === 'number') {
            expiresAt = response.data.data.expires_at
            console.log('🔧 [API] Using backend timestamp directly:', expiresAt)
          } else {
            expiresAt = new Date(response.data.data.expires_at).getTime()
            console.log('🔧 [API] Converted backend time to timestamp:', expiresAt)
          }
        } else if (response.data.data.expires_in) {
          console.log('🔧 [API] Backend expires_in found:', response.data.data.expires_in, 'seconds')
          // 如果后端返回的是相对时间（秒）
          expiresAt = Date.now() + (response.data.data.expires_in * 1000)
          console.log('🔧 [API] Calculated expires_at from expires_in:', expiresAt)
        } else {
          console.log('🔧 [API] No expiry info from backend, using default 2h')
        }
        
        console.log('🔧 [API] Final expires_at:', expiresAt)
        console.log('🔧 [API] Final expires_at (human readable):', new Date(expiresAt).toLocaleString())
        console.log('🔧 [API] Current time:', Date.now())
        console.log('🔧 [API] Current time (human readable):', new Date().toLocaleString())
        console.log('🔧 [API] Time until expiry (minutes):', Math.round((expiresAt - Date.now()) / 60000))
        
        return {
          data: {
            access_token: response.data.data.token,
            user: response.data.data.user,
            expires_at: expiresAt
          }
        }
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('🔧 [API] Login error:', error)
      if (error.response?.data) {
        console.error('🔧 [API] Login error response:', error.response.data)
        throw new Error(error.response.data.message || 'Login failed')
      }
      throw error
    }
  },

  async logout() {
    if (USE_MOCK_DATA) {
      await mockDelay(300)
      return { data: { message: 'Logged out successfully' } }
    }
    return api.post('/auth/logout')
  },

  async getCurrentUser() {
    if (USE_MOCK_DATA) {
      await mockDelay(300)
      // 在模拟模式下，自动返回一个已登录用户
      const mockUser = mockUsers[0] // 使用第一个用户作为默认登录用户
      return { data: mockUser }
    }
    
    try {
      const response = await api.get('/user')
      
      // 处理真实API响应格式
      if (response.data.success) {
        return { data: response.data.data }
      } else {
        throw new Error(response.data.message || 'Failed to get user info')
      }
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get user info')
      }
      throw error
    }
  },

  // 开发模式自动登录方法
  async autoLogin() {
    if (USE_MOCK_DATA) {
      await mockDelay(500)
      const mockUser = mockUsers[0]
      const mockToken = 'mock_token_' + Date.now()
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
      
      return {
        data: {
          access_token: mockToken,
          user: mockUser,
          expires_at: expiresAt,
          message: 'Auto login successful (development mode)'
        }
      }
    }
    throw new Error('Auto login only available in mock mode')
  },

  // Zones相关API
  async getZones() {
    if (USE_MOCK_DATA) {
      return mockApiResponse(mockZones)
    }
    
    try {
      const response = await api.get('/user/zones')
      
      // 处理真实API响应格式
      if (response.data.success) {
        // 为每个zone添加兼容属性
        const zones = response.data.data.map((zone: any) => ({
          ...zone,
          name: zone.zone_name,
          is_active: zone.zone_status === 1,
          description: zone.zone_remarks
        }))
        return { data: zones }
      } else {
        throw new Error(response.data.message || 'Failed to get zones')
      }
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get zones')
      }
      throw error
    }
  },

  async switchZone(zoneId: number) {
    if (USE_MOCK_DATA) {
      await mockDelay(300)
      const zone = mockZones.find(z => z.id === zoneId.toString())
      if (!zone) {
        throw new Error('Zone not found')
      }
      
      // 更新用户信息中的zone_id
      const userInfoStr = LocalStorage.getItem('user_info') as string | null
      if (userInfoStr) {
        try {
          const user = JSON.parse(userInfoStr)
          user.zone_id = zoneId
          LocalStorage.set('user_info', JSON.stringify(user))
        } catch (error) {
          console.error('Failed to update zone_id in user info:', error)
        }
      }
      
      return { data: { message: 'Zone switched successfully', zone } }
    }

    try {
      // 调用真实的switch-zone API
      const result = await zoneService.switchZone(zoneId)
      
      // 更新本地存储的用户信息
      const userInfoStr = LocalStorage.getItem('user_info') as string | null
      if (userInfoStr) {
        try {
          const user = JSON.parse(userInfoStr)
          user.zone_id = zoneId
          LocalStorage.set('user_info', JSON.stringify(user))
        } catch (error) {
          console.error('Failed to update zone_id in user info:', error)
        }
      }
      
      return { data: result }
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to switch zone')
      }
      throw error
    }
  },

  // 节点相关
  async getNodes() {
    if (USE_MOCK_DATA) {
      return mockApiResponse(mockNodes)
    }
    return api.get('/nodes')
  },

  async createNode(nodeData: any) {
    if (USE_MOCK_DATA) {
      await mockDelay(800)
      const newNode = {
        ...nodeData,
        id: 'node_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { data: newNode }
    }
    return api.post('/nodes', nodeData)
  },

  async updateNode(id: string, nodeData: any) {
    if (USE_MOCK_DATA) {
      await mockDelay(600)
      return { data: { ...nodeData, id, updated_at: new Date().toISOString() } }
    }
    return api.put(`/nodes/${id}`, nodeData)
  },

  async deleteNode(id: string) {
    if (USE_MOCK_DATA) {
      await mockDelay(400)
      return { data: { message: 'Node deleted successfully' } }
    }
    return api.delete(`/nodes/${id}`)
  },

  // 路由相关
  async getRoutes() {
    if (USE_MOCK_DATA) {
      return mockApiResponse(mockRoutes)
    }
    return api.get('/routes')
  },

  async createRoute(routeData: any) {
    if (USE_MOCK_DATA) {
      await mockDelay(600)
      const newRoute = {
        ...routeData,
        id: 'route_' + Date.now(),
        created_at: new Date().toISOString()
      }
      return { data: newRoute }
    }
    return api.post('/routes', routeData)
  },

  async updateRoute(id: string, routeData: any) {
    if (USE_MOCK_DATA) {
      await mockDelay(500)
      return { data: { ...routeData, id } }
    }
    return api.put(`/routes/${id}`, routeData)
  },

  async deleteRoute(id: string) {
    if (USE_MOCK_DATA) {
      await mockDelay(400)
      return { data: { message: 'Route deleted successfully' } }
    }
    return api.delete(`/routes/${id}`)
  },

  // 仪表板相关
  async getDashboardData() {
    if (USE_MOCK_DATA) {
      return mockApiResponse(mockDashboardData)
    }
    return api.get('/dashboard')
  },

  // 语言包相关
  async getLanguagePackage(locale: string) {
    if (USE_MOCK_DATA) {
      await mockDelay(300)
      // 模拟语言包数据
      const languageData = {
        'zh-CN': {
          app: {
            name: 'MyNet',
            tagline: '高级网络管理系统'
          },
          common: {
            login: '登录',
            logout: '注销',
            dashboard: '仪表板',
            nodes: '节点',
            routes: '路由',
            settings: '设置',
            save: '保存',
            cancel: '取消',
            delete: '删除',
            edit: '编辑',
            add: '添加',
            search: '搜索',
            loading: '加载中...',
            error: '错误',
            success: '成功'
          },
          dashboard: {
            title: '仪表板',
            stats: {
              totalNodes: '总节点数',
              activeNodes: '活跃节点',
              totalRoutes: '总路由数',
              activeRoutes: '活跃路由'
            }
          },
          nodes: {
            title: '节点管理',
            name: '节点名称',
            type: '节点类型',
            status: '状态',
            ipAddress: 'IP地址',
            port: '端口'
          }
        },
        'en-US': {
          app: {
            name: 'MyNet',
            tagline: 'Advanced Network Management System'
          },
          common: {
            login: 'Login',
            logout: 'Logout',
            dashboard: 'Dashboard',
            nodes: 'Nodes',
            routes: 'Routes',
            settings: 'Settings',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            search: 'Search',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success'
          },
          dashboard: {
            title: 'Dashboard',
            stats: {
              totalNodes: 'Total Nodes',
              activeNodes: 'Active Nodes',
              totalRoutes: 'Total Routes',
              activeRoutes: 'Active Routes'
            }
          },
          nodes: {
            title: 'Node Management',
            name: 'Node Name',
            type: 'Node Type',
            status: 'Status',
            ipAddress: 'IP Address',
            port: 'Port'
          }
        }
      }
      return { data: languageData[locale as keyof typeof languageData] || languageData['en-US'] }
    }
    return api.get(`/i18n/${locale}`)
  },

  // Social API
  social: {
    // 获取社交数据概览
    async getOverview(): Promise<{ data: SocialOverview }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        return {
          data: {
            friend_count: 12,
            pending_requests: 3,
            connected_nodes: 28,
            active_routes: 15
          }
        }
      }
      const response = await api.get('/social/data')
      return response.data
    },

    // 获取好友列表
    async getFriends(params?: { page?: number; per_page?: number; search?: string }): Promise<{ data: Friend[]; meta: any }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        const mockFriends: Friend[] = [
          {
            id: '1',
            name: 'Alice Johnson',
            avatar: '/avatars/alice.jpg',
            node_count: 5,
            connected_node_count: 3,
            active_route_count: 2,
            friendship_date: '2024-01-15',
            status: 'online',
            last_active: '2024-12-01T10:30:00Z'
          },
          {
            id: '2',
            name: 'Bob Smith',
            avatar: '/avatars/bob.jpg',
            node_count: 8,
            connected_node_count: 6,
            active_route_count: 4,
            friendship_date: '2024-02-20',
            status: 'offline',
            last_active: '2024-11-30T15:45:00Z'
          },
          {
            id: '3',
            name: 'Charlie Brown',
            node_count: 3,
            connected_node_count: 2,
            active_route_count: 1,
            friendship_date: '2024-03-10',
            status: 'online',
            last_active: '2024-12-01T09:20:00Z'
          }
        ]
        return {
          data: mockFriends,
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: mockFriends.length
          }
        }
      }
      const response = await api.get('/social/friends', { params })
      return response.data
    },

    // 搜索用户
    async searchUsers(query: string): Promise<{ data: SearchUser[] }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        const mockUsers: SearchUser[] = [
          {
            id: '4',
            name: 'David Wilson',
            avatar: '/avatars/david.jpg',
            node_count: 4,
            zone_id: 'zone-1',
            zone_name: 'Development Zone',
            is_friend: false,
            has_pending_request: false,
            last_active: '2024-11-28T14:20:00Z'
          },
          {
            id: '5',
            name: 'Emma Davis',
            avatar: '/avatars/emma.jpg',
            node_count: 6,
            zone_id: 'zone-1',
            zone_name: 'Development Zone',
            is_friend: false,
            has_pending_request: true,
            last_active: '2024-11-29T11:15:00Z'
          }
        ]
        return { data: mockUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase())) }
      }
      const response = await api.post('/social/search-users', { query })
      return response.data
    },

    // 获取好友请求
    async getFriendRequests(type: 'received' | 'sent' = 'received'): Promise<{ data: FriendRequest[] }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        const mockRequests: FriendRequest[] = [
          {
            id: '1',
            requester_id: '6',
            target_id: 'current-user',
            requester_name: 'Frank Miller',
            target_name: 'Current User',
            requester_avatar: '/avatars/frank.jpg',
            status: 'pending',
            message: 'Hi, I would like to connect with you!',
            created_at: '2024-11-30T10:00:00Z',
            updated_at: '2024-11-30T10:00:00Z'
          },
          {
            id: '2',
            requester_id: '7',
            target_id: 'current-user',
            requester_name: 'Grace Lee',
            target_name: 'Current User',
            requester_avatar: '/avatars/grace.jpg',
            status: 'pending',
            message: 'Looking forward to collaborating!',
            created_at: '2024-11-29T16:30:00Z',
            updated_at: '2024-11-29T16:30:00Z'
          }
        ]
        return { data: mockRequests }
      }
      const response = await api.get(`/social/friend-requests?type=${type}`)
      return response.data
    },

    // 发送好友请求
    async sendFriendRequest(targetId: string, message?: string): Promise<BaseResponse> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        return {
          success: true,
          code: 200,
          message: 'Friend request sent successfully',
          request_id: 'req_' + Date.now(),
          timestamp: new Date().toISOString()
        }
      }
      const response = await api.post('/social/friend-request', { target_id: targetId, message })
      return response.data
    },

    // 接受好友请求
    async acceptFriendRequest(requestId: string): Promise<BaseResponse> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        return {
          success: true,
          code: 200,
          message: 'Friend request accepted',
          request_id: 'req_' + Date.now(),
          timestamp: new Date().toISOString()
        }
      }
      const response = await api.post('/social/friend-request/accept', { request_id: requestId })
      return response.data
    },

    // 拒绝好友请求
    async rejectFriendRequest(requestId: string): Promise<BaseResponse> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        return {
          success: true,
          code: 200,
          message: 'Friend request rejected',
          request_id: 'req_' + Date.now(),
          timestamp: new Date().toISOString()
        }
      }
      const response = await api.post('/social/friend-request/reject', { request_id: requestId })
      return response.data
    },

    // 删除好友
    async removeFriend(friendId: string): Promise<BaseResponse> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        return {
          success: true,
          code: 200,
          message: 'Friend removed successfully',
          request_id: 'req_' + Date.now(),
          timestamp: new Date().toISOString()
        }
      }
      const response = await api.post('/social/friend/remove', { friend_id: friendId })
      return response.data
    },

    // 获取邀请码列表
    async getInvitations(): Promise<{ data: Invitation[] }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        const mockInvitations: Invitation[] = [
          {
            id: '1',
            code: 'INV-ABC123',
            status: 'active',
            expires_at: '2024-12-15T23:59:59Z',
            created_at: '2024-11-15T10:00:00Z'
          },
          {
            id: '2',
            code: 'INV-XYZ789',
            status: 'used',
            expires_at: '2024-12-10T23:59:59Z',
            used_at: '2024-11-25T14:30:00Z',
            used_by: 'user-123',
            created_at: '2024-11-10T09:00:00Z'
          }
        ]
        return { data: mockInvitations }
      }
      const response = await api.get('/social/invitations')
      return response.data
    },

    // 生成邀请码
    async createInvitation(expiresIn?: number): Promise<{ data: Invitation }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        const newInvitation: Invitation = {
          id: 'new-' + Date.now(),
          code: 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          status: 'active',
          expires_at: new Date(Date.now() + (expiresIn || 7) * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }
        return { data: newInvitation }
      }
      const response = await api.post('/social/invitation', { expires_in: expiresIn })
      return response.data
    },

    // 获取好友的节点
    async getFriendNodes(friendId: string): Promise<{ data: Node[] }> {
      if (USE_MOCK_DATA) {
        await mockDelay()
        const mockNodes: Node[] = [
          {
            id: 1,
            node_name: 'Friend Node 1',
            node_type: 'gateway',
            ip_address: '192.168.1.100',
            port: 8080,
            status: 'active',
            zone_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        return { data: mockNodes }
      }
      const response = await api.get(`/social/friends/${friendId}/nodes`)
      return response.data
    }
  }
}