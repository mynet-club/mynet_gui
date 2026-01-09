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
  }): UserStateAnalysis {
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
      pendingConnectionRequests: data.routes?.filter((r: any) => r.status === 'pending')?.length || 0
    }

    const completedMilestones: string[] = []
    const possibleActions: string[] = []

    // 判断当前状态
    let state: UserState

    if (details.ipPoolCount === 0) {
      state = UserState.NewUser
      possibleActions.push('create_ippool')
    } else {
      completedMilestones.push('created_ippool')

      if (details.deviceCount === 0) {
        state = UserState.HasIPPool
        possibleActions.push('add_first_device')
      } else if (details.deviceCount === 1) {
        completedMilestones.push('added_first_device')
        state = UserState.SingleDevice
        possibleActions.push('add_second_device', 'invite_friend', 'join_via_invite')
      } else {
        completedMilestones.push('added_multiple_devices')

        if (details.friendCount === 0) {
          state = UserState.HasConnectionsNoFriends
          possibleActions.push('invite_friend', 'join_via_invite')
        } else {
          completedMilestones.push('has_friends')

          if (details.crossUserConnectionCount === 0) {
            state = UserState.HasFriendsNoConnections
            possibleActions.push('connect_to_friend_device')
          } else {
            completedMilestones.push('has_cross_user_connections')

            if (details.serviceCount === 0) {
              state = UserState.HasCrossUserConnections
              possibleActions.push('setup_service', 'browse_services')
            } else {
              completedMilestones.push('has_services')
              state = UserState.FullyActive
              possibleActions.push('optimize_network', 'share_service', 'monitor_quality')
            }
          }
        }
      }
    }

    // 通用的可能行动
    if (details.pendingConnectionRequests > 0) {
      possibleActions.unshift('approve_pending_requests')
    }

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
