/**
 * BundleEnvelope 服务（R8）—— GUI 入场
 *
 * 与 agent / ctl 共用同一 schema（spec schemas/bundle-envelope-v2）：
 * - GET  /nodes/{id}/bundle          取当前 Envelope（带 ETag）
 * - POST /nodes/{id}/bundle/publish  发布新 revision（触发节点 Fetch+Apply）
 *
 * 保存配置 / 改密钥之后调用 publish，节点才会收到 bundle_changed。
 */

import { api } from '../api'
import debug from 'src/utils/debug'
import type { ApiResponse } from '../../types/api'
import type {
  BundleEnvelopeMeta,
  BundlePublishResult,
  BundleRevisionState,
} from '../../types/bundleEnvelope'

export class BundleEnvelopeService {
  /** 当前已发布 Envelope（schema v2 外壳）；无 revision 时返回 null。 */
  async getBundle(nodeId: string): Promise<BundleEnvelopeMeta | null> {
    try {
      const response = await api.get(`/nodes/${nodeId}/bundle`)
      const env = response.data as BundleEnvelopeMeta
      return env?.schema_version ? env : null
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null
      }
      debug.error(`[BundleEnvelope] 获取节点 ${nodeId} bundle 失败:`, error)
      throw error
    }
  }

  /**
   * 发布一版 Envelope。返回 revision 元数据。
   * 后端会尽力通知 gateway（bundle_changed）；失败不阻断发布。
   */
  async publishBundle(nodeId: string): Promise<BundlePublishResult> {
    debug.log(`[BundleEnvelope] 发布节点 ${nodeId} bundle`)
    const response = await api.post(`/nodes/${nodeId}/bundle/publish`)
    const payload = (response.data?.data ?? response.data) as BundlePublishResult
    debug.log(`[BundleEnvelope] 发布完成 generation=${payload?.generation}`)
    return payload
  }

  /** 读取当前 revision 摘要（generation/checksum/etag）。 */
  async getRevision(nodeId: string): Promise<BundleRevisionState | null> {
    try {
      const response = await api.get(`/nodes/${nodeId}/bundle`)
      const env = response.data as BundleEnvelopeMeta
      if (!env?.generation) return null
      const etag = (response.headers?.etag as string) || `"${env.checksum}"`
      return { generation: env.generation, checksum: env.checksum, etag }
    } catch {
      return null
    }
  }

  /**
   * 配置/密钥变更后的标准动作：发布一版并提示 generation。
   * 发布失败不应吞掉「保存成功」——只警告。
   */
  async publishAfterChange(
    nodeId: string,
    label: string,
  ): Promise<BundlePublishResult | null> {
    try {
      const result = await this.publishBundle(nodeId)
      debug.log(`[BundleEnvelope] ${label} → 已发布 ${result.generation}`)
      return result
    } catch (error) {
      debug.warn(`[BundleEnvelope] ${label} 已保存，但 bundle 发布失败:`, error)
      return null
    }
  }
}

export const bundleEnvelopeService = new BundleEnvelopeService()
export default bundleEnvelopeService

// 便于类型导入
export type { ApiResponse }
