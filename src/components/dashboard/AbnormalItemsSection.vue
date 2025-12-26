<template>
  <div class="abnormal-section">
    <!-- 有异常情况 -->
    <template v-if="hasAbnormalItems">
      <div class="section-header q-mb-md">
        <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
        <span class="text-h6">需要关注的问题</span>
      </div>
      
      <!-- 离线节点 -->
      <q-card v-if="offlineNodes.length > 0" class="q-mb-md abnormal-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="wifi_off" color="negative" class="q-mr-sm" />
              离线节点（{{ offlineNodes.length }}）
            </div>
            <q-btn 
              flat 
              dense 
              color="primary"
              label="查看全部" 
              icon-right="arrow_forward"
              @click="$router.push('/app/nodes?filter=offline')"
            />
          </div>
          
          <q-list dense separator>
            <q-item 
              v-for="node in displayedOfflineNodes" 
              :key="node.id"
              clickable
              @click="$router.push(`/app/nodes/${node.id}`)"
              class="offline-node-item"
            >
              <q-item-section avatar>
                <q-avatar color="grey-3" text-color="grey-7" icon="router" />
              </q-item-section>
              
              <q-item-section>
                <q-item-label>{{ node.node_name }}</q-item-label>
                <q-item-label caption>
                  <q-icon name="schedule" size="xs" />
                  {{ getOfflineText(node) }}
                </q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <q-chip 
                  :color="getOfflineSeverityColor(node.offlineDuration)"
                  text-color="white"
                  size="sm"
                >
                  {{ getOfflineDurationText(node.offlineDuration) }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div v-if="offlineNodes.length > 5" class="text-center q-mt-sm">
            <q-btn 
              flat 
              dense 
              size="sm"
              :label="`还有 ${offlineNodes.length - 5} 个离线节点`"
              @click="$router.push('/app/nodes?filter=offline')"
            />
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 待处理连接 -->
      <q-card v-if="pendingConnections.length > 0" class="q-mb-md abnormal-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="schedule" color="orange" class="q-mr-sm" />
              待处理连接（{{ pendingConnections.length }}）
            </div>
            <q-btn 
              flat 
              dense 
              color="primary"
              label="立即处理" 
              icon-right="arrow_forward"
              @click="$router.push('/app/routes/pending')"
            />
          </div>
          
          <div class="text-body2 text-grey-7">
            您有 {{ pendingConnections.length }} 个待处理的路由连接请求，请及时处理
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 未配置节点 -->
      <q-card v-if="unconfiguredNodes.length > 0" class="abnormal-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="settings" color="warning" class="q-mr-sm" />
              未完成配置（{{ unconfiguredNodes.length }}）
            </div>
            <q-btn 
              flat 
              dense 
              color="primary"
              label="完成配置" 
              icon-right="arrow_forward"
              @click="$router.push('/app/nodes?filter=unconfigured')"
            />
          </div>
          
          <div class="text-body2 text-grey-7">
            以下节点需要完成配置才能使用：
            <span class="text-weight-medium">
              {{ unconfiguredNodes.map(n => n.node_name).slice(0, 3).join('、') }}
              <span v-if="unconfiguredNodes.length > 3"> 等</span>
            </span>
          </div>
        </q-card-section>
      </q-card>
    </template>
    
    <!-- 一切正常 -->
    <q-banner v-else class="bg-positive-1 text-positive-8 rounded-borders">
      <template #avatar>
        <q-icon name="check_circle" color="positive" size="md" />
      </template>
      <div class="text-body1 text-weight-medium">
        ✨ 所有系统运行正常，无需处理任何问题
      </div>
      <div class="text-body2 q-mt-xs">
        {{ totalNodes }} 个节点全部在线，{{ totalRoutes }} 条路由正常运行
      </div>
    </q-banner>
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
.abnormal-section {
  .section-header {
    display: flex;
    align-items: center;
  }
  
  .abnormal-card {
    border-left: 3px solid var(--q-warning);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  .offline-node-item {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
}
</style>
