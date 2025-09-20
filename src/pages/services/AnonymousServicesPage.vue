<template>
  <PageLayout
    :title="$t('zoneServices.navigation.anonymousServices')"
    :subtitle="$t('zoneServices.navigation.anonymousServicesDescription')"
    icon="visibility_off"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn
          color="grey-7"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="loading"
        />
      </div>
    </template>

    <div class="section-header q-mb-md">
      <h5 class="q-my-none">{{ $t('zoneServices.categories.anonymous') }}</h5>
      <p class="text-grey-6 q-mt-xs q-mb-none">
        {{ $t('zoneServices.categories.anonymousDesc') }}
      </p>
    </div>
    
    <ResponsiveCardGrid
      :items="anonymousServices"
      :loading="loading"
      variant="standard"
      spacing="normal"
      :empty-icon="'visibility_off'"
      :empty-title="$t('zoneServices.empty.anonymousServices')"
      :empty-description="$t('zoneServices.empty.anonymousServicesDesc')"
    >
      <template #default="{ item }">
        <ServiceCard
          :service="item"
          category="anonymous"
          @connect="handleConnect"
          @details="handleDetails"
        />
      </template>
    </ResponsiveCardGrid>

    <!-- 服务详情对话框 -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="max-width: 600px; width: 100%">
        <q-card-section>
          <div class="text-h6">{{ $t('zoneServices.serviceCard.details') }}</div>
        </q-card-section>

        <q-card-section v-if="selectedService">
          <div v-html="formatServiceDetails(selectedService)"></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import ServiceCard from '../../components/zone/ServiceCard.vue'
import { useZoneServices } from '../../composables/useZoneServices'
import type { ZoneService } from '../../types/zoneService'

const { t } = useI18n()
const $q = useQuasar()

// 使用服务管理 composable
const {
  loading,
  anonymousServices,
  loadAllServices,
  getServiceTypeConfig
} = useZoneServices()

// 界面状态
const showDetailsDialog = ref(false)
const selectedService = ref<ZoneService | null>(null)

// 页面初始化
onMounted(async () => {
  await handleRefresh()
})

// 刷新数据
const handleRefresh = async () => {
  await loadAllServices()
}

// 连接到服务
const handleConnect = async (service: ZoneService) => {
  try {
    // 这里可以添加连接逻辑
    $q.notify({
      type: 'info',
      message: t('zoneServices.messages.connectAttempt', { name: service.service_name }),
      position: 'top'
    })
  } catch (error) {
    console.error('Connect to service failed:', error)
    $q.notify({
      type: 'negative',
      message: t('zoneServices.errors.connectFailed'),
      position: 'top'
    })
  }
}

// 查看服务详情
const handleDetails = (service: ZoneService) => {
  selectedService.value = service
  showDetailsDialog.value = true
}

// 格式化服务地址
const formatServiceAddress = (service: ZoneService) => {
  const { service_address, service_port, service_protocol } = service
  
  if (!service_address) {
    return 'N/A'
  }
  
  if (service_address.startsWith('http://') || service_address.startsWith('https://')) {
    return service_address
  }
  
  return `${service_protocol}://${service_address}:${service_port}`
}

// 格式化服务详情
const formatServiceDetails = (service: ZoneService) => {
  return `
    <div><strong>${t('zoneServices.form.serviceName')}:</strong> ${service.service_name}</div>
    <div><strong>${t('zoneServices.form.serviceType')}:</strong> ${service.service_type}</div>
    <div><strong>${t('zoneServices.form.serviceAddress')}:</strong> ${formatServiceAddress(service)}</div>
    <div><strong>${t('zoneServices.form.serviceProtocol')}:</strong> ${service.service_protocol.toUpperCase()}</div>
    ${service.service_description ? `<div><strong>${t('zoneServices.form.serviceDescription')}:</strong> ${service.service_description}</div>` : ''}
  `
}
</script>

<style scoped lang="scss">
.section-header {
  h5 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
  }
}
</style>