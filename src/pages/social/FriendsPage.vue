<template>
  <q-page padding>
    <div class="page-header q-mb-lg">
      <h4 class="text-h4 q-ma-none">{{ $t('social.friends.title') }}</h4>
      <p class="text-grey-6 q-ma-none q-mt-sm">{{ $t('social.subtitle') }}</p>
    </div>

    <!-- 搜索框 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('social.friends.searchPlaceholder')"
          outlined
          dense
          clearable
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 好友列表 -->
    <ResponsiveCardGrid
      :items="friends"
      :loading="loading"
      :loading-count="12"
      variant="standard"
      spacing="normal"
      :empty-icon="'group'"
      :empty-title="$t('social.friends.noFriends')"
      :clickable="false"
    >
      <template #default="{ item: friend, index }">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-avatar size="50px" class="q-mr-md">
                  <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" />
                  <q-icon v-else name="person" size="30px" />
                </q-avatar>
                <div>
                  <div class="text-h6 text-weight-bold">{{ friend.name }}</div>
                  <div class="row items-center q-mt-xs">
                    <q-icon
                      :name="friend.status === 'online' ? 'circle' : 'radio_button_unchecked'"
                      :color="friend.status === 'online' ? 'positive' : 'grey-5'"
                      size="12px"
                      class="q-mr-xs"
                    />
                    <span class="text-caption" :class="friend.status === 'online' ? 'text-positive' : 'text-grey-6'">
                      {{ $t(`social.friends.${friend.status}`) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-btn-dropdown
                flat
                round
                icon="more_vert"
                size="sm"
                no-caps
              >
                <q-list>
                  <q-item clickable @click="viewFriendNodes(friend.id)">
                    <q-item-section avatar>
                      <q-icon name="lan" />
                    </q-item-section>
                    <q-item-section>{{ $t('social.friends.viewNodes') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="removeFriend(friend.id, friend.name)">
                    <q-item-section avatar>
                      <q-icon name="person_remove" color="negative" />
                    </q-item-section>
                    <q-item-section class="text-negative">{{ $t('social.friends.removeFriend') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md text-center">
            <div class="col">
              <div class="text-h6 text-primary">{{ friend.node_count }}</div>
              <div class="text-caption text-grey-6">{{ $t('social.friends.nodes') }}</div>
            </div>
            <div class="col">
              <div class="text-h6 text-positive">{{ friend.connected_node_count }}</div>
              <div class="text-caption text-grey-6">{{ $t('common.connected') }}</div>
            </div>
            <div class="col">
              <div class="text-h6 text-info">{{ friend.active_route_count }}</div>
              <div class="text-caption text-grey-6">{{ $t('social.friends.routes') }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey-6">
            {{ $t('social.friends.friendshipDate') }}: {{ formatDate(friend.friendship_date) }}
          </div>
          <div class="text-caption text-grey-6">
            {{ $t('social.friends.lastActive') }}: {{ formatDate(friend.last_active) }}
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import { useSocial } from '../../composables/useSocial'
import type { Friend } from '../../types'

const { t } = useI18n()
const { 
  friends, 
  loading, 
  fetchFriends, 
  removeFriend: removeFriendFromSocial 
} = useSocial()

const searchQuery = ref('')

const handleSearch = (search: string | number | null) => {
  fetchFriends(1, String(search || ''))
}

const removeFriend = async (friendId: string, friendName: string) => {
  await removeFriendFromSocial(friendId, friendName)
}

const viewFriendNodes = (friendId: string) => {
  console.log('View friend nodes:', friendId)
  // TODO: 实现查看好友节点逻辑
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchFriends()
})
</script>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid var(--q-separator-color);
  padding-bottom: 1rem;
}
</style>