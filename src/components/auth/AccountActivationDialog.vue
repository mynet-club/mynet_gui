<template>
  <q-dialog v-model="show" persistent>
    <q-card class="activation-dialog" style="min-width: 400px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('auth.accountActivation') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-lg">
          {{ $t('auth.activationInstruction') }}
        </div>

        <!-- 激活方式选择 -->
        <q-tabs
          v-model="activationMethod"
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

        <q-tab-panels v-model="activationMethod" animated>
          <!-- 验证码激活 -->
          <q-tab-panel name="code" class="q-px-none">
            <q-form @submit="activateWithCode">
              <q-input
                v-model="form.code"
                :label="$t('auth.activationCode')"
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
                  :label="$t('auth.activate')"
                  :loading="loading"
                  class="col"
                />
                <q-btn
                  flat
                  :label="$t('auth.resendCode')"
                  @click="resendActivationCode"
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

          <!-- 邮件激活 -->
          <q-tab-panel name="email" class="q-px-none">
            <div class="text-center">
              <q-icon name="email" size="48px" color="primary" class="q-mb-md" />
              <div class="text-body1 q-mb-md">
                {{ $t('auth.checkEmailInstruction') }}
              </div>
              <div class="text-caption text-grey-6 q-mb-lg">
                {{ form.email }}
              </div>

              <q-btn
                flat
                :label="$t('auth.resendEmail')"
                @click="resendActivationEmail"
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
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="$emit('cancel')"
        />
      </q-card-actions>
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
  email: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'activated'): void
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

const activationMethod = ref('code')
const loading = ref(false)
const resendingCode = ref(false)
const resendingEmail = ref(false)
const countdown = ref(0)
const emailCountdown = ref(0)

const form = reactive({
  email: props.email,
  code: ''
})

let countdownTimer: NodeJS.Timeout | null = null
let emailCountdownTimer: NodeJS.Timeout | null = null

// 使用验证码激活
const activateWithCode = async () => {
  loading.value = true
  try {
    const response = await apiService.activateAccount({
      email: form.email,
      token: form.code
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.activationSuccess'),
        timeout: 3000
      })
      emit('activated')
      show.value = false
    } else {
      throw new Error(response.data.message || t('auth.activationFailed'))
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || t('auth.activationFailed'),
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

// 重新发送激活码
const resendActivationCode = async () => {
  resendingCode.value = true
  try {
    const response = await apiService.resendActivationEmail({
      email: form.email
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.codeResent'),
        timeout: 3000
      })
      
      // 开始倒计时
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

// 重新发送激活邮件
const resendActivationEmail = async () => {
  resendingEmail.value = true
  try {
    const response = await apiService.resendActivationEmail({
      email: form.email
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.emailResent'),
        timeout: 3000
      })
      
      // 开始邮件倒计时
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
  form.email = props.email
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
.activation-dialog {
  .q-tab-panel {
    padding-top: 16px;
  }
}
</style>
