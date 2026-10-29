<template>
  <div class="mynet-empty">
    <q-icon :name="icon" size="32px" class="empty-icon" />
    <div class="empty-text">{{ text }}</div>
    <q-btn
      v-if="actionLabel"
      color="primary"
      outline
      dense
      :label="actionLabel"
      :loading="busy"
      class="q-mt-sm"
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
  icon?: string
  actionLabel?: string
  busy?: boolean
}
withDefaults(defineProps<Props>(), {
  icon: 'info_outline',
  actionLabel: '',
  busy: false
})
defineEmits<{ action: [] }>()
</script>

<style lang="scss" scoped>
.mynet-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6, 24px) var(--sp-4, 16px);
  min-height: 160px;
  color: var(--ink-3, #9ca3af);
}
.empty-icon { opacity: 0.55; }
.empty-text {
  margin-top: var(--sp-2, 8px);
  font-size: var(--font-caption, 12px);
}
</style>
