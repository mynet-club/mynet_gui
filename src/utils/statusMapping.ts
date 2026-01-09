/**
 * 全站统一的状态映射工具
 * 
 * 核心职责：
 * 1. 将技术状态码映射为用户友好的三色系统
 * 2. 提供统一的状态展示配置（文案、颜色、图标）
 * 3. 确保全站状态展示的一致性
 * 
 * 使用场景：
 * - StatusDisplay 组件
 * - 各业务卡片组件
 * - 列表页状态列
 */

import { NODE_STATUS } from '../types/node'

/**
 * 统一的状态语义类型（三色系统）
 */
export type StatusSemantic = 'available' | 'pending' | 'unavailable' | 'unknown'

/**
 * 状态显示配置
 */
export interface StatusDisplay {
  semantic: StatusSemantic        // 语义分类
  text: string                    // 用户可见文案
  detailText: string              // 详细说明文案
  icon: string                    // Material图标名称
  color: string                   // Quasar颜色名称
  bgColor: string                 // 背景色（HEX）
  textColor: string               // 文字颜色
}

/**
 * 获取用户友好的状态显示配置
 * 
 * @param status 节点状态码
 * @returns 状态显示配置对象
 * 
 * @example
 * ```ts
 * const display = getUserFriendlyStatus(NODE_STATUS.ONLINE)
 * // => { semantic: 'available', text: '在线', icon: 'wifi', color: 'positive', ... }
 * ```
 */
export function getUserFriendlyStatus(status: number | string): StatusDisplay {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  
  switch (statusNum) {
    case NODE_STATUS.ONLINE:
      return {
        semantic: 'available',
        text: '在线',
        detailText: '可连接',
        icon: 'wifi',
        color: 'positive',
        bgColor: '#f0fdf4',
        textColor: '#48bb78'
      }
    
    case NODE_STATUS.ENABLED:
      return {
        semantic: 'pending',
        text: '待连接',
        detailText: '已启用等待上线',
        icon: 'schedule',
        color: 'warning',
        bgColor: '#fffaf0',
        textColor: '#ed8936'
      }
    
    case NODE_STATUS.MAINTENANCE:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detailText: '维护中',
        icon: 'build',
        color: 'grey',
        bgColor: '#f5f7fa',
        textColor: '#718096'
      }
    
    case NODE_STATUS.DISABLED:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detailText: '已禁用',
        icon: 'block',
        color: 'grey',
        bgColor: '#f5f7fa',
        textColor: '#718096'
      }
    
    case NODE_STATUS.UNCONFIGURED:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detailText: '未配置',
        icon: 'settings',
        color: 'grey',
        bgColor: '#f5f7fa',
        textColor: '#718096'
      }
    
    default:
      return {
        semantic: 'unknown',
        text: '未知',
        detailText: '状态未知',
        icon: 'help',
        color: 'grey',
        bgColor: '#f5f7fa',
        textColor: '#718096'
      }
  }
}

/**
 * 判断状态是否可连接
 * 
 * @param status 节点状态码
 * @returns 是否可连接
 */
export function isStatusConnectable(status: number | string): boolean {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  return statusNum === NODE_STATUS.ONLINE
}

/**
 * 判断状态是否处于等待中
 * 
 * @param status 节点状态码
 * @returns 是否等待中
 */
export function isStatusPending(status: number | string): boolean {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  return statusNum === NODE_STATUS.ENABLED
}

/**
 * 判断状态是否不可用
 * 
 * @param status 节点状态码
 * @returns 是否不可用
 */
export function isStatusUnavailable(status: number | string): boolean {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  return [
    NODE_STATUS.DISABLED,
    NODE_STATUS.UNCONFIGURED,
    NODE_STATUS.MAINTENANCE
  ].includes(statusNum)
}

/**
 * 获取状态的主操作文案
 * 根据状态智能判定用户最可能的操作
 * 
 * @param status 节点状态码
 * @returns 主操作文案
 */
export function getPrimaryActionText(status: number | string): string {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  
  switch (statusNum) {
    case NODE_STATUS.ONLINE:
      return '管理'
    
    case NODE_STATUS.ENABLED:
      return '等待上线'
    
    case NODE_STATUS.DISABLED:
      return '启用'
    
    case NODE_STATUS.UNCONFIGURED:
      return '配置'
    
    case NODE_STATUS.MAINTENANCE:
      return '维护中'
    
    default:
      return '查看'
  }
}

/**
 * 获取状态的操作按钮配置
 * 
 * @param status 节点状态码
 * @returns 按钮配置
 */
export function getPrimaryActionConfig(status: number | string) {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  
  switch (statusNum) {
    case NODE_STATUS.ONLINE:
      return {
        label: '连接',
        color: 'positive',
        icon: 'link',
        disabled: false
      }
    
    case NODE_STATUS.ENABLED:
      return {
        label: '等待上线',
        color: 'warning',
        icon: 'schedule',
        disabled: true
      }
    
    case NODE_STATUS.DISABLED:
      return {
        label: '启用',
        color: 'primary',
        icon: 'play_arrow',
        disabled: false
      }
    
    case NODE_STATUS.UNCONFIGURED:
      return {
        label: '配置',
        color: 'primary',
        icon: 'settings',
        disabled: false
      }
    
    case NODE_STATUS.MAINTENANCE:
    default:
      return {
        label: '不可用',
        color: 'grey',
        icon: 'block',
        disabled: true
      }
  }
}
