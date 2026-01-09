<template>
  <div class="spotlight-overlay" @click="handleOverlayClick">
      <!-- SVG遮罩 - 高亮目标区域 -->
      <svg class="spotlight-mask">
        <defs>
          <mask id="spotlight-mask">
            <!-- 白色背景 -->
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <!-- 黑色高亮区域（镂空） -->
            <rect
              v-if="targetRect"
              :x="targetRect.x - padding"
              :y="targetRect.y - padding"
              :width="targetRect.width + padding * 2"
              :height="targetRect.height + padding * 2"
              :rx="borderRadius"
              fill="black"
            />
          </mask>
        </defs>
        <!-- 应用遮罩 -->
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      <!-- 高亮边框 -->
      <div
        v-if="targetRect"
        class="spotlight-border"
        :style="borderStyle"
      />

      <!-- Tips气泡 -->
      <!-- <Transition name="slide-fade"> -->
        <div
          v-if="targetRect"
          class="spotlight-bubble"
          :class="bubbleClass"
          :style="bubbleStyle"
          @click.stop
        >
          <!-- 箭头 -->
          <div class="bubble-arrow" :class="`arrow-${placement}`" />

          <!-- 内容 -->
          <div class="bubble-content">
            <!-- 标题 -->
            <div class="bubble-title" v-html="tip.config.display.title"></div>

            <!-- 文字 -->
            <div class="bubble-text" v-html="tip.config.display.content"></div>

            <!-- 媒体 -->
            <div v-if="tip.config.display.media" class="bubble-media">
              <img
                v-if="tip.config.display.media.type === 'image' || tip.config.display.media.type === 'gif'"
                :src="tip.config.display.media.url"
                :alt="tip.config.display.media.alt || ''"
                class="media-image"
              />
            </div>

            <!-- 操作按钮 -->
            <div v-if="tip.config.actions && tip.config.actions.length > 0" class="bubble-actions">
              <q-btn
                v-for="(action, index) in tip.config.actions"
                :key="index"
                :label="action.label"
                :color="action.type === 'primary' ? 'primary' : undefined"
                :flat="action.type !== 'primary'"
                size="sm"
                @click="handleAction(action)"
              />
            </div>
          </div>

          <!-- 关闭按钮 -->
          <q-btn
            v-if="tip.config.closable"
            flat
            round
            dense
            size="sm"
            icon="close"
            class="bubble-close"
            @click="handleClose"
          />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { TipInstance, TipAction } from '../../types/tips'
import { TipPlacement } from '../../types/tips'

interface Props {
  tip: TipInstance
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [tip: typeof props.tip.config]
  skip: [tip: typeof props.tip.config]
}>()


const visible = ref(props.tip.visible)
const targetRect = ref<DOMRect | null>(null)

/**
 * 监听tip的visible变化
 */
watch(
  () => props.tip.visible,
  (newValue) => {
    try {
      visible.value = newValue
      if (newValue) {
        updateTargetPosition()
      }
    } catch (error) {
      // Error handling
    }
  },
  { immediate: true }
)

/**
 * 获取目标元素
 */
const getTargetElement = (): HTMLElement | null => {
  const target = props.tip.config.display.target
  
  if (!target) {
    return null
  }
  
  if (typeof target === 'string') {
    const element = document.querySelector(target)
    return element as HTMLElement | null
  }
  
  return target
}

/**
 * 更新目标位置
 */
const updateTargetPosition = () => {
  try {
    const element = getTargetElement()
    if (element) {
      targetRect.value = element.getBoundingClientRect()
    }
  } catch (error) {
    // Error handling
  }
}

/**
 * 计算Tip显示位置
 */
const placement = computed(() => {
  return props.tip.config.display.placement || TipPlacement.Bottom
})

/**
 * 高亮边框样式
 */
const borderStyle = computed(() => {
  if (!targetRect.value) return {}
  
  return {
    left: `${targetRect.value.x - padding}px`,
    top: `${targetRect.value.y - padding}px`,
    width: `${targetRect.value.width + padding * 2}px`,
    height: `${targetRect.value.height + padding * 2}px`,
    borderRadius: `${borderRadius}px`
  }
})

/**
 * 气泡样式
 */
