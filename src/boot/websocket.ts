import { boot } from 'quasar/wrappers'
import debug from 'src/utils/debug'
import { useWebSocket } from '../services/websocket'
import { useAuthStore } from '../stores/auth'

export default boot(({ app }) => {
  const authStore = useAuthStore()
  const userZoneId = authStore.user?.zone_id

  let isWebSocketInitialized = false

  // WebSocket connection management
  const initWebSocket = () => {
    if (authStore.isAuthenticated && userZoneId && !isWebSocketInitialized) {
      isWebSocketInitialized = true

      const { connect, on, disconnect } = useWebSocket()
      connect(authStore.token || 'mock_token', userZoneId.toString())

      // Listen for time update events - new format
      on('time_update', (data: { timestamp: number, formatted_time: string, zone_id: number }) => {
        debug.log(`[Time Update] Current time: ${data.formatted_time}, Unix timestamp: ${data.timestamp}, Zone ID: ${data.zone_id}`)
      })

      // Listen for connection and disconnect events
      on('connected', (data) => {
        debug.log('🔌 [WebSocket] 已连接', data)
      })
      
      on('disconnected', (data) => {
        debug.log('🔌 [WebSocket] 已断开', data)
        isWebSocketInitialized = false
      })

      debug.log('🔌 [WebSocket] Attempting to connect...')
    }
  }

  // Disconnect WebSocket connection
  const closeWebSocket = () => {
    const { disconnect } = useWebSocket()
    disconnect()
    isWebSocketInitialized = false
    debug.log('🔌 [Boot] WebSocket actively disconnected')
  }

  // Listen for authentication state changes
  const handleAuthChange = () => {
    if (authStore.isAuthenticated) {
      initWebSocket()
    } else {
      closeWebSocket()
    }
  }
  
  // Add authentication state change listener
  let previousAuthState = authStore.isAuthenticated;
  authStore.$subscribe((mutation, state) => {
    // Only handle when authentication state actually changes
    if (previousAuthState !== authStore.isAuthenticated) {
      debug.log('🔌 [WebSocket] Auth state changed', 
        previousAuthState ? 'Logged out' : 'Logged in', 
        authStore.isAuthenticated
      )
      previousAuthState = authStore.isAuthenticated;
      handleAuthChange();
    }
  })

  // If user is logged in, connect WebSocket immediately
  if (authStore.isAuthenticated && authStore.user?.zone_id) {
    debug.log('🔌 [Boot] User logged in, initializing WebSocket')
    // Delay initialization to ensure other systems are loaded
    setTimeout(() => {
      initWebSocket()
    }, 500)
  }

  // Mount to global properties
  app.config.globalProperties.$initWebSocket = initWebSocket
  app.config.globalProperties.$closeWebSocket = closeWebSocket

  debug.log('🔌 [Boot] WebSocket system initialized')
})
