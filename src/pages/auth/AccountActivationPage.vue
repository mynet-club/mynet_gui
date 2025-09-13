<template>
  <q-page class="auth-layout">
    <div class="auth-container">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <!-- 动态图标根据状态变化 -->
          <q-icon 
            :name="statusConfig.icon" 
            :color="statusConfig.color" 
            size="64px" 
            class="q-mb-md"
          />
          
          <div class="text-h5 q-mb-sm">
            {{ $t(statusConfig.title) }}
          </div>
          
          <div class="text-body2 text-grey-7 q-mb-lg">
            {{ $t(statusConfig.message, { email: email }) }}
          </div>
        </q-card-section>

        <!-- URL激活自动处理状态 -->
        <div v-if="isAutoActivating" class="text-center q-mb-lg">
          <q-spinner color="primary" size="2em" />
          <div class="text-caption q-mt-sm">
            {{ $t('auth.activating') }}
          </div>
        </div>

        <!-- 激活成功状态 -->
        <div v-else-if="isActivated" class="text-center q-mb-lg">
          <q-btn
            color="primary"
            :label="$t('auth.goToLogin')"
            @click="goToLogin"
            size="lg"
          />
        </div>

        <!-- 手动激活表单 -->
        <div v-else>
          <q-card-section>
            <q-form @submit="handleActivation" class="auth-form">
              <q-input 
                v-model="activationCode"
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
                :label="$t('auth.activate')"
                class="submit-btn"
                :loading="isLoading"
                :disable="!activationCode || activationCode.length !== 6"
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
        </div>

        <q-card-section class="auth-footer">
          <div class="text-caption text-center">
            <q-btn 
              flat 
              dense 
              :label="$t('auth.backToRegister')" 
              color="primary"
              to="/auth/register"
            />
            |
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../../services/api'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const email = ref(route.query.email as string || '')
const token = ref(route.query.token as string || '')
const fromRegister = ref(route.query.from === 'register')
const activationCode = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const isAutoActivating = ref(false)
const isActivated = ref(false)
const activationFailed = ref(false)
const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

// 状态配置
const statusConfig = computed(() => {
  if (isActivated.value) {
    return {
      icon: 'check_circle',
      color: 'positive',
      title: 'auth.activationSuccess',
      message: 'auth.accountActivated'
    }
  } else if (activationFailed.value) {
    return {
      icon: 'error',
      color: 'negative', 
      title: 'auth.activationFailed',
      message: 'auth.activationError'
    }
  } else if (fromRegister.value) {
    return {
      icon: 'mail',
      color: 'primary',
      title: 'auth.accountActivation',
      message: 'auth.enterCodeInstruction'
    }
  } else {
    return {
      icon: 'mail',
      color: 'primary',
      title: 'auth.accountActivation',
      message: 'auth.activationInstruction'
    }
  }
})

onMounted(() => {
  // 如果没有邮箱参数，跳转回注册页面
  if (!email.value) {
    router.replace('/auth/register')
    return
  }

  // 如果有token参数，尝试自动激活
  if (email.value && token.value) {
    autoActivate()
  } else if (fromRegister.value) {
    // 从注册页面跳转过来，显示成功提示并开始倒计时
    $q.notify({
      type: 'positive',
      message: t('auth.verificationCodeSent'),
      timeout: 3000
    })
    startCountdown()
  }
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

const autoActivate = async () => {
  isAutoActivating.value = true
  try {
    const response = await apiService.activateAccount({
      email: email.value,
      token: token.value
    })
    
    if (response.data.success) {
      isActivated.value = true
      $q.notify({
        type: 'positive',
        message: t('auth.activationSuccess'),
        timeout: 3000
      })
    } else {
      throw new Error(response.data.message || t('auth.activationFailed'))
    }
  } catch (error: any) {
    console.error('Auto activation failed:', error)
    activationFailed.value = true
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || t('auth.activationFailed'),
      timeout: 3000
    })
  } finally {
    isAutoActivating.value = false
  }
}

const handleActivation = async () => {
  isLoading.value = true
  try {
    const response = await apiService.activateAccount({
      email: email.value,
      token: activationCode.value
    })
    
    if (response.data.success) {
      isActivated.value = true
      $q.notify({
        type: 'positive',
        message: t('auth.activationSuccess'),
        timeout: 3000
      })
    } else {
      throw new Error(response.data.message || t('auth.activationFailed'))
    }
  } catch (error: any) {
    console.error('Activation failed:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || t('auth.activationFailed'),
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  isResending.value = true
  try {
    const response = await apiService.resendActivationEmail({
      email: email.value,
      activation_url: `${window.location.origin}/auth/activate`
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
    console.error('Resend code failed:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || t('auth.resendCodeFailed'),
      timeout: 3000
    })
  } finally {
    isResending.value = false
  }
}

const goToLogin = () => {
  router.push('/auth/login')
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
