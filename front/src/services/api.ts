import axios from 'axios'
import { LocalStorage } from 'quasar'
import { tokenManager } from '../utils/tokenManager'
import { mockDashboardData, mockDelay } from './mockData'
import type { Zone } from '../types'

// 配置 API 基础URL
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
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

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加X-Zone-ID头部
    const userInfo = LocalStorage.getItem('user_info') as string | null
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo.toString())
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
      console.log('🔧 [API] 401 error received, checking token refresh status:', {
        isRefreshing,
        hasRefreshToken: !!tokenManager.getRefreshToken(),
        isTokenExpired: tokenManager.isTokenExpired()
      })
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          // 确保刷新token后也注入X-Zone-ID头部
          const userInfo = LocalStorage.getItem('user_info') as string | null
          if (userInfo) {
            try {
              const user = JSON.parse(userInfo.toString())
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
        const newToken = await tokenManager.refreshToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        // 确保刷新token后也注入X-Zone-ID头部
        const userInfo = LocalStorage.getItem('user_info') as string | null
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo.toString())
            if (user.zone_id) {
              originalRequest.headers['X-Zone-ID'] = user.zone_id
            }
          } catch (error) {
            console.warn('🔧 [API] Failed to parse user info for zone_id during token refresh:', error)
          }
        }
        return api(originalRequest)
      } catch (refreshError) {
        console.error('🔧 [API] Token refresh failed, clearing tokens:', refreshError)
        processQueue(refreshError, null)
        tokenManager.clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// 模拟API响应 - 仅用于Dashboard
const mockApiResponse = <T>(data: T, delay = 500) => {
  return new Promise<{ data: T }>((resolve) => {
    setTimeout(() => {
      resolve({ data })
    }, delay)
  })
}

// API服务
export const apiService = {
  // 请求时检查Token状态
  async requestWithTokenCheck(requestFn: () => Promise<any>) {
    if (tokenManager.isTokenRefreshing()) {
      return new Promise((resolve, reject) => {
        tokenManager.addToRequestQueue(() => requestFn().then(resolve).catch(reject));
      });
    }

    return requestFn();
  },

  // 认证相关
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials);

      console.log('🔧 [API] Raw login response:', response.data);

      if (response.data.success) {
        const tokenData = {
          auth_token: response.data.data.auth_token,
          refresh_token: response.data.data.refresh_token,
          auth_token_expires_in: Date.now() + (response.data.data.auth_token_expires_in * 1000),
          refresh_token_expires_in: Date.now() + (response.data.data.refresh_token_expires_in * 1000)
        };
        tokenManager.saveTokenData(tokenData);

        return {
          data: {
            auth_token: response.data.data.auth_token,
            refresh_token: response.data.data.refresh_token,
            user: response.data.data.user,
            expires_at: tokenData.auth_token_expires_in,
            refresh_token_expires_in: tokenData.refresh_token_expires_in
          }
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('🔧 [API] Login error:', error);
      throw new Error(error.message || '登录请求失败');
    }
  },

  async logout() {
    return api.post('/auth/logout')
  },

  // Token 刷新
  async refreshToken(refreshToken: string) {
    try {
      const response = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
      const { auth_token, refresh_token, auth_token_expires_in, refresh_token_expires_in } = response.data;

      // 更新Token管理器中的Token数据
      tokenManager.saveTokenData({
        auth_token,
        refresh_token,
        auth_token_expires_in,
        refresh_token_expires_in
      });

      return { success: true };
    } catch (error) {
      console.error('🔧 [API] Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  },

  async getCurrentUser() {
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

  // Zones相关API
  async getZones() {
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
    try {
      // 调用真实的switch-zone API
      const response = await api.post('/user/switch-zone', { zone_id: zoneId })
      const result = response.data.data
      
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
    return api.get('/nodes')
  },

  async createNode(nodeData: any) {
    return api.post('/nodes', nodeData)
  },

  async updateNode(id: string, nodeData: any) {
    return api.put(`/nodes/${id}`, nodeData)
  },

  async deleteNode(id: string) {
    return api.delete(`/nodes/${id}`)
  },

  // 路由相关
  async getRoutes() {
    return api.get('/routes')
  },

  async createRoute(routeData: any) {
    return api.post('/routes', routeData)
  },

  async updateRoute(id: string, routeData: any) {
    return api.put(`/routes/${id}`, routeData)
  },

  async deleteRoute(id: string) {
    return api.delete(`/routes/${id}`)
  },

  // 仪表板相关 - 强制使用模拟数据
  async getDashboardData() {
    // Dashboard 暂时使用模拟数据
    return mockApiResponse(mockDashboardData)
  },

  // 语言包相关
  async getLanguagePackage(locale: string) {
    return api.get(`/i18n/${locale}`)
  },

  // 注册相关
  async register(data: { name: string; email: string; password: string; invitation?: string }) {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('🔧 [API] Register error:', error);
      throw new Error(error.message || '注册请求失败');
    }
  },
}