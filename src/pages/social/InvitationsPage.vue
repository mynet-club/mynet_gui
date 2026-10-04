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
        <q-tab name="search" :label="$t('social.search.title')" icon="search" data-tip-target="invite-friend-btn" />
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
        <template #default="{ item: user }">
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

    <!-- 邀请码标签页（框架 invite code：一个网络区一张个人码，用量与归因都在服务端） -->
    <div v-show="activeTab === 'invitations'">
      <!-- 无当前网络区时不请求：框架按请求上下文取码，上下文为空会在租户 0 上建出一张废码 -->
      <q-banner v-if="!currentTenant" class="bg-orange-1 text-grey-9 q-mb-lg" rounded>
        <template #avatar><q-icon name="warning" color="orange" /></template>
        {{ $t('social.invitations.noZone') }}
      </q-banner>

      <!-- 我的邀请码 -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">{{ $t('social.invitations.myCodeTitle') }}</div>
          <div class="text-caption text-grey-6">{{ $t('social.invitations.myCodeHint') }}</div>
        </q-card-section>

        <q-card-section v-if="myCode" class="q-pt-none">
          <div class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <div class="text-h5 text-weight-bold text-mono">{{ myCode.code }}</div>
            </div>
            <div class="col-auto">
              <q-chip :color="codeStatusColor" text-color="white" :label="codeStatusText" size="md" />
            </div>
          </div>

          <div class="text-caption text-grey-6 q-mt-sm">
            {{ usageLimitText }}
            ·
            <template v-if="myCode.expires_at">
              {{ $t('social.invitations.expiresAt') }}: {{ formatDate(myCode.expires_at) }}
            </template>
            <template v-else>{{ $t('social.invitations.expiresNever') }}</template>
          </div>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              @click="copyText(myCode.code, 'social.invitations.codeCopied')"
              flat
              dense
              no-caps
              color="primary"
              icon="content_copy"
              :label="$t('social.invitations.copyCode')"
              size="sm"
            />
            <q-btn
              @click="copyText(inviteLink(myCode.code), 'social.invitations.linkCopied')"
              flat
              dense
              no-caps
              color="primary"
              icon="link"
              :label="$t('social.invitations.copyInviteLink')"
              size="sm"
            />
          </div>
        </q-card-section>

        <q-card-section v-else class="q-pt-none">
          <div class="text-body2 text-grey-6 q-mb-sm">{{ $t('social.invitations.noCodeYet') }}</div>
          <q-btn
            @click="fetchMyCode"
            outline
            no-caps
            color="primary"
            icon="refresh"
            :label="$t('social.invitations.refreshCode')"
            :loading="inviteLoading"
            :disable="!currentTenant"
          />
        </q-card-section>
      </q-card>

      <!-- 凭码加入另一个网络区（已注册用户路径；未注册走注册页填码） -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">{{ $t('social.invitations.joinTitle') }}</div>
          <div class="text-caption text-grey-6">{{ $t('social.invitations.joinHint') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none row items-start q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model="joinCode"
              dense
              outlined
              :placeholder="$t('social.invitations.joinPlaceholder')"
              @keyup.enter="handleJoin"
            >
              <template v-slot:prepend><q-icon name="vpn_key" /></template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn
              @click="handleJoin"
              color="primary"
              no-caps
              :label="$t('social.invitations.joinButton')"
              :loading="joining"
              :disable="!joinCode.trim()"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 邀请记录（框架 invite_code_usages：谁用我的码进来了） -->
      <q-card flat bordered>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('social.invitations.usagesTitle') }}</div>
          <q-space />
          <q-btn
            @click="fetchUsages(usagePage)"
            flat
            dense
            no-caps
            icon="refresh"
            :label="$t('common.refresh')"
            :loading="inviteLoading"
            :disable="!currentTenant"
          />
        </q-card-section>

        <q-separator />

        <q-list v-if="usages.length" separator>
          <q-item v-for="usage in usages" :key="usage.usage_id">
            <q-item-section avatar>
              <q-avatar
                :text="usage.invitee?.name?.charAt(0) || '?'"
                :source="usage.invitee?.avatar || undefined"
                color="primary"
                text-color="white"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ usage.invitee?.name || $t('social.invitations.unknownUser') }}</q-item-label>
              <q-item-label caption>
                {{ channelText(usage.channel) }} · {{ formatDate(usage.used_at) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-else class="text-center text-grey-6">
          <q-icon name="card_giftcard" size="36px" />
          <div class="q-mt-sm">{{ $t('social.invitations.noUsages') }}</div>
        </q-card-section>

        <q-card-actions v-if="usageLastPage > 1" align="center" class="q-py-sm">
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            icon="chevron_left"
            :label="$t('social.invitations.prevPage')"
            :disable="usagePage <= 1"
            @click="fetchUsages(usagePage - 1)"
          />
          <div class="text-caption text-grey-6">{{ usagePage }} / {{ usageLastPage }}</div>
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            icon="chevron_right"
            :label="$t('social.invitations.nextPage')"
            :disable="usagePage >= usageLastPage"
            @click="fetchUsages(usagePage + 1)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import { useSocial } from '../../composables/useSocial'
import { useInviteCode } from '../../composables/useInviteCode'
import { useAuthStore } from '../../stores/auth'

const { t } = useI18n()
const $q = useQuasar()
const auth = useAuthStore()

// 搜索标签页仍归 useSocial，邀请码这条线走 useInviteCode（框架 invite code）。
// 两个 loading 不合并：搜索转圈不该让邀请码卡片显示忙态，反之亦然。
const {
  searchResults,
  searchLoading,
  loading,
  searchUsers,
  sendFriendRequest: sendRequest
} = useSocial()

const {
  myCode,
  usages,
  usagePage,
  usageLastPage,
  loading: inviteLoading,
  joining,
  usageLimitText,
  isUsedUp,
  isExpired,
  fetchMyCode,
  fetchUsages,
  join,
  inviteLink
} = useInviteCode()

const activeTab = ref<'search' | 'invitations'>('search')
const searchQuery = ref('')
const joinCode = ref('')

const currentTenant = computed(() => auth.currentTenant)

/**
 * 档位由服务端给的三个字段现算（used_count/max_uses/expires_at），
 * 不再读旧实现那个 `invitation_status`（1=pending/2=used/0=expired）——
 * 框架没有这一列，也不允许前端再造一套状态机。
 */
const CODE_STATUS_COLORS: Record<string, string> = {
  active: 'positive',
  usedUp: 'info',
  expired: 'negative'
}

const codeStatus = computed(() => {
  if (isUsedUp.value) return 'usedUp'
  if (isExpired.value) return 'expired'
  return 'active'
})
const codeStatusText = computed(() => t(`social.invitations.${codeStatus.value}`))
const codeStatusColor = computed(() => CODE_STATUS_COLORS[codeStatus.value] ?? 'grey')

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await searchUsers(searchQuery.value.trim())
  }
}

