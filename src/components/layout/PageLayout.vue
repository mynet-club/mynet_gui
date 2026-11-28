<template>
  <div class="page-layout">
    <!-- 面包屑（可选） -->
    <div v-if="$slots.breadcrumbs" class="page-breadcrumbs q-mb-sm">
      <slot name="breadcrumbs" />
    </div>

    <!-- 页面标题区域：左右紧凑对齐，与概览页和本机页保持统一视觉密度 -->
    <div class="page-header row items-center justify-between q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm page-title-wrapper">
        <h1 class="page-title q-my-none">
          <q-icon v-if="icon" :name="icon" size="20px" class="page-title-icon" />
          <span>{{ title }}</span>
        </h1>
        <p v-if="subtitle" class="page-subtitle q-mt-xs q-mb-none">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="col-12 col-sm-auto page-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  icon?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.page-layout {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 24px 32px;

  .page-header {
    padding-bottom: 14px;
    border-bottom: 1px solid var(--cloud-border, #e2e8f0);
  }

  .page-title-wrapper {
    min-width: 0;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--cloud-text, #0f172a);
    overflow-wrap: anywhere;
  }

  .page-title-icon {
    color: var(--cloud-primary, #2563eb);
    flex-shrink: 0;
  }

  .page-subtitle {
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--cloud-text-muted, #64748b);
    max-width: 72ch;
  }

  .page-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    :deep(> *) {
      flex-wrap: wrap;
      gap: 8px !important;
    }
  }

  .page-content {
    min-height: 0;
  }
}

@media (max-width: 768px) {
  .page-layout {
    padding: 16px 14px 24px;

    .page-title {
      font-size: 18px;
    }
  }
}
</style>
