<template>
  <div class="auth-page">
    <div class="auth-container">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <q-icon name="lock_reset" color="primary" size="64px" class="q-mb-md" />
          
          <div class="text-h5 q-mb-sm">
            {{ $t('auth.resetPassword') }}
          </div>
          
          <div class="text-body2 text-grey-7 q-mb-lg">
            {{ $t('auth.resetPasswordInstruction') }}
          </div>
        </q-card-section>

        <!-- 步骤指示器 -->
        <q-card-section>
          <q-stepper
            v-model="step"
            header-nav
            ref="stepper"
            color="primary"
            animated
          >
            <!-- 步骤1: 验证重置令牌 -->
            <q-step
              :name="1"
              :title="$t('auth.verifyToken')"
              icon="vpn_key"
              :done="step > 1 || tokenValid"
            >
              <div v-if="validating" class="text-center q-py-lg">
                <q-spinner color="primary" size="2em" />
                <div class="text-caption q-mt-sm">
                  {{ $t('auth.validatingToken') }}
                </div>
              </div>

              <div v-else-if="tokenValid" class="text-center q-py-lg">
                <q-icon name="check_circle" color="positive" size="48px" class="q-mb-md" />
                <div class="text-body1">
                  {{ $t('auth.tokenValid') }}
                </div>
              </div>

              <div v-else class="text-center q-py-lg">
                <q-icon name="error" color="negative" size="48px" class="q-mb-md" />
                <div class="text-body1 q-mb-md">
                  {{ $t('auth.tokenInvalid') }}
                </div>
                
                <div class="q-gutter-sm">
                  <q-btn
                    flat
                    :label="$t('auth.requestNewReset')"
                    @click="requestNewReset"
                    color="primary"
                  />
                  
                  <q-btn
                    flat
                    :label="$t('auth.backToLogin')"
                    @click="goToLogin"
                    color="primary"
                  />
                </div>
              </div>
            </q-step>

            <!-- 步骤2: 设置新密码 -->
            <q-step
              :name="2"
              :title="$t('auth.newPassword')"
              icon="lock"
              :disable="!tokenValid"
            >
              <q-form @submit="resetPassword" class="q-gutter-md">
                <q-input
                  v-model="form.password"
                  :label="$t('auth.newPassword')"
                  type="password"
                  outlined
                  dense
                  :rules="[
                    val => !!val || $t('auth.passwordRequired'),
                    val => val.length >= 8 || $t('auth.passwordMinLength')
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-input
                  v-model="form.confirmPassword"
                  :label="$t('auth.confirmPassword')"
                  type="password"
                  outlined
                  dense
                  :rules="[
                    val => !!val || $t('auth.confirmPasswordRequired'),
                    val => val === form.password || $t('auth.passwordMismatch')
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <!-- 密码强度指示器 -->
                <div class="password-strength q-mb-md">
                  <div class="text-caption q-mb-xs">
                    {{ $t('auth.passwordStrength') }}
                  </div>
                  <q-linear-progress
                    :value="passwordStrength / 100"
                    :color="passwordStrengthColor"
                    size="8px"
                    rounded
                  />
                  <div class="text-caption q-mt-xs" :class="`text-${passwordStrengthColor}`">
                    {{ $t(`auth.strength.${passwordStrengthLevel}`) }}
                  </div>
                </div>

                <div class="row q-gutter-sm">
                  <q-btn
                    type="submit"
                    color="primary"
                    :label="$t('auth.resetPassword')"
                    :loading="resetting"
                    class="col"
                  />
                  <q-btn
                    flat
                    :label="$t('common.cancel')"
                    @click="goToLogin"
                    class="col"
                  />
                </div>
              </q-form>
            </q-step>
          </q-stepper>
        </q-card-section>
      </q-card>

      <!-- 请求新的重置链接对话框 -->
      <q-dialog v-model="showRequestDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('auth.requestNewReset') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="requestEmail"
              :label="$t('auth.email')"
              type="email"
              outlined
              dense
              :rules="[
                val => !!val || $t('auth.emailRequired'),
                val => validateEmail(val) || $t('auth.emailInvalid')
              ]"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="$t('common.cancel')" v-close-popup />
            <q-btn
              color="primary"
              :label="$t('auth.send')"
              @click="sendResetRequest"
              :loading="sendingRequest"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../../services/api'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const step = ref(1)
