<template>
  <div class="pending-connections-tab">
    <!-- 连接类型切换 -->
    <div class="row q-mb-md">
      <div class="col">
        <q-btn-toggle
          v-model="currentType"
          :options="typeOptions"
          spread
          no-caps
          unelevated
          @update:model-value="handleTypeChange"
        />
      </div>
    </div>

    <!-- 连接列表 -->
    <ResponsiveCardGrid
      :items="connections"
      :loading="loading"
      variant="standard"
      spacing="normal"
      empty-icon="schedule"
      :empty-title="$t(`routes.pendingConnections.no${currentType === 'incoming' ? 'Incoming' : 'Outgoing'}Connections`)"
    >
      <template #default="{ item: connection }">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" class="q-mr-sm">
                  <q-icon name="person" size="24px" />
                </q-avatar>
                <div>
                  <div class="text-h6">
                    {{ currentType === 'incoming' ? connection.source_user_name : connection.target_user_name }}
                  </div>
                  <div class="text-subtitle2 text-grey-6">
                    {{ currentType === 'incoming' ? connection.source_node_name : connection.target_node_name }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ currentType === 'incoming' ? connection.source_endpoint : connection.target_endpoint }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getStatusColor(connection.status)"
                :label="$t(`routes.connectionStatus.${connection.status}`)"
                size="sm"
              />
            </div>
            <div class="col-auto" v-if="currentType === 'incoming' && connection.status === 'pending'">
              <q-btn
                flat
                round
                icon="check"
                color="positive"
                size="sm"
                @click="$emit('approve', String(connection.id))"
                :title="$t('routes.pendingConnections.approve')"
              />
              <q-btn
                flat
                round
                icon="close"
                color="negative"
                size="sm"
                @click="$emit('reject', String(connection.id))"
                :title="$t('routes.pendingConnections.reject')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="connection.request_message">
          <div class="row">
            <div class="col">
              <q-banner class="bg-blue-1 text-primary">
                <template v-slot:avatar>
                  <q-icon name="message" />
                </template>
                {{ connection.request_message }}
              </q-banner>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-body2">
                <q-icon name="device_hub" size="sm" class="q-mr-xs" />
                {{ $t('routes.pendingConnections.vpnType') }}: 
                {{ connection.vpn_type }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-body2">
                <q-icon name="schedule" size="sm" class="q-mr-xs" />
                {{ $t('routes.pendingConnections.requestedAt') }}: 
                {{ formatDate(connection.created_at) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import type { PendingConnection } from '../../types'

interface Props {
  connections: PendingConnection[]
  loading: boolean
}

interface Emits {
  (e: 'approve', connectionId: string | number): void
  (e: 'reject', connectionId: string | number): void
  (e: 'type-change', type: 'incoming' | 'outgoing'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// 当前连接类型
const currentType = ref<'incoming' | 'outgoing'>('incoming')

const typeOptions = computed(() => [
  { 
    label: t('routes.pendingConnections.incoming'), 
    value: 'incoming' 
  },
  { 
    label: t('routes.pendingConnections.outgoing'), 
    value: 'outgoing' 
  }
])

// 处理类型变化
const handleTypeChange = (type: 'incoming' | 'outgoing') => {
  currentType.value = type
  emit('type-change', type)
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange'
    case 'approved': return 'positive'
    case 'rejected': return 'negative'
    default: return 'grey'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style lang="scss" scoped>
.pending-connections-tab {
  .connection-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
