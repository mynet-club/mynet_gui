<template>
  <div class="local-acceleration">
    <div class="row items-center q-mb-md">
      <div class="text-h5">加速</div>
      <q-space />
      <div class="row items-center q-gutter-md">
        <div class="row items-center q-gutter-sm">
          <span class="text-body2">加速</span>
          <q-toggle
            v-model="draft.enabled"
            color="primary"
            :disable="store.applying"
            @update:model-value="onToggleEnabled"
          />
          <span class="text-caption">{{ draft.enabled ? '已开' : '已关' }}</span>
        </div>
        <div class="row items-center q-gutter-sm">
          <span class="text-body2">DNS</span>
          <q-toggle
            v-model="draft.dns_enabled"
            color="primary"
            :disable="store.applying || !draft.enabled"
            @update:model-value="onToggleDns"
          />
          <span class="text-caption">{{ draft.dns_enabled ? '已开' : '已关' }}</span>
        </div>
        <q-space />
        <q-btn
          flat
          label="重置"
          :disable="store.applying || !dirty"
          @click="resetDraft"
        />
        <q-btn
          color="primary"
          label="保存加速配置"
          :loading="store.applying"
          :disable="store.applying || !dirty"
          @click="onSave"
        />
      </div>
    </div>

    <q-banner v-if="!draft.enabled" dense class="q-mb-md banner-soft">
      加速已关闭。出口与域名加速不生效；DNS 也无法开启。
    </q-banner>
    <q-banner v-else-if="!draft.dns_enabled" dense class="q-mb-md banner-soft">
      加速已开、DNS 未开：仅按出口/路由加速，不做域名钉扎。
    </q-banner>
    <q-banner v-if="cmdMsg" dense class="q-mb-md" :class="cmdOk ? 'bg-positive' : 'bg-negative'" style="color:#fff">
      {{ cmdMsg }}
    </q-banner>

    <!-- 信息面：状态总览，卡头可展开操作 -->
    <div class="accel-summary-row row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <div class="info-card">
          <div class="info-head">
            <div class="info-main">
              <div class="info-title">出口</div>
              <div class="info-value">{{ exitPeer }}</div>
            </div>
            <q-btn dense flat icon="tune" label="配置" @click="ops = 'exit'" />
          </div>
          <div class="info-sub">
            <span :class="exitToneClass">{{ exitNodeLine || '仅后端确认可达的节点' }}</span>
            <span v-if="exitNodeDetail" class="muted"> · {{ exitNodeDetail }}</span>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="info-card">
          <div class="info-head">
            <div class="info-main">
              <div class="info-title">DNS 优先级</div>
              <div class="info-value">{{ activeDns }}</div>
            </div>
            <q-btn dense flat icon="tune" label="配置" @click="ops = 'dns'" />
          </div>
          <div class="info-sub">上游：{{ dnsUpstreams.join(' → ') || activeDns }}</div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="info-card">
          <div class="info-head">
            <div class="info-main">
              <div class="info-title">域名清单</div>
              <div class="info-value">本机 {{ draft.custom_domains.length }} · 云端 {{ cloudDomains.length }}</div>
            </div>
            <q-btn dense flat icon="tune" label="配置" @click="ops = 'domains'" />
          </div>
          <div class="info-sub">三名单：云端预定义 + 本地叠加</div>
        </div>
      </div>
    </div>

    <!-- 操作面：点卡头「配置」展开；默认展开出口 -->
    <MynetAsyncState :state="store.uiState" :error="store.error" @retry="store.refreshAll()">
      <MynetConfigCard v-if="ops && !draft.enabled" title="配置已收起" class="q-mb-md">
        <div class="text-body2 text-grey-7">加速已关闭。开启顶部开关后才能编辑出口 / DNS / 域名。</div>
      </MynetConfigCard>

      <MynetConfigCard v-if="ops === 'exit' && draft.enabled" title="出口配置" class="q-mb-md">
        <MynetFieldRow
          label="加速出口"
          :help="store.isGateway ? '可多选；按顺序作为出口候选' : 'PC 形态单选一个出口'"
        >
          <q-select
            v-if="store.isGateway"
            v-model="exitMulti"
            :options="exitOptions"
            dense outlined emit-value map-options multiple use-chips
            style="max-width:420px"
            :disable="store.applying"
            @update:model-value="onExitMulti"
          />
          <q-select
            v-else
            v-model="draft.exit_peer"
            :options="exitOptions"
            dense outlined emit-value map-options
            style="max-width:420px"
            :disable="store.applying"
          />
        </MynetFieldRow>
        <div v-if="store.isGateway && exitMulti.length > 1" class="text-caption text-grey-7">
          已选 {{ exitMulti.length }} 个出口；PC 形态若表现异常请只留一个。
        </div>
        <div class="row q-gutter-sm">
          <q-btn flat label="收起" @click="ops = ''" />
        </div>
      </MynetConfigCard>

      <MynetConfigCard v-if="ops === 'dns'" title="DNS 解析链" class="q-mb-md">
        <div class="text-caption text-grey-7 q-mb-sm">
          四源优先级即解析顺序；<b>有值的源才生效</b>。custom 源的值在下方填写。
        </div>

        <div v-for="(src, idx) in dnsRows" :key="src.id" class="dns-row q-mb-sm">
          <span class="mono text-caption">{{ idx + 1 }}</span>
          <div class="col">
            <div class="text-body2">{{ src.label }}</div>
            <div class="text-caption mono">{{ src.address }}</div>
          </div>
          <q-icon
            :name="src.hasValue ? 'check_circle' : 'cancel'"
            :color="src.hasValue ? 'positive' : 'negative'"
            size="16px"
          />
        </div>

        <MynetFieldRow class="q-mt-sm" label="custom 源的值（DNS IP）" help="逗号/换行分隔；留空则 custom 源不参与">
          <q-input v-model="customDnsText" type="textarea" dense outlined rows="3" :disable="store.applying" placeholder="1.1.1.1&#10;8.8.8.8" />
        </MynetFieldRow>
        <div class="text-caption text-grey-7 q-mb-sm">
          生效上游：<span class="mono">{{ dnsUpstreams.join(' → ') || '—' }}</span>
        </div>

        <div class="row q-gutter-sm">
          <q-btn flat label="收起" @click="ops = ''" />
        </div>
      </MynetConfigCard>

      <MynetConfigCard v-if="ops === 'domains'" title="域名名单">
        <q-tabs v-model="domainTab" dense align="left" active-color="primary" indicator-color="primary">
          <q-tab name="accel" label="加速名单" />
          <q-tab name="direct" label="直连名单" />
          <q-tab name="block" label="拦截名单" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="domainTab" animated>
          <!-- 加速：本机自定义为主，云端右侧备查 -->
          <q-tab-panel name="accel" class="panel-pad">
            <div class="row items-center q-mb-sm">
              <div class="text-caption text-grey-7">加速名单：本地叠加 + 云端预定义</div>
              <q-space />
              <q-btn outline color="primary" dense label="刷新云端" :loading="refreshing" @click="onRefreshDomains" />
            </div>
            <div class="row q-col-gutter-md list-cols">
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-xs">本机自定义（加速）</div>
                <q-input v-model="customDomainsText" type="textarea" dense outlined rows="10" :disable="store.applying" spellcheck="false" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-xs">云端清单（备查 · {{ cloudDomains.length }} 条）</div>
                <q-input v-model="cloudSearch" dense outlined clearable placeholder="搜索云端…" class="q-mb-sm" />
                <q-input :model-value="cloudBoxText" type="textarea" dense outlined rows="8" readonly />
              </div>
            </div>
          </q-tab-panel>

          <!-- 直连：云端预定义 + 本地叠加 -->
          <q-tab-panel name="direct" class="panel-pad">
            <div class="row q-col-gutter-md list-cols">
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-xs">本机直连（叠加，优先级高于加速）</div>
                <q-input v-model="customDirectText" type="textarea" dense outlined rows="10" :disable="store.applying" spellcheck="false" placeholder="deepseek.com&#10;xiaomimimo.com" />
                <div class="text-caption text-grey-7 q-mt-xs">与云端直连合并；冲突时直连压加速。</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-xs">云端直连（预定义 · {{ cloudDirect.length }} 条）</div>
                <q-input v-model="cloudDirectSearch" dense outlined clearable placeholder="搜索云端直连…" class="q-mb-sm" />
                <q-input :model-value="cloudDirectBox" type="textarea" dense outlined rows="10" readonly />
              </div>
            </div>
          </q-tab-panel>

          <!-- 拦截：云端预定义 + 本地叠加 -->
          <q-tab-panel name="block" class="panel-pad">
            <div class="row q-col-gutter-md list-cols">
              <div class="col-12 col-md-6">
                <div class="row items-center q-mb-xs">
                  <div class="text-caption text-grey-7">本机拦截（叠加，优先级最高）</div>
                  <q-space />
                  <q-toggle v-model="blockEnabled" dense label="启用拦截" @update:model-value="onSaveBlocked" />
                </div>
                <q-input v-model="blockedText" type="textarea" dense outlined rows="10" spellcheck="false" placeholder="ads.example.com" />
                <q-btn class="q-mt-sm" color="primary" label="保存拦截名单" :loading="savingBlocked" @click="onSaveBlocked" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-xs">云端拦截基线（预定义 · {{ blockedCount }} 条）</div>
                <div class="text-body2">{{ adblockLabel }}</div>
                <div class="text-caption text-grey-7 q-mt-sm">云端自动更新；本机拦截叠加其上。优先级：拦截 &gt; 直连 &gt; 加速 &gt; 放行。</div>
                <div class="text-caption text-grey-7 q-mt-sm">「启用拦截」即广告与恶意域名拦截总开关（原附加开关）。</div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </MynetConfigCard>


      <div v-if="dirty" class="text-caption text-warning q-mt-sm">有未保存更改（点右上「保存加速配置」）</div>
    </MynetAsyncState>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { mergePersistedNames, loadPersistedNames, peerDisplayName, type NodeNameSource } from '../../utils/nodeDisplay'
