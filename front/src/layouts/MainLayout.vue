<template>
  <q-layout view="lHh Lpr lFf" class="main-layout theme-transition">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-space />

        <!-- 区域切换 -->
        <ZoneSelector />

        <!-- 语言切换 -->
        <q-btn-dropdown 
          flat 
          dense
          :icon="'language'"
          :label="$q.screen.gt.sm ? getCurrentLanguageLabel() : ''"
          class="q-mr-sm"
        >
          <q-list>
            <q-item-label header class="text-weight-bold">
              {{ $t('settings.language') }}
            </q-item-label>
            <q-item 
              v-for="lang in supportedLanguages"
              :key="lang.code"
              clickable
              @click="changeLanguage(lang.code)"
              :active="currentLanguage === lang.code"
            >
              <q-item-section>
                <q-item-label>{{ lang.nativeName }}</q-item-label>
                <q-item-label caption>{{ lang.name }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="currentLanguage === lang.code">
                <q-icon name="check" color="positive" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- 网络状态 -->
        <q-btn 
          flat 
          dense
          round
          :icon="wsConnectionStats.connected ? 'wifi' : 'wifi_off'"
          :color="wsConnectionStats.connected ? 'positive' : 'negative'"
          @click="showConnectionDialog = true"
          class="q-mr-sm"
        >
          <q-tooltip>
            {{ wsConnectionStats.connected ? $t('common.connected') : $t('common.disconnected') }}
          </q-tooltip>
        </q-btn>

        <!-- 主题切换 -->
        <q-btn-dropdown 
          flat 
          dense
          :icon="getThemeIcon()"
          :label="$q.screen.gt.sm ? getThemeLabel() : ''"
          class="q-mr-sm"
        >
          <q-list>
            <q-item-label header class="text-weight-bold">
              {{ $t('settings.theme') }}
            </q-item-label>
            <q-item 
              v-for="theme in themeOptions"
              :key="theme.value"
              clickable
              @click="changeTheme(theme.value)"
              :active="currentThemeMode === theme.value"
            >
              <q-item-section avatar>
                <q-icon :name="theme.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(`settings.themes.${theme.value}`) }}</q-item-label>
                <q-item-label caption>{{ theme.description }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="currentThemeMode === theme.value">
                <q-icon name="check" color="positive" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>



        <!-- 消息提醒 -->
        <q-btn 
          flat 
          dense
          round
          icon="notifications"
          @click="showNotificationDialog = true"
          class="q-mr-sm"
        >
          <q-badge 
            v-if="unreadNotifications > 0"
            color="negative"
            floating
            :label="unreadNotifications > 99 ? '99+' : unreadNotifications"
          />
          <q-tooltip>
            {{ $t('common.notifications') }}
          </q-tooltip>
        </q-btn>

        <!-- 用户菜单 -->
        <q-btn-dropdown 
          flat 
          dense
          :icon="'account_circle'"
          :label="$q.screen.gt.sm ? (user?.name || 'User') : ''"
        >
          <q-list>
            <q-item-label header class="text-weight-bold">
              {{ user?.name || 'User' }}
            </q-item-label>
            <q-separator />
            <q-item clickable @click="$router.push('/profile')">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('common.profile') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="$router.push('/settings')">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('common.settings') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('common.logout') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Left Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="sidebar-menu"
      :width="280"
      :breakpoint="1024"
    >
      <!-- Drawer Header -->
      <div class="drawer-header q-pa-md">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-weight-bold">{{ $t('app.name') }}</div>
            <div class="text-caption text-grey-6">{{ $t('app.tagline') }}</div>
          </div>
          <div class="col-auto">
            <q-icon name="hub" size="lg" class="text-white" />
          </div>
        </div>
      </div>

      <q-separator />

      <!-- Navigation Menu -->
      <q-list padding>
        <!-- 主要功能 -->
        <q-item-label header class="text-weight-bold">
          {{ $t('navigation.mainFeatures') }}
        </q-item-label>

        <q-item 
          v-for="item in mainNavigationItems"
          :key="item.name"
          clickable 
          :to="item.path"
          exact
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(item.label) }}</q-item-label>
            <q-item-label caption v-if="item.description">
              {{ $t(item.description) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="item.badge">
            <q-badge :color="item.badgeColor || 'primary'">
              {{ item.badge }}
            </q-badge>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- 网络配置 -->
        <q-item-label header class="text-weight-bold">
          {{ $t('navigation.networkConfig') }}
        </q-item-label>

        <q-item 
          v-for="item in networkNavigationItems"
          :key="item.name"
          clickable 
          :to="item.path"
          exact
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(item.label) }}</q-item-label>
            <q-item-label caption v-if="item.description">
              {{ $t(item.description) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center">
              <q-badge v-if="item.badge" :color="item.badgeColor || 'primary'" class="q-mr-xs">
                {{ item.badge }}
              </q-badge>
              <q-chip 
                v-if="item.comingSoon"
                size="sm"
                color="orange"
                text-color="white"
                :label="$t('common.comingSoon')"
              />
            </div>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- 系统工具 -->
        <q-item-label header class="text-weight-bold">
          {{ $t('navigation.systemTools') }}
        </q-item-label>

        <q-item 
          v-for="item in systemNavigationItems"
          :key="item.name"
          clickable 
          :to="item.path"
          exact
          class="nav-item"
          :class="{ 'disabled-item': item.comingSoon }"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(item.label) }}</q-item-label>
            <q-item-label caption v-if="item.description">
              {{ $t(item.description) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="item.comingSoon">
            <q-chip 
              size="sm"
              color="orange"
              text-color="white"
              :label="$t('common.comingSoon')"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Connection Status Dialog -->
    <q-dialog v-model="showConnectionDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('websocket.connectionFailed') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="connection-details">
            <div class="detail-row">
              <span>{{ $t('common.status') }}:</span>
              <q-chip 
                :label="wsConnectionStats.connected ? $t('common.connected') : $t('common.disconnected')"
                :color="wsConnectionStats.connected ? 'positive' : 'negative'"
                text-color="white"
              />
            </div>
            <div class="detail-row">
              <span>{{ $t('websocket.heartbeat') }}:</span>
              <span>{{ formatTime(wsConnectionStats.lastHeartbeat) }}</span>
            </div>
            <div class="detail-row">
              <span>Messages:</span>
              <span>{{ wsConnectionStats.messagesReceived }}</span>
            </div>
            <div class="detail-row">
              <span>Reconnect Attempts:</span>
              <span>{{ wsConnectionStats.reconnectAttempts }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            :label="$t('common.close')" 
            color="primary" 
            v-close-popup 
          />
          <q-btn 
            :label="$t('common.refresh')" 
            color="primary" 
            @click="reconnectWebSocket"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Notification Dialog -->
    <q-dialog v-model="showNotificationDialog">
      <q-card style="min-width: 400px; max-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('common.notifications') }}</div>
          <q-space />
          <q-btn 
            flat 
            dense
            round
            icon="done_all"
            @click="markAllAsRead"
            :disable="unreadNotifications === 0"
          >
            <q-tooltip>{{ $t('notifications.markAllRead') }}</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="notifications.length === 0" class="text-center text-grey-6 q-py-md">
            {{ $t('notifications.empty') }}
          </div>
          <div v-else>
            <q-list>
              <q-item
                v-for="notification in notifications"
                :key="notification.id"
                :class="{'bg-grey-1': !notification.read}"
                clickable
                @click="markAsRead(notification.id)"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="getNotificationIcon(notification.type)"
                    :color="getNotificationColor(notification.type)"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ notification.title }}</q-item-label>
                  <q-item-label caption>{{ notification.message }}</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatTime(notification.timestamp) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="!notification.read">
                  <q-badge color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            :label="$t('common.close')" 
            color="primary" 
            v-close-popup 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date, LocalStorage } from 'quasar'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../services/websocket'
