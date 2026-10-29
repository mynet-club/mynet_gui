import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type {
  AccelerationConfig,
  AccelerationStatus,
  ExperienceStatePayload,
  LocalCapabilities,
  LocalFailLoose,
  LocalLogLine,
  LocalNodeStatus,
  LocalResponse,
  PluginProxyStatus
} from '../../types/local'

/**
 * 本机 localapi 客户端（能力面）。
 *
 * 与平台面 `api.ts` 分离：
 * - 本机能力面：同源 `/api/v1`（experience / acceleration / node-status…），由 localapi 直接处理。
 * - 平台面（社区域）：`/gui/api/v1` 是**本机 relay 入口**——mynetd 剥 `/gui` 前缀后
 *   经 gateway 转发到后端；它仍是 127.0.0.1:8096 上的路径，不是另一台“云端 API”。
 *
 * 嵌入式 SPA 部署在 `/gui/` 时，相对路径 `/api/v1` 即落到本机能力面。
 */
function localBaseURL(): string {
  const env = import.meta.env.VITE_LOCAL_API_BASE as string | undefined
  if (env) return env.replace(/\/$/, '') + '/api/v1'
  return '/api/v1'
}

/** 桌面 DNS 来源 id → 与加速页同口径的文案。 */
const DESKTOP_DNS_LABELS: Record<string, string> = {
  custom: '本机 DNS',
  tenant: '网络区 tenant · 租户/平台 DNS',
  peer: '出口 peer',
  clean_public: '公共干净 DNS'
}

function describeDesktopDnsActive(dnsEnabled: boolean, sources: string[]): string {
  if (!dnsEnabled) return 'DNS 未开'
  const first = sources.find((s) => !!s)
  if (!first) return '未配置来源'
  return DESKTOP_DNS_LABELS[first] || first
}

