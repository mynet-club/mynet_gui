<template>
  <q-page class="route-create-step3-page">
    <div class="q-pa-md">
      <!-- 页面标题和导航 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('routes.create.step3.title') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('routes.create.step3.subtitle') }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="arrow_back"
            :label="$t('common.back')"
            @click="goBack"
          />
        </div>
      </div>

      <!-- 步骤指示器 -->
      <RouteCreateProgress :step="3" />

      <!-- 选择总结 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step3.selectionSummary') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary">
                    <q-icon name="person" color="white" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ selectedFriend?.name }}</q-item-label>
                  <q-item-label caption>{{ $t('routes.create.step3.selectedFriend') }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="positive">
                    <q-icon name="device_hub" color="white" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ selectedFriendNode?.name }}</q-item-label>
                  <q-item-label caption>{{ $t('routes.create.step3.selectedFriendNode') }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 我的节点列表 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step3.selectMyNode') }}</div>
          
          <!-- 筛选和搜索 -->
          <div class="row q-gutter-md q-mb-md">
            <div class="col">
              <q-input
                v-model="searchQuery"
                :placeholder="$t('routes.create.step3.searchNodes')"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-auto">
              <q-select
                v-model="statusFilter"
                :options="statusOptions"
                emit-value map-options
                :placeholder="$t('routes.create.step3.filterByStatus')"
                outlined
                dense
                style="min-width: 150px"
              />
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center q-py-lg">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-md">{{ $t('routes.create.step3.loadingNodes') }}</div>
          </div>

          <!-- 无可用节点状态 -->
          <q-banner v-else-if="loadFailed" class="q-mb-md" rounded>
            {{ $t('routes.create.step3.fetchNodesError') }}
            <template #action><q-btn flat color="primary" :label="$t('workflow.retry')" @click="fetchMyNodes" /></template>
          </q-banner>
          <div v-else-if="filteredNodes.length === 0" class="text-center q-py-lg text-grey-6">
            <q-icon name="router" size="3em" class="q-mb-md" />
            <div>{{ $t(hasFilters ? 'workflow.noMatches' : 'routes.create.step3.noAvailableNodes') }}</div>
            <div v-if="!hasFilters" class="text-body2 q-mt-sm">
              {{ $t('routes.create.step3.createNodeHint') }}
            </div>
            <q-btn v-if="hasFilters" flat color="primary" :label="$t('workflow.clearFilters')" @click="clearFilters" />
            <q-btn v-else flat color="primary" :label="$t('nodes.createNode')" to="/app/nodes/create" />
          </div>

          <!-- 节点卡片列表 -->
          <div v-else class="row q-col-gutter-md">
            <div
              v-for="node in filteredNodes"
              :key="node.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                class="node-card cursor-pointer"
                :class="{ 
                  'selected': selectedMyNode?.id === node.id,
                  'disabled': !node.can_connect
                }"
                @click="selectMyNode(node)"
                role="radio" :tabindex="node.can_connect ? 0 : -1"
                :aria-label="node.name" :aria-checked="selectedMyNode?.id === node.id"
                :aria-disabled="!node.can_connect"
                @keydown.enter.prevent="selectMyNode(node)"
                @keydown.space.prevent="selectMyNode(node)"
                bordered
                flat
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-center">
                    <div class="col">
                      <div class="text-h6">{{ node.name }}</div>
                      <div class="text-body2 text-grey-6 q-mt-xs">
                        {{ node.location || $t('routes.create.step3.unknownLocation') }}
                      </div>
                    </div>
                    <div>
                      <q-avatar 
                        size="40px" 
                        :color="getNodeStatusColor(node)"
                      >
                        <q-icon name="router" color="white" />
                      </q-avatar>
                    </div>
                  </div>

                  <!-- 节点状态信息 -->
                  <div class="row q-mt-md">
                    <div class="col-6">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step3.nodeStatus') }}</div>
                      <q-chip 
                        :color="getNodeStatusColor(node)" 
                        text-color="white" 
                        size="sm"
                      >
                        {{ getNodeStatusText(node) }}
                      </q-chip>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step3.bandwidth') }}</div>
                      <div class="text-h6">{{ node.bandwidth || '--' }}</div>
                    </div>
                  </div>

                  <!-- 连接状态显示 -->
                  <div class="q-mt-md">
                    <div class="text-caption text-grey-6">{{ $t('routes.create.step3.connectionStatusLabel') }}</div>
                    <q-chip 
                      :color="node.connection_color || 'grey'" 
                      text-color="white" 
                      size="sm"
                      class="q-mt-xs"
                    >
                      {{ node.connection_message || $t('routes.create.step3.connectionStatus.unknown') }}
                    </q-chip>
                  </div>

                  <!-- 连接状态警告 -->
                  <div v-if="node.connection_status === 'connected'" class="q-mt-md">
                    <q-banner class="bg-positive text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="link" />
                      </template>
                      {{ $t('routes.create.step3.alreadyConnected') }}
                    </q-banner>
                  </div>

                  <div v-else-if="node.connection_status === 'pending_sent'" class="q-mt-md">
                    <q-banner class="bg-orange text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="schedule" />
                      </template>
                      {{ $t('routes.create.step3.requestSent') }}
                    </q-banner>
                  </div>

                  <div v-else-if="node.connection_status === 'pending_received'" class="q-mt-md">
                    <q-banner class="bg-blue text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="inbox" />
                      </template>
                      {{ $t('routes.create.step3.requestReceived') }}
                    </q-banner>
                  </div>

                  <div v-else-if="node.connection_status === 'rejected'" class="q-mt-md">
                    <q-banner class="bg-negative text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="block" />
                      </template>
                      {{ $t('routes.create.step3.requestRejected') }}
                    </q-banner>
                  </div>

                  <div v-else-if="!node.can_connect && node.connection_status === 'none'" class="q-mt-md">
                    <q-banner class="bg-warning text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="warning" />
                      </template>
                      <!-- 根据节点状态显示正确的错误信息 -->
                      <span v-if="node.status === -1">{{ $t('routes.create.step3.nodeUnconfigured') }}</span>
                      <span v-else-if="node.status === 0">{{ $t('routes.create.step3.nodeDisabled') }}</span>
                      <span v-else-if="node.status === 99">{{ $t('routes.create.step3.nodeMaintenance') }}</span>
                      <span v-else-if="node.current_connections >= node.max_connections && node.max_connections > 0">
                        {{ $t('routes.create.step3.connectionsFull') }}
                      </span>
                      <span v-else>{{ $t('routes.create.step3.nodeNotAvailable') }}</span>
                    </q-banner>
                  </div>

                  <!-- 选中指示器 -->
                  <q-icon
                    v-if="selectedMyNode?.id === node.id"
                    name="check_circle"
                    color="positive"
                    size="1.5em"
                    class="absolute-top-right q-ma-sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            :label="$t('common.previous')"
            @click="goBack"
          />
          <q-btn
            color="primary"
            :label="$t('routes.create.step3.nextStep')"
            :disable="loading || loadFailed || !selectedMyNode || !selectedMyNode.can_connect || (selectedMyNode.connection_status !== 'none' && selectedMyNode.connection_status !== 'rejected')"
            @click="goToNextStep"
            icon-right="arrow_forward"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import RouteCreateProgress from '../../../components/route/RouteCreateProgress.vue'
