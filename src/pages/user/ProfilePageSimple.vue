<template>
  <div class="q-pa-md">
    <h1>用户资料</h1>
    <p>当前用户：{{ user?.name || '未知用户' }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>
