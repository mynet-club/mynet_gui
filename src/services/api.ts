import axios from 'axios'
import debug from 'src/utils/debug'
import { LocalStorage } from 'quasar'
import { tokenManager } from '../utils/tokenManager'
import { mockDashboardData, mockDelay } from './mockData'

// 获取当前语言
const getCurrentLanguage = () => {
  return LocalStorage.getItem('app-locale') || 'en-US'
}

// 配置 API 基础URL - 使用框架约定的 v1 版本
// 同源相对路径：浏览器永远不接触后端 API 部署地址（2026-10-12 裁定：不暴露）。
// dev 要打本机后端时由 .env.dev 显式给 VITE_API_BASE_URL，代码里不留直连兜底。
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  return envUrl ? `${envUrl}/api/v1` : '/api/v1'
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

    // 添加X-Tenant-ID头部
    const userInfo = LocalStorage.getItem('user_info') as string | null
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo.toString())
        if (user.tenant_id) {
          config.headers['X-Tenant-ID'] = user.tenant_id
          debug.log('🔧 [API] Injected X-Tenant-ID header:', user.tenant_id)
        }
      } catch (error) {
        debug.warn('🔧 [API] Failed to parse user info for tenant_id:', error)
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

    // 处理 410 Gone - 普通用户申请公开服务功能已下线
    if (error.response?.status === 410) {
      debug.warn('🔧 [API] 410 Gone - 普通用户不可发布公共服务:', originalRequest.url)
      // 在错误对象中添加友好提示信息
      error.friendlyMessage = '普通用户不能发布公共服务。公共服务仅限系统提供，已连接设备会自动共享服务。'
      return Promise.reject(error)
    }

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
          // 确保刷新token后也注入X-Tenant-ID头部
          const userInfo = LocalStorage.getItem('user_info') as string | null
          if (userInfo) {
            try {
              const user = JSON.parse(userInfo.toString())
              if (user.tenant_id) {
                originalRequest.headers['X-Tenant-ID'] = user.tenant_id
              }
            } catch (error) {
              debug.warn('🔧 [API] Failed to parse user info for tenant_id during token refresh:', error)
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
        // 确保刷新token后也注入X-Tenant-ID头部
        const userInfo = LocalStorage.getItem('user_info') as string | null
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo.toString())
            if (user.tenant_id) {
              originalRequest.headers['X-Tenant-ID'] = user.tenant_id
            }
          } catch (error) {
            debug.warn('🔧 [API] Failed to parse user info for tenant_id during token refresh:', error)
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

        // 把登录响应里的当前网络区指针合并进 user（后端 user 对象本身不含它）
        const user = response.data.data.user;
        if (user && response.data.data.tenant_id) {
          user.tenant_id = response.data.data.tenant_id;
          debug.log('🔧 [API] Mapped tenant_id to user.tenant_id:', user.tenant_id);
        }

        return {
          data: {
            auth_token: response.data.data.auth_token,
            refresh_token: response.data.data.refresh_token,
            user: user,
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

  /**
   * 注册。字段名跟随框架 `UserAuthController::register` 的验证规则：
   * `invite_code`（不是 back 旧实现的 `invitation`）、`password` 必须带
   * `confirmed` 对偶字段 `password_confirmation`，否则验证期就 422。
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    invite_code: string;
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

  // 更新用户资料（包含偏好设置）
  async updateUserProfile(data: {
    name?: string;
    phone?: string;
    signature?: string;
    theme?: string;      // 会被转换为 preferences.theme
    language?: string;   // 会被转换为 preferences.language
    timezone?: string;   // 会被转换为 preferences.timezone
    preferences?: {      // 也可以直接传递 preferences 对象
      theme?: string;
      language?: string;
      timezone?: string;
    };
  }) {
    try {
      // 如果传入了单独的 theme/language/timezone，转换为 preferences 结构
      const requestData: any = {
        name: data.name,
        phone: data.phone,
        signature: data.signature
      };

      // 构建 preferences 对象
      if (data.theme || data.language || data.timezone || data.preferences) {
        requestData.preferences = {
          ...data.preferences,
          ...(data.theme && { theme: data.theme }),
          ...(data.language && { language: data.language }),
          ...(data.timezone && { timezone: data.timezone })
        };
      }

      const response = await api.put('/users/profile', requestData);

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

  // 网络区（Tenant）相关的取数在 services/tenant/tenantService.ts，状态在 stores/auth.ts。
  // 这里不再重复挂一份 getTenants/switchTenant——两条路径各映射各的字段名，
  // 正是 TenantListPage 曾经静默空渲染的成因（2026-10-04 第 2 步契约翻转时合并）。

  // 节点相关
  async getNodes() {
    return api.get('/nodes')
  },

  async createNode(nodeData: any) {
    return api.post('/nodes/create', nodeData)
  },

  async updateNode(id: string, nodeData: any) {
    return api.put(`/nodes/${id}`, nodeData)
  },

  async deleteNode(id: string) {
    return api.delete(`/nodes/${id}`)
  },

  // 仪表板相关 - 强制使用模拟数据
  async getDashboardData() {
    // Dashboard 暂时使用模拟数据
    return mockApiResponse(mockDashboardData)
  },

  // 头像相关 (使用框架 Storage 模块 entity 接口)
  async uploadAvatar(file: File, userId: string) {
    const formData = new FormData()
    formData.append('file', file)

    return api.post(`/files/entity/avatar/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  async getAvatarUrl(userId?: string) {
    const url = userId ? `/files/entity/avatar/${userId}/url` : '/files/entity/avatar/me/url'
    return api.get(url)
  },
}
