/**
 * 本机 WebUI 状态模型（冻结，见 mynet_agent/docs/webui-spa-page-map.md §2）
 * 页面不得从零散字段推导生命周期；一律消费这些联合类型。
 */

/** 页面统一状态层 */
export type UiState =
  | 'loading'
  | 'ready'
  | 'degraded'
  | 'needs_login'
  | 'needs_configuration'
  | 'needs_install'
  | 'applying'
  | 'error'

/** experience/state 的原始枚举（wizard.go:128-147） */
export type ExperienceState =
  | 'NEEDS_LOGIN'
  | 'NEEDS_CONFIGURATION'
  | 'NEEDS_INSTALL'
  | 'INITIALIZING'
  | 'READY'
  | 'READY_OFFLINE'
  | 'DEGRADED'

export type ExperiencePrimaryAction =
  | ''
  | 'login'
  | 'configure'
  | 'install'
  | 'retry'
  | 'start'
  | 'fix-routes'

/** 后端统一响应信封的业务字段 */
export interface ApiStateEnvelope<T> {
  state: UiState
  reason_code?: string
  message?: string
  retryable?: boolean
  data: T
}

export interface WizardState {
  logged_in?: boolean
  node_configured?: boolean
  mode?: string
  [key: string]: unknown
}

export interface NodeRuntimeState {
  state?: string
  detail?: string
  [key: string]: unknown
}

export interface ExperienceStatePayload {
  wizard: WizardState
  node: NodeRuntimeState
  state: ExperienceState
  primary_action: ExperiencePrimaryAction
}

/** capability 声明（冻结形状）；来源 experience/capabilities */
export interface LocalCapabilities {
  form: 'pc' | 'gw'
  platform: string
  features: {
    desktop_acceleration: boolean
    dns_hook: boolean
    proxy_policy: boolean
    acl: boolean
    routes_edit: boolean
    plugins: boolean
    [key: string]: boolean
  }
}

export type AccelerationLifecycle =
  | 'disabled'
  | 'waiting_tunnel'
  | 'applying'
  | 'active'
  | 'degraded'

export interface DesktopDNSSourceView {
  id: string
  label: string
  healthy: boolean
  active: boolean
  reason_code?: string
}

/** 加速节点（出口）探测快照 —— mynetd 内存态，15s 循环 */
export interface ExitProbeStatus {
  node_id?: string
  target?: string
  driver?: string
  method?: string
  link?: string
  reachable?: boolean
  rtt_ms?: number
  age_ms?: number
  consecutive_fails?: number
  monitoring?: boolean
  error?: string
}

export interface AccelerationStatus {
  enabled: boolean
  dns_enabled?: boolean
  lifecycle: AccelerationLifecycle
  exit_peer?: string
  /** 出口展示名（与加速页同一套 peer 名），无则回退 node_id */
  exit_label?: string
  dns_sources: string[]
  /** 当前生效 DNS 来源文案（与加速页「DNS 优先级」同口径） */
  dns_active?: string
  custom_dns?: string[]
  custom_domains: string[]
  cloud_domains?: string[]
  reason_code?: string
  message?: string
  retryable?: boolean
  /** dns-hook / mynetd 内存探测运行态 */
  runtime?: {
    state?: string
    active?: boolean
    wanted?: boolean
    domains?: number
    pins?: number
    routes?: number
    exit_probe?: ExitProbeStatus
  }
}

export interface AccelerationConfig {
  enabled: boolean
  dns_enabled?: boolean
  dns_sources: string[]
  custom_dns?: string[]
  custom_domains: string[]
  exit_peer?: string
}

/** localapi 成功信封 */
export interface LocalOk<T> {
  success: true
  data: T
  message?: string
  warning?: string
}

export interface LocalFail {
  success: false
  message: string
  reason_code?: string
  retryable?: boolean
  need_login?: boolean
  stage?: string
}

export type LocalResponse<T> = LocalOk<T> | LocalFail

/** exactOptionalPropertyTypes 下用显式可 undefined 字段 */
export interface LocalFailLoose {
  success: false
  message: string
  reason_code?: string | undefined
  retryable?: boolean | undefined
  need_login?: boolean | undefined
  stage?: string | undefined
  // 命令类失败（/command exit≠0）时后端 500 会带上子进程输出
  stdout?: string | undefined
  stderr?: string | undefined
}

/** node-status 对端条目（mynet node-status --json） */
export interface LocalPeer {
  node_id?: string
  node_name?: string
  overlay?: string
  link?: string
  latency_ms?: number | null
  routed?: boolean
  is_self?: boolean
  route_ok?: boolean
}

export interface LocalNodeStatus {
  state?: string
  one_line?: string
  detail?: string
  node_id?: string
  driver?: string
  tun_iface?: string
  overlay_ip?: string
  mtu?: number
  process_up?: boolean
  routes_ok?: boolean
  tun_up?: boolean
  proxy_enabled?: boolean
  rx_bytes?: number
  tx_bytes?: number
  peers?: LocalPeer[]
  peers_total?: number
  peers_routed?: number
  missing_routes?: string[]
  route_conf_text?: string
  system_routes_text?: string
  [key: string]: unknown
}

export interface ProxyACLView {
  mode?: string
  allowed_node_ids?: string[]
  allowed_cidrs?: string[]
  denied_node_ids?: string[]
}

export interface ProxyExitView {
  node_id?: string
  enabled?: boolean
  acl?: ProxyACLView
}

export interface ProxyDomainRulesView {
  proxied?: string[]
  direct?: string[]
  custom_domains?: string[]
  custom_direct?: string[]
  upstream_proxied?: string
  upstream_clean?: string[]
  platform_dns?: string
  tunnel_server?: string
  exit_dns?: string
}

export interface ProxyPolicyView {
  enabled?: boolean
  local_only?: boolean
  role?: string
  region?: string
  policy?: string
  exits?: ProxyExitView[]
  domain_rules?: ProxyDomainRulesView
  acl?: ProxyACLView
  split?: { list_source?: string; match_mode?: string }
  doh_mode?: 'allow' | 'block' | 'tunnel'
  full_tunnel?: boolean
  foreign_dns_route?: boolean
}

export interface ProxyIntentView {
  source?: string
  revision?: number
  policy?: ProxyPolicyView
}

export interface PluginProxyStatus {
  effective?: ProxyIntentView | null
  local?: ProxyIntentView | null
  cloud?: ProxyIntentView | null
  status?: { dirty?: boolean; last_error?: string }
  describe?: string
  plugin_exits?: unknown[]
  plugin_max_exits?: number
}

export interface LocalLogLine {
  time?: string
  level?: string
  component?: string
  message?: string
}
