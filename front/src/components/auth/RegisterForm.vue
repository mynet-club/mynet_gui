<template>
  <q-card class="auth-card q-pa-md">
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.registerTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="register" class="auth-form q-gutter-md">
        <q-input 
          v-model="registerForm.name"
          :label="$t('auth.name')"
          outlined
          class="form-field"
          :placeholder="$t('auth.namePlaceholder')"
          :rules="[val => !!val || $t('auth.nameRequired')]"
        />
        
        <q-input 
          v-model="registerForm.email"
          :label="$t('auth.email')"
          type="email"
          outlined
          class="form-field"
          :placeholder="$t('auth.emailPlaceholder')"
          :rules="[
            val => !!val || $t('auth.emailRequired'),
            val => validateEmail(val) || $t('auth.emailInvalid')
          ]"
        />
        
        <q-input 
          v-model="registerForm.password"
          :label="$t('auth.password')"
          type="password"
          outlined
          class="form-field"
          :placeholder="$t('auth.passwordPlaceholder')"
          :rules="[
            val => !!val || $t('auth.passwordRequired'),
            val => val.length >= 8 || $t('auth.passwordMinLength')
          ]"
        />
        
        <q-input 
          v-model="registerForm.confirmPassword"
          :label="$t('auth.confirmPassword')"
          type="password"
          outlined
          class="form-field"
          :placeholder="$t('auth.confirmPasswordPlaceholder')"
          :rules="[
            val => !!val || $t('auth.confirmPasswordRequired'),
            val => val === registerForm.password || $t('auth.passwordMismatch')
          ]"
        />
        
        <q-input 
          v-model="registerForm.invitation"
          :label="$t('auth.invitationCode')"
          outlined
          class="form-field"
          :placeholder="$t('auth.invitationPlaceholder')"
          :rules="[val => !!val || $t('auth.invitationRequired')]"
        />
        
        <q-checkbox 
          v-model="registerForm.agreeTerms"
          :label="$t('auth.agreeTerms')"
        />
        
        <q-btn
          type="submit"
          color="primary"
          :label="$t('auth.registerButton')"
          class="submit-btn"
          :loading="isLoading"
        />
      </q-form>
    </q-card-section>
    
    <q-card-section class="auth-footer">
      <div class="text-caption">
        {{ $t('auth.alreadyHaveAccount') }}
        <q-btn 
          flat 
          dense 
          :label="$t('auth.loginLink')" 
          color="primary"
          to="/auth/login"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { registerForm, isLoading, validateEmail, register } = useAuth()

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const invitationCode = urlParams.get('invitation');
  if (invitationCode) {
    registerForm.invitation = invitationCode;
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style>