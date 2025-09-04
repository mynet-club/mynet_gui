/**
 * VPN配置服务
 * 根据节点ID和IP池信息自动判断VPN类型
 */

import { vpnConfigData } from '../config/vpnConfig'
import { VPNConfigData, NodeConfigForm } from '../types/vpnConfig'

export class VPNConfigService {
  
  /**
   * 根据节点ID自动判断VPN类型
   * @param nodeId 节点ID
   * @returns VPN类型
   */
  static detectVpnType(nodeId: string): 'gnb' | 'wireguard' {
    const id = parseInt(nodeId)
    
    // 根据节点ID范围判断VPN类型
    // 这里可以根据具体的IP池分配规则来判断
    if (id >= 1000000000000000) {
      // 长ID通常用于GNB
      return 'gnb'
    } else {
      // 短ID通常用于WireGuard
      return 'wireguard'
    }
  }
  
  /**
   * 获取VPN配置数据
   * @returns 完整的VPN配置数据
   */
  static getVpnConfigData(): VPNConfigData {
    return vpnConfigData
  }
  
  /**
   * 获取指定VPN类型的配置
   * @param vpnType VPN类型
   * @returns VPN配置
   */
  static getVpnConfig(vpnType: 'gnb' | 'wireguard') {
    return vpnConfigData[vpnType]
  }
  
  /**
   * 获取节点支持的最高版本配置（合并版本）
   * @param vpnType VPN类型
   * @param nodeId 节点ID（用于判断支持的版本）
   * @returns 合并后的配置
   */
  static getNodeVersionConfig(vpnType: 'gnb' | 'wireguard', nodeId: string) {
    const config = vpnConfigData[vpnType]
    if (!config) return null
    
    // 获取节点支持的版本列表（这里可以根据节点ID或其他逻辑判断）
    const supportedVersions = this.getSupportedVersions(vpnType, nodeId)
    
    // 从default开始，依次合并版本配置
    let mergedConfig = config.versions['default']
    
    // 按版本顺序合并配置
    for (const version of supportedVersions) {
      if (version !== 'default' && config.versions[version]) {
        mergedConfig = this.mergeVersionConfig(mergedConfig, config.versions[version])
      }
    }
    
    return mergedConfig
  }
  
  /**
   * 获取节点支持的版本列表
   * @param vpnType VPN类型
   * @param nodeId 节点ID
   * @returns 支持的版本列表
   */
  private static getSupportedVersions(vpnType: 'gnb' | 'wireguard', nodeId: string): string[] {
    const config = vpnConfigData[vpnType]
    if (!config) return ['default']
    
    // 这里可以根据节点ID、节点类型等判断支持的版本
    // 目前简化为返回所有版本
    return config.supported_versions
  }
  
  /**
   * 合并版本配置
   * @param baseConfig 基础配置
   * @param overrideConfig 覆盖配置
   * @returns 合并后的配置
   */
  private static mergeVersionConfig(baseConfig: any, overrideConfig: any) {
    const merged = JSON.parse(JSON.stringify(baseConfig))
    
    // 合并modes配置
    if (overrideConfig.modes) {
      Object.keys(overrideConfig.modes).forEach(mode => {
        if (merged.modes[mode]) {
          // 合并parameters
          if (overrideConfig.modes[mode].parameters) {
            merged.modes[mode].parameters = {
              ...merged.modes[mode].parameters,
              ...overrideConfig.modes[mode].parameters
            }
          }
          
          // 合并parameter_overrides
          if (overrideConfig.modes[mode].parameter_overrides) {
            Object.keys(overrideConfig.modes[mode].parameter_overrides).forEach(param => {
              if (merged.modes[mode].parameters[param]) {
                merged.modes[mode].parameters[param] = {
                  ...merged.modes[mode].parameters[param],
                  ...overrideConfig.modes[mode].parameter_overrides[param]
                }
              }
            })
          }
        }
      })
    }
    
    return merged
  }
  
