<template>
  <div class="node-selector">
    <!-- 搜索和过滤栏 -->
    <div class="row q-mb-md q-gutter-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('routes.nodeSelector.searchPlaceholder')"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      
      <div class="col-12 col-md-3">
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          :placeholder="$t('routes.nodeSelector.statusFilter')"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
      
      <div class="col-12 col-md-3">
        <q-select
          v-model="typeFilter"
          :options="typeOptions"
          :placeholder="$t('routes.nodeSelector.typeFilter')"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
      
      <div class="col-12 col-md-2">
        <q-btn
          color="primary"
          icon="refresh"
          :label="$t('routes.nodeSelector.refresh')"
          @click="$emit('refresh')"
          :loading="loading"
          outline
          no-caps
        />
      </div>
    </div>

    <!-- 选中节点显示 -->
    <div v-if="selectedNode" class="selected-node-banner q-mb-md">
      <q-banner class="bg-primary text-white rounded-borders">
        <template v-slot:avatar>
          <q-icon name="lan" color="white" />
        </template>
        <div class="text-body1">
          {{ $t('routes.nodeSelector.selectedNode') }}: <strong>{{ selectedNode.node_name }}</strong>
        </div>
        <div class="text-caption">
          {{ selectedNode.description || selectedNode.node_remarks || $t('routes.nodeSelector.noDescription') }}
        </div>
        <template v-slot:action>
          <q-btn 
            flat 
            color="white" 
            icon="clear"
            @click="$emit('clear-selection')"
            :label="$t('routes.nodeSelector.clearSelection')"
            no-caps
          />
        </template>
      </q-banner>
    </div>

    <!-- 节点列表 -->
    <div class="node-grid">
      <div 
        v-for="node in filteredNodes" 
        :key="node.node_id"
        class="node-grid-item"
      >
        <NodeSelectorCard
          :node="node"
          :selected-node-id="selectedNode?.node_id || null"
          :route-count="getNodeRouteCount(node.node_id)"
          @select="handleNodeSelect"
        />
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredNodes.length === 0 && !loading" class="col-12">
        <q-card class="text-center q-pa-lg">
          <q-icon name="lan" size="4rem" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-6 q-mb-sm">
            {{ searchQuery ? $t('routes.nodeSelector.noSearchResults') : $t('routes.nodeSelector.noNodes') }}
          </div>
          <div class="text-body2 text-grey-5">
            {{ searchQuery ? $t('routes.nodeSelector.tryDifferentSearch') : $t('routes.nodeSelector.addNodesFirst') }}
          </div>
        </q-card>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="node-grid">
      <div v-for="i in 6" :key="i" class="node-grid-item">
        <q-card>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap">
              <q-skeleton type="circle" class="q-mr-sm" size="24px" />
              <div class="col">
                <q-skeleton type="text" class="q-mb-xs" />
                <q-skeleton type="text" width="60%" />
              </div>
              <q-skeleton type="QChip" class="q-ml-sm" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Node } from '../../types/node'
import NodeSelectorCard from './NodeSelectorCard.vue'

interface Props {
  nodes: Node[]
  loading: boolean
  selectedNode: Node | null
  routeCounts: Record<string | number, number>
}

interface Emits {
  (e: 'select-node', node: Node): void
  (e: 'clear-selection'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// 搜索和过滤状态
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')

// 过滤选项
const statusOptions = [
  { label: t('routes.nodeSelector.status.active'), value: 'active' },
  { label: t('routes.nodeSelector.status.inactive'), value: 'inactive' },
  { label: t('routes.nodeSelector.status.pending'), value: 'pending' }
]

const typeOptions = [
  { label: 'Gateway', value: 'Gateway' },
  { label: 'Server', value: 'Server' },
  { label: 'Client', value: 'Client' },
  { label: 'Router', value: 'Router' }
]

// 过滤后的节点列表
const filteredNodes = computed(() => {
  let filtered = props.nodes

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(node => 
      node.node_name.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query) ||
      node.node_remarks?.toLowerCase().includes(query) ||
      String(node.node_id).toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(node => {
      const status = node.status || node.node_status
      if (statusFilter.value === 'active') {
        return status === 'active' || status === 1
      } else if (statusFilter.value === 'inactive') {
        return status === 'inactive' || status === 0
      } else if (statusFilter.value === 'pending') {
        return status === 'pending' || status === -1
      }
      return true
    })
  }

  // 类型过滤
  if (typeFilter.value) {
    filtered = filtered.filter(node => node.node_type === typeFilter.value)
  }

  return filtered
})

// 获取节点的路由数量
const getNodeRouteCount = (nodeId: string | number) => {
  return props.routeCounts[nodeId] || 0
}

// 处理节点选择
const handleNodeSelect = (node: Node) => {
  emit('select-node', node)
}

// 监听选中节点变化，自动滚动到顶部
watch(() => props.selectedNode, (newNode) => {
  if (newNode) {
    // 平滑滚动到选中状态banner
    setTimeout(() => {
      const banner = document.querySelector('.selected-node-banner')
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
.node-selector {
  .node-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    
    .node-grid-item {
      min-height: 80px;
    }
  }
  
  .selected-node-banner {
    animation: slideDown 0.3s ease-out;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 响应式布局
@media (max-width: 600px) {
  .node-selector {
    .node-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
