<template>
  <PageLayout
    :title="$t('navigation.routes')"
    :subtitle="$t('routes.subtitle')"
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

      <!-- 统计卡片 -->
      <ResponsiveCardGrid
        :items="statsCards"
        :loading="loading"
        :loading-count="4"
        variant="compact"
        spacing="normal"
        :clickable="false"
        class="q-mb-lg"
      >
        <template #default="{ item }">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ item.value }}</div>
                <div class="text-body2 text-grey-6">{{ item.title }}</div>
              </div>
              <div>
                <q-icon :name="item.icon" size="2rem" :color="item.color" />
              </div>
            </div>
          </q-card-section>
        </template>
      </ResponsiveCardGrid>

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
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- 活跃路由 -->
          <q-tab-panel name="active">
            <NodeBasedRoutesTab
              :routes="activeRoutes"
              :loading="loading"
              @disconnect="handleDisconnectRoute"
              @view-details="handleViewRouteDetails"
              @edit-route="handleEditRoute"
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
            <AllFriendNodesTab
              :friends-data="allFriendNodesData"
              :loading="friendNodesLoading"
              @view-friend="handleViewFriend"
              @refresh="handleRefreshAllFriendNodes"
            />
          </q-tab-panel>


        </q-tab-panels>
      </q-card>

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
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useSocial } from '../../composables/useSocial'
import { useNotify } from '../../composables/useNotify'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import NodeBasedRoutesTab from '../../components/route/NodeBasedRoutesTab.vue'
import PendingConnectionsTab from '../../components/route/PendingConnectionsTab.vue'
import AllFriendNodesTab from '../../components/route/AllFriendNodesTab.vue'
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
  currentConnectionType,
  fetchOverview,
  fetchActiveRoutes,
  fetchPendingConnections,
  fetchFriendNodes,
  connectToNode,
  approveConnection,
  rejectConnection,
  disconnectRoute,
  handleConnectionTypeChange,
  init
} = useRoutes()

const {
  getAllFriendNodes
} = useSocial()

// 好友节点相关状态
const allFriendNodesData = ref(null)
const friendNodesLoading = ref(false)

// 统计卡片数据
const statsCards = computed(() => [
  {
    id: 'active_routes',
    title: t('routes.overview.activeRoutes'),
    value: overview.value.active_routes,
    icon: 'route',
    color: 'primary'
  },
  {
    id: 'pending_connections',
    title: t('routes.overview.pendingConnections'),
    value: overview.value.pending_connections,
    icon: 'schedule',
    color: 'orange'
  },
  {
    id: 'connected_nodes',
    title: t('routes.overview.connectedNodes'),
    value: overview.value.connected_nodes,
    icon: 'lan',
    color: 'positive'
  },
  {
    id: 'total_bandwidth',
    title: t('routes.overview.totalBandwidth'),
    value: overview.value.total_bandwidth,
    icon: 'network_check',
    color: 'info'
  }
])

// 响应式状态
const tab = ref('active')

// 对话框状态
const routeDetailsDialog = ref({
  show: false,
  route: null as any
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

const handleEditRoute = (route: any) => {
  // 导航到路由编辑页面
  router.push(`/app/routes/edit/${route.route_id}`)
}

const handleApproveConnection = (connectionId: string | number) => {
  approveConnection(connectionId)
}

const handleRejectConnection = (connectionId: string | number) => {
  rejectConnection(connectionId)
}

const handleViewFriend = (friendId: string | number) => {
  router.push(`/app/social?friend=${friendId}`)
}

// 好友节点相关方法
const handleRefreshAllFriendNodes = async () => {
  await fetchAllFriendNodes()
}

const fetchAllFriendNodes = async () => {
  try {
    friendNodesLoading.value = true
    const response = await getAllFriendNodes()
    allFriendNodesData.value = response
  } catch (error) {
    debug.error('获取所有好友节点失败:', error)
    notify.error(t('routes.fetchAllFriendNodesError'))
  } finally {
    friendNodesLoading.value = false
  }
}

const handleRefreshRoutes = () => {
  fetchOverview()
  fetchActiveRoutes()
  fetchPendingConnections()
  fetchFriendNodes()
  fetchAllFriendNodes() // 添加刷新所有好友节点
}

// 创建路由
const handleCreateRoute = () => {
  router.push('/app/routes/create/prev_1')
}

// 初始化
onMounted(async () => {
  await init()
  await fetchAllFriendNodes() // 初始化时获取所有好友节点
  
  // 处理来自社交页面的跳转
  const route = router.currentRoute.value
  if (route.query.tab) {
    tab.value = route.query.tab as string
  }
  if (route.query.friend) {
    // 如果指定了好友ID，可以在好友节点标签页中高亮显示
    debug.log('Show friend nodes for:', route.query.friend)
  }
})
</script>

<style lang="scss" scoped>
.stats-card {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
