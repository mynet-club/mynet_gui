import { ref, computed } from 'vue'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import type { Zone, ZoneOverview } from '../types'
import { zoneService } from '../services/zoneService'

export function useZones() {
  const { t } = useI18n()
  const notify = useNotify()
  const authStore = useAuthStore()

  // 响应式状态
  const loading = ref(false)
  const overview = ref<ZoneOverview>({
    total_zones: 0,
    active_zones: 0,
    total_nodes: 0,
    total_routes: 0
  })
  
  const zones = ref<Zone[]>([])
  const currentZone = ref<Zone | null>(null)
  const availableZones = ref<Zone[]>([]) // 用户可访问的zones
  const zoneStatistics = ref<any>({})
  
  // 分页状态
  const currentPage = ref(1)
  const perPage = ref(10)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // 计算属性
  const hasZones = computed(() => zones.value.length > 0)
  const activeZones = computed(() => zones.value.filter(z => z.zone_status === 1))
  const inactiveZones = computed(() => zones.value.filter(z => z.zone_status === 0))
  const isCurrentZoneAdmin = computed(() => {
    return currentZone.value?.pivot?.is_admin === 1
  })
  const canCreateZone = computed(() => {
    // 根据用户角色和权限判断是否可以创建zone
    return authStore.user?.user_role === 'admin' || authStore.user?.user_role === 'zone_admin'
  })

  // 获取zone概览数据
  const fetchOverview = async () => {
    try {
      loading.value = true
      const response = await zoneService.getZoneOverview()
      
      overview.value = {
        total_zones: response.total_zones || 0,
        active_zones: response.active_zones || 0,
        total_nodes: response.total_nodes || 0,
        total_routes: response.total_routes || 0
      }
    } catch (error) {
      console.error('获取zone概览失败:', error)
      notify.error(t('zones.fetchOverviewError'))
    } finally {
      loading.value = false
    }
  }

  // 获取用户可访问的zones
  const fetchAvailableZones = async () => {
    try {
      loading.value = true  
      
      const response = await zoneService.getUserZones()
      availableZones.value = response || []
      
      // 设置当前zone
      if (availableZones.value.length > 0 && !currentZone.value) {
        currentZone.value = availableZones.value[0] || null
      }
    } catch (error) {
      console.error('获取可访问zones失败:', error)
      notify.error(t('zones.fetchAvailableZonesError'))
    } finally {
      loading.value = false
    }
  }

  // 获取zones列表（管理员功能）
  const fetchZones = async (page = 1, search = '', status?: 'active' | 'inactive') => {
    try {
      loading.value = true
      
      const params: any = {
        page,
        per_page: perPage.value
      }
      
      if (search) params.search = search
      if (status) params.status = status
      
      const response = await zoneService.getZones(params)
      
      zones.value = response.data || []
      currentPage.value = response.meta.current_page
      totalPages.value = response.meta.last_page
      totalItems.value = response.meta.total
      
    } catch (error) {
      console.error('获取zones列表失败:', error)
      notify.error(t('zones.fetchZonesError'))
    } finally {
      loading.value = false
    }
  }

  // 切换当前zone
  const switchZone = async (zoneId: number) => {
    try {
      loading.value = true
      const response = await zoneService.switchZone(zoneId)
      
      currentZone.value = response.zone
      // 更新用户状态中的当前zone
      authStore.setCurrentZone(response.zone)
      notify.success(t('zones.switchedTo', { zoneName: response.zone.zone_name }))
      
      // 刷新相关数据
      await fetchOverview()
      
      return true
    } catch (error) {
      console.error('切换zone失败:', error)
      notify.error(t('zones.switchFailed'))
      return false
    } finally {
      loading.value = false
    }
  }

  // 创建新zone（管理员功能）
  const createZone = async (data: { name: string; description?: string }) => {
    try {
      loading.value = true
      const response = await zoneService.createZone(data)
      
      notify.success(t('zones.createSuccess'))
      // 刷新zones列表
      await fetchZones()
      await fetchOverview()
      return response
    } catch (error) {
      console.error('创建zone失败:', error)
      notify.error(t('zones.createError'))
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新zone信息（管理员功能）
  const updateZone = async (id: string, data: { name?: string; description?: string }) => {
    try {
      loading.value = true
      const response = await zoneService.updateZone(id, data)
      
      notify.success(t('zones.updateSuccess'))
      // 刷新zones列表
      await fetchZones()
      return response
    } catch (error) {
      console.error('更新zone失败:', error)
      notify.error(t('zones.updateError'))
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除zone（管理员功能）
  const deleteZone = async (id: string) => {
    try {
      loading.value = true
      await zoneService.deleteZone(id)
      
      notify.success(t('zones.deleteSuccess'))
      // 刷新zones列表
      await fetchZones()
      await fetchOverview()
      return true
    } catch (error) {
      console.error('删除zone失败:', error)
      notify.error(t('zones.deleteError'))
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取zone详情
  const getZoneDetails = async (id: string) => {
    try {
      const response = await zoneService.getZoneById(id)
      return response
    } catch (error) {
      console.error('获取zone详情失败:', error)
      notify.error(t('zones.fetchDetailsError'))
      return null
    }
  }

  // 获取zone统计信息
  const getZoneStatistics = async (zoneId: string) => {
    try {
      const response = await zoneService.getZoneStatistics(zoneId)
      zoneStatistics.value[zoneId] = response
      return response
    } catch (error) {
      console.error('获取zone统计失败:', error)
      return null
    }
  }

  // 检查用户是否有zone管理权限
  const hasZoneManagePermission = (zone: Zone) => {
    return zone.pivot?.is_admin === 1 || authStore.user?.user_role === 'admin'
  }

  // 初始化数据
  const init = async () => {
    await fetchAvailableZones()
    await fetchOverview()
  }

  // 普通用户初始化（只加载可访问的zones）
  const initForUser = async () => {
    await fetchAvailableZones()
    if (currentZone.value) {
      await getZoneStatistics(currentZone.value.zone_id.toString())
    }
  }

  // 管理员初始化（加载所有zones）
  const initForAdmin = async () => {
    await fetchZones()
    await fetchOverview()
  } 

  return {
    // 状态
    loading,
    overview,
    zones,
    currentZone,
    availableZones,
    zoneStatistics,
    currentPage,
    perPage,
    totalPages,
    totalItems,
    
    // 计算属性
    hasZones,
    activeZones,
    inactiveZones,
    isCurrentZoneAdmin,
    canCreateZone,
    
    // 方法
    fetchOverview,
    fetchAvailableZones,
    fetchZones,
    switchZone,
    createZone,
    updateZone,
    deleteZone,
    getZoneDetails,
    getZoneStatistics,
    hasZoneManagePermission,
    init,
    initForUser,
    initForAdmin
  }
}
