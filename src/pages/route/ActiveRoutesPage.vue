<template>
  <PageLayout
    :title="pageTitle"
    :subtitle="pageSubtitle"
    icon="route"
  >
    <!-- 面包屑导航 -->
    <template #breadcrumbs>
      <q-breadcrumbs v-if="currentView !== 'node-list'">
        <q-breadcrumbs-el label="活跃路由" to="/app/routes/active" icon="route" />
        <q-breadcrumbs-el 
          v-if="selectedNodeInfo"
          :label="selectedNodeInfo.node_name"
        />
      </q-breadcrumbs>
    </template>

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
            { label: '列表', value: 'list', icon: 'list' },
            { label: '星图', value: 'topology', icon: 'hub' }
          ]"
          @update:model-value="handleViewModeChange"
        />

        <q-btn-group v-if="currentView === 'node-list'">
          <q-btn
            color="positive"
            icon="add"
            :label="$t('routes.actions.createRoute')"
            @click="handleCreateRoute"
          />
          <q-btn
            color="primary"
            icon="sync"
            :label="$t('common.refresh')"
            @click="handleRefresh"
            :loading="loading || nodesLoading"
          />
        </q-btn-group>
        
        <q-btn
          v-else
          color="primary"
          icon="sync"
          label="刷新"
          @click="handleRefresh"
          :loading="routesLoading"
        />
        
        <!-- 显示所有节点选项（仅在节点详情视图显示）-->
        <q-checkbox
          v-if="currentView !== 'node-list'"
          v-model="showAllPeers"
          label="显示所有路由节点"
          color="primary"
          dense
          @update:model-value="handleRefresh"
        />
      </div>
    </template>

    <!-- 视图1: 节点列表 -->
    <NodeListView
      v-if="currentView === 'node-list'"
      :nodes="nodes as any[]"
      :loading="nodesLoading"
      :active-routes="activeRoutes"
      @node-select="handleNodeSelect"
    />

    <!-- 视图2: 路由卡片视图 -->
    <NodeRouteCardView
      v-else-if="currentView === 'routes-card'"
      :connections="nodeRoutesList"
      :loading="routesLoading"
      @connection-click="handleConnectionClick"
    />

    <!-- 视图3: 路由列表视图 -->
    <RouteListView
      v-else-if="currentView === 'routes-list'"
      :node-id="currentNodeId"
      :connections="nodeRoutesList"
      :loading="routesLoading"
      @connection-click="handleConnectionClick"
    />

    <!-- 视图4: 网络拓扑图 -->
    <NodeTopologyView
      v-else-if="currentView === 'routes-topology'"
      :node-id="currentNodeId"
      :connections="nodeRoutesList"
      :loading="routesLoading"
      :center-node-name="selectedNodeInfo?.node_name"
      @connection-click="handleConnectionClick"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import debug from "../../utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useNodes } from '../../composables/useNodes'
import { useNotify } from '../../composables/useNotify'
import { processConnectionsData } from '../../composables/useConnectionsData'
import PageLayout from '../../components/layout/PageLayout.vue'
import NodeListView from '../../components/route/NodeListView.vue'
import NodeRouteCardView from '../../components/route/NodeRouteCardView.vue'
import RouteListView from '../../components/route/RouteListView.vue'
import NodeTopologyView from '../../components/route/NodeTopologyView.vue'
import { api } from '../../services/api'
import type { Node } from '../../types'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const notify = useNotify()

const {
  loading,
  activeRoutes,
  fetchActiveRoutes
} = useRoutes()

const {
  loading: nodesLoading,
  nodes,
  loadNodes
} = useNodes()

// 响应式状态
const selectedNodeInfo = ref<any>(null)
const nodeRoutesList = ref<any[]>([])
const routesLoading = ref(false)
const displayMode = ref<'card' | 'list' | 'topology'>('card')
const showAllPeers = ref(false) // 是否显示所有节点（包括 down 的）

// 路由参数
const currentNodeId = computed(() => route.params.nodeId as string)

// 当前视图判断
const currentView = computed(() => {
  const { nodeId } = route.params
  const { name } = route
  
  if (!nodeId) {
    return 'node-list' // 节点列表视图
  } else if (name === 'routes-active-node-list') {
    return 'routes-list' // 路由列表视图（表格模式）
  } else if (name === 'routes-active-node-topology') {
    return 'routes-topology' // 网络拓扑视图（星图模式）
  } else {
    return 'routes-card' // 路由卡片视图
  }
})

// 页面标题
const pageTitle = computed(() => {
  if (currentView.value === 'node-list') {
    return t('navigation.activeRoutes')
  } else if (selectedNodeInfo.value) {
    return `${selectedNodeInfo.value.node_name} - 路由列表`
  }
  return '路由详情'
})

const pageSubtitle = computed(() => {
  if (currentView.value === 'node-list') {
    return t('routes.activeRoutes.subtitle')
  }
  return '查看节点的活跃连接'
})

// 路由数据处理方法
// 处理连接数据：按用户分组
const processConnectionsByUser = (connections: any[]) => {
  const userGroups = new Map<string, any[]>()
  
  connections.forEach(conn => {
    const userName = conn.user_name || conn.peer_user_name || conn.user_email || '未知用户'
    if (!userGroups.has(userName)) {
      userGroups.set(userName, [])
    }
    userGroups.get(userName)!.push(conn)
  })
  
  // 转换为数组格式，添加分组信息
  const result: any[] = []
  userGroups.forEach((conns, userName) => {
    conns.forEach((conn, index) => {
      result.push({
        ...conn,
        userEmail: userName,
        _groupInfo: {
          userEmail: userName,
          isFirstInGroup: index === 0,
          groupSize: conns.length
        }
      })
    })
  })
  
  return result
}

