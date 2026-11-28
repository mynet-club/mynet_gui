<template>
  <q-layout view="lHh Lpr lFf" class="main-layout theme-transition">
    <!-- Header（与本机一致的 56px 骨架；顶部 2px 品牌蓝语义色条区分云端模式） -->
    <q-header class="soft-header soft-header--cloud">
      <q-toolbar class="shell-toolbar">
        <q-btn
          flat
          dense
          round
          size="sm"
          :icon="leftDrawerOpen ? 'menu_open' : 'menu'"
          :aria-label="$t('common.navigation')"
          :aria-expanded="leftDrawerOpen"
          @click="toggleLeftDrawer"
          class="drawer-toggle-btn"
        >
          <q-tooltip>{{ leftDrawerOpen ? '收起侧边栏' : '展开侧边栏' }}</q-tooltip>
        </q-btn>

        <ModeSwitcher v-if="inLocalHost" class="q-ml-xs" />

        <div class="header-divider gt-xs" />

        <!-- 云端上下文：当前网络区 -->
        <TenantSelector show-name class="gt-xs" />

        <q-space />

        <!-- 与本机完全一致的右侧公共操作区 -->
        <HeaderUtilityBar mode="cloud" />
      </q-toolbar>
    </q-header>

    <!-- Left Drawer（与本机完全一致的 256px 宽 + 56px 品牌顶栏） -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="sidebar-menu"
      :width="256"
      :breakpoint="1024"
    >
      <!-- Drawer Header -->
      <div class="drawer-brand">
        <img :src="iconUrl" alt="MyNet" class="brand-logo" />
        <span class="brand-title">{{ $t('app.name') }}</span>
        <span class="mode-tag mode-tag--cloud">云端</span>
      </div>

      <!-- Navigation Menu（7 项扁平主入口） -->
      <q-list padding class="nav-list">
        <q-item
          v-for="item in cloudNavigationItems"
          :key="item.name"
          clickable
          :to="item.path"
          :active="isNavActive(item)"
          active-class="q-router-link--active"
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(item.label) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- AI 助手悬浮入口（与 console 一致的漂浮机器人） -->
    <q-btn
      v-if="user"
      class="ai-fab"
      round
      unelevated
      color="primary"
      icon="smart_toy"
      size="lg"
      :aria-label="$t('ai.title')"
      @click="showAi = true"
    >
      <q-tooltip anchor="top middle" self="bottom middle">{{ $t('ai.title') }}</q-tooltip>
    </q-btn>

    <!-- C 端 AI 助手（user-ai + ai-streaming；本地排障复用同一组件并注入脱敏摘要） -->
    <UserAiAssistant v-model="showAi" />
  </q-layout>
</template>

<script setup lang="ts">
// 图标跟着 publicPath 走 —— 收进 /gui/ 后写死 /icons/ 会 404
const iconUrl = (import.meta.env.BASE_URL || '/') + 'icons/icon.png'
import { ref, computed, onMounted, watch } from 'vue'
import debug from '../utils/debug'
import { useRoute } from 'vue-router'
import { LocalStorage } from 'quasar'
import { useAuthStore } from '../stores/auth'
import TenantSelector from '../components/common/TenantSelector.vue'
import UserAiAssistant from '../components/ai/UserAiAssistant.vue'
import ModeSwitcher from '../components/common/ModeSwitcher.vue'
import HeaderUtilityBar from '../components/common/HeaderUtilityBar.vue'
import { isLocalMode } from '../config/localMode'

const route = useRoute()
const authStore = useAuthStore()
const inLocalHost = isLocalMode()

// 与本机共用同一个侧边栏折叠状态，切换模式时零跳动
const leftDrawerOpen = ref(LocalStorage.getItem<boolean>('mynet_drawer_open') ?? true)
const showAi = ref(false)

const user = computed(() => authStore.user)

interface NavigationItem {
  name: string
  label: string
  icon: string
  path: string
  matchPrefix: string
}

const isNavActive = (item: NavigationItem) =>
  route.path === item.matchPrefix || route.path.startsWith(`${item.matchPrefix}/`)

