<template>
  <div class="local-split">
    <div class="text-h5 q-mb-md">分流与 DNS</div>
    <MynetAsyncState :state="uiState" :error="err" @retry="load">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <MynetConfigCard title="分流策略">
            <MynetFieldRow label="启用"><q-toggle v-model="draft.enabled" :disable="busy" /></MynetFieldRow>
            <MynetFieldRow label="仅本机生效">
              <q-toggle v-model="draft.local_only" :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="角色">
              <q-select v-model="draft.role" :options="roleOptions" dense outlined emit-value map-options :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="区域">
              <q-select v-model="draft.region" :options="regionOptions" dense outlined emit-value map-options :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="策略">
              <q-select v-model="draft.policy" :options="policyOptions" dense outlined emit-value map-options :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="解算结果" help="由后端矩阵解算">
              <div class="mono text-body2">source={{ proxy?.split?.list_source || '—' }} · mode={{ proxy?.split?.match_mode || '—' }}</div>
            </MynetFieldRow>
          </MynetConfigCard>
        </div>

        <div class="col-12 col-md-6">
          <MynetConfigCard title="DNS / 隧道">
            <MynetFieldRow label="平台 DNS">
              <q-input v-model="platformDns" dense outlined :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="隧道 DNS">
              <q-input v-model="tunnelServer" dense outlined :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="出口 DNS">
              <q-input v-model="exitDns" dense outlined :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="DoH 模式">
              <q-select v-model="dohMode" :options="dohOptions" dense outlined emit-value map-options :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="全隧道">
              <q-toggle v-model="fullTunnel" :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="国际 DNS 走隧道">
              <q-toggle v-model="foreignDns" :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow label="上游策略">
              <q-select v-model="upstreamProxied" :options="upstreamOptions" dense outlined emit-value map-options :disable="busy" />
            </MynetFieldRow>
          </MynetConfigCard>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-6">
          <MynetConfigCard title="代理域名" :subtitle="`基础 ${baseProxied.length} · 自定义 ${customProxiedCount}`">
            <q-input v-model="customProxiedText" type="textarea" dense outlined rows="6" :disable="busy" />
          </MynetConfigCard>
        </div>
        <div class="col-12 col-md-6">
          <MynetConfigCard title="clean 列表" subtitle="这些域名 DNS 走隧道">
            <q-input v-model="upstreamCleanText" type="textarea" dense outlined rows="6" :disable="busy" />
          </MynetConfigCard>
        </div>
      </div>

      <div class="row items-center q-mt-md q-gutter-sm">
        <q-btn outline color="primary" label="即时刷新" :disable="busy" @click="load" />
        <q-btn outline color="primary" label="从云端拉取" :loading="pulling" @click="onPull" />
        <q-space />
        <div v-if="dirty" class="text-caption text-warning">有未保存更改</div>
        <q-btn flat label="重置" :disable="busy || !dirty" @click="resetDraft" />
        <q-btn color="primary" label="保存并生效" :loading="busy" :disable="busy || !dirty" @click="save" />
      </div>
      <q-banner v-if="msg" dense class="q-mt-sm" :class="msgOk ? 'bg-positive' : 'bg-negative'" style="color:#fff">{{ msg }}</q-banner>
    </MynetAsyncState>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { PluginProxyStatus, ProxyPolicyView, UiState } from '../../types/local'
import MynetAsyncState from '../../components/mynet/MynetAsyncState.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'

const data = ref<PluginProxyStatus>({})
const err = ref<LocalApiError | null>(null)
const loading = ref(false)
const busy = ref(false)
const pulling = ref(false)
const msg = ref('')
const msgOk = ref(true)

const uiState = computed<UiState>(() => {
  if (loading.value && !data.value.effective && !data.value.local) return 'loading'
  if (err.value && !data.value.effective && !data.value.local) return 'error'
  return 'ready'
})

const proxy = computed<ProxyPolicyView>(() => data.value.effective?.policy || data.value.local?.policy || {})

const draft = ref<ProxyPolicyView>({
  enabled: false,
  local_only: true,
  role: 'client',
  region: 'domestic',
  policy: 'whitelist',
  domain_rules: { platform_dns: '', tunnel_server: '', exit_dns: '', upstream_clean: [], custom_domains: [], upstream_proxied: 'fast' },
  doh_mode: 'allow',
  full_tunnel: false,
  foreign_dns_route: false
})
const savedJson = ref('')
const dirty = computed(() => JSON.stringify(draft.value) !== savedJson.value)

const customProxiedText = ref('')
const upstreamCleanText = ref('')

