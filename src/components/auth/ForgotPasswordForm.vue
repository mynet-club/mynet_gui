<template>
  <q-card class="auth-card q-pa-md">
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.forgotPasswordTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.forgotPasswordSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="handleForgotPassword" class="auth-form">
        <q-input 
          v-model="forgotPasswordForm.email"
          :placeholder="$t('auth.email')"
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
          :label="$t('auth.sendResetCode')"
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
import { ref } from 'vue'
import debug from "src/utils/debug"
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const $q = useQuasar()
const { t } = useI18n()
const router = useRouter()
const { forgotPasswordForm, isLoading, validateEmail, forgotPassword } = useAuth()

const handleForgotPassword = async () => {
  try {
    // 调用 forgotPassword API 发送验证码
    await forgotPassword({
      email: forgotPasswordForm.email
    })
    
    // 跳转到验证码页面，传递邮箱参数
    await router.push({
      path: '/auth/reset-verification',
      query: { email: forgotPasswordForm.email }
    })
  } catch (error) {
    debug.error('Forgot password failed:', error)
    $q.notify({
      type: 'negative',
      message: t('auth.sendResetCodeFailed'),
      timeout: 3000
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';
</style> 
