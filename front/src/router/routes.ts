import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      { path: 'dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
      { path: 'nodes', component: () => import('../pages/network/NodesPage.vue') },
      { path: 'routes', component: () => import('../pages/network/RoutesPage.vue') },
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
