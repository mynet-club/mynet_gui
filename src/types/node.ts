/**
 * 节点管理相关类型定义
 * 基于OpenAPI文档 v1.0.0
 */

// 节点状态枚举
export type NodeStatus = 'active' | 'inactive' | 'pending'

// 节点数字状态常量 (对应服务端)
export const NODE_STATUS = {
  UNCONFIGURED: -1,    // 未完成配置
  DISABLED: 0,         // 禁用
  ENABLED: 1,          // 启用,但离线
  ONLINE: 2,           // 启用,且在线
  MAINTENANCE: 99      // 维护模式
} as const

export type NodeStatusCode = typeof NODE_STATUS[keyof typeof NODE_STATUS]

// 节点类型位掩码定义
export const NODE_TYPE = {
  EDGE: 1,      // 0000 0001 边缘节点
  RELAY: 2,     // 0000 0010 中继节点
  GATEWAY: 4,   // 0000 0100 网关节点
  MASTER: 8,    // 0000 1000 主节点
  BACKUP: 16,   // 0001 0000 备用节点
  MONITOR: 32,  // 0010 0000 监控节点
  PROXY: 64,    // 0100 0000 代理节点
  SPECIAL: 128  // 1000 0000 特殊节点
} as const

// 节点类型名称映射
export const NODE_TYPE_NAMES = {
  [NODE_TYPE.EDGE]: '边缘节点',
  [NODE_TYPE.RELAY]: '中继节点',
  [NODE_TYPE.GATEWAY]: '网关节点',
  [NODE_TYPE.MASTER]: '主节点',
  [NODE_TYPE.BACKUP]: '备用节点',
  [NODE_TYPE.MONITOR]: '监控节点',
  [NODE_TYPE.PROXY]: '代理节点',
  [NODE_TYPE.SPECIAL]: '特殊节点'
} as const

// 节点类型枚举 (扩展字段, 保留兼容性)
export type NodeType = 'Gateway' | 'Server' | 'Client' | 'Router'

// VPN类型枚举
export type VpnType = 'gnb' | 'wireguard' | 'openvpn'

// 基础节点接口 (基于OpenAPI)
export interface Node {
  // 基础信息 (来自OpenAPI)
  id: string | number                 // 节点ID
  node_id: string | number            // 节点业务ID (如: N20240101123456)
  node_name: string                   // 节点名称
  description?: string                // 节点描述 (API中可能叫node_remarks)
  node_remarks?: string               // 节点备注 (API字段名)
  status?: NodeStatus | number        // 节点状态 (支持字符串和数字状态码)
  node_status?: string | number       // 节点状态 (API字段名，支持字符串和数字)
  vpn_type?: VpnType                  // VPN类型
  created_at: string                  // 创建时间
  updated_at: string                  // 更新时间
  deleted_at?: string                 // 删除时间
  
  // API中的额外字段
  user_id?: string | number           // 用户ID
  zone_id?: string | number           // 所属Zone ID
  ip_group_sequence_number?: string   // IP组序号
  node_ip?: string                    // 节点IP
  node_app_version?: string           // 节点应用版本
  node_port?: number                  // 节点端口
  node_type?: NodeType | string       // 节点类型
  endpoint?: string                   // 端点
  last_seen?: string                  // 最后在线时间
  node_config?: any                   // 节点配置
  node_traffic?: any                  // 节点流量
  
  // 扩展字段 (前端补充，可能来自其他API)
  ip_address?: string                 // 内网IP
  public_ip?: string                  // 公网IP
  port?: number                       // 端口
  
  // 统计信息 (可选)
  stats?: {
    bytes_sent?: number               // 发送字节数
    bytes_received?: number           // 接收字节数
    connections_count?: number        // 连接数
    uptime?: number                   // 运行时间(秒)
    last_seen?: string               // 最后在线时间
  }
}

// 创建节点请求接口 (基于OpenAPI)
export interface CreateNodeRequest {
  node_name: string                   // 节点名称 (必填, 3-255字符)
  vpn_type: VpnType                   // VPN类型 (必填: gnb、wireguard、openvpn)
  description?: string                // 节点描述 (可选, 最大1000字符)
  ip_pool_id?: string                 // IP池ID (可选)
  ip_group_sequence_number?: string   // IP组序号 (可选)
}

// 更新节点请求接口 (基于OpenAPI)
export interface UpdateNodeRequest {
  node_name?: string                  // 节点名称
  description?: string                // 节点描述
  vpn_type?: VpnType                  // VPN类型
  node_port?: number                  // 节点端口
  node_app_version?: string           // 节点应用版本
  node_type?: number | NodeType | NodeType[]   // 节点类型 (支持位运算数字、单个或多个)
  node_status?: NodeStatus            // 节点状态
}

