# 活跃路由页面优化方案

## 一、需求概述

优化活跃路由页面（/app/routes/active），支持多层级路径定位和展示模式切换。这是路由功能的核心页面。

### 当前结构
- **单一路径**: `/app/routes/active` - 节点列表视图
- **单一模式**: 卡片模式展示

### 目标结构
提供三层级路由结构，支持精确定位到具体的连接详情：

1. **一级**: `/app/routes/active` - 可用节点列表（现有）
2. **二级**: `/app/routes/active/{nodeId}` - 指定节点的路由列表（卡片模式）
3. **二级扩展**: `/app/routes/active/{nodeId}/list` - 列表模式，支持分页
4. **三级**: `/app/routes/active/{nodeId}/p-{peerId}` - 节点间连接详情

---

## 二、路由配置方案

### 2.1 路由定义

在 `src/router/routes.ts` 中增加以下路由配置：

```typescript
{
  path: 'routes',
  children: [
    // 现有路由
    {
      path: '',
      name: 'routes',
      component: () => import('../pages/route/RouteListPage.vue'),
      meta: { title: '路由管理', requiresAuth: true }
    },
    
    // 一级：活跃路由 - 节点列表
    {
      path: 'active',
      name: 'routes-active',
      component: () => import('../pages/route/ActiveRoutesPage.vue'),
      meta: { title: '活跃路由', requiresAuth: true }
    },
    
    // 二级：指定节点的路由列表（卡片模式）
    {
      path: 'active/:nodeId',
      name: 'routes-active-node',
      component: () => import('../pages/route/ActiveRoutesPage.vue'),
      meta: { title: '节点路由', requiresAuth: true }
    },
    
    // 二级扩展：列表模式（支持分页）
    {
      path: 'active/:nodeId/list',
      name: 'routes-active-node-list',
      component: () => import('../pages/route/ActiveRoutesPage.vue'),
      meta: { title: '节点路由列表', requiresAuth: true }
    },
    
    // 三级：节点对节点连接详情
    {
      path: 'active/:nodeId/p-:peerId',
      name: 'routes-active-connection',
      component: () => import('../pages/route/ConnectionDetailsPage.vue'),
      meta: { title: '连接详情', requiresAuth: true }
    }
  ]
}
```

---

## 三、页面组件设计

### 3.1 ActiveRoutesPage.vue 重构

该页面需要支持三种视图模式：

#### 视图模式判断逻辑

```typescript
import { useRoute } from 'vue-router'

const route = useRoute()
const currentView = computed(() => {
  // 通过路由参数判断当前视图
  const { nodeId } = route.params
  const { name } = route
  
  if (!nodeId) {
    return 'node-list' // 节点列表视图
  } else if (name === 'routes-active-node-list') {
    return 'routes-list' // 路由列表视图（表格模式）
  } else {
    return 'routes-card' // 路由卡片视图
  }
})

const displayMode = computed(() => {
  return currentView.value === 'routes-list' ? 'list' : 'card'
})
```

#### 页面结构

```vue
<template>
  <PageLayout
    :title="pageTitle"
    :subtitle="pageSubtitle"
    icon="route"
  >
    <!-- 面包屑导航 -->
    <template #breadcrumbs>
      <q-breadcrumbs>
        <q-breadcrumbs-el label="活跃路由" to="/app/routes/active" />
        <q-breadcrumbs-el 
          v-if="selectedNodeInfo"
          :label="selectedNodeInfo.node_name"
          :to="`/app/routes/active/${selectedNodeInfo.node_id}`"
        />
      </q-breadcrumbs>
    </template>

    <!-- 操作按钮区 -->
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <!-- 返回按钮 -->
        <q-btn
          v-if="currentView !== 'node-list'"
          flat
          icon="arrow_back"
          label="返回"
          @click="handleBack"
        />
        
        <!-- 视图切换（仅在路由列表视图显示）-->
        <q-btn-toggle
          v-if="currentView !== 'node-list'"
          v-model="displayMode"
          toggle-color="primary"
          :options="[
            { label: '卡片', value: 'card', icon: 'grid_view' },
            { label: '列表', value: 'list', icon: 'list' }
          ]"
          @update:model-value="handleViewModeChange"
        />
        
        <!-- 刷新按钮 -->
        <q-btn
          color="primary"
          icon="sync"
          label="刷新"
          @click="handleRefresh"
          :loading="loading"
        />
      </div>
    </template>

    <!-- 内容区域 -->
    <div class="active-routes-content">
      <!-- 视图1: 节点列表 -->
      <NodeListView 
        v-if="currentView === 'node-list'"
        :nodes="availableNodes"
        :loading="nodesLoading"
        @node-select="handleNodeSelect"
      />
      
      <!-- 视图2: 路由卡片视图 -->
      <RouteCardView
        v-else-if="currentView === 'routes-card'"
        :node-id="route.params.nodeId"
        :connections="connections"
        :loading="connectionsLoading"
        @connection-click="handleConnectionClick"
      />
      
      <!-- 视图3: 路由列表视图（支持分页）-->
      <RouteListView
        v-else-if="currentView === 'routes-list'"
        :node-id="route.params.nodeId"
        :connections="connections"
        :pagination="pagination"
        :loading="connectionsLoading"
        @connection-click="handleConnectionClick"
        @page-change="handlePageChange"
      />
    </div>
  </PageLayout>
</template>
```

