<template>
  <div class="local-services">
    <div class="text-h5 q-mb-md">服务与插件</div>
    <MynetAsyncState :state="uiState" :error="err" @retry="load">
      <MynetConfigCard title="插件" subtitle="来自 GET /api/v1/plugins">
        <pre class="raw mono">{{ raw }}</pre>
      </MynetConfigCard>
    </MynetAsyncState>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { UiState } from '../../types/local'
import MynetAsyncState from '../../components/mynet/MynetAsyncState.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'

const plugins = ref<unknown>(null)
const err = ref<LocalApiError | null>(null)
const loading = ref(false)

const uiState = computed<UiState>(() => {
  if (loading.value && plugins.value === null) return 'loading'
  if (err.value && plugins.value === null) return 'error'
  return 'ready'
})

const raw = computed(() => {
  try {
    return JSON.stringify(plugins.value, null, 2) || '—'
  } catch {
    return String(plugins.value)
  }
})

async function load() {
  loading.value = true
  err.value = null
  try {
    plugins.value = await localGatewayApi.getPlugins()
  } catch (e) {
    err.value = e instanceof LocalApiError ? e : new LocalApiError({ success: false, message: String(e) })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
