// WebSocket 模拟服务
import { ref, reactive } from 'vue'
import { mockNodes, mockRoutes } from './mockData'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface ConnectionStats {
  connected: boolean
  reconnectAttempts: number
  lastHeartbeat: string
  messagesSent: number
  messagesReceived: number
}

// 模拟WebSocket连接
const USE_MOCK_WEBSOCKET = true

export class MockWebSocketService {
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map()
  private connectionStats = reactive<ConnectionStats>({
    connected: false,
    reconnectAttempts: 0,
    lastHeartbeat: '',
    messagesSent: 0,
    messagesReceived: 0
  })
  private simulationInterval: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  
  constructor() {
    this.startSimulation()
  }
  
  // 连接到WebSocket
  connect(token: string, zoneId: string) {
    console.log('WebSocket: Connecting...', { token, zoneId })
    
    // 模拟连接延迟
    setTimeout(() => {
      this.connectionStats.connected = true
      this.connectionStats.lastHeartbeat = new Date().toISOString()
      this.emit('connected', { status: 'connected', zone_id: zoneId })
      this.startHeartbeat()
      console.log('WebSocket: Connected successfully')
    }, 1000)
  }
  
  // 断开连接
  disconnect() {
    console.log('WebSocket: Disconnecting...')
    this.connectionStats.connected = false
    this.stopSimulation()
    this.stopHeartbeat()
    this.emit('disconnected', { status: 'disconnected' })
  }
  
  // 重连
  reconnect() {
    console.log('WebSocket: Reconnecting...')
    this.connectionStats.reconnectAttempts++
    this.disconnect()
    
    // 模拟重连延迟
    setTimeout(() => {
      this.connectionStats.connected = true
      this.connectionStats.lastHeartbeat = new Date().toISOString()
      this.emit('reconnected', { status: 'reconnected' })
      this.startHeartbeat()
    }, 2000)
  }
  
  // 发送消息
  send(message: WebSocketMessage) {
    if (!this.connectionStats.connected) {
      console.warn('WebSocket: Not connected, message not sent')
      return
    }
    
    console.log('WebSocket: Sending message', message)
    this.connectionStats.messagesSent++
    
    // 模拟服务器响应
    setTimeout(() => {
      this.emit('message_sent', { 
        ...message, 
        status: 'sent',
        timestamp: new Date().toISOString()
      })
    }, 100)
  }
  
  // 监听事件
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)?.push(callback)
  }
  
  // 取消监听
  off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  // 触发事件
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
    this.connectionStats.messagesReceived++
  }
  
  // 开始数据模拟
  private startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }
    
    this.simulationInterval = setInterval(() => {
      if (!this.connectionStats.connected) return
      
      // 随机生成模拟事件
      const eventType = Math.random()
      
      if (eventType < 0.3) {
        // 节点状态更新
        this.simulateNodeStatusUpdate()
      } else if (eventType < 0.6) {
        // 路由状态更新
        this.simulateRouteStatusUpdate()
      } else if (eventType < 0.8) {
        // 用户活动
        this.simulateUserActivity()
      } else {
        // 系统通知
        this.simulateSystemNotification()
      }
    }, 3000 + Math.random() * 5000) // 3-8秒随机间隔
  }
  
  // 停止数据模拟
  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }
  
  // 开始心跳
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    this.heartbeatInterval = setInterval(() => {
      this.connectionStats.lastHeartbeat = new Date().toISOString()
      this.emit('heartbeat', { 
        timestamp: this.connectionStats.lastHeartbeat,
        stats: this.connectionStats
      })
    }, 30000) // 30秒心跳
  }
  
  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
  
  // 模拟节点状态更新
  private simulateNodeStatusUpdate() {
    const randomNode = mockNodes[Math.floor(Math.random() * mockNodes.length)]
    const statuses = ['active', 'inactive', 'pending']
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    this.emit('node_status_update', {
      node_id: randomNode.id,
      node_name: randomNode.node_name,
      status: newStatus,
      previous_status: randomNode.status,
      timestamp: new Date().toISOString()
    })
  }
  
  // 模拟路由状态更新
  private simulateRouteStatusUpdate() {
    const randomRoute = mockRoutes[Math.floor(Math.random() * mockRoutes.length)]
    const statuses = ['active', 'inactive']
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    this.emit('route_status_update', {
      route_id: randomRoute.id,
      route_name: randomRoute.name,
      status: newStatus,
      previous_status: randomRoute.status,
      timestamp: new Date().toISOString()
    })
  }
  
  // 模拟用户活动
  private simulateUserActivity() {
    const activities = ['login', 'logout', 'zone_switch', 'node_access']
    const activity = activities[Math.floor(Math.random() * activities.length)]
    
    this.emit('user_activity', {
      user_id: 'user_' + Math.floor(Math.random() * 100),
      activity: activity,
      timestamp: new Date().toISOString(),
      details: `User performed ${activity}`
    })
  }
  
  // 模拟系统通知
  private simulateSystemNotification() {
    const notifications = [
      { type: 'info', title: 'System Update', message: 'System maintenance completed successfully' },
      { type: 'warning', title: 'High Load', message: 'Server load is above 80%' },
      { type: 'error', title: 'Connection Lost', message: 'Lost connection to node AP-Gateway-01' },
      { type: 'success', title: 'Backup Complete', message: 'Daily backup completed successfully' }
    ]
    
    const notification = notifications[Math.floor(Math.random() * notifications.length)]
    
    this.emit('system_notification', {
      id: 'notif_' + Date.now(),
      ...notification,
      timestamp: new Date().toISOString()
    })
  }
  
  // 获取连接统计信息
  getConnectionStats() {
    return this.connectionStats
  }
}

// 创建WebSocket服务实例
export const webSocketService = new MockWebSocketService()

// 导出WebSocket hooks
export const useWebSocket = () => {
  const isConnected = ref(false)
  const connectionStats = ref<ConnectionStats>({
    connected: false,
    reconnectAttempts: 0,
    lastHeartbeat: '',
    messagesSent: 0,
    messagesReceived: 0
  })
  
  const connect = (token: string, zoneId: string) => {
    webSocketService.connect(token, zoneId)
  }
  
  const disconnect = () => {
    webSocketService.disconnect()
  }
  
  const reconnect = () => {
    webSocketService.reconnect()
  }
  
  const send = (message: WebSocketMessage) => {
    webSocketService.send(message)
  }
  
  const on = (event: string, callback: (data: any) => void) => {
    webSocketService.on(event, callback)
  }
  
  const off = (event: string, callback: (data: any) => void) => {
    webSocketService.off(event, callback)
  }
  
  // 监听连接状态变化
  webSocketService.on('connected', () => {
    isConnected.value = true
    connectionStats.value = webSocketService.getConnectionStats()
  })
  
  webSocketService.on('disconnected', () => {
    isConnected.value = false
    connectionStats.value = webSocketService.getConnectionStats()
  })
  
  webSocketService.on('reconnected', () => {
    isConnected.value = true
    connectionStats.value = webSocketService.getConnectionStats()
  })
  
  webSocketService.on('heartbeat', (data) => {
    connectionStats.value = data.stats
  })
  
  return {
    isConnected,
    connectionStats,
    connect,
    disconnect,
    reconnect,
    send,
    on,
    off
  }
} 