const bubbleStyle = computed(() => {
  if (!targetRect.value) return {}
  
  const width = parseInt(props.tip.config.display.width as string) || 400
  const gap = 16 // 气泡与目标的间距
  
  let left = 0
  let top = 0
  
  switch (placement.value) {
    case TipPlacement.Top:
      left = targetRect.value.x + targetRect.value.width / 2 - width / 2
      top = targetRect.value.y - gap
      break
      
    case TipPlacement.Bottom:
      left = targetRect.value.x + targetRect.value.width / 2 - width / 2
      top = targetRect.value.y + targetRect.value.height + gap
      break
      
    case TipPlacement.Left:
      left = targetRect.value.x - width - gap
      top = targetRect.value.y + targetRect.value.height / 2
      break
      
    case TipPlacement.Right:
      left = targetRect.value.x + targetRect.value.width + gap
      top = targetRect.value.y + targetRect.value.height / 2
      break
      
    default:
      left = targetRect.value.x + targetRect.value.width / 2 - width / 2
      top = targetRect.value.y + targetRect.value.height + gap
  }
  
  // 边界检查
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  if (left < 16) left = 16
  if (left + width > viewportWidth - 16) left = viewportWidth - width - 16
  if (top < 16) top = 16
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    maxHeight: props.tip.config.display.maxHeight || '80vh'
  }
})

/**
 * 气泡CSS类
 */
const bubbleClass = computed(() => {
  return `bubble-${placement.value}`
})

/**
 * 处理操作按钮
 */
const handleAction = async (action: TipAction) => {
  if (action.handler) {
    await action.handler()
  }
  
  if (action.closeOnClick !== false) {
    if (action.isCancel) {
      emit('skip', props.tip.config)
    } else {
      emit('complete', props.tip.config)
    }
    visible.value = false
  }
}

/**
 * 处理关闭
 */
const handleClose = () => {
  if (props.tip.config.skippable) {
    emit('skip', props.tip.config)
  }
  visible.value = false
}

/**
 * 处理遮罩点击
 */
const handleOverlayClick = () => {
  if (props.tip.config.closable) {
    handleClose()
  }
}

/**
 * 窗口大小变化时更新位置
 */
const handleResize = () => {
  updateTargetPosition()
}

/**
 * 滚动时更新位置
 */
const handleScroll = () => {
  updateTargetPosition()
}

onMounted(() => {
  updateTargetPosition()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style lang="scss" scoped>
.spotlight-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: pointer;

  .spotlight-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .spotlight-border {
    position: absolute;
    border: 2px solid var(--q-primary);
    box-shadow: 0 0 0 4px rgba(var(--q-primary-rgb), 0.2);
    pointer-events: none;
    animation: pulse 2s ease-in-out infinite;
  }

  .spotlight-bubble {
    position: absolute;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    padding: 1.5rem;
    cursor: default;
    overflow-y: auto;

    .bubble-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 10px solid transparent;

      &.arrow-top {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: white;
        border-top: none;
      }

      &.arrow-bottom {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: white;
        border-bottom: none;
      }

      &.arrow-left {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: white;
        border-left: none;
      }

      &.arrow-right {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: white;
        border-right: none;
      }
    }

    .bubble-content {
      .bubble-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--q-primary);
        margin-bottom: 0.75rem;
      }

      .bubble-text {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--q-dark);
        margin-bottom: 1rem;

        :deep(p) {
          margin-bottom: 0.75rem;

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(ul) {
          margin: 0.5rem 0;
          padding-left: 1.5rem;

          li {
            margin-bottom: 0.5rem;
          }
        }

        :deep(strong) {
          font-weight: 600;
          color: var(--q-primary);
        }

        :deep(code) {
          padding: 0.2rem 0.4rem;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
      }

      .bubble-media {
        margin-top: 1rem;
        margin-bottom: 1rem;

        .media-image {
          width: 100%;
          border-radius: 8px;
        }
      }

      .bubble-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }
    }

    .bubble-close {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }
}

// 动画
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(var(--q-primary-rgb), 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--q-primary-rgb), 0.4);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

// 暗色主题
.body--dark {
  .spotlight-bubble {
    background: var(--q-dark);
    color: var(--q-dark-page);

    .bubble-arrow {
      &.arrow-top {
        border-bottom-color: var(--q-dark);
      }

      &.arrow-bottom {
        border-top-color: var(--q-dark);
      }

      &.arrow-left {
        border-right-color: var(--q-dark);
      }

      &.arrow-right {
        border-left-color: var(--q-dark);
      }
    }

    .bubble-content .bubble-text {
      :deep(code) {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
