<template>
  <div class="basic-info-page q-pa-md">
    <div class="text-h6 q-mb-md">{{ $t('nodes.edit.tabs.basic') }}</div>
    
    <q-form @submit="onSubmit" class="q-gutter-md">
      <!-- 节点名称 -->
      <q-input
        v-model="form.node_name"
        outlined
        :placeholder="$t('nodes.detail.nodeName')"
        :rules="[
          val => !!val || $t('nodes.edit.basic.nameRequired'),
          val => val.length <= 50 || $t('nodes.edit.basic.nameMaxLength')
        ]"
        :disable="loading"
      />

      <!-- 节点描述 -->
      <q-input
        v-model="form.description"
        type="textarea"
        rows="4"
        outlined
        :placeholder="$t('nodes.fields.description')"
        :rules="[
          val => !val || val.length <= 500 || $t('nodes.edit.basic.descriptionMaxLength')
        ]"
        :disable="loading"
      />

      <!-- VPN类型 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">{{ $t('nodes.detail.vpnType') }}</div>
        <div class="vpn-type-buttons">
          <q-btn
            v-for="type in vpnTypeOptions"
            :key="type.value"
            :color="form.vpn_type === type.value ? 'primary' : 'grey-5'"
            :text-color="form.vpn_type === type.value ? 'white' : 'dark'"
            :unelevated="form.vpn_type === type.value"
            :outline="form.vpn_type !== type.value"
            @click="handleVpnTypeChange(type.value)"
            :disable="loading"
            size="sm"
            class="vpn-type-btn"
          >
            <q-icon :name="type.icon" class="q-mr-xs" />
            {{ type.label }}
          </q-btn>
        </div>
      </div>

      <!-- 软件版本 -->
      <q-input
        v-model="form.node_app_version"
        outlined
        :label="$t('nodes.detail.appVersion')"
        :placeholder="$t('nodes.edit.basic.versionPlaceholder')"
        :disable="loading"
      />

      <!-- 节点类型 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">{{ $t('nodes.edit.basic.nodeTypeMultiSelect') }}</div>
        <div class="node-type-buttons">
          <q-btn
            v-for="type in nodeTypeOptions"
            :key="type.value"
            :color="hasNodeType(type.value) ? 'primary' : 'grey-5'"
            :text-color="hasNodeType(type.value) ? 'white' : 'dark'"
            :unelevated="hasNodeType(type.value)"
            :outline="!hasNodeType(type.value)"
            @click="toggleNodeType(type.value)"
            :disable="loading"
            size="sm"
            class="node-type-btn"
          >
            <q-icon :name="type.icon" class="q-mr-xs" />
            {{ type.label }}
          </q-btn>
        </div>
        <div class="text-caption text-grey-6 q-mt-sm">
          {{ $t('nodes.edit.basic.currentSelection') }}: {{ form.node_type }} ({{ getNodeTypeNames() }})
        </div>
      </div>

      <!-- 节点状态 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">{{ $t('nodes.detail.status') }}</div>
        <q-toggle
          v-model="form.node_status_active"
          :true-value="'active'"
          :false-value="'inactive'"
          :label="$t('nodes.edit.basic.currentStatus', { status: form.node_status_active === 'active' ? $t('common.active') : $t('common.inactive') })"
          color="primary"
          :disable="loading"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="row q-gutter-sm q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          :loading="saving"
          :disable="!hasChanges || loading"
        >
          <q-icon name="save" class="q-mr-sm" />
          {{ $t('nodes.edit.basic.saveBasicInfo') }}
        </q-btn>
        
        <q-btn
          color="grey-7"
          outline
          @click="resetForm"
          :disable="saving || !hasChanges || loading"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          {{ $t('common.reset') }}
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue'
import debug from "src/utils/debug"
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNode, useNotify } from '../../../composables'
import { nodeService } from '../../../services/node/nodeService'
import { NodeType, UpdateNodeRequest, VpnType } from '../../../types/node'

const { t } = useI18n()
const route = useRoute()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 尝试从父组件注入节点数据
const injectedNodeData = inject<any>('nodeData', null)

// 使用组合式函数 (如果没有注入的数据，则创建新的)
const { node, loading, saving, loadNode, updateNode } = injectedNodeData || useNode()

// 表单数据
const form = ref({
  node_name: '',
  description: '',
  vpn_type: '' as VpnType | '',
  node_app_version: '',
  node_type: 0, // 使用数字表示位运算的节点类型
  node_status_active: 'active' as 'active' | 'inactive'
})

// 原始数据（用于比较是否有变化）
const originalData = ref({
  node_name: '',
  description: '',
  vpn_type: '' as VpnType | '',
  node_app_version: '',
  node_type: 0, // 使用数字表示位运算的节点类型
  node_status_active: 'active' as 'active' | 'inactive'
})

// 选项数据
const vpnTypeOptions = ref([
  { label: 'GNB', value: 'gnb' as VpnType, icon: 'hub' },
  { label: 'WireGuard', value: 'wireguard' as VpnType, icon: 'vpn_key' },
  { label: 'OpenVPN', value: 'openvpn' as VpnType, icon: 'security' }
])