import { formatExitNodeDetail, formatExitNodeLine, exitNodeTone } from '../../utils/exitProbe'
import { useExperienceStore } from '../../stores/experience'
import { localApi, localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { AccelerationConfig, LocalPeer } from '../../types/local'
import MynetAsyncState from '../../components/mynet/MynetAsyncState.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'

const store = useExperienceStore()
const ops = ref<'exit' | 'dns' | 'domains' | ''>('')
const exitMulti = ref<string[]>([])
const refreshing = ref(false)
const cmdMsg = ref('')
const cmdOk = ref(true)
const peerList = ref<LocalPeer[]>([])
const nodeNames = ref<NodeNameSource>({})
const cloudDomains = ref<string[]>([])
const cloudSearch = ref('')
const domainTab = ref<'accel' | 'direct' | 'block'>('accel')
const blockedText = ref('')
const cloudDirect = ref<string[]>([])
const cloudDirectSearch = ref('')
const blockedCount = ref(0)
const blockEnabled = ref(true)
const savingBlocked = ref(false)
const adblockOn = ref(false)
const adblockBusy = ref(false)
const adblockLabel = ref('仅 DNS hook 运行时生效')

const emptyDraft = (): AccelerationConfig & { custom_dns?: string[] } => ({
  enabled: false,
  dns_sources: ['custom', 'tenant', 'peer', 'clean_public'],
  custom_dns: [],
  custom_domains: [],
  exit_peer: ''
})
const draft = ref(emptyDraft())
const savedJson = ref('')
const dirty = computed(() => JSON.stringify(normalize(draft.value)) !== savedJson.value)
const customDomainsText = ref('')
const customDirectText = ref('')
const customDnsText = ref('')
const cleanDnsText = ref('')
const dnsUpstreams = ref<string[]>([])
const dnsSource = ref('')
const loadingDns = ref(false)
const savingDns = ref(false)
const dnsDirty = computed(() => {
  const cur = (dnsUpstreams.value || []).join('\n')
  return cleanDnsText.value.trim() !== cur.trim() && cleanDnsText.value.trim().length > 0
})

function normalize(cfg: AccelerationConfig & { custom_dns?: string[] }) {
  return {
    enabled: cfg.enabled,
    dns_enabled: cfg.dns_enabled ?? false,
    dns_sources: cfg.dns_sources,
    custom_dns: cfg.custom_dns || [],
    custom_domains: cfg.custom_domains,
    exit_peer: cfg.exit_peer || ''
  }
}

const SOURCE_META: Record<string, { label: string; valueHint: string }> = {
  custom: { label: '自定义 custom', valueHint: '下方填写 DNS IP' },
  tenant: { label: '网络区 tenant', valueHint: '租户/平台 DNS' },
  peer: { label: '对端 peer', valueHint: '出口 VIP / 隧道 DNS' },
  clean_public: { label: '公共兜底 clean_public', valueHint: '1.1.1.1 · 8.8.8.8' }
}

const dnsRows = computed(() => {
  const customVals = (customDnsText.value.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean))
  return (draft.value.dns_sources || []).map((id) => {
    const meta = SOURCE_META[id] || { label: id, valueHint: '' }
    let address = ''
    let hasValue = false
    if (id === 'custom') {
      address = customVals.join(', ') || '（未配置，不参与）'
      hasValue = customVals.length > 0
    } else if (id === 'clean_public') {
      address = '1.1.1.1 · 8.8.8.8'
      hasValue = true
    } else if (id === 'peer') {
      address = dnsUpstreams.value.find((u) => u.startsWith('10.')) || meta.valueHint
      hasValue = !!address && address !== meta.valueHint
    } else {
      address = meta.valueHint
      hasValue = true
    }
    return { id, label: meta.label, address, hasValue, healthy: hasValue }
  })
})

