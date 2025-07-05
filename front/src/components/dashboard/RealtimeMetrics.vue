<template>
  <q-card class="realtime-metrics">
    <q-card-section>
      <div class="text-h6">{{ $t('dashboard.realtimeMetrics') }}</div>
    </q-card-section>
    
    <q-card-section>
      <div class="row q-gutter-md">
        <!-- CPU使用率 -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="metric-item">
            <div class="metric-label">{{ $t('dashboard.cpuUsage') }}</div>
            <div class="metric-value">{{ realtimeData.cpuUsage }}%</div>
            <q-linear-progress 
              :value="realtimeData.cpuUsage / 100" 
              color="primary"
              class="q-mt-sm"
            />
          </div>
        </div>

        <!-- 内存使用率 -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="metric-item">
            <div class="metric-label">{{ $t('dashboard.memoryUsage') }}</div>
            <div class="metric-value">{{ realtimeData.memoryUsage }}%</div>
            <q-linear-progress 
              :value="realtimeData.memoryUsage / 100" 
              color="secondary"
              class="q-mt-sm"
            />
          </div>
        </div>

        <!-- 网络流量 -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="metric-item">
            <div class="metric-label">{{ $t('dashboard.networkTraffic') }}</div>
            <div class="metric-value">{{ realtimeData.networkTraffic }} MB/s</div>
            <q-linear-progress 
              :value="Math.min(realtimeData.networkTraffic / 1000, 1)" 
              color="accent"
              class="q-mt-sm"
            />
          </div>
        </div>

        <!-- 活跃连接数 -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="metric-item">
            <div class="metric-label">{{ $t('dashboard.activeConnections') }}</div>
            <div class="metric-value">{{ realtimeData.activeConnections }}</div>
            <q-linear-progress 
              :value="Math.min(realtimeData.activeConnections / 100, 1)" 
              color="positive"
              class="q-mt-sm"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  realtimeData: {
    cpuUsage: number
    memoryUsage: number
    networkTraffic: number
    activeConnections: number
  }
}

defineProps<Props>()
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