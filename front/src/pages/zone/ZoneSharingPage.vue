<template>
  <q-page class="zone-sharing-page">
    <div class="q-pa-md">
      <!-- 页面标题 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('navigation.zoneSharing') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('zoneServices.subtitle') }}
          </p>
        </div>
        <div class="col-auto q-gutter-sm">
          <q-btn
            color="primary"
            icon="add"
            :label="$t('zoneServices.addService')"
            @click="showServiceDialog = true"
          />
          <q-btn
            color="grey-7"
            icon="refresh"
            :label="$t('common.refresh')"
            @click="handleRefresh"
            :loading="loading"
          />
        </div>
      </div>

      <!-- 当前区域信息 -->
      <div v-if="currentZone" class="row q-mb-lg">
        <div class="col-12">
          <q-card class="zone-info-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ $t('zoneServices.currentZone') }}</div>
                  <div class="text-body1 q-mt-sm">
                    <q-chip 
                      color="primary"
                      :label="currentZone.zone_name" 
                      size="md"
                      icon="public"
                    />
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip
                    color="info"
                    :label="`${totalServices} ${$t('zoneServices.servicesCount')}`"
                    icon="apps"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 服务分类标签 -->
      <div class="category-tabs q-mb-lg">
        <q-tabs
          v-model="activeCategory"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab
            v-for="category in serviceCategories"
            :key="category.key"
            :name="category.key"
            :icon="category.icon"
            :label="category.title"
          />
        </q-tabs>
      </div>

      <!-- 服务内容区域 -->
      <q-tab-panels v-model="activeCategory" animated>
        <!-- 公共服务 -->
        <q-tab-panel name="public" class="q-pa-none">
          <div class="section-header q-mb-md">
            <h5 class="q-my-none">{{ $t('zoneServices.categories.public') }}</h5>
            <p class="text-grey-6 q-mt-xs q-mb-none">
              {{ $t('zoneServices.categories.publicDesc') }}
            </p>
          </div>
          
          <ResponsiveCardGrid
            :items="publicServices"
            :loading="loading"
            variant="standard"
            spacing="normal"
            :empty-icon="'public'"
            :empty-title="$t('zoneServices.empty.publicServices')"
            :empty-description="$t('zoneServices.empty.publicServicesDesc')"
          >
            <template #default="{ item }">
              <ServiceCard
                :service="item"
                @connect="handleConnect"
                @details="handleDetails"
              />
            </template>
          </ResponsiveCardGrid>
        </q-tab-panel>

        <!-- 好友分享 -->
        <q-tab-panel name="friend" class="q-pa-none">
          <div class="section-header q-mb-md">
            <h5 class="q-my-none">{{ $t('zoneServices.categories.friend') }}</h5>
            <p class="text-grey-6 q-mt-xs q-mb-none">
              {{ $t('zoneServices.categories.friendDesc') }}
            </p>
          </div>
          
          <ResponsiveCardGrid
            :items="friendServices"
            :loading="loading"
            variant="standard"
            spacing="normal"
            :empty-icon="'group'"
            :empty-title="$t('zoneServices.empty.friendServices')"
            :empty-description="$t('zoneServices.empty.friendServicesDesc')"
          >
            <template #default="{ item }">
              <ServiceCard
                :service="item"
                @connect="handleConnect"
                @details="handleDetails"
              />
            </template>
          </ResponsiveCardGrid>
        </q-tab-panel>

        <!-- 匿名共享 -->
        <q-tab-panel name="anonymous" class="q-pa-none">
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
                @connect="handleConnect"
                @details="handleDetails"
              />
            </template>
          </ResponsiveCardGrid>
        </q-tab-panel>

        <!-- 我的服务 -->
        <q-tab-panel name="my" class="q-pa-none">
          <div class="section-header q-mb-md">
            <div class="row items-center">
              <div class="col">
                <h5 class="q-my-none">{{ $t('zoneServices.categories.my') }}</h5>
                <p class="text-grey-6 q-mt-xs q-mb-none">
                  {{ $t('zoneServices.categories.myDesc') }}
                </p>
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  icon="add"
                  :label="$t('zoneServices.addService')"
                  @click="showServiceDialog = true"
                  size="sm"
                />
              </div>
            </div>
          </div>
          
          <ResponsiveCardGrid
            :items="myServices"
            :loading="loading"
            variant="standard"
            spacing="normal"
            :empty-icon="'person_add'"
            :empty-title="$t('zoneServices.empty.myServices')"
            :empty-description="$t('zoneServices.empty.myServicesDesc')"
          >
            <template #default="{ item }">
              <ServiceCard
                :service="item"
                @edit="handleEdit"
                @delete="handleDelete"
                @share="handleShare"
                @requestApproval="handleRequestApproval"
                @connect="handleConnect"
                @details="handleDetails"
              />
            </template>
            
            <template #emptyAction>
              <q-btn
                color="primary"
                :label="$t('zoneServices.addFirstService')"
                @click="showServiceDialog = true"
              />
            </template>
          </ResponsiveCardGrid>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- 服务编辑对话框 -->
    <ServiceEditDialog
      v-model="showServiceDialog"
      :service="editingService || undefined"
      @success="handleServiceSuccess"
    />

    <!-- 分享对话框 -->
    <q-dialog v-model="showShareDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('zoneServices.shareService') }}</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            {{ $t('zoneServices.shareServiceDesc') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="shareMessage"
            :label="$t('zoneServices.shareMessage')"
            type="textarea"
            rows="3"
            outlined
            :placeholder="$t('zoneServices.shareMessagePlaceholder')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :label="$t('zoneServices.confirmShare')"
            @click="confirmShare"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 申请公开对话框 -->
    <q-dialog v-model="showApprovalDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('zoneServices.requestPublic') }}</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            {{ $t('zoneServices.requestPublicDesc') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="approvalReason"
            :label="$t('zoneServices.approvalReason')"
            type="textarea"
            rows="3"
            outlined
            :placeholder="$t('zoneServices.approvalReasonPlaceholder')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :label="$t('zoneServices.submitRequest')"
            @click="confirmApproval"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useZoneServices } from '../../composables/useZoneServices'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import ServiceCard from '../../components/zone/ServiceCard.vue'
