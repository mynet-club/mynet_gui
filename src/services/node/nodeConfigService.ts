/**
 * 节点配置管理服务
 * 基于OpenAPI文档 v1.0.0 和 GNB/WireGuard 配置规范
 */

import { api } from '../api'
import type {
  NodeConfig,
  ConfigUpdateRequest,
  FlatConfigUpdateRequest,
  ConfigPreview,
  ConfigValidationResult,
  VPNConfigTemplate,
  ConfigTemplateApplyRequest,
  ConfigExport,
  ConfigImport,
  ConfigHistory,
  ConfigDiff,
  VPNType,
  ConfigMode
} from '../../types/nodeConfig'
import type {
  ApiResponse,
  PaginatedApiResponse
} from '../../types/api'

/**
 * 节点配置服务类
 * 提供配置的管理、验证、预览等功能
 */
export class NodeConfigService {

  /**
   * 获取节点配置
   * @param nodeId 节点ID
   * @returns 节点配置
   */
  async getNodeConfig(nodeId: string): Promise<ApiResponse<NodeConfig>> {
    const response = await api.get(`/nodes/${nodeId}/config`)
    return response.data
  }

  /**
   * 更新节点配置
   * @param nodeId 节点ID
   * @param config 配置更新数据
   * @returns 更新后的配置
   */
  async updateNodeConfig(nodeId: string, config: ConfigUpdateRequest | FlatConfigUpdateRequest): Promise<ApiResponse<NodeConfig>> {
    const response = await api.put(`/nodes/${nodeId}/config`, config)
    return response.data
  }

  /**
   * 预览配置文件
   * @param nodeId 节点ID
   * @param config 配置数据
   * @returns 配置预览
   */
  async previewConfig(nodeId: string, config: ConfigUpdateRequest): Promise<ApiResponse<ConfigPreview>> {
    const response = await api.post(`/nodes/${nodeId}/config/preview`, config)
    return response.data
  }

  /**
   * 下载配置文件
   * @param nodeId 节点ID
   * @param format 文件格式
   * @returns 配置文件
   */
  async downloadConfig(nodeId: string, format: 'ini' | 'json' | 'yaml' = 'ini'): Promise<Blob> {
    const response = await api.get(`/nodes/${nodeId}/config/download`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * 验证配置
   * @param config 配置数据
   * @returns 验证结果
   */
  async validateConfig(config: ConfigUpdateRequest): Promise<ApiResponse<ConfigValidationResult>> {
    const response = await api.post('/config/validate', config)
    return response.data
  }

  /**
   * 重置配置为默认值
   * @param nodeId 节点ID
   * @param vpnType VPN类型
   * @param version VPN版本
   * @returns 重置后的配置
   */
  async resetConfigToDefault(nodeId: string, vpnType: VPNType, version?: string): Promise<ApiResponse<NodeConfig>> {
    const response = await api.post(`/nodes/${nodeId}/config/reset`, {
      vpn_type: vpnType,
      version
    })
    return response.data
  }

  // --- 配置模板管理 ---

  /**
   * 获取VPN配置模板列表
   * @returns 配置模板列表
   */
  async getVPNConfigTemplates(): Promise<ApiResponse<VPNConfigTemplate[]>> {
    const response = await api.get('/config/vpn-templates')
    return response.data
  }

  /**
   * 获取特定VPN配置模板
   * @param vpnType VPN类型
   * @param version VPN版本
   * @returns 配置模板
   */
  async getVPNConfigTemplate(vpnType: VPNType, version?: string): Promise<ApiResponse<VPNConfigTemplate>> {
    const response = await api.get(`/config/vpn-templates/${vpnType}`, {
      params: { version }
    })
    return response.data
  }

  /**
   * 应用配置模板
   * @param nodeId 节点ID
   * @param request 模板应用请求
   * @returns 应用后的配置
   */
  async applyConfigTemplate(nodeId: string, request: ConfigTemplateApplyRequest): Promise<ApiResponse<NodeConfig>> {
    const response = await api.post(`/nodes/${nodeId}/config/apply-template`, request)
    return response.data
  }

  // --- 配置历史和版本管理 ---

  /**
   * 获取配置历史
   * @param nodeId 节点ID
   * @param limit 限制数量
   * @returns 配置历史列表
   */
  async getConfigHistory(nodeId: string, limit: number = 10): Promise<ApiResponse<ConfigHistory[]>> {
    const response = await api.get(`/nodes/${nodeId}/config/history`, {
      params: { limit }
    })
    return response.data
  }

  /**
   * 恢复到历史配置
   * @param nodeId 节点ID
   * @param historyId 历史记录ID
   * @returns 恢复后的配置
   */
  async restoreFromHistory(nodeId: string, historyId: string): Promise<ApiResponse<NodeConfig>> {
    const response = await api.post(`/nodes/${nodeId}/config/restore/${historyId}`)
    return response.data
  }

  /**
   * 比较配置差异
   * @param nodeId 节点ID
   * @param compareWithId 对比的历史记录ID
   * @returns 配置差异
   */
  async compareConfig(nodeId: string, compareWithId: string): Promise<ApiResponse<ConfigDiff[]>> {
    const response = await api.get(`/nodes/${nodeId}/config/compare/${compareWithId}`)
    return response.data
  }

  // --- 配置导入导出 ---

  /**
   * 导出配置
   * @param nodeId 节点ID
   * @param format 导出格式
   * @returns 导出的配置
   */
  async exportConfig(nodeId: string, format: 'json' | 'yaml' = 'json'): Promise<ApiResponse<ConfigExport>> {
    const response = await api.get(`/nodes/${nodeId}/config/export`, {
      params: { format }
    })
    return response.data
  }

  /**
   * 导入配置
   * @param nodeId 节点ID
   * @param importData 导入数据
   * @returns 导入结果
   */
  async importConfig(nodeId: string, importData: ConfigImport): Promise<ApiResponse<NodeConfig>> {
    const response = await api.post(`/nodes/${nodeId}/config/import`, importData)
    return response.data
  }

  /**
   * 获取渲染后的配置文件内容
   * @param nodeId 节点ID
   * @returns 渲染后的配置文件内容（文本格式）
   */
  async getRenderedConfig(nodeId: string): Promise<string> {
    const response = await api.get(`/nodes/${nodeId}/config`, {
      params: { render_conf: 1 },
      headers: {
        'Accept': 'text/plain'
      }
    })
    return response.data
  }

  // --- 本地配置处理和验证 ---

  /**
   * 本地验证网络配置
   * @param config 网络配置
   * @returns 验证结果
   */
  validateNetworkConfig(config: NodeConfig['network']): ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // 验证接口名称
    if (!config.interface_name) {
      errors.push('网络接口名称不能为空')
    } else if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,15}$/.test(config.interface_name)) {
      errors.push('网络接口名称格式不正确')
    }

