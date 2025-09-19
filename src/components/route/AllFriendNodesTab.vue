<template>
  <div class="all-friend-nodes-tab">

    <!-- 节点列表 -->
    <ResponsiveCardGrid
      :items="allNodes"
      :loading="loading"
      :loading-count="12"
      variant="standard"
      spacing="normal"
      :empty-icon="'lan'"
      :empty-title="$t('routes.friendNodes.noNodes')"
      :empty-description="$t('routes.friendNodes.noNodesDescription')"
      :clickable="false"
    >
      <template #default="{ item: node, index }">
        <q-card-section>
          <!-- 好友信息 -->
          <div class="row items-center q-mb-md">
            <q-avatar size="40px" class="q-mr-sm">
              <img v-if="node.owner_avatar" :src="node.owner_avatar" :alt="node.owner_name" />
              <q-icon v-else name="person" size="24px" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ node.owner_name }}</div>
              <div v-if="node.friend_alias" class="text-caption text-grey-6">{{ node.friend_alias }}</div>
              <div v-if="node.friend_remarks" class="text-caption text-grey-7">{{ node.friend_remarks }}</div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getStatusColor(node.status)"
                :text-color="node.status === 'online' ? 'white' : 'dark'"
                :label="$t(`node.status.${node.status}`)"
                size="sm"
              />
            </div>
          </div>

          <!-- 节点信息 -->
          <div class="q-mb-md">
            <div class="text-h6 text-weight-bold q-mb-xs">{{ node.name }}</div>
            <div class="text-body2 text-grey-6">{{ node.description || $t('routes.friendNodes.noDescription') }}</div>
          </div>

          <!-- 技术信息 -->
          <div class="row q-gutter-md text-center q-mb-md">
            <div class="col">
              <div class="text-body2 text-weight-medium">{{ node.vpn_type.toUpperCase() }}</div>
              <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.vpnType') }}</div>
            </div>
            <div class="col">
              <div class="text-body2 text-weight-medium">{{ node.endpoint }}</div>
              <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.endpoint') }}</div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="row items-center text-caption text-grey-6 q-mb-sm">
            <div class="col">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              {{ $t('routes.friendNodes.lastSeen') }}: {{ formatDate(node.last_seen) }}
            </div>
          </div>
          <div class="row items-center text-caption text-grey-6">
            <div class="col">
              <q-icon name="event" size="14px" class="q-mr-xs" />
              {{ $t('routes.friendNodes.createdAt') }}: {{ formatDate(node.created_at) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('routes.friendNodes.viewFriend')"
            color="primary"
            @click="$emit('view-friend', node.owner_id)"
            size="sm"
          />
          <q-btn
            v-if="node.status === 'online'"
            flat
            :label="$t('routes.friendNodes.connect')"
            color="positive"
            @click="handleConnectToNode(node)"
            size="sm"
          />
          <q-btn
            v-else
            flat
            :label="$t('routes.friendNodes.offline')"
            color="grey"
            disable
            size="sm"
          />
        </q-card-actions>
      </template>

      <template #emptyAction>
        <q-btn
          color="primary"
          :label="$t('routes.friendNodes.goToSocial')"
          @click="$router.push('/app/social')"
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
                <q-item-label class="text-subtitle1">{{ connectionDialog.selectedFriendNode.owner_name }}</q-item-label>
                <q-item-label caption>{{ connectionDialog.selectedFriendNode.name }}</q-item-label>
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
import { ref, computed, watch } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../composables/useRoutes'
import { useNodes } from '../../composables/useNodes'
import { useNotify } from '../../composables/useNotify'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'

interface FriendNodeData {
  id: number
  name: string
  vpn_type: string
  status: string
  endpoint: string
  description: string
  owner_id: number
  owner_name: string
  owner_email: string
  owner_avatar: string
  friend_alias: string | undefined
  friend_remarks: string | undefined
  last_seen: string
  created_at: string
}

interface Props {
  friendsData: {
    success: boolean
    data: {
      friends_count: number
      total_nodes: number
      friends_nodes: Array<{
        friend_id: number
        friend_name: string
        friend_email: string
        friend_avatar: string
        friend_alias?: string
        friend_remarks?: string
        nodes_count: number
        nodes: FriendNodeData[]
      }>
    }
  } | null
  loading: boolean
}

interface Emits {
  (e: 'connect', nodeId: number, nodeName: string, friendName: string): void
  (e: 'view-friend', friendId: number): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const router = useRouter()
const { createRouteRequest } = useRoutes()
const { nodes, loadNodes } = useNodes()
const notify = useNotify()

// 连接对话框状态
const connectionDialog = ref({
  show: false,
  selectedFriendNode: null as FriendNodeData | null,
  selectedMyNode: null as any,
  message: ''
})

// 我的节点选择对话框
const nodeSelectionDialog = ref({
  show: false,
  availableNodes: [] as any[]
})

// 响应式状态
// （移除了搜索和过滤功能）

// 计算属性
const allNodes = computed(() => {
  if (!props.friendsData?.data?.friends_nodes) return []
  
  const nodes: FriendNodeData[] = []
  props.friendsData.data.friends_nodes.forEach(friend => {
    friend.nodes.forEach(node => {
      nodes.push({
        ...node,
        owner_name: friend.friend_name,
        owner_email: friend.friend_email,
        owner_avatar: friend.friend_avatar,
        friend_alias: friend.friend_alias,
        friend_remarks: friend.friend_remarks
      })
    })
  })
  return nodes
})

const filteredNodes = computed(() => {
  return allNodes.value
})

const friendsCount = computed(() => props.friendsData?.data?.friends_count || 0)
const totalNodes = computed(() => props.friendsData?.data?.total_nodes || 0)

const onlineNodes = computed(() => allNodes.value.filter(node => node.status === 'online'))
const availableNodes = computed(() => allNodes.value.filter(node => node.status === 'online'))

// 方法
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'positive'
    case 'offline':
      return 'grey-5'
    default:
      return 'grey'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (error) {
    return '-'
  }
}

// 处理连接到节点
const handleConnectToNode = async (friendNode: FriendNodeData) => {
  try {
    // 加载我的节点列表
    await loadNodes()
    
    // 筛选可用的节点（状态为 active）
    const availableMyNodes = nodes.value.filter(node => 
      node.status === 'active'
    )
    
    if (availableMyNodes.length === 0) {
      notify.error(t('routes.friendNodes.noAvailableNodes'))
      return
    }
    
    // 设置对话框状态
    connectionDialog.value.selectedFriendNode = friendNode
    nodeSelectionDialog.value.availableNodes = availableMyNodes
    nodeSelectionDialog.value.show = true
    
  } catch (error) {
    debug.error('获取我的节点失败:', error)
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
      friendName: connectionDialog.value.selectedFriendNode.owner_name,
      friendNodeName: connectionDialog.value.selectedFriendNode.name,
      myNodeName: myNode.name || myNode.node_name
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
      target_user_id: String(connectionDialog.value.selectedFriendNode.owner_id),
      target_node_id: String(connectionDialog.value.selectedFriendNode.id),
      source_node_id: String(connectionDialog.value.selectedMyNode.id),
      message: connectionDialog.value.message
    }
    
    await createRouteRequest(requestData)
    
    // 关闭对话框并重置状态
    connectionDialog.value.show = false
    resetDialogState()
    
  } catch (error) {
    debug.error('创建路由请求失败:', error)
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

// 移除了搜索监听器
</script>

<style lang="scss" scoped>
.all-friend-nodes-tab {
  .stats-card {
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
