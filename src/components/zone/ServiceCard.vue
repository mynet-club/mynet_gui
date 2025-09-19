<template>
  <q-card class="service-card standard-card">
    <q-card-section class="q-pb-none">
      <div class="row items-center">
        <div class="col">
          <div class="row items-center q-gutter-xs">
            <q-icon
              :name="serviceTypeConfig?.icon || 'settings'"
              :color="serviceTypeConfig?.color || 'grey'"
              size="sm"
            />
            <div class="text-h6">{{ service.service_name }}</div>
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ serviceTypeConfig?.label || service.service_type }}
          </div>
        </div>
        <div class="col-auto">
          <q-chip
            :color="getStatusColor(service.service_status)"
            :label="getStatusLabel(service.service_status)"
            size="sm"
            outline
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-py-sm">
      <div v-if="service.service_description" class="text-body2 text-grey-7 q-mb-sm">
        {{ service.service_description }}
      </div>
      
      <div class="service-details q-gutter-xs">
        <div class="detail-item">
          <q-icon name="link" size="xs" class="q-mr-xs" />
          <span class="text-body2">{{ formatServiceAddress() }}</span>
        </div>
        
        <div class="detail-item">
          <q-icon name="security" size="xs" class="q-mr-xs" />
          <span class="text-body2">
            {{ getAuthStatusText() }}
          </span>
        </div>

        <!-- 服务状态 -->
        <div class="detail-item">
          <q-icon name="info" size="xs" class="q-mr-xs" />
          <span class="text-body2">
            {{ $t('zoneServices.serviceCard.statusLabel') }}: <span :class="getStatusTextClass(service.service_status)">
              {{ getStatusLabel(service.service_status) }}
            </span>
          </span>
        </div>

        <!-- 关联节点 -->
        <div v-if="(service as any).associated_node" class="detail-item">
          <q-icon name="hub" size="xs" class="q-mr-xs" />
          <span class="text-body2">{{ $t('zoneServices.serviceCard.nodeLabel') }}: {{ (service as any).associated_node }}</span>
        </div>

        <div v-if="service.creator_name" class="detail-item">
          <q-icon name="person" size="xs" class="q-mr-xs" />
          <span class="text-body2">{{ service.creator_name }}</span>
        </div>
      </div>
    </q-card-section>

    <!-- 操作按钮 -->
    <q-card-actions v-if="showActions" align="right" class="q-pa-md">
      <!-- 我的服务：显示管理操作 -->
      <template v-if="isMyService">
        <q-btn
          flat
          size="sm"
          color="primary"
          icon="edit"
          :label="$t('zoneServices.serviceCard.edit')"
          @click="$emit('edit', service)"
        />

        <q-btn
          flat
          size="sm"
          color="negative"
          icon="delete"
          :label="$t('zoneServices.serviceCard.delete')"
          @click="$emit('delete', service)"
        />
      </template>

      <!-- 其他服务：显示连接操作 -->
      <template v-else>
        <q-btn
          flat
          size="sm"
          color="primary"
          icon="launch"
          :label="$t('zoneServices.serviceCard.connect')"
          @click="$emit('connect', service)"
        />
        
        <q-btn
          flat
          size="sm"
          color="grey"
          icon="info"
          :label="$t('zoneServices.serviceCard.details')"
          @click="$emit('details', service)"
        />
      </template>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useZoneServices } from '../../composables/useZoneServices'
import type { ZoneService } from '../../types/zoneService'

interface Props {
  service: ZoneService
  showActions?: boolean
  category?: string // 添加分类属性来判断是否为"我的服务"
}

interface Emits {
  (e: 'edit', service: ZoneService): void
  (e: 'delete', service: ZoneService): void
  (e: 'connect', service: ZoneService): void
  (e: 'details', service: ZoneService): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  category: ''
})

defineEmits<Emits>()

const { t } = useI18n()
const { getServiceTypeConfig } = useZoneServices()

// 服务类型配置
const serviceTypeConfig = computed(() => getServiceTypeConfig(props.service.service_type))

// 判断是否为我的服务
const isMyService = computed(() => {
  return props.category === 'my'
})

// 格式化服务地址
const formatServiceAddress = () => {
  const { service_address, service_port, service_protocol } = props.service
  
  // 如果service_address不存在，返回默认值
  if (!service_address) {
    return 'N/A'
  }
  
  // 如果URL已经包含协议，直接返回
  if (service_address.startsWith('http://') || service_address.startsWith('https://')) {
    return service_address
  }
  
  // 否则构建完整的URL
  return `${service_protocol}://${service_address}:${service_port}`
}

// 获取状态颜色
const getStatusColor = (status: number | string) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  switch (numStatus) {
    case 1:
      return 'positive'
    case 0:
      return 'negative'
    case 2:
      return 'warning'
    default:
      return 'grey'
  }
}

// 获取状态标签
const getStatusLabel = (status: number | string) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  switch (numStatus) {
    case 1:
      return t('zoneServices.serviceCard.status.running')
    case 0:
      return t('zoneServices.serviceCard.status.stopped')
    case 2:
      return t('zoneServices.serviceCard.status.waiting')
    case -1:
      return t('zoneServices.serviceCard.status.error')
    default:
      return t('zoneServices.serviceCard.status.unknown')
  }
}

// 获取认证状态文本
const getAuthStatusText = () => {
  const authConfig = (props.service as any).service_config?.auth
  return authConfig?.required 
    ? t('zoneServices.serviceCard.auth.required')
    : t('zoneServices.serviceCard.auth.notRequired')
}

// 获取状态文字样式类
const getStatusTextClass = (status: number | string) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  switch (numStatus) {
    case 1:
      return 'text-positive'
    case 0:
      return 'text-negative'
    case 2:
      return 'text-warning'
    case -1:
      return 'text-negative'
    default:
      return 'text-grey'
  }
}
</script>

<style scoped lang="scss">
.service-card {
  height: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.service-details {
  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 2px;
    color: rgba(0, 0, 0, 0.6);
    
    .q-icon {
      opacity: 0.7;
    }
  }
}
</style>