const activeDns = computed(() => {
  const first = dnsRows.value.find((r) => r.hasValue)
  return first ? `${first.label} · ${first.address}` : '未配置'
})
const dnsSummary = computed(() => dnsRows.value.map((r) => `${r.label}：${r.address}`).join('；'))

const exitPeer = computed(() => {
  const cur = draft.value.exit_peer
  if (!cur) return '未选择'
  const opt = exitOptions.value.find((o) => o.value === cur)
  return opt ? opt.label : cur
})
const exitProbe = computed(() => store.acceleration?.runtime?.exit_probe || null)
const exitNodeLine = computed(() => formatExitNodeLine(exitProbe.value))
const exitNodeDetail = computed(() => formatExitNodeDetail(exitProbe.value))
const exitToneClass = computed(() => {
  const t = exitNodeTone(exitProbe.value)
  return t === 'ok' ? 'text-positive' : t === 'error' ? 'text-negative' : t === 'warn' ? 'text-warning' : ''
})

const exitOptions = computed(() => {
  const opts: { label: string; value: string }[] = []
  for (const p of peerList.value) {
    // 只收真 peer：有 node_id、非网段（overlay 末段 0）、非本机
    if (p.is_self) continue
    const id = String(p.node_id || '').trim()
    const ip = String(p.overlay || '')
    if (!id) continue
    if (ip && /\.0$/.test(ip)) continue // 网段行不是出口节点
    opts.push({ label: `${peerDisplayName(p, nodeNames.value)} · ${ip || id}`, value: id })
  }
  const current = draft.value.exit_peer
  if (current && !opts.some((o) => o.value === current)) {
    opts.unshift({ label: current, value: current })
  }
  if (!opts.length) opts.push({ label: '暂无可用 peer', value: '' })
  return opts
})

