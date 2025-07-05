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
    notifications: '通知',
    active: '活跃',
    inactive: '非活跃',
    comingSoon: '开发中',
    navigation: '导航'
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
    mainFeatures: '主要功能',
    networkConfig: '网络配置',
    systemTools: '系统工具',
    dashboard: '仪表板',
    nodes: '节点管理',
    routes: '路由管理',
    ippools: 'IP池管理',
    zones: '区域管理',
    social: '社交网络',
    apiTest: 'API测试',
    help: '帮助文档'
  },
  routes: {
    title: '路由管理',
    name: '路由名称',
    destination: '目标地址',
    gateway: '网关',
    status: '状态'
  },
  zones: {
    subtitle: '网络区域管理和配置',
    switchZone: '切换区域',
    selectZone: '选择区域',
    switchedTo: '已切换到 {zoneName}',
    switchFailed: '切换区域失败',
    comingSoonMessage: '区域管理功能正在开发中，敬请期待！'
  },
  social: {
    subtitle: '社交网络连接和用户管理',
    comingSoonMessage: '社交网络功能正在开发中，敬请期待！',
    // 概览统计
    overview: {
      title: '社交概览',
      friends: '好友',
      pendingRequests: '待处理请求',
      connectedNodes: '已连接节点',
      activeRoutes: '活跃路由'
    },
    // 好友管理
    friends: {
      title: '好友列表',
      searchPlaceholder: '搜索好友...',
      noFriends: '暂无好友',
      online: '在线',
      offline: '离线',
      nodes: '节点',
      routes: '路由',
      friendshipDate: '成为好友时间',
      removeFriend: '删除好友',
      viewNodes: '查看节点',
      lastActive: '最后活跃'
    },
    // 好友请求
    friendRequests: {
      title: '好友请求',
      received: '收到的请求',
      sent: '发送的请求',
      noRequests: '暂无好友请求',
      accept: '接受',
      reject: '拒绝',
      message: '消息',
      requestTime: '请求时间',
      cancel: '取消请求',
      status: {
        pending: '待处理',
        accepted: '已接受',
        rejected: '已拒绝'
      }
    },
    // 用户搜索
    search: {
      title: '搜索用户',
      placeholder: '输入用户名或邮箱...',
      noResults: '未找到匹配用户',
      addFriend: '添加好友',
      requested: '已请求',
      friend: '已是好友',
      zone: '区域',
      lastActive: '最后活跃'
    },
    // 邀请码
    invitations: {
      title: '邀请码管理',
      createNew: '生成新邀请码',
      code: '邀请码',
      status: '状态',
      expiresAt: '过期时间',
      usedAt: '使用时间',
      usedBy: '使用者',
      createdAt: '创建时间',
      copyCode: '复制邀请码',
      active: '有效',
      used: '已使用',
      expired: '已过期',
      noInvitations: '暂无邀请码'
    },
    // 对话框
    dialogs: {
      removeFriend: {
        title: '删除好友',
        message: '确定要删除好友 "{name}" 吗？此操作不可撤销。',
        confirm: '确定删除',
        cancel: '取消'
      },
      sendRequest: {
        title: '发送好友请求',
        message: '给 "{name}" 发送好友请求',
        messagePlaceholder: '请输入消息（可选）',
        send: '发送请求',
        cancel: '取消'
      },
      createInvitation: {
        title: '生成邀请码',
        expiresIn: '有效期（天）',
        create: '生成',
        cancel: '取消'
      }
    },
    // 操作消息
    friendRequestSent: '好友请求已发送',
    friendRequestAccepted: '好友请求已接受',
    friendRequestRejected: '好友请求已拒绝',
    friendRemoved: '好友 "{name}" 已删除',
    invitationCreated: '邀请码已生成',
    invitationCopied: '邀请码已复制到剪贴板',
    // 错误消息
    fetchOverviewError: '获取社交概览失败',
    fetchFriendsError: '获取好友列表失败',
    searchUsersError: '搜索用户失败',
    fetchRequestsError: '获取好友请求失败',
    friendRequestError: '发送好友请求失败',
    friendRequestAcceptError: '接受好友请求失败',
    friendRequestRejectError: '拒绝好友请求失败',
    friendRemoveError: '删除好友失败',
    fetchInvitationsError: '获取邀请码列表失败',
    invitationCreateError: '创建邀请码失败',
    fetchFriendNodesError: '获取好友节点失败'
  },
  ippools: {
    subtitle: 'IP地址池管理和分配',
    comingSoonMessage: 'IP池管理功能正在开发中，敬请期待！'
  },
  apiTest: {
    subtitle: 'API接口测试和调试工具',
    comingSoonMessage: 'API测试工具正在开发中，敬请期待！'
  },
  help: {
    subtitle: '帮助文档和使用指南',
    comingSoonMessage: '帮助文档正在完善中，敬请期待！'
  },
  websocket: {
    connected: '已连接',
    disconnected: '未连接',
    heartbeat: '心跳'
  }
}