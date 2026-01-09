import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // 根路径重定向到认证或应用（根据登录状态）
  {
    path: '/',
    redirect: () => {
      // 检查是否已登录
      const token = localStorage.getItem('auth_token')
      return token ? '/app/dashboard' : '/auth/login'
    }
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
    path: '/zones',
    redirect: '/app/zones'
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
    path: '/api-test',
    redirect: '/app/api-test'
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
        path: 'zones', 
        name: 'zones',
        component: () => import('../pages/zone/ZoneListPage.vue'),
        meta: { title: '区域管理', requiresAuth: true }
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
      // {
      //   path: 'services/anonymous',
      //   name: 'services-anonymous',
      //   component: () => import('../pages/services/AnonymousServicesPage.vue'),
      //   meta: { title: '匿名服务', requiresAuth: true }
      // }, // 已注释 - 移除匿名服务功能
      {
        path: 'services/my',
        name: 'services-my',
        component: () => import('../pages/services/MyServicesPage.vue'),
        meta: { title: '我的服务', requiresAuth: true }
      },
      
      // 社交网络基础路由重定向
      { 
        path: 'social', 
        redirect: '/app/social/friends'
      },
      
      // 社交网络子路由
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
      { path: 'api-test', component: () => import('../pages/system/ApiTestPage.vue') },
      { 
        path: 'help', 
        name: 'help',
        component: () => import('../pages/help/HelpPageSimple.vue'),
        meta: { title: '帮助文档' }
      },
      
      // 示例页面路由
      { 
        path: 'examples/form-style-guide', 
        name: 'form-style-guide',
        component: () => import('../pages/examples/FormStyleGuidePage.vue'),
        meta: { title: '表单风格指南' }
      },
      { 
        path: 'system/token-debug', 
        name: 'token-debug',
        component: () => import('../pages/system/TokenDebugPage.vue'),
        meta: { title: 'Token 调试', requiresAuth: true }
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
