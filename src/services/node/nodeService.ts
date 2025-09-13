/**
 * 节点管理基础服务
 * 基于OpenAPI文档 v1.0.0
 */

import { api } from '../api'
import type { 
  Node, 
  CreateNodeRequest, 
  UpdateNodeRequest, 
  UpdateNodeStatusRequest,
  NodesListParams,
  NodeStatus,
  NodeNetworkConfig,
  UpdateNodeNetworkConfigRequest,
  AvailableIPsResponse,
  NodeIndexServicesResponse,
  NodeStatusInfo,
  NodeDeviceInfo,
  NodeDeviceInfoResponse
} from '../../types/node'
import type { 
  ApiResponse, 
  PaginatedApiResponse,
  NodesListApiResponse
} from '../../types/api'

/**
 * 节点服务类
 * 提供节点的基础CRUD操作
 */
export class NodeService {
  
  /**
   * 获取节点列表
   * @param params 查询参数
   * @returns 分页的节点列表
   */
  async getNodes(params?: NodesListParams): Promise<NodesListApiResponse> {
    const response = await api.get('/nodes', { params })
    return response.data
  }

  /**
   * 获取单个节点详情
   * @param nodeId 节点ID (node_id)
   * @returns 节点详情
   */
  async getNode(nodeId: string): Promise<ApiResponse<Node>> {
    const response = await api.get(`/nodes/${nodeId}`)
    return response.data
  }

  /**
   * 创建新节点
   * @param data 创建节点数据
   * @returns 创建的节点
   */
  async createNode(data: CreateNodeRequest): Promise<ApiResponse<Node>> {
    const response = await api.post('/nodes/create', data)
    return response.data
  }

  /**
   * 更新节点信息
   * @param nodeId 节点ID (node_id)
   * @param data 更新数据
   * @returns 更新后的节点
   */
  async updateNode(nodeId: string, data: UpdateNodeRequest): Promise<ApiResponse<Node>> {
    const response = await api.put(`/nodes/${nodeId}`, data)
    return response.data
  }

