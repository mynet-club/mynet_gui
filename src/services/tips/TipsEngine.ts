/**
 * Tips引擎
 * 核心逻辑：管理Tips的触发、显示、隐藏和状态同步
 */

import { reactive, watch } from 'vue'
import { useRouter, type Router } from 'vue-router'
import type {
  TipConfig,
  TipInstance,
  TipsEngineOptions,
  OnboardingPath
} from '../../types/tips'
import { OnboardingStage, TipType } from '../../types/tips'
import { useOnboardingStore } from '../../stores/onboarding'
import { tipsRegistry, getTipsByRoute, getTipsByStage, setRouter } from './TipsRegistry'
import { TipsStorage } from '../../utils/tipsStorage'

/**
 * Tips引擎类
 */
export class TipsEngine {
  private router: Router
  private onboardingStore: ReturnType<typeof useOnboardingStore>
  private options: Required<TipsEngineOptions>
  public activeTips: Map<string, TipInstance> = reactive(new Map())  // 改为 public 和 reactive
  private shownTips: Set<string> = new Set()
  private listeners: Map<string, Function[]> = new Map()
  
  // Smart Timing 状态
  private lastActivityTimestamp: number = Date.now()
  private routeVisitCounts: Map<string, number> = new Map()
  private isUserInteracting: boolean = false
  private interactionTimer: ReturnType<typeof setTimeout> | null = null
  private activityListenersAttached: boolean = false
  private onActivityHandler: (() => void) | null = null
  
  // 清理引用
  private unregisterRouteGuard: (() => void) | null = null
  private stopWatchers: (() => void)[] = []
  private pendingTips: Set<string> = new Set()  // 防止 delay 期间重复调度
  
  constructor(options: TipsEngineOptions = {}) {
    this.router = useRouter()
    this.onboardingStore = useOnboardingStore()
    
    // 设置路由实例到 TipsRegistry
    setRouter(this.router)
    
    this.options = {
      enabled: options.enabled ?? true,
      autoStart: options.autoStart ?? true,
      debug: options.debug ?? true,  // 强制启用调试
      maxConcurrent: options.maxConcurrent ?? 1
    }

    this.log('TipsEngine initialized', this.options)

    if (this.options.autoStart) {
      this.start()
    }
  }

  /**
   * 启动引擎
   */
  start() {
    if (!this.options.enabled) {
      this.log('Engine is disabled, skipping start')
      return
    }

    this.log('Starting engine')

    // 监听路由变化
    this.unregisterRouteGuard = this.router.beforeEach((to, from, next) => {
      this.onRouteChange(to.path)
      next()
    })

    // 启动用户活动追踪
    this.startActivityTracking()

    // 监听引导状态变化
    const stopStageWatch = watch(
      () => this.onboardingStore.currentStage,
      (newStage) => {
        this.onStageChange(newStage)
      }
    )

    const stopPathWatch = watch(
      () => this.onboardingStore.selectedPath,
      (newPath) => {
        this.onPathChange(newPath)
      }
    )
    
    this.stopWatchers = [stopStageWatch, stopPathWatch]

    // 初始检查
    this.checkTriggers()
  }

  /**
   * 停止引擎
   */
  stop() {
    this.log('🛑 Stopping engine...')
    this.hideAll()
    this.activeTips.clear()
    this.shownTips.clear()
    this.pendingTips.clear()
    this.listeners.clear()
    this.stopActivityTracking()
    
    // 清理路由守卫
    if (this.unregisterRouteGuard) {
      this.unregisterRouteGuard()
      this.unregisterRouteGuard = null
    }
    
    // 清理 watchers
    this.stopWatchers.forEach(stop => stop())
    this.stopWatchers = []
    
    this.log('✅ Engine stopped')
  }