    // 验证监听地址
    if (!config.listen_address) {
      errors.push('监听地址不能为空')
    } else if (!this.isValidIPAddress(config.listen_address) && config.listen_address !== '0.0.0.0') {
      errors.push('监听地址格式不正确')
    }

    // 验证端口
    if (!config.listen_port) {
      errors.push('监听端口不能为空')
    } else if (config.listen_port < 1024 || config.listen_port > 65535) {
      if (config.listen_port < 1024) {
        warnings.push('使用小于1024的端口可能需要管理员权限')
      } else {
        errors.push('端口号必须在1-65535之间')
      }
    }

    // 验证MTU
    if (!config.mtu) {
      errors.push('MTU值不能为空')
    } else if (config.mtu < 576 || config.mtu > 9000) {
      if (config.mtu < 1280) {
        warnings.push('MTU值过小可能影响性能')
      } else if (config.mtu > 1500) {
        suggestions.push('MTU值超过1500，请确认网络环境支持巨型帧')
      }
    }

    // 验证IPv4地址
    if (config.ipv4_address && !this.isValidIPAddress(config.ipv4_address)) {
      errors.push('IPv4地址格式不正确')
    }

    // 验证IPv6地址
    if (config.ipv6_address && !this.isValidIPv6Address(config.ipv6_address)) {
      errors.push('IPv6地址格式不正确')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      field_errors: {}
    }
  }

  /**
   * 生成默认配置
   * @param vpnType VPN类型
   * @param nodeType 节点类型
   * @returns 默认配置
   */
  generateDefaultConfig(vpnType: VPNType, nodeType?: string): Partial<NodeConfig> {
    const baseConfig: Partial<NodeConfig> = {
      vpn_type: vpnType,
      config_mode: 'base',
      network: {
        interface_name: vpnType === 'gnb' ? 'gnb0' : 'wg0',
        listen_address: '0.0.0.0',
        listen_port: vpnType === 'gnb' ? 9001 : 51820,
        mtu: 1420
      },
      basic_config: {}
    }

    // 根据VPN类型设置特定配置
    if (vpnType === 'gnb') {
      baseConfig.basic_config = {
        multi_socket: true,
        daemon: true,
        log_level: 'info',
        node_address: '10.0.0.1'
      }
    } else if (vpnType === 'wireguard') {
      baseConfig.basic_config = {
        persistent_keepalive: 25,
        allowed_ips: ['0.0.0.0/0'],
        dns: ['1.1.1.1', '8.8.8.8']
      }
    }

    // 根据节点类型调整配置
    if (nodeType === 'Gateway') {
      if (baseConfig.network) {
        baseConfig.network.listen_port = vpnType === 'gnb' ? 9001 : 51820
      }
    }

    return baseConfig
  }

  /**
   * 合并配置
   * @param currentConfig 当前配置
   * @param updates 更新配置
   * @returns 合并后的配置
   */
  mergeConfig(currentConfig: NodeConfig, updates: ConfigUpdateRequest): NodeConfig {
    const merged: NodeConfig = {
      ...currentConfig
    }

    // 应用更新
    if (updates.vpn_type) merged.vpn_type = updates.vpn_type
    if (updates.vpn_version) merged.vpn_version = updates.vpn_version
    if (updates.config_mode) merged.config_mode = updates.config_mode

    // 深度合并网络配置
    if (updates.network) {
      merged.network = {
        ...currentConfig.network,
        ...updates.network
      }
    }

    // 深度合并基础配置
    if (updates.basic_config) {
      merged.basic_config = {
        ...currentConfig.basic_config,
        ...updates.basic_config
      }
    }

    // 深度合并专家配置
    if (updates.expert_config) {
      merged.expert_config = {
        ...currentConfig.expert_config,
        ...updates.expert_config
      }
    }

    return merged
  }

  /**
   * 格式化配置文件内容
   * @param config 配置对象
   * @param format 格式类型
   * @returns 格式化后的内容
   */
  formatConfigContent(config: NodeConfig, format: 'ini' | 'json' | 'yaml'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(config, null, 2)
      case 'yaml':
        // 简单的YAML格式化（实际项目中建议使用专门的YAML库）
        return this.configToYaml(config)
      case 'ini':
      default:
        return this.configToIni(config)
    }
  }

  // --- 私有辅助方法 ---

  /**
   * 验证IP地址格式
   * @param ip IP地址
   * @returns 是否有效
   */
  private isValidIPAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Regex.test(ip)
  }

  /**
   * 验证IPv6地址格式
   * @param ip IPv6地址
   * @returns 是否有效
   */
  private isValidIPv6Address(ip: string): boolean {
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    return ipv6Regex.test(ip)
  }

  /**
   * 配置转换为INI格式
   * @param config 配置对象
   * @returns INI格式字符串
   */
  private configToIni(config: NodeConfig): string {
    let ini = `# ${config.vpn_type.toUpperCase()} Configuration\n`
    ini += `# Generated at: ${new Date().toISOString()}\n\n`

    // 网络配置段
    ini += '[Network]\n'
    Object.entries(config.network).forEach(([key, value]) => {
      ini += `${key} = ${value}\n`
    })
    ini += '\n'

    // 基础配置段
    ini += '[Config]\n'
    Object.entries(config.basic_config).forEach(([key, value]) => {
      ini += `${key} = ${value}\n`
    })

    // 专家配置段
    if (config.expert_config && Object.keys(config.expert_config).length > 0) {
      ini += '\n[Advanced]\n'
      Object.entries(config.expert_config).forEach(([key, value]) => {
        ini += `${key} = ${value}\n`
      })
    }

    return ini
  }

  /**
   * 配置转换为YAML格式
   * @param config 配置对象
   * @returns YAML格式字符串
   */
  private configToYaml(config: NodeConfig): string {
    let yaml = `# ${config.vpn_type.toUpperCase()} Configuration\n`
    yaml += `# Generated at: ${new Date().toISOString()}\n\n`
    
    yaml += `vpn_type: ${config.vpn_type}\n`
    yaml += `config_mode: ${config.config_mode}\n\n`
    
    yaml += 'network:\n'
    Object.entries(config.network).forEach(([key, value]) => {
      yaml += `  ${key}: ${JSON.stringify(value)}\n`
    })
    
    yaml += '\nbasic_config:\n'
    Object.entries(config.basic_config).forEach(([key, value]) => {
      yaml += `  ${key}: ${JSON.stringify(value)}\n`
    })

    if (config.expert_config && Object.keys(config.expert_config).length > 0) {
      yaml += '\nexpert_config:\n'
      Object.entries(config.expert_config).forEach(([key, value]) => {
        yaml += `  ${key}: ${JSON.stringify(value)}\n`
      })
    }

    return yaml
  }
}

// 创建服务实例
export const nodeConfigService = new NodeConfigService()

// 默认导出
export default nodeConfigService
