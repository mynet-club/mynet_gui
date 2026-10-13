<template>
  <q-layout view="lHh Lpr lFf" class="main-layout theme-transition">
    <!-- Header -->
    <q-header class="soft-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="$t('common.navigation')"
          :aria-expanded="leftDrawerOpen"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <div class="toolbar-brand">MyNet</div>
        <q-space />

        <!-- 区域切换 -->
        <TenantSelector />

        <!-- Tips 帮助 -->
        <TipsHelper class="q-mr-sm" />

        <!-- 语言切换 -->
        <q-btn-dropdown 
          flat
          dense
          :icon="'language'"
          :aria-label="$t('settings.language')"
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
          :aria-label="wsConnectionStats.connected ? $t('common.connected') : $t('common.disconnected')"
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
          :aria-label="$t('settings.theme')"
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
          :aria-label="$t('common.notifications')"
          @click="showNotificationDialog = true"
          class="q-mr-sm"
        >
          <q-badge 
            v-if="unreadCount > 0"
            color="negative"
            floating
            :label="displayUnreadCount"
          />
          <q-tooltip>
            {{ $t('common.notifications') }}
          </q-tooltip>
        </q-btn>

        <!-- 用户菜单 -->
        <q-btn-dropdown 
          flat 
          dense
          class="user-menu-btn"
          :aria-label="$t('common.profile')"
        >
          <template v-slot:label>
            <div class="row items-center no-wrap q-gutter-xs">
                            <UserAvatar
                v-if="user?.user_id"
                :userId="user.user_id"
                size="sm"
                class="q-mr-md"
              />
              <span v-if="$q.screen.gt.sm">{{ user?.name || 'User' }}</span>
            </div>
          </template>
          <q-list>
            <q-item-label header class="text-weight-bold">
              {{ user?.name || 'User' }}
            </q-item-label>
            <q-separator />
            <q-item clickable @click="$router.push('/app/profile')">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('common.profile') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="goToProfileSettings">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('user.preferences') }}</q-item-label>
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
            <div class="text-h6 text-weight-bold brand-title">{{ $t('app.name') }}</div>
            <div class="text-caption brand-tagline">{{ $t('app.tagline') }}</div>
          </div>
          <div class="col-auto">
            <img :src="iconUrl" alt="MyNet" class="brand-logo" />
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

        <template v-for="item in mainNavigationItems" :key="item.name">
          <!-- 有子菜单的项目 -->
          <q-expansion-item
            v-if="item.children"
            :icon="item.icon"
            :label="$t(item.label + '.title')"
            header-class="nav-item"
            :model-value="expandedGroups[item.name] ?? isNavigationGroupActive(item)"
            @update:model-value="expandedGroups[item.name] = $event"
          >
            <q-item 
              v-for="child in item.children"
              :key="child.name"
              clickable 
              :to="child.path"
              exact
              class="nav-item nav-child-item"
            >
              <q-item-section avatar>
                <q-icon :name="child.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(child.label) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- 普通菜单项 -->
          <q-item 
            v-else
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
          </q-item>
        </template>

        <q-separator class="q-my-md" />

        <!-- 网络配置 -->
        <q-item-label header class="text-weight-bold">
          {{ $t('navigation.networkConfig') }}
        </q-item-label>

        <template v-for="item in networkNavigationItems" :key="item.name">
          <!-- 有子菜单的项目 -->
          <q-expansion-item
            v-if="item.children"
            :icon="item.icon"
            :label="$t(item.label + '.title')"
            header-class="nav-item"
            :model-value="expandedGroups[item.name] ?? isNavigationGroupActive(item)"
            @update:model-value="expandedGroups[item.name] = $event"
          >
            <q-item 
              v-for="child in item.children"
              :key="child.name"
              clickable 
              :to="child.path"
              exact
              class="nav-item nav-child-item"
            >
              <q-item-section avatar>
                <q-icon :name="child.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(child.label) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- 普通菜单项 -->
          <q-item 
            v-else
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
          </q-item>
        </template>

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
          <div class="text-h6">{{ wsConnectionStats.connected ? $t('websocket.connectionStatus') : $t('websocket.connectionFailed') }}</div>
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
    <NotificationDialog v-model="showNotificationDialog" />
    
    <!-- Tips系统容器 -->
    <TipsContainer />
  </q-layout>