### 3.2 ConnectionDetailsPage.vue（新建）

专门展示两个节点之间连接详情的页面。

```vue
<template>
  <PageLayout
    :title="`${sourceNodeInfo?.node_name} ↔ ${peerNodeInfo?.node_name}`"
    subtitle="连接详情"
    icon="cable"
  >
    <!-- 面包屑 -->
    <template #breadcrumbs>
      <q-breadcrumbs>
        <q-breadcrumbs-el label="活跃路由" to="/app/routes/active" />
        <q-breadcrumbs-el 
          :label="sourceNodeInfo?.node_name"
          :to="`/app/routes/active/${nodeId}`"
        />
        <q-breadcrumbs-el 
          :label="peerNodeInfo?.node_name"
        />
      </q-breadcrumbs>
    </template>

    <template #actions>
      <q-btn
        flat
        icon="arrow_back"
        label="返回节点路由"
        @click="$router.push(`/app/routes/active/${nodeId}`)"
      />
      <q-btn
        color="primary"
        icon="sync"
        label="刷新"
        @click="loadConnectionDetails"
        :loading="loading"
      />
    </template>

    <!-- 连接概览卡片 -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- 本节点信息 -->
      <div class="col-12 col-md-6">
        <NodeInfoCard :node="sourceNodeInfo" title="本节点" />
      </div>
      
      <!-- 对端节点信息 -->
      <div class="col-12 col-md-6">
        <NodeInfoCard :node="peerNodeInfo" title="对端节点" />
      </div>
    </div>

    <!-- 连接状态卡片 -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">连接状态</div>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <StatItem
              icon="link"
              label="连接状态"
              :value="connectionDetails.online ? '在线' : '离线'"
              :color="connectionDetails.online ? 'positive' : 'negative'"
            />
          </div>
          <div class="col-6 col-md-3">
            <StatItem
              icon="speed"
              label="连接类型"
              :value="getConnectionTypeName(connectionDetails.conn_type)"
              color="info"
            />
          </div>
          <div class="col-6 col-md-3">
            <StatItem
              icon="timer"
              label="延迟"
              :value="`${connectionDetails.latency?.toFixed(1) || 'N/A'} ms`"
              color="orange"
            />
          </div>
          <div class="col-6 col-md-3">
            <StatItem
              icon="schedule"
              label="最后可见"
              :value="formatTime(connectionDetails.seen_at)"
              color="grey"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 流量统计 -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">流量统计</div>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-4">
            <StatItem
              icon="download"
              label="接收流量"
              :value="formatBytes(connectionDetails.rx_bytes)"
              color="positive"
            />
          </div>
          <div class="col-6 col-md-4">
            <StatItem
              icon="upload"
              label="发送流量"
              :value="formatBytes(connectionDetails.tx_bytes)"
              color="primary"
            />
          </div>
          <div class="col-12 col-md-4">
            <StatItem
              icon="swap_vert"
              label="总流量"
              :value="formatBytes(
                (connectionDetails.rx_bytes || 0) + (connectionDetails.tx_bytes || 0)
              )"
              color="info"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 连接历史图表 -->
    <q-card>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">连接历史</div>
          <q-space />
          <q-btn-toggle
            v-model="historyTimeRange"
            toggle-color="primary"
            :options="[
              { label: '1小时', value: '1h' },
              { label: '6小时', value: '6h' },
              { label: '24小时', value: '24h' },
              { label: '7天', value: '7d' }
            ]"
            @update:model-value="loadHistoryData"
          />
        </div>
        
        <!-- 历史数据表格 -->
        <ConnectionHistoryTable
          :history="connectionHistory"
          :loading="historyLoading"
        />
      </q-card-section>
    </q-card>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useNotify } from '@/composables/useNotify'
import { formatBytes, formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const notify = useNotify()

const nodeId = computed(() => route.params.nodeId as string)
const peerId = computed(() => route.params.peerId as string)

const loading = ref(false)
const historyLoading = ref(false)
const historyTimeRange = ref('24h')

const connectionDetails = ref<any>({})
const sourceNodeInfo = ref<any>(null)
const peerNodeInfo = ref<any>(null)
const connectionHistory = ref<any[]>([])

// 加载连接详情
const loadConnectionDetails = async () => {
  // ... 实现加载逻辑
}

// 加载历史数据
const loadHistoryData = async () => {
  try {
    historyLoading.value = true
    
    const timeRanges: Record<string, { hours: number }> = {
      '1h': { hours: 1 },
      '6h': { hours: 6 },
      '24h': { hours: 24 },
      '7d': { hours: 168 }
    }
    
    const range = timeRanges[historyTimeRange.value]
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - range.hours * 60 * 60 * 1000)
    
    const response = await api.get('/monitor/history/connections', {
      params: {
        node_id: nodeId.value,
        peer_node_id: peerId.value,
        start_time: startTime.toISOString().slice(0, 19).replace('T', ' '),
        end_time: endTime.toISOString().slice(0, 19).replace('T', ' '),
        per_page: 100
      }
    })
    
    connectionHistory.value = response.data.data.connections || []
  } catch (error) {
    notify.error('加载历史数据失败')
  } finally {
    historyLoading.value = false
  }
}

onMounted(() => {
  loadConnectionDetails()
  loadHistoryData()
})
</script>
```

