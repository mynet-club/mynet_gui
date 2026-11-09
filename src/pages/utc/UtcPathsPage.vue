<template>
  <PageLayout title="路径与分配" subtitle="按 transport / pair 查看派单结果与代次" icon="alt_route">
    <template #actions>
      <q-btn class="btn-ghost" icon="refresh" label="刷新" :loading="loading" @click="load" />
    </template>

    <UtcSourceNotice :scope="scope" :source="source" />

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model="transportId" dense outlined label="transport_id" clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model.number="pairId" dense outlined type="number" min="1" label="pair_id" clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="side"
            :options="sideOptions"
            dense
            outlined
            emit-value
            map-options
            clearable
            label="side"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model="edgeId" dense outlined label="edge_id" clearable />
        </div>
        <div class="col-12 col-md-4">
          <q-btn color="primary" unelevated label="查询" :loading="loading" @click="load" />
          <q-btn flat label="重置" class="q-ml-sm" @click="reset" />
        </div>
      </q-card-section>
    </q-card>

    <MynetErrorPanel v-if="error" :message="error" retryable @retry="load" />

    <template v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard label="分配条数" :value="String(items.length)" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard label="active" :value="String(activeCount)" tone="ok" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard label="A-S" :value="String(modeCount('A-S'))" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard label="A-D" :value="String(modeCount('A-D'))" />
        </div>
      </div>

      <q-card flat bordered>
        <q-table
          :rows="items"
          :columns="columns"
          row-key="rowKey"
          dense
          flat
          :pagination="{ rowsPerPage: 20 }"
          no-data-label="没有匹配的路径分配"
        >
          <template #body-cell-side="props">
            <q-td :props="props">{{ sideLabel(props.row.side) }}</q-td>
          </template>
          <template #body-cell-edge_id="props">
            <q-td :props="props">
              <span class="mono">{{ props.row.edge_id || '—' }}</span>
              <span class="text-caption text-grey-7 q-ml-xs">
                shard {{ props.row.shard ?? '—' }} / reactor {{ props.row.reactor ?? '—' }}
              </span>
            </q-td>
          </template>
          <template #body-cell-epochs="props">
            <q-td :props="props">
              <span class="text-caption">
                pair_gen {{ props.row.pair_gen }} · lease {{ props.row.lease_epoch }} ·
                placement {{ props.row.placement_epoch }}
              </span>
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip dense size="sm" :color="props.row.status === 'active' ? 'positive' : 'grey'">
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-assigned_at="props">
            <q-td :props="props">{{ formatUtcTime(props.row.assigned_at) }}</q-td>
          </template>
        </q-table>
      </q-card>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetErrorPanel from '../../components/mynet/MynetErrorPanel.vue'
import UtcSourceNotice from '../../components/utc/UtcSourceNotice.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type { UtcDataSource, UtcPath } from '../../types/utc'
import { formatUtcTime, sideLabel } from '../../utils/utcFormat'

type PathRow = UtcPath & { rowKey: string }

const loading = ref(false)
const error = ref('')
const items = ref<PathRow[]>([])
const scope = ref('')
const source = ref<UtcDataSource | null>(null)

const transportId = ref('')
const pairId = ref<number | null>(null)
const side = ref<number | null>(null)
const edgeId = ref('')

const sideOptions = [
  { label: 'A (0)', value: 0 },
  { label: 'B (1)', value: 1 }
]

const columns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const, sortable: true },
  { name: 'pair_id', label: 'pair', field: 'pair_id', align: 'left' as const, sortable: true },
  { name: 'side', label: 'side', field: 'side', align: 'left' as const },
  { name: 'mode', label: '模式', field: 'mode', align: 'left' as const },
  { name: 'edge_id', label: 'Edge / 分配', field: 'edge_id', align: 'left' as const },
  { name: 'epochs', label: '代次', field: 'pair_gen', align: 'left' as const },
  { name: 'status', label: '状态', field: 'status', align: 'left' as const },
  { name: 'assigned_at', label: '派单时间', field: 'assigned_at', align: 'left' as const }
]

const activeCount = computed(() => items.value.filter((row) => row.status === 'active').length)

function modeCount(mode: string): number {
  return items.value.filter((row) => row.mode === mode).length
}

function validPairId(): number | undefined {
  return typeof pairId.value === 'number' && pairId.value > 0 ? pairId.value : undefined
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const data = await utcService.listPaths({
      transport_id: transportId.value.trim() || undefined,
      pair_id: validPairId(),
      side: side.value ?? undefined,
      edge_id: edgeId.value.trim() || undefined
    })
    scope.value = data.scope
    source.value = data.data_source
    items.value = data.items.map((row) => ({
      ...row,
      rowKey: `${row.transport_id}:${row.pair_id}:${row.side}`
    }))
  } catch (e) {
    error.value = describeUtcError(e)
  } finally {
    loading.value = false
  }
}

function reset(): void {
  transportId.value = ''
  pairId.value = null
  side.value = null
  edgeId.value = ''
  load()
}

onMounted(load)
</script>

<style scoped>
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
