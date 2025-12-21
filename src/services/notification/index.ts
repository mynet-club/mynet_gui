/**
 * 通知服务
 */

import { api } from '../api'
import debug from '../../utils/debug'
import type {
  Notification,
  BackendNotification,
  NotificationStats,
  NotificationListParams,
  NotificationListResponse,
  BackendNotificationListResponse,
  BackendUnreadCountResponse,
  NotificationBatchDeleteParams
} from '../../types/notification'

export class NotificationService {
  private readonly baseUrl = '/notifications'

  /**
   * 转换后端通知数据为前端格式
   */
  private transformNotification(backend: BackendNotification): Notification {
    const notification: Notification = {
      id: backend.id,
      title: backend.data.title,
      message: backend.data.message,
      type: backend.data.type as any,
      timestamp: backend.created_at,
      read: backend.read_at !== null
    }
    
    // 只有当 action_url 存在时才添加
    if (backend.data.action_url) {
      notification.actionUrl = backend.data.action_url
    }
    
    // 只有当 metadata 存在时才添加
    if (backend.data.metadata) {
      notification.metadata = backend.data.metadata
    }
    
    return notification
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params?: NotificationListParams): Promise<NotificationListResponse> {
    try {
      const response = await api.get<BackendNotificationListResponse>(this.baseUrl, { params })
      debug.log('📬 [NotificationService] 获取通知列表成功:', response.data)
      
      // 转换数据格式
      const transformed: NotificationListResponse = {
        data: response.data.data.map(n => this.transformNotification(n)),
        meta: {
          current_page: response.data.pagination.current_page,
          last_page: response.data.pagination.last_page,
          per_page: response.data.pagination.per_page,
          total: response.data.pagination.total
        }
      }
      
      return transformed
    } catch (error) {
      debug.error('📬 [NotificationService] 获取通知列表失败:', error)
      throw error
    }
  }

  /**
   * 获取未读数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<BackendUnreadCountResponse>(`${this.baseUrl}/unread-count`)
      debug.log('📬 [NotificationService] 获取未读数量成功:', response.data.data.unread_count)
      return response.data.data.unread_count
    } catch (error) {
      debug.error('📬 [NotificationService] 获取未读数量失败:', error)
      throw error
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await api.get<NotificationStats>(`${this.baseUrl}/stats`)
      debug.log('📬 [NotificationService] 获取统计信息成功:', response.data)
      return response.data
    } catch (error) {
      debug.error('📬 [NotificationService] 获取统计信息失败:', error)
      throw error
    }
  }

  /**
   * 标记已读
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${id}/read`)
      debug.log('📬 [NotificationService] 标记已读成功:', id)
    } catch (error) {
      debug.error('📬 [NotificationService] 标记已读失败:', error)
      throw error
    }
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/read-all`)
      debug.log('📬 [NotificationService] 全部标记已读成功')
    } catch (error) {
      debug.error('📬 [NotificationService] 全部标记已读失败:', error)
      throw error
    }
  }

  /**
   * 删除通知
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
      debug.log('📬 [NotificationService] 删除通知成功:', id)
    } catch (error) {
      debug.error('📬 [NotificationService] 删除通知失败:', error)
      throw error
    }
  }

  /**
   * 批量删除
   */
  async batchDelete(params: NotificationBatchDeleteParams): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/batch-delete`, params)
      debug.log('📬 [NotificationService] 批量删除成功:', params.ids)
    } catch (error) {
      debug.error('📬 [NotificationService] 批量删除失败:', error)
      throw error
    }
  }

  /**
   * 清空已读通知
   */
  async clearRead(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/clear-read`)
      debug.log('📬 [NotificationService] 清空已读通知成功')
    } catch (error) {
      debug.error('📬 [NotificationService] 清空已读通知失败:', error)
      throw error
    }
  }
}

// 导出单例
export const notificationService = new NotificationService()
