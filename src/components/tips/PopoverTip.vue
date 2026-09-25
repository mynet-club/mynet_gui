<template>
  <Teleport to="body">
    <Transition name="popover-fade">
      <div
        v-if="visible && targetRect"
        class="popover-tip"
        :class="[bubbleClass, { 'is-minimized': isMinimized }]"
        :style="bubbleStyle"
        @click.stop
      >
        <!-- 最小化状态：脉冲圆点 -->
        <div v-if="isMinimized" class="popover-minimized" @click="restore">
          <q-icon name="lightbulb" size="18px" color="white" />
          <q-tooltip>点击查看提示</q-tooltip>
        </div>

        <!-- 展开状态 -->
        <template v-else>
          <!-- 箭头 -->
          <div class="popover-arrow" :class="`arrow-${placement}`" />

          <div class="popover-content">
            <!-- 标题行 -->
            <div class="popover-header">
              <div class="popover-title" v-html="tip.config.display.title"></div>
              <div class="popover-header-actions">
                <q-btn
                  flat round dense size="xs"
                  icon="remove"
                  class="minimize-btn"
                  @click="minimize"
                >
                  <q-tooltip>最小化</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tip.config.closable"
                  flat round dense size="xs"
                  icon="close"
                  class="close-btn"
                  @click="handleClose"
                />
              </div>
            </div>

            <!-- 文字内容 -->
            <div class="popover-text" v-html="tip.config.display.content"></div>

            <!-- 操作按钮 -->
            <div v-if="tip.config.actions && tip.config.actions.length > 0" class="popover-actions">
              <q-btn
                v-for="(action, index) in tip.config.actions"
                :key="index"
                :label="action.label"
                :color="action.type === 'primary' ? 'primary' : undefined"
                :flat="action.type !== 'primary'"
                :unelevated="action.type === 'primary'"
                no-caps
                size="sm"
                dense
                @click="handleAction(action)"
              />
            </div>
          </div>
        </template>
      </div>
    </Transition>

    <!-- 目标元素高亮边框（不遮罩） -->
    <div
      v-if="visible && targetRect && !isMinimized"
      class="popover-highlight"
      :style="highlightStyle"
    />
  </Teleport>
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
const isMinimized = ref(false)
const padding = 6
const borderRadius = 6

let autoMinimizeTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.tip.visible,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      isMinimized.value = false
      updateTargetPosition()
      startAutoMinimize()
    }
  },
  { immediate: true }
)

function getTargetElement(): HTMLElement | null {
  const target = props.tip.config.display.target
  if (!target) return null
  if (typeof target === 'string') {
    return document.querySelector(target) as HTMLElement | null
  }
  return target
}

function updateTargetPosition() {
  try {
    const element = getTargetElement()
    if (element) {
      targetRect.value = element.getBoundingClientRect()
    }
  } catch {
    // Element not found
  }
}

const placement = computed(() => {
  return props.tip.config.display.placement || TipPlacement.Bottom
})

const highlightStyle = computed(() => {
  if (!targetRect.value) return {}
  return {
    left: `${targetRect.value.x - padding}px`,
    top: `${targetRect.value.y - padding}px`,
    width: `${targetRect.value.width + padding * 2}px`,
    height: `${targetRect.value.height + padding * 2}px`,
    borderRadius: `${borderRadius}px`
  }
})

const bubbleStyle = computed(() => {
  if (!targetRect.value) return {}

  if (isMinimized.value) {
    // 最小化时贴在目标元素右上角
    return {
      left: `${targetRect.value.x + targetRect.value.width + 4}px`,
      top: `${targetRect.value.y - 4}px`
    }
  }

  const width = parseInt(props.tip.config.display.width as string) || 360
  const gap = 14

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

  // 边界约束
  const vw = window.innerWidth
  if (left < 12) left = 12
  if (left + width > vw - 12) left = vw - width - 12
  if (top < 12) top = 12

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    maxHeight: props.tip.config.display.maxHeight || '60vh'
  }
})

