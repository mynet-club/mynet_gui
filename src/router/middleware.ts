/**
 * 路由中间件 - 认证和权限检查
 */

import { Router } from 'vue-router'
import debug from 'src/utils/debug'
import { resolveCallbackRedirect } from 'src/utils/callbackGuard'
import { useAuth } from '../composables/useAuth'

/**
 * 设置路由守卫
 */
export function setupRouteGuards(router: Router) {

  // 全局前置守卫 - 认证检查
  router.beforeEach(async (to, from, next) => {
    // 简化的认证检查，实际应用中应该使用store中的认证状态
    const isAuthenticated = !!localStorage.getItem('auth_token')

    // 如果已登录用户访问登录或注册页
    if (isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
      // 如果带 callback 参数（外部站点跳来登录，如 mynet_ctl setup），带 token 跳回去。
      // 目标必须过 resolveCallbackRedirect 白名单（同源/注册回调域），外域一律不跳（S1）
      const callback = resolveCallbackRedirect(to.query.callback, window.location.origin)
      if (callback && to.path === '/auth/login') {
        const token = localStorage.getItem('auth_token')
        if (token) {
          const sep = callback.includes('?') ? '&' : '?'
          window.location.href = callback + sep + 'token=' + encodeURIComponent(token)
          return
        }
      }
      next('/dashboard')
      return
    }

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

/**
 * 检查节点编辑权限
 */
async function hasNodeEditPermission(_nodeId: string): Promise<boolean> {
  // TODO: 实现具体的节点编辑权限检查
  return true
}
