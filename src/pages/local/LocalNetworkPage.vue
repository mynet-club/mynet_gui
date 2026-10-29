<template>
  <div class="local-network">
    <div class="text-h5 q-mb-md">网络与拓扑</div>
    <MynetAsyncState :state="uiState" :error="err" @retry="load">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <MynetMetricCard label="对端路由" :value="peerSummary" :sub="down ? `${down} 条不可达` : '全部可达'" :tone="down ? 'warn' : 'ok'" />
        </div>
        <div class="col-12 col-md-4">
          <MynetMetricCard label="网段" :value="String(lanRows.length)" sub="route.conf 非 /32" />
        </div>
        <div class="col-12 col-md-4">
          <MynetMetricCard label="缺失路由" :value="String(missing.length)" :tone="missing.length ? 'warn' : 'default'" />
        </div>
      </div>

      <MynetConfigCard title="节点与路由" class="q-mb-md">
        <q-tabs v-model="tab" dense align="left" class="text-grey-7" active-color="primary" indicator-color="primary">
          <q-tab name="peers" label="对端列表" />
          <q-tab name="peerRoutes" label="对端路由" />
          <q-tab name="lanRoutes" label="网段路由" />
          <q-tab name="topo" label="拓扑" />
          <q-tab name="sysRoutes" label="系统路由" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="peers" class="panel-pad">
            <q-table flat dense row-key="node_id" :rows="peerTableRows" :columns="peerTableCols" :pagination="{ rowsPerPage: 50 }" :rows-per-page-options="[15, 30, 50]" />
          </q-tab-panel>
          <q-tab-panel name="peerRoutes" class="panel-pad">
            <q-table flat dense :rows="peerRows" :columns="cols" :pagination="{ rowsPerPage: 50 }" :rows-per-page-options="[15, 30, 50]">
              <template #body-cell-via="props">
                <q-td :props="props">
                  <span class="mono">{{ props.row.via }}</span>
                  <q-tooltip v-if="props.row.viaName">{{ props.row.viaName }}</q-tooltip>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="lanRoutes" class="panel-pad">
            <q-table flat dense :rows="lanRows" :columns="cols" :pagination="{ rowsPerPage: 50 }" :rows-per-page-options="[15, 30, 50]">
              <template #body-cell-via="props">
                <q-td :props="props">
                  <span class="mono">{{ props.row.via }}</span>
                  <q-tooltip v-if="props.row.viaName">{{ props.row.viaName }}</q-tooltip>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="topo" class="panel-pad">
            <MynetTopology :peers="status.peers || []" :names="nodeNames" />
          </q-tab-panel>
          <q-tab-panel name="sysRoutes" class="panel-pad">
            <pre class="raw mono">{{ status.system_routes_text || '（本机未返回系统路由表）' }}</pre>
          </q-tab-panel>
        </q-tab-panels>
      </MynetConfigCard>

    </MynetAsyncState>
  </div>
</template>

<script setup lang="ts">
import { useExperienceStore } from '../../stores/experience'
import { computed, onMounted, ref } from 'vue'
import { buildNodeNameMap, mergePersistedNames, loadPersistedNames, peerDisplayName, type NodeNameSource } from '../../utils/nodeDisplay'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { LocalNodeStatus, UiState } from '../../types/local'
import MynetAsyncState from '../../components/mynet/MynetAsyncState.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetTopology from '../../components/mynet/MynetTopology.vue'

const store = useExperienceStore()
const tab = ref<'peers' | 'peerRoutes' | 'lanRoutes' | 'topo' | 'sysRoutes'>('peers')
const status = ref<LocalNodeStatus>({})
const nodeNames = ref<NodeNameSource>({})
const err = ref<LocalApiError | null>(null)
const loading = ref(false)

const uiState = computed<UiState>(() => {
  if (loading.value && !status.value.state) return 'loading'
  if (err.value && !status.value.state) return 'error'
  return 'ready'
})

const missing = computed(() => status.value.missing_routes || [])

