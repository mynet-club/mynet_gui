<template>
  <div class="auth-page">
    <div class="auth-container">
      <q-card class="auth-card q-pa-lg">
        <q-card-section class="text-center">
          <q-icon 
            :name="activationStatus.icon" 
            :color="activationStatus.color" 
            size="64px" 
            class="q-mb-md"
          />
          
          <div class="text-h5 q-mb-sm">
            {{ $t(activationStatus.title) }}
          </div>
          
          <div class="text-body2 text-grey-7 q-mb-lg">
            {{ $t(activationStatus.message) }}
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="q-mb-lg">
            <q-spinner color="primary" size="2em" />
            <div class="text-caption q-mt-sm">
              {{ $t('auth.activating') }}
            </div>
          </div>

          <!-- 激活成功 -->
          <div v-else-if="activated" class="q-mb-lg">
            <q-btn
              color="primary"
              :label="$t('auth.goToLogin')"
              @click="goToLogin"
              size="lg"
            />
          </div>

          <!-- 激活失败或需要手动激活 -->
          <div v-else-if="!loading && !activated">
            <!-- 如果有邮箱参数，显示手动激活选项 -->
            <div v-if="email" class="q-mb-lg">
              <q-form @submit="manualActivate" class="q-gutter-md">
                <q-input
                  v-model="activationCode"
                  :placeholder="$t('auth.activationCode')"
                  outlined
                  dense
                  maxlength="6"
                  counter
                  :rules="[
                    val => !!val || $t('auth.codeRequired'),
                    val => val.length === 6 || $t('auth.codeLength')
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="vpn_key" />
                  </template>
                </q-input>

                <div class="row q-gutter-sm">
                  <q-btn
                    type="submit"
                    color="primary"
                    :label="$t('auth.activate')"
                    :loading="activating"
                    class="col"
                  />
                  <q-btn
                    flat
                    :label="$t('auth.resendCode')"
                    @click="resendActivationCode"
                    :loading="resending"
                    :disable="countdown > 0"
                    class="col"
                  >
                    <template v-if="countdown > 0">
                      ({{ countdown }}s)
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </div>

            <!-- 通用重试选项 -->
            <div class="q-gutter-sm">
              <q-btn
                flat
                :label="$t('auth.backToLogin')"
                @click="goToLogin"
                color="primary"
              />
              
              <q-btn
                flat
                :label="$t('auth.backToRegister')"
                @click="goToRegister"
                color="primary"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import debug from "src/utils/debug"
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../../services/api'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const loading = ref(false)
const activated = ref(false)
const activating = ref(false)
const resending = ref(false)
const countdown = ref(0)
const activationCode = ref('')
const email = ref('')
const token = ref('')

let countdownTimer: NodeJS.Timeout | null = null

const activationStatus = reactive({
  icon: 'email',
  color: 'primary',
  title: 'auth.activatingAccount',
  message: 'auth.pleaseWait'
})

// 自动激活（通过URL参数）
const autoActivate = async () => {
  if (!email.value || !token.value) {
    updateStatus('error', 'close', 'auth.activationFailed', 'auth.invalidActivationLink')
    return
  }

  loading.value = true
  
  try {
    const response = await apiService.activateAccount({
      email: email.value,
      token: token.value
    })

    if (response.data.success) {
      activated.value = true
      updateStatus('success', 'check_circle', 'auth.activationSuccess', 'auth.accountActivated')
      
      // 3秒后自动跳转到登录页
      setTimeout(() => {
        goToLogin()
      }, 3000)
    } else {
      throw new Error(response.data.message || t('auth.activationFailed'))
    }
  } catch (error: any) {
    debug.error('Auto activation failed:', error)
    
    if (error.response?.status === 409) {
      // 账号已经激活
      activated.value = true
      updateStatus('success', 'check_circle', 'auth.alreadyActivated', 'auth.accountAlreadyActive')
    } else {
      updateStatus('error', 'error', 'auth.activationFailed', error.message || 'auth.activationError')
    }
  } finally {
    loading.value = false
  }
}

// 手动激活（通过验证码）
const manualActivate = async () => {
  if (!activationCode.value || !email.value) {
    return
  }

  activating.value = true
  
  try {
    const response = await apiService.activateAccount({
      email: email.value,
      token: activationCode.value
    })

    if (response.data.success) {
      activated.value = true
      updateStatus('success', 'check_circle', 'auth.activationSuccess', 'auth.accountActivated')
      
      $q.notify({
        type: 'positive',
        message: t('auth.activationSuccess'),
        timeout: 3000
      })
    } else {
      throw new Error(response.data.message || t('auth.activationFailed'))
    }
  } catch (error: any) {
    debug.error('Manual activation failed:', error)
    
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.activationFailed'),
      timeout: 3000
    })
  } finally {
    activating.value = false
  }
}

// 重新发送激活码
const resendActivationCode = async () => {
  if (!email.value) return

  resending.value = true
  
  try {
    const response = await apiService.resendActivationEmail({
      email: email.value,
      activation_url: `${window.location.origin}/auth/activate`
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
    resending.value = false
  }
}

// 更新状态显示
const updateStatus = (type: 'success' | 'error' | 'info', icon: string, title: string, message: string) => {
  const colors = {
    success: 'positive',
    error: 'negative', 
    info: 'primary'
  }
  
  activationStatus.icon = icon
  activationStatus.color = colors[type]
  activationStatus.title = title
  activationStatus.message = message
}

// 开始倒计时
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

// 导航方法
const goToLogin = () => {
  router.push('/auth/login')
}

const goToRegister = () => {
  router.push('/auth/register')
}

onMounted(() => {
  // 从URL参数获取激活信息
  email.value = (route.query.email as string) || ''
  token.value = (route.query.token as string) || ''

  // 如果有完整的激活参数，尝试自动激活
  if (email.value && token.value) {
    autoActivate()
  } else if (email.value) {
    // 只有邮箱，显示手动激活界面
    updateStatus('info', 'vpn_key', 'auth.enterActivationCode', 'auth.enterCodeInstruction')
  } else {
    // 缺少参数
    updateStatus('error', 'error', 'auth.activationFailed', 'auth.missingParameters')
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
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
  max-width: 500px;
  width: 100%;
}
</style>
