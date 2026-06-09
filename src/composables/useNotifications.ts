/**
 * 通知状态管理 Composable
 * 通知通过 WebSocket 实时推送（src/boot/websocket.ts 订阅 private-user.{userId}）。
 * 不再使用 HTTP 轮询。
 */

import { ref, computed } from 'vue'
import { notificationService } from '../services/notification'
import debug from '../utils/debug'
import type { Notification, NotificationListParams } from '../types/notification'

// 单例状态 - 所有组件共享同一个通知状态
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const perPage = ref(20)
const total = ref(0)
const lastPage = ref(1)
let initialized = false

/**
 * 接收 WebSocket 推送的通知 payload，由 boot/websocket.ts 调用。
 * 将新通知插入列表头部并自增未读数。
 */
export function handleNotificationBroadcast(payload: any) {
  if (!payload || !payload.id) {
    debug.warn('📬 [useNotifications] 收到无效通知 payload', payload)
    return
  }
  // 避免重复（同 id 已存在则忽略）
  if (notifications.value.some(n => n.id === payload.id)) return

  const notification: Notification = {
    id: payload.id,
    type: payload.type || 'info',
    title: payload.title || '',
    message: payload.message || '',
    data: payload.data,
    read: false,
    created_at: payload.created_at || new Date().toISOString(),
    ...payload
  } as Notification

  notifications.value.unshift(notification)
  unreadCount.value += 1
  total.value += 1
  debug.log('📬 [useNotifications] 收到实时通知:', notification.title)
}

export function useNotifications() {
  // 状态（使用共享的单例状态）

  // 计算属性
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  const displayUnreadCount = computed(() =>
    unreadCount.value > 99 ? '99+' : unreadCount.value.toString()
  )

  /**
   * 加载通知列表
   */
  async function loadNotifications(params?: NotificationListParams) {
    try {
      loading.value = true
      const response = await notificationService.getNotifications({
        page: currentPage.value,
        per_page: perPage.value,
        ...params
      })

      notifications.value = response.data
      currentPage.value = response.meta.current_page
      lastPage.value = response.meta.last_page
      total.value = response.meta.total

      debug.log('📬 [useNotifications] 加载通知成功:', notifications.value.length, '条')
    } catch (error) {
      debug.error('📬 [useNotifications] 加载通知失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新未读数量
   */
  async function refreshUnreadCount() {
    try {
      unreadCount.value = await notificationService.getUnreadCount()
      debug.log('📬 [useNotifications] 刷新未读数量:', unreadCount.value)
    } catch (error) {
      debug.error('📬 [useNotifications] 刷新未读数量失败:', error)
    }
  }

  /**
   * 标记为已读
   */
  async function markAsRead(id: string) {
    try {
      await notificationService.markAsRead(id)

      // 更新本地状态
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.read) {
        notification.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      debug.log('📬 [useNotifications] 标记已读成功:', id)
    } catch (error) {
      debug.error('📬 [useNotifications] 标记已读失败:', error)
      throw error
    }
  }

  /**
   * 全部标记为已读
   */
  async function markAllAsRead() {
    try {
      await notificationService.markAllAsRead()

      // 更新本地状态
      notifications.value.forEach(n => {
        n.read = true
      })
      unreadCount.value = 0

      debug.log('📬 [useNotifications] 全部标记已读成功')
    } catch (error) {
      debug.error('📬 [useNotifications] 全部标记已读失败:', error)
      throw error
    }
  }

  /**
   * 删除通知
   */
  async function deleteNotification(id: string) {
    try {
      await notificationService.deleteNotification(id)

      // 更新本地状态
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (notification && !notification.read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
        total.value = Math.max(0, total.value - 1)
      }

      debug.log('📬 [useNotifications] 删除通知成功:', id)
    } catch (error) {
      debug.error('📬 [useNotifications] 删除通知失败:', error)
      throw error
    }
  }

  /**
   * 批量删除
   */
  async function batchDelete(ids: string[]) {
    try {
      await notificationService.batchDelete({ ids })

      // 更新本地状态
      const deletedUnreadCount = notifications.value
        .filter(n => ids.includes(n.id) && !n.read)
        .length

      notifications.value = notifications.value.filter(n => !ids.includes(n.id))
      unreadCount.value = Math.max(0, unreadCount.value - deletedUnreadCount)
      total.value = Math.max(0, total.value - ids.length)

      debug.log('📬 [useNotifications] 批量删除成功:', ids.length, '条')
    } catch (error) {
      debug.error('📬 [useNotifications] 批量删除失败:', error)
      throw error
    }
  }

  /**
   * 清空已读通知
   */
  async function clearRead() {
    try {
      await notificationService.clearRead()

      // 更新本地状态
      const readCount = notifications.value.filter(n => n.read).length
      notifications.value = notifications.value.filter(n => !n.read)
      total.value = Math.max(0, total.value - readCount)

      debug.log('📬 [useNotifications] 清空已读通知成功')
    } catch (error) {
      debug.error('📬 [useNotifications] 清空已读通知失败:', error)
      throw error
    }
  }

  /**
   * 只显示未读
   */
  async function showUnreadOnly() {
    await loadNotifications({ unread_only: true })
  }

  /**
   * 显示所有通知
   */
  async function showAll() {
    await loadNotifications()
  }

  /**
   * 翻页
   */
  async function goToPage(page: number) {
    currentPage.value = page
    await loadNotifications()
  }

  /**
   * 启动通知接收（已迁移至 WebSocket，此方法保留以保持 API 兼容，不再启动轮询）
   * @deprecated 通知现在通过 WebSocket 实时推送，无需轮询
   */
  function startPolling(_interval = 60000) {
    debug.log('📬 [useNotifications] startPolling 已废弃 — 通知通过 WebSocket 推送')
  }

  /**
   * 停止接收（兼容旧 API，无副作用）
   * @deprecated
   */
  function stopPolling() {
    // no-op
  }

  /**
   * 获取通知图标
   */
  function getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      system: 'settings',
      node_status: 'dns',
      route_request: 'alt_route',
      route_status: 'route',
      new_user_registered: 'person_add'
    }
    return iconMap[type] || 'notifications'
  }

  /**
   * 获取通知颜色
   */
  function getNotificationColor(type: string): string {
    const colorMap: Record<string, string> = {
      info: 'blue',
      success: 'green',
      warning: 'orange',
      error: 'red',
      system: 'purple'
    }
    return colorMap[type] || 'primary'
  }

  // 只在首次初始化时加载未读数量（单例模式，避免重复请求）
  if (!initialized) {
    initialized = true
    refreshUnreadCount()
    debug.log('📬 [useNotifications] 单例初始化完成')
  }

  return {
    // 状态
    notifications,
    unreadCount,
    loading,
    currentPage,
    perPage,
    total,
    lastPage,

    // 计算属性
    unreadNotifications,
    hasUnread,
    displayUnreadCount,

    // 方法
    loadNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    batchDelete,
    clearRead,
    showUnreadOnly,
    showAll,
    goToPage,
    startPolling,
    stopPolling,
    getNotificationIcon,
    getNotificationColor
  }
}
