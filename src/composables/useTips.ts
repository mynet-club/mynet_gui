/**
 * Tips组合式函数
 * 提供简单的API来使用Tips系统
 */

import { computed } from 'vue'
import { useOnboardingStore } from '../stores/onboarding'
import { getTipsEngine } from '../services/tips/TipsEngine'
import type { TipConfig, OnboardingPath } from '../types/tips'

/**
 * 使用Tips系统
 */
export function useTips() {
  const onboardingStore = useOnboardingStore()
  const engine = getTipsEngine()

  /**
   * 是否正在引导中
   */
  const isOnboarding = computed(() => {
    return onboardingStore.isStarted && !onboardingStore.completed
  })

  /**
   * 引导进度
   */
  const progress = computed(() => {
    return onboardingStore.progress
  })

  /**
   * 当前阶段
   */
  const currentStage = computed(() => {
    return onboardingStore.currentStage
  })

  /**
   * 下一个阶段
   */
  const nextStage = computed(() => {
    return onboardingStore.nextStage
  })

  /**
   * 是否应该跳过引导
   */
  const shouldSkip = computed(() => {
    return onboardingStore.shouldSkip
  })

  /**
   * 开始引导
   */
  const startOnboarding = () => {
    onboardingStore.start()
  }

  /**
   * 完成当前Tip
   */
  const completeTip = (tip: TipConfig) => {
    engine.completeTip(tip)
  }

  /**
   * 跳过当前Tip
   */
  const skipTip = (tip: TipConfig) => {
    engine.skipTip(tip)
  }

  /**
   * 跳过所有引导
   */
  const skipAll = () => {
    onboardingStore.skipAll()
    engine.hideAll()
  }

  /**
   * 重置引导
   */
  const resetOnboarding = () => {
    onboardingStore.reset()
    engine.hideAll()
  }

  /**
   * 选择引导路径
   */
  const selectPath = (path: OnboardingPath) => {
    engine.selectPath(path)
  }

  /**
   * 显示路径选择
   */
  const showPathSelection = () => {
    engine.showPathSelection()
  }

  /**
   * 手动触发检查
   */
  const checkTriggers = () => {
    // @ts-ignore - 访问私有方法用于调试
    engine.checkTriggers()
  }

  /**
   * 获取活跃的Tips
   */
  const getActiveTips = () => {
    // 直接返回引擎的 activeTips，它已经是响应式的
    return computed(() => Array.from(engine.activeTips.values()))
  }

  /**
   * 获取当前页面可用的 tips
   */
  const getAvailableTips = (route?: string) => {
    return engine.getAvailableTipsForRoute(route)
  }

  /**
   * 手动显示指定 tip
   */
  const showTip = async (tipId: string, force: boolean = false) => {
    return engine.showTipManually(tipId, force)
  }

  /**
   * 监听事件
   */
  const on = engine.on.bind(engine)
  const off = engine.off.bind(engine)

  return {
    // 状态
    isOnboarding,
    progress,
    currentStage,
    nextStage,
    shouldSkip,

    // 方法
    startOnboarding,
    completeTip,
    skipTip,
    skipAll,
    resetOnboarding,
    selectPath,
    showPathSelection,
    checkTriggers,
    getActiveTips,
    getAvailableTips,  // 新增
    showTip,           // 新增

    // 事件
    on,
    off
  }
}

/**
 * 标记目标元素用于高亮
 * 使用方式: <q-btn v-tip-target="'create-ippool-btn'" />
 */
export const vTipTarget = {
  mounted(el: HTMLElement, binding: { value: string }) {
    el.setAttribute('data-tip-target', binding.value)
  },
  updated(el: HTMLElement, binding: { value: string }) {
    el.setAttribute('data-tip-target', binding.value)
  }
}
