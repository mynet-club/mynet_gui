// WebSocket 服务 — Laravel Echo + Reverb 私有频道
// 提供 Tenant 节点事件、用户通知事件订阅入口
import { ref } from 'vue'
import debug from 'src/utils/debug'
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

// Tenant 节点事件 payload
export interface NodeEventPayload {
  node_id: string
  node_name?: string
  zone_id: number
  old_status?: number
  new_status?: number
  old_status_name?: string
  new_status_name?: string
  vpn_type?: string
  status?: number
  changes?: string[]
  timestamp: string
}

// 用户通知事件 payload
export interface NotificationEventPayload {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  created_at?: string
  [key: string]: any
}

export interface NodeEventHandlers {
  onCreated?: (payload: NodeEventPayload) => void
  onUpdated?: (payload: NodeEventPayload) => void
  onStatusChanged?: (payload: NodeEventPayload) => void
  onDeleted?: (payload: NodeEventPayload) => void
}

export class WebSocketService {
  private echo: Echo<any> | null = null
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map()
  private token: string = ''
  private tenantId: string = ''
  private subscribedTenantChannels: Set<number> = new Set()
  private subscribedUserChannels: Set<number | string> = new Set()
  public isConnected = ref(false)

  connect(token: string, tenantId: string) {
    this.token = token
    this.tenantId = tenantId

    if (this.echo && this.isConnected.value) {
      debug.log('WebSocket: 已经连接，跳过重复连接')
      return
    }

    if (this.echo) {
      debug.log('WebSocket: 断开现有 Echo 连接')
      try { this.echo.disconnect() } catch { /* ignore */ }
      this.echo = null
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1080'
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const url = new URL(wsUrl)
    const wsHost = url.hostname
    const wsPort = url.port ? parseInt(url.port) : (url.protocol === 'wss:' ? 443 : 80)
    const useTLS = url.protocol === 'wss:'
    const wsPath = url.pathname || '/wss'

    debug.log(`WebSocket: Host=${wsHost} Port=${wsPort} Path=${wsPath} TLS=${useTLS}`)

    try {
      const config: any = {
        broadcaster: 'reverb',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'oyzmmhlqzmar2uvanq2k',
        wsHost: import.meta.env.VITE_REVERB_HOST || wsHost,
        wsPort: import.meta.env.VITE_REVERB_PORT || wsPort,
        wssPort: import.meta.env.VITE_REVERB_PORT || wsPort,
        wsPath,
        forceTLS: useTLS,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        encrypted: useTLS,
        cluster: 'local',
        authEndpoint: `${apiBaseUrl}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-ID': String(tenantId),
            Accept: 'application/json'
          }
        }
      }

      debug.log('WebSocket: Echo 配置', { ...config, auth: '[hidden]' })

      this.echo = new Echo(config)

      this.echo.connector.pusher.connection.bind('connected', () => {
        debug.log('WebSocket: 连接成功')
        this.isConnected.value = true
        this.emit('connected', { status: 'connected', tenant_id: tenantId })
      })

      this.echo.connector.pusher.connection.bind('disconnected', () => {
        debug.log('WebSocket: 连接断开')
        this.isConnected.value = false
        this.emit('disconnected', { status: 'disconnected' })
      })

      this.echo.connector.pusher.connection.bind('error', (error: any) => {
        debug.error('WebSocket: 连接错误', error)
        this.emit('connection_failed', { status: 'error', error: error?.message })
      })
    } catch (error) {
      debug.error('WebSocket: Echo 初始化失败', error)
      this.emit('connection_failed', {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * 订阅 Tenant 节点事件（私有频道 private-zone.{tenantId}.nodes）
   * 监听后端 NodeCreatedEvent / NodeUpdatedEvent / NodeStatusChangedEvent / NodeDeletedEvent
   */
  subscribeTenantNodes(tenantId: number | string, handlers: NodeEventHandlers) {
    if (!this.echo) {
      debug.warn('WebSocket: Echo 未初始化，无法订阅 Zone 节点频道')
      return
    }
    const zid = Number(tenantId)
    const channelName = `zone.${zid}.nodes`
    debug.log(`WebSocket: 订阅私有频道 private-${channelName}`)
    const channel = this.echo.private(channelName)

    if (handlers.onCreated) channel.listen('.node.created', handlers.onCreated)
    if (handlers.onUpdated) channel.listen('.node.updated', handlers.onUpdated)
    if (handlers.onStatusChanged) channel.listen('.node.status_changed', handlers.onStatusChanged)
    if (handlers.onDeleted) channel.listen('.node.deleted', handlers.onDeleted)

    this.subscribedTenantChannels.add(zid)
  }

  unsubscribeTenantNodes(tenantId: number | string) {
    if (!this.echo) return
    const zid = Number(tenantId)
    try {
      this.echo.leave(`zone.${zid}.nodes`)
      this.subscribedTenantChannels.delete(zid)
      debug.log(`WebSocket: 已退订 private-zone.${zid}.nodes`)
    } catch (err) {
      debug.warn('WebSocket: 退订 Zone 节点频道失败', err)
    }
  }

  /**
   * 订阅用户通知（私有频道 private-user.{userId}）
   * 监听后端 Notification broadcastAs (.notification.created) 及 Laravel 默认 .Illuminate\Notifications\Events\BroadcastNotificationCreated
   */
  subscribeUserNotifications(userId: number | string, handler: (payload: NotificationEventPayload) => void) {
    if (!this.echo) {
      debug.warn('WebSocket: Echo 未初始化，无法订阅用户通知频道')
      return
    }
    const channelName = `user.${userId}`
    debug.log(`WebSocket: 订阅私有频道 private-${channelName}`)
    const channel = this.echo.private(channelName)

    // 自定义 broadcastAs
    channel.listen('.notification.created', handler)
    // Laravel 默认 notification 事件名（兼容未覆写 broadcastType 的通知）
    channel.notification(handler)

    this.subscribedUserChannels.add(userId)
  }

  unsubscribeUserNotifications(userId: number | string) {
    if (!this.echo) return
    try {
      this.echo.leave(`user.${userId}`)
      this.subscribedUserChannels.delete(userId)
      debug.log(`WebSocket: 已退订 private-user.${userId}`)
    } catch (err) {
      debug.warn('WebSocket: 退订用户通知频道失败', err)
    }
  }

  unsubscribeAll() {
    if (!this.echo) return
    this.subscribedTenantChannels.forEach((zid) => this.unsubscribeTenantNodes(zid))
    this.subscribedUserChannels.forEach((uid) => this.unsubscribeUserNotifications(uid))
  }

  disconnect() {
    debug.log('WebSocket: 断开 Echo 连接')
    this.unsubscribeAll()
    if (this.echo) {
      try {
        this.echo.disconnect()
      } catch (error) {
        debug.error('WebSocket: 断开连接时出错', error)
      }
      this.echo = null
      this.isConnected.value = false
    }
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
      if (index > -1) listeners.splice(index, 1)
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) listeners.forEach((cb) => cb(data))
  }
}

export const webSocketService = new WebSocketService()

export const useWebSocket = () => {
  return {
    isConnected: webSocketService.isConnected,
    connect: (token: string, tenantId: string) => webSocketService.connect(token, tenantId),
    disconnect: () => webSocketService.disconnect(),
    on: (event: string, callback: (data: any) => void) => webSocketService.on(event, callback),
    off: (event: string, callback: (data: any) => void) => webSocketService.off(event, callback),
    subscribeTenantNodes: (tenantId: number | string, handlers: NodeEventHandlers) =>
      webSocketService.subscribeTenantNodes(tenantId, handlers),
    unsubscribeTenantNodes: (tenantId: number | string) => webSocketService.unsubscribeTenantNodes(tenantId),
    subscribeUserNotifications: (userId: number | string, handler: (payload: NotificationEventPayload) => void) =>
      webSocketService.subscribeUserNotifications(userId, handler),
    unsubscribeUserNotifications: (userId: number | string) =>
      webSocketService.unsubscribeUserNotifications(userId)
  }
}
