<template>
  <q-page padding>
    <div class="page-header q-mb-lg">
      <h4 class="text-h4 q-ma-none">{{ $t('social.invitations.title') }}</h4>
      <p class="text-grey-6 q-ma-none q-mt-sm">{{ $t('social.subtitle') }}</p>
    </div>

    <!-- 功能选项卡 -->
    <div class="row q-mb-md">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="search" :label="$t('social.search.title')" icon="search" />
        <q-tab name="invitations" :label="$t('social.invitations.title')" icon="card_giftcard" />
      </q-tabs>
    </div>

    <!-- 搜索用户标签页 -->
    <div v-show="activeTab === 'search'">
      <!-- 搜索框 -->
      <div class="row q-mb-md">
        <div class="col-12 col-md-8">
          <q-input
            v-model="searchQuery"
            :placeholder="$t('social.search.placeholder')"
            outlined
            dense
            clearable
            @keyup.enter="handleSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn
                @click="handleSearch"
                color="primary"
                :label="$t('common.search')"
                size="sm"
                no-caps
                :disable="!searchQuery.trim()"
                :loading="searchLoading"
              />
            </template>
          </q-input>
        </div>
      </div>

      <!-- 搜索结果 -->
      <ResponsiveCardGrid
        :items="searchResults"
        :loading="searchLoading"
        :loading-count="6"
        variant="standard"
        spacing="normal"
        :empty-icon="searchQuery.trim() ? 'search_off' : 'search'"
        :empty-title="searchQuery.trim() ? $t('social.search.noResults') : $t('social.search.title')"
        :clickable="false"
      >
        <template #default="{ item: user, index }">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="row items-center q-mb-sm">
                  <q-avatar size="50px" class="q-mr-md">
                    <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                    <q-icon v-else name="person" size="30px" />
                  </q-avatar>
                  <div>
                    <div class="text-h6 text-weight-bold">{{ user.name }}</div>
                    <div class="text-caption text-grey-6">
                      {{ $t('social.search.zone') }}: {{ user.zone_name }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ $t('social.search.lastActive') }}: {{ formatDate(user.last_active) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-auto">
                <q-btn
                  v-if="user.is_friend"
                  color="positive"
                  :label="$t('social.search.friend')"
                  size="sm"
                  no-caps
                  disabled
                  icon="check"
                />
                <q-btn
                  v-else-if="user.has_pending_request"
                  color="orange"
                  :label="$t('social.search.requested')"
                  size="sm"
                  no-caps
                  disabled
                  icon="schedule"
                />
                <q-btn
                  v-else
                  @click="sendFriendRequest(user.user_id, user.name)"
                  color="primary"
                  :label="$t('social.search.addFriend')"
                  size="sm"
                  no-caps
                  icon="person_add"
                  :loading="loading"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-gutter-md text-center">
              <div class="col">
                <div class="text-h6 text-primary">{{ user.node_count }}</div>
                <div class="text-caption text-grey-6">{{ $t('social.friends.nodes') }}</div>
              </div>
              <div class="col">
                <div class="text-h6 text-secondary">{{ (user as any).mutual_friends || 0 }}</div>
                <div class="text-caption text-grey-6">{{ $t('social.friends.mutualFriends') }}</div>
              </div>
            </div>
          </q-card-section>
        </template>
      </ResponsiveCardGrid>
    </div>

    <!-- 邀请码管理标签页 -->
    <div v-show="activeTab === 'invitations'">
      <div class="row q-mb-md">
        <div class="col-auto">
          <q-btn
            @click="createInvitation"
            color="primary"
            :label="$t('social.invitations.createNew')"
            icon="add"
            no-caps
            :loading="loading"
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
              <div class="detail-row">
                <q-icon name="people" size="sm" color="info" class="q-mr-sm" />
                <span class="text-caption text-grey-6">
                  {{ $t('social.invitations.usageCount') }}: {{ invitation.used_count }} / {{ invitation.max_uses }}
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

          <q-card-actions v-if="invitation.is_valid || (getInvitationStatus(invitation.invitation_status) === 'expired' && invitation.used_count === 0)" align="right">
            <q-btn
              v-if="invitation.is_valid"
              @click="copyInvitationLink(invitation.invitation_code)"
              flat
              color="primary"
              :label="$t('social.invitations.copyInviteLink')"
              icon="content_copy"
              size="sm"
              no-caps
            />
            <q-btn
              v-if="getInvitationStatus(invitation.invitation_status) === 'expired' && invitation.used_count === 0"
              @click="deleteInvitation(invitation)"
              flat
              color="negative"
              :label="$t('common.delete')"
              icon="delete"
              size="sm"
              no-caps
              :loading="loading"
            />
          </q-card-actions>
        </template>

        <template #emptyAction>
          <q-btn
            @click="createInvitation"
            color="primary"
            :label="$t('social.invitations.createNew')"
            icon="add"
            :loading="loading"
          />
        </template>
      </ResponsiveCardGrid>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import { useSocial } from '../../composables/useSocial'
import type { Invitation, SearchUser } from '../../types'

const { t } = useI18n()
const $q = useQuasar()
const { 
  invitations,
  searchResults,
  searchLoading,
  loading, 
  fetchInvitations,
  createInvitation: createInvite,
  deleteInvitation: deleteInvite,
  searchUsers,
  sendFriendRequest: sendRequest
} = useSocial()

const activeTab = ref<'search' | 'invitations'>('search')
const searchQuery = ref('')

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await searchUsers(searchQuery.value.trim())
  }
}

const sendFriendRequest = async (userId: string, userName: string) => {
  await sendRequest(userId, userName)
}

const createInvitation = async () => {
  await createInvite()
}

const deleteInvitation = async (invitation: Invitation) => {
  await deleteInvite(invitation)
}

const copyInvitationLink = (code: string) => {
  const baseUrl = window.location.origin
  const link = `${baseUrl}/auth/register?invitation=${code}`
  
  navigator.clipboard.writeText(link).then(() => {
    $q.notify({
      type: 'positive',
      message: t('social.invitations.linkCopied'),
      position: 'top'
    })
  }).catch(() => {
    $q.notify({
      type: 'negative', 
      message: t('social.invitations.copyFailed'),
      position: 'top'
    })
  })
}

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

onMounted(() => {
  fetchInvitations()
})
</script>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid var(--q-separator-color);
  padding-bottom: 1rem;
}

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
</style>