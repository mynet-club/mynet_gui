<template>
  <div class="auth-page">
    <div class="auth-container">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <q-icon name="lock_reset" color="primary" size="64px" class="q-mb-md" />
          
          <div class="text-h5 q-mb-sm">
            {{ $t('auth.resetPasswordTitle') }}
          </div>
          
          <div class="text-body2 text-grey-7 q-mb-lg">
            {{ $t('auth.resetPasswordSubtitle') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleResetPassword" class="auth-form">
            <q-input 
              v-model="resetForm.password"
              :placeholder="$t('auth.newPassword')"
              :type="showPassword ? 'text' : 'password'"
              outlined
              class="form-field"
              :rules="[
                val => !!val || $t('auth.passwordRequired'),
                val => (val && val.length >= 8) || $t('auth.passwordTooShort')
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- 密码强度指示器 -->
            <div class="password-strength-container q-mb-md">
              <div class="text-caption q-mb-xs">
                {{ $t('auth.passwordStrength') }}: 
                <span :class="passwordStrengthColor">
                  {{ passwordStrengthText }}
                </span>
              </div>
              <q-linear-progress
                :value="passwordStrength / 4"
                :color="passwordStrengthColor"
                size="4px"
                rounded
              />
            </div>
            
            <q-input 
              v-model="resetForm.confirmPassword"
              :placeholder="$t('auth.confirmNewPassword')"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              class="form-field"
              :rules="[
                val => !!val || $t('auth.confirmPasswordRequired'),
                val => val === resetForm.password || $t('auth.passwordMismatch')
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>
            
            <q-btn
              type="submit"
              color="primary"
              :label="$t('auth.resetPasswordButton')"
              class="submit-btn"
              :loading="isLoading"
              :disable="!isFormValid"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import debug from "src/utils/debug"
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
const code = ref(route.query.code as string || '')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const resetForm = ref({
  password: '',
  confirmPassword: ''
})

// 如果没有必要参数，跳转回忘记密码页面
onMounted(() => {
  if (!email.value || (!token.value && !code.value)) {
    router.replace('/auth/forgot-password')
    return
  }
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = resetForm.value.password
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength++
  
  // 大小写检查
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  
  // 数字检查
  if (/\d/.test(password)) strength++
  
  // 特殊字符检查
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return t('auth.passwordWeak')
  if (strength === 1) return t('auth.passwordWeak')
  if (strength === 2) return t('auth.passwordFair')
  if (strength === 3) return t('auth.passwordGood')
  return t('auth.passwordStrong')
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'negative'
  if (strength === 2) return 'warning'
  if (strength === 3) return 'info'
  return 'positive'
})

const isFormValid = computed(() => {
  return resetForm.value.password && 
         resetForm.value.confirmPassword && 
         resetForm.value.password === resetForm.value.confirmPassword &&
         resetForm.value.password.length >= 8
})

const handleResetPassword = async () => {
  isLoading.value = true
  try {
    const requestData: any = {
      email: email.value,
      password: resetForm.value.password,
      password_confirmation: resetForm.value.confirmPassword
    }
    
    // 根据参数类型决定使用token还是code
    if (code.value) {
      requestData.code = code.value
    } else if (token.value) {
      requestData.token = token.value
    }
    
    const response = await apiService.resetPassword(requestData)
    
    if (response.data.success) {
      // 显示成功提示
      $q.notify({
        type: 'positive',
        message: t('auth.passwordResetSuccess'),
        timeout: 5000
      })
      
      // 跳转到登录页面
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } else {
      throw new Error(response.data.message || t('auth.passwordResetFailed'))
    }
  } catch (error: any) {
    debug.error('Password reset failed:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || t('auth.passwordResetFailed'),
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/auth.scss';

.password-strength-container {
  .text-caption {
    font-size: 0.75rem;
  }
  
  .text-negative {
    color: var(--q-negative);
  }
  
  .text-warning {
    color: var(--q-warning);
  }
  
  .text-info {
    color: var(--q-info);
  }
  
  .text-positive {
    color: var(--q-positive);
  }
}
</style>
