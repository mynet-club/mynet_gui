/**
 * NodeSummary 统一认知模型 - 入口文件
 * 
 * 集中导出所有 NodeSummary 相关的类型、工具和 Composable
 * 确保三个视图（Card/List/Topology）使用统一的数据模型和展示逻辑
 */

// ==================== 类型定义 ====================
export type {
  NodeSummary,
  NodeStatus,
  LinkStatus,
  IpAddress,
  NodeSummaryDisplayConfig
} from '../types/nodeSummary'

export {
  NodeStatus,
  LinkStatus,
  NodeSummaryDisplayPresets
} from '../types/nodeSummary'

// ==================== 数据提炼层 ====================
export {
  extractNodeSummary,
  extractNodeSummaries,
  useNodeSummary
} from '../composables/useNodeSummary'

// ==================== 展示工具层 ====================
export {
  // 节点状态
  getNodeStatusText,
  getNodeStatusColor,
  getNodeStatusIcon,
  
  // 链路状态
  getLinkStatusText,
  getLinkStatusColor,
  getLinkStatusIcon,
  getLinkStatusOutline,
  
  // 连接类型
  getConnTypeText,
  getConnTypeColor,
  
  // IP 展示
  getVirtualIpDisplay,
  getWanIpDisplay,
  
  // 延迟
  getLatencyIcon,
  getLatencyColor,
  getLatencyText,
  
  // 流量
  formatBytes,
  getTrafficText,
  
  // 时间
  getLastSeenText,
  
  // 复合展示
  getNodeCardDisplay,
  getNodeListDisplay,
  getNodeTopologyDisplay
} from '../utils/nodeSummaryDisplay'

// ==================== 使用示例 ====================
/**
 * 在组件中使用 NodeSummary:
 * 
 * ```typescript
 * import { 
 *   extractNodeSummaries, 
 *   getNodeCardDisplay 
 * } from '@/models/nodeSummary'
 * 
 * // 1. 从 API 数据提炼 NodeSummary
 * const summaries = extractNodeSummaries(connections, nodesMetadata)
 * 
 * // 2. 获取视图专用的展示数据
 * const cardDisplay = getNodeCardDisplay(summaries[0])
 * 
 * // 3. 在模板中使用
 * <q-chip :color="cardDisplay.nodeStatus.color">
 *   {{ cardDisplay.nodeStatus.text }}
 * </q-chip>
 * ```
 */
