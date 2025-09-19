import { boot } from 'quasar/wrappers'
import debug from "src/utils/debug"
import { useWebSocket } from '../services/websocket'
import { useAuthStore } from '../stores/auth'

export default boot(({ app }) => {
  const authStore = useAuthStore()
  const userZoneId = authStore.user?.zone_id

  let isWebSocketInitialized = false

  // WebSocket连接管理
  const initWebSocket = () => {
    if (authStore.isAuthenticated && userZoneId && !isWebSocketInitialized) {
      isWebSocketInitialized = true

      const { connect, on, disconnect } = useWebSocket()
      connect(authStore.token || 'mock_token', userZoneId.toString())

      // 监听时间更新事件 - 新格式
      on('time_update', (data: { timestamp: number, formatted_time: string, zone_id: number }) => {
        debug.log(`[时间更新] 当前时间: ${data.formatted_time}, Unix时间戳: ${data.timestamp}, Zone ID: ${data.zone_id}`)
      })

      // 监听连接和断开事件
      on('connected', (data) => {
        debug.log('🔌 [WebSocket] 已连接', data)
      })
      
      on('disconnected', (data) => {
        debug.log('🔌 [WebSocket] 已断开', data)
        isWebSocketInitialized = false
      })

      debug.log('🔌 [WebSocket] 尝试连接...')
    }
  }

  // 断开WebSocket连接
  const closeWebSocket = () => {
    const { disconnect } = useWebSocket()
    disconnect()
    isWebSocketInitialized = false
    debug.log('🔌 [Boot] WebSocket 主动断开连接')
  }

  // 监听认证状态变化
  const handleAuthChange = () => {
    if (authStore.isAuthenticated) {
      initWebSocket()
    } else {
      closeWebSocket()
    }
  }
  
  // 添加认证状态变化的监听器
  let previousAuthState = authStore.isAuthenticated;
  authStore.$subscribe((mutation, state) => {
    // 仅在认证状态真正发生变化时才处理
    if (previousAuthState !== authStore.isAuthenticated) {
      debug.log('🔌 [WebSocket] 认证状态变化', 
        previousAuthState ? '已登出' : '已登录', 
        authStore.isAuthenticated
      )
      previousAuthState = authStore.isAuthenticated;
      handleAuthChange();
    }
  })

  // 如果用户已登录，立即连接WebSocket
  if (authStore.isAuthenticated && authStore.user?.zone_id) {
    debug.log('🔌 [Boot] 用户已登录，初始化WebSocket')
    // 延迟初始化，确保其他系统已加载
    setTimeout(() => {
      initWebSocket()
    }, 500)
  }

  // 挂载到全局属性
  app.config.globalProperties.$initWebSocket = initWebSocket
  app.config.globalProperties.$closeWebSocket = closeWebSocket

  debug.log('🔌 [Boot] WebSocket system initialized')
})
