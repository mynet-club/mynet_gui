import { ref, onMounted } from 'vue'
import { useQuasar, LocalStorage } from 'quasar'
import { useI18n } from 'vue-i18n'

export interface UserPreferences {
  language: string
  timezone: string
  theme: string
  notifications: {
    email: boolean
    sms: boolean
    app: boolean
  }
  privacy: {
    profile_visibility: string
    allow_search: boolean
  }
}

export function usePreferencesManagement() {
  const $q = useQuasar()
  const { t } = useI18n()

  // 偏好设置数据
  const preferences = ref<UserPreferences>({
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    theme: 'auto',
    notifications: {
      email: true,
      sms: false,
      app: true
    },
    privacy: {
      profile_visibility: 'public',
      allow_search: true
    }
  })

  // 加载状态
  const loading = ref({
    preferences: false,
    saving: false
  })

  // 可用选项
  const options = {
    languages: [
      { label: '中文', value: 'zh-CN' },
      { label: 'English', value: 'en-US' },
      { label: '日本語', value: 'ja-JP' }
    ],
    timezones: [
      { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
      { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
      { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
      { label: '伦敦时间 (UTC+0)', value: 'Europe/London' }
    ],
    themes: [
      { label: '自动', value: 'auto' },
      { label: '明亮', value: 'light' },
      { label: '暗黑', value: 'dark' }
    ],
    profileVisibility: [
      { label: '公开', value: 'public' },
      { label: '好友可见', value: 'friends' },
      { label: '私密', value: 'private' }
    ]
  }

  // 加载偏好设置
  const loadPreferences = async () => {
    try {
      loading.value.preferences = true
      
      // 从 LocalStorage 加载偏好设置
      const savedPreferences = LocalStorage.getItem('user_preferences') as UserPreferences | null
      if (savedPreferences) {
        preferences.value = {
          ...preferences.value,
          ...savedPreferences
        }
      }
      
      console.log('🔧 [Preferences] Loaded preferences:', preferences.value)
    } catch (error) {
      console.error('加载偏好设置失败:', error)
      // 使用默认设置，不显示错误
    } finally {
      loading.value.preferences = false
    }
  }

  // 保存偏好设置
  const savePreferences = async () => {
    try {
      loading.value.saving = true
      
      // 保存到 LocalStorage
      LocalStorage.set('user_preferences', preferences.value)
      
      console.log('🔧 [Preferences] Saved preferences:', preferences.value)
      
      $q.notify({
        type: 'positive',
        message: '偏好设置已保存'
      })
      return true
    } catch (error: any) {
      console.error('保存偏好设置失败:', error)
      
      $q.notify({
        type: 'negative',
        message: '保存偏好设置失败'
      })
      
      return false
    } finally {
      loading.value.saving = false
    }
  }

  // 重置偏好设置
  const resetPreferences = () => {
    preferences.value = {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      theme: 'auto',
      notifications: {
        email: true,
        sms: false,
        app: true
      },
      privacy: {
        profile_visibility: 'public',
        allow_search: true
      }
    }
  }

  // 更新语言设置
  const updateLanguage = (newLanguage: string) => {
    preferences.value.language = newLanguage
    // 触发语言切换
    // TODO: 与 i18n 集成
  }

  // 更新主题设置
  const updateTheme = (newTheme: string) => {
    preferences.value.theme = newTheme
    // 触发主题切换
    // TODO: 与 Quasar 主题系统集成
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadPreferences()
  })

  return {
    preferences,
    loading,
    options,
    loadPreferences,
    savePreferences,
    resetPreferences,
    updateLanguage,
    updateTheme
  }
}
