<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6">连接历史</div>
          <div class="text-caption text-grey-6">{{ getTimeRangeLabel() }}</div>
        </div>
        <q-btn-toggle
          v-model="historyViewMode"
          :options="[
            { label: '图表', value: 'chart' },
            { label: '列表', value: 'table' }
          ]"
          color="primary"
          toggle-color="primary"
          size="sm"
          dense
        />
      </div>

      <!-- 图表视图 -->
      <div v-if="historyViewMode === 'chart'" class="q-gutter-y-md">
        <!-- 延迟图表 -->
        <div>
          <div class="text-subtitle2 q-mb-sm">连接延迟</div>
          <div ref="latencyChartContainer" style="width: 100%; height: 300px;"></div>
        </div>
        
        <!-- 流量图表 -->
        <div>
          <div class="text-subtitle2 q-mb-sm">流量增量</div>
          <div ref="trafficChartContainer" style="width: 100%; height: 300px;"></div>
        </div>
        
        <!-- 连接状态图表 -->
        <div>
          <div class="text-subtitle2 q-mb-sm">连接状态</div>
          <div ref="statusChartContainer" style="width: 100%; height: 200px;"></div>
        </div>
      </div>

      <!-- 表格视图 -->
      <q-table
        v-else
        :rows="connectionHistory"
        :columns="historyColumns"
        row-key="snapshot_at"
        :pagination="{ rowsPerPage: 10 }"
        flat
        bordered
      >
        <template v-slot:body-cell-online="props">
          <q-td :props="props">
            <q-chip
              :color="props.value ? 'positive' : 'negative'"
              text-color="white"
              size="sm"
            >
              {{ props.value ? '在线' : '离线' }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-latency="props">
          <q-td :props="props">
            <q-chip
              :color="getLatencyColor(props.value)"
              text-color="white"
              size="sm"
            >
              {{ props.value ? `${props.value.toFixed(1)} ms` : $t('common.noData') }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-rx_bytes="props">
          <q-td :props="props">
            {{ formatBytes(props.value) }}
          </q-td>
        </template>
        <template v-slot:body-cell-tx_bytes="props">
          <q-td :props="props">
            {{ formatBytes(props.value) }}
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface ConnectionHistoryItem {
  snapshot_at: string
  online: boolean
  latency?: number
  rx_bytes?: number
  tx_bytes?: number
}

interface Props {
  connectionHistory: ConnectionHistoryItem[]
  loading?: boolean
  timeRange?: string
}

const props = defineProps<Props>()

const historyViewMode = ref<'chart' | 'table'>('chart')
const latencyChartContainer = ref<HTMLDivElement>()
const trafficChartContainer = ref<HTMLDivElement>()
const statusChartContainer = ref<HTMLDivElement>()

let latencyChart: ECharts | null = null
let trafficChart: ECharts | null = null
let statusChart: ECharts | null = null

const getTimeRangeLabel = () => {
  const labels: Record<string, string> = {
    'all': '自连接建立以来',
    '1h': '最近 1 小时',
    '6h': '最近 6 小时',
    '24h': '最近 24 小时'
  }
  return labels[props.timeRange || '1h'] || '最近 1 小时'
}

const historyColumns = [
  { name: 'snapshot_at', label: '时间', field: 'snapshot_at', align: 'left' as const, format: (val: string) => new Date(val).toLocaleString('zh-CN') },
  { name: 'online', label: '状态', field: 'online', align: 'center' as const },
  { name: 'latency', label: '延迟', field: 'latency', align: 'center' as const },
  { name: 'rx_bytes', label: '接收', field: 'rx_bytes', align: 'right' as const },
  { name: 'tx_bytes', label: '发送', field: 'tx_bytes', align: 'right' as const }
]

// 智能填充缺失数据点
const fillMissingDataPoints = (history: ConnectionHistoryItem[]) => {
  if (history.length < 2) return history

  // 计算所有相邻点之间的时间间隔（毫秒）
  const intervals: number[] = []
  for (let i = 1; i < history.length; i++) {
    const current = history[i]
    const previous = history[i - 1]
    if (current && previous) {
      const interval = new Date(current.snapshot_at).getTime() - new Date(previous.snapshot_at).getTime()
      intervals.push(interval)
    }
  }

  // 找出最常见的时间间隔（正常间隔）
  const intervalCounts = new Map<number, number>()
  intervals.forEach(interval => {
    const rounded = Math.round(interval / 60000) * 60000 // 四舍五入到最接近的分钟
    intervalCounts.set(rounded, (intervalCounts.get(rounded) || 0) + 1)
  })

  // 找出出现次数最多的间隔
  let normalInterval = 60000 // 默认1分钟
  let maxCount = 0
  intervalCounts.forEach((count, interval) => {
    if (count > maxCount) {
      maxCount = count
      normalInterval = interval
    }
  })

  console.log('检测到的正常时间间隔:', normalInterval / 1000, '秒, 出现次数:', maxCount)

  // 填充缺失的数据点
  const filled: ConnectionHistoryItem[] = []
  for (let i = 0; i < history.length; i++) {
    const currentItem = history[i]
    if (!currentItem) continue
    
    filled.push(currentItem)

    const nextItem = history[i + 1]
    if (nextItem) {
      const current = new Date(currentItem.snapshot_at).getTime()
      const next = new Date(nextItem.snapshot_at).getTime()
      const gap = next - current

      // 如果间隔大于正常间隔的1.5倍，说明有缺失数据
      if (gap > normalInterval * 1.5) {
        const missingCount = Math.floor(gap / normalInterval) - 1
        console.log(`检测到数据缺失: ${new Date(current).toLocaleString()} - ${new Date(next).toLocaleString()}, 需要填充 ${missingCount} 个点`)

        // 插入缺失的数据点
        for (let j = 1; j <= missingCount; j++) {
          const interpolatedTime = new Date(current + normalInterval * j)
          
          // 使用线性插值填充数据
          const ratio = j / (missingCount + 1)
          const interpolatedItem: ConnectionHistoryItem = {
            snapshot_at: interpolatedTime.toISOString(),
            online: currentItem.online, // 保持前一个状态
            latency: currentItem.latency && nextItem.latency 
              ? currentItem.latency + (nextItem.latency - currentItem.latency) * ratio
              : (currentItem.latency || 0),
            rx_bytes: currentItem.rx_bytes && nextItem.rx_bytes
              ? Math.round(currentItem.rx_bytes + (nextItem.rx_bytes - currentItem.rx_bytes) * ratio)
              : (currentItem.rx_bytes || 0),
            tx_bytes: currentItem.tx_bytes && nextItem.tx_bytes
              ? Math.round(currentItem.tx_bytes + (nextItem.tx_bytes - currentItem.tx_bytes) * ratio)
              : (currentItem.tx_bytes || 0)
          }
          filled.push(interpolatedItem)
        }
      }
    }
  }

  console.log('原始数据点数:', history.length, '填充后数据点数:', filled.length)
  return filled
}

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  if (props.connectionHistory.length === 0) {
    console.warn('ConnectionHistoryCard: 没有历史数据')
    return
  }
  
  console.log('ConnectionHistoryCard: 原始历史数据:', props.connectionHistory)
  console.log('ConnectionHistoryCard: 数据点数量:', props.connectionHistory.length)
  
  // 检查数据是否为实时快照（所有时间相同）
  if (props.connectionHistory.length > 1) {
    const firstTime = new Date(props.connectionHistory[0].snapshot_at).getTime()
    const lastTime = new Date(props.connectionHistory[props.connectionHistory.length - 1].snapshot_at).getTime()
    const timeDiff = Math.abs(lastTime - firstTime) / 1000 / 60 // 分钟
    console.log('ConnectionHistoryCard: 时间跨度（分钟）:', timeDiff)
    
    if (timeDiff < 1) {
      console.warn('ConnectionHistoryCard: 数据疑似为实时快照（时间跨度小于1分钟），无法绘制历史趋势图')
    }
  }
  
  // 应用智能填充
  const filledHistory = fillMissingDataPoints([...props.connectionHistory].reverse())
  
  // 准备数据
  const times = filledHistory.map(item => 
    new Date(item.snapshot_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  )
  
  console.log('ConnectionHistoryCard: x轴时间点:', times)
  
  const latencies = filledHistory.map(item => item.latency || 0)
  
  // 计算流量增量（当前值 - 前一个值）- 以字节为单位
  const rxIncrementsBytes: number[] = []
  const txIncrementsBytes: number[] = []
  
  for (let i = 0; i < filledHistory.length; i++) {
    const currentItem = filledHistory[i]
    const previousItem = filledHistory[i - 1]
    
    if (i === 0 || !currentItem) {
      rxIncrementsBytes.push(0)
      txIncrementsBytes.push(0)
    } else if (previousItem) {
      const rxDiff = (currentItem.rx_bytes || 0) - (previousItem.rx_bytes || 0)
      const txDiff = (currentItem.tx_bytes || 0) - (previousItem.tx_bytes || 0)
      // 确保非负
      rxIncrementsBytes.push(Math.max(0, rxDiff))
      txIncrementsBytes.push(Math.max(0, txDiff))
    } else {
      rxIncrementsBytes.push(0)
      txIncrementsBytes.push(0)
    }
  }
  
  // 动态确定最佳单位
  const maxBytes = Math.max(...rxIncrementsBytes, ...txIncrementsBytes)
  let trafficUnit = 'B'
  let trafficDivider = 1
  
  if (maxBytes >= 1024 * 1024) {
    trafficUnit = 'MB'
    trafficDivider = 1024 * 1024
  } else if (maxBytes >= 1024) {
    trafficUnit = 'KB'
    trafficDivider = 1024
  }
  
  // 转换为选定的单位
  const rxIncrements = rxIncrementsBytes.map(bytes => bytes / trafficDivider)
  const txIncrements = txIncrementsBytes.map(bytes => bytes / trafficDivider)
  
  const onlineStatus = filledHistory.map(item => item.online ? 1 : 0)
  
  // 延迟图表
  if (latencyChartContainer.value) {
    if (latencyChart) {
      latencyChart.dispose()
    }
    latencyChart = echarts.init(latencyChartContainer.value)
    latencyChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>延迟: {c} ms'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times
      },
      yAxis: {
        type: 'value',
        name: '延迟 (ms)'
      },
      series: [{
        name: '延迟',
        type: 'line',
        smooth: true,
        data: latencies,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 152, 0, 0.3)' },
            { offset: 1, color: 'rgba(255, 152, 0, 0.05)' }
          ])
        },
        itemStyle: {
          color: '#ff9800'
        }
      }]
    })
  }
  
  // 流量图表
  if (trafficChartContainer.value) {
    if (trafficChart) {
      trafficChart.dispose()
    }
    trafficChart = echarts.init(trafficChartContainer.value)
    trafficChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = params[0].axisValue + '<br/>'
          params.forEach((param: any) => {
            result += `${param.marker}${param.seriesName}: ${param.value.toFixed(2)} ${trafficUnit}<br/>`
          })
          return result
        }
      },
      legend: {
        data: ['接收增量', '发送增量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times
      },
      yAxis: {
        type: 'value',
        name: `流量增量 (${trafficUnit})`
      },
      series: [
        {
          name: '接收增量',
          type: 'line',
          smooth: true,
          data: rxIncrements,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
              { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
            ])
          },
          itemStyle: {
            color: '#2196f3'
          }
        },
        {
          name: '发送增量',
          type: 'line',
          smooth: true,
          data: txIncrements,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(76, 175, 80, 0.3)' },
              { offset: 1, color: 'rgba(76, 175, 80, 0.05)' }
            ])
          },
          itemStyle: {
            color: '#4caf50'
          }
        }
      ]
    })
  }
  
  // 连接状态图表（柱状图）
  if (statusChartContainer.value) {
    if (statusChart) {
      statusChart.dispose()
    }
    statusChart = echarts.init(statusChartContainer.value)
    statusChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const status = params[0].value === 1 ? '在线' : '离线'
          const color = params[0].value === 1 ? '#4caf50' : '#f44336'
          return `${params[0].axisValue}<br/><span style="color:${color}">● ${status}</span>`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: times
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        interval: 1,
        axisLabel: {
          formatter: (value: number) => value === 1 ? '在线' : '离线'
        }
      },
      series: [{
        name: '状态',
        type: 'bar',
        data: onlineStatus,
        itemStyle: {
          color: (params: any) => {
            return params.value === 1 ? '#4caf50' : '#f44336'
          }
        },
        barWidth: '60%'
      }]
    })
  }
}

// 辅助方法
const getLatencyColor = (latency: number) => {
  if (!latency) return 'grey'
  if (latency < 50) return 'positive'
  if (latency < 100) return 'info'
  if (latency < 200) return 'orange'
  return 'negative'
}

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 监听视图模式和历史数据变化
watch([historyViewMode, () => props.connectionHistory.length], () => {
  if (historyViewMode.value === 'chart' && props.connectionHistory.length > 0) {
    nextTick(() => {
      initCharts()
    })
  }
})

// 监听窗口大小变化
const handleResize = () => {
  latencyChart?.resize()
  trafficChart?.resize()
  statusChart?.resize()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
  if (historyViewMode.value === 'chart' && props.connectionHistory.length > 0) {
    initCharts()
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  latencyChart?.dispose()
  trafficChart?.dispose()
  statusChart?.dispose()
})
</script>

<style lang="scss" scoped>
</style>