const platformDns = computed({
  get: () => draft.value.domain_rules?.platform_dns || '',
  set: (v: string) => { draft.value.domain_rules = { ...(draft.value.domain_rules || {}), platform_dns: v } }
})
const tunnelServer = computed({
  get: () => draft.value.domain_rules?.tunnel_server || '',
  set: (v: string) => { draft.value.domain_rules = { ...(draft.value.domain_rules || {}), tunnel_server: v } }
})
const exitDns = computed({
  get: () => draft.value.domain_rules?.exit_dns || '',
  set: (v: string) => { draft.value.domain_rules = { ...(draft.value.domain_rules || {}), exit_dns: v } }
})
const dohMode = computed({
  get: () => draft.value.doh_mode || 'allow',
  set: (v: 'allow' | 'block' | 'tunnel') => { draft.value.doh_mode = v }
})
const fullTunnel = computed({
  get: () => !!draft.value.full_tunnel,
  set: (v: boolean) => { draft.value.full_tunnel = v }
})
const foreignDns = computed({
  get: () => !!draft.value.foreign_dns_route,
  set: (v: boolean) => { draft.value.foreign_dns_route = v }
})
const upstreamProxied = computed({
  get: () => draft.value.domain_rules?.upstream_proxied || 'fast',
  set: (v: string) => { draft.value.domain_rules = { ...(draft.value.domain_rules || {}), upstream_proxied: v } }
})

watch(customProxiedText, (t) => {
  draft.value.domain_rules = {
    ...(draft.value.domain_rules || {}),
    custom_domains: t.split('\n').map((s) => s.trim()).filter(Boolean)
  }
})
watch(upstreamCleanText, (t) => {
  draft.value.domain_rules = {
    ...(draft.value.domain_rules || {}),
    upstream_clean: t.split('\n').map((s) => s.trim()).filter(Boolean)
  }
})

const roleOptions = [
  { label: '仅客户端', value: 'client' },
  { label: '仅出口', value: 'server' },
  { label: '双向', value: 'both' }
]
const regionOptions = [
  { label: '国内', value: 'domestic' },
  { label: '国际', value: 'international' }
]
const policyOptions = [
  { label: '白名单', value: 'whitelist' },
  { label: '黑名单', value: 'blacklist' }
]
const dohOptions = [
  { label: '允许', value: 'allow' },
  { label: '阻断', value: 'block' },
  { label: '走隧道', value: 'tunnel' }
]
const upstreamOptions = [
  { label: 'fast', value: 'fast' },
  { label: 'clean', value: 'clean' },
  { label: 'balanced', value: 'balanced' }
]

const baseProxied = computed(() => proxy.value.domain_rules?.proxied || [])
const customProxiedCount = computed(() => draft.value.domain_rules?.custom_domains?.length || 0)

function resetDraft() {
  const p = proxy.value
  draft.value = {
    enabled: !!p.enabled,
    local_only: p.local_only ?? true,
    role: p.role || 'client',
    region: p.region || 'domestic',
    policy: p.policy || 'whitelist',
    domain_rules: {
      platform_dns: p.domain_rules?.platform_dns || '',
      tunnel_server: p.domain_rules?.tunnel_server || '',
      exit_dns: p.domain_rules?.exit_dns || '',
      upstream_clean: [...(p.domain_rules?.upstream_clean || [])],
      custom_domains: [...(p.domain_rules?.custom_domains || [])],
      proxied: [...(p.domain_rules?.proxied || [])],
      upstream_proxied: p.domain_rules?.upstream_proxied || 'fast'
    },
    doh_mode: p.doh_mode || 'allow',
    full_tunnel: !!p.full_tunnel,
    foreign_dns_route: !!p.foreign_dns_route
  }
  customProxiedText.value = draft.value.domain_rules?.custom_domains?.join('\n') || ''
  upstreamCleanText.value = draft.value.domain_rules?.upstream_clean?.join('\n') || ''
  savedJson.value = JSON.stringify(draft.value)
}

async function load() {
  loading.value = true
  err.value = null
  try {
    data.value = await localGatewayApi.getPluginProxy()
    resetDraft()
  } catch (e) {
    err.value = e instanceof LocalApiError ? e : new LocalApiError({ success: false, message: String(e) })
  } finally {
    loading.value = false
  }
}

async function onPull() {
  pulling.value = true
  msg.value = ''
  try {
    await localGatewayApi.runCommand(['config', 'pull', '--json'], 90000)
    await load()
    msgOk.value = true
    msg.value = '已从云端刷新'
  } catch (e) {
    msgOk.value = false
    msg.value = e instanceof Error ? e.message : String(e)
  } finally {
    pulling.value = false
  }
}

async function save() {
  busy.value = true
  msg.value = ''
  try {
    await localGatewayApi.postPluginProxy(draft.value)
    msgOk.value = true
    msg.value = '已保存并生效'
    await load()
  } catch (e) {
    msgOk.value = false
    msg.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
