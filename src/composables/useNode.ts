import { ref, computed, reactive, watch } from 'vue'
import type { Node, CreateNodeRequest, UpdateNodeRequest } from '../types/node'
import { nodeService } from '../services/node/nodeService'
import { useNotify } from './useNotify'

/**
 * 单个节点管理组合式函数
 */
export function useNode(nodeId?: string) {
  // 临时通知函数
  const { success: notifySuccess, error: notifyError } = useNotify()

  // 状态
  const node = ref<Node | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isLoaded = computed(() => node.value !== null)
  const isOnline = computed(() => node.value?.status === 'active')
  const isOffline = computed(() => node.value?.status === 'inactive')
  const hasError = computed(() => error.value !== null)

  // 节点统计信息
  const stats = computed(() => node.value?.stats || {
    bytes_sent: 0,
    bytes_received: 0,
    connections_count: 0,
    uptime: 0,
    cpu_usage: 0,
    memory_usage: 0,
    network_usage: 0
  })

  // 格式化方法
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}天${hours}小时`
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    } else {
      return `${minutes}分钟`
    }
  }

  /**
   * 加载节点详情
   */
  const loadNode = async (id?: string) => {
    const targetId = id || nodeId
    if (!targetId) {
      error.value = '节点ID不能为空'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await nodeService.getNode(targetId)
      node.value = result.data
      error.value = null
    } catch (err) {
      console.error('加载节点失败:', err)
      error.value = '加载节点失败'
      node.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建节点
   */
  const createNode = async (data: CreateNodeRequest): Promise<Node | null> => {
    saving.value = true
    error.value = null

    try {
      const result = await nodeService.createNode(data)
      node.value = result.data
      notifySuccess('节点创建成功')
      return result.data
    } catch (err) {
      console.error('创建节点失败:', err)
      error.value = '创建节点失败'
      notifyError('创建节点失败')
      return null
    } finally {
      saving.value = false
    }
  }

  /**
   * 更新节点
   */
  const updateNode = async (data: UpdateNodeRequest): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    saving.value = true
    error.value = null

    try {
      const result = await nodeService.updateNode(String(node.value.node_id), data)
      node.value = result.data
      notifySuccess('节点更新成功')
      return true
    } catch (err) {
      console.error('更新节点失败:', err)
      error.value = '更新节点失败'
      notifyError('更新节点失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 删除节点
   */
  const deleteNode = async (): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    saving.value = true
    error.value = null

    try {
      await nodeService.deleteNode(String(node.value.node_id))
      notifySuccess('节点删除成功')
      node.value = null
      return true
    } catch (err) {
      console.error('删除节点失败:', err)
      error.value = '删除节点失败'
      notifyError('删除节点失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 启动节点
   */
  const startNode = async (): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    saving.value = true
    error.value = null

    try {
      await nodeService.updateNodeStatus(String(node.value.node_id), 'active')
      node.value.status = 'active'
      notifySuccess('节点启动成功')
      return true
    } catch (err) {
      console.error('启动节点失败:', err)
      error.value = '启动节点失败'
      notifyError('启动节点失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 停止节点
   */
  const stopNode = async (): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    saving.value = true
    error.value = null

    try {
      await nodeService.updateNodeStatus(String(node.value.node_id), 'inactive')
      node.value.status = 'inactive'
      notifySuccess('节点停止成功')
      return true
    } catch (err) {
      console.error('停止节点失败:', err)
      error.value = '停止节点失败'
      notifyError('停止节点失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 重启节点
   */
  const restartNode = async (): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    saving.value = true
    error.value = null

    try {
      // 先停止再启动
      await nodeService.updateNodeStatus(String(node.value.node_id), 'inactive')
      // 模拟重启延时
      await new Promise(resolve => setTimeout(resolve, 1000))
      await nodeService.updateNodeStatus(String(node.value.node_id), 'active')
      notifySuccess('节点重启成功')
      // 重新加载节点信息
      await loadNode()
      return true
    } catch (err) {
      console.error('重启节点失败:', err)
      error.value = '重启节点失败'
      notifyError('重启节点失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 重置节点
   */
  const resetNode = async (): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    saving.value = true
    error.value = null

    try {
      // 重置节点状态为pending
      await nodeService.updateNodeStatus(String(node.value.node_id), 'pending')
      notifySuccess('节点重置成功')
      // 重新加载节点信息
      await loadNode()
      return true
    } catch (err) {
      console.error('重置节点失败:', err)
      error.value = '重置节点失败'
      notifyError('重置节点失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 刷新节点统计信息
   */
  const refreshStats = async (): Promise<boolean> => {
    if (!node.value) {
      error.value = '节点不存在'
      return false
    }

    try {
      // 重新加载节点信息来获取最新统计信息
      const result = await nodeService.getNode(String(node.value.node_id))
      if (node.value && result.data.stats) {
        node.value.stats = result.data.stats
      }
      return true
    } catch (err) {
      console.error('刷新统计信息失败:', err)
      return false
    }
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    node.value = null
    loading.value = false
    saving.value = false
    error.value = null
  }

  // 如果提供了nodeId，自动加载节点
  if (nodeId) {
    loadNode(nodeId)
  }

  return {
    // 状态
    node,
    loading,
    saving,
    error,
    
    // 计算属性
    isLoaded,
    isOnline,
    isOffline,
    hasError,
    stats,
    
    // 格式化方法
    formatBytes,
    formatUptime,
    
    // 方法
    loadNode,
    createNode,
    updateNode,
    deleteNode,
    startNode,
    stopNode,
    restartNode,
    resetNode,
    refreshStats,
    clearError,
    reset
  }
}
