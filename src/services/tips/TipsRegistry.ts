/**
 * Tips注册表
 * 管理所有Tips配置
 */

import type { TipConfig, OnboardingPath } from '../../types/tips'
import { TipType, TipPlacement, OnboardingStage } from '../../types/tips'
import type { Router } from 'vue-router'
import { i18n } from '../../boot/i18n'
import { TERM_ZONE } from '../../config/terms'

/**
 * 获取翻译文本，若 i18n 未就绪则返回 fallback
 */
function t(key: string, fallback: string): string {
  try {
    const result = i18n.global.t(key)
    // vue-i18n returns the key itself if not found
    return result === key ? fallback : result
  } catch {
    return fallback
  }
}

// 存储路由实例
let _router: Router | null = null

// 设置路由实例（由 TipsEngine 调用）
export function setRouter(router: Router) {
  _router = router
}

// 延迟导入，避免循环依赖
let _onboardingStore: any = null

const getOnboardingStore = async () => {
  if (!_onboardingStore) {
    const { useOnboardingStore } = await import('../../stores/onboarding')
    _onboardingStore = useOnboardingStore()
  }
  return _onboardingStore
}

/**
 * 所有Tips配置（延迟初始化，确保 i18n 就绪）
 */
let _tipsRegistry: TipConfig[] | null = null

