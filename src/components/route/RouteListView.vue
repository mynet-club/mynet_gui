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
        <!-- 节点名称列：单行展示 -->
        <template #body-cell-node_name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon name="router" color="primary" size="sm" class="q-mr-xs" />
              <div class="text-weight-medium ellipsis" style="max-width: 180px">
                {{ getNodeListDisplay(props.row).name }}
              </div>
              <q-tooltip>{{ getNodeListDisplay(props.row).userNameTooltip }}</q-tooltip>
            </div>
          </q-td>
        </template>

        <!-- 虚拟IP列：紧凑展示 -->
        <template #body-cell-virtual_ip="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon :name="getNodeListDisplay(props.row).virtualIp.icon" 
                :color="getNodeListDisplay(props.row).virtualIp.color" 
                size="xs" class="q-mr-xs" />
              <span class="text-body2">{{ getNodeListDisplay(props.row).virtualIp.text }}</span>
            </div>
          </q-td>
        </template>

        <!-- 公网IP列：紧凑展示 -->
        <template #body-cell-wan_ip="props">
          <q-td :props="props">
            <div v-if="getNodeListDisplay(props.row).wanIp !== '—'" class="row items-center no-wrap">
              <q-icon name="public" color="secondary" size="xs" class="q-mr-xs" />
              <span class="text-body2">{{ getNodeListDisplay(props.row).wanIp }}</span>
            </div>
            <span v-else class="text-grey-6">—</span>
          </q-td>
        </template>

        <!-- 节点状态列 -->
        <template #body-cell-node_status="props">
          <q-td :props="props">
            <q-chip
              :color="getNodeListDisplay(props.row).nodeStatus.color"
              text-color="white"
              size="sm"
            >
              {{ getNodeListDisplay(props.row).nodeStatus.text }}
            </q-chip>
          </q-td>
        </template>

        <!-- 链路状态列 -->
        <template #body-cell-online="props">
          <q-td :props="props">
            <q-chip
              :color="getNodeListDisplay(props.row).linkStatus.color"
              text-color="white"
              size="sm"
              :outline="getNodeListDisplay(props.row).linkStatus.outline"
            >
              <q-icon :name="getNodeListDisplay(props.row).linkStatus.icon" size="xs" class="q-mr-xs" />
              {{ getNodeListDisplay(props.row).linkStatus.text }}
            </q-chip>
          </q-td>
        </template>

        <!-- 延迟列 -->
        <template #body-cell-latency="props">
          <q-td :props="props">
            {{ getNodeListDisplay(props.row).latency }}
          </q-td>
        </template>

        <!-- 流量列 -->
        <template #body-cell-traffic="props">
          <q-td :props="props">
            <div class="text-caption">
              {{ getNodeListDisplay(props.row).traffic }}
            </div>
          </q-td>
        </template>

        <!-- 最后可见时间列 -->
        <template #body-cell-seen_at="props">
          <q-td :props="props">
            <div v-if="props.row.seen_at" class="text-caption">
              {{ formatDateTime(props.row.seen_at) }}
            </div>
            <span v-else class="text-grey-6">{{ $t('common.noData') }}</span>
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
import type { NodeSummary } from '../../models/nodeSummary'
import { getNodeListDisplay } from '../../models/nodeSummary'

interface Props {
  nodeId: string
  connections: NodeSummary[]
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
    name: 'virtual_ip',
    label: '虚拟IP',
    field: 'virtual_ip',
    align: 'left' as const
  },
  {
    name: 'wan_ip',
    label: '公网IP',
    field: 'wan_ip',
    align: 'left' as const
  },
  {
    name: 'node_status',
    label: '节点状态',
    field: 'node_status',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'online',
    label: '链路状态',
    field: 'online',
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
    label: '最后通信',
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
  return props.connections.filter(summary => {
    const display = getNodeListDisplay(summary)
    return display.name.toLowerCase().includes(query) || 
           display.userNameTooltip.toLowerCase().includes(query) ||
           display.virtualIp.text.toLowerCase().includes(query) ||
           display.wanIp.toLowerCase().includes(query)
  })
})

// 事件处理
const handleRowClick = (evt: Event, row: NodeSummary) => {
  router.push(`/app/routes/active/${props.nodeId}/p-${row.peer_id}`)
}

const handleViewDetails = (row: NodeSummary) => {
  router.push(`/app/routes/active/${props.nodeId}/p-${row.peer_id}`)
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
