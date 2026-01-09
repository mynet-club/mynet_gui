<template>
  <q-btn
    flat 
    dense
    round
    icon="help_outline"
    @click="showDialog = true"
    class="tips-helper"
  >
    <q-badge 
      v-if="availableTipsCount > 0"
      color="primary"
      floating
      :label="availableTipsCount"
    />
    <q-tooltip>查看当前页面帮助</q-tooltip>
    
    <!-- Tips 帮助弹窗 -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="help_outline" size="sm" color="primary" class="q-mr-sm" />
          <div class="text-h6">当前页面帮助</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="availableTips.length === 0" class="text-center text-grey-6 q-py-md">
            <q-icon name="info" size="48px" class="q-mb-md" />
            <div>当前页面暂无可用的操作指引</div>
            <div class="text-caption q-mt-sm">你可以随时点击帮助图标查看其他页面的指引</div>
          </div>

          <q-list v-else>
            <q-item 
              v-for="tip in availableTips" 
              :key="tip.id"
              clickable
              @click="showTipManually(tip.id)"
              class="rounded-borders q-mb-sm"
            >
              <q-item-section avatar>
                <q-avatar :color="getTipTypeColor(tip.type)" text-color="white">
                  <q-icon :name="getTipTypeIcon(tip.type)" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tip.display.title }}</q-item-label>
                <q-item-label caption lines="2" v-html="getPlainText(tip.display.content)" />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="查看"
                  size="sm"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="恢复已隐藏的帮助" 
            color="grey-7"
            icon="restore"
            @click="restoreHiddenTips"
            v-if="hasHiddenTips"
          />
          <q-space />
          <q-btn flat label="关闭" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTips } from '../../composables/useTips'
import { TipType } from '../../types/tips'
import type { TipConfig } from '../../types/tips'
import { useQuasar } from 'quasar'
import { TipsStorage } from '../../utils/tipsStorage'

const route = useRoute()
const { getAvailableTips, showTip } = useTips()
const $q = useQuasar()

// 对话框显示状态
const showDialog = ref(false)

// 获取当前页面可用的 tips
const availableTips = computed(() => {
  return getAvailableTips(route.path)
})

// 可用 tips 数量
const availableTipsCount = computed(() => availableTips.value.length)

// 手动显示某个 tip
const showTipManually = async (tipId: string) => {
  const success = await showTip(tipId, true) // force = true，忽略 once 限制
  if (success) {
    showDialog.value = false
  }
}

// 获取 tip 类型对应的颜色
const getTipTypeColor = (type: TipType): string => {
  switch (type) {
    case TipType.Modal:
      return 'primary'
    case TipType.Spotlight:
      return 'secondary'
    case TipType.Tooltip:
      return 'info'
    case TipType.Card:
      return 'accent'
    default:
      return 'grey'
  }
}

// 获取 tip 类型对应的图标
const getTipTypeIcon = (type: TipType): string => {
  switch (type) {
    case TipType.Modal:
      return 'info'
    case TipType.Spotlight:
      return 'highlight'
    case TipType.Tooltip:
      return 'chat_bubble'
    case TipType.Card:
      return 'article'
    default:
      return 'help'
  }
}

// 从 HTML 内容中提取纯文本
const getPlainText = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

// 检查是否有隐藏的tips
const hasHiddenTips = computed(() => {
  return TipsStorage.hasHiddenTips()
})

// 恢复所有隐藏的tips
const restoreHiddenTips = () => {
  const count = TipsStorage.getHiddenTipsCount()
  $q.dialog({
    title: '恢复帮助提示',
    message: `已隐藏 ${count} 个帮助提示，确定要恢复全部显示吗？`,
    cancel: {
      label: '取消',
      flat: true,
      color: 'grey-7'
    },
    ok: {
      label: '确定',
      unelevated: true,
      color: 'primary'
    },
    persistent: true
  }).onOk(() => {
    TipsStorage.restoreAllTips()
    $q.notify({
      type: 'positive',
      message: `已恢复 ${count} 个帮助提示`,
      position: 'top',
      timeout: 2000
    })
  })
}
</script>

<style lang="scss" scoped>
.tips-helper {
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}
</style>
