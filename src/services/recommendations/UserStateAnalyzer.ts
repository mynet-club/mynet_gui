/**
 * 用户状态分析器
 * 分析用户当前使用状态，判断处于哪个阶段
 */

import type { Node } from '../../types/node'
import type { IPPool } from '../../types/ippool'

/**
 * 用户状态枚举
 */
export enum UserState {
  /** 新用户，刚注册 */
  NewUser = 'new_user',
  /** 已创建IP池，但无设备 */
  HasIPPool = 'has_ippool',
  /** 有单个设备 */
  SingleDevice = 'single_device',
  /** 有多个设备，但无连接 */
  MultipleDevices = 'multiple_devices',
  /** 有设备和连接，但无好友 */
  HasConnectionsNoFriends = 'has_connections_no_friends',
  /** 有好友，但未连接好友设备 */
  HasFriendsNoConnections = 'has_friends_no_connections',
  /** 有好友和跨用户连接 */
  HasCrossUserConnections = 'has_cross_user_connections',
  /** 成熟用户，有服务 */
  HasServices = 'has_services',
  /** 完整功能用户 */
  FullyActive = 'fully_active'
}

/**
 * 用户状态分析结果
 */
export interface UserStateAnalysis {
  /** 当前状态 */
  state: UserState
  /** 状态详情 */
  details: {
    ipPoolCount: number
    deviceCount: number
    ownDeviceCount: number
    friendDeviceCount: number
    friendCount: number
    connectionCount: number
    autoConnectionCount: number
    crossUserConnectionCount: number
    serviceCount: number
    pendingConnectionRequests: number
    pendingFriendRequests: number
    incompleteNodes: any[]
    ipPoolUtilization?: number
  }
  /** 已完成的里程碑 */
  completedMilestones: string[]
  /** 下一步可能的行动 */
  possibleActions: string[]
}

/**
 * 用户状态分析器
 */
