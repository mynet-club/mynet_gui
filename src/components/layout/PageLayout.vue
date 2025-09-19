<template>
  <div class="page-layout q-pa-md">
    <!-- 页面标题区域 -->
    <div class="page-header q-mb-lg">
      <div class="row items-start">
        <div class="col">
          <div class="page-title-wrapper">
            <h4 class="page-title q-my-none">
              <q-icon v-if="icon" :name="icon" class="q-mr-sm" />
              {{ title }}
            </h4>
            <p v-if="subtitle" class="page-subtitle text-grey-6 q-mt-xs q-mb-none">
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
.page-layout {
  .page-header {
    .page-title {
      font-weight: 600;
      color: var(--q-primary);
      font-size: 1.5rem;
      display: flex;
      align-items: center;
    }
    
    .page-subtitle {
      font-size: 0.875rem;
      line-height: 1.4;
    }
    
    .page-actions {
      .q-btn-group {
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
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
        color: var(--q-primary);
      }
      
      .page-subtitle {
        color: var(--q-grey-5);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .page-layout {
    .page-header {
      .page-title {
        font-size: 1.25rem;
      }
      
      .page-actions {
        .q-btn-group {
          .q-btn {
            .q-btn__content {
              .q-btn__label {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>
