<template>
  <div class="friend-nodes-tab">
    <!-- 搜索和过滤栏 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('routes.friendNodes.searchPlaceholder')"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          :label="$t('routes.friendNodes.statusFilter')"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- 节点列表 -->
    <ResponsiveCardGrid
      :items="filteredNodes"
      :loading="loading"
      variant="standard"
      spacing="normal"
      empty-icon="lan"
      :empty-title="searchQuery ? $t('routes.friendNodes.noSearchResults') : $t('routes.friendNodes.noNodes')"
      :empty-description="$t('routes.friendNodes.noNodesDescription')"
    >
      <template #default="{ item: node }">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" class="q-mr-sm">
                  <img v-if="node.friend_avatar" :src="node.friend_avatar" :alt="node.friend_name" />
                  <q-icon v-else name="person" size="24px" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-medium">{{ node.friend_name }}</div>
                  <div class="text-caption text-grey-6">{{ node.node_name }}</div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getStatusColor(node.connection_status)"
                :label="$t(`routes.nodeStatus.${node.connection_status}`)"
                size="sm"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md text-center">
            <div class="col">
              <div class="text-body2 text-weight-medium">{{ node.ip_address }}</div>
              <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.ipAddress') }}</div>
            </div>
            <div class="col">
              <div class="text-body2 text-weight-medium">{{ node.port }}</div>
              <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.port') }}</div>
            </div>
            <div class="col">
              <div class="text-body2 text-weight-medium">{{ node.node_type }}</div>
              <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.nodeType') }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row items-center">
            <div class="col">
              <div class="text-caption text-grey-6">
                {{ $t('routes.friendNodes.zone') }}: {{ node.zone_name }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('routes.friendNodes.lastSeen') }}: {{ formatDate(node.last_seen) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('routes.friendNodes.viewFriend')"
            color="primary"
            @click="$emit('view-friend', node.friend_id)"
          />
          <q-btn
            v-if="node.connection_status === 'available'"
            flat
            :label="$t('routes.friendNodes.connect')"
            color="primary"
            @click="handleConnectToNode(node)"
          />
          <q-btn
            v-else-if="node.connection_status === 'pending'"
            flat
            :label="$t('routes.friendNodes.pending')"
            color="orange"
            disable
          />
          <q-btn
            v-else-if="node.connection_status === 'connected'"
            flat
            :label="$t('routes.friendNodes.connected')"
            color="positive"
            disable
          />
        </q-card-actions>
      </template>

      <template #emptyAction>
        <q-btn
          color="primary"
          :label="$t('routes.friendNodes.goToSocial')"
          @click="goToSocial"
        />
      </template>
    </ResponsiveCardGrid>

    <!-- 选择我的节点对话框 -->
    <q-dialog v-model="nodeSelectionDialog.show" persistent max-width="800px">
      <q-card class="full-width">
        <q-card-section>
          <div class="text-h6">{{ $t('routes.friendNodes.selectMyNode') }}</div>
          <div class="text-subtitle2 q-mt-sm">
            {{ $t('routes.friendNodes.selectMyNodeHint') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="nodeSelectionDialog.availableNodes.length === 0" class="text-center q-py-lg">
            <q-icon name="router" size="3rem" color="grey-5" class="q-mb-md" />
            <div class="text-body1 text-grey-6">
              {{ $t('routes.friendNodes.noAvailableNodes') }}
            </div>
          </div>

          <div v-else class="row q-gutter-md">
            <div
              v-for="node in nodeSelectionDialog.availableNodes"
              :key="node.id"
              class="col-12 col-md-6"
            >
              <q-card 
                class="cursor-pointer node-selection-card" 
                @click="selectMyNode(node)"
              >
                <q-card-section>
                  <div class="row items-center">
                    <q-avatar size="40px" class="q-mr-sm">
                      <q-icon name="router" size="24px" />
                    </q-avatar>
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">{{ node.node_name || node.name }}</div>
                      <div class="text-caption text-grey-6">{{ node.description || node.node_remarks }}</div>
                    </div>
                    <div class="col-auto">
                      <q-chip
                        :color="node.status === 'active' ? 'positive' : 'grey'"
                        :label="$t(`routes.nodeStatus.${node.status}`)"
                        size="sm"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="nodeSelectionDialog.show = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 连接确认对话框 -->
    <q-dialog v-model="connectionDialog.show" persistent max-width="600px">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('routes.friendNodes.confirmConnection') }}</div>
          <div class="text-subtitle2 q-mt-sm">
            {{ $t('routes.friendNodes.confirmConnectionHint') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- 连接信息摘要 -->
          <div v-if="connectionDialog.selectedFriendNode && connectionDialog.selectedMyNode" class="q-mb-md">
            <q-item class="q-pa-none q-mb-sm">
              <q-item-section avatar>
                <q-avatar color="primary">
                  <q-icon name="person" color="white" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-subtitle1">{{ connectionDialog.selectedFriendNode.friend_name }}</q-item-label>
                <q-item-label caption>{{ connectionDialog.selectedFriendNode.node_name }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-pa-none q-mb-md">
              <q-item-section avatar>
                <q-avatar color="secondary">
                  <q-icon name="router" color="white" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-subtitle1">{{ connectionDialog.selectedMyNode.node_name || connectionDialog.selectedMyNode.name }}</q-item-label>
                <q-item-label caption>{{ $t('routes.friendNodes.myNode') }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- 请求消息 -->
          <q-input
            v-model="connectionDialog.message"
            :label="$t('routes.friendNodes.requestMessage')"
            :placeholder="$t('routes.friendNodes.messagePlaceholder')"
            type="textarea"
            rows="4"
            outlined
            maxlength="500"
            counter
            :rules="[
              val => !!val || $t('routes.friendNodes.messageRequired'),
              val => val.length >= 10 || $t('routes.friendNodes.messageMinLength'),
              val => val.length <= 500 || $t('routes.friendNodes.messageMaxLength')
            ]"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="resetDialogState()" />
          <q-btn 
            color="primary" 
            :label="$t('routes.friendNodes.sendRequest')" 
            @click="confirmConnection()"
            :disable="!connectionDialog.message || connectionDialog.message.length < 10"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import { useRoutes } from '../../composables/useRoutes'
import { useNodes } from '../../composables/useNodes'
import { useNotify } from '../../composables/useNotify'
import type { FriendNode } from '../../types'

interface Props {
  friendNodes: FriendNode[]
  loading: boolean
}

interface Emits {
  (e: 'connect', nodeId: string, nodeName: string, friendName: string): void
  (e: 'view-friend', friendId: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
const router = useRouter()
const { createRouteRequest } = useRoutes()
const { nodes, loadNodes } = useNodes()
const notify = useNotify()

// 搜索和过滤
const searchQuery = ref('')
const statusFilter = ref('')

// 连接对话框状态
const connectionDialog = ref({
  show: false,
  selectedFriendNode: null as FriendNode | null,
  selectedMyNode: null as any,
  message: ''
})

// 我的节点选择对话框
const nodeSelectionDialog = ref({
  show: false,
  availableNodes: [] as any[]
})

const statusOptions = [
  { label: t('routes.nodeStatus.available'), value: 'available' },
  { label: t('routes.nodeStatus.connected'), value: 'connected' },
  { label: t('routes.nodeStatus.pending'), value: 'pending' },
  { label: t('routes.nodeStatus.unavailable'), value: 'unavailable' }
]

// 处理连接到节点
const handleConnectToNode = async (friendNode: FriendNode) => {
  try {
    // 加载我的节点列表
    await loadNodes()
    
    // 筛选可用的节点（状态为 active）
    const availableNodes = nodes.value.filter(node => 
      node.status === 'active'
    )
    
    if (availableNodes.length === 0) {
      notify.error(t('routes.friendNodes.noAvailableNodes'))
      return
    }
    
    // 设置对话框状态
    connectionDialog.value.selectedFriendNode = friendNode
    nodeSelectionDialog.value.availableNodes = availableNodes
    nodeSelectionDialog.value.show = true
    
  } catch (error) {
    console.error('获取我的节点失败:', error)
    notify.error(t('routes.friendNodes.loadNodesError'))
  }
}

// 选择我的节点
const selectMyNode = (myNode: any) => {
  connectionDialog.value.selectedMyNode = myNode
  nodeSelectionDialog.value.show = false
  connectionDialog.value.show = true
  
  // 设置默认消息
  if (connectionDialog.value.selectedFriendNode && myNode) {
    connectionDialog.value.message = t('routes.friendNodes.defaultMessage', {
      friendName: connectionDialog.value.selectedFriendNode.friend_name,
      friendNodeName: connectionDialog.value.selectedFriendNode.node_name,
      myNodeName: myNode.name
    })
  }
}

// 确认连接
const confirmConnection = async () => {
  if (!connectionDialog.value.selectedFriendNode || !connectionDialog.value.selectedMyNode) {
    notify.error(t('routes.friendNodes.incompleteSelection'))
    return
  }
  
  if (!connectionDialog.value.message || connectionDialog.value.message.length < 10) {
    notify.error(t('routes.friendNodes.messageRequired'))
    return
  }
  
  try {
    const requestData = {
      target_user_id: connectionDialog.value.selectedFriendNode.friend_id,
      target_node_id: connectionDialog.value.selectedFriendNode.id,
      source_node_id: connectionDialog.value.selectedMyNode.id,
      message: connectionDialog.value.message
    }
    
    await createRouteRequest(requestData)
    
    // 关闭对话框并重置状态
    connectionDialog.value.show = false
    resetDialogState()
    
  } catch (error) {
    console.error('创建路由请求失败:', error)
    notify.error(t('routes.friendNodes.connectionError'))
  }
}

// 重置对话框状态
const resetDialogState = () => {
  connectionDialog.value = {
    show: false,
    selectedFriendNode: null,
    selectedMyNode: null,
    message: ''
  }
  nodeSelectionDialog.value = {
    show: false,
    availableNodes: []
  }
}

// 过滤后的节点
const filteredNodes = computed(() => {
  let filtered = props.friendNodes

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(node => 
      node.friend_name.toLowerCase().includes(query) ||
      node.node_name.toLowerCase().includes(query) ||
      node.ip_address.includes(query) ||
      node.zone_name.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(node => node.connection_status === statusFilter.value)
  }

  return filtered
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'positive'
    case 'connected': return 'info'
    case 'pending': return 'orange'
    case 'unavailable': return 'negative'
    default: return 'grey'
  }
}

// 跳转到社交页面
const goToSocial = () => {
  router.push('/social')
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style lang="scss" scoped>
.friend-nodes-tab {
  .node-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }

  .node-selection-card {
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
