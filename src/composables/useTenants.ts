import { ref, computed } from 'vue'
import debug from 'src/utils/debug'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import type { Tenant, TenantOverview } from '../types'
import { tenantService } from '../services/tenant/tenantService'

export function useTenants() {
  const { t } = useI18n()
  const notify = useNotify()
  const authStore = useAuthStore()

  // 响应式状态
  const loading = ref(false)
  const overview = ref<TenantOverview>({
    total_zones: 0,
    active_zones: 0,
    total_nodes: 0,
    total_routes: 0
  })
  
  const tenants = ref<Tenant[]>([])
  const currentTenant = ref<Tenant | null>(null)
  const availableTenants = ref<Tenant[]>([]) // 用户可访问的zones
  const zoneStatistics = ref<any>({})
  
  // 分页状态
  const currentPage = ref(1)
  const perPage = ref(10)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // 计算属性
  const hasTenants = computed(() => tenants.value.length > 0)
  const activeTenants = computed(() => tenants.value.filter(z => z.zone_status === 1))
  const inactiveTenants = computed(() => tenants.value.filter(z => z.zone_status === 0))
  const isCurrentTenantAdmin = computed(() => {
    return currentTenant.value?.pivot?.is_admin === 1
  })
  const canCreateZone = computed(() => {
    // 根据用户角色和权限判断是否可以创建zone
    return authStore.user?.user_role === 'admin' || authStore.user?.user_role === 'zone_admin'
  })

  // 获取zone概览数据
  const fetchOverview = async () => {
    try {
      loading.value = true
      const response = await tenantService.getTenantOverview()
      
      overview.value = {
        total_zones: response.total_zones || 0,
        active_zones: response.active_zones || 0,
        total_nodes: response.total_nodes || 0,
        total_routes: response.total_routes || 0
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // v2 暂未实现 /tenants/overview，从已有 tenants 数据中推算基础指标
        const allTenants = tenants.value.length > 0 ? tenants.value : availableTenants.value
        overview.value = {
          total_zones: allTenants.length,
          active_zones: allTenants.filter(z => z.zone_status === 1).length,
          total_nodes: 0,
          total_routes: 0
        }
      } else {
        debug.error('获取zone概览失败:', error)
        notify.error(t('zones.fetchOverviewError'))
      }
    } finally {
      loading.value = false
    }
  }

  // 获取用户可访问的zones
  const fetchAvailableTenants = async () => {
    try {
      loading.value = true  
      
      const response = await tenantService.getUserTenants()
      availableTenants.value = response || []
      
      // 设置当前zone
      if (availableTenants.value.length > 0 && !currentTenant.value) {
        currentTenant.value = availableTenants.value[0] || null
      }
    } catch (error) {
      debug.error('获取可访问zones失败:', error)
      notify.error(t('zones.fetchAvailableZonesError'))
    } finally {
      loading.value = false
    }
  }

  // 获取zones列表（管理员功能）
  const fetchTenants = async (page = 1, search = '', status?: 'active' | 'inactive') => {
    try {
      loading.value = true
      
      const params: any = {
        page,
        per_page: perPage.value
      }
      
      if (search) params.search = search
      if (status) params.status = status
      
      const response = await tenantService.getTenants(params)
      
      tenants.value = response.data || []
      currentPage.value = response.meta.current_page
      totalPages.value = response.meta.last_page
      totalItems.value = response.meta.total
      
    } catch (error) {
      debug.error('获取zones列表失败:', error)
      notify.error(t('zones.fetchZonesError'))
    } finally {
      loading.value = false
    }
  }

  // 切换当前zone
  const switchTenant = async (tenantId: number) => {
    try {
      loading.value = true
      const response = await tenantService.switchTenant(tenantId)
      
      currentTenant.value = response.tenant
      // 更新用户状态中的当前zone
      authStore.setCurrentTenant(response.tenant)
      notify.success(t('zones.switchedTo', { zoneName: response.tenant.zone_name }))
      
      // 刷新相关数据
      await fetchOverview()
      
      return true
    } catch (error) {
      debug.error('切换zone失败:', error)
      notify.error(t('zones.switchFailed'))
      return false
    } finally {
      loading.value = false
    }
  }

  // 创建新zone（管理员功能）
  const createTenant = async (data: { name: string; description?: string }) => {
    try {
      loading.value = true
      const response = await tenantService.createTenant(data)
      
      notify.success(t('zones.createSuccess'))
      // 刷新zones列表
      await fetchTenants()
      await fetchOverview()
      return response
    } catch (error) {
      debug.error('创建zone失败:', error)
      notify.error(t('zones.createError'))
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新zone信息（管理员功能）
  const updateTenant = async (id: string, data: { name?: string; description?: string }) => {
    try {
      loading.value = true
      const response = await tenantService.updateTenant(id, data)
      
      notify.success(t('zones.updateSuccess'))
      // 刷新zones列表
      await fetchTenants()
      return response
    } catch (error) {
      debug.error('更新zone失败:', error)
      notify.error(t('zones.updateError'))
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除zone（管理员功能）
  const deleteTenant = async (id: string) => {
    try {
      loading.value = true
      await tenantService.deleteTenant(id)
      
      notify.success(t('zones.deleteSuccess'))
      // 刷新zones列表
      await fetchTenants()
      await fetchOverview()
      return true
    } catch (error) {
      debug.error('删除zone失败:', error)
      notify.error(t('zones.deleteError'))
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取zone详情
  const getZoneDetails = async (id: string) => {
    try {
      const response = await tenantService.getZoneById(id)
      return response
    } catch (error) {
      debug.error('获取zone详情失败:', error)
      notify.error(t('zones.fetchDetailsError'))
      return null
    }
  }

  // 获取zone统计信息
  const getTenantStatistics = async (tenantId: string) => {
    try {
      const response = await tenantService.getTenantStatistics(tenantId)
      zoneStatistics.value[tenantId] = response
      return response
    } catch (error) {
      debug.error('获取zone统计失败:', error)
      return null
    }
  }

  // 检查用户是否有zone管理权限
  const hasTenantManagePermission = (tenant: Tenant) => {
    return tenant.pivot?.is_admin === 1 || authStore.user?.user_role === 'admin'
  }

  // 初始化数据
  const init = async () => {
    await fetchAvailableTenants()
    await fetchOverview()
  }

  // 普通用户初始化（只加载可访问的zones）
  const initForUser = async () => {
    await fetchAvailableTenants()
    if (currentTenant.value) {
      await getTenantStatistics(currentTenant.value.zone_id.toString())
    }
  }

  // 管理员初始化（加载所有zones）
  const initForAdmin = async () => {
    await fetchTenants()
    await fetchOverview()
  } 

  return {
    // 状态
    loading,
    overview,
    tenants,
    currentTenant,
    availableTenants,
    zoneStatistics,
    currentPage,
    perPage,
    totalPages,
    totalItems,
    
    // 计算属性
    hasTenants,
    activeTenants,
    inactiveTenants,
    isCurrentTenantAdmin,
    canCreateZone,
    
    // 方法
    fetchOverview,
    fetchAvailableTenants,
    fetchTenants,
    switchTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    getZoneDetails,
    getTenantStatistics,
    hasTenantManagePermission,
    init,
    initForUser,
    initForAdmin
  }
}
