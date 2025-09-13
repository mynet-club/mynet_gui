<template>
  <q-btn-dropdown
    v-if="availableLocales.length > 1"
    :label="getCurrentLocaleName()"
    icon="language"
    flat
    dense
    class="language-switcher"
  >
    <q-list>
      <q-item
        v-for="locale in availableLocales"
        :key="locale.code"
        clickable
        v-close-popup
        @click="switchLanguage(locale.code as 'zh-CN' | 'en-US')"
        :class="{ 'bg-primary text-white': locale.code === currentLocale }"
      >
        <q-item-section avatar>
          <span class="text-h6">{{ locale.flag }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ locale.name }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="locale.code === currentLocale">
          <q-icon name="check" color="positive" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { setLocale, getLocale, getSupportedLocales } from '../../boot/i18n'

const { t } = useI18n()
const $q = useQuasar()

// 获取可用的语言列表
const availableLocales = computed(() => getSupportedLocales())

// 获取当前语言
const currentLocale = computed(() => getLocale())

// 获取当前语言的显示名称
const getCurrentLocaleName = () => {
  const current = availableLocales.value.find(locale => locale.code === currentLocale.value)
  return current ? `${current.flag} ${current.name}` : 'Language'
}

// 切换语言
const switchLanguage = (localeCode: 'zh-CN' | 'en-US') => {
  try {
    setLocale(localeCode)
    
    // 显示成功提示
    $q.notify({
      type: 'positive',
      message: t('settings.languageChanged', { locale: localeCode === 'zh-CN' ? '中文' : 'English' }),
      position: 'top',
      timeout: 2000
    })
  } catch (error) {
    console.error('Language switch failed:', error)
    
    // 显示错误提示
    $q.notify({
      type: 'negative',
      message: t('settings.languageChangeFailed'),
      position: 'top',
      timeout: 3000
    })
  }
}
</script>

<style scoped>
.language-switcher {
  min-width: 120px;
}
</style>
