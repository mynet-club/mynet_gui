<template>
  <div class="index-page">
    <div class="redirect-message">
      <h1>正在跳转...</h1>
      <p>即将跳转到官网</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { APP_CONFIG } from '../config/app'

// 组件挂载时立即跳转
onMounted(() => {
  window.location.href = `${APP_CONFIG.urls.www}/`
})
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
}

.redirect-message {
  text-align: center;
  color: white;
}

.redirect-message h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.redirect-message p {
  font-size: 1.25rem;
  opacity: 0.9;
}
</style>
