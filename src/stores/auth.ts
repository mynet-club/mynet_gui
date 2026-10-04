import { defineStore } from 'pinia'
import debug from 'src/utils/debug'
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'
import { apiService } from '../services/api'
import { tenantService } from '../services/tenant/tenantService'
import { tokenManager } from '../utils/tokenManager'
import { TENANT_SELECTION_KEY, LEGACY_TENANT_SELECTION_KEY } from '../config/app'
import type { User, Tenant } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const currentTenant = ref<Tenant | null>(null)
  const availableTenants = ref<Tenant[]>([])
  const tokenExpiry = ref(0)

  // 当前网络区选择的本地持久化：键名常量在 config/app.ts（单点），
  // 这里只负责读旧键 `current_zone`（存的是整个对象）并迁移成新键（只存 tenant_id）。
  const readSavedTenantId = (): number | null => {
    const saved = LocalStorage.getItem(TENANT_SELECTION_KEY)
    if (saved !== null && saved !== undefined && saved !== '') return Number(saved)

    const legacy = LocalStorage.getItem(LEGACY_TENANT_SELECTION_KEY)
    if (legacy === null || legacy === undefined || legacy === '') return null

    try {
      // 旧值有两种写法：JSON 串（多数写入点）与对象本体（原 setCurrentTenant）
      const parsed = typeof legacy === 'string' ? JSON.parse(legacy) : legacy
      const legacyId = parsed?.tenant_id ?? parsed?.zone_id
      if (legacyId) {
        LocalStorage.set(TENANT_SELECTION_KEY, Number(legacyId))
        debug.log('🔧 [AUTH] Migrated saved tenant selection from `current_zone`:', legacyId)
      }
      return legacyId ? Number(legacyId) : null
    } catch (error) {
      debug.warn('🔧 [AUTH] Unparseable legacy tenant selection:', error)
      return null
    }
  }

  const persistTenantId = (tenantId: number) => {
    LocalStorage.set(TENANT_SELECTION_KEY, tenantId)
    LocalStorage.remove(LEGACY_TENANT_SELECTION_KEY)
  }
  
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
      
      // 网络区上下文：拉归属列表 + 定当前选中。失败不阻断登录——
      // 认证是硬条件，网络区只是请求上下文（此前列表接口一挂就把登录一起带崩）。
      try {
        await restoreCurrentTenant()
      } catch (tenantError) {
        debug.warn('🔧 [AUTH] Tenant context unavailable after login:', tenantError)
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
    LocalStorage.remove(TENANT_SELECTION_KEY)
    LocalStorage.remove(LEGACY_TENANT_SELECTION_KEY)
    debug.log('🔧 [AUTH] Cleared all auth data')
  }
  
  const loadUserTenants = async () => {
    availableTenants.value = await tenantService.getUserTenants()
  }

  /**
   * 登录后确定「当前网络区」：本地已选 > 后端记的 user.tenant_id > 归属列表第一个。
   * 找不到就把 currentTenant 置空并说清楚，不要再伪装成「有一个叫 Global 的网络区」
   * ——那会让 X-Tenant-ID 指向一个用户并不归属的租户。
   */
  const restoreCurrentTenant = async () => {
    if (availableTenants.value.length === 0) {
      await loadUserTenants()
    }

    const savedId = readSavedTenantId()
    const fallbackId = user.value?.tenant_id
    const target =
      availableTenants.value.find(z => z.tenant_id === savedId) ??
      availableTenants.value.find(z => z.tenant_id === fallbackId) ??
      availableTenants.value[0] ??
      null

    currentTenant.value = target
    if (target) {
      persistTenantId(target.tenant_id)
      debug.log('🔧 [AUTH] Current tenant:', `${target.name} (${target.tenant_id})`)
    } else {
      debug.warn('🔧 [AUTH] No tenant available for this user; 网络区相关功能将提示无归属')
    }
    return target
  }

  const switchTenant = async (tenantId: number) => {
    debug.log('🔧 [AUTH] Switching to tenant:', tenantId)
    
    // 先从可用网络区列表中找到目标（列表本身就是后端按成员关系算出来的）
    const targetTenant = availableTenants.value.find(z => z.tenant_id === tenantId)
    if (!targetTenant) {
      throw new Error('Tenant not found in available tenants')
    }
    
    const result = await tenantService.switchTenant(tenantId)
    if (result?.tenant_id !== tenantId) {
      // 服务端确认的落点与请求不一致时不能继续往下改本地状态，
      // 否则界面在一个网络区、请求头在另一个，且没有任何报错线索。
      throw new Error(`服务端确认的网络区与请求不一致：${JSON.stringify(result)}`)
    }

    // 后端确认成功后才改本地状态，顺序不能反：先改本地，请求失败就留下
    // 「界面在 A 网络区、请求还打 B 网络区」的分裂态。
    currentTenant.value = targetTenant
    debug.log('🔧 [AUTH] Updated current tenant to:', targetTenant.name)

    // 更新用户信息中的 tenant_id（X-Tenant-ID 的三个注入点都读它）
    if (user.value) {
      user.value.tenant_id = tenantId
      debug.log('🔧 [AUTH] Updated user tenant_id:', user.value.tenant_id)

      // 拦截器读的是本地存储里的 user_info，不是这个 ref，必须一起落盘
      LocalStorage.set('user_info', JSON.stringify(user.value))
      debug.log('🔧 [AUTH] Saved user info to LocalStorage')
    } else {
      debug.warn('🔧 [AUTH] No in-memory user; X-Tenant-ID 会继续用本地存储里的旧值')
    }
    
    // 持久化保存当前选择的网络区
    persistTenantId(tenantId)
    debug.log('🔧 [AUTH] Tenant switched successfully to:', targetTenant.name)
    return targetTenant
  }
  
  /**
   * 凭邀请码加入另一个网络区，并把「当前网络区」切过去。
   *
   * 顺序与 `switchTenant` 同理：**先拿服务端确认，再动本地状态**。加入成功后
   * 后端做了两件事——成员关系置活跃、`users.tenant_id` 指向新区；本地必须同时
   * 跟上这三处（内存 user、LocalStorage 的 user_info、选区记录），否则界面还在
   * 旧区而 `X-Tenant-ID` 已是新区，节点列表会莫名其妙空掉。
   *
   * 归属列表要**强制重取**：新加入的区此刻才出现，用缓存的旧列表找不到它。
   */
  const joinTenant = async (code: string) => {
    debug.log('🔧 [AUTH] Joining tenant by invite code')

    const result = await tenantService.joinTenant(code)
    const tenantId = Number(result?.tenant_id)
    if (!Number.isFinite(tenantId) || tenantId <= 0) {
      throw new Error(`服务端确认的网络区异常：${JSON.stringify(result)}`)
    }

    await loadUserTenants()

    const targetTenant = availableTenants.value.find(z => Number(z.tenant_id) === tenantId)
    if (!targetTenant) {
      // 后端说进来了、归属列表却查不到 = 成员关系没真写上。
      // 不兜一个假对象继续跑：那会让界面显示「已加入」而请求全打在进不去的区上。
      throw new Error(`加入后归属列表里没有网络区 ${tenantId}（${result.name}）`)
    }

    currentTenant.value = targetTenant

    if (user.value) {
      user.value.tenant_id = tenantId
      LocalStorage.set('user_info', JSON.stringify(user.value))
    } else {
      debug.warn('🔧 [AUTH] No in-memory user; X-Tenant-ID 会继续用本地存储里的旧值')
    }

    persistTenantId(tenantId)
    debug.log('🔧 [AUTH] Joined tenant:', targetTenant.name)
    return targetTenant
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
  
  // 权限检查：曾有 hasPermission() / hasRole() 两个 helper，读 user.permissions。
  // 2026-10-05 裁定 B3 起删除 —— 用户面只有「自己 + 本租户作用域」这一种权限语义
  // （权限矩阵 R2），后端用户面响应里从来没有 permissions 这一列（tenant_admin 闸门
  // 只挂在 console 面的 tenant.permission:tenant_admin），且两处零调用点。
  // 留着就是「假门椒」：看着能挡，实际恒 false，误用时表现为「功能莫名不见了」。

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
    joinTenant,
    refreshUserData,
    checkTokenExpiry,
    initializeAuth,
    loadUserTenants,
    restoreCurrentTenant
  }
})
