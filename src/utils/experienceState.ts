import type {
  ExperiencePrimaryAction,
  ExperienceState,
  UiState
} from '../types/local'

/**
 * experience/state → UI 状态层映射（冻结，webui-spa-page-map.md §2）。
 * 纯函数，禁止在此推断后端未声明的生命周期。
 */
export function mapExperienceToUiState(state: ExperienceState | string): UiState {
  switch (state) {
    case 'NEEDS_LOGIN':
      return 'needs_login'
    case 'NEEDS_CONFIGURATION':
      return 'needs_configuration'
    case 'NEEDS_INSTALL':
      return 'needs_install'
    case 'INITIALIZING':
      return 'loading'
    case 'READY':
      return 'ready'
    case 'READY_OFFLINE':
      return 'ready'
    case 'DEGRADED':
      return 'degraded'
    default:
      return 'error'
  }
}

export function isActionablePrimary(
  action: ExperiencePrimaryAction | string
): boolean {
  return action === 'login' || action === 'configure' || action === 'install' || action === 'start' || action === 'fix-routes' || action === 'retry'
}

export function describeUiState(state: UiState): { text: string; tone: 'ok' | 'warn' | 'error' | 'info' | 'muted' } {
  switch (state) {
    case 'ready':
      return { text: '就绪', tone: 'ok' }
    case 'degraded':
      return { text: '降级运行', tone: 'warn' }
    case 'needs_login':
      return { text: '需要登录', tone: 'warn' }
    case 'needs_configuration':
      return { text: '需要配置', tone: 'warn' }
    case 'needs_install':
      return { text: '需要安装', tone: 'warn' }
    case 'applying':
      return { text: '正在应用', tone: 'info' }
    case 'loading':
      return { text: '读取中', tone: 'muted' }
    case 'error':
      return { text: '出错', tone: 'error' }
    default:
      return { text: String(state), tone: 'muted' }
  }
}
