/**
 * Tips系统类型定义
 * 用于引导新用户了解和使用MyNet
 */

/**
 * Tips类型
 */
export enum TipType {
  /** 模态弹窗 - 全屏居中显示，需要用户交互 */
  Modal = 'modal',
  /** 非阻断气泡引导 - 附着在目标元素旁，不阻止页面操作 */
  Popover = 'popover',
  /** 可折叠横幅 - 页面顶部内嵌横幅，默认收起 */
  Banner = 'banner'
}

/**
 * Tips显示位置
 */
export enum TipPlacement {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  Center = 'center'
}

/**
 * 引导阶段
 */
export enum OnboardingStage {
  /** 欢迎 */
  Welcome = 0,
  /** 创建IP资源池 */
  CreateIPPool = 1,
  /** 添加第一个设备 */
  AddFirstDevice = 2,
  /** 路径A: 添加第二个设备 */
  AddSecondDevice = 3,
  /** 路径A: 理解自动连接 */
  UnderstandAutoConnection = 4,
  /** 路径B: 添加邀请人为好友 */
  AddInviterFriend = 3.1,
  /** 路径B: 查看邀请人设备 */
  ViewInviterDevices = 4.1,
  /** 路径B: 建立跨用户连接 */
  EstablishCrossUserConnection = 5.1,
  /** 连接管理 */
  ManageConnections = 6,
  /** 完成 */
  Completed = 999
}

/**
 * 引导路径
 */
export enum OnboardingPath {
  /** 未选择 */
  None = 'none',
  /** 路径A: 设备体验优先 */
  DeviceFirst = 'device-first',
  /** 路径B: 好友连接优先 */
  FriendFirst = 'friend-first'
}

/**
 * Tips触发条件
 */
export interface TipTrigger {
  /** 路由匹配 */
  route?: string | RegExp
  /** 自定义条件函数 */
  condition?: () => boolean | Promise<boolean>
  /** 只触发一次 */
  once?: boolean
  /** 延迟触发（毫秒） */
  delay?: number
  /** 依赖的前置阶段 */
  requiredStages?: OnboardingStage[]
  /** 智能时机控制 */
  timing?: SmartTiming
}

/**
 * 智能时机控制
 */
export interface SmartTiming {
  /** 用户在当前页面空闲超过 N 秒后才显示 */
  idleAfterSeconds?: number
  /** 用户完成了某个操作后才显示（事件名） */
  afterAction?: string
  /** 用户 N 次访问同一页面后才显示 */
  afterVisitCount?: number
  /** 用户正在输入/操作时不显示 */
  notDuringInteraction?: boolean
  /** 自动缩小为脉冲圆点的延迟（秒），0 表示不缩小 */
  autoMinimizeAfterSeconds?: number
}

/**
 * Tips显示配置
 */
export interface TipDisplay {
  /** 标题 */
  title: string
  /** 内容（支持HTML） */
  content: string
  /** 图片/动图 */
  media?: {
    type: 'image' | 'video' | 'gif'
    url: string
    alt?: string
  }
  /** 目标元素选择器（用于高亮和定位） */
  target?: string | HTMLElement
  /** 显示位置 */
  placement?: TipPlacement
  /** 宽度 */
  width?: string | number
  /** 最大高度 */
  maxHeight?: string | number
  /** 自定义样式类 */
  class?: string
}

/**
 * Tips操作按钮
 */
export interface TipAction {
  /** 按钮文本 */
  label: string
  /** 点击处理函数 */
  handler: () => void | Promise<void>
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'text'
  /** 是否关闭Tips */
  closeOnClick?: boolean
  /** 是否为取消按钮 */
  isCancel?: boolean
}

/**
 * Tips配置
 */
export interface TipConfig {
  /** 唯一标识 */
  id: string
  /** Tips类型 */
  type: TipType
  /** 所属阶段 */
  stage: OnboardingStage
  /** 触发条件 */
  trigger: TipTrigger
  /** 显示配置 */
  display: TipDisplay
  /** 操作按钮 */
  actions?: TipAction[]
  /** 
   * 优先级（数字越大优先级越高）
   * Modal: 100, Popover: 50, Banner: 10
   */
  priority?: number
  /** Tips 分组（同一分组内只显示一个） */
  group?: string
  /** 是否可跳过 */
  skippable?: boolean
  /** 是否可关闭 */
  closable?: boolean
  /** 关闭时的回调 */
  onClose?: () => void
  /** 显示时的回调 */
  onShow?: () => void
}

/**
 * 引导阶段状态
 */
export interface OnboardingStages {
  /** 欢迎弹窗已显示 */
  welcome_shown: boolean
  /** 第一个IP资源池已创建 */
  first_ippool_created: boolean
  /** 第一个设备已添加 */
  first_device_added: boolean
  
  // 路径A: 设备体验
  /** 第二个设备已添加 */
  second_device_added: boolean
  /** 已理解自动连接 */
  auto_connection_understood: boolean
  
  // 路径B: 好友连接
  /** 邀请人已添加为好友 */
  inviter_friend_added: boolean
  /** 已查看邀请人设备 */
  inviter_devices_viewed: boolean
  
  // 通用
  /** 跨用户连接已建立 */
  cross_user_connection_established: boolean
  /** 连接管理已查看 */
  connection_management_shown: boolean
}

/**
 * 引导偏好设置
 */
export interface OnboardingPreferences {
  /** 跳过所有引导 */
  skipAll: boolean
  /** 自动推进到下一步 */
  autoProgress: boolean
  /** 显示进度指示器 */
  showProgress: boolean
  /** 允许重新开始 */
  allowRestart: boolean
}

/**
 * 引导状态
 */
export interface OnboardingState {
  /** 用户ID */
  userId: string
  /** 状态版本 */
  version: string
  /** 是否完成 */
  completed: boolean
  /** 当前阶段 */
  currentStage: OnboardingStage
  /** 选择的路径 */
  selectedPath: OnboardingPath
  /** 各阶段状态 */
  stages: OnboardingStages
  /** 偏好设置 */
  preferences: OnboardingPreferences
  /** 开始时间 */
  startedAt?: string
  /** 完成时间 */
  completedAt?: string
  /** 上次更新时间 */
  updatedAt: string
}

/**
 * Tips实例
 */
export interface TipInstance {
  /** 配置 */
  config: TipConfig
  /** 显示状态 */
  visible: boolean
  /** 显示Tip */
  show: () => Promise<void>
  /** 隐藏Tip */
  hide: () => Promise<void>
  /** 销毁Tip */
  destroy: () => void
}

/**
 * Tips引擎选项
 */
export interface TipsEngineOptions {
  /** 启用引导 */
  enabled?: boolean
  /** 自动启动 */
  autoStart?: boolean
  /** 调试模式 */
  debug?: boolean
  /** 最大同时显示Tips数 */
  maxConcurrent?: number
}

/**
 * Tips事件
 */
export interface TipEvents {
  /** Tip显示 */
  'tip:show': (tip: TipConfig) => void
  /** Tip隐藏 */
  'tip:hide': (tip: TipConfig) => void
  /** Tip完成 */
  'tip:complete': (tip: TipConfig) => void
  /** Tip跳过 */
  'tip:skip': (tip: TipConfig) => void
  /** 阶段完成 */
  'stage:complete': (stage: OnboardingStage) => void
  /** 引导完成 */
  'onboarding:complete': () => void
  /** 路径选择 */
  'path:select': (path: OnboardingPath) => void
}