const sendFriendRequest = async (userId: string, userName: string) => {
  await sendRequest(userId, userName)
}

const handleJoin = async () => {
  if (await join(joinCode.value)) {
    joinCode.value = ''
  }
}

/** `oauth:wechat` 这类框架渠道值没有本地化词条，直接显示原值而不是假装未知 */
const CHANNEL_KEYS: Record<string, string> = {
  email: 'social.invitations.channelEmail',
  sms: 'social.invitations.channelSms',
  join: 'social.invitations.channelJoin'
}

const channelText = (channel: string | null) => {
  if (!channel) return t('social.invitations.channelUnknown')
  const key = CHANNEL_KEYS[channel]
  return key ? t(key) : channel
}

const copyText = (text: string, successKey: string) => {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({ type: 'positive', message: t(successKey), position: 'top' })
  }).catch(() => {
    $q.notify({ type: 'negative', message: t('social.invitations.copyFailed'), position: 'top' })
  })
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString()

onMounted(async () => {
  // 直接刷新到本页时 store 可能还没定当前网络区；先补上下文再取码 ——
  // 空上下文会让框架在租户 0 上懒建一张进不去任何区的废码。
  if (!auth.currentTenant) {
    await auth.restoreCurrentTenant().catch(() => null)
  }
  await Promise.all([fetchMyCode(), fetchUsages(1)])
})
</script>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid var(--q-separator-color);
  padding-bottom: 1rem;
}
</style>