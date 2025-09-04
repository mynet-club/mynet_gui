<template>
  <q-page class="social-page">
    <div class="q-pa-md">
      <!-- 页面标题 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('navigation.social') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('social.subtitle') }}
          </p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <ResponsiveCardGrid
        :items="statsCards"
        :loading="loading"
        :loading-count="4"
        variant="compact"
        spacing="normal"
        :clickable="false"
        class="q-mb-lg"
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

      <!-- 标签页 -->
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="friends" :label="$t('social.friends.title')" />
          <q-tab name="requests" :label="$t('social.friendRequests.title')" />
          <q-tab name="search" :label="$t('social.search.title')" />
          <q-tab name="invitations" :label="$t('social.invitations.title')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- 好友列表 -->
          <q-tab-panel name="friends">
            <FriendsTab
              :friends="friends"
              :loading="loading"
              :search="friendsSearch"
              @search="handleFriendsSearch"
              @remove="handleRemoveFriend"
              @view-nodes="handleViewNodes"
            />
          </q-tab-panel>

          <!-- 好友请求 -->
          <q-tab-panel name="requests">
            <FriendRequestsTab
              :requests="friendRequests"
              :loading="loading"
              @accept="handleAcceptRequest"
              @reject="handleRejectRequest"
              @cancel="handleCancelRequest"
              @type-change="handleRequestTypeChange"
            />
          </q-tab-panel>

          <!-- 搜索用户 -->
          <q-tab-panel name="search">
            <SearchTab
              :search-results="searchResults"
              :loading="searchLoading"
              @search="handleUserSearch"
              @send-request="handleSendRequest"
            />
          </q-tab-panel>

          <!-- 邀请码管理 -->
          <q-tab-panel name="invitations">
            <InvitationsTab
              :invitations="invitations"
              :loading="loading"
              @create="handleCreateInvitation"
              @copy="handleCopyInvitation"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- 确认删除对话框 -->
    <q-dialog v-model="removeDialog.show" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('social.dialogs.removeFriend.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('social.dialogs.removeFriend.message', { name: removeDialog.friendName }) }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('social.dialogs.removeFriend.cancel')" color="primary" v-close-popup />
          <q-btn 
            flat 
            :label="$t('social.dialogs.removeFriend.confirm')" 
            color="negative" 
            @click="confirmRemoveFriend"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 发送好友请求对话框 -->
    <q-dialog v-model="requestDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('social.dialogs.sendRequest.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            {{ $t('social.dialogs.sendRequest.message', { name: requestDialog.userName }) }}
          </div>
          <q-input
            v-model="requestDialog.message"
            :label="$t('social.dialogs.sendRequest.messagePlaceholder')"
            type="textarea"
            rows="3"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('social.dialogs.sendRequest.cancel')" color="primary" v-close-popup />
          <q-btn 
            flat 
            :label="$t('social.dialogs.sendRequest.send')" 
            color="primary" 
            @click="confirmSendRequest"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 创建邀请码对话框 -->
    <q-dialog v-model="invitationDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('social.dialogs.createInvitation.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model.number="invitationDialog.expiresIn"
            :label="$t('social.dialogs.createInvitation.expiresIn')"
            type="number"
            min="1"
            max="30"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('social.dialogs.createInvitation.cancel')" color="primary" v-close-popup />
          <q-btn 
            flat 
            :label="$t('social.dialogs.createInvitation.create')" 
            color="primary" 
            @click="confirmCreateInvitation"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSocial } from '../../composables/useSocial'
import { useNotify } from '../../composables/useNotify'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import FriendsTab from '../../components/social/FriendsTab.vue'
import FriendRequestsTab from '../../components/social/FriendRequestsTab.vue'
import SearchTab from '../../components/social/SearchTab.vue'
import InvitationsTab from '../../components/social/InvitationsTab.vue'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()
const {
  loading,
  overview,
  friends,
  friendRequests,
  invitations,
  searchResults,
  searchLoading,
  currentRequestType,
  searchUsers,
  fetchFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  createInvitation,
  getFriendNodes,
  handleRequestTypeChange,
  init
} = useSocial()

// 响应式状态
const tab = ref('friends')
const friendsSearch = ref('')

// 统计卡片数据
const statsCards = computed(() => [
  {
    id: 'friend_count',
    title: t('social.overview.friends'),
    value: overview.value.friend_count,
    icon: 'group',
    color: 'primary'
  },
  {
    id: 'pending_requests',
    title: t('social.overview.pendingRequests'),
    value: overview.value.pending_requests,
    icon: 'person_add',
    color: 'orange'
  },
  {
    id: 'connected_nodes',
    title: t('social.overview.connectedNodes'),
    value: overview.value.connected_nodes,
    icon: 'lan',
    color: 'positive'
  },
  {
    id: 'active_routes',
    title: t('social.overview.activeRoutes'),
    value: overview.value.active_routes,
    icon: 'route',
    color: 'info'
  }
])

// 对话框状态
const removeDialog = ref({
  show: false,
  friendId: '',
  friendName: ''
})

const requestDialog = ref({
  show: false,
  userId: '',
  userName: '',
  message: ''
})

const invitationDialog = ref({
  show: false,
  expiresIn: 7
})

// 事件处理
const handleFriendsSearch = (search: string) => {
  friendsSearch.value = search
  fetchFriends(1, search)
}

const handleRemoveFriend = (friendId: string, friendName: string) => {
  removeDialog.value = {
    show: true,
    friendId,
    friendName
  }
}

const confirmRemoveFriend = async () => {
  await removeFriend(removeDialog.value.friendId, removeDialog.value.friendName)
  removeDialog.value.show = false
}

const handleViewNodes = async (friendId: string) => {
  try {
    const nodes = await getFriendNodes(friendId)
    if (nodes.length > 0) {
      // 跳转到路由页面并显示好友节点
      router.push({
        name: 'routes',
        query: { tab: 'friends', friend: friendId }
      })
    } else {
      notify.info(t('social.noFriendNodes'))
    }
  } catch (error) {
    console.error('Failed to get friend nodes:', error)
    notify.error(t('social.fetchFriendNodesError'))
  }
}

const handleAcceptRequest = (requestId: string) => {
  acceptFriendRequest(requestId)
}

const handleRejectRequest = (requestId: string) => {
  rejectFriendRequest(requestId)
}

const handleCancelRequest = (requestId: number) => {
  cancelFriendRequest(requestId)
}

const handleUserSearch = (query: string) => {
  searchUsers(query)
}

const handleSendRequest = (userId: string, userName: string) => {
  requestDialog.value = {
    show: true,
    userId,
    userName,
    message: ''
  }
}

const confirmSendRequest = async () => {
  await sendFriendRequest(requestDialog.value.userId, requestDialog.value.message)
  requestDialog.value.show = false
}

const handleCreateInvitation = () => {
  invitationDialog.value.show = true
}

const confirmCreateInvitation = async () => {
  await createInvitation(invitationDialog.value.expiresIn)
  invitationDialog.value.show = false
}

const handleCopyInvitation = (code: string) => {
  navigator.clipboard.writeText(code).then(() => {
    notify.success(t('social.invitationCopied'))
  })
}

// 初始化
onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
.social-page {
  .stats-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
