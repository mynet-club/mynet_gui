<template>
  <div class="mynet-error-panel">
    <div class="error-title">
      <q-icon name="error_outline" class="q-mr-sm" />
      {{ message }}
    </div>
    <div v-if="reasonCode" class="error-code mono">reason_code: {{ reasonCode }}</div>
    <q-btn
      v-if="retryable"
      color="primary"
      outline
      dense
      label="重试"
      class="q-mt-sm"
      @click="$emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  reasonCode?: string | undefined
  retryable?: boolean | undefined
}

withDefaults(defineProps<Props>(), {
  retryable: true
})

defineEmits<{ retry: [] }>()
</script>

<style lang="scss" scoped>
.mynet-error-panel {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(220, 38, 38, 0.35);
  border-radius: 10px;
  background: rgba(220, 38, 38, 0.06);
  color: var(--err, var(--color-error, #dc2626));
}
.error-title { font-weight: 600; }
.error-code {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.85;
}
</style>
