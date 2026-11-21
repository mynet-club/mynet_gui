<template>
  <MynetConfigCard
    title="UTC 加速（本机）"
    subtitle="基于单一 utcd.conf 控制本机 utcd 运行态并展示已配置的 Peer 接线"
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
      v-else-if="status?.last_error"
      dense
      class="q-mb-md bg-warning text-dark"
    >
      utcd.conf 读取异常：{{ status.last_error }}
    </q-banner>

    <q-banner
      v-else-if="status && !configured"
      dense
      class="q-mb-md banner-soft"
    >
      本机未检测到 utcd.conf，配置下发后可在此开启 UTC 加速。
    </q-banner>

    <div v-if="status && configured" class="utc-meta-box q-mb-md">
      <div class="row items-center justify-between q-mb-xs">
        <span class="text-weight-medium">
          utcd 运行态<span v-if="status.config_version"> · v{{ status.config_version }}</span>
        </span>
        <q-badge :color="status.running ? 'positive' : 'grey-7'">
          {{ status.running ? '运行中' : '已停止' }}
        </q-badge>
      </div>
      <div class="text-caption text-grey-7 mono">
        配置：{{ status.config_path }}
      </div>
      <div v-if="status.state_dir" class="text-caption text-grey-7 mono q-mt-xs">
        状态目录：{{ status.state_dir }}
      </div>
      <div v-if="status.edge_candidates.length > 0" class="text-caption text-grey-7 mono q-mt-xs">
        Edge 候选：{{ status.edge_candidates.join(', ') }}
      </div>
    </div>

    <div v-if="peers.length > 0">
      <div class="text-caption text-grey-7 q-mb-xs">
        本机 Peer 接线（{{ peers.length }}）
      </div>
      <q-markup-table dense flat bordered separator="horizontal" class="utc-pairs-table">
        <thead>
          <tr>
            <th class="text-left">Peer 名称</th>
            <th class="text-left">Transport ID</th>
            <th class="text-left">UDP Bind</th>
            <th class="text-left">UDP Target</th>
            <th class="text-left">Pair ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="peer in peers" :key="peer.name">
            <td class="mono">{{ peer.name }}</td>
            <td class="mono">{{ peer.transport_id ?? '—' }}</td>
            <td class="mono">{{ peer.udp_bind || '—' }}</td>
            <td class="mono">{{ peer.udp_target || '—' }}</td>
            <td class="mono">{{ peer.pair_id ?? 'Core 派发' }}</td>
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

const configured = computed(() => Boolean(status.value?.configured))
const peers = computed(() => status.value?.peers || [])

const statusBadge = computed<{
  label: string
  tone: 'primary' | 'positive' | 'warning' | 'negative' | 'grey'
}>(() => {
  if (!status.value) return { label: loading.value ? '加载中' : '未知', tone: 'grey' }
  if (!configured.value) return { label: '未配置', tone: 'grey' }
  if (status.value.last_error) return { label: '配置异常', tone: 'warning' }
  if (status.value.enabled) {
    return status.value.running
      ? { label: '已开启', tone: 'positive' }
      : { label: '已开启（等待运行）', tone: 'warning' }
  }
  return { label: '已关闭', tone: 'grey' }
})

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
