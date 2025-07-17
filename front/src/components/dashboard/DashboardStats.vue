<template>
  <div class="dashboard-stats">
    <ResponsiveCardGrid
      :items="statsCards"
      variant="compact"
      spacing="normal"
      :clickable="false"
    >
      <template #default="{ item }">
        <q-card-section class="text-center">
          <q-icon :name="item.icon" size="2rem" :color="item.color" />
          <div class="text-h4 q-mt-sm">{{ item.value }}</div>
          <div class="text-caption text-grey-6">{{ item.title }}</div>
          <div v-if="item.subtitle" class="text-caption" :class="item.subtitleClass">
            {{ item.subtitle }}
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'

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

const props = defineProps<Props>()
const { t } = useI18n()

// 统计卡片数据
const statsCards = computed(() => [
  {
    id: 'total_nodes',
    title: t('dashboard.stats.totalNodes'),
    value: props.dashboardData.totalNodes,
    icon: 'dns',
    color: 'primary'
  },
  {
    id: 'online_nodes',
    title: t('dashboard.stats.onlineNodes'),
    value: props.dashboardData.onlineNodes,
    icon: 'wifi',
    color: 'positive',
    subtitle: `${props.onlineRate}% ${t('dashboard.stats.onlineRate')}`,
    subtitleClass: 'text-positive'
  },
  {
    id: 'total_routes',
    title: t('dashboard.stats.totalRoutes'),
    value: props.dashboardData.totalRoutes,
    icon: 'router',
    color: 'secondary'
  },
  {
    id: 'active_routes',
    title: t('dashboard.stats.activeRoutes'),
    value: props.dashboardData.activeRoutes,
    icon: 'check_circle',
    color: 'accent'
  }
])
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