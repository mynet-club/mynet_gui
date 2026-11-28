<template>
  <q-layout view="lHh Lpr lFf" class="local-layout theme-transition">
    <!-- Top Header（与云端一致的 56px 骨架；顶部 2px 青绿语义色条区分本机模式） -->
    <q-header class="shell-header shell-header--local">
      <q-toolbar class="shell-toolbar">
        <q-btn
          flat
          dense
          round
          size="sm"
          :icon="left ? 'menu_open' : 'menu'"
          aria-label="切换侧边栏"
          class="drawer-toggle-btn"
          @click="left = !left"
        >
          <q-tooltip>{{ left ? '收起侧边栏' : '展开侧边栏' }}</q-tooltip>
        </q-btn>

        <ModeSwitcher class="q-ml-xs" />

        <div class="header-divider gt-xs" />

        <!-- 本机上下文：运行形态 + 网络区 → 本机设备名 -->
        <div class="local-context gt-xs" style="min-width:0">
          <span v-if="formLabel" class="form-badge">{{ formLabel }}</span>
          <span v-if="session.zone" class="ctx-zone ellipsis">{{ session.zone }}</span>
          <q-icon v-if="session.zone && session.node" name="chevron_right" size="15px" class="ctx-sep" />
          <span v-if="session.node" class="ctx-node ellipsis">{{ session.node }}</span>
          <span v-if="!session.zone && !session.node" class="ctx-muted">
            {{ session.user ? '本机未绑定设备' : '未登录' }}
          </span>
        </div>

        <q-space />

        <HeaderUtilityBar
          mode="local"
          :refreshing="store.loading"
          @refresh="onRefresh"
          @open-login="loginOpen = true"
        />
      </q-toolbar>
    </q-header>

    <!-- Left Drawer（与云端完全一致的 256px 宽 + 56px 品牌顶栏；柔和青绿底色区分本机） -->
    <q-drawer
      v-model="left"
      show-if-above
      bordered
      :width="256"
      :breakpoint="1024"
      class="local-drawer"
    >
      <div class="drawer-brand">
        <img :src="iconUrl" alt="MyNet" class="brand-logo" />
        <span class="brand-title">MyNet</span>
        <span class="mode-tag mode-tag--local">本机</span>
      </div>

      <q-list padding class="nav-list">
        <q-item
          v-for="item in navItems"
          :key="item.to"
          clickable
          :to="item.to"
          exact
          active-class="nav-item--active"
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="local-page-container">
      <q-page class="q-pa-md">
        <div class="local-page-shell">
          <MynetStatusBanner
            v-if="banner"
            class="q-mb-md"
            :title="banner.title"
            :detail="banner.detail"
            :tone="banner.tone"
            :action-label="banner.actionLabel"
            @action="onBannerAction"
          />
          <router-view />
        </div>
      </q-page>
    </q-page-container>

    <MynetLoginDialog v-model="loginOpen" @success="onLoggedIn" />

    <!-- 本机客户端漂浮 AI 机器人（与 APP 一致的悬浮球；支持自选 Flash 模型 + 自带 Key） -->
    <q-btn
      class="ai-fab"
      round
      unelevated
      color="teal-8"
      icon="smart_toy"
      size="lg"
      aria-label="本机 AI 助手"
      @click="showLocalAi = true"
    >
      <q-tooltip anchor="top middle" self="bottom middle">本机 AI 助手（自选模型 / Key）</q-tooltip>
    </q-btn>

    <LocalByokAiAssistant v-model="showLocalAi" />
  </q-layout>
</template>

<script setup lang="ts">
const iconUrl = (import.meta.env.BASE_URL || '/') + 'icons/icon.png'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LocalStorage } from 'quasar'
import { useExperienceStore } from '../stores/experience'
import MynetStatusBanner from '../components/mynet/MynetStatusBanner.vue'
import MynetLoginDialog from '../components/mynet/MynetLoginDialog.vue'
import LocalByokAiAssistant from '../components/ai/LocalByokAiAssistant.vue'
import ModeSwitcher from '../components/common/ModeSwitcher.vue'
import HeaderUtilityBar from '../components/common/HeaderUtilityBar.vue'

// 与云端共用同一个侧边栏折叠状态，切换模式时零跳动
const left = ref(LocalStorage.getItem<boolean>('mynet_drawer_open') ?? true)
const loginOpen = ref(false)
const showLocalAi = ref(false)
const store = useExperienceStore()
const router = useRouter()

watch(left, (open) => LocalStorage.set('mynet_drawer_open', open))

