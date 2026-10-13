<template>
  <div class="auth-page">
    <div class="auth-container">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <q-icon name="mail" color="primary" size="64px" class="q-mb-md" />
          
          <div class="text-h5 q-mb-sm">
            {{ $t('auth.emailVerificationTitle') }}
          </div>
          
          <div class="text-body2 text-grey-7 q-mb-lg">
            {{ $t('auth.resetVerificationSubtitle', { email: email }) }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleVerification" class="auth-form">
            <q-input 
              v-model="verificationCode"
              :placeholder="$t('auth.verificationCodePlaceholder')"
              type="text"
              outlined
              class="form-field"
              maxlength="6"
              :rules="[
                val => !!val || $t('auth.verificationCodeRequired'),
                val => (val && val.length === 6) || $t('auth.verificationCodeInvalid')
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
            </q-input>
            
            <q-btn
              type="submit"
              color="primary"
              :label="$t('auth.verify')"
              class="submit-btn"
              :loading="isLoading"
              :disable="!verificationCode || verificationCode.length !== 6"
            />
          </q-form>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-body2 text-grey-7 q-mb-md">
            {{ $t('auth.didntReceiveCode') }}
          </div>
          
          <q-btn
            flat
            :label="countdown > 0 ? $t('auth.resendCodeCountdown', { seconds: countdown }) : $t('auth.resendCode')"
            color="primary"
            :disable="countdown > 0 || isResending"
            :loading="isResending"
            @click="handleResendCode"
          />
        </q-card-section>

        <q-card-section class="auth-footer">
          <div class="text-caption">
            <q-btn 
              flat 
              dense 
              :label="$t('auth.backToForgotPassword')" 
              color="primary"
              to="/auth/forgot-password"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import debug from 'src/utils/debug'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../../services/api'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const email = ref(route.query.email as string || '')
const verificationCode = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

// 如果没有邮箱参数，跳转回忘记密码页面
onMounted(() => {
  if (!email.value) {
    router.replace('/auth/forgot-password')
    return
  }
  
  // 显示发送成功提示
  $q.notify({
    type: 'positive',
    message: t('auth.verificationCodeSent'),
    timeout: 3000
  })
  
  // 开始倒计时
  startCountdown()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

const handleVerification = async () => {
  isLoading.value = true
  try {
    // 无 reset-token 预校验等价能力（G2 裁决）：不调用假端点，
    // 把 code 交给 reset-password，由真重置接口校验 token。
    await router.push({
      path: '/auth/reset-password',
      query: {
        email: email.value,
        code: verificationCode.value
      }
    })
  } catch (error: any) {
    debug.error('Verification failed:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || t('auth.verificationFailed'),
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  isResending.value = true
  try {
    const response = await apiService.forgotPassword({
      email: email.value
    })
    
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.verificationCodeSent'),
        timeout: 3000
      })
      
      // 重置倒计时
      startCountdown()
    } else {
      throw new Error(response.data.message || t('auth.resendCodeFailed'))
    }
  } catch (error: any) {
    debug.error('Resend code failed:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || t('auth.resendCodeFailed'),
      timeout: 3000
    })
  } finally {
    isResending.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';

.form-field {
  text-align: center;
  
  :deep(.q-field__control) {
    font-size: 1.2em;
    letter-spacing: 0.2em;
  }
}
</style>
