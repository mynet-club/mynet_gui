/**
 * NodeSummary 展示工具库
 * 
 * 提供统一的状态文本、颜色、图标映射
 * 确保三个视图（Card/List/Topology）的展示一致性
 */

import type { NodeSummary, NodeStatus, LinkStatus } from '../types/nodeSummary'

// ==================== 节点状态展示 ====================

/**
 * 获取节点状态文本
 */
export function getNodeStatusText(status: NodeStatus): string {
  const textMap: Record<NodeStatus, string> = {
    [-1]: '配置不完整',
    [0]: '已禁用',
    [1]: '启用',
    [2]: '在线'
  }
  return textMap[status] || '未知状态'
}

/**
 * 获取节点状态颜色（Quasar color）
 */
export function getNodeStatusColor(status: NodeStatus): string {
  const colorMap: Record<NodeStatus, string> = {
    [-1]: 'negative',   // 配置不完整 - 红色
    [0]: 'grey',        // 已禁用 - 灰色
    [1]: 'orange',      // 启用但未上线 - 橙色
    [2]: 'positive'     // 在线 - 绿色
  }
  return colorMap[status] || 'grey'
}

/**
 * 获取节点状态图标
 */
export function getNodeStatusIcon(status: NodeStatus): string {
  const iconMap: Record<NodeStatus, string> = {
    [-1]: 'warning',
    [0]: 'block',
    [1]: 'check_circle_outline',
    [2]: 'check_circle'
  }
  return iconMap[status] || 'help'
}

// ==================== 链路状态展示 ====================

/**
 * 获取链路状态文本
 */
export function getLinkStatusText(status: LinkStatus): string {
  return status === 1 ? '链路在线' : '链路离线'
}

/**
 * 获取链路状态颜色（Quasar color）
 */
export function getLinkStatusColor(status: LinkStatus): string {
  return status === 1 ? 'positive' : 'grey-6'
}

/**
 * 获取链路状态图标（使用 wifi 图标）
 */
export function getLinkStatusIcon(status: LinkStatus): string {
  return status === 1 ? 'wifi' : 'wifi_off'
}

/**
 * 是否使用 outline 样式（离线时用 outline）
 */
export function getLinkStatusOutline(status: LinkStatus): boolean {
  return status === 0
}

// ==================== 连接类型展示 ====================

/**
 * 获取连接类型文本
 */
