<template>
  <PageLayout title="UTC 节点" subtitle="我的 transport、加速开关与用量进度" icon="hub">
    <template #actions>
      <q-btn
        class="btn-ghost"
        icon="person_add"
        label="登记 UTC 身份"
        @click="openRegister"
      />
      <q-btn
        class="btn-ghost q-ml-sm"
        icon="refresh"
        label="刷新"
        :loading="loading"
        @click="load"
      />
    </template>

    <UtcSourceNotice :scope="scope" :source="source" />

    <MynetErrorPanel
      v-if="error"
      :message="error"
      retryable
      @retry="load"
    />

    <template v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <MynetMetricCard
            label="我的 transport"
            :value="String(transports.length)"
            sub="本账号已登记的 UTC 身份"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <MynetMetricCard
            label="加速已启用"
            :value="`${accelerationEnabled} / ${accelerationTotal}`"
            sub="只代表期望值；观测状态以 Core 上报为准"
            :tone="accelerationEnabled > 0 ? 'ok' : undefined"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <MynetMetricCard
            label="本期已用"
            :value="formatBytes(usageTotals.used_bytes)"
            :sub="`配额 ${formatBytes(usageTotals.quota_bytes)}`"
          />
        </div>
      </div>

      <UtcAccelerationPanel />

      <q-card flat bordered class="q-mt-md">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1">用量进度</div>
          <div class="text-caption text-grey-7">
            只展示本账号的配额切片；计费口径（Core 签名对账）在平台后台查看。
          </div>
        </q-card-section>
        <q-card-section v-if="usage.length === 0" class="text-grey-7">
          暂无用量的切片（Core 尚未下发配额）。
        </q-card-section>
        <q-card-section v-else class="q-gutter-md">
          <div v-for="row in usage" :key="`${row.transport_id}-${row.pair_id}-${row.side}-${row.direction}`">
            <div class="row items-center q-mb-xs">
              <span class="mono text-caption">{{ row.transport_id }}</span>
              <q-chip dense size="sm" class="q-ml-sm">pair {{ row.pair_id }}</q-chip>
              <q-chip dense size="sm">{{ sideLabel(row.side) }}</q-chip>
              <q-chip dense size="sm">{{ row.direction }}</q-chip>
              <q-space />
              <span class="text-caption text-grey-8">
                {{ formatBytes(row.used_bytes) }} / {{ formatBytes(row.quota_bytes) }}
              </span>
            </div>
            <q-linear-progress
              :value="usagePercent(row.used_bytes, row.quota_bytes) / 100"
              rounded
              size="10px"
              color="primary"
              track-color="grey-3"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="q-mt-md">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1">transport 身份</div>
          <div class="text-caption text-grey-7">
            注册主体由认证账号决定；同一 scope 内 node_id 与 SPKI 1:1。
          </div>
        </q-card-section>
        <q-table
          :rows="transports"
          :columns="transportColumns"
          row-key="transport_id"
          dense
          flat
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="当前账号尚未注册 transport"
        >
          <template #body-cell-spki_sha256="props">
            <q-td :props="props">
              <span class="mono" :title="props.row.spki_sha256">{{ shortSpki(props.row.spki_sha256) }}</span>
            </q-td>
          </template>
          <template #body-cell-registered_at="props">
            <q-td :props="props">{{ formatUtcTime(props.row.registered_at) }}</q-td>
          </template>
        </q-table>
      </q-card>
    </template>

    <q-dialog v-model="registerOpen">
      <q-card style="min-width: 440px">
        <q-card-section class="text-subtitle1">登记 UTC 身份</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="draft.transportId"
            dense
            outlined
            label="transport_id（十进制；建议用节点 GNB ID）"
          />
          <q-input v-model="draft.nodeId" dense outlined label="node_id（可选，用于 1:1 绑定）" />
          <q-input
            v-model="draft.spki"
            dense
            outlined
            label="SPKI SHA-256（64 hex，来自节点 UTC 证书公钥）"
          />
          <div v-if="registerError" class="text-negative text-caption">{{ registerError }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            label="登记"
            :loading="registering"
            @click="submitRegister"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetErrorPanel from '../../components/mynet/MynetErrorPanel.vue'
import UtcSourceNotice from '../../components/utc/UtcSourceNotice.vue'
import UtcAccelerationPanel from '../../components/utc/UtcAccelerationPanel.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type {
  UtcAccelerationItem,
  UtcDataSource,
  UtcTransport,
  UtcTransportDraft,
  UtcUsageRecord,
  UtcUsageTotals
} from '../../types/utc'
import { formatBytes, formatUtcTime, sideLabel, usagePercent } from '../../utils/utcFormat'

const loading = ref(false)
const error = ref('')
const transports = ref<UtcTransport[]>([])
const usage = ref<UtcUsageRecord[]>([])
const usageTotals = ref<UtcUsageTotals>({
  quota_bytes: 0,
  used_bytes: 0,
  reserved_bytes: 0,
  uncertain_bytes: 0,
  remaining_bytes: 0,
  overage_bytes: 0
})
const acceleration = ref<UtcAccelerationItem[]>([])
const scope = ref('')
const source = ref<UtcDataSource | null>(null)

const accelerationTotal = computed(() => acceleration.value.length)
const accelerationEnabled = computed(() => acceleration.value.filter((row) => row.desired_enabled).length)

const registerOpen = ref(false)
const registering = ref(false)
const registerError = ref('')
const draft = ref({ transportId: '', nodeId: '', spki: '' })

function openRegister(): void {
  registerError.value = ''
  draft.value = { transportId: '', nodeId: '', spki: '' }
  registerOpen.value = true
}

async function submitRegister(): Promise<void> {
  registerError.value = ''
  const transportId = draft.value.transportId.trim()
  const nodeId = draft.value.nodeId.trim()
  const spki = draft.value.spki.trim().toLowerCase()
  if (!/^[1-9][0-9]{0,19}$/.test(transportId)) {
    registerError.value = 'transport_id 必须是十进制正整数'
    return
  }
  if (nodeId && !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(nodeId)) {
    registerError.value = 'node_id 含非法字符'
    return
  }
  if (!/^[a-f0-9]{64}$/.test(spki)) {
    registerError.value = 'SPKI 必须是 64 位十六进制'
    return
  }
  const payload: UtcTransportDraft = {
    transport_id: transportId,
    node_id: nodeId || null,
    spki_sha256: spki
  }
  registering.value = true
  try {
    await utcService.registerTransport(payload)
    registerOpen.value = false
    await load()
  } catch (e) {
    registerError.value = describeUtcError(e)
  } finally {
    registering.value = false
  }
}

const transportColumns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const },
  { name: 'node_id', label: 'node 别名', field: 'node_id', align: 'left' as const },
  { name: 'spki_sha256', label: 'SPKI SHA-256', field: 'spki_sha256', align: 'left' as const },
  { name: 'registered_at', label: '注册时间', field: 'registered_at', align: 'left' as const }
]

function shortSpki(value: string): string {
  if (!value) return '—'
  return `${value.slice(0, 12)}…${value.slice(-8)}`
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [list, usageList, accelerationList] = await Promise.all([
      utcService.listTransports(),
      utcService.listUsage(),
      utcService.getAcceleration()
    ])
    transports.value = list.transports
    usage.value = usageList.items
    usageTotals.value = usageList.totals
    acceleration.value = accelerationList.items
    scope.value = usageList.scope
    source.value = usageList.data_source
  } catch (e) {
    error.value = describeUtcError(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
