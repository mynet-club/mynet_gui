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
  }
}