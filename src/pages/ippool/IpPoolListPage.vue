<template>
  <q-page class="ippools-page">
    <div class="q-pa-md">
      <!-- 页面标题 -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('ippools.title') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('ippools.subtitle') }}
          </p>
        </div>
      </div>

      <!-- IP池管理器组件 -->
      <IPPoolManager />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import IPPoolManager from '../../components/ippool/IPPoolManager.vue'
</script>

<style lang="scss" scoped>
.ippools-page {
  h4 {
    font-weight: 600;
    color: var(--q-primary);
  }
}
</style>