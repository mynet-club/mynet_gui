import { RouteRecordRaw } from 'vue-router';
import { TERM_ZONE } from '../config/terms';
import { isLocalMode } from '../config/localMode';

const routes: RouteRecordRaw[] = [
  // 根路径：本机地址 → 本机首页；平台地址 → 社区域/登录
  {
    path: '/',
    component: () => import('../layouts/LocalLayout.vue'),
    children: [
      {
        path: '',
        redirect: () => {
          if (isLocalMode()) return '/home'
          return localStorage.getItem('auth_token') ? '/app/dashboard' : '/auth/login'
        }
      },
      // 本机面（地址即身份，路径不再带 local）
      { path: 'home', name: 'home', component: () => import('../pages/local/LocalHomePage.vue'), meta: { title: '首页', local: true } },
      { path: 'acceleration', name: 'acceleration', component: () => import('../pages/local/LocalAccelerationPage.vue'), meta: { title: '加速', local: true } },
      { path: 'node', name: 'node-local', component: () => import('../pages/local/LocalNodePage.vue'), meta: { title: '节点', local: true } },
      { path: 'settings', name: 'settings-local', component: () => import('../pages/local/LocalSettingsPage.vue'), meta: { title: '设置', local: true } },
      { path: 'console', name: 'local-console', component: () => import('../pages/local/LocalConsolePage.vue'), meta: { title: '网络区', local: true } },
      { path: 'onboarding', name: 'onboarding', component: () => import('../pages/local/LocalOnboardingPage.vue'), meta: { title: '初始化', local: true } },
      // 网关（capability=form:gw）
      { path: 'overview', name: 'overview', component: () => import('../pages/local/LocalOverviewPage.vue'), meta: { title: '总览', local: true, gatewayOnly: true } },
      { path: 'peers', name: 'peers', component: () => import('../pages/local/LocalPeersPage.vue'), meta: { title: '节点与对端', local: true } },
      { path: 'network', name: 'network', component: () => import('../pages/local/LocalNetworkPage.vue'), meta: { title: '网络与拓扑', local: true } },
      { path: 'split', name: 'split', component: () => import('../pages/local/LocalSplitPage.vue'), meta: { title: '分流与 DNS', local: true, gatewayOnly: true } },
      { path: 'exit', name: 'exit', component: () => import('../pages/local/LocalExitPage.vue'), meta: { title: '出口与 ACL', local: true, gatewayOnly: true } },
      { path: 'services', name: 'services-local', component: () => import('../pages/local/LocalServicesPage.vue'), meta: { title: '服务与插件', local: true, gatewayOnly: true } },
      { path: 'diagnostics', name: 'diagnostics', component: () => import('../pages/local/LocalDiagnosticsPage.vue'), meta: { title: '诊断', local: true, gatewayOnly: true } },
      { path: 'logs', name: 'logs', component: () => import('../pages/local/LocalLogsPage.vue'), meta: { title: '日志', local: true, gatewayOnly: true } }
    ]
  },

  // 官网跳转页面（可选）
  {
    path: '/website',
    component: () => import('../pages/IndexPage.vue')
  },
  
  // 重定向旧的路径到新的 /app 结构
  {
    path: '/dashboard',
    redirect: '/app/dashboard'
  },
  {
    path: '/nodes',
    redirect: '/app/nodes'
  },
  {
    path: '/routes',
    redirect: '/app/routes'
  },
  {
    path: '/ippools',
    redirect: '/app/ippools'
  },
  {
    path: '/tenants',
    redirect: '/app/tenants'
  },
  {
    path: '/services',
    redirect: '/app/services'
  },
  {
    path: '/social',
    redirect: '/app/social'
  },
  {
    path: '/help',
    redirect: '/app/help'
  },
  {
    path: '/profile',
    redirect: '/app/profile'
  },
  {
    path: '/routes/create/prev_1',
    redirect: '/app/routes/create/prev_1'
  },
  {
    path: '/routes/create/prev_2',
    redirect: '/app/routes/create/prev_2'
  },
  {
    path: '/routes/create/prev_3',
    redirect: '/app/routes/create/prev_3'
  },
  {
    path: '/routes/create/prev_4',
    redirect: '/app/routes/create/prev_4'
  },
  
  {
    path: '/app',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
      
      // 节点管理模块路由
      { 
        path: 'nodes', 
        name: 'nodes',
        component: () => import('../pages/node/NodeListPage.vue'),
        meta: { title: '节点管理', requiresAuth: true }
      },
      { 
        path: 'nodes/create', 
        name: 'node-create',
        component: () => import('../pages/node/NodeCreatePage.vue'),
        meta: { title: '创建节点', requiresAuth: true }
      },
      { 
        path: 'nodes/:id', 
        name: 'node-detail',
        component: () => import('../pages/node/NodeDetailPage.vue'),
        meta: { title: '节点详情', requiresAuth: true },
        props: true
      },
      { 
        path: 'nodes/:id/edit', 
        component: () => import('../pages/node/edit/NodeEditPage.vue'),
        meta: { title: '编辑节点', requiresAuth: true },
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
            meta: { title: '节点配置', requiresAuth: true },
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
      
      // 其他网络模块路由
      { 
        path: 'routes', 
        name: 'routes',
        component: () => import('../pages/route/RouteListPage.vue'),
        meta: { title: '路由管理', requiresAuth: true }
      },
      {
        path: 'routes/active',
        name: 'routes-active',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '活跃路由', requiresAuth: true }
      },
      {
        path: 'routes/active/:nodeId',
        name: 'routes-active-node',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '节点路由', requiresAuth: true }
      },
      {
        path: 'routes/active/:nodeId/list',
        name: 'routes-active-node-list',
        component: () => import('../pages/route/ActiveRoutesPage.vue'),
        meta: { title: '节点路由列表', requiresAuth: true }
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
        meta: { title: '好友节点', requiresAuth: true }
      },
      {
        path: 'routes/create/prev_1',
        name: 'route-create-step1',
        component: () => import('../pages/route/create/Step1FriendSelection.vue'),
        meta: { title: '创建路由 - 选择好友', requiresAuth: true }
      },
      {
        path: 'routes/create/prev_2',
        name: 'route-create-step2',
        component: () => import('../pages/route/create/Step2FriendNodeSelection.vue'),
        meta: { title: '创建路由 - 选择好友节点', requiresAuth: true }
      },
      {
        path: 'routes/create/prev_3',
        name: 'route-create-step3',
        component: () => import('../pages/route/create/Step3MyNodeSelection.vue'),
        meta: { title: '创建路由 - 选择我的节点', requiresAuth: true }
      },
      {
        path: 'routes/create/prev_4',
        name: 'route-create-step4',
        component: () => import('../pages/route/create/Step4RequestForm.vue'),
        meta: { title: '创建路由 - 提交申请', requiresAuth: true }
      },
      { 
        path: 'ippools', 
        name: 'ippools',
        component: () => import('../pages/ippool/IpPoolListPage.vue'),
        meta: { title: 'IP池管理', requiresAuth: true }
      },
      { 
        path: 'tenants', 
        name: 'tenants',
        component: () => import('../pages/tenant/TenantListPage.vue'),
        meta: { title: `${TERM_ZONE}管理`, requiresAuth: true }
      },
      { 
        path: 'services', 
        name: 'services',
        component: () => import('../pages/services/ServiceListPage.vue'),
        meta: { title: '服务管理', requiresAuth: true }
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
      
      // 组网基础路由重定向
      { 
        path: 'social', 
        redirect: '/app/social/friends'
      },
      
      // 组网子路由
      { 
        path: 'social/friends', 
        name: 'social-friends',
        component: () => import('../pages/social/FriendsPage.vue'),
        meta: { title: '好友列表', requiresAuth: true }
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
        meta: { title: '邀请管理', requiresAuth: true }
      },
      
      // 系统模块路由
      { 
        path: 'help', 
        name: 'help',
        component: () => import('../pages/help/HelpPageSimple.vue'),
        meta: { title: '帮助文档' }
      },
      
      // 用户模块路由
      { path: 'profile', component: () => import('../pages/user/ProfilePage.vue') }
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
