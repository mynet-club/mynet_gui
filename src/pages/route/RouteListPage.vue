<template>
  <PageLayout
    :title="$t('navigation.routes.title')"
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

    <!-- 快速导航卡片 -->
    <ResponsiveCardGrid
      :items="navigationCards"
      :loading="false"
      variant="standard"
      spacing="normal"
      :clickable="true"
      @card-click="handleNavigationClick"
    >
      <template #default="{ item }">
        <q-card-section class="text-center">
          <q-icon 
            :name="item.icon" 
            :color="item.color" 
            size="3rem" 
            class="q-mb-md" 
          />
          <div class="text-h6 q-mb-xs">{{ item.title }}</div>
          <div class="text-body2 text-grey-6 q-mb-md">{{ item.description }}</div>
          
          <!-- 统计信息 -->
          <div v-if="item.stats" class="row q-gutter-sm justify-center">
            <q-chip
              v-for="stat in item.stats"
              :key="stat.label"
              :color="stat.color"
              text-color="white"
              size="sm"
              dense
            >
              {{ stat.value }} {{ stat.label }}
            </q-chip>
          </div>
        </q-card-section>
        
        <q-card-actions align="center">
          <q-btn
            :color="item.color"
            :label="item.buttonText"
            :icon="item.buttonIcon"
            unelevated
          />
        </q-card-actions>
      </template>
    </ResponsiveCardGrid>

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
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useNotify } from '../../composables/useNotify'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import RouteDetailsDialog from '../../components/route/RouteDetailsDialog.vue'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()

const {
  loading,
  overview,
  activeRoutes,
  pendingConnections,
  fetchOverview,
  fetchActiveRoutes,
  fetchPendingConnections,
  init
} = useRoutes()

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

// 导航卡片数据
const navigationCards = computed(() => [
  {
    id: 'active-routes',
    title: t('routes.index.activeRoutes'),
    description: t('routes.index.activeRoutesDescription'),
    icon: 'route',
    color: 'primary',
    buttonText: t('common.view'),
    buttonIcon: 'arrow_forward',
    route: '/app/routes/active',
    stats: [
      {
        label: t('common.total'),
        value: activeRoutes.value.length,
        color: 'primary'
      }
    ]
  },
  {
    id: 'pending-connections',
    title: t('routes.index.pendingConnections'),
    description: t('routes.index.pendingConnectionsDescription'),
    icon: 'schedule',
    color: 'orange',
    buttonText: t('common.manage'),
    buttonIcon: 'settings',
    route: '/app/routes/pending',
    stats: [
      {
        label: t('common.pending'),
        value: pendingConnections.value.length,
        color: 'orange'
      }
    ]
  },
  {
    id: 'friend-nodes',
    title: t('routes.index.friendNodes'),
    description: t('routes.index.friendNodesDescription'),
    icon: 'lan',
    color: 'positive',
    buttonText: t('common.browse'),
    buttonIcon: 'explore',
    route: '/app/routes/friends',
    stats: [
      {
        label: t('common.available'),
        value: 0, // 这里可以添加好友节点数量的统计
        color: 'positive'
      }
    ]
  }
])

// 对话框状态
const routeDetailsDialog = ref({
  show: false,
  route: null as any
})

// 事件处理
const handleNavigationClick = (item: any, index: number) => {
  router.push(item.route)
}

const handleRefreshRoutes = () => {
  fetchOverview()
  fetchActiveRoutes()
  fetchPendingConnections()
}

// 创建路由
const handleCreateRoute = () => {
  router.push('/app/routes/create/prev_1')
}

// 初始化
onMounted(async () => {
  await init()
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
