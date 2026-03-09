<template>
  <PageLayout
    :title="$t('zoneServices.navigation.myServices')"
    :subtitle="$t('zoneServices.navigation.myServicesDescription')"
    icon="person_add"
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
          @share="handleShare"
        />
      </template>
      
      <template #emptyAction>
        <q-btn
          color="primary"
          :label="$t('zoneServices.addFirstService')"
          @click="handleAddService"
        />
      </template>
    </ResponsiveCardGrid>

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

    <!-- 申请公开对话框 - 功能已下线 -->
    <!--
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
    -->
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import ServiceCard from '../../components/zone/ServiceCard.vue'
import ServiceEditDialog from '../../components/zone/ServiceEditDialog.vue'
import { useZoneServices } from '../../composables/useZoneServices'
import type { ZoneService } from '../../types/zoneService'

const { t } = useI18n()
const $q = useQuasar()

// 使用服务管理 composable
const {
  loading,
  myServices,
  loadMyServices,
  deleteService,
  shareService
  // requestApproval // 已移除 - 不再支持申请公开
} = useZoneServices()

// 界面状态
const showServiceDialog = ref(false)
const showShareDialog = ref(false)
// const showApprovalDialog = ref(false) // 已移除 - 不再支持申请公开
const editingService = ref<ZoneService | null>(null)
const sharingService = ref<ZoneService | null>(null)
// const approvalService = ref<ZoneService | null>(null) // 已移除
const shareMessage = ref('')
// const approvalReason = ref('') // 已移除

// 页面初始化
onMounted(async () => {
  await handleRefresh()
})

// 刷新数据
const handleRefresh = async () => {
  await loadMyServices()
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
    message: t('zoneServices.confirmDeleteMessage', { name: service.service_name }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const success = await deleteService(parseInt(service.service_id))
      if (success) {
        $q.notify({
          type: 'positive',
          message: t('zoneServices.messages.deleteSuccess'),
          position: 'top'
        })
        await handleRefresh()
      }
    } catch (error) {
      console.error('Delete service failed:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.deleteFailed'),
        position: 'top'
      })
    }
  })
}

// 分享服务
const handleShare = (service: ZoneService) => {
  sharingService.value = service
  shareMessage.value = ''
  showShareDialog.value = true
}

// 申请公开 - 功能已下线
const handleRequestPublic = (service: ZoneService) => {
  // 功能已下线，显示友好提示
  $q.notify({
    type: 'warning',
    message: t('zoneServices.errors.publicServiceDeprecated'),
    position: 'top',
    timeout: 3000
  })
}

// 确认分享
const confirmShare = async () => {
  if (!sharingService.value) return
  
  try {
    const success = await shareService(
      sharingService.value.id, 
      1, // TODO: 添加目标用户ID选择
      shareMessage.value
    )
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: t('zoneServices.messages.shareSuccess'),
        position: 'top'
      })
      showShareDialog.value = false
    }
  } catch (error) {
    console.error('Share service failed:', error)
    $q.notify({
      type: 'negative',
      message: t('zoneServices.errors.shareFailed'),
      position: 'top'
    })
  }
}

// 确认申请公开 - 已移除，不再支持用户申请公开服务
/*
const confirmApproval = async () => {
  if (!approvalService.value) return
  
  try {
    const success = await requestApproval(
      approvalService.value.id, 
      approvalReason.value
    )
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: t('zoneServices.messages.approvalRequested'),
        position: 'top'
      })
      showApprovalDialog.value = false
    }
  } catch (error) {
    console.error('Request approval failed:', error)
    $q.notify({
      type: 'negative',
      message: t('zoneServices.errors.approvalFailed'),
      position: 'top'
    })
  }
}
*/

// 服务操作成功回调
const handleServiceSuccess = async () => {
  editingService.value = null
  await handleRefresh()
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