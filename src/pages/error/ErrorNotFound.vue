<template>
  <div class="error-not-found fullscreen flex flex-center text-center q-pa-md">
    <div>
      <div class="text-h1 text-weight-bold">404</div>
      <div class="text-h5 q-mt-sm text-grey-6">Page Not Found</div>
      <q-btn
        class="q-mt-lg"
        color="primary"
        unelevated
        label="Go Home"
        to="/"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 独立 404 页面：不依赖父级 QLayout，避免命中 /:catchAll 路由时触发 QPage 报错
</script>

<style scoped>
.error-not-found {
  background: var(--page-bg, #f8fafc);
  color: var(--text-primary, #0f172a);
}
</style>