---

## 四、子组件设计

### 4.1 RouteListView.vue（新建）

列表模式展示路由连接，支持分页。

```vue
<template>
  <div class="route-list-view">
    <!-- 顶部工具栏 -->
    <div class="list-toolbar q-mb-md">
      <div class="row items-center">
        <div class="col">
          <div class="text-h6">节点连接列表</div>
          <div class="text-caption text-grey-6">
            共 {{ pagination.total }} 条连接
          </div>
        </div>
        <div class="col-auto">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="搜索节点名称、IP..."
            class="q-mr-sm"
            style="min-width: 200px"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <q-table
      :rows="filteredConnections"
      :columns="columns"
      :loading="loading"
      row-key="peer_id"
      :pagination="tablePagination"
      @row-click="handleRowClick"
      flat
      bordered
    >
      <!-- 节点名称列 -->
      <template #body-cell-node_name="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon name="router" color="primary" size="sm" class="q-mr-xs" />
            <div>
              <div class="text-weight-medium">{{ props.row.node_name }}</div>
              <div class="text-caption text-grey-6">
                {{ props.row.user_name || '未知用户' }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- 在线状态列 -->
      <template #body-cell-online="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.online ? 'positive' : 'negative'"
            text-color="white"
            size="sm"
          >
            {{ props.row.online ? '在线' : '离线' }}
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
          <div class="row items-center">
            <q-icon
              :name="getLatencyIcon(props.row.latency)"
              :color="getLatencyColor(props.row.latency)"
              size="xs"
              class="q-mr-xs"
            />
            {{ props.row.latency?.toFixed(1) || 'N/A' }} ms
          </div>
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
    </q-table>

    <!-- 分页 -->
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="pagination.last_page"
        :max-pages="7"
        direction-links
        boundary-links
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatBytes } from '@/utils/format'

interface Props {
  nodeId: string
  connections: any[]
  pagination: any
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['connection-click', 'page-change'])

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)

// 表格列定义
const columns = [
  {
    name: 'node_name',
    label: '节点名称',
    field: 'node_name',
    align: 'left',
    sortable: true
  },
  {
    name: 'online',
    label: '状态',
    field: 'online',
    align: 'center',
    sortable: true
  },
  {
    name: 'conn_type',
    label: '连接类型',
    field: 'conn_type',
    align: 'center',
    sortable: true
  },
  {
    name: 'latency',
    label: '延迟',
    field: 'latency',
    align: 'center',
    sortable: true
  },
  {
    name: 'traffic',
    label: '流量',
    align: 'center'
  },
  {
    name: 'seen_at',
    label: '最后可见',
    field: 'seen_at',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center'
  }
]

const tablePagination = computed(() => ({
  page: currentPage.value,
  rowsPerPage: props.pagination.per_page || 20,
  rowsNumber: props.pagination.total || 0
}))

const filteredConnections = computed(() => {
  if (!searchQuery.value) return props.connections
  
  const query = searchQuery.value.toLowerCase()
  return props.connections.filter(conn => 
    conn.node_name?.toLowerCase().includes(query) ||
    conn.user_name?.toLowerCase().includes(query) ||
    conn.ip_address?.toLowerCase().includes(query)
  )
})

// 连接类型相关
const getConnectionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'direct_ipv4': '直连 IPv4',
    'direct_ipv6': '直连 IPv6',
    'relay': '中继',
    'derp': 'DERP 中继'
  }
  return typeMap[type] || type
}

const getConnectionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'direct_ipv4': 'positive',
    'direct_ipv6': 'positive',
    'relay': 'orange',
    'derp': 'info'
  }
  return colorMap[type] || 'grey'
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

// 事件处理
const handleRowClick = (evt: Event, row: any) => {
  router.push(`/app/routes/active/${props.nodeId}/p-${row.peer_id}`)
}

const handleViewDetails = (row: any) => {
  router.push(`/app/routes/active/${props.nodeId}/p-${row.peer_id}`)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  emit('page-change', page)
}
</script>

<style lang="scss" scoped>
.route-list-view {
  :deep(.q-table) {
    tbody tr {
      cursor: pointer;
      
      &:hover {
        background-color: rgba(var(--q-primary-rgb), 0.05);
      }
    }
  }
}
</style>
```

