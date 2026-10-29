<template>
  <q-card class="mynet-metric-card">
    <q-card-section class="q-pb-sm">
      <div class="metric-label">{{ label }}</div>
      <div class="metric-value" :class="`tone-${tone}`">
        <slot name="value">{{ value }}</slot>
      </div>
      <div v-if="sub" class="metric-sub">{{ sub }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value?: string
  sub?: string
  tone?: 'default' | 'ok' | 'warn' | 'error'
}

withDefaults(defineProps<Props>(), {
  value: '—',
  sub: '',
  tone: 'default'
})
</script>

<style lang="scss" scoped>
.mynet-metric-card {
  border-radius: var(--r-card, 12px);
  height: 100%;
  min-height: 125px;
}
.metric-label {
  font-size: var(--font-caption, 12px);
  color: var(--ink-3, var(--color-text-secondary, #6b7280));
}
.metric-value {
  font-size: var(--font-metric, 22px);
  font-weight: 650;
  margin-top: var(--sp-1, 4px);
  &.tone-ok { color: var(--ok, var(--color-success, #16a34a)); }
  &.tone-warn { color: var(--warn, var(--color-warning, #f59e0b)); }
  &.tone-error { color: var(--err, var(--color-error, #dc2626)); }
}
.metric-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}
</style>
