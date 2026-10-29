<template>
  <div class="local-home">
    <div class="row items-center q-mb-md">
      <div class="text-h5">首页</div>
      <q-space />
      <q-btn
        v-if="showStart"
        color="primary"
        label="启动连接"
        :loading="cmd.busy.value"
        @click="onStart"
      />
      <q-btn
        v-if="showStop"
        color="negative"
        outline
        label="停止连接"
        class="q-ml-sm"
        :loading="cmd.busy.value"
        @click="onStop"
      />
      <q-btn
        v-if="showStop"
        color="warning"
        outline
        label="重启连接"
        class="q-ml-sm"
        :loading="cmd.busy.value"
        @click="onRestart"
      />
      <q-btn
        v-if="showFix"
        color="warning"
        label="修复路由"
        class="q-ml-sm"
        :loading="cmd.busy.value"
        @click="onFixRoutes"
      />
      <q-btn
        v-if="showWizard"
        color="primary"
        label="配置向导"
        class="q-ml-sm"
        to="/onboarding"
      />
    </div>

    <MynetStatusBanner
      v-if="store.experience"
      class="q-mb-md"
      :title="headline"
      :detail="detail"
      :tone="store.uiStateLabel.tone"
    />

    <q-banner v-if="cmd.message.value" dense class="q-mb-md" :class="cmd.ok.value ? 'bg-positive' : 'bg-negative'" style="color:#fff">
      {{ cmd.message.value }}
    </q-banner>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <MynetMetricCard label="本机连接" :value="nodeState" :sub="detail" :tone="stateTone" />
      </div>
      <div class="col-12 col-md-4">
        <MynetMetricCard label="加速状态" :value="accelLabel" :sub="accelDetail" :tone="accelTone" />
      </div>
      <div class="col-12 col-md-4">
        <MynetMetricCard label="对端" :value="peerSummary" :sub="status.tun_iface || ''" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <MynetConfigCard title="本机节点">
          <table class="fact-table">
            <tbody>
              <tr><td>节点名称</td><td>{{ displayName }}</td></tr>
              <tr><td>节点 ID</td><td class="mono text-caption">{{ status.node_id || '—' }}</td></tr>
              <tr><td>虚拟 IP</td><td class="mono">{{ status.overlay_ip || '—' }}</td></tr>
              <tr><td>接口</td><td class="mono">{{ status.tun_iface || '—' }}</td></tr>
              <tr><td>MTU</td><td>{{ status.mtu ?? '—' }}</td></tr>
              <tr><td>收 / 发</td><td class="mono">{{ traffic }}</td></tr>
            </tbody>
          </table>
        </MynetConfigCard>
      </div>
      <div class="col-12 col-md-6">
        <MynetConfigCard title="驱动与进程">
          <table class="fact-table">
            <tbody>
              <tr><td>驱动</td><td>{{ driverLabel }}</td></tr>
              <tr><td>驱动路径</td><td class="mono text-caption">{{ driverPath }}</td></tr>
              <tr><td>进程 PID</td><td class="mono">{{ processPid }}</td></tr>
              <tr><td>进程状态</td><td>{{ status.process_up ? '运行中' : '未运行' }}</td></tr>
              <tr><td>运行时长</td><td>{{ uptimeText }}</td></tr>
              <tr><td>系统路由</td><td>{{ status.routes_ok ? '正常' : '未就绪' }}</td></tr>
            </tbody>
          </table>
        </MynetConfigCard>
      </div>
      <div class="col-12 col-md-6">
        <MynetConfigCard title="mynetd 服务">
          <table class="fact-table">
            <tbody>
              <tr><td>监听</td><td class="mono">{{ daemonListen }}</td></tr>
              <tr><td>版本</td><td class="mono">{{ agentVersion }}</td></tr>
              <tr><td>形态</td><td>{{ store.isGateway ? 'GW（下游分流）' : 'PC（本机加速）' }}</td></tr>
              <tr><td>DNS Hook</td><td>{{ accelLabel }}</td></tr>
            </tbody>
          </table>
        </MynetConfigCard>
      </div>
      <div class="col-12 col-md-6">
        <MynetConfigCard title="会话与状态">
          <table class="fact-table">
            <tbody>
              <tr><td>网络区</td><td>{{ sessionZone }}</td></tr>
              <tr><td>用户</td><td>{{ sessionUser }}</td></tr>
              <tr><td>状态</td><td>{{ store.uiStateLabel.text }} · {{ nodeState }}</td></tr>
              <tr><td>最后刷新</td><td>{{ lastRefresh }}</td></tr>
              <tr><td>最近错误</td><td>{{ store.error?.message || '无' }}</td></tr>
            </tbody>
          </table>
        </MynetConfigCard>
      </div>
    </div>

    <MynetConfigCard class="q-mt-md" title="连接" subtitle="对端可达性">
      <q-table flat dense row-key="node_id" :rows="peerRows" :columns="peerCols" :pagination="{ rowsPerPage: 6 }" hide-bottom />
    </MynetConfigCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { mergePersistedNames, loadPersistedNames, peerDisplayName, type NodeNameSource } from '../../utils/nodeDisplay'
