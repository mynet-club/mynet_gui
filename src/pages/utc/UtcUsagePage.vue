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

      <q-card flat bordered class="q-mt-md">
        <q-card-section class="row q-col-gutter-sm items-end">
          <div class="col-12 col-md-4">
            <div class="text-subtitle1">签名用量摘要</div>
            <div class="text-caption text-grey-7">
              Core 对账后用端点身份签名，API 验签入库；billable 不由前端重算。
            </div>
          </div>
          <div class="col-6 col-md-2">
            <q-input v-model.number="summaryPairId" dense outlined type="number" min="0" label="pair_id" clearable />
          </div>
          <div class="col-6 col-md-2">
            <q-select
              v-model="summaryDirection"
              :options="summaryDirectionOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              label="方向"
            />
          </div>
          <div class="col-6 col-md-2">
            <q-select
              v-model="summaryState"
              :options="summaryStateOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              label="对账状态"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn color="primary" unelevated label="查询摘要" :loading="summaryLoading" @click="loadSummaries" />
          </div>
        </q-card-section>
        <q-card-section v-if="summaryError">
          <MynetErrorPanel :message="summaryError" retryable @retry="loadSummaries" />
        </q-card-section>
        <q-card-section v-else class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <MynetMetricCard label="billable 合计" :value="formatBytes(summaryTotals.billable)" tone="ok" />
          </div>
          <div class="col-6 col-md-3">
            <MynetMetricCard label="端点 A 合计" :value="formatBytes(summaryTotals.endpoint_a)" />
          </div>
          <div class="col-6 col-md-3">
            <MynetMetricCard label="端点 B 合计" :value="formatBytes(summaryTotals.endpoint_b)" />
          </div>
          <div class="col-6 col-md-3">
            <MynetMetricCard label="独立锚合计" :value="formatBytes(summaryTotals.anchor)" />
          </div>
        </q-card-section>
        <q-table
          :rows="summaryItems"
          :columns="summaryColumns"
          row-key="summary_sha256"
          dense
          flat
          :pagination="{ rowsPerPage: 20 }"
          no-data-label="没有已投递的签名用量摘要"
        >
          <template #body-cell-state="props">
            <q-td :props="props">
              <q-badge :color="summaryStateMeta(props.row.state).color">
                {{ summaryStateMeta(props.row.state).label }}
              </q-badge>
            </q-td>
          </template>
          <template #body-cell-pair="props">
            <q-td :props="props">{{ props.row.pair_id }} / {{ props.row.pair_gen }}</q-td>
          </template>
          <template #body-cell-billable="props">
            <q-td :props="props">{{ formatBytes(props.row.billable) }}</q-td>
          </template>
          <template #body-cell-window_end="props">
            <q-td :props="props">{{ formatWindow(props.row.window_end) }}</q-td>
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
import type {
  UtcDataSource,
  UtcUsageRecord,
  UtcUsageSummaryItem,
  UtcUsageSummaryTotals,
  UtcUsageTotals
} from '../../types/utc'
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

const summaryLoading = ref(false)
const summaryError = ref('')
const summaryItems = ref<UtcUsageSummaryItem[]>([])
const summaryTotals = ref<UtcUsageSummaryTotals>({
  billable: 0,
  endpoint_a: 0,
  endpoint_b: 0,
  anchor: 0
})
const summaryPairId = ref<number | null>(null)
const summaryDirection = ref<string | null>(null)
const summaryState = ref<string | null>(null)

const summaryDirectionOptions = [
  { label: 'AB', value: 'AB' },
  { label: 'BA', value: 'BA' }
]

const summaryStateOptions = [
  { label: 'reconciled', value: 'reconciled' },
  { label: 'unproven', value: 'unproven' },
  { label: 'disputed', value: 'disputed' }
]

const SUMMARY_STATE_META: Record<string, { color: string; label: string }> = {
  reconciled: { color: 'positive', label: '已对账' },
  unproven: { color: 'warning', label: '未证实' },
  disputed: { color: 'negative', label: '有争议' }
}

function summaryStateMeta(state: string): { color: string; label: string } {
  return SUMMARY_STATE_META[state] || { color: 'grey', label: state }
}

function formatWindow(value: number): string {
  return value > 0 ? formatUtcTime(new Date(value).toISOString()) : '-'
}

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

const summaryColumns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const },
  { name: 'pair', label: 'pair / gen', field: 'pair_id', align: 'left' as const },
  { name: 'direction', label: '方向', field: 'direction', align: 'left' as const },
  { name: 'state', label: '对账状态', field: 'state', align: 'left' as const },
  { name: 'billable', label: 'billable', field: 'billable', align: 'left' as const },
  { name: 'endpoint_a', label: '端点 A', field: 'endpoint_a', align: 'left' as const },
  { name: 'endpoint_b', label: '端点 B', field: 'endpoint_b', align: 'left' as const },
  { name: 'anchor', label: '独立锚', field: 'anchor', align: 'left' as const },
  { name: 'window_end', label: '窗口结束', field: 'window_end', align: 'left' as const }
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

async function loadSummaries(): Promise<void> {
  summaryLoading.value = true
  summaryError.value = ''
  try {
    const data = await utcService.listUsageSummaries({
      pair_id: typeof summaryPairId.value === 'number' && summaryPairId.value >= 0
        ? summaryPairId.value
        : undefined,
      direction: summaryDirection.value ?? undefined,
      state: summaryState.value ?? undefined
    })
    summaryItems.value = data.items
    summaryTotals.value = data.totals
  } catch (e) {
    summaryError.value = describeUtcError(e)
  } finally {
    summaryLoading.value = false
  }
}

function reset(): void {
  transportId.value = ''
  pairId.value = null
  side.value = null
  direction.value = null
  load()
}

onMounted(() => {
  load()
  loadSummaries()
})
</script>
