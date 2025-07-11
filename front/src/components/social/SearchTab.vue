<template>
  <div class="search-tab">
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
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else-if="searchResults.length === 0 && searchQuery.trim()" class="text-center q-py-lg">
      <q-icon name="search_off" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">{{ $t('social.search.noResults') }}</div>
    </div>

    <div v-else-if="searchResults.length === 0" class="text-center q-py-lg">
      <q-icon name="search" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">{{ $t('social.search.title') }}</div>
    </div>

    <div v-else class="q-gutter-md">
      <q-card
        v-for="user in searchResults"
        :key="user.user_id"
        class="user-card"
      >
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-avatar size="40px" class="q-mr-sm">
                  <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                  <q-icon v-else name="person" size="24px" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-medium">{{ user.name }}</div>
                  <div class="text-caption text-grey-6">
                    {{ $t('social.search.zone') }}: {{ user.zone_name }}
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
              />
              <q-btn
                v-else-if="user.has_pending_request"
                color="orange"
                :label="$t('social.search.requested')"
                size="sm"
                no-caps
                disabled
              />
              <q-btn
                v-else
                @click="$emit('send-request', user.user_id, user.name)"
                color="primary"
                :label="$t('social.search.addFriend')"
                size="sm"
                no-caps
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
              <div class="text-caption text-grey-6">
                {{ $t('social.search.lastActive') }}: {{ formatDate(user.last_active) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SearchUser } from '../../types'

interface Props {
  searchResults: SearchUser[]
  loading: boolean
}

interface Emits {
  (e: 'search', query: string): void
  (e: 'send-request', userId: string, userName: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.search-tab {
  .user-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
