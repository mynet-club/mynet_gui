import { boot } from 'quasar/wrappers'
import { useWebSocket } from '../services/websocket'
import { useAuthStore } from '../stores/auth'

export default boot(({ app }) => {
  const authStore = useAuthStore()
  const { connect, disconnect, on, off } = useWebSocket()
  
  // WebSocket连接管理
  const initWebSocket = () => {
    if (authStore.isAuthenticated && authStore.user?.zone_id) {
      const token = authStore.token || 'mock_token'
      const zoneId = authStore.user.zone_id.toString()
      
      connect(token, zoneId)
      console.log('🔌 [Boot] WebSocket connected')
    }
  }

  // 断开WebSocket连接
  const closeWebSocket = () => {
    disconnect()
    console.log('🔌 [Boot] WebSocket disconnected')
  }
  
  // 监听认证状态变化
  const handleAuthChange = () => {
    if (authStore.isAuthenticated) {
      initWebSocket()
    } else {
      closeWebSocket()
    }
  }
  
  // 监听WebSocket事件
  const handleWebSocketEvents = () => {
    // 节点状态更新
    on('node_status_update', (data) => {
      console.log('🔌 [WebSocket] Node status update:', data)
      // 这里可以触发全局状态更新或通知
    })
    
    // 路由状态更新
    on('route_status_update', (data) => {
      console.log('🔌 [WebSocket] Route status update:', data)
    })
    
    // 系统通知
    on('system_notification', (data) => {
      console.log('🔌 [WebSocket] System notification:', data)
      // 显示系统通知
      app.config.globalProperties.$showInfo(data.message, data.title)
    })
    
    // 连接状态变化
    on('connected', () => {
      console.log('🔌 [WebSocket] Connected')
    })
    
    on('disconnected', () => {
      console.log('🔌 [WebSocket] Disconnected')
    })
  }
  
  // 初始化WebSocket事件监听
  handleWebSocketEvents()
  
  // 如果用户已登录，立即连接WebSocket
  if (authStore.isAuthenticated) {
    initWebSocket()
  }
  
  // 挂载到全局属性
  app.config.globalProperties.$initWebSocket = initWebSocket
  app.config.globalProperties.$closeWebSocket = closeWebSocket
  
  console.log('🔌 [Boot] WebSocket system initialized')
})