<template>
  <div class="node-topology-view">
    <q-card>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="col">
            <div class="text-h6">网络拓扑图</div>
            <div class="text-caption text-grey-6">
              星形网络拓扑 - {{ connections.length }} 个连接节点
            </div>
          </div>
          <div class="col-auto">
            <q-btn-group flat>
              <q-btn flat dense icon="zoom_in" @click="zoomIn">
                <q-tooltip>放大</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="zoom_out" @click="zoomOut">
                <q-tooltip>缩小</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="center_focus_strong" @click="resetView">
                <q-tooltip>重置视图</q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
        </div>

        <!-- SVG 拓扑图 -->
        <div class="topology-container" ref="containerRef">
          <svg
            ref="svgRef"
            :width="svgWidth"
            :height="svgHeight"
            @wheel.prevent="handleWheel"
          >
            <g :transform="transformString">
              <!-- 连接线 -->
              <g class="connections-group">
                <!-- 直连线条（直线） -->
                <line
                  v-for="(conn, index) in visualConnections.filter(c => isDirectConnection(c))"
                  :key="`line-${index}`"
                  :x1="centerNode.x"
                  :y1="centerNode.y"
                  :x2="conn.x"
                  :y2="conn.y"
                  :stroke="getConnectionColor(conn)"
                  :stroke-width="getConnectionWidth(conn)"
                  :stroke-dasharray="conn.online ? '0' : '5,5'"
                  :class="['connection-line', { 'highlighted': isConnectionHighlighted(conn), 'dimmed': hoveredNodeId && !isConnectionHighlighted(conn) }]"
                  @mouseenter="showConnectionTooltip(conn, $event)"
                  @mouseleave="hideTooltip"
                />
                
                <!-- 中继连接（曲线） -->
                <path
                  v-for="(conn, index) in visualConnections.filter(c => !isDirectConnection(c))"
                  :key="`path-${index}`"
                  :d="getRelayPath(conn)"
                  :stroke="getConnectionColor(conn)"
                  :stroke-width="getConnectionWidth(conn)"
                  :stroke-dasharray="conn.online ? '0' : '5,5'"
                  fill="none"
                  :class="['connection-line', 'relay-line', { 'highlighted': isConnectionHighlighted(conn), 'dimmed': hoveredNodeId && !isConnectionHighlighted(conn) }]"
                  @mouseenter="showConnectionTooltip(conn, $event)"
                  @mouseleave="hideTooltip"
                />
              </g>

              <!-- 对端节点 -->
              <g class="peer-nodes-group">
                <g
                  v-for="(conn, index) in visualConnections"
                  :key="`peer-${index}`"
                  :class="['peer-node', { 'node-offline': !conn.online, 'node-highlighted': isNodeHighlighted(conn), 'node-dimmed': hoveredNodeId && !isNodeHighlighted(conn) }]"
                  @click="handleNodeClick(conn)"
                  @mouseenter="showNodeTooltip(conn, $event)"
                  @mouseleave="hideTooltip"
                >
                  <!-- 节点圆形（白色背景 + 状态色边框） -->
                  <circle
                    :cx="conn.x"
                    :cy="conn.y"
                    :r="nodeRadius"
                    fill="white"
                    :stroke="getNodeBorderColor(conn)"
                    stroke-width="2.5"
                    class="node-circle"
                  />
                  
                  <!-- 节点图标 -->
                  <text
                    :x="conn.x"
                    :y="conn.y"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="node-icon"
                    :fill="getNodeBorderColor(conn)"
                    font-size="18"
                    font-weight="500"
                  >💻</text>
                  
                  <!-- 节点标签 -->
                  <text
                    :x="conn.x"
                    :y="conn.y + nodeRadius + 15"
                    text-anchor="middle"
                    class="node-label"
                    font-size="12"
                    fill="#333"
                  >{{ getNodeLabel(conn) }}</text>
                </g>
              </g>

              <!-- 中心节点（当前节点） -->
              <g class="center-node">
                <circle
                  :cx="centerNode.x"
                  :cy="centerNode.y"
                  :r="centerNodeRadius"
                  fill="white"
                  stroke="#1976d2"
                  stroke-width="3"
                  class="center-node-circle"
                />
                
                <text
                  :x="centerNode.x"
                  :y="centerNode.y"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="center-node-icon"
                  fill="#1976d2"
                  font-size="28"
                  font-weight="500"
                >🖥️</text>
                
                <text
                  :x="centerNode.x"
                  :y="centerNode.y + centerNodeRadius + 20"
                  text-anchor="middle"
                  class="center-node-label"
                  font-size="14"
                  font-weight="600"
                  fill="#333"
                >{{ centerNodeName }}</text>
                
                <text
                  :x="centerNode.x"
                  :y="centerNode.y + centerNodeRadius + 38"
                  text-anchor="middle"
                  class="center-node-info"
                  font-size="11"
                  fill="#999"
                >当前节点</text>
              </g>
            </g>
          </svg>

          <!-- Hover Tooltip -->
          <div
            v-if="tooltip.show"
            class="topology-tooltip"
            :style="{
              left: tooltip.x + 'px',
              top: tooltip.y + 'px'
            }"
          >
            <!-- 节点信息 -->
            <div v-if="tooltip.type === 'node'" class="tooltip-content">
              <div class="tooltip-title">{{ tooltip.data.node_name || tooltip.data.peer_node_name }}</div>
              
              <!-- 节点状态 (来自 node_status / peer_node_status) -->
              <div class="tooltip-row">
                <span class="tooltip-label">节点状态</span>
                <q-chip
                  :color="getNodeStatusColorValue(tooltip.data)"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ getNodeStatusLabel(tooltip.data) }}
                </q-chip>
              </div>
              
              <!-- 虚拟 IP -->
              <div class="tooltip-row" v-if="getVirtualIp(tooltip.data)">
                <span class="tooltip-label">虚拟 IP</span>
                <span class="tooltip-value">{{ getVirtualIp(tooltip.data) }}</span>
              </div>
              
              <!-- 公网 IP -->
              <div class="tooltip-row" v-if="tooltip.data.wanip">
                <span class="tooltip-label">公网 IP</span>
                <span class="tooltip-value">{{ tooltip.data.wanip }}</span>
              </div>
              
              <!-- 最后通信时间 (在线或离线都显示) -->
              <div class="tooltip-row" v-if="getLastSeenTime(tooltip.data)">
                <span class="tooltip-label">{{ tooltip.data.online ? '最后通信' : '最后上线' }}</span>
                <span class="tooltip-value">{{ formatRelativeTime(getLastSeenTime(tooltip.data)) }}</span>
              </div>
              
              <!-- 分隔线：连接相关信息 -->
              <template v-if="tooltip.data.online && (tooltip.data.latency || tooltip.data.rx_bytes || tooltip.data.tx_bytes)">
                <div class="tooltip-divider"></div>
                
                <!-- 连接延迟 -->
                <div class="tooltip-row" v-if="tooltip.data.latency">
                  <span class="tooltip-label">延迟</span>
                  <span class="tooltip-value">{{ tooltip.data.latency.toFixed(1) }} ms</span>
                </div>
                
                <!-- 流量统计 -->
                <div class="tooltip-row" v-if="tooltip.data.rx_bytes || tooltip.data.tx_bytes">
                  <span class="tooltip-label">流量</span>
                  <span class="tooltip-value">
                    ⬇ {{ formatBytes(tooltip.data.rx_bytes || 0) }} / 
                    ⬆ {{ formatBytes(tooltip.data.tx_bytes || 0) }}
                  </span>
                </div>
              </template>
            </div>

            <!-- 连接线信息 -->
            <div v-else-if="tooltip.type === 'connection'" class="tooltip-content">
              <div class="tooltip-title">连接线 → {{ tooltip.data.node_name || tooltip.data.peer_node_name }}</div>
              
              <div class="tooltip-row">
                <span class="tooltip-label">连接状态</span>
                <q-chip
                  :color="tooltip.data.online ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ tooltip.data.online ? '在线' : '离线' }}
                </q-chip>
              </div>
              
              <div class="tooltip-row">
                <span class="tooltip-label">连接类型</span>
                <span class="tooltip-value">{{ getConnectionTypeName(tooltip.data.conn_type) }}</span>
              </div>
              
              <template v-if="tooltip.data.online">
                <div class="tooltip-row" v-if="tooltip.data.latency">
                  <span class="tooltip-label">延迟</span>
                  <span class="tooltip-value">{{ tooltip.data.latency.toFixed(1) }} ms</span>
                </div>
                
                <div class="tooltip-row">
                  <span class="tooltip-label">流量</span>
                  <span class="tooltip-value">
                    ⬇ {{ formatBytes(tooltip.data.rx_bytes || 0) }} / 
                    ⬆ {{ formatBytes(tooltip.data.tx_bytes || 0) }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="topology-legend q-mt-md">
          <div class="row q-gutter-md">
            <div class="legend-item">
              <div class="legend-dot" style="border: 2.5px solid #4caf50; background: white"></div>
              <span class="text-caption">在线</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="border: 2.5px solid #ff9800; background: white"></div>
              <span class="text-caption">启用但离线</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="border: 2.5px solid #9e9e9e; background: white"></div>
              <span class="text-caption">已禁用</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="border: 2.5px solid #ffc107; background: white"></div>
              <span class="text-caption">未完成配置</span>
            </div>
            <div class="legend-item">
              <div class="legend-line" style="border-top: 2px solid #4caf50"></div>
              <span class="text-caption">直连</span>
            </div>
            <div class="legend-item">
              <div class="legend-line relay-legend"></div>
              <span class="text-caption">中继(曲线)</span>
            </div>
            <div class="legend-item">
              <div class="legend-line" style="border-top: 2px dashed #999"></div>
              <span class="text-caption">离线</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 节点详情弹窗 -->
    <q-dialog v-model="showNodeDialog">
      <q-card style="min-width: 450px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedNode?.node_name || selectedNode?.peer_node_name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedNode">
          <div class="q-gutter-sm">
            <!-- 节点状态 -->
            <div class="row items-center">
              <div class="col-4 text-grey-7">节点状态:</div>
              <div class="col">
                <q-chip
                  :color="getNodeStatusColorValue(selectedNode)"
                  text-color="white"
                  size="sm"
                >
                  {{ getNodeStatusLabel(selectedNode) }}
                </q-chip>
              </div>
            </div>
            
            <!-- 连接状态 -->
            <div class="row items-center">
              <div class="col-4 text-grey-7">连接状态:</div>
              <div class="col">
                <q-chip
                  :color="selectedNode.online ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ selectedNode.online ? '在线' : '离线' }}
                </q-chip>
              </div>
            </div>

            <!-- 连接类型 -->
            <div v-if="selectedNode.conn_type && selectedNode.conn_type !== 'offline'" class="row items-center">
              <div class="col-4 text-grey-7">连接类型:</div>
              <div class="col">{{ getConnectionTypeName(selectedNode.conn_type) }}</div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- 虚拟 IP -->
            <div v-if="getVirtualIp(selectedNode)" class="row items-center">
              <div class="col-4 text-grey-7">虚拟 IP:</div>
              <div class="col">
                <q-chip size="sm" color="primary" text-color="white">
                  {{ getVirtualIp(selectedNode) }}
                </q-chip>
              </div>
            </div>

            <!-- 公网 IP -->
            <div v-if="selectedNode.wanip" class="row items-center">
              <div class="col-4 text-grey-7">公网 IP:</div>
              <div class="col">
                <q-chip size="sm" color="secondary" text-color="white">
                  {{ selectedNode.wanip }}
                </q-chip>
              </div>
            </div>

            <!-- 所有 IP 地址 -->
            <div v-if="selectedNode.ip_addresses && selectedNode.ip_addresses.length > 1">
              <div class="text-grey-7 q-mb-xs">所有 IP 地址:</div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="(ip, idx) in selectedNode.ip_addresses"
                  :key="idx"
                  size="sm"
                  :color="ip.route_type === 'node_ip' ? 'primary' : 'accent'"
                  text-color="white"
                >
                  {{ ip.ip_address || ip }}
                  <q-tooltip v-if="ip.route_type">{{ ip.route_type === 'node_ip' ? '节点IP' : ip.route_type === 'lan_ip' ? '局域网IP' : ip.route_type }}</q-tooltip>
                </q-chip>
              </div>
            </div>

            <q-separator class="q-my-sm" v-if="selectedNode.online" />

            <!-- 延迟 (仅在线时显示) -->
            <div v-if="selectedNode.online && selectedNode.latency" class="row items-center">
              <div class="col-4 text-grey-7">延迟:</div>
              <div class="col">
                <span :class="{
                  'text-positive': selectedNode.latency < 50,
                  'text-warning': selectedNode.latency >= 50 && selectedNode.latency < 150,
                  'text-negative': selectedNode.latency >= 150
                }">
                  {{ selectedNode.latency.toFixed(1) }} ms
                </span>
              </div>
            </div>

            <!-- 最后通信时间 -->
            <div v-if="getLastSeenTime(selectedNode)" class="row items-center">
              <div class="col-4 text-grey-7">{{ selectedNode.online ? '最后通信' : '最后上线' }}:</div>
              <div class="col">{{ formatRelativeTime(getLastSeenTime(selectedNode)) }}</div>
            </div>

            <!-- 流量统计 (仅在线时显示) -->
            <div v-if="selectedNode.online && (selectedNode.rx_bytes || selectedNode.tx_bytes)" class="row items-center">
              <div class="col-4 text-grey-7">流量:</div>
              <div class="col">
                ⬇ {{ formatBytes(selectedNode.rx_bytes || 0) }} / 
                ⬆ {{ formatBytes(selectedNode.tx_bytes || 0) }}
              </div>
            </div>

            <q-separator class="q-my-sm" v-if="selectedNode.user_name" />

            <!-- 所属用户 -->
            <div v-if="selectedNode.user_name" class="row items-center">
              <div class="col-4 text-grey-7">所属用户:</div>
              <div class="col">{{ selectedNode.user_name }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="查看详情"
            color="primary"
            @click="viewNodeDetails"
          />
          <q-btn flat label="关闭" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatBytes, formatRelativeTime } from '../../utils/dateFormat'
