<template>
  <PageLayout
    :title="$t('social.friends.title')"
    :subtitle="$t('social.friends.subtitle')"
    icon="people"
  >
    <template #actions>
      <q-btn
        unelevated
        dense
        no-caps
        color="primary"
        icon="hub"
        label="发起连接申请"
        to="/cloud/routes/create"
        class="q-px-md"
      />
      <q-btn
        dense
        no-caps
        class="btn-ghost"
        icon="person_add"
        :label="$t('navigation.social.requests')"
        to="/cloud/social/requests"
      />
      <q-btn
        dense
        no-caps
        class="btn-ghost"
        icon="send"
        :label="$t('navigation.social.invitations')"
        to="/cloud/social/invitations"
      />
    </template>

    <!-- 搜索栏 -->
    <div class="q-mb-md">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        clearable
        :placeholder="$t('social.friends.searchPlaceholder')"
        @update:model-value="handleSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 好友列表 -->
    <ResponsiveCardGrid
      :items="friends"
      :loading="loading"
      :empty-icon="'people'"
      :empty-title="$t('social.friends.noFriends')"
      :empty-description="$t('social.friends.noFriendsDesc')"
    >
      <template #default="{ item: friend }">
        <FriendCardContent
          :friend="friend"
          @view-nodes="goCreateConnection(friend.id)"
          @view-details="openFriendDetails(friend)"
          @remove-friend="removeFriend(friend.id, friend.name)"
        />
      </template>
    </ResponsiveCardGrid>

    <!-- 好友详情弹窗 -->
    <q-dialog v-model="detailDialog.show">
      <q-card style="min-width: 360px; max-width: 480px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ detailDialog.friend?.name || '好友详情' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="detailDialog.friend" class="q-gutter-sm">
          <div class="row justify-between">
            <span class="text-grey-7">好友 ID</span>
            <span class="text-weight-medium">{{ detailDialog.friend.id }}</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">节点总数</span>
            <span class="text-weight-medium">{{ detailDialog.friend.node_count ?? 0 }}</span>
          </div>
          <div class="row justify-between">
            <span class="text-grey-7">可用节点</span>
            <span class="text-weight-medium">{{ detailDialog.friend.available_node_count ?? 0 }}</span>
          </div>
          <div v-if="detailDialog.friend.created_at" class="row justify-between">
            <span class="text-grey-7">成为好友时间</span>
            <span class="text-weight-medium">{{ detailDialog.friend.created_at }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="关闭" v-close-popup />
          <q-btn
            v-if="detailDialog.friend"
            color="primary"
            icon="hub"
            label="发起连接申请"
            @click="goCreateConnection(detailDialog.friend.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import FriendCardContent from '../../components/social/FriendCardContent.vue'
import { useSocial } from '../../composables/useSocial'
import type { Friend } from '../../types'

const router = useRouter()

const {
  friends,
  loading,
  fetchFriends,
  removeFriend: removeFriendFromSocial
} = useSocial()

const searchQuery = ref('')
const detailDialog = ref<{ show: boolean; friend: Friend | null }>({
  show: false,
  friend: null
})

const handleSearch = (search: string | number | null) => {
  fetchFriends(1, String(search || ''))
}

const removeFriend = async (friendId: string, friendName: string) => {
  await removeFriendFromSocial(friendId, friendName)
}

const goCreateConnection = (friendId: string | number) => {
  detailDialog.value.show = false
  router.push({ path: '/cloud/routes/create', query: { friendId: String(friendId) } })
}

const openFriendDetails = (friend: Friend) => {
  detailDialog.value = { show: true, friend }
}

onMounted(() => {
  fetchFriends()
})
</script>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid var(--q-separator-color);
  padding-bottom: 1rem;
}
</style>
