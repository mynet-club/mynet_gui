<template>
  <div class="dashboard-stats">
    <ResponsiveCardGrid
      :items="statsCards"
      variant="compact"
      spacing="loose"
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

// 统计卡片数据 - 减少颜色种类
const statsCards = computed(() => [
  {
    id: 'total_nodes',
    title: t('dashboard.stats.totalNodes'),
    value: props.dashboardData.totalNodes,
    icon: 'dns',
    color: 'grey-7',
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
    color: 'grey-7',
    link: '/app/routes'
  },
  {
    id: 'active_routes',
    title: t('dashboard.stats.activeRoutes'),
    value: props.dashboardData.activeRoutes,
    icon: 'check_circle',
    color: 'grey-7',
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
@import '../../styles/design-tokens.scss';

.dashboard-stats {
  .stat-card-content {
    cursor: pointer;
    padding: $spacing-lg;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--color-bg-primary);
    }
    
    .q-icon {
      margin-bottom: $spacing-sm;
    }
    
    .text-h4 {
      font-size: $font-size-3xl;
      font-weight: $font-weight-semibold;
      color: var(--color-text-primary);
    }
  }
}
</style> 