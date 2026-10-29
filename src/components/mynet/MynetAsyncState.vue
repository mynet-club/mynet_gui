<template>
  <div class="mynet-async-state">
    <div v-if="state === 'loading'" class="async-center">
      <q-spinner color="primary" size="28px" />
      <div class="q-mt-sm text-caption">{{ loadingText }}</div>
    </div>
    <div v-else-if="state === 'error'" class="async-center">
      <MynetErrorPanel
        :message="error?.message || '加载失败'"
        :reason-code="error?.reasonCode"
        :retryable="error?.retryable ?? true"
        @retry="$emit('retry')"
      />
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import MynetErrorPanel from './MynetErrorPanel.vue'
import type { LocalApiError } from '../../services/local/localApi'
import type { UiState } from '../../types/local'

interface Props {
  state: UiState
  error?: LocalApiError | null | undefined
  loadingText?: string | undefined
}

withDefaults(defineProps<Props>(), {
  error: null,
  loadingText: '读取中…'
})

defineEmits<{ retry: [] }>()
</script>

<style scoped>
.async-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
}
</style>
