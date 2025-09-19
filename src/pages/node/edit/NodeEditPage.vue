<template>
  <PageLayout
    :title="$t('nodes.edit.title')"
    :subtitle="node?.node_name || $t('common.loading')"
    icon="edit"
  >
    <template #actions>
      <q-btn
        color="grey-7"
        outline
        @click="goBack"
        :disable="saving"
        icon="arrow_back"
        :label="$t('common.back')"
      />
    </template>

    <div class="row justify-center">
      <div class="col-12">
        <!-- 节点基本信息 -->
        <q-card class="q-mb-md" v-if="node">
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-h6">{{ node.node_name }}</div>
              <div class="text-grey-6">{{ node.node_id }}</div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getStatusColor(node.status || 'inactive')"
                text-color="white"
                :icon="getStatusIcon(node.status || 'inactive')"
              >
                {{ getStatusText(node.status || 'inactive') }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>

        <!-- 编辑标签页 -->
        <q-card>
          <q-tabs
            v-model="activeTab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            dense
            no-caps
          >
            <q-tab name="basic" :label="$t('nodes.edit.tabs.basic')" icon="info" class="tab-item" />
            <q-tab name="network" :label="$t('nodes.edit.tabs.network')" icon="settings_ethernet" class="tab-item" />
            <q-tab name="config" :label="$t('nodes.edit.tabs.config')" icon="settings" class="tab-item" />
            <q-tab name="keys" :label="$t('nodes.edit.tabs.keys')" icon="vpn_key" class="tab-item" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="basic">
              <router-view v-slot="{ Component }">
                <component :is="Component" />
              </router-view>
            </q-tab-panel>

            <q-tab-panel name="network">
              <router-view v-slot="{ Component }">
                <component :is="Component" />
              </router-view>
            </q-tab-panel>

            <q-tab-panel name="config">
              <router-view v-slot="{ Component }">
                <component :is="Component" />
              </router-view>
            </q-tab-panel>

            <q-tab-panel name="keys">
              <router-view v-slot="{ Component }">
                <component :is="Component" />
              </router-view>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>

        <!-- 全局操作按钮 - 在所有编辑子页面都隐藏，因为各页面有自己的保存按钮 -->
        <div 
          class="row q-gutter-sm q-mt-md"
          v-if="!isEditSubPage"
        >
          <q-btn
            color="primary"
            @click="saveAll"
            :loading="saving"
            :disable="!hasChanges"
          >
            <q-icon name="save" class="q-mr-sm" />
            {{ $t('nodes.edit.saveAllChanges') }}
          </q-btn>
          
          <q-btn
            color="grey-7"
            outline
            @click="resetAll"
            :disable="saving || !hasChanges"
          >
            <q-icon name="refresh" class="q-mr-sm" />
            {{ $t('nodes.edit.resetChanges') }}
          </q-btn>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, provide } from 'vue'
import debug from "src/utils/debug"
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useNode, useNotify } from '../../../composables'
import { NodeStatus } from '../../../types/node'
import PageLayout from '../../../components/layout/PageLayout.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 使用组合式函数
const { node, loading, saving, loadNode, updateNode, hasError } = useNode()

// 当前活动的标签页
const activeTab = ref('basic')

// 状态
const hasChanges = ref(false)

// 判断是否在编辑页面（所有编辑子页面都不显示全局按钮）
const isEditSubPage = computed(() => {
  const editPages = ['node-edit-basic', 'node-edit-network', 'node-edit-config', 'node-edit-keys']
  return editPages.includes(route.name as string)
})

