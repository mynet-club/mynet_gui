import { boot } from 'quasar/wrappers'
import debug from 'src/utils/debug'
import { useWebSocket, webSocketService } from '../services/websocket'
import { useAuthStore } from '../stores/auth'
import { handleNotificationBroadcast } from '../composables/useNotifications'

export default boot(({ app }) => {
  const authStore = useAuthStore()

  let isWebSocketInitialized = false

  // 建立连接 + 订阅 user notifications 频道
  const initWebSocket = () => {
    const zoneId = authStore.user?.zone_id
    const userId = authStore.user?.user_id ?? (authStore.user as any)?.id
    if (!authStore.isAuthenticated || !zoneId || !userId || isWebSocketInitialized) return

    isWebSocketInitialized = true
    const { connect, on, subscribeUserNotifications } = useWebSocket()
    connect(authStore.token || '', String(zoneId))

    on('connected', (data) => {
      debug.log('🔌 [WebSocket] 已连接', data)
      // 连接成功后订阅当前用户的通知频道
      subscribeUserNotifications(userId, (payload) => {
        debug.log('🔔 [WebSocket] 收到通知广播', payload)
        handleNotificationBroadcast(payload)
      })
    })

    on('disconnected', (data) => {
      debug.log('🔌 [WebSocket] 已断开', data)
      isWebSocketInitialized = false
    })

    debug.log('🔌 [WebSocket] 正在建立连接...')
  }

  const closeWebSocket = () => {
    webSocketService.disconnect()
    isWebSocketInitialized = false
    debug.log('🔌 [Boot] WebSocket 主动断开')
  }

  // 监听认证状态变化
  let previousAuthState = authStore.isAuthenticated
  authStore.$subscribe(() => {
    if (previousAuthState !== authStore.isAuthenticated) {
      debug.log('🔌 [WebSocket] 认证状态变化', previousAuthState ? '登出' : '登录')
      previousAuthState = authStore.isAuthenticated
      if (authStore.isAuthenticated) initWebSocket()
      else closeWebSocket()
    }
  })

  // 首次加载若已登录则建立连接
  if (authStore.isAuthenticated && authStore.user?.zone_id) {
    debug.log('🔌 [Boot] 用户已登录，初始化 WebSocket')
    setTimeout(initWebSocket, 500)
  }

  app.config.globalProperties.$initWebSocket = initWebSocket
  app.config.globalProperties.$closeWebSocket = closeWebSocket

  debug.log('🔌 [Boot] WebSocket 系统已初始化')
})
