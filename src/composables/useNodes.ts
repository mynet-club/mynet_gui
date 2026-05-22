/**
 * 节点列表管理组合式函数
 * 提供节点列表的状态管理和操作方法
 */

import { ref, computed, reactive, readonly } from 'vue'
import debug from 'src/utils/debug'
import { nodeService } from '../services/node/nodeService'
// import { useNotify } from './useNotify'
import type { 
  Node, 
  NodesListParams, 
  CreateNodeRequest,
  NodeStatus 
} from '../types/node'
import type { PaginatedApiResponse } from '../types/api'

// 临时的通知函数，后续可以替换为实际的 useNotify
const useNotify = () => ({
  success: (message: string) => debug.log('SUCCESS:', message),
  error: (message: string) => debug.error('ERROR:', message),
  warning: (message: string) => debug.warn('WARNING:', message),
  info: (message: string) => debug.info('INFO:', message)
})

export function useNodes() {
  // 响应式状态
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const deleting = ref<string | null>(null)

  // 分页状态
  const pagination = reactive({
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
    sortBy: '',
    descending: false
  })

  // 搜索和过滤状态
  const filters = reactive({
    search: '',
    status: '' as NodeStatus | '',
    nodeType: ''
  })

  // 通知功能
  const { success: notifySuccess, error: notifyError } = useNotify()

  // 计算属性
  const hasNodes = computed(() => nodes.value.length > 0)
  const isEmpty = computed(() => !loading.value && nodes.value.length === 0)
  const totalPages = computed(() => Math.ceil(pagination.rowsNumber / pagination.rowsPerPage))
  
  // 按状态分组的节点统计
  const nodeStats = computed(() => {
    const stats = {
      total: nodes.value.length,
      active: 0,
      inactive: 0,
      pending: 0
    }
    
    nodes.value.forEach(node => {
      if (node.status === 'active') stats.active++
      else if (node.status === 'inactive') stats.inactive++
      else if (node.status === 'pending') stats.pending++
    })
    
    return stats
  })

  // 过滤后的节点列表
  const filteredNodes = computed(() => {
    return nodes.value.filter(node => {
      // 搜索过滤
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesName = node.node_name.toLowerCase().includes(search)
        const matchesId = String(node.node_id).toLowerCase().includes(search)
        const matchesDescription = node.description?.toLowerCase().includes(search) || 
                                 node.node_remarks?.toLowerCase().includes(search)
        if (!matchesName && !matchesId && !matchesDescription) {
          return false
        }
      }
      
      // 状态过滤
      const nodeStatus = node.status || node.node_status
      if (filters.status && nodeStatus !== filters.status) {
        return false
      }
      
      // 节点类型过滤
      if (filters.nodeType && node.node_type !== filters.nodeType) {
        return false
      }
      
      return true
    })
  })

  /**
   * 加载节点列表
   */
  const loadNodes = async (params?: Partial<NodesListParams>) => {
    loading.value = true
    try {
      const queryParams: NodesListParams = {
        page: pagination.page,
        per_page: pagination.rowsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...params
      }

      debug.log('正在请求节点列表，参数:', queryParams)
      const response = await nodeService.getNodes(queryParams)
      debug.log('节点列表API响应:', response)
      
      // 根据实际API响应结构解析数据
      if (response.data && response.data.nodes) {
        nodes.value = response.data.nodes.data || []
        pagination.rowsNumber = response.data.nodes.total || 0
        pagination.page = response.data.nodes.current_page || 1
        debug.log('解析后的节点数据:', nodes.value)
      } else if (response.data && Array.isArray(response.data)) {
        // 如果直接返回数组
        nodes.value = response.data
        pagination.rowsNumber = response.data.length
        pagination.page = 1
        debug.log('直接数组格式的节点数据:', nodes.value)
      } else {
        // 兼容其他可能的响应格式
        debug.log('未知的响应格式，设置为空数组')
        nodes.value = []
        pagination.rowsNumber = 0
        pagination.page = 1
      }
      
    } catch (error) {
      debug.error('加载节点列表失败:', error)
      notifyError('加载节点列表失败')
      nodes.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新节点列表
   */
  const refreshNodes = async () => {
    await loadNodes()
  }

  /**
   * 创建新节点
   */
  const createNode = async (data: CreateNodeRequest): Promise<Node | null> => {
    creating.value = true
    try {
      const response = await nodeService.createNode(data)
      debug.log('API响应:', response)
      const newNode = response.data
      debug.log('新节点数据:', newNode)
      debug.log('节点ID字段 - id:', newNode.id, 'node_id:', newNode.node_id)
      
      // 将新节点添加到列表开头
      nodes.value.unshift(newNode)
      pagination.rowsNumber += 1
      
      notifySuccess('节点创建成功')
      return newNode
    } catch (error) {
      debug.error('创建节点失败:', error)
      notifyError('创建节点失败')
      return null
    } finally {
      creating.value = false
    }
  }

  /**
   * 删除节点
   */
  const deleteNode = async (nodeId: string): Promise<boolean> => {
    deleting.value = nodeId
    try {
      await nodeService.deleteNode(nodeId)
      
      // 从列表中移除节点
      const index = nodes.value.findIndex(node => node.node_id === nodeId)
      if (index !== -1) {
        nodes.value.splice(index, 1)
        pagination.rowsNumber -= 1
      }
      
      notifySuccess('节点删除成功')
      return true
    } catch (error) {
      debug.error('删除节点失败:', error)
      notifyError('删除节点失败')
      return false
    } finally {
      deleting.value = null
    }
  }

  /**
   * 更新节点状态
   */
  const updateNodeStatus = async (nodeId: string, status: NodeStatus): Promise<boolean> => {
    try {
      await nodeService.updateNodeStatus(nodeId, status)
      
      // 更新本地节点状态
      const node = nodes.value.find(n => n.node_id === nodeId)
      if (node) {
        node.status = status
        node.updated_at = new Date().toISOString()
      }
      
      notifySuccess(`节点状态已更新为${nodeService.formatNodeStatus(status)}`)
      return true
    } catch (error) {
      debug.error('更新节点状态失败:', error)
      notifyError('更新节点状态失败')
      return false
    }
  }

  /**
   * 搜索节点
   */
  const searchNodes = async (query: string) => {
    filters.search = query
    pagination.page = 1 // 重置到第一页
    await loadNodes()
  }

  /**
   * 清除搜索
   */
  const clearSearch = async () => {
    filters.search = ''
    pagination.page = 1
    await loadNodes()
  }

  /**
   * 设置状态过滤
   */
  const setStatusFilter = async (status: NodeStatus | '') => {
    filters.status = status
    pagination.page = 1
    await loadNodes()
  }

  /**
   * 清除所有过滤器
   */
  const clearFilters = async () => {
    filters.search = ''
    filters.status = ''
    filters.nodeType = ''
    pagination.page = 1
    await loadNodes()
  }

  /**
   * 切换页码
   */
  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      pagination.page = page
      await loadNodes()
    }
  }

  /**
   * 改变每页显示数量
   */
  const changePageSize = async (pageSize: number) => {
    pagination.rowsPerPage = pageSize
    pagination.page = 1
    await loadNodes()
  }

  /**
   * 获取节点在列表中的索引
   */
  const getNodeIndex = (nodeId: string): number => {
    return nodes.value.findIndex(node => node.node_id === nodeId)
  }

  /**
   * 更新本地节点数据
   */
  const updateLocalNode = (nodeId: string, updates: Partial<Node>) => {
    const index = getNodeIndex(nodeId)
    if (index !== -1 && nodes.value[index]) {
      Object.assign(nodes.value[index], updates)
    }
  }

  /**
   * 批量选择相关状态和方法
   */
  const selectedNodes = ref<string[]>([])
  const selectAll = ref(false)

  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedNodes.value = filteredNodes.value.map(node => String(node.id))
    } else {
      selectedNodes.value = []
    }
  }

  const toggleSelectNode = (nodeId: string) => {
    const index = selectedNodes.value.indexOf(nodeId)
    if (index === -1) {
      selectedNodes.value.push(nodeId)
    } else {
      selectedNodes.value.splice(index, 1)
    }
    
    // 更新全选状态
    selectAll.value = selectedNodes.value.length === filteredNodes.value.length
  }

  const clearSelection = () => {
    selectedNodes.value = []
    selectAll.value = false
  }

  /**
   * 批量删除选中的节点
   */
  const deleteSelectedNodes = async (): Promise<boolean> => {
    if (selectedNodes.value.length === 0) return false
    
    try {
      const deletePromises = selectedNodes.value.map(nodeId => deleteNode(nodeId))
      const results = await Promise.all(deletePromises)
      
      clearSelection()
      
      const successCount = results.filter(result => result).length
      if (successCount === selectedNodes.value.length) {
        notifySuccess(`成功删除 ${successCount} 个节点`)
      } else {
        notifyError(`删除完成，成功 ${successCount} 个，失败 ${selectedNodes.value.length - successCount} 个`)
      }
      
      return true
    } catch (error) {
      debug.error('批量删除节点失败:', error)
      notifyError('批量删除节点失败')
      return false
    }
  }

  /**
   * 导出节点列表
   */
  const exportNodes = async (format: 'csv' | 'excel' | 'json' = 'csv') => {
    try {
      // 获取所有节点数据
      const queryParams: NodesListParams = {
        page: 1,
        per_page: 10000,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status })
      }
      const allNodes = await nodeService.getNodes(queryParams)
      
      // 创建数据字符串
      let content = ''
      let fileName = `nodes-${new Date().toISOString().split('T')[0]}`
      let mimeType = 'text/csv'
      
      if (format === 'csv') {
        const headers = ['ID', 'Node ID', 'Name', 'Status', 'Type', 'IP Address', 'Created At']
        const nodesData = allNodes.data?.nodes?.data || []
        const rows = nodesData.map((node: any) => [
          node.id,
          node.node_id,
          node.node_name,
          node.status || node.node_status,
          node.node_type || '',
          node.node_ip || node.ip_address || '',
          node.created_at
        ])
        content = [headers, ...rows].map(row => row.join(',')).join('\n')
        fileName += '.csv'
      } else if (format === 'json') {
        const nodesData = allNodes.data?.nodes?.data || []
        content = JSON.stringify(nodesData, null, 2)
        fileName += '.json'
        mimeType = 'application/json'
      }
      
      // 创建下载链接
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      notifySuccess('节点列表导出成功')
    } catch (error) {
      debug.error('导出节点列表失败:', error)
      notifyError('导出节点列表失败')
    }
  }

  return {
    // 状态
    nodes: readonly(nodes),
    loading: readonly(loading),
    creating: readonly(creating),
    deleting: readonly(deleting),
    pagination,
    filters,
    
    // 计算属性
    hasNodes,
    isEmpty,
    totalPages,
    nodeStats,
    filteredNodes,
    
    // 基础操作
    loadNodes,
    refreshNodes,
    createNode,
    deleteNode,
    updateNodeStatus,
    
    // 搜索和过滤
    searchNodes,
    clearSearch,
    setStatusFilter,
    clearFilters,
    
    // 分页
    goToPage,
    changePageSize,
    
    // 本地更新
    updateLocalNode,
    getNodeIndex,
    
    // 批量选择
    selectedNodes: readonly(selectedNodes),
    selectAll,
    toggleSelectAll,
    toggleSelectNode,
    clearSelection,
    deleteSelectedNodes,
    
    // 导出
    exportNodes
  }
}