### 4.2 ConnectionHistoryTable.vue（新建）

展示连接历史数据的表格组件。

```vue
<template>
  <q-table
    :rows="history"
    :columns="columns"
    :loading="loading"
    row-key="id"
    flat
    dense
  >
    <!-- 时间列 -->
    <template #body-cell-snapshot_at="props">
      <q-td :props="props">
        {{ formatDateTime(props.row.snapshot_at) }}
      </q-td>
    </template>

    <!-- 状态列 -->
    <template #body-cell-online="props">
      <q-td :props="props">
        <q-icon
          :name="props.row.online ? 'check_circle' : 'cancel'"
          :color="props.row.online ? 'positive' : 'negative'"
          size="sm"
        />
      </q-td>
    </template>

    <!-- 延迟列 -->
    <template #body-cell-latency="props">
      <q-td :props="props">
        <q-badge
          :color="getLatencyColor(props.row.latency)"
          :label="`${props.row.latency?.toFixed(1) || '-'} ms`"
        />
      </q-td>
    </template>

    <!-- 流量列 -->
    <template #body-cell-rx_bytes="props">
      <q-td :props="props">
        {{ formatBytes(props.row.rx_bytes) }}
      </q-td>
    </template>

    <template #body-cell-tx_bytes="props">
      <q-td :props="props">
        {{ formatBytes(props.row.tx_bytes) }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { formatBytes, formatDateTime } from '@/utils/format'

interface Props {
  history: any[]
  loading: boolean
}

defineProps<Props>()

const columns = [
  {
    name: 'snapshot_at',
    label: '时间',
    field: 'snapshot_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'online',
    label: '状态',
    field: 'online',
    align: 'center'
  },
  {
    name: 'conn_type',
    label: '连接类型',
    field: 'conn_type',
    align: 'center'
  },
  {
    name: 'latency',
    label: '延迟',
    field: 'latency',
    align: 'center'
  },
  {
    name: 'rx_bytes',
    label: '接收',
    field: 'rx_bytes',
    align: 'right'
  },
  {
    name: 'tx_bytes',
    label: '发送',
    field: 'tx_bytes',
    align: 'right'
  }
]

const getLatencyColor = (latency: number) => {
  if (!latency) return 'grey'
  if (latency < 50) return 'positive'
  if (latency < 100) return 'info'
  if (latency < 200) return 'orange'
  return 'negative'
}
</script>
```

