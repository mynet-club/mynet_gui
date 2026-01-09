/**
 * 智能推荐引擎
 * 根据用户状态生成个性化的下一步行动建议
 */

import { UserStateAnalyzer, type UserStateAnalysis } from './UserStateAnalyzer'
import type { RouteLocationRaw } from 'vue-router'

/**
 * 推荐行动
 */
export interface RecommendedAction {
  /** 行动ID */
  id: string
  /** 优先级 (0-4, 数字越小优先级越高) */
  priority: number
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 图标 */
  icon: string
  /** 行动按钮文字 */
  actionLabel: string
  /** 路由 */
  route?: RouteLocationRaw
  /** 自定义处理函数 */
  handler?: () => void
  /** 预计完成时间（分钟） */
  estimatedMinutes?: number
  /** 类别 */
  category: 'setup' | 'network' | 'social' | 'service' | 'optimization'
  /** 目标对象ID（用于去重） */
  target?: string
}

/**
 * 推荐引擎
 */
export class RecommendationEngine {
  /**
   * 生成推荐行动
   */
  static generateRecommendations(analysis: UserStateAnalysis): RecommendedAction[] {
    const recommendations: RecommendedAction[] = []
    const { possibleActions, details } = analysis

    // 根据可能的行动生成推荐
    possibleActions.forEach(actionId => {
      const action = this.getActionDefinition(actionId, details)
      if (action) {
        recommendations.push(action)
      }
    })

    // 去重处理
    const deduplicated = this.deduplicateRecommendations(recommendations)

    // 按优先级排序（优先级数字越小越高）
    deduplicated.sort((a, b) => a.priority - b.priority)

    return deduplicated
  }

