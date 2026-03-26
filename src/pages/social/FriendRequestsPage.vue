<template>
  <q-page padding>
    <div class="page-header q-mb-lg">
      <h4 class="text-h4 q-ma-none">{{ $t('social.friendRequests.title') }}</h4>
      <p class="text-grey-6 q-ma-none q-mt-sm">{{ $t('social.subtitle') }}</p>
    </div>

    <!-- 请求类型切换 -->
    <div class="row q-mb-md">
      <q-tabs
        v-model="requestType"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        @update:model-value="handleRequestTypeChange"
      >
        <q-tab name="received" :label="$t('social.friendRequests.received')" />
        <q-tab name="sent" :label="$t('social.friendRequests.sent')" />
      </q-tabs>
    </div>

    <!-- 请求列表 -->
    <ResponsiveCardGrid
      :items="currentRequests"
      :loading="loading"
      :loading-count="8"
      variant="standard"
      spacing="normal"
      :empty-icon="'person_add'"
      :empty-title="$t('social.friendRequests.noRequests')"
      :clickable="false"
    >
      <template #default="{ item: request, index }">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-avatar size="50px" class="q-mr-sm">
                  <img 
                    v-if="requestType === 'received' ? request.requester_avatar : request.target_avatar" 
                    :src="requestType === 'received' ? request.requester_avatar || '' : request.target_avatar || ''"
                    :alt="requestType === 'received' ? request.requester_name || '' : request.target_name || ''"
                  />
                  <q-icon v-else name="person" size="30px" />
                </q-avatar> 
                <div>
                  <div class="text-h6 text-weight-bold">
                    {{ requestType === 'received' ? request.from_user_name : request.to_user_name }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ $t('social.friendRequests.requestTime') }}: {{ formatDate(request.created_at) }}
                  </div>
                </div>
              </div>
              
              <!-- 请求消息 -->
              <div v-if="request.message" class="q-mt-sm">
                <div class="text-caption text-grey-6">{{ $t('social.friendRequests.message') }}:</div>
                <div class="text-body2 q-mt-xs">{{ request.message }}</div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="col-auto">
              <div v-if="requestType === 'received' && request.status === 'pending'" class="q-gutter-sm">
                <q-btn
                  flat
                  @click="acceptRequest(request)"
                  color="positive"
                  :label="$t('social.friendRequests.accept')"
                  size="sm"
                  no-caps
                  :loading="loading"
                />
                <q-btn
                  flat
                  @click="rejectRequest(request)"
                  color="negative"
                  :label="$t('social.friendRequests.reject')"
                  size="sm"
                  no-caps
                  :loading="loading"
                />
              </div>
              
              <div v-else-if="requestType === 'sent'" class="q-gutter-sm">
                <q-chip
                  :color="getStatusColor(request.status)"
                  text-color="white"
                  :label="$t(`social.friendRequests.status.${request.status}`)"
                  size="sm"
                />
                <q-btn
                  v-if="request.status === 'pending'"
                  flat
                  @click="cancelRequest(request)"
                  color="negative"
                  :label="$t('social.friendRequests.cancel')"
                  size="sm"
                  no-caps
                  :loading="loading"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import { useSocial } from '../../composables/useSocial'
import { useOnboardingActions } from '../../composables/useOnboardingActions'
import type { FriendRequest } from '../../types'

const { t } = useI18n()
const { 
  friendRequests,
  loading, 
  fetchFriendRequests, 
  acceptFriendRequest,
  rejectFriendRequest,
  currentRequestType,
  handleRequestTypeChange: handleTypeChange
} = useSocial()
const { onFriendAdded } = useOnboardingActions()

const requestType = ref<'received' | 'sent'>('received')

// 使用 composable 返回的 friendRequests（它实际上是 currentRequests 计算属性）
const currentRequests = computed(() => {
  return friendRequests.value
})

const handleRequestTypeChange = (type: 'received' | 'sent') => {
  requestType.value = type
  handleTypeChange(type)
}

const acceptRequest = async (request: FriendRequest) => {
  await acceptFriendRequest(request.request_id.toString())
  onFriendAdded()
}

const rejectRequest = async (request: FriendRequest) => {
  await rejectFriendRequest(request.request_id.toString())
}

const cancelRequest = async (request: FriendRequest) => {
  // TODO: 实现取消发送的好友请求
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange'
    case 'accepted': return 'positive'
    case 'rejected': return 'negative'
    default: return 'grey'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchFriendRequests('received')
})
</script>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid var(--q-separator-color);
  padding-bottom: 1rem;
}
</style>