function buildTipsRegistry(): TipConfig[] {
  return [
  // ========== 阶段0: 欢迎 ==========
  {
    id: 'welcome',
    type: TipType.Modal,
    stage: OnboardingStage.Welcome,
    trigger: {
      route: '/app/dashboard',
      condition: () => true,
      once: true
    },
    display: {
      title: t('tips.welcome.title', '👋 欢迎来到 MyNet'),
      content: t('tips.welcome.content', `
        <p>MyNet 帮你轻松连接你的设备和朋友。</p>
        <p class="text-caption text-grey-7">💡 随时点击右上角帮助图标查看当前页面指引</p>
      `),
      width: '420px'
    },
    actions: [
      {
        label: t('tips.actions.startSetup', '带我看看'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {
          try {
            if (!_router) {
              return
            }
            setTimeout(() => {
              _router!.push('/app/ippools').catch(() => {})
            }, 300)
          } catch (error) {
            // Error handling
          }
        }
      },
      {
        label: '直接开始',
        type: 'text',
        closeOnClick: true,
        handler: () => {
          // 不跳转，用户自行探索
        }
      }
    ],
    priority: 100,
    group: 'dashboard',
    skippable: true,
    closable: true
  },

  // ========== 阶段1: 创建IP资源池 ==========
  {
    id: 'create_ippool',
    type: TipType.Popover,
    stage: OnboardingStage.CreateIPPool,
    trigger: {
      route: '/app/ippools',
      condition: () => true,
      once: true,
      delay: 800,
      timing: { autoMinimizeAfterSeconds: 8 }
    },
    display: {
      title: t('tips.createIpPool.title', '💡 创建 IP 资源池'),
      content: t('tips.createIpPool.content', `
        <p><strong>IP资源池</strong>为设备提供虚拟IP，是添加设备的前提。</p>
        <p>建议使用 <code>10.0.0.0/24</code>（适合大多数场景）</p>
      `),
      target: '[data-tip-target="create-ippool-btn"]',
      placement: TipPlacement.Bottom,
      width: '340px'
    },
    actions: [
      {
        label: t('tips.actions.gotIt', '知道了'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 90,
    skippable: true,
    closable: true
  },

  // ========== 阶段2: 添加第一个设备 ==========
  {
    id: 'add_first_node',
    type: TipType.Popover,
    stage: OnboardingStage.AddFirstDevice,
    trigger: {
      route: '/app/nodes',
      condition: () => true,
      once: true,
      delay: 800,
      timing: { autoMinimizeAfterSeconds: 8 }
    },
    display: {
      title: t('tips.addFirstDevice.title', '📱 添加第一个设备'),
      content: t('tips.addFirstDevice.content', `
        <p>设备是 MyNet 网络的基本单位。</p>
        <p>电脑、手机、服务器均可添加。</p>
      `),
      target: '[data-tip-target="add-device-btn"]',
      placement: TipPlacement.Bottom,
      width: '320px'
    },
    actions: [
      {
        label: t('tips.actions.gotIt', '知道了'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 80,
    skippable: true,
    closable: true
  },

  // ========== 路径A: 添加第二个设备 ==========
  {
    id: 'add_second_node',
    type: TipType.Banner,
    stage: OnboardingStage.AddSecondDevice,
    trigger: {
      route: '/app/nodes',
      condition: () => true,
      once: true
    },
    display: {
      title: t('tips.addSecondDevice.title', '📱 添加第二个设备'),
      content: t('tips.addSecondDevice.content', `
        <p>添加第二个设备后，两个设备将<strong>自动建立连接</strong>，无需手动审批。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: '继续添加', type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 70,
    skippable: true,
    closable: true
  },

  // ========== 路径B: 添加邀请人为好友 ==========
  {
    id: 'add_inviter_friend',
    type: TipType.Popover,
    stage: OnboardingStage.AddInviterFriend,
    trigger: {
      route: '/app/social/friends',
      condition: () => true,
      once: true,
      delay: 800,
      timing: { autoMinimizeAfterSeconds: 8 }
    },
    display: {
      title: t('tips.inviterFriend.title', '👥 邀请人会自动成为你的好友'),
      content: t('tips.inviterFriend.content', `
        <p>凭邀请码注册成功后，你和邀请人就自动建立好友关系，不需要再发好友请求。只有入区时没填码（例如管理员直接把你加进网络区），才需要在好友页搜索邀请人并发出请求。</p>
      `),
      target: '[data-tip-target="friends-list"]',
      placement: TipPlacement.Right,
      width: '320px'
    },
    actions: [
      {
        label: t('tips.actions.gotIt', '知道了'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 70,
    skippable: true,
    closable: true
  },

  // ========== 引导：邀请好友 ==========
  {
    id: 'invite_friends_guide',
    type: TipType.Popover,
    stage: OnboardingStage.AddInviterFriend,
    trigger: {
      route: '/app/social/invitations',
      condition: () => true,
      once: true,
      delay: 800,
      timing: { autoMinimizeAfterSeconds: 8 }
    },
    display: {
      title: t('tips.inviteFriend.title', '📨 邀请好友加入'),
      content: t('tips.inviteFriend.content', `
        <p>把你的个人邀请码或链接分享给朋友，对方注册时填码即可加入你的网络区，并自动成为你的好友。注意：已经注册过的账号再用你的码入区，不会自动成为好友，还需要互相发一次好友请求。</p>
      `),
      target: '[data-tip-target="invite-friend-btn"]',
      placement: TipPlacement.Bottom,
      width: '300px'
    },
    actions: [
      {
        label: t('tips.actions.gotIt', '知道了'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 70,
    skippable: true,
    closable: true
  },

  // ========== 路径B: 查看邀请人设备 ==========
  {
    id: 'view_inviter_nodes',
    type: TipType.Banner,
    stage: OnboardingStage.ViewInviterDevices,
    trigger: {
      route: '/app/social/friends',
      condition: () => true,
      once: true
    },
    display: {
      title: t('tips.friendDevices.title', '📱 好友的设备'),
      content: t('tips.friendDevices.content', `
        <p>查看好友设备并请求建立连接，需等待好友批准。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 65,
    skippable: true,
    closable: true
  },

  // ========== 引导：添加连接 ==========
  {
    id: 'add_route_guide',
    type: TipType.Popover,
    stage: OnboardingStage.ManageConnections,
    trigger: {
      route: '/app/routes',
      condition: () => true,
      once: true,
      delay: 800,
      timing: { autoMinimizeAfterSeconds: 8 }
    },
    display: {
      title: t('tips.createRoute.title', '➕ 添加新连接'),
      content: t('tips.createRoute.content', `
        <p>向好友的设备发起连接请求，选择设备后等待对方审批。</p>
      `),
      target: '[data-tip-target="add-route-btn"]',
      placement: TipPlacement.Bottom,
      width: '300px'
    },
    actions: [
      {
        label: t('tips.actions.gotIt', '知道了'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 68,
    skippable: true,
    closable: true
  },

  // ========== 阶段6: 连接管理 ==========
  {
    id: 'manage_connections',
    type: TipType.Banner,
    stage: OnboardingStage.ManageConnections,
    trigger: {
      route: '/app/routes',
      condition: () => true,
      once: true
    },
    display: {
      title: t('tips.connectionManagement.title', '🔗 连接管理'),
      content: t('tips.connectionManagement.content', `
        <p>查看活跃连接、审批请求、断开不需要的连接。</p>
        <p>💡 自己设备间的连接无法断开。</p>
      `),
      width: '100%'
    },
    actions: [
      {
        label: t('tips.actions.gotIt', '知道了'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 60,
    skippable: true,
    closable: true
  },

  // ========== 完成引导 ==========
  {
    id: 'onboarding_complete',
    type: TipType.Modal,
    stage: OnboardingStage.Completed,
    trigger: {
      condition: () => false, // 由程序代码触发
      once: true
    },
    display: {
      title: t('tips.onboardingComplete.title', '🎊 完成引导！'),
      content: t('tips.onboardingComplete.content', `
        <p>恭喜你完成了 MyNet 的入门引导！</p>
        <p><strong>你已经学会：</strong></p>
        <ul>
          <li>✅ 创建 IP 资源池</li>
          <li>✅ 添加和管理设备</li>
          <li>✅ 邀请好友加入</li>
          <li>✅ 建立和管理连接</li>
        </ul>
        <p>现在可以开始自由探索了。</p>
        <p>💡 随时点击右上角的<strong>帮助图标</strong>查看当前页面的操作指引。</p>
      `),
      width: '500px'
    },
    actions: [
      {
        label: t('tips.actions.startUsing', '开始使用 MyNet'),
        type: 'primary',
        closeOnClick: true,
        handler: () => {}
      }
    ],
    priority: 100,    group: 'dashboard',    skippable: false,
    closable: false
  },

  // ========== 独立页面帮助 Tips ==========
  
  // Dashboard 页面帮助
  {
    id: 'dashboard_overview',
    type: TipType.Banner,
    stage: OnboardingStage.Welcome,
    trigger: {
      route: '/app/dashboard',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.dashboardOverview.title', '📊 Dashboard 概览'),
      content: t('tips.dashboardOverview.content', `
        <p>控制中心：查看设备状态、待处理任务、最近活动和统计数据。点击卡片查看详情。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    group: 'dashboard',
    skippable: true,
    closable: true
  },

  // IP 池管理帮助
  {
    id: 'ippool_management',
    type: TipType.Banner,
    stage: OnboardingStage.CreateIPPool,
    trigger: {
      route: '/app/ippools',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.ippoolManagement.title', '🌐 IP 资源池管理'),
      content: t('tips.ippoolManagement.content', `
        <p>IP 资源池为设备分配虚拟 IP 地址。建议使用私有网段（如 <code>10.0.0.0/24</code>），可为不同用途创建多个池，避免与本地网络冲突。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    group: 'ippools',
    skippable: true,
    closable: true
  },

  // 设备管理帮助
  {
    id: 'node_management',
    type: TipType.Banner,
    stage: OnboardingStage.AddFirstDevice,
    trigger: {
      route: '/app/nodes',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.nodeManagement.title', '📱 设备管理'),
      content: t('tips.nodeManagement.content', `
        <p>管理你的设备和好友设备。🟢在线 🔴离线 ⚠️未激活。同账户设备<strong>自动连接</strong>，无需审批。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    skippable: true,
    closable: true
  },

  // 连接管理帮助（路由）
  {
    id: 'route_management',
    type: TipType.Banner,
    stage: OnboardingStage.Welcome,
    trigger: {
      route: '/app/routes',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.routeManagement.title', '🔗 连接管理'),
      content: t('tips.routeManagement.content', `
        <p>自己设备自动批准，好友设备需双方批准。查看活跃连接、待审批请求和传出连接。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    skippable: true,
    closable: true
  },

  // 好友管理帮助
  {
    id: 'friend_management',
    type: TipType.Banner,
    stage: OnboardingStage.Welcome,
    trigger: {
      route: '/app/social/friends',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.socialManagement.title', '👥 好友管理'),
      content: t('tips.socialManagement.content', `
        <p>通过邀请码添加好友。好友可查看对方设备并请求连接，但所有连接需<strong>双方批准</strong>。成为好友不会自动连接设备。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    skippable: true,
    closable: true
  },

  // 连接管理详细帮助
  {
    id: 'connection_details',
    type: TipType.Banner,
    stage: OnboardingStage.ManageConnections,
    trigger: {
      route: '/app/routes',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.connectionDetails.title', '🔗 连接详解'),
      content: t('tips.connectionDetails.content', `
        <p>自动连接（自己设备）无需批准且不可断开；跨用户连接需双方批准，可随时断开。🟢已建立 🟡待批准 🔴已断开</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    skippable: true,
    closable: true
  },

  // 网络区管理帮助（用词见 config/terms.ts）
  {
    id: 'zone_management',
    type: TipType.Banner,
    stage: OnboardingStage.Welcome,
    trigger: {
      route: '/app/tenants',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.zoneManagement.title', `🌍 ${TERM_ZONE}管理`),
      content: t('tips.zoneManagement.content', `
        <p>${TERM_ZONE}是独立的网络空间，适用于公司、家庭、项目等场景。不同${TERM_ZONE}完全隔离，可随时切换。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    skippable: true,
    closable: true
  },

  // 设置页面帮助
  {
    id: 'settings_overview',
    type: TipType.Banner,
    stage: OnboardingStage.Welcome,
    trigger: {
      route: '/app/profile',
      condition: () => true,
      once: false
    },
    display: {
      title: t('tips.settingsCenter.title', '⚙️ 设置中心'),
      content: t('tips.settingsCenter.content', `
        <p>配置个人资料、账户安全、通知偏好、界面主题和隐私设置。高级用户可配置网络参数和开发者选项。</p>
      `),
      width: '100%'
    },
    actions: [
      { label: t('tips.actions.gotIt', '知道了'), type: 'primary', closeOnClick: true, handler: () => {} }
    ],
    priority: 50,
    skippable: true,
    closable: true
  }
]
}

/** 获取 tips 注册表（延迟构建） */
export function getTipsRegistry(): TipConfig[] {
  if (!_tipsRegistry) {
    _tipsRegistry = buildTipsRegistry()
  }
  return _tipsRegistry
}

/** 当语言切换时调用，强制重建注册表 */
export function invalidateTipsRegistry() {
  _tipsRegistry = null
}

// 兼容旧引用
export const tipsRegistry: TipConfig[] = new Proxy([] as TipConfig[], {
  get(target, prop) {
    const registry = getTipsRegistry()
    return Reflect.get(registry, prop)
  }
})

/**
 * 根据ID获取Tip配置
 */
export function getTipById(id: string): TipConfig | undefined {
  return getTipsRegistry().find(tip => tip.id === id)
}

/**
 * 根据阶段获取Tip配置
 */
export function getTipsByStage(stage: OnboardingStage): TipConfig[] {
  return getTipsRegistry().filter(tip => tip.stage === stage)
}

/**
 * 根据路由获取Tip配置
 */
export function getTipsByRoute(route: string): TipConfig[] {
  return getTipsRegistry().filter(tip => {
    if (!tip.trigger.route) return false
    
    if (typeof tip.trigger.route === 'string') {
      return tip.trigger.route === route
    }
    
    return tip.trigger.route.test(route)
  })
}