  /**
   * 去重推荐
   */
  private static deduplicateRecommendations(recommendations: RecommendedAction[]): RecommendedAction[] {
    const seen = new Map<string, RecommendedAction>()
优先级0 - 紧急处理类 ==========
      
      approve_pending_friend_requests: {
        id: 'approve_pending_friend_requests',
        priority: 0,
        title: `处理 ${details.pendingFriendRequests} 个好友请求`,
        description: '有好友申请，快去审批吧',
        icon: 'person_add',
        actionLabel: '立即处理',
        route: { name: 'social' },
        estimatedMinutes: 1,
        category: 'social'
      },

      complete_node_config: {
        id: 'complete_node_config',
        priority: 0,
        title: `完成 ${details.incompleteNodes.length} 个节点的配置`,
        description: '有节点尚未完成配置，需要补充网络参数和密钥',
        icon: 'warning',
        actionLabel: '完成配置',
        route: { name: 'nodes' },
        estimatedMinutes: 3,
        category: 'setup',
        target: details.incompleteNodes[0]?.id?.toString()
      },

      approve_pending_requests: {
        id: 'approve_pending_requests',
        priority: 0,
        title: `审批 ${details.pendingConnectionRequests} 个连接请求`,
        description: '有好友请求连接你的设备，快去审批吧',
        icon: 'notification_important',
        actionLabel: '立即处理',
        route: { name: 'connections' },
        estimatedMinutes: 1,
        category: 'network'
      },

      create_ippool_urgent: {
        id: 'create_ippool_urgent',
        priority: 0,
        title: 'IP资源即将耗尽！',
        description: `当前IP池使用率已达 ${details.ipPoolUtilization?.toFixed(0)}%，建议立即创建新资源池`,
        icon: 'error',
        actionLabel: '创建新资源池',
        route: { name: 'ippools' },
        estimatedMinutes: 2,
        category: 'setup'
      },

      // ========== 优先级1 - 新手引导类 (0→1) ==========
      
      create_ippool: {
        id: 'create_ippool',
        priority: 1,
        title: '创建 IP 资源池',
        description: '为你的虚拟网络分配 IP 地址段，这是使用 MyNet 的第一步',
        icon: 'pool',
        actionLabel: '创建资源池',
        route: { name: 'ippools' },
        estimatedMinutes: 2,
        category: 'setup'
      },

      add_first_device: {
        id: 'add_first_device',
        priority: 1,
        title: '添加第一个设备',
        description: '添加你的电脑、手机或服务器，开始构建虚拟网络',
        icon: 'devices',
        actionLabel: '添加设备',
        route: { name: 'nodes' },
        estimatedMinutes: 3,
        category: 'setup'
      },

      create_first_service: {
        id: 'create_first_service',
        priority: 1,
        title: '创建你的第一个服务',
        description: '分享文件、搭建网站、运行游戏服务器...让你的网络更有价值',
        icon: 'cloud_upload',
        actionLabel: '创建服务',
        route: { name: 'services' },
        estimatedMinutes: 5,
        category: 'service'
      },

      // ========== 优先级2 - 功能扩展类 (1→N) ==========
      
      add_second_device: {
        id: 'add_second_device',
        priority: 2,
        title: '添加更多设备',
        description: '添加第二个设备，它们会自动建立连接。你将拥有一个私有网络',
        icon: 'add_circle',
        actionLabel: '添加设备',
        route: { name: 'nodes' },
        estimatedMinutes: 3,
        category: 'setup'
      },

      connect_to_friend_device: {
        id: 'connect_to_friend_device',
        priority: 2,
        title: '连接好友的设备',
        description: `你有 ${details.friendCount} 个好友。与他们的设备建立连接，体验跨用户网络`,
        icon: 'link',
        actionLabel: '查看好友设备',
        route: { name: 'social' },
        estimatedMinutes: 2,
        category: 'network'
      },

      setup_service: {
        id: 'setup_service',
        priority: 2,
        title: '创建服务',
        description: '分享文件、搭建网站、运行游戏服务器...让你的网络更有价值',
        icon: 'cloud_upload',
        actionLabel: '配置服务',
        route: { name: 'services' },
        estimatedMinutes: 5,
        category: 'service'
      },

      expand_ippool: {
        id: 'expand_ippool',
        priority: 2,
        title: '扩容IP资源池',
        description: `当前IP池使用率 ${details.ipPoolUtilization?.toFixed(0)}%，建议创建新资源池`,
        icon: 'add_box',
        actionLabel: '创建新资源池',
        route: { name: 'ippools' },
        estimatedMinutes: 2,
        category: 'setup'
      },

      manage_connections: {
        id: 'manage_connections',
        priority: 2,
        title: '管理你的连接',
        description: `查看和管理 ${details.connectionCount} 个连接的状态和质量`,
        icon: 'hub',
        actionLabel: '查看连接',
        route: { name: 'connections' },
        estimatedMinutes: 3,
        category: 'network'
      },

      // ========== 优先级3 - 社交增强类 ==========
      
      invite_friend: {
        id: 'invite_friend',
        priority: 3,
        title: '邀请好友加入',
        description: '生成邀请码分享给朋友，一起构建跨用户的虚拟网络',
        icon: 'person_add',
        actionLabel: '邀请好友',
        route: { name: 'social' },
        estimatedMinutes: 2,
        category: 'social'
      },

      invite_more_friends: {
        id: 'invite_more_friends',
        priority: 3,
        title: '邀请更多好友',
        description: `你有 ${details.friendCount} 个好友，邀请更多人加入让网络更有趣`,
        icon: 'group_add',
        actionLabel: '邀请好友',
        route: { name: 'social' },
        estimatedMinutes: 2,
        category: 'social'
      },

      connect_with_friend: {
        id: 'connect_with_friend',
        priority: 3,
        title: '与好友建立连接',
        description: '与更多好友的设备建立连接，扩展你的虚拟网络',
        icon: 'connect_without_contact',
        actionLabel: '查看好友',
        route: { name: 'social' },
        estimatedMinutes: 2,
        category: 'network'
      },

      // ========== 优先级4 - 优化建议类 ==========
      
      check_route_health: {
        id: 'check_route_health',
        priority: 4,
        title: '检查路由健康度',
        description: '查看路由质量，检测高延迟或丢包问题',
        icon: 'health_and_safety',
        actionLabel: '查看路由',
        route: { name: 'connections' },
        estimatedMinutes: 3,
        category: 'optimization'
      },

      optimize_network: {
        id: 'optimize_network',
        priority: 4,
        title: '优化网络性能',
        description: '检查连接质量，优化路由配置，提升网络体验',
        icon: 'speed',
        actionLabel: '性能分析',
        route: { name: 'dashboard' },
        estimatedMinutes: 5,
        category: 'optimization'
      },

      check_service_quality: {
        id: 'check_service_quality',
        priority: 4,
        title: '检查服务质量',
        description: `你有 ${details.serviceCount} 个服务在运行，检查它们的可达性和性能`,
        icon: 'analytics',
        actionLabel: '查看服务',
        route: { name: 'services' },
        estimatedMinutes: 3,
        category: 'optimization'
      },

      update_node_config: {
        id: 'update_node_config',
        priority: 4,
        title: '更新节点配置',
        description: '检查并更新节点配置，确保最佳性能',
        icon: 'settings',
        actionLabel: '管理节点',
        route: { name: 'nodes' },
        estimatedMinutes: 5,
        route: { name: 'connections' },
        estimatedMinutes: 1,
        category: 'network'
      },

      manage_connections: {
        id: 'manage_connections',
        priority: 5,
        title: '管理你的连接',
        description: `查看和管理 ${details.connectionCount} 个连接的状态和质量`,
        icon: 'hub',
        actionLabel: '查看连接',
        route: { name: 'connections' },
        estimatedMinutes: 3,
        category: 'network'
      },

      // ========== 服务阶段 ==========
      setup_service: {
        id: 'setup_service',
        priority: 6,
        title: '设置你的第一个服务',
        description: '分享文件、搭建网站、运行游戏服务器...让你的网络更有价值',
        icon: 'cloud_upload',
        actionLabel: '配置服务',
        route: { name: 'services' },
        estimatedMinutes: 5,
        category: 'service'
      },

      browse_services: {
        id: 'browse_services',
        priority: 5,
        title: '浏览网络中的服务',
        description: '看看好友分享了什么有趣的服务',
        icon: 'explore',
        actionLabel: '浏览服务',
        route: { name: 'services' },
        estimatedMinutes: 2,
        category: 'service'
      },

      // ========== 优化阶段 ==========
      optimize_network: {
        id: 'optimize_network',
        priority: 4,
        title: '优化网络性能',
        description: '检查连接质量，优化路由配置，提升网络体验',
        icon: 'speed',
        actionLabel: '性能分析',
        route: { name: 'dashboard' },
        estimatedMinutes: 5,
        category: 'optimization'
      },

      share_service: {
        id: 'share_service',
        priority: 3,
        title: '分享更多服务',
        description: '你已经有服务在运行，考虑分享更多功能给好友',
        icon: 'share',
        actionLabel: '管理服务',
        route: { name: 'services' },
        estimatedMinutes: 3,
        category: 'service'
      },

      monitor_quality: {
        id: 'monitor_quality',
        priority: 3,
        title: '监控网络质量',
        description: '查看延迟、带宽使用情况，确保最佳体验',
        icon: 'analytics',
        actionLabel: '查看统计',
        route: { name: 'dashboard' },
        estimatedMinutes: 2,
        category: 'optimization'
      }
    }

