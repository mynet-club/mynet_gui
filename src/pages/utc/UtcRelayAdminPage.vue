<template>
  <PageLayout
    title="Relay 管理"
    subtitle="声明谁可以成为 Edge/Relay，并维护 approved-pair 灰度名单（仅管理面配置）"
    icon="admin_panel_settings"
  >
    <template #actions>
      <q-btn class="btn-ghost" icon="refresh" label="刷新" @click="reloadKey += 1" />
    </template>

    <q-banner dense rounded class="utc-relay-admin__notice q-mb-md">
      <template #avatar>
        <q-icon name="info" />
      </template>
      本页只写管理面配置：新增记录默认“待批准”，批准与声明分离；Hub 管理面下发/动态派单尚未接通，
      因此任何记录都不会产生 placement，也不会改变 Hub 当前按静态
      <span class="mono">edge=</span> 的派单。管理员身份由服务端白名单判定，默认全部拒绝。
    </q-banner>

    <!-- key 变化即重新挂载并拉取；两个面板各自独立加载，互不阻塞 -->
    <UtcRelayInventoryPanel :key="`inventory-${reloadKey}`" />
    <UtcPairApprovalPanel :key="`pairs-${reloadKey}`" />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import UtcRelayInventoryPanel from '../../components/utc/UtcRelayInventoryPanel.vue'
import UtcPairApprovalPanel from '../../components/utc/UtcPairApprovalPanel.vue'

const reloadKey = ref(0)
</script>

<style scoped>
.utc-relay-admin__notice {
  background: rgba(59, 130, 246, 0.08);
}
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
