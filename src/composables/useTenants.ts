import { computed, ref } from 'vue'
import debug from 'src/utils/debug'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import type { Tenant } from '../types'

/**
 * 用户面的网络区（代码层 = Tenant，中文界面叫「网络区」）。
 *
 * 状态只有 authStore 那一份：`availableTenants` = 本人归属的网络区，
 * `currentTenant` = 当前选中的那一个；三个 X-Tenant-ID 注入点读的是
 * `authStore.user.tenant_id`。这里只做取数编排与提示，不再另存同名状态
 * （以前两边各存一份，切换后界面和请求头会分叉）。
 *
 * 网络区的增删改、概览与统计属 console（operator）管理面，用户面不提供。
 */
export function useTenants() {
  const { t } = useI18n()
  const notify = useNotify()
  const authStore = useAuthStore()

  const loading = ref(false)

  const availableTenants = computed<Tenant[]>(() => authStore.availableTenants)
  const currentTenant = computed<Tenant | null>(() => authStore.currentTenant)
  const hasTenants = computed(() => availableTenants.value.length > 0)

  // 我归属的网络区列表
  const fetchAvailableTenants = async () => {
    loading.value = true
    try {
      await authStore.loadUserTenants()
    } catch (error) {
      debug.error('获取可用网络区失败:', error)
      notify.error(t('zones.fetchAvailableZonesError'))
    } finally {
      loading.value = false
    }
  }

  // 切换当前网络区（成功与否由 authStore 决定，它才是状态的唯一写入者）
  const switchTenant = async (tenantId: number) => {
    loading.value = true
    try {
      const tenant = await authStore.switchTenant(tenantId)
      notify.success(t('zones.switchedTo', { zoneName: tenant.name }))
      return tenant
    } catch (error: any) {
      debug.error('切换网络区失败:', error)
      notify.error(error?.message || t('zones.switchFailed'))
      return null
    } finally {
      loading.value = false
    }
  }

  // 登录后/进入页面时的初始化
  const init = async () => {
    loading.value = true
    try {
      await authStore.restoreCurrentTenant()
    } catch (error) {
      debug.error('初始化网络区上下文失败:', error)
      notify.error(t('zones.fetchAvailableZonesError'))
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    availableTenants,
    currentTenant,
    hasTenants,
    fetchAvailableTenants,
    switchTenant,
    init
  }
}
