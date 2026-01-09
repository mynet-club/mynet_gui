<template>
  <q-icon 
    :name="icon"
    :size="size"
    :color="color"
    class="context-help-icon"
    @click.stop="handleClick"
  >
    <!-- 简短提示 - 悬停显示 -->
    <q-tooltip v-if="tooltip && !disableTooltip" :delay="300">
      {{ tooltip }}
    </q-tooltip>
    
    <!-- 详细帮助 - 点击弹出 -->
    <q-menu 
      v-if="mode === 'popover'"
      :offset="[0, 8]"
      max-width="400px"
      anchor="bottom middle"
      self="top middle"
    >
      <q-card class="context-help-card">
        <q-card-section v-if="title" class="help-header">
          <div class="text-subtitle2 text-weight-medium">{{ title }}</div>
        </q-card-section>
        
        <q-card-section class="help-content">
          <div v-if="content" v-html="content"></div>
          <slot v-else></slot>
        </q-card-section>
        
        <q-card-actions v-if="link" align="right">
          <q-btn 
            flat 
            dense
            size="sm"
            color="primary" 
            :label="linkText || '了解更多'"
            :href="link"
            target="_blank"
          />
        </q-card-actions>
      </q-card>
    </q-menu>
    
    <!-- Dialog 模式 - 更详细的内容 -->
    <q-dialog v-model="showDialog" v-if="mode === 'dialog'">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ title || '帮助' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="help-content">
          <div v-if="content" v-html="content"></div>
          <slot v-else></slot>
        </q-card-section>

        <q-card-actions v-if="link" align="right">
          <q-btn 
            flat
            color="primary" 
            :label="linkText || '了解更多'"
            :href="link"
            target="_blank"
          />
          <q-btn flat label="关闭" v-close-popup />
        </q-card-actions>
        
        <q-card-actions v-else align="right">
          <q-btn flat label="知道了" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-icon>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  /** 帮助标题 */
  title?: string
  /** 帮助内容（支持 HTML） */
  content?: string
  /** 悬停提示 */
  tooltip?: string
  /** 了解更多链接 */
  link?: string
  /** 链接文本 */
  linkText?: string
  /** 显示模式：popover(弹出卡片) | dialog(对话框) */
  mode?: 'popover' | 'dialog'
  /** 图标名称 */
  icon?: string
  /** 图标大小 */
  size?: string
  /** 图标颜色 */
  color?: string
  /** 禁用 tooltip */
  disableTooltip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'popover',
  icon: 'help_outline',
  size: '16px',
  color: 'grey-6',
  disableTooltip: false
})

const showDialog = ref(false)

const handleClick = () => {
  if (props.mode === 'dialog') {
    showDialog.value = true
  }
  // popover 模式由 q-menu 自动处理
}
</script>

<style lang="scss" scoped>
.context-help-icon {
  cursor: help;
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.context-help-card {
  border-radius: 8px;
  
  .help-header {
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  
  .help-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-secondary);
    
    :deep(p) {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(ul) {
      margin: 8px 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 4px;
      }
    }
    
    :deep(strong) {
      font-weight: 600;
      color: var(--color-text-primary);
    }
    
    :deep(code) {
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
    }
  }
}

.body--dark {
  .context-help-card {
    .help-header {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    
    .help-content {
      :deep(code) {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
