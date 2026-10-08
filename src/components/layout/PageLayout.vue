<template>
  <div class="page-layout q-pa-md">
    <!-- 页面标题区域 -->
    <div class="page-header q-mb-lg">
      <div class="row items-start">
        <div class="col">
          <div class="page-title-wrapper">
            <h1 class="page-title q-my-none">
              <q-icon v-if="icon" :name="icon" class="q-mr-sm" />
              {{ title }}
            </h1>
            <p v-if="subtitle" class="page-subtitle q-mt-xs q-mb-none">
              {{ subtitle }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- 功能区按钮 - 始终在标题下方 -->
      <div v-if="$slots.actions" class="page-actions q-mt-md">
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
@import '../../styles/design-tokens.scss';

.page-layout {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px;

  .page-header {
    .page-title {
      font-weight: $font-weight-semibold;
      color: var(--color-text-primary);
      font-size: $font-size-2xl;
      display: flex;
      align-items: center;
      
      .q-icon {
        color: var(--color-text-secondary);
        opacity: 0.6;
      }
    }
    
    .page-subtitle {
      font-size: $font-size-sm;
      line-height: $line-height-normal;
      color: var(--color-text-secondary);
    }
    
    .page-actions {
      .q-btn-group {
        box-shadow: none;
        border-radius: $radius-base;
      }
    }
  }
  
  .page-content {
    min-height: 0;
  }
}

// 深色模式适配
.body--dark {
  .page-layout {
    .page-header {
      .page-title {
        color: var(--color-text-primary);
      }
      
      .page-subtitle {
        color: var(--color-text-secondary);
      }
    }
  }
}

// Actions wrap without hiding their labels on smaller screens.
.page-actions :deep(> *) {
  flex-wrap: wrap;
  gap: 8px !important;
}

.page-title-wrapper { min-width: 0; }
.page-title { overflow-wrap: anywhere; }
.page-subtitle { max-width: 72ch; }

@media (max-width: 768px) {
  .page-layout {
    padding: 16px;
    .page-header .page-title { font-size: $font-size-xl; }
    .page-actions :deep(.q-btn) { min-height: 40px; }
  }
}
</style>