const nodeTypeOptions = computed(() => [
  { label: t('nodes.edit.basic.nodeTypes.edge'), value: 1, icon: 'router', key: 'NODE_TYPE_EDGE' },
  { label: t('nodes.edit.basic.nodeTypes.relay'), value: 2, icon: 'repeat', key: 'NODE_TYPE_RELAY' },
  { label: t('nodes.edit.basic.nodeTypes.gateway'), value: 4, icon: 'router', key: 'NODE_TYPE_GATEWAY' },
  { label: t('nodes.edit.basic.nodeTypes.master'), value: 8, icon: 'dns', key: 'NODE_TYPE_MASTER' },
  { label: t('nodes.edit.basic.nodeTypes.backup'), value: 16, icon: 'backup', key: 'NODE_TYPE_BACKUP' },
  { label: t('nodes.edit.basic.nodeTypes.monitor'), value: 32, icon: 'monitor_heart', key: 'NODE_TYPE_MONITOR' },
  { label: t('nodes.edit.basic.nodeTypes.proxy'), value: 64, icon: 'hub', key: 'NODE_TYPE_PROXY' },
  { label: t('nodes.edit.basic.nodeTypes.special'), value: 128, icon: 'star', key: 'NODE_TYPE_SPECIAL' }
])

const tagOptions = ref([
  'production',
  'development',
  'test',
  'monitoring',
  'gateway',
  'server',
  'client'
])

// 计算属性
const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalData.value)
})
const initializeForm = () => {
  if (node.value) {
    // 处理节点状态：数字1为active，数字0为inactive，字符串直接使用
    let nodeStatus: 'active' | 'inactive' = 'active'
    if (node.value.node_status !== undefined) {
      if (typeof node.value.node_status === 'number') {
        nodeStatus = node.value.node_status === 1 ? 'active' : 'inactive'
      } else if (typeof node.value.node_status === 'string') {
        nodeStatus = node.value.node_status as 'active' | 'inactive'
      }
    } else if (node.value.status !== undefined) {
      if (typeof node.value.status === 'number') {
        nodeStatus = node.value.status === 1 ? 'active' : 'inactive'
      } else if (typeof node.value.status === 'string') {
        nodeStatus = node.value.status as 'active' | 'inactive'
      }
    }

    const data = {
      node_name: node.value.node_name || '',
      description: node.value.description || '',
      vpn_type: (node.value.vpn_type || '') as VpnType | '',
      node_app_version: node.value.node_app_version || '',
      node_type: typeof node.value.node_type === 'number' ? node.value.node_type : 0,
      node_status_active: nodeStatus
    }
    
    form.value = { ...data }
    originalData.value = { ...data }
  }
}

// 位运算相关方法
const hasNodeType = (typeValue: number): boolean => {
  return (form.value.node_type & typeValue) !== 0
}

const toggleNodeType = (typeValue: number) => {
  if (hasNodeType(typeValue)) {
    // 移除这个类型 (使用异或运算)
    form.value.node_type = form.value.node_type ^ typeValue
  } else {
    // 添加这个类型 (使用或运算)
    form.value.node_type = form.value.node_type | typeValue
  }
}

const getNodeTypeNames = (): string => {
  const selectedTypes = nodeTypeOptions.value
    .filter(type => hasNodeType(type.value))
    .map(type => type.label)
  return selectedTypes.length > 0 ? selectedTypes.join(', ') : t('nodes.edit.basic.noSelection')
}

const resetForm = () => {
  form.value = { ...originalData.value }
  notifySuccess(t('nodes.edit.basic.formReset'))
}

const onSubmit = async () => {
  try {
    const updateData: UpdateNodeRequest = {
      node_name: form.value.node_name,
      ...(form.value.description && { description: form.value.description }),
      ...(form.value.vpn_type && { vpn_type: form.value.vpn_type }),
      ...(form.value.node_app_version && { node_app_version: form.value.node_app_version }),
      ...(form.value.node_type > 0 && { node_type: form.value.node_type }),
      ...(form.value.node_status_active && { node_status: form.value.node_status_active })
    }

    const success = await updateNode(updateData)
    if (success) {
      notifySuccess(t('nodes.edit.basic.basicInfoSaved'))
      originalData.value = { ...form.value }
    }
  } catch (error) {
    debug.error('保存基础信息失败:', error)
    notifyError(t('nodes.edit.basic.saveFailed'))
  }
}

// VPN类型切换处理
const handleVpnTypeChange = (newType: VpnType) => {
  // 直接切换VPN类型，端口配置交给节点配置页面处理
  form.value.vpn_type = newType
  notifySuccess(t('nodes.edit.basic.vpnTypeSwitched', { type: newType.toUpperCase() }))
}

// 监听节点数据变化
watch(
  () => node.value,
  (newNode) => {
    if (newNode) {
      initializeForm()
    }
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(async () => {
  // 如果使用了注入的数据并且节点已经存在，直接初始化表单
  if (injectedNodeData && node.value) {
    initializeForm()
  } 
  // 如果没有注入的数据，则需要加载节点数据
  else if (!injectedNodeData && nodeId.value) {
    await loadNode(nodeId.value)
  }
})
</script>

<style scoped lang="scss">
.basic-info-page {
  max-width: 600px;
  margin: 0 auto;
}

.q-form {
  width: 100%;
}
</style>
