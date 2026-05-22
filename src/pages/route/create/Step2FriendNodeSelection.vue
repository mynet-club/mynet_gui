<template>
  <q-page class="route-create-step2-page">
    <div class="q-pa-md">
      <!-- 页面标题和导航 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('routes.create.step2.title') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('routes.create.step2.subtitle', { friendName: selectedFriend?.name || '' }) }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="arrow_back"
            :label="$t('common.back')"
            @click="goBack"
          />
        </div>
      </div>

      <!-- 步骤指示器 -->
      <q-stepper
        v-model="currentStep"
        ref="stepper"
        color="primary"
        animated
        flat
        class="q-mb-lg"
      >
        <q-step
          :name="1"
          :title="$t('routes.create.steps.selectFriend')"
          icon="people"
          :done="currentStep > 1"
          active-icon="people"
        />
        <q-step
          :name="2"
          :title="$t('routes.create.steps.selectFriendNode')"
          icon="device_hub"
          :done="currentStep > 2"
          active-icon="device_hub"
        />
        <q-step
          :name="3"
          :title="$t('routes.create.steps.selectMyNode')"
          icon="router"
          :done="currentStep > 3"
          active-icon="router"
        />
        <q-step
          :name="4"
          :title="$t('routes.create.steps.submitRequest')"
          icon="send"
          active-icon="send"
        />
      </q-stepper>

      <!-- 选中的好友信息 -->
      <q-card class="q-mb-md" v-if="selectedFriend">
        <q-card-section class="row items-center">
          <q-avatar :color="getStatusColor(selectedFriend.status)" class="q-mr-md">
            <q-icon name="person" color="white" />
          </q-avatar>
          <div class="col">
            <div class="text-h6">{{ selectedFriend.name }}</div>
            <div class="text-body2 text-grey-6">
              {{ $t('routes.create.step2.selectedFriend') }}
            </div>
          </div>
          <q-btn
            flat
            icon="edit"
            :label="$t('routes.create.step2.changeFriend')"
            @click="changeFriend"
          />
        </q-card-section>
      </q-card>

      <!-- 好友节点列表 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step2.selectFriendNode') }}</div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center q-py-lg">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-md">{{ $t('routes.create.step2.loadingNodes') }}</div>
          </div>

          <!-- 无节点状态 -->
          <div v-else-if="friendNodes.length === 0" class="text-center q-py-lg text-grey-6">
            <q-icon name="device_hub" size="3em" class="q-mb-md" />
            <div>{{ $t('routes.create.step2.noNodes') }}</div>
          </div>

          <!-- 节点卡片列表 -->
          <div v-else class="row q-gutter-md">
            <div
              v-for="node in friendNodes"
              :key="node.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                class="node-card cursor-pointer"
                :class="{ 
                  'selected': selectedNode?.id === node.id,
                  'disabled': !node.ui_can_select
                }"
                @click="selectNode(node)"
                bordered
                flat
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-center">
                    <div class="col">
                      <div class="text-h6">{{ node.name }}</div>
                      <div class="text-body2 text-grey-6 q-mt-xs">
                        {{ node.location || $t('routes.create.step2.unknownLocation') }}
                      </div>
                    </div>
                    <div>
                      <q-avatar 
                        size="40px" 
                        :color="node.ui_can_select ? 'positive' : 'grey'"
                      >
                        <q-icon name="device_hub" color="white" />
                      </q-avatar>
                    </div>
                  </div>

                  <!-- 节点状态信息 -->
                  <div class="row q-mt-md">
                    <div class="col-4">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step2.nodeStatus') }}</div>
                      <q-chip 
                        :color="node.status === 'online' ? 'positive' : 'grey'" 
                        text-color="white" 
                        size="sm"
                      >
                        {{ node.status }}
                      </q-chip>
                    </div>
                    <div class="col-4">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step2.connections') }}</div>
                      <div class="text-h6">{{ node.current_connections || 0 }}/{{ node.max_connections || 0 }}</div>
                    </div>
                    <div class="col-4">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step2.latency') }}</div>
                      <div class="text-h6">{{ node.latency || '--' }}ms</div>
                    </div>
                  </div>

                  <!-- 节点不可用警告 -->
                  <div v-if="!node.ui_can_select" class="q-mt-md">
                    <q-banner class="bg-warning text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="warning" />
                      </template>
                      <!-- 根据具体情况显示不同的警告信息 -->
                      <div v-if="node.current_connections >= node.max_connections && node.max_connections > 0">
                        {{ $t('routes.create.step2.connectionsFull') }}
                      </div>
                      <div v-else-if="node.status !== 'enabled' && node.status !== 'online'">
                        {{ $t('routes.create.step2.nodeNotAvailable') }}
                      </div>
                      <div v-else>
                        {{ $t('routes.create.step2.nodeNotAvailable') }}
                      </div>
                    </q-banner>
                  </div>

                  <!-- 选中指示器 -->
                  <q-icon
                    v-if="selectedNode?.id === node.id"
                    name="check_circle"
                    color="positive"
                    size="1.5em"
                    class="absolute-top-right q-ma-sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            :label="$t('common.previous')"
            @click="goBack"
          />
          <q-btn
            color="primary"
            :label="$t('routes.create.step2.nextStep')"
            :disable="!selectedNode || !selectedNode.ui_can_select"
            @click="goToNextStep"
            icon-right="arrow_forward"
          />
        </q-card-actions>
      </q-card>

      <!-- 调试信息对话框 -->
      <q-dialog v-model="debugDialog.show" v-if="isDevelopment">
        <q-card style="min-width: 500px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('common.debugInfo') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="debugDialog.node">
            <div class="text-subtitle2 q-mb-md">{{ debugDialog.node.name }} (ID: {{ debugDialog.node.id }})</div>
            
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('routes.create.step2.nodeStatus') }}</q-item-label>
                  <q-item-label>{{ debugDialog.node.status }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label caption>can_connect</q-item-label>
                  <q-item-label>
                    <q-chip :color="debugDialog.node.can_connect ? 'positive' : 'negative'" text-color="white" size="sm">
                      {{ debugDialog.node.can_connect }}
                    </q-chip>
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('routes.create.step2.connections') }}</q-item-label>
                  <q-item-label>{{ debugDialog.node.current_connections }} / {{ debugDialog.node.max_connections }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-if="debugDialog.node.cannot_connect_reason">
                <q-item-section>
                  <q-item-label caption>cannot_connect_reason</q-item-label>
                  <q-item-label class="text-negative">{{ debugDialog.node.cannot_connect_reason }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label caption>owner_id</q-item-label>
                  <q-item-label>{{ debugDialog.node.owner_id }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label caption>vpn_type</q-item-label>
                  <q-item-label>{{ debugDialog.node.vpn_type }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-md">
              <q-expansion-item label="Raw JSON Data" icon="code">
                <q-card flat bordered class="q-mt-sm">
                  <q-card-section>
                    <pre class="text-caption" style="max-height: 300px; overflow-y: auto;">{{ JSON.stringify(debugDialog.node, null, 2) }}</pre>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSocial } from '../../../composables/useSocial'
import { useNotify } from '../../../composables/useNotify'
import type { Friend } from '../../../types'

const { t } = useI18n()
const router = useRouter()
const { getFriendNodes } = useSocial()
const { notify } = useNotify()

// 响应式状态
const selectedFriend = ref<Friend | null>(null)
const selectedNode = ref<any>(null)
const friendNodes = ref<any[]>([])
const loading = ref(false)
const debugDialog = ref({
  show: false,
  node: null as any
})

const showNodeDebugInfo = (node: any) => {
  debugDialog.value = {
    show: true,
    node
  }
}

const selectNode = (node: any) => {
  if (!node.ui_can_select) {
    notify.warning(t('routes.create.step2.nodeCannotConnect'))
    return
  }
  selectedNode.value = node
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'positive'
    case 'offline':
      return 'grey'
    default:
      return 'grey'
  }
}

const changeFriend = () => {
  router.push('/app/routes/create/prev_1')
}

const goBack = () => {
  router.push('/app/routes/create/prev_1')
}

const goToNextStep = () => {
  if (!selectedNode.value || !selectedNode.value.ui_can_select) {
    notify.error(t('routes.create.step2.pleaseSelectNode'))
    return
  }
  
  // 将选中的节点存储到会话存储中
  sessionStorage.setItem('route-create-friend-node', JSON.stringify(selectedNode.value))
  
  router.push('/app/routes/create/prev_3')
}

// 获取好友节点列表
const fetchFriendNodes = async () => {
  if (!selectedFriend.value) return
  
  try {
    loading.value = true
    const nodes = await getFriendNodes(selectedFriend.value.id)
    
    // 为每个节点添加UI可选状态判断
    // 注意：此时还未选择源节点，不能使用后端的 can_connect 字段（它可能基于某个特定源节点判断）
    friendNodes.value = nodes.map((node: any) => {
      // 检查连接数是否已满
      const currentConnections = node.current_connections || 0
      const maxConnections = node.max_connections || 0
      const hasAvailableConnections = maxConnections === 0 || currentConnections < maxConnections
      
      // 检查节点状态（enabled 或 online 都认为可用）
      const isAvailable = node.status === 'enabled' || node.status === 'online'
      
      // UI层面的可选状态：只基于节点自身状态和连接数，忽略后端的 can_connect
      // 真正的连接性检查会在 Step3（选择源节点）时进行
      const uiCanSelect = hasAvailableConnections && isAvailable
      
      // 详细的调试日志
      debug.log(`好友节点 ${node.name} (${node.id}):`, {
        current_connections: currentConnections,
        max_connections: maxConnections,
        hasAvailableConnections,
        status: node.status,
        isAvailable,
        backend_can_connect: node.can_connect,
        ui_can_select: uiCanSelect,
        reason: !hasAvailableConnections ? '连接数已满' : 
                !isAvailable ? '节点不可用' : '可以选择',
        note: '后端的 can_connect 字段已被忽略，将在 Step3 重新检查'
      })
      
      return {
        ...node,
        current_connections: currentConnections,
        max_connections: maxConnections,
        ui_can_select: uiCanSelect,  // UI 层面是否可选
        backend_can_connect: node.can_connect  // 保留原始值供调试
      }
    })
  } catch (error) {
    debug.error('获取好友节点失败:', error)
    notify.error(t('routes.create.step2.fetchNodesError'))
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  // 检查是否有选择的好友
  const savedFriend = sessionStorage.getItem('route-create-friend')
  if (!savedFriend) {
    notify.error(t('routes.create.step2.noFriendSelected'))
    router.push('/app/routes/create/prev_1')
    return
  }
  
  try {
    selectedFriend.value = JSON.parse(savedFriend)
  } catch (error) {
    debug.error('解析已保存的好友数据失败:', error)
    router.push('/app/routes/create/prev_1')
    return
  }
  
  // 检查是否有已选择的节点
  const savedNode = sessionStorage.getItem('route-create-friend-node')
  if (savedNode) {
    try {
      selectedNode.value = JSON.parse(savedNode)
    } catch (error) {
      debug.error('解析已保存的节点数据失败:', error)
    }
  }
  
  // 获取好友节点列表
  await fetchFriendNodes()
})
</script>

<style lang="scss" scoped>
.route-create-step2-page {
  .node-card {
    transition: all 0.2s ease;
    
    &:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.selected {
      border-color: var(--q-positive);
      box-shadow: 0 0 0 2px rgba(var(--q-positive), 0.2);
    }
    
    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
