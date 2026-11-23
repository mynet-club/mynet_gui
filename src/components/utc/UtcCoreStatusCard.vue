<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-pb-sm">
      <div class="text-subtitle1">UTC Core 状态</div>
      <q-chip
        dense
        size="sm"
        class="q-ml-sm"
        :color="coreOnline ? 'positive' : 'warning'"
        text-color="white"
      >
        {{ coreOnline ? '在线' : '离线 / 未上报' }}
      </q-chip>
      <q-space />
      <span v-if="core" class="text-caption text-grey-7 mono">
        {{ core.issuer || 'utc-core' }} · {{ core.key_id || '—' }} · {{ core.version || '—' }}
      </span>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="core" class="row q-col-gutter-md">
      <div class="col-6 col-sm-4 col-md-2">
        <div class="text-caption text-grey-7">策略版本 (rev)</div>
        <div class="text-subtitle2 mono">{{ core.applied_revision }}</div>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <div class="text-caption text-grey-7">吊销纪元 (epoch)</div>
        <div class="text-subtitle2 mono">{{ core.revocation_epoch }}</div>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <div class="text-caption text-grey-7">生效代次 (gen)</div>
        <div class="text-subtitle2 mono">{{ core.live_generation }}</div>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <div class="text-caption text-grey-7">活跃配对</div>
        <div class="text-subtitle2 mono">{{ core.active_pairs }}</div>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <div class="text-caption text-grey-7">运行时长</div>
        <div class="text-subtitle2 mono">{{ formatUptime(core.uptime_sec) }}</div>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <div class="text-caption text-grey-7">最近心跳</div>
        <div class="text-subtitle2">{{ formatUtcTime(core.observed_at) }}</div>
      </div>
    </q-card-section>

    <q-card-section v-else class="text-caption text-grey-7">
      暂未收到 Core 上报（等待 <span class="mono">utc-core</span> 通过 mTLS 推送 <span class="mono">/api/v1/internal/utc/status</span>）。
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UtcHubStatus } from '../../types/utc'
import { formatUptime, formatUtcTime } from '../../utils/utcFormat'

const props = defineProps<{
  hub: UtcHubStatus | null
}>()

const coreOnline = computed(() => Boolean(props.hub?.core_online))
const core = computed(() => props.hub?.core ?? null)
</script>

<style scoped>
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
