<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <div class="text-h4 q-mb-md">Welcome to MyNet</div>
      <div class="text-subtitle1">Advanced Network Management System</div>
      
      <!-- 调试信息 -->
      <div class="q-pa-md q-mt-md" style="background: #f5f5f5; border-radius: 8px; max-width: 400px;">
        <div class="text-caption text-weight-bold">Debug Info:</div>
        <div class="text-caption">Authenticated: {{ isAuthenticated }}</div>
        <div class="text-caption">Current Zone: {{ authStore.currentZone?.name || 'None' }}</div>
        <div class="text-caption">Available Zones: {{ authStore.availableZones.length }}</div>
        <q-btn 
          size="sm"
          color="orange"
          label="Clear Auth & Reload"
          @click="clearAuthAndReload"
          class="q-mt-sm"
        />
      </div>
      
      <div v-if="!isAuthenticated" class="q-mt-md">
        <q-btn 
          class="q-mt-md q-mr-sm"
          color="primary"
          label="Login"
          to="/auth/login"
        />
        <q-btn 
          class="q-mt-md"
          color="secondary"
          label="Go to Dashboard"
          to="/dashboard"
        />
      </div>
      <div v-else class="q-mt-md">
        <q-spinner color="primary" size="3em" class="q-mt-md" />
        <div class="q-mt-md">Redirecting to dashboard...</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LocalStorage } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const clearAuthAndReload = () => {
  console.log('🧹 Clearing authentication and reloading...')
  LocalStorage.remove('auth_token')
  LocalStorage.remove('token_expiry')
  window.location.reload()
}

onMounted(() => {
  // 移除自动重定向逻辑，让路由守卫处理重定向
  console.log('IndexPage mounted, user authenticated:', isAuthenticated.value)
})
</script>