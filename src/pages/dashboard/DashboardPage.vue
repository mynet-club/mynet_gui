<template>
  <PageLayout
    :title="$t('dashboard.title')"
    :subtitle="$t('dashboard.subtitle')"
    icon="dashboard"
  >
    <template #actions>
      <q-btn-group>
        <q-btn
          color="primary"
          icon="refresh"
          label="刷新"
          @click="handleRefresh"
          :loading="isLoading"
        />
        <q-chip 
          :color="isConnected ? 'positive' : 'negative'"
          text-color="white"
          :icon="isConnected ? 'wifi' : 'wifi_off'"
        >
          {{ isConnected ? $t('dashboard.connected') : $t('dashboard.disconnected') }}
        </q-chip>
      </q-btn-group>
    </template>

    <!-- 加载状态 -->
    <q-inner-loading :showing="isLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <div v-if="!isLoading">
      <!-- 1. 网络健康摘要 -->
      <NetworkHealthSummary
        :health-status="dashboardData.healthStatus"
        :health-message="dashboardData.healthMessage"
        :pending-tasks="dashboardData.pendingTasks"
        :last-update="dashboardData.lastUpdate"
        class="q-mb-lg"
      />
      
      <!-- 2. 异常优先区 -->
      <AbnormalItemsSection
        :offline-nodes="dashboardData.abnormalItems.offlineNodes"
        :pending-connections="pendingConnections"
        :unconfigured-nodes="dashboardData.abnormalItems.unconfiguredNodes"
        :total-nodes="dashboardData.totalNodes"
        :total-routes="dashboardData.totalRoutes"
        class="q-mb-lg"
      />
      
      <!-- 3. 快速操作 -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="flash_on" color="primary" class="q-mr-sm" />
            快速操作
          </div>
          <div class="row q-gutter-md">
            <q-btn
              color="primary"
              icon="add"
              label="创建节点"
              @click="$router.push('/app/nodes/create')"
              class="col"
              unelevated
            />
            <q-btn
              color="secondary"
              icon="add_road"
              label="创建路由"
              @click="$router.push('/app/routes/create')"
              class="col"
              unelevated
            />
            <q-btn
              v-if="dashboardData.pendingTasks.some(t => t.type === 'pending_connection')"
              color="warning"
              icon="schedule"
              :label="`处理连接 (${pendingConnections.length})`"
              @click="$router.push('/app/routes/pending')"
              class="col"
              unelevated
            />
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 4. 统计卡片（可点击）-->
      <DashboardStats 
        :dashboard-data="dashboardData"
        :online-rate="onlineRate"
        class="q-mb-lg"
      />
      
      <!-- 5. 最近活动 -->
      <RecentActivities :recent-activities="recentActivities" />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

const handleRefresh = async () => {
  await fetchDashboardData()
}
</script>

<style lang="scss" scoped>
@import '../../styles/dashboard.scss';
</style>