</template>

<script setup lang="ts">
// 图标跟着 publicPath 走 —— 收进 /gui/ 后写死 /icons/ 会 404
const iconUrl = (import.meta.env.BASE_URL || "/") + "icons/icon.png"
import { ref, computed, onMounted, reactive } from 'vue'
import debug from '../utils/debug'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date, LocalStorage } from 'quasar'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../services/websocket'
import { useTheme } from '../composables/useTheme'
import { useSidebarStats } from '../composables/useSidebarStats'
import { useNotifications } from '../composables/useNotifications'
import { useI18n } from 'vue-i18n'
import TenantSelector from '../components/common/TenantSelector.vue'
import TipsHelper from '../components/tips/TipsHelper.vue'
import UserAvatar from '../components/avatar/UserAvatar.vue'
import NotificationDialog from '../components/notification/NotificationDialog.vue'
import TipsContainer from '../components/tips/TipsContainer.vue'
import { DEFAULT_PLATFORM_TENANT } from '../config/app'
import { useOnboardingStore } from '../stores/onboarding'
import { getTipsEngine } from '../services/tips/TipsEngine'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const expandedGroups = reactive<Record<string, boolean>>({})
const authStore = useAuthStore()
const { isConnected, connect } = useWebSocket()
const { themeMode: currentThemeMode, setThemeMode, getThemeOptions, initializeTheme } = useTheme()
const { stats: sidebarStats, init: initSidebarStats } = useSidebarStats()
const { unreadCount, displayUnreadCount } = useNotifications()
const { locale, t } = useI18n()

// 响应式数据
const leftDrawerOpen = ref(false)
const showConnectionDialog = ref(false)
const showNotificationDialog = ref(false)
const currentLanguage = ref(locale.value)
const isDev = ref(true) // 开发模式调试

// 计算属性
const user = computed(() => authStore.user)

const supportedLanguages = computed(() => [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文' }
])
const themeOptions = computed(() => getThemeOptions())

interface NavigationItem {
  name: string
  label: string
  icon: string
  path?: string
  description?: string
  badge?: string | number
  badgeColor?: string
  comingSoon?: boolean
  children?: NavigationItem[]
}

// Keep the current section visible on direct links; allow manual collapse.
const isNavigationGroupActive = (item: NavigationItem) =>
  item.children?.some(child => child.path &&
    (route.path === child.path || route.path.startsWith(`${child.path}/`))) ?? false

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
    name: 'social',
    label: 'navigation.social',
    icon: 'group',
    children: [
      {
        name: 'social-friends',
        label: 'navigation.social.friends',
        icon: 'people',
        path: '/app/social/friends'
      },
      {
        name: 'social-requests',
        label: 'navigation.social.requests',
        icon: 'person_add',
        path: '/app/social/requests'
      },
      {
        name: 'social-invitations',
        label: 'navigation.social.invitations',
        icon: 'send',
        path: '/app/social/invitations'
      }
    ]
  }
])

// 网络配置导航项
const networkNavigationItems = computed((): NavigationItem[] => [
{
  name: 'ippools',
  label: 'navigation.ippools',
  icon: 'dns',
  path: '/app/ippools'
},
{
    name: 'nodes',
    label: 'navigation.nodes',
    icon: 'dns',
    path: '/app/nodes'
  },
  {
    name: 'routes',
    label: 'navigation.routes',
    icon: 'alt_route',
    children: [
      {
        name: 'routes-overview',
        label: 'navigation.routes.overview',
        icon: 'dashboard',
        path: '/app/routes'
      },
      {
        name: 'routes-active',
        label: 'navigation.routes.active',
        icon: 'route',
        path: '/app/routes/active'
      },
      {
        name: 'routes-pending',
        label: 'navigation.routes.pending',
        icon: 'schedule',
        path: '/app/routes/pending'
      },
      {
        name: 'routes-friends',
        label: 'navigation.routes.friends',
        icon: 'lan',
        path: '/app/routes/friends'
      }
    ]
  },
  {
    name: 'services',
    label: 'navigation.services',
    icon: 'apps',
    path: '/app/services',
    children: [
      {
        name: 'services-overview',
        label: 'navigation.services.overview',
        icon: 'dashboard',
        path: '/app/services'
      },
      {
        name: 'services-public',
        label: 'navigation.services.publicServices',
        icon: 'public',
        path: '/app/services/public'
      },
      {
        name: 'services-friends',
        label: 'navigation.services.friendServices',
        icon: 'group',
        path: '/app/services/friends'
      },
      {
        name: 'services-my',
        label: 'navigation.services.myServices',
        icon: 'person_add',
        path: '/app/services/my'
      }
    ]
  }
])

