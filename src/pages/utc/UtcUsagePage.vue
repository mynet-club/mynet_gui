<template>
  <PageLayout title="用量" subtitle="按 transport / pair 查询额度、已用与预留" icon="data_usage">
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
          <q-select
            v-model="direction"
            :options="directionOptions"
            dense
            outlined
            emit-value
            map-options
            clearable
            label="direction"
          />
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
          <MynetMetricCard label="额度合计" :value="formatBytes(totals.quota_bytes)" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard
            label="已用"
            :value="formatBytes(totals.used_bytes)"
            :sub="`预留 ${formatBytes(totals.reserved_bytes)} · 不确定 ${formatBytes(totals.uncertain_bytes)}`"
            :tone="totals.overage_bytes > 0 ? 'warn' : 'ok'"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard
            label="剩余可用"
            :value="formatBytes(totals.remaining_bytes)"
            tone="ok"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard
            label="overage"
            :value="formatBytes(totals.overage_bytes)"
            :tone="totals.overage_bytes > 0 ? 'warn' : 'default'"
            sub="软额度耗尽后的单列用量"
          />
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
          no-data-label="没有匹配的用量记录"
        >
          <template #body-cell-side="props">
            <q-td :props="props">{{ sideLabel(props.row.side) }}</q-td>
          </template>
          <template #body-cell-usage="props">
            <q-td :props="props" style="min-width: 220px">
              <div class="row items-center no-wrap">
                <q-linear-progress
                  :value="usagePercent(props.row.used_bytes, props.row.quota_bytes) / 100"
                  :color="props.row.used_bytes > props.row.quota_bytes ? 'warning' : 'primary'"
                  track-color="grey-3"
                  rounded
                  class="col q-mr-sm"
                  style="height: 8px"
                />
                <span class="text-caption">{{ usagePercent(props.row.used_bytes, props.row.quota_bytes) }}%</span>
              </div>
              <div class="text-caption text-grey-7">
                {{ formatBytes(props.row.used_bytes) }} / {{ formatBytes(props.row.quota_bytes) }}
              </div>
            </q-td>
          </template>
          <template #body-cell-remaining="props">
            <q-td :props="props">{{ formatBytes(remainingOf(props.row)) }}</q-td>
          </template>
          <template #body-cell-updated_at="props">
            <q-td :props="props">{{ formatUtcTime(props.row.updated_at) }}</q-td>
          </template>
        </q-table>
      </q-card>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetErrorPanel from '../../components/mynet/MynetErrorPanel.vue'
import UtcSourceNotice from '../../components/utc/UtcSourceNotice.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type { UtcDataSource, UtcUsageRecord, UtcUsageTotals } from '../../types/utc'
import { formatBytes, formatUtcTime, sideLabel, usagePercent } from '../../utils/utcFormat'

type UsageRow = UtcUsageRecord & { rowKey: string }

const loading = ref(false)
const error = ref('')
const items = ref<UsageRow[]>([])
const scope = ref('')
const source = ref<UtcDataSource | null>(null)
const totals = ref<UtcUsageTotals>({
  quota_bytes: 0,
  used_bytes: 0,
  reserved_bytes: 0,
  uncertain_bytes: 0,
  remaining_bytes: 0,
  overage_bytes: 0
})

const transportId = ref('')
const pairId = ref<number | null>(null)
const side = ref<number | null>(null)
const direction = ref<string | null>(null)

const sideOptions = [
  { label: 'A (0)', value: 0 },
  { label: 'B (1)', value: 1 }
]

const directionOptions = [
  { label: 'ingress', value: 'ingress' },
  { label: 'egress', value: 'egress' },
  { label: 'both', value: 'both' }
]

const columns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const, sortable: true },
  { name: 'pair_id', label: 'pair', field: 'pair_id', align: 'left' as const, sortable: true },
  { name: 'side', label: 'side', field: 'side', align: 'left' as const },
  { name: 'direction', label: '方向', field: 'direction', align: 'left' as const },
  { name: 'usage', label: '已用 / 额度', field: 'used_bytes', align: 'left' as const },
  { name: 'remaining', label: '剩余', field: 'remaining_bytes', align: 'left' as const },
  { name: 'quota_slice_id', label: 'quota slice', field: 'quota_slice_id', align: 'left' as const },
  { name: 'updated_at', label: '更新时间', field: 'updated_at', align: 'left' as const }
]

function remainingOf(row: UtcUsageRecord): number {
  return Math.max(
    0,
    row.quota_bytes - row.used_bytes - row.reserved_bytes - row.uncertain_bytes
  )
}

function validPairId(): number | undefined {
  return typeof pairId.value === 'number' && pairId.value > 0 ? pairId.value : undefined
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const data = await utcService.listUsage({
      transport_id: transportId.value.trim() || undefined,
      pair_id: validPairId(),
      side: side.value ?? undefined,
      direction: direction.value ?? undefined
    })
    scope.value = data.scope
    source.value = data.data_source
    totals.value = data.totals
    items.value = data.items.map((row) => ({
      ...row,
      rowKey: `${row.transport_id}:${row.pair_id}:${row.side}:${row.direction}:${row.quota_slice_id || ''}`
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
  direction.value = null
  load()
}

onMounted(load)
</script>
