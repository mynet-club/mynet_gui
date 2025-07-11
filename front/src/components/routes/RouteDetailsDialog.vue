<template>
  <div class="route-details-dialog">
    <div class="row q-gutter-md">
      <!-- 基本信息 -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('routes.details.basicInfo') }}</div>
            <div class="row q-gutter-md">
              <div class="col-12">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.routeId') }}:</strong> {{ route.id }}
                </div>
              </div>
              <div class="col-12">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.status') }}:</strong>
                  <q-chip
                    :color="getStatusColor(route.status)"
                    :label="$t(`routes.status.${route.status}`)"
                    size="sm"
                    class="q-ml-sm"
                  />
                </div>
              </div>
              <div class="col-12">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.connectionType') }}:</strong>
                  {{ $t(`routes.connectionType.${route.connection_type}`) }}
                </div>
              </div>
              <div class="col-12">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.createdAt') }}:</strong>
                  {{ formatDate(route.created_at) }}
                </div>
              </div>
              <div class="col-12">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.lastActive') }}:</strong>
                  {{ formatDate(route.last_active) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 节点信息 -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('routes.details.nodeInfo') }}</div>
            <div class="row q-gutter-md">
              <div class="col-12">
                <div class="text-subtitle1">{{ $t('routes.details.sourceNode') }}</div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.nodeName') }}:</strong> {{ route.source_node_name }}
                </div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.ipAddress') }}:</strong> {{ route.source_ip }}
                </div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.mask') }}:</strong> {{ route.source_mask }}
                </div>
              </div>
              <div class="col-12">
                <q-separator />
              </div>
              <div class="col-12">
                <div class="text-subtitle1">{{ $t('routes.details.targetNode') }}</div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.nodeName') }}:</strong> {{ route.target_node_name }}
                </div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.ipAddress') }}:</strong> {{ route.target_ip }}
                </div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.mask') }}:</strong> {{ route.target_mask }}
                </div>
              </div>
              <div class="col-12" v-if="route.friend_name">
                <q-separator />
                <div class="text-body2">
                  <strong>{{ $t('routes.details.friendName') }}:</strong> {{ route.friend_name }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 性能指标 -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('routes.details.performance') }}</div>
            <div class="row q-gutter-md text-center">
              <div class="col-12 col-md-3">
                <div class="text-h4 text-info">{{ route.bandwidth_usage }}</div>
                <div class="text-body2 text-grey-6">{{ $t('routes.details.bandwidth') }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="text-h4 text-positive">{{ route.latency }}ms</div>
                <div class="text-body2 text-grey-6">{{ $t('routes.details.latency') }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="text-h4" :class="route.packet_loss > 5 ? 'text-negative' : 'text-positive'">
                  {{ route.packet_loss }}%
                </div>
                <div class="text-body2 text-grey-6">{{ $t('routes.details.packetLoss') }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="text-h4 text-purple">{{ getUptime(route.created_at) }}</div>
                <div class="text-body2 text-grey-6">{{ $t('routes.details.uptime') }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 连接统计 -->
      <div class="col-12" v-if="connectionStats">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('routes.details.connectionStats') }}</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.bandwidthIn') }}:</strong> {{ connectionStats.bandwidth_in }}
                </div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.bandwidthOut') }}:</strong> {{ connectionStats.bandwidth_out }}
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-body2">
                  <strong>{{ $t('routes.details.bytesSent') }}:</strong> {{ formatBytes(connectionStats.bytes_sent) }}
                </div>
                <div class="text-body2">
                  <strong>{{ $t('routes.details.bytesReceived') }}:</strong> {{ formatBytes(connectionStats.bytes_received) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="row q-gutter-md q-mt-lg">
      <div class="col-12 col-md-6">
        <q-btn
          color="negative"
          icon="link_off"
          :label="$t('routes.details.disconnect')"
          @click="handleDisconnect"
          class="full-width"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-btn
          color="primary"
          icon="close"
          :label="$t('common.close')"
          @click="$emit('close')"
          class="full-width"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoutes } from '../../composables/useRoutes'
import type { Route } from '../../types'

interface Props {
  route: Route
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getConnectionStats, disconnectRoute } = useRoutes()

// 连接统计数据
const connectionStats = ref<any>(null)

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'grey'
    case 'connecting': return 'warning'
    case 'error': return 'negative'
    default: return 'grey'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 计算运行时间
const getUptime = (createdAt: string) => {
  const now = new Date()
  const created = new Date(createdAt)
  const diff = now.getTime() - created.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// 格式化字节
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理断开连接
const handleDisconnect = async () => {
  await disconnectRoute(props.route.id)
  emit('close')
}

// 初始化时获取连接统计
onMounted(async () => {
  try {
    connectionStats.value = await getConnectionStats(props.route.id)
  } catch (error) {
    console.error('Failed to load connection stats:', error)
  }
})
</script>

<style lang="scss" scoped>
.route-details-dialog {
  max-width: 1200px;
  width: 100%;
}
</style>