import { formatExitNodeDetail, formatExitNodeLine } from '../../utils/exitProbe'
import { useQuasar } from 'quasar'
import { useExperienceStore } from '../../stores/experience'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import { useLocalCommand } from '../../composables/useLocalCommand'
import type { LocalNodeStatus, LocalPeer } from '../../types/local'
import MynetStatusBanner from '../../components/mynet/MynetStatusBanner.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'

const store = useExperienceStore()
const $q = useQuasar()
const cmd = useLocalCommand()
const status = ref<LocalNodeStatus>({})
const nodeNames = ref<NodeNameSource>({})

const nodeState = computed(() => String(status.value.state || store.experience?.node?.state || '—'))
const running = computed(() => nodeState.value === 'RUNNING' || status.value.tun_up === true)
const showStart = computed(() => !running.value && nodeState.value !== 'UNAVAILABLE')
const showStop = computed(() => running.value)
const showFix = computed(() => nodeState.value === 'DEGRADED' || status.value.routes_ok === false)
const showWizard = computed(() => {
  const s = store.experience?.state
  return s === 'NEEDS_LOGIN' || s === 'NEEDS_CONFIGURATION' || s === 'NEEDS_INSTALL'
})

const headline = computed(() => {
  const map: Record<string, string> = {
    RUNNING: '运行中', DEGRADED: '降级', FAILED: '异常',
    INSTALLED: '已安装', CONFIGURED: '已配置', UNINSTALLED: '未安装', STOPPED: '已停止'
  }
  return map[nodeState.value] || nodeState.value
})

const detail = computed(() => status.value.one_line || status.value.detail || '')
const stateTone = computed<'ok' | 'warn' | 'error' | 'default'>(() => {
  if (nodeState.value === 'RUNNING') return 'ok'
  if (nodeState.value === 'DEGRADED') return 'warn'
  if (nodeState.value === 'FAILED') return 'error'
  return 'default'
})

// 与托盘 accelMenuTextStructured 同源语义（localApi 已摊平 runtime）
const accelView = computed(() => {
  const a = store.acceleration
  const life = a?.lifecycle
  const msg = a?.message || ''
  const node = formatExitNodeLine(a?.runtime?.exit_probe)
  const nodeDetail = formatExitNodeDetail(a?.runtime?.exit_probe)
  const join = (...xs: string[]) => xs.filter(Boolean).join(' · ')
  if (life === 'degraded') return { label: '加速：已中断', tone: 'warn' as const, detail: join(msg || 'DNS 已被外部更改', node) }
  if (life === 'active') return { label: '加速：运行中', tone: 'ok' as const, detail: join(msg, node || nodeDetail) }
  if (life === 'waiting_tunnel') return { label: '加速：已暂停', tone: 'warn' as const, detail: join(msg || '等待隧道连接', node) }
  return { label: '加速：未开启', tone: 'default' as const, detail: join(msg || 'DNS 未开', node) }
})
const accelLabel = computed(() => accelView.value.label)
const accelTone = computed(() => accelView.value.tone)
const accelDetail = computed(() => accelView.value.detail)

const peers = computed<LocalPeer[]>(() => status.value.peers || [])
// 与 one_line 同源：只统计对端（不含本机），优先 node-status 汇总字段
const peerSummary = computed(() => {
  const total = status.value.peers_total
  const routed = status.value.peers_routed
  if (typeof total === 'number' && total >= 0) {
    return `${routed ?? 0} / ${total}`
  }
  const list = peers.value.filter((p) => !p.is_self && p.node_id)
  const ok = list.filter((p) => p.routed).length
  return list.length ? `${ok} / ${list.length}` : '0'
})
const displayName = computed(() => {
  const w = store.experience?.wizard as { node_name?: string } | undefined
  return w?.node_name || identityName.value || '未命名节点'
})
const identityName = ref('')