import { 
  getConnectionTypeText, 
  getNodeStatusText, 
  getNodeStatusColor,
  getVirtualIp as getVirtualIpFromData,
  getLanIps
} from '../../composables/useConnectionsData'

interface Props {
  connections: any[]
  loading: boolean
  centerNodeName?: string
  nodeId: string
}

const props = withDefaults(defineProps<Props>(), {
  centerNodeName: '当前节点'
})

const emit = defineEmits<{
  'connection-click': [connection: any]
}>()

const router = useRouter()

// SVG 容器和变换
const containerRef = ref<HTMLElement>()
const svgRef = ref<SVGElement>()
const svgWidth = ref(1000)
const svgHeight = ref(700)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

// 节点尺寸
const centerNodeRadius = 40
const nodeRadius = 30

// 中心节点位置
const centerNode = computed(() => ({
  x: svgWidth.value / 2,
  y: svgHeight.value / 2
}))

// 选中的节点
const selectedNode = ref<any>(null)
const showNodeDialog = ref(false)

// Tooltip 状态
const tooltip = ref({
  show: false,
  type: 'node' as 'node' | 'connection',
  x: 0,
  y: 0,
  data: null as any
})

// 高亮状态
const hoveredNodeId = ref<string | null>(null)

// 计算可视化连接（圆形分布）
const visualConnections = computed(() => {
  const connections = props.connections
  const count = connections.length
  if (count === 0) return []

  const radius = Math.min(svgWidth.value, svgHeight.value) * 0.35
  const centerX = centerNode.value.x
  const centerY = centerNode.value.y

  return connections.map((conn, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2
    
    return {
      ...conn,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle
    }
  })
})