// 系统工具导航项
const systemNavigationItems = computed((): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      name: 'help',
      label: 'navigation.help',
      icon: 'help',
      path: '/app/help'
    }
  ]
  
  return items
})

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
  return t(`settings.themes.${currentThemeMode.value}`)
}

const changeLanguage = async (newLocale: string) => {
  try {
    // 使用统一的 setLocale 函数
    const { setLocale } = await import('../boot/i18n')
    await setLocale(newLocale as 'zh-CN' | 'en-US')
    
    // 更新当前语言状态
    currentLanguage.value = newLocale
    
    // 同步到服务端
    try {
      const { apiService } = await import('../services/api')
      await apiService.updateUserProfile({ language: newLocale })
      debug.log('🌐 [MainLayout] Language synced to server:', newLocale)
    } catch (apiError) {
      debug.warn('🌐 [MainLayout] Failed to sync language to server:', apiError)
    }
    
    // 使用 $q.notify
    $q.notify({
      type: 'positive',
      message: t('settings.languageChanged', { locale: newLocale }),
      timeout: 2000
    })
  } catch (error) {
    debug.error('Failed to change language:', error)
    $q.notify({
      type: 'negative',
      message: t('settings.languageChangeFailed')
    })
  }
}

const changeTheme = async (mode: string) => {
  try {
    setThemeMode(mode as any)
    
    // 保存到本地存储
    LocalStorage.set('user_theme', mode)
    
    // 同步到服务端
    try {
      const { apiService } = await import('../services/api')
      await apiService.updateUserProfile({ theme: mode })
      debug.log('🎨 [MainLayout] Theme synced to server:', mode)
    } catch (apiError) {
      debug.warn('🎨 [MainLayout] Failed to sync theme to server (API may not support theme field yet):', apiError)
      // 服务端可能还不支持theme字段，不影响本地使用
    }
    
    $q.notify({
      type: 'positive',
      message: t('settings.themeChanged', { theme: mode }),
      timeout: 2000
    })
  } catch (error) {
    debug.error('🎨 [MainLayout] Unexpected error in changeTheme:', error)
    $q.notify({
      type: 'warning',
      message: t('settings.themeChanged', { theme: mode }),
      timeout: 2000
    })
  }
}

const goToProfileSettings = () => {
  router.push('/app/profile?tab=preferences')
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
    debug.error('Logout failed:', error)
    router.push('/login')
  }
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return 'N/A'
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')
}

// 确保 wsConnectionStats 正确声明
const wsConnectionStats = reactive({
  connected: isConnected,
  lastHeartbeat: new Date().toISOString(),
  messagesReceived: 0,
  reconnectAttempts: 0
});

// 移除 reconnectWebSocket 的引用
const reconnectWebSocket = () => {
  debug.warn('Reconnect WebSocket is not implemented yet.')
}