import { useTheme } from '../composables/useTheme'
import { useSidebarStats } from '../composables/useSidebarStats'
import { useI18n } from 'vue-i18n'
import ZoneSelector from '../components/common/ZoneSelector.vue'
import { DEFAULT_GLOBAL_ZONE } from '../config/app'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const { connectionStats: wsConnectionStats, connect, reconnect } = useWebSocket()
const { themeMode: currentThemeMode, setThemeMode, getThemeOptions, initializeTheme } = useTheme()
const { stats: sidebarStats, init: initSidebarStats } = useSidebarStats()
const { locale, t } = useI18n()

// 响应式数据
const leftDrawerOpen = ref(false)
const showConnectionDialog = ref(false)
const showNotificationDialog = ref(false)
const currentLanguage = ref(locale.value)
const isDev = ref(true) // 开发模式调试

// 消息提醒数据
const notifications = ref([
  {
    id: 1,
    title: 'System Alert',
    message: 'Node server-01 is experiencing high CPU usage',
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    title: 'Zone Update',
    message: 'TechCorpVPN zone configuration has been updated',
    type: 'info',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: 3,
    title: 'Connection Success',
    message: 'Successfully connected to all network nodes',
    type: 'success',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true
  }
])

// 计算属性
const user = computed(() => authStore.user)
const unreadNotifications = computed(() => notifications.value.filter(n => !n.read).length)

const supportedLanguages = computed(() => [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' }
])
const themeOptions = computed(() => getThemeOptions())

