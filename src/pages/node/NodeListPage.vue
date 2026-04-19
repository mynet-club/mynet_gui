<template>
  <PageLayout
    :title="$t('nodes.title')"
    :subtitle="$t('nodes.subtitle')"
    icon="device_hub"
  >
    <template #actions>
      <q-btn-group>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          :label="$t('nodes.createNode')"
          data-tip-target="add-device-btn"
          @click="goToCreate"
          :disable="loading"
        />
        <q-btn
          unelevated
          color="secondary"
          icon="bolt"
          :label="$t('nodes.quickCreate')"
          @click="showQuickCreateDialog = true"
          :disable="loading"
        />
        <q-btn
          flat
          color="grey-7"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="refreshNodes"
          :loading="loading"
        />
      </q-btn-group>
    </template>

    <!-- 节点列表 - 卡片布局 -->
    <ResponsiveCardGrid
      :items="filteredNodes"
      :loading="loading"
      variant="standard"
      spacing="loose"
      empty-icon="device_hub"
      :empty-title="$t('nodes.noData')"
      :empty-description="$t('nodes.noDataDescription')"
      @item-click="goToDetail($event.node_id)"
    >
      <template #default="{ item: node }">
        <NodeCardContent
          :node="transformNode(node)"
          @connect="handleConnect(node)"
          @enable="handleEnable(node)"
          @disable="handleDisable(node)"
          @configure="goToEdit(node.node_id)"
          @view-details="goToDetail(node.node_id)"
          @edit="goToEdit(node.node_id)"
          @start="handleStart(node)"
          @stop="handleStop(node)"
          @restart="handleRestart(node)"
          @delete="confirmDelete(node)"
        />
      </template>

      <template #emptyAction>
        <q-btn
          color="primary"
          @click="goToCreate"
          class="q-mt-md"
        >
          <q-icon name="add" class="q-mr-sm" />
          {{ $t('nodes.createFirstNode') }}
        </q-btn>
      </template>
    </ResponsiveCardGrid>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            {{ $t('nodes.deleteConfirm', { name: nodeToDelete?.node_name }) }}
          </span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('nodes.deleteCancel')" v-close-popup />
          <q-btn
            flat
            :label="$t('nodes.deleteConfirmAction')"
            color="negative"
            @click="deleteNode"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 一键快速创建对话框 -->
    <q-dialog v-model="showQuickCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="bolt" class="q-mr-sm" color="secondary" />
            {{ $t('nodes.quickCreateTitle') }}
          </div>
          <div class="text-caption text-grey q-mt-sm">{{ $t('nodes.quickCreateDesc') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="quickCreateName"
            :label="$t('nodes.name')"
            :placeholder="$t('nodes.namePlaceholder')"
            outlined
            autofocus
            :rules="[val => (!!val && val.trim().length >= 3) || $t('nodes.nameMinLength')]"
            @keyup.enter="handleQuickCreate"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup :disable="quickCreating" />
          <q-btn
            unelevated
            color="secondary"
            icon="bolt"
            :label="$t('nodes.quickCreate')"
            @click="handleQuickCreate"
            :loading="quickCreating"
            :disable="!quickCreateName || quickCreateName.trim().length < 3"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import NodeCardContent from '../../components/node/NodeCardContent.vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import { useNodes, useNotify } from '../../composables'
import { Node, NodeStatus, NODE_STATUS, NodeStatusInfo, NodeDeviceInfo } from '../../types/node'
import { nodeService } from '../../services/node/nodeService'
import { NodeStatusManager, normalizeNodeStatus } from '../../utils/nodeStatus'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const { success: notifySuccess, error: notifyError } = useNotify()

// 使用组合式函数
const { nodes, loading, loadNodes, deleteNode: removeNode } = useNodes()

// 删除确认
const showDeleteDialog = ref(false)
const nodeToDelete = ref<Node | null>(null)
const deleting = ref(false)

// 一键快速创建
const showQuickCreateDialog = ref(false)
const quickCreateName = ref('')
const quickCreating = ref(false)

// 状态切换
const statusChanging = ref<Record<string | number, boolean>>({})

// 节点状态信息管理
const nodeStatusInfo = ref<Record<string | number, NodeStatusInfo>>({})
const loadingStatusInfo = ref<Record<string | number, boolean>>({})

// 节点设备信息管理
const nodeDeviceInfo = ref<Record<string | number, NodeDeviceInfo>>({})
const loadingDeviceInfo = ref<Record<string | number, boolean>>({})

// 加载节点状态信息
const loadNodeStatusInfo = async (nodeId: string | number) => {
  if (loadingStatusInfo.value[nodeId] || nodeStatusInfo.value[nodeId]) {
    return // 避免重复加载
  }

  try {
    loadingStatusInfo.value[nodeId] = true
  try {
    const response = await nodeService.getNodeStatusInfo(String(nodeId))
    debug.log('节点状态信息获取成功:', response)
  } catch (error: any) {
    // status-info API 可能不存在，静默处理404错误
    if (error?.response?.status !== 404) {
      debug.error('获取节点状态信息失败:', error)
    }
  }
    nodeStatusInfo.value[nodeId] = response.data
  } catch (error) {
    debug.error(`获取节点 ${nodeId} 状态信息失败:`, error)
  } finally {
    loadingStatusInfo.value[nodeId] = false
  }
}

// 检查并加载未配置节点的状态信息
const checkAndLoadUnconfiguredNodes = async () => {
  const unconfiguredNodes = nodes.value.filter(isUnconfiguredNode)
  
  // 并发加载所有未配置节点的状态信息
  const loadPromises = unconfiguredNodes.map(node => 
    loadNodeStatusInfo(node.node_id)
  )
  
  await Promise.allSettled(loadPromises)
}

// 批量加载所有节点的设备信息（用于显示操作系统信息）
const loadAllNodesDeviceInfo = async () => {
  // 过滤出还没有加载设备信息的节点
  const nodesToLoad = nodes.value.filter(node => 
    !nodeDeviceInfo.value[node.node_id] && !loadingDeviceInfo.value[node.node_id]
  )
  
  if (nodesToLoad.length === 0) {
    return // 所有节点信息已加载
  }
  
  const nodeIds = nodesToLoad.map(node => node.node_id)
  
  try {
    // 批量标记为加载中
    nodeIds.forEach(id => {
      loadingDeviceInfo.value[id] = true
    })
    
    const response = await nodeService.getBatchNodeDeviceInfo(nodeIds)
    
    if (response.success && response.data.devices) {
      // 将批量获取的设备信息存储到对应的节点
      response.data.devices.forEach(item => {
        if (item.exists && item.device_info) {
          nodeDeviceInfo.value[item.node_id] = item.device_info
        }
      })
    }
  } catch (error) {
    debug.error('批量获取节点设备信息失败:', error)
  } finally {
    // 清除加载状态
    nodeIds.forEach(id => {
      loadingDeviceInfo.value[id] = false
    })
  }
}

// 计算属性
const filteredNodes = computed(() => {
  return [...(nodes.value || [])].map(node => {
    // 合并设备信息到节点
    const deviceInfo = nodeDeviceInfo.value[node.node_id]
    if (deviceInfo) {
      return {
        ...node,
        // 设备信息字段
        os_name: deviceInfo.os_name || node.os_name,
        os_version: deviceInfo.os_version || node.os_version,
        architecture: deviceInfo.architecture || node.architecture,
        cpu_arch: deviceInfo.cpu_arch || node.cpu_arch,
        system_arch: deviceInfo.system_arch || node.system_arch,
        public_ip: deviceInfo.public_ip || node.public_ip,
        local_ips: deviceInfo.local_ips || node.local_ips,
        lan_ips: deviceInfo.lan_ips || node.lan_ips,
        endpoint_ip: deviceInfo.endpoint_ip || node.endpoint_ip,
        endpoint_port: deviceInfo.endpoint_port || node.endpoint_port,
        // 延迟信息
        latency: deviceInfo.latency || node.latency,
        stats: {
          ...node.stats,
          latency: deviceInfo.latency || node.stats?.latency
        }
      }
    }
    return node
  })
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 检查是否为未完成配置的节点
const isUnconfiguredNode = (node: Node): boolean => {
  const status = normalizeNodeStatus(node.node_status, node.status)
  return NodeStatusManager.needsConfiguration(status)
}

// 转换节点数据为 NodeCardContent 所需格式
const transformNode = (node: Node) => {
  return {
    ...node,
    node_status: normalizeNodeStatus(node.node_status, node.status),
    // 确保字段存在
    vpn_ip: node.vpn_ip || node.node_ip,
    endpoint_ip: node.endpoint_ip || '',
    endpoint_port: node.endpoint_port || 0,
    last_seen: node.last_seen || node.updated_at
  }
}

// 连接节点
const handleConnect = async (node: Node) => {
  try {
    notifySuccess(t('nodes.operations.connectStart', { name: node.node_name }))
    // TODO: 实现真正的连接逻辑
    await goToDetail(node.node_id)
  } catch (error) {
    debug.error('连接节点失败:', error)
    notifyError(t('nodes.operations.connectFailed'))
  }
}

// 启用节点
const handleEnable = async (node: Node) => {
  await changeNodeStatus(node, NODE_STATUS.ENABLED)
}

// 禁用节点
const handleDisable = async (node: Node) => {
  await changeNodeStatus(node, NODE_STATUS.DISABLED)
}

// 启动节点
const handleStart = async (node: Node) => {
  await handleNodeAction(node, 'start')
}

// 停止节点
const handleStop = async (node: Node) => {
  await handleNodeAction(node, 'stop')
}

// 重启节点
const handleRestart = async (node: Node) => {
  await handleNodeAction(node, 'restart')
}

// 节点操作方法（启动、停止、重启）
const handleNodeAction = async (node: Node, action: 'start' | 'stop' | 'restart') => {
  const nodeId = node.node_id
  
  try {
    statusChanging.value[nodeId] = true
    
    let result: any
    // 根据操作类型调用对应的 API
    switch (action) {
      case 'start':
        result = await nodeService.startNode(String(nodeId))
        break
      case 'stop':
        result = await nodeService.stopNode(String(nodeId))
        break
      case 'restart':
        result = await nodeService.restartNode(String(nodeId))
        break
    }
    
    // 显示操作指令创建成功的消息
    if (result && result.data) {
      notifySuccess(t('nodes.operations.commandCreated', {
        name: node.node_name,
        action: t(`nodes.operations.${action}`),
        commandId: result.data.command_id
      }))
    } else {
      notifySuccess(t('nodes.operations.commandCreatedSimple', {
        name: node.node_name,
        action: t(`nodes.operations.${action}`)
      }))
    }
    
    // 刷新节点列表以获取最新状态
    await refreshNodes()
    
  } catch (error) {
    debug.error(`节点${action}操作失败:`, error)
    notifyError(t('nodes.operations.actionFailed', { action: t(`nodes.operations.${action}`) }))
  } finally {
    statusChanging.value[nodeId] = false
  }
}

// 操作方法
const goToCreate = () => {
  router.push('/app/nodes/create')
}

// 一键快速创建节点
const handleQuickCreate = async () => {
  const name = quickCreateName.value.trim()
  if (!name || name.length < 3) return

  try {
    quickCreating.value = true
    const result = await nodeService.quickCreateNode(name)
    showQuickCreateDialog.value = false
    quickCreateName.value = ''

    // 刷新节点列表
    await refreshNodes()

    const nodeId = result.data.node.node_id
    // 提示用户下一步操作
    $q.notify({
      type: 'positive',
      message: t('nodes.quickCreateSuccess'),
      caption: t('nodes.quickCreateNextStep'),
      timeout: 8000,
      actions: [
        {
          label: t('nodes.goToKeys'),
          color: 'white',
          handler: () => {
            router.push(`/app/nodes/${nodeId}/edit/config`)
          }
        }
      ]
    })
  } catch (error: any) {
    debug.error('一键快速创建节点失败:', error)
    const msg = error?.response?.data?.message || error?.message || ''
    if (msg.includes('IP') || msg.includes('ip')) {
      notifyError(t('nodes.quickCreateIpPoolEmpty'))
    } else {
      notifyError(t('nodes.quickCreateFailed'))
    }
  } finally {
    quickCreating.value = false
  }
}

const goToDetail = (nodeId: string | number) => {
  router.push(`/app/nodes/${nodeId}`)
}

const goToEdit = (nodeId: string | number) => {
  router.push(`/app/nodes/${nodeId}/edit`)
}

const refreshNodes = async () => {
  await loadNodes()
  // 自动加载未配置节点的状态信息和所有节点的设备信息
  await Promise.all([
    checkAndLoadUnconfiguredNodes(),
    loadAllNodesDeviceInfo()
  ])
}

const confirmDelete = (node: Node) => {
  nodeToDelete.value = node
  showDeleteDialog.value = true
}

const deleteNode = async () => {
  if (!nodeToDelete.value) return

  try {
    deleting.value = true
    await removeNode(String(nodeToDelete.value.node_id))
    
    notifySuccess(t('nodes.deleteSuccess'))
    showDeleteDialog.value = false
    nodeToDelete.value = null
    
    // 刷新列表
    await refreshNodes()
    
  } catch (error) {
    debug.error('删除节点失败:', error)
    notifyError(t('nodes.deleteFailed'))
  } finally {
    deleting.value = false
  }
}

// 状态切换方法
const changeNodeStatus = async (node: Node, newStatus: number) => {
  const nodeId = node.node_id
  
  try {
    statusChanging.value[nodeId] = true
    
    // 使用新的数字状态码方法
    await nodeService.updateNodeStatusCode(String(nodeId), newStatus)
    
    // 刷新节点列表以获取最新状态
    await refreshNodes()
    
    const statusText = NodeStatusManager.getStatusText(newStatus)
    notifySuccess(t('nodes.status.updateSuccess', { status: statusText }))
    
  } catch (error) {
    debug.error('更新节点状态失败:', error)
    notifyError(t('nodes.status.updateFailed'))
  } finally {
    statusChanging.value[nodeId] = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await refreshNodes()
})
</script>

<style scoped>
.text-mono {
  font-family: 'Courier New', monospace;
}

.q-table {
  box-shadow: none;
}
</style>
