<template>
  <div class="dashboard-stats">
    <div class="row q-gutter-md">
      <!-- 总节点数 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="dns" size="2rem" color="primary" />
            <div class="text-h4 q-mt-sm">{{ dashboardData.totalNodes }}</div>
            <div class="text-caption text-grey-6">{{ $t('dashboard.stats.totalNodes') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 在线节点数 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="wifi" size="2rem" color="positive" />
            <div class="text-h4 q-mt-sm">{{ dashboardData.onlineNodes }}</div>
            <div class="text-caption text-grey-6">{{ $t('dashboard.stats.onlineNodes') }}</div>
            <div class="text-caption text-positive">{{ onlineRate }}% {{ $t('dashboard.stats.onlineRate') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 总路由数 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="router" size="2rem" color="secondary" />
            <div class="text-h4 q-mt-sm">{{ dashboardData.totalRoutes }}</div>
            <div class="text-caption text-grey-6">{{ $t('dashboard.stats.totalRoutes') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 活跃路由数 -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="check_circle" size="2rem" color="accent" />
            <div class="text-h4 q-mt-sm">{{ dashboardData.activeRoutes }}</div>
            <div class="text-caption text-grey-6">{{ $t('dashboard.stats.activeRoutes') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dashboardData: {
    totalNodes: number
    onlineNodes: number
    offlineNodes: number
    totalRoutes: number
    activeRoutes: number
    systemStatus: string
    lastUpdate: Date
  }
  onlineRate: number
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.dashboard-stats {
  .stat-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    .q-card-section {
      padding: 1.5rem;
    }
  }
}
</style> 