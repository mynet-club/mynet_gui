import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'
import { apiService } from '../services/api'
import { tokenManager } from '../utils/tokenManager'
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
    const hasValidToken = !!token.value && tokenExpiry.value > Date.now()
    const hasUser = !!user.value
    console.log('🔧 [AUTH] Authentication check:', { 
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
      
      console.log('🔧 [AUTH] Login response received:', response.data)
      
      token.value = response.data.auth_token
      user.value = response.data.user
      
      // 确保user_id字段正确映射
      if (user.value && !user.value.user_id && user.value.id) {
        user.value.user_id = user.value.id
        console.log('🔧 [AUTH] Mapped id to user_id:', user.value.user_id)
      }
      
      tokenExpiry.value = response.data.expires_at
      
      console.log('🔧 [AUTH] Token set:', token.value ? token.value.substring(0, 20) + '...' : null)
      console.log('🔧 [AUTH] Token expiry set:', tokenExpiry.value)
      console.log('🔧 [AUTH] Token expiry (human readable):', new Date(tokenExpiry.value).toLocaleString())
      console.log('🔧 [AUTH] Current time:', Date.now())
      console.log('🔧 [AUTH] Token expired check:', tokenExpiry.value <= Date.now())
      
      // tokenManager 已经在 apiService.login 中保存了 token，这里不需要再次保存
      
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
      
      console.log('🔧 [AUTH] Login completed successfully:', {
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
      console.error('Logout error:', error)
    }
    
    // 清除本地数据
    user.value = null
    token.value = null
    currentZone.value = null
    availableZones.value = []
    tokenExpiry.value = 0
    
    // 使用 tokenManager 清除所有 token
    tokenManager.clearTokens()
    
    // 清除其他本地存储
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
      console.log('🔧 [AUTH] Refreshing user data...')
      const response = await apiService.getCurrentUser()
      console.log('🔧 [AUTH] Got user data response:', response.data)
      const oldAvatar = user.value?.avatar
      const newUserData = response.data
      
      // 确保user_id字段正确映射
      if (newUserData && !newUserData.user_id && newUserData.id) {
        newUserData.user_id = newUserData.id
        console.log('🔧 [AUTH] Mapped id to user_id in refresh:', newUserData.user_id)
      }
      
      // 如果新数据没有avatar字段，但当前用户有avatar，则保持当前avatar
      if (!newUserData.avatar && oldAvatar) {
        console.log('🔧 [AUTH] Backend has no avatar field, preserving current avatar')
        newUserData.avatar = oldAvatar
      }
      
      user.value = newUserData
      console.log('🔧 [AUTH] Avatar changed from:', oldAvatar, 'to:', user.value?.avatar)
      
      // 同时更新LocalStorage
      if (user.value) {
        LocalStorage.set('user_info', JSON.stringify(user.value))
        console.log('🔧 [AUTH] Updated user_info in LocalStorage after refresh')
      }
    } catch (error) {
      console.error('Refresh user data error:', error)
    }
  }
  
  const checkTokenExpiry = () => {
    if (token.value && tokenExpiry.value <= Date.now()) {
      console.log('Token expired, will be refreshed automatically by API interceptor')
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
  
  // 设置当前zone
  const setCurrentZone = (zone: Zone) => {
    currentZone.value = zone
    // 可以在这里添加更多的zone切换逻辑，比如更新本地存储
    LocalStorage.set('current_zone', zone)
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
    hasRole,
    setCurrentZone
  }
})