// 状态相关工具函数
const getStatusColor = (status: NodeStatus | number) => {
  // 处理数字状态码
  if (typeof status === 'number') {
    switch (status) {
      case 2: return 'positive'  // ONLINE
      case 1: return 'warning'   // ENABLED
      case 0: return 'negative'  // DISABLED
      case -1: return 'grey'     // UNCONFIGURED
      case 99: return 'info'     // MAINTENANCE
      default: return 'grey'
    }
  }
  
  // 处理字符串状态
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'negative'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const getStatusIcon = (status: NodeStatus | number) => {
  // 处理数字状态码
  if (typeof status === 'number') {
    switch (status) {
      case 2: return 'check_circle'      // ONLINE
      case 1: return 'check_circle_outline' // ENABLED
      case 0: return 'cancel'            // DISABLED
      case -1: return 'settings'         // UNCONFIGURED
      case 99: return 'build'            // MAINTENANCE
      default: return 'help'
    }
  }
  
  // 处理字符串状态
  switch (status) {
    case 'active': return 'check_circle'
    case 'inactive': return 'cancel'
    case 'pending': return 'schedule'
    default: return 'help'
  }
}

const getStatusText = (status: NodeStatus | number) => {
  // 处理数字状态码
  if (typeof status === 'number') {
    switch (status) {
      case 2: return t('nodes.status.online')        // ONLINE
      case 1: return t('nodes.status.enabled')      // ENABLED
      case 0: return t('nodes.status.disabled')      // DISABLED
      case -1: return t('nodes.status.unconfigured')     // UNCONFIGURED
      case 99: return t('nodes.status.maintenance')     // MAINTENANCE
      default: return t('common.unknown')
    }
  }
  
  // 处理字符串状态
  switch (status) {
    case 'active': return t('nodes.status.online')
    case 'inactive': return t('nodes.status.offline')
    case 'pending': return t('nodes.status.pending')
    default: return t('common.unknown')
  }
}

// 操作函数
const goBack = () => {
  if (hasChanges.value) {
    $q.dialog({
      title: t('nodes.edit.confirmLeave'),
      message: t('nodes.edit.unsavedChangesMessage'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      router.push(`/nodes/${nodeId.value}`)
    })
  } else {
    router.push(`/nodes/${nodeId.value}`)
  }
}

const saveAll = async () => {
  try {
    // 这里应该触发所有子组件的保存操作
    // 可以通过事件总线或provide/inject实现
    notifySuccess(t('nodes.edit.allChangesSaved'))
    hasChanges.value = false
  } catch (error) {
    debug.error('保存失败:', error)
    notifyError(t('nodes.edit.saveFailed'))
  }
}

const resetAll = () => {
  $q.dialog({
    title: t('nodes.edit.confirmReset'),
    message: t('nodes.edit.resetChangesMessage'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    // 这里应该触发所有子组件的重置操作
    hasChanges.value = false
    notifySuccess(t('common.allChangesReset'))
  })
}

// 监听路由变化更新活动标签
watch(
  () => route.name,
  (newName) => {
    if (typeof newName === 'string') {
      if (newName.includes('basic')) {
        activeTab.value = 'basic'
      } else if (newName.includes('network')) {
        activeTab.value = 'network'
      } else if (newName.includes('config')) {
        activeTab.value = 'config'
      } else if (newName.includes('keys')) {
        activeTab.value = 'keys'
      }
    }
  },
  { immediate: true }
)

// 监听标签页变化更新路由
watch(activeTab, (newTab) => {
  const tabRoutes = {
    basic: 'node-edit-basic',
    network: 'node-edit-network',
    config: 'node-edit-config',
    keys: 'node-edit-keys'
  }
  
  const targetRoute = tabRoutes[newTab as keyof typeof tabRoutes]
  if (targetRoute && route.name !== targetRoute) {
    router.push({ name: targetRoute, params: { id: nodeId.value } })
  }
})

// 组件挂载时加载数据
onMounted(async () => {
  if (nodeId.value) {
    await loadNode(nodeId.value)
  }
})

// 提供节点数据给子组件
provide('nodeData', {
  node,
  loading,
  saving,
  loadNode,
  updateNode,
  hasError
})
</script>

<style scoped lang="scss">
.q-page {
  min-height: calc(100vh - 150px);
}

.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 0;
}

.q-tabs {
  .tab-item {
    padding: 8px 16px;
    min-width: auto;
    flex: 0 0 auto;
    
    &.q-tab--active {
      font-weight: 600;
    }
  }
}
</style>
