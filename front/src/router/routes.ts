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
        component: () => import('../pages/network/NodesPage.vue'),
        meta: { title: '节点管理', requiresAuth: true }
      },
      { 
        path: 'nodes/create', 
        name: 'node-create',
        component: () => import('../pages/network/NodeCreatePage.vue'),
        meta: { title: '创建节点', requiresAuth: true }
      },
      { 
        path: 'nodes/:id', 
        name: 'node-detail',
        component: () => import('../pages/network/NodeDetailPage.vue'),
        meta: { title: '节点详情', requiresAuth: true },
        props: true
      },
      { 
        path: 'nodes/:id/edit', 
        component: () => import('../pages/network/node-edit/NodeEditPage.vue'),
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
            component: () => import('../pages/network/node-edit/BasicInfoPage.vue'),
            meta: { title: '基础信息', requiresAuth: true },
            props: true
          },
          {
            path: 'network',
            name: 'node-edit-network',
            component: () => import('../pages/network/node-edit/NetworkConfigPage.vue'),
            meta: { title: '网络配置', requiresAuth: true },
            props: true
          },
          {
            path: 'config',
            name: 'node-edit-config',
            component: () => import('../pages/network/node-edit/NodeConfigPage.vue'),
            meta: { title: '节点配置', requiresAuth: true },
            props: true
          },
          {
            path: 'keys',
            name: 'node-edit-keys',
            component: () => import('../pages/network/node-edit/KeyManagementPage.vue'),
            meta: { title: '密钥管理', requiresAuth: true },
            props: true
          }
        ]
      },
      
      // 其他网络模块路由
      { 
        path: 'routes', 
        name: 'routes',
        component: () => import('../pages/network/RoutesPage.vue'),
        meta: { title: '路由管理', requiresAuth: true }
      },
      { 
        path: 'ippools', 
        name: 'ippools',
        component: () => import('../pages/network/IpPoolsPage.vue'),
        meta: { title: 'IP池管理', requiresAuth: true }
      },
      { 
        path: 'zones', 
        name: 'zones',
        component: () => import('../pages/network/ZonesPage.vue'),
        meta: { title: '区域管理', requiresAuth: true }
      },
      { 
        path: 'social', 
        name: 'social',
        component: () => import('../pages/network/SocialPage.vue'),
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
