import { ref, computed } from 'vue'
import { routesService } from '../services/routesService'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import type { 
  Route, 
  PendingConnection, 
  FriendNode, 
  RouteConfig,
  RouteOverview,
  RouteConnection
} from '../types'

export function useRoutes() {
  const { t } = useI18n()
  const notify = useNotify()

  // 响应式状态
  const loading = ref(false)
  const overview = ref<RouteOverview>({
    active_routes: 0,
    pending_connections: 0,
    connected_nodes: 0,
    total_bandwidth: '0 MB/s'
  })
  
  const activeRoutes = ref<Route[]>([])
  const pendingConnections = ref<PendingConnection[]>([])
  const outgoingConnections = ref<PendingConnection[]>([])
  const friendNodes = ref<FriendNode[]>([])
  const routeConfig = ref<RouteConfig | null>(null)
  const currentConnectionType = ref<'incoming' | 'outgoing'>('incoming')

  // 计算属性
  const hasActiveRoutes = computed(() => activeRoutes.value.length > 0)
  const hasPendingConnections = computed(() => pendingConnections.value.length > 0)
  const connectedFriendNodes = computed(() => 
    friendNodes.value.filter(node => node.connection_status === 'connected')
  )
  const availableFriendNodes = computed(() => 
    friendNodes.value.filter(node => node.connection_status === 'available')
  )
  
  // 根据当前连接类型返回相应的连接列表
  const currentConnections = computed(() => {
    return currentConnectionType.value === 'incoming' ? pendingConnections.value : outgoingConnections.value
  })

  // 获取路由概览数据
  const fetchOverview = async () => {
    try {
      loading.value = true
      const response = await routesService.getOverview()
      
      overview.value = {
        active_routes: response.stats?.active_routes || response.routes?.length || 0,
        pending_connections: response.stats?.pending_connections || response.pending_connections?.length || 0,
        connected_nodes: response.stats?.connected_nodes || 0,
        total_bandwidth: response.stats?.total_bandwidth || '0 MB/s'
      }
      
      // 同时设置路由数据
      if (response.routes) {
        activeRoutes.value = response.routes
      }
      
      // 设置待处理连接数据
      if (response.pending_connections) {
        pendingConnections.value = response.pending_connections
      }
      
      // 设置发出的连接数据
      if (response.outgoing_connections) {
        outgoingConnections.value = response.outgoing_connections
      }
      
      // 设置好友节点数据
      if (response.friend_nodes) {
        friendNodes.value = response.friend_nodes
      }
      
    } catch (error) {
      console.error('获取路由概览失败:', error)
      notify.error(t('routes.fetchOverviewError'))
    } finally {
      loading.value = false
    }
  }

  // 获取活跃路由列表
  const fetchActiveRoutes = async () => {
    try {
      loading.value = true
      
      // 如果还没有数据，先获取overview数据
      if (activeRoutes.value.length === 0) {
        await fetchOverview()
      }
      
    } catch (error) {
      console.error('获取活跃路由失败:', error)
      notify.error(t('routes.fetchActiveRoutesError'))
    } finally {
      loading.value = false
    }
  }

  // 获取待处理连接列表
  const fetchPendingConnections = async (type: 'incoming' | 'outgoing' = 'incoming') => {
    try {
      loading.value = true
      currentConnectionType.value = type
      
      // 如果还没有数据，先获取overview数据
      if (pendingConnections.value.length === 0 && outgoingConnections.value.length === 0) {
        await fetchOverview()
      }
      
    } catch (error) {
      console.error('获取待处理连接失败:', error)
      notify.error(t('routes.fetchPendingConnectionsError'))
    } finally {
      loading.value = false
    }
  }

  // 获取好友节点列表
  const fetchFriendNodes = async () => {
    try {
      loading.value = true
      
      // 如果还没有数据，先获取overview数据
      if (friendNodes.value.length === 0) {
        await fetchOverview()
      }
      
    } catch (error) {
      console.error('获取好友节点失败:', error)
      notify.error(t('routes.fetchFriendNodesError'))
    } finally {
      loading.value = false
    }
  }

  // 获取路由配置
  const fetchRouteConfig = async () => {
    try {
      loading.value = true
      const response = await routesService.getConfig()
      routeConfig.value = response.data
    } catch (error) {
      console.error('获取路由配置失败:', error)
      notify.error(t('routes.fetchConfigError'))
    } finally {
      loading.value = false
    }
  }

  // 连接到节点
  const connectToNode = async (nodeId: string, message?: string) => {
    try {
      loading.value = true
      const response = await routesService.connectToNode(nodeId, message)
      if (response.success) {
        notify.success(t('routes.connectionRequestSent'))
        // 更新好友节点状态
        const nodeIndex = friendNodes.value.findIndex(n => n.id === nodeId)
        if (nodeIndex !== -1 && friendNodes.value[nodeIndex]) {
          friendNodes.value[nodeIndex].connection_status = 'pending'
        }
        // 刷新待处理连接
        await fetchPendingConnections('outgoing')
      } else {
        notify.error(response.message || t('routes.connectionRequestError'))
      }
    } catch (error) {
      console.error('连接节点失败:', error)
      notify.error(t('routes.connectionRequestError'))
    } finally {
      loading.value = false
    }
  }

  // 批准连接
  const approveConnection = async (connectionId: string) => {
    try {
      loading.value = true
      const response = await routesService.approveConnection(connectionId)
      if (response.success) {
        notify.success(t('routes.connectionApproved'))
        // 从待处理连接中移除
        pendingConnections.value = pendingConnections.value.filter(c => c.id !== connectionId)
        // 刷新概览和活跃路由
        await fetchOverview()
        await fetchActiveRoutes()
      } else {
        notify.error(response.message || t('routes.connectionApproveError'))
      }
    } catch (error) {
      console.error('批准连接失败:', error)
      notify.error(t('routes.connectionApproveError'))
    } finally {
      loading.value = false
    }
  }

  // 拒绝连接
  const rejectConnection = async (connectionId: string) => {
    try {
      loading.value = true
      const response = await routesService.rejectConnection(connectionId)
      if (response.success) {
        notify.success(t('routes.connectionRejected'))
        // 从待处理连接中移除
        pendingConnections.value = pendingConnections.value.filter(c => c.id !== connectionId)
        // 刷新概览
        await fetchOverview()
      } else {
        notify.error(response.message || t('routes.connectionRejectError'))
      }
    } catch (error) {
      console.error('拒绝连接失败:', error)
      notify.error(t('routes.connectionRejectError'))
    } finally {
      loading.value = false
    }
  }

  // 断开路由
  const disconnectRoute = async (routeId: string) => {
    try {
      loading.value = true
      const response = await routesService.disconnectRoute(routeId)
      if (response.success) {
        notify.success(t('routes.routeDisconnected'))
        // 从活跃路由中移除
        activeRoutes.value = activeRoutes.value.filter(r => r.id !== routeId)
        // 刷新概览
        await fetchOverview()
      } else {
        notify.error(response.message || t('routes.routeDisconnectError'))
      }
    } catch (error) {
      console.error('断开路由失败:', error)
      notify.error(t('routes.routeDisconnectError'))
    } finally {
      loading.value = false
    }
  }

  // 下载路由配置
  const downloadRouteConfig = async () => {
    try {
      loading.value = true
      const response = await routesService.downloadConfig()
      
      if (response) {
        // 创建下载链接
        const blob = new Blob([response], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'route.conf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        notify.success(t('routes.configDownloaded'))
      }
    } catch (error) {
      console.error('下载路由配置失败:', error)
      notify.error(t('routes.configDownloadError'))
    } finally {
      loading.value = false
    }
  }

  // 刷新路由配置
  const refreshRouteConfig = async () => {
    try {
      loading.value = true
      const response = await routesService.refreshConfig()
      if (response.success) {
        notify.success(t('routes.configRefreshed'))
        // 重新获取配置
        await fetchRouteConfig()
      } else {
        notify.error(response.message || t('routes.configRefreshError'))
      }
    } catch (error) {
      console.error('刷新路由配置失败:', error)
      notify.error(t('routes.configRefreshError'))
    } finally {
      loading.value = false
    }
  }

  // 处理连接类型变化
  const handleConnectionTypeChange = (type: 'incoming' | 'outgoing') => {
    currentConnectionType.value = type
    fetchPendingConnections(type)
  }

  // 获取路由详情
  const getRouteDetails = async (routeId: string) => {
    try {
      const response = await routesService.getRouteDetails(routeId)
      return response
    } catch (error) {
      console.error('获取路由详情失败:', error)
      notify.error(t('routes.fetchRouteDetailsError'))
      return null
    }
  }

  // 获取连接统计
  const getConnectionStats = async (routeId: string) => {
    try {
      const response = await routesService.getConnectionStats(routeId)
      return response
    } catch (error) {
      console.error('获取连接统计失败:', error)
      return null
    }
  }

  // 初始化数据
  const init = async () => {
    await fetchOverview()
    await fetchRouteConfig()
  }

  return {
    // 状态
    loading,
    overview,
    activeRoutes,
    pendingConnections: currentConnections, // 使用计算属性返回当前类型的连接
    friendNodes,
    routeConfig,
    currentConnectionType,
    
    // 计算属性
    hasActiveRoutes,
    hasPendingConnections,
    connectedFriendNodes,
    availableFriendNodes,
    
    // 方法
    fetchOverview,
    fetchActiveRoutes,
    fetchPendingConnections,
    fetchFriendNodes,
    fetchRouteConfig,
    connectToNode,
    approveConnection,
    rejectConnection,
    disconnectRoute,
    downloadRouteConfig,
    refreshRouteConfig,
    handleConnectionTypeChange,
    getRouteDetails,
    getConnectionStats,
    init
  }
}
