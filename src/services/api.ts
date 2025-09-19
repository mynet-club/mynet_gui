import axios from 'axios'
import debug from "src/utils/debug"
import { LocalStorage } from 'quasar'
import { tokenManager } from '../utils/tokenManager'
import { mockDashboardData, mockDelay } from './mockData'
import type { Zone } from '../types'

// 获取当前语言
const getCurrentLanguage = () => {
  return LocalStorage.getItem('app-locale') || 'en-US'
}

// 配置 API 基础URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  const baseUrl = envUrl || 'http://localhost:8000'
  return `${baseUrl}/api/v1`
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
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
          debug.log('🔧 [API] Injected X-Zone-ID header:', user.zone_id)
        }
      } catch (error) {
        debug.warn('🔧 [API] Failed to parse user info for zone_id:', error)
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

    // 排除登录、注册等不需要token刷新的请求
    const excludePaths = ['/auth/login', '/auth/register', '/auth/refresh-token']
    const shouldExclude = excludePaths.some(path => originalRequest.url?.includes(path))

    if (error.response?.status === 401 && !originalRequest._retry && !shouldExclude) {
      debug.log('🔧 [API] 401 error received, checking token refresh status:', {
        isRefreshing,
        hasRefreshToken: !!tokenManager.getRefreshToken(),
        isTokenExpired: tokenManager.isTokenExpired(),
        url: originalRequest.url
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
              debug.warn('🔧 [API] Failed to parse user info for zone_id during token refresh:', error)
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
            debug.warn('🔧 [API] Failed to parse user info for zone_id during token refresh:', error)
          }
        }
        return api(originalRequest)
      } catch (refreshError) {
        debug.error('🔧 [API] Token refresh failed, clearing tokens:', refreshError)
        processQueue(refreshError, null)
        tokenManager.clearTokens()
        // 移除自动跳转，让组件或页面处理登录失败
        // window.location.href = '/login'
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
  async login(credentials: { email: string; password: string; device_name?: string }) {
    try {
      const loginData = {
        ...credentials,
        device_name: credentials.device_name || 'Web Browser'
      };
      
      const response = await api.post('/auth/login', loginData);

      debug.log('🔧 [API] Raw login response:', response.data);

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
        // 保留原始响应数据，创建一个带有响应数据的错误
        const error = new Error(response.data.message || 'Login failed') as any;
        error.response = { data: response.data, status: response.status };
        throw error;
      }
    } catch (error: any) {
      debug.error('🔧 [API] Login error:', error);
      // 如果是axios错误或已经包含响应数据的错误，直接抛出
      if (error.response) {
        throw error;
      }
      // 其他错误，保持原来的处理方式
      throw new Error(error.message || '登录请求失败');
    }
  },

  async logout() {
    return api.post('/auth/logout')
  },

  async verifyToken() {
    return api.get('/auth/verify-token')
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    invitation: string;
    device_name?: string;
    activation_url?: string;
  }) {
    const registerData = {
      ...data,
      device_name: data.device_name || 'Web Browser',
      activation_url: data.activation_url || `${window.location.origin}/auth/activate`
    };
    const lang = getCurrentLanguage();
    return await api.post(`/auth/register?lang=${lang}`, registerData);
  },

  // 密码重置相关
  async forgotPassword(data: { email: string; redirect_url?: string }) {
    const requestData = {
      ...data,
      redirect_url: data.redirect_url || `${window.location.origin}/auth/reset-password`
    };
    const lang = getCurrentLanguage();
    return await api.post(`/auth/forgot-password?lang=${lang}`, requestData);
  },

  async resetPassword(data: {
    email: string;
    token?: string;
    code?: string;
    password: string;
    password_confirmation: string;
  }) {
    return await api.post('/auth/reset-password', data);
  },

  async validateResetToken(data: { email: string; token?: string; code?: string }) {
    return await api.post('/auth/validate-reset-token', data);
  },

  async cancelPasswordReset(email: string) {
    return await api.delete('/auth/cancel-password-reset', { data: { email } });
  },

  // 修改密码
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    return await api.post('/auth/change-password', data);
  },

  // 账号激活相关
  async activateAccount(data: { 
    email?: string; 
    user_id?: string; 
    token?: string; 
    code?: string; 
  }) {
    const lang = getCurrentLanguage();
    return await api.post(`/auth/activate-account?lang=${lang}`, data);
  },

  async resendActivationEmail(data: { email: string; activation_url?: string }) {
    const requestData = {
      ...data,
      activation_url: data.activation_url || `${window.location.origin}/auth/activate`
    };
    const lang = getCurrentLanguage();
    return await api.post(`/auth/resend-activation-email?lang=${lang}`, requestData);
  },

  async checkActivationStatus(email: string) {
    return await api.get('/auth/check-activation-status', { params: { email } });
  },

  // 会话和令牌管理
  async validateSession(data: {
    user_id: string;
    token_hash: string;
    last_sync: number;
    client_version: string;
    timestamp: number;
  }) {
    return await api.post('/auth/validate-session', data);
  },

  async generateToken() {
    return await api.post('/auth/token/generate');
  },

  async getAuthStatus() {
    return await api.get('/auth/status');
  },

  // 向后兼容的方法
  async verifyEmail(data: { email: string; token: string }) {
    return await this.activateAccount(data);
  },

  async resendVerificationCode(email: string) {
    return await this.resendActivationEmail({ email });
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
      debug.error('🔧 [API] Token refresh error:', error);
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

  // 更新用户资料
  async updateUserProfile(data: {
    name?: string;
    phone?: string;
    signature?: string;
  }) {
    try {
      const response = await api.put('/users/profile', data);
      
      if (response.data.success) {
        return { data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to update profile');
      }
      throw error;
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
          debug.error('Failed to update zone_id in user info:', error)
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

  // 头像相关
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return api.post('/assets/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  async getAvatar(userId?: string) {
    const url = userId ? `/assets/avatar/${userId}` : '/assets/avatar'
    return api.get(url, {
      responseType: 'blob'
    })
  },
}
