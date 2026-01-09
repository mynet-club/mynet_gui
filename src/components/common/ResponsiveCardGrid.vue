<template>
  <div 
    :class="[
      'responsive-card-grid',
      `grid-${variant}`,
      `gap-${spacing}`,
      { 'loading': loading }
    ]"
  >
    <!-- 加载状态 -->
    <template v-if="loading">
      <div 
        v-for="n in loadingCount" 
        :key="`loading-${n}`" 
        class="card-item"
      >
        <q-card class="standard-card card-loading">
          <q-skeleton height="200px" />
        </q-card>
      </div>
    </template>
    
    <!-- 空状态 -->
    <template v-else-if="!items || items.length === 0">
      <div class="col-12">
        <q-card class="standard-card empty-state-card">
          <q-icon :name="emptyIcon" class="empty-icon" />
          <div class="empty-title">{{ emptyTitle }}</div>
          <div v-if="emptyDescription" class="empty-description">
            {{ emptyDescription }}
          </div>
          <div v-if="$slots.emptyAction" class="q-mt-md">
            <slot name="emptyAction" />
          </div>
        </q-card>
      </div>
    </template>
    
    <!-- 内容渲染 -->
    <template v-else>
      <div 
        v-for="(item, index) in items" 
        :key="getItemKey(item, index)"
        :class="getItemClass(index)"
        class="card-item"
      >
        <transition name="card" appear>
          <q-card 
            :class="[
              'standard-card',
              getCardClass(item, index)
            ]"
            @click="handleCardClick(item, index)"
          >
            <slot 
              :item="item" 
              :index="index"
              :isSelected="isSelected(item, index)"
            />
          </q-card>
        </transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" generic="T = any">
import { computed } from 'vue'

interface Props {
  items: T[]
  loading?: boolean
  loadingCount?: number
  
  // 网格配置
  variant?: 'standard' | 'compact' | 'spacious'
  spacing?: 'tight' | 'normal' | 'loose' | 'xl'
  
  // 空状态
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
  
  // 选择功能
  selectable?: boolean
  selectedItems?: T[]
  
  // 自定义类和键
  itemKey?: string | ((item: T, index: number) => string | number)
  cardClass?: string | ((item: T, index: number) => string)
  itemClass?: string | ((item: T, index: number) => string)
  
  // 点击处理
  clickable?: boolean
}

interface Emits {
  (e: 'card-click', item: T, index: number): void
  (e: 'selection-change', selectedItems: T[]): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingCount: 8,
  variant: 'standard',
  spacing: 'normal',
  emptyIcon: 'inbox',
  emptyTitle: '暂无数据',
  selectable: false,
  clickable: false
})

const emit = defineEmits<Emits>()

// 获取项目唯一标识
const getItemKey = (item: T, index: number): string | number => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item, index)
  }
  if (typeof props.itemKey === 'string' && item && typeof item === 'object') {
    return (item as any)[props.itemKey] || index
  }
  return index
}

// 获取卡片类名
const getCardClass = (item: T, index: number): string => {
  const baseClass = `card-${props.variant}`
  let customClass = ''
  
  if (typeof props.cardClass === 'function') {
    customClass = props.cardClass(item, index)
  } else if (typeof props.cardClass === 'string') {
    customClass = props.cardClass
  }
  
  const clickableClass = props.clickable ? 'cursor-pointer' : ''
  const selectedClass = props.selectable && isSelected(item, index) ? 'card-selected' : ''
  
  return [baseClass, customClass, clickableClass, selectedClass].filter(Boolean).join(' ')
}

// 获取项目容器类名
const getItemClass = (index: number): string => {
  // Quasar 响应式列类
  const responsiveClass = 'col-xs-12 col-sm-6 col-md-4 col-lg-3'
  
  let customClass = ''
  if (typeof props.itemClass === 'function' && props.items[index]) {
    customClass = props.itemClass(props.items[index], index)
  } else if (typeof props.itemClass === 'string') {
    customClass = props.itemClass
  }
  
  return [responsiveClass, customClass].filter(Boolean).join(' ')
}

// 判断是否选中
const isSelected = (item: T, index: number): boolean => {
  if (!props.selectable || !props.selectedItems) return false
  return props.selectedItems.includes(item)
}

// 处理卡片点击
const handleCardClick = (item: T, index: number) => {
  emit('card-click', item, index)
  
  if (props.selectable) {
    const currentSelected = props.selectedItems || []
    let newSelected: T[]
    
    if (isSelected(item, index)) {
      newSelected = currentSelected.filter(selectedItem => selectedItem !== item)
    } else {
      newSelected = [...currentSelected, item]
    }
    
    emit('selection-change', newSelected)
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/design-tokens.scss';

.responsive-card-grid {
  display: grid;
  width: 100%;
  
  /* 标准网格：1-2-3-4 列布局 */
  &.grid-standard {
    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media (min-width: 1440px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  /* 紧凑网格：1-2-4-6 列布局 */
  &.grid-compact {
    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
    }
    
    @media (min-width: 1440px) {
      grid-template-columns: repeat(6, 1fr);
    }
  }
  
  /* 宽松网格：1-1-2-3 列布局 */
  &.grid-spacious {
    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (min-width: 1440px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  /* 间距变体 - 使用 Design Tokens */
  &.gap-tight { gap: $spacing-sm; }       // 8px
  &.gap-normal { gap: $spacing-base; }    // 16px
  &.gap-loose { gap: $spacing-lg; }       // 20px
  &.gap-xl { gap: $spacing-xl; }          // 24px
}

/* 选中状态 */
.card-selected {
  border: 2px solid var(--color-primary);
  box-shadow: var(--shadow-md);
}

/* 可点击状态 */
.cursor-pointer {
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
}
</style>
