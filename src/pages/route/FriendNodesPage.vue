<template>
  <PageLayout
    :title="$t('navigation.friendNodes')"
    :subtitle="$t('routes.friendNodes.subtitle')"
    icon="lan"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn
          color="primary"
          icon="sync"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="loading"
        />
        <q-btn
          color="positive"
          icon="group_add"
          :label="$t('routes.friendNodes.goToSocial')"
          @click="$router.push('/app/social')"
        />
      </div>
    </template>

    <!-- 头像完善提醒 -->
    <AvatarReminder 
      :user-avatar="currentUserAvatar"
      storage-key="friend-nodes-avatar-reminder"
    />

    <!-- 好友节点统计 -->
    <div v-if="friendsData?.data" class="q-mb-lg">
      <ResponsiveCardGrid
        :items="statsCards"
        :loading="false"
        variant="compact"
        spacing="normal"
        :clickable="false"
      >
        <template #default="{ item }">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ item.value }}</div>
                <div class="text-body2 text-grey-6">{{ item.title }}</div>
              </div>
              <div>
                <q-icon :name="item.icon" size="2rem" :color="item.color" />
              </div>
            </div>
          </q-card-section>
        </template>
      </ResponsiveCardGrid>
    </div>

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
      <template #default="{ item: node }">
        <FriendNodeCardContent
          :node="transformNodeData(node)"
          :friend-name="node.owner_name"
          :friend-avatar="node.owner_avatar"
          :friend-id="node.owner_id"
          :show-avatar-hint="!node.owner_avatar"
          @connect="handleConnectToNode(node)"
          @view-details="handleViewDetails(node)"
        />
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
                        :label="getStatusText(node.status)"
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
          <q-btn flat :label="$t('common.cancel')" @click="resetDialogState()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 连接请求对话框 -->
    <q-dialog v-model="connectionDialog.show" persistent max-width="600px">
      <q-card class="full-width">
        <q-card-section>
          <div class="text-h6">{{ $t('routes.friendNodes.sendConnectionRequest') }}</div>
          <div class="text-subtitle2 q-mt-sm">
            {{ $t('routes.friendNodes.connectionRequestHint') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <div class="text-body2 text-grey-7">{{ $t('routes.friendNodes.friendNode') }}</div>
              <div class="text-body1">{{ connectionDialog.targetNodeName }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-body2 text-grey-7">{{ $t('routes.friendNodes.myNode') }}</div>
              <div class="text-body1">{{ connectionDialog.sourceNodeName }}</div>
            </div>
          </div>

          <q-input
            v-model="connectionDialog.message"
            type="textarea"
            :label="$t('routes.friendNodes.requestMessage')"
            :hint="$t('routes.friendNodes.requestMessageHint')"
            rows="4"
            outlined
            counter
            maxlength="500"
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
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { useRoutes } from '../../composables/useRoutes'
import { useNodes } from '../../composables/useNodes'
import { useSocial } from '../../composables/useSocial'
import { useNotify } from '../../composables/useNotify'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import AvatarReminder from '../../components/social/AvatarReminder.vue'
import FriendNodeCardContent from '../../components/route/FriendNodeCardContent.vue'

interface FriendNodeData {
  id: number
  name: string
  vpn_type: string
  status: string | number
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
  vpn_ip?: string
  endpoint_ip?: string
  endpoint_port?: number
}

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const { createRouteRequest } = useRoutes()
const { nodes, loadNodes } = useNodes()
const { getAllFriendNodes } = useSocial()

// 响应式状态
const loading = ref(false)
const friendsData = ref<any>(null)

// 当前用户头像
const currentUserAvatar = computed(() => user.value?.avatar || '')

// 对话框状态
const nodeSelectionDialog = ref({
  show: false,
  targetNode: null as FriendNodeData | null,
  availableNodes: [] as any[]
})

const connectionDialog = ref({
  show: false,
  targetNodeId: 0,
  targetNodeName: '',
  targetUserId: 0,
  sourceNodeId: 0,
  sourceNodeName: '',
  message: ''
})

// 计算属性
const allNodes = computed(() => {
  if (!friendsData.value?.data?.friends_nodes) return []
  
  const nodes: FriendNodeData[] = []
  friendsData.value.data.friends_nodes.forEach((friend: any) => {
    friend.nodes.forEach((node: FriendNodeData) => {
      nodes.push({
        ...node,
        owner_id: friend.friend_id,
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

const statsCards = computed(() => {
  if (!friendsData.value?.data) return []
  
  return [
    {
      id: 'friends_count',
      title: t('routes.friendNodes.stats.friendsCount'),
      value: friendsData.value.data.friends_count,
      icon: 'group',
      color: 'primary'
    },
    {
      id: 'total_nodes',
      title: t('routes.friendNodes.stats.totalNodes'),
      value: friendsData.value.data.total_nodes,
      icon: 'lan',
      color: 'positive'
    },
    {
      id: 'online_nodes',
      title: t('routes.friendNodes.stats.onlineNodes'),
      value: allNodes.value.filter(n => isNodeOnline(n.status)).length,
      icon: 'wifi',
      color: 'positive'
    },
    {
      id: 'offline_nodes',
      title: t('routes.friendNodes.stats.offlineNodes'),
      value: allNodes.value.filter(n => !isNodeOnline(n.status)).length,
      icon: 'wifi_off',
      color: 'grey'
    }
  ]
})

// 转换节点数据为组件所需格式
const transformNodeData = (node: FriendNodeData) => {
  return {
    node_id: node.id,
    node_name: node.name,
    node_status: convertStatus(node.status),
    vpn_ip: node.vpn_ip || '',
    endpoint_ip: node.endpoint_ip || node.endpoint?.split(':')[0] || '',
    endpoint_port: node.endpoint_port || (node.endpoint?.split(':')[1] ? parseInt(node.endpoint.split(':')[1]) : 0),
    last_seen: node.last_seen,
    created_at: node.created_at,
    description: node.description,
    vpn_type: node.vpn_type,
    user_name: node.owner_name,
    user_avatar: node.owner_avatar
  }
}

// 转换状态为数字格式
const convertStatus = (status: string | number): number => {
  if (typeof status === 'number') return status
  
  const statusMap: Record<string, number> = {
    'online': 2,
    'active': 2,
    'enabled': 1,
    'disabled': 0,
    'offline': 0,
    'inactive': 0,
    'unconfigured': -1
  }
  
  return statusMap[status.toLowerCase()] ?? 0
}

// 判断节点是否在线
const isNodeOnline = (status: string | number): boolean => {
  if (typeof status === 'number') {
    return status === 2 // ONLINE
  }
  return status === 'online' || status === 'active'
}

// 事件处理
const handleRefresh = async () => {
  await fetchAllFriendNodes()
}

const handleViewFriend = (friendId: number) => {
  router.push(`/app/social/friends/${friendId}`)
}

const handleViewDetails = (node: FriendNodeData) => {
  // TODO: 实现查看好友节点详情
  notify.info('节点详情功能开发中')
}

const handleConnectToNode = async (node: FriendNodeData) => {
  nodeSelectionDialog.value = {
    show: true,
    targetNode: node,
    availableNodes: []
  }
  
  // 加载我的可用节点
  await loadNodes()
  const myAvailableNodes = nodes.value.filter(n => {
    const status = n.status || n.node_status
    return status === 'active' || status === 1 || status === 2
  })
  nodeSelectionDialog.value.availableNodes = myAvailableNodes
}

const selectMyNode = (myNode: any) => {
  const targetNode = nodeSelectionDialog.value.targetNode
  if (!targetNode) return
  
  connectionDialog.value = {
    show: true,
    targetNodeId: targetNode.id,
    targetNodeName: targetNode.name,
    targetUserId: targetNode.owner_id,
    sourceNodeId: myNode.id,
    sourceNodeName: myNode.node_name || myNode.name,
    message: ''
  }
  
  nodeSelectionDialog.value.show = false
}

const confirmConnection = async () => {
  try {
    await createRouteRequest({
      source_node_id: connectionDialog.value.sourceNodeId.toString(),
      target_node_id: connectionDialog.value.targetNodeId.toString(),
      target_user_id: connectionDialog.value.targetUserId.toString(),
      message: connectionDialog.value.message
    })
    
    notify.success(t('routes.friendNodes.requestSent'))
    resetDialogState()
  } catch (error) {
    notify.error(t('routes.friendNodes.requestError'))
  }
}

const resetDialogState = () => {
  nodeSelectionDialog.value = {
    show: false,
    targetNode: null,
    availableNodes: []
  }
  
  connectionDialog.value = {
    show: false,
    targetNodeId: 0,
    targetNodeName: '',
    targetUserId: 0,
    sourceNodeId: 0,
    sourceNodeName: '',
    message: ''
  }
}

const fetchAllFriendNodes = async () => {
  try {
    loading.value = true
    const response = await getAllFriendNodes()
    friendsData.value = response
  } catch (error) {
    notify.error(t('routes.fetchAllFriendNodesError'))
  } finally {
    loading.value = false
  }
}

// 工具方法
const getStatusColor = (status: string | number) => {
  if (typeof status === 'number') {
    return status === 2 ? 'positive' : 'grey'
  }
  
  switch (status) {
    case 'online': return 'positive'
    case 'offline': return 'grey'
    case 'active': return 'positive'
    case 'inactive': return 'grey'
    default: return 'grey'
  }
}

const getStatusText = (status: string | number) => {
  if (typeof status === 'number') {
    const statusMap: Record<number, string> = {
      2: '在线',
      1: '已启用',
      0: '已禁用',
      [-1]: '未配置'
    }
    return statusMap[status] || `状态: ${status}`
  }
  
  const statusMap: Record<string, string> = {
    'online': '在线',
    'offline': '离线',
    'active': '活跃',
    'inactive': '非活跃'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 初始化
onMounted(async () => {
  await fetchAllFriendNodes()
})
</script>

<style lang="scss" scoped>
.node-selection-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>