// 节点状态更新请求接口 (基于OpenAPI)
export interface UpdateNodeStatusRequest {
  status: NodeStatus                  // 新的节点状态
}

// 节点列表查询参数 (基于OpenAPI)
export interface NodesListParams {
  page?: number                       // 页码
  per_page?: number                   // 每页数量
  status?: NodeStatus                 // 状态过滤
  search?: string                     // 搜索关键词
}

// 节点详情扩展信息 (前端使用)
export interface NodeDetail extends Node {
  // 可能包含更多详细信息
  config?: {
    vpn_type?: string                // VPN类型
    vpn_version?: string             // VPN版本
    interface_name?: string          // 网络接口名称
    listen_address?: string          // 监听地址
    mtu?: number                     // MTU值
  }
  
  // 网络配置信息
  network_config?: NodeNetworkConfig
}

// 节点网络配置接口
export interface NodeNetworkConfig {
  ifname?: string                     // 网络接口名称 (<15字节，字母开头)
  node_ip?: string                    // 节点虚拟IP (从IP池选择)
  ip_group_sequence_number?: number   // IP组序号
  index_servers?: string[]            // 索引服务器列表 (IP:port格式)
  lan_ips?: string[]                  // 局域网IP列表 (仅IPv4，不带端口)
  public_ips?: string[]               // 公网IP列表 (支持IPv4和IPv6)
}

// 更新节点网络配置请求
export interface UpdateNodeNetworkConfigRequest {
  ifname?: string                     // 网络接口名称
  node_ip?: string                    // 节点虚拟IP
  ip_group_sequence_number?: number   // IP组序号
  index_servers?: string[]            // 索引服务器列表 (IP:端口)
  lan_ips?: string[]                  // 局域网IP列表 (仅IPv4，不带端口)
  public_ips?: string[]               // 公网IP列表 (支持IPv4和IPv6)
}

// 可用IP信息 (基于新的API格式)
export interface AvailableIP {
  addr: string                        // IP地址
  long: number                        // IP的长整数表示
  idx: number                         // IP在池中的索引
  consumed: boolean                   // 是否已被消费
  // 兼容性字段 (用于组件)
  ip_address?: string                 // 兼容旧字段名
  index?: number                      // 兼容旧字段名
  ip_group_sequence_number?: number   // 从父级IPPool获取
}

// IP池信息 (基于新的API格式)
export interface IPPool {
  seq: number                         // 序号
  id: number                          // 池ID
  ippool_id: number                   // IP池业务ID
  name: string                        // 池名称
  capacity: number                    // 总容量
  consumed: number                    // 已消费数量
  available: number                   // 可用数量
  ips: AvailableIP[]                  // IP列表
}

// 统计信息
export interface IPStatistics {
  total_pools: number                 // 总池数
  total_capacity: number              // 总容量
  total_consumed: number              // 总消费数
  total_available: number             // 总可用数
}

// 优化信息
export interface IPOptimization {
  reduced_fields: string              // 字段减少信息
  eliminated_duplication: string      // 重复数据消除信息
  bandwidth_saved: string             // 带宽节省信息
}

// IP池中的可用IP列表响应 (基于新的API格式)
export interface AvailableIPsResponse {
  pools: IPPool[]                     // IP池列表
  statistics: IPStatistics            // 统计信息
  include_consumed: boolean           // 是否包含已消费的IP
  optimization: IPOptimization        // 优化信息
  
  // 兼容性字段 (用于旧组件)
  ips?: AvailableIP[]                 // 所有可用IP的扁平列表
  groups?: IPGroup[]                  // 按组分类的IP列表 (兼容)
  total_available?: number            // 总可用数量
}

// 兼容性类型 - IP池组信息 (保持向后兼容)
export interface IPGroup {
  group_id: number                    // 组ID
  pool_name: string                   // 池名称
  pool_type?: string                  // 池类型
  available_ips: AvailableIP[]        // 可用IP列表
}

// 节点卡片显示信息 (前端组件使用)
export interface NodeCardInfo {
  id: string
  node_name: string
  node_type?: NodeType
  status: NodeStatus
  ip_address?: string
  port?: number
  public_ip?: string
  stats?: {
    connections_count?: number
    uptime?: number
  }
  last_seen?: string
}

// 节点索引服务相关类型定义
export interface NodeIndexServiceConnectionInfo {
  endpoint: string
  protocol: string
  max_connections: number
  current_connections: number
}

export interface NodeIndexServiceOwnerInfo {
  owner_id: number
  owner_name: string
}