const validating = ref(true)
const tokenValid = ref(false)
const resetting = ref(false)
const sendingRequest = ref(false)
const showRequestDialog = ref(false)
const requestEmail = ref('')

const form = reactive({
  email: '',
  token: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 计算密码强度
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15
  
  // 复杂度检查
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 15
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15
  
  return Math.min(strength, 100)
})

const passwordStrengthLevel = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'weak'
  if (strength < 60) return 'fair'
  if (strength < 80) return 'good'
  return 'strong'
})

const passwordStrengthColor = computed(() => {
  const level = passwordStrengthLevel.value
  switch (level) {
    case 'weak': return 'negative'
    case 'fair': return 'orange'
    case 'good': return 'warning'
    case 'strong': return 'positive'
    default: return 'grey'
  }
})

// 验证邮箱格式
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证重置令牌
const validateToken = async () => {
  if (!form.email || (!form.token && !form.code)) {
    tokenValid.value = false
    validating.value = false
    return
  }

  try {
    const requestData: any = {
      email: form.email
    }
    
    // 根据参数类型决定使用token还是code
    if (form.token) {
      requestData.token = form.token
    } else if (form.code) {
      requestData.code = form.code
    }
    
    const response = await apiService.validateResetToken(requestData)

    if (response.data.success) {
      tokenValid.value = true
      step.value = 2
    } else {
      tokenValid.value = false
    }
  } catch (error: any) {
    debug.error('Token validation failed:', error)
    tokenValid.value = false
    
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.tokenValidationFailed'),
      timeout: 3000
    })
  } finally {
    validating.value = false
  }
}

// 重置密码
const resetPassword = async () => {
  resetting.value = true
  
  try {
    const requestData: any = {
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword
    }
    
    // 根据参数类型决定使用token还是code
    if (form.token) {
      requestData.token = form.token
    } else if (form.code) {
      requestData.code = form.code
    }
    
    const response = await apiService.resetPassword(requestData)

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.passwordResetSuccess'),
        timeout: 3000
      })
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        goToLogin()
      }, 2000)
    } else {
      throw new Error(response.data.message || t('auth.resetFailed'))
    }
  } catch (error: any) {
    debug.error('Password reset failed:', error)
    
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.resetFailed'),
      timeout: 3000
    })
  } finally {
    resetting.value = false
  }
}

// 请求新的重置链接
const requestNewReset = () => {
  requestEmail.value = form.email
  showRequestDialog.value = true
}

// 发送重置请求
const sendResetRequest = async () => {
  if (!requestEmail.value || !validateEmail(requestEmail.value)) {
    return
  }

  sendingRequest.value = true
  
  try {
    const response = await apiService.forgotPassword({
      email: requestEmail.value,
      redirect_url: `${window.location.origin}/auth/reset-password`
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.resetLinkSent'),
        timeout: 3000
      })
      
      showRequestDialog.value = false
      goToLogin()
    } else {
      throw new Error(response.data.message || t('auth.sendFailed'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.sendFailed'),
      timeout: 3000
    })
  } finally {
    sendingRequest.value = false
  }
}

// 导航方法
const goToLogin = () => {
  router.push('/auth/login')
}

onMounted(() => {
  // 从URL参数获取重置信息
  form.email = (route.query.email as string) || ''
  form.token = (route.query.token as string) || ''
  form.code = (route.query.code as string) || ''

  // 验证令牌
  validateToken()
})
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';

.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.auth-card {
  max-width: 600px;
  width: 100%;
}

.password-strength {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.02);
}

.q-stepper {
  box-shadow: none;
}
</style>
