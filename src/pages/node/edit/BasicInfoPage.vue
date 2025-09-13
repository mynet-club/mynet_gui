<template>
  <div class="basic-info-page q-pa-md">
    <div class="text-h6 q-mb-md">基础信息</div>
    
    <q-form @submit="onSubmit" class="q-gutter-md">
      <!-- 节点名称 -->
      <q-input
        v-model="form.node_name"
        outlined
        placeholder="节点名称"
        :rules="[
          val => !!val || '节点名称不能为空',
          val => val.length <= 50 || '节点名称长度不能超过50个字符'
        ]"
        :disable="loading"
      />

      <!-- 节点描述 -->
      <q-input
        v-model="form.description"
        type="textarea"
        rows="4"
        outlined
        placeholder="节点描述"
        :rules="[
          val => !val || val.length <= 500 || '描述长度不能超过500个字符'
        ]"
        :disable="loading"
      />

      <!-- VPN类型 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">VPN类型</div>
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
        placeholder="软件版本 (例如: v1.0.0)"
        :disable="loading"
      />

      <!-- 节点类型 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">节点类型 (可多选)</div>
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
          当前选择值: {{ form.node_type }} ({{ getNodeTypeNames() }})
        </div>
      </div>

      <!-- 节点状态 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">节点状态</div>
        <q-toggle
          v-model="form.node_status_active"
          :true-value="'active'"
          :false-value="'inactive'"
          :label="`当前状态: ${form.node_status_active === 'active' ? '激活' : '停用'}`"
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
          保存基础信息
        </q-btn>
        
        <q-btn
          color="grey-7"
          outline
          @click="resetForm"
          :disable="saving || !hasChanges || loading"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          重置
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useNode, useNotify } from '../../../composables'
import { nodeService } from '../../../services/node/nodeService'
import { NodeType, UpdateNodeRequest, VpnType } from '../../../types/node'

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

// 节点类型定义数据
const nodeTypesDefinition = ref<any>(null)

const nodeTypeOptions = ref([
  { label: '边缘节点', value: 1, icon: 'router', key: 'NODE_TYPE_EDGE' },
  { label: '中继节点', value: 2, icon: 'repeat', key: 'NODE_TYPE_RELAY' },
  { label: '网关节点', value: 4, icon: 'router', key: 'NODE_TYPE_GATEWAY' },
  { label: '主节点', value: 8, icon: 'dns', key: 'NODE_TYPE_MASTER' },
  { label: '备用节点', value: 16, icon: 'backup', key: 'NODE_TYPE_BACKUP' },
  { label: '监控节点', value: 32, icon: 'monitor_heart', key: 'NODE_TYPE_MONITOR' },
  { label: '代理节点', value: 64, icon: 'hub', key: 'NODE_TYPE_PROXY' },
  { label: '特殊节点', value: 128, icon: 'star', key: 'NODE_TYPE_SPECIAL' }
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
  return selectedTypes.length > 0 ? selectedTypes.join(', ') : '未选择'
}

// 加载节点类型定义
const loadNodeTypesDefinition = async () => {
  try {
    const response = await nodeService.getNodeTypesDefinition()
    nodeTypesDefinition.value = response.data
  } catch (error) {
    console.error('加载节点类型定义失败:', error)
  }
}

const resetForm = () => {
  form.value = { ...originalData.value }
  notifySuccess('表单已重置')
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
      notifySuccess('基础信息保存成功')
      originalData.value = { ...form.value }
    }
  } catch (error) {
    console.error('保存基础信息失败:', error)
    notifyError('保存失败，请重试')
  }
}

// VPN类型切换处理
const handleVpnTypeChange = (newType: VpnType) => {
  // 直接切换VPN类型，端口配置交给节点配置页面处理
  form.value.vpn_type = newType
  notifySuccess(`已切换到 ${newType.toUpperCase()}，请到节点配置页面设置相关端口`)
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
  // 加载节点类型定义
  await loadNodeTypesDefinition()
  
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
