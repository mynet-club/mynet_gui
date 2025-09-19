// WebSocket 实现服务 - 使用 Laravel Echo
import { ref } from 'vue'
import debug from "src/utils/debug"
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// 声明全局 Pusher 对象
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

// 设置全局 Pusher
window.Pusher = Pusher

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

// 时间广播消息格式
export interface TimeUpdateMessage {
  timestamp: number            // Unix时间戳
  formatted_time: string       // ISO格式的时间字符串
  zone_id: number              // Zone ID（如果是特定zone的广播）
  event: string                // 事件类型标识
}

export class WebSocketService {
  private echo: Echo<any> | null = null
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map()
  private token: string = ''
  private zoneId: string = ''
  public isConnected = ref(false)

  connect(token: string, zoneId: string) {
    // 存储认证信息
    this.token = token
    this.zoneId = zoneId
    
    // 检查是否已经连接
    if (this.echo && this.isConnected.value) {
      debug.log('WebSocket: 已经连接，跳过重复连接')
      return
    }
    
    // 断开现有连接
    if (this.echo) {
      debug.log('WebSocket: 断开现有 Echo 连接')
      this.echo.disconnect()
      this.echo = null
    }
    
    // 从环境变量获取WebSocket配置
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1080'
    debug.log(`WebSocket: 使用配置的URL: ${wsUrl}`)
    
    // 解析WebSocket URL
    const url = new URL(wsUrl)
    const wsHost = url.hostname
    const wsPort = url.port ? parseInt(url.port) : (url.protocol === 'wss:' ? 443 : 80)
    const useTLS = url.protocol === 'wss:'
    const wsPath = url.pathname || '/wss'  // 从URL中提取路径，默认为 /wss
    
    debug.log(`WebSocket: 连接参数 - Host: ${wsHost}, Port: ${wsPort}, Path: ${wsPath}, TLS: ${useTLS}`)
    
    try {
      // Laravel Reverb 配置
      const config = {
        broadcaster: 'reverb',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'oyzmmhlqzmar2uvanq2k',
        wsHost: import.meta.env.VITE_REVERB_HOST || wsHost,
        wsPort: import.meta.env.VITE_REVERB_PORT || wsPort,
        wsPath: wsPath,  // 使用从URL中提取的路径
        forceTLS: useTLS,  // 根据URL协议确定是否使用TLS
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        encrypted: useTLS,  // 根据URL协议确定是否加密
        namespace: null,   // 禁用命名空间，直接使用事件名
        cluster: 'local'   // 添加cluster配置
      }
      
      debug.log('WebSocket: Echo 配置', config)
      
      this.echo = new Echo(config)
      
      debug.log('WebSocket: Echo 实例创建成功', this.echo)

      // 监听连接状态
      this.echo.connector.pusher.connection.bind('connected', () => {
        debug.log('WebSocket: Laravel Echo 连接成功')
        this.isConnected.value = true
        this.emit('connected', { status: 'connected', zone_id: zoneId })
      })

      this.echo.connector.pusher.connection.bind('disconnected', () => {
        debug.log('WebSocket: Laravel Echo 连接断开')
        this.isConnected.value = false
        this.emit('disconnected', { status: 'disconnected' })
      })

      this.echo.connector.pusher.connection.bind('error', (error: any) => {
        debug.error('WebSocket: Laravel Echo 连接错误', error)
        this.emit('connection_failed', { status: 'error', error: error.message })
      })

      // 监听连接状态变化
      this.echo.connector.pusher.connection.bind('state_change', (states: any) => {
        debug.log('WebSocket: 连接状态变化', states)
      })

      // 订阅时间更新频道
      debug.log('WebSocket: 正在订阅时间更新频道...')
      const timeChannel = this.echo.channel('time-updates')

      // 添加消息去重机制
      const processedMessages = new Set<string>()
      const MESSAGE_DEDUP_WINDOW = 5000 // 5秒内的重复消息将被过滤
      
      // 定期清理去重缓存
      setInterval(() => {
        processedMessages.clear()
      }, MESSAGE_DEDUP_WINDOW)

      // 监听多种可能的时间事件名称（根据Laravel后端的实际事件名）
      const timeEvents = ['TimeUpdate', 'time.update', 'time_update', 'App\\Events\\TimeUpdate']
      
      timeEvents.forEach(eventName => {
        timeChannel.listen(eventName, (data: any) => {
          // 生成消息唯一标识，用于去重
          const messageId = `${eventName}_${data.timestamp || Date.now()}_${JSON.stringify(data)}`
          
          // 检查是否为重复消息
          if (processedMessages.has(messageId)) {
            debug.log(`🕐 [去重] 跳过重复的时间事件 ${eventName}:`, data.timestamp)
            return
          }
          
          // 标记消息已处理
          processedMessages.add(messageId)
          
          debug.log(`🕐 收到时间事件 ${eventName}:`, data)
          
          // 格式化时间数据
          const timeData: TimeUpdateMessage = {
            timestamp: data.timestamp || Date.now() / 1000,
            formatted_time: data.formatted_time || data.server_time || data.time || new Date().toISOString(),
            zone_id: data.zone_id || parseInt(zoneId),
            event: eventName
          }
          
          debug.log('🕐 格式化后的时间数据:', timeData)
          debug.log('  服务器时间:', timeData.formatted_time)
          debug.log('  Unix时间戳:', timeData.timestamp)
          debug.log('  Zone ID:', timeData.zone_id)
          
          // 转换为本地时间显示
          const localTime = new Date(timeData.timestamp * 1000)
          debug.log('  本地时间:', localTime.toLocaleString())
          
          // 发射时间更新事件
          this.emit('time_update', timeData)
        })
      })

      // 监听原始消息（调试用） - 添加消息过滤和统计
      let lastMessageTime = 0
      let messageCount = 0
      const messageStats = new Map<string, number>()
      const MESSAGE_THROTTLE = 50 // 50ms内只处理一次相同类型的消息
      
      this.echo.connector.pusher.connection.bind('message', (message: any) => {
        const now = Date.now()
        messageCount++
        
        // 统计消息类型
        const eventType = message.event || 'unknown'
        messageStats.set(eventType, (messageStats.get(eventType) || 0) + 1)
        
        // 过滤掉频繁的 ping/pong 消息，只显示关键消息
        if (message.event === 'pusher:ping' || message.event === 'pusher:pong') {
          return // 不输出 ping/pong 消息
        }
        
        // 对 time.update 消息进行节流处理
        if (message.event === 'time.update') {
          if (now - lastMessageTime < MESSAGE_THROTTLE) {
            debug.log(`🕐 [节流] 跳过过于频繁的time.update消息 (${now - lastMessageTime}ms间隔)`)
            return // 跳过过于频繁的消息
          }
          lastMessageTime = now
          
          // 输出消息统计信息
          debug.log(`📊 [WebSocket] 消息统计: time.update=${messageStats.get('time.update')}次, 总计=${messageCount}条`)
        }
        
        debug.log('WebSocket: 收到原始消息', {
          event: message.event,
          channel: message.channel,
          timestamp: new Date().toISOString(),
          dataPreview: typeof message.data === 'string' ? message.data.substring(0, 100) : message.data
        })
      })

      debug.log('WebSocket: Laravel Echo 初始化完成')
      
    } catch (error) {
      debug.error('WebSocket: Laravel Echo 初始化失败', error)
      this.emit('connection_failed', { 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  disconnect() {
    debug.log('WebSocket: 断开 Laravel Echo 连接')
    
    if (this.echo) {
      try {
        this.echo.disconnect()
        this.echo = null
        this.isConnected.value = false
        debug.log('WebSocket: Laravel Echo 连接已断开')
      } catch (error) {
        debug.error('WebSocket: 断开连接时出错', error)
      }
    }
  }

  // 安排WebSocket重连 - Laravel Echo 自动处理重连
  private scheduleReconnect() {
    debug.log('WebSocket: Laravel Echo 将自动处理重连')
  }

  // 清除重连计时器 - Laravel Echo 自动处理
  private clearReconnectTimeout() {
    debug.log('WebSocket: Laravel Echo 自动处理重连计时器')
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)?.push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

}

export const webSocketService = new WebSocketService()

export const useWebSocket = () => {
  const connect = (token: string, zoneId: string) => {
    webSocketService.connect(token, zoneId)
  }

  const disconnect = () => {
    webSocketService.disconnect()
  }

  const on = (event: string, callback: (data: any) => void) => {
    webSocketService.on(event, callback)
  }

  const off = (event: string, callback: (data: any) => void) => {
    webSocketService.off(event, callback)
  }

  return {
    isConnected: webSocketService.isConnected,
    connect,
    disconnect,
    on,
    off
  }
}
