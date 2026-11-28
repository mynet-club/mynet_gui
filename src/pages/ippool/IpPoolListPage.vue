<template>
  <PageLayout
    :title="$t('ippools.title')"
    :subtitle="$t('ippools.subtitle')"
    icon="layers"
  >
    <template #actions>
      <q-btn
        unelevated
        dense
        no-caps
        color="primary"
        icon="add"
        :label="$t('ippools.createPool')"
        :disable="gate.blocked"
        class="q-px-md"
        @click="showCreateDialog = true"
      >
        <q-tooltip v-if="gate.blocked">{{ gate.reason }}</q-tooltip>
      </q-btn>
      <q-btn
        dense
        no-caps
        class="btn-ghost"
        icon="refresh"
        :label="$t('common.refresh')"
        :loading="loading"
        @click="handleRefresh"
      />
    </template>

    <!-- 四级能力/配额受限横幅（配额已满或平台停用时自动呈现） -->
    <CapabilityGateBanner
      :state="statistics"
      upgrade-label="申请扩容资源包"
      class="q-mb-md"
      @upgrade="handleUpgradeHint"
    />

    <!-- IP资源包管理器组件（使用原有组件，但隐藏工具栏） -->
    <div class="ip-pool-content">
      <IPPoolManager :hideToolbar="true" />
    </div>

    <!-- IP资源包创建对话框 -->
    <IPPoolCreateDialog
      v-model="showCreateDialog"
      :existing-pools="pools"
      @created="handlePoolCreated"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import PageLayout from '../../components/layout/PageLayout.vue'
import CapabilityGateBanner from '../../components/common/CapabilityGateBanner.vue'
import IPPoolManager from '../../components/ippool/IPPoolManager.vue'
import IPPoolCreateDialog from '../../components/ippool/IPPoolCreateDialog.vue'
import { useIPPools } from '../../composables'
import { resolveCapabilityGate } from '../../utils/capabilityGate'

const $q = useQuasar()
const { pools, statistics, loading, fetchPools, fetchStatistics } = useIPPools()

const showCreateDialog = ref(false)
const gate = computed(() => resolveCapabilityGate(statistics.value))

const handleRefresh = async () => {
  await Promise.all([fetchPools(), fetchStatistics()])
}

const handlePoolCreated = async () => {
  showCreateDialog.value = false
  await handleRefresh()
}

const handleUpgradeHint = () => {
  $q.notify({
    type: 'info',
    message: 'IP 资源包扩容方案即将开放，当前可联系网络区管理员提升配额。',
    timeout: 3500
  })
}

onMounted(() => {
  void fetchStatistics()
})
</script>
