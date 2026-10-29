<template>
  <q-card class="auth-card q-pa-md">
    <!-- Logo区域 -->
    <div class="auth-logo">
      <img :src="iconUrl" alt="MyNet" class="logo-icon" />
      <div class="logo-text">MyNet</div>
      <div class="logo-tagline">{{ $t('app.tagline') }}</div>
    </div>
    
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.loginTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="login" class="auth-form">
        <!-- 错误提示区域 -->
        <q-banner 
          v-if="loginError" 
          class="text-white bg-negative q-mb-md" 
          dense
          inline-actions
        >
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          {{ loginError }}
          <template v-slot:action>
            <q-btn 
              flat 
              dense 
              icon="close" 
              @click="clearError"
              color="white"
            />
          </template>
        </q-banner>
        
        <q-input
          v-model="loginForm.zone"
          :placeholder="$t('auth.zoneCode')"
          outlined
          class="form-field"
          :hint="$t('auth.zoneCodeHint')"
          :rules="[val => !!val || $t('auth.zoneCodeRequired')]"
        />

        <q-input
          v-model="loginForm.email"
          :placeholder="$t('auth.email')"
          type="email"
          outlined
          class="form-field"
          :rules="[val => !!val || $t('auth.emailRequired')]"
        />
        
        <q-input 
          v-model="loginForm.password"
          :placeholder="$t('auth.password')"
          type="password"
          outlined
          class="form-field"
          :rules="[val => !!val || $t('auth.passwordRequired')]"
        />
        
        <div class="form-actions">
          <q-checkbox v-model="loginForm.rememberMe" :label="$t('auth.rememberMe')" />
          <q-btn 
            flat 
            dense 
            :label="$t('auth.forgotPassword')" 
            color="primary"
            to="/auth/forgot-password"
          />
        </div>
        
        <q-btn
          type="submit"
          color="primary"
          :label="$t('auth.loginButton')"
          class="submit-btn"
          :loading="isLoading"
        />
      </q-form>
    </q-card-section>
    
    <q-card-section class="auth-footer">
      <div class="text-caption">
        {{ $t('auth.noAccount') }}
        <q-btn 
          flat 
          dense 
          :label="$t('auth.registerLink')" 
          color="primary"
          to="/auth/register"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
// 图标跟着 publicPath 走 —— 收进 /gui/ 后写死 /icons/ 会 404
const iconUrl = (import.meta.env.BASE_URL || "/") + "icons/icon.png"
import { useAuth } from '../../composables/useAuth'

const { loginForm, isLoading, loginError, login, clearError } = useAuth()
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style> 