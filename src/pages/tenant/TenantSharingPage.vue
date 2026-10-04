<template>
  <PageLayout
    :title="$t('navigation.services.title')"
    :subtitle="$t('zoneServices.subtitle')"
    icon="apps"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn
          color="primary"
          icon="add"
          :label="$t('zoneServices.addService')"
          @click="handleAddService"
        />
        <q-btn
          color="grey-7"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="loading"
        />
      </div>
    </template>

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
              category="public"
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
              category="friend"
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
              category="anonymous"
              @connect="handleConnect"
              @details="handleDetails"
            />
          </template>
        </ResponsiveCardGrid>
      </q-tab-panel>

      <!-- 我的服务 -->
      <q-tab-panel name="my" class="q-pa-none">
        <div class="section-header q-mb-md">
          <h5 class="q-my-none">{{ $t('zoneServices.categories.my') }}</h5>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('zoneServices.categories.myDesc') }}
          </p>
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
              category="my"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </template>
          
          <template #emptyAction>
            <q-btn
              flat
              color="primary"
              :label="$t('zoneServices.addFirstService')"
              @click="handleAddService"
            />
          </template>
        </ResponsiveCardGrid>
      </q-tab-panel>
    </q-tab-panels>

    <!-- 服务编辑对话框 -->
    <ServiceEditDialog
      v-model="showServiceDialog"
      v-bind="editingService ? { service: editingService } : {}"
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
            flat
            color="primary"
            :label="$t('zoneServices.confirmShare')"
            @click="confirmShare"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useZoneServices } from '../../composables/useZoneServices'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import ServiceCard from '../../components/zone/ServiceCard.vue'
import ServiceEditDialog from '../../components/zone/ServiceEditDialog.vue'
import type { ZoneService, ShareZoneServiceRequest } from '../../types/zoneService'

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
  shareService
} = useZoneServices()

// 状态
const activeCategory = ref('public')
const showServiceDialog = ref(false)
const showShareDialog = ref(false)
const editingService = ref<ZoneService | null>(null)
const sharingService = ref<ZoneService | null>(null)
const shareMessage = ref('')
const currentTenant = ref<ZoneService | null>(null)

// 计算属性
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

// 添加服务
const handleAddService = () => {
  editingService.value = null
  showServiceDialog.value = true
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
    sharingService.value = null
    shareMessage.value = ''
  }
}

// 分享给好友
const handleShareToFriends = (service: ZoneService) => {
  sharingService.value = service
  shareMessage.value = ''
  showShareDialog.value = true
}

// 连接服务
const handleConnect = (service: ZoneService) => {
  const serviceAddress = formatServiceAddress(service)
  window.open(serviceAddress, '_blank')
}

// 查看服务详情
const handleDetails = (service: ZoneService) => {
  $q.dialog({
    title: service.service_name,
    message: `
      <div><strong>${t('zoneServices.form.serviceType')}:</strong> ${service.service_type}</div>
      <div><strong>${t('zoneServices.form.serviceAddress')}:</strong> ${formatServiceAddress(service)}</div>
      <div><strong>${t('zoneServices.form.serviceProtocol')}:</strong> ${service.service_protocol.toUpperCase()}</div>
      <div><strong>${t('zoneServices.authRequired')}:</strong> ${service.service_auth_required ? t('common.yes') : t('common.no')}</div>
      ${service.service_description ? `<div><strong>${t('zoneServices.form.serviceDescription')}:</strong> ${service.service_description}</div>` : ''}
    `,
    html: true
  })
}

// 服务操作成功回调
const handleServiceSuccess = async () => {
  editingService.value = null
  await handleRefresh()
}

// 格式化服务地址
const formatServiceAddress = (service: ZoneService) => {
  const { service_address, service_port, service_protocol } = service
  
  // 如果service_address不存在，返回默认值
  if (!service_address) {
    return 'N/A'
  }
  
  if (service_address.startsWith('http://') || service_address.startsWith('https://')) {
    return service_address
  }
  
  return `${service_protocol}://${service_address}:${service_port}`
}
</script>


