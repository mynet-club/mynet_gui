<template>
  <q-page class="q-pa-md">
    <!-- 页面标题和操作按钮 -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">
        <q-icon name="device_hub" class="q-mr-sm" />
        节点管理
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          @click="goToCreate"
          :disable="loading"
        >
          <q-icon name="add" class="q-mr-sm" />
          创建节点
        </q-btn>
        <q-btn
          color="secondary"
          outline
          @click="refreshNodes"
          :loading="loading"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          刷新
        </q-btn>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchText"
              placeholder="搜索节点..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-3">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="状态筛选"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>
          
          <div class="col-12 col-md-3">
            <q-select
              v-model="typeFilter"
              :options="typeOptions"
              label="类型筛选"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 节点列表 - 卡片布局 -->
    <div class="row q-gutter-md">
      <div 
        v-for="node in filteredNodes" 
        :key="node.node_id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="node-card cursor-pointer" @click="goToDetail(node.node_id)">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 text-primary">{{ node.node_name }}</div>
              <q-chip
                :color="getStatusColor(node.status || node.node_status)"
                text-color="white"
                :icon="getStatusIcon(node.status || node.node_status)"
                size="sm"
              >
                {{ getStatusText(node.status || node.node_status) }}
              </q-chip>
            </div>
            
            <div class="text-grey-6 q-mb-sm">{{ node.node_id }}</div>
            
            <div v-if="node.description || node.node_remarks" class="text-body2 q-mb-sm">
              {{ node.description || node.node_remarks }}
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
            </div>
            
            <div class="text-caption text-grey-6">
              创建于 {{ formatDate(node.created_at) }}
            </div>
          </q-card-section>
          
          <q-card-actions>
            <q-btn
              flat
              color="primary"
              icon="visibility"
              @click.stop="goToDetail(node.node_id)"
            >
              查看
            </q-btn>
            
            <q-btn
              flat
              color="secondary"
              icon="edit"
              @click.stop="goToEdit(node.node_id)"
            >
              编辑
            </q-btn>
            
            <q-space />
            
            <q-btn
              flat
              color="negative"
              icon="delete"
              @click.stop="confirmDelete(node)"
            >
              删除
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
      
      <!-- 无数据时的显示 -->
      <div v-if="filteredNodes.length === 0" class="col-12">
        <q-card class="text-center q-pa-lg">
          <q-card-section>
            <q-icon size="4em" name="device_hub" color="grey-5" />
            <div class="text-h6 q-mt-md text-grey-6">
              {{ loading ? '加载中...' : '暂无节点数据' }}
            </div>
            <div v-if="!loading" class="text-body2 text-grey-6 q-mt-sm">
              {{ searchText || statusFilter || typeFilter ? '没有找到匹配的节点' : '开始创建你的第一个节点' }}
            </div>
            <q-btn
              v-if="!loading && !searchText && !statusFilter && !typeFilter"
              color="primary"
              @click="goToCreate"
              class="q-mt-md"
            >
              <q-icon name="add" class="q-mr-sm" />
              创建第一个节点
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            确定要删除节点 "{{ nodeToDelete?.node_name }}" 吗？
          </span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            flat
            label="删除"
            color="negative"
            @click="deleteNode"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNodes, useNotify } from '../../composables'
import { Node, NodeStatus, NodeType } from '../../types/node'

const router = useRouter()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 使用组合式函数
const { nodes, loading, loadNodes, deleteNode: removeNode } = useNodes()

// 搜索和筛选
const searchText = ref('')
const statusFilter = ref<NodeStatus | ''>('')
const typeFilter = ref<NodeType | ''>('')

// 删除确认
const showDeleteDialog = ref(false)
const nodeToDelete = ref<Node | null>(null)
const deleting = ref(false)

// 分页
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 筛选选项
const statusOptions = ref([
  { label: '在线', value: 'active' },
  { label: '离线', value: 'inactive' },
  { label: '待连接', value: 'pending' }
])

const typeOptions = ref([
  { label: '网关', value: 'Gateway' },
  { label: '服务器', value: 'Server' },
  { label: '客户端', value: 'Client' },
  { label: '路由器', value: 'Router' }
])

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
  let result = nodes.value || []

  // 搜索筛选
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(node => 
      node.node_name.toLowerCase().includes(search) ||
      String(node.node_id).toLowerCase().includes(search) ||
      (node.description && node.description.toLowerCase().includes(search)) ||
      (node.node_remarks && node.node_remarks.toLowerCase().includes(search))
    )
  }

  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(node => node.status === statusFilter.value)
  }

  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(node => node.node_type === typeFilter.value)
  }

  return result
})

// 工具函数
const getStatusColor = (status: NodeStatus | string | undefined) => {
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'negative'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const getStatusIcon = (status: NodeStatus | string | undefined) => {
  switch (status) {
    case 'active': return 'check_circle'
    case 'inactive': return 'cancel'
    case 'pending': return 'schedule'
    default: return 'help'
  }
}

const getStatusText = (status: NodeStatus | string | undefined) => {
  switch (status) {
    case 'active': return '在线'
    case 'inactive': return '离线'
    case 'pending': return '待连接'
    default: return '未知'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
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
    
    notifySuccess('节点删除成功')
    showDeleteDialog.value = false
    nodeToDelete.value = null
    
    // 刷新列表
    await refreshNodes()
    
  } catch (error) {
    console.error('删除节点失败:', error)
    notifyError('删除节点失败，请重试')
  } finally {
    deleting.value = false
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