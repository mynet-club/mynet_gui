<template>
  <div class="local-peers">
    <div class="text-h5 q-mb-md">节点与对端</div>
    <MynetAsyncState :state="uiState" :error="err" @retry="load">
      <MynetConfigCard title="对端列表" subtitle="来自本机 node-status">
        <q-table
          flat
          dense
          row-key="node_id"
          :rows="rows"
          :columns="cols"
          :pagination="{ rowsPerPage: 12 }"
        >
          <template #body-cell-reach="props">
            <q-td :props="props">
              <q-badge :color="props.row.reach === '可达' || props.row.reach === '本机' ? 'positive' : 'negative'">
                {{ props.row.reach }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
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
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'

const store = useExperienceStore()
const status = ref<LocalNodeStatus>({})
const nodeNames = ref<NodeNameSource>({})
const err = ref<LocalApiError | null>(null)
const loading = ref(false)

const uiState = computed<UiState>(() => {
  if (loading.value && !status.value.peers) return 'loading'
  if (err.value && !status.value.peers) return 'error'
  return 'ready'
})

const rows = computed(() =>
  (status.value.peers || []).map((p) => ({
    node_id: p.node_id ? (p.node_id.length > 12 ? p.node_id.slice(0, 8) + '…' : p.node_id) : '',
    name: peerDisplayName(p, nodeNames.value),
    overlay: p.overlay || '—',
    link: p.link || '—',
    latency: p.latency_ms != null ? `${p.latency_ms} ms` : '—',
    reach: p.is_self ? '本机' : p.routed ? '可达' : '不可达'
  }))
)

const cols = [
  { name: 'name', label: '节点', field: 'name', align: 'left' as const },
  { name: 'node_id', label: 'ID', field: (r: { node_id: string }) => (r.node_id ? (r.node_id.length > 12 ? r.node_id.slice(0, 8) + '…' : r.node_id) : '—'), align: 'left' as const },
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