export const localHttp: AxiosInstance = axios.create({
  baseURL: localBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export class LocalApiError extends Error {
  readonly reasonCode: string | undefined
  readonly retryable: boolean
  readonly needLogin: boolean
  readonly status: number | undefined
  // 命令类失败的子进程输出（exit≠0 也是有效结果，如 mynet check 的检查报告）
  readonly stdout: string | undefined
  readonly stderr: string | undefined

  constructor(fail: LocalFailLoose, status?: number | undefined) {
    super(fail.message || '本机 API 调用失败')
    this.name = 'LocalApiError'
    this.reasonCode = fail.reason_code
    this.stdout = fail.stdout
    this.stderr = fail.stderr
    const msg = fail.message || ''
    this.needLogin =
      !!fail.need_login ||
      /need_login|unauthenticated|refresh[_ ]?token|自动续期失败|登录已失效|未登录/i.test(msg)
    this.retryable = fail.retryable ?? !this.needLogin
    this.status = status
  }
}

function toFail(err: unknown): LocalFailLoose {
  if (err instanceof AxiosError) {
    const body = err.response?.data as Partial<LocalFailLoose> | undefined
    if (body && typeof body === 'object' && 'success' in body) {
      return {
        success: false,
        message: body.message || err.message,
        reason_code: body.reason_code,
        retryable: body.retryable,
        need_login: body.need_login,
        stage: body.stage
      }
    }
    if (err.code === 'ECONNABORTED') {
      return { success: false, message: '本机服务响应超时', reason_code: 'TIMEOUT', retryable: true }
    }
    if (!err.response) {
      return {
        success: false,
        message: '无法连接本机服务（mynetd 未运行？）',
        reason_code: 'LOCAL_UNREACHABLE',
        retryable: true
      }
    }
    const msg = err.message || `本机 API HTTP ${err.response.status}`
    const authExpired =
      err.response.status === 401 ||
      /need_login|unauthenticated|refresh[_ ]?token|自动续期失败|登录已失效|未登录/i.test(msg)
    return {
      success: false,
      message: msg,
      reason_code: authExpired ? 'NEED_LOGIN' : `HTTP_${err.response.status}`,
      retryable: err.response.status >= 500 && !authExpired,
      need_login: authExpired
    }
  }
  return {
    success: false,
    message: err instanceof Error ? err.message : String(err),
    reason_code: 'UNKNOWN',
    retryable: true
  }
}

async function request<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  body?: unknown,
  timeout?: number | undefined
): Promise<T> {
  const config: AxiosRequestConfig = { method, url: path }
  if (body !== undefined) config.data = body
  if (timeout !== undefined) config.timeout = timeout
  try {
    const res = await localHttp.request<LocalResponse<T>>(config)
    const payload = res.data as LocalResponse<T>
    if (payload && typeof payload === 'object' && 'success' in payload) {
      if (payload.success) return (payload as { data: T }).data
      throw new LocalApiError(payload as LocalFailLoose, res.status)
    }
    // 某些旧端点直接回业务体
    return payload as unknown as T
  } catch (err) {
    if (err instanceof LocalApiError) throw err
    const fail = toFail(err)
    const status = err instanceof AxiosError ? err.response?.status : undefined
    throw new LocalApiError(fail, status)
  }
}

export const localApi = {
  getExperienceState: () => request<ExperienceStatePayload>('get', '/experience/state'),
  getCapabilities: () => request<LocalCapabilities>('get', '/experience/capabilities'),
  getAccelerationStatus: async () => {
    // 后端回 {config, runtime}；摊平为 AccelerationStatus（enabled/lifecycle/dns…）
    const d = await request<{
      config?: {
        enabled?: boolean
        dns_enabled?: boolean
        dns_sources?: string[]
        custom_dns?: string[]
        custom_domains?: string[]
        exit_peer?: string
      }
      runtime?: {
        state?: string
        active?: boolean
        wanted?: boolean
        domains?: number
        pins?: number
        routes?: number
        pid?: number
        listen?: string
        exit_probe?: {
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
      }
    }>('get', '/acceleration/status')
    const c = d.config || {}
    const rt = d.runtime || {}
    const state = rt.state || ''
    let lifecycle: AccelerationStatus['lifecycle'] = 'disabled'
    if (state === 'dns_overridden') lifecycle = 'degraded'
    else if (rt.active) lifecycle = 'active'
    else if (rt.wanted || c.enabled) lifecycle = 'waiting_tunnel'
    else if (state === 'applying') lifecycle = 'applying'
    // 出口与加速页 loadExits 同源：config 没有则读插件壳 Effective/Local exits
    let exitPeer = c.exit_peer || ''
    if (!exitPeer) {
      try {
        const p = await request<{
          effective?: { policy?: { exits?: { node_id?: string; enabled?: boolean }[] } }
          local?: { policy?: { exits?: { node_id?: string; enabled?: boolean }[] } }
        }>('get', '/plugin/proxy')
        const exits = p.effective?.policy?.exits || p.local?.policy?.exits || []
        const first = exits.find((e) => e.enabled !== false && e.node_id)
        if (first?.node_id) exitPeer = String(first.node_id)
      } catch {
        /* 无插件壳时保持空 */
      }
    }
    let exitLabel = exitPeer
    if (exitPeer) {
      try {
        const names = await request<{ names?: Record<string, string> }>(
          'get',
          `/peers/names?ids=${encodeURIComponent(exitPeer)}`
        )
        const n = names?.names?.[exitPeer]
        if (n) exitLabel = `${n} · ${exitPeer}`
      } catch {
        /* 无名字缓存时只显示 id */
      }
    }
    const dnsSources = c.dns_sources || []
    return {
      enabled: !!c.enabled,
      dns_enabled: !!c.dns_enabled,
      lifecycle,
      exit_peer: exitPeer || undefined,
      exit_label: exitPeer ? exitLabel : undefined,
      dns_sources: dnsSources,
      dns_active: describeDesktopDnsActive(!!c.dns_enabled, dnsSources),
      custom_dns: c.custom_dns || [],
      custom_domains: c.custom_domains || [],
      runtime: {
        state: rt.state || '',
        active: !!rt.active,
        wanted: !!rt.wanted,
        domains: rt.domains ?? 0,
        pins: rt.pins ?? 0,
        routes: rt.routes ?? 0,
        exit_probe: rt.exit_probe
      },
      message: rt.active
        ? `DNS 钉扎 ${rt.domains ?? 0} 个域名`
        : rt.wanted
          ? '等待隧道连接'
          : c.enabled
            ? '已启用但未生效'
            : '未开启',
      retryable: true
    } as AccelerationStatus
  },
  getAcceleration: () => request<AccelerationConfig>('get', '/acceleration'),
  putAcceleration: (cfg: AccelerationConfig) =>
    request<AccelerationConfig>('put', '/acceleration', cfg),
  applyAcceleration: () => request<unknown>('post', '/acceleration/apply', {}),
  installAcceleration: () => request<unknown>('post', '/acceleration/install', {}),
  refreshDomains: () => request<{ cloud_domains: string[] }>('post', '/acceleration/domains/refresh', {}),
  // 节点显示名本地缓存（mynetd 落盘，断网可用）
  getNodeNames: (ids?: string[]) =>
    request<{ names: Record<string, string> }>(
      'get',
      '/peers/names' + (ids && ids.length ? `?ids=${encodeURIComponent(ids.join(','))}` : '')
    ),
  refreshNodeNames: () => request<{ names: Record<string, string> }>('post', '/peers/names/refresh', {}),
  // 读本机缓存的云端清单（不访问网络）
  getDomains: () =>
    request<{
      cloud_domains: string[]
      custom_domains?: string[]
      cloud_direct?: string[]
      custom_blocked?: string[]
      blocked_enabled?: boolean
      blocked_count?: number
      version?: string
    }>('get', '/acceleration/domains'),
  putBlocked: (domains: string[], enabled?: boolean) =>
    request<{ custom_blocked: string[]; blocked_enabled: boolean }>('put', '/acceleration/blocked', {
      domains,
      ...(enabled === undefined ? {} : { enabled })
    })
}

/** 云端节点清单（平台面经本机 relay）；401 → LocalApiError.needLogin */
export async function listCloudNodes(): Promise<{ node_id?: string; id?: string; node_name?: string; name?: string }[]> {
  try {
    const res = await localHttp.get('/config/cloud')
    const payload = res.data as { data?: { nodes?: unknown[] }; nodes?: unknown[] }
    return (payload?.data?.nodes || payload?.nodes || []) as { node_id?: string; id?: string; node_name?: string; name?: string }[]
  } catch (e) {
    if (e instanceof LocalApiError) throw e
    const fail = toFail(e)
    if ((e as { response?: { status?: number } })?.response?.status === 401) fail.need_login = true
    throw new LocalApiError(fail, (e as { response?: { status?: number } })?.response?.status)
  }
}

export type LocalApi = typeof localApi

// ── 网关面（M4）────────────────────────────────────────────
// 仍是本机能力面：/api/v1，不经 /gui/api/v1 relay。
export const localGatewayApi = {
  getNodeStatus: () => request<LocalNodeStatus>('get', '/node-status'),
  getStatus: () => request<Record<string, unknown>>('get', '/status'),
  getPlugins: () => request<unknown>('get', '/plugins'),
  getLogs: (lines = 80) =>
    request<{
      events?: { time?: string; level?: string; comp?: string; msg?: string; attrs?: string }[]
      files?: { name: string; text: string }[]
    }>('get', `/logs?lines=${lines}`),
  getPluginProxy: () => request<PluginProxyStatus>('get', '/plugin/proxy'),
  postPluginProxy: (policy: unknown) =>
    request<unknown>('post', '/plugin/proxy', { policy }),
  runCommand: (argv: string[], timeout = 30000) =>
    request<{ stdout?: string; stderr?: string }>('post', '/command', { argv }, timeout)
}
