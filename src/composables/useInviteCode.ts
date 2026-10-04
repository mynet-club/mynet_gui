import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import debug from 'src/utils/debug'
import { inviteService, type InviteUsagePage } from '../services/invite/inviteService'
import { useAuthStore } from '../stores/auth'
import { useNotify } from './useNotify'
import type { InviteCodeUsage, MyInviteCode } from '../types'

/**
 * 邀请码（框架口径）与「凭码加入网络区」。
 *
 * 状态维度**全部由服务端给的三个字段现算**，前端不自造档位：
 * · `max_uses === 0` = 不限次数（框架个人码就是这个形状，别显示成「已用 0 / 0」）
 * · `used_count >= max_uses`（且 max_uses>0）= 已用满
 * · `expires_at` 为 null = 长期有效
 * 旧实现里 `invitation_status`（1/2/0）与 `is_valid` 那一套枚举已随 back 的
 * `invitations` 表一起下架，不要再在前端映射一遍。
 */
export function useInviteCode() {
  const { t } = useI18n()
  const notify = useNotify()
  const auth = useAuthStore()

  const loading = ref(false)
  const joining = ref(false)
  const myCode = ref<MyInviteCode | null>(null)
  const usages = ref<InviteCodeUsage[]>([])
  const usageTotal = ref(0)
  const usagePage = ref(1)
  const usageLastPage = ref(1)

  const hasCode = computed(() => !!myCode.value)
  const isUnlimited = computed(() => myCode.value?.max_uses === 0)
  const isUsedUp = computed(() =>
    !!myCode.value &&
    myCode.value.max_uses > 0 &&
    myCode.value.used_count >= myCode.value.max_uses
  )
  const isExpired = computed(() => {
    const expiresAt = myCode.value?.expires_at
    if (!expiresAt) return false
    return new Date(expiresAt).getTime() < Date.now()
  })
  const usageLimitText = computed(() =>
    myCode.value
      ? isUnlimited.value
        ? t('social.invitations.usageUnlimited', { used: myCode.value.used_count })
        : t('social.invitations.usageCount', {
          used: myCode.value.used_count,
          max: myCode.value.max_uses
        })
      : ''
  )

  /** 我的码属于**当前网络区**：上下文没就绪就别打，否则后端会在租户 0 上懒建一张废码 */
  const fetchMyCode = async () => {
    if (!auth.currentTenant) {
      debug.warn('[INVITE] No current tenant; skip fetching invite code')
      myCode.value = null
      return
    }
    try {
      loading.value = true
      myCode.value = await inviteService.getMyInviteCode()
    } catch (error: any) {
      debug.error('[INVITE] Failed to fetch invite code:', error)
      notify.error(error?.message || t('social.invitations.fetchError'))
    } finally {
      loading.value = false
    }
  }

  const fetchUsages = async (page = 1) => {
    if (!auth.currentTenant) {
      usages.value = []
      usageTotal.value = 0
      return
    }
    try {
      loading.value = true
      const result: InviteUsagePage = await inviteService.getMyInviteUsages(page)
      usages.value = result.data ?? []
      usageTotal.value = result.total ?? usages.value.length
      usagePage.value = result.current_page ?? page
      usageLastPage.value = result.last_page ?? 1
    } catch (error: any) {
      debug.error('[INVITE] Failed to fetch invite usages:', error)
      notify.error(error?.message || t('social.invitations.usageFetchError'))
    } finally {
      loading.value = false
    }
  }

  /**
   * 凭码加入网络区（只给还没有归属网络的账号；已在别的区的人后端会 422 拒绝）。
   * 成功后必须把「当前网络区」换过去 —— 后端已经改了
   * `users.tenant_id`，本地不换就会出现界面还没有区、请求头在新区的分裂态。
   */
  const join = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) {
      notify.error(t('social.invitations.joinCodeRequired'))
      return false
    }
    try {
      joining.value = true
      const tenant = await auth.joinTenant(trimmed)
      notify.success(t('social.invitations.joinSuccess', { name: tenant.name }))
      // 码是别人区的码，自己的码与用量都跟着当前区变了，两份数据一起重取
      await Promise.all([fetchMyCode(), fetchUsages(1)])
      return true
    } catch (error: any) {
      debug.error('[INVITE] Join failed:', error)
      notify.error(error?.message || t('social.invitations.joinError'))
      return false
    } finally {
      joining.value = false
    }
  }

  const inviteLink = (code: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/auth/register?invite_code=${encodeURIComponent(code)}`
  }

  return {
    loading,
    joining,
    myCode,
    usages,
    usageTotal,
    usagePage,
    usageLastPage,
    hasCode,
    isUnlimited,
    isUsedUp,
    isExpired,
    usageLimitText,
    fetchMyCode,
    fetchUsages,
    join,
    inviteLink
  }
}
