<template>
  <div class="index-page">
    <!-- 右上角设置按钮 -->
    <div class="settings-controls">
      <!-- 主题切换 -->
      <q-btn
        round
        flat
        :icon="getThemeIcon()"
        color="white"
        class="q-mr-sm"
      >
        <q-tooltip>{{ getThemeLabel() }}</q-tooltip>
        <q-badge v-if="currentTheme" color="primary" floating class="text-caption">
          {{ getThemeBadgeText() }}
        </q-badge>
        <q-menu
          anchor="bottom right"
          self="top right"
        >
          <q-list style="min-width: 150px">
            <q-item
              v-for="theme in themeOptions"
              :key="theme.value"
              clickable
              v-close-popup
              @click="changeTheme(theme.value)"
              :class="{ 'bg-blue-1': currentTheme === theme.value }"
            >
              <q-item-section avatar>
                <q-icon :name="theme.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ theme.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="currentTheme === theme.value">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      
      <!-- 语言切换 -->
      <q-btn
        round
        flat
        icon="translate"
        color="white"
      >
        <q-tooltip>{{ getCurrentLanguageLabel() }}</q-tooltip>
        <q-badge v-if="currentLanguage" color="primary" floating class="text-caption">
          {{ currentLanguage === 'zh-CN' ? '中' : 'EN' }}
        </q-badge>
        <q-menu
          anchor="bottom right"
          self="top right"
        >
          <q-list style="min-width: 150px">
            <q-item
              v-for="lang in supportedLanguages"
              :key="lang.value"
              clickable
              v-close-popup
              @click="changeLanguage(lang.value)"
              :class="{ 'bg-blue-1': currentLanguage === lang.value }"
            >
              <q-item-section>
                <q-item-label>{{ lang.nativeName }}</q-item-label>
                <q-item-label caption>{{ lang.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="currentLanguage === lang.value">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <div class="index-content">
      <div class="text-h4 q-mb-md">{{ $t('welcome.title') }}</div>
      <div class="text-subtitle1">{{ $t('welcome.subtitle') }}</div>
      
      <!-- 年龄验证勾选框 -->
      <div v-if="!isAuthenticated" class="age-verification q-mt-lg">
        <q-checkbox
          v-model="ageVerified"
          :label="$t('auth.ageVerification')"
          color="primary"
          keep-color
          class="text-white"
        />
      </div>
      
      <div v-if="!isAuthenticated && ageVerified" class="action-buttons">
        <q-btn 
          class="q-mt-md q-mr-sm"
          color="primary"
          :label="$t('auth.login')"
          to="/auth/login"
          size="lg"
        />
        <q-btn 
          class="q-mt-md"
          color="secondary"
          :label="$t('auth.register')"
          to="/auth/register"
          size="lg"
          outline
        />
      </div>
      
      <!-- 未勾选协议时显示未成年人保护信息 -->
      <div v-if="!isAuthenticated && !ageVerified" class="minor-protection q-mt-lg">
        <div class="protection-card">
          <q-icon name="shield" color="warning" size="3em" class="q-mb-md" />
          <div class="text-h6 q-mb-md">{{ $t('auth.minorProtectionTitle') }}</div>
          <div class="text-body2">{{ $t('auth.minorProtectionMessage') }}</div>
        </div>
      </div>
      
      <!-- 已认证时显示重定向信息 -->
      <div v-if="isAuthenticated" class="loading-section">
        <q-spinner color="primary" size="3em" class="q-mt-md" />
        <div class="q-mt-md">{{ $t('welcome.redirecting') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import debug from "src/utils/debug"
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, LocalStorage } from 'quasar'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()
const $q = useQuasar()

// 主题相关
const { currentTheme: themeConfig, setThemeMode, getThemeOptions } = useTheme()

// 响应式状态
const currentTheme = ref(LocalStorage.getItem('user_theme') || 'auto')
const currentLanguage = ref(locale.value)
const ageVerified = ref(false)

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 支持的语言
const supportedLanguages = computed(() => [
  { label: 'Chinese', value: 'zh-CN', icon: 'translate', nativeName: '中文' },
  { label: 'English', value: 'en-US', icon: 'translate', nativeName: 'English' }
])

// 主题选项
const themeOptions = computed(() => [
  { label: t('settings.themes.auto'), value: 'auto', icon: 'brightness_auto' },
  { label: t('settings.themes.light'), value: 'light', icon: 'light_mode' },
  { label: t('settings.themes.dark'), value: 'dark', icon: 'dark_mode' }
])

// 主题切换相关方法
const getThemeIcon = () => {
  switch (currentTheme.value) {
    case 'light': return 'light_mode'
    case 'dark': return 'dark_mode'
    default: return 'brightness_auto'
  }
}

const getThemeLabel = () => {
  switch (currentTheme.value) {
    case 'light': return t('settings.themes.light')
    case 'dark': return t('settings.themes.dark')
    default: return t('settings.themes.auto')
  }
}

const getCurrentLanguageLabel = () => {
  const lang = supportedLanguages.value.find(l => l.value === currentLanguage.value)
  return lang?.nativeName || t('user.language')
}

const getThemeBadgeText = () => {
  switch (currentTheme.value) {
    case 'light': return 'L'
    case 'dark': return 'D'
    default: return 'A'
  }
}

const changeTheme = async (newTheme: string) => {
  debug.log('🎨 [IndexPage] Changing theme to:', newTheme)
  
  try {
    currentTheme.value = newTheme
    setThemeMode(newTheme as any)
    
    // 保存到本地存储
    LocalStorage.set('user_theme', newTheme)
    
    // 如果用户已登录，同步到服务端
    if (isAuthenticated.value) {
      try {
        const { apiService } = await import('../services/api')
        await apiService.updateUserProfile({ theme: newTheme })
        debug.log('🎨 [IndexPage] Theme synced to server:', newTheme)
      } catch (apiError) {
        debug.warn('🎨 [IndexPage] Failed to sync theme to server (API may not support theme field yet):', apiError)
        // 服务端可能还不支持theme字段，不影响本地使用
      }
    }
    
    debug.log('🎨 [IndexPage] Theme changed successfully to:', newTheme)
  } catch (error) {
    debug.error('🎨 [IndexPage] Unexpected error in changeTheme:', error)
  }
}

// 语言切换方法
const changeLanguage = async (newLanguage: string) => {
  try {
    debug.log('🌐 [IndexPage] Changing language to:', newLanguage)
    
    // 动态导入 setLocale 函数
    const { setLocale } = await import('../boot/i18n')
    await setLocale(newLanguage as 'zh-CN' | 'en-US')
    
    currentLanguage.value = newLanguage
    locale.value = newLanguage as any
    
    // 保存到本地存储 - 使用与i18n配置一致的键名
    LocalStorage.set('app-locale', newLanguage)
    
    // 如果用户已登录，同步到服务端
    if (isAuthenticated.value) {
      try {
        const { apiService } = await import('../services/api')
        await apiService.updateUserProfile({ language: newLanguage })
        debug.log('🌐 [IndexPage] Language synced to server:', newLanguage)
      } catch (apiError) {
        debug.warn('🌐 [IndexPage] Failed to sync language to server:', apiError)
      }
    }
    
    debug.log('🌐 [IndexPage] Language changed successfully to:', newLanguage)
    
  } catch (error) {
    debug.error('🌐 [IndexPage] Language change failed:', error)
  }
}

// 监听认证状态变化，已认证用户自动重定向到dashboard
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    debug.log('🏠 [IndexPage] User authenticated, redirecting to dashboard')
    router.replace('/dashboard')
  }
}, { immediate: true })

