<template>
  <q-dialog v-model="show" persistent>
    <q-card class="password-reset-dialog" style="min-width: 400px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('auth.resetPassword') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- 步骤指示器 -->
        <q-stepper
          v-model="step"
          header-nav
          ref="stepper"
          color="primary"
          animated
        >
          <!-- 步骤1: 输入邮箱 -->
          <q-step
            :name="1"
            :title="$t('auth.enterEmail')"
            icon="email"
            :done="step > 1"
          >
            <q-form @submit="requestReset">
              <q-input
                v-model="form.email"
                :label="$t('auth.email')"
                type="email"
                outlined
                dense
                :rules="[
                  val => !!val || $t('auth.emailRequired'),
                  val => validateEmail(val) || $t('auth.emailInvalid')
                ]"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="$t('auth.sendResetCode')"
                  :loading="loading"
                  class="col"
                />
                <q-btn
                  flat
                  :label="$t('common.cancel')"
                  @click="$emit('cancel')"
                  class="col"
                />
              </div>
            </q-form>
          </q-step>

          <!-- 步骤2: 选择重置方式 -->
          <q-step
            :name="2"
            :title="$t('auth.selectMethod')"
            icon="vpn_key"
            :done="step > 2"
          >
            <div class="text-body2 text-grey-7 q-mb-lg">
              {{ $t('auth.resetMethodInstruction') }}
            </div>

            <q-tabs
              v-model="resetMethod"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="code" :label="$t('auth.useCode')" />
              <q-tab name="email" :label="$t('auth.checkEmail')" />
            </q-tabs>

            <q-separator class="q-my-md" />

            <q-tab-panels v-model="resetMethod" animated>
              <!-- 验证码方式 -->
              <q-tab-panel name="code" class="q-px-none">
                <q-form @submit="validateResetCode">
                  <q-input
                    v-model="form.resetCode"
                    :placeholder="$t('auth.resetCode')"
                    outlined
                    dense
                    maxlength="6"
                    counter
                    :rules="[
                      val => !!val || $t('auth.codeRequired'),
                      val => val.length === 6 || $t('auth.codeLength')
                    ]"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="vpn_key" />
                    </template>
                  </q-input>

                  <div class="row q-gutter-sm">
                    <q-btn
                      type="submit"
                      color="primary"
                      :label="$t('auth.verify')"
                      :loading="verifying"
                      class="col"
                    />
                    <q-btn
                      flat
                      :label="$t('auth.resendCode')"
                      @click="resendResetCode"
                      :loading="resendingCode"
                      :disable="countdown > 0"
                      class="col"
                    >
                      <template v-if="countdown > 0">
                        ({{ countdown }}s)
                      </template>
                    </q-btn>
                  </div>
                </q-form>
              </q-tab-panel>

              <!-- 邮件方式 -->
              <q-tab-panel name="email" class="q-px-none">
                <div class="text-center">
                  <q-icon name="email" size="48px" color="primary" class="q-mb-md" />
                  <div class="text-body1 q-mb-md">
                    {{ $t('auth.checkEmailForReset') }}
                  </div>
                  <div class="text-caption text-grey-6 q-mb-lg">
                    {{ form.email }}
                  </div>

                  <q-btn
                    flat
                    :label="$t('auth.resendEmail')"
                    @click="resendResetEmail"
                    :loading="resendingEmail"
                    :disable="emailCountdown > 0"
                    color="primary"
                  >
                    <template v-if="emailCountdown > 0">
                      ({{ emailCountdown }}s)
                    </template>
                  </q-btn>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-step>

          <!-- 步骤3: 设置新密码 -->
          <q-step
            :name="3"
            :title="$t('auth.newPassword')"
            icon="lock"
          >
            <q-form @submit="resetPassword">
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
                class="q-mb-md"
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
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

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
                  :label="$t('common.back')"
                  @click="step = 2"
                  class="col"
                />
              </div>
            </q-form>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../../services/api'

interface Props {
  modelValue: boolean
  email?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()
const { t } = useI18n()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const step = ref(1)
const resetMethod = ref('code')
const loading = ref(false)
const verifying = ref(false)
const resetting = ref(false)
const resendingCode = ref(false)
const resendingEmail = ref(false)
const countdown = ref(0)
const emailCountdown = ref(0)

const form = reactive({
  email: props.email || '',
  resetCode: '',
  password: '',
  confirmPassword: '',
  resetToken: ''
})

let countdownTimer: NodeJS.Timeout | null = null
let emailCountdownTimer: NodeJS.Timeout | null = null

// 验证邮箱格式
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 请求重置密码
const requestReset = async () => {
  loading.value = true
  try {
    const response = await apiService.forgotPassword({
      email: form.email
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.resetCodeSent'),
        timeout: 3000
      })
      
      step.value = 2
      startCountdown()
    } else {
      throw new Error(response.data.message || t('auth.requestFailed'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.requestFailed'),
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

// 验证重置码
const validateResetCode = async () => {
  verifying.value = true
  try {
    const response = await apiService.validateResetToken({
      email: form.email,
      token: form.resetCode
    })

    if (response.data.success) {
      form.resetToken = form.resetCode
      step.value = 3
    } else {
      throw new Error(response.data.message || t('auth.invalidCode'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.invalidCode'),
      timeout: 3000
    })
  } finally {
    verifying.value = false
  }
}

// 重置密码
const resetPassword = async () => {
  resetting.value = true
  try {
    const response = await apiService.resetPassword({
      email: form.email,
      token: form.resetToken,
      password: form.password,
      password_confirmation: form.confirmPassword
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.passwordResetSuccess'),
        timeout: 3000
      })
      
      emit('success')
      show.value = false
    } else {
      throw new Error(response.data.message || t('auth.resetFailed'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.resetFailed'),
      timeout: 3000
    })
  } finally {
    resetting.value = false
  }
}

// 重新发送重置码
const resendResetCode = async () => {
  resendingCode.value = true
  try {
    const response = await apiService.forgotPassword({
      email: form.email
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.codeResent'),
        timeout: 3000
      })
      
      startCountdown()
    } else {
      throw new Error(response.data.message || t('auth.resendFailed'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.resendFailed'),
      timeout: 3000
    })
  } finally {
    resendingCode.value = false
  }
}

// 重新发送重置邮件
const resendResetEmail = async () => {
  resendingEmail.value = true
  try {
    const response = await apiService.forgotPassword({
      email: form.email
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.emailResent'),
        timeout: 3000
      })
      
      startEmailCountdown()
    } else {
      throw new Error(response.data.message || t('auth.resendFailed'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.resendFailed'),
      timeout: 3000
    })
  } finally {
    resendingEmail.value = false
  }
}

// 开始验证码倒计时
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

// 开始邮件倒计时
const startEmailCountdown = () => {
  emailCountdown.value = 60
  emailCountdownTimer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(emailCountdownTimer!)
      emailCountdownTimer = null
    }
  }, 1000)
}

onMounted(() => {
  if (props.email) {
    form.email = props.email
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  if (emailCountdownTimer) {
    clearInterval(emailCountdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.password-reset-dialog {
  .q-stepper {
    box-shadow: none;
  }
  
  .q-tab-panel {
    padding-top: 16px;
  }
}
</style>
