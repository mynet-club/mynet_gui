<template>
  <q-page padding>
    <div class="page-header q-mb-lg">
      <h4 class="text-h4 q-ma-none">{{ $t('social.friends.title') }}</h4>
      <p class="text-grey-6 q-ma-none q-mt-sm">{{ $t('social.subtitle') }}</p>
    </div>

    <!-- 搜索框 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('social.friends.searchPlaceholder')"
          outlined
          dense
          clearable
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 好友列表 -->
    <ResponsiveCardGrid
      data-tip-target="friends-list"
      :items="friends"
      :loading="loading"
      :loading-count="12"
      variant="standard"
      spacing="normal"
      :empty-icon="'group'"
      :empty-title="$t('social.friends.noFriends')"
      :clickable="false"
    >
      <template #default="{ item: friend }">
        <FriendCardContent
          :friend="friend"
          @view-nodes="viewFriendNodes(friend.id)"
          @view-details="viewFriendDetails(friend.id)"
          @edit-remark="editRemark(friend.id)"
          @edit-tags="editTags(friend.id)"
          @remove-friend="removeFriend(friend.id, friend.name)"
        />
      </template>
    </ResponsiveCardGrid>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import FriendCardContent from '../../components/social/FriendCardContent.vue'
import { useSocial } from '../../composables/useSocial'
import type { Friend } from '../../types'

const { t } = useI18n()
const router = useRouter()
const $q = useQuasar()

const { 
  friends, 
  loading, 
  fetchFriends, 
  removeFriend: removeFriendFromSocial 
} = useSocial()

const searchQuery = ref('')

const handleSearch = (search: string | number | null) => {
  fetchFriends(1, String(search || ''))
}

const removeFriend = async (friendId: string, friendName: string) => {
  await removeFriendFromSocial(friendId, friendName)
}

const viewFriendNodes = (friendId: string) => {
  router.push({ name: 'friend-nodes', params: { friendId } })
}

const viewFriendDetails = (friendId: string) => {
  // TODO: 实现查看好友详情逻辑
  $q.notify({
    type: 'info',
    message: t('common.featureInDevelopment')
  })
}

const editRemark = (friendId: string) => {
  // TODO: 实现编辑备注逻辑
  $q.notify({
    type: 'info',
    message: t('common.featureInDevelopment')
  })
}

const editTags = (friendId: string) => {
  // TODO: 实现编辑标签逻辑
  $q.notify({
    type: 'info',
    message: t('common.featureInDevelopment')
  })
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