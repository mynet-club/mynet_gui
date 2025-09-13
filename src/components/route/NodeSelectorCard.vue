<template>
  <q-card 
    class="node-selector-card" 
    :class="{ 'selected': selectedNodeId === node.node_id }"
    @click="$emit('select', node)"
    clickable
  >
    <q-card-section class="q-pa-sm">
      <div class="row items-center no-wrap">
        <!-- 节点状态指示器 -->
        <q-icon 
          :name="getNodeStatusIcon(node.status || node.node_status)" 
          :color="getNodeStatusColor(node.status || node.node_status)"
          size="sm"
          class="q-mr-sm"
        />
        
        <!-- 节点信息 -->
        <div class="col text-truncate">
          <div class="text-body2 text-weight-medium text-truncate">
            {{ node.node_name }}
          </div>
          <div class="text-caption text-grey-6 text-truncate">
            {{ node.description || node.node_remarks || $t('routes.nodeSelector.noDescription') }}
          </div>
        </div>
        
        <!-- 路由数量徽章 -->
        <div class="col-auto">
          <q-chip 
            v-if="routeCount > 0"
            :label="routeCount.toString()"
            size="sm"
            color="primary"
            text-color="white"
            dense
          />
          <q-chip 
            v-else
            :label="'0'"
            size="sm"
            color="grey-4"
            text-color="grey-7"
            dense
          />
        </div>
        
        <!-- 选中指示器 -->
        <q-icon 
          v-if="selectedNodeId === node.node_id"
          name="check_circle"
          color="primary"
          size="sm"
          class="q-ml-xs"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Node } from '../../types/node'

interface Props {
  node: Node
  selectedNodeId?: string | number | null
  routeCount?: number
}

interface Emits {
  (e: 'select', node: Node): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedNodeId: null,
  routeCount: 0
})

defineEmits<Emits>()

const { t } = useI18n()

// 获取节点状态图标
const getNodeStatusIcon = (status: any) => {
  const statusNum = typeof status === 'number' ? status : 
                   status === 'active' ? 1 : 
                   status === 'inactive' ? 0 : -1
  
  switch (statusNum) {
    case 1: return 'check_circle'
    case 0: return 'cancel'
    case -1: return 'settings'
    default: return 'help'
  }
}

// 获取节点状态颜色
const getNodeStatusColor = (status: any) => {
  const statusNum = typeof status === 'number' ? status : 
                   status === 'active' ? 1 : 
                   status === 'inactive' ? 0 : -1
  
  switch (statusNum) {
    case 1: return 'positive'
    case 0: return 'negative'
    case -1: return 'warning'
    default: return 'grey'
  }
}
</script>

<style lang="scss" scoped>
.node-selector-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    border-color: rgba(var(--q-primary-rgb), 0.3);
    transform: translateY(-1px);
  }
  
  &.selected {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.05);
  }
}
</style>
