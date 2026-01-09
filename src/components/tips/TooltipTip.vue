<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible && targetRect"
        class="tooltip-tip"
        :class="tooltipClass"
        :style="tooltipStyle"
      >
        <!-- 箭头 -->
        <div class="tooltip-arrow" :class="`arrow-${placement}`" />

        <!-- 内容 -->
        <div class="tooltip-content" v-html="tip.config.display.content"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { TipInstance } from '../../types/tips'
import { TipPlacement } from '../../types/tips'

interface Props {
  tip: TipInstance
}

const props = defineProps<Props>()

const visible = ref(props.tip.visible)
const targetRect = ref<DOMRect | null>(null)

watch(
  () => props.tip.visible,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      updateTargetPosition()
    }
  },
  { immediate: true }
)

const getTargetElement = (): HTMLElement | null => {
  const target = props.tip.config.display.target
  if (!target) return null
  if (typeof target === 'string') {
    return document.querySelector(target)
  }
  return target
}

const updateTargetPosition = () => {
  const element = getTargetElement()
  if (element) {
    targetRect.value = element.getBoundingClientRect()
  }
}

const placement = computed(() => {
  return props.tip.config.display.placement || TipPlacement.Top
})

const tooltipStyle = computed(() => {
  if (!targetRect.value) return {}
  
  const gap = 12
  let left = 0
  let top = 0
  
  switch (placement.value) {
    case TipPlacement.Top:
      left = targetRect.value.x + targetRect.value.width / 2
      top = targetRect.value.y - gap
      break
      
    case TipPlacement.Bottom:
      left = targetRect.value.x + targetRect.value.width / 2
      top = targetRect.value.y + targetRect.value.height + gap
      break
      
    case TipPlacement.Left:
      left = targetRect.value.x - gap
      top = targetRect.value.y + targetRect.value.height / 2
      break
      
    case TipPlacement.Right:
      left = targetRect.value.x + targetRect.value.width + gap
      top = targetRect.value.y + targetRect.value.height / 2
      break
  }
  
  return {
    left: `${left}px`,
    top: `${top}px`
  }
})

const tooltipClass = computed(() => {
  return `tooltip-${placement.value}`
})

const handleResize = () => {
  updateTargetPosition()
}

const handleScroll = () => {
  updateTargetPosition()
}

onMounted(() => {
  updateTargetPosition()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
  
  // 自动隐藏
  if (props.tip.config.trigger.delay) {
    setTimeout(() => {
      props.tip.hide()
    }, props.tip.config.trigger.delay + 3000)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style lang="scss" scoped>
.tooltip-tip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  max-width: 250px;
  z-index: 9999;
  pointer-events: none;

  &.tooltip-top {
    transform: translate(-50%, -100%);
  }

  &.tooltip-bottom {
    transform: translate(-50%, 0);
  }

  &.tooltip-left {
    transform: translate(-100%, -50%);
  }

  &.tooltip-right {
    transform: translate(0, -50%);
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;

    &.arrow-top {
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: rgba(0, 0, 0, 0.85);
      border-bottom: none;
    }

    &.arrow-bottom {
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: rgba(0, 0, 0, 0.85);
      border-top: none;
    }

    &.arrow-left {
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: rgba(0, 0, 0, 0.85);
      border-right: none;
    }

    &.arrow-right {
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: rgba(0, 0, 0, 0.85);
      border-left: none;
    }
  }

  .tooltip-content {
    line-height: 1.4;
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
</style>
