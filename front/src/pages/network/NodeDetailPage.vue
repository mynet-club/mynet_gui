<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- 左侧主要内容 -->
      <div class="col-12 col-md-8">
        <!-- 页面标题和操作按钮 -->
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h4">
            <q-icon name="device_hub" class="q-mr-sm" />
            节点详情
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              outline
              @click="goToEdit"
              :disable="!node || isLoading"
            >
              <q-icon name="edit" class="q-mr-xs" />
              编辑
            </q-btn>
            <q-btn
              color="negative"
              outline
              @click="confirmDelete"
              :disable="!node || isLoading"
            >
              <q-icon name="delete" class="q-mr-xs" />
              删除
            </q-btn>
          </div>
        </div>

        <!-- 节点基本信息 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">基本信息</div>
            <q-skeleton-loader v-if="isLoading" type="QCard" />
            <div v-else-if="node" class="q-gutter-md">
              <div class="row">
                <div class="col-6">
                  <q-field label="节点名称" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ node.node_name }}
                      </div>
                    </template>
                  </q-field>
                </div>
                <div class="col-6">
                  <q-field label="节点ID" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ node.node_id }}
                      </div>
                    </template>
                  </q-field>
                </div>
              </div>
              <div class="row">
                <div class="col-6">
                  <q-field label="状态" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        <q-chip
                          :color="getStatusColor(node.status)"
                          text-color="white"
                          :icon="getStatusIcon(node.status)"
                        >
                          {{ getStatusText(node.status) }}
                        </q-chip>
                      </div>
                    </template>
                  </q-field>
                </div>
                <div class="col-6">
                  <q-field label="创建时间" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ formatDate(node.created_at) }}
                      </div>
                    </template>
                  </q-field>
                </div>
              </div>
              <div v-if="node.description">
                <q-field label="描述" stack-label>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline">
                      {{ node.description }}
                    </div>
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 网络信息 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">网络信息</div>
            <q-skeleton-loader v-if="isLoading" type="QCard" />
            <div v-else-if="node" class="q-gutter-md">
              <div class="row">
                <div class="col-6">
                  <q-field label="内网IP" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ node.ip_address || '未分配' }}
                      </div>
                    </template>
                  </q-field>
                </div>
                <div class="col-6">
                  <q-field label="公网IP" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ node.public_ip || '未设置' }}
                      </div>
                    </template>
                  </q-field>
                </div>
              </div>
              <div class="row">
                <div class="col-6">
                  <q-field label="端口" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ node.port || '未设置' }}
                      </div>
                    </template>
                  </q-field>
                </div>
                <div class="col-6">
                  <q-field label="节点类型" stack-label>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ node.node_type || '未设置' }}
                      </div>
                    </template>
                  </q-field>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧统计信息 -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">统计信息</div>
            <q-skeleton-loader v-if="isLoading" type="QCard" />
            <div v-else-if="node?.stats" class="q-gutter-md">
              <div>
                <q-field label="发送字节数" stack-label>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline">
                      {{ formatBytes(node.stats.bytes_sent) }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div>
                <q-field label="接收字节数" stack-label>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline">
                      {{ formatBytes(node.stats.bytes_received) }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div>
                <q-field label="连接数" stack-label>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline">
                      {{ node.stats.connections_count || 0 }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div>
                <q-field label="运行时间" stack-label>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline">
                      {{ formatUptime(node.stats.uptime) }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div v-if="node.stats.last_seen">
                <q-field label="最后在线" stack-label>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline">
                      {{ formatDate(node.stats.last_seen) }}
                    </div>
                  </template>
                </q-field>
              </div>
            </div>
            <div v-else class="text-grey-6">
              暂无统计数据
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除节点 "{{ node?.node_name }}" 吗？</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            flat
            label="删除"
            color="negative"
            @click="deleteNode"
            :loading="isDeleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNode, useNotify } from '../../composables'
import { NodeStatus } from '../../types/node'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 使用组合式函数
const { node, loading: isLoading, loadNode, deleteNode: removeNode } = useNode()

// 状态
const showDeleteDialog = ref(false)
const isDeleting = ref(false)

// 状态相关工具函数
const getStatusColor = (status: NodeStatus) => {
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'negative'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const getStatusIcon = (status: NodeStatus) => {
  switch (status) {
    case 'active': return 'check_circle'
    case 'inactive': return 'cancel'
    case 'pending': return 'schedule'
    default: return 'help'
  }
}

const getStatusText = (status: NodeStatus) => {
  switch (status) {
    case 'active': return '在线'
    case 'inactive': return '离线'
    case 'pending': return '待连接'
    default: return '未知'
  }
}

// 格式化工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatUptime = (seconds?: number) => {
  if (!seconds) return '0 秒'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 操作函数
const goToEdit = () => {
  router.push(`/nodes/${nodeId.value}/edit`)
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const deleteNode = async () => {
  if (!node.value) return
  
  try {
    isDeleting.value = true
    const success = await removeNode()
    if (success) {
      notifySuccess('节点删除成功')
      router.push('/nodes')
    }
  } catch (error) {
    console.error('删除节点失败:', error)
    notifyError('删除节点失败，请重试')
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  if (nodeId.value) {
    await loadNode(nodeId.value)
  }
})
</script>

<style scoped>
.q-page {
  min-height: calc(100vh - 150px);
}

.q-field {
  margin-bottom: 16px;
}
</style>
