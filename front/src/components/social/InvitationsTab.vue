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

    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else-if="invitations.length === 0" class="text-center q-py-lg">
      <q-icon name="card_giftcard" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">{{ $t('social.invitations.noInvitations') }}</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="invitation in invitations"
        :key="invitation.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="invitation-card full-height">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="row items-center q-mb-sm">
                  <q-icon name="card_giftcard" size="24px" class="q-mr-sm" />
                  <div>
                    <div class="text-subtitle1 text-weight-medium">{{ invitation.invitation_code }}</div>
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
        </q-card>
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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
.invitations-tab {
  .invitation-card {
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
    
    &:hover {
      transform: translateY(-2px);
    }
  }

  .q-card__section {
    flex: 1;
  }

  .q-card__actions {
    padding-top: 0;
  }
}
</style>