---

## 五、API 集成方案

### 5.1 Service 层扩展

在 `src/services/route/routesService.ts` 中添加新的 API 方法：

```typescript
export const routesService = {
  // 现有方法...
  
  /**
   * 获取节点的连接列表（支持分页）
   * @param nodeId 节点ID
   * @param params 查询参数
   */
  async getNodeConnections(
    nodeId: string | number,
    params?: {
      page?: number
      per_page?: number
      peer_node_id?: string | number
    }
  ): Promise<any> {
    // 这里可以使用现有的 /route/node/{nodeId} API
    // 或者创建新的专门用于列表的API
    const response = await api.get(`/route/node/${nodeId}`, { params })
    return response.data.data
  },

  /**
   * 获取节点间连接详情
   * @param nodeId 节点ID
   * @param peerId 对端节点ID
   */
  async getConnectionDetails(
    nodeId: string | number,
    peerId: string | number
  ): Promise<any> {
    // 可以从现有的节点路由列表中找到特定连接
    // 或调用新的详情API
    const response = await api.get(`/route/node/${nodeId}/peer/${peerId}`)
    return response.data.data
  },

  /**
   * 获取连接历史数据（使用 monitor API）
   * @param nodeId 节点ID
   * @param params 查询参数
   */
  async getConnectionHistory(
    nodeId: string | number,
    params: {
      peer_node_id?: string | number
      start_time?: string
      end_time?: string
      page?: number
      per_page?: number
    }
  ): Promise<any> {
    const response = await api.get('/monitor/history/connections', {
      params: {
        node_id: nodeId,
        ...params
      }
    })
    return response.data.data
  }
}
```

### 5.2 Composable 扩展

在 `src/composables/useRoutes.ts` 中添加：

```typescript
export function useRoutes() {
  // 现有状态...
  
  const nodeConnections = ref<any[]>([])
  const connectionsPagination = ref({
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1
  })
  const connectionDetails = ref<any>(null)
  const connectionHistory = ref<any[]>([])

  /**
   * 获取节点连接列表（支持分页）
   */
  const fetchNodeConnections = async (
    nodeId: string | number,
    page = 1,
    perPage = 20
  ) => {
    try {
      loading.value = true
      
      const response = await routesService.getNodeConnections(nodeId, {
        page,
        per_page: perPage
      })
      
      nodeConnections.value = response.connections || response
      
      // 如果API返回分页信息
      if (response.pagination) {
        connectionsPagination.value = response.pagination
      }
      
    } catch (error) {
      notify.error('获取节点连接失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取连接详情
   */
  const fetchConnectionDetails = async (
    nodeId: string | number,
    peerId: string | number
  ) => {
    try {
      loading.value = true
      
      const response = await routesService.getConnectionDetails(nodeId, peerId)
      connectionDetails.value = response
      
    } catch (error) {
      notify.error('获取连接详情失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取连接历史
   */
  const fetchConnectionHistory = async (
    nodeId: string | number,
    params: {
      peer_node_id?: string | number
      start_time?: string
      end_time?: string
      page?: number
      per_page?: number
    }
  ) => {
    try {
      loading.value = true
      
      const response = await routesService.getConnectionHistory(nodeId, params)
      connectionHistory.value = response.connections || []
      
    } catch (error) {
      notify.error('获取连接历史失败')
    } finally {
      loading.value = false
    }
  }

  return {
    // 现有返回...
    nodeConnections,
    connectionsPagination,
    connectionDetails,
    connectionHistory,
    fetchNodeConnections,
    fetchConnectionDetails,
    fetchConnectionHistory
  }
}
```

---

## 六、国际化配置

在 `src/i18n/zh-CN.ts` 中添加：

