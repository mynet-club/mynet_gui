import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'

export default boot(({ app }) => {
  // 配置全局通知设置
  Notify.setDefaults({
    position: 'top-right',
    timeout: 3000,
    textColor: 'white',
    actions: [
      { icon: 'close', color: 'white' }
    ]
  })
  
  // 创建通知函数
  const showSuccess = (message: string, caption?: string) => {
    Notify.create({
      type: 'positive',
      message,
      caption,
      icon: 'check_circle'
    })
  }
  
  const showError = (message: string, caption?: string) => {
    Notify.create({
      type: 'negative',
      message,
      caption,
      icon: 'error'
    })
  }
  
  const showWarning = (message: string, caption?: string) => {
    Notify.create({
      type: 'warning',
      message,
      caption,
      icon: 'warning'
    })
  }
  
  const showInfo = (message: string, caption?: string) => {
    Notify.create({
      type: 'info',
      message,
      caption,
      icon: 'info'
    })
  }
  
  // 挂载到全局属性
  app.config.globalProperties.$showSuccess = showSuccess
  app.config.globalProperties.$showError = showError
  app.config.globalProperties.$showWarning = showWarning
  app.config.globalProperties.$showInfo = showInfo
  
  console.log('🔔 [Boot] Notification system initialized')
}) 