<template>
  <PageLayout
    :title="$t('social.friendRequests.title')"
    :subtitle="$t('social.friendRequests.subtitle')"
    icon="person_add"
  >
    <!-- 统计卡片 -->
    <ResponsiveCardGrid
      :items="requestsStatsCards"
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

    <!-- 好友请求列表 -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ $t('social.friendRequests.pending') }}</div>
        
        <ResponsiveCardGrid
          :items="friendRequests"
          :loading="loadingRequests"
          :loading-count="4"
          spacing="normal"
          variant="compact"
          :clickable="false"
        >
          <template #default="{ item }">
            <SocialCard
              :user="item"
              type="request"
              @action="handleRequestAction"
            />
          </template>
          <template #empty>
            <div class="text-center text-grey-6 q-pa-xl">
              <q-icon name="person_add" size="4rem" class="q-mb-md" />
              <div class="text-h6">{{ $t('social.friendRequests.empty.title') }}</div>
              <div class="text-body2">{{ $t('social.friendRequests.empty.description') }}</div>
            </div>
          </template>
        </ResponsiveCardGrid>
      </q-card-section>
    </q-card>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useSocial, useNotify } from '../../composables'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import SocialCard from '../../components/social/SocialCard.vue'

const { t } = useI18n()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 使用组合式函数
const {
  friendRequests,
  loadingRequests,
  loading,
  loadFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest
} = useSocial()

// 统计卡片数据
const requestsStatsCards = computed(() => [
  {
    title: t('social.stats.pendingRequests'),
    value: friendRequests.value?.length || 0,
    icon: 'pending',
    color: 'warning'
  },
  {
    title: t('social.stats.todayRequests'),
    value: friendRequests.value?.filter(r => isToday(r.created_at)).length || 0,
    icon: 'today',
    color: 'info'
  }
])

// 工具函数
const isToday = (dateString: string): boolean => {
  const today = new Date()
  const date = new Date(dateString)
  return today.toDateString() === date.toDateString()
}

// 事件处理
const handleRequestAction = async (action: string, user: any) => {
  try {
    switch (action) {
      case 'accept':
        await acceptFriendRequest(user.id)
        notifySuccess(t('social.friendRequests.acceptedSuccess'))
        break
      case 'reject':
        await rejectFriendRequest(user.id)
        notifySuccess(t('social.friendRequests.rejectedSuccess'))
        break
      default:
        console.log('Unknown action:', action)
    }
  } catch (error: any) {
    notifyError(error.message || t('social.friendRequests.actionFailed'))
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadFriendRequests()
})
</script>

<style scoped>
.friend-requests-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>