```typescript
routes: {
  activeRoutes: {
    // 现有...
    
    // 视图模式
    viewMode: {
      card: '卡片模式',
      list: '列表模式'
    },
    
    // 列表视图
    listView: {
      title: '节点连接列表',
      searchPlaceholder: '搜索节点名称、IP...',
      totalConnections: '共 {count} 条连接',
      columns: {
        nodeName: '节点名称',
        status: '状态',
        connectionType: '连接类型',
        latency: '延迟',
        traffic: '流量',
        lastSeen: '最后可见',
        actions: '操作'
      }
    },
    
    // 连接详情
    connectionDetails: {
      title: '连接详情',
      sourceNode: '本节点',
      peerNode: '对端节点',
      connectionStatus: '连接状态',
      connectionType: '连接类型',
      latency: '延迟',
      lastSeen: '最后可见',
      trafficStats: '流量统计',
      rxBytes: '接收流量',
      txBytes: '发送流量',
      totalBytes: '总流量',
      history: '连接历史',
      timeRange: {
        '1h': '1小时',
        '6h': '6小时',
        '24h': '24小时',
        '7d': '7天'
      }
    },
    
    // 连接类型
    connectionTypes: {
      direct_ipv4: '直连 IPv4',
      direct_ipv6: '直连 IPv6',
      relay: '中继',
      derp: 'DERP 中继'
    }
  }
}
```

---

## 七、实施步骤

### 阶段1: 路由和基础组件（优先级：高）
1. ✅ 更新路由配置（routes.ts）
2. ✅ 重构 ActiveRoutesPage.vue 支持多视图
3. ✅ 实现视图模式切换逻辑
4. ✅ 添加面包屑导航

### 阶段2: 列表视图（优先级：高）
1. ✅ 创建 RouteListView.vue 组件
2. ✅ 实现表格展示
3. ✅ 实现分页功能
4. ✅ 添加搜索过滤

### 阶段3: 连接详情页面（优先级：中）
1. ✅ 创建 ConnectionDetailsPage.vue
2. ✅ 实现连接信息展示
3. ✅ 集成 monitor API
4. ✅ 实现历史数据展示

### 阶段4: API 集成（优先级：中）
1. ✅ 扩展 routesService
2. ✅ 扩展 useRoutes composable
3. ✅ 实现数据加载逻辑
4. ✅ 添加错误处理

### 阶段5: 优化和测试（优先级：中）
1. ⬜ 添加加载状态
2. ⬜ 优化性能
3. ⬜ 编写单元测试
4. ⬜ 用户体验优化

---

## 八、技术要点

### 8.1 路由参数处理

```typescript
// 通过路由参数判断当前视图
const route = useRoute()
const nodeId = computed(() => route.params.nodeId as string)
const peerId = computed(() => route.params.peerId as string)

// 监听路由变化
watch(
  () => route.params,
  (newParams) => {
    if (newParams.nodeId) {
      loadNodeData(newParams.nodeId)
    }
    if (newParams.peerId) {
      loadConnectionDetails(newParams.nodeId, newParams.peerId)
    }
  },
  { immediate: true }
)
```

### 8.2 视图模式切换

```typescript
const handleViewModeChange = (mode: 'card' | 'list') => {
  const { nodeId } = route.params
  
  if (mode === 'list') {
    router.push(`/app/routes/active/${nodeId}/list`)
  } else {
    router.push(`/app/routes/active/${nodeId}`)
  }
}
```

### 8.3 分页处理

```typescript
const handlePageChange = async (page: number) => {
  await fetchNodeConnections(nodeId.value, page, perPage.value)
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

### 8.4 数据缓存策略

```typescript
// 使用 Map 缓存节点连接数据
const connectionsCache = new Map<string, any>()

