<template>
  <div class="header-utility-bar row items-center no-wrap q-gutter-xs">

    <!-- 本机快速刷新（仅本机模式显示） -->
    <q-btn
      v-if="mode === 'local'"
      flat
      dense
      round
      size="sm"
      icon="refresh"
      aria-label="刷新本机状态"
      :loading="refreshing"
      class="utility-btn"
      @click="emit('refresh')"
    >
      <q-tooltip>刷新本机状态</q-tooltip>
    </q-btn>

    <!-- 网关与本机连接状态（双端一致：优先反映与网关的实时连接态） -->
    <q-btn
      flat
      dense
      round
      size="sm"
      :icon="networkStatusIcon"
      :aria-label="networkStatusTooltip"
      :color="networkStatusColor"
      class="utility-btn"
      @click="showConnectionDialog = true"
    >
      <q-tooltip>{{ networkStatusTooltip }}</q-tooltip>
    </q-btn>

    <!-- 语言切换（双端统一走 boot/i18n） -->
    <q-btn-dropdown
      flat
      dense
      size="sm"
      icon="translate"
      :aria-label="$t('settings.language')"
      :label="$q.screen.gt.md ? currentLanguageLabel : ''"
      class="utility-btn"
    >
      <q-list dense style="min-width: 140px">
        <q-item-label header class="text-weight-bold text-caption">
          {{ $t('settings.language') }}
        </q-item-label>
        <q-item
          v-for="lang in supportedLanguages"
          :key="lang.code"
          clickable
          v-close-popup
          :active="currentLanguage === lang.code"
          @click="changeLanguage(lang.code)"
        >
          <q-item-section>
            <q-item-label>{{ lang.nativeName }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="currentLanguage === lang.code">
            <q-icon name="check" color="positive" size="16px" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- 主题切换（双端统一走 useTheme：浅色 / 深色 / 跟随系统） -->
    <q-btn-dropdown
      flat
      dense
      size="sm"
      :icon="currentThemeIcon"
      :aria-label="$t('settings.theme')"
      class="utility-btn"
    >
      <q-list dense style="min-width: 150px">
        <q-item-label header class="text-weight-bold text-caption">
          {{ $t('settings.theme') }}
        </q-item-label>
        <q-item
          v-for="theme in themeOptions"
          :key="theme.value"
          clickable
          v-close-popup
          :active="currentThemeMode === theme.value"
          @click="changeTheme(theme.value)"
        >
          <q-item-section avatar style="min-width: 28px">
            <q-icon :name="theme.icon" size="18px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(`settings.themes.${theme.value}`) }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="currentThemeMode === theme.value">
            <q-icon name="check" color="positive" size="16px" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- 消息提醒（云端会话已登录时显示） -->
    <q-btn
      v-if="authStore.isAuthenticated"
      flat
      dense
      round
      size="sm"
      icon="notifications"
      :aria-label="$t('common.notifications')"
      class="utility-btn"
      @click="showNotificationDialog = true"
    >
      <q-badge
        v-if="unreadCount > 0"
        color="negative"
        floating
        :label="displayUnreadCount"
      />
      <q-tooltip>{{ $t('common.notifications') }}</q-tooltip>
    </q-btn>

    <!-- 用户菜单 / 登录入口（双端一致） -->
    <q-btn-dropdown
      v-if="user"
      flat
      dense
      no-caps
      size="sm"
      class="user-menu-btn utility-btn"
      :aria-label="$t('common.profile')"
    >
      <template #label>
        <div class="row items-center no-wrap q-gutter-xs">
          <UserAvatar
            v-if="user?.user_id"
            :userId="user.user_id"
            size="24px"
          />
          <span v-if="$q.screen.gt.sm" class="user-name ellipsis">{{ user?.name || user?.email }}</span>
        </div>
      </template>
      <q-list dense style="min-width: 170px">
        <q-item-label header class="text-weight-bold">
          {{ user?.name || user?.email }}
        </q-item-label>
        <q-separator />
        <q-item clickable v-close-popup @click="router.push('/cloud/profile')">
          <q-item-section avatar style="min-width: 32px">
            <q-icon name="person" size="18px" />
          </q-item-section>
          <q-item-section>{{ $t('common.profile') }}</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="router.push('/cloud/profile?tab=preferences')">
          <q-item-section avatar style="min-width: 32px">
            <q-icon name="settings" size="18px" />
          </q-item-section>
          <q-item-section>{{ $t('user.preferences') }}</q-item-section>
        </q-item>

        <q-separator />
        <q-item clickable v-close-popup @click="handleLogout">
          <q-item-section avatar style="min-width: 32px">
            <q-icon name="logout" size="18px" />
          </q-item-section>
          <q-item-section>{{ $t('common.logout') }}</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- 仅本机已登、浏览器云端会话已过期的过渡态 -->
    <q-btn-dropdown
      v-else-if="mode === 'local' && localUserEmail"
      flat
      dense
      no-caps
      size="sm"
      icon="account_circle"
      class="utility-btn"
    >
      <template #label>
        <span v-if="$q.screen.gt.sm" class="user-name ellipsis q-ml-xs">{{ localUserEmail }}</span>
      </template>
      <q-list dense style="min-width: 190px">
        <q-item-label header class="text-caption">
          本机已登录（云端会话未同步）
        </q-item-label>
        <q-separator />
        <q-item clickable v-close-popup @click="emit('open-login')">
          <q-item-section avatar style="min-width: 32px">
            <q-icon name="sync" size="18px" color="primary" />
          </q-item-section>
          <q-item-section>同步云端登录</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="handleLogout">
          <q-item-section avatar style="min-width: 32px">
            <q-icon name="logout" size="18px" />
          </q-item-section>
          <q-item-section>退出本机账号</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn
      v-else
      flat
      dense
      no-caps
      size="sm"
      color="primary"
      icon="login"
      :label="$t('common.login')"
      class="utility-btn"
      @click="handleLoginClick"
    />

    <!-- 网关与本机连接状态弹窗 -->
    <q-dialog v-model="showConnectionDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">网关与本机连接状态</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="connection-details">
            <div class="detail-row">
              <span>网关连接:</span>
              <q-chip
                dense
                :label="gatewayConnected ? '已连接' : (localDaemon.online ? '未连接' : '未知')"
                :color="gatewayConnected ? 'positive' : (localDaemon.online ? 'warning' : 'negative')"
                text-color="white"
              />
            </div>
            <div class="detail-row">
              <span>网关地址:</span>
              <span class="mono text-caption">{{ gatewayHostDisplay }}</span>
            </div>
            <div v-if="localDaemon.gatewayLastConnectedAt" class="detail-row">
              <span>网关建连时间:</span>
              <span class="text-caption">{{ formatTime(localDaemon.gatewayLastConnectedAt) }}</span>
            </div>
            <div v-if="!gatewayConnected && localDaemon.gatewayLastError" class="detail-row">
              <span>最近异常:</span>
              <span class="text-caption text-negative ellipsis" style="max-width: 210px" :title="localDaemon.gatewayLastError">
                {{ localDaemon.gatewayLastError }}
              </span>
            </div>
            <q-separator class="q-my-sm" />
            <div class="detail-row">
              <span>本机服务 (mynetd):</span>
              <q-chip
                dense
                :label="localDaemon.online ? '运行中' : '未连接'"
                :color="localDaemon.online ? 'positive' : 'negative'"
                text-color="white"
              />
            </div>
            <div class="detail-row">
              <span>最近探测:</span>
              <span class="text-caption">{{ formatTime(localDaemon.checkedAt) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="localDaemon.online && mode === 'cloud' && inLocalHost"
            flat
            color="teal-8"
            icon="computer"
            label="切到本机设备"
            v-close-popup
            @click="router.push('/local/home')"
          />
          <q-btn flat :label="$t('common.close')" color="grey-7" v-close-popup />
          <q-btn unelevated :label="$t('common.refresh')" color="primary" @click="onRefreshDaemon" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 通知弹窗 -->
    <NotificationDialog v-if="authStore.isAuthenticated" v-model="showNotificationDialog" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date, LocalStorage } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useExperienceStore } from '../../stores/experience'
import { useTheme } from '../../composables/useTheme'
import { useNotifications } from '../../composables/useNotifications'
import { isLocalMode } from '../../config/localMode'
import debug from '../../utils/debug'
import UserAvatar from '../avatar/UserAvatar.vue'
import NotificationDialog from '../notification/NotificationDialog.vue'

const props = withDefaults(defineProps<{
  mode: 'local' | 'cloud'
  refreshing?: boolean
}>(), {
  refreshing: false
})

const emit = defineEmits<{
  refresh: []
  'open-login': []
}>()

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const experienceStore = useExperienceStore()
const { themeMode: currentThemeMode, setThemeMode, getThemeOptions, initializeTheme } = useTheme()
const { unreadCount, displayUnreadCount } = useNotifications()
const { locale, t } = useI18n()
const inLocalHost = isLocalMode()

const showConnectionDialog = ref(false)
const showNotificationDialog = ref(false)
const currentLanguage = ref(locale.value)

const user = computed(() => authStore.user)
const localUserEmail = computed(() => {
  const w = experienceStore.experience?.wizard as Record<string, unknown> | undefined
  return String(w?.user_email || '')
})

const supportedLanguages = [
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' }
]
const themeOptions = computed(() => getThemeOptions())

const currentLanguageLabel = computed(() => {
  const lang = supportedLanguages.find((l) => l.code === currentLanguage.value)
  return lang?.nativeName || '中文'
})

const currentThemeIcon = computed(() => {
  const theme = themeOptions.value.find((th) => th.value === currentThemeMode.value)
  return theme?.icon || 'brightness_auto'
})

const localDaemon = reactive({
  online: false,
  role: '',
  checkedAt: '',
  gatewayConnected: false,
  gatewayUrl: '',
  gatewayLastConnectedAt: '',
  gatewayLastError: ''
})

const gatewayConnected = computed(() => localDaemon.online && localDaemon.gatewayConnected)

const gatewayHostDisplay = computed(() => {
  const raw = localDaemon.gatewayUrl
  if (!raw) return '未配置'
  try {
    return new URL(raw).host || raw
  } catch {
    return raw
  }
})

const networkStatusIcon = computed(() => {
  if (!localDaemon.online) return 'wifi_off'
  return localDaemon.gatewayConnected ? 'wifi' : 'wifi_tethering_error'
})

const networkStatusColor = computed(() => {
  if (!localDaemon.online) return 'negative'
  return localDaemon.gatewayConnected ? 'positive' : 'warning'
})

const networkStatusTooltip = computed(() => {
  if (!localDaemon.online) return '本机服务未连接 (mynetd)'
  if (localDaemon.gatewayConnected) return `网关已连接（${gatewayHostDisplay.value}）`
  return `本机服务在线，网关未连接（${gatewayHostDisplay.value}）`
})

async function refreshLocalDaemon() {
  try {
    const { localHttp } = await import('../../services/local/localApi')
    const res = await localHttp.get('/status') as { data?: { daemon?: string; role?: string; gateway?: Record<string, unknown> } }
    const body = (res as any)?.data?.data ?? (res as any)?.data ?? res
    const gw = (body?.gateway || {}) as Record<string, unknown>
    localDaemon.online = true
    localDaemon.role = String(body?.role || body?.daemon || 'mynetd')
    localDaemon.gatewayConnected = Boolean(gw.connected)
    localDaemon.gatewayUrl = String(gw.gateway || '')
    localDaemon.gatewayLastConnectedAt = String(gw.last_connected_at || '')
    localDaemon.gatewayLastError = String(gw.last_error || '')
    localDaemon.checkedAt = new Date().toISOString()
  } catch {
    localDaemon.online = false
    localDaemon.role = ''
    localDaemon.gatewayConnected = false
    localDaemon.gatewayLastError = ''
    localDaemon.checkedAt = new Date().toISOString()
  }
}

async function onRefreshDaemon() {
  await refreshLocalDaemon()
  if (props.mode === 'local') {
    emit('refresh')
  }
}

function formatTime(timestamp: string) {
  if (!timestamp) return '—'
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')
}

async function changeLanguage(newLocale: string) {
  try {
    const { setLocale } = await import('../../boot/i18n')
    await setLocale(newLocale as 'zh-CN' | 'en-US')
    currentLanguage.value = newLocale

    if (authStore.isAuthenticated) {
      try {
        const { apiService } = await import('../../services/api')
        await apiService.updateUserProfile({ language: newLocale })
      } catch (apiError) {
        debug.warn('🌐 [HeaderUtilityBar] Failed to sync language to server:', apiError)
      }
    }

    $q.notify({
      type: 'positive',
      message: t('settings.languageChanged', { locale: newLocale }),
      timeout: 1800
    })
  } catch (error) {
    debug.error('Failed to change language:', error)
    $q.notify({ type: 'negative', message: t('settings.languageChangeFailed') })
  }
}

async function changeTheme(mode: string) {
  try {
    setThemeMode(mode as any)
    LocalStorage.set('user_theme', mode)

    if (authStore.isAuthenticated) {
      try {
        const { apiService } = await import('../../services/api')
        await apiService.updateUserProfile({ theme: mode })
      } catch (apiError) {
        debug.warn('🎨 [HeaderUtilityBar] Failed to sync theme to server:', apiError)
      }
    }
  } catch (error) {
    debug.error('🎨 [HeaderUtilityBar] Unexpected error in changeTheme:', error)
  }
}

function handleLoginClick() {
  if (props.mode === 'local') {
    emit('open-login')
    return
  }
  router.push('/auth/login').catch(() => undefined)
}

async function handleLogout() {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: inLocalHost ? '已同步退出云端与本机账号（节点隧道保持运行）' : '已退出登录',
      timeout: 2400
    })
  } catch (error) {
    debug.error('Logout failed:', error)
  }
  if (props.mode === 'cloud') {
    router.push('/auth/login').catch(() => undefined)
  }
}

let daemonTimer: number | undefined

onMounted(async () => {
  initializeTheme()
  const savedLocale = (LocalStorage.getItem('app-locale') as string) || 'zh-CN'
  if (locale.value !== savedLocale) {
    locale.value = savedLocale
  }
  currentLanguage.value = locale.value

  await refreshLocalDaemon()
  daemonTimer = window.setInterval(() => {
    refreshLocalDaemon().catch(() => undefined)
  }, 60_000)
})

onUnmounted(() => {
  if (daemonTimer) clearInterval(daemonTimer)
})
</script>

<style lang="scss" scoped>
.header-utility-bar {
  flex-shrink: 0;
}

.utility-btn {
  border-radius: 6px;
}

.user-name {
  max-width: 120px;
  font-size: 13px;
  font-weight: 500;
}

.connection-details {
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