interface NavigationItem {
  name: string
  label: string
  icon: string
  path: string
  description?: string
  badge?: string | number
  badgeColor?: string
  comingSoon?: boolean
}

// 创建一个composable来管理sidebar统计数据
// 现在使用 useSidebarStats composable

// 主要功能导航项
const mainNavigationItems = computed((): NavigationItem[] => [
  {
    name: 'dashboard',
    label: 'navigation.dashboard',
    icon: 'dashboard',
    path: '/dashboard'
  },
  {
    name: 'nodes',
    label: 'navigation.nodes',
    icon: 'dns',
    path: '/nodes',
    badge: sidebarStats.value.nodes || 0,
    badgeColor: 'primary'
  },
  {
    name: 'ippools',
    label: 'navigation.ippools',
    icon: 'network_wired',
    path: '/ippools',
    badge: sidebarStats.value.ippools || 0,
    badgeColor: 'secondary',
    comingSoon: true
  }
])

// 网络配置导航项
const networkNavigationItems = computed((): NavigationItem[] => [
  {
    name: 'routes',
    label: 'navigation.routes',
    icon: 'alt_route',
    path: '/routes',
    badge: sidebarStats.value.routes || 0,
    badgeColor: 'accent'
  },
  {
    name: 'zones',
    label: 'navigation.zones',
    icon: 'public',
    path: '/zones',
    badge: sidebarStats.value.zones || 0,
    badgeColor: 'info',
    comingSoon: true
  },
  {
    name: 'social',
    label: 'navigation.social',
    icon: 'group',
    path: '/social',
    badge: sidebarStats.value.connections || 0,
    badgeColor: 'positive',
    comingSoon: true
  }
])

// 系统工具导航项
const systemNavigationItems = computed((): NavigationItem[] => [
  {
    name: 'apitest',
    label: 'navigation.apiTest',
    icon: 'code',
    path: '/api-test',
    comingSoon: true
  },
  {
    name: 'help',
    label: 'navigation.help',
    icon: 'help',
    path: '/help',
    comingSoon: true
  }
])

// 方法
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const getCurrentLanguageLabel = () => {
  const lang = supportedLanguages.value.find((l: any) => l.code === currentLanguage.value)
  return lang?.nativeName || 'Language'
}

const getThemeIcon = () => {
  const theme = themeOptions.value.find((t: any) => t.value === currentThemeMode.value)
  return theme?.icon || 'brightness_auto'
}

const getThemeLabel = () => {
  return currentThemeMode.value.charAt(0).toUpperCase() + currentThemeMode.value.slice(1)
}

const changeLanguage = async (newLocale: string) => {
  try {
    // 使用 Vue I18n 的 locale 设置
    locale.value = newLocale
    currentLanguage.value = newLocale
    
    // 保存到 LocalStorage
    LocalStorage.set('locale', newLocale)
    
    // 更新文档属性
    document.documentElement.lang = newLocale
    document.documentElement.setAttribute('data-locale', newLocale)
    
    // 使用 $q.notify
    $q.notify({
      type: 'positive',
      message: t('settings.languageChanged', { locale: newLocale }),
      timeout: 2000
    })
  } catch (error) {
    console.error('Failed to change language:', error)
    $q.notify({
      type: 'negative',
      message: t('settings.languageChangeFailed')
    })
  }
}

const changeTheme = (mode: string) => {
  setThemeMode(mode as any)
  $q.notify({
    type: 'positive',
    message: t('settings.themeChanged', { theme: mode }),
    timeout: 2000
  })
}

const logout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
      timeout: 2000
    })
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    router.push('/login')
  }
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return 'N/A'
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')
}

const reconnectWebSocket = () => {
  reconnect()
  showConnectionDialog.value = false
  $q.notify({
    type: 'info',
    message: 'Reconnecting...',
    timeout: 2000
  })
}

// 消息提醒相关方法
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  $q.notify({
    type: 'positive',
    message: 'All notifications marked as read',
    timeout: 2000
  })
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    default:
      return 'notifications'
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'orange'
    case 'info':
      return 'blue'
    case 'success':
      return 'green'
    case 'error':
      return 'red'
    default:
      return 'primary'
  }
}