// 监听locale变化，同步currentLanguage状态
watch(locale, (newLocale) => {
  debug.log('🌐 [IndexPage] Locale changed to:', newLocale)
  currentLanguage.value = newLocale
}, { immediate: true })

// 组件挂载时的处理
onMounted(() => {
  debug.log('🏠 [IndexPage] Mounted, user authenticated:', isAuthenticated.value)
  
  // 恢复保存的偏好设置
  const savedTheme = LocalStorage.getItem('user_theme')
  const savedLanguage = LocalStorage.getItem('app-locale') // 使用与i18n一致的键名
  
  debug.log('🏠 [IndexPage] Saved preferences:', { theme: savedTheme, language: savedLanguage })
  
  if (savedTheme) {
    currentTheme.value = savedTheme as string
    setThemeMode(savedTheme as any)
  }
  
  if (savedLanguage && savedLanguage !== currentLanguage.value) {
    debug.log('🏠 [IndexPage] Restoring saved language:', savedLanguage)
    changeLanguage(savedLanguage as string)
  } else {
    // 更新当前语言状态以匹配实际的locale
    currentLanguage.value = locale.value
  }
  
  // 如果用户已认证，立即重定向（双重保险）
  if (isAuthenticated.value) {
    debug.log('🏠 [IndexPage] Immediate redirect for authenticated user')
    router.replace('/dashboard')
  }
})
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
}

.settings-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  
  .q-btn {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }
  }
}

.index-content {
  text-align: center;
  color: white;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.debug-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  margin: 24px auto;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .text-caption {
    color: rgba(255, 255, 255, 0.9);
  }
}

.action-buttons {
  margin-top: 32px;
  
  .q-btn {
    min-width: 140px;
    
    &:first-child {
      margin-right: 12px;
    }
  }
}

.loading-section {
  margin-top: 32px;
  
  .q-spinner {
    margin-bottom: 16px;
  }
}

// 覆盖 Quasar 按钮样式以适应深色背景
.q-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-weight: 500;
  
  // 主要按钮样式
  &.q-btn--unelevated {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #667eea !important;
    
    &:hover {
      background: rgba(255, 255, 255, 1) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
  }
  
  // 次要按钮样式
  &.q-btn--outline {
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: white !important;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: white;
      transform: translateY(-2px);
    }
  }
}

// 语言菜单样式
.q-menu {
  .q-list {
    .q-item {
      &.bg-blue-1 {
        background: rgba(33, 150, 243, 0.1);
      }
      
      &:hover {
        background: rgba(33, 150, 243, 0.05);
      }
      
      .q-item__section--avatar {
        min-width: 40px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 600px) {
  .settings-controls {
    top: 15px;
    right: 15px;
    
    .q-btn {
      width: 40px;
      height: 40px;
    }
  }
  
  .index-content {
    padding: 0 10px;
    
    .text-h4 {
      font-size: 1.8rem;
    }
    
    .action-buttons {
      .q-btn {
        min-width: 120px;
        margin: 8px 4px;
        
        &:first-child {
          margin-right: 4px;
        }
      }
    }
  }
  
  .age-verification {
    padding: 0 10px;
    
    .q-checkbox {
      .q-checkbox__label {
        color: white;
        font-size: 0.9rem;
        line-height: 1.4;
      }
    }
  }
  
  .minor-protection {
    padding: 0 10px;
    
    .protection-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      color: white;
      max-width: 400px;
      margin: 0 auto;
      
      .text-h6 {
        font-weight: 600;
        color: #ffd54f;
      }
      
      .text-body2 {
        line-height: 1.6;
        opacity: 0.9;
      }
    }
  }
}

// 深色模式适配
.body--dark {
  .index-page {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
}

// 浅色模式适配
.body--light {
  .index-page {
    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  }
}
</style>
