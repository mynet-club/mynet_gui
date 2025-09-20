<template>
  <q-card 
    flat 
    bordered 
    class="social-card cursor-pointer"
    @click="$emit('click', user)"
  >
    <q-card-section class="q-pa-md">
      <div class="row items-center q-gutter-md">
        <!-- 用户头像 -->
        <q-avatar 
          :size="size" 
          color="primary" 
          text-color="white"
        >
          {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
        </q-avatar>
        
        <!-- 用户信息 -->
        <div class="col">
          <div class="text-subtitle1">{{ user.name || 'Unknown' }}</div>
          <div class="text-caption text-grey-6">
            ID: {{ user.user_id || user.id || 'N/A' }}
          </div>
          <div v-if="user.email" class="text-caption text-grey-6">
            {{ user.email }}
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div v-if="showActions" class="col-auto">
          <slot name="actions" :user="user">
            <!-- 默认操作按钮 -->
            <q-btn 
              v-if="actionType === 'add'"
              color="primary" 
              size="sm" 
              :loading="loading"
              @click.stop="$emit('add', user)"
            >
              <q-icon name="person_add" class="q-mr-xs" />
              {{ $t('social.actions.addFriend') }}
            </q-btn>
            
            <div v-else-if="actionType === 'request'" class="q-gutter-xs">
              <q-btn 
                color="positive" 
                size="sm" 
                :loading="loading"
                @click.stop="$emit('accept', user)"
              >
                <q-icon name="check" class="q-mr-xs" />
                {{ $t('social.actions.accept') }}
              </q-btn>
              <q-btn 
                color="negative" 
                size="sm" 
                :loading="loading"
                @click.stop="$emit('reject', user)"
              >
                <q-icon name="close" class="q-mr-xs" />
                {{ $t('social.actions.reject') }}
              </q-btn>
            </div>
            
            <q-btn 
              v-else-if="actionType === 'remove'"
              color="negative" 
              outline
              size="sm" 
              :loading="loading"
              @click.stop="$emit('remove', user)"
            >
              <q-icon name="person_remove" class="q-mr-xs" />
              {{ $t('social.actions.removeFriend') }}
            </q-btn>
          </slot>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface User {
  user_id?: string | number
  id?: string | number
  name?: string
  email?: string
  [key: string]: any
}

interface Props {
  user: User
  size?: string
  showActions?: boolean
  actionType?: 'add' | 'request' | 'remove' | 'none'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  size: '48px',
  showActions: true,
  actionType: 'none',
  loading: false
})

defineEmits<{
  click: [user: User]
  add: [user: User]
  accept: [user: User]
  reject: [user: User]
  remove: [user: User]
}>()

const { t } = useI18n()
</script>

<style scoped>
.social-card {
  transition: all 0.2s ease;
}

.social-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}
</style>