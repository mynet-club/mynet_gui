/**
 * 节点管理相关类型定义
 * 基于OpenAPI文档 v1.0.0
 */

// 节点状态枚举
export type NodeStatus = 'active' | 'inactive' | 'pending'

// 节点类型枚举 (扩展字段)
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
  status?: NodeStatus                 // 节点状态 (API中可能叫node_status)
  node_status?: string                // 节点状态 (API字段名)
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

// 可用IP信息
export interface AvailableIP {
  ip_address: string                  // IP地址 (注意：API返回的字段名是ip_address)
  index: number                       // IP在池中的索引
  ip_group_sequence_number: number    // IP组序号
  group_id?: number                   // 所属组ID (废弃，使用ip_group_sequence_number)
  pool_name?: string                  // IP池名称
}

// IP池组信息
export interface IPGroup {
  group_id: number                    // 组ID
  pool_name: string                   // 池名称
  pool_type: string                   // 池类型
  available_ips: AvailableIP[]        // 可用IP列表
}

// IP池中的可用IP列表响应
export interface AvailableIPsResponse {
  ips: AvailableIP[]                  // 所有可用IP的扁平列表
  groups: IPGroup[]                   // 按组分类的IP列表
  total_available: number             // 总可用数量
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

// 节点操作结果
export interface NodeOperationResult {
  success: boolean
  message: string
  node?: Node
}
