<template>
  <PageLayout
    :title="$t('navigation.activeRoutes')"
    :subtitle="$t('routes.activeRoutes.subtitle')"
    icon="route"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn-group>
          <q-btn
            color="positive"
            icon="add"
            :label="$t('routes.actions.createRoute')"
            @click="handleCreateRoute"
          />
          <q-btn
            color="primary"
            icon="sync"
            :label="$t('routes.actions.refreshRoutes')"
            @click="handleRefreshRoutes"
            :loading="loading"
          />
        </q-btn-group>
      </div>
    </template>

    <!-- 节点选择视图 -->
    <div v-if="!selectedNode" class="nodes-view">
      <div class="text-h6 q-mb-md">{{ $t('routes.nodeBased.selectNode') }}</div>
      <div class="text-body2 text-grey-6 q-mb-lg">
        {{ $t('routes.nodeBased.selectNodeDescription') }}
      </div>
      
      <!-- 节点状态提示 -->
      <div v-if="!hasAvailableNodes && nodeStatusStats.total > 0" class="q-mb-lg">
        <q-banner class="bg-orange-1 text-orange-8 rounded-borders">
          <template #avatar>
            <q-icon name="info" color="orange" />
          </template>
          <div class="text-body2">
            <strong>暂无可用节点用于创建路由</strong>
          </div>
          <div class="text-body2 q-mt-sm">
            您有 {{ nodeStatusStats.total }} 个节点，但需要先到
            <q-btn 
              flat 
              dense 
              color="primary" 
              label="节点管理" 
              icon="settings"
              @click="$router.push('/app/nodes')"
              class="q-mx-xs"
            />
            页面启用节点后才能创建路由。
          </div>
          <div class="text-caption text-grey-7 q-mt-sm">
            <q-icon name="help_outline" size="xs" class="q-mr-xs" />
            只有"已启用"或"在线"状态的节点才能用于路由连接
            <span v-if="nodeStatusStats.unconfigured > 0">
              （{{ nodeStatusStats.unconfigured }} 个未配置）
            </span>
            <span v-if="nodeStatusStats.disabled > 0">
              （{{ nodeStatusStats.disabled }} 个已禁用）
            </span>
          </div>
        </q-banner>
      </div>

      <!-- 节点状态统计 -->
      <div v-else-if="hasAvailableNodes && nodeStatusStats.total > nodeStatusStats.available" class="q-mb-md">
        <q-banner class="bg-blue-1 text-blue-8 rounded-borders">
          <template #avatar>
            <q-icon name="info" color="blue" />
          </template>
          <div class="text-body2">
            显示 {{ nodeStatusStats.available }} 个可用节点（共 {{ nodeStatusStats.total }} 个）
          </div>
        </q-banner>
      </div>

      <!-- 节点列表 -->
      <ResponsiveCardGrid
        :items="filteredNodes"
        :loading="nodesLoading"
        :loading-count="8"
        variant="standard"
        spacing="normal"
        empty-icon="router"
        :empty-title="$t('routes.nodeBased.noAvailableNodes')"
        :empty-description="$t('routes.nodeBased.noAvailableNodesDescription')"
        :clickable="true"
        @card-click="handleNodeSelect"
      >
        <template #default="{ item: node, index }">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon 
                name="router"
                :color="getNodeStatusColor(node.status)"
                size="md"
                class="q-mr-sm"
              />
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ node.node_name }}</div>
                <div class="text-body2 text-grey-6">{{ node.description || node.node_remarks || $t('common.noDescription') }}</div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getNodeStatusColor(node.status)"
                  text-color="white"
                  :label="getNodeStatusText(node.status)"
                  size="sm"
                />
              </div>
            </div>

            <!-- 节点信息 -->
            <div class="row q-gutter-md text-center">
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ node.vpn_type?.toUpperCase() || 'N/A' }}</div>
                <div class="text-caption text-grey-6">VPN类型</div>
              </div>
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ getNodeRouteCount(node) }}</div>
                <div class="text-caption text-grey-6">活跃路由</div>
              </div>
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ node.endpoint || 'N/A' }}</div>
                <div class="text-caption text-grey-6">节点端点</div>
              </div>
            </div>
          </q-card-section>
        </template>
      </ResponsiveCardGrid>
    </div>

    <!-- 路由详情视图 -->
    <div v-else class="routes-view">
      <!-- 节点信息头部 -->
      <q-card class="node-info-header q-mb-lg">
        <q-card-section>
          <div class="row items-center">
            <q-btn
              flat
              round
              dense
              icon="arrow_back"
              color="primary"
              @click="handleBackToNodes"
              class="q-mr-md"
            />
            <q-icon name="router" color="primary" size="lg" class="q-mr-md" />
            <div class="col">
              <div class="text-h6 text-primary">{{ selectedNode.node_name }}</div>
              <div class="text-body2 text-grey-6">{{ $t('common.noDescription') }}</div>
            </div>
            <div class="col-auto">
              <q-btn
                color="primary"
                icon="sync"
                :label="$t('common.refresh')"
                @click="handleRefreshRoutes"
                :loading="routesLoading"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 路由列表 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.nodeBased.nodesList') }}</div>
          
          <ResponsiveCardGrid
            :items="nodeRoutesList"
            :loading="routesLoading"
            variant="standard"
            spacing="normal"
            empty-icon="router"
            :empty-title="$t('routes.nodeBased.noNodes')"
            :empty-description="$t('routes.nodeBased.noNodesForNode')"
            :clickable="false"
          >
            <template #default="{ item: node }">
              <!-- 用户分组标题（每组第一个节点显示） -->
              <div v-if="(node as any)._groupInfo?.isFirstInGroup" class="user-group-header q-mb-sm">
                <div class="row items-center q-py-sm q-px-md bg-grey-1 rounded-borders">
                  <q-icon name="person" color="primary" size="sm" class="q-mr-sm" />
                  <div class="text-subtitle2 text-weight-medium text-primary">
                    {{ getFriendName(node) }}
                  </div>
                  <q-space />
                  <div class="text-caption text-grey-6">
                    {{ (node as any)._groupInfo.groupSize }} 个节点
                  </div>
                </div>
              </div>
              
              <q-card-section>
                <!-- 节点头部信息 -->
                <div class="row items-center q-mb-md">
                  <div class="col">
                    <div class="row items-center">
                      <q-icon 
                        name="router"
                        color="primary"
                        size="md"
                        class="q-mr-sm"
                      />
                      <div>
                        <div class="text-subtitle1 text-weight-medium text-primary">
                          {{ getTargetNodeName(node) }}
                        </div>
                        <div class="text-body2 text-grey-7">
                          {{ getTargetNodeIP(node) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-chip
                      :color="getNodeStatusColor(node)"
                      :text-color="node.source === 'self' ? 'white' : 'dark'"
                      :label="getNodeStatusLabel(node)"
                      size="sm"
                    />
                  </div>
                </div>

                <!-- IP地址列表 -->
                <div v-if="node.ip_addresses && node.ip_addresses.length > 0" class="q-mb-md">
                  <div class="text-subtitle2 q-mb-xs">可达地址</div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="ip in node.ip_addresses"
                      :key="`${ip.ip_address}-${ip.route_type}`"
                      :color="getIpTypeColor(ip.route_type)"
                      text-color="white"
                      size="sm"
                      dense
                    >
                      <q-icon 
                        :name="ip.route_type === 'wan_ip' ? 'public' : ip.route_type === 'lan_ip' ? 'home' : 'router'"
                        size="xs" 
                        class="q-mr-xs" 
                      />
                      {{ ip.ip_address }}
                      <q-tooltip>{{ getIpTypeLabel(ip.route_type) }}</q-tooltip>
                    </q-chip>
                  </div>
                </div>

                <!-- 无可用地址提示 -->
                <div v-else class="q-mb-md">
                  <q-banner class="bg-orange-1 text-orange-8 rounded-borders" dense>
                    <template #avatar>
                      <q-icon name="warning" size="sm" />
                    </template>
                    <div class="text-body2">此节点暂无可达地址</div>
                  </q-banner>
                </div>
              </q-card-section>
            </template>
          </ResponsiveCardGrid>
        </q-card-section>
      </q-card>
    </div>

    <!-- 路由详情对话框 -->
    <q-dialog v-model="routeDetailsDialog.show" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('routes.dialogs.routeDetails.title') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <RouteDetailsDialog
            v-if="routeDetailsDialog.route"
            :route="routeDetailsDialog.route"
            @close="routeDetailsDialog.show = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import debug from "../../utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useNodes } from '../../composables/useNodes'
import { useNotify } from '../../composables/useNotify'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import RouteDetailsDialog from '../../components/route/RouteDetailsDialog.vue'
import { api } from '../../services/api'
import type { Node, Route } from '../../types'
import type { NodeStatus } from '../../types/node'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()

const {
  loading,
  activeRoutes,
  fetchActiveRoutes,
  disconnectRoute
} = useRoutes()

const {
  loading: nodesLoading,
  nodes,
  loadNodes
} = useNodes()

// 响应式状态
const selectedNode = ref<Node | null>(null)
const nodeRoutesList = ref<any[]>([])
const routesLoading = ref(false)

// 对话框状态
const routeDetailsDialog = ref({
  show: false,
  route: null as any
})

// 计算属性
const filteredNodes = computed(() => {
  return nodes.value.filter(node => {
    const nodeStatus = node.status || node.node_status
    return nodeStatus === 'online' || nodeStatus === 'enabled' || nodeStatus === 'active'
  })
})

const hasAvailableNodes = computed(() => filteredNodes.value.length > 0)

const nodeStatusStats = computed(() => {
  const total = nodes.value.length
  const available = filteredNodes.value.length
  const unconfigured = nodes.value.filter(n => {
    const status = n.status || n.node_status
    return status === 'unconfigured' || status === 'pending'
  }).length
  const disabled = nodes.value.filter(n => {
    const status = n.status || n.node_status
    return status === 'disabled' || status === 'inactive'
  }).length
  
  return {
    total,
    available,
    unconfigured,
    disabled
  }
})

// 节点相关方法
const getNodeStatusColor = (status: string | number | undefined) => {
  // 处理数字状态
  if (typeof status === 'number') {
    if (status === 2) return 'positive'     // ONLINE
    if (status === 1) return 'primary'      // ENABLED
    if (status === 0) return 'negative'     // DISABLED
    if (status === -1) return 'orange'      // UNCONFIGURED
    return 'grey'
  }
  
  // 处理字符串状态
  const colorMap: Record<string, string> = {
    'online': 'positive',
    'enabled': 'primary',
    'active': 'positive',
    'offline': 'grey',
    'disabled': 'negative',
    'inactive': 'negative',
    'unconfigured': 'orange',
    'pending': 'orange'
  }
  return colorMap[status as string] || 'grey'
}

const getNodeStatusText = (status: string | number | undefined) => {
  // 处理数字状态
  if (typeof status === 'number') {
    const statusMap: Record<number, string> = {
      2: '在线',
      1: '已启用',
      0: '已禁用',
      [-1]: '未配置'
    }
    return statusMap[status] || `状态: ${status}`
  }
  
  // 处理字符串状态
  const statusMap: Record<string, string> = {
    'online': '在线',
    'enabled': '已启用',
    'active': '活跃',
    'offline': '离线',
    'disabled': '已禁用',
    'inactive': '非活跃',
    'unconfigured': '未配置',
    'pending': '待处理'
  }
  return statusMap[status as string] || (status as string) || '未知'
}

const getNodeRouteCount = (node: any) => {
  // 计算节点的活跃路由数量
  const nodeId = node.node_id || node.id
  const nodeRoutes = activeRoutes.value.filter(route => 
    route.node_id === nodeId || route.target_node_id === nodeId
  )
  return nodeRoutes.length
}

// 路由数据处理方法
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
const handleNodeSelect = async (node: any, index: number) => {
  selectedNode.value = node
  const nodeId = node.node_id || node.id
  await fetchNodeRoutes(nodeId)
}

const fetchNodeRoutes = async (nodeId: string | number) => {
  try {
    routesLoading.value = true
    debug.log('获取节点路由:', nodeId)
    
    const response = await api.get(`/route/node/${nodeId}`)
    debug.log('节点路由数据:', response.data)
    
    if (response.data && response.data.data) {
      const nodes = Array.isArray(response.data.data) ? response.data.data : []
      nodeRoutesList.value = processNodesByUserEmail(nodes)
    } else {
      nodeRoutesList.value = []
    }
    
  } catch (error) {
    debug.error('获取节点路由失败:', error)
    nodeRoutesList.value = []
    notify.error(t('routes.errors.fetchNodeRoutesFailed'))
  } finally {
    routesLoading.value = false
  }
}

const handleBackToNodes = () => {
  selectedNode.value = null
  nodeRoutesList.value = []
}

const handleRefreshRoutes = async () => {
  if (selectedNode.value) {
    const nodeId = (selectedNode.value as any).node_id || (selectedNode.value as any).id
    await fetchNodeRoutes(nodeId)
  } else {
    await loadNodes()
    await fetchActiveRoutes()
  }
}

const handleCreateRoute = () => {
  router.push('/app/routes/create/prev_1')
}

const handleDisconnectRoute = (routeId: string) => {
  disconnectRoute(routeId)
}

const handleViewRouteDetails = (route: any) => {
  routeDetailsDialog.value = {
    show: true,
    route
  }
}

// 路由数据显示方法
const getFriendName = (node: any) => {
  return node.user_name || node.user_email || '未知用户'
}

const getTargetNodeName = (node: any) => {
  return node.node_name || '未知节点'
}

const getTargetNodeIP = (node: any) => {
  const nodeIp = node.ip_addresses?.find((ip: any) => ip.route_type === 'node_ip')
  return nodeIp?.ip_address || 'N/A'
}

const getNodeSource = (node: any) => {
  const sourceMap: Record<string, string> = {
    'self': '当前节点',
    'user_node': '用户节点',
    'friend_node': '好友节点'
  }
  return sourceMap[node.source] || node.source || '未知'
}

const getNodeStatusLabel = (node: any) => {
  return getNodeSource(node)
}

const getIpTypeColor = (routeType: string) => {
  const colorMap: Record<string, string> = {
    'node_ip': 'primary',
    'lan_ip': 'positive',
    'wan_ip': 'info'
  }
  return colorMap[routeType] || 'grey'
}

const getIpTypeLabel = (routeType: string) => {
  const labelMap: Record<string, string> = {
    'node_ip': '节点IP',
    'lan_ip': '局域网IP',
    'wan_ip': '广域网IP'
  }
  return labelMap[routeType] || routeType
}

// 初始化
onMounted(async () => {
  await loadNodes()
  await fetchActiveRoutes()
})
</script>

<style lang="scss" scoped>
.nodes-view {
  :deep(.q-card) {
    min-height: auto;
    
    .q-card__section {
      padding: 12px 16px;
    }
  }
}

.routes-view {
  .node-info-header {
    background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.05) 0%, rgba(var(--q-primary-rgb), 0.02) 100%);
    border-left: 4px solid var(--q-primary);
  }
  
  .user-group-header {
    margin-top: 16px;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  :deep(.q-card) {
    .q-card__section {
      padding: 16px;
    }
  }
}
</style>