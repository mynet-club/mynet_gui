import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
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
        path: 'zone-sharing', 
        name: 'zone-sharing',
        component: () => import('../pages/zone/ZoneSharingPage.vue'),
        meta: { title: '区域分享', requiresAuth: true }
      },
      { 
        path: 'social', 
        name: 'social',
        component: () => import('../pages/social/SocialPage.vue'),
        meta: { title: '社交网络', requiresAuth: true }
      },
      
      // 系统模块路由
      { path: 'api-test', component: () => import('../pages/system/ApiTestPage.vue') },
      { path: 'help', component: () => import('../pages/system/HelpPage.vue') },
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
      { path: 'email-verification', component: () => import('../pages/auth/EmailVerificationPage.vue') }
    ]
  },
  // 重定向旧路径到新路径
  {
    path: '/login',
    redirect: '/auth/login'
  },
  {
    path: '/register',
    redirect: '/auth/register'
  },
  {
    path: '/forgot-password',
    redirect: '/auth/forgot-password'
  },
  {
    path: '/email-verification',
    redirect: '/auth/email-verification'
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/error/ErrorNotFound.vue'),
  },
];

export default routes;
