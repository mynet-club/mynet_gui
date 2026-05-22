<template>
  <div class="auth-shell">
    <aside class="auth-hero">
      <div class="auth-hero-inner">
        <div class="hero-brand">
          <img src="/icons/icon.png" alt="MyNet" class="hero-logo" />
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
        <div class="hero-decor">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
        </div>
      </div>
    </aside>
    <main class="auth-main">
      <LoginForm />
    </main>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../../components/auth/LoginForm.vue'
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style>
