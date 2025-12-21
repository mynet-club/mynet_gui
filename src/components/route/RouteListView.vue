<template>
  <div class="route-list-view">
    <!-- 顶部工具栏 -->
    <div class="list-toolbar q-mb-md">
      <q-card>
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">节点连接列表</div>
              <div class="text-caption text-grey-6">
                共 {{ filteredConnections.length }} 条连接
              </div>
            </div>
            <div class="col-auto">
              <q-input
                v-model="searchQuery"
                dense
                outlined
                placeholder="搜索节点名称、IP..."
                class="q-mr-sm"
                style="min-width: 250px"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
                <template #append v-if="searchQuery">
                  <q-icon 
                    name="close" 
                    class="cursor-pointer" 
                    @click="searchQuery = ''" 
                  />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- 表格 -->
    <q-card>
      <q-table
        :rows="filteredConnections"
        :columns="columns"
        :loading="loading"
        row-key="peer_id"
        flat
        bordered
        :pagination="{ rowsPerPage: 20 }"
        @row-click="handleRowClick"
      >
        <!-- 节点名称列 -->
        <template #body-cell-node_name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon name="router" color="primary" size="sm" class="q-mr-xs" />
              <div>
                <div class="text-weight-medium">{{ getNodeName(props.row) }}</div>
                <div class="text-caption text-grey-6">
                  {{ getUserName(props.row) }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- IP地址列 -->
        <template #body-cell-ip_address="props">
          <q-td :props="props">
            <div v-if="props.row.ip_addresses && props.row.ip_addresses.length > 0">
              <div 
                v-for="(ip, idx) in props.row.ip_addresses.slice(0, 2)" 
                :key="idx"
                class="text-caption"
              >
                <q-chip
                  :color="getIpTypeColor(ip.route_type)"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ ip.ip_address }}
                </q-chip>
              </div>
              <div v-if="props.row.ip_addresses.length > 2" class="text-caption text-grey-6">
                +{{ props.row.ip_addresses.length - 2 }} 更多
              </div>
            </div>
            <span v-else class="text-grey-6">N/A</span>
          </q-td>
        </template>

        <!-- 节点状态列 -->
        <template #body-cell-online="props">
          <q-td :props="props">
            <q-chip
              :color="NodeStatusManager.getStatusColor(props.row.node_status)"
              text-color="white"
              size="sm"
            >
              {{ NodeStatusManager.getStatusText(props.row.node_status) }}
            </q-chip>
          </q-td>
        </template>

        <!-- 连接类型列 -->
        <template #body-cell-conn_type="props">
          <q-td :props="props">
            <q-chip
              :color="getConnectionTypeColor(props.row.conn_type)"
              text-color="white"
              size="sm"
            >
              {{ getConnectionTypeName(props.row.conn_type) }}
            </q-chip>
          </q-td>
        </template>

        <!-- 延迟列 -->
        <template #body-cell-latency="props">
          <q-td :props="props">
            <div v-if="props.row.latency" class="row items-center no-wrap">
              <q-icon
                :name="getLatencyIcon(props.row.latency)"
                :color="getLatencyColor(props.row.latency)"
                size="xs"
                class="q-mr-xs"
              />
              {{ props.row.latency?.toFixed(1) }} ms
            </div>
            <span v-else class="text-grey-6">N/A</span>
          </q-td>
        </template>

        <!-- 流量列 -->
        <template #body-cell-traffic="props">
          <q-td :props="props">
            <div class="text-caption">
              <div>↓ {{ formatBytes(props.row.rx_bytes) }}</div>
              <div>↑ {{ formatBytes(props.row.tx_bytes) }}</div>
            </div>
          </q-td>
        </template>

        <!-- 最后可见时间列 -->
        <template #body-cell-seen_at="props">
          <q-td :props="props">
            <div v-if="props.row.seen_at" class="text-caption">
              {{ formatDateTime(props.row.seen_at) }}
            </div>
            <span v-else class="text-grey-6">N/A</span>
          </q-td>
        </template>

        <!-- 操作列 -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              @click.stop="handleViewDetails(props.row)"
            >
              <q-tooltip>查看详情</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- 空数据提示 -->
        <template #no-data>
          <div class="full-width row flex-center text-grey-6 q-gutter-sm q-py-xl">
            <q-icon size="2em" name="info" />
            <span class="text-subtitle1">
              {{ searchQuery ? '未找到匹配的连接' : '暂无连接数据' }}
            </span>
          </div>
        </template>

        <!-- 加载中 -->
        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime, formatBytes as utilFormatBytes } from '../../utils/dateFormat'
