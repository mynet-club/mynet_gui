<template>
  <PageLayout
    :title="$t('navigation.pendingConnections')"
    :subtitle="$t('routes.pendingConnections.subtitle')"
    icon="schedule"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn
          color="primary"
          icon="sync"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="loading"
        />
      </div>
    </template>

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
      :items="currentConnections"
      :loading="loading"
      variant="standard"
      spacing="normal"
      empty-icon="schedule"
      :empty-title="$t(`routes.pendingConnections.no${currentType === 'incoming' ? 'Incoming' : 'Outgoing'}Connections`)"
      :clickable="false"
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
                text-color="white"
                size="sm"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              v-if="currentType === 'incoming' && connection.status === 'pending'"
              color="positive"
              icon="check"
              :label="$t('routes.pendingConnections.approve')"
              @click="handleApprove(connection.id)"
              size="sm"
            />
            <q-btn
              v-if="currentType === 'incoming' && connection.status === 'pending'"
              color="negative"
              icon="close"
              :label="$t('routes.pendingConnections.reject')"
              @click="handleReject(connection.id)"
              outline
              size="sm"
            />
            <q-btn
              v-if="currentType === 'outgoing'"
              color="grey"
              icon="info"
              :label="$t('routes.pendingConnections.viewDetails')"
              @click="handleViewDetails(connection)"
              flat
              size="sm"
            />
          </div>

          <!-- 请求消息 -->
          <div v-if="connection.request_message" class="q-mt-md">
            <q-banner class="bg-blue-1 text-primary">
              <template v-slot:avatar>
                <q-icon name="message" />
              </template>
              {{ connection.request_message }}
            </q-banner>
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

    <!-- 连接详情对话框 -->
    <q-dialog v-model="detailsDialog.show" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('routes.pendingConnections.connectionDetails') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="detailsDialog.connection">
            <!-- 连接详情内容 -->
            <div class="text-h6 q-mb-md">连接详情</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label>状态</q-item-label>
                      <q-item-label caption>{{ detailsDialog.connection.status }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>VPN类型</q-item-label>
                      <q-item-label caption>{{ detailsDialog.connection.vpn_type }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>请求时间</q-item-label>
                      <q-item-label caption>{{ formatDate(detailsDialog.connection.created_at) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useNotify } from '../../composables/useNotify'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import type { PendingConnection } from '../../types'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()

const {
  loading,
  pendingConnections,
  outgoingConnections,
  currentConnectionType,
  fetchPendingConnections,
  approveConnection,
  rejectConnection,
  handleConnectionTypeChange
} = useRoutes()

// 响应式状态
const currentType = ref<'incoming' | 'outgoing'>('incoming')

// 对话框状态
const detailsDialog = ref({
  show: false,
  connection: null as PendingConnection | null
})

// 计算属性
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

const currentConnections = computed(() => {
  return currentType.value === 'incoming' ? pendingConnections.value : outgoingConnections.value
})

// 事件处理
const handleTypeChange = (type: 'incoming' | 'outgoing') => {
  currentType.value = type
  handleConnectionTypeChange(type)
}

const handleApprove = async (connectionId: string | number) => {
  try {
    await approveConnection(connectionId)
    notify.success(t('routes.pendingConnections.approveSuccess'))
  } catch (error) {
    notify.error(t('routes.pendingConnections.approveError'))
  }
}

const handleReject = async (connectionId: string | number) => {
  try {
    await rejectConnection(connectionId)
    notify.success(t('routes.pendingConnections.rejectSuccess'))
  } catch (error) {
    notify.error(t('routes.pendingConnections.rejectError'))
  }
}

const handleViewDetails = (connection: PendingConnection) => {
  detailsDialog.value = {
    show: true,
    connection
  }
}

const handleRefresh = async () => {
  await fetchPendingConnections()
}

// 工具方法
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange'
    case 'approved': return 'positive'
    case 'rejected': return 'negative'
    default: return 'grey'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 初始化
onMounted(async () => {
  await fetchPendingConnections()
})
</script>

<style lang="scss" scoped>
.connection-card {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}
</style>