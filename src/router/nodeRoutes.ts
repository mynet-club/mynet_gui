/**
 * 节点管理路由工具
 */

import { Router } from 'vue-router'

/**
 * 节点管理路由路径常量
 */
export const NODE_ROUTES = {
  // 节点列表
  NODES: '/nodes',
  
  // 节点创建
  NODE_CREATE: '/nodes/create',
  
  // 节点详情
  NODE_DETAIL: (id: string) => `/nodes/${id}`,
  
  // 节点编辑
  NODE_EDIT: (id: string) => `/nodes/${id}/edit`,
  NODE_EDIT_BASIC: (id: string) => `/nodes/${id}/edit/basic`,
  NODE_EDIT_NETWORK: (id: string) => `/nodes/${id}/edit/network`,
  NODE_EDIT_CONFIG: (id: string) => `/nodes/${id}/edit/config`,
  NODE_EDIT_KEYS: (id: string) => `/nodes/${id}/edit/keys`,
} as const

/**
 * 路由名称常量
 */
export const NODE_ROUTE_NAMES = {
  NODES: 'nodes',
  NODE_CREATE: 'node-create',
  NODE_DETAIL: 'node-detail',
  NODE_EDIT: 'node-edit',
  NODE_EDIT_BASIC: 'node-edit-basic',
  NODE_EDIT_NETWORK: 'node-edit-network',
  NODE_EDIT_CONFIG: 'node-edit-config',
  NODE_EDIT_KEYS: 'node-edit-keys',
} as const

/**
 * 路由导航工具类
 */
export class NodeRouteNavigator {
  constructor(private router: Router) {}

  /**
   * 跳转到节点列表
   */
  toNodesList(query?: Record<string, any>) {
    return this.router.push({
      path: NODE_ROUTES.NODES,
      ...(query && { query })
    })
  }

  /**
   * 跳转到创建节点
   */
  toCreateNode() {
    return this.router.push(NODE_ROUTES.NODE_CREATE)
  }

  /**
   * 跳转到节点详情
   */
  toNodeDetail(nodeId: string) {
    return this.router.push(NODE_ROUTES.NODE_DETAIL(nodeId))
  }

  /**
   * 跳转到节点编辑
   */
  toNodeEdit(nodeId: string, tab?: 'basic' | 'network' | 'config' | 'keys') {
    if (tab) {
      const routes = {
        basic: NODE_ROUTES.NODE_EDIT_BASIC(nodeId),
        network: NODE_ROUTES.NODE_EDIT_NETWORK(nodeId),
        config: NODE_ROUTES.NODE_EDIT_CONFIG(nodeId),
        keys: NODE_ROUTES.NODE_EDIT_KEYS(nodeId),
      }
      return this.router.push(routes[tab])
    }
    return this.router.push(NODE_ROUTES.NODE_EDIT(nodeId))
  }

  /**
   * 跳转到基础信息编辑
   */
  toBasicInfoEdit(nodeId: string) {
    return this.router.push(NODE_ROUTES.NODE_EDIT_BASIC(nodeId))
  }

  /**
   * 跳转到网络配置编辑
   */
  toNetworkConfigEdit(nodeId: string) {
    return this.router.push(NODE_ROUTES.NODE_EDIT_NETWORK(nodeId))
  }

  /**
   * 跳转到节点配置编辑
   */
  toNodeConfigEdit(nodeId: string) {
    return this.router.push(NODE_ROUTES.NODE_EDIT_CONFIG(nodeId))
  }

  /**
   * 跳转到密钥管理
   */
  toKeyManagement(nodeId: string) {
    return this.router.push(NODE_ROUTES.NODE_EDIT_KEYS(nodeId))
  }

  /**
   * 返回上一页
   */
  goBack() {
    return this.router.back()
  }

  /**
   * 获取当前路由信息
   */
  getCurrentRoute() {
    return this.router.currentRoute.value
  }

  /**
   * 检查是否在节点编辑页面
   */
  isInNodeEdit(): boolean {
    const route = this.getCurrentRoute()
    return route.path.includes('/nodes/') && route.path.includes('/edit')
  }

  /**
   * 获取当前编辑的节点ID
   */
  getCurrentNodeId(): string | null {
    const route = this.getCurrentRoute()
    return route.params.id as string || null
  }