const formLabel = computed(() => (store.isGateway ? 'GW' : 'PC'))

const identityName = ref('')
const session = computed(() => {
  const w = store.experience?.wizard as Record<string, unknown> | undefined
  const node =
    identityName.value ||
    String(w?.node_name || '') ||
    String((store.experience?.node as { node_name?: string } | undefined)?.node_name || '') ||
    ''
  return {
    zone: String(w?.tenant_name || ''),
    user: String(w?.user_email || ''),
    node
  }
})

async function loadIdentityName() {
  try {
    const { localHttp } = await import('../services/local/localApi')
    const res = await localHttp.get('/config/identity')
    const d = (res.data as { data?: { node_name?: string } })?.data
    if (d?.node_name) identityName.value = d.node_name
  } catch { /* optional */ }
}

const navItems = computed(() => {
  if (store.isGateway) {
    return [
      { to: '/local/overview', label: '网关总览', icon: 'dashboard' },
      { to: '/local/peers', label: '节点与对端', icon: 'lan' },
      { to: '/local/network', label: '网络与路由', icon: 'route' },
      { to: '/local/split', label: '分流与 DNS', icon: 'split' },
      { to: '/local/exit', label: '出口与 ACL', icon: 'policy' },
      { to: '/local/services', label: '服务与插件', icon: 'apps' },
      { to: '/local/acceleration', label: '本机加速', icon: 'speed' },
      { to: '/local/diagnostics', label: '诊断', icon: 'troubleshoot' },
      { to: '/local/logs', label: '日志', icon: 'article' },
      { to: '/local/settings', label: '系统设置', icon: 'settings' }
    ]
  }
  return [
    { to: '/local/home', label: '本机状态', icon: 'home' },
    { to: '/local/node', label: '本机节点', icon: 'hub' },
    { to: '/local/network', label: '网络与路由', icon: 'route' },
    { to: '/local/acceleration', label: '本机加速', icon: 'speed' },
    { to: '/local/diagnostics', label: '诊断', icon: 'troubleshoot' },
    { to: '/local/logs', label: '日志', icon: 'article' },
    { to: '/local/settings', label: '本机设置', icon: 'settings' }
  ]
})

const banner = computed(() => {
  const s = store.uiState
  if (s === 'needs_login') {
    return {
      title: '需要登录',
      detail: '本机会话已失效，请重新登录以同步云端配置。',
      tone: 'warn' as const,
      actionLabel: '去登录'
    }
  }
  if (s === 'needs_install') {
    return {
      title: '本机能力未就绪',
      detail: '请完成安装或修复后继续。',
      tone: 'warn' as const,
      actionLabel: '去处理'
    }
  }
  if (s === 'needs_configuration') {
    return {
      title: '需要完成节点配置',
      detail: '已登录，但本机节点尚未接入。',
      tone: 'warn' as const,
      actionLabel: '去配置'
    }
  }
  if (s === 'error' && store.error) {
    return {
      title: store.error.message,
      detail: store.error.reasonCode ? `reason_code: ${store.error.reasonCode}` : '',
      tone: 'error' as const,
      actionLabel: store.error.retryable ? '重试' : undefined
    }
  }
  if (s === 'degraded') {
    return {
      title: '降级运行',
      detail: '部分能力不可用，页面仍可操作。',
      tone: 'warn' as const,
      actionLabel: '查看详情'
    }
  }
  return null
})

function onLoggedIn() {
  store.refreshAll().catch(() => undefined)
  loadIdentityName()
}

async function onRefresh() {
  await store.refreshAll()
  await store.refreshCapabilities()
  await loadIdentityName()
  try {
    const { localApi } = await import('../services/local/localApi')
    const res = await localApi.refreshNodeNames()
    const { mergePersistedNames } = await import('../utils/nodeDisplay')
    mergePersistedNames(res.names || {})
  } catch { /* 离线/未登录保留旧缓存 */ }
}

function onBannerAction() {
  const s = store.uiState
  if (s === 'needs_login') {
    loginOpen.value = true
    return
  }
  if (s === 'needs_configuration' || s === 'needs_install') {
    router.push('/local/onboarding').catch(() => undefined)
    return
  }
  if (s === 'degraded') {
    router.push('/local/diagnostics').catch(() => undefined)
    return
  }
  if (s === 'error' && store.error?.retryable) {
    store.refreshAll().catch(() => undefined)
    return
  }
  store.refreshAll().catch(() => undefined)
}

