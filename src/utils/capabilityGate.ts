import type { CapabilityBlockedBy } from '../types/utc'

export interface CapabilityGateState {
  desired_enabled?: boolean
  effective_enabled?: boolean
  blocked_by?: CapabilityBlockedBy
  blocked_reason?: string | null
}

export interface CapabilityGatePresentation {
  /** 是否被上级开关、配额或本机状态阻断（不含用户主动关闭） */
  blocked: boolean
  tone: 'ok' | 'warn' | 'err' | 'muted'
  chipColor: string
  chipLabel: string
  icon: string
  reason: string
  actionHint: string
  showUpgradeAction: boolean
}

export function resolveCapabilityGate(state: CapabilityGateState): CapabilityGatePresentation {
  const blockedBy = state.blocked_by ?? null
  const reason = (state.blocked_reason || '').trim()

  if (state.effective_enabled === false && blockedBy && blockedBy !== 'user') {
    switch (blockedBy) {
      case 'platform':
        return {
          blocked: true,
          tone: 'err',
          chipColor: 'negative',
          chipLabel: '平台停用',
          icon: 'block',
          reason: reason || '平台已全局停用该服务',
          actionHint: '平台维护或全局关闭期间暂不可用，恢复后将自动生效。',
          showUpgradeAction: false
        }
      case 'tenant':
        return {
          blocked: true,
          tone: 'warn',
          chipColor: 'warning',
          chipLabel: '区未开启',
          icon: 'domain_disabled',
          reason: reason || '当前网络区未开启该服务',
          actionHint: '请联系网络区管理员在租户后台（Console）开启该服务。',
          showUpgradeAction: false
        }
      case 'quota':
        return {
          blocked: true,
          tone: 'err',
          chipColor: 'negative',
          chipLabel: '配额已满',
          icon: 'data_usage',
          reason: reason || '当前可用配额已耗尽',
          actionHint: '升级或扩容资源包后即可继续使用。',
          showUpgradeAction: true
        }
      case 'node':
        return {
          blocked: true,
          tone: 'warn',
          chipColor: 'warning',
          chipLabel: '本机未就绪',
          icon: 'router',
          reason: reason || '目标节点未启用或本机服务未就绪',
          actionHint: '请前往本机面板检查节点与守护进程运行状态。',
          showUpgradeAction: false
        }
    }
  }

  if (blockedBy === 'user' || state.desired_enabled === false) {
    return {
      blocked: false,
      tone: 'muted',
      chipColor: 'grey-6',
      chipLabel: '已关闭',
      icon: 'toggle_off',
      reason: '',
      actionHint: '',
      showUpgradeAction: false
    }
  }

  return {
    blocked: false,
    tone: 'ok',
    chipColor: 'positive',
    chipLabel: '已生效',
    icon: 'check_circle',
    reason: '',
    actionHint: '',
    showUpgradeAction: false
  }
}
