<template>
  <div class="key-management-page q-pa-md">
    <div class="text-h6 q-mb-md">密钥管理</div>
    
    <div class="row q-gutter-md">
      <!-- 左侧：密钥列表 -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">密钥列表</div>
            
            <q-skeleton-loader v-if="loading" type="QCard" />
            <div v-else>
              <q-list separator>
                <q-item
                  v-for="key in keys"
                  :key="key.id"
                  clickable
                  @click="selectKey(key)"
                  :class="{ 'bg-blue-1': selectedKey?.id === key.id }"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :icon="getKeyTypeIcon(key.key_type)"
                      :color="getKeyTypeColor(key.key_type)"
                      text-color="white"
                    />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label>{{ key.id }}</q-item-label>
                    <q-item-label caption>
                      {{ key.key_type }} | {{ formatDate(key.created_at) }}
                    </q-item-label>
                  </q-item-section>
                  
                  <q-item-section side>
                    <q-chip
                      :color="getStatusColor(key.is_active)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getStatusText(key.is_active) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div v-if="keys.length === 0" class="text-center text-grey-6 q-pa-md">
                暂无密钥
              </div>
            </div>
          </q-card-section>
          
          <q-card-actions>
            <q-btn
              color="primary"
              @click="showCreateDialog = true"
              :disable="loading"
            >
              <q-icon name="add" class="q-mr-sm" />
              添加密钥
            </q-btn>
            
            <q-btn
              color="secondary"
              outline
              @click="refreshKeys"
              :disable="loading"
            >
              <q-icon name="refresh" class="q-mr-sm" />
              刷新
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
      
      <!-- 右侧：密钥详情 -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">密钥详情</div>
            
            <div v-if="selectedKey" class="q-gutter-md">
              <!-- 基本信息 -->
              <q-field label="密钥ID" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline">
                    {{ selectedKey.id }}
                  </div>
                </template>
              </q-field>
              
              <q-field label="密钥类型" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline">
                    {{ selectedKey.key_type }}
                  </div>
                </template>
              </q-field>
              
              <q-field label="指纹" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline text-mono">
                    {{ selectedKey.fingerprint }}
                  </div>
                </template>
              </q-field>
              
              <!-- 公钥 -->
              <q-field label="公钥" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline">
                    <q-input
                      v-model="selectedKey.public_key"
                      type="textarea"
                      readonly
                      rows="4"
                      outlined
                      class="text-mono"
                    />
                  </div>
                </template>
              </q-field>
              
              <!-- 私钥（仅首次显示） -->
              <q-field 
                v-if="selectedKey.private_key"
                label="私钥 (仅此一次显示)"
                stack-label
              >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">
                    <q-banner class="bg-warning text-white q-mb-sm">
                      <template v-slot:avatar>
                        <q-icon name="warning" />
                      </template>
                      私钥仅显示一次，请立即保存！
                    </q-banner>
                    <q-input
                      v-model="selectedKey.private_key"
                      type="textarea"
                      readonly
                      rows="4"
                      outlined
                      class="text-mono"
                    />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn
                        color="primary"
                        @click="downloadPrivateKey"
                        size="sm"
                      >
                        <q-icon name="download" class="q-mr-xs" />
                        下载私钥
                      </q-btn>
                      <q-btn
                        color="secondary"
                        @click="copyPrivateKey"
                        size="sm"
                      >
                        <q-icon name="content_copy" class="q-mr-xs" />
                        复制私钥
                      </q-btn>
                      <q-btn
                        color="negative"
                        @click="confirmPrivateKeySaved"
                        size="sm"
                      >
                        <q-icon name="check" class="q-mr-xs" />
                        确认已保存
                      </q-btn>
                    </div>
                  </div>
                </template>
              </q-field>
            </div>
            
            <div v-else class="text-center text-grey-6 q-pa-md">
              请选择一个密钥查看详情
            </div>
          </q-card-section>
          
          <q-card-actions v-if="selectedKey">
            <q-btn
              color="negative"
              outline
              @click="confirmDeleteKey"
              :disable="loading"
            >
              <q-icon name="delete" class="q-mr-sm" />
              删除密钥
            </q-btn>
            
            <q-btn
              color="primary"
              outline
              @click="downloadPublicKey"
              :disable="loading"
            >
              <q-icon name="download" class="q-mr-sm" />
              下载公钥
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- 创建密钥对话框 -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">生成密钥</div>
          <div class="text-caption text-grey-6 q-mt-sm">
            为节点 {{ nodeId }} 生成密钥
          </div>
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md">
            <q-select
              v-model="newKey.generation_method"
              :options="generationMethodOptions"
              label="生成方式"
              emit-value
              map-options
            />

            <q-input
              v-if="newKey.generation_method === 'upload'"
              v-model="newKey.public_key"
              label="公钥内容"
              type="textarea"
              rows="4"
              required
              :rules="[val => !!val || '公钥内容不能为空']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" @click="showCreateDialog = false" />
          <q-btn
            color="primary"
            :label="newKey.generation_method === 'server' ? '生成' : '创建'"
            @click="createKey"
            :loading="creating"
            :disable="!isCreateFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除密钥 "{{ selectedKey?.id }}" 吗？</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            flat
            label="删除"
            color="negative"
            @click="deleteKey"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNodeKeys, useNotify } from '../../../composables'
import { NodeKey, KeyType } from '../../../types/nodeKeys'

const route = useRoute()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 使用组合式函数
const { 
  keys, 
  loading, 
  loadKeys, 
  generateKeyPair, 
  deleteKey: deleteNodeKey 
} = useNodeKeys(nodeId.value)

// 状态
const selectedKey = ref<NodeKey | null>(null)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const creating = ref(false)
const deleting = ref(false)