function startNameWarmup() {
  const tick = () => {
    import('../services/local/localApi')
      .then(async (m) => {
        const res = await m.localApi.getNodeNames()
        const { mergePersistedNames } = await import('../utils/nodeDisplay')
        mergePersistedNames(res.names || {})
      })
      .catch(() => undefined)
  }
  tick()
  const timer = window.setInterval(tick, 5 * 60 * 1000)
  onUnmounted(() => window.clearInterval(timer))
}

onMounted(() => {
  store.refreshAll().catch(() => undefined)
  loadIdentityName()
  startNameWarmup()
})
</script>

<style lang="scss" scoped>
.local-layout {
  .shell-header {
    background: #ffffff;
    color: #0f172a;
    border-top: 2px solid #0f766e;
    border-bottom: 1px solid #d7ece9;
    box-shadow: 0 1px 4px rgba(15, 118, 110, 0.05);
  }

  .shell-toolbar {
    min-height: 54px;
    padding: 0 14px;
  }

  .drawer-toggle-btn {
    width: 28px;
    height: 28px;
    color: #475569;
    border-radius: 6px;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background: rgba(15, 118, 110, 0.08);
      color: #0f766e;
    }
  }

  .header-divider {
    width: 1px;
    height: 18px;
    background: #cbd5e1;
    margin: 0 12px;
    flex-shrink: 0;
  }

  .local-context {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #0f172a;

    .form-badge {
      display: inline-flex;
      align-items: center;
      height: 20px;
      padding: 0 6px;
      border-radius: 5px;
      background: rgba(15, 118, 110, 0.12);
      color: #0f766e;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .ctx-zone {
      color: #475569;
      max-width: 160px;
    }

    .ctx-sep {
      color: #94a3b8;
      flex-shrink: 0;
    }

    .ctx-node {
      color: #0f172a;
      font-weight: 600;
      max-width: 180px;
    }

    .ctx-muted {
      color: #94a3b8;
    }
  }

  :deep(.local-drawer) {
    background: #f4fbfa;
    border-right-color: #d7ece9;
  }

  .drawer-brand {
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #d7ece9;
  }

  .brand-logo {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(15, 118, 110, 0.16);
  }

  .brand-title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.2px;
    color: #0f172a;
  }

  .mode-tag {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 999px;

    &--local {
      background: rgba(15, 118, 110, 0.12);
      color: #0f766e;
    }
  }

  .nav-list {
    padding: 10px 8px;
  }

  .nav-item {
    margin: 3px 0;
    border-radius: 8px;
    min-height: 40px;
    color: #334155;
    font-size: 13.5px;
    transition: background-color 0.15s ease, color 0.15s ease;

    :deep(.q-item__section--avatar) {
      min-width: 36px;
      color: #64748b;
    }

    &:hover {
      background: rgba(15, 118, 110, 0.08);
      color: #0f766e;

      :deep(.q-item__section--avatar) {
        color: #0f766e;
      }
    }

    &.nav-item--active {
      background: #0f766e;
      color: #ffffff;
      font-weight: 500;

      :deep(.q-item__section--avatar),
      :deep(.q-icon) {
        color: #ffffff;
      }
    }
  }

  .local-page-container {
    background: #f7faf9;
  }
}

.local-page-shell {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.body--dark {
  .local-layout {
    .shell-header {
      background: #0f1c1d;
      color: #e2e8f0;
      border-top-color: #14b8a6;
      border-bottom-color: #163234;
    }

    .drawer-toggle-btn {
      color: #94a3b8;

      &:hover {
        background: rgba(20, 184, 166, 0.14);
        color: #5eead4;
      }
    }

    .header-divider {
      background: #1e3a3c;
    }

    .local-context {
      color: #e2e8f0;

      .form-badge {
        background: rgba(20, 184, 166, 0.18);
        color: #5eead4;
      }

      .ctx-zone {
        color: #94a3b8;
      }

      .ctx-node {
        color: #f8fafc;
      }
    }

    :deep(.local-drawer) {
      background: #0c1718;
      border-right-color: #163234;
    }

    .drawer-brand {
      border-bottom-color: #163234;
    }

    .brand-title {
      color: #f8fafc;
    }

    .mode-tag--local {
      background: rgba(20, 184, 166, 0.18);
      color: #5eead4;
    }

    .nav-item {
      color: #cbd5e1;

      :deep(.q-item__section--avatar) {
        color: #94a3b8;
      }

      &:hover {
        background: rgba(20, 184, 166, 0.14);
        color: #5eead4;
      }

      &.nav-item--active {
        background: #0d9488;
        color: #ffffff;
      }
    }

    .local-page-container {
      background: #091213;
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
