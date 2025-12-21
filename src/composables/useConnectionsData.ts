/**
 * 连接数据处理 Composable
 * 统一处理 connections 和 nodes_metadata 的合并逻辑
 * 供卡片、列表、拓扑等多个视图复用
 */

import debug from '../utils/debug'

/**
 * 连接数据接口
 */
export interface ConnectionData {
  // 基础信息
  id: any
  node_id: number
  peer_id: number
  
  // 连接状态（来自 connection）
  online: boolean
  conn_type: string
  latency: number
  rx_bytes: number
  tx_bytes: number
  seen_at: string | null
  snapshot_at: string
  wanip: string | null
  
  // 节点状态（来自 nodes_metadata）
  peer_node_status: number  // -1=未完成配置, 0=已禁用, 1=启用但离线, 2=在线
  node_status: number       // 同上（兼容字段）
  
  // 节点信息（来自 nodes_metadata）
  node_name: string
  peer_node_name: string
  node_ip: string
  user_name: string
  user_email: string
  ip_addresses: Array<{
    ip_address: string
    route_type: string
  }>
  
  // 兼容字段
  target_node_id: number
  target_node_name: string
  connection_type: string
  bytes_received: number
  bytes_sent: number
  last_seen: string | null
}

/**
 * 节点元数据接口
 */
export interface NodeMetadata {
  node_id: number
  node_name: string
  zone_id: number
  node_status: number
  node_ip: string
  user_id: number
  user_name: string
  user_email: string
  ip_addresses: Array<{
    ip_address: string
    route_type: string
  }>
  source: string
}

/**
 * 处理连接数据
 * @param connections - API 返回的连接数据
 * @param nodesMetadata - API 返回的节点元数据
 * @returns 处理后的连接数据数组
 */
export function processConnectionsData(
  connections: any[],
  nodesMetadata: Record<string, NodeMetadata>
): ConnectionData[] {
  if (!connections || connections.length === 0) {
    return []
  }

  return connections.map((conn: any) => {
    const peerId = String(conn.peer_id)
    const peerMetadata: NodeMetadata | undefined = nodesMetadata[peerId]
    
    // 构建处理后的数据
    const processedData: ConnectionData = {
      // ==================== 基础信息 ====================
      id: conn.id,
      node_id: conn.node_id,
      peer_id: conn.peer_id,
      target_node_id: conn.peer_id, // 兼容字段
      
      // ==================== 连接状态（直接来自 API） ====================
      online: conn.online,                    // 连接是否在线
      conn_type: conn.conn_type,              // 连接类型: direct_ipv4, direct_ipv6, relay, derp, offline
      connection_type: conn.conn_type,        // 兼容字段
      latency: conn.latency || 0,             // 延迟（毫秒）
      rx_bytes: conn.rx_bytes || 0,           // 接收字节数
      tx_bytes: conn.tx_bytes || 0,           // 发送字节数
      bytes_received: conn.rx_bytes || 0,     // 兼容字段
      bytes_sent: conn.tx_bytes || 0,         // 兼容字段
      seen_at: conn.seen_at,                  // 最后通信时间
      last_seen: conn.seen_at,                // 兼容字段
      snapshot_at: conn.snapshot_at,          // 快照时间
      wanip: conn.wanip,                      // 公网IP
      
      // ==================== 节点状态（来自 metadata） ====================
      // 重要：节点状态从 metadata 获取，不是从 connection
      peer_node_status: peerMetadata?.node_status !== undefined ? peerMetadata.node_status : -1,
      node_status: peerMetadata?.node_status !== undefined ? peerMetadata.node_status : -1,
      
      // ==================== 节点信息（来自 metadata） ====================
      node_name: peerMetadata?.node_name || `Node ${conn.peer_id}`,
      peer_node_name: peerMetadata?.node_name || `Node ${conn.peer_id}`,
      target_node_name: peerMetadata?.node_name || `Node ${conn.peer_id}`,
      node_ip: peerMetadata?.node_ip || '',
      user_name: peerMetadata?.user_name || '未知用户',
      user_email: peerMetadata?.user_email || '',
      ip_addresses: peerMetadata?.ip_addresses || []
    }
    
    return processedData
  })
}

/**
 * 按用户分组连接数据
 * @param connections - 处理后的连接数据
 * @returns 按用户分组的连接数据
 */
export function groupConnectionsByUser(connections: ConnectionData[]): ConnectionData[] {
  // 这里可以添加按用户分组的逻辑
  // 目前直接返回原数组
  return connections
}

/**
 * 获取连接状态文本
 * @param online - 是否在线
 * @returns 状态文本
 */
export function getConnectionStatusText(online: boolean): string {
  return online ? '在线' : '离线'
}

/**
 * 获取连接类型文本
 * @param connType - 连接类型
 * @returns 类型文本
 */
export function getConnectionTypeText(connType: string): string {
  const typeMap: Record<string, string> = {
    'direct_ipv4': '直连 IPv4',
    'direct_ipv6': '直连 IPv6',
    'relay': '中继',
    'derp': 'DERP 中继',
    'offline': '离线',
    'none': '无连接'
  }
  return typeMap[connType] || connType
}

/**
 * 获取节点状态文本
 * @param nodeStatus - 节点状态码
 * @returns 状态文本
 */
export function getNodeStatusText(nodeStatus: number): string {
  const statusMap: Record<number, string> = {
    2: '在线',
    1: '启用但离线',
    0: '已禁用',
    '-1': '未完成配置'
  }
  return statusMap[nodeStatus] || '未知状态'
}

/**
 * 获取节点状态颜色
 * @param nodeStatus - 节点状态码
 * @returns Quasar 颜色名称
 */
export function getNodeStatusColor(nodeStatus: number): string {
  const colorMap: Record<number, string> = {
    2: 'positive',   // 在线 - 绿色
    1: 'warning',    // 启用但离线 - 橙色
    0: 'grey',       // 已禁用 - 灰色
    '-1': 'warning'  // 未完成配置 - 黄色
  }
  return colorMap[nodeStatus] || 'grey'
}

/**
 * 获取虚拟IP
 * @param connection - 连接数据
 * @returns 虚拟IP地址
 */
export function getVirtualIp(connection: ConnectionData): string {
  if (connection.ip_addresses && connection.ip_addresses.length > 0) {
    const nodeIp = connection.ip_addresses.find(ip => ip.route_type === 'node_ip')
    if (nodeIp) return nodeIp.ip_address
    const firstIp = connection.ip_addresses[0]
    return firstIp?.ip_address || ''
  }
  return connection.node_ip || ''
}

/**
 * 获取局域网IP列表
 * @param connection - 连接数据
 * @returns 局域网IP数组
 */
export function getLanIps(connection: ConnectionData): string[] {
  if (!connection.ip_addresses) return []
  return connection.ip_addresses
    .filter(ip => ip.route_type === 'lan_ip')
    .map(ip => ip.ip_address)
}

/**
 * useConnectionsData composable
 */
export function useConnectionsData() {
  return {
    processConnectionsData,
    groupConnectionsByUser,
    getConnectionStatusText,
    getConnectionTypeText,
    getNodeStatusText,
    getNodeStatusColor,
    getVirtualIp,
    getLanIps
  }
}