import { createRouteDraft } from '../../../utils/routeCreateDraft'

import { ref, computed, onMounted } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useNodes } from '../../../composables/useNodes'
import { useRoutes } from '../../../composables/useRoutes'
import { useNotify } from '../../../composables/useNotify'
import { NODE_STATUS } from '../../../types/node'
import { NodeStatusManager } from '../../../utils/nodeStatus'
import type { Friend } from '../../../types'

const { t } = useI18n()
const router = useRouter()
const draft = createRouteDraft(sessionStorage)
const notify = useNotify()

const { nodes, loadNodes } = useNodes()
const { 
  fetchOverview, 
  activeRoutes, 
  fetchPendingConnections,
  incomingConnections,
  outgoingConnections,
  handleConnectionTypeChange
} = useRoutes()

// 页面状态
const loading = ref(false)
const loadFailed = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const hasFilters = computed(() => !!searchQuery.value || statusFilter.value !== 'all')
const clearFilters = () => { searchQuery.value = ''; statusFilter.value = 'all' }
const selectedFriend = ref<Friend | null>(null)
const selectedFriendNode = ref<any | null>(null)
const selectedMyNode = ref<any | null>(null)
const myNodes = ref<any[]>([])
const routeConnections = ref<any[]>([]) // 存储所有连接数据
const routeRequests = ref<any[]>([]) // 存储所有请求数据