const fetchNodeConnections = async (nodeId: string, page = 1) => {
  const cacheKey = `${nodeId}-${page}`
  
  // 检查缓存
  if (connectionsCache.has(cacheKey)) {
    const cached = connectionsCache.get(cacheKey)
    // 检查缓存时间（5分钟内有效）
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      nodeConnections.value = cached.data
      return
    }
  }
  
  // 加载数据
  const data = await routesService.getNodeConnections(nodeId, { page })
  
  // 缓存数据
  connectionsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
  
  nodeConnections.value = data
}
```

---

## 九、API 数据映射

### 9.1 使用现有 API

根据 `api-monitor.md`，我们可以利用以下 API：

#### Monitor History API
```
GET /api/v1/monitor/history/connections
```

**用途**: 
- 连接详情页的历史数据展示
- 支持时间范围过滤
- 支持对端节点过滤
- 支持分页

**数据结构**:
```typescript
interface ConnectionHistoryResponse {
  connections: Array<{
    id: number
    node_id: number
    peer_id: number
    online: boolean
    conn_type: string
    latency: number
    rx_bytes: number
    tx_bytes: number
    seen_at: string
    snapshot_at: string
  }>
  nodes_metadata: {
    [nodeId: string]: {
      node_id: number
      node_name: string
      zone_id: number
      node_status: number
      user_id: number
      user_name: string
    }
  }
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
  filter: {
    node_id: number
    start_time: string
    end_time: string
    peer_node_id: number | null
  }
}
```

### 9.2 数据转换示例

```typescript
// 将 Monitor API 数据转换为组件所需格式
function transformConnectionData(apiData: ConnectionHistoryResponse) {
  const { connections, nodes_metadata } = apiData
  
  return connections.map(conn => ({
    ...conn,
    // 附加节点元数据
    node_info: nodes_metadata[conn.node_id.toString()],
    peer_info: nodes_metadata[conn.peer_id.toString()],
    // 格式化显示
    latency_display: `${conn.latency?.toFixed(1) || 'N/A'} ms`,
    traffic_display: {
      rx: formatBytes(conn.rx_bytes),
      tx: formatBytes(conn.tx_bytes),
      total: formatBytes(conn.rx_bytes + conn.tx_bytes)
    }
  }))
}
```

---

## 十、总结

### 核心优势

1. **清晰的层级结构**: 三层级路由提供精确定位能力
2. **灵活的展示模式**: 卡片和列表两种模式满足不同需求
3. **完整的数据展示**: 从节点列表到连接详情的完整数据链路
4. **高效的API利用**: 充分利用现有的 Monitor API
5. **良好的用户体验**: 面包屑导航、分页、搜索等功能齐全

### 关键特性

- ✅ URL 路径精确定位（支持书签和分享）
- ✅ 列表模式支持分页（处理大量连接）
- ✅ 连接历史数据展示（利用 Monitor API）
- ✅ 节点元数据自动关联
- ✅ 响应式设计（支持移动端）
- ✅ 统一的组件风格

### 技术栈

- Vue 3 + TypeScript
- Vue Router（动态路由）
- Quasar Framework（UI组件）
- Composition API（代码组织）
- API Service 层（业务逻辑）

---

## 附录

### A. 相关文件清单

#### 新建文件
- `src/pages/route/ConnectionDetailsPage.vue` - 连接详情页面
- `src/components/route/RouteListView.vue` - 列表视图组件
- `src/components/route/ConnectionHistoryTable.vue` - 历史数据表格
- `src/components/route/NodeInfoCard.vue` - 节点信息卡片（可选）
- `src/components/route/StatItem.vue` - 统计项组件（可选）

#### 修改文件
- `src/router/routes.ts` - 添加新路由
- `src/pages/route/ActiveRoutesPage.vue` - 重构支持多视图
- `src/services/route/routesService.ts` - 扩展 API 方法
- `src/composables/useRoutes.ts` - 扩展状态管理
- `src/i18n/zh-CN.ts` - 添加国际化文本
- `src/i18n/en-US.ts` - 添加英文翻译

### B. API 端点清单

| API | 用途 | 分页 |
|-----|------|------|
| `GET /route/node/{nodeId}` | 获取节点路由列表 | ❌ |
| `GET /monitor/history/connections` | 获取连接历史 | ✅ |
| `GET /route/node/{nodeId}/peer/{peerId}` | 获取连接详情（待确认） | ❌ |

### C. 路由路径清单

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/app/routes/active` | routes-active | ActiveRoutesPage | 节点列表 |
| `/app/routes/active/:nodeId` | routes-active-node | ActiveRoutesPage | 节点路由（卡片） |
| `/app/routes/active/:nodeId/list` | routes-active-node-list | ActiveRoutesPage | 节点路由（列表） |
| `/app/routes/active/:nodeId/p-:peerId` | routes-active-connection | ConnectionDetailsPage | 连接详情 |