import ServiceEditDialog from '../../components/zone/ServiceEditDialog.vue'
import type { ZoneService } from '../../types/zoneService'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

const {
  loading,
  publicServices,
  friendServices,
  anonymousServices,
  myServices,
  serviceCategories,
  loadAllServices,
  deleteService,
  shareService,
  requestApproval
} = useZoneServices()

// 状态
const activeCategory = ref('public')
const showServiceDialog = ref(false)
const showShareDialog = ref(false)
const showApprovalDialog = ref(false)
const editingService = ref<ZoneService | undefined>()
const sharingService = ref<ZoneService | undefined>()
const approvalService = ref<ZoneService | undefined>()
const shareMessage = ref('')
const approvalReason = ref('')

// 计算属性
const currentZone = computed(() => authStore.currentZone)

const totalServices = computed(() => {
  return publicServices.value.length + 
         friendServices.value.length + 
         anonymousServices.value.length + 
         myServices.value.length
})

// 页面加载
onMounted(async () => {
  await loadAllServices()
})

// 刷新数据
const handleRefresh = async () => {
  await loadAllServices()
}

// 编辑服务
const handleEdit = (service: ZoneService) => {
  editingService.value = service
  showServiceDialog.value = true
}

// 删除服务
const handleDelete = async (service: ZoneService) => {
  $q.dialog({
    title: t('zoneServices.confirmDelete'),
    message: t('zoneServices.deleteWarning', { name: service.service_name }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await deleteService(service.service_id)
    if (success) {
      await handleRefresh()
    }
  })
}

// 分享服务
const handleShare = (service: ZoneService) => {
  sharingService.value = service
  shareMessage.value = ''
  showShareDialog.value = true
}

// 确认分享
const confirmShare = async () => {
  if (!sharingService.value) return
  
  // TODO: 这里需要用户选择分享给哪个好友
  // 暂时使用模拟的用户ID
  const targetUserId = 1002 // 这里应该通过用户选择器获取
  
  const success = await shareService(
    sharingService.value.service_id, 
    targetUserId, 
    shareMessage.value
  )
  
  if (success) {
    showShareDialog.value = false
    sharingService.value = undefined
    shareMessage.value = ''
  }
}

// 申请公开
const handleRequestApproval = (service: ZoneService) => {
  approvalService.value = service
  approvalReason.value = ''
  showApprovalDialog.value = true
}

// 确认申请公开
const confirmApproval = async () => {
  if (!approvalService.value) return
  
  const success = await requestApproval(
    approvalService.value.service_id, 
    approvalReason.value
  )
  
  if (success) {
    showApprovalDialog.value = false
    approvalService.value = undefined
    approvalReason.value = ''
    await handleRefresh()
  }
}

// 连接服务
const handleConnect = (service: ZoneService) => {
  const serviceUrl = formatServiceUrl(service)
  window.open(serviceUrl, '_blank')
}

// 查看服务详情
const handleDetails = (service: ZoneService) => {
  $q.dialog({
    title: service.service_name,
    message: `
      <div><strong>${t('zoneServices.form.serviceType')}:</strong> ${service.service_type}</div>
      <div><strong>${t('zoneServices.form.serviceUrl')}:</strong> ${formatServiceUrl(service)}</div>
      <div><strong>${t('zoneServices.form.serviceProtocol')}:</strong> ${service.service_protocol.toUpperCase()}</div>
      <div><strong>${t('zoneServices.authRequired')}:</strong> ${service.service_auth_required ? t('common.yes') : t('common.no')}</div>
      ${service.service_description ? `<div><strong>${t('zoneServices.form.serviceDescription')}:</strong> ${service.service_description}</div>` : ''}
    `,
    html: true
  })
}

// 服务操作成功回调
const handleServiceSuccess = async () => {
  editingService.value = undefined
  await handleRefresh()
}

// 格式化服务URL
const formatServiceUrl = (service: ZoneService) => {
  const { service_url, service_port, service_protocol } = service
  
  // 如果service_url不存在，返回默认值
  if (!service_url) {
    return 'N/A'
  }
  
  if (service_url.startsWith('http://') || service_url.startsWith('https://')) {
    return service_url
  }
  
  return `${service_protocol}://${service_url}:${service_port}`
}
</script>

<style scoped lang="scss">
.zone-sharing-page {
  .zone-info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    .q-chip {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }
  
  .category-tabs {
    .q-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .section-header {
    h5 {
      color: #1976d2;
      font-weight: 600;
    }
  }
}
</style>
