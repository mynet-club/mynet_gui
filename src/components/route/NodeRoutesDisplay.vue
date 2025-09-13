<template>
  <div class="node-routes-display">
    <!-- 节点信息头部 -->
    <q-card class="node-info-card q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center">
          <div class="col">
            <div class="row items-center">
              <q-icon 
                name="lan" 
                size="lg" 
                color="primary"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-primary">{{ node.node_name }}</div>
                <div class="text-body2 text-grey-6">
                  {{ node.description || node.node_remarks || $t('routes.nodeRoutes.noDescription') }}
                </div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  {{ $t('routes.nodeRoutes.nodeId') }}: {{ node.node_id }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-auto">
            <div class="text-center">
              <div class="text-h4 text-primary">{{ routes.length }}</div>
              <div class="text-caption text-grey-6">{{ $t('routes.nodeRoutes.totalRoutes') }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 路由过滤栏 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-8">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('routes.nodeRoutes.searchPlaceholder')"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      
      <div class="col-12 col-md-4">
        <q-btn
          color="primary"
          icon="refresh"
          :label="$t('routes.nodeRoutes.refresh')"
          outline
          no-caps
          class="q-ml-md"
          @click="$emit('refresh')"
        />
      </div>
    </div>

    <!-- 路由列表 -->
    <ResponsiveCardGrid
      :items="filteredRoutes"
      :loading="loading"
      variant="standard"
      spacing="normal"
      empty-icon="route"
      :empty-title="searchQuery ? $t('routes.nodeRoutes.noSearchResults') : $t('routes.nodeRoutes.noRoutes')"
      :empty-subtitle="searchQuery ? $t('routes.nodeRoutes.tryDifferentSearch') : $t('routes.nodeRoutes.noRoutesForNode')"
    >
      <template #default="{ item: route }">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col">
              <div class="row items-center">
                <q-icon 
                  :name="getRouteIcon(route.status)" 
                  :color="getRouteColor(route.status)"
                  size="md"
                  class="q-mr-sm"
                />
                <div>
                  <div class="route-title">
                    <span class="text-weight-medium">{{ route.source_node_name }}</span>
                    <q-icon name="trending_flat" class="q-mx-xs" />
                    <span class="text-weight-medium">{{ route.target_node_name }}</span>
                  </div>
                  <div class="text-body2 text-grey-6">
                    {{ getRouteDirection(route) }}: {{ formatNetwork(route.target_network, route.target_mask) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getRouteColor(route.status)"
                :label="getStatusLabel(route.status)"
                size="sm"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- 路由详细信息 -->
          <div class="row q-gutter-md">
            <div class="col-12">
              <div class="row q-gutter-md text-center">
                <div class="col">
                  <div class="text-body1 text-primary text-weight-medium">{{ getVpnTypeLabel(route.source_vpn_type) }}</div>
                  <div class="text-caption text-grey-6">{{ $t('routes.nodeRoutes.vpnType') }}</div>
                </div>
                <div class="col">
                  <div class="text-body1 text-info text-weight-medium">{{ getRelayModeLabel(route.relay_mode) }}</div>
                  <div class="text-caption text-grey-6">{{ $t('routes.nodeRoutes.relayMode') }}</div>
                </div>
                <div class="col">
                  <div class="text-body1 text-positive text-weight-medium">{{ route.priority }}</div>
                  <div class="text-caption text-grey-6">{{ $t('routes.nodeRoutes.priority') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 对端信息 -->
          <div class="row q-mt-md">
            <div class="col">
              <div class="text-body2">
                <q-icon name="person" size="sm" class="q-mr-xs" />
                <span>{{ getRemoteUser(route) }}</span>
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('routes.nodeRoutes.remoteUser') }}: {{ getRemoteUserEmail(route) }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('routes.nodeRoutes.lastUpdate') }}: {{ formatDate(route.updated_at) }}
              </div>
            </div>
          </div>
          
          <!-- 路由描述 -->
          <div v-if="route.description" class="row q-mt-sm">
            <div class="col">
              <div class="text-caption text-grey-6">
                <q-icon name="description" size="sm" class="q-mr-xs" />
                {{ route.description }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- 操作按钮区域 -->
        <q-card-actions class="route-actions">
          <div class="route-id-info">
            <span class="text-caption text-grey-6">RouteID: {{ route.route_id }}</span>
          </div>
          <q-space />
          <div class="action-buttons">
            <q-btn
              flat
              round
              icon="info"
              color="info"
              size="sm"
              @click="$emit('view-details', route)"
            >
              <q-tooltip>{{ $t('routes.nodeRoutes.viewDetails') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="$emit('edit-route', route)"
            >
              <q-tooltip>{{ $t('routes.nodeRoutes.editRoute') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="link_off"
              color="negative"
              size="sm"
              @click="$emit('disconnect', route.route_id)"
            >
              <q-tooltip>{{ $t('routes.nodeRoutes.disconnect') }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-actions>
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import type { Route } from '../../types'
import type { Node } from '../../types/node'

interface Props {
  node: Node
  routes: Route[]
  loading: boolean
}

interface Emits {
  (e: 'disconnect', routeId: string): void
  (e: 'view-details', route: Route): void
  (e: 'edit-route', route: Route): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

// 搜索和过滤
const searchQuery = ref('')

// 过滤后的路由
const filteredRoutes = computed(() => {
  let filtered = props.routes

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(route => 
      route.source_node_name.toLowerCase().includes(query) ||
      route.target_node_name.toLowerCase().includes(query) ||
      route.target_user_name.toLowerCase().includes(query) ||
      route.source_user_name.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query)
    )
  }

  return filtered
})

// 判断路由方向并返回描述
const getRouteDirection = (route: Route) => {
  const isOutgoing = route.node_id === props.node.node_id
  return isOutgoing ? t('routes.nodeRoutes.direction.outgoing') : t('routes.nodeRoutes.direction.incoming')
}

// 获取远程用户信息
const getRemoteUser = (route: Route) => {
  const isOutgoing = route.node_id === props.node.node_id
  return isOutgoing ? route.target_user_name : route.source_user_name
}

const getRemoteUserEmail = (route: Route) => {
  const isOutgoing = route.node_id === props.node.node_id
  return isOutgoing ? route.target_user_email : route.source_user_email
}

// 获取路由图标
const getRouteIcon = (status: number) => {
  switch (status) {
    case 1: return 'link'
    case 0: return 'link_off'
    default: return 'help'
  }
}

// 获取路由颜色
const getRouteColor = (status: number) => {
  switch (status) {
    case 1: return 'positive'
    case 0: return 'grey'
    default: return 'grey'
  }
}

// 获取状态标签
const getStatusLabel = (status: number) => {
  switch (status) {
    case 1: return t('routes.status.active')
    case 0: return t('routes.status.inactive')
    default: return t('routes.status.unknown')
  }
}

// 获取VPN类型标签
const getVpnTypeLabel = (vpnType: string) => {
  switch (vpnType?.toLowerCase()) {
    case 'wg':
    case 'wireguard': return 'WireGuard'
    case 'openvpn': return 'OpenVPN'
    case 'ipsec': return 'IPSec'
    case 'v2ray': return 'V2Ray'
    case 'shadowsocks': return 'Shadowsocks'
    default: return vpnType || t('routes.nodeRoutes.unknownType')
  }
}

// 获取中继模式标签
const getRelayModeLabel = (relayMode: string) => {
  switch (relayMode?.toLowerCase()) {
    case 'direct': return t('routes.relayModes.direct')
    case 'relay': return t('routes.relayModes.relay')
    case 'p2p': return t('routes.relayModes.p2p')
    case 'hybrid': return t('routes.relayModes.hybrid')
    default: return relayMode || t('routes.nodeRoutes.unknownMode')
  }
}

// 格式化网络地址
const formatNetwork = (network: number, mask: number) => {
  // 将数字形式的IP地址转换为点分十进制
  const ip = [
    (network >>> 24) & 255,
    (network >>> 16) & 255,
    (network >>> 8) & 255,
    network & 255
  ].join('.')
  return `${ip}/${mask}`
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style lang="scss" scoped>
.node-routes-display {
  .node-info-card {
    background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.05) 0%, rgba(var(--q-primary-rgb), 0.02) 100%);
    border-left: 4px solid var(--q-primary);
  }
  
  .route-title {
    font-size: 1.00rem !important;
    font-weight: 600;
    color: var(--q-primary);
    line-height: 1.4;
    display: flex;
    align-items: center;
  }
  
  .route-actions {
    padding: 8px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    
    .route-id-info {
      display: flex;
      align-items: center;
    }
    
    .action-buttons {
      display: flex;
      gap: 4px;
    }
  }
}
</style>
