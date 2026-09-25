<template>
  <div class="auth-shell">
    <aside class="auth-hero">
      <div class="auth-hero-inner">
        <div class="hero-brand">
          <img :src="iconUrl" alt="MyNet" class="hero-logo" />
          <div class="hero-title">MyNet</div>
          <div class="hero-tagline">{{ $t('app.tagline') }}</div>
        </div>
        <ul class="hero-points">
          <li>
            <q-icon name="bolt" />
            <span>{{ $t('auth.hero.point1') }}</span>
          </li>
          <li>
            <q-icon name="shield" />
            <span>{{ $t('auth.hero.point2') }}</span>
          </li>
          <li>
            <q-icon name="hub" />
            <span>{{ $t('auth.hero.point3') }}</span>
          </li>
        </ul>
      </div>
    </aside>
    <main class="auth-main">
      <RegisterForm />
    </main>
  </div>
</template>

<script setup lang="ts">
// 图标跟着 publicPath 走 —— 收进 /gui/ 后写死 /icons/ 会 404
const iconUrl = (import.meta.env.BASE_URL || "/") + "icons/icon.png"
import RegisterForm from '../../components/auth/RegisterForm.vue'
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style>