// 生命周期
onMounted(async () => {
  // 调试输出
  console.log('MainLayout mounted')
  console.log('Current zone:', authStore.currentZone)
  console.log('Available zones:', authStore.availableZones)
  console.log('User:', user.value)
  console.log('Is authenticated:', authStore.isAuthenticated)
  
  // 初始化主题
  initializeTheme()
  
  // 确保语言设置正确
  const savedLocale = LocalStorage.getItem('locale') as string || 'zh-CN'
  if (locale.value !== savedLocale) {
    locale.value = savedLocale
    currentLanguage.value = savedLocale
  }
  
  // 如果已认证但没有区域数据，尝试加载区域数据
  if (authStore.isAuthenticated && authStore.availableZones.length === 0) {
    console.log('🔧 [MainLayout] Loading zones data...')
    try {
      await authStore.loadUserZones()
      console.log('🔧 [MainLayout] Zones loaded:', authStore.availableZones.length, 'zones')
      console.log('🔧 [MainLayout] Available zones:', authStore.availableZones.map(z => z.zone_name))
      
      // 注意：区域恢复逻辑已经在 boot/auth.ts 中处理
      // 这里只是一个备用恢复机制，防止 boot 文件执行失败
      if (!authStore.currentZone) {
        console.log('🔧 [MainLayout] No current zone, attempting fallback recovery...')
        const savedZone = LocalStorage.getItem('current_zone') as string | null
        if (savedZone) {
          try {
            const zone = JSON.parse(savedZone)
            console.log('🔧 [MainLayout] Fallback: Parsed saved zone:', zone.zone_name)
            const validZone = authStore.availableZones.find((z: any) => z.zone_id === zone.zone_id)
            if (validZone) {
              authStore.currentZone = validZone
              console.log('🔧 [MainLayout] Fallback: Restored saved zone:', validZone.zone_name)
            } else {
              console.log('🔧 [MainLayout] Fallback: Saved zone not in available zones')
              // 如果保存的区域不在可用列表中，使用用户默认区域
              if (authStore.user?.zone_id) {
                const defaultZone = authStore.availableZones.find((z: any) => z.zone_id === authStore.user?.zone_id)
                if (defaultZone) {
                  authStore.currentZone = defaultZone
                  console.log('🔧 [MainLayout] Fallback: Using default zone:', defaultZone.zone_name)
                }
              }
            }
          } catch (error) {
            console.warn('🔧 [MainLayout] Fallback: Failed to parse saved zone:', error)
            // 解析失败时使用用户默认区域
            if (authStore.user?.zone_id) {
              const defaultZone = authStore.availableZones.find((z: any) => z.zone_id === authStore.user?.zone_id)
              if (defaultZone) {
                authStore.currentZone = defaultZone
                console.log('🔧 [MainLayout] Fallback: Using default zone after parse error:', defaultZone.zone_name)
              }
            }
          }
        } else {
          // 没有保存的区域选择，使用用户默认区域
          if (authStore.user?.zone_id) {
            const zone = authStore.availableZones.find((z: any) => z.zone_id === authStore.user?.zone_id)
            if (zone) {
              authStore.currentZone = zone
              console.log('🔧 [MainLayout] Fallback: Using default zone:', zone.zone_name)
            }
          }
        }
      } else {
        console.log('🔧 [MainLayout] Current zone already set:', authStore.currentZone.zone_name)
      }
    } catch (error) {
      console.error('🔧 [MainLayout] Failed to load zones:', error)
    }
  }
  
  // 如果区域数据仍然为空且用户已认证，使用默认的Global zone
  if (authStore.isAuthenticated && authStore.availableZones.length === 0) {
    console.log('🔧 [MainLayout] No zones loaded, using default Global zone')
    authStore.availableZones = [DEFAULT_GLOBAL_ZONE]
    if (!authStore.currentZone) {
      authStore.currentZone = DEFAULT_GLOBAL_ZONE
    }
  }
  
  // 初始化WebSocket连接
  if (authStore.isAuthenticated && authStore.currentZone) {
    connect(authStore.token!, authStore.currentZone.zone_id.toString())
  }
  
  // 初始化边栏统计数据
  await initSidebarStats()
})
</script>

<style lang="scss" scoped>
.main-layout {
  .q-header {
    .q-toolbar {
      .q-btn-dropdown,
      .q-btn {
        transition: all 0.2s ease;
        border-radius: 6px;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .q-btn__content {
          gap: 6px;
          font-weight: 500;
        }
      }
    }
  }
  
  .drawer-header {
    background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    color: white;
  }
  
  .nav-item {
    margin: 4px 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(var(--q-primary-rgb), 0.1);
    }
    
    &.q-router-link--active {
      background-color: var(--q-primary);
      color: white;
      
      .q-icon {
        color: white;
      }
    }
    
    &.disabled-item {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
  
  .connection-details {
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 移动端优化
@media (max-width: 768px) {
  .main-layout {
    .q-toolbar {
      .q-btn-dropdown {
        .q-btn__content {
          .q-btn__label {
            display: none;
          }
        }
      }
    }
  }
}

// 深色模式优化
.body--dark {
  .main-layout {
    .drawer-header {
      background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-accent) 100%);
    }
    
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>