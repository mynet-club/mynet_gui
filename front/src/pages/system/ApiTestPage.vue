<template>
  <q-page class="api-test-page">
    <div class="q-pa-md">
      <!-- 页面标题 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('navigation.apiTest') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('apiTest.subtitle') }}
          </p>
        </div>
      </div>

      <!-- 开发中提示 -->
      <div class="row justify-center q-mt-xl">
        <div class="col-12 col-md-6">
          <q-card class="text-center">
            <q-card-section class="q-pa-xl">
              <q-icon name="code" size="4rem" color="accent" class="q-mb-md" />
              <div class="text-h5 q-mb-md">{{ $t('common.comingSoon') }}</div>
              <div class="text-body1 text-grey-6">
                {{ $t('apiTest.comingSoonMessage') }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.api-test-page {
  .q-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
