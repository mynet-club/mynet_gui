/**
 * 节点配置管理相关类型定义
 * 基于OpenAPI文档 v1.0.0 和 GNB/WireGuard 配置规范
 */

// VPN类型
export type VPNType = 'gnb' | 'wireguard'

// 配置模式
export type ConfigMode = 'base' | 'expert'

// 配置参数类型
export type ConfigParameterType = 'string' | 'integer' | 'boolean' | 'select' | 'text' | 'ip' | 'port' | 'switch' | 'multi-button'

// Config Bundle API 响应接口 (v2.2.0)
export interface ConfigBundleResponse {
  node_id: string
  zone_id: string
  version: string
  files: {
    'node.conf': string
    'address.conf': string
    'route.conf': string
  }
  keys: {
    ed25519: Record<string, string>
    security: {
      private: string
      public: string
    }
  }
  warnings?: ConfigBundleWarning[]  // v2.2.0 新增
}

// Config Bundle 警告信息
export interface ConfigBundleWarning {
  type: 'missing_peer_key' | 'config_error' | 'network_issue'
  node_id?: string
  message: string
}

// 心跳上报接口 (v2.2.0 标准化)
export interface HeartbeatRequest {
  status: 'online' | 'offline' | 'connecting'
  uptime: number
  vpn_interfaces: VpnInterface[]  // 标准化为复数形式
  system_info?: {
    cpu_usage?: number
    memory_usage?: number
    disk_usage?: number
  }
}

// VPN 接口信息
export interface VpnInterface {
  name: string
  type: 'gnb' | 'wireguard' | 'openvpn'
  status: 'up' | 'down' | 'connecting'
  ip_address?: string
  rx_bytes?: number
  tx_bytes?: number
}

// 实际API响应的节点配置结构
export interface NodeConfigApiResponse {
  node_info: {
    node_id: number
    node_name: string
    vpn_type: VPNType
    node_type: number
    endpoint: string
    node_port: number
  }
  network_config: {
    ifname: string
    virtual_ip: string
    ip_group_sequence_number: number
  }
  additional_config: {
    node_remarks: string
    node_app_version: string
    node_status: number
  }
  custom_config: {
    network: {
      mtu: number
      listen_port: number
      interface_name: string
      listen_address: string
    }
    config_mode: ConfigMode
    vpn_version: string
    basic_config: {
      [key: string]: any
    }
    expert_config?: {
      [key: string]: any
    }
  }
}

// 基础节点配置接口 (保持向后兼容)
export interface NodeConfig {
  // 基础配置
  node_id: string                     // 节点ID
  vpn_type: VPNType                   // VPN类型
  vpn_version: string                 // VPN版本
  config_mode: ConfigMode             // 配置模式
  config_version: string              // 配置版本
  
  // 网络配置
  network: {
    interface_name: string            // 网络接口名称
    listen_address: string            // 监听地址
    listen_port: number               // 监听端口
    mtu: number                       // MTU值
    ipv4_address?: string             // IPv4地址
    ipv6_address?: string             // IPv6地址
  }
  
  // 基础配置参数
  basic_config: {
    [key: string]: any                // 动态配置参数
  }
  
  // 高级配置参数 (专家模式)
  expert_config?: {
    [key: string]: any                // 高级配置参数
  }
  
  // 生成的配置文件
  generated_config?: string           // 配置文件内容
  
  // 时间戳
  created_at?: string
  updated_at?: string
}

// 配置参数定义
export interface ConfigParameter {
  name: string                        // 参数名称
  type: ConfigParameterType           // 参数类型
  label: string                       // 显示标签
  description: string                 // 参数描述
  default?: any                       // 默认值
  required?: boolean                  // 是否必填
  min?: number                        // 最小值
  max?: number                        // 最大值
  options?: { [key: string]: string } // 选项列表
  validation?: string                 // 验证规则
  placeholder?: string                // 占位符
  hint?: string                       // 提示信息
  group?: string                      // 参数分组
  order?: number                      // 排序顺序
  depends_on?: string                 // 依赖参数
  depends_value?: any                 // 依赖值
}

// 配置模式定义
export interface ConfigModeDefinition {
  name: string                        // 模式名称
  description: string                 // 模式描述
  parameters: {
    [key: string]: ConfigParameter    // 参数定义
  }
}

// VPN配置模板
export interface VPNConfigTemplate {
  vpn_type: VPNType                   // VPN类型
  name: string                        // 模板名称
  description: string                 // 模板描述
  enabled: boolean                    // 是否启用
  supported_versions: string[]        // 支持的版本
  default_version: string             // 默认版本
  
