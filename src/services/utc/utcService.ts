import { api } from '../api'
import type {
  UtcFaultFilters,
  UtcFaultList,
  UtcHubStatus,
  UtcIdentity,
  UtcPathFilters,
  UtcPathList,
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
    getData<UtcFaultList>('/utc/faults', filters as Record<string, unknown> | undefined)
}

export function describeUtcError(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string }; status?: number }
    message?: string
  }
  return err?.response?.data?.message || err?.message || 'UTC 数据读取失败'
}
