<template>
  <Transition name="slide-down">
    <div v-if="visible" class="tip-wrapper">
      <!-- 内容遮罩层 -->
      <div class="content-mask" @click="handleMaskClick"></div>
      
      <q-card class="card-tip" :class="tip.config.display.class" bordered>
        <!-- Tips标识头部 -->
        <div class="tip-header">
          <q-icon name="lightbulb" size="20px" class="tip-header-icon" />
          <span class="tip-header-text">💡 操作提示</span>
        </div>

        <!-- 关闭按钮 -->
        <q-btn
          v-if="tip.config.closable"
          flat
          round
          dense
          size="sm"
          icon="close"
          class="close-btn"
          @click="handleClose"
        />

        <q-card-section class="tip-main-content">
          <!-- 标题 -->
          <div class="tip-title" v-html="tip.config.display.title"></div>

          <!-- 内容 -->
          <div class="tip-content" v-html="tip.config.display.content"></div>

          <!-- 操作按钮 -->
          <div v-if="tip.config.actions && tip.config.actions.length > 0" class="tip-actions">
            <!-- 不再显示选项 -->
            <q-checkbox
              v-model="neverShowAgain"
              dense
              size="sm"
              color="grey-7"
              class="tip-checkbox"
            >
              <span class="text-caption text-grey-7">不再显示本帮助</span>
            </q-checkbox>
            
            <q-space />
            
            <q-btn
              v-for="(action, index) in tip.config.actions"
              :key="index"
              :label="action.label"
              :color="action.type === 'primary' ? 'primary' : undefined"
              :flat="action.type !== 'primary'"
              :unelevated="action.type === 'primary'"
              no-caps
              size="md"
              @click="handleAction(action)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TipInstance, TipAction } from '../../types/tips'
import { TipsStorage } from '../../utils/tipsStorage'

interface Props {
  tip: TipInstance
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [tip: typeof props.tip.config]
  skip: [tip: typeof props.tip.config]
}>()

const visible = ref(props.tip.visible)
const neverShowAgain = ref(false)

watch(
  () => props.tip.visible,
  (newValue) => {
    visible.value = newValue
  }
)

const handleAction = async (action: TipAction) => {
  if (action.handler) {
    await action.handler()
  }
  
  // 保存不再显示状态
  if (neverShowAgain.value) {
    TipsStorage.hideTip(props.tip.config.id)
  }
  
  if (action.closeOnClick !== false) {
    if (action.isCancel) {
      emit('skip', props.tip.config)
    } else {
      emit('complete', props.tip.config)
    }
    props.tip.hide()
  }
}

const handleClose = () => {
  // 保存不再显示状态
  if (neverShowAgain.value) {
    TipsStorage.hideTip(props.tip.config.id)
  }
  
  if (props.tip.config.skippable) {
    emit('skip', props.tip.config)
  }
  props.tip.hide()
}

const handleMaskClick = () => {
  // 点击遮罩不做任何操作，只是让遮罩可点击但不关闭
  // 用户必须通过关闭按钮或操作按钮来关闭tips
}
</script>

<style lang="scss" scoped>
.tip-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  pointer-events: none;
}

.content-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  pointer-events: auto;
  animation: maskFadeIn 0.3s ease;
}

@keyframes maskFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.card-tip {
  position: relative;
  width: auto;
  min-width: 400px;
  max-width: 700px;
  border-radius: 16px;
  overflow: hidden;
  background: #fffbea;
  border: 3px solid #ffd93d;
  box-shadow: 0 8px 32px rgba(255, 193, 7, 0.35);
  pointer-events: auto;
  animation: tipSlideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes tipSlideDown {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  // Tips标识头部
  .tip-header {
    background: linear-gradient(135deg, #ffd93d 0%, #ffb800 100%);
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 2px solid #ffb800;

    .tip-header-icon {
      color: #fff;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .tip-header-text {
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.5px;
    }
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.95);
    color: #666;
    
    &:hover {
      background: white;
      color: #333;
    }
  }

  .tip-main-content {
    padding: 1.5rem;
    background: #fffbea;
  }

  .tip-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #6b5200;
    margin-bottom: 1rem;
  }

  .tip-content {
    font-size: 0.95rem;
    line-height: 1.8;
    color: #7a6400;

    :deep(p) {
      margin-bottom: 0.875rem;

      &:last-child {
        margin-bottom: 0;
      }

      strong {
        color: #ff9800;
        font-weight: 600;
      }
    }

    :deep(ul) {
      margin: 1rem 0;
      padding-left: 2rem;
      list-style: none;

      li {
        margin-bottom: 0.75rem;
        position: relative;
        padding-left: 0.5rem;

        &::before {
          content: '•';
          position: absolute;
          left: -1rem;
          color: #ff9800;
          font-weight: bold;
          font-size: 1.2em;
        }

        strong {
          color: #ff9800;
          font-weight: 600;
        }
      }
    }

    :deep(strong) {
      font-weight: 600;
      color: #ff9800;
    }
  }
  
  .tip-checkbox {
    margin-top: 1rem;
    padding: 0.5rem 0;
  }

  .tip-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(255, 184, 0, 0.2);
  }
}

.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.slide-down-enter-from {
  opacity: 0;
}

.slide-down-leave-to {
  opacity: 0;
}

// 暗色主题
.body--dark {
  .content-mask {
    background: rgba(0, 0, 0, 0.5);
  }

  .card-tip {
    background: #2d2600;
    border-color: #ffb800;
    box-shadow: 0 8px 32px rgba(255, 184, 0, 0.25);

    .tip-header {
      background: linear-gradient(135deg, #ffb800 0%, #ff9800 100%);
    }

    .close-btn {
      background: rgba(45, 38, 0, 0.95);
      color: #ffb800;
      
      &:hover {
        background: #2d2600;
        color: #ffd93d;
      }
    }

    .tip-main-content {
      background: #2d2600;
    }

    .tip-title {
      color: #ffd93d;
    }

    .tip-content {
      color: #e6d39a;

      :deep(p) {
        strong {
          color: #ffb800;
        }
      }

      :deep(ul li) {
        &::before {
          color: #ffb800;
        }

        strong {
          color: #ffb800;
        }
      }

      :deep(strong) {
        color: #ffb800;
      }
    }

    .tip-actions {
      border-top-color: rgba(255, 184, 0, 0.2);
    }
  }
}
</style>