interface RouteRow { dest: string; via: string; viaName?: string; iface: string; ok: boolean; self: boolean }

function isLanDest(dest: string) {
  if (dest.includes('/')) return !/\/32$/.test(dest)
  return /^\d+\.\d+\.\d+\.0$/.test(dest)
}

const routeRows = computed<RouteRow[]>(() => {
  const s = status.value
  const list = s.peers || []
  const lanOwner: Record<string, string> = {}
  String(s.route_conf_text || '').split('\n').forEach((ln) => {
    const parts = ln.trim().split('|')
    if (parts.length >= 3 && parts[1]) lanOwner[parts[1]] = parts[0] || ''
  })
  const rows: RouteRow[] = []
  list.forEach((p) => {
    const dest = p.overlay || p.node_id || '—'
    const name = peerDisplayName(p, nodeNames.value)
    rows.push({
      dest,
      via: p.is_self ? '本机' : (p.overlay || lanOwner[dest] || '—'),
      viaName: p.is_self ? '' : (name !== (p.overlay || '') ? name : ''),
      iface: p.is_self ? (s.tun_iface || '—') : (s.tun_iface || 'utun'),
      ok: p.is_self ? true : !!p.routed,
      self: !!p.is_self
    })
  })
  missing.value.forEach((m) => {
    rows.push({ dest: m, via: m, viaName: lanOwner[m] || '', iface: s.tun_iface || '—', ok: false, self: false })
  })
  return rows
})

const peerRows = computed(() => routeRows.value.filter((r) => !r.self && !isLanDest(r.dest)))
const lanRows = computed(() => routeRows.value.filter((r) => !r.self && isLanDest(r.dest)))
const down = computed(() => routeRows.value.filter((r) => !r.ok).length)
const peerSummary = computed(() => {
  const ok = peerRows.value.filter((r) => r.ok).length
  return peerRows.value.length ? `${ok} / ${peerRows.value.length}` : '0'
})

const peerTableRows = computed(() =>
  [...(status.value.peers || [])]
    .sort((a, b) => String(a.overlay || '').localeCompare(String(b.overlay || ''), undefined, { numeric: true }))
    .map((p) => ({
    node_id: p.node_id ? (p.node_id.length > 12 ? p.node_id.slice(0, 8) + '…' : p.node_id) : '',
    name: peerDisplayName(p, nodeNames.value),
    overlay: p.overlay || '—',
    link: p.link || '—',
    latency: p.latency_ms != null ? `${p.latency_ms} ms` : '—',
    reach: p.is_self ? '本机' : p.routed ? '可达' : '不可达'
  }))
)
const peerTableCols = [
  { name: 'name', label: '节点', field: 'name', align: 'left' as const },
  { name: 'overlay', label: '虚拟 IP', field: 'overlay', align: 'left' as const },
  { name: 'link', label: '链路', field: 'link', align: 'left' as const },
  { name: 'latency', label: '时延', field: 'latency', align: 'right' as const },
  { name: 'reach', label: '可达', field: 'reach', align: 'left' as const }
]

const cols = [
  { name: 'dest', label: '目标', field: 'dest', align: 'left' as const },
  { name: 'via', label: '下一跳', field: (r: RouteRow) => r.via, align: 'left' as const },
  { name: 'iface', label: '接口', field: 'iface', align: 'left' as const },
  { name: 'ok', label: '状态', field: (r: RouteRow) => (r.ok ? '正常' : '不可达'), align: 'left' as const }
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

async function loadNodeNames() {
  try {
    const { localApi } = await import('../../services/local/localApi')
    const ids = (status.value.peers || []).map((p) => p.node_id).filter((x): x is string => !!x)
    const res = await localApi.getNodeNames(ids)
    nodeNames.value = mergePersistedNames(res.names || {})
  } catch {
    nodeNames.value = loadPersistedNames()
  }
}

onMounted(() => {
  load()
  loadNodeNames()
})
</script>
