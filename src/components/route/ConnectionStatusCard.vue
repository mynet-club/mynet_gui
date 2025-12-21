<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">连接状态</div>
      <div class="row q-col-gutter-md">
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon 
              :name="connectionDetails.online ? 'link' : 'link_off'" 
              :color="connectionDetails.online ? 'positive' : 'negative'"
              size="md"
            />
            <div class="text-caption text-grey-6 q-mt-xs">连接状态</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ connectionDetails.online ? '在线' : '离线' }}
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="speed" color="info" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">连接类型</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ getConnectionTypeName(connectionDetails.conn_type) }}
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="timer" color="orange" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">延迟</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ connectionDetails.latency ? `${connectionDetails.latency.toFixed(1)} ms` : 'N/A' }}
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-item">
            <q-icon name="schedule" color="grey" size="md" />
            <div class="text-caption text-grey-6 q-mt-xs">最后可见</div>
            <div class="text-subtitle1 text-weight-medium">
              {{ formatDateTime(connectionDetails.seen_at) }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '../../utils/dateFormat'

interface Props {
  connectionDetails: any
}

defineProps<Props>()

const getConnectionTypeName = (type: string) => {
  if (!type) return 'N/A'
  
  const typeMap: Record<string, string> = {
    'direct_ipv4': '直连 IPv4',
    'direct_ipv6': '直连 IPv6',
    'relay': '中继',
    'derp': 'DERP 中继'
  }
  return typeMap[type] || type
}

const formatDateTime = formatRelativeTime
</script>

<style lang="scss" scoped>
.stat-item {
  text-align: center;
  padding: 1rem;
}
</style>
