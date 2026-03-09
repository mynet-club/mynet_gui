import { ref, computed } from 'vue'
import debug from "src/utils/debug"
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { zoneServiceApi } from '../services/zone/zoneServiceApi'
import type {
  ZoneService,
  CreateZoneServiceRequest,
  UpdateZoneServiceRequest,
  ServiceType,
  ServiceCategory,
  ServiceTypeConfig
} from '../types/zoneService'

export function useZoneServices() {
  const $q = useQuasar()
  const { t } = useI18n()

  // 状态
  const loading = ref(false)
  const publicServices = ref<ZoneService[]>([])
  const friendServices = ref<ZoneService[]>([])
  // 匿名服务已移除 - 简化服务分类
  // const anonymousServices = ref<ZoneService[]>([])
  const myServices = ref<ZoneService[]>([])

  // 服务分类配置
  const serviceCategories = computed((): ServiceCategory[] => [
    {
      key: 'public',
      title: t('zoneServices.categories.public'),
      icon: 'public',
      color: 'primary',
      description: t('zoneServices.categories.publicDesc')
    },
    {
      key: 'friend',
      title: t('zoneServices.categories.friend'),
      icon: 'group',
      color: 'positive',
      description: t('zoneServices.categories.friendDesc')
    // 匿名服务已移除 - 简化服务分类
    // {
    //   key: 'anonymous',
    //   title: t('zoneServices.categories.anonymous'),
    //   icon: 'visibility_off',
    //   color: 'warning',
    //   description: t('zoneServices.categories.anonymousDesc')
    //   description: t('zoneServices.categories.anonymousDesc')
    },
    {
      key: 'my',
      title: t('zoneServices.categories.my'),
      icon: 'person',
      color: 'info',
      description: t('zoneServices.categories.myDesc')
    }
  ])

  // 服务类型配置
  const serviceTypes = computed((): ServiceTypeConfig[] => [
    {
      key: 'gnb_index',
      label: t('zoneServices.types.gnbIndex'),
      icon: 'hub',
      color: 'primary',
      description: t('zoneServices.types.gnbIndexDesc'),
      defaultPort: 9016,
      defaultProtocol: 'udp',
      systemOnly: false  // 修改为可选
    },
    {
      key: 'music',
      label: t('zoneServices.types.music'),
      icon: 'music_note',
      color: 'purple',
      description: t('zoneServices.types.musicDesc'),
      defaultPort: 8080,
      defaultProtocol: 'http'
    },
    {
      key: 'video',
      label: t('zoneServices.types.video'),
      icon: 'movie',
      color: 'red',
      description: t('zoneServices.types.videoDesc'),
      defaultPort: 8081,
      defaultProtocol: 'http'
    },
    {
      key: 'netbridge',
      label: t('zoneServices.types.netbridge'),
      icon: 'router',
      color: 'teal',
      description: t('zoneServices.types.netbridgeDesc'),
      defaultPort: 22,
      defaultProtocol: 'tcp'
    }
  ])

  // 加载所有服务
  const loadAllServices = async () => {
    loading.value = true

    try {
      // 匿名服务已移除 - 简化服务分类
      const [publicRes, friendRes, myRes] = await Promise.all([
        zoneServiceApi.getPublicServices(),
        zoneServiceApi.getFriendServices(),
        // zoneServiceApi.getAnonymousServices(), // 已移除
        zoneServiceApi.getMyServices()
      ])

      publicServices.value = publicRes.data || []
      friendServices.value = friendRes.data || []
      // anonymousServices.value = anonymousRes.data || [] // 已移除
      myServices.value = myRes.data || []
    } catch (error) {
      debug.error('Failed to load services:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.loadFailed')
      })
    } finally {
      loading.value = false
    }
  }

  // 创建服务
  const createService = async (data: CreateZoneServiceRequest): Promise<boolean> => {
    try {
      loading.value = true
      const response = await zoneServiceApi.createService(data)
      
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('zoneServices.messages.createSuccess')
        })
        // 重新加载我的服务
        await loadMyServices()
        return true
      }
      return false
    } catch (error) {
      debug.error('Failed to create service:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.createFailed')
      })
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新服务
  const updateService = async (serviceId: number, data: UpdateZoneServiceRequest): Promise<boolean> => {
    try {
      loading.value = true
      const response = await zoneServiceApi.updateService(serviceId, data)
      
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('zoneServices.messages.updateSuccess')
        })
        // 重新加载相关服务
        await loadAllServices()
        return true
      }
      return false
    } catch (error) {
      debug.error('Failed to update service:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.updateFailed')
      })
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除服务
  const deleteService = async (serviceId: number): Promise<boolean> => {
    try {
      const response = await zoneServiceApi.deleteService(serviceId)
      
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('zoneServices.messages.deleteSuccess')
        })
        // 重新加载我的服务
        await loadMyServices()
        return true
      }
      return false
    } catch (error) {
      debug.error('Failed to delete service:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.deleteFailed')
      })
      return false
    }
  }

  // 分享服务
  const shareService = async (serviceId: number, targetUserId: number, message?: string): Promise<boolean> => {
    try {
      const shareData: { target_user_id: number; message?: string } = {
        target_user_id: targetUserId
      }
      if (message) {
        shareData.message = message
      }
      
      const response = await zoneServiceApi.shareService(serviceId, shareData)
      
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('zoneServices.messages.shareSuccess')
        })
        return true
      }
      return false
    } catch (error) {
      debug.error('Failed to share service:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.shareFailed')
      })
      return false
    }
  }

  // 申请公开服务 - 已移除，后端不再支持用户申请公开服务
  /*
  const requestApproval = async (serviceId: number, reason?: string): Promise<boolean> => {
    try {
      const approvalData: { approval_reason?: string } = {}
      if (reason) {
        approvalData.approval_reason = reason
      }
      
      const response = await zoneServiceApi.requestApproval(serviceId, approvalData)
      
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('zoneServices.messages.approvalRequested')
        })
        await loadMyServices()
        return true
      }
      return false
    } catch (error) {
      debug.error('Failed to request approval:', error)
      $q.notify({
        type: 'negative',
        message: t('zoneServices.errors.approvalFailed')
      })
      return false
    }
  }
  */

  // 仅加载我的服务
  const loadMyServices = async () => {
    try {
      const response = await zoneServiceApi.getMyServices()
      myServices.value = response.data || []
    } catch (error) {
      debug.error('Failed to load my services:', error)
    }
  }

  // 获取服务类型配置
  const getServiceTypeConfig = (type: ServiceType): ServiceTypeConfig | undefined => {
    return serviceTypes.value.find(t => t.key === type)
  }

  // 获取服务分类配置
  const getCategoryConfig = (key: string): ServiceCategory | undefined => {
    return serviceCategories.value.find(c => c.key === key)
  }

  return {
    // 状态
    loading,
    publicServices,
    friendServices,
    // anonymousServices, // 已移除
    myServices,
    
    // 配置
    serviceCategories,
    serviceTypes,
    
    // 方法
    loadAllServices,
    loadMyServices,
    createService,
    updateService,
    deleteService,
    shareService,
    // requestApproval, // 已移除 - 不再支持申请公开
    getServiceTypeConfig,
    getCategoryConfig
  }
}
