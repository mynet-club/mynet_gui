export default {
  app: {
    name: 'MyNet',
    tagline: 'Advanced Network Management System'
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
    navigation: 'Navigation'
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
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Please sign in to your account',
    registerTitle: 'Create Account',
    registerSubtitle: 'Please fill in the information below',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordSubtitle: 'Please enter your email address',
    emailVerificationTitle: 'Email Verification',
    emailVerificationSubtitle: 'Please enter the verification code',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginButton: 'Sign In',
    registerButton: 'Sign Up',
    sendResetLink: 'Send Reset Link',
    verifyEmail: 'Verify Email',
    resendCode: 'Resend Code',
    verificationCode: 'Verification Code',
    agreeTerms: 'I agree to the terms of service',
    noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    rememberPassword: 'Remember your password?',
    backToLogin: 'Back to Login',
    loginLink: 'Sign In',
    registerLink: 'Sign Up',
    continueToLogin: 'Continue to Login',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    confirmPasswordRequired: 'Please confirm your password',
    nameRequired: 'Name is required',
    emailInvalid: 'Please enter a valid email address',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    verificationCodeRequired: 'Verification code is required',
    loginFailed: 'Login failed. Please check your credentials',
    registrationSuccessful: 'Registration successful! Please check your email for verification',
    passwordResetSent: 'Password reset link sent to your email!',
    emailVerified: 'Email verified successfully!',
    verificationCodeSent: 'Verification code sent!',
    resendCooldown: 'Resend available in {seconds} seconds',
    verificationSuccess: 'Verification Successful',
    verificationSuccessSubtitle: 'Your email has been verified. You can now sign in'
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
    type: 'Node Type',
    status: 'Status',
    ipAddress: 'IP Address',
    port: 'Port'
  },
  navigation: {
    mainFeatures: 'Main Features',
    networkConfig: 'Network Configuration',
    systemTools: 'System Tools',
    dashboard: 'Dashboard',
    nodes: 'Node Management',
    routes: 'Route Management',
    ippools: 'IP Pool Management',
    zones: 'Zone Management',
    social: 'Social Network',
    apiTest: 'API Testing',
    help: 'Help Documentation'
  },
  routes: {
    title: 'Route Management',
    name: 'Route Name',
    destination: 'Destination',
    gateway: 'Gateway',
    status: 'Status'
  },
  zones: {
    subtitle: 'Network zone management and configuration',
    switchZone: 'Switch Zone',
    selectZone: 'Select Zone',
    switchedTo: 'Switched to {zoneName}',
    switchFailed: 'Failed to switch zone',
    comingSoonMessage: 'Zone management feature is under development, stay tuned!'
  },
  social: {
    subtitle: 'Social network connections and user management',
    comingSoonMessage: 'Social network feature is under development, stay tuned!',
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
      lastActive: 'Last Active'
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
        rejected: 'Rejected'
      }
    },
    // User search
    search: {
      title: 'Search Users',
      placeholder: 'Enter username or email...',
      noResults: 'No matching users found',
      addFriend: 'Add Friend',
      requested: 'Requested',
      friend: 'Already Friends',
      zone: 'Zone',
      lastActive: 'Last Active'
    },
    // Invitations
    invitations: {
      title: 'Invitation Management',
      createNew: 'Create New Invitation',
      code: 'Invitation Code',
      status: 'Status',
      expiresAt: 'Expires At',
      usedAt: 'Used At',
      usedBy: 'Used By',
      createdAt: 'Created At',
      copyCode: 'Copy Code',
      active: 'Active',
      used: 'Used',
      expired: 'Expired',
      noInvitations: 'No invitations yet'
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
      },
      createInvitation: {
        title: 'Create Invitation',
        expiresIn: 'Expires In (days)',
        create: 'Create',
        cancel: 'Cancel'
      }
    },
    // Action messages
    friendRequestSent: 'Friend request sent',
    friendRequestAccepted: 'Friend request accepted',
    friendRequestRejected: 'Friend request rejected',
    friendRemoved: 'Friend "{name}" removed',
    invitationCreated: 'Invitation code created',
    invitationCopied: 'Invitation code copied to clipboard',
    // Error messages
    fetchOverviewError: 'Failed to fetch social overview',
    fetchFriendsError: 'Failed to fetch friends list',
    searchUsersError: 'Failed to search users',
    fetchRequestsError: 'Failed to fetch friend requests',
    friendRequestError: 'Failed to send friend request',
    friendRequestAcceptError: 'Failed to accept friend request',
    friendRequestRejectError: 'Failed to reject friend request',
    friendRemoveError: 'Failed to remove friend',
    fetchInvitationsError: 'Failed to fetch invitations',
    invitationCreateError: 'Failed to create invitation',
    fetchFriendNodesError: 'Failed to fetch friend nodes'
  },
  ippools: {
    subtitle: 'IP address pool management and allocation',
    comingSoonMessage: 'IP pool management feature is under development, stay tuned!'
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
    heartbeat: 'Heartbeat'
  }
}