export interface NodeIndexServiceConfig {
  added_via: string
  endpoint: string
}

export interface NodeIndexService {
  node_service_id: number
  service_id: number
  service_service_id: number
  service_name: string
  service_address: string
  service_port: number
  service_protocol: string
  service_description: string
  service_priority: number
  endpoint: string
  is_default: boolean
  is_active: boolean
  priority: number
  service_config: NodeIndexServiceConfig
  remarks: string
  added_via: string
  is_public: boolean
  connection_info: NodeIndexServiceConnectionInfo
  owner_info: NodeIndexServiceOwnerInfo
  created_at: string
  updated_at: string
}

export interface NodeIndexServiceMeta {
  node_zone: number
  user_id: number
  retrieved_at: string
}

export interface NodeIndexServicesData {
  node_id: number
  node_name: string
  zone_id: number
  total_services: number
  active_services: number
  default_services: number
  index_services: NodeIndexService[]
  meta: NodeIndexServiceMeta
}

export interface NodeIndexServicesResponse {
  success: boolean
  code: number
  message: string
  data: NodeIndexServicesData
  timestamp: string
}

// 节点设备信息接口 (对应 /api/v1/nodes/{id}/deviceinfo)
export interface NodeDeviceInfo {
  // CPU信息
  cpu_model?: string                  // CPU型号
  cpu_arch?: string                   // CPU架构
  cpu_cores?: number                  // CPU核心数
  cpu_threads?: number                // CPU线程数
  virtualization?: string             // 虚拟化技术
  
  // 内存信息
  memory_total_mb?: number            // 总内存(MB)
  memory_free_mb?: number             // 可用内存(MB)
  
  // 操作系统信息
  os_name?: string                    // 操作系统名称
  os_version?: string                 // 操作系统版本
  kernel_version?: string             // 内核版本
  system_arch?: string                // 系统架构
  
  // C库信息
  libc_type?: string                  // C库类型
  libc_version?: string               // C库版本
  
  // 容器信息
  container_type?: string             // 容器类型
  
  // 网络信息
  nic_count?: number                  // 网卡数量
  local_ips?: string[] | string       // 本地IP地址 (JSON数组或字符串)
  public_ip?: string                  // 公网IP
  
  // 防火墙信息
  firewall_type?: string              // 防火墙类型
  firewall_version?: string           // 防火墙版本
  firewall_enabled?: number           // 防火墙是否启用 (0/1)
  ip_forwarding?: number              // IP转发是否启用 (0/1)
  
  // 采集时间
  collected_at?: string               // 信息采集时间
}

// 节点设备信息响应接口
export interface NodeDeviceInfoResponse {
  success: boolean
  data: {
    exists: boolean                   // 设备信息是否存在
    node_id: number                   // 节点ID
    device_info: NodeDeviceInfo       // 设备信息
  }
  message: string
}

// 批量节点设备信息单项
export interface BatchDeviceInfoItem {
  node_id: number | string            // 节点ID
  exists: boolean                     // 设备信息是否存在
  device_info: NodeDeviceInfo | null  // 设备信息 (不存在时为null)
}

// 批量节点设备信息响应接口
export interface BatchNodeDeviceInfoResponse {
  success: boolean
  message: string
  data: {
    total: number                     // 总数
    devices: BatchDeviceInfoItem[]    // 设备信息列表
  }
}

// 节点操作结果
export interface NodeOperationResult {
  success: boolean
  message: string
  node?: Node
}

// 一键快速创建节点请求接口
export interface QuickCreateNodeRequest {
  node_name: string                   // 节点名称 (必填, 3-255字符)
}

// 一键快速创建节点响应接口
export interface QuickCreateNodeResponse {
  code: number
  message: string
  data: {
    node: {
      node_id: number                 // 16位安全整数
      node_name: string
      vpn_type: 'gnb'
      node_ip: string | null
      node_type: number               // 1 = 边缘节点
      created_at: string              // ISO 8601
    }
    config: {
      nodeid: number
      ifname: string                  // 'gnb_tun'
      listen: number                  // 9016
      mtu: number                     // 1450
      multi_socket: 'on' | 'off'
    }
    next_steps: {
      [key: string]: string           // 操作提示文本
    }
  }
}

// 节点状态信息接口 (对应 /api/v1/nodes/{id}/status-info)
export interface NodeStatusInfo {
  node_id: number
  current_status: {
    code: number
    name: string
    description: string
  }
  configuration_status: any
  can_enable: boolean
  available_transitions: string[]
  status_definitions: Record<number, string>
  next_steps: string[]
}
