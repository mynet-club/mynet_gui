<template>
  <PageLayout
    title="Relay 管理"
    subtitle="声明谁可以成为 Edge/Relay，并维护 approved-pair 灰度名单（仅管理面配置）"
    icon="admin_panel_settings"
  >
    <template #actions>
      <q-btn class="btn-ghost" icon="refresh" label="刷新" @click="refreshAll" />
    </template>

    <UtcCoreStatusCard :hub="hubStatus" class="q-mb-md" />

    <!-- key 变化即重新挂载并拉取；两个面板各自独立加载，互不阻塞 -->
    <UtcRelayInventoryPanel :key="`inventory-${reloadKey}`" />
    <UtcPairApprovalPanel :key="`pairs-${reloadKey}`" />
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import UtcCoreStatusCard from '../../components/utc/UtcCoreStatusCard.vue'
import UtcRelayInventoryPanel from '../../components/utc/UtcRelayInventoryPanel.vue'
import UtcPairApprovalPanel from '../../components/utc/UtcPairApprovalPanel.vue'
import { utcService } from '../../services/utc/utcService'
import type { UtcHubStatus } from '../../types/utc'

const reloadKey = ref(0)
const hubStatus = ref<UtcHubStatus | null>(null)

async function loadHubStatus(): Promise<void> {
  try {
    hubStatus.value = await utcService.getHubStatus()
  } catch {
    hubStatus.value = null
  }
}

function refreshAll(): void {
  reloadKey.value += 1
  void loadHubStatus()
}

onMounted(() => {
  void loadHubStatus()
})
</script>

<style scoped>
.utc-relay-admin__notice {
  background: rgba(59, 130, 246, 0.08);
}
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
