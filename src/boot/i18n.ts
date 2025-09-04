import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { LocalStorage } from 'quasar'

// 导入语言包
import zhCN from '../i18n/zh-CN'
import enUS from '../i18n/en-US'

console.log('🌐 [Boot] i18n module loaded')

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh-CN', // 开发阶段固定使用中文
  fallbackLocale: 'zh-CN', // 回退语言也设为中文
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  globalInjection: true, // 全局注入 $t 函数
  silentTranslationWarn: true, // 静默翻译警告
  missingWarn: false, // 静默缺失翻译警告
  fallbackWarn: false // 静默回退警告
})

// 开发阶段暂时注释掉语言切换功能
// 语言切换函数
export const setLocale = (locale: 'zh-CN' | 'en-US') => {
  // 开发阶段固定中文，不切换语言
  console.log('🌐 [Dev] Language switching disabled, keeping zh-CN')
  // i18n.global.locale.value = locale
  // LocalStorage.set('locale', locale)
  // document.documentElement.lang = locale
  // document.documentElement.setAttribute('data-locale', locale)
}

// 获取当前语言
export const getLocale = () => {
  return 'zh-CN' // 开发阶段固定返回中文
  // return i18n.global.locale.value
}

// 获取支持的语言列表
export const getSupportedLocales = () => {
  return [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' }
    // 开发阶段暂时只显示中文选项
    // { code: 'en-US', name: 'English', flag: '🇺🇸' }
  ]
}

export default boot(({ app }: { app: any }) => {
  console.log('🌐 [Boot] Installing i18n plugin (Development Mode - Chinese Only)')
  
  // 安装 i18n 插件
  app.use(i18n)
  
  // 开发阶段固定使用中文
  document.documentElement.lang = 'zh-CN'
  document.documentElement.setAttribute('data-locale', 'zh-CN')
  
  // 将语言切换函数挂载到全局属性
  app.config.globalProperties.$setLocale = setLocale
  app.config.globalProperties.$getLocale = getLocale
  app.config.globalProperties.$getSupportedLocales = getSupportedLocales
  
  console.log('🌐 [Boot] i18n initialized with locale: zh-CN (Development Mode)')
})

// 导出 i18n 实例供其他模块使用
export { i18n } 