// 生命周期
onMounted(async () => {
  // 初始化主题
  initializeTheme()
  
  // 确保语言设置正确
  const savedLocale = LocalStorage.getItem('app-locale') as string || 'zh-CN'
  if (locale.value !== savedLocale) {
    locale.value = savedLocale
    currentLanguage.value = savedLocale
  }
  
  // 已认证则确保「归属网络区列表 + 当前选中」就绪。
  // 恢复逻辑只有一份实现（authStore.restoreCurrentTenant）——此前 boot/auth.ts 与
  // 这里各写了一遍 4 层兜底，两边行为会悄悄分叉。
  if (authStore.isAuthenticated) {
    try {
      await authStore.restoreCurrentTenant()
    } catch (error) {
      debug.error('🔧 [MainLayout] Failed to load tenants:', error)
    }
  }

  // 归属列表为空时兜底到平台租户（2026-10-04 用户裁定 B：与服务端 platform_tenant_id 同源）
  if (authStore.isAuthenticated && authStore.availableTenants.length === 0) {
    debug.log('🔧 [MainLayout] No tenants loaded, falling back to platform tenant')
    authStore.availableTenants = [DEFAULT_PLATFORM_TENANT]
    if (!authStore.currentTenant) {
      authStore.currentTenant = DEFAULT_PLATFORM_TENANT
    }
  }
  
  // WebSocket连接由boot/websocket.ts统一管理，这里不再重复连接
  
  // 初始化边栏统计数据
  await initSidebarStats()
  
  // 初始化引导系统
  if (authStore.isAuthenticated && authStore.user) {
    debug.log('🎓 [Onboarding] Initializing onboarding system...')
    const onboardingStore = useOnboardingStore()
    
    // 初始化引导状态（使用user_id而不是id）
    const uniqueUserId = authStore.user.user_id?.toString() || authStore.user.id.toString()
    await onboardingStore.initialize(uniqueUserId)
    debug.log('🎓 [Onboarding] Initialized with userId:', uniqueUserId)
    
    // 启动Tips引擎（开发环境启用调试）
    const engine = getTipsEngine({
      enabled: true,
      autoStart: true,
      debug: import.meta.env.DEV
    })
    
    debug.log('🎓 [Onboarding] Current status:', {
      isStarted: onboardingStore.isStarted,
      completed: onboardingStore.completed,
      progress: onboardingStore.progress,
      currentStage: onboardingStore.currentStage
    })
    
    // 空设备列表可提供引导；没有引导记录不代表新账号。登录保留目的页面。
    if (onboardingStore.canOfferFirstDevice && !onboardingStore.isStarted) {
      onboardingStore.start()
    }
  }
})
</script>

<style lang="scss" scoped>
.main-layout {
  .soft-header {
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    
    .q-toolbar {
      min-height: 64px;
      color: var(--text-primary);
      
      .q-btn-dropdown,
      .q-btn {
        color: var(--text-primary);
        transition: all 0.2s ease;
        border-radius: 8px;
        
        &:hover {
          background-color: var(--page-bg);
        }
        
        .q-btn__content {
          gap: 6px;
          font-weight: 500;
        }
      }
      
      .user-menu-btn {
        .text-white {
          color: var(--text-primary) !important;
        }
      }
    }
  }
  
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
    background: var(--sidebar-bg, #FFFFFF);
    border-bottom: 1px solid var(--sidebar-border, #E2E8F0);
    color: var(--text-primary, #0F172A);

    .brand-title {
      color: var(--text-primary, #0F172A);
      letter-spacing: 0.2px;
    }

    .brand-tagline {
      color: var(--text-muted, #94A3B8);
      font-size: 0.75rem;
      margin-top: 2px;
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.18);
    }
  }
  
  // 侧边栏菜单容器
  .sidebar-menu {
    .q-list {
      .q-item {
        position: relative;
      }
    }
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
  
  // 子菜单项样式
  .nav-child-item {
    padding-left: 56px; // 增加左边距以显示层级关系
    
    .q-item__section--avatar {
      min-width: 40px;
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

// 用户头像样式
.user-menu-btn {
  .user-avatar-header {
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: border-color 0.3s ease;
  }
  
  &:hover .user-avatar-header {
    border-color: rgba(255, 255, 255, 0.6);
  }
}

// 深色模式优化
.body--dark {
  .main-layout {
    .soft-header {
      background: var(--soft-bg-primary-dark, #1a1a1a);
      border-bottom-color: var(--soft-border-dark, rgba(255, 255, 255, 0.08));
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      
      .q-toolbar {
        color: var(--soft-text-primary-dark, #e0e0e0);
        
        .q-btn-dropdown,
        .q-btn {
          color: var(--soft-text-primary-dark, #e0e0e0);
          
          &:hover {
            background-color: var(--soft-bg-secondary-dark, rgba(255, 255, 255, 0.08));
          }
        }
        
        .user-menu-btn {
          .text-white {
            color: var(--soft-text-primary-dark, #e0e0e0) !important;
          }
        }
      }
    }
    
    .drawer-header {
      background: #0F172A;
      border-bottom-color: #1E293B;

      .brand-title { color: #F8FAFC; }
      .brand-tagline { color: #64748B; }
    }
    
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