export function getConnTypeText(connType?: string): string {
  if (!connType) return '未连接'
  
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
 * 获取连接类型颜色
 */
export function getConnTypeColor(connType?: string): string {
  if (!connType) return 'grey'
  
  const colorMap: Record<string, string> = {
    'direct_ipv4': 'positive',
    'direct_ipv6': 'positive',
    'relay': 'orange',
    'derp': 'info',
    'offline': 'grey'
  }
  return colorMap[connType] || 'grey'
}

// ==================== IP 地址展示 ====================

/**
 * 获取虚拟IP展示文本（带图标提示）
 */
export function getVirtualIpDisplay(summary: NodeSummary): {
  icon: string
  color: string
  text: string
} {
  return {
    icon: 'vpn_key',
    color: 'primary',
    text: summary.virtual_ip || ''
  }
}

/**
 * 获取公网IP展示文本（带图标提示）
 */
export function getWanIpDisplay(summary: NodeSummary): {
  icon: string
  color: string
  text: string
} | null {
  if (!summary.wan_ip) return null
  
  return {
    icon: 'public',
    color: 'secondary',
    text: summary.wan_ip
  }
}

// ==================== 延迟展示 ====================

/**
 * 获取延迟图标（根据延迟值）
 */
export function getLatencyIcon(latency?: number): string {
  if (!latency) return 'signal_wifi_off'
  if (latency < 50) return 'signal_wifi_4_bar'
  if (latency < 100) return 'signal_wifi_3_bar'
  if (latency < 200) return 'signal_wifi_2_bar'
  return 'signal_wifi_1_bar'
}

/**
 * 获取延迟颜色
 */
export function getLatencyColor(latency?: number): string {
  if (!latency) return 'grey'
  if (latency < 50) return 'positive'
  if (latency < 100) return 'info'
  if (latency < 200) return 'orange'
  return 'negative'
}

/**
 * 获取延迟文本
 */
export function getLatencyText(latency?: number): string {
  if (!latency) return 'N/A'
  return `${latency.toFixed(1)} ms`
}

// ==================== 流量展示 ====================

/**
 * 格式化字节数
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 获取流量展示文本
 */
export function getTrafficText(summary: NodeSummary): string {
  if (!summary.rx_bytes && !summary.tx_bytes) return '—'
  
  const rx = formatBytes(summary.rx_bytes)
  const tx = formatBytes(summary.tx_bytes)
  
  return `⬇ ${rx} ⬆ ${tx}`
}

// ==================== 时间展示 ====================

/**
 * 获取最后可见时间文本
 */
export function getLastSeenText(summary: NodeSummary): string {
  return summary.link_status === 1 ? '最后通信' : '最后上线'
}

// ==================== 复合展示信息 ====================

/**
 * 获取节点完整展示信息（供 Card 视图使用）
 */
export function getNodeCardDisplay(summary: NodeSummary) {
  return {
    // 身份
    name: summary.node_name,
    userName: summary.user_name,
    
    // 状态
    nodeStatus: {
      text: getNodeStatusText(summary.node_status),
      color: getNodeStatusColor(summary.node_status),
      icon: getNodeStatusIcon(summary.node_status)
    },
    linkStatus: {
      text: getLinkStatusText(summary.link_status),
      color: getLinkStatusColor(summary.link_status),
      icon: getLinkStatusIcon(summary.link_status),
      iconColor: summary.link_status === 1 ? 'positive' : 'grey-6',
      outline: getLinkStatusOutline(summary.link_status)
    },
    
    // 网络
    virtualIp: getVirtualIpDisplay(summary),
    wanIp: getWanIpDisplay(summary),
    lanIps: summary.lan_ips,
    
    // 连接详情（仅链路在线时）
    connection: summary.link_status === 1 ? {
      latency: {
        text: getLatencyText(summary.latency),
        icon: getLatencyIcon(summary.latency),
        color: getLatencyColor(summary.latency)
      },
      connType: {
        text: getConnTypeText(summary.conn_type),
        color: getConnTypeColor(summary.conn_type)
      }
    } : null
  }
}

/**
 * 获取节点列表行展示信息（供 List 视图使用）
 */
export function getNodeListDisplay(summary: NodeSummary) {
  return {
    name: summary.node_name,
    userNameTooltip: summary.user_name,
    virtualIp: getVirtualIpDisplay(summary),
    wanIp: summary.wan_ip || '—',
    nodeStatus: {
      text: getNodeStatusText(summary.node_status),
      color: getNodeStatusColor(summary.node_status)
    },
    linkStatus: {
      text: getLinkStatusText(summary.link_status),
      color: getLinkStatusColor(summary.link_status),
      icon: getLinkStatusIcon(summary.link_status),
      iconColor: summary.link_status === 1 ? 'positive' : 'grey-6',
      outline: getLinkStatusOutline(summary.link_status)
    },
    latency: getLatencyText(summary.latency),
    traffic: getTrafficText(summary)
  }
}

/**
 * 获取节点拓扑 Tooltip 展示信息（供 Topology 视图使用）
 */
export function getNodeTopologyDisplay(summary: NodeSummary) {
  return {
    // 标题
    title: summary.node_name,
    
    // 状态区
    status: {
      node: {
        label: '节点状态',
        text: getNodeStatusText(summary.node_status),
        color: getNodeStatusColor(summary.node_status)
      },
      link: {
        label: '链路状态',
        text: getLinkStatusText(summary.link_status),
        color: getLinkStatusColor(summary.link_status),
        icon: getLinkStatusIcon(summary.link_status),
        iconColor: summary.link_status === 1 ? 'positive' : 'grey-6',
        outline: getLinkStatusOutline(summary.link_status)
      }
    },
    
    // 网络区
    network: {
      virtualIp: {
        label: '虚拟 IP',
        value: summary.virtual_ip || '—',
        icon: 'vpn_key'
      },
      wanIp: summary.wan_ip ? {
        label: '公网 IP',
        value: summary.wan_ip,
        icon: 'public'
      } : null
    },
    
    // 次要信息（仅链路在线时）
    details: summary.link_status === 1 ? {
      latency: summary.latency ? {
        label: '延迟',
        value: getLatencyText(summary.latency)
      } : null,
      traffic: (summary.rx_bytes || summary.tx_bytes) ? {
        label: '流量',
        value: getTrafficText(summary)
      } : null
    } : null,
    
    // 时间信息
    time: summary.last_seen_at ? {
      label: getLastSeenText(summary),
      value: summary.last_seen_at
    } : null
  }
}
