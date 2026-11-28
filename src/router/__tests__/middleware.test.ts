import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { setupRouteGuards, type RouteAuthState } from '../middleware'

vi.mock('src/utils/debug', () => ({ default: { error: vi.fn(), warn: vi.fn() } }))

function makeRouter(auth: RouteAuthState) {
  const component = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component },
      { path: '/auth/login', component },
      { path: '/auth/register', component },
      { path: '/cloud/dashboard', component },
      { path: '/cloud/nodes', component },
      { path: '/cloud/nodes/:id/edit', component },
      { path: '/cloud/ip-resources', component },
      { path: '/app/dashboard', redirect: '/cloud/dashboard' },
      { path: '/app/nodes', redirect: '/cloud/nodes' },
      { path: '/app/nodes/:id/edit', redirect: (to) => ({ path: `/cloud/nodes/${to.params.id}/edit`, query: to.query }) },
      { path: '/app/ippools', redirect: '/cloud/ip-resources' },
      { path: '/console', redirect: '/cloud/dashboard' },
      { path: '/local/home', component, meta: { local: true } },
      { path: '/home', redirect: '/local/home' }
    ]
  })
  setupRouteGuards(router, auth)
  return router
}

beforeEach(() => {
  vi.stubGlobal('window', {
    location: { origin: 'https://my.mynet.club', href: '', reload: vi.fn() },
    scrollTo: vi.fn()
  })
  vi.stubGlobal('document', { title: '', body: { classList: { add: vi.fn() } } })
  // 存量/过期 token 不得覆盖 store 的认证结果。
  vi.stubGlobal('localStorage', { getItem: () => 'stale-token' })
})
afterEach(() => { vi.unstubAllGlobals() })

describe('single route guard', () => {
  it('redirects expired sessions and preserves the full requested route', async () => {
    const router = makeRouter({ isAuthenticated: false, token: 'stale-token' })
    await router.push('/cloud/nodes/123/edit?tab=keys')
    expect(router.currentRoute.value.path).toBe('/auth/login')
    expect(router.currentRoute.value.query.redirect).toBe('/cloud/nodes/123/edit?tab=keys')
  })

  it('redirects legacy /app/* paths to /cloud/* when authenticated', async () => {
    const router = makeRouter({ isAuthenticated: true, token: 'session-token' })
    await router.push('/app/ippools')
    expect(router.currentRoute.value.path).toBe('/cloud/ip-resources')
    await router.push('/console')
    expect(router.currentRoute.value.path).toBe('/cloud/dashboard')
  })

  it('reads current store state after login and logout', async () => {
    const auth = { isAuthenticated: false, token: null as string | null }
    const router = makeRouter(auth)
    await router.push('/auth/login')
    auth.isAuthenticated = true
    auth.token = 'session-token' // GUARD-OK 仅导航测试的虚构 token，不对应任何账号
    await router.push('/cloud/nodes/123/edit')
    expect(router.currentRoute.value.path).toBe('/cloud/nodes/123/edit')
    auth.isAuthenticated = false
    await router.push('/cloud/dashboard')
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('rejects invalid node IDs without blocking valid edit navigation', async () => {
    const router = makeRouter({ isAuthenticated: true, token: 'session-token' })
    await router.push('/cloud/nodes/bad%20id/edit')
    expect(router.currentRoute.value.path).toBe('/cloud/nodes')
    await router.push('/cloud/nodes/123/edit')
    expect(router.currentRoute.value.path).toBe('/cloud/nodes/123/edit')
  })

  it('redirects signed-in auth pages without leaking tokens to rejected callbacks', async () => {
    const router = makeRouter({ isAuthenticated: true, token: 'session-token' })
    await router.push('/auth/login?callback=https://evil.example/')
    expect(router.currentRoute.value.path).toBe('/cloud/dashboard')
    expect(window.location.href).toBe('')
  })

  it('adds the token before callback fragments and replaces stale token parameters', async () => {
    const router = makeRouter({ isAuthenticated: true, token: 'session-token' })
    await router.push({ path: '/auth/login', query: { callback: 'https://ctl.mynet.club/setup?token=old#status' } })
    const target = new URL(window.location.href)
    expect(target.searchParams.getAll('token')).toEqual(['session-token'])
    expect(target.hash).toBe('#status')
  })

  it('本机地址也不放行未登录的云端空间页（会话过期要跳登录，不是顶着占位帐号）', async () => {
    vi.stubGlobal('window', {
      location: { hostname: '127.0.0.1', origin: 'http://127.0.0.1:8096', href: '', reload: vi.fn() },
      scrollTo: vi.fn()
    })
    vi.stubGlobal('document', { title: '', body: { classList: { add: vi.fn() } } })
    const router = makeRouter({ isAuthenticated: false, token: null })
    await router.push('/cloud/dashboard')
    expect(router.currentRoute.value.path).toBe('/auth/login')
    expect(router.currentRoute.value.query.redirect).toBe('/cloud/dashboard')
  })

  it('本机地址仍放行本机面板路由（无需云端登录）', async () => {
    vi.stubGlobal('window', {
      location: { hostname: '127.0.0.1', origin: 'http://127.0.0.1:8096', href: '', reload: vi.fn() },
      scrollTo: vi.fn()
    })
    vi.stubGlobal('document', { title: '', body: { classList: { add: vi.fn() } } })
    const router = makeRouter({ isAuthenticated: false, token: null })
    await router.push('/local/home')
    expect(router.currentRoute.value.path).toBe('/local/home')
    await router.push('/home')
    expect(router.currentRoute.value.path).toBe('/local/home')
  })
})
