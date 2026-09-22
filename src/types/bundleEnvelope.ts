/**
 * BundleEnvelope (schema v2) 类型 —— 与 mynet_ctl/docs/knowledge-base/spec/schemas/bundle-envelope-v2.schema.json 对齐。
 * GUI 只关心外壳与 revision 元数据；driver intent 细节由 agent 消费。
 */
export interface BundleEnvelopeMeta {
  schema_version: number
  generation: string
  checksum: string
  generated_at: string
  min_agent_version?: string
  node: { id: string; interface?: string; mtu?: number; listen_port?: number }
  driver: 'gnb' | 'wireguard'
}

export interface BundlePublishResult {
  generation: string
  checksum: string
  etag: string
}

export interface BundleRevisionState {
  generation: string
  checksum: string
  etag: string
}