// 处理旧格式节点数据：按用户邮箱分组
const processNodesByUserEmail = (nodes: any[]) => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return []
  }

  // 按 user_email 分组
  const groupedByUser = nodes.reduce((groups: Record<string, any[]>, node: any) => {
    const userKey = node.user_email || 'unknown'
    if (!groups[userKey]) {
      groups[userKey] = []
    }
    groups[userKey].push(node)
    return groups
  }, {})

  // 处理每个分组，为每个节点添加分组信息
  const processedNodes: any[] = []
  
  Object.entries(groupedByUser).forEach(([userEmail, userNodes]) => {
    userNodes.forEach((node, index) => {
      processedNodes.push({
        ...node,
        _groupInfo: {
          userEmail,
          isFirstInGroup: index === 0,
          groupSize: userNodes.length
        }
      })
    })
  })
  
  return processedNodes
}

// 事件处理
const handleNodeSelect = async (node: Node) => {
  const nodeId = (node as any).node_id || (node as any).id
  // 通过路由跳转，而不是直接设置状态
  router.push(`/app/routes/active/${nodeId}`)
}

const fetchNodeConnections = async (nodeId: string | number) => {
  try {
    routesLoading.value = true
    debug.log('开始获取节点连接数据, nodeId:', nodeId)
    
    if (!nodeId) {
      debug.warn('nodeId为空')
      nodeRoutesList.value = []
      return
    }
    
    // 获取每个对端节点的最后一条连接数据
    // 使用 last=1 参数获取每个节点的最新快照
    const params: any = {
      node_id: nodeId,
      last: 1
      // 不传peer_node_id，获取该节点与所有对端的连接记录
    }
    
    // 如果勾选了显示所有节点，添加 allpeers=1 参数
    if (showAllPeers.value) {
      params.allpeers = 1
    }
    
    const monitorResponse = await api.get('/monitor/history/connections', {
      params
    })
    
    if (!monitorResponse.data.success) {
      throw new Error(monitorResponse.data.message || '获取连接数据失败')
    }
    
    const connections = monitorResponse.data.data.connections || []
    const nodesMetadata = monitorResponse.data.data.nodes_metadata || {}
    
    debug.log('连接数据:', connections)
    debug.log('节点元数据:', nodesMetadata)
    
    // 使用统一的数据处理函数
    const processedConnections = processConnectionsData(connections, nodesMetadata)
    
    debug.log('处理后的连接数据:', processedConnections)
    
    // 统计连接状态
    const totalConnections = processedConnections.length
    const activeConnections = processedConnections.filter((c: any) => c.online).length
    const inactiveConnections = totalConnections - activeConnections
    
    debug.log('连接状态统计:', {
      总数: totalConnections,
      活跃: activeConnections,
      不活跃: inactiveConnections
    })
    
    // 按用户分组
    nodeRoutesList.value = processConnectionsByUser(processedConnections)
    
    debug.log('最终处理结果:', nodeRoutesList.value)
    
  } catch (error) {
    debug.error('获取节点路由数据失败:', error)
    nodeRoutesList.value = []
    notify.error('获取节点路由数据失败')
  } finally {
    routesLoading.value = false
  }
}

const handleBack = () => {
  router.push('/app/routes/active')
}

const handleViewModeChange = (mode: 'card' | 'list' | 'topology') => {
  const nodeId = currentNodeId.value
  
  if (mode === 'list') {
    router.push(`/app/routes/active/${nodeId}/list`)
  } else if (mode === 'topology') {
    router.push(`/app/routes/active/${nodeId}/topology`)
  } else {
    router.push(`/app/routes/active/${nodeId}`)
  }
}

const handleConnectionClick = (connection: any) => {
  const peerId = connection.peer_id || connection.node_id || connection.id
  if (peerId) {
    router.push(`/app/routes/active/${currentNodeId.value}/p-${peerId}`)
  }
}

const handleRefresh = async () => {
  if (currentNodeId.value) {
    await fetchNodeConnections(currentNodeId.value)
  } else {
    await Promise.all([
      loadNodes(),
      fetchActiveRoutes()
    ])
  }
}

const handleCreateRoute = () => {
  router.push('/app/routes/create/prev_1')
}

// 监听路由参数变化
watch(
  () => route.params.nodeId,
  async (newNodeId) => {
    if (newNodeId) {
      // 获取节点连接监控数据
      const nodeIdValue = Array.isArray(newNodeId) ? newNodeId[0] : newNodeId
      if (nodeIdValue) {
        await fetchNodeConnections(nodeIdValue)
      }
      // 获取节点信息
      const node = nodes.value.find((n: any) => 
        String(n.node_id || n.id) === String(newNodeId)
      )
      if (node) {
        selectedNodeInfo.value = node
      }
    } else {
      selectedNodeInfo.value = null
      nodeRoutesList.value = []
    }
  },
  { immediate: true }
)

// 监听路由名称变化，更新显示模式
watch(
  () => route.name,
  (newName) => {
    if (newName === 'routes-active-node-list') {
      displayMode.value = 'list'
    } else if (newName === 'routes-active-node-topology') {
      displayMode.value = 'topology'
    } else if (newName === 'routes-active-node') {
      displayMode.value = 'card'
    }
  },
  { immediate: true }
)

// 初始化
onMounted(async () => {
  await Promise.all([
    loadNodes(),
    fetchActiveRoutes()
  ])
})
</script>

<style lang="scss" scoped>
// 样式已移至各个子组件
</style>
