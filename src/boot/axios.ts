import { boot } from 'quasar/wrappers'
import debug from 'src/utils/debug'
import { apiService } from '../services/api'

export default boot(({ app }) => {
  // Configure global error handling
  const handleApiError = (error: any) => {
    debug.error('API Error:', error)
    
    // Show different notifications based on error type
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || 'Request failed'
      
      switch (status) {
        case 401:
          // Unauthorized, clear auth info but don't auto redirect
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_info')
          // Remove forced redirect, let route guard or component handle auth failure
          // window.location.href = '/auth/login'
          debug.warn('🔧 [Axios] 401 Unauthorized - Auth tokens cleared')
          break
        case 403:
          // Insufficient permissions
          app.config.globalProperties.$showError('Insufficient Permissions', 'You do not have permission to perform this action')
          break
        case 404:
          // Resource not found
          app.config.globalProperties.$showError('Resource Not Found', 'The requested resource does not exist')
          break
        case 500:
          // Server error
          app.config.globalProperties.$showError('Server Error', 'Internal server error, please try again later')
          break
        default:
          app.config.globalProperties.$showError('Request Failed', message)
      }
    } else if (error.request) {
      // Network error
      app.config.globalProperties.$showError('Network Error', 'Unable to connect to server, please check your network connection')
    } else {
      // Other error
      app.config.globalProperties.$showError('Unknown Error', error.message || 'An unknown error occurred')
    }
  }
  
  // Mount to global properties
  app.config.globalProperties.$handleApiError = handleApiError
  
  debug.log('🌐 [Boot] Axios configuration initialized')
}) 
