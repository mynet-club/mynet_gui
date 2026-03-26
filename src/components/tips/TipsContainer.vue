<template>
  <Teleport to="body">
    <!-- 背景遮罩：区分 tips 和内容 -->
    <Transition name="mask-fade">
      <div
        v-if="activeTips.length > 0"
        class="tips-backdrop"
        @click.self="handleBackdropClick"
      />
    </Transition>

    <div class="tips-container">
      <!-- 遍历所有活跃的Tips -->
      <template v-for="tip in activeTips" :key="tip.config.id">
        <WelcomeModal
          v-if="tip.config.type === 'modal'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />

        <PopoverTip
          v-else-if="tip.config.type === 'popover'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />
        
        <BannerTip
          v-else-if="tip.config.type === 'banner'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTips } from '../../composables/useTips'
import { TipType } from '../../types/tips'
import type { TipInstance, TipConfig } from '../../types/tips'
import WelcomeModal from './WelcomeModal.vue'
import PopoverTip from './PopoverTip.vue'
import BannerTip from './BannerTip.vue'

const { getActiveTips, completeTip, skipTip } = useTips()

/**
 * 活跃的Tips
 */
const activeTips = getActiveTips()  // 直接使用，它已经是computed

/**
 * 处理完成
 */
const handleComplete = (tip: TipConfig) => {
  completeTip(tip)
}

/**
 * 处理跳过
 */
const handleSkip = (tip: TipConfig) => {
  skipTip(tip)
}

/**
 * 点击遮罩：关闭当前可跳过的 tip
 */
const handleBackdropClick = () => {
  const tips = activeTips.value
  if (tips.length > 0) {
    const tip = tips[0]
    if (tip.config.skippable) {
      skipTip(tip.config)
    }
  }
}
</script>

<style lang="scss" scoped>
.tips-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 9990;
  pointer-events: auto;
}

.tips-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;

  > * {
    pointer-events: auto;
  }
}

.mask-fade-enter-active {
  transition: opacity 0.25s ease;
}
.mask-fade-leave-active {
  transition: opacity 0.2s ease;
}
.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}
</style>
