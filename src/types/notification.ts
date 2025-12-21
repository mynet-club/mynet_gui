/**
 * 通知类型定义
 */

// 后端返回的原始通知数据
export interface BackendNotification {
  id: string  // UUID
  type: string  // Laravel notification type
  notifiable_type: string
  notifiable_id: number
  data: {
    type: string  // notification category
    level: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    action_url?: {
      url: string
      text: string
    }
    metadata?: Record<string, any>
  }
  read_at: string | null
  created_at: string
  updated_at: string
}

// 前端使用的通知数据
export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string
  read: boolean
  actionUrl?: {
    url: string
    text: string
  }
  metadata?: Record<string, any>
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'node_status' | 'route_request' | 'route_status' | 'new_user_registered'

export interface NotificationStats {
  total: number
  unread: number
  read: number
  today: number
  this_week: number
}

export interface NotificationListParams {
  unread_only?: boolean
  page?: number
  per_page?: number
  type?: string
}

// 后端返回的列表响应
export interface BackendNotificationListResponse {
  success: boolean
  data: BackendNotification[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  unread_count: number
  message: string
  request_id: string
}

// 后端返回的未读数量响应
export interface BackendUnreadCountResponse {
  success: boolean
  data: {
    unread_count: number
  }
  message: string
  request_id: string
}

export interface NotificationListResponse {
  data: Notification[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface NotificationUnreadCountResponse {
  unread_count: number
}

export interface NotificationBatchDeleteParams {
  ids: string[]
}