// 变换字符串
const transformString = computed(() => {
  return `translate(${translateX.value}, ${translateY.value}) scale(${scale.value})`
})

// 获取连接线颜色 (基于连接状态和类型)
const getConnectionColor = (conn: any) => {
  if (!conn.online || conn.conn_type === 'offline') return '#bbb'
  
  const connType = conn.conn_type || 'none'
  if (connType === 'direct_ipv4' || connType === 'direct_ipv6') return '#4caf50'
  if (connType === 'relay' || connType === 'derp') return '#2196f3'
  return '#bbb'
}

// 获取连接线宽度
const getConnectionWidth = (conn: any) => {
  if (!conn.online || !conn.latency) return 1.5
  
  if (conn.latency < 50) return 3
  if (conn.latency < 100) return 2.5
  return 2
}

// 获取节点边框颜色 (基于节点状态)
const getNodeBorderColor = (conn: any) => {
  // 优先使用 peer_node_status，其次使用 node_status
  const status = conn.peer_node_status !== undefined ? conn.peer_node_status : conn.node_status
  
  if (status === 2) return '#4caf50'  // 在线 - 绿色
  if (status === 1) return '#ff9800'  // 启用但离线 - 橙色
  if (status === 0) return '#9e9e9e'  // 已禁用 - 灰色
  if (status === -1) return '#ffc107' // 未完成配置 - 黄色
  return '#9e9e9e'
}