// 筛选选项
const statusOptions = [
  { label: t('routes.create.step3.allStatus'), value: 'all' },
  { label: t('routes.create.step3.onlineOnly'), value: 'online' },
  { label: t('routes.create.step3.availableOnly'), value: 'available' },
  { label: t('routes.create.step3.connectedOnly'), value: 'connected' },
  { label: t('routes.create.step3.pendingOnly'), value: 'pending' }
]

// 计算属性
const filteredNodes = computed(() => {
  let nodes = myNodes.value

  // 状态筛选
  if (statusFilter.value === 'online') {
    nodes = nodes.filter(node => {
      const status = node.normalized_status ?? NodeStatusManager.normalizeStatus(node.node_status, node.status)
      return typeof status === 'number' 
        ? (status === NODE_STATUS.ENABLED || status === NODE_STATUS.ONLINE)
        : NodeStatusManager.isOnline(status)
    })
  } else if (statusFilter.value === 'available') {
    nodes = nodes.filter(node => node.can_connect && node.connection_status === 'none')
  } else if (statusFilter.value === 'connected') {
    nodes = nodes.filter(node => node.connection_status === 'connected')
  } else if (statusFilter.value === 'pending') {
    nodes = nodes.filter(node => node.connection_status === 'pending_sent' || node.connection_status === 'pending_received')
  }

  // 搜索筛选
  if (searchQuery.value) {
    nodes = nodes.filter(node =>
      node.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (node.location && node.location.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }

  return nodes
})

// 方法
const selectMyNode = (node: any) => {
  if (!node.can_connect) {
    if (node.connection_status === 'connected') {
      notify.warning(t('routes.create.step3.nodeAlreadyConnected'))
    } else if (node.connection_status === 'pending_sent') {
      notify.warning(t('routes.create.step3.requestAlreadySent'))
    } else if (node.connection_status === 'pending_received') {
      notify.warning(t('routes.create.step3.requestAlreadyReceived'))
    } else {
      notify.warning(t('routes.create.step3.nodeCannotConnect'))
    }
    return
  }
  selectedMyNode.value = node
  draft.selectMyNode(node)
}

const getNodeStatusColor = (node: any) => {
  if (!node) return 'grey'
  
  if (node.connection_status === 'connected') return 'positive'
  if (node.connection_status === 'pending_sent') return 'orange'
  if (node.connection_status === 'pending_received') return 'blue'
  if (node.connection_status === 'rejected') return 'negative'
  if (!node.can_connect) return 'grey'
  
  // 使用统一状态管理器获取颜色
  const status = node.normalized_status ?? NodeStatusManager.normalizeStatus(node.node_status, node.status)
  return NodeStatusManager.getStatusColor(status)
}

const getNodeStatusText = (node: any) => {
  if (!node) return NodeStatusManager.getStatusText(NODE_STATUS.UNCONFIGURED)
  
  // 使用统一状态管理器获取状态文本
  const status = node.normalized_status ?? NodeStatusManager.normalizeStatus(node.node_status, node.status)
  return NodeStatusManager.getStatusText(status)
}

const goBack = () => {
  router.push('/app/routes/create/prev_2')
}

const goToNextStep = () => {
  if (!selectedMyNode.value || !selectedMyNode.value.can_connect) {
    notify.error(t('routes.create.step3.pleaseSelectNode'))
    return
  }
  
  if (selectedMyNode.value.connection_status !== 'none' && selectedMyNode.value.connection_status !== 'rejected') {
    notify.error(t('routes.create.step3.cannotProceedWithConnection'))
    return
  }
  
  // 将选中的我的节点存储到会话存储中
  draft.selectMyNode(selectedMyNode.value)
  
  router.push('/app/routes/create/prev_4')
}

// 获取我的节点列表
const fetchMyNodes = async () => {
  if (loading.value) return
  loadFailed.value = false
  selectedMyNode.value = null
  try {
    loading.value = true
    
    // 获取节点数据
    if (!await loadNodes()) throw new Error('Node list unavailable')
    
    // 获取路由连接和请求数据
    if (!await fetchRouteData()) throw new Error('Connection list unavailable')
    
    // 为每个节点添加连接能力判断和连接状态检查
    myNodes.value = nodes.value.map((node: any) => {
      // 检查与选中的好友节点的连接状态
      const connectionStatus = checkConnectionStatusLocal(node.id, selectedFriendNode.value?.id)
      
      // 详细的连接能力判断
      // 检查节点连接数是否已满
      const currentConnections = node.current_connections || 0
      const maxConnections = node.max_connections || 0
      const hasAvailableConnections = maxConnections === 0 || currentConnections < maxConnections
      
      // 使用统一的状态管理器来处理状态判断
      const normalizedStatus = NodeStatusManager.normalizeStatus(node.node_status, node.status)
      
      // 只有启用(1)或在线(2)状态的节点可以用于路由连接
      const isOnline = typeof normalizedStatus === 'number' 
        ? (normalizedStatus === NODE_STATUS.ENABLED || normalizedStatus === NODE_STATUS.ONLINE)
        : NodeStatusManager.isOnline(normalizedStatus)
      
      const canConnectByStatus = connectionStatus.can_connect
      
      // 优先使用后端返回的 can_connect 判断
      const backendCanConnect = node.can_connect !== undefined ? node.can_connect : true
      
      debug.log(`节点 ${node.name} (${node.id}):`, {
        node_data: node,
        current_connections: currentConnections,
        max_connections: maxConnections,
        hasAvailableConnections,
        backendCanConnect,
        raw_status: node.status,
        raw_node_status: node.node_status,
        normalizedStatus,
        isOnline,
        connectionStatus: connectionStatus.status,
        canConnectByStatus,
        friendNodeId: selectedFriendNode.value?.id,
        final_can_connect: backendCanConnect && hasAvailableConnections && isOnline && canConnectByStatus
      })
      
      return {
        ...node,
        // 添加默认值以兼容模板显示
        current_connections: currentConnections,
        max_connections: maxConnections,
        // 使用统一状态管理器标准化状态
        normalized_status: normalizedStatus,
        // 综合判断：后端判断 && 连接数未满 && 节点在线 && 无连接冲突
        can_connect: backendCanConnect && hasAvailableConnections && isOnline && canConnectByStatus,
        connection_status: connectionStatus.status,
        connection_message: connectionStatus.message,
        connection_color: connectionStatus.color
      }
    })
    const saved = draft.read().myNode
    selectedMyNode.value = myNodes.value.find(node => String(node.id) === String(saved?.id) && node.can_connect) ?? null
    draft.selectMyNode(selectedMyNode.value)
  } catch (error) {
    loadFailed.value = true
    debug.error('获取我的节点失败:', error)
    notify.error(t('routes.create.step3.fetchNodesError'))
  } finally {
    loading.value = false
  }
}

// 获取路由数据（连接和请求）
const fetchRouteData = async () => {
  try {
    // 获取概览数据，这应该包含所有连接和请求信息
    if (!await fetchOverview()) return false
    
    // 从概览数据中提取连接和请求信息
    // 根据后端实际返回的数据结构调整
    routeConnections.value = activeRoutes.value || []
    
    // 合并incoming和outgoing请求
    const allRequests = []
    
    // incomingConnections 实际上就是 pendingConnections
    if (incomingConnections.value && Array.isArray(incomingConnections.value)) {
      allRequests.push(...incomingConnections.value)
    }
    
    // outgoingConnections 是单独的数组
    if (outgoingConnections.value && Array.isArray(outgoingConnections.value)) {
      allRequests.push(...outgoingConnections.value)
    }
    
    routeRequests.value = allRequests
    
    debug.log('路由数据详情:', {
      activeRoutes: routeConnections.value,
      pendingRequests: routeRequests.value,
      incomingConnections: incomingConnections.value,
      outgoingConnections: outgoingConnections.value,
      activeRoutesCount: routeConnections.value.length,
      pendingRequestsCount: routeRequests.value.length
    })
    return true
  } catch (error) {
    debug.error('获取路由数据失败:', error)
    return false
  }
}

// 本地检查节点连接状态
const checkConnectionStatusLocal = (myNodeId: string | number, friendNodeId: string | number) => {
  debug.log(`检查连接状态: 我的节点=${myNodeId}, 好友节点=${friendNodeId}`)
  debug.log('当前连接数据:', routeConnections.value)
  debug.log('当前请求数据:', routeRequests.value)
  
  if (!friendNodeId) {
    return {
      status: 'unknown',
      message: t('routes.create.step3.noFriendNodeSelected'),
      color: 'grey',
      can_connect: false
    }
  }

  // 转换为字符串进行比较，确保类型一致
  const myNodeIdStr = String(myNodeId)
  const friendNodeIdStr = String(friendNodeId)

  // 检查是否已经建立连接
  const existingConnection = routeConnections.value.find((conn: any) => {
    const sourceId = String(conn.source_node_id || conn.source_id || conn.from_node_id)
    const targetId = String(conn.target_node_id || conn.target_id || conn.to_node_id)
    
    return (sourceId === myNodeIdStr && targetId === friendNodeIdStr) ||
           (sourceId === friendNodeIdStr && targetId === myNodeIdStr)
  })
  
  if (existingConnection) {
    debug.log('找到现有连接:', existingConnection)
    return {
      status: 'connected',
      message: t('routes.create.step3.connectionStatus.connected'),
      color: 'positive',
      can_connect: false
    }
  }

  // 检查是否有待处理的请求
  const pendingRequest = routeRequests.value.find((req: any) => {
    const sourceId = String(req.source_node_id || req.source_id || req.from_node_id || req.sender_node_id)
    const targetId = String(req.target_node_id || req.target_id || req.to_node_id || req.receiver_node_id)
    
    return (sourceId === myNodeIdStr && targetId === friendNodeIdStr) ||
           (sourceId === friendNodeIdStr && targetId === myNodeIdStr)
  })

  if (pendingRequest) {
    debug.log('找到待处理请求:', pendingRequest)
    const requestSourceId = String(pendingRequest.source_node_id || pendingRequest.source_id || pendingRequest.from_node_id || pendingRequest.sender_node_id)
    
    if (requestSourceId === myNodeIdStr) {
      // 我发出的请求
      return {
        status: 'pending_sent',
        message: t('routes.create.step3.connectionStatus.pendingSent'),
        color: 'orange',
        can_connect: false
      }
    } else {
      // 我收到的请求
      return {
        status: 'pending_received',
        message: t('routes.create.step3.connectionStatus.pendingReceived'),
        color: 'blue',
        can_connect: false
      }
    }
  }

  // 检查是否有被拒绝的记录（如果后端提供此数据）
  // TODO: 需要后端提供被拒绝的请求历史

  debug.log('没有找到连接或请求冲突，可以连接')
  // 无连接关系
  return {
    status: 'none',
    message: t('routes.create.step3.connectionStatus.none'),
    color: 'positive',
    can_connect: true
  }
}

onMounted(async () => {
  const saved = draft.read()
  if (saved.requiredStep < 3) { router.replace(`/app/routes/create/prev_${saved.requiredStep}`); return }
  selectedFriend.value = saved.friend as Friend
  selectedFriendNode.value = saved.friendNode
  await fetchMyNodes()
})
</script>

<style lang="scss" scoped>
.route-create-step3-page {
  .node-card {
    transition: all 0.2s ease;
    
    &:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.selected {
      border-color: var(--q-positive);
      box-shadow: 0 0 0 2px rgba(var(--q-positive), 0.2);
    }
    
    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
