<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">流量统计</div>
        <q-btn-toggle
          v-model="currentTimeRange"
          @update:model-value="onTimeRangeChange"
          :options="[
            { label: '自连接建立', value: 'all' },
            { label: '最近 1 小时', value: '1h' },
            { label: '最近 6 小时', value: '6h' },
            { label: '最近 24 小时', value: '24h' }
          ]"
          color="primary"
          toggle-color="positive"
          size="sm"
          dense
        />
      </div>
      
      <!-- 动态时间范围提示 -->
      <div class="text-caption text-grey-6 q-mb-md">
        <q-icon name="info" size="xs" class="q-mr-xs" />
        {{ getCurrentRangeDescription() }}
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

const currentTimeRange = ref(props.historyTimeRange || '1h')

// 监听props变化，同步到本地状态
watch(() => props.historyTimeRange, (newValue) => {
  currentTimeRange.value = newValue
})

const onTimeRangeChange = (value: string) => {
  emit('updateTimeRange', value)
}

const getTimeRangeDescription = (range: string) => {
  const descriptions: Record<string, string> = {
    'all': '显示节点启动以来的累计流量统计',
    '1h': '显示最近1小时的流量统计',
    '6h': '显示最近6小时的流量统计',
    '24h': '显示最近24小时的流量统计'
  }
  return descriptions[range] || '流量统计'
}

const getCurrentRangeDescription = () => {
  return getTimeRangeDescription(currentTimeRange.value)
}

const getTimeRangeLabel = (range: string) => {
  const labels: Record<string, string> = {
    'all': '自节点启动',
    '1h': '最近1小时',
    '6h': '最近6小时',
    '24h': '最近24小时'
  }
  return labels[range] || range
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = sizes[i] || 'B'
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${size}`
}

const formatSpeed = (bytesPerSecond: number) => {
  if (!bytesPerSecond || bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  const size = sizes[i] || 'B/s'
  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2))} ${size}`
}
</script>

<style lang="scss" scoped>
.stat-item {
  text-align: center;
  padding: 1rem;
}
</style>
