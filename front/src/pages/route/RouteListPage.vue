<template>
  <q-page class="routes-page">
    <div class="q-pa-md">
      <!-- 页面标题 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('navigation.routes') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('routes.subtitle') }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="sync"
            :label="$t('routes.actions.refreshRoutes')"
            @click="handleRefreshRoutes"
            :loading="loading"
          />
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ overview.active_routes }}</div>
                  <div class="text-body2 text-grey-6">{{ $t('routes.overview.activeRoutes') }}</div>
                </div>
                <div>
                  <q-icon name="route" size="2rem" color="primary" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ overview.pending_connections }}</div>
                  <div class="text-body2 text-grey-6">{{ $t('routes.overview.pendingConnections') }}</div>
                </div>
                <div>
                  <q-icon name="schedule" size="2rem" color="orange" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ overview.connected_nodes }}</div>
                  <div class="text-body2 text-grey-6">{{ $t('routes.overview.connectedNodes') }}</div>
                </div>
                <div>
                  <q-icon name="lan" size="2rem" color="positive" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stats-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ overview.total_bandwidth }}</div>
                  <div class="text-body2 text-grey-6">{{ $t('routes.overview.totalBandwidth') }}</div>
                </div>
                <div>
                  <q-icon name="network_check" size="2rem" color="info" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 标签页 -->
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="active" :label="$t('routes.tabs.activeRoutes')" />
          <q-tab name="pending" :label="$t('routes.tabs.pendingConnections')" />
          <q-tab name="friends" :label="$t('routes.tabs.friendNodes')" />
          <q-tab name="config" :label="$t('routes.tabs.configuration')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- 活跃路由 -->
          <q-tab-panel name="active">
            <ActiveRoutesTab
              :routes="activeRoutes"
              :loading="loading"
              @disconnect="handleDisconnectRoute"
              @view-details="handleViewRouteDetails"
            />
          </q-tab-panel>

          <!-- 待处理连接 -->
          <q-tab-panel name="pending">
            <PendingConnectionsTab
              :connections="pendingConnections"
              :loading="loading"
              @approve="handleApproveConnection"
              @reject="handleRejectConnection"
              @type-change="handleConnectionTypeChange"
            />
          </q-tab-panel>

          <!-- 好友节点 -->
          <q-tab-panel name="friends">
            <FriendNodesTab
              :friend-nodes="friendNodes"
              :loading="loading"
              @connect="handleConnectToNode"
              @view-friend="handleViewFriend"
            />
          </q-tab-panel>

          <!-- 配置管理 -->
          <q-tab-panel name="config">
            <RouteConfigTab
              :config="routeConfig"
              :loading="loading"
              @download="handleDownloadConfig"
              @refresh="handleRefreshConfig"
            />
          </q-tab-panel>
        </q-tab-panels>
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

    <!-- 连接确认对话框 -->
    <q-dialog v-model="connectionDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('routes.dialogs.connectNode.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            {{ $t('routes.dialogs.connectNode.message', { 
              nodeName: connectionDialog.nodeName,
              friendName: connectionDialog.friendName 
            }) }}
          </div>
          <q-input
            v-model="connectionDialog.message"
            :label="$t('routes.dialogs.connectNode.messagePlaceholder')"
            type="textarea"
            rows="3"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn 
            flat 
            :label="$t('routes.actions.connect')" 
            color="primary" 
            @click="confirmConnectToNode"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useNotify } from '../../composables/useNotify'
import ActiveRoutesTab from '../../components/route/ActiveRoutesTab.vue'
import PendingConnectionsTab from '../../components/route/PendingConnectionsTab.vue'
import FriendNodesTab from '../../components/route/FriendNodesTab.vue'
import RouteConfigTab from '../../components/route/RouteConfigTab.vue'
import RouteDetailsDialog from '../../components/route/RouteDetailsDialog.vue'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()

const {
  loading,
  overview,
  activeRoutes,
  pendingConnections,
  friendNodes,
  routeConfig,
  currentConnectionType,
  fetchOverview,
  fetchActiveRoutes,
  fetchPendingConnections,
  fetchFriendNodes,
  fetchRouteConfig,
  connectToNode,
  approveConnection,
  rejectConnection,
  disconnectRoute,
  downloadRouteConfig,
  refreshRouteConfig,
  handleConnectionTypeChange,
  init
} = useRoutes()

// 响应式状态
const tab = ref('active')

// 对话框状态
const routeDetailsDialog = ref({
  show: false,
  route: null as any
})

const connectionDialog = ref({
  show: false,
  nodeId: '',
  nodeName: '',
  friendName: '',
  message: ''
})

// 事件处理
const handleDisconnectRoute = (routeId: string) => {
  disconnectRoute(routeId)
}

const handleViewRouteDetails = (route: any) => {
  routeDetailsDialog.value = {
    show: true,
    route
  }
}

const handleApproveConnection = (connectionId: string) => {
  approveConnection(connectionId)
}

const handleRejectConnection = (connectionId: string) => {
  rejectConnection(connectionId)
}

const handleConnectToNode = (nodeId: string, nodeName: string, friendName: string) => {
  connectionDialog.value = {
    show: true,
    nodeId,
    nodeName,
    friendName,
    message: ''
  }
}

const confirmConnectToNode = async () => {
  await connectToNode(
    connectionDialog.value.nodeId,
    connectionDialog.value.message
  )
  connectionDialog.value.show = false
}

const handleViewFriend = (friendId: string) => {
  router.push(`/social?friend=${friendId}`)
}

const handleDownloadConfig = () => {
  downloadRouteConfig()
}

const handleRefreshConfig = () => {
  refreshRouteConfig()
}

const handleRefreshRoutes = () => {
  fetchOverview()
  fetchActiveRoutes()
  fetchPendingConnections()
  fetchFriendNodes()
}

// 初始化
onMounted(() => {
  init()
  
  // 处理来自社交页面的跳转
  const route = router.currentRoute.value
  if (route.query.tab) {
    tab.value = route.query.tab as string
  }
  if (route.query.friend) {
    // 如果指定了好友ID，可以在友节点标签页中高亮显示
    console.log('Show friend nodes for:', route.query.friend)
  }
})
</script>

<style lang="scss" scoped>
.routes-page {
  .stats-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>