<template>
  <PageLayout
    :title="$t('social.invitations.title')"
    :subtitle="$t('social.invitations.subtitle')"
    icon="send"
  >
    <template #actions>
      <q-btn
        color="primary"
        icon="add"
        :label="$t('social.invitations.create')"
        @click="handleCreateInvitation"
      />
    </template>

    <!-- 统计卡片 -->
    <ResponsiveCardGrid
      :items="invitationsStatsCards"
      :loading="loading"
      :loading-count="3"
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

    <!-- 邀请列表 -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ $t('social.invitations.list') }}</div>
        
        <ResponsiveCardGrid
          :items="invitations"
          :loading="loadingInvitations"
          :loading-count="4"
          spacing="normal"
          variant="compact"
          :clickable="false"
        >
          <template #default="{ item }">
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-subtitle1">{{ item.code }}</div>
                    <div class="text-caption text-grey-6">
                      {{ $t('social.invitations.status') }}: 
                      <q-chip
                        :color="getStatusColor(item.status)"
                        text-color="white"
                        size="sm"
                      >
                        {{ getStatusText(item.status) }}
                      </q-chip>
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ $t('social.invitations.createdAt') }}: {{ formatDate(item.created_at) }}
                    </div>
                    <div v-if="item.expires_at" class="text-caption text-grey-6">
                      {{ $t('social.invitations.expiresAt') }}: {{ formatDate(item.expires_at) }}
                    </div>
                  </div>
                  <div>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="content_copy"
                      @click="copyInvitationCode(item.code)"
                    >
                      <q-tooltip>{{ $t('social.invitations.copyCode') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="handleDeleteInvitation(item)"
                    >
                      <q-tooltip>{{ $t('social.invitations.delete') }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </template>
          <template #empty>
            <div class="text-center text-grey-6 q-pa-xl">
              <q-icon name="send" size="4rem" class="q-mb-md" />
              <div class="text-h6">{{ $t('social.invitations.empty.title') }}</div>
              <div class="text-body2">{{ $t('social.invitations.empty.description') }}</div>
              <q-btn
                color="primary"
                :label="$t('social.invitations.create')"
                class="q-mt-md"
                @click="handleCreateInvitation"
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
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useSocial, useNotify } from '../../composables'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'

const { t } = useI18n()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 使用组合式函数
const {
  invitations,
  loadingInvitations,
  loading,
  loadInvitations,
  createInvitation,
  deleteInvitation,
  getStatusText,
  getStatusColor
} = useSocial()

// 统计卡片数据
const invitationsStatsCards = computed(() => [
  {
    title: t('social.stats.totalInvitations'),
    value: invitations.value?.length || 0,
    icon: 'send',
    color: 'primary'
  },
  {
    title: t('social.stats.activeInvitations'),
    value: invitations.value?.filter(i => i.status === 'active').length || 0,
    icon: 'check_circle',
    color: 'positive'
  },
  {
    title: t('social.stats.expiredInvitations'),
    value: invitations.value?.filter(i => i.status === 'expired').length || 0,
    icon: 'schedule',
    color: 'negative'
  }
])

// 工具函数
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString()
}

const copyInvitationCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    notifySuccess(t('social.invitations.codeCopied'))
  } catch (error) {
    notifyError(t('social.invitations.copyFailed'))
  }
}

// 事件处理
const handleCreateInvitation = () => {
  $q.dialog({
    title: t('social.invitations.create'),
    message: t('social.invitations.createDescription'),
    ok: {
      label: t('common.create'),
      color: 'primary'
    },
    cancel: {
      label: t('common.cancel')
    }
  }).onOk(async () => {
    try {
      await createInvitation()
      notifySuccess(t('social.invitations.createSuccess'))
    } catch (error: any) {
      notifyError(error.message || t('social.invitations.createFailed'))
    }
  })
}

const handleDeleteInvitation = (invitation: any) => {
  $q.dialog({
    title: t('social.invitations.delete'),
    message: t('social.invitations.deleteConfirm', { code: invitation.code }),
    ok: {
      label: t('common.delete'),
      color: 'negative'
    },
    cancel: {
      label: t('common.cancel')
    }
  }).onOk(async () => {
    try {
      await deleteInvitation(invitation.id)
      notifySuccess(t('social.invitations.deleteSuccess'))
    } catch (error: any) {
      notifyError(error.message || t('social.invitations.deleteFailed'))
    }
  })
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadInvitations()
})
</script>

<style scoped>
.invitations-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>