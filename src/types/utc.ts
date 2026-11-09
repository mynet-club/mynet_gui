export interface UtcDataSource {
  mode: string
  durable: boolean
  note: string
}

export interface UtcTransport {
  transport_id: string
  node_id: string | null
  spki_sha256: string
  account_id: string
  registered_at: string
}

export interface UtcIdentity {
  account_id: string
  tenant_id: string | null
  scope: string
  transport_count: number
  transports: UtcTransport[]
  data_source: UtcDataSource
}

export interface UtcTransportList {
  scope: string
  count: number
  transports: UtcTransport[]
  data_source: UtcDataSource
}

export interface UtcEdge {
  edge_id: string
  endpoint: string
  port: number
  family: string
  shard: number | null
  online: boolean
  eligible: boolean
  last_seen_at: string | null
}

export interface UtcHubStatus {
  scope: string
  eligible: number
  edge_count: number
  observed_at: string | null
  edges: UtcEdge[]
  data_source: UtcDataSource
}

export type UtcAccelerationObservedState = 'UNKNOWN' | 'APPLIED'

export interface UtcAccelerationItem {
  transport_id: string
  account_id: string
  desired_enabled: boolean
  desired_revision: number
  observed_state: UtcAccelerationObservedState
  observed_detail: string | null
  updated_at: string | null
}

export interface UtcAccelerationList {
  data_source: UtcDataSource
  items: UtcAccelerationItem[]
}

export interface UtcPath {
  transport_id: string
  pair_id: number
  side: number
  mode: string
  edge_id: string
  shard: number | null
  reactor: number | null
  pair_gen: number
  lease_epoch: number
  placement_epoch: number
  status: string
  assigned_at: string | null
}

export interface UtcPathList {
  scope: string
  count: number
  items: UtcPath[]
  data_source: UtcDataSource
}

export interface UtcUsageRecord {
  transport_id: string
  pair_id: number
  side: number
  direction: string
  quota_slice_id: string | null
  quota_bytes: number
  used_bytes: number
  reserved_bytes: number
  uncertain_bytes: number
  updated_at: string | null
}

export interface UtcUsageTotals {
  quota_bytes: number
  used_bytes: number
  reserved_bytes: number
  uncertain_bytes: number
  remaining_bytes: number
  overage_bytes: number
}

export interface UtcUsageList {
  scope: string
  count: number
  items: UtcUsageRecord[]
  totals: UtcUsageTotals
  data_source: UtcDataSource
}

export interface UtcFault {
  transport_id: string
  pair_id: number | null
  side: number | null
  state: string
  reason_code: string
  retryable: boolean
  first_seen_at: string | null
  last_seen_at: string | null
  detail: string | null
}

export interface UtcFaultList {
  scope: string
  count: number
  items: UtcFault[]
  data_source: UtcDataSource
}

export interface UtcPathFilters {
  transport_id?: string | undefined
  pair_id?: number | undefined
  side?: number | undefined
  edge_id?: string | undefined
}

export interface UtcUsageFilters {
  transport_id?: string | undefined
  pair_id?: number | undefined
  side?: number | undefined
  direction?: string | undefined
}

export interface UtcFaultFilters {
  transport_id?: string | undefined
  pair_id?: number | undefined
  state?: string | undefined
  reason_code?: string | undefined
}