// 判断是否为直连 (direct_ipv4, direct_ipv6)
const isDirectConnection = (conn: any) => {
  const connType = conn.conn_type || 'none'
  return connType === 'direct_ipv4' || connType === 'direct_ipv6' || connType.startsWith('direct')
}

// 获取中继路径（贝塞尔曲线）
const getRelayPath = (conn: any) => {
  const centerX = centerNode.value.x
  const centerY = centerNode.value.y
  const targetX = conn.x
  const targetY = conn.y
  
  // 计算中点
  const midX = (centerX + targetX) / 2
  const midY = (centerY + targetY) / 2
  
  // 计算垂直方向
  const dx = targetX - centerX
  const dy = targetY - centerY
  const len = Math.sqrt(dx * dx + dy * dy)
  
  // 垂直向量
  const perpX = -dy / len
  const perpY = dx / len
  
  // 控制点偏移（曲线弯曲程度）
  const offset = 50
  const controlX = midX + perpX * offset
  const controlY = midY + perpY * offset
  
  // 二次贝塞尔曲线
  return `M ${centerX} ${centerY} Q ${controlX} ${controlY} ${targetX} ${targetY}`
}

// 获取节点标签
const getNodeLabel = (conn: any) => {
  const name = conn.node_name || conn.peer_node_name || `Node ${conn.peer_id}`
  return name.length > 12 ? name.substring(0, 12) + '...' : name
}