const cloudPreviewLines = computed(() => cloudDomains.value)
const searchHits = computed(() => {
  const q = cloudSearch.value.trim().toLowerCase()
  if (!q) return []
  return cloudDomains.value.filter((d) => d.toLowerCase().includes(q))
})
// 搜索时框内显示命中结果；无搜索显示完整缓存（截断提示）
const cloudDirectBox = computed(() => {
  const q = cloudDirectSearch.value.trim().toLowerCase()
  if (!q) return cloudDirect.value.join('\n')
  return cloudDirect.value.filter((d) => d.toLowerCase().includes(q)).join('\n')
})
const cloudBoxText = computed(() => {
  if (cloudSearch.value.trim()) return searchHits.value.join('\n')
  return cloudPreviewLines.value.join('\n')
})

watch(customDomainsText, (text) => {
  draft.value.custom_domains = text.split('\n').map((s) => s.trim()).filter(Boolean)
})
watch(customDnsText, (text) => {
  draft.value.custom_dns = text.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
})

function resetDraft() {
  const acc = store.acceleration as {
    enabled?: boolean
    exit_peer?: string
    dns_sources?: string[]
    custom_domains?: string[]
  } | null
  draft.value = {
    enabled: acc?.enabled ?? false,
    dns_enabled: (acc as { dns_enabled?: boolean } | null)?.dns_enabled ?? false,
    dns_sources: (acc?.dns_sources && acc.dns_sources.length ? acc.dns_sources : ['custom', 'tenant', 'peer', 'clean_public']) as string[],
    custom_dns: [...((acc as { custom_dns?: string[] } | null)?.custom_dns || draft.value.custom_dns || [])],
    custom_domains: acc?.custom_domains || [],
    exit_peer: acc?.exit_peer || draft.value.exit_peer || ''
  }
  exitMulti.value = draft.value.exit_peer ? [draft.value.exit_peer] : []
  customDomainsText.value = draft.value.custom_domains.join('\n')
  customDnsText.value = (draft.value.custom_dns || []).join('\n')
  savedJson.value = JSON.stringify(normalize(draft.value))
}

