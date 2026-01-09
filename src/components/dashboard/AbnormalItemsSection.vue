<template>
  <div class="abnormal-section">
    <!-- 有异常情况 - 使用卡片网格布局 -->
    <template v-if="hasAbnormalItems">
      <div class="row q-col-gutter-lg">
        <!-- 离线节点 -->
        <div v-if="offlineNodes.length > 0" class="col-12 col-md-6">
          <q-card class="standard-card">
            <q-card-section class="card-header">
              <div class="card-title">
                <q-icon name="wifi_off" color="negative" size="18px" />
                离线设备 ({{ offlineNodes.length }})
              </div>
              <q-btn 
                flat 
                dense
                size="sm"
                color="grey-7"
                icon="arrow_forward"
                @click="$router.push('/app/nodes?filter=offline')"
              />
            </q-card-section>
            
            <q-card-section class="card-body">
              <q-list dense separator>
                <q-item 
                  v-for="node in displayedOfflineNodes" 
                  :key="node.id"
                  clickable
                  @click="$router.push(`/app/nodes/${node.id}`)"
                  class="offline-node-item"
                >
                  <q-item-section avatar>
                    <q-icon name="router" color="grey-5" size="20px" />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label class="text-body2">{{ node.node_name }}</q-item-label>
                    <q-item-label caption class="text-caption">
                      {{ getOfflineText(node) }}
                    </q-item-label>
                  </q-item-section>
                  
                  <q-item-section side>
                    <q-badge 
                      :color="getOfflineSeverityColor(node.offlineDuration)"
                      :label="getOfflineDurationText(node.offlineDuration)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- 待处理连接 -->
        <div v-if="pendingConnections.length > 0" class="col-12 col-md-6">
          <q-card class="standard-card">
            <q-card-section class="card-header">
              <div class="card-title">
                <q-icon name="schedule" color="warning" size="18px" />
                待处理连接 ({{ pendingConnections.length }})
              </div>
              <q-btn 
                flat 
                dense
                size="sm"
                color="grey-7"
                icon="arrow_forward"
                @click="$router.push('/app/routes/pending')"
              />
            </q-card-section>
            
            <q-card-section class="card-body">
              <div class="info-line">
                <q-icon name="info" color="grey-6" size="18px" />
                <span class="text-body2 text-grey-7">
                  {{ pendingConnections.length }} 个待处理的路由连接请求
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- 未配置节点 -->
        <div v-if="unconfiguredNodes.length > 0" class="col-12 col-md-6">
          <q-card class="standard-card">
            <q-card-section class="card-header">
              <div class="card-title">
                <q-icon name="settings" color="warning" size="18px" />
                未完成配置 ({{ unconfiguredNodes.length }})
              </div>
              <q-btn 
                flat 
                dense
                size="sm"
                color="grey-7"
                icon="arrow_forward"
                @click="$router.push('/app/nodes?filter=unconfigured')"
              />
            </q-card-section>
            
            <q-card-section class="card-body">
              <div class="info-line">
                <q-icon name="info" color="grey-6" size="18px" />
                <span class="text-body2 text-grey-7">
                  {{ unconfiguredNodes.slice(0, 3).map(n => n.node_name).join('、') }}
                  <span v-if="unconfiguredNodes.length > 3"> 等</span>
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '../../utils/dateFormat'
import type { NodeSummary } from '../../types/dashboard'

interface Props {
  offlineNodes: NodeSummary[]
  pendingConnections: any[]
  unconfiguredNodes: NodeSummary[]
  totalNodes: number
  totalRoutes: number
}

const props = defineProps<Props>()
const router = useRouter()

const hasAbnormalItems = computed(() => {
  return props.offlineNodes.length > 0 || 
         props.pendingConnections.length > 0 || 
         props.unconfiguredNodes.length > 0
})

const displayedOfflineNodes = computed(() => {
  return props.offlineNodes.slice(0, 5)
})

const getOfflineText = (node: NodeSummary) => {
  if (node.last_seen) {
    return `最后在线：${formatRelativeTime(node.last_seen)}`
  }
  return '从未在线'
}

const getOfflineDurationText = (minutes?: number) => {
  if (!minutes) return '未知'
  if (minutes < 60) return `${minutes}分钟`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时`
  return `${Math.floor(minutes / 1440)}天`
}

const getOfflineSeverityColor = (minutes?: number) => {
  if (!minutes) return 'grey'
  if (minutes < 60) return 'warning'      // < 1小时：警告
  if (minutes < 1440) return 'orange'     // < 1天：橙色
  return 'negative'                        // >= 1天：严重
}
</script>

<style lang="scss" scoped>
@import '../../styles/design-tokens.scss';

.abnormal-section {
  .offline-node-item {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--color-bg-primary);
    }
  }
  
  .info-line {
    display: flex;
    align-items: flex-start;
    gap: $spacing-sm;
  }
}
</style>