const driverLabel = computed(() => {
  const d = String((status.value as { driver?: string }).driver || 'gnb')
  return d === 'wireguard' ? 'WireGuard' : 'gnb (OpenGNB)'
})
const driverPath = computed(() => {
  const n = store.experience?.node as Record<string, unknown> | undefined
  return String(n?.gnb_bin || '/opt/mynet/bin/gnb')
})
const processPid = computed(() => {
  const n = store.experience?.node as Record<string, unknown> | undefined
  return n?.process_pid ? String(n.process_pid) : status.value.process_up ? '—' : '—'
})
const uptimeText = computed(() => {
  const n = store.experience?.node as Record<string, unknown> | undefined
  const s = Number(n?.uptime_sec || 0)
  if (!s) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h} 小时 ${m} 分` : `${m} 分`
})
const daemonListen = computed(() => '127.0.0.1:8096')
const agentVersion = computed(() => {
  // 本机 API 不直接回版本时展示占位；有 identity 元数据则用
  const id = (store.experience as { version?: string })?.version
  return id || 'v0.1.x'
})
const sessionZone = computed(() => {
  const w = store.experience?.wizard as Record<string, unknown> | undefined
  return String(w?.tenant_name || '—')
})
const sessionUser = computed(() => {
  const w = store.experience?.wizard as Record<string, unknown> | undefined
  return String(w?.user_email || '—')
})
const lastRefresh = ref(new Date().toLocaleTimeString())
async function reload() {
  await store.refreshAll()
  lastRefresh.value = new Date().toLocaleTimeString()
}

const traffic = computed(() => {
  const fmt = (n?: number) => {
    if (!n) return '0 B'
    if (n > 1 << 20) return (n / (1 << 20)).toFixed(1) + ' MB'
    if (n > 1 << 10) return (n / (1 << 10)).toFixed(1) + ' KB'
    return n + ' B'
  }
  return `${fmt(status.value.rx_bytes)} / ${fmt(status.value.tx_bytes)}`
})

const peerRows = computed(() =>
  peers.value.map((p) => ({
    node_id: p.node_id ? (p.node_id.length > 12 ? p.node_id.slice(0, 8) + '…' : p.node_id) : '',
    name: peerDisplayName(p, nodeNames.value),
    overlay: p.overlay || '—',
    link: p.link || '—',
    latency: p.latency_ms != null ? `${p.latency_ms} ms` : '—',
    reach: p.is_self ? '本机' : p.routed ? '可达' : '不可达'
  }))
)

const peerCols = [
  { name: 'name', label: '节点', field: 'name', align: 'left' as const },
  { name: 'overlay', label: '虚拟 IP', field: 'overlay', align: 'left' as const },
  { name: 'link', label: '链路', field: 'link', align: 'left' as const },
  { name: 'latency', label: '时延', field: 'latency', align: 'right' as const },
  { name: 'reach', label: '可达', field: 'reach', align: 'left' as const }
]

const drv = computed(() => (status.value.driver === 'wireguard' ? 'wireguard' : 'gnb'))

async function load() {
  try {
    const { localHttp } = await import('../../services/local/localApi')
    const idn = await localHttp.get('/config/identity')
    identityName.value = String((idn.data as { data?: { node_name?: string } })?.data?.node_name || '')
  } catch { /* optional */ }
  try {
    status.value = await localGatewayApi.getNodeStatus()
  } catch (e) {
    if (e instanceof LocalApiError) store.error = e
  }
  store.refreshAcceleration().catch(() => undefined)
  try {
    const { localApi } = await import('../../services/local/localApi')
    const ids = (status.value.peers || []).map((p) => p.node_id).filter((x): x is string => !!x)
    const res = await localApi.getNodeNames(ids)
    nodeNames.value = mergePersistedNames(res.names || {})
  } catch {
    nodeNames.value = loadPersistedNames()
  }
}

async function afterAction() {
  await load()
  store.refreshExperience().catch(() => undefined)
}

function onStart() {
  cmd.run(['service', 'start', drv.value], '启动').then(afterAction)
}
function onStop() {
  $q.dialog({
    title: '停止网络连接？',
    message: '停止后本机无法访问 MyNet 网络，直到再次启动。',
    cancel: true
  }).onOk(() => {
    cmd.run(['service', 'stop', drv.value], '停止').then(afterAction)
  })
}
function onRestart() {
  $q.dialog({
    title: '重启网络？',
    message: '连接会短暂中断，正在使用这台设备的会话可能需要重连。',
    cancel: true
  }).onOk(() => {
    cmd.run(['service', 'restart', drv.value], '重启').then(afterAction)
  })
}
function onFixRoutes() {
  cmd.run(['apply', '--auto'], '修复路由').then(afterAction)
}

onMounted(() => {
  reload().catch(() => undefined)
  load()
})
</script>
