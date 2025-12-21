import { boot } from 'quasar/wrappers'
import debug from "src/utils/debug"
import { Dark, LocalStorage } from 'quasar'

export default boot(({ app }) => {
  // 从本地存储获取主题设置（优先使用 user_theme，兼容旧的 darkMode）
  const savedTheme = LocalStorage.getItem('user_theme') as string | null
  const savedDarkMode = LocalStorage.getItem('darkMode')
  
  if (savedTheme) {
    // 新的主题系统：'light' | 'dark' | 'auto'
    switch (savedTheme) {
      case 'light':
        Dark.set(false)
        break
      case 'dark':
        Dark.set(true)
        break
      case 'auto':
      default:
        Dark.set('auto')
        break
    }
    debug.log('🎨 [Boot] Applied theme from user_theme:', savedTheme)
  } else if (savedDarkMode !== null) {
    // 兼容旧的 darkMode 设置
    Dark.set(savedDarkMode === 'true')
    debug.log('🎨 [Boot] Applied legacy darkMode:', savedDarkMode)
  } else {
    // 默认跟随系统设置
    Dark.set('auto')
    debug.log('🎨 [Boot] Using auto theme (system preference)')
  }
  
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
  
  debug.log('🎨 [Boot] Theme system initialized, dark mode:', Dark.isActive)
}) 
