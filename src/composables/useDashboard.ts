import { ref, onMounted, onUnmounted, computed } from 'vue'
import debug from "src/utils/debug"
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../services/websocket'
import { apiService } from '../services/api'

export function useDashboard() {
  const authStore = useAuthStore()
  const { connect, disconnect, isConnected } = useWebSocket()
  const updateInterval = ref<number | null>(null)

  // 仪表板数据
  const dashboardData = ref({
    totalNodes: 0,
    onlineNodes: 0,
    offlineNodes: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    systemStatus: 'healthy',
    lastUpdate: new Date()
  })

  // 实时数据
  const realtimeData = ref({
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    activeConnections: 0
  })

  // 最近活动
  const recentActivities = ref<any[]>([])

  // 加载状态
  const isLoading = ref(false)

  // 计算属性
  const onlineRate = computed(() => {
    if (dashboardData.value.totalNodes === 0) return 0
    return Math.round((dashboardData.value.onlineNodes / dashboardData.value.totalNodes) * 100)
  })

  const systemStatusColor = computed(() => {
    switch (dashboardData.value.systemStatus) {
      case 'healthy': return 'positive'
      case 'warning': return 'warning'
      case 'error': return 'negative'
      default: return 'grey'
    }
  })

  // 获取仪表板数据
  const fetchDashboardData = async () => {
    isLoading.value = true
    try {
      const response = await apiService.getDashboardData()
      dashboardData.value = response.data
    } catch (error) {
      debug.error('Failed to fetch dashboard data:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 获取实时数据
  const fetchRealtimeData = async () => {
    try {
      // 使用模拟数据，实际项目中应该调用真实的API
      const mockRealtimeData = {
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        networkTraffic: Math.floor(Math.random() * 1000),
        activeConnections: Math.floor(Math.random() * 100)
      }
      realtimeData.value = mockRealtimeData
    } catch (error) {
      debug.error('Failed to fetch realtime data:', error)
    }
  }

  // 获取最近活动
  const fetchRecentActivities = async () => {
    try {
      // 使用模拟数据，实际项目中应该调用真实的API
      const mockActivities = [
        { id: 1, type: 'node_online', message: 'Node server-01 came online', timestamp: new Date() },
        { id: 2, type: 'route_created', message: 'New route created: 192.168.1.0/24', timestamp: new Date(Date.now() - 300000) },
        { id: 3, type: 'node_offline', message: 'Node server-02 went offline', timestamp: new Date(Date.now() - 600000) }
      ]
      recentActivities.value = mockActivities
    } catch (error) {
      debug.error('Failed to fetch recent activities:', error)
    }
  }

  // 处理WebSocket消息
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'dashboard_update') {
      dashboardData.value = { ...dashboardData.value, ...data.payload }
    } else if (data.type === 'realtime_update') {
      realtimeData.value = { ...realtimeData.value, ...data.payload }
    } else if (data.type === 'activity') {
      recentActivities.value.unshift(data.payload)
      if (recentActivities.value.length > 10) {
        recentActivities.value.pop()
      }
    }
  }

  // 初始化
  onMounted(async () => {
    await fetchDashboardData()
    await fetchRealtimeData()
    await fetchRecentActivities()

    // WebSocket连接由boot/websocket.ts统一管理，这里不再重复连接
    
    // 设置定时器更新实时数据
    updateInterval.value = window.setInterval(fetchRealtimeData, 5000)
  })

  onUnmounted(() => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    // WebSocket断开由boot/websocket.ts统一管理，这里不需要手动断开
  })

  return {
    // 状态
    dashboardData,
    realtimeData,
    recentActivities,
    isLoading,
    isConnected,
    
    // 计算属性
    onlineRate,
    systemStatusColor,
    
    // 方法
    fetchDashboardData,
    fetchRealtimeData,
    fetchRecentActivities,
    handleWebSocketMessage
  }
} 
