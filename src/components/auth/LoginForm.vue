<template>
  <q-card class="auth-card q-pa-md">
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.loginTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="login" class="auth-form">
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
import { useAuth } from '../../composables/useAuth'

const { loginForm, isLoading, login } = useAuth()
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style> 