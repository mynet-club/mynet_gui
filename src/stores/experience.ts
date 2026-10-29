import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { LocalApiError, localApi } from '../services/local/localApi'
import { mapExperienceToUiState, describeUiState } from '../utils/experienceState'
import type {
  AccelerationConfig,
  AccelerationStatus,
  ExperienceStatePayload,
  LocalCapabilities,
  UiState
} from '../types/local'

/**
 * 本机体验状态 store。
 * 页面只读这里，不自行拼多个低层接口；不通过错误字符串推断状态。
 */
export const useExperienceStore = defineStore('experience', () => {
  const loading = ref(false)
  const error = ref<LocalApiError | null>(null)
  const experience = ref<ExperienceStatePayload | null>(null)
  const capabilities = ref<LocalCapabilities | null>(null)
  const acceleration = ref<AccelerationStatus | null>(null)
  const applying = ref(false)

  const uiState = computed<UiState>(() => {
    if (loading.value && !experience.value) return 'loading'
    if (applying.value) return 'applying'
    // 云端会话失效优先于本机 READY —— 否则用户看不到要登录
    if (error.value?.needLogin) return 'needs_login'
    if (error.value && !experience.value) return 'error'
    if (experience.value) return mapExperienceToUiState(experience.value.state)
    return 'loading'
  })

  const uiStateLabel = computed(() => describeUiState(uiState.value))
  const isDesktop = computed(() => capabilities.value?.form === 'pc' || !capabilities.value?.form)
  const isGateway = computed(() => capabilities.value?.form === 'gw')
  const primaryAction = computed(() => experience.value?.primary_action || '')

  const feature = (name: keyof LocalCapabilities['features']): boolean => {
    if (!capabilities.value) return false
    return !!capabilities.value.features[name]
  }

  async function refreshExperience() {
    loading.value = true
    error.value = null
    try {
      experience.value = await localApi.getExperienceState()
    } catch (e) {
      captureError(e)
    } finally {
      loading.value = false
    }
  }

  function captureError(e: unknown) {
    const err = e instanceof LocalApiError ? e : new LocalApiError({
      success: false,
      message: e instanceof Error ? e.message : String(e)
    })
    error.value = err
    return err
  }

  async function refreshCapabilities() {
    try {
      capabilities.value = await localApi.getCapabilities()
    } catch (e) {
      // capabilities 未实现时保持 null，页面按 desktop 默认隐藏高级项
      if (e instanceof LocalApiError && e.status === 404) {
        capabilities.value = null
        return
      }
      captureError(e)
    }
  }

  async function refreshAcceleration() {
    try {
      acceleration.value = await localApi.getAccelerationStatus()
    } catch (e) {
      captureError(e)
    }
  }

  async function refreshAll() {
    await Promise.all([refreshExperience(), refreshCapabilities(), refreshAcceleration()])
  }

  async function applyAcceleration(cfg: AccelerationConfig) {
    applying.value = true
    error.value = null
    try {
      await localApi.putAcceleration(cfg)
      await localApi.applyAcceleration()
      await refreshAcceleration()
    } catch (e) {
      error.value = e instanceof LocalApiError ? e : new LocalApiError({
        success: false,
        message: e instanceof Error ? e.message : String(e)
      })
      throw e
    } finally {
      applying.value = false
    }
  }

  return {
    loading,
    applying,
    error,
    experience,
    capabilities,
    acceleration,
    uiState,
    uiStateLabel,
    isDesktop,
    isGateway,
    primaryAction,
    feature,
    refreshExperience,
    refreshCapabilities,
    refreshAcceleration,
    refreshAll,
    applyAcceleration
  }
})
