<template>
  <q-layout view="hHh LpR fFf" class="local-layout">
    <q-header :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9'">
      <q-toolbar class="q-px-sm" style="min-height:44px">
        <q-btn flat dense round icon="menu" class="lt-md" size="sm" @click="left = !left" />
        <div class="row items-center no-wrap q-ml-sm" style="min-width:0">
          <span class="text-weight-medium text-no-wrap">MyNet</span>
          <q-badge v-if="formLabel" color="primary" class="q-mx-xs">{{ formLabel }}</q-badge>
          <!-- 会话：网络区 → 用户 → 节点 -->
          <div class="session-path gt-sm">
            <span v-if="session.zone">{{ session.zone }}</span>
            <span class="sep">→</span>
            <span v-if="session.user" class="ellipsis" style="max-width:160px">{{ session.user }}</span>
            <span v-if="session.user" class="sep">→</span>
            <span v-if="session.node" class="ellipsis" style="max-width:140px">{{ session.node }}</span>
            <span v-if="!session.user" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">未登录</span>
          </div>
        </div>
        <q-space />
        <q-btn flat dense round icon="translate" size="sm" class="q-mr-xs">
          <q-menu>
            <q-list dense style="min-width: 120px">
              <q-item clickable v-close-popup @click="setLocale('zh-CN')">
                <q-item-section>中文</q-item-section>
                <q-item-section side v-if="locale === 'zh-CN'"><q-icon name="check" /></q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setLocale('en-US')">
                <q-item-section>English</q-item-section>
                <q-item-section side v-if="locale === 'en-US'"><q-icon name="check" /></q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense round :icon="theme === 'dark' ? 'dark_mode' : 'light_mode'" size="sm" class="q-mr-xs" @click="toggleTheme">
          <q-tooltip>{{ theme === 'dark' ? '切换浅色' : '切换深色' }}</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="refresh" size="sm" :loading="store.loading" @click="onRefresh" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="left"
      show-if-above
      bordered
      :width="220"
      class="local-drawer"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'"
    >
      <q-list padding>
        <q-item-label header class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">导航</q-item-label>
        <q-item
          v-for="item in navItems"
          :key="item.to"
          clickable
          :to="item.to"
          exact
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
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
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useExperienceStore } from '../stores/experience'
import MynetStatusBanner from '../components/mynet/MynetStatusBanner.vue'
import MynetLoginDialog from '../components/mynet/MynetLoginDialog.vue'

const left = ref(false)
const loginOpen = ref(false)
const store = useExperienceStore()
const router = useRouter()
const $q = useQuasar()

const locale = ref(localStorage.getItem('app-locale') || 'zh-CN')
const theme = ref(localStorage.getItem('mynet-theme') || ($q.dark.isActive ? 'dark' : 'light'))

function setLocale(v: string) {
  locale.value = v
  localStorage.setItem('app-locale', v)
}
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
watch(theme, (v) => {
  localStorage.setItem('mynet-theme', v)
  $q.dark.set(v === 'dark')
}, { immediate: true })
watch(locale, (v) => {
  // i18n 语言切换与偏好持久化；完整文案包在 i18n，这里保证偏好一致
  document.documentElement.setAttribute('lang', v)
}, { immediate: true })

const formLabel = computed(() => {
  if (store.isGateway) return 'GW'
  return 'PC'
})

const identityName = ref('')
const session = computed(() => {
  const w = store.experience?.wizard as Record<string, unknown> | undefined
  // 优先本机身份展示名（如「Mac 笔记本」），不要拿 ID 顶替
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

const toneClass = computed(() => {
  const t = store.uiStateLabel.tone
  if (t === 'ok') return 'positive'
  if (t === 'warn') return 'warning'
  if (t === 'error') return 'negative'
  return 'grey-7'
})

const navItems = computed(() => {
  // gateway-only 项只在 capability 明确 form=gw 时出现（不猜 OS）。
  // capabilities 未返回时按桌面默认，隐藏高级项。
  if (store.isGateway) {
    return [
      { to: '/overview', label: '总览', icon: 'dashboard' },
      { to: '/peers', label: '节点与对端', icon: 'lan' },
      { to: '/network', label: '网络/路由', icon: 'route' },
      { to: '/split', label: '分流与 DNS', icon: 'split' },
      { to: '/exit', label: '出口与 ACL', icon: 'policy' },
      { to: '/services', label: '服务与插件', icon: 'apps' },
      { to: '/diagnostics', label: '诊断', icon: 'troubleshoot' },
      { to: '/logs', label: '日志', icon: 'article' },
      { to: '/console', label: '云端', icon: 'cloud' },
      { to: '/settings', label: '系统设置', icon: 'settings' }
    ]
  }
  return [
    { to: '/home', label: '首页', icon: 'home' },
    { to: '/node', label: '节点', icon: 'hub' },
    { to: '/network', label: '网络', icon: 'route' },
    { to: '/settings', label: '设置', icon: 'settings' },
    { to: '/acceleration', label: '加速', icon: 'speed' },
    { to: '/diagnostics', label: '诊断', icon: 'troubleshoot' },
    { to: '/logs', label: '日志', icon: 'article' },
    { to: '/console', label: '云端', icon: 'cloud' }
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
  // 显式刷新才更新设备名缓存（成功则本地永久保存，失败保留旧名）
  try {
    const { localApi } = await import('../services/local/localApi')
    const res = await localApi.refreshNodeNames()
    const { mergePersistedNames } = await import('../utils/nodeDisplay')
    mergePersistedNames(res.names || {})
  } catch { /* 离线/未登录保留旧缓存 */ }
}

function onBannerAction() {
  const s = store.uiState
  // 登录在当前页弹框，不跳页
  if (s === 'needs_login') {
    loginOpen.value = true
    return
  }
  if (s === 'needs_configuration' || s === 'needs_install') {
    router.push('/onboarding').catch(() => undefined)
    return
  }
  if (s === 'degraded') {
    router.push('/diagnostics').catch(() => undefined)
    return
  }
  if (s === 'error' && store.error?.retryable) {
    store.refreshAll().catch(() => undefined)
    return
  }
  store.refreshAll().catch(() => undefined)
}

function startNameWarmup() {
  // 自动缓存：静默补齐设备名（缺条目/过期时后端才会真拉云端）
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
.local-page-shell {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}
.local-layout :deep(.q-toolbar) {
  min-height: 44px;
}


</style>
