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
          :disable="loading || toggling || syncing || !configured"
          @update:model-value="onToggle"
        />
        <span class="text-caption">
          {{ status?.enabled ? '已开启' : configured ? '已关闭' : '未配置' }}
        </span>
      </div>
      <q-space />
      <q-btn
        outline
        dense
        color="primary"
        icon="cloud_download"
        label="同步配置"
        :loading="syncing"
        :disable="loading || toggling"
        @click="onSyncConfig"
      />
      <q-btn
        flat
        dense
        icon="refresh"
        label="刷新"
        :loading="loading"
        :disable="toggling || syncing"
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
      v-else-if="successMsg"
      dense
      class="q-mb-md bg-positive text-white"
    >
      {{ successMsg }}
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
      本机未检测到 utcd.conf，点击右上「同步配置」从云端拉取后即可开启 UTC 加速。
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

    <div v-if="status && configured" class="utc-pair-box q-mb-md">
      <div class="row items-center justify-between q-mb-xs">
        <span class="text-weight-medium">TCP 连接（按对端）</span>
        <span class="text-caption text-grey-7">{{ peerRows.length }} 个对端</span>
      </div>
      <div class="text-caption text-grey-7 q-mb-sm">
        TCP 只对显式建立的对端生效；标为「原生 UDP / 未选择 TCP」的对端不占用 TCP 带宽。
      </div>
      <q-markup-table dense flat bordered separator="horizontal" class="utc-pairs-table">
        <thead>
          <tr>
            <th class="text-left">对端</th>
            <th class="text-left">状态</th>
            <th class="text-left">模式 / 桥</th>
            <th class="text-left">Pair ID</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in peerRows" :key="row.peerId">
            <td class="mono">{{ row.name }}</td>
            <td>
              <q-badge :color="utcPairStateMeta(row.pair?.state).tone">
                {{ utcPairStateMeta(row.pair?.state).label }}
              </q-badge>
              <div v-if="row.pair?.reason" class="text-caption text-grey-7">
                {{ row.pair.reason }}
              </div>
            </td>
            <td class="mono">
              <template v-if="row.pair">
                {{ utcModeLabel(row.pair.mode) }} ·
                {{ row.pair.bridge_up ? 'TCP 桥已连' : 'TCP 桥未连' }}
              </template>
              <template v-else>—</template>
            </td>
            <td class="mono">{{ row.pair?.pair_id || '—' }}</td>
            <td class="text-right">
              <q-btn
                v-if="canDisconnect(row.pair)"
                flat
                dense
                color="negative"
                label="断开"
                :loading="pairBusy === row.peerId"
                :disable="pairBusy !== null"
                @click="onPairIntent(row.peerId, 'off')"
              />
              <q-btn
                v-else
                flat
                dense
                color="primary"
                label="建立 TCP 连接"
                :loading="pairBusy === row.peerId"
                :disable="pairBusy !== null || !status?.enabled"
                @click="onPairIntent(row.peerId, 'on')"
              />
            </td>
          </tr>
          <tr v-if="peerRows.length === 0">
            <td colspan="5" class="text-grey-7">暂无对端节点</td>
          </tr>
        </tbody>
      </q-markup-table>
      <div v-if="status && !status.enabled" class="text-caption text-grey-7 q-mt-xs">
        总开关关闭时无法建立 TCP；请先打开上方 UTC 开关。
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
import { localApi, localGatewayApi } from '../../services/local/localApi'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type { LocalNodeStatus, LocalUtcPairView, LocalUtcStatus } from '../../types/local'
import { utcModeLabel, utcPairStateMeta } from '../../utils/utcFormat'
import { loadPersistedNames, peerDisplayName } from '../../utils/nodeDisplay'
import { applyPairIntent } from '../../utils/utcPairAction'

const status = ref<LocalUtcStatus | null>(null)
const nodeStatus = ref<LocalNodeStatus | null>(null)
const pairs = ref<LocalUtcPairView[]>([])
const pairBusy = ref<number | null>(null)
const nodeNames = ref(loadPersistedNames())
const loading = ref(false)
const toggling = ref(false)
const syncing = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const configured = computed(() => Boolean(status.value?.configured))
const peers = computed(() => status.value?.peers || [])

interface PeerRow {
  peerId: number
  name: string
  pair: LocalUtcPairView | null
}