export class UserStateAnalyzer {
  /**
   * 分析用户状态
   */
  static analyzeUserState(data: {
    ipPools?: IPPool[]
    nodes?: Node[]
    friends?: any[]
    routes?: any[]
    connections?: any[]
    services?: any[]
    friendRequests?: any[]
  }): UserStateAnalysis {
    // 检测未完成配置的节点 (status === -1)
    const incompleteNodes = data.nodes?.filter((n: any) => n.status === -1) || []
    
    // 计算IP池利用率（暂时用简单估算，待后端API支持）
    const totalIPCapacity = data.ipPools?.reduce((sum, pool) => sum + (pool as any).capacity || 10, 0) || 0
    const allocatedIPs = data.nodes?.length || 0
    const ipPoolUtilization = totalIPCapacity > 0 ? (allocatedIPs / totalIPCapacity) * 100 : 0
    
    const details = {
      ipPoolCount: data.ipPools?.length || 0,
      deviceCount: data.nodes?.length || 0,
      ownDeviceCount: data.nodes?.length || 0, // 暂时假设所有设备都是自己的
      friendDeviceCount: 0, // 暂时设为0，待API支持
      friendCount: data.friends?.length || 0,
      connectionCount: data.connections?.length || 0,
      autoConnectionCount: data.connections?.filter((c: any) => c.is_auto)?.length || 0,
      crossUserConnectionCount: data.connections?.filter((c: any) => !c.is_auto)?.length || 0,
      serviceCount: data.services?.length || 0,
      pendingConnectionRequests: data.routes?.filter((r: any) => r.status === 'pending')?.length || 0,
      pendingFriendRequests: data.friendRequests?.filter((r: any) => r.status === 'pending')?.length || 0,
      incompleteNodes,
      ipPoolUtilization
    }

    const completedMilestones: string[] = []
    const possibleActions: string[] = []

    // 判断当前状态
    let state: UserState

    // 按照文档定义的精确边界条件判断状态
    if (details.ipPoolCount === 0 && details.deviceCount === 0) {
      // 1. 新用户阶段
      state = UserState.NewUser
      possibleActions.push('create_ippool')
    } else if (details.ipPoolCount >= 1 && details.deviceCount === 0) {
      // 2. 已创建IP池但未添加设备
      state = UserState.HasIPPool
      completedMilestones.push('created_ippool')
      possibleActions.push('add_first_device')
    } else if (details.deviceCount === 1 && details.connectionCount === 0) {
      // 3. 单设备用户
      state = UserState.SingleDevice
      completedMilestones.push('created_ippool', 'added_first_device')
      possibleActions.push('add_second_device', 'invite_friend')
    } else if (details.deviceCount >= 2 && details.connectionCount >= 1 && details.friendCount === 0) {
      // 4. 多设备用户（自己的设备已自动连接）
      state = UserState.MultipleDevices
      completedMilestones.push('created_ippool', 'added_first_device', 'added_multiple_devices')
      possibleActions.push('invite_friend')
      
      // 如果有连接，推荐创建服务
      if (details.connectionCount >= 1) {
        possibleActions.push('setup_service')
      }
    } else if (details.connectionCount >= 1 && details.friendCount === 0 && details.deviceCount >= 2) {
      // 5. 有连接但无好友
      state = UserState.HasConnectionsNoFriends
      completedMilestones.push('created_ippool', 'added_first_device', 'added_multiple_devices')
      possibleActions.push('invite_friend')
    } else if (details.friendCount >= 1 && details.crossUserConnectionCount === 0) {
      // 6. 有好友但无跨用户连接
      state = UserState.HasFriendsNoConnections
      completedMilestones.push('created_ippool', 'added_first_device', 'has_friends')
      possibleActions.push('connect_to_friend_device')
    } else if (details.crossUserConnectionCount >= 1 && details.serviceCount === 0) {
      // 7. 有跨用户连接但无服务
      state = UserState.HasCrossUserConnections
      completedMilestones.push('created_ippool', 'added_first_device', 'has_friends', 'has_cross_user_connections')
      possibleActions.push('setup_service')
      
      // 好友少于3个时推荐继续邀请
      if (details.friendCount < 3) {
        possibleActions.push('invite_more_friends')
      }
    } else if (details.serviceCount >= 1 && details.serviceCount < 5) {
      // 8. 已创建服务（1-4个）
      state = UserState.HasServices
      completedMilestones.push('created_ippool', 'added_first_device', 'has_friends', 'has_cross_user_connections', 'has_services')
      
      // 好友少于3个时推荐继续邀请
      if (details.friendCount < 3) {
        possibleActions.push('invite_more_friends')
      }
      
      possibleActions.push('optimize_network')
    } else if (
      details.deviceCount >= 2 &&
      details.friendCount >= 1 &&
      details.crossUserConnectionCount >= 1 &&
      details.serviceCount >= 1
    ) {
      // 9. 完全活跃用户
      state = UserState.FullyActive
      completedMilestones.push('created_ippool', 'added_first_device', 'has_friends', 'has_cross_user_connections', 'has_services')
      
      // 服务数量较多时推荐质量检查
      if (details.serviceCount > 5) {
        possibleActions.push('check_service_quality')
      }
      
      possibleActions.push('check_route_health', 'optimize_network')
    } else {
      // 兜底状态
      state = UserState.NewUser
      possibleActions.push('create_ippool')
    }

    // ========== 紧急处理类推荐 (优先级0) ==========
    
    // 有待处理的好友请求 - 最高优先级
    if (details.pendingFriendRequests > 0) {
      possibleActions.unshift('approve_pending_friend_requests')
    }
    
    // 有未完成配置的节点 - 紧急
    if (details.incompleteNodes.length > 0) {
      possibleActions.unshift('complete_node_config')
    }
    
    // 有待处理的连接请求
    if (details.pendingConnectionRequests > 0) {
      possibleActions.unshift('approve_pending_requests')
    }
    
    // IP资源池满载 - 紧急
    if (details.ipPoolUtilization && details.ipPoolUtilization >= 95) {
      possibleActions.unshift('create_ippool_urgent')
    } else if (details.ipPoolUtilization && details.ipPoolUtilization >= 80) {
      // IP资源池接近满载 - 推荐创建新池
      possibleActions.push('create_ippool')
    }
    
    // ========== 功能扩展建议 ==========
    
    // 有连接时可以管理连接
    if (details.deviceCount > 0 && details.connectionCount > 0) {
      possibleActions.push('manage_connections')
    }

    return {
      state,
      details,
      completedMilestones,
      possibleActions
    }
  }

  /**
   * 获取状态描述
   */
  static getStateDescription(state: UserState): string {
    const descriptions: Record<UserState, string> = {
      [UserState.NewUser]: '欢迎来到 MyNet！让我们开始配置你的虚拟网络',
      [UserState.HasIPPool]: '很好！现在添加你的第一个设备',
      [UserState.SingleDevice]: '太棒了！你可以添加更多设备，或者邀请好友加入',
      [UserState.MultipleDevices]: '你的设备已经自动连接。考虑邀请好友扩展网络',
      [UserState.HasConnectionsNoFriends]: '你的个人网络运行良好。邀请好友体验跨用户连接',
      [UserState.HasFriendsNoConnections]: '你已经有好友了！可以连接他们的设备',
      [UserState.HasCrossUserConnections]: '网络连接建立完成！探索或分享服务吧',
      [UserState.HasServices]: '你已经掌握了 MyNet 的核心功能',
      [UserState.FullyActive]: '你是 MyNet 高级用户！持续优化和分享'
    }
    return descriptions[state]
  }
}
