import { boot } from 'quasar/wrappers'
import debug from "src/utils/debug"
import { apiService } from '../services/api'

export default boot(({ app }) => {
  // 配置全局错误处理
  const handleApiError = (error: any) => {
    debug.error('API Error:', error)
    
    // 根据错误类型显示不同的通知
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || '请求失败'
      
      switch (status) {
        case 401:
          // 未授权，清除认证信息，但不自动跳转
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_info')
          // 移除强制跳转，让路由守卫或组件处理认证失败
          // window.location.href = '/auth/login'
          debug.warn('🔧 [Axios] 401 Unauthorized - Auth tokens cleared')
          break
        case 403:
          // 权限不足
          app.config.globalProperties.$showError('权限不足', '您没有执行此操作的权限')
          break
        case 404:
          // 资源不存在
          app.config.globalProperties.$showError('资源不存在', '请求的资源不存在')
          break
        case 500:
          // 服务器错误
          app.config.globalProperties.$showError('服务器错误', '服务器内部错误，请稍后重试')
          break
        default:
          app.config.globalProperties.$showError('请求失败', message)
      }
    } else if (error.request) {
      // 网络错误
      app.config.globalProperties.$showError('网络错误', '无法连接到服务器，请检查网络连接')
    } else {
      // 其他错误
      app.config.globalProperties.$showError('未知错误', error.message || '发生未知错误')
    }
  }
  
  // 挂载到全局属性
  app.config.globalProperties.$handleApiError = handleApiError
  
  debug.log('🌐 [Boot] Axios configuration initialized')
}) 