    return actions[actionId] || null
  }

  /**
   * 获取智能欢迎消息
   */
  static getWelcomeMessage(analysis: UserStateAnalysis): {
    greeting: string
    encouragement: string
  } {
    const hour = new Date().getHours()
    let timeGreeting = '你好'
    if (hour < 12) timeGreeting = '早上好'
    else if (hour < 18) timeGreeting = '下午好'
    else timeGreeting = '晚上好'

    const stateDesc = UserStateAnalyzer.getStateDescription(analysis.state)

    return {
      greeting: `${timeGreeting}！`,
      encouragement: stateDesc
    }
  }

  /**
   * 生成进度提示
   */
  static generateProgressTip(analysis: UserStateAnalysis): string {
    const { completedMilestones, details } = analysis
    const total = 7 // 总共7个主要里程碑
    const completed = completedMilestones.length
    const percentage = Math.round((completed / total) * 100)

    if (percentage === 100) {
      return '🎉 你已经完成了所有主要设置！'
    } else if (percentage >= 70) {
      return `👍 你已经完成了 ${percentage}% 的配置，做得很好！`
    } else if (percentage >= 40) {
      return `💪 继续加油，已完成 ${percentage}%`
    } else {
      return `🚀 让我们一起完成初始配置 (${percentage}%)`
    }
  }
}