  versions: {
    [version: string]: {
      name: string                    // 版本名称
      interface_name: string          // 默认接口名称
      default_port: number            // 默认端口
      recommended_mtu: number         // 推荐MTU
      config_file_extension: string   // 配置文件扩展名
      
      modes: {
        base: ConfigModeDefinition   // 基础模式
        expert: ConfigModeDefinition  // 专家模式
      }
    }
  }
}

// 配置预览
export interface ConfigPreview {
  content: string                     // 配置内容
  format: 'ini' | 'json' | 'yaml' | 'key_value' // 格式
  filename: string                    // 文件名
  downloadable: boolean               // 是否可下载
  size: number                        // 文件大小
  preview_lines: string[]             // 预览行
}

// 配置验证结果
export interface ConfigValidationResult {
  valid: boolean                      // 是否有效
  errors: string[]                    // 错误信息
  warnings: string[]                  // 警告信息
  suggestions: string[]               // 建议信息
  field_errors: {
    [field: string]: string[]         // 字段错误
  }
}

// 配置更新请求
export interface ConfigUpdateRequest {
  vpn_type?: VPNType                  // VPN类型
  vpn_version?: string                // VPN版本
  config_mode?: ConfigMode            // 配置模式
  network?: Partial<NodeConfig['network']> // 网络配置
  basic_config?: { [key: string]: any } // 基础配置
  expert_config?: { [key: string]: any } // 专家配置
}

// 扁平化配置更新请求 - 所有字段直接在顶层
export interface FlatConfigUpdateRequest {
  vpn_type: VPNType                   // VPN类型
  vpn_version: string                 // VPN版本
  config_mode: ConfigMode             // 配置模式
  
  // 所有配置字段直接提交，不嵌套
  nodeid?: number                     // 节点ID
  ifname?: string                     // 接口名
  listen?: number                     // 监听端口号
  mtu?: number                        // MTU
  multi_socket?: string               // 多Socket
  direct_forwarding?: string          // 直接转发
  unified_forwarding?: string         // 统一转发
  standard_forwarding?: string        // 标准转发
  address_secure?: string             // 地址安全
  ipv4_only?: string                  // 仅IPv4
  ipv6_only?: string                  // 仅IPv6
  keepalive?: number                  // 保活时间
  forward?: string                    // 转发
  daemon?: string                     // 守护进程
  zip?: string                        // 压缩
  zip_level?: number                  // 压缩级别
  memory?: string                     // 内存设置
  [key: string]: any                  // 允许其他动态字段
}

// 配置差异对比
export interface ConfigDiff {
  field: string                       // 字段名
  old_value: any                      // 旧值
  new_value: any                      // 新值
  type: 'added' | 'removed' | 'modified' // 变更类型
  category: 'network' | 'basic' | 'expert' // 配置类别
}

// 配置历史记录
export interface ConfigHistory {
  id: string                          // 历史ID
  node_id: string                     // 节点ID
  config_snapshot: NodeConfig         // 配置快照
  changes: ConfigDiff[]               // 变更记录
  created_by: string                  // 创建者
  created_at: string                  // 创建时间
  comment?: string                    // 变更说明
}

// 配置模板应用请求
export interface ConfigTemplateApplyRequest {
  template_name: string               // 模板名称
  vpn_type: VPNType                   // VPN类型
  version: string                     // 版本
  mode: ConfigMode                    // 模式
  override_params?: { [key: string]: any } // 覆盖参数
}

// 配置导入导出
export interface ConfigExport {
  node_id: string                     // 节点ID
  node_name: string                   // 节点名称
  config: NodeConfig                  // 配置内容
  exported_at: string                 // 导出时间
  exported_by: string                 // 导出者
  format: 'json' | 'yaml'             // 导出格式
}

export interface ConfigImport {
  file_content: string                // 文件内容
  format: 'json' | 'yaml'             // 文件格式
  validate_only?: boolean             // 仅验证
  override_existing?: boolean         // 覆盖现有配置
}

// 默认配置值
export const DEFAULT_CONFIG_VALUES = {
  network: {
    interface_name: 'gnb0',
    listen_address: '0.0.0.0',
    listen_port: 9001,
    mtu: 1420
  },
  gnb: {
    node_address: '10.0.0.1',
    multi_socket: true,
    daemon: true,
    log_level: 'info'
  },
  wireguard: {
    persistent_keepalive: 25,
    allowed_ips: ['0.0.0.0/0'],
    dns: ['1.1.1.1', '8.8.8.8']
  }
} as const

// 配置参数分组
export const CONFIG_PARAMETER_GROUPS = {
  network: '网络配置',
  security: '安全配置',
  performance: '性能配置',
  logging: '日志配置',
  advanced: '高级配置'
} as const

// 配置验证规则
export const CONFIG_VALIDATION_RULES = {
  ip_address: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  port: /^(?:[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
  interface_name: /^[a-zA-Z][a-zA-Z0-9_-]{0,15}$/,
  cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/
} as const
