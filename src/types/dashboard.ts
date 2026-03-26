/**
 * Dashboard 数据类型定义
 * 用于支持从"入口集合页"到"状态决策页"的升级
 */

import type { Node } from './node'

/**
 * 健康状态枚举
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical'

/**
 * 节点摘要信息（用于异常展示）
 */
export interface NodeSummary {
  id: string | number
  node_name: string
  node_status: number
  last_seen: string | null
  offlineDuration?: number  // 离线时长（分钟）
}

/**
 * 路由摘要信息
 */
export interface RouteSummary {
  id: string | number
  name: string
  status: string
  created_at: string
}

/**
 * 异常项目集合
 */
export interface AbnormalItems {
  offlineNodes: NodeSummary[]        // 离线节点
  unconfiguredNodes: NodeSummary[]   // 未配置节点
  failedRoutes: RouteSummary[]       // 失败路由
}

/**
 * 待处理任务
 */
export interface PendingTask {
  type: 'offline_node' | 'pending_connection' | 'unconfigured_node' | 'failed_route'
  count: number
  message: string
  actionText: string
  actionPath: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Dashboard 主数据结构
 */
export interface DashboardData {
  // 基础统计
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
  totalRoutes: number
  activeRoutes: number
  lastUpdate: Date
  
  // 健康状态
  healthStatus: HealthStatus
  healthMessage: string
  healthIcon: string
  healthColor: string
  
  // 异常项目
  abnormalItems: AbnormalItems
  
  // 待处理任务
  pendingTasks: PendingTask[]
  
  // 组网统计（可选）
  friendConnections?: number
}

/**
 * 活动类型
 */
export type ActivityType = 
  | 'node_added'           // 新增节点
  | 'node_online'          // 节点上线
  | 'node_offline'         // 节点离线
  | 'node_deleted'         // 删除节点
  | 'route_created'        // 创建路由
  | 'route_deleted'        // 删除路由
  | 'route_connected'      // 路由连接成功
  | 'connection_request'   // 新的连接请求
  | 'connection_accepted'  // 连接请求已接受
  | 'connection_rejected'  // 连接请求已拒绝

/**
 * 活动记录
 */
export interface Activity {
  id: string                    // 唯一 ID
  type: ActivityType            // 活动类型
  message: string               // 显示消息
  timestamp: Date               // 发生时间
  link?: string                 // 关联链接（可选）
  metadata?: Record<string, any> // 元数据（可选）
}

/**
 * 活动配置
 */
export interface ActivityConfig {
  icon: string
  color: string
  priority: number
}

export const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  node_added: { icon: 'add_circle', color: 'positive', priority: 5 },
  node_online: { icon: 'wifi', color: 'positive', priority: 7 },
  node_offline: { icon: 'wifi_off', color: 'negative', priority: 8 },
  node_deleted: { icon: 'remove_circle', color: 'negative', priority: 4 },
  route_created: { icon: 'add_road', color: 'primary', priority: 5 },
  route_deleted: { icon: 'remove_road', color: 'warning', priority: 4 },
  route_connected: { icon: 'check_circle', color: 'positive', priority: 6 },
  connection_request: { icon: 'notification_important', color: 'warning', priority: 9 },
  connection_accepted: { icon: 'done_all', color: 'positive', priority: 6 },
  connection_rejected: { icon: 'block', color: 'grey', priority: 3 },
}

/**
 * 活动存储结构
 */
export interface ActivitiesStorage {
  version: number
  activities: Activity[]
  lastUpdate: string
}

// 存储配置
export const ACTIVITIES_STORAGE_KEY = 'mynet_dashboard_activities'
export const MAX_ACTIVITIES_STORED = 100
