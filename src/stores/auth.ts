import { defineStore } from 'pinia'
import debug from 'src/utils/debug'
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'
import { apiService } from '../services/api'
import { tokenManager } from '../utils/tokenManager'
import type { User, Tenant } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const currentTenant = ref<Tenant | null>(null)
  const availableTenants = ref<Tenant[]>([])
  const tokenExpiry = ref(0)
  
  // 修改认证状态的判断逻辑
  const isAuthenticated = computed(() => {
    const hasValidToken = !!token.value && tokenExpiry.value > Date.now()
    const hasUser = !!user.value
    debug.log('🔧 [AUTH] Authentication check:', { 
      hasValidToken, 
      hasUser, 
      token: token.value ? '***' : null, 
      user: user.value?.name,
      tokenExpiry: tokenExpiry.value,
      currentTime: Date.now(),
      tokenExpired: tokenExpiry.value <= Date.now()
    })
    return hasValidToken && hasUser
  })
  
  const isTokenExpired = computed(() => {
    return tokenExpiry.value <= Date.now()
  })
  
  const login = async (credentials: { email: string; password: string }) => {
    isLoading.value = true
    try {
      const response = await apiService.login(credentials)
      
      debug.log('🔧 [AUTH] Login response received:', response.data)
      
      token.value = response.data.auth_token
      user.value = response.data.user
      
      // 确保user_id字段正确映射
      if (user.value && !user.value.user_id && user.value.id) {
        user.value.user_id = user.value.id
        debug.log('🔧 [AUTH] Mapped id to user_id:', user.value.user_id)
      }
      
      tokenExpiry.value = response.data.expires_at
      
      debug.log('🔧 [AUTH] Token set:', token.value ? token.value.substring(0, 20) + '...' : null)
      debug.log('🔧 [AUTH] Token expiry set:', tokenExpiry.value)
      debug.log('🔧 [AUTH] Token expiry (human readable):', new Date(tokenExpiry.value).toLocaleString())
      debug.log('🔧 [AUTH] Current time:', Date.now())
      debug.log('🔧 [AUTH] Token expired check:', tokenExpiry.value <= Date.now())
      
      // tokenManager 已经在 apiService.login 中保存了 token，这里不需要再次保存
      
      // 存储用户信息
      if (user.value) {
        LocalStorage.set('user_info', JSON.stringify(user.value))
        debug.log('🔧 [AUTH] Saved user info to LocalStorage:', user.value)
        
        // 应用用户偏好设置
        if (user.value.preferences) {
          // 应用主题设置
          if (user.value.preferences.theme) {
            LocalStorage.set('user_theme', user.value.preferences.theme)
            debug.log('🔧 [AUTH] Applied user theme from server:', user.value.preferences.theme)
            
            // 立即应用主题
            try {
              const { useTheme } = await import('../composables/useTheme')
              const { setThemeMode } = useTheme()
              setThemeMode(user.value.preferences.theme as any)
              debug.log('🎨 [AUTH] Theme applied immediately:', user.value.preferences.theme)
            } catch (error) {
              debug.error('🎨 [AUTH] Failed to apply theme:', error)
            }
          }
          
          // 应用语言设置
          if (user.value.preferences.language) {
            LocalStorage.set('app-locale', user.value.preferences.language)
            debug.log('🔧 [AUTH] Applied user language from server:', user.value.preferences.language)
            
            // 立即应用语言
            try {
              const { setLocale } = await import('../boot/i18n')
              await setLocale(user.value.preferences.language as 'zh-CN' | 'en-US')
              debug.log('🌐 [AUTH] Language applied immediately:', user.value.preferences.language)
            } catch (error) {
              debug.error('🌐 [AUTH] Failed to apply language:', error)
            }
          }
          
          // 应用时区设置
          if (user.value.preferences.timezone) {
            LocalStorage.set('user_timezone', user.value.preferences.timezone)
            debug.log('🔧 [AUTH] Applied user timezone from server:', user.value.preferences.timezone)
          }
        }
      }
      
      // 初始化用户Zone
      await loadUserTenants()
      
      // 设置当前Zone
      if (user.value?.zone_id) {
        const tenant = availableTenants.value.find(z => z.zone_id === user.value?.zone_id)
        if (tenant) {
          currentTenant.value = tenant
          // 存储当前Zone
          LocalStorage.set('current_zone', JSON.stringify(tenant))
          debug.log('🔧 [AUTH] Saved current zone to LocalStorage:', tenant.zone_name)
        }
      }
      
      debug.log('🔧 [AUTH] Login completed successfully:', {
        user: user.value?.name,
        token: token.value ? '***' : null,
        isAuthenticated: isAuthenticated.value
      })
      
      return response.data
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      debug.error('Logout error:', error)
    }
    
    // 清除本地数据
    user.value = null
    token.value = null
    currentTenant.value = null
    availableTenants.value = []
    tokenExpiry.value = 0
    
    // 使用 tokenManager 清除所有 token
    tokenManager.clearTokens()
    
    // 清除其他本地存储
    LocalStorage.remove('user_info')
    LocalStorage.remove('current_zone')
    debug.log('🔧 [AUTH] Cleared all auth data')
  }
  
  const loadUserTenants = async () => {
    try {
      const response = await apiService.getTenants()
      availableTenants.value = response.data
    } catch (error) {
      debug.error('Load zones error:', error)
    }
  }
  
  const switchTenant = async (tenantId: number) => {
    debug.log('🔧 [AUTH] Switching to zone:', tenantId)
    
    // 先从可用区域列表中找到目标zone
    const targetTenant = availableTenants.value.find(z => z.zone_id === tenantId)
    if (!targetTenant) {
      throw new Error('Zone not found in available zones')
    }
    
    const response = await apiService.switchTenant(tenantId)
    
    // 更新当前区域为目标zone
    currentTenant.value = targetTenant
    debug.log('🔧 [AUTH] Updated current zone to:', targetTenant.zone_name)
    
    // 更新用户信息中的 zone_id
    if (user.value) {
      user.value.zone_id = tenantId
      debug.log('🔧 [AUTH] Updated user zone_id:', user.value.zone_id)
      
      // 持久化保存用户信息
      LocalStorage.set('user_info', JSON.stringify(user.value))
      debug.log('🔧 [AUTH] Saved user info to LocalStorage')
    }
    
    // 持久化保存当前选择的区域
    LocalStorage.set('current_zone', JSON.stringify(currentTenant.value))
    debug.log('🔧 [AUTH] Saved current zone to LocalStorage:', currentTenant.value.zone_name)
    
    debug.log('🔧 [AUTH] Zone switched successfully to:', currentTenant.value?.zone_name)
    return response.data
  }
  
  const refreshUserData = async () => {
    try {
      debug.log('🔧 [AUTH] Refreshing user data...')
      const response = await apiService.getCurrentUser()
      debug.log('🔧 [AUTH] Got user data response:', response.data)
      const oldAvatar = user.value?.avatar
      const newUserData = response.data
      
      // 确保user_id字段正确映射
      if (newUserData && !newUserData.user_id && newUserData.id) {
        newUserData.user_id = newUserData.id
        debug.log('🔧 [AUTH] Mapped id to user_id in refresh:', newUserData.user_id)
      }
      
      // 如果新数据没有avatar字段，但当前用户有avatar，则保持当前avatar
      if (!newUserData.avatar && oldAvatar) {
        debug.log('🔧 [AUTH] Backend has no avatar field, preserving current avatar')
        newUserData.avatar = oldAvatar
      }
      
      user.value = newUserData
      debug.log('🔧 [AUTH] Avatar changed from:', oldAvatar, 'to:', user.value?.avatar)
      
      // 同时更新LocalStorage
      if (user.value) {
        LocalStorage.set('user_info', JSON.stringify(user.value))
        debug.log('🔧 [AUTH] Updated user_info in LocalStorage after refresh')
        
        // 检查用户偏好设置是否与本地不同
        if (user.value.preferences) {
          // 检查主题设置
          if (user.value.preferences.theme) {
            const currentLocalTheme = LocalStorage.getItem('user_theme')
            if (currentLocalTheme !== user.value.preferences.theme) {
              debug.log('🔧 [AUTH] User theme from server differs from local:', {
                server: user.value.preferences.theme,
                local: currentLocalTheme
              })
              // 记录差异但不自动覆盖，避免用户体验突变
            }
          }
          
          // 检查语言设置
          if (user.value.preferences.language) {
            const currentLocalLanguage = LocalStorage.getItem('app-locale')
            if (currentLocalLanguage !== user.value.preferences.language) {
              debug.log('🔧 [AUTH] User language from server differs from local:', {
                server: user.value.preferences.language,
                local: currentLocalLanguage
              })
            }
          }
          
          // 检查时区设置
          if (user.value.preferences.timezone) {
            const currentLocalTimezone = LocalStorage.getItem('user_timezone')
            if (currentLocalTimezone !== user.value.preferences.timezone) {
              debug.log('🔧 [AUTH] User timezone from server differs from local:', {
                server: user.value.preferences.timezone,
                local: currentLocalTimezone
              })
            }
          }
        }
      }
    } catch (error) {
      debug.error('Refresh user data error:', error)
    }
  }
  
  const checkTokenExpiry = () => {
    if (token.value && tokenExpiry.value <= Date.now()) {
      debug.log('Token expired, will be refreshed automatically by API interceptor')
      return false
    }
    return true
  }
  
  // 初始化认证状态 - 现在由 boot/auth.ts 处理
  const initializeAuth = async () => {
    debug.log('🔧 [AUTH] Auth store initialized')
  }
  
  // 权限检查
  const hasPermission = (permission: string) => {
    return user.value?.permissions?.includes(permission) || false
  }
  
  const hasRole = (role: string) => {
    return user.value?.permissions?.includes(role) || false
  }
  
  // 设置当前zone
  const setCurrentTenant = (tenant: Tenant) => {
    currentTenant.value = tenant
    // 可以在这里添加更多的zone切换逻辑，比如更新本地存储
    LocalStorage.set('current_zone', tenant)
  }
  
  return {
    user,
    token,
    isLoading,
    currentTenant,
    availableTenants,
    tokenExpiry,
    isAuthenticated,
    isTokenExpired,
    login,
    logout,
    switchTenant,
    refreshUserData,
    checkTokenExpiry,
    initializeAuth,
    loadUserTenants,
    hasPermission,
    hasRole,
    setCurrentTenant
  }
})
