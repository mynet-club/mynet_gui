<template>
  <div class="status-display" :class="displayClass">
    <q-icon :name="display.icon" :size="iconSize" />
    <span class="status-text">{{ display.text }}</span>
    <span v-if="showDetail && display.detailText" class="status-detail">
      · {{ display.detailText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getUserFriendlyStatus } from '../../utils/statusMapping'

/**
 * 全站统一的状态显示组件
 * 
 * 核心职责：
 * 1. 统一状态显示样式（三色系统）
 * 2. 替代所有自定义的状态展示逻辑
 * 3. 确保状态文案和视觉的一致性
 * 
 * 使用场景：
 * - 节点列表/详情
 * - 路由列表/详情
 * - 好友节点卡片
 * - Dashboard统计卡片
 */

interface Props {
  /** 节点状态码（NODE_STATUS常量） */
  status: number | string
  
  /** 是否显示详细说明文字 */
  showDetail?: boolean
  
  /** 图标大小 */
  iconSize?: string
  
  /** 显示变体 */
  variant?: 'chip' | 'badge' | 'inline'
}

const props = withDefaults(defineProps<Props>(), {
  showDetail: false,
  iconSize: '14px',
  variant: 'chip'
})

// 获取状态显示配置
const display = computed(() => getUserFriendlyStatus(props.status))

// 计算显示类名
const displayClass = computed(() => {
  return [
    `status-${display.value.semantic}`,
    `variant-${props.variant}`
  ]
})
</script>

<style lang="scss" scoped>
.status-display {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  // Chip 变体（默认，带背景色和圆角）
  &.variant-chip {
    padding: 0.25rem 0.75rem;
    border-radius: var(--soft-radius-full, 999px);
  }
  
  // Badge 变体（紧凑，用于表格等紧密布局）
  &.variant-badge {
    padding: 0.125rem 0.5rem;
    border-radius: var(--soft-radius-sm, 4px);
    font-size: 0.75rem;
  }
  
  // Inline 变体（无背景，用于行内文字）
  &.variant-inline {
    padding: 0;
    background: none !important;
  }
  
  // 可用状态（绿色）
  &.status-available {
    background-color: var(--soft-success-bg, #f0fdf4);
    color: var(--soft-success, #48bb78);
    
    &.variant-inline {
      color: var(--soft-success, #48bb78);
    }
  }
  
  // 待连接状态（橙色）
  &.status-pending {
    background-color: var(--soft-warning-bg, #fffaf0);
    color: var(--soft-warning, #ed8936);
    
    &.variant-inline {
      color: var(--soft-warning, #ed8936);
    }
  }
  
  // 不可用状态（灰色）
  &.status-unavailable {
    background-color: var(--soft-bg-secondary, #e8ecf1);
    color: var(--soft-text-secondary, #718096);
    
    &.variant-inline {
      color: var(--soft-text-secondary, #718096);
    }
  }
  
  // 未知状态（灰色）
  &.status-unknown {
    background-color: var(--soft-bg-secondary, #e8ecf1);
    color: var(--soft-text-tertiary, #a0aec0);
    
    &.variant-inline {
      color: var(--soft-text-tertiary, #a0aec0);
    }
  }
  
  .status-text {
    font-weight: 600;
    white-space: nowrap;
  }
  
  .status-detail {
    font-weight: 400;
    opacity: 0.8;
    white-space: nowrap;
  }
}

// 深色模式适配
.body--dark {
  .status-display {
    &.status-available {
      background-color: rgba(72, 187, 120, 0.15);
      color: #81e6a1;
    }
    
    &.status-pending {
      background-color: rgba(237, 137, 54, 0.15);
      color: #ffa94d;
    }
    
    &.status-unavailable,
    &.status-unknown {
      background-color: rgba(160, 174, 192, 0.15);
      color: #cbd5e0;
    }
  }
}
</style>
