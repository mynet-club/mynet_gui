<template>
  <PageLayout
    :title="$t('dashboard.title')"
    :subtitle="$t('dashboard.subtitle')"
    icon="dashboard"
  >
    <template #actions>
      <q-btn-group>
        <q-btn
          flat
          dense
          color="grey-7"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="isLoading"
        />
        <q-chip 
          :color="isConnected ? 'positive' : 'negative'"
          text-color="white"
          :icon="isConnected ? 'wifi' : 'wifi_off'"
          size="md"
        >
          {{ isConnected ? $t('dashboard.connected') : $t('dashboard.disconnected') }}
        </q-chip>
      </q-btn-group>
    </template>

    <!-- 加载状态 -->
    <q-inner-loading :showing="isLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <div v-if="!isLoading" class="dashboard-content">
      <q-banner v-if="dashboardData.totalNodes === 0" rounded class="q-mb-lg">
        <template #avatar><q-icon name="devices" color="primary" /></template>
        <div class="text-subtitle1">{{ $t('workflow.createFirstDevice') }}</div>
        <div class="text-body2">{{ $t('workflow.automaticDefaults') }}</div>
        <template #action><q-btn unelevated color="primary" :label="$t('nodes.createNode')" to="/app/nodes/create" /></template>
      </q-banner>
      <!-- 统计卡片 -->
      <DashboardStats 
        :dashboard-data="dashboardData"
        :online-rate="onlineRate"
        class="q-mb-lg"
      />
      
      <div class="row q-col-gutter-lg">
        <!-- 系统状态摘要 -->
        <div class="col-12 col-md-6">
          <NetworkHealthSummary
            :health-status="dashboardData.healthStatus"
            :health-message="dashboardData.healthMessage"
            :pending-tasks="dashboardData.pendingTasks"
            :last-update="dashboardData.lastUpdate"
          />
        </div>
        
        <!-- 最近活动 -->
        <div class="col-12 col-md-6">
          <RecentActivities :recent-activities="recentActivities" />
        </div>
      </div>
      
      <!-- 问题摘要（仅异常情况显示）-->
      <AbnormalItemsSection
        v-if="hasAbnormalItems"
        :offline-nodes="dashboardData.abnormalItems.offlineNodes"
        :pending-connections="pendingConnections"
        :unconfigured-nodes="dashboardData.abnormalItems.unconfiguredNodes"
        :total-nodes="dashboardData.totalNodes"
        :total-routes="dashboardData.totalRoutes"
        class="q-mt-lg"
      />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useDashboard } from '../../composables/useDashboard'
import PageLayout from '../../components/layout/PageLayout.vue'
import NetworkHealthSummary from '../../components/dashboard/NetworkHealthSummary.vue'
import AbnormalItemsSection from '../../components/dashboard/AbnormalItemsSection.vue'
import DashboardStats from '../../components/dashboard/DashboardStats.vue'
import RecentActivities from '../../components/dashboard/RecentActivities.vue'

const {
  dashboardData,
  realtimeData,
  recentActivities,
  isLoading,
  isConnected,
  onlineRate,
  pendingConnections,
  fetchDashboardData
} = useDashboard()

// 判断是否有异常项需要显示
const hasAbnormalItems = computed(() => {
  return dashboardData.value.abnormalItems.offlineNodes.length > 0 ||
         pendingConnections.value.length > 0 ||
         dashboardData.value.abnormalItems.unconfiguredNodes.length > 0
})

const handleRefresh = async () => {
  await fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style lang="scss" scoped>
.dashboard-content {
  // 遵循 8px 间距系统
  --module-gap: 32px;
}
</style>

<style lang="scss" scoped>
@import '../../styles/dashboard.scss';
</style>