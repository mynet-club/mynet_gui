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
    notifications: 'Notifications'
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
    dashboard: 'Dashboard',
    nodes: 'Node Management',
    routes: 'Route Management'
  },
  routes: {
    title: 'Route Management',
    name: 'Route Name',
    destination: 'Destination',
    gateway: 'Gateway',
    status: 'Status'
  },
  zones: {
    switchZone: 'Switch Zone',
    selectZone: 'Select Zone',
    switchedTo: 'Switched to {zoneName}',
    switchFailed: 'Failed to switch zone'
  },
  websocket: {
    connected: 'Connected',
    disconnected: 'Disconnected',
    heartbeat: 'Heartbeat'
  }
} 