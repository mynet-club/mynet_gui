<template>
  <q-banner dense rounded class="utc-source q-mb-md">
    <template #avatar>
      <q-icon :name="source?.durable ? 'database' : 'memory'" />
    </template>
    <div class="row items-center q-gutter-sm">
      <span>数据源：{{ source?.mode || 'unknown' }}</span>
      <q-badge :color="source?.durable ? 'positive' : 'warning'">
        {{ source?.durable ? '已持久化' : '未持久化' }}
      </q-badge>
      <span class="text-caption">scope: {{ scope || '—' }}</span>
    </div>
    <div v-if="source?.note" class="text-caption q-mt-xs">{{ source.note }}</div>
  </q-banner>
</template>

<script setup lang="ts">
import type { UtcDataSource } from '../../types/utc'

interface Props {
  scope?: string | null
  source?: UtcDataSource | null
}

withDefaults(defineProps<Props>(), {
  scope: '',
  source: null
})
</script>

<style scoped>
.utc-source {
  background: rgba(245, 158, 11, 0.08);
}
</style>
