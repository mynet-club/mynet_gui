<template>
  <Teleport to="body">
    <div class="tips-container">
      <!-- 遍历所有活跃的Tips -->
      <template v-for="tip in activeTips" :key="tip.config.id">
        <WelcomeModal
          v-if="tip.config.type === 'modal'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />
        
        <SpotlightGuide
          v-else-if="tip.config.type === 'spotlight'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />
        
        <TooltipTip
          v-else-if="tip.config.type === 'tooltip'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />
        
        <CardTip
          v-else-if="tip.config.type === 'card'"
          :tip="tip"
          @complete="handleComplete"
          @skip="handleSkip"
        />
        
        <!-- 调试：未匹配的类型 -->
        <div v-else style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: red; color: white; padding: 20px; z-index: 99999;">
          未知的 Tip 类型: {{ tip.config.type }} ({{ tip.config.id }})
        </div>
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
import SpotlightGuide from './SpotlightGuide.vue'
import TooltipTip from './TooltipTip.vue'
import CardTip from './CardTip.vue'

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
</script>

<style lang="scss" scoped>
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
</style>