  /**
   * 删除节点
   * @param nodeId 节点ID (node_id)
   * @returns 删除操作结果
   */
  async deleteNode(nodeId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/nodes/${nodeId}`)
    return response.data
  }

  /**
   * 更新节点状态
   * @param nodeId 节点ID (node_id)
   * @param status 新状态
   * @returns 更新结果
   */
  async updateNodeStatus(nodeId: string, status: UpdateNodeStatusRequest['status']): Promise<ApiResponse<void>> {
    const response = await api.patch(`/nodes/${nodeId}/status`, { status })
    return response.data
  }

  /**
   * 更新节点状态（数字状态码）
   * @param nodeId 节点ID (node_id)
   * @param statusCode 新状态码
   * @returns 更新结果
   */
  async updateNodeStatusCode(nodeId: string, statusCode: number): Promise<ApiResponse<void>> {
    const response = await api.patch(`/nodes/${nodeId}/status`, { status: statusCode })
    return response.data
  }

  /**
   * 获取节点设备信息
   * @param nodeId 节点ID
   * @returns 设备信息
   */
  async getNodeDeviceInfo(nodeId: string): Promise<NodeDeviceInfoResponse> {
    const response = await api.get(`/nodes/${nodeId}/deviceinfo`)
    return response.data
  }

  /**
   * 更新节点设备信息
   * @param nodeId 节点ID
   * @param deviceInfo 设备信息
   * @returns 更新结果
   */
  async updateNodeDeviceInfo(nodeId: string, deviceInfo: NodeDeviceInfo): Promise<ApiResponse<void>> {
    const response = await api.put(`/nodes/${nodeId}/deviceinfo`, deviceInfo)
    return response.data
  }

  /**
   * 局部更新节点设备信息
   * @param nodeId 节点ID
   * @param deviceInfo 设备信息（部分字段）
   * @returns 更新结果
   */
  async patchNodeDeviceInfo(nodeId: string, deviceInfo: Partial<NodeDeviceInfo>): Promise<ApiResponse<void>> {
    const response = await api.patch(`/nodes/${nodeId}/deviceinfo`, deviceInfo)
    return response.data
  }

  /**
   * 搜索节点
   * @param query 搜索关键词
   * @param params 额外查询参数
   * @returns 搜索结果
   */
  async searchNodes(query: string, params?: Partial<NodesListParams>): Promise<NodesListApiResponse> {
    const searchParams = {
      search: query,
      ...params
    }
    return this.getNodes(searchParams)
  }

  /**
   * 获取节点类型定义
   * @returns 节点类型定义
   */
  async getNodeTypesDefinition(): Promise<ApiResponse<any>> {
    const response = await api.get('/nodes/types_def')
    return response.data
  }

  /**
   * 获取用户的可用IP地址
   * @returns 可用IP列表
   */
  async getAvailableIPs(): Promise<ApiResponse<AvailableIPsResponse>> {
    const response = await api.get('/ippools/available-ips')
    return response.data
  }

  /**
   * 获取节点的索引服务列表
   * @param nodeId 节点ID (node_id)
   * @returns 节点索引服务列表
   */
  async getNodeIndexServices(nodeId: string): Promise<NodeIndexServicesResponse> {
    const response = await api.get(`/nodes/${nodeId}/index-services`)
    return response.data
  }

  /**
   * 更新节点网络配置
   * @param nodeId 节点ID (node_id)
   * @param config 网络配置数据
   * @returns 更新结果
   */
  async updateNodeNetworkConfig(nodeId: string, config: UpdateNodeNetworkConfigRequest): Promise<ApiResponse<Node>> {
    const response = await api.put(`/nodes/${nodeId}/network-config`, config)
    return response.data
  }

  /**
   * 获取节点网络配置
   * @param nodeId 节点ID (node_id)
   * @returns 网络配置
   */
  async getNodeNetworkConfig(nodeId: string): Promise<ApiResponse<NodeNetworkConfig>> {
    const response = await api.get(`/nodes/${nodeId}/network-config`)
    return response.data
  }

  /**
   * 获取节点状态信息
   * @param nodeId 节点ID (node_id)
   * @returns 节点状态详细信息
   */
  async getNodeStatusInfo(nodeId: string): Promise<ApiResponse<NodeStatusInfo>> {
    const response = await api.get(`/nodes/${nodeId}/status-info`)
    return response.data
  }

  // --- 实用方法 ---

  /**
   * 格式化节点状态文本
   * @param status 节点状态
   * @returns 格式化后的状态文本
   */
  formatNodeStatus(status: NodeStatus): string {
    const statusMap: Record<NodeStatus, string> = {
      active: '运行中',
      inactive: '已停止',
      pending: '待处理'
    }
    return statusMap[status] || '未知'
  }

  /**
   * 获取节点状态颜色
   * @param status 节点状态
   * @returns Quasar颜色名称
   */
  getNodeStatusColor(status: NodeStatus): string {
    const colorMap: Record<NodeStatus, string> = {
      active: 'positive',
      inactive: 'grey',
      pending: 'warning'
    }
    return colorMap[status] || 'grey'
  }

  /**
   * 获取节点类型图标
   * @param nodeType 节点类型
   * @returns 图标名称
   */
  getNodeTypeIcon(nodeType?: string): string {
    const iconMap = {
      Gateway: 'router',
      Server: 'dns',
      Client: 'devices',
      Router: 'hub'
    }
    return iconMap[nodeType as keyof typeof iconMap] || 'device_hub'
  }

  /**
   * 验证节点名称
   * @param name 节点名称
   * @returns 验证结果
   */
  validateNodeName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: '节点名称不能为空' }
    }
    
    if (name.length > 50) {
      return { valid: false, error: '节点名称长度不能超过50个字符' }
    }
    
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(name)) {
      return { valid: false, error: '节点名称只能包含字母、数字、中文、下划线和横线' }
    }
    
    return { valid: true }
  }

  /**
   * 判断节点是否在线
   * @param node 节点对象
   * @returns 是否在线
   */
  isNodeOnline(node: Node): boolean {
    return node.status === 'active'
  }
}

// 创建服务实例
export const nodeService = new NodeService()

// 默认导出
export default nodeService