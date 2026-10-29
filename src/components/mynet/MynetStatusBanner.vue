<template>
  <div class="mynet-status-banner" :class="`tone-${tone}`" role="status">
    <q-icon :name="iconName" size="20px" class="q-mr-sm" />
    <div class="col">
      <div class="banner-title">{{ title }}</div>
      <div v-if="detail" class="banner-detail">{{ detail }}</div>
    </div>
    <q-btn
      v-if="actionLabel"
      flat
      dense
      :label="actionLabel"
      class="q-ml-sm"
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  detail?: string | undefined
  tone?: 'ok' | 'warn' | 'error' | 'info' | 'muted' | undefined
  actionLabel?: string | undefined
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'info'
})

defineEmits<{ action: [] }>()

const iconName = computed(() => {
  switch (props.tone) {
    case 'ok': return 'check_circle'
    case 'warn': return 'warning'
    case 'error': return 'error'
    case 'muted': return 'info'
    default: return 'info'
  }
})
</script>

<style lang="scss" scoped>
.mynet-status-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--r-input, 8px);
  border: 1px solid var(--line, var(--color-border, #e5e7eb));
  background: var(--bg-muted, var(--color-bg-secondary, #f9fafb));

  .banner-title { font-weight: 600; font-size: 14px; }
  .banner-detail { font-size: 12px; opacity: 0.85; margin-top: 2px; }

  &.tone-ok { color: var(--ok, var(--color-success, #16a34a)); }
  &.tone-warn { color: var(--warn, var(--color-warning, #f59e0b)); }
  &.tone-error { color: var(--err, var(--color-error, #dc2626)); }
  &.tone-info { color: var(--color-info, #2563eb); }
  &.tone-muted { color: var(--ink-3, var(--color-text-secondary, #6b7280)); }
}
</style>
