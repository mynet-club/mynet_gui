<template>
  <q-card class="realtime-metrics">
    <q-card-section>
      <div class="text-h6">{{ $t('dashboard.realtimeMetrics') }}</div>
    </q-card-section>
    
    <q-card-section>
      <ResponsiveCardGrid
        :items="metricsCards"
        variant="compact"
        :show-borders="false"
      >
        <template #default="{ item }">
          <div class="metric-item">
            <div class="metric-label">{{ item.title }}</div>
            <div class="metric-value">{{ item.displayValue }}</div>
            <q-linear-progress 
              :value="item.progress" 
              :color="item.color"
              class="q-mt-sm"
            />
          </div>
        </template>
      </ResponsiveCardGrid>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'

interface Props {
  realtimeData: {
    cpuUsage: number
    memoryUsage: number
    networkTraffic: number
    activeConnections: number
  }
}

const props = defineProps<Props>()
const { t } = useI18n()

// 实时指标卡片数据
const metricsCards = computed(() => [
  {
    id: 'cpu_usage',
    title: t('dashboard.cpuUsage'),
    displayValue: `${props.realtimeData.cpuUsage}%`,
    progress: props.realtimeData.cpuUsage / 100,
    color: 'primary'
  },
  {
    id: 'memory_usage',
    title: t('dashboard.memoryUsage'),
    displayValue: `${props.realtimeData.memoryUsage}%`,
    progress: props.realtimeData.memoryUsage / 100,
    color: 'secondary'
  },
  {
    id: 'network_traffic',
    title: t('dashboard.networkTraffic'),
    displayValue: `${props.realtimeData.networkTraffic} MB/s`,
    progress: Math.min(props.realtimeData.networkTraffic / 1000, 1),
    color: 'accent'
  },
  {
    id: 'active_connections',
    title: t('dashboard.activeConnections'),
    displayValue: props.realtimeData.activeConnections.toString(),
    progress: Math.min(props.realtimeData.activeConnections / 100, 1),
    color: 'positive'
  }
])
</script>

<style lang="scss" scoped>
.realtime-metrics {
  .metric-item {
    text-align: center;
    
    .metric-label {
      font-size: 0.875rem;
      color: var(--q-grey-6);
      margin-bottom: 0.5rem;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  }
}
</style> 