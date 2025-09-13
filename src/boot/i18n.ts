import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'

import zhCN from '../i18n/zh-CN'
import enUS from '../i18n/en-US'

console.log('🌐 [Boot] i18n module loaded')
console.log('🌐 [Boot] zhCN loaded:', zhCN)
console.log('🌐 [Boot] zhCN.auth:', zhCN.auth)
console.log('🌐 [Boot] enUS loaded:', enUS)

// 准备messages对象
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

console.log('🌐 [Boot] Prepared messages object:', messages)
console.log('🌐 [Boot] Messages zh-CN keys:', Object.keys(messages['zh-CN']))

// 获取初始语言设置
const getStoredLocale = (): 'zh-CN' | 'en-US' => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('app-locale')
    if (stored === 'zh-CN' || stored === 'en-US') {
      return stored
    }
  }
  return 'zh-CN'  // 恢复默认使用中文，保持和之前一致
}

const initialLocale = getStoredLocale()
console.log('🌐 [Boot] Initial locale:', initialLocale)

// 创建稳定的翻译函数
const createStableTranslator = () => {
  return (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    const currentLocale = getStoredLocale()
    let value: any = messages[currentLocale] || messages['zh-CN']
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    if (value && typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match: string, param: string) => 
        params[param] !== undefined ? String(params[param]) : match
      )
    }
    
    return typeof value === 'string' ? value : key
  }
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'zh-CN',  // 恢复fallback为中文，保持和之前一致
  messages: messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
  silentTranslationWarn: true,
  // 强制运行时模式，避免编译时优化问题
  allowComposition: true,
  warnHtmlMessage: false,
  // 禁用所有编译时优化
  runtimeOnly: false,
  compositionOnly: false
})

// 创建稳定的翻译实例
const stableTranslator = createStableTranslator()

// 语言切换函数
export const setLocale = (locale: 'zh-CN' | 'en-US') => {
  console.log('🌐 [i18n] Switching language to:', locale)
  i18n.global.locale.value = locale
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app-locale', locale)
  }
  
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
    document.documentElement.setAttribute('data-locale', locale)
  }
}

export const getLocale = () => i18n.global.locale.value

export const getSupportedLocales = () => {
  return [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' }
  ]
}

export default boot(({ app }: { app: any }) => {
  console.log('🌐 [Boot] Installing i18n plugin')
  
  // 安装 i18n 插件
  app.use(i18n)
  
  // 设置初始语言
  const currentLocale = getStoredLocale()
  i18n.global.locale.value = currentLocale
  
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLocale
    document.documentElement.setAttribute('data-locale', currentLocale)
  }
  
  // 挂载全局函数
  app.config.globalProperties.$setLocale = setLocale
  app.config.globalProperties.$getLocale = getLocale
  app.config.globalProperties.$getSupportedLocales = getSupportedLocales
  app.config.globalProperties.$st = stableTranslator // 稳定翻译函数
  
  console.log('🌐 [Boot] i18n initialized successfully')
  
  // 验证翻译功能
  nextTick(() => {
    console.log('🌐 [Boot] Running validation...')
    
    // 测试 Vue i18n 的 t() 函数
    const vueTranslation = i18n.global.t('auth.loginTitle')
    console.log('🌐 [Boot] Vue i18n translation:', vueTranslation)
    
    // 测试稳定翻译函数
    const stableTranslation = stableTranslator('auth.loginTitle')
    console.log('🌐 [Boot] Stable translation:', stableTranslation)
    
    // 强制修复生产环境翻译问题
    if (vueTranslation === 'auth.loginTitle' || typeof vueTranslation !== 'string' || vueTranslation.length === 0) {
      console.log('🌐 [Boot] Vue i18n failed in production, applying comprehensive fix...')
      
      // 1. 修复全局 t() 函数
      const originalGlobalT = i18n.global.t.bind(i18n.global)
      i18n.global.t = (key: string, params?: any) => {
        try {
          const result = originalGlobalT(key, params)
          if (result === key || typeof result !== 'string' || result.length === 0) {
            return stableTranslator(key, params)
          }
          return result
        } catch (error) {
          console.warn('🌐 [Boot] Global t() error, using stable translator:', error)
          return stableTranslator(key, params)
        }
      }
      
      // 2. 修复所有组件实例的 $t() 函数 - 这是关键！
      app.mixin({
        beforeCreate() {
          if (this.$t && typeof this.$t === 'function') {
            console.log('🌐 [Boot] Patching component $t() function')
            const originalT = this.$t.bind(this)
            this.$t = (key: string, params?: any) => {
              try {
                const result = originalT(key, params)
                if (result === key || typeof result !== 'string' || result.length === 0) {
                  return stableTranslator(key, params)
                }
                return result
              } catch (error) {
                console.warn('🌐 [Boot] Component $t() error, using stable translator:', error)
                return stableTranslator(key, params)
              }
            }
          }
        }
      })
      
      // 3. 为全局提供备用翻译
      if (typeof window !== 'undefined') {
        (window as any).__stable_translate = stableTranslator
        console.log('🌐 [Boot] Stable translator mounted to window.__stable_translate')
      }
      
      // 4. 强制重新设置locale
      try {
        i18n.global.locale.value = currentLocale
        console.log('🌐 [Boot] Forced locale reset to:', currentLocale)
      } catch (error) {
        console.warn('🌐 [Boot] Failed to reset locale:', error)
      }
      
      // 验证修复效果
      const fixedTranslation = i18n.global.t('auth.loginTitle')
      console.log('🌐 [Boot] Fixed global t() function result:', fixedTranslation)
      
      if (fixedTranslation !== 'auth.loginTitle' && typeof fixedTranslation === 'string') {
        console.log('🌐 [Boot] ✅ Comprehensive t() function fix applied successfully!')
      }
    } else {
      console.log('🌐 [Boot] ✅ Vue i18n working correctly!')
    }
  })
})

// 导出 i18n 实例
export { i18n }
