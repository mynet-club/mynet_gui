<template>
  <div class="friend-requests-tab">
    <!-- 请求类型切换 -->
    <div class="row q-mb-md">
      <q-tabs
        v-model="requestType"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="received" :label="$t('social.friendRequests.received')" />
        <q-tab name="sent" :label="$t('social.friendRequests.sent')" />
      </q-tabs>
    </div>

    <!-- 请求列表 -->
    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else-if="requests.length === 0" class="text-center q-py-lg">
      <q-icon name="person_add" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">{{ $t('social.friendRequests.noRequests') }}</div>
    </div>

    <div v-else class="q-gutter-md">
      <q-card
        v-for="request in requests"
        :key="request.id"
        class="request-card"
      >
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" class="q-mr-sm">
                  <img 
                    v-if="requestType === 'received' ? request.requester_avatar : request.target_avatar" 
                    :src="requestType === 'received' ? request.requester_avatar : request.target_avatar"
                    :alt="requestType === 'received' ? request.requester_name : request.target_name"
                  />
                  <q-icon v-else name="person" size="24px" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-medium">
                    {{ requestType === 'received' ? request.requester_name : request.target_name }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ $t('social.friendRequests.requestTime') }}: {{ formatDate(request.created_at) }}
                  </div>
                </div>
              </div>
              
              <div v-if="request.message" class="q-mt-sm">
                <div class="text-body2 text-grey-7">
                  <strong>{{ $t('social.friendRequests.message') }}:</strong>
                  {{ request.message }}
                </div>
              </div>
            </div>
            
            <div class="col-auto">
              <div v-if="requestType === 'received' && request.status === 'pending'" class="q-gutter-sm">
                <q-btn
                  @click="$emit('accept', request.id)"
                  color="positive"
                  :label="$t('social.friendRequests.accept')"
                  size="sm"
                  no-caps
                />
                <q-btn
                  @click="$emit('reject', request.id)"
                  color="negative"
                  :label="$t('social.friendRequests.reject')"
                  size="sm"
                  no-caps
                  outline
                />
              </div>
              
              <div v-else-if="requestType === 'sent' && request.status === 'pending'" class="q-gutter-sm">
                <q-btn
                  @click="$emit('cancel', request.id)"
                  color="negative"
                  :label="$t('social.friendRequests.cancel')"
                  size="sm"
                  no-caps
                  outline
                />
              </div>
              
              <div v-else>
                <q-chip
                  :color="getStatusColor(request.status)"
                  text-color="white"
                  :label="$t(`social.friendRequests.status.${request.status}`)"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FriendRequest } from '../../types'

interface Props {
  requests: FriendRequest[]
  loading: boolean
}

interface Emits {
  (e: 'accept', requestId: string): void
  (e: 'reject', requestId: string): void
  (e: 'cancel', requestId: string): void
  (e: 'type-change', type: 'received' | 'sent'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const requestType = ref<'received' | 'sent'>('received')

watch(requestType, (newType) => {
  emit('type-change', newType)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'positive'
    case 'rejected':
      return 'negative'
    case 'pending':
      return 'orange'
    default:
      return 'grey'
  }
}
</script>

<style lang="scss" scoped>
.friend-requests-tab {
  .request-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
