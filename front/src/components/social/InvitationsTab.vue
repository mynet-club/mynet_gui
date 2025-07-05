<template>
  <div class="invitations-tab">
    <!-- 创建邀请码按钮 -->
    <div class="row q-mb-md">
      <div class="col-auto">
        <q-btn
          @click="$emit('create')"
          color="primary"
          :label="$t('social.invitations.createNew')"
          icon="add"
          no-caps
        />
      </div>
    </div>

    <!-- 邀请码列表 -->
    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else-if="invitations.length === 0" class="text-center q-py-lg">
      <q-icon name="card_giftcard" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">{{ $t('social.invitations.noInvitations') }}</div>
    </div>

    <div v-else class="q-gutter-md">
      <q-card
        v-for="invitation in invitations"
        :key="invitation.id"
        class="invitation-card"
      >
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-icon name="card_giftcard" size="24px" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle1 text-weight-medium">{{ invitation.code }}</div>
                  <div class="text-caption text-grey-6">
                    {{ $t('social.invitations.createdAt') }}: {{ formatDate(invitation.created_at) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-auto">
              <q-chip
                :color="getStatusColor(invitation.status)"
                text-color="white"
                :label="$t(`social.invitations.${invitation.status}`)"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md">
            <div class="col">
              <div class="text-caption text-grey-6">
                {{ $t('social.invitations.expiresAt') }}: {{ formatDate(invitation.expires_at) }}
              </div>
            </div>
            <div v-if="invitation.used_at" class="col">
              <div class="text-caption text-grey-6">
                {{ $t('social.invitations.usedAt') }}: {{ formatDate(invitation.used_at) }}
              </div>
            </div>
            <div v-if="invitation.used_by" class="col">
              <div class="text-caption text-grey-6">
                {{ $t('social.invitations.usedBy') }}: {{ invitation.used_by }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions v-if="invitation.status === 'active'" align="right">
          <q-btn
            @click="$emit('copy', invitation.code)"
            flat
            color="primary"
            :label="$t('social.invitations.copyCode')"
            icon="content_copy"
            size="sm"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Invitation } from '../../types'

interface Props {
  invitations: Invitation[]
  loading: boolean
}

interface Emits {
  (e: 'create'): void
  (e: 'copy', code: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'positive'
    case 'used':
      return 'info'
    case 'expired':
      return 'negative'
    default:
      return 'grey'
  }
}
</script>

<style lang="scss" scoped>
.invitations-tab {
  .invitation-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
