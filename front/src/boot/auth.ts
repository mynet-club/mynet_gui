import { boot } from 'quasar/wrappers'
import { LocalStorage } from 'quasar'

// 立即执行的日志，确认文件被加载
console.log('🔐 [Boot] Auth module loaded and executing...')

export default boot(async ({ router, app }) => {
  console.log('🔐 [Boot] Auth boot starting...')
  
  console.log('🔐 [Boot] About to import useAuthStore...')
  
  let authStore: any
  
  try {
    const { useAuthStore } = await import('../stores/auth')
    console.log('🔐 [Boot] useAuthStore imported successfully')
    
    // 现在 Pinia 已经在 pinia.ts boot 文件中初始化了
    authStore = useAuthStore()
    console.log('🔐 [Boot] Auth store initialized successfully')
  } catch (error) {
    console.error('🔐 [Boot] Failed to initialize auth store:', error)
    return
  }
  
  // 检查本地存储的认证信息
  const token = LocalStorage.getItem('auth_token') as string | null
  const userInfo = LocalStorage.getItem('user_info') as string | null
  const tokenExpiry = LocalStorage.getItem('token_expiry') as string | null
  
  console.log('🔐 [Boot] Checking localStorage auth state:', { 
    hasToken: !!token, 
    hasUserInfo: !!userInfo,
    tokenExpiry: tokenExpiry,
    tokenExpiryDate: tokenExpiry ? new Date(parseInt(tokenExpiry)).toLocaleString() : null,
    currentTime: Date.now(),
    currentTimeDate: new Date().toLocaleString(),
    isTokenExpired: tokenExpiry ? Date.now() > parseInt(tokenExpiry) : false,
    token: token ? token.substring(0, 20) + '...' : null,
    userInfo: userInfo ? JSON.parse(userInfo) : null
  })
  
  // 检查token是否过期
  if (token && tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    console.log('🔐 [Boot] Token expired, clearing all auth data')
    // Token过期，清除所有认证数据
    LocalStorage.remove('auth_token')
    LocalStorage.remove('token_expiry')
    LocalStorage.remove('user_info')
    LocalStorage.remove('current_zone')
    console.log('🔐 [Boot] Expired auth data cleared')
  } else if (token && userInfo) {
    console.log('🔐 [Boot] Valid token found, restoring auth state...')
    
    try {
      // 从本地存储恢复用户数据
      const user = JSON.parse(userInfo)
      console.log('🔐 [Boot] Parsed user info:', user)
      
      // 设置认证状态
      authStore.user = user
      authStore.token = token
      
      // 恢复 token 过期时间
      if (tokenExpiry) {
        authStore.tokenExpiry = parseInt(tokenExpiry)
        console.log('🔐 [Boot] Token expiry restored:', {
          tokenExpiry: authStore.tokenExpiry,
          expiryDate: new Date(authStore.tokenExpiry).toLocaleString(),
          isExpired: Date.now() > authStore.tokenExpiry
        })
      }
      
      console.log('🔐 [Boot] Auth state restored:', {
        user: authStore.user?.name,
        token: authStore.token ? '***' : null,
        tokenExpiry: authStore.tokenExpiry,
        isAuthenticated: authStore.isAuthenticated
      })
      
      console.log('🔐 [Boot] Loading user zones...')
      
      // 加载用户区域数据
      await authStore.loadUserZones()
      
      console.log('🔐 [Boot] Available zones loaded:', authStore.availableZones.length)
      
      // 优先从 localStorage 恢复用户选择的区域
      const savedZone = LocalStorage.getItem('current_zone') as string | null
      console.log('🔐 [Boot] Saved zone from localStorage:', savedZone)
      
      if (savedZone) {
        try {
          const zone = JSON.parse(savedZone)
          console.log('🔐 [Boot] Parsed saved zone:', zone)
          
          // 验证保存的区域是否在可用区域列表中
          const validZone = authStore.availableZones.find((z: any) => z.zone_id === zone.zone_id)
          if (validZone) {
            authStore.currentZone = validZone
            console.log('🔐 [Boot] Restored saved zone:', validZone.zone_name)
          } else {
            console.log('🔐 [Boot] Saved zone not found in available zones, using default')
            // 如果保存的区域不在可用列表中，使用用户默认区域
            if (authStore.user?.zone_id) {
              const defaultZone = authStore.availableZones.find((z: any) => z.zone_id === authStore.user?.zone_id)
              if (defaultZone) {
                authStore.currentZone = defaultZone
                console.log('🔐 [Boot] Set default zone:', defaultZone.zone_name)
              }
            }
          }
        } catch (error) {
          console.warn('🔐 [Boot] Failed to parse saved zone:', error)
          // 解析失败时使用用户默认区域
          if (authStore.user?.zone_id) {
            const defaultZone = authStore.availableZones.find((z: any) => z.zone_id === authStore.user?.zone_id)
            if (defaultZone) {
              authStore.currentZone = defaultZone
              console.log('🔐 [Boot] Set default zone after parse error:', defaultZone.zone_name)
            }
          }
        }
      } else {
        console.log('🔐 [Boot] No saved zone found, using user default zone')
        // 没有保存的区域选择，使用用户默认区域
        if (authStore.user?.zone_id) {
          const zone = authStore.availableZones.find((z: any) => z.zone_id === authStore.user?.zone_id)
          if (zone) {
            authStore.currentZone = zone
            console.log('🔐 [Boot] Set user default zone:', zone.zone_name)
          }
        }
      }
      
      console.log('🔐 [Boot] Auto-login successful, restored user:', user.name)
      console.log('🔐 [Boot] Current zone:', authStore.currentZone?.zone_name || 'None')
      
    } catch (error) {
      console.error('🔐 [Boot] Auto-login failed, clearing invalid credentials:', error)
      // 清除无效的认证信息
      try {
        await authStore.logout()
      } catch (logoutError) {
        console.error('🔐 [Boot] Error during logout:', logoutError)
      }
    }
  } else {
    console.log('🔐 [Boot] No valid auth data found, user not authenticated')
  }
  
  // 路由守卫
  router.beforeEach(async (to, from, next) => {
    const isAuthRoute = to.path.startsWith('/auth/')
    const isAuthenticated = authStore.isAuthenticated
    const isRootPath = to.path === '/'
    
    console.log('🔐 [Router] Navigation guard:', {
      to: to.path,
      from: from.path,
      isAuthRoute,
      isAuthenticated,
      isRootPath
    })
    
    // 防止无限重定向：如果已经在正确的页面，直接放行
    if ((isAuthenticated && to.path === '/dashboard') || 
        (!isAuthenticated && to.path === '/auth/login')) {
      console.log('🔐 [Router] Already at correct destination, allowing navigation')
      next()
      return
    }
    
    // 特殊处理根路径：已认证用户重定向到dashboard
    if (isRootPath && isAuthenticated) {
      console.log('🔐 [Router] Authenticated user at root, redirecting to dashboard')
      next('/dashboard')
      return
    }
    
    if (!isAuthenticated && !isAuthRoute) {
      console.log('🔐 [Router] Redirecting to login - not authenticated')
      // 未登录且不是认证页面，重定向到登录页
      next('/auth/login')
    } else if (isAuthenticated && isAuthRoute) {
      console.log('🔐 [Router] Redirecting to dashboard - already authenticated')
      // 已登录用户访问认证页面，重定向到仪表板
      next('/dashboard')
    } else {
      console.log('🔐 [Router] Allowing navigation')
      next()
    }
  })
  
  console.log('🔐 [Boot] Auth system initialized successfully')
}) 