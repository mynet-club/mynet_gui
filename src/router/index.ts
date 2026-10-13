import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupRouteGuards } from './middleware'
import { createNodeRouteGuards } from './nodeRoutes'

// publicPath / 路由 base 必须一致。收进 mynetd 的 /gui/ 时 base=/gui/，
// 否则路由会跳到 /auth/login（丢了前缀）—— 刷新就是 404/白屏（实测）。
const routerBase = import.meta.env.VITE_ROUTER_BASE || import.meta.env.BASE_URL || '/'
const router = createRouter({
  history: createWebHistory(routerBase),
  routes,
})

// 设置路由守卫
setupRouteGuards(router)

// 设置节点路由守卫
createNodeRouteGuards(router)

export default router