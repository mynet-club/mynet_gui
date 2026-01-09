/**
 * 引导状态管理
 * 使用Pinia存储用户引导进度和偏好
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  OnboardingState,
  OnboardingStages,
  OnboardingPreferences
} from '../types/tips'
import { OnboardingStage, OnboardingPath } from '../types/tips'

const STORAGE_KEY = 'mynet_onboarding_state'
const STATE_VERSION = '1.0.0'

/**
 * 默认阶段状态
 */
const defaultStages = (): OnboardingStages => ({
  welcome_shown: false,
  first_ippool_created: false,
  first_device_added: false,
  second_device_added: false,
  auto_connection_understood: false,
  inviter_friend_added: false,
  inviter_devices_viewed: false,
  cross_user_connection_established: false,
  connection_management_shown: false
})

/**
 * 默认偏好设置
 */
const defaultPreferences = (): OnboardingPreferences => ({
  skipAll: false,
  autoProgress: true,
  showProgress: true,
  allowRestart: true
})

/**
 * 从LocalStorage加载状态
 */
const loadStateFromStorage = (userId: string): Partial<OnboardingState> | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    if (!stored) return null

    const state = JSON.parse(stored) as OnboardingState
    
    // 版本不匹配则重置
    if (state.version !== STATE_VERSION) {
      console.warn('[Onboarding] Version mismatch, resetting state')
      return null
    }

    return state
  } catch (error) {
    console.error('[Onboarding] Failed to load state from storage:', error)
    return null
  }
}

/**
 * 保存状态到LocalStorage
 */
const saveStateToStorage = (userId: string, state: OnboardingState) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(state))
  } catch (error) {
    console.error('[Onboarding] Failed to save state to storage:', error)
  }
}

/**
 * 引导状态Store
 */
