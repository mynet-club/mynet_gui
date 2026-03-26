<template>
  <PageLayout
    :title="$t('ippools.title')"
    :subtitle="$t('ippools.subtitle')"
    icon="network_wired"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn-group>
          <q-btn
            color="primary"
            icon="add"
            :label="$t('ippools.createPool')"
            data-tip-target="create-ippool-btn"
            @click="showCreateDialog = true"
          />
          <q-btn
            color="secondary"
            icon="refresh"
            :label="$t('common.refresh')"
            @click="handleRefresh"
          />
        </q-btn-group>
      </div>
    </template>

    <!-- IP池管理器组件（使用原有组件，但隐藏工具栏） -->
    <div class="ip-pool-content">
      <IPPoolManager :hideToolbar="true" />
    </div>

    <!-- IP池创建对话框 -->
    <IPPoolCreateDialog
      v-model="showCreateDialog"
      :existing-pools="pools"
      @created="handlePoolCreated"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageLayout from '../../components/layout/PageLayout.vue'
import IPPoolManager from '../../components/ippool/IPPoolManager.vue'
import IPPoolCreateDialog from '../../components/ippool/IPPoolCreateDialog.vue'
import { useIPPools } from '../../composables'
import { useOnboardingActions } from '../../composables/useOnboardingActions'

const { t } = useI18n()
const { pools, loading, fetchPools } = useIPPools()
const { onIpPoolCreated } = useOnboardingActions()

const showCreateDialog = ref(false)

const handleRefresh = async () => {
  await fetchPools()
}

const handlePoolCreated = async () => {
  showCreateDialog.value = false
  onIpPoolCreated()
  await handleRefresh()
}
</script>