// C 端云端空间 7 项扁平主入口（无二级折叠）
const cloudNavigationItems = computed((): NavigationItem[] => [
  {
    name: 'dashboard',
    label: 'navigation.dashboard',
    icon: 'dashboard',
    path: '/cloud/dashboard',
    matchPrefix: '/cloud/dashboard'
  },
  {
    name: 'nodes',
    label: 'navigation.nodes',
    icon: 'devices',
    path: '/cloud/nodes',
    matchPrefix: '/cloud/nodes'
  },
  {
    name: 'ippools',
    label: 'navigation.ippools',
    icon: 'layers',
    path: '/cloud/ip-resources',
    matchPrefix: '/cloud/ip-resources'
  },
  {
    name: 'social',
    label: 'navigation.social.title',
    icon: 'people',
    path: '/cloud/social/friends',
    matchPrefix: '/cloud/social'
  },
  {
    name: 'routes',
    label: 'navigation.routes.title',
    icon: 'alt_route',
    path: '/cloud/routes',
    matchPrefix: '/cloud/routes'
  },
  {
    name: 'services',
    label: 'navigation.services.title',
    icon: 'apps',
    path: '/cloud/services',
    matchPrefix: '/cloud/services'
  },
  {
    name: 'utc',
    label: 'navigation.utc.title',
    icon: 'speed',
    path: '/cloud/utc/nodes',
    matchPrefix: '/cloud/utc'
  }
])

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

onMounted(async () => {
  watch(leftDrawerOpen, (open) => LocalStorage.set('mynet_drawer_open', open))

  if (authStore.isAuthenticated) {
    try {
      await authStore.restoreCurrentTenant()
    } catch (error) {
      debug.error('🔧 [MainLayout] Failed to load tenants:', error)
    }
  }

})
</script>

<style lang="scss" scoped>
.main-layout {
  .soft-header {
    background: var(--header-bg, #ffffff);
    border-top: 2px solid #2563eb;
    border-bottom: 1px solid var(--header-border, #e2e8f0);
    box-shadow: 0 1px 4px rgba(37, 99, 235, 0.05);

    .shell-toolbar {
      min-height: 54px;
      padding: 0 14px;
      color: var(--text-primary);

      .q-btn-dropdown,
      .q-btn {
        color: var(--text-primary);
        transition: all 0.15s ease;
        border-radius: 8px;

        &:hover {
          background-color: var(--page-bg);
        }
      }
    }
  }

  .drawer-toggle-btn {
    width: 28px;
    height: 28px;
    color: #475569 !important;
    border-radius: 6px !important;

    &:hover {
      background: rgba(37, 99, 235, 0.08) !important;
      color: #2563eb !important;
    }
  }

  .header-divider {
    width: 1px;
    height: 18px;
    background: #cbd5e1;
    margin: 0 12px;
    flex-shrink: 0;
  }

  .drawer-brand {
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--sidebar-bg, #ffffff);
    border-bottom: 1px solid var(--sidebar-border, #e2e8f0);

    .brand-logo {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.18);
    }

    .brand-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: var(--text-primary, #0f172a);
    }

    .mode-tag {
      margin-left: auto;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 999px;

      &--cloud {
        background: rgba(37, 99, 235, 0.1);
        color: #2563eb;
      }
    }
  }

  .sidebar-menu {
    .nav-list {
      padding: 10px 8px;
    }
  }

  .nav-item {
    margin: 3px 0;
    border-radius: 8px;
    min-height: 40px;
    font-size: 13.5px;
    transition: all 0.15s ease;

    :deep(.q-item__section--avatar) {
      min-width: 36px;
    }

    &:hover {
      background-color: rgba(37, 99, 235, 0.08);
    }

    &.q-router-link--active {
      background-color: #2563eb;
      color: white;
      font-weight: 500;

      .q-icon {
        color: white;
      }
    }
  }
}

.body--dark {
  .main-layout {
    .soft-header {
      background: var(--soft-bg-primary-dark, #1a1a1a);
      border-bottom-color: var(--soft-border-dark, rgba(255, 255, 255, 0.08));
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      .shell-toolbar {
        color: var(--soft-text-primary-dark, #e0e0e0);
      }
    }

    .header-divider {
      background: #334155;
    }

    .drawer-brand {
      background: #0F172A;
      border-bottom-color: #1E293B;

      .brand-title {
        color: #F8FAFC;
      }

      .mode-tag--cloud {
        background: rgba(59, 130, 246, 0.18);
        color: #93c5fd;
      }
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.ai-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.3);
  }
}

@media (max-width: 599px) {
  .ai-fab {
    right: 16px;
    bottom: 16px;
  }
}
</style>
