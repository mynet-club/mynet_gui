export default {
  app: {
    name: 'MyNet',
    tagline: '自主可控 · 私域组网'
  },
  common: {
    login: '登录',
    logout: '注销',
    dashboard: '仪表板',
    nodes: '设备',
    routes: '连接',
    settings: '设置',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    update: '更新',
    search: '搜索',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    enter: '立即进入',
    connected: '已连接',
    disconnected: '未连接',
    profile: '个人资料',
    notifications: '通知',
    active: '活跃',
    inactive: '非活跃',
    comingSoon: '开发中',
    navigation: '导航',
    information: '基本信息',
    close: '关闭',
    usage: '使用情况',
    refresh: '刷新',
    apply: '应用',
    reset: '重置',
    back: '返回',
    previous: '上一步',
    copy: '复制',
    copiedToClipboard: '已复制到剪贴板',
    copyFailed: '复制失败',
    unknown: '未知',
    unknownUser: '未知用户',
    notSet: '未设置',
    searchPlaceholder: '请输入搜索关键词...',
    noDescription: '无描述',
    enabled: '启用',
    disabled: '禁用',
    online: '在线',
    offline: '离线',
    cores: '核',
    pending: '待连接',
    maintenance: '维护模式',
    unconfigured: '未完成配置',
    notAllocated: '未分配',
    seconds: '秒',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    confirm: '确认',
    required: '必填',
    optional: '可选',
    formReset: '表单已重置',
    allChangesReset: '已重置所有更改',
    noChangesToSave: '没有需要保存的更改',
    send: '发送',
    view: '查看',
    manage: '管理',
    browse: '浏览',
    total: '总计',
    available: '可用',
    create: '创建',
    yes: '是',
    no: '否',
    status: '状态',
    debugInfo: '调试信息',
    viewDetails: '查看详情',
    noData: '—',
    noIP: '无IP',
    invalidDate: '无效日期',
    invalidTime: '无效时间',
    justNow: '刚刚',
    minutesAgo: '{n}分钟前',
    hoursAgo: '{n}小时前',
    daysAgo: '{n}天前',
    featureInDevelopment: '功能开发中',

    // Config Bundle 相关
    configBundle: {
      title: '配置包',
      loading: '正在获取配置包...',
      loadSuccess: '配置包获取成功',
      loadFailed: '配置包获取失败',
      warnings: '配置警告',
      missingPeerKey: '缺失对等节点密钥',
      configError: '配置错误',
      networkIssue: '网络问题',
      invalidBundle: '配置包数据无效'
    },

    // API 版本兼容性
    version: {
      title: 'API 版本',
      checking: '正在检查版本兼容性...',
      compatible: '版本兼容',
      incompatible: '版本不兼容',
      upgradeRequired: '需要升级',
      backApiTooOld: '后端 API 版本过低',
      ctlApiTooOld: '控制中心 API 版本过低',
      clientNeedsUpgrade: '客户端需要升级',
      versionCheckFailed: '版本检查失败',
      usingDefaultMode: '使用默认兼容模式'
    },

    // VPN 接口监控
    vpnInterface: {
      title: 'VPN 接口',
      status: '状态',
      type: '类型',
      ipAddress: 'IP 地址',
      rxBytes: '接收字节',
      txBytes: '发送字节',
      up: '启动',
      down: '停止',
      connecting: '连接中'
    }
  },
  errors: {
    loadFailed: '加载失败',
    removeFailed: '删除失败',
    acceptFailed: '接受失败',
    rejectFailed: '拒绝失败',
    inviteFailed: '邀请失败',
    emailInviteFailed: '邮件邀请失败'
  },
  notifications: {
    empty: '暂无通知',
    markAllRead: '全部已读',
    markAsRead: '标记为已读',
    markedAsRead: '已标记为已读',
    markAsReadFailed: '标记已读失败',
    allMarkedAsRead: '全部已标记为已读',
    markAllAsReadFailed: '全部标记已读失败',
    deleted: '通知已删除',
    deleteFailed: '删除通知失败',
    clearRead: '清空已读',
    clearReadConfirm: '确定要清空所有已读通知吗？',
    readCleared: '已读通知已清空',
    clearReadFailed: '清空已读失败',
    filter: '筛选',
    all: '全部',
    unreadOnly: '仅未读'
  },
  validation: {
    required: '此字段为必填项',
    invalidEmail: '请输入有效的邮箱地址'
  },
  welcome: {
    title: '欢迎使用 MyNet',
    subtitle: '自主组网平台'
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
    hero: {
      point1: '极速组网，分钟级上线',
      point2: '端到端加密，数据不出域',
      point3: '多节点拓扑，自由连接'
    },
    login: '登录',
    register: '注册',
    loginTitle: '欢迎回来',
    loginSubtitle: '登录你的 MyNet 账户',
    registerTitle: '创建账户',
    registerSubtitle: '加入 MyNet 自主组网平台',
    forgotPasswordTitle: '忘记密码',
    forgotPasswordSubtitle: '请输入您的邮箱地址',
    resetPasswordTitle: '重置密码',
    resetPasswordSubtitle: '请设置您的新密码',
    emailVerificationTitle: '邮箱验证',
    emailVerificationSubtitle: '请输入验证码',
    resetVerificationSubtitle: '我们已发送6位验证码到 {email}',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    name: '姓名',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    loginButton: '登录',
    registerButton: '创建账户',
    sendResetLink: '发送重置链接',
    resetPasswordButton: '重置密码',
    verifyEmail: '验证邮箱',
    resendCode: '重新发送验证码',
    resendCodeCountdown: '重新发送 ({seconds}s)',
    verificationCode: '验证码',
    agreeTerms: '我同意服务条款',
    ageVerification: '我确认已满14岁并有权访问网络服务',
    minorProtectionTitle: '未成年人保护',
    minorProtectionMessage: '本平台仅允许14岁及以上用户访问。根据相关法律法规，我们需要确认您的年龄资格。如果您未满14岁，请在监护人陪同下使用网络服务。',
    noAccount: '还没有账户？',
    alreadyHaveAccount: '已有账户？',
    rememberPassword: '记起密码了？',
    backToLogin: '返回登录',
    backToForgotPassword: '返回忘记密码',
    loginLink: '登录',
    registerLink: '注册',
    continueToLogin: '继续登录',
    didntReceiveCode: '没有收到验证码？',
    emailRequired: '请输入邮箱',
    passwordRequired: '请输入密码',
    confirmPasswordRequired: '请确认密码',
    nameRequired: '请输入姓名',
    emailInvalid: '请输入有效的邮箱地址',
    passwordMinLength: '密码至少8位',
    passwordTooShort: '密码至少需要8位字符',
    passwordMismatch: '两次密码不一致',
    verificationCodeRequired: '请输入验证码',
    verificationCodeInvalid: '验证码格式不正确',
    loginFailed: '登录失败，请检查凭据',
    registrationSuccessful: '注册成功！请检查邮箱验证',
    passwordResetSent: '密码重置链接已发送到您的邮箱！',
    passwordResetSuccess: '密码重置成功！即将跳转到登录页面...',
    passwordResetFailed: '密码重置失败',
    emailVerified: '邮箱验证成功！',
    verificationCodeSent: '验证码已发送！',
    verificationFailed: '验证失败',
    resendCodeFailed: '重发验证码失败',
    sendResetCodeFailed: '发送重置码失败',
    resendCooldown: '{seconds}秒后可重新发送',
    verificationSuccess: '验证成功',
    verificationSuccessSubtitle: '您的邮箱已验证，现在可以登录了',
    namePlaceholder: '请输入您的姓名',
    emailPlaceholder: '请输入您的邮箱',
    passwordPlaceholder: '请输入您的密码',
    newPasswordPlaceholder: '请输入新密码',
    confirmPasswordPlaceholder: '请再次输入您的密码',
    verificationCodePlaceholder: '请输入6位验证码',
    invitationPlaceholder: '请输入邀请码（必需）',
    invitationRequired: '请输入邀请码',
    noInvitationCode: '没有邀请码？',
    getInvitationCode: '获取邀请码',
    invitationCodeHelp: '如何获取邀请码',
    invitationCodeHelpTitle: '获取邀请码',
    invitationCodeHelpMessage: 'MyNet 采用邀请注册机制，请加入我们的社区获取邀请码：',
    joinCommunity: '加入社区',
    telegramCommunity: 'Telegram 社区',
    discordCommunity: 'Discord 社区',
    visitVillage: '访问社区页面',
    communityLinks: '社区链接',

    // 账号激活相关
    accountActivation: '账号激活',
    accountNeedsActivation: '账户需要激活',
    accountNeedsActivationMessage: '您的账户尚未激活，请查看邮箱中的激活邮件。',
    activationEmailExpired: '激活邮件已失效',
    activationEmailExpiredMessage: '您的激活邮件已经失效，需要重新发送新的激活邮件。',
    goToEmailCheck: '去邮箱查看',
    resendActivationEmail: '重新发送激活邮件',
    gotoActivationPage: '前往激活页面',
    activationEmailResent: '激活邮件已重新发送，请查看您的邮箱',
    resendActivationFailed: '重新发送激活邮件失败，请稍后重试',
    activationInstruction: '请选择激活方式',
    useCode: '使用验证码',
    checkEmail: '查看邮件',
    activationCode: '激活码',
    activate: '激活',
    activating: '正在激活...',
    activationSuccess: '激活成功',
    activationFailed: '激活失败',
    accountActivated: '您的账号已成功激活！',
    alreadyActivated: '账号已激活',
    accountAlreadyActive: '您的账号已经是激活状态',
    invalidActivationLink: '激活链接无效或已过期',
    activationError: '激活过程中出现错误',
    checkEmailInstruction: '我们已向您的邮箱发送激活链接',
    checkEmailForReset: '请查看邮箱中的密码重置链接',
    enterActivationCode: '输入激活码',
    enterCodeInstruction: '请输入您收到的6位激活码',
    codeRequired: '请输入验证码',
    codeLength: '验证码必须是6位',
    codeResent: '验证码已重新发送',
    emailResent: '邮件已重新发送',
    resendEmail: '重新发送邮件',
    resendFailed: '重新发送失败',
    goToLogin: '前往登录',
    backToRegister: '返回注册',
    missingParameters: '缺少必要参数',
    registrationComplete: '注册完成！请登录您的账户',

    // 密码重置相关
    resetPassword: '重置密码',
    resetPasswordInstruction: '请设置您的新密码',
    verifyToken: '验证令牌',
    validatingToken: '正在验证令牌...',
    tokenValid: '令牌验证成功',
    tokenInvalid: '令牌无效或已过期',
    tokenValidationFailed: '令牌验证失败',
    newPassword: '新密码',
    passwordStrength: '密码强度',
    selectMethod: '选择方式',
    resetMethodInstruction: '请选择重置密码的方式',
    resetCode: '重置码',
    verify: '验证',
    enterEmail: '输入邮箱',
    sendResetCode: '发送重置码',
    requestNewReset: '请求新的重置链接',
    resetLinkSent: '重置链接已发送',
    resetCodeSent: '重置码已发送',
    requestFailed: '请求失败',
    invalidCode: '验证码无效',
    resetFailed: '重置失败',
    sendFailed: '发送失败',
    send: '发送',

    // 密码强度等级
    strength: {
      weak: '弱',
      fair: '一般',
      good: '良好',
      strong: '强'
    },

    // 新增字段
    confirmNewPassword: '确认新密码',
    passwordWeak: '弱',
    passwordFair: '一般',
    passwordGood: '良好',
    passwordStrong: '强'
  },
  dashboard: {
    title: '仪表板',
    subtitle: '网络系统概览',
    connected: '已连接',
    disconnected: '未连接',

    // 健康状态
    health: {
      healthy: '健康',
      warning: '警告',
      critical: '严重'
    },

    // 健康消息模板
    healthMessages: {
      allOnline: '网络运行正常（{count} 个设备在线）',
      someOffline: '检测到 {count} 个离线设备，建议检查',
      criticalIssues: '检测到 {count} 个异常设备，需要立即处理',
      lowOnlineRate: '网络状态需要关注（在线率 {rate}%）',
      unconfigured: '有 {count} 个设备未完成配置',
      noNodes: '暂无设备，请先创建设备'
    },

    // 待处理任务
    pendingTasks: {
      offlineNodes: '{count} 个设备离线',
      pendingConnections: '{count} 个待处理连接',
      unconfiguredNodes: '{count} 个设备未配置',
      failedRoutes: '{count} 个连接故障'
    },

    // 异常项目
    abnormalItems: {
      title: '需要关注的问题',
      noIssues: '所有系统运行正常，无需处理任何问题',
      allNormal: '{nodes} 个设备全部在线，{routes} 条连接正常运行',
      offlineNodes: '离线设备',
      pendingConnections: '待处理连接',
      unconfiguredNodes: '未完成配置',
      viewAll: '查看全部',
      handleNow: '立即处理',
      completeConfig: '完成配置',
      lastSeen: '最后在线：{time}',
      neverOnline: '从未在线',
      morePending: '还有 {count} 个待处理项'
    },

    // 快速操作
    quickActions: {
      title: '快速操作',
      createNode: '创建设备',
      createRoute: '创建连接',
      handleConnections: '处理连接 ({count})'
    },

    // 统计
    stats: {
      totalNodes: '总设备数',
      onlineNodes: '在线设备',
      offlineNodes: '离线设备',
      totalRoutes: '总连接数',
      activeRoutes: '活跃连接',
      onlineRate: '在线率',
      friendConnections: '好友连接'
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
    title: '设备管理',
    subtitle: '管理和监控网络设备',
    name: '设备名称',
    namePlaceholder: '请输入设备名称',
    nameMinLength: '设备名称至少3个字符',
    type: '设备类型',
    ipAddress: 'IP地址',
    port: '端口',
    config: '设备配置',
    configTitle: '设备配置',
    saveConfig: '保存配置',
    saveConfigSuccess: '设备配置保存成功',
    saveConfigFailed: '保存设备配置失败',
    loadConfigFailed: '加载设备配置失败',
    exportConfig: '导出配置',
    resetConfig: '重置',
    versionSelect: '版本选择',
    configMode: '配置模式',
    networkConfig: '网络配置',
    refreshData: '刷新数据',
    deleteNode: '删除设备',
    deleteConfirm: '确定要删除设备 "{name}" 吗？',
    dataRefreshed: '数据已刷新',
    refreshFailed: '刷新数据失败',
    deleteSuccess: '设备删除成功',
    deleteFailed: '删除设备失败',
    loadIndexServersFailed: '加载索引服务器失败',
    loadNetworkConfigFailed: '加载网络配置失败',
    loadDeviceInfoFailed: '加载设备信息失败',
    loadRoutesCountFailed: '加载连接数量失败',

    // 列表页面
    createNode: '创建设备',
    quickCreateTitle: '一键快速创建设备',
    quickCreateDesc: '只需输入设备名称，系统将自动应用默认配置（GNB、端口9016、MTU 1450）并自动分配 IP 地址。',
    quickCreateSuccess: '设备一键创建成功',
    quickCreateNextStep: '设备已创建，请前往设备详情页生成密鑰以完成配置。',
    quickCreateIpPoolEmpty: 'IP池中没有可用的IP地址，请联系管理员分配 IP 池。',
    quickCreateFailed: '快速创建失败',
    goToKeys: '去生成密鑰',
    noData: '暂无设备',
    noDataDescription: '还没有创建任何设备',
    createFirstNode: '创建第一个设备',

    // 快速创建
    quickCreate: {
      btn: '快速创建',
      title: '快速创建设备',
      hint: '仅需填写名称，VPN类型、IP、默认配置均自动完成。',
      nameLabel: '设备名称',
      namePlaceholder: '设备名称（3-255字符）',
      nameRule: '长度需为 3-255 字符',
      createBtn: '一键创建',
      successTitle: '设备创建成功',
      nodeName: '名称：',
      nodeIp: 'VPN IP：',
      ipPending: '分配中…',
      nodePort: '端口：',
      nodeIface: '接口：',
      stepsTitle: '完成以下步骤即可上线使用：',
      step1: '生成设备密钥',
      step2: '启用设备',
      generateKey: '生成密钥',
      enableNode: '启用',
      viewNode: '查看设备',
      privateKeyWarning: '私钥仅显示一次，请立即保存！',
      noZone: '当前无可用 Zone，请先切换或加入 Zone',
      createFailed: '创建失败，请重试',
      keyGenSuccess: '密钥生成成功，请立即保存私钥！',
      keyGenFailed: '密钥生成失败',
      enableSuccess: '设备已启用',
      enableFailed: '启用失败',
      copied: '已复制到剪贴板',
    },
    view: '查看',
    enable: '启用',
    disable: '禁用',
    createdAt: '创建于',
    gettingConfigSuggestions: '获取配置建议...',
    nextStepSuggestion: '下一步建议',

    // 删除确认对话框
    deleteConfirmTitle: '确认删除',
    deleteCancel: '取消',
    deleteConfirmAction: '删除',

    // 设备操作
    operations: {
      start: '启动',
      stop: '停止',
      restart: '重启',
      pause: '暂停',
      resume: '恢复',
      backup: '备份',
      restore: '恢复',
      upgrade: '升级',
      downgrade: '降级',
      migrate: '迁移',
      clone: '克隆',
      sync: '同步',
      test: '测试',
      monitor: '监控',
      diagnose: '诊断',
      optimize: '优化',

      // 操作确认
      confirmStart: '确定要启动设备 "{name}" 吗？',
      confirmStop: '确定要停止设备 "{name}" 吗？',
      confirmRestart: '确定要重启设备 "{name}" 吗？',
      confirmPause: '确定要暂停设备 "{name}" 吗？',
      confirmUpgrade: '确定要升级设备 "{name}" 吗？',
      confirmMigrate: '确定要迁移设备 "{name}" 吗？',

      // 操作结果
      startSuccess: '设备 {name} 启动成功',
      stopSuccess: '设备 {name} 停止成功',
      restartSuccess: '设备 {name} 重启成功',
      commandCreated: '{action}指令已创建，等待设备 {name} 执行',
      commandCreatedSimple: '{action}指令已创建，等待设备 {name} 执行',
      actionFailed: '设备{action}失败',
      createSuccess: '设备创建成功',
      createFailed: '创建设备失败，请重试',
      pauseSuccess: '设备暂停成功',
      resumeSuccess: '设备恢复成功',
      backupSuccess: '设备备份成功',
      restoreSuccess: '设备恢复成功',
      upgradeSuccess: '设备升级成功',
      migrateSuccess: '设备迁移成功',
      syncSuccess: '设备同步成功',
      testSuccess: '设备测试成功',

      // 操作失败
      startFailed: '设备启动失败',
      stopFailed: '设备停止失败',
      restartFailed: '设备重启失败',
      connectFailed: '设备连接失败',
      pauseFailed: '设备暂停失败',
      resumeFailed: '设备恢复失败',
      backupFailed: '设备备份失败',
      restoreFailed: '设备恢复失败',
      upgradeFailed: '设备升级失败',
      migrateFailed: '设备迁移失败',
      syncFailed: '设备同步失败',
      testFailed: '设备测试失败',

      // 批量操作
      batchOperations: '批量操作',
      selectNodes: '选择设备',
      selectAll: '全选',
      unselectAll: '取消全选',
      selectedCount: '已选择 {count} 个设备',
      batchStart: '批量启动',
      batchStop: '批量停止',
      batchRestart: '批量重启',
      batchDelete: '批量删除',
      batchUpdate: '批量更新',
      confirmBatchOperation: '确定要对所选的 {count} 个设备执行 {operation} 操作吗？',
      batchOperationSuccess: '批量操作完成，成功 {success} 个，失败 {failed} 个',
      batchOperationFailed: '批量操作失败',

      // 操作进度
      operationInProgress: '操作进行中...',
      operationCompleted: '操作已完成',
      operationCanceled: '操作已取消',
      operationTimeout: '操作超时',
      cancelOperation: '取消操作',
      operationProgress: '操作进度: {percent}%'
    },

    // 设备监控
    monitoring: {
      title: '设备监控',
      realTimeStats: '实时统计',
      performanceMetrics: '性能指标',
      connectionStatus: '连接状态',
      networkTraffic: '网络流量',
      resourceUsage: '资源使用',
      healthCheck: '健康检查',
      alertsWarnings: '警报和警告',

      // 性能指标
      cpuUsage: 'CPU使用率',
      memoryUsage: '内存使用率',
      diskUsage: '磁盘使用率',
      networkIn: '网络接收',
      networkOut: '网络发送',
      uptime: '运行时间',
      latency: '延迟',
      throughput: '吞吐量',
      errorRate: '错误率',
      connectionCount: '连接数',

      // 健康状态
      healthy: '健康',
      warning: '警告',
      critical: '严重',
      unknown: '未知',
      degraded: '降级',

      // 警报类型
      alerts: {
        highCPU: 'CPU使用率过高',
        highMemory: '内存使用率过高',
        highDisk: '磁盘使用率过高',
        networkTimeout: '网络连接超时',
        connectionLost: '连接丢失',
        configError: '配置错误',
        securityAlert: '安全警报',
        performanceDrop: '性能下降'
      },

      // 时间范围
      timeRange: {
        last1Hour: '最近1小时',
        last6Hours: '最近6小时',
        last24Hours: '最近24小时',
        last7Days: '最近7天',
        last30Days: '最近30天',
        custom: '自定义'
      }
    },

    // 设备日志
    logs: {
      title: '设备日志',
      viewLogs: '查看日志',
      downloadLogs: '下载日志',
      clearLogs: '清空日志',
      refreshLogs: '刷新日志',
      searchLogs: '搜索日志',
      filterLogs: '过滤日志',
      logLevel: '日志级别',
      logTime: '日志时间',
      logMessage: '日志消息',
      logSource: '日志来源',

      // 日志级别过滤
      showAll: '显示全部',
      showErrors: '仅显示错误',
      showWarnings: '显示警告及以上',
      showInfo: '显示信息及以上',
      showDebug: '显示调试及以上',

      // 日志操作
      logsCleared: '日志已清空',
      logsClearFailed: '清空日志失败',
      logsDownloaded: '日志已下载',
      logsDownloadFailed: '下载日志失败',
      noLogsFound: '未找到日志',
      logsTooLarge: '日志文件过大，建议下载查看',

      // 实时日志
      realTimeMode: '实时模式',
      pauseRealTime: '暂停实时',
      resumeRealTime: '恢复实时',
      autoScroll: '自动滚动',
      followTail: '跟踪尾部'
    },

    // 设备状态
    status: {
      unconfigured: '未完成配置',
      disabled: '已禁用',
      enabled: '已启用',
      online: '在线',
      offline: '离线',
      maintenance: '维护模式',
      active: '在线',
      inactive: '离线',
      pending: '待连接',
      updateSuccess: '设备状态已更新为: {status}',
      updateFailed: '更新设备状态失败，请重试'
    },

    // 设备信息字段
    fields: {
      lastSeen: '最后在线',
      description: '描述',
      appVersion: '应用版本',
      cpuModel: 'CPU型号',
      cpuArch: 'CPU架构',
      cpuCores: 'CPU核心数',
      totalMemory: '总内存',
      kernelVersion: '内核版本',
      systemArch: '系统架构',
      firewallStatus: '防火墙状态',
      ipForwarding: 'IP转发',
      networkInterface: '网络接口',
      ipGroupSequence: 'IP组序号',
      ipManagement: 'IP管理'
    },

    // 设备详情页
    detail: {
      title: '设备详情',
      basicInfo: '基本信息',
      nodeConfig: '设备配置',
      networkConfig: '网络配置',
      keyManagement: '密钥管理',
      deviceInfo: '设备信息',
      networkInfo: '网络信息',
      ipGrouping: 'IP分组',
      statistics: '统计信息',
      quickActions: '快速操作',

      // 基本信息字段
      nodeName: '设备名称',
      nodeId: '设备ID',
      status: '状态',
      lastOnline: '最后在线',
      createdAt: '创建时间',
      updatedAt: '更新时间',
      nodeType: '设备类型',

      // 应用信息
      appInfo: '应用信息',
      vpnType: 'VPN类型',
      appVersion: '应用版本',
      listenPort: '监听端口',

      // 硬件信息
      hardwareInfo: '硬件信息',
      cpuModel: 'CPU型号',
      cpuArch: 'CPU架构',
      cpuCores: 'CPU核心',
      threads: '线程',
      totalMemory: '内存总量',
      availableMemory: '可用内存',
      virtualization: '虚拟化',

      // 系统信息
      systemInfo: '系统信息',
      operatingSystem: '操作系统',
      kernelVersion: '内核版本',
      systemArch: '系统架构',
      cLibrary: 'C库',
      containerType: '容器类型',
      infoCollectedAt: '信息采集时间',

      // 网络设备信息
      networkDevice: '网络设备',
      nicCount: '网卡数量',
      firewall: '防火墙',
      ipForwarding: 'IP转发',
      units: '个',

      // 网络字段
      virtualInterface: '虚拟网卡名',
      virtualIpAddress: '虚拟IP地址',
      endpointAddress: '端点地址',
      ipGroupSequence: 'IP组序号',
      lanIpAddress: 'LAN IP地址',
      publicIpAddress: '公网IP地址',

      // 消息
      noDeviceInfo: '暂无设备信息',
      deviceInfoNote: '设备信息需要客户端上报',
      statisticsInDevelopment: '统计功能开发中...',
      defaultGroup: '默认',
      ipv6Address: 'IPv6 地址'
    },

    // 编辑页面
    edit: {
      title: '编辑设备',
      saveAllChanges: '保存所有更改',
      resetChanges: '重置更改',
      confirmLeave: '确认离开',
      unsavedChangesMessage: '您有未保存的更改，确定要离开吗？',
      allChangesSaved: '所有更改已保存',
      saveFailed: '保存失败，请重试',
      confirmReset: '确认重置',
      resetChangesMessage: '确定要重置所有更改吗？',

      // 标签页
      tabs: {
        basic: '基础信息',
        network: '网络配置',
        config: '设备配置',
        keys: '密钥管理'
      },

      // 基础信息页面
      basic: {
        nameRequired: '设备名称不能为空',
        nameMaxLength: '设备名称长度不能超过50个字符',
        descriptionMaxLength: '描述长度不能超过500个字符',
        versionPlaceholder: '软件版本 (例如: v1.0.0)',
        nodeTypeMultiSelect: '设备类型 (可多选)',
        currentSelection: '当前选择值',
        currentStatus: '当前状态: {status}',
        saveBasicInfo: '保存基础信息',
        noSelection: '未选择',
        loadTypesDefinitionFailed: '加载设备类型定义失败',
        formReset: '表单已重置',
        basicInfoSaved: '基础信息保存成功',
        saveFailed: '保存失败，请重试',
        vpnTypeSwitched: '已切换到 {type}，请到设备配置页面设置相关端口',

        // 设备类型
        nodeTypes: {
          edge: '边缘设备',
          relay: '中继设备',
          gateway: '网关设备',
          master: '主设备',
          backup: '备用设备',
          monitor: '监控设备',
          proxy: '代理设备',
          special: '特殊设备'
        }
      },

      // 网络配置页面
      network: {
        loadingConfig: '正在加载网络配置...',
        basicConfig: '基础配置',
        nodeVirtualIP: '设备虚拟IP',
        selectIP: '选择IP',
        selectIPFromPool: '从IP池中选择一个可用的IP地址作为设备的虚拟IP',
        ipGroupSequence: '组序号',
        virtualInterface: '虚拟网卡名称',
        interfacePlaceholder: '默认为 gnb0',
        lanIPs: 'LAN IP地址',
        lanIPsDescription: '局域网IP地址，格式：192.168.1.1',
        lanIPsHint: '配置设备在局域网中的IP地址，用于局域网内的直接连接',
        addLanIP: '添加LAN IP',
        publicIPs: '公网IP地址',
        publicIPsDescription: '公网IP地址，格式：1.2.3.4',
        publicIPsHint: '配置设备的公网IP地址，用于跨网络连接',
        addPublicIP: '添加公网IP',
        indexServers: '索引服务器',
        indexServersDescription: '索引服务器地址，格式：IP:端口',
        indexServersHint: '索引服务器用于设备发现和连接，可配置多个提高可用性',
        addIndexServer: '添加索引服务器',
        manualConfig: '手动配置',
        autoDetect: '自动检测',
        detectIPs: '检测IP',
        addIP: '添加IP',
        removeIP: '移除IP',
        networkConfigSaved: '网络配置保存成功',
        networkConfigSaveFailed: '网络配置保存失败',
        ipDetectionFailed: 'IP检测失败',
        invalidIPFormat: 'IP地址格式不正确',
        duplicateIP: 'IP地址重复',
        saveNetworkConfig: '保存网络配置',
        resetNetwork: '重置网络配置',
        advancedConfig: '高级配置',
        confirmResetNetwork: '确定要重置网络配置吗？',

        // 保存相关
        save: {
          noChanges: '没有任何变化，无需保存',
          noChangesDetected: '没有检测到变化，无需保存',
          success: '网络配置保存成功，更新了 {count} 个字段',
          errorLog: '保存网络配置失败:',
          defaultError: '保存失败，请重试',
          errorPrefix: '保存失败'
        },

        // 验证相关
        validation: {
          formErrors: '请检查并修正表单错误',
          virtualIpRequired: '请选择设备虚拟IP'
        }
      },

      // 设备配置页面
      config: {
        title: '设备配置',
        loadingConfig: '正在加载设备配置...',
        portConfig: '端口配置',
        listenPort: '监听端口',
        discoveryPort: '发现端口',
        webUIPort: 'Web UI端口',
        sslConfig: 'SSL配置',
        enableSSL: '启用SSL',
        certPath: '证书路径',
        keyPath: '私钥路径',
        advancedConfig: '高级配置',
        logLevel: '日志级别',
        maxConnections: '最大连接数',
        connectionTimeout: '连接超时',
        heartbeatInterval: '心跳间隔',
        configGenerated: '配置已生成',
        configGenerateFailed: '配置生成失败',
        configExported: '配置已导出',
        configExportFailed: '配置导出失败',
        configImported: '配置已导入',
        configImportFailed: '配置导入失败',
        invalidConfigFile: '配置文件格式不正确',
        portInUse: '端口已被占用',
        portOutOfRange: '端口号必须在1-65535之间',
        generateConfig: '生成配置',
        exportConfig: '导出配置',
        importConfig: '导入配置',
        previewConfig: '预览配置',
        saveNodeConfig: '保存设备配置',
        resetConfig: '重置配置',
        confirmResetConfig: '确定要重置设备配置吗？',
        saveConfig: '保存配置',
        basicConfig: '基本配置',
        expertConfig: '专家配置',
        copyConfig: '复制配置',

        // VPN类型和版本
        gnbVirtualNetwork: 'GNB虚拟网络',
        wireGuard: 'WireGuard',
        openVPN: 'OpenVPN',
        defaultVersion: '默认版本 (Latest)',

        // VPN配置参数翻译
        nodeId: '设备ID',
        networkInterface: '网络接口名称',
        listenPortConfig: '监听端口',
        mtu: 'MTU (最大传输单元)',
        multiSocket: '多路复用',
        directForwarding: '直接转发',
        unifiedForwarding: '统一转发',
        standardForwarding: '标准中继转发',
        addressSecure: '地址安全',
        ipv4Only: '仅IPv4',
        ipv6Only: '仅IPv6',
        keepalive: '保活间隔(秒)',
        forward: '转发功能',
        daemon: '守护进程',
        compression: '压缩',
        compressionLevel: '压缩等级',
        memory: '内存刻度',
        esArgs: 'ES参数',

        // WireGuard参数
        interfaceAddress: '接口地址',
        multiConnection: '多连接支持',
        daemonMode: '守护进程模式',
        dnsServers: 'DNS服务器',
        persistentKeepalive: '持续保活(秒)',
        allowedIPs: '允许的IP',
        endpoint: '端点地址',
        fwmark: 'FwMark防火墙标记',
        routeTable: '连接表',
        saveConfigFile: '保存配置',
        preUpScript: '启动前脚本',
        postUpScript: '启动后脚本',
        preDownScript: '停止前脚本',
        postDownScript: '停止后脚本',
        presharedKey: '预共享密钥',
        roaming: '漫游支持',
        handshakeTimeout: '握手超时(秒)',
        fullConfigPreview: '基本配置 + 专家配置',
        pleaseConfigureParams: '# 请填写配置参数',
        gnbConfigFile: '# GNB 设备配置文件 (完整配置)',
        wireguardConfigFile: '# WireGuard 设备配置文件 (完整配置)',
        generateTime: '# 生成时间',
        peerConfigNote: '# Peer配置需要根据具体需求设置',
        peerPublicKey: '# PublicKey = <对端公钥>',
        peerEndpoint: '# Endpoint = <对端地址:端口>',
        peerAllowedIPs: '# AllowedIPs = <允许的IP范围>',
        noConfigContent: '# 暂无配置内容',
        saveSuccess: '设备配置保存成功',
        saveFailedLog: '保存设备配置失败:',
        saveFailedRetry: '保存失败，请重试',
        saveFailedPrefix: '保存失败',

        // 日志级别
        logLevels: {
          trace: '追踪',
          debug: '调试',
          info: '信息',
          warn: '警告',
          error: '错误',
          fatal: '致命'
        }
      },

      // 密钥管理页面
      keys: {
        title: '密钥管理',
        keyList: '密钥列表',
        keyDetails: '密钥详情',
        noKeys: '暂无密钥',
        addKey: '添加密钥',
        keyId: '密钥ID',
        keyType: '密钥类型',
        privateKeyOnetime: '私钥 (仅此一次显示)',
        privateKeyWarning: '私钥仅显示一次，请立即保存！',
        loadingKeys: '正在加载密钥信息...',
        publicKey: '公钥',
        privateKey: '私钥',
        keyPair: '密钥对',
        generateKeyPair: '生成密钥对',
        importKey: '导入密钥',
        exportKey: '导出密钥',
        copyPublicKey: '复制公钥',
        copyPrivateKey: '复制私钥',
        showPrivateKey: '显示私钥',
        hidePrivateKey: '隐藏私钥',
        keyFormat: '密钥格式',
        keyLength: '密钥长度',
        keyAlgorithm: '密钥算法',
        keyGenerated: '密钥已生成',
        keyGenerateFailed: '密钥生成失败',
        keyImported: '密钥已导入',
        keyImportFailed: '密钥导入失败',
        keyExported: '密钥已导出',
        keyExportFailed: '密钥导出失败',
        publicKeyCopied: '公钥已复制到剪贴板',
        privateKeyCopied: '私钥已复制到剪贴板',
        keyCopyFailed: '密钥复制失败',
        invalidKeyFormat: '密钥格式不正确',
        keyTooShort: '密钥长度不足',
        keyTooLong: '密钥长度过长',
        confirmGenerateKey: '生成新密钥将覆盖现有密钥，确定要继续吗？',
        confirmDeleteKey: '确定要删除密钥吗？此操作不可恢复',
        keyFileSelect: '选择密钥文件',
        dragDropKey: '拖拽密钥文件到此处或点击选择',
        saveKeyConfig: '保存密钥配置',
        resetKeys: '重置密钥',

        // 密钥操作消息
        keyPairGenerated: '密钥对生成成功',
        keyUpdated: '密钥更新成功',
        privateKeySaved: '私钥保存确认完成',
        privateKeyDownloaded: '私钥已下载，请妥善保管',
        uploadNotImplemented: '上传公钥功能暂未实现',
        localGenerateNotImplemented: '本地生成功能暂未实现',
        keyDeleted: '密钥删除成功',
        deleteFailed: '删除密钥失败，请重试',
        copySuccess: '私钥已复制到剪贴板',
        copyFailed: '复制失败，请手动复制',
        uploadSuccess: '公钥上传成功',
        uploadFailed: '公钥验证失败',
        validationSuccess: '公钥验证成功',
        downloadSuccess: '公钥下载成功',
        privateKeyDownloadSuccess: '私钥下载成功',
        downloadFailed: '下载公钥失败',
        privateKeyDownloadFailed: '下载私钥失败',

        // 密钥格式
        formats: {
          pem: 'PEM格式',
          der: 'DER格式',
          p12: 'PKCS#12格式',
          jks: 'Java KeyStore格式'
        },

        // 密钥算法
        algorithms: {
          rsa: 'RSA',
          ecdsa: 'ECDSA',
          ed25519: 'Ed25519',
          secp256k1: 'secp256k1'
        }
      }
    }
  },
  navigation: {
    mainFeatures: '主要功能',
    networkConfig: '网络配置',
    systemTools: '开发设置',
    dashboard: '仪表板',
    nodes: '设备管理',
    routes: {
      title: '连接管理',
      overview: '连接概览',
      active: '活跃连接',
      pending: '待处理连接',
      friends: '好友设备'
    },
    // 单独的导航键值，用于页面标题
    activeRoutes: '活跃连接',
    pendingConnections: '待处理连接',
    friendNodes: '好友设备',
    ippools: 'IP池管理',
    zones: '区域管理',
    zoneSharing: '区域分享',
    zoneServices: '区域服务',
    services: {
      title: '服务管理',
      description: '管理和访问各类网络服务',
      overview: '服务概览',
      overviewDescription: '查看服务统计和快速导航',
      publicServices: '公共服务',
      publicServicesDescription: '浏览系统提供的公共网络服务（已连接设备自动共享）',
      friendServices: '好友服务',
      friendServicesDescription: '浏览好友分享的网络服务',
      anonymousServices: '匿名服务（已废弃）', // 功能已移除，保留以避免错误
      anonymousServicesDescription: '该功能已废弃', // 功能已移除
      myServices: '我的服务',
      myServicesDescription: '管理和分享你创建的服务'
    },
    social: {
      title: '组网管理',
      friends: '好友列表',
      requests: '好友请求',
      invitations: '邀请管理'
    },
    apiTest: 'API测试',
    help: '帮助文档'
  },
  routes: {
    subtitle: '网络连接管理和配置',
    title: '连接管理',
    name: '连接名称',
    destination: '目标地址',
    gateway: '网关',

    // 概览统计
    overview: {
      activeRoutes: '活跃连接',
      pendingConnections: '待处理连接',
      connectedNodes: '已连接设备',
      totalBandwidth: '总带宽'
    },

    // 标签页
    tabs: {
      activeRoutes: '活跃连接',
      pendingConnections: '待处理连接',
      friendNodes: '好友设备',
      configuration: '配置管理'
    },

    // 路由状态
    status: {
      active: '活跃',
      inactive: '非活跃',
      connecting: '连接中',
      error: '错误',
      unknown: '未知'
    },

    // 连接类型
    connectionType: {
      direct: '直连',
      relay: '中继'
    },

    // 设备选择器
    nodeSelector: {
      addNodesFirst: '请先添加设备',
      clearSelection: '清除选择',
      noDescription: '暂无描述',
      noNodes: '暂无设备',
      noSearchResults: '未找到匹配的设备',
      refresh: '刷新',
      searchPlaceholder: '搜索设备...',
      selectedNode: '已选设备',
      statusFilter: '状态筛选',
      tryDifferentSearch: '请尝试其他搜索词',
      typeFilter: '类型筛选',
      status: {
        active: '活跃',
        inactive: '非活跃',
        pending: '待处理'
      }
    },

    // 设备状态
    nodeStatus: {
      available: '可用',
      connected: '已连接',
      pending: '待处理',
      unavailable: '不可用'
    },

    // 连接状态
    connectionStatus: {
      pending: '待处理',
      approved: '已批准',
      rejected: '已拒绝'
    },

    // 活跃连接
    activeRoutes: {
      subtitle: '管理当前活跃的网络连接',
      searchPlaceholder: '搜索连接...',
      statusFilter: '状态过滤',
      noRoutes: '暂无活跃连接',
      noSearchResults: '未找到匹配连接',
      bandwidth: '带宽',
      latency: '延迟',
      packetLoss: '丢包率',
      connectionType: '连接类型',
      lastActive: '最后活跃',
      lastUpdate: '最后更新',
      unknownUser: '未知用户',
      viewDetails: '查看详情',
      editRoute: '编辑路由',
      disconnect: '断开连接',
      relayMode: '中继模式',
      priority: '优先级',
      vpnType: 'VPN类型',
      targetUser: '目标用户',
      sourceNode: '源设备',
      targetNode: '目标设备',
      unknownType: '未知类型',
      unknownMode: '未知模式',

      // 视图模式
      viewMode: {
        card: '卡片模式',
        list: '列表模式'
      },

      // 列表视图
      listView: {
        title: '设备连接列表',
        searchPlaceholder: '搜索设备名称、IP...',
        totalConnections: '共 {count} 条连接',
        noConnections: '暂无连接数据',
        noSearchResults: '未找到匹配的连接',
        columns: {
          nodeName: '设备名称',
          ipAddress: 'IP地址',
          status: '状态',
          connectionType: '连接类型',
          latency: '延迟',
          traffic: '流量',
          lastSeen: '最后可见',
          actions: '操作'
        }
      },

      // 连接详情
      connectionDetails: {
        title: '连接详情',
        subtitle: '查看两个设备之间的连接状态和历史数据',
        sourceNode: '本设备',
        peerNode: '对端设备',
        connectionStatus: '连接状态',
        connectionType: '连接类型',
        latency: '延迟',
        lastSeen: '最后可见',
        trafficStats: '流量统计',
        rxBytes: '接收流量',
        txBytes: '发送流量',
        totalBytes: '总流量',
        history: '连接历史',
        loadingDetails: '加载连接详情...',
        nodeInfo: {
          nodeId: '设备ID',
          nodeName: '设备名称',
          owner: '所属用户',
          status: '设备状态'
        },
        timeRange: {
          '1h': '1小时',
          '6h': '6小时',
          '24h': '24小时',
          '7d': '7天'
        }
      },

      // 连接类型
      connectionTypes: {
        direct_ipv4: '直连 IPv4',
        direct_ipv6: '直连 IPv6',
        relay: '中继',
        derp: 'DERP 中继'
      },

      // 状态
      status: {
        online: '在线',
        offline: '离线',
        connected: '已连接',
        disconnected: '已断开'
      }
    },

    // 待处理连接
    pendingConnections: {
      subtitle: '处理待批准的连接请求',
      incoming: '接收请求',
      outgoing: '发送请求',
      noIncomingConnections: '暂无接收的连接请求',
      noOutgoingConnections: '暂无发送的连接请求',
      connectionType: '连接类型',
      vpnType: 'VPN类型',
      requestedAt: '请求时间',
      approve: '批准',
      reject: '拒绝',
      viewDetails: '查看详情',
      connectionDetails: '连接详情',
      approveSuccess: '连接请求已批准',
      approveError: '批准连接请求失败',
      rejectSuccess: '连接请求已拒绝',
      rejectError: '拒绝连接请求失败'
    },

    // 好友设备
    friendNodes: {
      subtitle: '浏览和管理好友的网络设备',
      goToSocial: '去组网管理',
      sendRequest: '发送请求',
      requestSent: '连接请求已发送',
      requestError: '发送连接请求失败',
      noNodes: '暂无好友设备',
      noNodesDescription: '您还没有任何好友的设备信息',
      noDescription: '暂无描述',
      vpnType: 'VPN类型',
      endpoint: '端点',
      lastSeen: '最后在线',
      viewFriend: '查看好友',
      connect: '连接',
      offline: '离线',
      selectMyNode: '选择我的设备',
      selectMyNodeHint: '选择用于建立连接的本地设备',
      noAvailableNodes: '暂无可用设备',
      sendConnectionRequest: '发送连接请求',
      connectionRequestHint: '向好友发送连接请求以建立路由',
      friendNode: '好友设备',
      myNode: '我的设备',
      requestMessage: '请求消息',
      requestMessageHint: '向好友说明连接目的',
      stats: {
        friendsCount: '好友数',
        totalNodes: '设备总数',
        onlineNodes: '在线设备',
        offlineNodes: '离线设备'
      }
    },

    // 中继模式
    relayModes: {
      direct: '直连',
      relay: '中继',
      p2p: '点对点',
      hybrid: '混合模式'
    },

    // 基于设备的连接管理
    nodeBased: {
      selectNode: '选择我的设备',
      selectNodeDescription: '点击您的设备卡片查看该设备的连接信息',
      viewRoutes: '查看连接',
      backToNodes: '返回设备列表',
      noAvailableNodes: '暂无可用设备',
      noAvailableNodesDescription: '您还没有创建任何可用的设备',
      noNodes: '暂无设备',
      noNodesDescription: '您还没有创建任何设备，请先创建设备',
      noDescription: '暂无描述',
      nodeId: '设备ID',
      totalRoutes: '连接总数',
      totalNodes: '设备总数',
      routeCount: '连接数',
      nodeType: '设备类型',
      vpnType: 'VPN类型',
      status: '状态',
      unknown: '未知',
      routesList: '连接列表',
      nodesList: '设备列表',
      noRoutesForNode: '该设备暂无连接',
      noNodesForNode: '该设备暂无设备',
      statusLabels: {
        active: '活跃',
        inactive: '非活跃',
        pending: '待配置',
        unknown: '未知'
      }
    },

    // 设备连接显示
    nodeRoutes: {
      nodeId: '设备ID',
      totalRoutes: '连接总数',
      noDescription: '暂无描述',
      searchPlaceholder: '搜索连接信息...',
      refresh: '刷新',
      noRoutes: '该设备暂无连接',
      noSearchResults: '未找到匹配的连接',
      tryDifferentSearch: '请尝试其他搜索条件',
      noRoutesForNode: '该设备还没有建立任何连接',
      vpnType: 'VPN类型',
      relayMode: '中继模式',
      priority: '优先级',
      remoteUser: '远程用户',
      lastUpdate: '最后更新',
      viewDetails: '查看详情',
      editRoute: '编辑路由',
      disconnect: '断开连接',
      unknownType: '未知类型',
      unknownMode: '未知模式',
      direction: {
        outgoing: '出站连接',
        incoming: '入站连接'
      }
    },

    // 配置管理
    config: {
      description: '连接配置文件包含了所有必要的网络连接信息，可以下载并应用到您的网络设备。',
      configStatus: '配置状态',
      configReady: '配置已就绪',
      configNotReady: '配置尚未生成',
      lastUpdated: '最后更新',
      never: '从未',
      configDetails: '配置详情',
      version: '版本',
      format: '格式',
      entries: '条目数',
      preview: '预览',
      copy: '复制',
      copied: '已复制到剪贴板',
      download: '下载配置',
      refresh: '刷新配置',
      routeEntries: '连接条目',
      nodeId: '设备ID',
      ipAddress: 'IP地址',
      mask: '子网掩码',
      gateway: '网关',
      metric: '跃点数',
      actions: '操作',
      entryDetails: '条目详情'
    },

    // 连接详情
    details: {
      basicInfo: '基本信息',
      routeId: '连接ID',
      status: '状态',
      connectionType: '连接类型',
      createdAt: '创建时间',
      lastActive: '最后活跃',
      nodeInfo: '设备信息',
      sourceNode: '源设备',
      targetNode: '目标设备',
      nodeName: '设备名称',
      ipAddress: 'IP地址',
      mask: '子网掩码',
      friendName: '好友名称',
      performance: '性能指标',
      bandwidth: '带宽',
      latency: '延迟',
      packetLoss: '丢包率',
      uptime: '运行时间',
      connectionStats: '连接统计',
      bandwidthIn: '入站带宽',
      bandwidthOut: '出站带宽',
      bytesSent: '发送字节',
      bytesReceived: '接收字节',
      disconnect: '断开连接'
    },

    // 操作
    actions: {
      refreshRoutes: '刷新连接',
      createRoute: '创建连接',
      connect: '连接',
      disconnect: '断开连接',
      approve: '批准',
      reject: '拒绝',
      viewDetails: '查看详情'
    },

    // 创建连接流程
    create: {
      // 步骤名称
      steps: {
        selectFriend: '选择好友',
        selectFriendNode: '选择好友设备',
        selectMyNode: '选择我的设备',
        submitRequest: '提交申请'
      },

      // 第一步 - 选择好友
      step1: {
        title: '创建连接 - 选择好友',
        subtitle: '选择要建立连接的好友',
        selectFriend: '选择好友',
        searchFriends: '搜索好友...',
        noFriends: '暂无好友',
        friendInfo: '设备: {nodes} | 状态: {status}',
        availableNodes: '可用设备',
        totalNodes: '总设备数',
        nextStep: '下一步',
        pleaseSelectFriend: '请选择一个好友'
      },

      // 第二步 - 选择好友设备
      step2: {
        title: '创建连接 - 选择好友设备',
        subtitle: '选择 {friendName} 的设备进行连接',
        selectedFriend: '已选择的好友',
        changeFriend: '更换好友',
        selectFriendNode: '选择好友设备',
        loadingNodes: '加载设备中...',
        noNodes: '该好友暂无可用设备',
        unknownLocation: '未知位置',
        nodeStatus: '状态',
        connections: '连接数',
        latency: '延迟',
        connectionsFull: '连接数已满',
        nodeNotAvailable: '设备不可用',
        cannotConnect: '无法连接到此设备',
        possibleReasons: '可能的原因',
        existingConnection: '已存在连接',
        pendingRequest: '存在待处理的连接请求',
        nextStep: '下一步',
        pleaseSelectNode: '请选择一个设备',
        nodeCannotConnect: '该设备暂时无法连接',
        fetchNodesError: '获取好友设备失败',
        noFriendSelected: '未选择好友'
      },

      // 第三步 - 选择我的设备
      step3: {
        title: '创建连接 - 选择我的设备',
        subtitle: '选择您的设备进行连接',
        selectionSummary: '选择总结',
        selectedFriend: '选择的好友',
        selectedFriendNode: '选择的好友设备',
        selectMyNode: '选择我的设备',
        searchNodes: '搜索设备...',
        filterByStatus: '按状态筛选',
        allStatus: '全部状态',
        onlineOnly: '仅在线',
        availableOnly: '仅可用',
        connectedOnly: '已连接',
        pendingOnly: '待处理',
        loadingNodes: '加载设备中...',
        noAvailableNodes: '暂无可用设备',
        createNodeHint: '您可以先创建设备',
        unknownLocation: '未知位置',
        nodeStatus: '状态',
        connections: '连接数',
        bandwidth: '带宽',
        connectionStatusLabel: '连接状态',
        alreadyConnected: '已建立连接',
        requestSent: '已发送申请',
        requestReceived: '收到申请',
        requestRejected: '申请被拒绝',
        connectionsFull: '连接数已满',
        nextStep: '下一步',
        pleaseSelectNode: '请选择一个设备',
        nodeAlreadyConnected: '该设备已与目标设备建立连接',
        requestAlreadySent: '已向该设备发送连接申请',
        requestAlreadyReceived: '已收到该设备的连接申请',
        nodeCannotConnect: '该设备暂时无法连接',
        cannotProceedWithConnection: '该设备存在连接关系，无法继续',
        fetchNodesError: '获取设备失败',
        noFriendSelected: '未选择好友',
        noFriendNodeSelected: '未选择好友设备',

        // 连接状态
        connectionStatus: {
          connected: '已连接',
          pendingSent: '申请已发送',
          pendingReceived: '申请已接收',
          rejected: '申请被拒绝',
          none: '无连接',
          unknown: '状态未知'
        },

        // 设备不可用原因
        nodeNotAvailable: '设备暂时不可用',
        nodeUnconfigured: '设备未配置',
        nodeDisabled: '设备已禁用',
        nodeMaintenance: '设备维护中'
      },

      // 第四步 - 提交申请
      step4: {
        title: '创建连接 - 提交申请',
        subtitle: '填写连接申请信息',
        selectionSummary: '选择总结',
        targetFriend: '目标好友',
        targetNode: '目标设备',
        sourceNode: '源设备',
        requestForm: '申请表单',
        requestMessage: '申请消息',
        messagePlaceholder: '请描述您的连接需求和使用场景...',
        messageHint: '请详细说明连接用途，这有助于好友快速审批',
        messageRequired: '请输入申请消息',
        messageMinLength: '申请消息至少需要10个字符',
        messageMaxLength: '申请消息不能超过500个字符',
        connectionPriority: '连接优先级',
        priorityHint: '高优先级连接会优先处理',
        expectedBandwidth: '预期带宽',
        bandwidthRequired: '请输入预期带宽',
        bandwidthMaxValue: '带宽不能超过1000Mbps',
        bandwidthHint: '根据您的实际需求设置',
        connectionDuration: '连接持续时间',
        durationHint: '设置连接的有效期',
        autoReconnect: '自动重连',
        connectionProtocol: '连接协议',
        protocolHint: '推荐使用自动协议',
        submitRequest: '提交申请',
        incompleteSelection: '选择信息不完整',
        submitError: '提交申请失败',
        requestSubmitted: '申请已提交',
        requestSubmittedMessage: '您的连接申请已成功提交，等待好友审批',
        viewRoutes: '查看连接',
        createAnother: '创建另一个',
        defaultMessage: '您好 {friendName}，我希望将我的设备 {myNode} 与您的设备 {friendNode} 建立连接，用于网络通信。',

        // 优先级选项
        priorities: {
          low: '低优先级',
          normal: '普通',
          high: '高优先级',
          urgent: '紧急'
        },

        // 持续时间选项
        durations: {
          '1hour': '1小时',
          '6hours': '6小时',
          '1day': '1天',
          '3days': '3天',
          '7days': '7天',
          '30days': '30天',
          permanent: '永久'
        },

        // 协议选项
        protocols: {
          auto: '自动选择',
          tcp: 'TCP',
          udp: 'UDP',
          wireguard: 'WireGuard',
          openvpn: 'OpenVPN'
        }
      },

      // 通用消息
      requestSubmitted: '连接申请已提交',
      submitError: '提交申请失败'
    },

    // 连接概览页面导航卡片
    index: {
      title: '连接概览',
      subtitle: '管理和监控网络连接',
      overview: '连接概览',
      overviewDescription: '查看连接统计和快速操作',
      activeRoutes: '活跃连接',
      activeRoutesDescription: '管理当前活跃的网络连接',
      pendingConnections: '待处理连接',
      pendingConnectionsDescription: '处理待批准的连接请求',
      friendNodes: '好友设备',
      friendNodesDescription: '浏览和管理好友的网络设备',

      // 统计标签
      statistics: {
        total: '总计',
        active: '活跃',
        pending: '待处理',
        available: '可用',
        connected: '已连接'
      },

      // 快速操作
      quickActions: {
        createRoute: '创建连接',
        refreshData: '刷新数据',
        viewAll: '查看全部',
        manage: '管理',
        browse: '浏览'
      }
    },

    // 对话框
    dialogs: {
      routeDetails: {
        title: '连接详情'
      },
      connectNode: {
        title: '连接设备',
        message: '您要连接到 {friendName} 的设备 {nodeName}，请输入连接说明：',
        messagePlaceholder: '请输入连接说明（可选）...'
      }
    },

    // 错误消息
    fetchOverviewError: '获取连接概览失败',
    fetchActiveRoutesError: '获取活跃连接失败',
    fetchPendingConnectionsError: '获取待处理连接失败',
    fetchFriendNodesError: '获取好友设备失败',
    fetchAllFriendNodesError: '获取所有好友设备失败',
    fetchConfigError: '获取配置失败',
    fetchRouteDetailsError: '获取连接详情失败',
    connectionRequestSent: '连接请求已发送',
    connectionRequestError: '发送连接请求失败',
    connectionApproved: '连接已批准',
    connectionApproveError: '批准连接失败',
    connectionRejected: '连接已拒绝',
    connectionRejectError: '拒绝连接失败',
    routeDisconnected: '连接已断开',
    routeDisconnectError: '断开连接失败',
    configDownloaded: '配置已下载',
    configDownloadError: '下载配置失败',
    configRefreshed: '配置已刷新',
    configRefreshError: '刷新配置失败'
  },
  zones: {
    subtitle: '网络区域管理和配置',
    switchZone: '切换区域',
    selectZone: '选择区域',
    switchedTo: '已切换到 {zoneName}',
    switchFailed: '切换区域失败',
    comingSoonMessage: '区域管理功能正在开发中，敬请期待！',

    // 扩展的zone管理功能
    currentZone: '当前区域',
    availableZones: '可用区域',
    noCurrentZone: '未选择区域',
    noAvailableZones: '暂无可用区域',
    adminRole: '管理员',
    domain: '域名',
    admin: '管理员',
    switchToZone: '切换到此区域',

    // 统计信息
    stats: {
      totalNodes: '总设备数',
      activeNodes: '活跃设备',
      routes: '连接数',
      users: '用户数'
    },

    // 操作
    actions: {
      switch: '切换',
      create: '创建区域',
      edit: '编辑',
      delete: '删除',
      refresh: '刷新'
    },

    // 对话框
    dialogs: {
      switchZone: {
        title: '切换区域',
        message: '确定要切换到区域 "{zoneName}" 吗？',
        warning: '切换区域后，您将看到该区域的网络配置和数据。'
      },
      createZone: {
        title: '创建新区域',
        nameLabel: '区域名称',
        descriptionLabel: '区域描述',
        create: '创建'
      }
    },

    // 错误信息
    fetchOverviewError: '获取区域概览失败',
    fetchAvailableZonesError: '获取可用区域失败',
    fetchZonesError: '获取区域列表失败',
    fetchDetailsError: '获取区域详情失败',
    createSuccess: '区域创建成功',
    createError: '创建区域失败',
    updateSuccess: '区域更新成功',
    updateError: '更新区域失败',
    deleteSuccess: '区域删除成功',
    deleteError: '删除区域失败'
  },
  social: {
    subtitle: '组网连接和用户管理',
    comingSoonMessage: '组网管理功能正在开发中，敬请期待！',

    // 错误消息
    fetchAllFriendNodesError: '获取所有好友设备失败',
    friendRequestCancelError: '取消好友请求失败',
    friendRequestCancelled: '好友请求已取消',

    // 操作按钮
    actions: {
      addFriend: '添加好友',
      accept: '接受',
      reject: '拒绝',
      removeFriend: '删除好友'
    },
    // 概览统计
    overview: {
      title: '组网概览',
      friends: '好友',
      pendingRequests: '待处理请求',
      connectedNodes: '已连接设备',
      activeRoutes: '活跃连接'
    },
    // 好友管理
    friends: {
      title: '好友列表',
      searchPlaceholder: '搜索好友...',
      mutualFriends: '共同好友',
      noFriends: '暂无好友',
      empty: '还没有好友，去邀请一些朋友加入吧！',
      online: '在线',
      offline: '离线',
      nodes: '设备',
      routes: '连接',
      friendshipDate: '成为好友时间',
      removeFriend: '删除好友',
      removed: '好友已删除',
      viewNodes: '查看设备',
      lastActive: '最后活跃'
    },
    // 好友请求
    friendRequests: {
      title: '好友请求',
      received: '收到的请求',
      sent: '发送的请求',
      noRequests: '暂无好友请求',
      empty: '暂无好友请求',
      accept: '接受',
      reject: '拒绝',
      message: '消息',
      requestTime: '请求时间',
      cancel: '取消请求',
      status: {
        pending: '待处理',
        accepted: '已接受',
        rejected: '已拒绝',
        undefined: '未定义'
      },
      statusError: '请求状态更新失败'
    },
    // 请求结果消息
    requests: {
      title: '好友请求',
      empty: '暂无好友请求',
      accepted: '好友请求已接受',
      rejected: '好友请求已拒绝'
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
    // 好友卡片
    viewNodes: '查看设备',
    friendSince: '{date}成为好友',
    onlineNodes: '{count} 个设备在线',
    nodes: '设备',
    connections: '连接',
    active: '活跃',
    online: '在线',
    editRemark: '编辑备注',
    editTags: '编辑标签',
    removeFriend: '删除好友',

    // 邀请码
    invitations: {
      title: '邀请码管理',
      invite: '邀请好友',
      emailLabel: '邮箱地址',
      copyFailed: '复制失败',
      linkCopied: '邀请链接已复制',
      empty: '暂无可邀请用户',
      sent: '邀请已发送',
      emailSent: '邀请邮件已发送到 {email}',
      createNew: '生成新邀请码',
      code: '邀请码',
      status: '状态',
      expiresAt: '过期时间',
      usedAt: '使用时间',
      usedBy: '使用者',
      createdAt: '创建时间',
      usageCount: '使用次数',
      copyInviteLink: '复制邀请码链接',
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
    invitationDeleted: '邀请码已删除',
    invitationCopied: '邀请码已复制到剪贴板',
    confirmDeleteInvitation: '确定要删除邀请码 "{code}" 吗？',
    // 错误消息
    fetchOverviewError: '获取组网概览失败',
    fetchFriendsError: '获取好友列表失败',
    searchUsersError: '搜索用户失败',
    fetchRequestsError: '获取好友请求失败',
    friendRequestError: '发送好友请求失败',
    friendRequestAcceptError: '接受好友请求失败',
    friendRequestRejectError: '拒绝好友请求失败',
    friendRemoveError: '删除好友失败',
    fetchInvitationsError: '获取邀请码列表失败',
    invitationCreateError: '创建邀请码失败',
    invitationDeleteError: '删除邀请码失败',

    // 新增的错误和成功消息
    noFriendNodes: '该好友暂无设备',
    fetchFriendNodesError: '获取好友设备失败'
  },
  ippools: {
    title: 'IP池管理',
    subtitle: 'IP地址池管理和分配',
    comingSoonMessage: 'IP池管理功能正在开发中，敬请期待！',
    // 列表页面
    pools: 'IP池',
    statistics: '统计信息',
    createPool: '创建IP池',
    searchPlaceholder: '搜索IP池名称或IP地址...',
    filterAll: '全部',
    filterAllocated: '已分配',
    filterAvailable: '可用',
    noPoolsFound: '未找到IP池',
    // 统计卡片
    totalPools: '总IP池数',
    createdPools: '已创建IP池',
    availablePools: '可创建IP池',
    allocatedPools: '已分配IP池',
    totalIPs: '总IP地址数',
    availableIPs: '可用IP地址',
    allocatedIPs: '已分配IP地址',
    allocatedToNodes: '已使用分配IP数',
    poolUsageRate: 'IP池使用率',
    usageRate: '使用率',
    // 表格字段
    poolName: '池名称',
    poolId: 'IP池ID',
    network: '网络段',
    ipGroupSequence: 'IP分组序号',
    ipRange: 'IP范围',
    totalCount: '总数',
    totalIPPoolsCount: '共 {count} 个IP池',
    usedCount: '已用',
    availableCount: '可用',
    status: '状态',
    createdAt: '创建时间',
    actions: '操作',
    unnamedPool: '未命名IP池',
    noPools: '暂无IP池',
    noPoolsHint: '点击创建按钮添加新的IP池',
    // 状态
    statusAvailable: '可用',
    statusAllocated: '已分配',
    statusPending: '待分配',
    // 操作
    view: '查看',
    edit: '编辑',
    delete: '删除',
    allocate: '分配IP',
    release: '释放IP',
    details: '详情',
    allocations: '分配记录',
    statisticsView: '统计信息',
    export: '导出',
    batchOperations: '批量操作',
    // 表单
    poolNameLabel: 'IP池名称',
    poolNameHint: '请输入IP池名称',
    networkLabel: '网络段',
    networkHint: '如：192.168.1.0/24',
    startIPLabel: '起始IP',
    startIPHint: '如：192.168.1.1',
    endIPLabel: '结束IP',
    endIPHint: '如：192.168.1.254',
    zoneLabel: '所属Zone',
    zoneHint: '选择IP池所属的Zone',
    // 分配相关
    nodeLabel: '设备',
    nodeHint: '选择要分配IP的设备',
    ipAddress: 'IP地址',
    allocatedTo: '分配给',
    allocatedAt: '分配时间',
    releasedAt: '释放时间',
    allocationHistory: '分配历史',
    // 对话框
    createPoolDialog: '创建IP池',
    editPoolDialog: '编辑IP池',
    deletePoolDialog: '删除IP池',
    allocateIPDialog: '分配IP地址',
    releaseIPDialog: '释放IP地址',
    poolDetailsDialog: 'IP池详情',
    // 确认消息
    deleteConfirmTitle: '删除确认',
    deleteConfirmMessage: '确定要删除IP池 "{name}" 吗？此操作不可撤销。',
    deletePoolConfirm: '确定要删除IP池 "{name}" 吗？此操作不可撤销。',
    releaseIPConfirm: '确定要释放IP地址 "{ip}" 吗？',
    // 验证消息
    poolNameRequired: '请输入IP池名称',
    startIPRequired: '请输入起始IP地址',
    endIPRequired: '请输入结束IP地址',
    zoneRequired: '请选择所属Zone',
    invalidIPFormat: 'IP地址格式不正确',
    invalidIPRange: 'IP地址范围不正确',
    ipRangeConflict: 'IP地址范围与现有IP池冲突',
    // 成功消息
    createSuccess: 'IP池创建成功',
    updateSuccess: 'IP池更新成功',
    deleteSuccess: 'IP池删除成功',
    allocateSuccess: 'IP地址分配成功',
    releaseSuccess: 'IP地址释放成功',
    batchOperationSuccess: '批量操作成功',
    exportSuccess: '导出成功',
    autoAllocateSuccess: 'IP池创建成功',
    extendSuccess: '扩展成功',
    // 错误消息
    fetchError: '获取IP池列表失败',
    fetchPoolError: '获取IP池详情失败',
    createError: '创建IP池失败',
    updateError: '更新IP池失败',
    deleteError: '删除IP池失败',
    allocateError: '分配IP地址失败',
    releaseError: '释放IP地址失败',
    fetchAllocationsError: '获取分配记录失败',
    checkIPError: '检查IP可用性失败',
    fetchStatisticsError: '获取统计信息失败',
    fetchUserResourcesError: '获取用户资源失败',
    batchOperationError: '批量操作失败',
    exportError: '导出失败',
    autoAllocateError: 'IP池创建失败',
    extendError: '扩展失败',
    continuityError: 'IP池创建成功，但未能实现连续分配',
    continuityWarning: '注意：虽然请求了连续分配，但系统分配的IP地址不连续',
    // 创建IP池相关
    checkAvailability: '检查可用性',
    userQuota: '用户配额',
    quota: '配额信息',
    maxPools: '最大池数',
    currentPools: '当前池数',
    remainingPools: '剩余池数',
    canCreate: '可创建',
    // 简化版创建相关
    quotaInfo: '当前 {current} 个池，最多 {max} 个池',
    quotaExhausted: '已达到该Zone的IP池配额上限',
    createCount: '创建数量',
    poolsUnit: '个',
    continuous: '连续性',
    discontinuous: '不连续',
    selectTargetPool: '选择目标池',
    selectTargetPoolHint: '选择一个现有的池作为连续扩展的目标',
    selectTargetPoolAdvancedHint: '新IP池将在目标池的前面或后面创建，系统将自动选择最佳位置',
    continuousRequiresPools: '连续模式需要至少有一个现有的IP池',
    autoSelectSinglePool: '将自动与现有池 {poolName} 连续创建',
    preview: '预览',
    willCreate: '将创建',
    continuousMode: '连续模式',
    extendFrom: '扩展自',
    // 提示信息
    noAllocations: '暂无分配记录',
    poolEmpty: 'IP池为空',
    poolFull: 'IP池已满',
    capacityWarning: 'IP池容量不足，建议及时扩容',
    // 高级功能
    refresh: '刷新',
    apply: '应用',
    reset: '重置',
    batchDelete: '批量删除',
    selectedCount: '已选择 {count} 项',
    advancedFilters: '高级过滤器',
    zoneFilter: 'Zone过滤',
    statusFilter: '状态过滤',
    usageFilter: '使用率过滤',
    ipContains: 'IP包含',
    ipContainsPlaceholder: '输入IP地址片段...',
    quickSearch: '快速搜索...',
    viewOptions: '显示选项',
    manage: '管理',
    usageAll: '全部',
    usageLow: '低使用率 (0-30%)',
    usageMedium: '中等使用率 (30-70%)',
    usageHigh: '高使用率 (70%+)',
    batchDeleteDialog: '批量删除IP池',
    batchDeleteConfirm: '确定要删除选中的 {count} 个IP池吗？此操作不可撤销。',
    // 视图模式
    cardView: '卡片视图',
    tableView: '表格视图',
    updatedAt: '更新时间'
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
    connectionFailed: 'WebSocket 连接失败',
    connectionStatus: 'WebSocket 连接状态',
    heartbeat: '心跳'
  },
  node: {
    status: {
      online: '在线',
      offline: '离线',
      connecting: '连接中',
      error: '错误'
    },
    ip: {
      searchPlaceholder: '搜索IP地址或IP池组名称...',
      loadingMessage: '正在加载可用IP...',
      noIPAddress: '暂无可用IP地址',
      noMatchingIP: '没有找到匹配的IP地址',
      createIPPoolHint: '请先创建IP池或分配IP资源',
      tryOtherKeywords: '请尝试其他搜索关键词',
      status: '状态',
      used: '已使用',
      available: '可用'
    },
    indexServer: {
      searchPlaceholder: '搜索服务器名称或地址...',
      loadingMessage: '正在加载索引服务器...',
      noServers: '暂无可用索引服务器',
      noMatchingServers: '没有找到匹配的服务器',
      contactAdminHint: '请联系管理员配置索引服务器',
      tryOtherKeywords: '请尝试其他搜索关键词',
      serverAlreadyExists: '所选服务器已存在，未添加任何新服务器',
      serversAdded: '已添加 {count} 个索引服务器'
    },
    network: {
      invalidIPFormat: 'IP地址格式不正确',
      invalidIPv4Format: 'IPv4地址格式不正确',
      invalidIPPortFormat: 'IP:端口格式不正确，例如: 192.168.1.1:8080',
      loadConfigFailed: '加载网络配置失败，使用默认值',
      ipSelected: '已选择IP: {ip} (组序号: {ipGroupSequenceNumber})'
    },
    config: {
      validation: {
        required: '此项为必填项',
        invalidNumber: '请输入有效的数字',
        minValue: '最小值为 {min}',
        maxValue: '最大值为 {max}',
        invalidFormat: '输入格式不正确'
      },
      configCopied: '配置已复制到剪贴板',
      copyFailed: '复制失败，请手动选择复制',
      configExported: '配置文件已导出',
      exportFailed: '导出配置失败，请稍后重试',
      loadConfigFailed: '加载配置失败',
      required: '(必填)',
      optional: '(可选)',
      basicConfig: '基本配置',
      basicConfigDesc: '必需的基础参数配置',
      wireGuardBasicDesc: '必需的WireGuard基础参数',
      listenPort: '监听端口',

      // VPN配置参数翻译
      nodeId: '设备ID',
      networkInterface: '网络接口名称',
      listenPortConfig: '监听端口',
      mtu: 'MTU (最大传输单元)',
      multiSocket: '多路复用',
      directForwarding: '直接转发',
      unifiedForwarding: '统一转发',
      standardForwarding: '标准中继转发',
      addressSecure: '地址安全',
      ipv4Only: '仅IPv4',
      ipv6Only: '仅IPv6',
      keepalive: '保活间隔(秒)',
      forward: '转发功能',
      daemon: '守护进程',
      compression: '压缩',
      compressionLevel: '压缩等级',
      memory: '内存刻度',
      esArgs: 'ES参数',
      gnbVirtualNetwork: 'GNB虚拟网络',
      wireGuard: 'WireGuard',
      openVPN: 'OpenVPN',
      defaultVersion: '默认版本 (Latest)',

      // WireGuard参数
      interfaceAddress: '接口地址',
      multiConnection: '多连接支持',
      daemonMode: '守护进程模式',
      dnsServers: 'DNS服务器',
      persistentKeepalive: '持续保活(秒)',
      allowedIPs: '允许的IP',
      endpoint: '端点地址',
      fwmark: 'FwMark防火墙标记',
      routeTable: '路由表',
      saveConfigFile: '保存配置',
      preUpScript: '启动前脚本',
      postUpScript: '启动后脚本',
      preDownScript: '关闭前脚本',
      postDownScript: '关闭后脚本',
      presharedKey: '预共享密钥',
      roaming: '漫游支持',
      handshakeTimeout: '握手超时(秒)'
    },
    detail: {
      deleteNodeFailed: '删除设备失败，请重试'
    },
    keyManagement: {
      generateKey: '生成密钥',
      generateKeyForNode: '为设备 {nodeId} 生成密钥',
      generationMethod: '生成方式',
      publicKeyContent: '公钥内容',
      publicKeyRequired: '公钥内容不能为空',
      generate: '生成',
      create: '创建',
      serverGenerated: '服务端生成',
      uploadPublicKey: '上传公钥',
      selectKeyToViewDetails: '请选择一个密钥查看详情'
    }
  },
  zoneServices: {
    subtitle: '区域服务分享和管理',

    // 页面标题和描述
    navigation: {
      publicServices: '公共服务',
      publicServicesDescription: '浏览系统提供的公共网络服务（已连接设备自动共享）',
      friendServices: '好友服务',
      friendServicesDescription: '浏览好友分享的网络服务',
      anonymousServices: '匿名服务（已废弃）', // 功能已移除
      anonymousServicesDescription: '该功能已废弃', // 功能已移除
      myServices: '我的服务',
      myServicesDescription: '管理和分享你创建的服务'
    },

    currentZone: '当前区域',
    servicesCount: '个服务',

    // 空状态消息
    empty: {
      anonymousServices: '该功能已废弃',
      anonymousServicesDesc: '匿名服务功能已移除，请使用好友服务',
      publicServices: '暂无公共服务',
      publicServicesDesc: '暂无系统服务或已连接设备共享的服务',
      friendServices: '暂无好友分享',
      friendServicesDesc: '好友还未与你分享任何服务',
      myServices: '你还没有创建任何服务',
      myServicesDesc: '点击下方按钮创建你的第一个服务'
    },

    addService: '添加服务',
    editService: '编辑服务',
    addFirstService: '添加第一个服务',
    shareService: '分享服务',
    shareServiceDesc: '选择要分享给的好友并添加分享信息',
    shareMessage: '分享信息',
    shareMessagePlaceholder: '告诉好友这个服务的用途...',
    confirmShare: '确认分享',
    requestPublic: '申请公开',
    requestPublicDesc: '申请将此服务公开给所有用户访问',
    approvalReason: '申请理由',
    approvalReasonPlaceholder: '说明为什么要公开此服务...',
    submitRequest: '提交申请',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除服务 "{name}" 吗？此操作不可恢复。',
    deleteWarning: '确定要删除服务 "{name}" 吗？此操作不可恢复。',
    connect: '连接',
    authRequired: '需要认证',
    noAuth: '无需认证',

    // ServiceCard 相关翻译
    serviceCard: {
      statusLabel: '状态',
      nodeLabel: '设备',
      edit: '编辑',
      delete: '删除',
      connect: '连接',
      details: '详情',

      // 状态标签
      status: {
        running: '运行中',
        stopped: '已停止',
        waiting: '等待中',
        error: '错误',
        unknown: '未知'
      },

      // 认证状态
      auth: {
        required: '需要认证',
        notRequired: '无需认证'
      }
    },

    categories: {
      public: '公共服务',
      publicDesc: '由管理员审核通过的公共服务',
      friend: '好友分享',
      friendDesc: '好友与你分享的服务',
      anonymous: '匿名共享',
      anonymousDesc: '匿名用户共享的服务',
      my: '我的服务',
      myDesc: '你创建和管理的服务'
    },

    types: {
      gnbIndex: '节点发现',
      gnbIndexDesc: 'GNB节点发现服务',
      music: '音乐服务',
      musicDesc: '音乐流媒体服务',
      video: '视频服务',
      videoDesc: '视频流媒体服务',
      netbridge: 'NetBridge',
      netbridgeDesc: '网络桥接服务'
    },

    form: {
      serviceName: '服务名称',
      serviceNameRequired: '请输入服务名称',
      serviceNamePlaceholder: '输入易识别的服务名称',
      serviceType: '服务类型',
      serviceTypeRequired: '请选择服务类型',
      serviceDescription: '服务描述',
      serviceDescriptionPlaceholder: '简要描述服务用途（可选）',
      serviceAddress: '服务地址',
      serviceAddressRequired: '请输入服务地址',
      targetIP: '目标IP地址',
      dnatTargetIP: 'DNAT目标IP',
      lanIP: '局域网IP地址',
      invalidIPv4: '请输入有效的IPv4地址',
      invalidAddress: '请输入有效的IP地址或域名',
      bindNode: '绑定设备',
      bindNodeRequired: '请选择要绑定的设备',
      selectNode: '选择设备',
      noNodes: '暂无可用设备',
      gatewayNode: '网关',
      provideMode: '提供方式',
      provideModes: {
        direct: '直接提供',
        dnat: 'DNAT转发',
        lan: 'Lan网提供',
        proxy: '代理转发',
        public: '公网暴露'
      },
      lanDisableReason: {
        notGateway: '该设备不是网关类型，无法使用Lan网直供',
        noLanIp: '该设备未配置Lan IP地址，无法使用Lan网直供'
      },
      publicDisableReason: '必须先启用认证才能使用公网暴露',
      associatedNode: '关联设备',
      servicePort: '服务端口',
      servicePortRequired: '请输入端口',
      servicePortInvalid: '端口范围应为1-65535',
      servicePortPlaceholder: '1-65535',
      serviceProtocol: '协议',
      serviceProtocolRequired: '请选择协议',
      authRequired: '需要认证',
      authType: '认证类型',
      authToken: '认证令牌',
      authUsername: '用户名',
      authPassword: '密码',
      publicExpose: '公网暴露',
      publicExposeWarning: '⚠️ 公网暴露需强制认证，请谨慎使用',
      shareSettings: '分享设置',
      shareToFriends: '分享给好友',
      shareToPublic: '申请公开分享',
      shareScope: '选择服务的分享范围，仅支持好友分享（需要已建立好友关系）',
      shareMode: '分享模式',
      hints: {
        directMode: '设备上直接运行的服务，使用设备虚拟IP访问',
        dnatMode: '通过DNAT转发到其他设备或设备可触达的局域网地址（非网关设备使用）',
        lanMode: '设备作为网关，直接访问Lan网中的服务（必须是网关类型且配置了Lan IP）',
        proxyMode: '通过代理服务器转发访问服务',
        publicMode: '⚠️ 高风险！公网直接访问，强烈建议使用DDNS域名而非直接IP，必须启用认证！公开访问不是MyNet的初衷'
      },
      authTypes: {
        none: '无认证',
        bearer: 'Bearer Token',
        basic: 'Basic Auth',
        password: '密码验证'
      },
      protocols: {
        http: 'HTTP',
        https: 'HTTPS',
        tcp: 'TCP',
        udp: 'UDP'
      },
      shareModes: {
        private: '私有',
        friends: '好友可见',
        public: '公开'
      }
    },

    messages: {
      createSuccess: '服务创建成功',
      updateSuccess: '服务更新成功',
      deleteSuccess: '服务删除成功',
      shareSuccess: '服务分享成功',
      approvalRequested: '公开申请已提交'
    },

    errors: {
      loadFailed: '加载服务列表失败',
      createFailed: '创建服务失败',
      updateFailed: '更新服务失败',
      deleteFailed: '删除服务失败',
      shareFailed: '分享服务失败',
      approvalFailed: '申请公开失败',
      connectFailed: '连接服务失败',
      featureDeprecated: '功能已下线',
      publicServiceDeprecated: '普通用户不能发布公共服务，公共服务仅限系统提供。已连接设备会自动共享服务，好友间可使用"好友分享"功能。',
      requiresFriendship: '分享服务需要先建立好友关系，请先添加对方为好友'
    }
  },

  user: {
    overview: '概览',
    editProfile: '编辑资料',
    security: '安全设置',
    preferences: '偏好设置',
    activity: '活动记录',

    // 基本信息
    basicInfo: '基本信息',
    userId: '用户ID',
    name: '姓名',
    email: '邮箱',
    phone: '电话',
    bio: '个人简介',
    role: '角色',
    joinDate: '加入时间',

    // 统计信息
    statistics: '统计信息',
    totalNodes: '设备总数',
    totalRoutes: '连接总数',
    totalFriends: '好友总数',
    totalLogins: '登录次数',

    // 权限
    permissions: '权限',
    noPermissions: '暂无特殊权限',

    // 表单相关
    nameRequired: '请输入姓名',
    emailRequired: '请输入邮箱',
    emailInvalid: '邮箱格式不正确',
    signature: '个性签名',
    signatureHint: '简单的个性签名或座右铭',
    nameTooLong: '姓名长度不能超过100个字符',
    phoneTooLong: '手机号长度不能超过20个字符',
    bioHint: '简单介绍一下自己',
    saveChanges: '保存更改',
    cancel: '取消',

    // 头像
    changeAvatar: '更换头像',
    avatarUrl: '头像链接',
    avatarUrlHint: '输入头像图片的URL地址',
    uploadAvatar: '上传头像文件',
    avatarUpdated: '头像更新成功',
    avatarUpdateFailed: '头像更新失败',
    avatarSizeLimit: '头像文件大小不能超过1MB',
    avatarTypeLimit: '请选择图片文件（支持jpeg、png、jpg、gif格式）',

    // 密码安全
    passwordSecurity: '密码安全',
    changePassword: '修改密码',
    changePasswordDesc: '定期更换密码以保护账户安全',
    change: '修改',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    currentPasswordRequired: '请输入当前密码',
    newPasswordRequired: '请输入新密码',
    passwordMinLength: '密码长度至少8位',
    confirmPasswordRequired: '请确认新密码',
    passwordMismatch: '两次输入的密码不一致',
    lastPasswordChange: '上次修改密码',
    never: '从未',
    passwordChanged: '密码修改成功',
    passwordChangeFailed: '密码修改失败',

    // 两步验证
    twoFactorAuth: '两步验证',
    enable2FA: '启用两步验证',
    twoFactorAuthDesc: '为账户添加额外的安全保护',
    backupCodes: '备用代码',
    backupCodesDesc: '生成备用验证码以备不时之需',
    generateCodes: '生成代码',
    '2faEnabled': '两步验证已启用',
    '2faDisabled': '两步验证已禁用',
    '2faUpdateFailed': '两步验证设置失败',

    // 会话管理
    activeSessions: '活跃会话',
    currentSession: '当前会话',
    activeSession: '活跃会话',
    revokeSession: '撤销会话',
    sessionRevoked: '会话已撤销',
    sessionRevokeFailed: '撤销会话失败',

    // 外观设置
    appearance: '外观设置',
    theme: '主题',
    themeDesc: '选择你喜欢的界面主题',
    themeAuto: '跟随系统',
    themeLight: '浅色主题',
    themeDark: '深色主题',
    language: '语言',
    languageDesc: '选择界面显示语言',

    // 通知设置
    notifications: '通知设置',
    emailNotifications: '邮件通知',
    emailNotificationsDesc: '接收重要事件的邮件通知',
    pushNotifications: '推送通知',
    pushNotificationsDesc: '接收浏览器推送通知',
    systemAlerts: '系统警报',
    systemAlertsDesc: '接收系统状态和安全警报',

    // 活动记录
    recentActivity: '最近活动',
    noActivity: '暂无活动记录',

    // 消息提示
    profileUpdated: '资料更新成功',
    profileUpdateFailed: '资料更新失败',
    preferencesUpdated: '偏好设置已更新',
    preferencesUpdateFailed: '偏好设置更新失败',
    preferencesReset: '偏好设置已重置为默认值',
    resetToDefault: '重置为默认',

    // 验证消息
    validation: {
      currentPasswordRequired: '请输入当前密码',
      newPasswordRequired: '请输入新密码',
      passwordMismatch: '两次输入的密码不一致',
      passwordTooShort: '密码长度至少8位',
      fileTooLarge: '文件大小超过限制',
      invalidFileType: '文件类型不支持'
    }
  },

  // VPN配置相关翻译
  vpn: {
    config: {
      // 基础配置
      gnbVirtualNetwork: 'GNB虚拟网络',
      wireGuard: 'WireGuard',
      openVPN: 'OpenVPN',
      defaultVersion: '默认版本 (Latest)',
      basicConfig: '基本配置',
      basicConfigDesc: '必需的基础参数配置',
      expertConfig: '专家配置',
      wireGuardBasicDesc: '必需的WireGuard基础参数',

      // VPN配置参数翻译
      nodeId: '设备ID',
      networkInterface: '网络接口名称',
      listenPortConfig: '监听端口',
      listenPort: '监听端口',
      mtu: 'MTU (最大传输单元)',
      multiSocket: '多路复用',
      directForwarding: '直接转发',
      unifiedForwarding: '统一转发',
      standardForwarding: '标准中继转发',
      addressSecure: '地址安全',
      ipv4Only: '仅IPv4',
      ipv6Only: '仅IPv6',
      keepalive: '保活间隔(秒)',
      forward: '转发功能',
      daemon: '守护进程',
      compression: '压缩',
      compressionLevel: '压缩等级',
      memory: '内存刻度',
      esArgs: 'ES参数',

      // WireGuard参数
      interfaceAddress: '接口地址',
      multiConnection: '多连接支持',
      daemonMode: '守护进程模式',
      dnsServers: 'DNS服务器',
      persistentKeepalive: '持续保活(秒)',
      allowedIPs: '允许的IP',
      endpoint: '端点地址',
      fwmark: 'FwMark防火墙标记',
      routeTable: '路由表',
      saveConfigFile: '保存配置',
      preUpScript: '启动前脚本',
      postUpScript: '启动后脚本',
      preDownScript: '关闭前脚本',
      postDownScript: '关闭后脚本',
      presharedKey: '预共享密钥',
      roaming: '漫游支持',
      handshakeTimeout: '握手超时(秒)'
    }
  },
  tips: {
    welcome: {
      title: '👋 欢迎来到 MyNet',
      content: '<p>MyNet 帮助你快速组建安全的虚拟网络。</p><p>接下来我们会引导你完成基础设置，随时可以跳过。</p>'
    },
    createIpPool: {
      title: '💡 创建 IP 资源池',
      content: '<p>点击「创建 IP 池」开始。IP 池为你的设备分配虚拟地址。</p>'
    },
    addFirstDevice: {
      title: '📱 添加第一个设备',
      content: '<p>点击「添加设备」将你的第一台设备加入网络。</p>'
    },
    choosePath: {
      title: '🎯 选择你的学习路径'
    },
    addSecondDevice: {
      title: '📱 添加第二个设备',
      content: '<p>再添加一个设备，体验设备间自动连接。</p>'
    },
    autoConnection: {
      title: '✨ 自动连接已建立'
    },
    inviterFriend: {
      title: '👥 你已经和邀请人成为好友'
    },
    inviteFriend: {
      title: '📨 邀请好友加入'
    },
    friendDevices: {
      title: '📱 好友的设备',
      content: '<p>浏览好友的设备列表，选择要连接的节点。</p>'
    },
    createRoute: {
      title: '➕ 添加新连接'
    },
    crossUserConnection: {
      title: '🎉 跨用户连接已建立'
    },
    connectionManagement: {
      title: '🔗 连接管理'
    },
    onboardingComplete: {
      title: '🎊 完成引导！'
    },
    dashboardOverview: {
      title: '📊 Dashboard 概览',
      content: '<p>仪表板展示网络概况：节点状态、活跃连接和资源使用情况，可从侧边栏随时访问各功能模块。</p>'
    },
    ippoolManagement: {
      title: '🌐 IP 资源池管理',
      content: '<p>IP 资源池为设备分配虚拟 IP 地址。建议使用私有网段（如 <code>10.0.0.0/24</code>），可为不同用途创建多个池，避免与本地网络冲突。</p>'
    },
    nodeManagement: {
      title: '📱 设备管理',
      content: '<p>设备（节点）是网络的基本单元。每个设备需绑定 IP 池，支持 GNB/WireGuard/OpenVPN 等协议，可在详情页下载配置文件。</p>'
    },
    routeManagement: {
      title: '🔗 连接管理',
      content: '<p>路由定义了设备间的连接关系。同一用户的设备自动连接，跨用户需发送请求并等待对方确认。</p>'
    },
    socialManagement: {
      title: '👥 好友管理',
      content: '<p>通过好友系统添加其他用户，互为好友后才能建立跨用户连接。可搜索用户名或邮箱发送好友请求。</p>'
    },
    connectionDetails: {
      title: '🔗 连接详解',
      content: '<p>连接详情展示两端节点、网络参数和实时状态。通过拓扑图全局查看网络结构，排查连接问题。</p>'
    },
    zoneManagement: {
      title: '🌍 时空（Zone）管理',
      content: '<p>Zone 实现资源隔离，每个 Zone 有独立的 IP 池、节点和连接。如需多环境管理可向管理员申请新的 Zone。</p>'
    },
    settingsCenter: {
      title: '⚙️ 设置中心',
      content: '<p>在设置中管理个人资料、通知偏好和安全选项。支持切换主题、语言和时区。</p>'
    },
    actions: {
      gotIt: '知道了',
      skip: '跳过引导',
      startSetup: '开始设置',
      addDevice: '添加设备',
      addAnotherDevice: '再添加一个设备',
      exploreSelf: '自己探索',
      browseFriendDevices: '浏览好友设备',
      createConnection: '创建连接',
      manageConnections: '管理连接',
      startUsing: '开始使用',
      deviceExperience: '设备体验路线',
      friendConnection: '好友连接路线'
    }
  }
}