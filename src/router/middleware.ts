/**
 * 路由中间件 - 认证和权限检查
 */

import { Router } from 'vue-router'
import debug from 'src/utils/debug'
import { resolveCallbackRedirect } from 'src/utils/callbackGuard'

function localHost(): boolean {
  // 内联判定，避免打包分块把 helper 抽走后语义漂移。
  try {
    const raw = typeof window !== 'undefined' && window.location ? window.location.hostname : ''
    const h = String(raw || '').toLowerCase()
    return h === '127.0.0.1' || h === 'localhost' || h === '[::1]' || h === '::1'
  } catch {
    return false
  }
}

/**
 * 设置路由守卫
 */
export interface RouteAuthState {
  readonly isAuthenticated: boolean
  readonly token: string | null
}

export function setupRouteGuards(router: Router, auth: RouteAuthState) {
  // 唯一认证判断来自已恢复的 store（包含用户、token 与过期时间）。
  router.beforeEach((to) => {
    const isAuthRoute = to.path.startsWith('/auth/')
    if (auth.isAuthenticated && isAuthRoute) {
      const callback = to.path === '/auth/login'
        ? resolveCallbackRedirect(to.query.callback, window.location.origin)
        : null
      if (callback && auth.token) {
        const target = new URL(callback)
        target.searchParams.set('token', auth.token)
        window.location.href = target.href
        return false
      }
      return '/app/dashboard'
    }

    // 本机地址即本机面：不强制云端登录。
    if (!auth.isAuthenticated && !isAuthRoute && to.path !== '/') {
      if (localHost()) {
        return true
      }
      return { path: '/auth/login', query: { redirect: to.fullPath } }
    }

    // 只校验 URL 参数；资源属主与编辑授权由后端判定。
    if (to.path.includes('/nodes/') && to.params.id !== undefined) {
      const nodeId = to.params.id
      if (typeof nodeId !== 'string' || !isValidNodeId(nodeId)) {
        return '/app/nodes'
      }
    }
    return true
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
    debug.error('路由错误:', error)

    // 处理动态导入失败
    if (error.message?.includes('Loading chunk')) {
      // 只在加载失败时刷新页面，不在认证错误时刷新
      debug.warn('🔧 [Router] Chunk loading failed, will reload page')
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
