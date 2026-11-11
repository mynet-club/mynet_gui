import { api } from '../api'
import type {
  UtcAccelerationItem,
  UtcAccelerationList,
  UtcFaultFilters,
  UtcFaultList,
  UtcHubStatus,
  UtcIdentity,
  UtcPairApprovalDraft,
  UtcPairApprovalList,
  UtcPairApprovalResult,
  UtcPathFilters,
  UtcPathList,
  UtcRelayInventoryDraft,
  UtcRelayInventoryFilters,
  UtcRelayInventoryList,
  UtcRelayInventoryResult,
  UtcTransportList,
  UtcUsageFilters,
  UtcUsageList
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

  listTransports: (params?: { node_id?: string }) =>
    getData<UtcTransportList>('/utc/transports', params),

  getHubStatus: () => getData<UtcHubStatus>('/utc/hub/status'),

  listPaths: (filters?: UtcPathFilters) =>
    getData<UtcPathList>('/utc/paths', filters as Record<string, unknown> | undefined),

  listUsage: (filters?: UtcUsageFilters) =>
    getData<UtcUsageList>('/utc/usage', filters as Record<string, unknown> | undefined),

  listFaults: (filters?: UtcFaultFilters) =>
    getData<UtcFaultList>('/utc/faults', filters as Record<string, unknown> | undefined),

  getAcceleration: () => getData<UtcAccelerationList>('/utc/acceleration'),

  setAcceleration: (transportId: string, enabled: boolean) =>
    putData<UtcAccelerationItem>(`/utc/acceleration/${encodeURIComponent(transportId)}`, { enabled }),

  // ── Relay 管理面（管理员；服务端按白名单 + 租户上下文 fail-closed）──────
  // 这些调用只写管理面配置，不下发 Hub；返回的 delivery.state 必须原样展示。

  listRelayInventory: (filters?: UtcRelayInventoryFilters) =>
    getData<UtcRelayInventoryList>(
      '/utc/admin/relay-inventory',
      filters as Record<string, unknown> | undefined
    ),

  createRelayInventory: (draft: UtcRelayInventoryDraft) =>
    postData<UtcRelayInventoryResult>('/utc/admin/relay-inventory', draft),

  updateRelayInventory: (edgeId: string, draft: UtcRelayInventoryDraft & { expected_revision: number }) =>
    putData<UtcRelayInventoryResult>(
      `/utc/admin/relay-inventory/${encodeURIComponent(edgeId)}`,
      draft
    ),

  approveRelayInventory: (edgeId: string, expectedRevision: number, auditRef: string) =>
    postData<UtcRelayInventoryResult>(
      `/utc/admin/relay-inventory/${encodeURIComponent(edgeId)}/approve`,
      { expected_revision: expectedRevision, audit_ref: auditRef }
    ),

  revokeRelayInventory: (edgeId: string, expectedRevision: number, reason: string, auditRef: string) =>
    postData<UtcRelayInventoryResult>(
      `/utc/admin/relay-inventory/${encodeURIComponent(edgeId)}/revoke`,
      { expected_revision: expectedRevision, reason, audit_ref: auditRef }
    ),

  listPairApprovals: (filters?: { transport_id?: string; state?: string }) =>
    getData<UtcPairApprovalList>('/utc/admin/pair-approvals', filters),

  approvePair: (draft: UtcPairApprovalDraft) =>
    postData<UtcPairApprovalResult>('/utc/admin/pair-approvals', draft),

  revokePairApproval: (id: number, expectedRevision: number, reason: string, auditRef: string) =>
    postData<UtcPairApprovalResult>(`/utc/admin/pair-approvals/${id}/revoke`, {
      expected_revision: expectedRevision,
      reason,
      audit_ref: auditRef
    })
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

  // 管理面的 422 校验错误：message 只是框架兜底文案，真正的字段原因在 errors 里
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
