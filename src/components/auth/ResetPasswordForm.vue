<template>
  <q-card class="auth-card q-pa-md">
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.resetPasswordTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.resetPasswordSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="resetPassword" class="auth-form">
        <q-input 
          v-model="resetPasswordForm.email"
          type="email"
          outlined
          class="form-field"
          :placeholder="$t('auth.emailPlaceholder')"
          :rules="[
            val => !!val || $t('auth.emailRequired'),
            val => validateEmail(val) || $t('auth.emailInvalid')
          ]"
          readonly
        />
        
        <q-input 
          v-model="resetPasswordForm.password"
          type="password"
          outlined
          class="form-field"
          :placeholder="$t('auth.newPasswordPlaceholder')"
          :rules="[
            val => !!val || $t('auth.passwordRequired'),
            val => val.length >= 8 || $t('auth.passwordMinLength')
          ]"
        />
        
        <q-input 
          v-model="resetPasswordForm.confirmPassword"
          type="password"
          outlined
          class="form-field"
          :placeholder="$t('auth.confirmPasswordPlaceholder')"
          :rules="[
            val => !!val || $t('auth.confirmPasswordRequired'),
            val => val === resetPasswordForm.password || $t('auth.passwordMismatch')
          ]"
        />
        
        <q-btn
          type="submit"
          color="primary"
          :label="$t('auth.resetPasswordButton')"
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
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const route = useRoute()
const { isLoading, validateEmail, resetPasswordForm, resetPassword } = useAuth()

onMounted(() => {
  // 从URL参数中获取token和email
  resetPasswordForm.token = route.query.token as string || ''
  resetPasswordForm.email = route.query.email as string || ''
})
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style>
