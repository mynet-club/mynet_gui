/**
 * VPN配置类型定义
 * 基于PHP配置文件结构
 */

export interface VPNConfigParameter {
  name: string
  type: 'string' | 'integer' | 'select' | 'text' | 'boolean'
  default?: any
  min?: number
  max?: number
  required?: boolean
  validation?: string
  options?: Record<string, string>
  description?: string
}

export interface VPNConfigMode {
  name: string
  description: string
  parameters: Record<string, VPNConfigParameter>
}

export interface VPNVersion {
  name: string
  interface_name: string
  default_port: number
  recommended_mtu: number
  config_file_extension: string
  modes: {
    base: VPNConfigMode
    expert: VPNConfigMode
  }
}

export interface VPNConfig {
  name: string
  description: string
  enabled: boolean
  supported_versions: string[]
  default_version: string
  versions: Record<string, VPNVersion>
}

export interface VPNConfigData {
  gnb: VPNConfig
  wireguard: VPNConfig
  openvpn: VPNConfig
  global: {
    default_vpn_type: string
    default_mode: string
    node_id_ranges: {
      min: number
      max: number
    }
    port_ranges: Record<string, [number, number]>
    validation_rules: Record<string, string>
  }
}

export interface NodeConfigForm {
  vpn_type: 'gnb' | 'wireguard'
  vpn_version: string
  config_mode: 'base' | 'expert'
  parameters: Record<string, any>
}
