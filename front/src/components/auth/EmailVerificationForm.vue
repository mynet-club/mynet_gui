<template>
  <q-card class="auth-card q-pa-md">
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.emailVerificationTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.emailVerificationSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <div v-if="!isVerified" class="email-verification">
        <div class="text-center">
          <q-icon name="email" class="verification-icon text-primary" />
        </div>
        
        <q-form @submit="verifyEmail" class="verification-form">
          <q-input 
            v-model="emailVerificationForm.verificationCode"
            :label="$t('auth.verificationCode')"
            outlined
            class="form-field"
            :rules="[val => !!val || $t('auth.verificationCodeRequired')]"
          />
          
          <q-btn
            type="submit"
            color="primary"
            :label="$t('auth.verifyEmail')"
            class="submit-btn"
            :loading="isLoading"
          />
        </q-form>
        
        <div class="resend-section">
          <q-btn 
            flat 
            dense 
            :label="$t('auth.resendCode')" 
            class="resend-btn"
            :disable="cooldown > 0"
            @click="handleResendCode"
          />
          <div v-if="cooldown > 0" class="cooldown-text">
            {{ $t('auth.resendCooldown', { seconds: cooldown }) }}
          </div>
        </div>
      </div>
      
      <div v-else class="success-section">
        <q-icon name="check_circle" class="success-icon" />
        <div class="success-title">{{ $t('auth.verificationSuccess') }}</div>
        <div class="success-subtitle">{{ $t('auth.verificationSuccessSubtitle') }}</div>
        <q-btn
          color="primary"
          :label="$t('auth.continueToLogin')"
          to="/auth/login"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { emailVerificationForm, isLoading, verifyEmail, resendCode } = useAuth()

const isVerified = ref(false)
const cooldown = ref(0)

const handleResendCode = async () => {
  const cooldownSeconds = await resendCode()
  if (cooldownSeconds > 0) {
    cooldown.value = cooldownSeconds
    const timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }
}

const handleVerifyEmail = async () => {
  const success = await verifyEmail()
  if (success) {
    isVerified.value = true
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style> 