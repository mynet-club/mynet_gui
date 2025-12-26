/**
 * NodeSummary 数据提炼层
 * 
 * 职责：将 API 原始数据（connections + nodes_metadata）提炼为统一的 NodeSummary 模型
 * 供所有视图（Card/List/Topology）复用
 */

import type { NodeSummary, IpAddress, NodeStatus, LinkStatus } from '../types/nodeSummary'
import type { ConnectionData, NodeMetadata } from './useConnectionsData'

/**
 * 从 API 原始数据提炼 NodeSummary
 * 
 * @param connection - API 返回的连接数据
 * @param metadata - API 返回的节点元数据
 * @returns NodeSummary 统一模型
 */
export function extractNodeSummary(
  connection: any,
  metadata: NodeMetadata | undefined
): NodeSummary {
  // ==================== 1️⃣ 身份信息提炼 ====================
  const peer_id = connection.peer_id
  const node_name = metadata?.node_name || `Node ${peer_id}`
  const user_name = metadata?.user_name || ''
  const user_email = metadata?.user_email
  const os = metadata?.os
  const arch = metadata?.arch
  
  // ==================== 2️⃣ 状态信息提炼 ====================
  // 节点状态 - 从 metadata 读取（不是从 connection！）
  const node_status: NodeStatus = metadata?.node_status !== undefined 
    ? metadata.node_status 
    : -1 as NodeStatus
  
  // 链路状态 - 从 connection.online 直接读取（不要重新计算！）
  const link_status: LinkStatus = connection.online 
    ? 1 as LinkStatus  // LinkStatus.ONLINE
    : 0 as LinkStatus  // LinkStatus.OFFLINE
  
  const last_seen_at = connection.seen_at || undefined
  
  // ==================== 3️⃣ 网络信息提炼 ====================
  // 虚拟IP - 优先级: node_ip > ip_addresses中的node_ip > 空字符串
  const virtual_ip = extractVirtualIp(metadata)
  
  // 公网IP - 从 connection 读取
  const wan_ip = connection.wanip || undefined
  
  // 局域网IP列表 - 从 ip_addresses 提取
  const lan_ips = extractLanIps(metadata)
  
  // IP地址完整列表
  const ip_addresses: IpAddress[] = metadata?.ip_addresses || []
  
  // 连接性能信息（仅链路在线时有效）
  const latency = link_status === 1 ? (connection.latency || undefined) : undefined
  const conn_type = link_status === 1 ? connection.conn_type : undefined
  const rx_bytes = link_status === 1 ? (connection.rx_bytes || undefined) : undefined
  const tx_bytes = link_status === 1 ? (connection.tx_bytes || undefined) : undefined
  
  // ==================== 构建 NodeSummary ====================
  return {
    // 身份
    peer_id,
    node_name,
    user_name,
    user_email,
    os,
    arch,
    
    // 状态（两个独立维度）
    node_status,
    link_status,
    last_seen_at,
    
    // 网络
    virtual_ip,
    wan_ip,
    lan_ips,
    latency,
    conn_type,
    rx_bytes,
    tx_bytes,
    
    // 原始数据引用
    ip_addresses,
    connection_id: connection.id,
    node_id: connection.node_id
  }
}

/**
 * 批量提炼 NodeSummary
 * 
 * @param connections - API 返回的连接列表
 * @param nodesMetadata - API 返回的节点元数据映射
 * @returns NodeSummary 数组
 */
export function extractNodeSummaries(
  connections: any[],
  nodesMetadata: Record<string, NodeMetadata>
): NodeSummary[] {
  if (!connections || connections.length === 0) {
    return []
  }
  
  return connections.map(conn => {
    const peerId = String(conn.peer_id)
    const metadata = nodesMetadata[peerId]
    return extractNodeSummary(conn, metadata)
  })
}

/**
 * 提取虚拟IP
 * 优先级：
 * 1. metadata.node_ip
 * 2. ip_addresses 中 route_type='node_ip' 的记录
 * 3. 空字符串
 */
function extractVirtualIp(metadata: NodeMetadata | undefined): string {
  if (!metadata) return ''
  
  // 优先使用 node_ip 字段
  if (metadata.node_ip) {
    return metadata.node_ip
  }
  
  // 兜底：从 ip_addresses 中查找
  if (metadata.ip_addresses && metadata.ip_addresses.length > 0) {
    const nodeIp = metadata.ip_addresses.find(ip => ip.route_type === 'node_ip')
    if (nodeIp) return nodeIp.ip_address
  }
  
  return ''
}

/**
 * 提取局域网IP列表
 */
function extractLanIps(metadata: NodeMetadata | undefined): string[] {
  if (!metadata?.ip_addresses) return []
  
  return metadata.ip_addresses
    .filter(ip => ip.route_type === 'lan_ip')
    .map(ip => ip.ip_address)
}

/**
 * useNodeSummary Composable
 */
export function useNodeSummary() {
  return {
    extractNodeSummary,
    extractNodeSummaries
  }
}
