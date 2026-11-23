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

/** 登记 transport 的请求体；身份由服务端会话决定，不在这里自报。 */
export interface UtcTransportDraft {
  transport_id: string
  node_id?: string | null
  spki_sha256: string
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

/** Core-signed reconciled usage summary (ADR-0033). Billable is Core's
 * result; the API only stores and filters it. */
export interface UtcUsageSummaryItem {
  transport_id: string | null
  pair_id: number
  pair_gen: number
  direction: string
  state: string
  window_end: number
  endpoint_a: number
  endpoint_b: number
  anchor: number
  adjustment: number
  billable: number
  issuer: string
  key_id: string
  summary_sha256: string
  received_at: string
}

export interface UtcUsageSummaryTotals {
  billable: number
  endpoint_a: number
  endpoint_b: number
  anchor: number
}

export interface UtcUsageSummaryList {
  scope: string
  count: number
  items: UtcUsageSummaryItem[]
  totals: UtcUsageSummaryTotals
  data_source: UtcDataSource
}

export interface UtcUsageSummaryFilters {
  transport_id?: string | undefined
  pair_id?: number | undefined
  direction?: string | undefined
  state?: string | undefined
}

export interface UtcUsageFilters {
  transport_id?: string | undefined
  pair_id?: number | undefined
  side?: number | undefined
  direction?: string | undefined
}

// ── Relay 管理面（M5-03 产品化表层）────────────────────────────
// 管理员可读写的库存声明与 approved-pair 名单。`delivery_state` 来自投递
// outbox：not_wired（未接 Hub）/ pending（待投递）/ wired（已送达）/
// failed（最近一次失败、待重试）；配置与“已生效”必须分开展示。

export type UtcRelayApprovalState = 'pending' | 'approved' | 'revoked'

export type UtcRelayDeclaredState = 'active' | 'draining' | 'revoked'

export type UtcRelayDeliveryState = 'not_wired' | 'pending' | 'wired' | 'failed'

export type UtcPairApprovalState = 'approved' | 'revoked'

export interface UtcClientConfigPeer {
  name: string
  transport_id: number
  pair_id: number
}

export interface UtcClientConfig {
  scope: string
  config_version: number
  transport_id: string
  node_id: string | null
  edge_candidates: string[]
  peers: UtcClientConfigPeer[]
  data_source: UtcDataSource
}
