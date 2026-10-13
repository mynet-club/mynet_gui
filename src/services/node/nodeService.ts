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
  NodeDeviceInfo,
  NodeDeviceInfoResponse,
  BatchNodeDeviceInfoResponse,
  QuickCreateNodeResponse
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
   * 一键快速创建节点（自动使用默认配置并分配 IP）
   * @param nodeName 节点名称 (3-255字符)
   * @returns 创建结果，含节点信息、配置和下一步操作提示
   */
  async quickCreateNode(nodeName: string, vpnType: 'gnb' | 'wireguard' = 'gnb', description?: string): Promise<QuickCreateNodeResponse> {
    const response = await api.post('/nodes/quick-create', { node_name: nodeName, vpn_type: vpnType, ...(description && { description }) })
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
   * 启动节点
   * @param nodeId 节点ID
   * @param reason 操作原因（可选）
   * @returns 启动结果
   */
  async startNode(nodeId: string, reason?: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/nodes/${nodeId}/operator`, {
      action: 'start',
      params: {
        reason: reason || '手动启动'
      }
    })
    return response.data
  }

  /**
   * 停止节点
   * @param nodeId 节点ID
   * @param reason 操作原因（可选）
   * @returns 停止结果
   */
  async stopNode(nodeId: string, reason?: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/nodes/${nodeId}/operator`, {
      action: 'stop',
      params: {
        reason: reason || '手动停止'
      }
    })
    return response.data
  }

  /**
   * 重启节点
   * @param nodeId 节点ID
   * @param reason 操作原因（可选）
   * @returns 重启结果
   */
  async restartNode(nodeId: string, reason?: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/nodes/${nodeId}/operator`, {
      action: 'restart',
      params: {
        reason: reason || '手动重启'
      }
    })
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
   * 批量获取节点设备信息
   * @param nodeIds 节点ID列表
   * @returns 批量设备信息
   *
   * v2: PUT → POST（请求体传 ID 列表，POST 语义更准确）
   */
  async getBatchNodeDeviceInfo(nodeIds: Array<string | number>): Promise<BatchNodeDeviceInfoResponse> {
    const response = await api.post('/nodes/deviceinfo', {
      node_ids: nodeIds
    })
    return response.data
  }

  /**
   * 更新节点设备信息
   * @param nodeId 节点ID
   * @param deviceInfo 设备信息
   * @returns 更新结果
   *
   * v2: 仅保留 PATCH（partial update 语义）
   */
  async updateNodeDeviceInfo(nodeId: string, deviceInfo: NodeDeviceInfo): Promise<ApiResponse<void>> {
    const response = await api.patch(`/nodes/${nodeId}/deviceinfo`, deviceInfo)
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
   *
   * 注意：v2 后端将 GET /nodes/{id}/network-config 合并到统一配置端点
   *      GET /nodes/{id}/configuration?section=network。
   *      此处通过 section=network 拉取并解包 data.network，保持调用方接口不变。
   *      PUT /nodes/{id}/network-config 在 v2 中仍保留。
   */
  async getNodeNetworkConfig(nodeId: string): Promise<ApiResponse<NodeNetworkConfig>> {
    const response = await api.get(`/nodes/${nodeId}/configuration`, {
      params: { section: 'network' }
    })
    const body = response.data || {}
    // v2 返回 { data: { network: {...} }, ... }，向后兼容旧调用方期望的扁平 data
    const networkData = body?.data?.network ?? body?.network ?? body?.data ?? {}
    return { ...body, data: networkData } as ApiResponse<NodeNetworkConfig>
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