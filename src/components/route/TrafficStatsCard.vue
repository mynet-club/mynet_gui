<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">流量统计 ({{ getTimeRangeLabel(historyTimeRange) }})</div>
        <q-btn-toggle
          v-model="currentTimeRange"
          @update:model-value="onTimeRangeChange"
          :options="[
            { label: '1小时', value: '1h' },
            { label: '6小时', value: '6h' },
            { label: '24小时', value: '24h' }
          ]"
          color="primary"
          toggle-color="primary"
          size="sm"
          dense
        />
      </div>
      
      <div class="row q-col-gutter-md">
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="arrow_downward" color="positive" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">总接收</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ formatBytes(trafficStats.totalRx) }}
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="arrow_upward" color="warning" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">总发送</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ formatBytes(trafficStats.totalTx) }}
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="download" color="info" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">平均下载速度</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ formatSpeed(trafficStats.avgDownSpeed) }}
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="upload" color="deep-orange" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">平均上传速度</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ formatSpeed(trafficStats.avgUpSpeed) }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface TrafficStats {
  totalRx: number
  totalTx: number
  avgDownSpeed: number
  avgUpSpeed: number
}

interface Props {
  trafficStats: TrafficStats
  historyTimeRange: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'updateTimeRange', value: string): void
}>()

const currentTimeRange = ref(props.historyTimeRange)

// 监听props变化，同步到本地状态
watch(() => props.historyTimeRange, (newValue) => {
  currentTimeRange.value = newValue
})

const onTimeRangeChange = (value: string) => {
  emit('updateTimeRange', value)
}

const getTimeRangeLabel = (range: string) => {
  const labels: Record<string, string> = {
    '1h': '最近1小时',
    '6h': '最近6小时',
    '24h': '最近24小时'
  }
  return labels[range] || range
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number) => {
  if (bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.stat-item {
  text-align: center;
  padding: 1rem;
}
</style>
