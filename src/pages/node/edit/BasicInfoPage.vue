<template>
  <div class="basic-info-page q-pa-md">
    <div class="text-h6 q-mb-md">基础信息</div>
    
    <q-form @submit="onSubmit" class="q-gutter-md">
      <!-- 节点名称 -->
      <q-input
        v-model="form.node_name"
        label="节点名称"
        outlined
        :rules="[
          val => !!val || '节点名称不能为空',
          val => val.length <= 50 || '节点名称长度不能超过50个字符'
        ]"
        :disable="loading"
      />

      <!-- 节点描述 -->
      <q-input
        v-model="form.description"
        label="节点描述"
        type="textarea"
        rows="4"
        outlined
        :rules="[
          val => !val || val.length <= 500 || '描述长度不能超过500个字符'
        ]"
        :disable="loading"
      />

      <!-- VPN类型 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">VPN类型</div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="type in vpnTypeOptions"
            :key="type.value"
            :color="form.vpn_type === type.value ? 'primary' : 'grey-4'"
            :text-color="form.vpn_type === type.value ? 'white' : 'grey-8'"
            :outline="form.vpn_type !== type.value"
            @click="handleVpnTypeChange(type.value)"
            :disable="loading"
            class="q-px-md"
          >
            <q-icon :name="type.icon" class="q-mr-xs" />
            {{ type.label }}
          </q-btn>
        </div>
      </div>

      <!-- 监听端口 -->
      <q-input
        v-model.number="form.node_port"
        label="监听端口"
        type="number"
        outlined
        :rules="[
          val => !!val || '监听端口不能为空',
          val => val >= 1 && val <= 65535 || '端口范围必须在1-65535之间'
        ]"
        :disable="loading"
      />

      <!-- 软件版本 -->
      <q-input
        v-model="form.node_app_version"
        label="软件版本"
        outlined
        placeholder="例如: v1.0.0"
        :disable="loading"
      />

      <!-- 节点类型 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">节点类型 (可多选)</div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="type in nodeTypeOptions"
            :key="type.value"
            :color="hasNodeType(type.value) ? 'secondary' : 'grey-4'"
            :text-color="hasNodeType(type.value) ? 'white' : 'grey-8'"
            :outline="!hasNodeType(type.value)"
            @click="toggleNodeType(type.value)"
            :disable="loading"
            class="q-px-md"
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
          color="positive"
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

    <!-- 端口切换确认对话框 -->
    <q-dialog v-model="showPortChangeDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="info" color="warning" text-color="white" />
          <span class="q-ml-sm">
            切换VPN类型会影响端口设置
          </span>
        </q-card-section>
        <q-card-section>
          <div>当前端口为 {{ form.node_port }}，是否切换到推荐端口 {{ pendingVpnType ? vpnDefaultPorts[pendingVpnType] : '' }} ？</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="保持当前端口" @click="cancelPortChange" />
          <q-btn
            color="primary"
            label="使用推荐端口"
            @click="confirmPortChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  node_port: 51820,
  node_app_version: '',
  node_type: 0, // 使用数字表示位运算的节点类型
  node_status_active: 'active' as 'active' | 'inactive'
})

// 原始数据（用于比较是否有变化）
const originalData = ref({
  node_name: '',
  description: '',
  vpn_type: '' as VpnType | '',
  node_port: 51820,
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

// VPN类型对应的默认端口
const vpnDefaultPorts: Record<VpnType, number> = {
  gnb: 9001,
  wireguard: 51820,
  openvpn: 1194
}

// 端口变更提醒
const showPortChangeDialog = ref(false)
const pendingVpnType = ref<VpnType | ''>('')

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
      node_port: node.value.node_port || 51820,
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
      ...(form.value.node_port && { node_port: form.value.node_port }),
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
  const currentPort = form.value.node_port
  const recommendedPort = vpnDefaultPorts[newType]
  
  // 如果当前端口为空或为默认值，直接设置推荐端口
  if (!currentPort || currentPort === 51820 || 
      Object.values(vpnDefaultPorts).includes(currentPort)) {
    form.value.vpn_type = newType
    form.value.node_port = recommendedPort
    notifySuccess(`已切换到 ${newType.toUpperCase()}，端口已设置为推荐值 ${recommendedPort}`)
  } else {
    // 如果用户手动设置了端口，提醒是否要切换
    pendingVpnType.value = newType
    showPortChangeDialog.value = true
  }
}

// 确认端口变更
const confirmPortChange = () => {
  if (pendingVpnType.value) {
    const newType = pendingVpnType.value
    const recommendedPort = vpnDefaultPorts[newType]
    form.value.vpn_type = newType
    form.value.node_port = recommendedPort
    notifySuccess(`已切换到 ${newType.toUpperCase()}，端口已更新为推荐值 ${recommendedPort}`)
  }
  showPortChangeDialog.value = false
  pendingVpnType.value = ''
}

// 取消端口变更
const cancelPortChange = () => {
  if (pendingVpnType.value) {
    form.value.vpn_type = pendingVpnType.value
    notifySuccess(`已切换到 ${pendingVpnType.value.toUpperCase()}，保持当前端口 ${form.value.node_port}`)
  }
  showPortChangeDialog.value = false
  pendingVpnType.value = ''
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

<style scoped>
.basic-info-page {
  max-width: 600px;
  margin: 0 auto;
}

.q-form {
  width: 100%;
}
</style>
