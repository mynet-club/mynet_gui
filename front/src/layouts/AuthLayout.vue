<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <!-- 简单的认证页面布局，没有header和sidebar -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// 认证布局不需要额外的逻辑
</script>

<style lang="scss" scoped>
.auth-layout {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  min-height: 100vh;
  
  .q-page-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }
}

// 深色模式优化
.body--dark {
  .auth-layout {
    background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-accent) 100%);
  }
}
</style> 