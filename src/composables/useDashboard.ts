import { ref, onMounted, onUnmounted, computed } from 'vue'
import debug from 'src/utils/debug'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../services/websocket'
import { useNodes } from './useNodes'
import { useRoutes } from './useRoutes'
import type { 
  DashboardData, 
  HealthStatus, 
  AbnormalItems, 
  NodeSummary, 
  PendingTask,
  Activity,
  ActivityType,
  ActivitiesStorage
} from '../types/dashboard'
import { ACTIVITY_CONFIG, ACTIVITIES_STORAGE_KEY, MAX_ACTIVITIES_STORED } from '../types/dashboard'
import type { Node } from '../types/node'
import { NODE_STATUS } from '../types/node'

export function useDashboard() {
  const authStore = useAuthStore()
  const { connect, disconnect, isConnected } = useWebSocket()
  const updateInterval = ref<number | null>(null)
  
  // 引入节点和路由数据
  const { nodes, loadNodes } = useNodes()
  const { overview, pendingConnections, fetchOverview } = useRoutes()

  // 仪表板数据（使用新的数据结构）
  const dashboardData = ref<DashboardData>({
    totalNodes: 0,
    onlineNodes: 0,
    offlineNodes: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    lastUpdate: new Date(),
    healthStatus: 'healthy',
    healthMessage: '',
    healthIcon: '',
    healthColor: '',
    abnormalItems: {
      offlineNodes: [],
      unconfiguredNodes: [],
      failedRoutes: []
    },
    pendingTasks: [],
    friendConnections: 0
  })

  // 实时数据
  const realtimeData = ref({
    cpuUsage: 0,
    memoryUsage: 0,
    networkTraffic: 0,
    activeConnections: 0
  })

  // 最近活动
  const recentActivities = ref<Activity[]>([])

  // 活动监控 - 存储上一次的状态用于检测变化
  const previousState = ref<{
    nodes: Map<string | number, Node>
    routesCount: number
    pendingCount: number
  }>({
    nodes: new Map(),
    routesCount: 0,
    pendingCount: 0
  })

  // 加载状态
  const isLoading = ref(false)

  // 计算属性
  const onlineRate = computed(() => {
    if (dashboardData.value.totalNodes === 0) return 0
    return Math.round((dashboardData.value.onlineNodes / dashboardData.value.totalNodes) * 100)
  })

  const systemStatusColor = computed(() => {
    switch (dashboardData.value.healthStatus) {
      case 'healthy': return 'positive'
      case 'warning': return 'warning'
      case 'critical': return 'negative'
      default: return 'grey'
    }
  })
  
  /**
   * 获取仪表板数据（重构版）
   * 从真实的节点和路由数据中计算
   */
  const fetchDashboardData = async () => {
    isLoading.value = true
    try {
      // 并行加载节点和路由数据
      await Promise.all([
        loadNodes(),
        fetchOverview()
      ])
      
      debug.log('Dashboard: 节点数据加载完成', {
        nodesCount: nodes.value.length,
        overviewData: overview.value
      })
      
      // 基础统计
      dashboardData.value.totalNodes = nodes.value.length
      dashboardData.value.onlineNodes = nodes.value.filter(n => n.node_status === NODE_STATUS.ONLINE).length
      dashboardData.value.offlineNodes = nodes.value.filter(n => n.node_status === NODE_STATUS.ENABLED).length
      dashboardData.value.totalRoutes = overview.value.connected_nodes || 0
      dashboardData.value.activeRoutes = overview.value.active_routes || 0
      
      // 收集异常项目
      dashboardData.value.abnormalItems = collectAbnormalItems()
      
      // 计算健康状态
      dashboardData.value.healthStatus = calculateHealthStatus(dashboardData.value)
      dashboardData.value.healthMessage = getHealthMessage(dashboardData.value)
      
      // 设置健康状态的图标和颜色
      switch (dashboardData.value.healthStatus) {
        case 'healthy':
          dashboardData.value.healthIcon = 'check_circle'
          dashboardData.value.healthColor = 'positive'
          break
        case 'warning':
          dashboardData.value.healthIcon = 'warning'
          dashboardData.value.healthColor = 'warning'
          break
        case 'critical':
          dashboardData.value.healthIcon = 'error'
          dashboardData.value.healthColor = 'negative'
          break
      }
      
      // 生成待处理任务
      dashboardData.value.pendingTasks = generatePendingTasks(dashboardData.value)
      
      // 更新时间
      dashboardData.value.lastUpdate = new Date()
      
      // 检测变化并生成活动记录
      detectNodeChanges(nodes.value)
      detectRouteChanges(overview.value.connected_nodes || 0)
      detectPendingConnectionChanges(pendingConnections.value.length)
      
      debug.log('Dashboard: 数据计算完成', {
        healthStatus: dashboardData.value.healthStatus,
        healthMessage: dashboardData.value.healthMessage,
        pendingTasks: dashboardData.value.pendingTasks.length,
        abnormalItems: {
          offline: dashboardData.value.abnormalItems.offlineNodes.length,
          unconfigured: dashboardData.value.abnormalItems.unconfiguredNodes.length
        },
        activities: recentActivities.value.length
      })
      
    } catch (error) {
      debug.error('Dashboard: 获取数据失败:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 计算节点离线时长（分钟）
   */
  const calculateOfflineDuration = (lastSeen: string | null): number | undefined => {
    if (!lastSeen) return undefined
    const lastSeenTime = new Date(lastSeen).getTime()
    const now = Date.now()
    const diffMinutes = Math.floor((now - lastSeenTime) / (1000 * 60))
    return diffMinutes > 0 ? diffMinutes : 0
  }
  
  /**
   * 收集异常项目
   */
  const collectAbnormalItems = (): AbnormalItems => {
    const abnormal: AbnormalItems = {
      offlineNodes: [],
      unconfiguredNodes: [],
      failedRoutes: []
    }
    
    nodes.value.forEach(node => {
      // 离线节点（状态为1：启用但离线）
      if (node.node_status === NODE_STATUS.ENABLED) {
        abnormal.offlineNodes.push({
          id: node.id,
          node_name: node.node_name,
          node_status: node.node_status,
          last_seen: node.last_seen || null,
          offlineDuration: calculateOfflineDuration(node.last_seen || null)
        })
      }
      
      // 未配置节点（状态为-1）
      if (node.node_status === NODE_STATUS.UNCONFIGURED) {
        abnormal.unconfiguredNodes.push({
          id: node.id,
          node_name: node.node_name,
          node_status: node.node_status,
          last_seen: node.last_seen || null
        })
      }
    })
    
    return abnormal
  }
  
  /**
   * 计算健康状态
   */
  const calculateHealthStatus = (data: DashboardData): HealthStatus => {
    const { totalNodes, onlineNodes, abnormalItems } = data
    
    // 严重情况（Critical）
    const hasCriticalIssues = 
      (totalNodes > 0 && onlineNodes === 0) ||  // 所有节点离线
      abnormalItems.offlineNodes.length >= totalNodes * 0.5 ||  // 50%以上节点离线
      abnormalItems.failedRoutes.length > 0  // 有路由故障
    
    if (hasCriticalIssues) {
      return 'critical'
    }
    
    // 警告情况（Warning）
    const hasWarnings = 
      abnormalItems.offlineNodes.length > 0 ||  // 有离线节点
      abnormalItems.unconfiguredNodes.length > 0 ||  // 有未配置节点
      (totalNodes > 0 && (onlineNodes / totalNodes) < 0.8)  // 在线率低于80%
    
    if (hasWarnings) {
      return 'warning'
    }
    
    // 健康情况（Healthy）
    return 'healthy'
  }
  
  /**
   * 获取健康状态消息
   */
  const getHealthMessage = (data: DashboardData): string => {
    const { healthStatus, onlineNodes, totalNodes, abnormalItems } = data
    
    switch (healthStatus) {
      case 'healthy':
        if (totalNodes === 0) {
          return '暂无节点，请先创建节点'
        }
        return `网络运行正常（${onlineNodes} 个节点在线）`
      
      case 'warning':
        if (abnormalItems.offlineNodes.length > 0) {
          return `检测到 ${abnormalItems.offlineNodes.length} 个离线节点，建议检查`
        }
        if (abnormalItems.unconfiguredNodes.length > 0) {
          return `有 ${abnormalItems.unconfiguredNodes.length} 个节点未完成配置`
        }
        if (totalNodes > 0) {
          const rate = Math.round((onlineNodes / totalNodes) * 100)
          return `网络状态需要关注（在线率 ${rate}%）`
        }
        return '网络状态需要关注'
      
      case 'critical':
        if (onlineNodes === 0 && totalNodes > 0) {
          return `所有节点离线（共 ${totalNodes} 个），需要立即处理`
        }
        return `检测到 ${abnormalItems.offlineNodes.length} 个异常节点，需要立即处理`
      
      default:
        return '网络状态未知'
    }
  }
  
  /**
   * 生成待处理任务
   */
  const generatePendingTasks = (data: DashboardData): PendingTask[] => {
    const tasks: PendingTask[] = []
    const abnormal = data.abnormalItems
    
    // 离线节点任务
    if (abnormal.offlineNodes.length > 0) {
      tasks.push({
        type: 'offline_node',
        count: abnormal.offlineNodes.length,
        message: `${abnormal.offlineNodes.length} 个节点离线`,
        actionText: '检查节点',
        actionPath: '/app/nodes?filter=offline',
        priority: 'high'
      })
    }
    
    // 待处理连接任务
    if (pendingConnections.value.length > 0) {
      tasks.push({
        type: 'pending_connection',
        count: pendingConnections.value.length,
        message: `${pendingConnections.value.length} 个待处理连接`,
        actionText: '立即处理',
        actionPath: '/app/routes/pending',
        priority: 'medium'
      })
    }
    
    // 未配置节点任务
    if (abnormal.unconfiguredNodes.length > 0) {
      tasks.push({
        type: 'unconfigured_node',
        count: abnormal.unconfiguredNodes.length,
        message: `${abnormal.unconfiguredNodes.length} 个节点未配置`,
        actionText: '完成配置',
        actionPath: '/app/nodes?filter=unconfigured',
        priority: 'low'
      })
    }
    
    // 按优先级排序
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
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

  /**
   * 从本地存储加载活动记录
   */
  const loadActivitiesFromStorage = (): Activity[] => {
    try {
      const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY)
      if (!stored) return []
      
      const storage: ActivitiesStorage = JSON.parse(stored)
      
      // 转换时间戳为 Date 对象
      return storage.activities.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))
    } catch (error) {
      debug.error('Dashboard: 加载活动记录失败:', error)
      return []
    }
  }

  /**
   * 保存活动记录到本地存储
   */
  const saveActivitiesToStorage = (activities: Activity[]) => {
    try {
      const storage: ActivitiesStorage = {
        version: 1,
        activities: activities.slice(0, MAX_ACTIVITIES_STORED),
        lastUpdate: new Date().toISOString()
      }
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(storage))
    } catch (error) {
      debug.error('Dashboard: 保存活动记录失败:', error)
    }
  }

  /**
   * 添加新活动记录
   */
  const addActivity = (type: ActivityType, message: string, link?: string, metadata?: Record<string, any>) => {
    const newActivity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      link,
      metadata
    }
    
    // 添加到列表开头
    recentActivities.value.unshift(newActivity)
    
    // 限制数量
    if (recentActivities.value.length > MAX_ACTIVITIES_STORED) {
      recentActivities.value = recentActivities.value.slice(0, MAX_ACTIVITIES_STORED)
    }
    
    // 保存到本地存储
    saveActivitiesToStorage(recentActivities.value)
    
    debug.log('Dashboard: 新增活动:', newActivity)
  }

  /**
   * 检测节点状态变化并生成活动记录
   */
  const detectNodeChanges = (currentNodes: Node[]) => {
    const currentNodesMap = new Map(currentNodes.map(n => [n.id, n]))
    
    // 检测新增节点
    for (const [id, node] of currentNodesMap) {
      if (!previousState.value.nodes.has(id)) {
        addActivity(
          'node_added',
          `新增节点 "${node.node_name}"`,
          '/app/nodes',
          { nodeId: id, nodeName: node.node_name }
        )
      }
    }
    
    // 检测节点状态变化
    for (const [id, prevNode] of previousState.value.nodes) {
      const currentNode = currentNodesMap.get(id)
      
      if (!currentNode) {
        // 节点被删除
        addActivity(
          'node_deleted',
          `删除节点 "${prevNode.node_name}"`,
          undefined,
          { nodeId: id, nodeName: prevNode.node_name }
        )
      } else if (prevNode.node_status !== currentNode.node_status) {
        // 状态变化
        if (currentNode.node_status === NODE_STATUS.ONLINE && prevNode.node_status !== NODE_STATUS.ONLINE) {
          addActivity(
            'node_online',
            `节点 "${currentNode.node_name}" 上线`,
            '/app/nodes',
            { nodeId: id, nodeName: currentNode.node_name }
          )
        } else if (prevNode.node_status === NODE_STATUS.ONLINE && currentNode.node_status !== NODE_STATUS.ONLINE) {
          addActivity(
            'node_offline',
            `节点 "${currentNode.node_name}" 离线`,
            '/app/nodes',
            { nodeId: id, nodeName: currentNode.node_name }
          )
        }
      }
    }
    
    // 更新状态
    previousState.value.nodes = currentNodesMap
  }

  /**
   * 检测路由变化并生成活动记录
   */
  const detectRouteChanges = (currentRoutesCount: number) => {
    const prevCount = previousState.value.routesCount
    
    if (prevCount === 0) {
      // 初始化，不生成活动
      previousState.value.routesCount = currentRoutesCount
      return
    }
    
    if (currentRoutesCount > prevCount) {
      const diff = currentRoutesCount - prevCount
      addActivity(
        'route_created',
        `新建了 ${diff} 个路由连接`,
        '/app/routes',
        { count: diff }
      )
    } else if (currentRoutesCount < prevCount) {
      const diff = prevCount - currentRoutesCount
      addActivity(
        'route_deleted',
        `删除了 ${diff} 个路由连接`,
        '/app/routes',
        { count: diff }
      )
    }
    
    previousState.value.routesCount = currentRoutesCount
  }

  /**
   * 检测待处理连接变化
   */
  const detectPendingConnectionChanges = (currentPendingCount: number) => {
    const prevCount = previousState.value.pendingCount
    
    if (prevCount === 0) {
      // 初始化，不生成活动
      previousState.value.pendingCount = currentPendingCount
      return
    }
    
    if (currentPendingCount > prevCount) {
      const diff = currentPendingCount - prevCount
      addActivity(
        'connection_request',
        `收到 ${diff} 个新的连接请求`,
        '/app/routes/pending',
        { count: diff }
      )
    } else if (currentPendingCount < prevCount) {
      const diff = prevCount - currentPendingCount
      // 可能是接受或拒绝了连接请求
      addActivity(
        'connection_accepted',
        `处理了 ${diff} 个连接请求`,
        '/app/routes',
        { count: diff }
      )
    }
    
    previousState.value.pendingCount = currentPendingCount
  }

  /**
   * 获取最近活动
   * TODO: 后续接入真实的活动日志API
   */
  const fetchRecentActivities = async () => {
    try {
      // 从本地存储加载活动记录
      const storedActivities = loadActivitiesFromStorage()
      if (storedActivities.length > 0) {
        recentActivities.value = storedActivities
        debug.log('Dashboard: 从本地存储加载了', storedActivities.length, '条活动记录')
      }
    } catch (error) {
      debug.error('Dashboard: 获取最近活动失败:', error)
    }
  }

  // 处理WebSocket消息
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'dashboard_update') {
      // WebSocket 推送的 Dashboard 更新
      fetchDashboardData()
    } else if (data.type === 'node_status_change') {
      // 节点状态变化，刷新数据
      fetchDashboardData()
    } else if (data.type === 'activity') {
      // 新活动
      recentActivities.value.unshift(data.payload)
      if (recentActivities.value.length > 10) {
        recentActivities.value.pop()
      }
    }
  }

  // 初始化
  onMounted(async () => {
    await fetchDashboardData()
    await fetchRecentActivities()

    // WebSocket连接由boot/websocket.ts统一管理，这里不再重复连接
  })

  onUnmounted(() => {
    // WebSocket断开由boot/websocket.ts统一管理，这里不需要手动断开
  })

  return {
    // 状态数据
    dashboardData,
    realtimeData,
    recentActivities,
    isLoading,
    isConnected,
    
    // 节点和路由数据（供组件直接使用）
    nodes,
    pendingConnections,
    
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
