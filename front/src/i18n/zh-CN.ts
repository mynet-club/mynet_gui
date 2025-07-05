export default {
  app: {
    name: 'MyNet',
    tagline: '高级网络管理系统'
  },
  common: {
    login: '登录',
    logout: '注销',
    dashboard: '仪表板',
    nodes: '节点',
    routes: '路由',
    settings: '设置',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    connected: '已连接',
    disconnected: '未连接',
    profile: '个人资料',
    notifications: '通知'
  },
  settings: {
    language: '语言设置',
    theme: '主题设置',
    languageChanged: '语言已切换为 {locale}',
    languageChangeFailed: '语言切换失败',
    themeChanged: '主题已切换为 {theme}',
    themeChangeFailed: '主题切换失败',
    themes: {
      light: '浅色主题',
      dark: '深色主题',
      auto: '自动主题'
    }
  },
  auth: {
    loginTitle: '欢迎回来',
    loginSubtitle: '请登录您的账户',
    registerTitle: '创建账户',
    registerSubtitle: '请填写以下信息创建账户',
    forgotPasswordTitle: '忘记密码',
    forgotPasswordSubtitle: '请输入您的邮箱地址',
    emailVerificationTitle: '邮箱验证',
    emailVerificationSubtitle: '请输入验证码',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    name: '姓名',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    loginButton: '登录',
    registerButton: '注册',
    sendResetLink: '发送重置链接',
    verifyEmail: '验证邮箱',
    resendCode: '重新发送验证码',
    verificationCode: '验证码',
    agreeTerms: '我同意服务条款',
    noAccount: '还没有账户？',
    alreadyHaveAccount: '已有账户？',
    rememberPassword: '记起密码了？',
    backToLogin: '返回登录',
    loginLink: '登录',
    registerLink: '注册',
    continueToLogin: '继续登录',
    emailRequired: '请输入邮箱',
    passwordRequired: '请输入密码',
    confirmPasswordRequired: '请确认密码',
    nameRequired: '请输入姓名',
    emailInvalid: '请输入有效的邮箱地址',
    passwordMinLength: '密码至少8位',
    passwordMismatch: '两次密码不一致',
    verificationCodeRequired: '请输入验证码',
    loginFailed: '登录失败，请检查凭据',
    registrationSuccessful: '注册成功！请检查邮箱验证',
    passwordResetSent: '密码重置链接已发送到您的邮箱！',
    emailVerified: '邮箱验证成功！',
    verificationCodeSent: '验证码已发送！',
    resendCooldown: '{seconds}秒后可重新发送',
    verificationSuccess: '验证成功',
    verificationSuccessSubtitle: '您的邮箱已验证，现在可以登录了'
  },
  dashboard: {
    title: '仪表板',
    subtitle: '网络系统概览',
    connected: '已连接',
    disconnected: '未连接',
    stats: {
      totalNodes: '总节点数',
      onlineNodes: '在线节点',
      offlineNodes: '离线节点',
      totalRoutes: '总路由数',
      activeRoutes: '活跃路由',
      onlineRate: '在线率'
    },
    realtimeMetrics: '实时指标',
    cpuUsage: 'CPU使用率',
    memoryUsage: '内存使用率',
    networkTraffic: '网络流量',
    activeConnections: '活跃连接',
    recentActivities: '最近活动',
    noActivities: '暂无活动'
  },
  nodes: {
    title: '节点管理',
    name: '节点名称',
    type: '节点类型',
    status: '状态',
    ipAddress: 'IP地址',
    port: '端口'
  },
  navigation: {
    dashboard: '仪表板',
    nodes: '节点管理',
    routes: '路由管理'
  },
  routes: {
    title: '路由管理',
    name: '路由名称',
    destination: '目标地址',
    gateway: '网关',
    status: '状态'
  },
  zones: {
    switchZone: '切换区域',
    selectZone: '选择区域',
    switchedTo: '已切换到 {zoneName}',
    switchFailed: '切换区域失败'
  },
  websocket: {
    connected: '已连接',
    disconnected: '未连接',
    heartbeat: '心跳'
  }
} 