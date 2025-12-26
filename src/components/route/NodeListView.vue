<template>
  <div class="node-list-view">
    <!-- 页面说明 -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-md">{{ $t('routes.nodeBased.selectNode') }}</div>
      <div class="text-body2 text-grey-6 q-mb-lg">
        {{ $t('routes.nodeBased.selectNodeDescription') }}
      </div>
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
      :loading="loading"
      :loading-count="8"
      variant="standard"
      spacing="normal"
      empty-icon="router"
      :empty-title="$t('routes.nodeBased.noAvailableNodes')"
      :empty-description="$t('routes.nodeBased.noAvailableNodesDescription')"
      :clickable="true"
      @card-click="handleNodeClick"
    >
      <template #default="{ item: node }">
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-icon 
              name="router"
              :color="NodeStatusManager.getStatusColor(normalizeNodeStatus((node as any).node_status, node.status))"
              size="md"
              class="q-mr-sm"
            />
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ node.node_name }}</div>
              <div class="text-body2 text-grey-6">
                {{ (node as any).description || (node as any).node_remarks || $t('common.noDescription') }}
              </div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="NodeStatusManager.getStatusColor(normalizeNodeStatus((node as any).node_status, node.status))"
                text-color="white"
                :icon="NodeStatusManager.getStatusIcon(normalizeNodeStatus((node as any).node_status, node.status))"
                :label="NodeStatusManager.getStatusText(normalizeNodeStatus((node as any).node_status, node.status))"
                size="sm"
              />
            </div>
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import { NodeStatusManager, normalizeNodeStatus } from '../../utils/nodeStatus'
import type { Node } from '../../types'

interface Props {
  nodes: Node[]
  loading: boolean
  activeRoutes: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'node-select': [node: Node]
}>()

const { t } = useI18n()
const router = useRouter()

// 计算属性
const filteredNodes = computed(() => {
  return props.nodes.filter(node => {
    // 使用 node_status 数值：1(启用但离线) 和 2(启用且在线) 的节点都应该显示
    const nodeStatus = (node as any).node_status
    return nodeStatus === 1 || nodeStatus === 2
  })
})

const hasAvailableNodes = computed(() => filteredNodes.value.length > 0)

const nodeStatusStats = computed(() => {
  const total = props.nodes.length
  const available = filteredNodes.value.length
  const unconfigured = props.nodes.filter(n => {
    const anyNode = n as any
    const status = anyNode.status || anyNode.node_status
    // 允许任何类型比较
    return (status as any) === 'unconfigured' || (status as any) === 'pending' || (status as any) === 0
  }).length
  const disabled = props.nodes.filter(n => {
    const anyNode = n as any
    const status = anyNode.status || anyNode.node_status
    // 允许任何类型比较
    return (status as any) === 'disabled' || (status as any) === 'inactive' || (status as any) === 0
  }).length
  
  return {
    total,
    available,
    unconfigured,
    disabled
  }
})

// 方法
const getNodeRouteCount = (node: any) => {
  const nodeId = node.node_id || node.id
  const nodeRoutes = props.activeRoutes.filter(route => 
    route.node_id === nodeId || route.target_node_id === nodeId
  )
  return nodeRoutes.length
}

const handleNodeClick = (node: Node, index: number) => {
  emit('node-select', node)
}
</script>

<style lang="scss" scoped>
.node-list-view {
  :deep(.q-card) {
    min-height: auto;
    
    .q-card__section {
      padding: 12px 16px;
    }
  }
}
</style>