// 新建密钥表单
const newKey = ref({
  generation_method: 'server' as 'local' | 'server' | 'upload',
  public_key: ''
})

// 选项数据
const generationMethodOptions = ref([
  { label: '服务端生成', value: 'server' },
  { label: '上传公钥', value: 'upload' }
])

// 计算属性
const isCreateFormValid = computed(() => {
  return newKey.value.generation_method &&
         (newKey.value.generation_method !== 'upload' || newKey.value.public_key)
})

// 工具函数
const getKeyTypeIcon = (type: KeyType) => {
  switch (type) {
    case 'ed25519': return 'security'
    case 'wireguard': return 'vpn_key'
    case 'gnb': return 'key'
    default: return 'key'
  }
}

const getKeyTypeColor = (type: KeyType) => {
  switch (type) {
    case 'ed25519': return 'green'
    case 'wireguard': return 'blue'
    case 'gnb': return 'purple'
    default: return 'grey'
  }
}

const getStatusColor = (isActive?: boolean) => {
  return isActive ? 'positive' : 'grey'
}

const getStatusText = (isActive?: boolean) => {
  return isActive ? '活跃' : '未激活'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 操作方法
const selectKey = (key: NodeKey) => {
  selectedKey.value = key
}

const refreshKeys = async () => {
  await loadKeys(nodeId.value)
}

const createKey = async () => {
  if (!isCreateFormValid.value) return

  try {
    creating.value = true
    
    // 根据生成方式调用不同的API
    if (newKey.value.generation_method === 'server') {
      // 服务端生成密钥 - 不需要传递额外参数，使用默认的ed25519类型
      const result = await generateKeyPair({})
      
      if (result) {
        notifySuccess('密钥对生成成功')
        // 如果有私钥，显示私钥保存提示
        if (result.private_key) {
          let downloadClicked = false
          
          const showSaveDialog = () => {
            $q.dialog({
              title: '私钥保存提醒',
              message: `密钥对生成成功！私钥仅显示一次，请立即保存。\n\n公钥: ${result.public_key.substring(0, 32)}...\n私钥: ${result.private_key.substring(0, 32)}...${downloadClicked ? '\n\n✓ 私钥已下载' : '\n\n⚠️ 请先下载私钥'}`,
              persistent: true,
              ok: {
                label: '我已保存',
                color: 'primary',
                disable: !downloadClicked
              },
              cancel: {
                label: downloadClicked ? '重新下载' : '下载私钥',
                color: 'secondary'
              }
            }).onOk(() => {
              // 用户确认已保存
              notifySuccess('私钥保存确认完成')
            }).onCancel(() => {
              // 下载私钥
              const filename = `node_${nodeId.value}_private_key.pem`
              const blob = new Blob([result.private_key], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = filename
              a.click()
              URL.revokeObjectURL(url)
              
              downloadClicked = true
              notifySuccess('私钥已下载，请妥善保管')
              
              // 重新显示对话框，这次"我已保存"按钮可用
              setTimeout(() => {
                showSaveDialog()
              }, 100)
            })
          }
          
          showSaveDialog()
        }
      }
    } else if (newKey.value.generation_method === 'upload') {
      // 上传公钥
      // TODO: 实现上传公钥功能
      notifyError('上传公钥功能暂未实现')
      return
    } else {
      // 本地生成
      // TODO: 实现本地生成功能
      notifyError('本地生成功能暂未实现')
      return
    }
    
    showCreateDialog.value = false
    
    // 重置表单
    newKey.value = {
      generation_method: 'server',
      public_key: ''
    }
    
    // 刷新密钥列表
    await refreshKeys()
    
  } catch (error: any) {
    console.error('创建密钥失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '创建密钥失败，请重试'
    notifyError(errorMsg)
  } finally {
    creating.value = false
  }
}

const confirmDeleteKey = () => {
  if (selectedKey.value) {
    showDeleteDialog.value = true
  }
}

const deleteKey = async () => {
  if (!selectedKey.value) return

  try {
    deleting.value = true
    
    // 调用实际的删除API
    await deleteNodeKey(selectedKey.value.id)
    
    notifySuccess('密钥删除成功')
    showDeleteDialog.value = false
    selectedKey.value = null
    
    // 刷新密钥列表
    await refreshKeys()
    
  } catch (error: any) {
    console.error('删除密钥失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '删除密钥失败，请重试'
    notifyError(errorMsg)
  } finally {
    deleting.value = false
  }
}

const downloadPublicKey = () => {
  if (!selectedKey.value) return
  
  const filename = `${selectedKey.value.id}_public.key`
  const blob = new Blob([selectedKey.value.public_key], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const downloadPrivateKey = () => {
  if (!selectedKey.value?.private_key) return
  
  const filename = `${selectedKey.value.id}_private.key`
  const blob = new Blob([selectedKey.value.private_key], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const copyPrivateKey = async () => {
  if (!selectedKey.value?.private_key) return
  
  try {
    await navigator.clipboard.writeText(selectedKey.value.private_key)
    notifySuccess('私钥已复制到剪贴板')
  } catch (error) {
    notifyError('复制失败，请手动复制')
  }
}

const confirmPrivateKeySaved = () => {
  $q.dialog({
    title: '确认保存',
    message: '您确定已经安全保存了私钥吗？确认后将无法再次查看。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    if (selectedKey.value) {
      // 清空私钥（实际应用中应该在服务端处理）
      selectedKey.value.private_key = ''
    }
  })
}

// 组件挂载时加载数据
onMounted(async () => {
  if (nodeId.value) {
    await loadKeys(nodeId.value)
  }
})
</script>

<style scoped>
.key-management-page {
  max-width: 1200px;
  margin: 0 auto;
}

.text-mono {
  font-family: 'Courier New', monospace;
}
</style>
