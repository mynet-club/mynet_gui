<template>
  <div class="node-route-card-view">
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ $t('routes.nodeBased.nodesList') }}</div>
        
        <ResponsiveCardGrid
          :items="connections"
          :loading="loading"
          variant="standard"
          spacing="normal"
          empty-icon="router"
          :empty-title="$t('routes.nodeBased.noNodes')"
          :empty-description="$t('routes.nodeBased.noNodesForNode')"
          :clickable="true"
          @card-click="handleConnectionClick"
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
                    :color="NodeStatusManager.getStatusColor(normalizeNodeStatus(node.node_status, node.status))"
                    :text-color="node.source === 'self' ? 'white' : 'dark'"
                    :label="NodeStatusManager.getStatusText(normalizeNodeStatus(node.node_status, node.status))"
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import { NodeStatusManager, normalizeNodeStatus } from '../../utils/nodeStatus'

interface Props {
  connections: any[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'connection-click': [connection: any]
}>()

const { t } = useI18n()

// 辅助方法
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

const handleConnectionClick = (connection: any, index: number) => {
  emit('connection-click', connection)
}
</script>

<style lang="scss" scoped>
.node-route-card-view {
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
