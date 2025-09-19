<template>
  <PageLayout
    :title="$t('dashboard.title')"
    :subtitle="$t('dashboard.subtitle')"
    icon="dashboard"
  >
    <template #actions>
      <q-chip 
        :color="isConnected ? 'positive' : 'negative'"
        text-color="white"
        :icon="isConnected ? 'wifi' : 'wifi_off'"
      >
        {{ isConnected ? $t('dashboard.connected') : $t('dashboard.disconnected') }}
      </q-chip>
    </template>

    <!-- 加载状态 -->
    <q-inner-loading :showing="isLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <!-- 统计卡片 -->
    <DashboardStats 
      :dashboard-data="dashboardData"
      :online-rate="onlineRate"
      class="q-mb-lg"
    />

    <!-- 实时指标和最近活动 -->
    <div class="row q-gutter-md">
      <div class="col-12 col-lg-8">
        <RealtimeMetrics :realtime-data="realtimeData" />
      </div>
      <div class="col-12 col-lg-4">
        <RecentActivities :recent-activities="recentActivities" />
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { useDashboard } from '../../composables/useDashboard'
import PageLayout from '../../components/layout/PageLayout.vue'
import DashboardStats from '../../components/dashboard/DashboardStats.vue'
import RealtimeMetrics from '../../components/dashboard/RealtimeMetrics.vue'
import RecentActivities from '../../components/dashboard/RecentActivities.vue'

const {
  dashboardData,
  realtimeData,
  recentActivities,
  isLoading,
  isConnected,
  onlineRate
} = useDashboard()
</script>

<style lang="scss" scoped>
@import '../../styles/dashboard.scss';
</style>