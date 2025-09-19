<template>
  <PageLayout
    :title="$t('nodes.title')"
    :subtitle="$t('nodes.subtitle')"
    icon="device_hub"
  >
    <template #actions>
      <q-btn-group>
        <q-btn
          color="primary"
          icon="add"
          :label="$t('nodes.createNode')"
          @click="goToCreate"
          :disable="loading"
        />
        <q-btn
          color="secondary"
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
      spacing="normal"
      empty-icon="device_hub"
      :empty-title="$t('nodes.noData')"
      :empty-description="$t('nodes.noDataDescription')"
    >
      <template #default="{ item: node }">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6 text-primary">{{ node.node_name }}</div>
            <q-chip
              :color="NodeStatusManager.getStatusColor(normalizeNodeStatus(node.node_status, node.status))"
              text-color="white"
              :icon="NodeStatusManager.getStatusIcon(normalizeNodeStatus(node.node_status, node.status))"
              size="sm"
            >
              {{ NodeStatusManager.getStatusText(normalizeNodeStatus(node.node_status, node.status)) }}
            </q-chip>
          </div>
          
          <div class="text-grey-6 q-mb-sm">{{ node.node_id }}</div>
          
          <div v-if="node.description || node.node_remarks" class="text-body2 q-mb-sm">
            {{ node.description || node.node_remarks }}
          </div>
          
          <!-- 未完成配置状态的建议步骤 -->
          <div v-if="isUnconfiguredNode(node)" class="q-mb-sm">
            <div 
              v-if="nodeStatusInfo[node.node_id]?.next_steps?.length" 
              class="q-pa-sm rounded-borders"
              style="background-color: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107;"
            >
              <div class="text-caption text-orange-8 q-mb-xs">
                <q-icon name="info" class="q-mr-xs" />
                {{ $t('nodes.nextStepSuggestion') }}:
              </div>
              <div class="text-body2">
                <ul class="q-ma-none q-pl-md">
                  <li 
                    v-for="step in nodeStatusInfo[node.node_id]?.next_steps || []" 
                    :key="step"
                    class="text-orange-9"
                  >
                    {{ step }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-else-if="loadingStatusInfo[node.node_id]" class="text-center q-pa-sm">
              <q-spinner color="primary" size="sm" />
              <span class="q-ml-sm text-caption">{{ $t('nodes.gettingConfigSuggestions') }}</span>
            </div>
          </div>
          
          <div class="row q-gutter-xs q-mb-sm">
            <q-chip
              v-if="node.node_type"
              color="blue-grey"
              text-color="white"
              size="sm"
              icon="category"
            >
              {{ node.node_type }}
            </q-chip>
            
            <q-chip
              v-if="node.node_ip || node.ip_address"
              color="secondary"
              text-color="white"
              size="sm"
              icon="lan"
            >
              {{ node.node_ip || node.ip_address }}
            </q-chip>
            
            <!-- 操作系统信息 -->
            <q-chip
              v-if="getNodeOSInfo(node.node_id)"
              color="teal"
              text-color="white"
              size="sm"
              icon="desktop_windows"
            >
              {{ getNodeOSInfo(node.node_id) }}
            </q-chip>
          </div>
          
          <div class="text-caption text-grey-6">
            {{ $t('nodes.createdAt') }} {{ formatDate(node.created_at) }}
          </div>
        </q-card-section>
        
        <q-card-actions>
          <q-btn
            flat
            color="primary"
            icon="visibility"
            @click.stop="goToDetail(node.node_id)"
          >
            {{ $t('nodes.view') }}
          </q-btn>
          
          <q-btn
            flat
            color="secondary"
            icon="edit"
            @click.stop="goToEdit(node.node_id)"
          >
            {{ $t('common.edit') }}
          </q-btn>
          
          <q-space />
          
          <!-- 状态切换按钮 -->
          <q-btn-dropdown
            v-if="!isUnconfiguredNode(node)"
            flat
            color="blue"
            icon="toggle_on"
            :loading="statusChanging[node.node_id]"
          >
            <q-list>
              <q-item 
                clickable 
                @click="changeNodeStatus(node, NODE_STATUS.ENABLED)"
                :disable="node.status === NODE_STATUS.ENABLED || node.status === NODE_STATUS.ONLINE"
              >
                <q-item-section avatar>
                  <q-icon name="power_settings_new" color="positive" />
                </q-item-section>
                <q-item-section>{{ $t('nodes.enable') }}</q-item-section>
              </q-item>
              <q-item 
                clickable 
                @click="changeNodeStatus(node, NODE_STATUS.DISABLED)"
                :disable="node.status === NODE_STATUS.DISABLED"
              >
                <q-item-section avatar>
                  <q-icon name="power_off" color="negative" />
                </q-item-section>
                <q-item-section>{{ $t('nodes.disable') }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          
          <q-btn
            flat
            color="negative"
            icon="delete"
            @click.stop="confirmDelete(node)"
          >
            {{ $t('common.delete') }}
          </q-btn>
        </q-card-actions>
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
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
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

// 状态切换
const statusChanging = ref<Record<string | number, boolean>>({})

// 节点状态信息管理
const nodeStatusInfo = ref<Record<string | number, NodeStatusInfo>>({})
const loadingStatusInfo = ref<Record<string | number, boolean>>({})

// 节点设备信息管理
const nodeDeviceInfo = ref<Record<string | number, NodeDeviceInfo>>({})
const loadingDeviceInfo = ref<Record<string | number, boolean>>({})

// 分页
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 表格列定义
const columns = [
  {
    name: 'node_name',
    label: '节点名称',
    field: 'node_name',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'node_id',
    label: '节点ID',
    field: 'node_id',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'node_type',
    label: '类型',
    field: 'node_type',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'ip_address',
    label: 'IP地址',
    field: 'ip_address',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'created_at',
    label: '创建时间',
    field: 'created_at',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center' as const,
    sortable: false
  }
]

// 计算属性
const filteredNodes = computed(() => {
  return [...(nodes.value || [])]
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 检查是否为未完成配置的节点
const isUnconfiguredNode = (node: Node): boolean => {
  const status = normalizeNodeStatus(node.node_status, node.status)
  return NodeStatusManager.needsConfiguration(status)
}

// 加载节点状态信息
const loadNodeStatusInfo = async (nodeId: string | number) => {
  if (loadingStatusInfo.value[nodeId] || nodeStatusInfo.value[nodeId]) {
    return // 避免重复加载
  }

  try {
    loadingStatusInfo.value[nodeId] = true
    const response = await nodeService.getNodeStatusInfo(String(nodeId))
    nodeStatusInfo.value[nodeId] = response.data
  } catch (error) {
    debug.error(`获取节点 ${nodeId} 状态信息失败:`, error)
  } finally {
    loadingStatusInfo.value[nodeId] = false
  }
}

// 加载节点设备信息
const loadNodeDeviceInfo = async (nodeId: string | number) => {
  if (loadingDeviceInfo.value[nodeId] || nodeDeviceInfo.value[nodeId]) {
    return // 避免重复加载
  }

  try {
    loadingDeviceInfo.value[nodeId] = true
    const response = await nodeService.getNodeDeviceInfo(String(nodeId))
    if (response.success && response.data.exists) {
      nodeDeviceInfo.value[nodeId] = response.data.device_info
    }
  } catch (error) {
    debug.error(`获取节点 ${nodeId} 设备信息失败:`, error)
  } finally {
    loadingDeviceInfo.value[nodeId] = false
  }
}

// 获取节点操作系统信息显示
const getNodeOSInfo = (nodeId: string | number): string => {
  const deviceInfo = nodeDeviceInfo.value[nodeId]
  if (!deviceInfo) return ''
  
  const parts: string[] = []
  
  if (deviceInfo.os_name) {
    parts.push(deviceInfo.os_name)
  }
  
  if (deviceInfo.os_version) {
    parts.push(deviceInfo.os_version)
  }
  
  return parts.join(' ')
}

// 检查并加载未配置节点的状态信息
const checkAndLoadUnconfiguredNodes = async () => {
  const unconfiguredNodes = filteredNodes.value.filter(isUnconfiguredNode)
  
  // 并发加载所有未配置节点的状态信息
  const loadPromises = unconfiguredNodes.map(node => 
    loadNodeStatusInfo(node.node_id)
  )
  
  await Promise.allSettled(loadPromises)
}

// 加载所有节点的设备信息（用于显示操作系统信息）
const loadAllNodesDeviceInfo = async () => {
  const loadPromises = filteredNodes.value.map(node => 
    loadNodeDeviceInfo(node.node_id)
  )
  
  await Promise.allSettled(loadPromises)
}

// 操作方法
const goToCreate = () => {
  router.push('/nodes/create')
}

const goToDetail = (nodeId: string | number) => {
  router.push(`/nodes/${nodeId}`)
}

const goToEdit = (nodeId: string | number) => {
  router.push(`/nodes/${nodeId}/edit`)
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

const onRequest = (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  // 这里可以实现服务端分页
  // 目前使用客户端分页
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadNodes()
  // 更新分页信息
  pagination.value.rowsNumber = nodes.value?.length || 0
  // 加载未配置节点的状态信息和所有节点的设备信息
  await Promise.all([
    checkAndLoadUnconfiguredNodes(),
    loadAllNodesDeviceInfo()
  ])
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