  /**
   * 过滤网络配置相关字段
   * @param parameters 原始参数
   * @returns 过滤后的参数
   */
  static filterNetworkFields(parameters: Record<string, any>) {
    const networkFields = ['nodeid', 'ifname', 'listen_address', 'listen_port']
    const filtered = { ...parameters }
    
    networkFields.forEach(field => {
      delete filtered[field]
    })
    
    return filtered
  }
  
  /**
   * 验证配置参数
   * @param vpnType VPN类型
   * @param version 版本
   * @param mode 模式
   * @param parameters 参数
   * @returns 验证结果
   */
  static validateConfig(
    vpnType: 'gnb' | 'wireguard',
    version: string,
    mode: 'base' | 'expert',
    parameters: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    const vpnConfig = vpnConfigData[vpnType]
    if (!vpnConfig) {
      errors.push('不支持的VPN类型')
      return { valid: false, errors }
    }
    
    const versionConfig = vpnConfig.versions[version]
    if (!versionConfig) {
      errors.push('不支持的版本')
      return { valid: false, errors }
    }
    
    const modeConfig = versionConfig.modes[mode]
    if (!modeConfig) {
      errors.push('不支持的模式')
      return { valid: false, errors }
    }
    
    // 验证必填参数
    Object.entries(modeConfig.parameters).forEach(([key, param]) => {
      if (param.required && (!parameters[key] || parameters[key] === '')) {
        errors.push(`${param.name} 是必填项`)
      }
      
      // 验证数字类型
      if (param.type === 'integer' && parameters[key] !== undefined) {
        const value = Number(parameters[key])
        if (isNaN(value)) {
          errors.push(`${param.name} 必须是数字`)
        } else {
          if (param.min !== undefined && value < param.min) {
            errors.push(`${param.name} 不能小于 ${param.min}`)
          }
          if (param.max !== undefined && value > param.max) {
            errors.push(`${param.name} 不能大于 ${param.max}`)
          }
        }
      }
      
      // 验证格式
      if (param.validation && parameters[key]) {
        const regex = new RegExp(param.validation)
        if (!regex.test(parameters[key])) {
          errors.push(`${param.name} 格式不正确`)
        }
      }
    })
    
    return { valid: errors.length === 0, errors }
  }
  
  /**
   * 生成配置文件内容
   * @param config 节点配置
   * @returns 配置文件内容
   */
  static generateConfigFile(config: NodeConfigForm): string {
    const vpnConfig = vpnConfigData[config.vpn_type]
    if (!vpnConfig) return ''
    
    // 如果是合并版本，使用节点版本配置
    let versionConfig
    if (config.vpn_version === 'merged') {
      versionConfig = this.getNodeVersionConfig(config.vpn_type, '')
    } else {
      versionConfig = vpnConfig.versions[config.vpn_version]
    }
    
    if (!versionConfig) return ''
    
    const modeConfig = versionConfig.modes[config.config_mode]
    if (!modeConfig) return ''
    
    const lines: string[] = []
    
    if (config.vpn_type === 'gnb') {
      // GNB 配置格式 (key=value)
      Object.entries(config.parameters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          lines.push(`${key}=${value}`)
        }
      })
    } else if (config.vpn_type === 'wireguard') {
      // WireGuard 配置格式 (INI格式)
      lines.push('[Interface]')
      
      Object.entries(config.parameters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const param = modeConfig.parameters[key]
          if (param) {
            // 使用参数的显示名称作为配置键
            lines.push(`${key}=${value}`)
          }
        }
      })
      
      lines.push('')
      lines.push('[Peer]')
      lines.push('# Peer配置需要根据具体需求设置')
    }
    
    return lines.join('\n')
  }
  
  /**
   * 获取推荐的端口范围
   * @param vpnType VPN类型
   * @returns 端口范围
   */
  static getPortRange(vpnType: 'gnb' | 'wireguard'): [number, number] {
    return vpnConfigData.global.port_ranges[vpnType] || [1024, 65535]
  }
}
