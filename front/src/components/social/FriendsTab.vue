<template>
  <div class="friends-tab">
    <!-- 搜索框 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          :model-value="search"
          @update:model-value="(val) => $emit('search', String(val || ''))"
          :placeholder="$t('social.friends.searchPlaceholder')"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 好友列表 -->
    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else-if="friends.length === 0" class="text-center q-py-lg">
      <q-icon name="group" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">{{ $t('social.friends.noFriends') }}</div>
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="friend in friends"
        :key="friend.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="friend-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="row items-center q-mb-sm">
                  <q-avatar size="40px" class="q-mr-sm">
                    <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" />
                    <q-icon v-else name="person" size="24px" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-medium">{{ friend.name }}</div>
                    <div class="row items-center">
                      <q-icon
                        :name="friend.status === 'online' ? 'circle' : 'radio_button_unchecked'"
                        :color="friend.status === 'online' ? 'positive' : 'grey-5'"
                        size="8px"
                        class="q-mr-xs"
                      />
                      <span class="text-caption" :class="friend.status === 'online' ? 'text-positive' : 'text-grey-6'">
                        {{ $t(`social.friends.${friend.status}`) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <q-btn-dropdown
                  flat
                  round
                  icon="more_vert"
                  size="sm"
                  no-caps
                >
                  <q-list>
                    <q-item clickable @click="$emit('view-nodes', friend.id)">
                      <q-item-section avatar>
                        <q-icon name="lan" />
                      </q-item-section>
                      <q-item-section>{{ $t('social.friends.viewNodes') }}</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable @click="$emit('remove', friend.id, friend.name)">
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
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Friend } from '../../types'

interface Props {
  friends: Friend[]
  loading: boolean
  search: string
}

interface Emits {
  (e: 'search', search: string): void
  (e: 'remove', friendId: string, friendName: string): void
  (e: 'view-nodes', friendId: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.friends-tab {
  .friend-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