async function loadCustomDirect() {
  try {
    const { localGatewayApi } = await import('../../services/local/localApi')
    const d = await localGatewayApi.getPluginProxy() as {
      local?: { policy?: { domain_rules?: { custom_direct?: string[] } } }
    }
    const list = d.local?.policy?.domain_rules?.custom_direct || []
    customDirectText.value = list.join('\n')
  } catch {
    /* 保留当前框 */
  }
}

async function saveCustomDirect() {
  const { localGatewayApi } = await import('../../services/local/localApi')
  const d = await localGatewayApi.getPluginProxy() as {
    local?: { policy?: Record<string, unknown> }
  }
  const policy = { ...(d.local?.policy || {}) }
  const dr = { ...((policy.domain_rules as Record<string, unknown>) || {}) }
  dr.custom_direct = customDirectText.value
    .split('\n').map((s) => s.trim()).filter(Boolean)
  policy.domain_rules = dr
  await localGatewayApi.postPluginProxy(policy)
}

async function loadBlocked() {
  try {
    const { localApi } = await import('../../services/local/localApi')
    const res = await localApi.getDomains()
    blockedText.value = (res.custom_blocked || []).join('\n')
    blockEnabled.value = res.blocked_enabled !== false
    cloudDirect.value = res.cloud_direct || []
    blockedCount.value = res.blocked_count || 0
  } catch { /* 保留当前框 */ }
}

async function onSaveBlocked() {
  savingBlocked.value = true
  try {
    const { localApi } = await import('../../services/local/localApi')
    await localApi.putBlocked(
      blockedText.value.split('\n').map((s) => s.trim()).filter(Boolean),
      blockEnabled.value
    )
    cmdOk.value = true
    cmdMsg.value = '拦截名单已保存'
    await loadAdblock()
  } catch (e) {
    cmdOk.value = false
    cmdMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    savingBlocked.value = false
  }
}

async function loadExits() {
  try {
    const { localGatewayApi } = await import('../../services/local/localApi')
    const d = await localGatewayApi.getPluginProxy() as {
      effective?: { policy?: { exits?: { node_id?: string; via?: string; enabled?: boolean }[] } }
      local?: { policy?: { exits?: { node_id?: string; via?: string; enabled?: boolean }[] } }
    }
    const exits = d.effective?.policy?.exits || d.local?.policy?.exits || []
    const first = exits.find((e) => e.enabled !== false && e.node_id)
    if (first?.node_id) draft.value.exit_peer = String(first.node_id)
  } catch { /* optional */ }
}

async function saveExits() {
  const { localGatewayApi } = await import('../../services/local/localApi')
  const d = await localGatewayApi.getPluginProxy() as { local?: { policy?: Record<string, unknown> } }
  const policy = { ...(d.local?.policy || {}) }
  const id = draft.value.exit_peer
  policy.exits = id ? [{ node_id: id, enabled: true }] : []
  await localGatewayApi.postPluginProxy(policy)
}

async function loadDnsConfig() {
  loadingDns.value = true
  try {
    const { localGatewayApi } = await import('../../services/local/localApi')
    const r = await localGatewayApi.runCommand(['proxy', 'dns-hook', 'dns', 'status', '--json'], 10000)
    const d = JSON.parse(r.stdout || '{}') as { configured?: string[]; source?: string; upstreams?: string[] }
    dnsUpstreams.value = d.upstreams || []
    dnsSource.value = d.source || ''
    cleanDnsText.value = (d.configured || []).join('\n')
  } catch {
    dnsUpstreams.value = []
  } finally {
    loadingDns.value = false
  }
}

async function onSaveCleanDns() {
  savingDns.value = true
  try {
    const { localGatewayApi } = await import('../../services/local/localApi')
    const ips = cleanDnsText.value.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean)
    if (!ips.length) throw new Error('至少填一个解析器 IP')
    await localGatewayApi.runCommand(['proxy', 'dns-hook', 'dns', 'set', ...ips], 15000)
    cmdOk.value = true
    cmdMsg.value = '解析器已保存（下次解析生效）'
    await loadDnsConfig()
  } catch (e) {
    cmdOk.value = false
    cmdMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    savingDns.value = false
  }
}

