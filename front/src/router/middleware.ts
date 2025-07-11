/**
 * 路由中间件 - 认证和权限检查
 */

import { Router } from 'vue-router'
import { useAuth } from '../composables/useAuth'

/**
 * 设置路由守卫
 */
export function setupRouteGuards(router: Router) {
  
  // 全局前置守卫 - 认证检查
  router.beforeEach(async (to, from, next) => {
    // 简化的认证检查，实际应用中应该使用store中的认证状态
    const isAuthenticated = !!localStorage.getItem('auth_token')
    
    // 检查是否需要认证
    if (to.meta?.requiresAuth && !isAuthenticated) {
      // 保存原始路径用于登录后重定向
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 节点路由特殊处理
    if (to.path.includes('/nodes/')) {
      const nodeId = to.params.id as string
      
      // 验证节点ID格式（如果存在）
      if (nodeId && !isValidNodeId(nodeId)) {
        next('/nodes')
        return
      }

      // 检查节点编辑权限
      if (to.path.includes('/edit') && !await hasNodeEditPermission(nodeId)) {
        next(`/nodes/${nodeId}`) // 重定向到详情页
        return
      }
    }

    next()
  })

  // 全局后置钩子 - 页面标题设置
  router.afterEach((to) => {
    // 动态设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} | MyNet`
    } else {
      document.title = 'MyNet'
    }

    // 添加页面加载完成的类名（用于CSS动画）
    document.body.classList.add('page-loaded')
    
    // 滚动到顶部
    window.scrollTo(0, 0)
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    
    // 处理动态导入失败
    if (error.message?.includes('Loading chunk')) {
      // 刷新页面重新加载
      window.location.reload()
    }
  })
}

/**
 * 验证节点ID格式
 */
function isValidNodeId(nodeId: string): boolean {
  // 简单的节点ID验证，可以根据实际规则调整
  return /^[a-zA-Z0-9-_]+$/.test(nodeId) && nodeId.length > 0
}

/**
 * 检查节点编辑权限
 */
async function hasNodeEditPermission(nodeId: string): Promise<boolean> {
  // 这里可以添加具体的权限检查逻辑
  // 例如检查用户是否有编辑该节点的权限
  try {
    // 示例：检查节点是否存在且用户有权限
    // const nodeService = new NodeService()
    // const node = await nodeService.getNode(nodeId)
    // return node && userCanEditNode(node)
    
    // 暂时返回true，实际应用中需要实现具体逻辑
    return true
  } catch (error) {
    console.error('检查节点编辑权限失败:', error)
    return false
  }
}

/**
 * 路由监听器 - 用于组件中监听路由变化
 */
export class RouteWatcher {
  private router: Router
  private listeners: Map<string, Function[]> = new Map()

  constructor(router: Router) {
    this.router = router
    this.setupWatcher()
  }

  private setupWatcher() {
    this.router.afterEach((to, from) => {
      // 触发路由变化监听器
      this.emit('route:change', { to, from })
      
      // 触发特定路由的监听器
      if (to.name) {
        this.emit(`route:${String(to.name)}`, { to, from })
      }
    })
  }

  /**
   * 添加路由监听器
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 移除路由监听器
   */
  off(event: string, callback?: Function) {
    const callbacks = this.listeners.get(event)
    if (!callbacks) return

    if (callback) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发监听器
   */
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }
}

/**
 * 面包屑导航生成器
 */
export class BreadcrumbGenerator {
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  /**
   * 生成当前路由的面包屑
   */
  generate() {
    const route = this.router.currentRoute.value
    const breadcrumbs = []

    // 根路径
    breadcrumbs.push({
      label: '首页',
      to: '/',
      icon: 'home'
    })

    // 根据路径生成面包屑
    if (route.matched.length > 1) {
      for (let i = 1; i < route.matched.length; i++) {
        const matched = route.matched[i]
        if (!matched) continue

        // 跳过重定向路由
        if (matched.redirect) continue

        // 生成面包屑项
        const breadcrumb = this.createBreadcrumbItem(matched, route)
        if (breadcrumb) {
          breadcrumbs.push(breadcrumb)
        }
      }
    }

    return breadcrumbs
  }

  /**
   * 创建面包屑项
   */
  private createBreadcrumbItem(routeRecord: any, currentRoute: any) {
    const meta = routeRecord.meta || {}
    const title = meta.title || routeRecord.name

    if (!title) return null

    // 构建路径
    let to = routeRecord.path
    
    // 替换动态参数
    Object.keys(currentRoute.params).forEach(key => {
      to = to.replace(`:${key}`, currentRoute.params[key])
    })

    return {
      label: title,
      to,
      icon: meta.icon
    }
  }
}

/**
 * 页面进度条控制
 */
export class PageProgressBar {
  private isLoading = false

  /**
   * 开始加载
   */
  start() {
    if (this.isLoading) return
    
    this.isLoading = true
    // 这里可以集成进度条组件，如nprogress
    document.body.classList.add('page-loading')
  }

  /**
   * 完成加载
   */
  finish() {
    if (!this.isLoading) return
    
    this.isLoading = false
    document.body.classList.remove('page-loading')
    
    // 短暂延迟后添加完成类
    setTimeout(() => {
      document.body.classList.add('page-loaded')
    }, 100)
  }

  /**
   * 设置进度
   */
  set(progress: number) {
    // 可以在这里更新进度条的进度
    console.log(`页面加载进度: ${progress}%`)
  }
}

/**
 * 缓存路由状态
 */
export class RouteStateCache {
  private cache = new Map<string, any>()

  /**
   * 保存路由状态
   */
  save(routeName: string, state: any) {
    this.cache.set(routeName, {
      ...state,
      timestamp: Date.now()
    })
  }

  /**
   * 获取路由状态
   */
  get(routeName: string, maxAge = 5 * 60 * 1000) { // 默认5分钟过期
    const cached = this.cache.get(routeName)
    if (!cached) return null

    // 检查是否过期
    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(routeName)
      return null
    }

    return cached
  }

  /**
   * 清除指定路由的缓存
   */
  clear(routeName?: string) {
    if (routeName) {
      this.cache.delete(routeName)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 清除过期缓存
   */
  clearExpired(maxAge = 5 * 60 * 1000) {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * 导出工具实例创建函数
 */
export function createRouteUtils(router: Router) {
  return {
    watcher: new RouteWatcher(router),
    breadcrumb: new BreadcrumbGenerator(router),
    progressBar: new PageProgressBar(),
    stateCache: new RouteStateCache()
  }
}
