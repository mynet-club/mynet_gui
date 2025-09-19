<template>
  <PageLayout
    :title="$t('navigation.social')"
    :subtitle="$t('social.subtitle')"
    icon="people"
  >
    <template #actions>
      <q-btn
        color="primary"
        icon="search"
        :label="$t('social.search.title')"
        @click="handleSearchUser"
      />
    </template>

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

        <!-- 邀请 -->
        <q-tab-panel name="invitations">
          <InvitationsTab
            :invitations="invitations"
            :loading="loading"
            @create="handleCreateInvitation"
            @copy="handleCopyInvitation"
            @delete="handleDeleteInvitation"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- 搜索用户对话框 -->
    <q-dialog v-model="searchDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('social.search.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="searchDialog.query"
            :label="$t('social.search.placeholder')"
            dense
            outlined
            @keyup.enter="performSearch"
          >
            <template v-slot:append>
              <q-icon 
                name="search" 
                @click="performSearch"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          
          <!-- 搜索结果 -->
          <div v-if="searchResults.length > 0" class="q-mt-md">
            <q-separator class="q-mb-md" />
            <div class="text-subtitle2 q-mb-sm">{{ $t('social.search.title') }}</div>
            <q-list>
              <q-item 
                v-for="user in searchResults" 
                :key="user.user_id || user.id"
                class="q-pa-sm"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ user.name?.charAt(0)?.toUpperCase() }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption>ID: {{ user.user_id || user.id }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    color="primary"
                    size="sm"
                    :label="$t('social.dialogs.sendRequest.send')"
                    @click="handleSendRequest(user.user_id || user.id, user.name)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-else-if="searchPerformed && searchResults.length === 0" class="q-mt-md text-center text-grey-6">
            {{ $t('social.search.noResults') }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="closeSearchDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 创建邀请码对话框 -->
    <q-dialog v-model="invitationDialog.show">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('social.dialogs.createInvitation.title') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.number="invitationDialog.expiresIn"
            type="number"
            :label="$t('social.dialogs.createInvitation.expiresIn')"
            outlined
            min="1"
            max="365"
            :suffix="$t('common.days')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('social.dialogs.createInvitation.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :label="$t('social.dialogs.createInvitation.create')"
            @click="confirmCreateInvitation"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSocial } from '../../composables/useSocial'
import { useNotify } from '../../composables/useNotify'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import FriendsTab from '../../components/social/FriendsTab.vue'
import FriendRequestsTab from '../../components/social/FriendRequestsTab.vue'
import SearchTab from '../../components/social/SearchTab.vue'
import InvitationsTab from '../../components/social/InvitationsTab.vue'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()
const $q = useQuasar()
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
  deleteInvitation,
  getFriendNodes,
  handleRequestTypeChange,
  init
} = useSocial()

// 响应式状态
const tab = ref('friends')

// 搜索相关状态
const searchDialog = ref({
  show: false,
  query: ''
})
const searchPerformed = ref(false)
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
    debug.error('Failed to get friend nodes:', error)
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

const handleDeleteInvitation = async (invitation: any) => {
  $q.dialog({
    title: t('common.delete'),
    message: t('social.confirmDeleteInvitation', { code: invitation.invitation_code }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await deleteInvitation(invitation)
  })
}

const handleSearchUser = () => {
  searchDialog.value.show = true
  searchDialog.value.query = ''
  searchResults.value = []
  searchPerformed.value = false
}

const performSearch = async () => {
  if (!searchDialog.value.query.trim()) return
  
  try {
    await searchUsers(searchDialog.value.query)
    searchPerformed.value = true
  } catch (error) {
    debug.error('搜索用户失败:', error)
    notify.error(t('social.searchError'))
  }
}

const closeSearchDialog = () => {
  searchDialog.value.show = false
  searchDialog.value.query = ''
  searchResults.value = []
  searchPerformed.value = false
}

const handleAcceptInvitation = (invitationId: string | number) => {
  debug.log('接受邀请:', invitationId)
}

const handleRejectInvitation = (invitationId: string | number) => {
  debug.log('拒绝邀请:', invitationId)
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
