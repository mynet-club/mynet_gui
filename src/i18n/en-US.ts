export default {
  app: {
    name: 'MyNet',
    tagline: 'Self-sovereign Private Networking'
  },
  common: {
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    nodes: 'Nodes',
    routes: 'Routes',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    connected: 'Connected',
    disconnected: 'Disconnected',
    profile: 'Profile',
    notifications: 'Notifications',
    active: 'Active',
    inactive: 'Inactive',
    comingSoon: 'Coming Soon',
    navigation: 'Navigation',
    information: 'Information',
    close: 'Close',
    usage: 'Usage',
    refresh: 'Refresh',
    apply: 'Apply',
    reset: 'Reset',
    back: 'Back',
    previous: 'Previous',
    copy: 'Copy',
    copiedToClipboard: 'Copied to clipboard',
    copyFailed: 'Copy failed',
    create: 'Create',
    update: 'Update',
    enter: 'Enter',
    yes: 'Yes',
    no: 'No',
    status: 'Status',
    searchPlaceholder: 'Search...',
    unknown: 'Unknown',
    unknownUser: 'Unknown User',
    notSet: 'Not Set',
    noDescription: 'No Description',
    enabled: 'Enabled',
    disabled: 'Disabled',
    online: 'Online',
    offline: 'Offline',
    cores: 'cores',
    pending: 'Pending',
    maintenance: 'Maintenance',
    unconfigured: 'Unconfigured',
    notAllocated: 'Not Allocated',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    confirm: 'Confirm',
    required: 'Required',
    optional: 'Optional',
    formReset: 'Form has been reset',
    allChangesReset: 'All changes have been reset',
    noChangesToSave: 'No changes to save',
    send: 'Send',
    view: 'View',
    manage: 'Manage',
    browse: 'Browse',
    total: 'Total',
    available: 'Available',
    debugInfo: 'Debug Information',
    viewDetails: 'View Details',
    noData: '—',
    noIP: 'No IP',
    invalidDate: 'Invalid Date',
    invalidTime: 'Invalid Time',
    justNow: 'just now',
    minutesAgo: '{n} minutes ago',
    hoursAgo: '{n} hours ago',
    daysAgo: '{n} days ago',
    featureInDevelopment: 'Feature in development',

    // Config Bundle related
    configBundle: {
      title: 'Config Bundle',
      loading: 'Loading config bundle...',
      loadSuccess: 'Config bundle loaded successfully',
      loadFailed: 'Failed to load config bundle',
      warnings: 'Configuration Warnings',
      missingPeerKey: 'Missing peer node key',
      configError: 'Configuration error',
      networkIssue: 'Network issue',
      invalidBundle: 'Invalid config bundle data'
    },

    // API version compatibility
    version: {
      title: 'API Version',
      checking: 'Checking version compatibility...',
      compatible: 'Version compatible',
      incompatible: 'Version incompatible',
      upgradeRequired: 'Upgrade required',
      backApiTooOld: 'Backend API version too old',
      ctlApiTooOld: 'Control center API version too old',
      clientNeedsUpgrade: 'Client needs upgrade',
      versionCheckFailed: 'Version check failed',
      usingDefaultMode: 'Using default compatible mode'
    },

    // VPN interface monitoring
    vpnInterface: {
      title: 'VPN Interface',
      status: 'Status',
      type: 'Type',
      ipAddress: 'IP Address',
      rxBytes: 'RX Bytes',
      txBytes: 'TX Bytes',
      up: 'Up',
      down: 'Down',
      connecting: 'Connecting'
    }
  },
  errors: {
    loadFailed: 'Load failed',
    removeFailed: 'Remove failed',
    acceptFailed: 'Accept failed',
    rejectFailed: 'Reject failed'
  },
  notifications: {
    empty: 'No notifications',
    markAllRead: 'Mark all as read',
    markAsRead: 'Mark as read',
    markedAsRead: 'Marked as read',
    markAsReadFailed: 'Failed to mark as read',
    allMarkedAsRead: 'All marked as read',
    markAllAsReadFailed: 'Failed to mark all as read',
    deleted: 'Notification deleted',
    deleteFailed: 'Failed to delete notification',
    clearRead: 'Clear read',
    clearReadConfirm: 'Are you sure you want to clear all read notifications?',
    readCleared: 'Read notifications cleared',
    clearReadFailed: 'Failed to clear read notifications',
    filter: 'Filter',
    all: 'All',
    unreadOnly: 'Unread only'
  },
  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address'
  },
  welcome: {
    title: 'Welcome to MyNet',
    subtitle: 'Self-sovereign Networking Platform'
  },
  settings: {
    language: 'Language Settings',
    theme: 'Theme Settings',
    languageChanged: 'Language changed to {locale}',
    languageChangeFailed: 'Failed to change language',
    themeChanged: 'Theme changed to {theme}',
    themeChangeFailed: 'Failed to change theme',
    themes: {
      light: 'Light Theme',
      dark: 'Dark Theme',
      auto: 'Auto Theme'
    }
  },
  auth: {
    hero: {
      point1: 'Spin up your network in minutes',
      point2: 'End-to-end encrypted, data stays yours',
      point3: 'Multi-node topology, freely connected'
    },
    login: 'Login',
    register: 'Register',
    loginTitle: 'Sign in to MyNet',
    loginSubtitle: 'Secure and stable network connection platform',
    registerTitle: 'Create your MyNet account',
    registerSubtitle: 'Secure and stable network connection platform',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordSubtitle: 'Please enter your email address',
    resetPasswordTitle: 'Reset Password',
    resetPasswordSubtitle: 'Please set your new password',
    emailVerificationTitle: 'Email Verification',
    emailVerificationSubtitle: 'Please enter the verification code',
    resetVerificationSubtitle: 'We have sent a 6-digit verification code to {email}',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginButton: 'Sign in to MyNet',
    registerButton: 'Create account',
    sendResetLink: 'Send Reset Link',
    resetPasswordButton: 'Reset Password',
    verifyEmail: 'Verify Email',
    resendCode: 'Resend Code',
    resendCodeCountdown: 'Resend ({seconds}s)',
    resendEmail: 'Resend Email',
    verificationCode: 'Verification Code',
    agreeTerms: 'I agree to the terms of service',
    ageVerification: 'I confirm that I am 14 years or older and eligible to access network services',
    minorProtectionTitle: 'Minor Protection',
    minorProtectionMessage: 'this platform only allows users aged 14 and above to access. According to relevant laws and regulations, we need to confirm your age eligibility. If you are under 14, please use network services under the supervision of a guardian.',
    noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    rememberPassword: 'Remember your password?',
    backToLogin: 'Back to Login',
    backToForgotPassword: 'Back to Forgot Password',
    loginLink: 'Sign In',
    registerLink: 'Sign Up',
    continueToLogin: 'Continue to Login',
    didntReceiveCode: "Didn't receive the code?",
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    confirmPasswordRequired: 'Please confirm your password',
    nameRequired: 'Name is required',
    emailInvalid: 'Please enter a valid email address',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    verificationCodeRequired: 'Verification code is required',
    verificationCodeInvalid: 'Invalid verification code format',
    loginFailed: 'Login failed. Please check your credentials',
    registrationSuccessful: 'Registration successful! Please check your email for verification',
    passwordResetSent: 'Password reset link sent to your email!',
    passwordResetSuccess: 'Password reset successful! Redirecting to login page...',
    passwordResetFailed: 'Password reset failed',
    emailVerified: 'Email verified successfully!',
    verificationCodeSent: 'Verification code sent!',
    verificationFailed: 'Verification failed',
    resendCodeFailed: 'Failed to resend verification code',
    sendResetCodeFailed: 'Failed to send reset code',
    resendCooldown: 'Resend available in {seconds} seconds',
    verificationSuccess: 'Verification Successful',
    verificationSuccessSubtitle: 'Your email has been verified. You can now sign in',
    namePlaceholder: 'Please enter your name',
    emailPlaceholder: 'Please enter your email',
    passwordPlaceholder: 'Please enter your password',
    newPasswordPlaceholder: 'Please enter new password',
    confirmPasswordPlaceholder: 'Please confirm your password',
    verificationCodePlaceholder: 'Please enter 6-digit code',
    inviteCodePlaceholder: 'Please enter the invite code',
    noInviteCode: "Don't have an invite code?",
    inviteCodeHelpTitle: 'Get an invite code',
    inviteCodeHelpMessage: 'MyNet gates registration with invite codes. Join our community to get one:',
    joinCommunity: 'Join Community',
    telegramCommunity: 'Telegram Community',
    discordCommunity: 'Discord Community',
    visitVillage: 'Visit Community Page',
    communityLinks: 'Community Links',

    // Account activation related
    accountActivation: 'Account Activation',
    accountNeedsActivation: 'Account Needs Activation',
    accountNeedsActivationMessage: 'Your account has not been activated yet. Please check the activation email in your mailbox.',
    activationEmailExpired: 'Activation Email Expired',
    activationEmailExpiredMessage: 'Your activation email has expired. A new activation email needs to be resent.',
    goToEmailCheck: 'Check Email',
    resendActivationEmail: 'Resend Activation Email',
    gotoActivationPage: 'Go to Activation Page',
    activationEmailResent: 'Activation email has been resent, please check your mailbox',
    resendActivationFailed: 'Failed to resend activation email, please try again later',
    activationInstruction: 'Please select activation method',
    useCode: 'Use Verification Code',
    checkEmail: 'Check Email',
    activationCode: 'Activation Code',
    activate: 'Activate',
    activating: 'Activating...',
    activationSuccess: 'Activation Successful',
    activationFailed: 'Activation Failed',
    accountActivated: 'Your account has been successfully activated!',
    alreadyActivated: 'Account Already Activated',
    accountAlreadyActive: 'Your account is already active',
    invalidActivationLink: 'Invalid or expired activation link',
    activationError: 'Error occurred during activation',
    checkEmailInstruction: 'We have sent an activation link to your email',
    checkEmailForReset: 'Please check your email for the password reset link',
    enterActivationCode: 'Enter Activation Code',
    enterCodeInstruction: 'Please enter the 6-digit activation code you received',
    codeRequired: 'Please enter verification code',
    codeLength: 'Verification code must be 6 digits',
    codeResent: 'Verification code has been resent',
    emailResent: 'Email has been resent',
    resendFailed: 'Resend failed',
    goToLogin: 'Go to Login',
    backToRegister: 'Back to Register',
    missingParameters: 'Missing required parameters',
    registrationComplete: 'Registration complete! Please login to your account',

    // Password reset related
    resetPassword: 'Reset Password',
    resetPasswordInstruction: 'Please set your new password',
    verifyToken: 'Verify Token',
    validatingToken: 'Validating token...',
    tokenValid: 'Token validation successful',
    tokenInvalid: 'Invalid or expired token',
    tokenValidationFailed: 'Token validation failed',
    newPassword: 'New Password',
    passwordStrength: 'Password Strength',
    selectMethod: 'Select Method',
    resetMethodInstruction: 'Please select the method to reset your password',
    resetCode: 'Reset Code',
    verify: 'Verify',
    enterEmail: 'Enter Email',
    sendResetCode: 'Send Reset Code',
    requestNewReset: 'Request New Reset Link',
    resetLinkSent: 'Reset link sent',
    resetCodeSent: 'Reset code sent',
    requestFailed: 'Request failed',
    invalidCode: 'Invalid verification code',
    resetFailed: 'Reset failed',
    sendFailed: 'Send failed',
    send: 'Send',

    // Password strength levels
    strength: {
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong'
    },

    // Additional fields
    confirmNewPassword: 'Confirm New Password',
    passwordWeak: 'Weak',
    passwordFair: 'Fair',
    passwordGood: 'Good',
    passwordStrong: 'Strong'
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Network System Overview',
    connected: 'Connected',
    disconnected: 'Disconnected',
    stats: {
      totalNodes: 'Total Nodes',
      onlineNodes: 'Online Nodes',
      offlineNodes: 'Offline Nodes',
      totalRoutes: 'Total Routes',
      activeRoutes: 'Active Routes',
      onlineRate: 'Online Rate'
    },
    realtimeMetrics: 'Real-time Metrics',
    cpuUsage: 'CPU Usage',
    memoryUsage: 'Memory Usage',
    networkTraffic: 'Network Traffic',
    activeConnections: 'Active Connections',
    recentActivities: 'Recent Activities',
    noActivities: 'No activities yet'
  },
  nodes: {
    title: 'Node Management',
    name: 'Node Name',
    namePlaceholder: 'Enter node name',
    nameMinLength: 'Node name must be at least 3 characters',
    type: 'Node Type',
    ipAddress: 'IP Address',
    port: 'Port',
    config: 'Node Configuration',
    configTitle: 'Node Configuration',
    saveConfig: 'Save Configuration',
    saveConfigSuccess: 'Node configuration saved successfully',
    saveConfigFailed: 'Failed to save node configuration',
    loadConfigFailed: 'Failed to load node configuration',
    exportConfig: 'Export Configuration',
    resetConfig: 'Reset',
    versionSelect: 'Version Selection',
    configMode: 'Configuration Mode',
    networkConfig: 'Network Configuration',
    refreshData: 'Refresh Data',
    deleteNode: 'Delete Node',
    deleteConfirm: 'Are you sure you want to delete node "{name}"?',
    dataRefreshed: 'Data refreshed',
    refreshFailed: 'Failed to refresh data',
    deleteSuccess: 'Node deleted successfully',
    deleteFailed: 'Failed to delete node',
    loadIndexServersFailed: 'Failed to load index servers',
    loadNetworkConfigFailed: 'Failed to load network configuration',
    loadDeviceInfoFailed: 'Failed to load device information',
    loadRoutesCountFailed: 'Failed to load routes count',

    // Node status
    status: {
      unconfigured: 'Unconfigured',
      disabled: 'Disabled',
      enabled: 'Enabled',
      online: 'Online',
      offline: 'Offline',
      maintenance: 'Maintenance Mode',
      active: 'Online',
      inactive: 'Offline',
      pending: 'Pending',
      updateFailed: 'Failed to update node status'
    },

    // Node information fields
    fields: {
      lastSeen: 'Last Seen',
      description: 'Description',
      appVersion: 'App Version',
      cpuModel: 'CPU Model',
      cpuArch: 'CPU Architecture',
      cpuCores: 'CPU Cores',
      totalMemory: 'Total Memory',
      kernelVersion: 'Kernel Version',
      systemArch: 'System Architecture',
      firewallStatus: 'Firewall Status',
      ipForwarding: 'IP Forwarding',
      networkInterface: 'Network Interface',
      ipGroupSequence: 'IP Group Sequence',
      ipManagement: 'IP Management'
    },

    // Node detail page
    detail: {
      title: 'Node Details',
      basicInfo: 'Basic Information',
      nodeConfig: 'Node Configuration',
      networkConfig: 'Network Configuration',
      keyManagement: 'Key Management',
      deviceInfo: 'Device Information',
      networkInfo: 'Network Information',
      ipGrouping: 'IP Grouping',
      statistics: 'Statistics',
      quickActions: 'Quick Actions',

      // Basic info fields
      nodeName: 'Node Name',
      nodeId: 'Node ID',
      status: 'Status',
      lastOnline: 'Last Online',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      nodeType: 'Node Type',

      // Application info
      appInfo: 'Application Information',
      vpnType: 'VPN Type',
      appVersion: 'App Version',
      listenPort: 'Listen Port',

      // Hardware info
      hardwareInfo: 'Hardware Information',
      cpuModel: 'CPU Model',
      cpuArch: 'CPU Architecture',
      cpuCores: 'CPU Cores',
      threads: 'threads',
      totalMemory: 'Total Memory',
      availableMemory: 'Available Memory',
      virtualization: 'Virtualization',

      // System info
      systemInfo: 'System Information',
      operatingSystem: 'Operating System',
      kernelVersion: 'Kernel Version',
      systemArch: 'System Architecture',
      cLibrary: 'C Library',
      containerType: 'Container Type',
      infoCollectedAt: 'Information Collected At',

      // Network device info
      networkDevice: 'Network Device',
      nicCount: 'Network Cards',
      firewall: 'Firewall',
      ipForwarding: 'IP Forwarding',
      units: 'units',

      // Network fields
      virtualInterface: 'Virtual Interface',
      virtualIpAddress: 'Virtual IP Address',
      endpointAddress: 'Endpoint Address',
      ipGroupSequence: 'IP Group Sequence',
      lanIpAddress: 'LAN IP Address',
      publicIpAddress: 'Public IP Address',

      // Messages
      noDeviceInfo: 'No device information available',
      deviceInfoNote: 'Device information needs to be reported by the client',
      statisticsInDevelopment: 'Statistics feature is under development...',
      defaultGroup: 'Default',
      ipv6Address: 'IPv6 Address'
    },

    // List page
    subtitle: 'Manage and monitor network nodes',
    createNode: 'Create Node',
    quickCreateTitle: 'Quick Create Node',
    quickCreateDesc: 'Enter a node name and the system will automatically apply default settings (GNB, port 9016, MTU 1450) and assign an IP address.',
    quickCreateSuccess: 'Node created successfully',
    quickCreateNextStep: 'Node created. Visit the node detail page to generate keys and complete configuration.',
    quickCreateIpPoolEmpty: 'No available IPs in the IP pool. Please contact the administrator to allocate an IP pool.',
    quickCreateFailed: 'Quick create failed',
    goToKeys: 'Go to Keys',
    noData: 'No Nodes',
    noDataDescription: 'No nodes have been created yet',
    createFirstNode: 'Create First Node',

    // Quick create
    quickCreate: {
      btn: 'Quick Create',
      title: 'Quick Create Node',
      hint: 'Just enter a name — VPN type, IP, and default config are set automatically.',
      nameLabel: 'Node Name',
      namePlaceholder: 'Node name (3-255 characters)',
      nameRule: 'Length must be between 3 and 255 characters',
      createBtn: 'Create Now',
      successTitle: 'Node Created',
      nodeName: 'Name: ',
      nodeIp: 'VPN IP: ',
      ipPending: 'Assigning…',
      nodePort: 'Port: ',
      nodeIface: 'Interface: ',
      stepsTitle: 'Complete the steps below to go online:',
      step1: 'Generate node keys',
      step2: 'Enable node',
      generateKey: 'Generate Keys',
      enableNode: 'Enable',
      viewNode: 'View Node',
      privateKeyWarning: 'The private key is shown only once. Save it immediately!',
      noZone: 'No Network available. Please switch or join a Network first.',
      createFailed: 'Creation failed, please try again',
      keyGenSuccess: 'Keys generated. Save the private key immediately!',
      keyGenFailed: 'Key generation failed',
      enableSuccess: 'Node enabled',
      enableFailed: 'Enable failed',
      copied: 'Copied to clipboard',
    },
    view: 'View',
    enable: 'Enable',
    disable: 'Disable',
    createdAt: 'Created at',
    gettingConfigSuggestions: 'Getting config suggestions...',
    nextStepSuggestion: 'Next Step Suggestion',

    // Delete confirmation dialog
    deleteConfirmTitle: 'Confirm Delete',
    deleteCancel: 'Cancel',
    deleteConfirmAction: 'Delete',

    // Edit page
    edit: {
      title: 'Edit Node',
      saveAllChanges: 'Save All Changes',
      resetChanges: 'Reset Changes',
      confirmLeave: 'Confirm Leave',
      unsavedChangesMessage: 'You have unsaved changes, are you sure you want to leave?',
      allChangesSaved: 'All changes saved',
      saveFailed: 'Save failed, please try again',
      confirmReset: 'Confirm Reset',
      resetChangesMessage: 'Are you sure you want to reset all changes?',

      // Tabs
      tabs: {
        basic: 'Basic Information',
        network: 'Network Configuration',
        config: 'Node Configuration',
        keys: 'Key Management'
      },

      // Basic information page
      basic: {
        nameRequired: 'Node name is required',
        nameMaxLength: 'Node name cannot exceed 50 characters',
        descriptionMaxLength: 'Description cannot exceed 500 characters',
        versionPlaceholder: 'Software version (e.g., v1.0.0)',
        nodeTypeMultiSelect: 'Node Type (multiple selection)',
        currentSelection: 'Current selection',
        currentStatus: 'Current status: {status}',
        saveBasicInfo: 'Save Basic Information',
        noSelection: 'No selection',
        loadTypesDefinitionFailed: 'Failed to load node types definition',
        formReset: 'Form has been reset',
        basicInfoSaved: 'Basic information saved successfully',
        saveFailed: 'Save failed, please try again',
        vpnTypeSwitched: 'Switched to {type}, please set relevant ports in node configuration page',

        // Node types
        nodeTypes: {
          edge: 'Edge Node',
          relay: 'Relay Node',
          gateway: 'Gateway Node',
          master: 'Master Node',
          backup: 'Backup Node',
          monitor: 'Monitor Node',
          proxy: 'Proxy Node',
          special: 'Special Node'
        }
      },

      // Network configuration page
      network: {
        loadingConfig: 'Loading network configuration...',
        basicConfig: 'Basic Configuration',
        nodeVirtualIP: 'Node Virtual IP',
        selectIP: 'Select IP',
        selectIPFromPool: 'Select an available IP address from your IP pool as the node virtual IP',
        ipGroupSequence: 'Group sequence',
        virtualInterface: 'Virtual interface name',
        interfacePlaceholder: 'Default is gnb0',
        lanIPs: 'LAN IP addresses',
        lanIPsDescription: 'LAN IP address, format: 192.168.1.1',
        lanIPsHint: 'Configure the node\'s IP address in the local area network for direct connections within the LAN',
        addLanIP: 'Add LAN IP',
        publicIPs: 'Public IP addresses',
        publicIPsDescription: 'Public IP address, format: 1.2.3.4',
        publicIPsHint: 'Configure the node\'s public IP address for cross-network connections',
        addPublicIP: 'Add Public IP',
        indexServers: 'Index servers',
        indexServersDescription: 'Index server address, format: IP:Port',
        indexServersHint: 'Index servers are used for node discovery and routing, multiple servers can be configured for improved availability',
        addIndexServer: 'Add Index Server',
        manualConfig: 'Manual configuration',
        autoDetect: 'Auto detect',
        detectIPs: 'Detect IPs',
        addIP: 'Add IP',
        removeIP: 'Remove IP',
        networkConfigSaved: 'Network configuration saved successfully',
        networkConfigSaveFailed: 'Failed to save network configuration',
        ipDetectionFailed: 'IP detection failed',
        invalidIPFormat: 'Invalid IP address format',
        duplicateIP: 'Duplicate IP address',
        saveNetworkConfig: 'Save Network Configuration',
        resetNetwork: 'Reset network configuration',
        advancedConfig: 'Advanced Configuration',
        confirmResetNetwork: 'Are you sure you want to reset network configuration?',

        // Save related
        save: {
          noChanges: 'No changes to save',
          noChangesDetected: 'No changes detected, no need to save',
          success: 'Network configuration saved successfully, updated {count} fields',
          errorLog: 'Failed to save network configuration:',
          defaultError: 'Save failed, please try again',
          errorPrefix: 'Save failed'
        },

        // Validation related
        validation: {
          formErrors: 'Please check and fix form errors',
          virtualIpRequired: 'Please select node virtual IP'
        }
      },

      // Node configuration page
      config: {
        title: 'Node Configuration',
        loadingConfig: 'Loading node configuration...',
        portConfig: 'Port Configuration',
        listenPort: 'Listen port',
        discoveryPort: 'Discovery port',
        webUIPort: 'Web UI port',
        sslConfig: 'SSL Configuration',
        enableSSL: 'Enable SSL',
        certPath: 'Certificate path',
        keyPath: 'Private key path',
        advancedConfig: 'Advanced Configuration',
        logLevel: 'Log level',
        maxConnections: 'Max connections',
        connectionTimeout: 'Connection timeout',
        heartbeatInterval: 'Heartbeat interval',
        configGenerated: 'Configuration generated',
        configGenerateFailed: 'Failed to generate configuration',
        configExported: 'Configuration exported',
        configExportFailed: 'Failed to export configuration',
        configImported: 'Configuration imported',
        configImportFailed: 'Failed to import configuration',
        invalidConfigFile: 'Invalid configuration file format',
        portInUse: 'Port is already in use',
        portOutOfRange: 'Port number must be between 1-65535',
        generateConfig: 'Generate Configuration',
        exportConfig: 'Export Configuration',
        importConfig: 'Import Configuration',
        previewConfig: 'Preview Configuration',
        saveNodeConfig: 'Save Node Configuration',
        resetConfig: 'Reset Configuration',
        confirmResetConfig: 'Are you sure you want to reset node configuration?',
        saveConfig: 'Save Configuration',
        basicConfig: 'Basic Configuration',
        expertConfig: 'Expert Configuration',
        copyConfig: 'Copy Configuration',

        // VPN types and versions
        gnbVirtualNetwork: 'GNB Virtual Network',
        wireGuard: 'WireGuard',
        openVPN: 'OpenVPN',
        defaultVersion: 'Default Version (Latest)',

        // VPN configuration parameter translations
        nodeId: 'Node ID',
        networkInterface: 'Network Interface Name',
        listenPortConfig: 'Listen Port',
        mtu: 'MTU (Maximum Transmission Unit)',
        multiSocket: 'Multi Socket',
        directForwarding: 'Direct Forwarding',
        unifiedForwarding: 'Unified Forwarding',
        standardForwarding: 'Standard Relay Forwarding',
        addressSecure: 'Address Security',
        ipv4Only: 'IPv4 Only',
        ipv6Only: 'IPv6 Only',
        keepalive: 'Keepalive Interval (seconds)',
        forward: 'Forwarding Function',
        daemon: 'Daemon Mode',
        compression: 'Compression',
        compressionLevel: 'Compression Level',
        memory: 'Memory Scale',
        esArgs: 'ES Arguments',

        // WireGuard parameters
        interfaceAddress: 'Interface Address',
        multiConnection: 'Multi Connection Support',
        daemonMode: 'Daemon Mode',
        dnsServers: 'DNS Servers',
        persistentKeepalive: 'Persistent Keepalive (seconds)',
        allowedIPs: 'Allowed IPs',
        endpoint: 'Endpoint Address',
        fwmark: 'FwMark Firewall Mark',
        routeTable: 'Route Table',
        saveConfigFile: 'Save Configuration',
        preUpScript: 'Pre-Up Script',
        postUpScript: 'Post-Up Script',
        preDownScript: 'Pre-Down Script',
        postDownScript: 'Post-Down Script',
        presharedKey: 'Preshared Key',
        roaming: 'Roaming Support',
        handshakeTimeout: 'Handshake Timeout (seconds)',
        fullConfigPreview: 'Basic Configuration + Expert Configuration',
        pleaseConfigureParams: '# Please configure parameters',
        gnbConfigFile: '# GNB Node Configuration File (Complete Configuration)',
        wireguardConfigFile: '# WireGuard Node Configuration File (Complete Configuration)',
        generateTime: '# Generated at',
        peerConfigNote: '# Peer configuration needs to be set according to specific requirements',
        peerPublicKey: '# PublicKey = <peer public key>',
        peerEndpoint: '# Endpoint = <peer address:port>',
        peerAllowedIPs: '# AllowedIPs = <allowed IP ranges>',
        noConfigContent: '# No configuration content',
        saveSuccess: 'Node configuration saved successfully',
        saveFailedLog: 'Failed to save node configuration:',
        saveFailedRetry: 'Save failed, please try again',
        saveFailedPrefix: 'Save failed',

        // Log levels
        logLevels: {
          trace: 'Trace',
          debug: 'Debug',
          info: 'Info',
          warn: 'Warn',
          error: 'Error',
          fatal: 'Fatal'
        }
      },

      // Key management page
      keys: {
        title: 'Key Management',
        keyList: 'Key List',
        keyDetails: 'Key Details',
        noKeys: 'No keys available',
        addKey: 'Add Key',
        keyId: 'Key ID',
        keyType: 'Key Type',
        privateKeyOnetime: 'Private Key (One-time display)',
        privateKeyWarning: 'Private key is displayed only once, please save it immediately!',
        loadingKeys: 'Loading key information...',
        publicKey: 'Public key',
        privateKey: 'Private key',
        keyPair: 'Key pair',
        generateKeyPair: 'Generate key pair',
        importKey: 'Import key',
        exportKey: 'Export key',
        copyPublicKey: 'Copy public key',
        copyPrivateKey: 'Copy private key',
        showPrivateKey: 'Show private key',
        hidePrivateKey: 'Hide private key',
        keyFormat: 'Key format',
        keyLength: 'Key length',
        keyAlgorithm: 'Key algorithm',
        keyGenerated: 'Key generated',
        keyGenerateFailed: 'Failed to generate key',
        keyImported: 'Key imported',
        keyImportFailed: 'Failed to import key',
        keyExported: 'Key exported',
        keyExportFailed: 'Failed to export key',
        publicKeyCopied: 'Public key copied to clipboard',
        privateKeyCopied: 'Private key copied to clipboard',
        keyCopyFailed: 'Failed to copy key',
        invalidKeyFormat: 'Invalid key format',
        keyTooShort: 'Key length is too short',
        keyTooLong: 'Key length is too long',
        confirmGenerateKey: 'Generating new key will overwrite existing key, continue?',
        confirmDeleteKey: 'Are you sure you want to delete the key? This action cannot be undone',
        keyFileSelect: 'Select key file',
        dragDropKey: 'Drag and drop key file here or click to select',
        saveKeyConfig: 'Save Key Configuration',
        resetKeys: 'Reset Keys',

        // Key operation messages
        keyPairGenerated: 'Key pair generated successfully',
        keyUpdated: 'Key updated successfully',
        privateKeySaved: 'Private key save confirmation completed',
        privateKeyDownloaded: 'Private key downloaded, please keep it safe',
        uploadNotImplemented: 'Upload public key feature not yet implemented',
        localGenerateNotImplemented: 'Local generation feature not yet implemented',
        keyDeleted: 'Key deleted successfully',
        deleteFailed: 'Failed to delete key, please try again',
        copySuccess: 'Private key copied to clipboard',
        copyFailed: 'Copy failed, please copy manually',
        uploadSuccess: 'Public key uploaded successfully',
        uploadFailed: 'Public key validation failed',
        validationSuccess: 'Public key validation successful',
        downloadSuccess: 'Public key download successful',
        privateKeyDownloadSuccess: 'Private key download successful',
        downloadFailed: 'Failed to download public key',
        privateKeyDownloadFailed: 'Failed to download private key',

        // Key formats
        formats: {
          pem: 'PEM format',
          der: 'DER format',
          p12: 'PKCS#12 format',
          jks: 'Java KeyStore format'
        },

        // Key algorithms
        algorithms: {
          rsa: 'RSA',
          ecdsa: 'ECDSA',
          ed25519: 'Ed25519',
          secp256k1: 'secp256k1'
        }
      }
    },

    // Node operations
    operations: {
      title: 'Node Operations',
      quickActions: 'Quick Actions',
      batchOperations: 'Batch Operations',

      // Basic operations
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      pause: 'Pause',
      resume: 'Resume',
      refresh: 'Refresh',
      sync: 'Sync',
      backup: 'Backup',
      restore: 'Restore',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade',
      reset: 'Reset',

      // Status operations
      enable: 'Enable',
      disable: 'Disable',
      activate: 'Activate',
      deactivate: 'Deactivate',
      maintenance: 'Enter Maintenance',
      exitMaintenance: 'Exit Maintenance',

      // Configuration operations
      reloadConfig: 'Reload Configuration',
      validateConfig: 'Validate Configuration',
      exportConfig: 'Export Configuration',
      importConfig: 'Import Configuration',
      resetConfig: 'Reset Configuration',
      backupConfig: 'Backup Configuration',

      // Network operations
      reconnect: 'Reconnect',
      disconnect: 'Disconnect',
      ping: 'Ping Test',
      traceroute: 'Traceroute',
      speedTest: 'Speed Test',
      portScan: 'Port Scan',
      connectFailed: 'Failed to connect to node',

      // Batch operations
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      batchEnable: 'Batch Enable',
      batchDisable: 'Batch Disable',
      batchRestart: 'Batch Restart',
      batchUpgrade: 'Batch Upgrade',
      batchBackup: 'Batch Backup',
      batchDelete: 'Batch Delete',

      // Operation results
      createSuccess: 'Node created successfully',
      createFailed: 'Failed to create node, please try again',

      // Operation confirmations
      confirmStart: 'Are you sure you want to start node "{name}"?',
      confirmStop: 'Are you sure you want to stop node "{name}"?',
      confirmRestart: 'Are you sure you want to restart node "{name}"?',
      confirmReset: 'Are you sure you want to reset node "{name}"? This action cannot be undone.',
      confirmBatchOperation: 'Are you sure you want to perform "{operation}" on {count} selected nodes?',

      // Operation results
      operationSuccess: '{operation} operation completed successfully',
      operationFailed: '{operation} operation failed: {error}',
      batchOperationSuccess: 'Batch operation completed: {success} successful, {failed} failed',
      operationInProgress: '{operation} operation is in progress...',
      operationCancelled: 'Operation cancelled',
      cancelOperation: 'Cancel Operation',
      operationProgress: 'Operation progress: {percent}%'
    },

    // Node monitoring
    monitoring: {
      title: 'Node Monitoring',
      realTimeStats: 'Real-time Statistics',
      performanceMetrics: 'Performance Metrics',
      connectionStatus: 'Connection Status',
      networkTraffic: 'Network Traffic',
      resourceUsage: 'Resource Usage',
      healthCheck: 'Health Check',
      alertsWarnings: 'Alerts and Warnings',

      // Performance metrics
      cpuUsage: 'CPU Usage',
      memoryUsage: 'Memory Usage',
      diskUsage: 'Disk Usage',
      networkIn: 'Network In',
      networkOut: 'Network Out',
      uptime: 'Uptime',
      latency: 'Latency',
      throughput: 'Throughput',
      errorRate: 'Error Rate',
      connectionCount: 'Connection Count',

      // Health status
      healthy: 'Healthy',
      warning: 'Warning',
      critical: 'Critical',
      unknown: 'Unknown',
      degraded: 'Degraded',

      // Alert types
      alerts: {
        highCPU: 'High CPU Usage',
        highMemory: 'High Memory Usage',
        highDisk: 'High Disk Usage',
        networkTimeout: 'Network Connection Timeout',
        connectionLost: 'Connection Lost',
        configError: 'Configuration Error',
        securityAlert: 'Security Alert',
        performanceDrop: 'Performance Drop'
      },

      // Time ranges
      timeRange: {
        last1Hour: 'Last 1 Hour',
        last6Hours: 'Last 6 Hours',
        last24Hours: 'Last 24 Hours',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        custom: 'Custom'
      }
    },

    // Node logs
    logs: {
      title: 'Node Logs',
      viewLogs: 'View Logs',
      downloadLogs: 'Download Logs',
      clearLogs: 'Clear Logs',
      refreshLogs: 'Refresh Logs',
      searchLogs: 'Search Logs',
      filterLogs: 'Filter Logs',
      logLevel: 'Log Level',
      logTime: 'Log Time',
      logMessage: 'Log Message',
      logSource: 'Log Source',

      // Log level filters
      showAll: 'Show All',
      showErrors: 'Show Errors Only',
      showWarnings: 'Show Warnings and Above',
      showInfo: 'Show Info and Above',
      showDebug: 'Show Debug and Above',

      // Log operations
      logsCleared: 'Logs cleared',
      logsClearFailed: 'Failed to clear logs',
      logsDownloaded: 'Logs downloaded',
      logsDownloadFailed: 'Failed to download logs',
      noLogsFound: 'No logs found',
      logsTooLarge: 'Log file is too large, please download to view',

      // Real-time logs
      realTimeMode: 'Real-time Mode',
      pauseRealTime: 'Pause Real-time',
      resumeRealTime: 'Resume Real-time',
      autoScroll: 'Auto Scroll',
      followTail: 'Follow Tail'
    }
  },
  navigation: {
    mainFeatures: 'Main Features',
    networkConfig: 'Network Configuration',
    systemTools: 'Development Settings',
    dashboard: 'Dashboard',
    nodes: 'Node Management',
    routes: {
      title: 'Route Management',
      overview: 'Route Overview',
      active: 'Active Routes',
      pending: 'Pending Connections',
      friends: 'Friend Nodes'
    },
    // Individual navigation keys for page titles
    activeRoutes: 'Active Routes',
    pendingConnections: 'Pending Connections',
    friendNodes: 'Friend Nodes',
    ippools: 'IP Pool Management',
    zones: 'Network Management',
    zoneSharing: 'Zone Sharing',
    zoneServices: 'Zone Services',
    services: {
      title: 'Service Management',
      description: 'Manage and access various network services',
      overview: 'Service Overview',
      overviewDescription: 'View service statistics and quick navigation',
      publicServices: 'Public Services',
      publicServicesDescription: 'Browse public services provided by system (connected devices share automatically)',
      friendServices: 'Friend Services',
      friendServicesDescription: 'Browse services shared by your friends',
      anonymousServices: 'Anonymous Services (Deprecated)', // Feature removed, kept to avoid errors
      anonymousServicesDescription: 'This feature has been deprecated', // Feature removed
      myServices: 'My Services',
      myServicesDescription: 'Manage and share services you created'
    },
    social: {
      title: 'Social Network',
      friends: 'Friends',
      requests: 'Friend Requests',
      invitations: 'Invitations'
    },
    apiTest: 'API Testing',
    help: 'Help Documentation'
  },
  routes: {
    title: 'Route Management',
    subtitle: 'Network routing management and configuration',
    name: 'Route Name',
    destination: 'Destination',
    gateway: 'Gateway',

    // Success/error messages
    configDownloaded: 'Configuration downloaded successfully',
    configDownloadError: 'Failed to download configuration',
    configRefreshed: 'Configuration refreshed successfully',
    configRefreshError: 'Failed to refresh configuration',
    connectionApproved: 'Connection approved successfully',
    connectionApproveError: 'Failed to approve connection',
    connectionRejected: 'Connection rejected successfully',
    connectionRejectError: 'Failed to reject connection',
    connectionRequestSent: 'Connection request sent successfully',
    connectionRequestError: 'Failed to send connection request',
    routeDisconnected: 'Route disconnected successfully',
    routeDisconnectError: 'Failed to disconnect route',
    fetchConfigError: 'Failed to fetch configuration',
    fetchFriendNodesError: 'Failed to fetch friend nodes',
    fetchOverviewError: 'Failed to fetch overview data',
    fetchPendingConnectionsError: 'Failed to fetch pending connections',
    fetchRouteDetailsError: 'Failed to fetch route details',
    fetchAllFriendNodesError: 'Failed to fetch all friend nodes',

    // Overview statistics
    overview: {
      activeRoutes: 'Active Routes',
      pendingConnections: 'Pending Connections',
      connectedNodes: 'Connected Nodes',
      totalBandwidth: 'Total Bandwidth'
    },

    // Tabs
    tabs: {
      activeRoutes: 'Active Routes',
      pendingConnections: 'Pending Connections',
      friendNodes: 'Friend Nodes',
      configuration: 'Configuration'
    },

    // Route status
    status: {
      active: 'Active',
      inactive: 'Inactive',
      connecting: 'Connecting',
      error: 'Error',
      unknown: 'Unknown'
    },

    // Connection types
    connectionType: {
      direct: 'Direct',
      relay: 'Relay'
    },

    // Node status
    nodeStatus: {
      available: 'Available',
      connected: 'Connected',
      pending: 'Pending',
      unavailable: 'Unavailable'
    },

    // Connection status
    connectionStatus: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    },

    // Index/Navigation page
    index: {
      activeRoutes: 'Active Routes',
      activeRoutesDescription: 'View and manage currently active network connections',
      friendNodes: 'Friend Nodes',
      friendNodesDescription: 'Browse and connect to friend network nodes',
      pendingConnections: 'Pending Connections',
      pendingConnectionsDescription: 'Handle incoming and outgoing connection requests'
    },

    // Active routes
    activeRoutes: {
      subtitle: 'Manage currently active network route connections',
      searchPlaceholder: 'Search routes...',
      statusFilter: 'Status Filter',
      noRoutes: 'No active routes',
      noSearchResults: 'No matching routes found',
      bandwidth: 'Bandwidth',
      latency: 'Latency',
      packetLoss: 'Packet Loss',
      connectionType: 'Connection Type',
      lastActive: 'Last Active',
      lastUpdate: 'Last Update',
      unknownUser: 'Unknown User',
      viewDetails: 'View Details',
      editRoute: 'Edit Route',
      disconnect: 'Disconnect',
      relayMode: 'Relay Mode',
      priority: 'Priority',
      vpnType: 'VPN Type',
      targetUser: 'Target User',
      sourceNode: 'Source Node',
      targetNode: 'Target Node',
      unknownType: 'Unknown Type',
      unknownMode: 'Unknown Mode'
    },

    // Pending connections
    pendingConnections: {
      subtitle: 'Handle pending connection requests',
      incoming: 'Incoming Requests',
      outgoing: 'Outgoing Requests',
      noIncomingConnections: 'No incoming connection requests',
      noOutgoingConnections: 'No outgoing connection requests',
      connectionType: 'Connection Type',
      vpnType: 'VPN Type',
      requestedAt: 'Requested At',
      approve: 'Approve',
      reject: 'Reject',
      viewDetails: 'View Details',
      connectionDetails: 'Connection Details',
      approveSuccess: 'Connection request approved',
      approveError: 'Failed to approve connection request',
      rejectSuccess: 'Connection request rejected',
      rejectError: 'Failed to reject connection request'
    },

    // Friend nodes
    friendNodes: {
      subtitle: 'Browse and manage friend network nodes',
      searchPlaceholder: 'Search friend nodes...',
      statusFilter: 'Status Filter',
      noNodes: 'No friend nodes',
      noNodesDescription: 'You don\'t have any friend nodes yet',
      noSearchResults: 'No matching nodes found',
      ipAddress: 'IP Address',
      port: 'Port',
      nodeType: 'Node Type',
      vpnType: 'VPN Type',
      endpoint: 'Endpoint',
      zone: 'Network',
      lastSeen: 'Last Seen',
      createdAt: 'Created At',
      noDescription: 'No Description',
      totalFriends: 'Total Friends',
      totalNodes: 'Total Nodes',
      onlineNodes: 'Online Nodes',
      availableNodes: 'Available Nodes',
      viewFriend: 'View Friend',
      connect: 'Connect',
      pending: 'Pending',
      connected: 'Connected',
      offline: 'Offline',
      selectMyNode: 'Select My Node',
      selectMyNodeHint: 'Please select the node to use for connection',
      noAvailableNodes: 'No available nodes',
      loadNodesError: 'Failed to load nodes',
      myNode: 'My Node',
      confirmConnection: 'Confirm Connection',
      confirmConnectionHint: 'Please confirm connection details and fill in request message',
      requestMessage: 'Request Message',
      messagePlaceholder: 'Please describe your connection needs and usage scenario...',
      messageRequired: 'Please enter request message',
      messageMinLength: 'Message must be at least 10 characters',
      messageMaxLength: 'Message cannot exceed 500 characters',
      sendRequest: 'Send Request',
      incompleteSelection: 'Incomplete selection',
      connectionError: 'Connection failed',
      defaultMessage: 'I would like to connect my node {myNodeName} to your node {friendNodeName} for network communication. Thank you!',
      goToSocial: 'Go to Social Network',
      sendConnectionRequest: 'Send Connection Request',
      connectionRequestHint: 'Send a connection request to your friend to establish a route',
      friendNode: 'Friend Node',
      requestMessageHint: 'Explain the purpose of the connection to your friend',
      requestSent: 'Connection request sent successfully',
      requestError: 'Failed to send connection request',
      stats: {
        friendsCount: 'Total Friends',
        totalNodes: 'Total Nodes',
        onlineNodes: 'Online Nodes',
        offlineNodes: 'Offline Nodes'
      }
    },

    // Node-based route management
    nodeBased: {
      selectNode: 'Select My Node',
      selectNodeDescription: 'Click on your node card to view route information for that node',
      viewRoutes: 'View Routes',
      backToNodes: 'Back to Node List',
      noNodes: 'No Nodes',
      noNodesDescription: 'You haven\'t created any nodes yet, please create a node first',
      noAvailableNodes: 'No Available Nodes',
      noAvailableNodesDescription: 'No nodes available for connection at the moment',
      noDescription: 'No Description',
      nodeId: 'Node ID',
      totalRoutes: 'Total Routes',
      totalNodes: 'Total Nodes',
      routeCount: 'Route Count',
      nodeType: 'Node Type',
      vpnType: 'VPN Type',
      status: 'Status',
      unknown: 'Unknown',
      routesList: 'Routes List',
      nodesList: 'Nodes List',
      noRoutesForNode: 'No routes for this node',
      noNodesForNode: 'No nodes for this node',
      statusLabels: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending Configuration',
        unknown: 'Unknown'
      }
    },

    // Node selector component
    nodeSelector: {
      noNodes: 'No nodes available',
      noDescription: 'No description',
      noSearchResults: 'No search results found',
      tryDifferentSearch: 'Please try different search terms',
      searchPlaceholder: 'Search node name or IP...',
      addNodesFirst: 'Please add nodes first',
      refresh: 'Refresh',
      statusFilter: 'Status Filter',
      typeFilter: 'Type Filter',
      clearSelection: 'Clear Selection',
      selectedNode: 'Selected Node',
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending'
      }
    },

    // Node routes display
    nodeRoutes: {
      nodeId: 'Node ID',
      totalRoutes: 'Total Routes',
      noDescription: 'No Description',
      searchPlaceholder: 'Search route information...',
      refresh: 'Refresh',
      noRoutes: 'No routes for this node',
      noSearchResults: 'No matching routes found',
      tryDifferentSearch: 'Please try different search terms',
      noRoutesForNode: 'This node hasn\'t established any route connections yet',
      vpnType: 'VPN Type',
      relayMode: 'Relay Mode',
      priority: 'Priority',
      remoteUser: 'Remote User',
      lastUpdate: 'Last Update',
      viewDetails: 'View Details',
      editRoute: 'Edit Route',
      disconnect: 'Disconnect',
      unknownType: 'Unknown Type',
      unknownMode: 'Unknown Mode',
      direction: {
        outgoing: 'Outgoing Route',
        incoming: 'Incoming Route'
      }
    },

    // Relay modes
    relayModes: {
      direct: 'Direct',
      relay: 'Relay',
      p2p: 'P2P',
      hybrid: 'Hybrid'
    },

    // Actions
    actions: {
      createRoute: 'Create Route',
      refreshRoutes: 'Refresh Routes',
      connect: 'Connect',
      disconnect: 'Disconnect',
      approve: 'Approve',
      reject: 'Reject',
      viewDetails: 'View Details'
    },

    // Configuration management
    config: {
      description: 'Route configuration file contains all necessary network routing information, can be downloaded and applied to your network devices.',
      configStatus: 'Configuration Status',
      configReady: 'Configuration Ready',
      configNotReady: 'Configuration Not Generated',
      lastUpdated: 'Last Updated',
      never: 'Never',
      configDetails: 'Configuration Details',
      version: 'Version',
      format: 'Format',
      entries: 'Entries',
      preview: 'Preview',
      copy: 'Copy',
      copied: 'Copied to clipboard',
      download: 'Download Configuration',
      refresh: 'Refresh Configuration',
      routeEntries: 'Route Entries',
      nodeId: 'Node ID',
      ipAddress: 'IP Address',
      mask: 'Subnet Mask',
      gateway: 'Gateway',
      metric: 'Metric',
      actions: 'Actions',
      entryDetails: 'Entry Details'
    },

    // Route details
    details: {
      basicInfo: 'Basic Information',
      routeId: 'Route ID',
      status: 'Status',
      connectionType: 'Connection Type',
      createdAt: 'Created At',
      lastActive: 'Last Active',
      nodeInfo: 'Node Information',
      sourceNode: 'Source Node',
      targetNode: 'Target Node',
      nodeName: 'Node Name',
      ipAddress: 'IP Address',
      mask: 'Subnet Mask',
      friendName: 'Friend Name',
      performance: 'Performance Metrics',
      bandwidth: 'Bandwidth',
      latency: 'Latency',
      packetLoss: 'Packet Loss',
      uptime: 'Uptime',
      connectionStats: 'Connection Statistics',
      bandwidthIn: 'Inbound Bandwidth',
      bandwidthOut: 'Outbound Bandwidth',
      bytesSent: 'Bytes Sent',
      bytesReceived: 'Bytes Received',
      disconnect: 'Disconnect'
    },

    // Create route workflow
    create: {
      // Step names
      steps: {
        selectFriend: 'Select Friend',
        selectFriendNode: 'Select Friend Node',
        selectMyNode: 'Select My Node',
        submitRequest: 'Submit Request'
      },

      // Step 1 - Select friend
      step1: {
        title: 'Create Route - Select Friend',
        subtitle: 'Choose the friend to establish connection with',
        selectFriend: 'Select Friend',
        searchFriends: 'Search friends...',
        noFriends: 'No friends available',
        friendInfo: 'Nodes: {nodes} | Status: {status}',
        availableNodes: 'Available Nodes',
        totalNodes: 'Total Nodes',
        nextStep: 'Next Step',
        pleaseSelectFriend: 'Please select a friend'
      },

      // Step 2 - Select friend node
      step2: {
        title: 'Create Route - Select Friend Node',
        subtitle: 'Select {friendName}\'s node for connection',
        selectedFriend: 'Selected Friend',
        changeFriend: 'Change Friend',
        selectFriendNode: 'Select Friend Node',
        loadingNodes: 'Loading nodes...',
        noNodes: 'This friend has no available nodes',
        unknownLocation: 'Unknown Location',
        nodeStatus: 'Status',
        connections: 'Connections',
        latency: 'Latency',
        connectionsFull: 'Connections Full',
        nodeNotAvailable: 'Node is not available',
        nextStep: 'Next Step',
        pleaseSelectNode: 'Please select a node',
        nodeCannotConnect: 'This node cannot be connected at the moment',
        fetchNodesError: 'Failed to fetch friend nodes',
        noFriendSelected: 'No friend selected',
        cannotConnect: 'Cannot establish connection at this time',
        existingConnection: 'Connection already exists',
        pendingRequest: 'Connection request pending',
        possibleReasons: 'Possible reasons'
      },

      // Step 3 - Select my node
      step3: {
        title: 'Create Route - Select My Node',
        subtitle: 'Select your node for connection',
        selectionSummary: 'Selection Summary',
        selectedFriend: 'Selected Friend',
        selectedFriendNode: 'Selected Friend Node',
        selectMyNode: 'Select My Node',
        searchNodes: 'Search nodes...',
        filterByStatus: 'Filter by Status',
        allStatus: 'All Status',
        onlineOnly: 'Online Only',
        availableOnly: 'Available Only',
        connectedOnly: 'Connected Only',
        pendingOnly: 'Pending Only',
        loadingNodes: 'Loading nodes...',
        noAvailableNodes: 'No available nodes',
        createNodeHint: 'You can create a node first',
        unknownLocation: 'Unknown Location',
        nodeStatus: 'Status',
        connections: 'Connections',
        bandwidth: 'Bandwidth',
        connectionStatusLabel: 'Connection Status',
        alreadyConnected: 'Already Connected',
        requestSent: 'Request Sent',
        requestReceived: 'Request Received',
        requestRejected: 'Request Rejected',
        connectionsFull: 'Connections Full',
        nextStep: 'Next Step',
        pleaseSelectNode: 'Please select a node',
        nodeAlreadyConnected: 'This node has already established connection with target node',
        requestAlreadySent: 'Connection request already sent to this node',
        requestAlreadyReceived: 'Connection request already received from this node',
        nodeCannotConnect: 'This node cannot be connected at the moment',
        cannotProceedWithConnection: 'This node has connection relationship, cannot proceed',
        fetchNodesError: 'Failed to fetch nodes',
        noFriendSelected: 'No friend selected',
        noFriendNodeSelected: 'No friend node selected',
        nodeDisabled: 'This node is disabled and cannot be used',
        nodeMaintenance: 'This node is under maintenance',
        nodeUnconfigured: 'This node is not configured yet',

        // Connection status
        connectionStatus: {
          connected: 'Connected',
          pendingSent: 'Request Sent',
          pendingReceived: 'Request Received',
          rejected: 'Request Rejected',
          none: 'No Connection',
          unknown: 'Status Unknown'
        },

        // Node not available reason
        nodeNotAvailable: 'Node temporarily unavailable'
      },

      // Step 4 - Submit request
      step4: {
        title: 'Create Route - Submit Request',
        subtitle: 'Fill in connection request information',
        selectionSummary: 'Selection Summary',
        targetFriend: 'Target Friend',
        targetNode: 'Target Node',
        sourceNode: 'Source Node',
        requestForm: 'Request Form',
        requestMessage: 'Request Message',
        messagePlaceholder: 'Please describe your connection needs and usage scenario...',
        messageHint: 'Please provide detailed connection purpose to help friend approve quickly',
        messageRequired: 'Please enter request message',
        messageMinLength: 'Request message must be at least 10 characters',
        messageMaxLength: 'Request message cannot exceed 500 characters',
        connectionPriority: 'Connection Priority',
        priorityHint: 'High priority connections will be processed first',
        expectedBandwidth: 'Expected Bandwidth',
        bandwidthRequired: 'Please enter expected bandwidth',
        bandwidthMaxValue: 'Bandwidth cannot exceed 1000Mbps',
        bandwidthHint: 'Set according to your actual needs',
        connectionDuration: 'Connection Duration',
        durationHint: 'Set the validity period of connection',
        autoReconnect: 'Auto Reconnect',
        connectionProtocol: 'Connection Protocol',
        protocolHint: 'Recommended to use auto protocol',
        submitRequest: 'Submit Request',
        incompleteSelection: 'Selection information incomplete',
        submitError: 'Failed to submit request',
        requestSubmitted: 'Request Submitted',
        requestSubmittedMessage: 'Your connection request has been successfully submitted, waiting for friend approval',
        viewRoutes: 'View Routes',
        createAnother: 'Create Another',
        submitting: 'Submitting...',
        defaultMessage: 'I would like to establish a network connection between our nodes for better communication. Please approve this request. Thank you!',
        priorities: {
          low: 'Low',
          normal: 'Normal',
          high: 'High'
        },
        durations: {
          oneWeek: '1 Week',
          oneMonth: '1 Month',
          threeMonths: '3 Months',
          sixMonths: '6 Months',
          oneYear: '1 Year',
          permanent: 'Permanent'
        },
        protocols: {
          auto: 'Auto',
          wireguard: 'WireGuard',
          openvpn: 'OpenVPN',
          ipsec: 'IPSec'
        }
      },

      // Common messages
      requestSubmitted: 'Connection request submitted successfully',
      submitError: 'Failed to submit connection request'
    },

    // Dialogs
    dialogs: {
      routeDetails: {
        title: 'Route Details'
      }
    },

    // Error messages
    fetchActiveRoutesError: 'Failed to fetch active routes'
  },
  zones: {
    subtitle: 'Your networks and current selection',
    switchZone: 'Switch Network',
    selectZone: 'Select Network',
    switchedTo: 'Switched to {zoneName}',
    switchFailed: 'Failed to switch network',
    unknownZone: 'Unknown network',
    comingSoonMessage: 'Network management feature is under development, stay tuned!',

    // Extended network management features
    currentZone: 'Current Network',
    availableZones: 'Available Networks',
    noCurrentZone: 'No network selected',
    noAvailableZones: 'No available networks',
    adminRole: 'Administrator',
    domain: 'Domain',
    admin: 'Administrator',
    switchToZone: 'Switch to this network',

    // Statistics
    stats: {
      totalNodes: 'Total Nodes',
      activeNodes: 'Active Nodes',
      routes: 'Routes',
      users: 'Users'
    },

    // Actions
    actions: {
      switch: 'Switch',
      create: 'Create Network',
      edit: 'Edit',
      delete: 'Delete',
      refresh: 'Refresh'
    },

    // Dialogs
    dialogs: {
      switchZone: {
        title: 'Switch Network',
        message: 'Are you sure you want to switch to network "{zoneName}"?',
        warning: 'After switching, you will see the node configuration and data of that network.'
      },
      createZone: {
        title: 'Create New Network',
        nameLabel: 'Network Name',
        descriptionLabel: 'Network Description',
        create: 'Create'
      }
    },

    // Error messages
    fetchOverviewError: 'Failed to fetch network overview',
    fetchAvailableZonesError: 'Failed to fetch available networks',
    fetchZonesError: 'Failed to fetch network list',
    fetchDetailsError: 'Failed to fetch network details',
    createSuccess: 'Network created successfully',
    createError: 'Failed to create network',
    updateSuccess: 'Network updated successfully',
    updateError: 'Failed to update network',
    deleteSuccess: 'Network deleted successfully',
    deleteError: 'Failed to delete network'
  },
  social: {
    subtitle: 'Network connections and user management',
    comingSoonMessage: 'Networking management feature is under development, stay tuned!',

    // Actions
    actions: {
      accept: 'Accept',
      reject: 'Reject',
      addFriend: 'Add Friend',
      removeFriend: 'Remove Friend'
    },

    // Overview stats
    overview: {
      title: 'Social Overview',
      friends: 'Friends',
      pendingRequests: 'Pending Requests',
      connectedNodes: 'Connected Nodes',
      activeRoutes: 'Active Routes'
    },
    // Friends management
    friends: {
      title: 'Friends List',
      searchPlaceholder: 'Search friends...',
      noFriends: 'No friends yet',
      online: 'Online',
      offline: 'Offline',
      nodes: 'Nodes',
      routes: 'Routes',
      friendshipDate: 'Friends since',
      removeFriend: 'Remove Friend',
      viewNodes: 'View Nodes',
      lastActive: 'Last Active',
      mutualFriends: 'Mutual Friends'
    },
    // Friend requests
    friendRequests: {
      title: 'Friend Requests',
      received: 'Received',
      sent: 'Sent',
      noRequests: 'No friend requests',
      accept: 'Accept',
      reject: 'Reject',
      message: 'Message',
      requestTime: 'Request Time',
      cancel: 'Cancel Request',
      status: {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected',
        undefined: 'Status Unknown'
      },
      statusError: 'Failed to get request status'
    },
    // User search
    search: {
      title: 'Search Users',
      placeholder: 'Enter username or email...',
      noResults: 'No matching users found',
      addFriend: 'Add Friend',
      requested: 'Requested',
      friend: 'Already Friends',
      zone: 'Network',
      lastActive: 'Last Active'
    },
    // Friend card
    viewNodes: 'View Nodes',
    friendSince: 'Friends since {date}',
    onlineNodes: '{count} nodes online',
    nodes: 'nodes',
    connections: 'connections',
    active: 'Active',
    online: 'Online',
    editRemark: 'Edit Remark',
    editTags: 'Edit Tags',
    removeFriend: 'Remove Friend',

    // Invitations
    invitations: {
      title: 'Invite Codes',
      myCodeTitle: 'My invite code for this Network',
      myCodeHint: 'New friends enter this code on the sign-up page to join this Network and become your friend automatically; people who already have an account use "Join another Network" below (that only joins the Network — no automatic friendship).',
      noCodeYet: 'No invite code yet — use the button below to create one.',
      refreshCode: 'Get / refresh invite code',
      code: 'Invite code',
      usageCount: '{used} of {max} invited',
      usageUnlimited: '{used} invited (no limit)',
      expiresAt: 'Expires',
      expiresNever: 'Never expires',
      active: 'Active',
      usedUp: 'Used up',
      expired: 'Expired',
      copyCode: 'Copy code',
      codeCopied: 'Invite code copied',
      copyInviteLink: 'Copy invite link',
      linkCopied: 'Invite link copied',
      copyFailed: 'Copy failed',
      fetchError: 'Failed to load the invite code',
      noZone: 'No Network selected: invite codes are per Network, so join or switch one first.',
      joinTitle: 'Join another Network',
      joinHint: 'Enter the invite code someone shared with you. Joining switches your current Network to theirs.',
      joinPlaceholder: 'Enter an invite code',
      joinButton: 'Join',
      joinCodeRequired: 'Please enter an invite code',
      joinSuccess: 'Joined Network "{name}"',
      joinError: 'Failed to join the Network',
      usagesTitle: 'People I invited',
      noUsages: 'Nobody has used your invite code yet',
      usageFetchError: 'Failed to load invite records',
      unknownUser: 'Unknown user',
      channelEmail: 'Email sign-up',
      channelSms: 'SMS sign-up',
      channelJoin: 'Joined by code',
      channelUnknown: 'Unknown',
      prevPage: 'Previous',
      nextPage: 'Next'
    },
    // Dialogs
    dialogs: {
      removeFriend: {
        title: 'Remove Friend',
        message: 'Are you sure you want to remove "{name}" from your friends? This action cannot be undone.',
        confirm: 'Remove',
        cancel: 'Cancel'
      },
      sendRequest: {
        title: 'Send Friend Request',
        message: 'Send friend request to "{name}"',
        messagePlaceholder: 'Enter message (optional)',
        send: 'Send Request',
        cancel: 'Cancel'
      }
    },
    // Action messages
    friendRequestSent: 'Friend request sent',
    friendRequestAccepted: 'Friend request accepted',
    friendRequestRejected: 'Friend request rejected',
    friendRemoved: 'Friend "{name}" removed',
    // Error messages
    fetchOverviewError: 'Failed to fetch social overview',
    fetchFriendsError: 'Failed to fetch friends list',
    searchUsersError: 'Failed to search users',
    fetchRequestsError: 'Failed to fetch friend requests',
    friendRequestError: 'Failed to send friend request',
    friendRequestAcceptError: 'Failed to accept friend request',
    friendRequestRejectError: 'Failed to reject friend request',
    friendRemoveError: 'Failed to remove friend',
    fetchFriendNodesError: 'Failed to fetch friend nodes',
    fetchAllFriendNodesError: 'Failed to fetch all friend nodes',
    friendRequestCancelled: 'Friend request cancelled',
    friendRequestCancelError: 'Failed to cancel friend request'
  },
  ippools: {
    title: 'IP Pool Management',
    subtitle: 'IP address pool management and allocation',
    comingSoonMessage: 'IP pool management feature is under development, stay tuned!',
    // List page
    pools: 'IP Pools',
    statistics: 'Statistics',
    createPool: 'Create Pool',
    searchPlaceholder: 'Search IP pool name or IP address...',
    filterAll: 'All',
    filterAllocated: 'Allocated',
    filterAvailable: 'Available',
    noPoolsFound: 'No IP pools found',
    // Statistics cards
    totalPools: 'Total Pools',
    createdPools: 'Created Pools',
    availablePools: 'Available Pools',
    allocatedPools: 'Allocated Pools',
    totalIPs: 'Total IPs',
    availableIPs: 'Available IPs',
    allocatedIPs: 'Allocated IPs',
    poolUsageRate: 'Pool Usage Rate',
    usageRate: 'Usage Rate',
    // Table fields
    ipRange: 'IP Range',
    totalCount: 'Total',
    usedCount: 'Used',
    availableCount: 'Available',
    // Status
    statusAvailable: 'Available',
    statusAllocated: 'Allocated',
    statusPending: 'Pending',
    // Actions
    delete: 'Delete',
    details: 'Details',
    batchOperations: 'Batch Operations',
    // Form
    // Allocation
    releasedAt: 'Released At',
    allocationHistory: 'Allocation History',
    // Dialogs
    deletePoolDialog: 'Delete IP Pool',
    // Confirm messages
    deletePoolConfirm: 'Are you sure you want to delete IP pool "{name}"? This action cannot be undone.',
    // Validation messages
    ipRangeConflict: 'IP range conflicts with existing pools',
    // Success messages
    createSuccess: 'IP pool created successfully',
    deleteSuccess: 'IP pool deleted successfully',
    batchOperationSuccess: 'Batch operation completed successfully',
    exportSuccess: 'Export completed successfully',
    autoAllocateSuccess: 'Auto allocation completed successfully',
    extendSuccess: 'Pool extended successfully',
    // Error messages
    fetchError: 'Failed to fetch IP pools',
    fetchPoolError: 'Failed to fetch IP pool details',
    createError: 'Failed to create IP pool',
    deleteError: 'Failed to delete IP pool',
    checkIPError: 'Failed to check IP availability',
    fetchStatisticsError: 'Failed to fetch statistics',
    fetchUserResourcesError: 'Failed to fetch user resources',
    batchOperationError: 'Batch operation failed',
    exportError: 'Export failed',
    autoAllocateError: 'Auto allocation failed',
    extendError: 'Pool extension failed',
    // Create IP pool related
    checkAvailability: 'Check Availability',
    userQuota: 'User Quota',
    quota: 'Quota Info',
    maxPools: 'Max Pools',
    currentPools: 'Current Pools',
    remainingPools: 'Remaining Pools',
    canCreate: 'Can Create',
    // Simplified creation related
    quotaInfo: 'Current {current} pools, max {max} pools',
    quotaExhausted: 'IP pool quota limit reached for this Network',
    createCount: 'Create Count',
    poolsUnit: 'pools',
    continuous: 'Continuous',
    discontinuous: 'Discontinuous',
    selectTargetPool: 'Select Target Pool',
    selectTargetPoolHint: 'Choose an existing pool to extend continuously',
    preview: 'Preview',
    willCreate: 'Will Create',
    continuousMode: 'Continuous Mode',
    extendFrom: 'Extend From',
    continuityWarning: 'Warning: Although continuous allocation was requested, the system allocated non-contiguous IP addresses',
    deleteConfirmTitle: 'Confirm Deletion',
    selectTargetPoolAdvancedHint: 'The new IP pool will be created before or after the target pool. The system will automatically choose the best position',
    // Hints
    poolEmpty: 'IP pool is empty',
    poolFull: 'IP pool is full',
    capacityWarning: 'IP pool capacity is insufficient, consider expanding',
    // Advanced features
    refresh: 'Refresh',
    apply: 'Apply',
    reset: 'Reset',
    batchDelete: 'Batch Delete',
    selectedCount: '{count} selected',
    advancedFilters: 'Advanced Filters',
    zoneFilter: 'Zone Filter',
    statusFilter: 'Status Filter',
    usageFilter: 'Usage Filter',
    ipContains: 'IP Contains',
    ipContainsPlaceholder: 'Enter IP address fragment...',
    quickSearch: 'Quick search...',
    viewOptions: 'View Options',
    unnamedPool: 'Unnamed Pool',
    usageAll: 'All',
    usageLow: 'Low Usage (0-30%)',
    usageMedium: 'Medium Usage (30-70%)',
    usageHigh: 'High Usage (70%+)',
    batchDeleteDialog: 'Batch Delete IP Pools',
    batchDeleteConfirm: 'Are you sure you want to delete the selected {count} IP pools? This action cannot be undone.',
    // View modes
    cardView: 'Card View',
    tableView: 'Table View',
    noPools: 'No IP Pools',
    noPoolsHint: 'Click "Create Pool" button to create your first IP pool',
  },
  apiTest: {
    subtitle: 'API interface testing and debugging tools',
    comingSoonMessage: 'API testing tool is under development, stay tuned!'
  },
  help: {
    subtitle: 'Help documentation and user guide',
    comingSoonMessage: 'Help documentation is being improved, stay tuned!'
  },
  websocket: {
    connected: 'Connected',
    disconnected: 'Disconnected',
    connectionFailed: 'WebSocket connection failed',
    connectionStatus: 'WebSocket Connection Status',
    heartbeat: 'Heartbeat'
  },
  node: {
    status: {
      online: 'Online',
      offline: 'Offline',
      connecting: 'Connecting',
      error: 'Error'
    },
    ip: {
      searchPlaceholder: 'Search IP address or IP pool name...',
      loadingMessage: 'Loading available IPs...',
      noIPAddress: 'No available IP addresses',
      noMatchingIP: 'No matching IP addresses found',
      createIPPoolHint: 'Please create IP pools or allocate IP resources first',
      tryOtherKeywords: 'Please try other search keywords',
      status: 'Status',
      used: 'Used',
      available: 'Available'
    },
    indexServer: {
      searchPlaceholder: 'Search server name or address...',
      loadingMessage: 'Loading index servers...',
      noServers: 'No available index servers',
      noMatchingServers: 'No matching servers found',
      contactAdminHint: 'Please contact administrator to configure index servers',
      tryOtherKeywords: 'Please try other search keywords',
      serverAlreadyExists: 'Selected servers already exist, no new servers added',
      serversAdded: 'Added {count} index servers'
    },
    network: {
      invalidIPFormat: 'Invalid IP address format',
      invalidIPv4Format: 'Invalid IPv4 address format',
      invalidIPPortFormat: 'Invalid IP:Port format, example: 192.168.1.1:8080',
      loadConfigFailed: 'Failed to load network configuration, using default values',
      ipSelected: 'Selected IP: {ip} (Group sequence: {ipGroupSequenceNumber})'
    },
    config: {
      validation: {
        required: 'This field is required',
        invalidNumber: 'Please enter a valid number',
        minValue: 'Minimum value is {min}',
        maxValue: 'Maximum value is {max}',
        invalidFormat: 'Invalid input format'
      },
      configCopied: 'Configuration copied to clipboard',
      copyFailed: 'Copy failed, please select and copy manually',
      configExported: 'Configuration file exported',
      exportFailed: 'Failed to export configuration, please try again later',
      loadConfigFailed: 'Failed to load configuration',
      required: '(Required)',
      optional: '(Optional)',
      basicConfig: 'Basic Configuration',
      basicConfigDesc: 'Required basic parameter configuration',
      wireGuardBasicDesc: 'Required WireGuard basic parameters',
      listenPort: 'Listen Port',
      gnbVirtualNetwork: 'GNB Virtual Network',
      defaultVersion: 'Default Version (Latest)'
    },
    detail: {
      deleteNodeFailed: 'Failed to delete node, please try again'
    },
    keyManagement: {
      generateKey: 'Generate Key',
      generateKeyForNode: 'Generate key for node {nodeId}',
      generationMethod: 'Generation Method',
      publicKeyContent: 'Public Key Content',
      publicKeyRequired: 'Public key content cannot be empty',
      generate: 'Generate',
      create: 'Create',
      serverGenerated: 'Server Generated',
      uploadPublicKey: 'Upload Public Key',
      selectKeyToViewDetails: 'Please select a key to view details'
    }
  },
  zoneServices: {
    subtitle: 'Zone service sharing and management',

    // Page titles and descriptions
    navigation: {
      publicServices: 'Public Services',
      publicServicesDescription: 'Browse public services provided by system (connected devices share automatically)',
      friendServices: 'Friend Services',
      friendServicesDescription: 'Browse services shared by your friends',
      anonymousServices: 'Anonymous Services (Deprecated)', // Feature removed
      anonymousServicesDescription: 'This feature has been deprecated', // Feature removed
      myServices: 'My Services',
      myServicesDescription: 'Manage and share services you created'
    },

    currentZone: 'Current Zone',
    servicesCount: 'services',
    addService: 'Add Service',
    editService: 'Edit Service',
    addFirstService: 'Add First Service',
    shareService: 'Share Service',
    shareServiceDesc: 'Select friends to share with and add sharing information',
    shareMessage: 'Share Message',
    shareMessagePlaceholder: 'Tell your friends about this service...',
    confirmShare: 'Confirm Share',
    requestPublic: 'Request Public',
    requestPublicDesc: 'Request to make this service public for all users',
    approvalReason: 'Approval Reason',
    approvalReasonPlaceholder: 'Explain why this service should be public...',
    submitRequest: 'Submit Request',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete service "{name}"? This action cannot be undone.',
    deleteWarning: 'Are you sure you want to delete service "{name}"? This action cannot be undone.',
    connect: 'Connect',
    authRequired: 'Auth Required',
    noAuth: 'No Auth',

    // ServiceCard related translations
    serviceCard: {
      statusLabel: 'Status',
      nodeLabel: 'Node',
      edit: 'Edit',
      delete: 'Delete',
      connect: 'Connect',
      details: 'Details',

      // Status labels
      status: {
        running: 'Running',
        stopped: 'Stopped',
        waiting: 'Waiting',
        error: 'Error',
        unknown: 'Unknown'
      },

      // Auth status
      auth: {
        required: 'Auth Required',
        notRequired: 'No Auth Required'
      }
    },

    categories: {
      public: 'Public Services',
      publicDesc: 'Public services approved by administrators',
      friend: 'Friend Sharing',
      friendDesc: 'Services shared by your friends',
      anonymous: 'Anonymous Sharing',
      anonymousDesc: 'Services shared by anonymous users',
      my: 'My Services',
      myDesc: 'Services you created and manage'
    },

    types: {
      gnbIndex: 'Node Discovery',
      gnbIndexDesc: 'GNB node discovery service',
      music: 'Music Service',
      musicDesc: 'Music streaming service',
      video: 'Video Service',
      videoDesc: 'Video streaming service',
      netbridge: 'NetBridge',
      netbridgeDesc: 'Network bridge service'
    },

    form: {
      serviceName: 'Service Name',
      serviceNameRequired: 'Please enter service name',
      serviceNamePlaceholder: 'Enter a recognizable service name',
      serviceType: 'Service Type',
      serviceTypeRequired: 'Please select service type',
      serviceDescription: 'Service Description',
      serviceDescriptionPlaceholder: 'Brief description of service purpose (optional)',
      serviceAddress: 'Service Address',
      serviceAddressRequired: 'Please enter service address',
      targetIP: 'Target IP Address',
      dnatTargetIP: 'DNAT Target IP',
      lanIP: 'LAN IP Address',
      invalidIPv4: 'Please enter a valid IPv4 address',
      invalidAddress: 'Please enter a valid IP address or domain name',
      bindNode: 'Bind Device',
      bindNodeRequired: 'Please select a device to bind',
      selectNode: 'Select Device',
      noNodes: 'No devices available',
      gatewayNode: 'Gateway',
      provideMode: 'Provide Mode',
      provideModes: {
        direct: 'Direct',
        dnat: 'DNAT',
        lan: 'LAN',
        proxy: 'Proxy',
        public: 'Public'
      },
      lanDisableReason: {
        notGateway: 'This device is not a gateway type, cannot use LAN direct mode',
        noLanIp: 'This device has no LAN IP configured, cannot use LAN direct mode'
      },
      publicDisableReason: 'Must enable authentication first to use public exposure',
      associatedNode: 'Associated Node',
      servicePort: 'Service Port',
      servicePortRequired: 'Please enter port',
      servicePortInvalid: 'Port should be between 1-65535',
      servicePortPlaceholder: '1-65535',
      serviceProtocol: 'Protocol',
      serviceProtocolRequired: 'Please select protocol',
      authRequired: 'Auth Required',
      authType: 'Auth Type',
      authToken: 'Auth Token',
      authUsername: 'Username',
      authPassword: 'Password',
      publicExpose: 'Public Exposure',
      publicExposeWarning: '⚠️ Public exposure requires mandatory authentication, use with caution',
      shareSettings: 'Share Settings',
      shareToFriends: 'Share to Friends',
      shareToPublic: 'Request Public Share',
      shareScope: 'Choose service sharing scope, only friend sharing is supported (requires established friendship)',
      hints: {
        directMode: 'Service running directly on device, accessed via device virtual IP',
        dnatMode: 'Forward to other devices or LAN addresses reachable by device via DNAT (for non-gateway devices)',
        lanMode: 'Device acts as gateway, directly access services in LAN network (must be gateway type with LAN IP configured)',
        proxyMode: 'Forward access through proxy server',
        publicMode: '⚠️ High Risk! Public internet access, strongly recommend using DDNS domain instead of direct IP, authentication required! Public access is not MyNet\'s original intention'
      },
      authTypes: {
        none: 'No Auth',
        bearer: 'Bearer Token',
        basic: 'Basic Auth',
        password: 'Password Auth'
      }
    },

    empty: {
      publicServices: 'No Public Services',
      publicServicesDesc: 'No system services or services from connected devices available yet',
      friendServices: 'No Friend Sharing',
      friendServicesDesc: 'No services have been shared by your friends yet',
      anonymousServices: 'This feature has been deprecated', // Feature removed
      anonymousServicesDesc: 'Anonymous services feature has been removed, please use friend services', // Feature removed
      myServices: 'You haven\'t created any services yet',
      myServicesDesc: 'Click the button below to create your first service'
    },

    messages: {
      createSuccess: 'Service created successfully',
      updateSuccess: 'Service updated successfully',
      deleteSuccess: 'Service deleted successfully',
      shareSuccess: 'Service shared successfully',
      approvalRequested: 'Public approval request submitted'
    },

    errors: {
      loadFailed: 'Failed to load service list',
      createFailed: 'Failed to create service',
      updateFailed: 'Failed to update service',
      deleteFailed: 'Failed to delete service',
      shareFailed: 'Failed to share service',
      approvalFailed: 'Failed to request approval',
      connectFailed: 'Failed to connect to service',
      featureDeprecated: 'Feature Deprecated',
      publicServiceDeprecated: 'Regular users cannot publish public services. Public services are system-only. Connected devices share automatically, and you can use "Friend Sharing" for friends.',
      requiresFriendship: 'Sharing services requires an established friendship. Please add them as a friend first'
    }
  },

  user: {
    overview: 'Overview',
    editProfile: 'Edit Profile',
    security: 'Security Settings',
    preferences: 'Preferences',
    activity: 'Activity Log',

    // Basic information
    basicInfo: 'Basic Information',
    userId: 'User ID',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    bio: 'Bio',
    role: 'Role',
    joinDate: 'Join Date',

    // Statistics
    statistics: 'Statistics',
    totalNodes: 'Total Nodes',
    totalRoutes: 'Total Routes',
    totalFriends: 'Total Friends',
    totalLogins: 'Total Logins',

    // Permissions
    permissions: 'Permissions',
    noPermissions: 'No special permissions',

    // Form related
    nameRequired: 'Please enter name',
    emailRequired: 'Please enter email',
    emailInvalid: 'Invalid email format',
    signature: 'Signature',
    signatureHint: 'A simple signature or motto',
    nameTooLong: 'Name cannot exceed 100 characters',
    phoneTooLong: 'Phone number cannot exceed 20 characters',
    bioHint: 'Tell us a little about yourself',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',

    // Avatar
    changeAvatar: 'Change Avatar',
    avatarUrl: 'Avatar URL',
    avatarUrlHint: 'Enter the URL of your avatar image',
    uploadAvatar: 'Upload Avatar File',
    avatarUpdated: 'Avatar updated successfully',
    avatarUpdateFailed: 'Failed to update avatar',
    avatarSizeLimit: 'Avatar file size cannot exceed 1MB',
    avatarTypeLimit: 'Please select an image file (supports jpeg, png, jpg, gif formats)',

    // Password security
    passwordSecurity: 'Password Security',
    changePassword: 'Change Password',
    changePasswordDesc: 'Change your password regularly to protect account security',
    change: 'Change',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    currentPasswordRequired: 'Please enter current password',
    newPasswordRequired: 'Please enter new password',
    passwordMinLength: 'Password must be at least 8 characters',
    confirmPasswordRequired: 'Please confirm new password',
    passwordMismatch: 'Passwords do not match',
    lastPasswordChange: 'Last password change',
    never: 'Never',
    passwordChanged: 'Password changed successfully',
    passwordChangeFailed: 'Failed to change password',

    // Two-factor authentication
    twoFactorAuth: 'Two-Factor Authentication',
    enable2FA: 'Enable Two-Factor Authentication',
    twoFactorAuthDesc: 'Add extra security protection to your account',
    backupCodes: 'Backup Codes',
    backupCodesDesc: 'Generate backup verification codes for emergencies',
    generateCodes: 'Generate Codes',
    '2faEnabled': 'Two-factor authentication enabled',
    '2faDisabled': 'Two-factor authentication disabled',
    '2faUpdateFailed': 'Failed to update two-factor authentication settings',

    // Session management
    activeSessions: 'Active Sessions',
    currentSession: 'Current Session',
    activeSession: 'Active Session',
    revokeSession: 'Revoke Session',
    sessionRevoked: 'Session revoked',
    sessionRevokeFailed: 'Failed to revoke session',

    // Appearance settings
    appearance: 'Appearance',
    theme: 'Theme',
    themeDesc: 'Choose your preferred interface theme',
    themeAuto: 'Follow System',
    themeLight: 'Light Theme',
    themeDark: 'Dark Theme',
    language: 'Language',
    languageDesc: 'Select interface display language',

    // Notification settings
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive email notifications for important events',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Receive browser push notifications',
    systemAlerts: 'System Alerts',
    systemAlertsDesc: 'Receive system status and security alerts',

    // Activity log
    recentActivity: 'Recent Activity',
    noActivity: 'No activity records',

    // Messages
    profileUpdated: 'Profile updated successfully',
    profileUpdateFailed: 'Failed to update profile',
    preferencesUpdated: 'Preferences updated',
    preferencesUpdateFailed: 'Failed to update preferences',
    preferencesReset: 'Preferences reset to default values',
    resetToDefault: 'Reset to Default',

    // Validation messages
    validation: {
      currentPasswordRequired: 'Current password is required',
      newPasswordRequired: 'New password is required',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      fileTooLarge: 'File size is too large',
      invalidFileType: 'Invalid file type'
    }
  },

  // VPN configuration related translations
  vpn: {
    config: {
      // Basic configuration
      gnbVirtualNetwork: 'GNB Virtual Network',
      wireGuard: 'WireGuard',
      openVPN: 'OpenVPN',
      defaultVersion: 'Default Version (Latest)',
      basicConfig: 'Basic Configuration',
      basicConfigDesc: 'Required basic parameter configuration',
      expertConfig: 'Expert Configuration',
      wireGuardBasicDesc: 'Required WireGuard basic parameters',

      // VPN configuration parameter translations
      nodeId: 'Node ID',
      networkInterface: 'Network Interface Name',
      listenPortConfig: 'Listen Port',
      listenPort: 'Listen Port',
      mtu: 'MTU (Maximum Transmission Unit)',
      multiSocket: 'Multi Socket',
      directForwarding: 'Direct Forwarding',
      unifiedForwarding: 'Unified Forwarding',
      standardForwarding: 'Standard Relay Forwarding',
      addressSecure: 'Address Security',
      ipv4Only: 'IPv4 Only',
      ipv6Only: 'IPv6 Only',
      keepalive: 'Keepalive Interval (seconds)',
      forward: 'Forward Function',
      daemon: 'Daemon Process',
      compression: 'Compression',
      compressionLevel: 'Compression Level',
      memory: 'Memory Scale',
      esArgs: 'ES Arguments',

      // WireGuard parameters
      interfaceAddress: 'Interface Address',
      multiConnection: 'Multi Connection Support',
      daemonMode: 'Daemon Mode',
      dnsServers: 'DNS Servers',
      persistentKeepalive: 'Persistent Keepalive (seconds)',
      allowedIPs: 'Allowed IPs',
      endpoint: 'Endpoint Address',
      fwmark: 'FwMark Firewall Mark',
      routeTable: 'Route Table',
      saveConfigFile: 'Save Configuration',
      preUpScript: 'Pre-Up Script',
      postUpScript: 'Post-Up Script',
      preDownScript: 'Pre-Down Script',
      postDownScript: 'Post-Down Script',
      presharedKey: 'Preshared Key',
      roaming: 'Roaming Support',
      handshakeTimeout: 'Handshake Timeout (seconds)'
    }
  },
  tips: {
    welcome: {
      title: '👋 Welcome to MyNet',
      content: '<p>MyNet helps you build secure virtual networks quickly.</p><p>We will guide you through the basic setup. You can skip at any time.</p>'
    },
    createIpPool: {
      title: '💡 Create IP Pool',
      content: '<p>Click "Create IP Pool" to start. IP pools assign virtual addresses to your devices.</p>'
    },
    addFirstDevice: {
      title: '📱 Add Your First Device',
      content: '<p>Click "Add Device" to connect your first device to the network.</p>'
    },
    choosePath: {
      title: '🎯 Choose Your Learning Path'
    },
    addSecondDevice: {
      title: '📱 Add a Second Device',
      content: '<p>Add another device to experience automatic connections between devices.</p>'
    },
    autoConnection: {
      title: '✨ Auto-Connection Established'
    },
    inviterFriend: {
      title: '👥 Your Inviter Becomes a Friend Automatically',
      content: '<p>Signing up with an invite code makes you and your inviter friends right away — no friend request needed. Only when you join a Network without a code (an admin adds you directly) do you have to search for your inviter on the Friends page and send a request.</p>'
    },
    inviteFriend: {
      title: '📨 Invite a Friend',
      content: '<p>Share your personal invite code or link. Signing up with it puts your friend into your Network and makes them your friend right away. Note: an account that is already registered and uses your code to join does not become a friend automatically — that still takes a mutual friend request.</p>'
    },
    friendDevices: {
      title: '📱 Friend\'s Devices',
      content: '<p>Browse your friend\'s device list and select nodes to connect.</p>'
    },
    createRoute: {
      title: '➕ Create a Connection'
    },
    crossUserConnection: {
      title: '🎉 Cross-User Connection Established'
    },
    connectionManagement: {
      title: '🔗 Connection Management'
    },
    onboardingComplete: {
      title: '🎊 Onboarding Complete!'
    },
    dashboardOverview: {
      title: '📊 Dashboard Overview',
      content: '<p>The dashboard shows your network overview: node status, active connections and resource usage. Access all features from the sidebar.</p>'
    },
    ippoolManagement: {
      title: '🌐 IP Pool Management',
      content: '<p>IP pools assign virtual IP addresses to devices. Use private subnets (e.g. <code>10.0.0.0/24</code>), create multiple pools for different purposes, and avoid conflicts with local networks.</p>'
    },
    nodeManagement: {
      title: '📱 Device Management',
      content: '<p>Devices (nodes) are the basic units of your network. Each device binds to an IP pool, supports GNB/WireGuard/OpenVPN protocols, and config files can be downloaded from the detail page.</p>'
    },
    routeManagement: {
      title: '🔗 Connection Management',
      content: '<p>Routes define connections between devices. Devices of the same user connect automatically; cross-user connections require sending a request and waiting for confirmation.</p>'
    },
    socialManagement: {
      title: '👥 Friends Management',
      content: '<p>Add other users through the friends system. Cross-user connections require mutual friendship. Search by username or email to send friend requests.</p>'
    },
    connectionDetails: {
      title: '🔗 Connection Details',
      content: '<p>Connection details show both endpoint nodes, network parameters and real-time status. Use the topology view to see your full network structure and troubleshoot issues.</p>'
    },
    zoneManagement: {
      title: '🌍 Network Management',
      content: '<p>Networks provide resource isolation — each has independent IP pools, nodes and connections. Contact an admin to request a new Network for multi-environment management.</p>'
    },
    settingsCenter: {
      title: '⚙️ Settings',
      content: '<p>Manage your profile, notification preferences and security options in settings. Supports theme, language and timezone switching.</p>'
    },
    actions: {
      gotIt: 'Got it',
      skip: 'Skip onboarding',
      startSetup: 'Start setup',
      addDevice: 'Add device',
      addAnotherDevice: 'Add another device',
      exploreSelf: 'Explore on my own',
      browseFriendDevices: 'Browse friend\'s devices',
      createConnection: 'Create connection',
      manageConnections: 'Manage connections',
      startUsing: 'Start using',
      deviceExperience: 'Device experience path',
      friendConnection: 'Friend connection path'
    }
  }
}