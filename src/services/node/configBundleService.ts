/**
 * Config Bundle Service - v2.2.0 
 * 统一配置包获取服务，替代原有的多次分散API调用
 */

import { api } from '../api'
import debug from 'src/utils/debug'
import type { 
  ConfigBundleResponse,
  ConfigBundleWarning,
  HeartbeatRequest 
} from '../../types/nodeConfig'
import type { ApiResponse } from '../../types/api'

/**
 * Config Bundle 服务类
 * 实现 back_api v2.2.0 的一次性配置包获取功能
 */
export class ConfigBundleService {
  
  /**
   * 获取节点配置包 - 替代原有的5次分散API调用
   * @param nodeId 节点ID
   * @returns 配置包响应，包含配置文件、密钥和可能的警告
   */
  async getConfigBundle(nodeId: string): Promise<ApiResponse<ConfigBundleResponse>> {
    debug.log(`🔧 [ConfigBundle] 获取节点 ${nodeId} 的配置包`)
    
    try {
      const response = await api.get(`/nodes/${nodeId}/config-bundle`)
      
      // 处理 warnings 字段
      if (response.data.warnings && response.data.warnings.length > 0) {
        debug.warn(`🔧 [ConfigBundle] 节点 ${nodeId} 配置包包含警告:`, response.data.warnings)
        this.handleConfigWarnings(response.data.warnings)
      }
      
      debug.log(`🔧 [ConfigBundle] 节点 ${nodeId} 配置包获取成功`)
      return response as unknown as ApiResponse<ConfigBundleResponse>
      
    } catch (error: any) {
      debug.error(`🔧 [ConfigBundle] 获取节点 ${nodeId} 配置包失败:`, error)
      throw error
    }
  }
  
  /**
   * 处理配置包警告信息
   * @param warnings 警告列表
   */
  private handleConfigWarnings(warnings: ConfigBundleWarning[]): void {
    warnings.forEach(warning => {
      switch (warning.type) {
        case 'missing_peer_key':
          debug.warn(`🔧 [ConfigBundle] 缺失对等节点密钥: ${warning.node_id} - ${warning.message}`)
          break
        case 'config_error':
          debug.warn(`🔧 [ConfigBundle] 配置错误: ${warning.message}`)
          break
        case 'network_issue':
          debug.warn(`🔧 [ConfigBundle] 网络问题: ${warning.message}`)
          break
        default:
          debug.warn(`🔧 [ConfigBundle] 未知警告类型: ${warning.type} - ${warning.message}`)
      }
    })
  }
  
  /**
   * 检查配置包是否有效
   * @param configBundle 配置包数据
   * @returns 是否有效
   */
  isConfigBundleValid(configBundle: ConfigBundleResponse): boolean {
    if (!configBundle.files || !configBundle.keys) {
      return false
    }
    
    const requiredFiles = ['node.conf', 'address.conf', 'route.conf']
    for (const file of requiredFiles) {
      if (!configBundle.files[file as keyof typeof configBundle.files]) {
        debug.warn(`🔧 [ConfigBundle] 缺失必要配置文件: ${file}`)
        return false
      }
    }
    
    return true
  }
  
  /**
   * 心跳上报 - 支持 v2.2.0 标准化字段名
   * @param nodeId 节点ID
   * @param heartbeat 心跳数据
   */
  async sendHeartbeat(nodeId: string, heartbeat: HeartbeatRequest): Promise<ApiResponse<any>> {
    debug.log(`🔧 [ConfigBundle] 发送节点 ${nodeId} 心跳`)
    
    // 确保使用标准化的 vpn_interfaces 字段名（复数）
    const standardizedHeartbeat = {
      ...heartbeat,
      // 如果收到旧的 vpn_interface 字段，转换为 vpn_interfaces
      vpn_interfaces: heartbeat.vpn_interfaces || (heartbeat as any).vpn_interface ? [(heartbeat as any).vpn_interface] : []
    }
    
    // 移除可能存在的旧字段
    delete (standardizedHeartbeat as any).vpn_interface
    
    try {
      const response = await api.post('/monitor/heartbeat', standardizedHeartbeat, {
        headers: {
          'X-Node-Id': nodeId,
          'X-Timestamp': Math.floor(Date.now() / 1000).toString()
          // 注意：X-Node-Signature 需要在实际实现中添加HMAC签名
        }
      })
      
      debug.log(`🔧 [ConfigBundle] 节点 ${nodeId} 心跳发送成功`)
      return response as unknown as ApiResponse<any>
      
    } catch (error: any) {
      debug.error(`🔧 [ConfigBundle] 节点 ${nodeId} 心跳发送失败:`, error)
      throw error
    }
  }
}

// 创建服务实例
export const configBundleService = new ConfigBundleService()

// 默认导出
export default configBundleService