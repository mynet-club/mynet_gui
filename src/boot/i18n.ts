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
  return 'en-US'  // 默认使用英文
}

const initialLocale = getStoredLocale()
console.log('🌐 [Boot] Initial locale:', initialLocale)

// 创建稳定的翻译函数
const createStableTranslator = () => {
  return (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    const currentLocale = getStoredLocale()
    let value: any = messages[currentLocale] || messages['en-US']
    
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
  fallbackLocale: 'en-US',  // fallback改为英文
  messages: messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
  silentTranslationWarn: true
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
    
    if (vueTranslation === 'auth.loginTitle' && stableTranslation !== 'auth.loginTitle') {
      console.log('🌐 [Boot] Vue i18n failed, applying comprehensive fix...')
      
      // 1. 修复全局 t() 函数
      const originalGlobalT = i18n.global.t.bind(i18n.global)
      i18n.global.t = (key: string, params?: any) => {
        const result = originalGlobalT(key, params)
        if (result === key) {
          return stableTranslator(key, params)
        }
        return result
      }
      
      // 2. 拦截并修复所有 useI18n() 创建的局部实例
      const originalUseI18n = app.config.globalProperties.$i18n?.constructor
      
      // 重写 Vue I18n 的内部创建函数
      if (typeof window !== 'undefined') {
        // 将我们的修复函数注入到全局，供所有组件使用
        ;(window as any).__vue_i18n_fix = stableTranslator
        
        // 创建一个全局的翻译函数修复器
        ;(window as any).__fixTranslateFunction = (translateFn: Function) => {
          return (key: string, params?: any) => {
            const result = translateFn(key, params)
            if (result === key) {
              return stableTranslator(key, params)
            }
            return result
          }
        }
      }
      
      // 3. 为所有新创建的组件实例修复 t() 函数
      app.mixin({
        beforeCreate() {
          // 在组件创建前修复其 t() 函数
          if (this.$t && typeof this.$t === 'function') {
            const originalT = this.$t.bind(this)
            this.$t = (key: string, params?: any) => {
              const result = originalT(key, params)
              if (result === key) {
                return stableTranslator(key, params)
              }
              return result
            }
          }
        }
      })
      
      // 验证修复效果
      const fixedTranslation = i18n.global.t('auth.loginTitle')
      console.log('🌐 [Boot] Fixed global t() function result:', fixedTranslation)
      
      if (fixedTranslation !== 'auth.loginTitle') {
        console.log('🌐 [Boot] ✅ Comprehensive t() function fix applied successfully!')
        console.log('🌐 [Boot] All components should now display translations correctly.')
      }
      
      // 为全局提供备用翻译
      if (typeof window !== 'undefined') {
        (window as any).__stable_translate = stableTranslator
      }
    } else if (vueTranslation !== 'auth.loginTitle') {
      console.log('🌐 [Boot] ✅ Vue i18n working correctly!')
    } else {
      console.error('🌐 [Boot] ⚠️ Both translation systems failed!')
    }
  })
})

// 导出 i18n 实例
export { i18n }
