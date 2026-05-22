<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <!-- 设置控制按钮 -->
    <div class="settings-controls">
      <!-- 主题切换 -->
      <q-btn
        round
        flat
        icon="palette"
        color="white"
      >
        <q-tooltip>{{ getCurrentThemeLabel() }}</q-tooltip>
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

    <!-- 简单的认证页面布局，没有header和sidebar -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useQuasar, LocalStorage } from 'quasar'
import { useTheme } from '../composables/useTheme'

const { t, locale } = useI18n()
const $q = useQuasar()

// 主题相关
const { currentTheme: themeConfig, setThemeMode, getThemeOptions } = useTheme()

// 响应式状态
const currentTheme = ref(LocalStorage.getItem('user_theme') || 'auto')
const currentLanguage = ref(locale.value)

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

// 获取当前主题标签
const getCurrentThemeLabel = () => {
  const theme = themeOptions.value.find(t => t.value === currentTheme.value)
  return theme ? theme.label : 'Auto Theme'
}

// 获取当前语言标签
const getCurrentLanguageLabel = () => {
  const lang = supportedLanguages.value.find(l => l.value === currentLanguage.value)
  return lang ? lang.label : 'Language'
}

// 主题切换
const changeTheme = (theme: string) => {
  debug.log('🎨 Changing theme to:', theme)
  currentTheme.value = theme
  LocalStorage.set('user_theme', theme)
  setThemeMode(theme)
}

// 语言切换
const changeLanguage = (newLocale: string) => {
  debug.log('🌍 Changing language to:', newLocale)
  currentLanguage.value = newLocale
  locale.value = newLocale
  LocalStorage.set('app-locale', newLocale)
}

// 监听语言变化
watch(locale, (newLocale) => {
  currentLanguage.value = newLocale
  debug.log('👂 Locale watcher triggered:', newLocale)
})
</script>

<style lang="scss" scoped>
.auth-layout {
  background: radial-gradient(circle at 20% 0%, #EFF6FF 0%, transparent 45%),
              radial-gradient(circle at 80% 100%, #DBEAFE 0%, transparent 50%),
              #F8FAFC;
  min-height: 100vh;
  position: relative;
  
  .settings-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 8px;
    
    .q-btn {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(37, 99, 235, 0.12);
      color: var(--primary) !important;
      
      &:hover {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(37, 99, 235, 0.25);
      }
    }
  }
  
  .q-page-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }
}

// 深色模式优化
.body--dark {
  .auth-layout {
    background: radial-gradient(circle at 20% 0%, rgba(37, 99, 235, 0.18) 0%, transparent 45%),
                radial-gradient(circle at 80% 100%, rgba(30, 64, 175, 0.15) 0%, transparent 50%),
                #0F172A;
    
    &::before {
      background: 
        radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 50%);
    }
  }
}

// 移动端适配
@media (max-width: 600px) {
  .auth-layout {
    .settings-controls {
      top: 10px;
      right: 10px;
      gap: 4px;
      
      .q-btn {
        width: 36px;
        height: 36px;
      }
    }
  }
}
</style> 
