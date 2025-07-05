<template>
  <q-card class="auth-card q-pa-md">
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.forgotPasswordTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.forgotPasswordSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="forgotPassword" class="auth-form">
        <q-input 
          v-model="forgotPasswordForm.email"
          :label="$t('auth.email')"
          type="email"
          outlined
          class="form-field"
          :rules="[
            val => !!val || $t('auth.emailRequired'),
            val => validateEmail(val) || $t('auth.emailInvalid')
          ]"
        />
        
        <q-btn
          type="submit"
          color="primary"
          :label="$t('auth.sendResetLink')"
          class="submit-btn"
          :loading="isLoading"
        />
      </q-form>
    </q-card-section>
    
    <q-card-section class="auth-footer">
      <div class="text-caption">
        {{ $t('auth.rememberPassword') }}
        <q-btn 
          flat 
          dense 
          :label="$t('auth.backToLogin')" 
          color="primary"
          to="/auth/login"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth'

const { forgotPasswordForm, isLoading, validateEmail, forgotPassword } = useAuth()
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style> 