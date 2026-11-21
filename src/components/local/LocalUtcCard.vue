<template>
  <MynetConfigCard
    title="UTC 加速（本机）"
    subtitle="控制本机 utcd / hubd 运行态，并展示已下发与已生效的 Core 配对水位"
    :badge="statusBadge.label"
    :badge-tone="statusBadge.tone"
  >
    <div class="row items-center q-gutter-md q-mb-md">
      <div class="row items-center q-gutter-sm">
        <span class="text-body2">UTC 开关</span>
        <q-toggle
          :model-value="status?.enabled ?? false"
          color="primary"
          :disable="loading || toggling || !configured"
          @update:model-value="onToggle"
        />
        <span class="text-caption">
          {{ status?.enabled ? '已开启' : configured ? '已关闭' : '未配置' }}
        </span>
      </div>
      <q-space />
      <q-btn
        flat
        dense
        icon="refresh"
        label="刷新"
        :loading="loading"
        :disable="toggling"
        @click="refresh"
      />
    </div>

    <q-banner
      v-if="errorMsg"
      dense
      class="q-mb-md bg-negative text-white"
    >
      {{ errorMsg }}
    </q-banner>

    <q-banner
      v-else-if="status?.hub.last_error"
      dense
      class="q-mb-md bg-warning text-dark"
    >
      Hub 配置读取异常：{{ status.hub.last_error }}
    </q-banner>

    <q-banner
      v-else-if="status && !configured"
      dense
      class="q-mb-md banner-soft"
    >
      本机未检测到 UTC 配置文件（utcd.conf 或 hub.json），配置下发后可在此开启加速。
    </q-banner>

    <div v-if="status" class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <div class="utc-meta-box">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-weight-medium">Endpoint (utcd)</span>
            <q-badge :color="status.endpoint.running ? 'positive' : status.endpoint.configured ? 'grey-7' : 'grey-5'">
              {{ status.endpoint.running ? '运行中' : status.endpoint.configured ? '已停止' : '未配置' }}
            </q-badge>
          </div>
          <div class="text-caption text-grey-7 mono">
            {{ status.endpoint.config_path || '未找到 utcd.conf' }}
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="utc-meta-box">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-weight-medium">Hub (hubd)</span>
            <q-badge :color="status.hub.running ? 'positive' : status.hub.configured ? 'grey-7' : 'grey-5'">
              {{ status.hub.running ? '运行中' : status.hub.configured ? '已停止' : '未配置' }}
            </q-badge>
          </div>
          <div class="text-caption text-grey-7 mono">
            <span v-if="status.hub.transport_id">
              {{ status.hub.transport_id }}<span v-if="status.hub.scope"> · {{ status.hub.scope }}</span>
            </span>
            <span v-else>{{ status.hub.config_path || '未找到 hub.json' }}</span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            配对：{{ appliedCount }} / {{ pairs.length }} 已生效
          </div>
        </div>
      </div>
    </div>

    <div v-if="pairs.length > 0">
      <div class="text-caption text-grey-7 q-mb-xs">
        本机 UTC 配对（{{ pairs.length }}）
      </div>
      <q-markup-table dense flat bordered separator="horizontal" class="utc-pairs-table">
        <thead>
          <tr>
            <th class="text-left">Pair ID</th>
            <th class="text-left">Peer ID</th>
            <th class="text-left">Side / Mode</th>
            <th class="text-left">状态</th>
            <th class="text-left">水位 (Gen / Lease / Place)</th>
            <th class="text-left">Edge</th>
            <th class="text-left">有效期至</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pair in pairs" :key="`${pair.pair_id}-${pair.peer_id}-${pair.side}`">
            <td class="mono">{{ pair.pair_id }}</td>
            <td class="mono">{{ pair.peer_id }}</td>
            <td class="mono">{{ pair.side }} · {{ pair.mode }}</td>
            <td>
              <q-badge :color="pair.applied ? 'positive' : 'grey-6'">
                {{ pair.applied ? 'APPLIED' : '未生效' }}
              </q-badge>
            </td>
            <td class="mono">
              <span v-if="pair.applied">
                {{ pair.pair_gen ?? 0 }} / {{ pair.lease_epoch ?? 0 }} / {{ pair.placement_epoch ?? 0 }}
              </span>
              <span v-else class="text-grey-6">—</span>
            </td>
            <td class="mono">{{ pair.edge_id || '—' }}</td>
            <td class="mono">{{ formatUnixTs(pair.valid_until) }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </MynetConfigCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MynetConfigCard from '../mynet/MynetConfigCard.vue'
import { localApi } from '../../services/local/localApi'
import type { LocalUtcStatus } from '../../types/local'

const status = ref<LocalUtcStatus | null>(null)
const loading = ref(false)
const toggling = ref(false)
const errorMsg = ref('')

const configured = computed(() =>
  Boolean(status.value?.endpoint.configured || status.value?.hub.configured)
)

const pairs = computed(() => status.value?.hub.pairs || [])
const appliedCount = computed(() => pairs.value.filter((p) => p.applied).length)

const statusBadge = computed<{
  label: string
  tone: 'primary' | 'positive' | 'warning' | 'negative' | 'grey'
}>(() => {
  if (!status.value) return { label: loading.value ? '加载中' : '未知', tone: 'grey' }
  if (!configured.value) return { label: '未配置', tone: 'grey' }
  if (status.value.hub.last_error) return { label: '配置异常', tone: 'warning' }
  if (status.value.enabled) {
    const anyRunning = status.value.endpoint.running || status.value.hub.running
    return anyRunning
      ? { label: '已开启', tone: 'positive' }
      : { label: '已开启（等待运行）', tone: 'warning' }
  }
  return { label: '已关闭', tone: 'grey' }
})

function formatUnixTs(ts?: number): string {
  if (!ts || ts <= 0) return '—'
  const d = new Date(ts * 1000)
  if (Number.isNaN(d.getTime())) return String(ts)
  return d.toLocaleString('zh-CN', { hour12: false })
}

async function refresh() {
  loading.value = true
  errorMsg.value = ''
  try {
    status.value = await localApi.getUtcStatus()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function onToggle(val: boolean | number | null) {
  const next = Boolean(val)
  toggling.value = true
  errorMsg.value = ''
  try {
    status.value = await localApi.putUtcAcceleration(next)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e)
    await refresh()
  } finally {
    toggling.value = false
  }
}

onMounted(() => {
  void refresh()
})
</script>

<style scoped>
.utc-meta-box {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.utc-pairs-table th,
.utc-pairs-table td {
  font-size: 12px;
}
</style>
