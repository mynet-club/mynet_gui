import { api } from '../api'
import type {
  UtcAccelerationItem,
  UtcAccelerationList,
  UtcClientConfig,
  UtcIdentity,
  UtcPairApprovalCreateResult,
  UtcPairApprovalList,
  UtcPairApprovalRevokeResult,
  UtcTransport,
  UtcTransportList,
  UtcTransportDraft,
  UtcUsageFilters,
  UtcUsageList,
  UtcUsageSummaryFilters,
  UtcUsageSummaryList
} from '../../types/utc'

function compact(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = value
  }
  return Object.keys(out).length > 0 ? out : undefined
}

async function getData<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const response = await api.get(path, { params: compact(params) })
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'UTC 查询失败')
  }
  return response.data.data as T
}

async function putData<T>(path: string, body: object): Promise<T> {
  const response = await api.put(path, body)
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'UTC 更新失败')
  }
  return response.data.data as T
}

async function postData<T>(path: string, body?: object): Promise<T> {
  const response = await api.post(path, body ?? {})
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'UTC 操作失败')
  }
  return response.data.data as T
}

export const utcService = {
  getIdentity: () => getData<UtcIdentity>('/utc/identity'),

  getClientConfig: (params?: { transport_id?: string; node_id?: string }) =>
    getData<UtcClientConfig>('/utc/client-config', params),

  listTransports: (params?: { node_id?: string }) =>
    getData<UtcTransportList>('/utc/transports', params),

  // 终端引导：登记节点 transport（transport_id + node_id + SPKI）。
  registerTransport: (draft: UtcTransportDraft) =>
    postData<UtcTransport>('/utc/transports', draft),

  listUsage: (filters?: UtcUsageFilters) =>
    getData<UtcUsageList>('/utc/usage', filters as Record<string, unknown> | undefined),

  // 租户可见的 Core 签名对账摘要（ADR-0033）；billable 由 Core 计算。
  listUsageSummaries: (filters?: UtcUsageSummaryFilters) =>
    getData<UtcUsageSummaryList>(
      '/utc/usage/summaries',
      filters as Record<string, unknown> | undefined
    ),

  getAcceleration: () => getData<UtcAccelerationList>('/utc/acceleration'),

  // pair：用户面自配对，无需管理员审批；服务端只校验两端 transport 都属于本租户。
  listPairApprovals: (params?: { transport_id?: string; state?: 'approved' | 'revoked' }) =>
    getData<UtcPairApprovalList>('/utc/pair-requests', params),
  createPairApproval: (transportA: string, transportB: string, reason: string) =>
    postData<UtcPairApprovalCreateResult>('/utc/pair-requests', {
      transport_id: transportA,
      peer_transport_id: transportB,
      reason
    }),
  revokePairApproval: (pairId: number, expectedRevision: number, reason: string) =>
    postData<UtcPairApprovalRevokeResult>(`/utc/pair-requests/${pairId}/revoke`, {
      expected_revision: expectedRevision,
      reason
    }),

  setAcceleration: (transportId: string, enabled: boolean) =>
    putData<UtcAccelerationItem>(`/utc/acceleration/${encodeURIComponent(transportId)}`, { enabled }),

}

export function describeUtcError(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        message?: string
        error_code?: string
        errors?: Record<string, string[] | string>
      }
      status?: number
    }
    message?: string
  }

  const data = err?.response?.data
  const base = data?.message || err?.message || 'UTC 数据读取失败'

  // 后端 422 校验错误：message 只是兜底文案，真正的字段原因在 errors 里
  const firstError = data?.errors ? Object.entries(data.errors)[0] : undefined
  const detail = firstError
    ? Array.isArray(firstError[1])
      ? `${firstError[0]}: ${firstError[1][0]}`
      : `${firstError[0]}: ${firstError[1]}`
    : ''

  const code = data?.error_code && data.error_code !== 'VALIDATION_ERROR' ? `（${data.error_code}）` : ''

  if (!detail && !code) return base
  return detail ? `${base}：${detail}${code}` : `${base}${code}`
}
