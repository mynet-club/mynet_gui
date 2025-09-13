<template>
  <div class="node-based-routes-tab">
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
              @click="$router.push('/nodes')"
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
            <span v-if="nodeStatusStats.unconfigured > 0 || nodeStatusStats.disabled > 0">
              ，{{ nodeStatusStats.unconfigured + nodeStatusStats.disabled }} 个节点需要
              <q-btn 
                flat 
                dense 
                color="primary" 
                label="启用" 
                icon="settings"
                @click="$router.push('/nodes')"
                size="sm"
                class="q-mx-xs"
              />
            </span>
          </div>
        </q-banner>
      </div>
      
      <!-- 节点卡片网格 -->
      <ResponsiveCardGrid
        :items="myNodes"
        :loading="nodesLoading"
        variant="compact"
        spacing="tight"
        empty-icon="lan"
        :empty-title="hasAvailableNodes ? $t('routes.nodeBased.noNodes') : '暂无可用节点'"
        :empty-subtitle="hasAvailableNodes ? $t('routes.nodeBased.noNodesDescription') : '请先到节点管理页面启用节点'"
        :clickable="true"
        @card-click="handleNodeSelect"
      >
        <template #default="{ item: node }">
          <q-card-section class="q-pa-md">
            <!-- 简化的节点信息 -->
            <div class="row items-center">
              <q-icon 
                :name="NodeStatusManager.getStatusIcon(normalizeNodeStatus(node.node_status, node.status))" 
                :color="NodeStatusManager.getStatusColor(normalizeNodeStatus(node.node_status, node.status))"
                size="md"
                class="q-mr-sm"
              />
              <div class="col">
                <div class="text-subtitle1 text-weight-medium text-primary">{{ node.node_name }}</div>
                <div class="text-body2 text-grey-7">
                  {{ (node as any).ipv4 || (node as any).ip || node.node_ip || 'N/A' }}
                </div>
                <div class="text-caption" :class="`text-${NodeStatusManager.getStatusColor(normalizeNodeStatus(node.node_status, node.status))}`">
                  {{ NodeStatusManager.getStatusText(normalizeNodeStatus(node.node_status, node.status)) }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward_ios" color="grey-5" size="sm" />
              </div>
            </div>
          </q-card-section>
        </template>
      </ResponsiveCardGrid>
    </div>

    <!-- 路由列表视图 -->
    <div v-else class="routes-view">
      <!-- 返回按钮和节点信息 -->
      <div class="q-mb-md">
        <q-btn 
          flat 
          color="primary" 
          icon="arrow_back"
          :label="$t('routes.nodeBased.backToNodes')"
          @click="handleBackToNodes"
          class="q-mb-md"
        />
        
        <q-card class="node-info-header">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <div class="col">
                <div class="row items-center">
                  <q-icon 
                    name="lan" 
                    size="xl" 
                    color="primary"
                    class="q-mr-md"
                  />
                  <div>
                    <div class="text-h5 text-primary">{{ selectedNode.node_name }}</div>
                    <div class="text-body1 text-grey-6">
                      {{ selectedNode.description || selectedNode.node_remarks || $t('routes.nodeBased.noDescription') }}
                    </div>
                    <div class="text-caption text-grey-5 q-mt-xs">
                      {{ $t('routes.nodeBased.nodeId') }}: {{ selectedNode.node_id }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-auto text-center">
                <div class="text-h3 text-primary">{{ nodeRoutesList.length }}</div>
                <div class="text-body2 text-grey-6">{{ $t('routes.nodeBased.totalNodes') }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- 简化的路由列表 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.nodeBased.nodesList') }}</div>
          
          <!-- 路由内容 -->
          <ResponsiveCardGrid
            :items="nodeRoutesList"
            :loading="routesLoading"
            variant="standard"
            spacing="normal"
            empty-icon="router"
            :empty-title="$t('routes.nodeBased.noNodes')"
            :empty-subtitle="$t('routes.nodeBased.noNodesForNode')"
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
                        <div class="text-caption text-grey-6">
                          节点 ID: {{ node.node_id }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-auto text-right">
                    <!-- 节点状态 -->
                    <div class="q-mb-xs">
                      <q-chip
                        :color="getNodeStatusColor(node)"
                        :label="getNodeStatusLabel(node)"
                        size="sm"
                        dense
                      />
                    </div>
                    <!-- IP地址数量 -->
                    <div>
                      <q-chip
                        color="info"
                        :label="`${(node as any).ip_addresses?.length || 0} 个IP`"
                        size="sm"
                        dense
                        icon="network_check"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- 节点不可用警告 -->
                <div v-if="isNodeUnavailable(node)" class="q-mt-sm">
                  <q-banner class="bg-orange-1 text-orange-8 rounded-borders" dense>
                    <template #avatar>
                      <q-icon name="warning" color="orange" size="sm" />
                    </template>
                    <div class="text-caption">
                      节点缺少IP地址配置，可能无法正常连接
                    </div>
                  </q-banner>
                </div>
                
                <!-- 节点IP地址详细信息 -->
                <div v-if="(node as any).ip_addresses && (node as any).ip_addresses.length > 0" class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">IP 地址列表</div>
                  <div class="row q-gutter-sm">
                    <div 
                      v-for="ip in (node as any).ip_addresses" 
                      :key="ip.ip_address"
                      class="col-auto"
                    >
                      <q-chip
                        :color="getIpTypeColor(ip.route_type)"
                        :label="`${ip.ip_address} (${getIpTypeLabel(ip.route_type)})`"
                        size="sm"
                        dense
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>
              
              <q-card-actions class="justify-end">
                <q-btn
                  flat
                  icon="info"
                  color="info"
                  size="sm"
                  @click="$emit('view-node-details', node)"
                >
                  <q-tooltip>查看节点详情</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="(node as any).source !== 'self'"
                  flat
                  icon="add_link"
                  color="primary"
                  size="sm"
                  @click="$emit('create-route', node)"
                >
                  <q-tooltip>创建路由</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="(node as any).source === 'self'"
                  flat
                  icon="settings"
                  color="secondary"
                  size="sm"
                  @click="$emit('configure-node', node)"
                >
                  <q-tooltip>配置节点</q-tooltip>
                </q-btn>
              </q-card-actions>
            </template>
          </ResponsiveCardGrid>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNodes } from '../../composables/useNodes'
import { api } from '../../services/api'
import { NodeStatusManager, normalizeNodeStatus } from '../../utils/nodeStatus'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import type { Route } from '../../types'
import type { Node } from '../../types/node'

interface Props {
  routes: Route[]
  loading: boolean
}

interface Emits {
  (e: 'disconnect', routeId: string): void
  (e: 'view-details', route: Route): void
  (e: 'edit-route', route: Route): void
  (e: 'view-node-details', node: any): void
  (e: 'create-route', node: any): void
  (e: 'configure-node', node: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// 使用节点管理功能
const { 
  nodes, 
  loading: nodesLoading, 
  loadNodes
} = useNodes()

// 状态管理
const selectedNode = ref<Node | null>(null)
const routesLoading = ref(false)
const nodeRoutesList = ref<Route[]>([]) // 存储当前节点的相关节点数据

// 我的节点列表（只显示已配置且启用/在线的节点）
const myNodes = computed(() => {
  return nodes.value.filter(node => {
    const status = normalizeNodeStatus(node.node_status, node.status)
    // 只显示已启用(1)或在线(2)的节点，排除未配置(-1)和已禁用(0)
    return NodeStatusManager.getStatusConfig(status).text !== '未完成配置' && 
           NodeStatusManager.getStatusConfig(status).text !== '已禁用'
  })
})

// 检查是否有可用节点
const hasAvailableNodes = computed(() => {
  return myNodes.value.length > 0
})

// 统计节点状态
const nodeStatusStats = computed(() => {
  const total = nodes.value.length
  const available = myNodes.value.length
  const unconfigured = nodes.value.filter(node => {
    const status = normalizeNodeStatus(node.node_status, node.status)
    return NodeStatusManager.needsConfiguration(status)
  }).length
  const disabled = nodes.value.filter(node => {
    const status = normalizeNodeStatus(node.node_status, node.status)
    return NodeStatusManager.getStatusConfig(status).text === '已禁用'
  }).length
  
  return { total, available, unconfigured, disabled }
})

// 按 user_email 分组处理节点数据
const processNodesByUserEmail = (nodes: any[]): any[] => {
  // 按 user_email 分组
  const groupedNodes: Record<string, any[]> = nodes.reduce((groups, node) => {
    const userEmail = node.user_email
    
    if (!userEmail) return groups
    
    if (!groups[userEmail]) {
      groups[userEmail] = []
    }
    groups[userEmail].push(node)
    return groups
  }, {} as Record<string, any[]>)
  
  // 将分组后的数据扁平化，保持分组信息
  const processedNodes: any[] = []
  Object.entries(groupedNodes).forEach(([userEmail, userNodes]) => {
    (userNodes as any[]).forEach((node, index) => {
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
const handleNodeSelect = async (node: Node, index: number) => {
  selectedNode.value = node
  // 获取该节点的路由数据
  await fetchNodeRoutes(node.node_id)
}

// 获取节点路由数据
const fetchNodeRoutes = async (nodeId: string | number) => {
  try {
    routesLoading.value = true
    console.log('获取节点路由:', nodeId)
    
    // 调用 /route/node/{nodeId} API
    const response = await api.get(`/route/node/${nodeId}`)
    console.log('节点路由数据:', response.data)
    
    // 假设返回的数据结构是节点列表，已按user_email分组
    if (response.data && response.data.data) {
      const nodes = Array.isArray(response.data.data) ? response.data.data : []
      // 处理节点数据并按用户分组
      nodeRoutesList.value = processNodesByUserEmail(nodes)
    } else {
      nodeRoutesList.value = []
    }
    
  } catch (error) {
    console.error('获取节点路由失败:', error)
    nodeRoutesList.value = []
    // 这里可以使用 notify 显示错误
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
    await fetchNodeRoutes(selectedNode.value.node_id)
  }
}

const handleDisconnectRoute = (routeId: string) => {
  emit('disconnect', routeId)
}

const handleViewRouteDetails = (route: Route) => {
  emit('view-details', route)
}

const handleEditRoute = (route: Route) => {
  emit('edit-route', route)
}

// 节点相关的辅助方法
const getFriendName = (node: any) => {
  // 显示用户名称
  return node.user_name || node.user_email || '未知用户'
}

const getTargetNodeName = (node: any) => {
  return node.node_name || '未知节点'
}

const getTargetNodeIP = (node: any) => {
  // 获取主要的节点IP地址
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

const getNodeStatusColor = (node: any) => {
  // 根据节点来源确定状态颜色
  const colorMap: Record<string, string> = {
    'self': 'primary',
    'user_node': 'positive', 
    'friend_node': 'info'
  }
  return colorMap[node.source] || 'grey'
}

const getNodeStatusLabel = (node: any) => {
  return getNodeSource(node)
}

// 检查节点是否不可用（这里可以根据实际业务逻辑调整）
const isNodeUnavailable = (node: any) => {
  // 如果没有IP地址则认为不可用
  return !node.ip_addresses || node.ip_addresses.length === 0
}

// IP类型相关的辅助方法
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
})
</script>

<style lang="scss" scoped>
.node-based-routes-tab {
  .nodes-view {
    // 节点选择卡片样式
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
    
    // 用户分组标题样式
    .user-group-header {
      margin-top: 16px;
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    // 路由卡片样式
    :deep(.q-card) {
      .q-card__section {
        padding: 16px;
      }
    }
  }
}
</style>
