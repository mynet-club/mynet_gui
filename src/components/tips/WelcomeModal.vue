<template>
  <q-dialog
    v-model="visible"
    :persistent="!tip.config.closable"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="welcome-modal" :style="cardStyle">
      <!-- 关闭按钮 -->
      <q-btn
        v-if="tip.config.closable"
        flat
        round
        dense
        icon="close"
        class="close-btn"
        @click="handleClose"
      />

      <!-- 标题 -->
      <q-card-section class="modal-header">
        <div class="modal-title" v-html="tip.config.display.title"></div>
      </q-card-section>

      <!-- 内容 -->
      <q-card-section class="modal-content">
        <!-- 文字内容 -->
        <div class="content-text" v-html="tip.config.display.content"></div>

        <!-- 媒体内容 -->
        <div v-if="tip.config.display.media" class="content-media">
          <img
            v-if="tip.config.display.media.type === 'image' || tip.config.display.media.type === 'gif'"
            :src="tip.config.display.media.url"
            :alt="tip.config.display.media.alt || ''"
            class="media-image"
          />
          <video
            v-else-if="tip.config.display.media.type === 'video'"
            :src="tip.config.display.media.url"
            autoplay
            loop
            muted
            class="media-video"
          />
        </div>
      </q-card-section>

      <!-- 进度指示器 -->
      <q-card-section v-if="showProgress" class="modal-progress">
        <div class="progress-info">
          <span>进度: {{ progress }}%</span>
          <span>阶段 {{ currentStageNumber }} / {{ totalStages }}</span>
        </div>
        <q-linear-progress
          :value="progress / 100"
          color="primary"
          class="q-mt-sm"
        />
      </q-card-section>

      <!-- 操作按钮 -->
      <q-card-actions v-if="tip.config.actions && tip.config.actions.length > 0" align="right">
        <q-btn
          v-for="(action, index) in tip.config.actions"
          :key="index"
          :label="action.label"
          :color="action.type === 'primary' ? 'primary' : undefined"
          :flat="action.type === 'text'"
          :unelevated="action.type === 'primary' || action.type === 'secondary'"
          @click="handleAction(action)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useOnboardingStore } from '../../stores/onboarding'
import type { TipInstance, TipAction } from '../../types/tips'

interface Props {
  tip: TipInstance
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [tip: typeof props.tip.config]
  skip: [tip: typeof props.tip.config]
}>()

const onboardingStore = useOnboardingStore()

const visible = ref(props.tip.visible)

/**
 * 监听tip的visible变化
 */
watch(
  () => props.tip.visible,
  (newValue) => {
    visible.value = newValue
  }
)

/**
 * 监听对话框的visible变化
 */
watch(visible, (newValue) => {
  if (!newValue && props.tip.visible) {
    // 对话框被关闭，隐藏tip
    props.tip.hide()
  }
})

/**
 * 卡片样式
 */
const cardStyle = computed(() => {
  return {
    width: props.tip.config.display.width || '500px',
    maxWidth: '90vw',
    maxHeight: props.tip.config.display.maxHeight || '80vh'
  }
})

/**
 * 是否显示进度
 */
const showProgress = computed(() => {
  return onboardingStore.preferences.showProgress
})

/**
 * 进度百分比
 */
const progress = computed(() => {
  return onboardingStore.progress
})

/**
 * 当前阶段编号
 */
const currentStageNumber = computed(() => {
  const stages = Object.keys(onboardingStore.stages)
  const completedCount = Object.values(onboardingStore.stages).filter(Boolean).length
  return completedCount + 1
})

/**
 * 总阶段数
 */
const totalStages = computed(() => {
  return Object.keys(onboardingStore.stages).length
})

/**
 * 处理操作按钮点击
 */
const handleAction = async (action: TipAction) => {
  // 执行处理函数
  if (action.handler) {
    await action.handler()
  }

  // 是否关闭
  if (action.closeOnClick !== false) {
    if (action.isCancel) {
      // 取消按钮 - 跳过
      emit('skip', props.tip.config)
    } else {
      // 其他按钮 - 完成
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
</script>

<style lang="scss" scoped>
.welcome-modal {
  position: relative;

  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
  }

  .modal-header {
    padding-bottom: 0;

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--q-primary);
    }
  }

  .modal-content {
    .content-text {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--q-dark);

      :deep(p) {
        margin-bottom: 1rem;

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

    .content-media {
      margin-top: 1rem;

      .media-image,
      .media-video {
        width: 100%;
        max-width: 100%;
        border-radius: 8px;
      }
    }
  }

  .modal-progress {
    padding-top: 0;

    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--q-dark-page);
      margin-bottom: 0.25rem;
    }
  }
}

// 暗色主题适配
.body--dark {
  .welcome-modal {
    .modal-header .modal-title {
      color: var(--q-primary);
    }

    .modal-content .content-text {
      color: var(--q-dark-page);

      :deep(code) {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