import { NodeStatusManager } from '../../utils/nodeStatus'

interface Props {
  nodeId: string
  connections: any[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['connection-click'])

const router = useRouter()
const searchQuery = ref('')

// 表格列定义
const columns = [
  {
    name: 'node_name',
    label: '节点名称',
    field: 'node_name',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'ip_address',
    label: 'IP地址',
    field: 'ip_address',
    align: 'left' as const
  },
  {
    name: 'online',
    label: '节点状态',
    field: 'node_status',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'conn_type',
    label: '连接类型',
    field: 'conn_type',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'latency',
    label: '延迟',
    field: 'latency',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'traffic',
    label: '流量',
    field: 'traffic',
    align: 'center' as const
  },
  {
    name: 'seen_at',
    label: '最后可见',
    field: 'seen_at',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center' as const
  }
]

const filteredConnections = computed(() => {
  if (!searchQuery.value) return props.connections
  
  const query = searchQuery.value.toLowerCase()
  return props.connections.filter(conn => {
    const nodeName = getNodeName(conn).toLowerCase()
    const userName = getUserName(conn).toLowerCase()
    const ips = conn.ip_addresses?.map((ip: any) => ip.ip_address.toLowerCase()).join(' ') || ''
    
    return nodeName.includes(query) || 
           userName.includes(query) || 
           ips.includes(query)
  })
})

// 辅助方法
const getNodeName = (row: any) => {
  return row.node_name || row.target_node_name || '未知节点'
}

const getUserName = (row: any) => {
  return row.user_name || row.user_email || '未知用户'
}

const getConnectionTypeName = (type: string) => {
  if (!type) return 'N/A'
  
  const typeMap: Record<string, string> = {
    'direct_ipv4': '直连 IPv4',
    'direct_ipv6': '直连 IPv6',
    'relay': '中继',
    'derp': 'DERP 中继'
  }
  return typeMap[type] || type
}

const getConnectionTypeColor = (type: string) => {
  if (!type) return 'grey'
  
  const colorMap: Record<string, string> = {
    'direct_ipv4': 'positive',
    'direct_ipv6': 'positive',
    'relay': 'orange',
    'derp': 'info'
  }
  return colorMap[type] || 'grey'
}

// IP类型颜色
const getIpTypeColor = (routeType: string) => {
  const colorMap: Record<string, string> = {
    'node_ip': 'primary',
    'lan_ip': 'positive',
    'wan_ip': 'info'
  }
  return colorMap[routeType] || 'grey'
}

// 延迟相关
const getLatencyIcon = (latency: number) => {
  if (!latency) return 'signal_wifi_off'
  if (latency < 50) return 'signal_wifi_4_bar'
  if (latency < 100) return 'signal_wifi_3_bar'
  if (latency < 200) return 'signal_wifi_2_bar'
  return 'signal_wifi_1_bar'
}

const getLatencyColor = (latency: number) => {
  if (!latency) return 'grey'
  if (latency < 50) return 'positive'
  if (latency < 100) return 'info'
  if (latency < 200) return 'orange'
  return 'negative'
}

// 格式化方法
const formatBytes = utilFormatBytes
const formatDateTime = formatRelativeTime

// 事件处理
const handleRowClick = (evt: Event, row: any) => {
  const peerId = row.peer_id || row.node_id || row.id
  if (peerId) {
    router.push(`/app/routes/active/${props.nodeId}/p-${peerId}`)
  }
}

const handleViewDetails = (row: any) => {
  const peerId = row.peer_id || row.node_id || row.id
  if (peerId) {
    router.push(`/app/routes/active/${props.nodeId}/p-${peerId}`)
  }
}
</script>

<style lang="scss" scoped>
.route-list-view {
  :deep(.q-table) {
    tbody tr {
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: rgba(var(--q-primary-rgb), 0.05);
      }
    }
    
    th {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }
  }
}

.list-toolbar {
  :deep(.q-card) {
    border-left: 4px solid var(--q-primary);
  }
}
</style>
