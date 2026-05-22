/**
 * 节点配置管理服务
 */

import { api } from '../api'
import debug from 'src/utils/debug'
import type {
  NodeConfig,
  ConfigUpdateRequest,
  FlatConfigUpdateRequest
} from '../../types/nodeConfig'
import type { ApiResponse } from '../../types/api'

/**
 * 节点配置服务类
 */
export class NodeConfigService {

  /**
   * 获取节点配置
   */
  async getNodeConfig(nodeId: string): Promise<ApiResponse<NodeConfig>> {
    debug.log(`🔧 [NodeConfig] 获取节点 ${nodeId} 配置`)
    try {
      const response = await api.get(`/nodes/${nodeId}/config`)
      debug.log(`🔧 [NodeConfig] 节点 ${nodeId} 配置获取成功:`, response.data)
      return response.data
    } catch (error: any) {
      debug.error(`🔧 [NodeConfig] 获取节点 ${nodeId} 配置失败:`, error)
      throw error
    }
  }

  /**
   * 更新节点配置
   */
  async updateNodeConfig(nodeId: string, config: ConfigUpdateRequest | FlatConfigUpdateRequest): Promise<ApiResponse<NodeConfig>> {
    const response = await api.put(`/nodes/${nodeId}/config`, config)
    return response.data
  }

  /**
   * 获取渲染后的配置文件内容（文本格式）
   */
  async getRenderedConfig(nodeId: string): Promise<string> {
    const response = await api.get(`/nodes/${nodeId}/config`, {
      params: { render_conf: 1 },
      headers: { 'Accept': 'text/plain' }
    })
    return response.data
  }
}

// 创建服务实例
export const nodeConfigService = new NodeConfigService()

export default nodeConfigService
