<template>
  <div class="mynet-field-row">
    <label v-if="label" class="field-label" v-bind="forId ? { for: forId } : {}">{{ label }}</label>
    <div class="field-control">
      <slot />
    </div>
    <div v-if="help" class="field-help">{{ help }}</div>
    <div v-if="error" class="field-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string | undefined
  help?: string | undefined
  error?: string | undefined
  forId?: string | undefined
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.mynet-field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #4b5563);
}
.field-help {
  font-size: 11px;
  color: var(--color-text-secondary, #9ca3af);
}
.field-error {
  font-size: 11px;
  color: var(--color-error, #dc2626);
}
</style>
