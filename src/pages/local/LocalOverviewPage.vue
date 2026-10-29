<template>
  <div class="local-overview">
    <div class="text-h5 q-mb-md">总览</div>
    <MynetAsyncState :state="uiState" :error="err" @retry="load">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <MynetMetricCard label="节点状态" :value="stateLabel" :sub="status.one_line || status.detail || ''" :tone="stateTone" />
        </div>
        <div class="col-12 col-md-4">
          <MynetMetricCard label="转发" :value="status.proxy_enabled ? '转发中' : '未启用'" :sub="status.tun_iface || ''" />
        </div>
        <div class="col-12 col-md-4">
          <MynetMetricCard label="收 / 发" :value="traffic" sub="来自 node-status" />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <MynetConfigCard title="节点">
            <table class="fact-table">
              <tbody>
                <tr><td>节点名称</td><td>{{ nodeName }}</td></tr>
                <tr><td>节点 ID</td><td class="mono">{{ status.node_id || '—' }}</td></tr>
                <tr><td>驱动</td><td>{{ status.driver || 'gnb' }}</td></tr>
                <tr><td>接口</td><td class="mono">{{ status.tun_iface || '—' }}</td></tr>
                <tr><td>节点地址</td><td class="mono">{{ status.overlay_ip || '—' }}</td></tr>
                <tr><td>MTU</td><td>{{ status.mtu ?? '—' }}</td></tr>
              </tbody>
            </table>
          </MynetConfigCard>
        </div>
        <div class="col-12 col-md-6">
          <MynetConfigCard title="系统">
            <table class="fact-table">
              <tbody>
                <tr><td>驱动进程</td><td>{{ status.process_up ? '正常' : '未运行' }}</td></tr>
                <tr><td>系统路由</td><td>{{ status.routes_ok ? '正常' : '未就绪' }}</td></tr>
                <tr><td>对端数</td><td>{{ peers.length }}</td></tr>
                <tr><td>缺失路由</td><td>{{ missing.length }}</td></tr>
              </tbody>
            </table>
          </MynetConfigCard>
        </div>
      </div>

      <MynetConfigCard class="q-mt-md" title="连接" subtitle="对端可达性">
        <q-table
          flat
          dense
          row-key="node_id"
          :rows="peerRows"
          :columns="peerCols"
          :pagination="{ rowsPerPage: 8 }"
          hide-bottom
        />
      </MynetConfigCard>
    </MynetAsyncState>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { LocalNodeStatus, LocalPeer, UiState } from '../../types/local'
import MynetAsyncState from '../../components/mynet/MynetAsyncState.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'

const status = ref<LocalNodeStatus>({})
const err = ref<LocalApiError | null>(null)
const loading = ref(false)

const uiState = computed<UiState>(() => {
  if (loading.value && !status.value.state) return 'loading'
  if (err.value && !status.value.state) return 'error'
  return 'ready'
})

const stateLabel = computed(() => {
  const map: Record<string, string> = {
    RUNNING: '运行中', DEGRADED: '降级', FAILED: '异常',
    INSTALLED: '已安装', CONFIGURED: '已配置', UNINSTALLED: '未安装', STOPPED: '已停止'
  }
  return map[String(status.value.state || '')] || String(status.value.state || '—')
})

const stateTone = computed<'ok' | 'warn' | 'error' | 'default'>(() => {
  const s = status.value.state
  if (s === 'RUNNING') return 'ok'
  if (s === 'DEGRADED') return 'warn'
  if (s === 'FAILED') return 'error'
  return 'default'
})

const traffic = computed(() => {
  const fmt = (n?: number) => {
    if (!n) return '0 B'
    if (n > 1 << 20) return (n / (1 << 20)).toFixed(1) + ' MB'
    if (n > 1 << 10) return (n / (1 << 10)).toFixed(1) + ' KB'
    return n + ' B'
  }
  return `${fmt(status.value.rx_bytes)} / ${fmt(status.value.tx_bytes)}`
})

const peers = computed<LocalPeer[]>(() => status.value.peers || [])
const missing = computed(() => status.value.missing_routes || [])
const nodeName = computed(() => {
  const p = peers.value.find((x) => x.is_self)
  return p?.node_name || status.value.node_id || '未命名节点'
})

const peerRows = computed(() =>
  peers.value.map((p) => ({
    node_id: p.node_id || '',
    name: p.node_name || p.node_id || (p.is_self ? '本机' : '—'),
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

async function load() {
  loading.value = true
  err.value = null
  try {
    status.value = await localGatewayApi.getNodeStatus()
  } catch (e) {
    err.value = e instanceof LocalApiError ? e : new LocalApiError({ success: false, message: String(e) })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