export const useOnboardingStore = defineStore('onboarding', () => {
  // ========== 状态 ==========
  
  const userId = ref<string>('')
  const version = ref<string>(STATE_VERSION)
  const completed = ref<boolean>(false)
  const currentStage = ref<OnboardingStage>(OnboardingStage.Welcome)
  const selectedPath = ref<OnboardingPath>(OnboardingPath.None)
  const stages = ref<OnboardingStages>(defaultStages())
  const preferences = ref<OnboardingPreferences>(defaultPreferences())
  const startedAt = ref<string | undefined>()
  const completedAt = ref<string | undefined>()
  const updatedAt = ref<string>(new Date().toISOString())

  // ========== 计算属性 ==========

  /**
   * 是否已开始引导
   */
  const isStarted = computed(() => {
    return !!startedAt.value && !completed.value
  })

  /**
   * 引导进度（0-100）
   */
  const progress = computed(() => {
    const totalStages = Object.keys(stages.value).length
    const completedStages = Object.values(stages.value).filter(Boolean).length
    return Math.round((completedStages / totalStages) * 100)
  })

  /**
   * 下一个阶段
   */
  const nextStage = computed((): OnboardingStage | null => {
    // 欢迎阶段
    if (!stages.value.welcome_shown) {
      return OnboardingStage.Welcome
    }
    
    // IP资源池阶段
    if (!stages.value.first_ippool_created) {
      return OnboardingStage.CreateIPPool
    }
    
    // 第一个设备阶段
    if (!stages.value.first_device_added) {
      return OnboardingStage.AddFirstDevice
    }

    // 路径选择
    if (selectedPath.value === OnboardingPath.None) {
      return null // 等待用户选择路径
    }

    // 路径A: 设备体验
    if (selectedPath.value === OnboardingPath.DeviceFirst) {
      if (!stages.value.second_device_added) {
        return OnboardingStage.AddSecondDevice
      }
      if (!stages.value.auto_connection_understood) {
        return OnboardingStage.UnderstandAutoConnection
      }
    }

    // 路径B: 好友连接
    if (selectedPath.value === OnboardingPath.FriendFirst) {
      if (!stages.value.inviter_friend_added) {
        return OnboardingStage.AddInviterFriend
      }
      if (!stages.value.inviter_devices_viewed) {
        return OnboardingStage.ViewInviterDevices
      }
      if (!stages.value.cross_user_connection_established) {
        return OnboardingStage.EstablishCrossUserConnection
      }
    }

    // 连接管理阶段（两个路径都需要）
    if (!stages.value.connection_management_shown) {
      return OnboardingStage.ManageConnections
    }

    return null // 全部完成
  })

  /**
   * 是否可以选择路径B（需要有邀请人）
   */
  const canSelectFriendPath = computed(() => {
    // 这里需要从auth store获取用户信息
    // 暂时返回true，实际应该检查 user.inviter_id
    return true
  })

  /**
   * 是否应该跳过引导
   */
  const shouldSkip = computed(() => {
    return preferences.value.skipAll || completed.value
  })

  // ========== 方法 ==========

  /**
   * 初始化状态
   */
  const initialize = (uid: string) => {
    userId.value = uid

    // 尝试从LocalStorage加载
    const stored = loadStateFromStorage(uid)
    if (stored) {
      version.value = stored.version || STATE_VERSION
      completed.value = stored.completed || false
      currentStage.value = stored.currentStage || OnboardingStage.Welcome
      selectedPath.value = stored.selectedPath || OnboardingPath.None
      stages.value = stored.stages || defaultStages()
      preferences.value = stored.preferences || defaultPreferences()
      startedAt.value = stored.startedAt
      completedAt.value = stored.completedAt
      updatedAt.value = stored.updatedAt || new Date().toISOString()

      console.log('[Onboarding] State loaded from storage:', {
        progress: progress.value,
        currentStage: currentStage.value,
        selectedPath: selectedPath.value
      })
    } else {
      // 首次使用，初始化状态
      reset()
      console.log('[Onboarding] Initialized new state')
    }
  }

  /**
   * 开始引导
   */
  const start = () => {
    if (!startedAt.value) {
      startedAt.value = new Date().toISOString()
      currentStage.value = OnboardingStage.Welcome
      save()
      console.log('[Onboarding] Started')
    }
  }

  /**
   * 完成指定阶段
   */
  const completeStage = (stage: OnboardingStage) => {
    switch (stage) {
      case OnboardingStage.Welcome:
        stages.value.welcome_shown = true
        break
      case OnboardingStage.CreateIPPool:
        stages.value.first_ippool_created = true
        break
      case OnboardingStage.AddFirstDevice:
        stages.value.first_device_added = true
        break
      case OnboardingStage.AddSecondDevice:
        stages.value.second_device_added = true
        break
      case OnboardingStage.UnderstandAutoConnection:
        stages.value.auto_connection_understood = true
        break
      case OnboardingStage.AddInviterFriend:
        stages.value.inviter_friend_added = true
        break
      case OnboardingStage.ViewInviterDevices:
        stages.value.inviter_devices_viewed = true
        break
      case OnboardingStage.EstablishCrossUserConnection:
        stages.value.cross_user_connection_established = true
        break
      case OnboardingStage.ManageConnections:
        stages.value.connection_management_shown = true
        break
    }

    currentStage.value = stage
    updatedAt.value = new Date().toISOString()

    // 检查是否全部完成
    checkCompletion()
    
    save()

    console.log('[Onboarding] Stage completed:', stage, {
      progress: progress.value,
      nextStage: nextStage.value
    })
  }

  /**
   * 选择引导路径
   */
  const selectPath = (path: OnboardingPath) => {
    if (path === OnboardingPath.FriendFirst && !canSelectFriendPath.value) {
      console.warn('[Onboarding] Cannot select friend path without inviter')
      return
    }

    selectedPath.value = path
    updatedAt.value = new Date().toISOString()
    save()

    console.log('[Onboarding] Path selected:', path)
  }

  /**
   * 检查是否完成所有引导
   */
  const checkCompletion = () => {
    const requiredStages: (keyof OnboardingStages)[] = [
      'welcome_shown',
      'first_ippool_created',
      'first_device_added',
      'connection_management_shown'
    ]

    // 根据路径添加必需阶段
    if (selectedPath.value === OnboardingPath.DeviceFirst) {
      requiredStages.push('second_device_added', 'auto_connection_understood')
    } else if (selectedPath.value === OnboardingPath.FriendFirst) {
      requiredStages.push(
        'inviter_friend_added',
        'inviter_devices_viewed',
        'cross_user_connection_established'
      )
    }

    const allCompleted = requiredStages.every(key => stages.value[key])

    if (allCompleted && !completed.value) {
      complete()
    }
  }

  /**
   * 完成引导
   */
  const complete = () => {
    completed.value = true
    completedAt.value = new Date().toISOString()
    currentStage.value = OnboardingStage.Completed
    save()

    console.log('[Onboarding] Completed!', {
      duration: startedAt.value 
        ? new Date(completedAt.value!).getTime() - new Date(startedAt.value).getTime()
        : 0,
      path: selectedPath.value
    })
  }

  /**
   * 跳过所有引导
   */
  const skipAll = () => {
    preferences.value.skipAll = true
    complete()
    console.log('[Onboarding] Skipped all')
  }

  /**
   * 重置引导
   */
  const reset = () => {
    version.value = STATE_VERSION
    completed.value = false
    currentStage.value = OnboardingStage.Welcome
    selectedPath.value = OnboardingPath.None
    stages.value = defaultStages()
    preferences.value = defaultPreferences()
    startedAt.value = undefined
    completedAt.value = undefined
    updatedAt.value = new Date().toISOString()
    
    save()
    
    console.log('[Onboarding] Reset')
  }

  /**
   * 更新偏好设置
   */
  const updatePreferences = (prefs: Partial<OnboardingPreferences>) => {
    preferences.value = {
      ...preferences.value,
      ...prefs
    }
    updatedAt.value = new Date().toISOString()
    save()
  }

  /**
   * 保存状态
   */
  const save = () => {
    if (!userId.value) {
      console.warn('[Onboarding] Cannot save: userId not set')
      return
    }

    const state: OnboardingState = {
      userId: userId.value,
      version: version.value,
      completed: completed.value,
      currentStage: currentStage.value,
      selectedPath: selectedPath.value,
      stages: stages.value,
      preferences: preferences.value,
      startedAt: startedAt.value || '',
      completedAt: completedAt.value || '',
      updatedAt: updatedAt.value
    }

    saveStateToStorage(userId.value, state)
  }

  /**
   * 导出状态（用于调试或同步）
   */
  const exportState = (): OnboardingState => {
    return {
      userId: userId.value,
      version: version.value,
      completed: completed.value,
      currentStage: currentStage.value,
      selectedPath: selectedPath.value,
      stages: stages.value,
      preferences: preferences.value,
      startedAt: startedAt.value || '',
      completedAt: completedAt.value || '',
      updatedAt: updatedAt.value
    }
  }

  /**
   * 导入状态
   */
  const importState = (state: OnboardingState) => {
    userId.value = state.userId
    version.value = state.version
    completed.value = state.completed
    currentStage.value = state.currentStage
    selectedPath.value = state.selectedPath
    stages.value = state.stages
    preferences.value = state.preferences
    startedAt.value = state.startedAt
    completedAt.value = state.completedAt
    updatedAt.value = state.updatedAt

    save()

    console.log('[Onboarding] State imported')
  }

  return {
    // 状态
    userId,
    version,
    completed,
    currentStage,
    selectedPath,
    stages,
    preferences,
    startedAt,
    completedAt,
    updatedAt,

    // 计算属性
    isStarted,
    progress,
    nextStage,
    canSelectFriendPath,
    shouldSkip,

    // 方法
    initialize,
    start,
    completeStage,
    selectPath,
    complete,
    skipAll,
    reset,
    updatePreferences,
    save,
    exportState,
    importState
  }
})
