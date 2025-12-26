/**
 * NodeSummary 认知模型 - 类型定义
 * 
 * 这是用户在不进入详情页时，对一个节点的"最小充分认知集合"
 * 所有视图（Card/List/Topology）都基于这个统一模型展示信息
 */

/**
 * NodeSummary - 节点摘要信息
 * 
 * 三层信息结构：
 * 1. 身份 (Identity) - 这是谁的节点
 * 2. 状态 (State) - 节点可用性 + 链路连通性（两个独立维度）
 * 3. 网络 (Network) - IP地址、延迟、流量等
 */
export interface NodeSummary {
  // ==================== 1️⃣ 身份信息 (Identity) ====================
  /** 节点ID */
  peer_id: number
  
  /** 节点名称 - 主视觉标识 */
  node_name: string
  
  /** 所属用户名称 */
  user_name: string
  
  /** 所属用户邮箱 */
  user_email?: string
  
  /** 操作系统 */
  os?: string
  
  /** 平台架构 */
  arch?: string
  
  // ==================== 2️⃣ 状态信息 (State) - 两个独立维度 ====================
  /**
   * 节点状态 - 节点自身的配置/启用状态
   * 来源: nodes_metadata.node_status
   * 值域:
   *  -1 = 配置不完整
   *   0 = 已禁用
   *   1 = 已启用但未上线
   *   2 = 在线
   */
  node_status: NodeStatus
  
  /**
   * 链路状态 - 当前网络连接是否活跃
   * 来源: connections.online
   * 重要: 不要重新计算！直接使用 API 返回值
   */
  link_status: LinkStatus
  
  /**
   * 最后可见时间
   * - link_status=online 时: 最后通信时间
   * - link_status=offline 时: 最后上线时间
   */
  last_seen_at?: string
  
  // ==================== 3️⃣ 网络信息 (Network) ====================
  /**
   * 虚拟IP (Virtual IP) - 隧道内部IP
   * 来源优先级:
   * 1. nodes_metadata.node_ip
   * 2. ip_addresses 中 route_type='node_ip' 的记录
   */
  virtual_ip: string
  
  /**
   * 公网IP (WAN IP) - 对外可见的公网地址
   * 来源: connections.wanip
   */
  wan_ip?: string
  
  /**
   * 局域网IP列表 (LAN IPs) - 次要信息
   * 来源: ip_addresses 中 route_type='lan_ip' 的记录
   */
  lan_ips: string[]
  
  /**
   * 连接延迟 (毫秒) - 仅 link_status=online 时有效
   * 来源: connections.latency
   */
  latency?: number
  
  /**
   * 连接类型 - 仅 link_status=online 时有效
   * 来源: connections.conn_type
   * 值域: 'direct_ipv4' | 'direct_ipv6' | 'relay' | 'derp' | 'offline'
   */
  conn_type?: string
  
  /**
   * 接收流量 (字节) - 仅 link_status=online 时有效
   */
  rx_bytes?: number
  
  /**
   * 发送流量 (字节) - 仅 link_status=online 时有效
   */
  tx_bytes?: number
  
  // ==================== 原始数据引用（供详情页使用） ====================
  /** 完整的 IP 地址列表 */
  ip_addresses: IpAddress[]
  
  /** 原始连接ID（用于导航） */
  connection_id?: any
  
  /** 节点ID（用于导航） */
  node_id: number
}

/**
 * 节点状态枚举
 */
export enum NodeStatus {
  /** 配置不完整 */
  INCOMPLETE = -1,
  /** 已禁用 */
  DISABLED = 0,
  /** 已启用但未上线 */
  ENABLED_OFFLINE = 1,
  /** 在线 */
  ONLINE = 2
}

/**
 * 链路状态枚举
 */
export enum LinkStatus {
  /** 链路离线 */
  OFFLINE = 0,
  /** 链路在线 */
  ONLINE = 1
}

/**
 * IP地址记录
 */
export interface IpAddress {
  /** IP地址 */
  ip_address: string
  /** 路由类型: 'node_ip' | 'lan_ip' | 'wan_ip' */
  route_type: string
}

/**
 * NodeSummary 展示配置
 * 用于控制不同视图中哪些字段应该显示
 */
export interface NodeSummaryDisplayConfig {
  /** 是否显示用户名 */
  showUserName?: boolean
  /** 是否显示局域网IP */
  showLanIps?: boolean
  /** 是否显示流量信息 */
  showTraffic?: boolean
  /** 是否显示连接类型 */
  showConnType?: boolean
  /** 是否显示延迟 */
  showLatency?: boolean
}

/**
 * NodeSummary 视图变体
 * 针对不同视图的预设配置
 */
export const NodeSummaryDisplayPresets: Record<string, NodeSummaryDisplayConfig> = {
  // Card 视图：紧凑展示，次要信息折叠
  card: {
    showUserName: true,
    showLanIps: true,  // 可展开
    showTraffic: false,
    showConnType: true,
    showLatency: true
  },
  
  // List 视图：单行核心信息
  list: {
    showUserName: true,  // Tooltip
    showLanIps: false,
    showTraffic: true,
    showConnType: false,
    showLatency: true
  },
  
  // Topology 视图：Hover 完整信息
  topology: {
    showUserName: false,
    showLanIps: false,
    showTraffic: true,
    showConnType: true,
    showLatency: true
  }
}