// 以本机 route/对端表为全集，合并后端 pair 状态：没有 pair 的对端也要显示
// “未选择 TCP”，否则用户会以为总开关一开就自动走 TCP。
const peerRows = computed<PeerRow[]>(() => {
  const byId = new Map<number, LocalUtcPairView>()
  for (const pair of pairs.value) byId.set(Number(pair.peer_id), pair)
  const rows: PeerRow[] = []
  const seen = new Set<number>()
  for (const peer of nodeStatus.value?.peers || []) {
    if (peer.is_self) continue
    const id = Number(peer.node_id || 0)
    if (!id) continue
    seen.add(id)
    rows.push({
      peerId: id,
      name: peerDisplayName(peer, nodeNames.value),
      pair: byId.get(id) || null
    })
  }
  for (const [id, pair] of byId) {
    if (seen.has(id)) continue
    rows.push({
      peerId: id,
      name: peerDisplayName({ node_id: String(id) }, nodeNames.value),
      pair
    })
  }
  rows.sort((a, b) => a.peerId - b.peerId)
  return rows
})

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
    const [nextStatus, nextPairs, nextNodeStatus] = await Promise.all([
      localApi.getUtcStatus(),
      localApi.getUtcPairs().catch(() => null),
      localGatewayApi.getNodeStatus().catch(() => null)
    ])
    status.value = nextStatus
    pairs.value = nextPairs?.pairs || []
    nodeStatus.value = nextNodeStatus
    nodeNames.value = loadPersistedNames()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function onSyncConfig() {
  syncing.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const remote = await utcService.getClientConfig(
      nodeStatus.value?.node_id ? { node_id: String(nodeStatus.value.node_id) } : undefined
    )
    if (!remote.peers || remote.peers.length === 0) {
      errorMsg.value = '云端暂无已建立的 UTC 配对，请点击「建立 TCP 连接」'
      return
    }
    status.value = await localApi.syncUtcConfig({
      edge_candidates: remote.edge_candidates,
      peers: remote.peers.map((p) => ({
        name: p.name,
        transport_id: p.transport_id
      }))
    })
    successMsg.value = `已同步 utcd.conf（${status.value.peers.length} 个对端）`
  } catch (e) {
    errorMsg.value = describeUtcError(e)
  } finally {
    syncing.value = false
  }
}

function canDisconnect(pair: LocalUtcPairView | null): boolean {
  if (!pair) return false
  return (
    pair.intent === 'on' ||
    pair.state === 'tcp' ||
    pair.state === 'degraded' ||
    pair.state === 'revoking'
  )
}

async function onPairIntent(peerId: number, intent: 'on' | 'off') {
  pairBusy.value = peerId
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const result = await applyPairIntent(peerId, intent, {
      putLocalIntent: (id, next) => localApi.putUtcPairIntent(id, next),
      getClientConfig: () =>
        utcService.getClientConfig(
          nodeStatus.value?.node_id ? { node_id: String(nodeStatus.value.node_id) } : undefined
        ),
      createPairApproval: (a, b, reason) => utcService.createPairApproval(a, b, reason),
      setAcceleration: (transportId, enabled) => utcService.setAcceleration(transportId, enabled),
      listPairApprovals: () => utcService.listPairApprovals(),
      revokePairApproval: (pairId, revision, reason) =>
        utcService.revokePairApproval(pairId, revision, reason),
      syncUtcConfig: (payload) => localApi.syncUtcConfig(payload),
      disableLocalUtc: () => localApi.putUtcAcceleration(false),
      recordResult: (id, result, reason) => localApi.putUtcPairResult(id, result, reason)
    })
    status.value = result.localStatus
    pairs.value = result.localPairs
    successMsg.value = result.message
    await refresh()
  } catch (e) {
    const httpStatus = (e as { response?: { status?: number } })?.response?.status
    const hint =
      httpStatus === 401
        ? '（登录已过期，请重新登录后再试）'
        : httpStatus === 403
          ? '（请重新登录后重试）'
          : ''
    await refresh()
    errorMsg.value = `本地已记录，云端同步失败${hint}：${describeUtcError(e)}`
  } finally {
    pairBusy.value = null
  }
}

async function onToggle(val: boolean | number | null) {
  const next = Boolean(val)
  toggling.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    status.value = await localApi.putUtcAcceleration(next)
  } catch (e) {
    await refresh()
    errorMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    toggling.value = false
  }
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.utc-meta-box,
.utc-pair-box {
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
