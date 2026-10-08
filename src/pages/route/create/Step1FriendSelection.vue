<template>
  <q-page class="route-create-step1-page">
    <div class="q-pa-md">
      <!-- 页面标题和导航 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('routes.create.step1.title') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('routes.create.step1.subtitle') }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="arrow_back"
            :label="$t('common.back')"
            @click="goBack"
          />
        </div>
      </div>

      <!-- 步骤指示器 -->
      <RouteCreateProgress :step="1" />

      <!-- 好友列表 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step1.selectFriend') }}</div>
          
          <!-- 搜索框 -->
          <q-input
            v-model="searchQuery"
            :placeholder="$t('routes.create.step1.searchFriends')"
            outlined
            dense
            class="q-mb-md"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- 好友卡片列表 -->
          <div v-if="loading" class="text-center q-py-lg">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-md">{{ $t('common.loading') }}</div>
          </div>

          <q-banner v-else-if="loadFailed" class="q-mb-md" rounded>
            {{ $t('social.fetchOverviewError') }}
            <template #action><q-btn flat color="primary" :label="$t('workflow.retry')" @click="loadFriends" /></template>
          </q-banner>
          <div v-else-if="filteredFriends.length === 0" class="text-center q-py-lg text-grey-6">
            <q-icon name="people_outline" size="3em" class="q-mb-md" />
            <div>{{ $t(searchQuery ? 'workflow.noMatches' : 'routes.create.step1.noFriends') }}</div>
            <q-btn v-if="searchQuery" flat color="primary" :label="$t('workflow.clearFilters')" @click="searchQuery = ''" />
            <q-btn v-else flat color="primary" :label="$t('workflow.manageFriends')" to="/app/social/friends" />
          </div>

          <div v-else class="row q-col-gutter-md">
            <div
              v-for="friend in filteredFriends"
              :key="friend.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                class="friend-card cursor-pointer"
                :class="{ 'selected': selectedFriend?.id === friend.id }"
                @click="selectFriend(friend)"
                role="radio"
                tabindex="0"
                :aria-label="friend.name"
                :aria-checked="selectedFriend?.id === friend.id"
                @keydown.enter.prevent="selectFriend(friend)"
                @keydown.space.prevent="selectFriend(friend)"
                bordered
                flat
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-center">
                    <div class="col">
                      <div class="text-h6">{{ friend.name }}</div>
                      <div class="text-body2 text-grey-6 q-mt-xs">
                        {{ $t('routes.create.step1.friendInfo', { 
                          nodes: friend.available_node_count || 0,
                          status: friend.status 
                        }) }}
                      </div>
                    </div>
                    <div>
                      <q-avatar size="40px" :color="getStatusColor(friend.status)">
                        <q-icon name="person" color="white" />
                      </q-avatar>
                    </div>
                  </div>

                  <!-- 节点数统计 -->
                  <div class="row q-mt-md">
                    <div class="col-6">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step1.availableNodes') }}</div>
                      <div class="text-h6 text-positive">{{ friend.available_node_count || 0 }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step1.totalNodes') }}</div>
                      <div class="text-h6">{{ friend.node_count || 0 }}</div>
                    </div>
                  </div>

                  <!-- 选中指示器 -->
                  <q-icon
                    v-if="selectedFriend?.id === friend.id"
                    name="check_circle"
                    color="positive"
                    size="1.5em"
                    class="absolute-top-right q-ma-sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            :label="$t('common.cancel')"
            @click="goBack"
          />
          <q-btn
            color="primary"
            :label="$t('routes.create.step1.nextStep')"
            :disable="loading || loadFailed || !selectedFriend"
            @click="goToNextStep"
            icon-right="arrow_forward"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import RouteCreateProgress from '../../../components/route/RouteCreateProgress.vue'
import { createRouteDraft } from '../../../utils/routeCreateDraft'

import { ref, computed, onMounted } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSocial } from '../../../composables/useSocial'
import { useNotify } from '../../../composables/useNotify'
import type { Friend } from '../../../types'

const { t } = useI18n()
const router = useRouter()
const draft = createRouteDraft(sessionStorage)
const notify = useNotify()

const {
  loading,
  friends,
  fetchOverview
} = useSocial()

// 页面状态
const searchQuery = ref('')
const loadFailed = ref(false)
const selectedFriend = ref<Friend | null>(null)

// 计算属性
const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value
  return friends.value.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const selectFriend = (friend: Friend) => {
  selectedFriend.value = friend
  draft.selectFriend(friend)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'positive'
    case 'offline':
      return 'grey'
    default:
      return 'grey'
  }
}

const goBack = () => {
  router.push('/app/routes')
}

const goToNextStep = () => {
  if (!selectedFriend.value) {
    notify.error(t('routes.create.step1.pleaseSelectFriend'))
    return
  }
  
  // 将选中的好友存储到会话存储中
  draft.selectFriend(selectedFriend.value)
  
  router.push('/app/routes/create/prev_2')
}

const loadFriends = async () => {
  if (loading.value) return
  loadFailed.value = false
  const success = await fetchOverview()
  loadFailed.value = !success
  if (!success) { selectedFriend.value = null; return }
  const saved = draft.read().friend
  selectedFriend.value = friends.value.find(friend => String(friend.id) === String(saved?.id)) ?? null
  draft.selectFriend(selectedFriend.value)
}
onMounted(loadFriends)
</script>

<style lang="scss" scoped>
.route-create-step1-page {
  .friend-card {
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.selected {
      border-color: var(--q-positive);
      box-shadow: 0 0 0 2px rgba(var(--q-positive), 0.2);
    }
  }
}
</style>
