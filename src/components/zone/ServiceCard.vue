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
          <span class="text-body2">{{ formatServiceUrl() }}</span>
        </div>
        
        <div class="detail-item">
          <q-icon name="security" size="xs" class="q-mr-xs" />
          <span class="text-body2">
            {{ service.service_auth_required ? $t('zoneServices.authRequired') : $t('zoneServices.noAuth') }}
          </span>
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
      <template v-if="service.is_owner">
        <q-btn
          flat
          size="sm"
          color="primary"
          icon="edit"
          :label="$t('common.edit')"
          @click="$emit('edit', service)"
        />
        
        <q-btn
          flat
          size="sm"
          color="positive"
          icon="share"
          :label="$t('zoneServices.share')"
          @click="$emit('share', service)"
        />

        <q-btn
          v-if="service.service_approval_status !== 'approved'"
          flat
          size="sm"
          color="info"
          icon="public"
          :label="$t('zoneServices.requestPublic')"
          @click="$emit('requestApproval', service)"
        />

        <q-btn
          flat
          size="sm"
          color="negative"
          icon="delete"
          :label="$t('common.delete')"
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
          :label="$t('zoneServices.connect')"
          @click="$emit('connect', service)"
        />
        
        <q-btn
          flat
          size="sm"
          color="grey"
          icon="info"
          :label="$t('common.details')"
          @click="$emit('details', service)"
        />
      </template>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useZoneServices } from '../../composables/useZoneServices'
import type { ZoneService } from '../../types/zoneService'

interface Props {
  service: ZoneService
  showActions?: boolean
}

interface Emits {
  (e: 'edit', service: ZoneService): void
  (e: 'delete', service: ZoneService): void
  (e: 'share', service: ZoneService): void
  (e: 'requestApproval', service: ZoneService): void
  (e: 'connect', service: ZoneService): void
  (e: 'details', service: ZoneService): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

defineEmits<Emits>()

const { t } = useI18n()
const { getServiceTypeConfig } = useZoneServices()

// 服务类型配置
const serviceTypeConfig = computed(() => getServiceTypeConfig(props.service.service_type))

// 格式化服务URL
const formatServiceUrl = () => {
  const { service_url, service_port, service_protocol } = props.service
  
  // 如果service_url不存在，返回默认值
  if (!service_url) {
    return 'N/A'
  }
  
  // 如果URL已经包含协议，直接返回
  if (service_url.startsWith('http://') || service_url.startsWith('https://')) {
    return service_url
  }
  
  // 否则构建完整的URL
  return `${service_protocol}://${service_url}:${service_port}`
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'positive'
    case 'inactive':
      return 'negative'
    case 'pending':
      return 'warning'
    default:
      return 'grey'
  }
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return t('common.active')
    case 'inactive':
      return t('common.inactive')
    case 'pending':
      return t('common.pending')
    default:
      return status
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
