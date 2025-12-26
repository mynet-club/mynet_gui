<template>
  <div class="dashboard-stats">
    <ResponsiveCardGrid
      :items="statsCards"
      variant="compact"
      spacing="normal"
      :clickable="true"
    >
      <template #default="{ item }">
        <q-card-section class="text-center stat-card-content" @click="handleCardClick(item)">
          <q-icon :name="item.icon" size="2rem" :color="item.color" />
          <div class="text-h4 q-mt-sm">{{ item.value }}</div>
          <div class="text-caption text-grey-6">{{ item.title }}</div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
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
const router = useRouter()

// 统计卡片数据
const statsCards = computed(() => [
  {
    id: 'total_nodes',
    title: t('dashboard.stats.totalNodes'),
    value: props.dashboardData.totalNodes,
    icon: 'dns',
    color: 'primary',
    link: '/app/nodes'
  },
  {
    id: 'online_nodes',
    title: t('dashboard.stats.onlineNodes'),
    value: props.dashboardData.onlineNodes,
    icon: 'wifi',
    color: 'positive',
    link: '/app/nodes?filter=online'
  },
  {
    id: 'total_routes',
    title: t('dashboard.stats.totalRoutes'),
    value: props.dashboardData.totalRoutes,
    icon: 'router',
    color: 'secondary',
    link: '/app/routes'
  },
  {
    id: 'active_routes',
    title: t('dashboard.stats.activeRoutes'),
    value: props.dashboardData.activeRoutes,
    icon: 'check_circle',
    color: 'accent',
    link: '/app/routes?filter=active'
  }
])

const handleCardClick = (item: any) => {
  if (item.link) {
    router.push(item.link)
  }
}
</script>

<style lang="scss" scoped>
.dashboard-stats {
  .stat-card-content {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
      
      .q-icon {
        transform: scale(1.1);
        transition: transform 0.3s ease;
      }
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}
</style> 