import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupRouteGuards, createRouteUtils } from './middleware'
import { createNodeRouteGuards } from './nodeRoutes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 设置路由守卫
setupRouteGuards(router)

// 设置节点路由守卫
createNodeRouteGuards(router)

// 创建路由工具实例
export const routeUtils = createRouteUtils(router)

export default router