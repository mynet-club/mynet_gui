<template>
  <q-card class="service-card standard-card card-standard">
    <q-card-section class="service-card-content">
      <!-- 顶部：服务名称 + 状态 -->
      <div class="card-header">
        <div class="service-name">
          <q-icon
            :name="serviceTypeConfig?.icon || 'settings'"
            :color="serviceTypeConfig?.color || 'blue-grey-6'"
            size="18px"
          />
          <span class="text-subtitle2 text-weight-medium">{{ service.service_name }}</span>
        </div>
        <q-chip
          :class="`status-chip status-${getStatusColor(service.service_status)}`"
          dense
          size="10px"
        >
          <template v-slot:default>
            <q-icon
              :name="getStatusIcon(service.service_status)"
              size="18px"
              class="q-mr-xs"
            />
            {{ getStatusLabel(service.service_status) }}
          </template>
        </q-chip>
      </div>

      <!-- 中间：服务信息 -->
      <div class="card-body">
        <div class="info-left">
          <!-- 服务地址 -->
          <div class="info-row">
            <q-icon name="link" size="16px" color="blue-6" />
            <span class="text-body2 text-weight-medium">{{ formatServiceAddress() }}</span>
          </div>

          <!-- 服务类型 -->
          <div class="info-row">
            <q-icon name="category" size="16px" color="teal-6" />
            <span class="text-caption text-grey-7">{{ serviceTypeConfig?.label || service.service_type }}</span>
          </div>

          <!-- 认证状态 -->
          <div class="info-row">
            <q-icon name="security" size="16px" color="purple-6" />
            <span class="text-caption text-grey-7">{{ getAuthStatusText() }}</span>
          </div>

          <!-- 关联节点 -->
          <div v-if="(service as any).associated_node" class="info-row">
            <q-icon name="router" size="16px" color="indigo-6" />
            <span class="text-caption text-grey-7">{{ (service as any).associated_node }}</span>
          </div>
        </div>

        <div v-if="service.creator_name" class="info-right">
          <div class="os-info">
            <q-icon name="person_outline" size="20px" color="grey-6" />
            <span class="text-caption text-grey-7">{{ service.creator_name }}</span>
          </div>
        </div>
      </div>

      <!-- 底部：描述 + 操作按钮 -->
      <div class="card-footer">
        <div v-if="service.service_description" class="service-description">
          <span class="text-caption text-grey-7">{{ service.service_description }}</span>
        </div>
        <div v-if="showActions" class="action-buttons">
          <!-- 我的服务：显示管理操作 -->
          <template v-if="isMyService">
            <q-btn
              flat
              dense
              size="sm"
              color="primary"
              icon="edit"
              @click="$emit('edit', service)"
            >
              <q-tooltip>{{ $t('zoneServices.serviceCard.edit') }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              dense
              size="sm"
              color="negative"
              icon="delete"
              @click="$emit('delete', service)"
            >
              <q-tooltip>{{ $t('zoneServices.serviceCard.delete') }}</q-tooltip>
            </q-btn>
          </template>

          <!-- 其他服务：显示连接操作 -->
          <template v-else>
            <q-btn
              flat
              dense
              size="sm"
              color="primary"
              icon="launch"
              @click="$emit('connect', service)"
            >
              <q-tooltip>{{ $t('zoneServices.serviceCard.connect') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              color="grey-7"
              icon="info"
              @click="$emit('details', service)"
            >
              <q-tooltip>{{ $t('zoneServices.serviceCard.details') }}</q-tooltip>
            </q-btn>
          </template>
        </div>
      </div>
    </q-card-section>
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

// 获取状态图标
const getStatusIcon = (status: number | string) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  switch (numStatus) {
    case 1:
      return 'check_circle'
    case 0:
      return 'cancel'
    case 2:
      return 'pending'
    case -1:
      return 'error'
    default:
      return 'help'
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
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.service-card-content {
  padding: 0;
  display: flex;
  flex-direction: column;
}

// 顶部：名称 + 状态
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-default);
}

.service-name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.status-chip {
  flex-shrink: 0;
  font-size: 10px !important;
  padding: 4px 8px;
  border-radius: 12px;
  
  &.status-positive {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
  
  &.status-negative {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
  
  &.status-warning {
    background-color: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }
  
  &.status-grey {
    background-color: rgba(158, 158, 158, 0.1);
    color: #9e9e9e;
  }
}

// 中间：服务信息
.card-body {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: var(--content-bg);
}

.info-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .q-icon {
    flex-shrink: 0;
  }
  
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.info-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.os-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

// 底部：描述 + 操作
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--footer-bg);
  border-top: 1px solid var(--border-default);
  gap: 12px;
  min-height: 48px;
}

.service-description {
  flex: 1;
  min-width: 0;
  
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

// 主题变量
:root {
  --header-bg: #f5f5f5;
  --content-bg: #ffffff;
  --footer-bg: #fafafa;
  --border-default: #e0e0e0;
}

.body--dark {
  --header-bg: #1e1e1e;
  --content-bg: #121212;
  --footer-bg: #1a1a1a;
  --border-default: #2c2c2c;
}
</style>