// 获取连接类型名称
const getConnectionTypeName = (type: string) => {
  return getConnectionTypeText(type)
}

// 获取虚拟IP
const getVirtualIp = (node: any): string => {
  return getVirtualIpFromData(node)
}

// 获取最后通信时间
const getLastSeenTime = (node: any): string | null => {
  return node.seen_at || node.last_seen || node.last_handshake || null
}

// 获取节点状态标签 (基于 node_status / peer_node_status)
const getNodeStatusLabel = (node: any): string => {
  const status = node.peer_node_status !== undefined ? node.peer_node_status : node.node_status
  return getNodeStatusText(status)
}

// 获取节点状态颜色 (基于 node_status / peer_node_status)
const getNodeStatusColorValue = (node: any): string => {
  const status = node.peer_node_status !== undefined ? node.peer_node_status : node.node_status
  return getNodeStatusColor(status)
}

// 显示节点 Tooltip
const showNodeTooltip = (conn: any, event: MouseEvent) => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    tooltip.value = {
      show: true,
      type: 'node',
      x: event.clientX - rect.left + 15,
      y: event.clientY - rect.top + 15,
      data: conn
    }
    // 设置高亮节点
    hoveredNodeId.value = conn.peer_id || conn.node_id
  }
}

// 显示连接 Tooltip
const showConnectionTooltip = (conn: any, event: MouseEvent) => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    tooltip.value = {
      show: true,
      type: 'connection',
      x: event.clientX - rect.left + 15,
      y: event.clientY - rect.top + 15,
      data: conn
    }
  }
}

