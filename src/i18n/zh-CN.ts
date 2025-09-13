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
    update: '更新',
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
    reset: '重置',
    back: '返回',
    previous: '上一步',
    copy: '复制',
    copiedToClipboard: '已复制到剪贴板',
    copyFailed: '复制失败',
    unknown: '未知',
    unknownUser: '未知用户',
    notSet: '未设置',
    noDescription: '无描述',
    enabled: '启用',
    disabled: '禁用',
    online: '在线',
    offline: '离线',
    cores: '核',
    pending: '待连接',
    maintenance: '维护模式',
    unconfigured: '未完成配置',
    notAllocated: '未分配'
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
    registerButton: '注册',
    sendResetLink: '发送重置链接',
    resetPasswordButton: '重置密码',
    verifyEmail: '验证邮箱',
    resendCode: '重新发送验证码',
    resendCodeCountdown: '重新发送 ({seconds}s)',
    verificationCode: '验证码',
    agreeTerms: '我同意服务条款',
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
    invitationPlaceholder: '请输入邀请码（可选）',
    invitationRequired: '请输入邀请码',
    
    // 账号激活相关
    accountActivation: '账号激活',
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
    ipAddress: 'IP地址',
    port: '端口',
    config: '节点配置',
    configTitle: '节点配置',
    saveConfig: '保存配置',
    saveConfigSuccess: '节点配置保存成功',
    saveConfigFailed: '保存节点配置失败',
    loadConfigFailed: '加载节点配置失败',
    exportConfig: '导出配置',
    resetConfig: '重置',
    versionSelect: '版本选择',
    configMode: '配置模式',
    networkConfig: '网络配置',
    refreshData: '刷新数据',
    deleteNode: '删除节点',
    deleteConfirm: '确定要删除节点 "{name}" 吗？',
    dataRefreshed: '数据已刷新',
    refreshFailed: '刷新数据失败',
    deleteSuccess: '节点删除成功',
    deleteFailed: '删除节点失败',
    loadIndexServersFailed: '加载索引服务器失败',
    loadNetworkConfigFailed: '加载网络配置失败',
    loadDeviceInfoFailed: '加载设备信息失败',
    loadRoutesCountFailed: '加载路由数量失败',
    
    // 节点状态
    status: {
      unconfigured: '未完成配置',
      disabled: '已禁用',
      enabled: '已启用',
      online: '在线',
      offline: '离线',
      maintenance: '维护模式',
      active: '在线',
      inactive: '离线',
      pending: '待连接'
    },
    
    // 节点信息字段
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
    }
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
    zoneSharing: '区域分享',
    zoneServices: '区域服务',
    services: '服务管理',
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
      error: '错误',
      unknown: '未知'
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
      lastUpdate: '最后更新',
      unknownUser: '未知用户',
      viewDetails: '查看详情',
      editRoute: '编辑路由',
      disconnect: '断开连接',
      relayMode: '中继模式',
      priority: '优先级',
      vpnType: 'VPN类型',
      targetUser: '目标用户',
      sourceNode: '源节点',
      targetNode: '目标节点',
      unknownType: '未知类型',
      unknownMode: '未知模式'
    },

    // 中继模式
    relayModes: {
      direct: '直连',
      relay: '中继',
      p2p: '点对点',
      hybrid: '混合模式'
    },
    
    // 待处理连接
    pendingConnections: {
      incoming: '接收请求',
      outgoing: '发送请求',
      noIncomingConnections: '暂无接收的连接请求',
      noOutgoingConnections: '暂无发送的连接请求',
      connectionType: '连接类型',
      vpnType: 'VPN类型',
      requestedAt: '请求时间',
      approve: '批准',
      reject: '拒绝'
    },
    
    // 好友节点
    friendNodes: {
      searchPlaceholder: '搜索好友节点...',
      statusFilter: '状态过滤',
      noNodes: '暂无好友节点',
      noNodesDescription: '您还没有任何好友的节点信息',
      noSearchResults: '未找到匹配节点',
      ipAddress: 'IP地址',
      port: '端口',
      nodeType: '节点类型',
      vpnType: 'VPN类型',
      endpoint: '端点',
      zone: '区域',
      lastSeen: '最后在线',
      createdAt: '创建时间',
      noDescription: '暂无描述',
      totalFriends: '好友总数',
      totalNodes: '节点总数',
      onlineNodes: '在线节点',
      availableNodes: '可用节点',
      viewFriend: '查看好友',
      connect: '连接',
      pending: '待处理',
      connected: '已连接',
      offline: '离线',
      selectMyNode: '选择我的节点',
      selectMyNodeHint: '请选择要用于连接的节点',
      noAvailableNodes: '没有可用的节点',
      loadNodesError: '加载节点失败',
      myNode: '我的节点',
      confirmConnection: '确认连接',
      confirmConnectionHint: '请确认连接信息并填写请求消息',
      requestMessage: '请求消息',
      messagePlaceholder: '请描述您的连接需求和使用场景...',
      messageRequired: '请输入请求消息',
      messageMinLength: '消息至少需要10个字符',
      messageMaxLength: '消息不能超过500个字符',
      sendRequest: '发送请求',
      incompleteSelection: '选择信息不完整',
      connectionError: '连接失败',
      defaultMessage: '我希望通过我的节点 {myNodeName} 连接到您的节点 {friendNodeName}，用于网络通信。谢谢！',
      goToSocial: '前往社交网络'
    },

    // 基于节点的路由管理
    nodeBased: {
      selectNode: '选择我的节点',
      selectNodeDescription: '点击您的节点卡片查看该节点的路由信息',
      viewRoutes: '查看路由',
      backToNodes: '返回节点列表',
      noNodes: '暂无节点',
      noNodesDescription: '您还没有创建任何节点，请先创建节点',
      noDescription: '暂无描述',
      nodeId: '节点ID',
      totalRoutes: '路由总数',
      totalNodes: '节点总数',
      routeCount: '路由数',
      nodeType: '节点类型',
      vpnType: 'VPN类型',
      status: '状态',
      unknown: '未知',
      routesList: '路由列表',
      nodesList: '节点列表',
      noRoutesForNode: '该节点暂无路由',
      noNodesForNode: '该节点暂无节点',
      statusLabels: {
        active: '活跃',
        inactive: '非活跃',
        pending: '待配置',
        unknown: '未知'
      }
    },

    // 节点路由显示
    nodeRoutes: {
      nodeId: '节点ID',
      totalRoutes: '路由总数',
      noDescription: '暂无描述',
      searchPlaceholder: '搜索路由信息...',
      refresh: '刷新',
      noRoutes: '该节点暂无路由',
      noSearchResults: '未找到匹配的路由',
      tryDifferentSearch: '请尝试其他搜索条件',
      noRoutesForNode: '该节点还没有建立任何路由连接',
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
        outgoing: '出站路由',
        incoming: '入站路由'
      }
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
      createRoute: '创建路由',
      connect: '连接',
      disconnect: '断开连接',
      approve: '批准',
      reject: '拒绝',
      viewDetails: '查看详情'
    },

    // 创建路由流程
    create: {
      // 步骤名称
      steps: {
        selectFriend: '选择好友',
        selectFriendNode: '选择好友节点',
        selectMyNode: '选择我的节点',
        submitRequest: '提交申请'
      },
      
      // 第一步 - 选择好友
      step1: {
        title: '创建路由 - 选择好友',
        subtitle: '选择要建立连接的好友',
        selectFriend: '选择好友',
        searchFriends: '搜索好友...',
        noFriends: '暂无好友',
        friendInfo: '节点: {nodes} | 状态: {status}',
        availableNodes: '可用节点',
        totalNodes: '总节点数',
        nextStep: '下一步',
        pleaseSelectFriend: '请选择一个好友'
      },
      
      // 第二步 - 选择好友节点
      step2: {
        title: '创建路由 - 选择好友节点',
        subtitle: '选择 {friendName} 的节点进行连接',
        selectedFriend: '已选择的好友',
        changeFriend: '更换好友',
        selectFriendNode: '选择好友节点',
        loadingNodes: '加载节点中...',
        noNodes: '该好友暂无可用节点',
        unknownLocation: '未知位置',
        nodeStatus: '状态',
        connections: '连接数',
        latency: '延迟',
        connectionsFull: '连接数已满',
        nextStep: '下一步',
        pleaseSelectNode: '请选择一个节点',
        nodeCannotConnect: '该节点暂时无法连接',
        fetchNodesError: '获取好友节点失败',
        noFriendSelected: '未选择好友'
      },
      
      // 第三步 - 选择我的节点
      step3: {
        title: '创建路由 - 选择我的节点',
        subtitle: '选择您的节点进行连接',
        selectionSummary: '选择总结',
        selectedFriend: '选择的好友',
        selectedFriendNode: '选择的好友节点',
        selectMyNode: '选择我的节点',
        searchNodes: '搜索节点...',
        filterByStatus: '按状态筛选',
        allStatus: '全部状态',
        onlineOnly: '仅在线',
        availableOnly: '仅可用',
        connectedOnly: '已连接',
        pendingOnly: '待处理',
        loadingNodes: '加载节点中...',
        noAvailableNodes: '暂无可用节点',
        createNodeHint: '您可以先创建节点',
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
        pleaseSelectNode: '请选择一个节点',
        nodeAlreadyConnected: '该节点已与目标节点建立连接',
        requestAlreadySent: '已向该节点发送连接申请',
        requestAlreadyReceived: '已收到该节点的连接申请',
        nodeCannotConnect: '该节点暂时无法连接',
        cannotProceedWithConnection: '该节点存在连接关系，无法继续',
        fetchNodesError: '获取节点失败',
        noFriendSelected: '未选择好友',
        noFriendNodeSelected: '未选择好友节点',
        
        // 连接状态
        connectionStatus: {
          connected: '已连接',
          pendingSent: '申请已发送',
          pendingReceived: '申请已接收',
          rejected: '申请被拒绝',
          none: '无连接',
          unknown: '状态未知'
        }
      },
      
      // 第四步 - 提交申请
      step4: {
        title: '创建路由 - 提交申请',
        subtitle: '填写连接申请信息',
        selectionSummary: '选择总结',
        targetFriend: '目标好友',
        targetNode: '目标节点',
        sourceNode: '源节点',
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
        viewRoutes: '查看路由',
        createAnother: '创建另一个',
        defaultMessage: '您好 {friendName}，我希望将我的节点 {myNode} 与您的节点 {friendNode} 建立连接，用于网络通信。',
        
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
      requestSubmitted: '路由申请已提交',
      submitError: '提交申请失败'
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
    fetchAllFriendNodesError: '获取所有好友节点失败',
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
    invitationDeleteError: '删除邀请码失败',
    
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
    heartbeat: '心跳'
  },
  node: {
    status: {
      online: '在线',
      offline: '离线',
      connecting: '连接中',
      error: '错误'
    }
  },
  zoneServices: {
    subtitle: '区域服务分享和管理',
    currentZone: '当前区域',
    servicesCount: '个服务',
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
    deleteWarning: '确定要删除服务 "{name}" 吗？此操作不可恢复。',
    connect: '连接',
    authRequired: '需要认证',
    noAuth: '无需认证',
    
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
      gnbIndex: 'GNB索引',
      gnbIndexDesc: 'GNB节点索引服务',
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
      serviceType: '服务类型',
      serviceTypeRequired: '请选择服务类型',
      serviceDescription: '服务描述',
      serviceAddress: '服务地址',
      serviceAddressRequired: '请输入服务地址',
      associatedNode: '关联节点',
      servicePort: '端口',
      servicePortRequired: '请输入端口',
      servicePortInvalid: '端口范围应为1-65535',
      serviceProtocol: '协议',
      serviceProtocolRequired: '请选择协议',
      authRequired: '需要认证',
      authType: '认证类型',
      authToken: '认证令牌',
      authUsername: '用户名',
      authPassword: '密码',
      shareSettings: '分享设置',
      shareMode: '分享模式',
      authTypes: {
        none: '无认证',
        bearer: 'Bearer Token',
        basic: 'Basic Auth'
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
    
    empty: {
      publicServices: '暂无公共服务',
      publicServicesDesc: '管理员还未审核通过任何公共服务',
      friendServices: '暂无好友分享',
      friendServicesDesc: '好友还未与你分享任何服务',
      anonymousServices: '暂无匿名共享',
      anonymousServicesDesc: '暂时没有匿名用户共享的服务',
      myServices: '你还没有创建任何服务',
      myServicesDesc: '点击下方按钮创建你的第一个服务'
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
      approvalFailed: '申请公开失败'
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
    totalNodes: '节点总数',
    totalRoutes: '路由总数',
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
    resetToDefault: '重置为默认'
  }
}