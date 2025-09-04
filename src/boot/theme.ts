import { boot } from 'quasar/wrappers'
import { Dark, LocalStorage } from 'quasar'

export default boot(({ app }) => {
  // 从本地存储获取主题设置
  const savedDarkMode = LocalStorage.getItem('darkMode')
  
  if (savedDarkMode !== null) {
    // 设置深色模式
    Dark.set(savedDarkMode === 'true')
  } else {
    // 默认跟随系统设置
    Dark.set('auto')
  }
  
  // 监听系统主题变化
  // Dark.setAuto(true) // 这个方法不存在，使用媒体查询监听
  
  // 主题切换函数
  const toggleDarkMode = () => {
    const newMode = !Dark.isActive
    Dark.set(newMode)
    LocalStorage.set('darkMode', newMode)
  }
  
  // 设置主题函数
  const setDarkMode = (isDark: boolean) => {
    Dark.set(isDark)
    LocalStorage.set('darkMode', isDark)
  }
  
  // 获取当前主题状态
  const getDarkMode = () => {
    return Dark.isActive
  }
  
  // 挂载到全局属性
  app.config.globalProperties.$toggleDarkMode = toggleDarkMode
  app.config.globalProperties.$setDarkMode = setDarkMode
  app.config.globalProperties.$getDarkMode = getDarkMode
  
  console.log('🎨 [Boot] Theme system initialized, dark mode:', Dark.isActive)
}) 