  /**
   * 启动用户活动追踪（用于 Smart Timing）
   */
  private startActivityTracking() {
    if (this.activityListenersAttached) return
    this.activityListenersAttached = true

    this.onActivityHandler = () => {
      this.lastActivityTimestamp = Date.now()
      this.isUserInteracting = true

      if (this.interactionTimer) clearTimeout(this.interactionTimer)
      this.interactionTimer = setTimeout(() => {
        this.isUserInteracting = false
        // 空闲后重新检查需要 idle 触发的 tips
        this.checkTriggers()
      }, 3000)
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'] as const
    events.forEach(e => document.addEventListener(e, this.onActivityHandler!, { passive: true }))
  }

  /**
   * 停止活动追踪
   */
  private stopActivityTracking() {
    if (this.onActivityHandler) {
      const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'] as const
      events.forEach(e => document.removeEventListener(e, this.onActivityHandler!))
      this.onActivityHandler = null
    }
    this.activityListenersAttached = false
    if (this.interactionTimer) {
      clearTimeout(this.interactionTimer)
      this.interactionTimer = null
    }
  }

  /**
   * 获取用户空闲秒数
   */
  private getIdleSeconds(): number {
    return (Date.now() - this.lastActivityTimestamp) / 1000
  }

  /**
   * 获取当前路由的访问次数
   */
  private getRouteVisitCount(route: string): number {
    return this.routeVisitCounts.get(route) || 0
  }

  /**
   * 评估 Smart Timing 条件
   */
  private evaluateSmartTiming(tip: TipConfig): boolean {
    const timing = tip.trigger.timing
    if (!timing) return true // 没有 timing 配置则直接通过

    // 检查空闲时间
    if (timing.idleAfterSeconds != null) {
      if (this.getIdleSeconds() < timing.idleAfterSeconds) {
        this.log(`⏳ Tip ${tip.id}: waiting for ${timing.idleAfterSeconds}s idle (current: ${this.getIdleSeconds().toFixed(1)}s)`)
        return false
      }
    }

    // 检查是否在交互中
    if (timing.notDuringInteraction && this.isUserInteracting) {
      this.log(`⏳ Tip ${tip.id}: waiting for interaction to stop`)
      return false
    }

    // 检查路由访问次数
    if (timing.afterVisitCount != null && tip.trigger.route) {
      const route = typeof tip.trigger.route === 'string' ? tip.trigger.route : ''
      if (route && this.getRouteVisitCount(route) < timing.afterVisitCount) {
        this.log(`⏳ Tip ${tip.id}: waiting for ${timing.afterVisitCount} visits (current: ${this.getRouteVisitCount(route)})`)
        return false
      }
    }

    return true
  }

  /**
   * 路由变化处理
   */
  private onRouteChange(path: string) {
    this.log('🚦 Route changed:', path)
    
    // 隐藏与新路由不匹配的 tips
    for (const [id, instance] of this.activeTips) {
      const tipRoute = instance.config.trigger.route
      if (!tipRoute) continue
      const isMatch = typeof tipRoute === 'string'
        ? (path === tipRoute || path.includes(tipRoute))
        : tipRoute.test(path)
      if (!isMatch) {
        this.log('🧹 Hiding tip from previous route:', id)
        instance.hide()
      }
    }
    
    // 记录路由访问次数
    const count = this.routeVisitCounts.get(path) || 0
    this.routeVisitCounts.set(path, count + 1)
    
    // 延迟一下，等待页面元素渲染
    setTimeout(() => {
      this.log('🔍 Checking triggers after route change...')
      this.checkTriggers()
    }, 500)
  }

  /**
   * 阶段变化处理
   */
  private onStageChange(stage: OnboardingStage) {
    this.log('Stage changed:', stage)
    
    // 触发对应阶段的Tips
    const tips = getTipsByStage(stage)
    tips.forEach(tip => {
      this.evaluateTip(tip)
    })

    // 发送事件
    this.emit('stage:complete', stage)
  }

  /**
   * 路径选择处理
   */
  private onPathChange(path: OnboardingPath) {
    this.log('Path changed:', path)
    
    // 发送事件
    this.emit('path:select', path)
  }

  /**
   * 检查所有待触发的Tips
   */
  private async checkTriggers() {
    this.log('🔍 Checking triggers...')
    
    if (this.onboardingStore.shouldSkip) {
      this.log('❌ Onboarding skipped, no tips to show')
      return
    }

    const currentPath = this.router.currentRoute.value.path
    this.log('📍 Current path:', currentPath)

    // 收集所有候选 tips
    const candidateTips: TipConfig[] = []
    
    // 获取当前路由的Tips
    const routeTips = getTipsByRoute(currentPath)
    this.log('📋 Route tips found:', routeTips.length, routeTips.map(t => t.id))
    candidateTips.push(...routeTips)

    // 获取当前阶段的Tips
    const currentStage = this.onboardingStore.currentStage
    const stageTips = getTipsByStage(currentStage)
    this.log('📋 Stage tips found:', stageTips.length, 'for stage', currentStage, stageTips.map(t => t.id))
    candidateTips.push(...stageTips)
    
    // 去重
    const uniqueTips = Array.from(new Map(candidateTips.map(t => [t.id, t])).values())
    this.log('🎯 Unique candidate tips:', uniqueTips.length)
    
    // 按优先级排序（高优先级在前）
    const sortedTips = this.sortTipsByPriority(uniqueTips)
    this.log('📊 Sorted by priority:', sortedTips.map(t => `${t.id}(${t.priority || 0})`))
    
    // 智能选择要显示的 tip
    const tipsToShow = this.selectTipsToShow(sortedTips)
    this.log('✨ Selected tips to show:', tipsToShow.map(t => t.id))
    
    // 依次评估和显示
    for (const tip of tipsToShow) {
      await this.evaluateTip(tip)
    }
  }
  
  /**
   * 公开的触发检查方法（用于调试）
   */
  public triggerCheck() {
    this.log('🎯 Manual trigger check called')
    this.checkTriggers()
  }
  
  /**
   * 按优先级排序 Tips（高优先级在前）
   */
  private sortTipsByPriority(tips: TipConfig[]): TipConfig[] {
    return tips.sort((a, b) => {
      const priorityA = a.priority ?? 0
      const priorityB = b.priority ?? 0
      return priorityB - priorityA  // 降序排列
    })
  }
  
  /**
   * 智能选择要显示的 Tips
   * 策略：
   * 1. 同一分组只显示最高优先级的一个
   * 2. 总数不超过 maxConcurrent（所有类型统一计数）
   */
  private selectTipsToShow(sortedTips: TipConfig[]): TipConfig[] {
    const selected: TipConfig[] = []
    const groupsShown = new Set<string>()
    let totalCount = this.activeTips.size

    // 已激活的 tip 的分组也纳入互斥判断
    for (const [, instance] of this.activeTips) {
      if (instance.config.group) {
        groupsShown.add(instance.config.group)
      }
    }
    
    for (const tip of sortedTips) {
      // 所有类型统一遵守并发上限（优先级高的先入选）
      if (totalCount >= this.options.maxConcurrent) {
        this.log('⛔ Reached max concurrent, skipping:', tip.id)
        continue
      }
      
      // 检查分组冲突
      if (tip.group) {
        if (groupsShown.has(tip.group)) {
          this.log(`⏭️ Skipping ${tip.id} - group ${tip.group} already shown`)
          continue
        }
        groupsShown.add(tip.group)
      }
      
      selected.push(tip)
      totalCount++
      this.log(`✅ Selected ${tip.id} for display`)
    }
    
    return selected
  }

  /**
   * 评估是否应该显示Tip
   */
  private async evaluateTip(tip: TipConfig): Promise<boolean> {
    this.log('🔍 Evaluating tip:', tip.id)
    if (this.onboardingStore.shouldSkip || (tip.trigger.once && this.isStageCompleted(tip.stage))) return false
    
    // 检查是否被用户永久隐藏
    if (TipsStorage.isTipHidden(tip.id)) {
      this.log('❌ Tip is hidden by user:', tip.id)
      return false
    }
    this.log('✅ Tip not hidden by user')
    
    // 检查是否已经在显示中
    if (this.activeTips.has(tip.id) || this.pendingTips.has(tip.id)) {
      this.log('❌ Tip already active or pending:', tip.id)
      return false
    }
    this.log('✅ Tip not currently active')
    
    // 已显示过且只显示一次
    if (tip.trigger.once && this.shownTips.has(tip.id)) {
      this.log('❌ Tip already shown (once=true):', tip.id)
      return false
    }
    this.log('✅ Tip can be shown (once check passed)')

    // 检查路由匹配
    if (tip.trigger.route) {
      const currentPath = this.router.currentRoute.value.path
      const triggerRoute = tip.trigger.route
      
      // 简单路径匹配或模糊匹配
      const isMatch = typeof triggerRoute === 'string' 
        ? (currentPath === triggerRoute || currentPath.includes(triggerRoute))
        : triggerRoute.test(currentPath)
      
      this.log('📍 Route check:', {
        current: currentPath,
        trigger: triggerRoute,
        match: isMatch
      })
      
      if (!isMatch) {
        this.log('❌ Route does not match')
        return false
      }
      this.log('✅ Route matches')
    }

    // 检查自定义条件
    if (tip.trigger.condition) {
      try {
        const result = await tip.trigger.condition()
        if (!result) {
          this.log('❌ Tip condition not met:', tip.id)
          return false
        }
        this.log('✅ Tip condition met')
      } catch (error) {
        this.log('❌ Tip condition error:', error)
        return false
      }
    }

    // 检查前置阶段
    if (tip.trigger.requiredStages) {
      const allCompleted = tip.trigger.requiredStages.every(stage => {
        // 检查阶段是否完成的逻辑
        return this.isStageCompleted(stage)
      })

      if (!allCompleted) {
        this.log('❌ Tip required stages not completed:', tip.id)
        return false
      }
      this.log('✅ Required stages completed')
    }

    // Smart Timing 检查
    if (!this.evaluateSmartTiming(tip)) {
      return false
    }

    // 检查并发数量（所有类型统一计数，优先级高的先显示）
    if (this.activeTips.size >= this.options.maxConcurrent) {
      this.log('❌ Max concurrent tips reached:', this.options.maxConcurrent)
      return false
    }
    this.log('✅ Concurrent limit OK, current:', this.activeTips.size)

    // 延迟触发
    if (tip.trigger.delay) {
      this.log('⏱️ Scheduling tip with delay:', tip.trigger.delay)
      this.pendingTips.add(tip.id)
      setTimeout(() => {
        if (!this.pendingTips.has(tip.id)) return
        this.pendingTips.delete(tip.id)
        const trigger = { ...tip.trigger }
        delete trigger.delay
        this.evaluateTip({ ...tip, trigger })
      }, tip.trigger.delay)
      return true
    }

    // 立即显示
    this.log('🎉 Showing tip immediately:', tip.id)
    this.showTip(tip)
    return true
  }

  /**
   * 显示Tip
   */
  async showTip(tip: TipConfig) {
    this.log('Showing tip:', tip.id)

    // 创建Tip实例
    const instance: TipInstance = reactive({
      config: tip,
      visible: true,
      show: async () => {
        instance.visible = true
        this.log('Tip shown:', tip.id)
        
        // 回调
        if (tip.onShow) {
          tip.onShow()
        }

        // 发送事件
        this.emit('tip:show', tip)
      },
      hide: async () => {
        instance.visible = false
        this.activeTips.delete(tip.id)
        this.log('Tip hidden:', tip.id)
        
        // 回调
        if (tip.onClose) {
          tip.onClose()
        }

        // 发送事件
        this.emit('tip:hide', tip)
      },
      destroy: () => {
        instance.visible = false
        this.activeTips.delete(tip.id)
        this.log('Tip destroyed:', tip.id)
      }
    })

    // 添加到活跃列表
    this.activeTips.set(tip.id, instance)
    this.shownTips.add(tip.id)

    // 显示
    await instance.show()

    return instance
  }

  /**
   * 隐藏指定Tip
   */
  async hideTip(id: string) {
    const instance = this.activeTips.get(id)
    if (instance) {
      await instance.hide()
    }
  }

  /**
   * 隐藏所有Tips
   */
  async hideAll() {
    const promises = Array.from(this.activeTips.values()).map(
      instance => instance.hide()
    )
    await Promise.all(promises)
  }

  /**
   * 完成Tip（标记阶段完成）
   */
  async completeTip(tip: TipConfig) {
    this.log('✅ Completing tip:', tip.id)
    
    // Welcome 阶段比较特殊：关闭弹窗即表示完成
    // 其他 once=true 的流程 tips 不再自动推进 stage
    // 引导阶段由实际用户操作（通过 useOnboardingActions）驱动
    if (tip.trigger.once && tip.stage === OnboardingStage.Welcome) {
      this.onboardingStore.completeStage(tip.stage)
      this.log('📊 Welcome stage completed')
    } else if (tip.trigger.once) {
      this.log('ℹ️ Flow tip dismissed (stage driven by actual operations)')
    } else {
      this.log('ℹ️ Help tip completed (no stage progress)')
    }
    
    // 隐藏Tip
    await this.hideTip(tip.id)
    
    // 发送事件
    this.emit('tip:complete', tip)

    // 检查下一个阶段（适用于所有 once tips）
    if (tip.trigger.once) {
      const nextStage = this.onboardingStore.nextStage
      if (nextStage !== null) {
        this.log('⏭️ Next stage available:', nextStage)
        
        // 延迟一下再检查触发器，让状态完全更新
        setTimeout(() => {
          this.log('🔍 Triggering check for next stage...')
          this.checkTriggers()
        }, 300)
      } else {
        this.log('🎉 All stages completed!')
        this.emit('onboarding:complete')
      }
    } else {
      // 非 once tip 关闭后也重新检查，让次优先的 tip 有机会显示
      setTimeout(() => this.checkTriggers(), 300)
    }
  }

  /**
   * 跳过Tip
   */
  skipTip(tip: TipConfig) {
    if (!tip.skippable) {
      this.log('Tip is not skippable:', tip.id)
      return
    }

    this.log('Skipping tip:', tip.id)
    
    // 隐藏Tip但不标记阶段完成
    this.hideTip(tip.id)
    
    // 发送事件
    this.emit('tip:skip', tip)

    // 重新检查触发器，让次优先的 tip 有机会显示
    setTimeout(() => this.checkTriggers(), 300)
  }

  /**
   * 显示路径选择
   */
  showPathSelection() {
    const pathSelectionTip = tipsRegistry.find(tip => tip.id === 'path_selection')
    if (pathSelectionTip) {
      this.showTip(pathSelectionTip)
    }
  }

  /**
   * 选择路径
   */
  selectPath(path: OnboardingPath) {
    this.log('Path selected:', path)
    
    this.onboardingStore.selectPath(path)
    
    // 隐藏路径选择Tip
    this.hideTip('path_selection')

    // 触发下一阶段
    this.checkTriggers()
  }

  /**
   * 检查阶段是否完成
   */
  private isStageCompleted(stage: OnboardingStage): boolean {
    const stages = this.onboardingStore.stages
    
    switch (stage) {
      case OnboardingStage.Welcome:
        return stages.welcome_shown
      case OnboardingStage.CreateIPPool:
        return stages.first_ippool_created
      case OnboardingStage.AddFirstDevice:
        return stages.first_device_added
      case OnboardingStage.AddSecondDevice:
        return stages.second_device_added
      case OnboardingStage.UnderstandAutoConnection:
        return stages.auto_connection_understood
      case OnboardingStage.AddInviterFriend:
        return stages.inviter_friend_added
      case OnboardingStage.ViewInviterDevices:
        return stages.inviter_devices_viewed
      case OnboardingStage.EstablishCrossUserConnection:
        return stages.cross_user_connection_established
      case OnboardingStage.ManageConnections:
        return stages.connection_management_shown
      default:
        return false
    }
  }

  /**
   * 获取活跃的Tip实例
   */
  getActiveTips(): TipInstance[] {
    return Array.from(this.activeTips.values())
  }
  
  /**
   * 清除已显示记录（用于调试）
   */
  clearShownTips(tipId?: string) {
    if (tipId) {
      this.shownTips.delete(tipId)
      this.log('🗑️ Cleared shown tip:', tipId)
    } else {
      this.shownTips.clear()
      this.log('🗑️ Cleared all shown tips')
    }
  }

  /**
   * 事件监听
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**   * 获取当前页面可用的 tips
   * @param route 路由路径，默认使用当前路由
   * @returns 可用的 tip 配置列表
   */
  getAvailableTipsForRoute(route?: string): TipConfig[] {
    const currentRoute = route || this.router.currentRoute.value.path
    const routeTips = getTipsByRoute(currentRoute)
    
    // 过滤掉已经显示过的（once=true 的情况）
    return routeTips.filter(tip => {
      if (tip.trigger.once && this.shownTips.has(tip.id)) {
        return false
      }
      return true
    })
  }

  /**
   * 手动显示指定的 tip
   * @param tipId tip ID
   * @param force 是否强制显示（忽略 once 检查）
   */
  async showTipManually(tipId: string, force: boolean = false): Promise<boolean> {
    const tip = tipsRegistry.find(t => t.id === tipId)
    
    if (!tip) {
      this.log('❌ Tip not found:', tipId)
      return false
    }

    // 如果已经在显示中
    if (this.activeTips.has(tipId)) {
      this.log('⚠️ Tip already active:', tipId)
      return false
    }

    // 检查 once 限制
    if (!force && tip.trigger.once && this.shownTips.has(tipId)) {
      this.log('❌ Tip already shown (once=true):', tipId)
      return false
    }

    // 直接显示，跳过其他条件检查
    this.log('🎯 Manually showing tip:', tipId)
    await this.showTip(tip)
    return true
  }

  /**   * 移除事件监听
   */
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 发送事件
   */
  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        callback(...args)
      })
    }
  }

  /**
   * 日志输出
   */
  private log(...args: any[]) {
    // Debug logging disabled
  }
}

/**
 * 全局单例
 */
let engineInstance: TipsEngine | null = null

/**
 * 获取引擎实例
 */
export function getTipsEngine(options?: TipsEngineOptions): TipsEngine {
  if (!engineInstance) {
    engineInstance = new TipsEngine(options)
  }
  return engineInstance
}

/**
 * 重置引擎实例（用于测试）
 */
export function resetTipsEngine() {
  if (engineInstance) {
    engineInstance.stop()
    engineInstance = null
  }
}
