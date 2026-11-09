<template>
  <PageLayout title="故障状态" subtitle="路径分配失败的当前状态与原因码" icon="report_problem">
    <template #actions>
      <q-btn class="btn-ghost" icon="refresh" label="刷新" :loading="loading" @click="load" />
    </template>

    <UtcSourceNotice :scope="scope" :source="source" />

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="transportId" dense outlined label="transport_id" clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model.number="pairId" dense outlined type="number" min="1" label="pair_id" clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model="state" dense outlined label="state" clearable />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-input v-model="reasonCode" dense outlined label="reason_code" clearable />
        </div>
        <div class="col-12 col-md-3">
          <q-btn color="primary" unelevated label="查询" :loading="loading" @click="load" />
          <q-btn flat label="重置" class="q-ml-sm" @click="reset" />
        </div>
      </q-card-section>
    </q-card>

    <MynetErrorPanel v-if="error" :message="error" retryable @retry="load" />

    <template v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <MynetMetricCard label="故障条目" :value="String(items.length)" />
        </div>
        <div class="col-12 col-sm-4">
          <MynetMetricCard
            label="open"
            :value="String(openCount)"
            :tone="openCount > 0 ? 'error' : 'ok'"
          />
        </div>
        <div class="col-12 col-sm-4">
          <MynetMetricCard label="可重试" :value="String(retryableCount)" :tone="retryableCount > 0 ? 'warn' : 'default'" />
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
          no-data-label="没有匹配的故障记录"
        >
          <template #body-cell-side="props">
            <q-td :props="props">{{ sideLabel(props.row.side) }}</q-td>
          </template>
          <template #body-cell-state="props">
            <q-td :props="props">
              <q-chip dense size="sm" :color="faultTone(props.row.state)">
                {{ props.row.state }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-retryable="props">
            <q-td :props="props">{{ props.row.retryable ? '是' : '否' }}</q-td>
          </template>
          <template #body-cell-last_seen_at="props">
            <q-td :props="props">{{ formatUtcTime(props.row.last_seen_at) }}</q-td>
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
import type { UtcDataSource, UtcFault } from '../../types/utc'
import { faultTone, formatUtcTime, sideLabel } from '../../utils/utcFormat'

type FaultRow = UtcFault & { rowKey: string }

const loading = ref(false)
const error = ref('')
const items = ref<FaultRow[]>([])
const scope = ref('')
const source = ref<UtcDataSource | null>(null)

const transportId = ref('')
const pairId = ref<number | null>(null)
const state = ref('')
const reasonCode = ref('')

const columns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const, sortable: true },
  { name: 'pair_id', label: 'pair', field: 'pair_id', align: 'left' as const },
  { name: 'side', label: 'side', field: 'side', align: 'left' as const },
  { name: 'state', label: '状态', field: 'state', align: 'left' as const },
  { name: 'reason_code', label: '原因码', field: 'reason_code', align: 'left' as const, sortable: true },
  { name: 'retryable', label: '可重试', field: 'retryable', align: 'left' as const },
  { name: 'last_seen_at', label: '最近出现', field: 'last_seen_at', align: 'left' as const },
  { name: 'detail', label: '说明', field: 'detail', align: 'left' as const }
]

const openCount = computed(() => items.value.filter((row) => row.state === 'open').length)
const retryableCount = computed(() => items.value.filter((row) => row.retryable).length)

function validPairId(): number | undefined {
  return typeof pairId.value === 'number' && pairId.value > 0 ? pairId.value : undefined
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const data = await utcService.listFaults({
      transport_id: transportId.value.trim() || undefined,
      pair_id: validPairId(),
      state: state.value.trim() || undefined,
      reason_code: reasonCode.value.trim() || undefined
    })
    scope.value = data.scope
    source.value = data.data_source
    items.value = data.items.map((row) => ({
      ...row,
      rowKey: `${row.transport_id}:${row.pair_id ?? '-'}:${row.side ?? '-'}:${row.reason_code}:${row.last_seen_at || ''}`
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
  state.value = ''
  reasonCode.value = ''
  load()
}

onMounted(load)
</script>
