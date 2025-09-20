<template>
  <PageLayout
    :title="$t('social.friends.title')"
    :subtitle="$t('social.friends.subtitle')"
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
      :items="friendsStatsCards"
      :loading="loading"
      :loading-count="2"
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

    <!-- 好友列表 -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ $t('social.friends.list') }}</div>
        
        <ResponsiveCardGrid
          :items="friends"
          :loading="loadingFriends"
          :loading-count="6"
          spacing="normal"
          variant="user"
          :clickable="true"
          @click="handleUserClick"
        >
          <template #default="{ item }">
            <SocialCard
              :user="item"
              type="friend"
              @action="handleFriendAction"
            />
          </template>
          <template #empty>
            <div class="text-center text-grey-6 q-pa-xl">
              <q-icon name="group" size="4rem" class="q-mb-md" />
              <div class="text-h6">{{ $t('social.friends.empty.title') }}</div>
              <div class="text-body2">{{ $t('social.friends.empty.description') }}</div>
              <q-btn
                color="primary"
                :label="$t('social.friends.empty.action')"
                class="q-mt-md"
                @click="handleSearchUser"
              />
            </div>
          </template>
        </ResponsiveCardGrid>
      </q-card-section>
    </q-card>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useSocial, useNotify } from '../../composables'
import { User } from '../../types/user'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import SocialCard from '../../components/social/SocialCard.vue'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const { success: notifySuccess, error: notifyError } = useNotify()

// 使用组合式函数
const {
  friends,
  loadingFriends,
  loading,
  loadFriends,
  acceptFriendRequest,
  removeFriend
} = useSocial()

// 统计卡片数据
const friendsStatsCards = computed(() => [
  {
    title: t('social.stats.totalFriends'),
    value: friends.value?.length || 0,
    icon: 'group',
    color: 'primary'
  },
  {
    title: t('social.stats.onlineFriends'),
    value: friends.value?.filter(f => f.is_online).length || 0,
    icon: 'wifi',
    color: 'positive'
  }
])

// 事件处理
const handleSearchUser = () => {
  $q.dialog({
    title: t('social.search.title'),
    message: t('social.search.description'),
    prompt: {
      model: '',
      isValid: val => val && val.length > 0,
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    // TODO: 实现用户搜索功能
    console.log('Search user:', data)
  })
}

const handleUserClick = (user: User) => {
  // 导航到用户详情页面
  router.push(`/app/users/${user.id}`)
}

const handleFriendAction = async (action: string, user: User) => {
  try {
    switch (action) {
      case 'remove':
        await removeFriend(user.id)
        notifySuccess(t('social.friends.removedSuccess'))
        break
      default:
        console.log('Unknown action:', action)
    }
  } catch (error: any) {
    notifyError(error.message || t('social.friends.actionFailed'))
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadFriends()
})
</script>

<style scoped>
.friends-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>