const bubbleClass = computed(() => `bubble-${placement.value}`)

function startAutoMinimize() {
  clearAutoMinimize()
  const seconds = props.tip.config.trigger.timing?.autoMinimizeAfterSeconds
  if (seconds && seconds > 0) {
    autoMinimizeTimer = setTimeout(() => {
      isMinimized.value = true
    }, seconds * 1000)
  }
}

const clearAutoMinimize = () => {
  if (autoMinimizeTimer) {
    clearTimeout(autoMinimizeTimer)
    autoMinimizeTimer = null
  }
}

const minimize = () => {
  clearAutoMinimize()
  isMinimized.value = true
}

const restore = () => {
  isMinimized.value = false
  updateTargetPosition()
  // 恢复后不再自动最小化
}

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

const handleClose = () => {
  clearAutoMinimize()
  emit(props.tip.config.skippable ? 'skip' : 'complete', props.tip.config)
  visible.value = false
}

const handleResize = () => updateTargetPosition()
const handleScroll = () => updateTargetPosition()

onMounted(() => {
  updateTargetPosition()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  clearAutoMinimize()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style lang="scss" scoped>
.popover-tip {
  position: fixed;
  z-index: 9998;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(var(--q-primary-rgb), 0.25);
  overflow-y: auto;
  transition: all 0.25s ease;

  &.is-minimized {
    border-radius: 50%;
    width: 32px !important;
    height: 32px;
    max-height: 32px !important;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(var(--q-primary-rgb), 0.4);
    cursor: pointer;
    background: var(--q-primary);
  }

  .popover-minimized {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  .popover-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;

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
      top: 20px;
      border-right-color: white;
      border-left: none;
    }

    &.arrow-right {
      left: 100%;
      top: 20px;
      border-left-color: white;
      border-right: none;
    }
  }

  .popover-content {
    padding: 12px 14px;

    .popover-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 8px;

      .popover-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--q-primary);
        line-height: 1.4;
        flex: 1;
      }

      .popover-header-actions {
        display: flex;
        gap: 2px;
        margin-left: 8px;
        flex-shrink: 0;
      }
    }

    .popover-text {
      font-size: 0.875rem;
      line-height: 1.6;
      color: #555;

      :deep(p) {
        margin-bottom: 0.5rem;
        &:last-child { margin-bottom: 0; }
      }

      :deep(ul) {
        margin: 0.25rem 0;
        padding-left: 1.25rem;
        li { margin-bottom: 0.25rem; }
      }

      :deep(strong) {
        font-weight: 600;
        color: var(--q-primary);
      }

      :deep(code) {
        padding: 0.15rem 0.35rem;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.85em;
      }
    }

    .popover-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }
  }
}

// 目标元素高亮（微光背景，不阻止交互）
.popover-highlight {
  position: fixed;
  z-index: 9997;
  background: rgba(var(--q-primary-rgb), 0.06);
  border: 1.5px solid rgba(var(--q-primary-rgb), 0.25);
  pointer-events: none;
  transition: all 0.2s ease;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.popover-fade-enter-active {
  transition: all 0.25s ease;
}
.popover-fade-leave-active {
  transition: all 0.15s ease;
}
.popover-fade-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

// 暗色主题
.body--dark {
  .popover-tip:not(.is-minimized) {
    background: var(--q-dark);
    border-color: rgba(var(--q-primary-rgb), 0.35);

    .popover-arrow {
      &.arrow-top { border-bottom-color: var(--q-dark); }
      &.arrow-bottom { border-top-color: var(--q-dark); }
      &.arrow-left { border-right-color: var(--q-dark); }
      &.arrow-right { border-left-color: var(--q-dark); }
    }

    .popover-content .popover-text {
      color: #bbb;
      :deep(code) { background: rgba(255, 255, 255, 0.1); }
    }
  }

  .popover-highlight {
    border-color: var(--q-primary);
  }
}
</style>
