<template>
  <Teleport to="body">
    <Transition name="banner-slide">
      <div v-if="visible" class="banner-tip-wrapper">
        <div class="banner-tip" :class="{ 'is-expanded': isExpanded }">
          <!-- 收起状态：单行 -->
          <div class="banner-summary" @click="toggleExpand">
            <q-icon name="lightbulb" size="18px" color="amber-8" class="q-mr-sm" />
            <span class="banner-summary-title" v-html="tip.config.display.title"></span>
            <q-space />
            <q-btn
              flat dense round size="xs"
              :icon="isExpanded ? 'expand_less' : 'expand_more'"
              color="grey-7"
              class="q-mr-xs"
            />
            <q-btn
              v-if="tip.config.closable"
              flat dense round size="xs"
              icon="close"
              color="grey-7"
              @click.stop="handleClose"
            />
          </div>

          <!-- 展开状态：详细内容 -->
          <Transition name="expand">
            <div v-if="isExpanded" class="banner-detail">
              <div class="banner-content" v-html="tip.config.display.content"></div>

              <div class="banner-footer">
                <q-checkbox
                  v-model="neverShowAgain"
                  dense
                  size="sm"
                  color="grey-7"
                  class="banner-checkbox"
                >
                  <span class="text-caption text-grey-7">不再显示</span>
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
                  size="sm"
                  dense
                  @click="handleAction(action)"
                />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
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
const isExpanded = ref(false)
const neverShowAgain = ref(false)

watch(
  () => props.tip.visible,
  (newValue) => {
    visible.value = newValue
    if (newValue) {
      isExpanded.value = false
    }
  }
)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleAction = async (action: TipAction) => {
  if (action.handler) {
    await action.handler()
  }

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
  if (neverShowAgain.value) {
    TipsStorage.hideTip(props.tip.config.id)
  }

  if (props.tip.config.skippable) {
    emit('skip', props.tip.config)
  }
  props.tip.hide()
}
</script>

<style lang="scss" scoped>
.banner-tip-wrapper {
  position: fixed;
  top: 52px;
  right: 16px;
  z-index: 9990;
  width: 38%;
  max-width: 420px;
  min-width: 280px;
  pointer-events: auto;
}

.banner-tip {
  background: #fffde7;
  border: 1px solid #ffe082;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.25s ease;

  .banner-summary {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: rgba(255, 224, 130, 0.2);
    }

    .banner-summary-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #5d4037;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      :deep(*) {
        display: inline;
      }
    }
  }

  .banner-detail {
    padding: 0 14px 12px;

    .banner-content {
      font-size: 0.85rem;
      line-height: 1.7;
      color: #6d4c41;

      :deep(p) {
        margin-bottom: 0.4rem;
        &:last-child { margin-bottom: 0; }
      }

      :deep(ul) {
        margin: 0.25rem 0;
        padding-left: 1.25rem;
        li {
          margin-bottom: 0.2rem;
        }
      }

      :deep(strong) {
        font-weight: 600;
        color: #e65100;
      }

      :deep(code) {
        padding: 0.1rem 0.3rem;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.85em;
      }
    }

    .banner-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 224, 130, 0.5);
    }
  }
}

// Transition animations
.banner-slide-enter-active {
  transition: all 0.3s ease;
}
.banner-slide-leave-active {
  transition: all 0.2s ease;
}
.banner-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.expand-enter-active {
  transition: all 0.25s ease;
}
.expand-leave-active {
  transition: all 0.15s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

// Dark theme
.body--dark {
  .banner-tip {
    background: #37474f;
    border-color: #546e7a;

    .banner-summary {
      &:hover { background: rgba(255, 255, 255, 0.05); }
      .banner-summary-title { color: #e0e0e0; }
    }

    .banner-detail {
      .banner-content {
        color: #bdbdbd;
        :deep(strong) { color: #ffb74d; }
        :deep(code) { background: rgba(255, 255, 255, 0.1); }
      }
      .banner-footer {
        border-top-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
