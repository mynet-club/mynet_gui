// WebSocket 实现服务 - 使用 Laravel Echo
import { ref } from 'vue'
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
      console.log('WebSocket: 已经连接，跳过重复连接')
      return
    }
    
    // 断开现有连接
    if (this.echo) {
      console.log('WebSocket: 断开现有 Echo 连接')
      this.echo.disconnect()
      this.echo = null
    }
    
    // 确定WebSocket主机和端口
    const wsHost = process.env.NODE_ENV === 'production' 
      ? 'api.mynet.com' 
      : 'localhost'
    const wsPort = process.env.NODE_ENV === 'production' 
      ? 443 
      : 1080  // 根据服务端配置调整端口
    
    console.log(`WebSocket: 正在连接到 ${wsHost}:${wsPort}`)
    
    try {
      // 根据工作样例配置 Laravel Echo
      const config = {
        broadcaster: 'pusher',
        key: 'oyzmmhlqzmar2uvanq2k',  // 使用工作样例中的key
        wsHost: wsHost,
        wsPort: wsPort,
        forceTLS: false,  // 本地开发环境不使用TLS
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        encrypted: false,
        namespace: null,   // 禁用命名空间，直接使用事件名
        cluster: 'local'   // 添加cluster配置，避免Pusher报错
      }
      
      console.log('WebSocket: Echo 配置', config)
      
      this.echo = new Echo(config)
      
      console.log('WebSocket: Echo 实例创建成功', this.echo)

      // 监听连接状态
      this.echo.connector.pusher.connection.bind('connected', () => {
        console.log('WebSocket: Laravel Echo 连接成功')
        this.isConnected.value = true
        this.emit('connected', { status: 'connected', zone_id: zoneId })
      })

      this.echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('WebSocket: Laravel Echo 连接断开')
        this.isConnected.value = false
        this.emit('disconnected', { status: 'disconnected' })
      })

      this.echo.connector.pusher.connection.bind('error', (error: any) => {
        console.error('WebSocket: Laravel Echo 连接错误', error)
        this.emit('connection_failed', { status: 'error', error: error.message })
      })

      // 监听连接状态变化
      this.echo.connector.pusher.connection.bind('state_change', (states: any) => {
        console.log('WebSocket: 连接状态变化', states)
      })

      // 订阅时间更新频道
      console.log('WebSocket: 正在订阅时间更新频道...')
      const timeChannel = this.echo.channel('time-updates')

      // 监听多种可能的时间事件名称（根据Laravel后端的实际事件名）
      const timeEvents = ['TimeUpdate', 'time.update', 'time_update', 'App\\Events\\TimeUpdate']
      
      timeEvents.forEach(eventName => {
        timeChannel.listen(eventName, (data: any) => {
          console.log(`🕐 收到时间事件 ${eventName}:`, data)
          
          // 格式化时间数据
          const timeData: TimeUpdateMessage = {
            timestamp: data.timestamp || Date.now() / 1000,
            formatted_time: data.formatted_time || data.server_time || data.time || new Date().toISOString(),
            zone_id: data.zone_id || parseInt(zoneId),
            event: eventName
          }
          
          console.log('🕐 格式化后的时间数据:', timeData)
          console.log('  服务器时间:', timeData.formatted_time)
          console.log('  Unix时间戳:', timeData.timestamp)
          console.log('  Zone ID:', timeData.zone_id)
          
          // 转换为本地时间显示
          const localTime = new Date(timeData.timestamp * 1000)
          console.log('  本地时间:', localTime.toLocaleString())
          
          // 发射时间更新事件
          this.emit('time_update', timeData)
        })
      })

      // 监听原始消息（调试用）
      this.echo.connector.pusher.connection.bind('message', (message: any) => {
        console.log('WebSocket: 收到原始消息', message)
      })

      console.log('WebSocket: Laravel Echo 初始化完成')
      
    } catch (error) {
      console.error('WebSocket: Laravel Echo 初始化失败', error)
      this.emit('connection_failed', { 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  disconnect() {
    console.log('WebSocket: 断开 Laravel Echo 连接')
    
    if (this.echo) {
      try {
        this.echo.disconnect()
        this.echo = null
        this.isConnected.value = false
        console.log('WebSocket: Laravel Echo 连接已断开')
      } catch (error) {
        console.error('WebSocket: 断开连接时出错', error)
      }
    }
  }

  // 安排WebSocket重连 - Laravel Echo 自动处理重连
  private scheduleReconnect() {
    console.log('WebSocket: Laravel Echo 将自动处理重连')
  }

  // 清除重连计时器 - Laravel Echo 自动处理
  private clearReconnectTimeout() {
    console.log('WebSocket: Laravel Echo 自动处理重连计时器')
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