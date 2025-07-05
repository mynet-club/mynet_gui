import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'
import { apiService } from '../services/api'
import type { User, Zone } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const currentZone = ref<Zone | null>(null)
  const availableZones = ref<Zone[]>([])
  const tokenExpiry = ref(0)
  
  // 修改认证状态的判断逻辑
  const isAuthenticated = computed(() => {
    const hasValidToken = !!token.value && !isTokenExpired.value
    const hasUser = !!user.value
    console.log('🔧 [AUTH] Authentication check:', { hasValidToken, hasUser, token: token.value ? '***' : null, user: user.value?.name })
    return hasValidToken && hasUser
  })
  
  const isTokenExpired = computed(() => {
    const isExpired = Date.now() > tokenExpiry.value
    console.log('🔧 [AUTH] Token expiry check:', { 
      currentTime: new Date().toISOString(),
      expiryTime: new Date(tokenExpiry.value).toISOString(),
      isExpired 
    })
    return isExpired
  })
  
  const login = async (credentials: { email: string; password: string }) => {
    isLoading.value = true
    try {
      const response = await apiService.login(credentials)
      
      console.log('🔧 [AUTH] Login response received:', response.data)
      
      token.value = response.data.access_token
      user.value = response.data.user
      tokenExpiry.value = response.data.expires_at
      
      console.log('🔧 [AUTH] Token set:', token.value ? token.value.substring(0, 20) + '...' : null)
      console.log('🔧 [AUTH] Token expiry set:', tokenExpiry.value)
      console.log('🔧 [AUTH] Token expiry (human readable):', new Date(tokenExpiry.value).toLocaleString())
      console.log('🔧 [AUTH] Current time:', Date.now())
      console.log('🔧 [AUTH] Time until expiry (minutes):', Math.round((tokenExpiry.value - Date.now()) / 60000))
      
      // 存储token和过期时间
      LocalStorage.set('auth_token', token.value)
      LocalStorage.set('token_expiry', tokenExpiry.value.toString())
      
      console.log('🔧 [AUTH] Stored to localStorage - token_expiry:', tokenExpiry.value.toString())
      
      // 验证localStorage存储
      const storedExpiry = LocalStorage.getItem('token_expiry')
      console.log('🔧 [AUTH] Verified localStorage token_expiry:', storedExpiry)
      
      // 存储用户信息
      if (user.value) {
        LocalStorage.set('user_info', JSON.stringify(user.value))
        console.log('🔧 [AUTH] Saved user info to LocalStorage:', user.value)
      }
      
      // 初始化用户Zone
      await loadUserZones()
      
      // 设置当前Zone
      if (user.value?.zone_id) {
        const zone = availableZones.value.find(z => z.zone_id === user.value?.zone_id)
        if (zone) {
          currentZone.value = zone
          // 存储当前Zone
          LocalStorage.set('current_zone', JSON.stringify(zone))
          console.log('🔧 [AUTH] Saved current zone to LocalStorage:', zone.zone_name)
        }
      }
      
      return response.data
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // 清除本地数据
    user.value = null
    token.value = null
    currentZone.value = null
    availableZones.value = []
    tokenExpiry.value = 0
    
    // 清除本地存储
    LocalStorage.remove('auth_token')
    LocalStorage.remove('token_expiry')
    LocalStorage.remove('user_info')
    LocalStorage.remove('current_zone')
    console.log('🔧 [AUTH] Cleared all auth data')
  }
  
  const loadUserZones = async () => {
    try {
      const response = await apiService.getZones()
      availableZones.value = response.data
    } catch (error) {
      console.error('Load zones error:', error)
    }
  }
  
  const switchZone = async (zoneId: number) => {
    console.log('🔧 [AUTH] Switching to zone:', zoneId)
    
    // 先从可用区域列表中找到目标zone
    const targetZone = availableZones.value.find(z => z.zone_id === zoneId)
    if (!targetZone) {
      throw new Error('Zone not found in available zones')
    }
    
    const response = await apiService.switchZone(zoneId)
    
    // 更新当前区域为目标zone
    currentZone.value = targetZone
    console.log('🔧 [AUTH] Updated current zone to:', targetZone.zone_name)
    
    // 更新用户信息中的 zone_id
    if (user.value) {
      user.value.zone_id = zoneId
      console.log('🔧 [AUTH] Updated user zone_id:', user.value.zone_id)
      
      // 持久化保存用户信息
      LocalStorage.set('user_info', JSON.stringify(user.value))
      console.log('🔧 [AUTH] Saved user info to LocalStorage')
    }
    
    // 持久化保存当前选择的区域
    LocalStorage.set('current_zone', JSON.stringify(currentZone.value))
    console.log('🔧 [AUTH] Saved current zone to LocalStorage:', currentZone.value.zone_name)
    
    console.log('🔧 [AUTH] Zone switched successfully to:', currentZone.value?.zone_name)
    return response.data
  }
  
  const refreshUserData = async () => {
    try {
      const response = await apiService.getCurrentUser()
      user.value = response.data
    } catch (error) {
      console.error('Refresh user data error:', error)
    }
  }
  
  const checkTokenExpiry = () => {
    if (token.value && isTokenExpired.value) {
      console.log('Token expired, refreshing...')
      // Token会在API拦截器中自动刷新
      return false
    }
    return true
  }
  
  // 初始化认证状态 - 现在由 boot/auth.ts 处理
  const initializeAuth = async () => {
    console.log('🔧 [AUTH] Auth store initialized')
  }
  
  // 权限检查
  const hasPermission = (permission: string) => {
    return user.value?.permissions?.includes(permission) || false
  }
  
  const hasRole = (role: string) => {
    return user.value?.permissions?.includes(role) || false
  }
  
  return {
    user,
    token,
    isLoading,
    currentZone,
    availableZones,
    tokenExpiry,
    isAuthenticated,
    isTokenExpired,
    login,
    logout,
    switchZone,
    refreshUserData,
    checkTokenExpiry,
    initializeAuth,
    loadUserZones,
    hasPermission,
    hasRole
  }
})