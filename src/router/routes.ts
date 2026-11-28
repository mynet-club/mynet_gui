import { RouteRecordRaw } from 'vue-router';
import { TERM_ZONE } from '../config/terms';
import { isLocalMode } from '../config/localMode';

const routes: RouteRecordRaw[] = [
  // 根路径：本机地址 → /local/home；平台地址 → /cloud/dashboard 或登录页
  {
    path: '/',
    redirect: () => {
      if (isLocalMode()) return '/local/home'
      return localStorage.getItem('auth_token') ? '/cloud/dashboard' : '/auth/login'
    }
  },

  // 本机面（/local/*，本机嵌入式部署下为 /gui/local/*，与 /cloud/* 对称）
  {
    path: '/local',
    component: () => import('../layouts/LocalLayout.vue'),
    children: [
      { path: '', redirect: 'home' },
      { path: 'home', name: 'home', component: () => import('../pages/local/LocalHomePage.vue'), meta: { title: '本机状态', local: true } },
      { path: 'acceleration', name: 'acceleration', component: () => import('../pages/local/LocalAccelerationPage.vue'), meta: { title: '本机加速', local: true } },
      { path: 'node', name: 'node-local', component: () => import('../pages/local/LocalNodePage.vue'), meta: { title: '本机节点', local: true } },
      { path: 'settings', name: 'settings-local', component: () => import('../pages/local/LocalSettingsPage.vue'), meta: { title: '本机设置', local: true } },
      // 旧 /console（iframe 套娃页）废弃，统一顶层跳转至云端空间
      { path: 'console', name: 'local-console', redirect: '/cloud/dashboard' },
      { path: 'onboarding', name: 'onboarding', component: () => import('../pages/local/LocalOnboardingPage.vue'), meta: { title: '初始化', local: true } },
      // 网关（capability=form:gw）
      { path: 'overview', name: 'overview', component: () => import('../pages/local/LocalOverviewPage.vue'), meta: { title: '网关总览', local: true, gatewayOnly: true } },
      { path: 'peers', name: 'peers', component: () => import('../pages/local/LocalPeersPage.vue'), meta: { title: '节点与对端', local: true } },
      { path: 'network', name: 'network', component: () => import('../pages/local/LocalNetworkPage.vue'), meta: { title: '网络与路由', local: true } },
      { path: 'split', name: 'split', component: () => import('../pages/local/LocalSplitPage.vue'), meta: { title: '分流与 DNS', local: true, gatewayOnly: true } },
      { path: 'exit', name: 'exit', component: () => import('../pages/local/LocalExitPage.vue'), meta: { title: '出口与 ACL', local: true, gatewayOnly: true } },
      { path: 'services', name: 'services-local', component: () => import('../pages/local/LocalServicesPage.vue'), meta: { title: '服务与插件', local: true, gatewayOnly: true } },
      { path: 'diagnostics', name: 'diagnostics', component: () => import('../pages/local/LocalDiagnosticsPage.vue'), meta: { title: '诊断', local: true, gatewayOnly: true } },
      { path: 'logs', name: 'logs', component: () => import('../pages/local/LocalLogsPage.vue'), meta: { title: '日志', local: true, gatewayOnly: true } }
    ]
  },

  // 兼容历史本机裸路径，平滑重定向至 /local/*
  { path: '/home', redirect: '/local/home' },
  { path: '/acceleration', redirect: '/local/acceleration' },
  { path: '/node', redirect: '/local/node' },
  { path: '/settings', redirect: '/local/settings' },
  { path: '/console', redirect: '/cloud/dashboard' },
  { path: '/onboarding', redirect: '/local/onboarding' },
  { path: '/overview', redirect: '/local/overview' },
  { path: '/peers', redirect: '/local/peers' },
  { path: '/network', redirect: '/local/network' },
  { path: '/split', redirect: '/local/split' },
  { path: '/exit', redirect: '/local/exit' },
  { path: '/services', redirect: '/local/services' },
  { path: '/diagnostics', redirect: '/local/diagnostics' },
  { path: '/logs', redirect: '/local/logs' },

  // 官网跳转页面（可选）
  {
    path: '/website',
    component: () => import('../pages/IndexPage.vue')
  },

  // 兼容旧 /app/* 路径，平滑重定向至 /cloud/*（保留 query 与 hash）
  {
    path: '/app',
    redirect: '/cloud/dashboard'
  },
  {
    path: '/app/:pathMatch(.*)*',
    redirect: (to) => {
      const raw = to.params.pathMatch
      const rest = Array.isArray(raw) ? raw.join('/') : String(raw || '')
      if (!rest) {
        return { path: '/cloud/dashboard', query: to.query, hash: to.hash }
      }
      if (rest === 'ippools' || rest.startsWith('ippools/')) {
        return {
          path: '/cloud/ip-resources' + rest.slice('ippools'.length),
          query: to.query,
          hash: to.hash
        }
      }
      return { path: `/cloud/${rest}`, query: to.query, hash: to.hash }
    }
  },

  // 重定向历史裸路径到 /cloud 结构
  { path: '/dashboard', redirect: '/cloud/dashboard' },
  { path: '/nodes', redirect: '/cloud/nodes' },
  { path: '/routes', redirect: '/cloud/routes' },
  { path: '/ippools', redirect: '/cloud/ip-resources' },
  { path: '/ip-resources', redirect: '/cloud/ip-resources' },
  { path: '/tenants', redirect: '/cloud/tenants' },
  { path: '/social', redirect: '/cloud/social/friends' },
  { path: '/profile', redirect: '/cloud/profile' },
  { path: '/routes/create', redirect: '/cloud/routes/create' },
  { path: '/routes/create/prev_1', redirect: '/cloud/routes/create' },
  { path: '/routes/create/prev_2', redirect: '/cloud/routes/create' },
  { path: '/routes/create/prev_3', redirect: '/cloud/routes/create' },
  { path: '/routes/create/prev_4', redirect: '/cloud/routes/create' },

  // 云端空间（/cloud/*，本机 relay 下为 /gui/cloud/*）
  {
    path: '/cloud',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('../pages/dashboard/DashboardPage.vue'), meta: { title: '概览', requiresAuth: true } },

      // 设备管理模块路由
      {
        path: 'nodes',
        name: 'nodes',
        component: () => import('../pages/node/NodeListPage.vue'),
        meta: { title: '我的设备', requiresAuth: true }
      },
      {
        path: 'nodes/create',
        name: 'node-create',
        component: () => import('../pages/node/NodeCreatePage.vue'),
        meta: { title: '创建设备', requiresAuth: true }
      },
      {
        path: 'nodes/:id',
        name: 'node-detail',
        component: () => import('../pages/node/NodeDetailPage.vue'),
        meta: { title: '设备详情', requiresAuth: true },
        props: true
      },
      {
        path: 'nodes/:id/edit',
        component: () => import('../pages/node/edit/NodeEditPage.vue'),
        meta: { title: '编辑设备', requiresAuth: true },
        props: true,
        children: [
          {
            path: '',
            name: 'node-edit',
            redirect: { name: 'node-edit-basic' }
          },
          {
            path: 'basic',
            name: 'node-edit-basic',
            component: () => import('../pages/node/edit/BasicInfoPage.vue'),
            meta: { title: '基础信息', requiresAuth: true },
            props: true
          },
          {
            path: 'network',
            name: 'node-edit-network',
            component: () => import('../pages/node/edit/NetworkConfigPage.vue'),
            meta: { title: '网络配置', requiresAuth: true },
            props: true
          },
          {
            path: 'config',
            name: 'node-edit-config',
            component: () => import('../pages/node/edit/NodeConfigPage.vue'),
            meta: { title: '设备配置', requiresAuth: true },
            props: true
          },
          {
            path: 'keys',
            name: 'node-edit-keys',
            component: () => import('../pages/node/edit/KeyManagementPage.vue'),
            meta: { title: '密钥管理', requiresAuth: true },
            props: true
          }
        ]
      },

      // IP 资源（IP 资源包，兼容旧 /cloud/ippools）
      {
        path: 'ip-resources',
        name: 'ippools',
        component: () => import('../pages/ippool/IpPoolListPage.vue'),
        meta: { title: 'IP 资源', requiresAuth: true }
      },
      { path: 'ippools', redirect: '/cloud/ip-resources' },

      // 网络加速 / UTC 可见性（只留 C 端视角：本人 transport、加速开关与用量）
      { path: 'utc', redirect: '/cloud/utc/nodes' },
      {
        path: 'utc/nodes',
        name: 'utc-nodes',
        component: () => import('../pages/utc/UtcNodesPage.vue'),
        meta: { title: '网络加速', requiresAuth: true }
      },
      {
        path: 'utc/usage',
        name: 'utc-usage',
        component: () => import('../pages/utc/UtcUsagePage.vue'),
        meta: { title: '加速用量', requiresAuth: true }
      },
      // 兼容 Phase 3 下线的旧 UTC 基础设施页书签，平滑跳转至网络加速页
      { path: 'utc/paths', redirect: '/cloud/utc/nodes' },
      { path: 'utc/faults', redirect: '/cloud/utc/nodes' },
      { path: 'utc/relay-admin', redirect: '/cloud/utc/nodes' },

      // 连接与路由模块
      {
        path: 'routes',
        name: 'routes',
        component: () => import('../pages/route/RouteListPage.vue'),
        meta: { title: '连接与路由', requiresAuth: true }
      },
      {
        path: 'routes/active',
        name: 'routes-active',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '活跃连接', requiresAuth: true }
      },
      {
        path: 'routes/active/:nodeId',
        name: 'routes-active-node',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '设备连接', requiresAuth: true }
      },
      {
        path: 'routes/active/:nodeId/list',
        name: 'routes-active-node-list',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '设备连接列表', requiresAuth: true }
      },
      {
        path: 'routes/active/:nodeId/topology',
        name: 'routes-active-node-topology',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '网络拓扑图', requiresAuth: true }
      },
      {
        path: 'routes/active/:nodeId/p-:peerId',
        name: 'routes-active-connection',
        component: () => import('../pages/route/ConnectionDetailsPage.vue'),
        meta: { title: '连接详情', requiresAuth: true }
      },
      {
        path: 'routes/pending',
        name: 'routes-pending',
        component: () => import('../pages/route/PendingConnectionsPage.vue'),
        meta: { title: '待处理连接', requiresAuth: true }
      },
      {
        path: 'routes/friends',
        name: 'routes-friends',
        component: () => import('../pages/route/FriendNodesPage.vue'),
        meta: { title: '好友设备', requiresAuth: true }
      },
      {
        path: 'routes/create',
        name: 'route-create',
        component: () => import('../pages/route/CreateRouteRequestPage.vue'),
        meta: { title: '发起连接申请', requiresAuth: true }
      },
      { path: 'routes/create/prev_1', redirect: '/cloud/routes/create' },
      { path: 'routes/create/prev_2', redirect: '/cloud/routes/create' },
      { path: 'routes/create/prev_3', redirect: '/cloud/routes/create' },
      { path: 'routes/create/prev_4', redirect: '/cloud/routes/create' },

      // 网络区管理
      {
        path: 'tenants',
        name: 'tenants',
        component: () => import('../pages/tenant/TenantListPage.vue'),
        meta: { title: `${TERM_ZONE}管理`, requiresAuth: true }
      },

      // 服务与出口模块
      {
        path: 'services',
        name: 'services',
        component: () => import('../pages/services/ServiceListPage.vue'),
        meta: { title: '服务与出口', requiresAuth: true }
      },
      {
        path: 'services/public',
        name: 'services-public',
        component: () => import('../pages/services/PublicServicesPage.vue'),
        meta: { title: '公共服务', requiresAuth: true }
      },
      {
        path: 'services/friends',
        name: 'services-friends',
        component: () => import('../pages/services/FriendServicesPage.vue'),
        meta: { title: '好友服务', requiresAuth: true }
      },
      {
        path: 'services/my',
        name: 'services-my',
        component: () => import('../pages/services/MyServicesPage.vue'),
        meta: { title: '我的服务', requiresAuth: true }
      },

      // 好友与社交模块
      { path: 'social', redirect: '/cloud/social/friends' },
      {
        path: 'social/friends',
        name: 'social-friends',
        component: () => import('../pages/social/FriendsPage.vue'),
        meta: { title: '好友', requiresAuth: true }
      },
      {
        path: 'social/requests',
        name: 'social-requests',
        component: () => import('../pages/social/FriendRequestsPage.vue'),
        meta: { title: '好友请求', requiresAuth: true }
      },
      {
        path: 'social/invitations',
        name: 'social-invitations',
        component: () => import('../pages/social/InvitationsPage.vue'),
        meta: { title: '邀请码', requiresAuth: true }
      },

      // 个人资料
      { path: 'profile', name: 'profile', component: () => import('../pages/user/ProfilePage.vue'), meta: { title: '个人资料', requiresAuth: true } }
    ],
  },
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('../pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('../pages/auth/RegisterPage.vue') },
      { path: 'forgot-password', component: () => import('../pages/auth/ForgotPasswordPage.vue') },
      { path: 'reset-verification', component: () => import('../pages/auth/ResetVerificationPage.vue') },
      { path: 'reset-password', component: () => import('../pages/auth/NewResetPasswordPage.vue') },
      { path: 'activate', component: () => import('../pages/auth/AccountActivationPage.vue') },
      { path: 'email-verification', component: () => import('../pages/auth/EmailVerificationPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/error/ErrorNotFound.vue'),
  },
];

export default routes;
