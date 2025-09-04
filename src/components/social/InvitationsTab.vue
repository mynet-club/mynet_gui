<template>
  <div class="invitations-tab">
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
    <ResponsiveCardGrid
      :items="invitations"
      :loading="loading"
      :loading-count="8"
      variant="standard"
      spacing="normal"
      :empty-icon="'card_giftcard'"
      :empty-title="$t('social.invitations.noInvitations')"
      :clickable="false"
    >
      <template #default="{ item: invitation, index }">
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <div class="col">
              <div class="row items-center">
                <q-icon name="card_giftcard" size="30px" class="q-mr-md" color="primary" />
                <div>
                  <div class="text-h6 text-weight-bold text-mono">{{ invitation.invitation_code }}</div>
                  <div class="text-caption text-grey-6">
                    {{ $t('social.invitations.createdAt') }}: {{ formatDate(invitation.created_at) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getStatusColor(invitation.invitation_status)"
                text-color="white"
                :label="$t(`social.invitations.${getInvitationStatus(invitation.invitation_status)}`)"
                size="md"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="invitation-details">
            <div class="detail-row">
              <q-icon name="schedule" size="sm" color="grey-6" class="q-mr-sm" />
              <span class="text-caption text-grey-6">
                {{ $t('social.invitations.expiresAt') }}: {{ formatDate(invitation.expires_at) }}
              </span>
            </div>
            <div v-if="invitation.used_at" class="detail-row">
              <q-icon name="check_circle" size="sm" color="positive" class="q-mr-sm" />
              <span class="text-caption text-grey-6">
                {{ $t('social.invitations.usedAt') }}: {{ formatDate(invitation.used_at) }}
              </span>
            </div>
            <div v-if="invitation.used_by" class="detail-row">
              <q-icon name="person" size="sm" color="info" class="q-mr-sm" />
              <span class="text-caption text-grey-6">
                {{ $t('social.invitations.usedBy') }}: {{ invitation.used_by }}
              </span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions v-if="invitation.is_valid" align="right">
          <q-btn
            @click="$emit('copy', getInvitationLink(invitation.invitation_code))"
            flat
            color="primary"
            :label="$t('social.invitations.copyInviteLink')"
            icon="content_copy"
            size="sm"
            no-caps
          />
        </q-card-actions>
      </template>

      <template #emptyAction>
        <q-btn
          @click="$emit('create')"
          color="primary"
          :label="$t('social.invitations.createNew')"
          icon="add"
        />
      </template>
    </ResponsiveCardGrid>
  </div>
</template> 

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import type { Invitation } from '../../types'

interface Props {
  invitations: Invitation[]
  loading: boolean
  baseUrl?: string
}

interface Emits {
  (e: 'create'): void
  (e: 'copy', code: string): void
}

const props = defineProps<Props>()

const getInvitationLink = (code: string) => {
  const baseUrl = props.baseUrl || window.location.origin
  return `${baseUrl}/auth/register?invitation=${code}`
}

const { t } = useI18n()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getInvitationStatus = (status: number) => {
  switch (status) {
    case 1:
      return 'active'
    case 2:
      return 'used'
    case 0:
      return 'expired'
    default:
      return 'unknown'
  }
}

const getStatusColor = (status: number) => {
  const statusString = getInvitationStatus(status)
  switch (statusString) {
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
/* 组件特定的样式，响应式卡片布局样式由 ResponsiveCardGrid 和全局样式提供 */
.invitations-tab {
  .invitation-details {
    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
