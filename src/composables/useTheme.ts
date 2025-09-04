import { ref, computed } from 'vue'
import { LocalStorage, Dark } from 'quasar'

// 主题类型定义
export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  accentColor: string
  customColors?: Record<string, string>
}

export interface ThemeOption {
  name: string
  value: ThemeMode
  icon: string
  description: string
}

// 默认主题配置
const defaultThemeConfig: ThemeConfig = {
  mode: 'auto',
  primaryColor: '#1976D2',
  accentColor: '#9C27B0'
}

// 预设主题
const presetThemes: Record<string, Partial<ThemeConfig>> = {
  default: {
    primaryColor: '#1976D2',
    accentColor: '#9C27B0'
  },
  green: {
    primaryColor: '#4CAF50',
    accentColor: '#FF9800'
  },
  purple: {
    primaryColor: '#9C27B0',
    accentColor: '#E91E63'
  },
  orange: {
    primaryColor: '#FF9800',
    accentColor: '#795548'
  },
  red: {
    primaryColor: '#F44336',
    accentColor: '#607D8B'
  }
}

// 主题管理 composable
export const useTheme = () => {
  const currentTheme = ref<ThemeConfig>(defaultThemeConfig)
  const isDarkMode = ref(false)
  const isAutoMode = ref(true)
  const mediaQuery = ref<MediaQueryList | null>(null)
  
  // 初始化主题
  const initializeTheme = () => {
    const savedTheme = LocalStorage.getItem('theme_config') as ThemeConfig | null
    if (savedTheme) {
      currentTheme.value = { ...defaultThemeConfig, ...savedTheme }
    } else {
      currentTheme.value = { ...defaultThemeConfig }
    }
    
    applyTheme()
  }
  
  // 设置媒体查询监听
  const setupMediaQuery = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.value.addEventListener('change', handleMediaQueryChange)
      handleMediaQueryChange(mediaQuery.value)
    }
  }
  
  // 处理媒体查询变化
  const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (currentTheme.value.mode === 'auto') {
      isDarkMode.value = e.matches
      applyDarkMode()
    }
  }
  
  // 应用主题
  const applyTheme = () => {
    const theme = currentTheme.value
    
    // 应用主题模式
    applyThemeMode(theme.mode)
    
    // 应用主题颜色
    applyThemeColors(theme)
    
    // 保存主题配置
    LocalStorage.set('theme_config', theme)
  }
  
  // 应用主题模式
  const applyThemeMode = (mode: ThemeMode) => {
    isAutoMode.value = mode === 'auto'
    
    switch (mode) {
      case 'light':
        isDarkMode.value = false
        break
      case 'dark':
        isDarkMode.value = true
        break
      case 'auto':
        // 使用媒体查询检测系统主题
        if (mediaQuery.value) {
          isDarkMode.value = mediaQuery.value.matches
        }
        break
    }
    
    applyDarkMode()
  }
  
  // 应用深色模式
  const applyDarkMode = () => {
    Dark.set(isDarkMode.value)
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }
  
  // 应用主题颜色
  const applyThemeColors = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    // 设置CSS变量
    root.style.setProperty('--q-primary', theme.primaryColor)
    root.style.setProperty('--q-accent', theme.accentColor)
    
    // 应用自定义颜色
    if (theme.customColors) {
      Object.entries(theme.customColors).forEach(([key, value]) => {
        root.style.setProperty(`--q-${key}`, value)
      })
    }
  }
  
  // 设置主题模式
  const setThemeMode = (mode: ThemeMode) => {
    currentTheme.value.mode = mode
    applyTheme()
    console.log(`Theme mode changed to: ${mode}`)
  }
  
  // 设置主题颜色
  const setThemeColors = (primaryColor: string, accentColor?: string) => {
    currentTheme.value.primaryColor = primaryColor
    if (accentColor) {
      currentTheme.value.accentColor = accentColor
    }
    applyTheme()
    console.log(`Theme colors changed: primary=${primaryColor}, accent=${accentColor}`)
  }
  
  // 应用预设主题
  const applyPresetTheme = (presetName: string) => {
    const preset = presetThemes[presetName]
    if (preset) {
      currentTheme.value = { ...currentTheme.value, ...preset }
      applyTheme()
      console.log(`Preset theme applied: ${presetName}`)
    }
  }
  
  // 设置自定义主题
  const setCustomTheme = (config: Partial<ThemeConfig>) => {
    currentTheme.value = { ...currentTheme.value, ...config }
    applyTheme()
    console.log('Custom theme applied:', config)
  }
  
  // 重置主题
  const resetTheme = () => {
    currentTheme.value = { ...defaultThemeConfig }
    applyTheme()
    console.log('Theme reset to default')
  }
  
  // 获取当前主题
  const getCurrentTheme = (): ThemeConfig => {
    return { ...currentTheme.value }
  }
  
  // 获取主题模式
  const getThemeMode = (): ThemeMode => {
    return currentTheme.value.mode
  }
  
  // 获取是否深色模式
  const getIsDarkMode = (): boolean => {
    return isDarkMode.value
  }
  
  // 获取主题选项
  const getThemeOptions = (): ThemeOption[] => {
    return [
      {
        name: 'Light',
        value: 'light',
        icon: 'light_mode',
        description: 'Light theme'
      },
      {
        name: 'Dark',
        value: 'dark',
        icon: 'dark_mode',
        description: 'Dark theme'
      },
      {
        name: 'Auto',
        value: 'auto',
        icon: 'brightness_auto',
        description: 'Follow system preference'
      }
    ]
  }
  
  // 获取预设主题
  const getPresetThemes = () => {
    return presetThemes
  }
  
  // 销毁
  const destroy = () => {
    if (mediaQuery.value) {
      mediaQuery.value.removeEventListener('change', handleMediaQueryChange)
    }
  }
  
  // 计算属性
  const themeMode = computed(() => currentTheme.value.mode)
  const isDark = computed(() => isDarkMode.value)
  
  return {
    // 状态
    currentTheme,
    themeMode,
    isDark,
    
    // 方法
    initializeTheme,
    setupMediaQuery,
    setThemeMode,
    setThemeColors,
    applyPresetTheme,
    setCustomTheme,
    resetTheme,
    getCurrentTheme,
    getThemeMode,
    getIsDarkMode,
    getThemeOptions,
    getPresetThemes,
    destroy
  }
} 