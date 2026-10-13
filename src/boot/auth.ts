import { setupRouteGuards } from '../router/middleware'
import { boot } from 'quasar/wrappers'
import debug from '../utils/debug'
import { LocalStorage } from 'quasar'
import { tokenManager } from '../utils/tokenManager'
import { TENANT_SELECTION_KEY, LEGACY_TENANT_SELECTION_KEY } from '../config/app'

// 立即执行的日志，确认文件被加载
debug.log('🔐 [Boot] Auth module loaded and executing...')

export default boot(async ({ router }) => {
  debug.log('🔐 [Boot] Auth boot starting...')

  debug.log('🔐 [Boot] About to import useAuthStore...')

  let authStore: any

  try {
    const { useAuthStore } = await import('../stores/auth')
    debug.log('🔐 [Boot] useAuthStore imported successfully')

    // 现在 Pinia 已经在 pinia.ts boot 文件中初始化了
    authStore = useAuthStore()
    debug.log('🔐 [Boot] Auth store initialized successfully')
  } catch (error) {
    debug.error('🔐 [Boot] Failed to initialize auth store:', error)
    throw error
  }

  // 检查本地存储的认证信息
  const token = tokenManager.getAccessToken()
  const userInfo = LocalStorage.getItem('user_info') as string | null
  const tokenExpiry = tokenManager.getTokenExpiry()

  debug.log('🔐 [Boot] Checking localStorage auth state:', {
    hasToken: !!token,
    hasUserInfo: !!userInfo,
    tokenExpiry: tokenExpiry,
    tokenExpiryDate: tokenExpiry ? new Date(tokenExpiry).toLocaleString() : null,
    currentTime: Date.now(),
    currentTimeDate: new Date().toLocaleString(),
    isTokenExpired: tokenManager.isTokenExpired(),
    token: token ? token.substring(0, 20) + '...' : null,
    userInfo: userInfo ? JSON.parse(userInfo.toString()) : null
  })

  // 检查token是否过期
  if (token && tokenManager.isTokenExpired()) {
    debug.log('🔐 [Boot] Token expired, clearing all auth data')
    // Token过期，清除所有认证数据
    tokenManager.clearTokens()
    LocalStorage.remove('user_info')
    LocalStorage.remove(TENANT_SELECTION_KEY)
    LocalStorage.remove(LEGACY_TENANT_SELECTION_KEY)
    debug.log('🔐 [Boot] Expired auth data cleared')
  } else if (token && userInfo) {
    debug.log('🔐 [Boot] Valid token found, restoring auth state...')

    try {
      // 从本地存储恢复用户数据
      const user = JSON.parse(userInfo.toString())
      debug.log('🔐 [Boot] Parsed user info:', user)

      // 确保user_id字段正确映射
      if (user && !user.user_id && user.id) {
        user.user_id = user.id
        debug.log('🔐 [Boot] Mapped id to user_id:', user.user_id)
        // 更新LocalStorage
        LocalStorage.set('user_info', JSON.stringify(user))
      }

      // 检查和修复头像URL
      if (user.avatar && user.avatar.startsWith('blob:')) {
        debug.log('🔐 [Boot] Blob avatar URL detected, clearing invalid blob reference')
        user.avatar = undefined
        // 更新LocalStorage
        LocalStorage.set('user_info', JSON.stringify(user))
      }

      // 设置认证状态
      authStore.user = user
      authStore.token = token

      // 恢复 token 过期时间（从 tokenManager 获取）
      authStore.tokenExpiry = tokenExpiry
      debug.log('🔐 [Boot] Token expiry restored:', {
        tokenExpiry: authStore.tokenExpiry,
        expiryDate: new Date(authStore.tokenExpiry).toLocaleString(),
        isExpired: tokenManager.isTokenExpired()
      })

      debug.log('🔐 [Boot] Auth state restored:', {
        user: authStore.user?.name,
        token: authStore.token ? '***' : null,
        tokenExpiry: authStore.tokenExpiry,
        isAuthenticated: authStore.isAuthenticated
      })

      // 恢复 token 刷新计时器
      tokenManager.restoreTokenRefreshTimer()
      debug.log('🔐 [Boot] Token refresh timer restored')

      debug.log('🔐 [Boot] Auto-login successful, restored user:', user.name)

    } catch (error) {
      debug.error('🔐 [Boot] Auto-login failed, clearing invalid credentials:', error)
      // 只有在严重错误时才清除认证信息
      try {
        await authStore.logout()
      } catch (logoutError) {
        debug.error('🔐 [Boot] Error during logout:', logoutError)
      }
    }

    // 单独处理网络区加载，不影响认证状态
    if (authStore.isAuthenticated) {
      debug.log('🔐 [Boot] Loading user tenants...')

      // 加载失败不要清除认证状态——网络区是可选上下文，认证才是硬条件
      try {
        const tenant = await authStore.restoreCurrentTenant()
        debug.log('🔐 [Boot] Current tenant:', tenant ? `${tenant.name} (${tenant.tenant_id})` : 'None')
      } catch (tenantError) {
        debug.warn('🔐 [Boot] Failed to load user tenants, but keeping auth state:', tenantError)
      }
    }
  } else {
    debug.log('🔐 [Boot] No valid auth data found, user not authenticated')
  }

  // 认证恢复完毕后注册唯一守卫，避免 localStorage 与 store 判断分叉。
  setupRouteGuards(router, authStore)

  debug.log('🔐 [Boot] Auth system initialized successfully')
})
