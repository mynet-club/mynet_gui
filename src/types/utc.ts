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

// ── Relay 管理面（M5-03 产品化表层）────────────────────────────
// 管理员可读写的库存声明与 approved-pair 名单。注意：`delivery_state` 恒为
// `not_wired`（Hub 管理面下发未接通），配置不等于已生效，页面必须如实展示。

export type UtcRelayApprovalState = 'pending' | 'approved' | 'revoked'

export type UtcRelayDeclaredState = 'active' | 'draining' | 'revoked'

export type UtcRelayDeliveryState = 'not_wired'

export interface UtcRelayDelivery {
  state: UtcRelayDeliveryState | string
  note: string
}

export interface UtcRelayInventoryItem {
  edge_id: string
  tenant_id: string
  inventory_revision: number
  pool_id: string
  region: string
  zone: string | null
  visibility: string
  address: string
  port: number
  family: number
  modes: string[]
  shard_count: number
  reactor_count: number
  max_streams: number
  max_mbps: number
  headroom_pct: number
  weight: number
  trust_tier: string
  cost_tier: number
  valid_from: string
  valid_until: string
  descriptor_digest: string
  spki_sha256_current: string
  cert_epoch: number
  declared_state: UtcRelayDeclaredState
  approval_state: UtcRelayApprovalState
  approved_at: string | null
  approved_by: string | null
  revoked_at: string | null
  revoked_by: string | null
  revocation_reason: string | null
  audit_ref: string
  created_by: string
  updated_by: string
  eligible: boolean
  eligibility_reasons: string[]
  delivery_state: string
  created_at: string
  updated_at: string
}

export interface UtcRelayInventoryList {
  scope: string
  count: number
  delivery: UtcRelayDelivery
  items: UtcRelayInventoryItem[]
  data_source: UtcDataSource
}

export interface UtcRelayInventoryResult {
  item: UtcRelayInventoryItem
  delivery: UtcRelayDelivery
  data_source: UtcDataSource
}

export interface UtcRelayInventoryFilters {
  approval_state?: string | undefined
  declared_state?: string | undefined
  eligible?: 0 | 1 | undefined
  pool_id?: string | undefined
  region?: string | undefined
}

export interface UtcRelayInventoryDraft {
  edge_id?: number | undefined
  pool_id: string
  region: string
  zone?: string | null | undefined
  visibility: string
  address: string
  port: number
  family: number
  modes: string[]
  shard_count: number
  reactor_count: number
  max_streams: number
  max_mbps: number
  headroom_pct?: number | undefined
  weight?: number | undefined
  trust_tier: string
  cost_tier: number
  valid_from?: string | undefined
  valid_until: string
  descriptor_digest: string
  spki_sha256_current: string
  cert_epoch: number
  audit_ref: string
  declared_state?: 'active' | 'draining' | undefined
}

export type UtcPairApprovalState = 'approved' | 'revoked'

export interface UtcPairApprovalItem {
  id: number
  tenant_id: string
  transport_id: string
  pair_id: number
  side: number
  state: UtcPairApprovalState
  revision: number
  reason: string
  audit_ref: string
  approved_by: string
  approved_at: string
  revoked_by: string | null
  revoked_at: string | null
  updated_at: string
}

export interface UtcPairApprovalList {
  scope: string
  count: number
  counts: { approved: number; cap: number }
  delivery: UtcRelayDelivery
  items: UtcPairApprovalItem[]
  data_source: UtcDataSource
}

export interface UtcPairApprovalResult {
  item: UtcPairApprovalItem
  delivery: UtcRelayDelivery
  data_source: UtcDataSource
}

export interface UtcPairApprovalDraft {
  transport_id: string
  pair_id: number
  side: number
  reason: string
  audit_ref: string
}
