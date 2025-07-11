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
    navigation: '导航',
    information: '基本信息',
    close: '关闭',
    usage: '使用情况',
    refresh: '刷新',
    apply: '应用',
    reset: '重置'
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
    verificationSuccessSubtitle: '您的邮箱已验证，现在可以登录了',
    namePlaceholder: '请输入您的姓名',
    emailPlaceholder: '请输入您的邮箱',
    passwordPlaceholder: '请输入您的密码',
    confirmPasswordPlaceholder: '请再次输入您的密码',
    invitationPlaceholder: '请输入邀请码（可选）',
    invitationRequired: '请输入邀请码'
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
    subtitle: '网络路由管理和配置',
    title: '路由管理',
    name: '路由名称',
    destination: '目标地址',
    gateway: '网关',
    
    // 概览统计
    overview: {
      activeRoutes: '活跃路由',
      pendingConnections: '待处理连接',
      connectedNodes: '已连接节点',
      totalBandwidth: '总带宽'
    },
    
    // 标签页
    tabs: {
      activeRoutes: '活跃路由',
      pendingConnections: '待处理连接',
      friendNodes: '好友节点',
      configuration: '配置管理'
    },
    
    // 路由状态
    status: {
      active: '活跃',
      inactive: '非活跃',
      connecting: '连接中',
      error: '错误'
    },
    
    // 连接类型
    connectionType: {
      direct: '直连',
      relay: '中继'
    },
    
    // 节点状态
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
    
    // 活跃路由
    activeRoutes: {
      searchPlaceholder: '搜索路由...',
      statusFilter: '状态过滤',
      noRoutes: '暂无活跃路由',
      noSearchResults: '未找到匹配路由',
      bandwidth: '带宽',
      latency: '延迟',
      packetLoss: '丢包率',
      connectionType: '连接类型',
      lastActive: '最后活跃',
      unknownUser: '未知用户',
      viewDetails: '查看详情',
      disconnect: '断开连接'
    },
    
    // 待处理连接
    pendingConnections: {
      incoming: '接收请求',
      outgoing: '发送请求',
      noIncomingConnections: '暂无接收的连接请求',
      noOutgoingConnections: '暂无发送的连接请求',
      connectionType: '连接类型',
      requestedAt: '请求时间',
      approve: '批准',
      reject: '拒绝'
    },
    
    // 好友节点
    friendNodes: {
      searchPlaceholder: '搜索好友节点...',
      statusFilter: '状态过滤',
      noNodes: '暂无好友节点',
      noSearchResults: '未找到匹配节点',
      ipAddress: 'IP地址',
      port: '端口',
      nodeType: '节点类型',
      zone: '区域',
      lastSeen: '最后在线',
      viewFriend: '查看好友',
      connect: '连接',
      pending: '待处理',
      connected: '已连接'
    },
    
    // 配置管理
    config: {
      description: '路由配置文件包含了所有必要的网络路由信息，可以下载并应用到您的网络设备。',
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
      routeEntries: '路由条目',
      nodeId: '节点ID',
      ipAddress: 'IP地址',
      mask: '子网掩码',
      gateway: '网关',
      metric: '跃点数',
      actions: '操作',
      entryDetails: '条目详情'
    },
    
    // 路由详情
    details: {
      basicInfo: '基本信息',
      routeId: '路由ID',
      status: '状态',
      connectionType: '连接类型',
      createdAt: '创建时间',
      lastActive: '最后活跃',
      nodeInfo: '节点信息',
      sourceNode: '源节点',
      targetNode: '目标节点',
      nodeName: '节点名称',
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
      refreshRoutes: '刷新路由',
      connect: '连接',
      disconnect: '断开连接',
      approve: '批准',
      reject: '拒绝',
      viewDetails: '查看详情'
    },
    
    // 对话框
    dialogs: {
      routeDetails: {
        title: '路由详情'
      },
      connectNode: {
        title: '连接节点',
        message: '您要连接到 {friendName} 的节点 {nodeName}，请输入连接说明：',
        messagePlaceholder: '请输入连接说明（可选）...'
      }
    },
    
    // 错误消息
    fetchOverviewError: '获取路由概览失败',
    fetchActiveRoutesError: '获取活跃路由失败',
    fetchPendingConnectionsError: '获取待处理连接失败',
    fetchFriendNodesError: '获取好友节点失败',
    fetchConfigError: '获取配置失败',
    fetchRouteDetailsError: '获取路由详情失败',
    connectionRequestSent: '连接请求已发送',
    connectionRequestError: '发送连接请求失败',
    connectionApproved: '连接已批准',
    connectionApproveError: '批准连接失败',
    connectionRejected: '连接已拒绝',
    connectionRejectError: '拒绝连接失败',
    routeDisconnected: '路由已断开',
    routeDisconnectError: '断开路由失败',
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
      totalNodes: '总节点数',
      activeNodes: '活跃节点',
      routes: '路由数',
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
    
    // 新增的错误和成功消息
    noFriendNodes: '该好友暂无节点',
    fetchFriendNodesError: '获取好友节点失败'
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
    availablePools: '可用IP池',
    allocatedPools: '已分配IP池',
    totalIPs: '总IP地址数',
    availableIPs: '可用IP地址',
    allocatedIPs: '已分配IP地址',
    usageRate: '使用率',
    // 表格字段
    poolName: '池名称',
    network: '网络段',
    ipRange: 'IP范围',
    totalCount: '总数',
    totalIPPoolsCount: '共 {count} 个IP池',
    usedCount: '已用',
    availableCount: '可用',
    status: '状态',
    createdAt: '创建时间',
    actions: '操作',
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
    nodeLabel: '节点',
    nodeHint: '选择要分配IP的节点',
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
    unnamedPool: '未命名池',
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
    noPools: '暂无IP池',
    noPoolsHint: '点击"创建IP池"按钮开始创建第一个IP池',
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
    heartbeat: '心跳'
  }
}