// 隐藏 Tooltip
const hideTooltip = () => {
  tooltip.value.show = false
  hoveredNodeId.value = null
}

// 缩放控制
const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 3)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.3)
}

const resetView = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// 鼠标滚轮缩放
const handleWheel = (event: WheelEvent) => {
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  scale.value = Math.max(0.3, Math.min(3, scale.value * delta))
}

// 节点点击
const handleNodeClick = (conn: any) => {
  selectedNode.value = conn
  showNodeDialog.value = true
}

const viewNodeDetails = () => {
  if (selectedNode.value) {
    const peerId = selectedNode.value.peer_id || selectedNode.value.node_id
    router.push(`/app/routes/active/${props.nodeId}/p-${peerId}`)
  }
}

// 判断节点是否高亮
const isNodeHighlighted = (conn: any): boolean => {
  if (!hoveredNodeId.value) return false
  return (conn.peer_id === hoveredNodeId.value || conn.node_id === hoveredNodeId.value)
}

// 判断连接线是否高亮
const isConnectionHighlighted = (conn: any): boolean => {
  return isNodeHighlighted(conn)
}

// 响应容器大小变化
const updateSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    svgWidth.value = rect.width
    svgHeight.value = Math.max(600, rect.height)
  }
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

// 监听连接变化，重置视图
watch(() => props.connections.length, () => {
  resetView()
})
</script>

<style lang="scss" scoped>
.node-topology-view {
  .topology-container {
    width: 100%;
    min-height: 600px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    background: linear-gradient(to bottom, #fafafa, #f5f5f5);
    position: relative;
    
    svg {
      display: block;
      cursor: grab;
      
      &:active {
        cursor: grabbing;
      }
    }
  }

  .connection-line {
    transition: stroke-width 0.3s ease, stroke 0.3s ease, opacity 0.3s ease;
    cursor: pointer;
    
    &:hover {
      stroke-width: 4 !important;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
    }
    
    &.highlighted {
      stroke-width: 4.5 !important;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
    }
    
    &.dimmed {
      opacity: 0.2;
    }
  }

  .peer-node {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      .node-circle {
        stroke-width: 4;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
      }
    }
    
    &.node-offline {
      opacity: 0.6;
    }
    
    &.node-highlighted {
      .node-circle {
        stroke-width: 4.5;
        filter: drop-shadow(0 3px 10px rgba(0,0,0,0.35));
      }
    }
    
    &.node-dimmed {
      opacity: 0.25;
    }
  }

  .center-node {
    .center-node-circle {
      transition: all 0.2s ease;
    }
    
    &:hover {
      .center-node-circle {
        filter: drop-shadow(0 3px 8px rgba(25,118,210,0.3));
      }
    }
  }

  .node-label,
  .center-node-label,
  .center-node-info,
  .node-icon,
  .center-node-icon {
    pointer-events: none;
    user-select: none;
  }

  .topology-tooltip {
    position: absolute;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 14px 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.2);
    z-index: 1000;
    pointer-events: none;
    min-width: 240px;
    max-width: 340px;
    
    .tooltip-content {
      .tooltip-title {
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
      }
      
      .tooltip-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 8px 0;
      }
      
      .tooltip-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 7px;
        font-size: 13px;
        
        .tooltip-label {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          min-width: 65px;
          &::after {
            content: ':';
          }
        }
        
        .tooltip-value {
          color: #fff;
          flex: 1;
          font-weight: 400;
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .topology-legend {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background: #f8f8f8;
    border-radius: 4px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .legend-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
      
      .legend-line {
        width: 32px;
        height: 0;
        
        &.relay-legend {
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          height: 8px;
        }
      }
    }
  }
}
</style>
