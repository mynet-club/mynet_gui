/**
 * 全站统一的节点状态管理工具
 * 提供一致的状态显示、颜色、图标等功能
 */

import { NodeStatus, NODE_STATUS } from '../types/node'

/**
 * 状态显示配置
 */
export interface StatusConfig {
  text: string
  color: string
  icon: string
  description?: string
}

/**
 * 数字状态码映射表
 */
export const NODE_STATUS_CONFIG: Record<number, StatusConfig> = {
  [NODE_STATUS.UNCONFIGURED]: {
    text: '未完成配置',
    color: 'warning',
    icon: 'settings',
    description: '节点尚未完成基础配置'
  },
  [NODE_STATUS.DISABLED]: {
    text: '已禁用',
    color: 'grey',
    icon: 'cancel',
    description: '节点已被管理员禁用'
  },
  [NODE_STATUS.ENABLED]: {
    text: '已启用',
    color: 'orange',
    icon: 'check_circle_outline',
    description: '节点已启用但暂未在线'
  },
  [NODE_STATUS.ONLINE]: {
    text: '在线',
    color: 'positive',
    icon: 'check_circle',
    description: '节点正常在线运行'
  },
  [NODE_STATUS.MAINTENANCE]: {
    text: '维护模式',
    color: 'info',
    icon: 'build',
    description: '节点处于维护模式'
  }
}

/**
 * 字符串状态码映射表（向后兼容）
 */
export const STRING_STATUS_CONFIG: Record<string, StatusConfig> = {
  'active': {
    text: '在线',
    color: 'positive',
    icon: 'check_circle',
    description: '节点正常在线运行'
  },
  'inactive': {
    text: '离线',
    color: 'negative',
    icon: 'cancel',
    description: '节点离线或不可达'
  },
  'pending': {
    text: '待连接',
    color: 'warning',
    icon: 'schedule',
    description: '节点等待连接'
  },
  'maintenance': {
    text: '维护模式',
    color: 'info',
    icon: 'build',
    description: '节点处于维护模式'
  },
  'disabled': {
    text: '已禁用',
    color: 'grey',
    icon: 'cancel',
    description: '节点已被禁用'
  }
}

/**
 * 默认状态配置（未知状态）
 */
export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  text: '未知',
  color: 'grey',
  icon: 'help',
  description: '无法确定节点状态'
}

/**
 * 节点状态管理器
 */
export class NodeStatusManager {
  /**
   * 获取状态配置
   * @param status 节点状态（数字或字符串）
   * @returns 状态配置对象
   */
  static getStatusConfig(status?: NodeStatus | string | number): StatusConfig {
    if (status === undefined || status === null) {
      return DEFAULT_STATUS_CONFIG
    }

    // 优先处理数字状态码
    if (typeof status === 'number') {
      return NODE_STATUS_CONFIG[status] || DEFAULT_STATUS_CONFIG
    }

    // 处理字符串状态码
    if (typeof status === 'string') {
      return STRING_STATUS_CONFIG[status.toLowerCase()] || DEFAULT_STATUS_CONFIG
    }

    return DEFAULT_STATUS_CONFIG
  }

  /**
   * 获取状态文本
   * @param status 节点状态
   * @returns 状态文本
   */
  static getStatusText(status?: NodeStatus | string | number): string {
    return this.getStatusConfig(status).text
  }

  /**
   * 获取状态颜色
   * @param status 节点状态
   * @returns Quasar颜色名称
   */
  static getStatusColor(status?: NodeStatus | string | number): string {
    return this.getStatusConfig(status).color
  }

  /**
   * 获取状态图标
   * @param status 节点状态
   * @returns Material Icons图标名称
   */
  static getStatusIcon(status?: NodeStatus | string | number): string {
    return this.getStatusConfig(status).icon
  }

  /**
   * 获取状态描述
   * @param status 节点状态
   * @returns 状态详细描述
   */
  static getStatusDescription(status?: NodeStatus | string | number): string {
    return this.getStatusConfig(status).description || ''
  }

  /**
   * 判断状态是否为在线状态
   * @param status 节点状态
   * @returns 是否在线
   */
  static isOnline(status?: NodeStatus | string | number): boolean {
    if (typeof status === 'number') {
      return status === NODE_STATUS.ONLINE
    }
    if (typeof status === 'string') {
      return status.toLowerCase() === 'active'
    }
    return false
  }

  /**
   * 判断状态是否为离线状态
   * @param status 节点状态
   * @returns 是否离线
   */
  static isOffline(status?: NodeStatus | string | number): boolean {
    if (typeof status === 'number') {
      return status === NODE_STATUS.DISABLED
    }
    if (typeof status === 'string') {
      return status.toLowerCase() === 'inactive'
    }
    return false
  }

  /**
   * 判断状态是否需要配置
   * @param status 节点状态
   * @returns 是否需要配置
   */
  static needsConfiguration(status?: NodeStatus | string | number): boolean {
    if (typeof status === 'number') {
      return status === NODE_STATUS.UNCONFIGURED
    }
    if (typeof status === 'string') {
      return status.toLowerCase() === 'pending'
    }
    return false
  }

  /**
   * 标准化状态值（优先使用数字状态码）
   * @param nodeStatusNum 数字状态码
   * @param statusString 字符串状态
   * @returns 标准化的状态值
   */
  static normalizeStatus(
    nodeStatusNum?: number | string | null,
    statusString?: string | number | null
  ): number | string {
    // 优先使用数字状态码
    if (typeof nodeStatusNum === 'number') {
      return nodeStatusNum
    }
    
    // 如果第一个参数是字符串，检查是否为数字字符串
    if (typeof nodeStatusNum === 'string') {
      const num = parseInt(nodeStatusNum, 10)
      if (!isNaN(num)) {
        return num
      }
      return nodeStatusNum
    }
    
    // 回退到第二个参数
    if (typeof statusString === 'number') {
      return statusString
    }
    
    if (typeof statusString === 'string') {
      const num = parseInt(statusString, 10)
      if (!isNaN(num)) {
        return num
      }
      return statusString
    }

    // 都没有则返回未知状态
    return NODE_STATUS.UNCONFIGURED
  }

  /**
   * 获取所有可用的状态列表
   * @returns 状态列表
   */
  static getAllStatuses(): Array<{ value: number | string; config: StatusConfig }> {
    const statuses: Array<{ value: number | string; config: StatusConfig }> = []
    
    // 添加数字状态码
    Object.entries(NODE_STATUS_CONFIG).forEach(([value, config]) => {
      statuses.push({ value: parseInt(value), config })
    })
    
    // 添加字符串状态码（去重）
    Object.entries(STRING_STATUS_CONFIG).forEach(([value, config]) => {
      // 检查是否已有相同文本的数字状态码
      const exists = statuses.some(s => s.config.text === config.text)
      if (!exists) {
        statuses.push({ value, config })
      }
    })
    
    return statuses
  }
}

// 导出便捷函数
export const getNodeStatusText = NodeStatusManager.getStatusText
export const getNodeStatusColor = NodeStatusManager.getStatusColor
export const getNodeStatusIcon = NodeStatusManager.getStatusIcon
export const getNodeStatusDescription = NodeStatusManager.getStatusDescription
export const isNodeOnline = NodeStatusManager.isOnline
export const isNodeOffline = NodeStatusManager.isOffline
export const nodeNeedsConfiguration = NodeStatusManager.needsConfiguration
export const normalizeNodeStatus = NodeStatusManager.normalizeStatus