async function onClearCleanDns() {
  savingDns.value = true
  try {
    const { localGatewayApi } = await import('../../services/local/localApi')
    await localGatewayApi.runCommand(['proxy', 'dns-hook', 'dns', 'clear'], 15000)
    cmdOk.value = true
    cmdMsg.value = '已恢复默认（跟随出口）'
    await loadDnsConfig()
  } catch (e) {
    cmdOk.value = false
    cmdMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    savingDns.value = false
  }
}

async function loadCachedDomains() {
  try {
    const res = await localApi.getDomains()
    cloudDomains.value = res.cloud_domains ?? []
  } catch {
    cloudDomains.value = []
  }
}

async function onRefreshDomains() {
  refreshing.value = true
  try {
    const res = await localApi.refreshDomains()
    cloudDomains.value = res.cloud_domains ?? []
    cmdOk.value = true
    cmdMsg.value = '云端清单已刷新并写入本机缓存'
  } catch (e) {
    cmdOk.value = false
    cmdMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    refreshing.value = false
  }
}

function onExitMulti(v: unknown) {
  const list = Array.isArray(v) ? (v as string[]) : []
  exitMulti.value = list
  draft.value.exit_peer = list[0] || ''
}

async function onToggleEnabled(v: boolean | number | null) {
  draft.value.enabled = !!v
  if (!draft.value.enabled) draft.value.dns_enabled = false // 加速关则 DNS 必关
  await store.applyAcceleration(draft.value)
  try { await saveExits() } catch { /* 出口写入失败不挡总开关 */ }
  savedJson.value = JSON.stringify(normalize(draft.value))
}

async function onToggleDns(v: boolean | number | null) {
  // 开 DNS 必开加速
  if (v && !draft.value.enabled) draft.value.enabled = true
  draft.value.dns_enabled = !!v
  await store.applyAcceleration(draft.value)
  savedJson.value = JSON.stringify(normalize(draft.value))
}

async function onSave() {
  draft.value.custom_domains = customDomainsText.value.split('\n').map((s) => s.trim()).filter(Boolean)
  draft.value.custom_dns = customDnsText.value.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
  await store.applyAcceleration(draft.value)
  await saveCustomDirect()
  await saveExits()
  savedJson.value = JSON.stringify(normalize(draft.value))
  cmdOk.value = true
  cmdMsg.value = '已保存并应用'
}

async function loadAdblock() {
  try {
    const r = await localGatewayApi.runCommand(['proxy', 'dns-hook', 'ad-block', 'status'], 15000)
    const t = r.stdout || ''
    adblockOn.value = /enabled=true|已启用/.test(t)
    const m = t.match(/domains=(\d+)/)
    adblockLabel.value = adblockOn.value
      ? `已启用${m ? ' · ' + m[1] + ' 条规则' : ''}`
      : '已关闭 · 仅 DNS hook 运行时生效'
  } catch {
    adblockLabel.value = '无法读取域名拦截设置'
  }
}

async function onAdblock(v: boolean | number | null) {
  adblockBusy.value = true
  try {
    await localGatewayApi.runCommand(['proxy', 'dns-hook', 'ad-block', v ? 'on' : 'off'], 30000)
    await loadAdblock()
  } catch {
    adblockLabel.value = '设置失败'
  } finally {
    adblockBusy.value = false
  }
}

onMounted(() => {
  store.refreshAll().then(resetDraft).catch(() => resetDraft())
  localGatewayApi.getNodeStatus().then((st) => { peerList.value = st.peers || [] }).catch(() => undefined)
  import('../../services/local/localApi').then(async (m) => {
    try {
      const res = await m.localApi.getNodeNames()
      nodeNames.value = mergePersistedNames(res.names || {})
    } catch {
      nodeNames.value = loadPersistedNames()
    }
  })
  loadExits()
  loadAdblock()
  loadDnsConfig()
  loadCachedDomains()
  loadCustomDirect()
  loadBlocked()
})
</script>

<style scoped>
.dns-row {
  display: grid;
  grid-template-columns: 24px 1fr 20px;
  gap: 8px;
  align-items: center;
}
.list-cols > div { display: flex; flex-direction: column; }
.list-cols .q-field { flex: 1; }
</style>