  /**
   * 获取当前编辑标签页
   */
  getCurrentEditTab(): string | null {
    const route = this.getCurrentRoute()
    const path = route.path
    
    if (path.includes('/basic')) return 'basic'
    if (path.includes('/network')) return 'network'
    if (path.includes('/config')) return 'config'
    if (path.includes('/keys')) return 'keys'
    
    return null
  }
}

/**
 * 面包屑导航数据
 */
export const getNodeBreadcrumbs = (route: any) => {
  const breadcrumbs = [
    { label: '首页', to: '/' }
  ]

  const path = route.path
  const nodeId = route.params.id as string

  if (path === NODE_ROUTES.NODES) {
    breadcrumbs.push({ label: '节点管理', to: NODE_ROUTES.NODES })
  } else if (path === NODE_ROUTES.NODE_CREATE) {
    breadcrumbs.push(
      { label: '节点管理', to: NODE_ROUTES.NODES },
      { label: '创建节点', to: NODE_ROUTES.NODE_CREATE }
    )
  } else if (path.includes('/nodes/') && !path.includes('/edit')) {
    breadcrumbs.push(
      { label: '节点管理', to: NODE_ROUTES.NODES },
      { label: '节点详情', to: NODE_ROUTES.NODE_DETAIL(nodeId) }
    )
  } else if (path.includes('/nodes/') && path.includes('/edit')) {
    breadcrumbs.push(
      { label: '节点管理', to: NODE_ROUTES.NODES },
      { label: '节点详情', to: NODE_ROUTES.NODE_DETAIL(nodeId) },
      { label: '编辑节点', to: NODE_ROUTES.NODE_EDIT(nodeId) }
    )

    // 添加具体的编辑标签页
    if (path.includes('/basic')) {
      breadcrumbs.push({ label: '基础信息', to: NODE_ROUTES.NODE_EDIT_BASIC(nodeId) })
    } else if (path.includes('/network')) {
      breadcrumbs.push({ label: '网络配置', to: NODE_ROUTES.NODE_EDIT_NETWORK(nodeId) })
    } else if (path.includes('/config')) {
      breadcrumbs.push({ label: '节点配置', to: NODE_ROUTES.NODE_EDIT_CONFIG(nodeId) })
    } else if (path.includes('/keys')) {
      breadcrumbs.push({ label: '密钥管理', to: NODE_ROUTES.NODE_EDIT_KEYS(nodeId) })
    }
  }

  return breadcrumbs
}

/**
 * 导航标签页配置
 */
export const getNodeEditTabs = (nodeId: string) => [
  {
    name: 'basic',
    label: '基础信息',
    to: NODE_ROUTES.NODE_EDIT_BASIC(nodeId),
    icon: 'info'
  },
  {
    name: 'network',
    label: '网络配置',
    to: NODE_ROUTES.NODE_EDIT_NETWORK(nodeId),
    icon: 'settings_ethernet'
  },
  {
    name: 'config',
    label: '节点配置',
    to: NODE_ROUTES.NODE_EDIT_CONFIG(nodeId),
    icon: 'settings'
  },
  {
    name: 'keys',
    label: '密钥管理',
    to: NODE_ROUTES.NODE_EDIT_KEYS(nodeId),
    icon: 'vpn_key'
  }
]

/**
 * 快捷操作菜单配置
 */
export const getNodeActionMenus = (nodeId: string) => [
  {
    label: '查看详情',
    icon: 'visibility',
    action: 'view',
    to: NODE_ROUTES.NODE_DETAIL(nodeId)
  },
  {
    label: '编辑信息',
    icon: 'edit',
    action: 'edit',
    to: NODE_ROUTES.NODE_EDIT_BASIC(nodeId)
  },
  {
    label: '网络配置',
    icon: 'settings_ethernet',
    action: 'network',
    to: NODE_ROUTES.NODE_EDIT_NETWORK(nodeId)
  },
  {
    label: '密钥管理',
    icon: 'vpn_key',
    action: 'keys',
    to: NODE_ROUTES.NODE_EDIT_KEYS(nodeId)
  },
  {
    type: 'separator'
  },
  {
    label: '删除节点',
    icon: 'delete',
    action: 'delete',
    color: 'negative'
  }
]
