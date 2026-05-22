<template>
  <q-card class="auth-card q-pa-md">
    <!-- Logo区域 -->
    <div class="auth-logo">
      <img src="/icons/icon.png" alt="MyNet" class="logo-icon" />
      <div class="logo-text">MyNet</div>
      <div class="logo-tagline">Self-sovereign Networking</div>
    </div>
    
    <q-card-section class="auth-header">
      <div class="auth-title">{{ $t('auth.registerTitle') }}</div>
      <div class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-form @submit="handleRegister" class="auth-form q-gutter-md">
        <q-input 
          v-model="registerForm.name"
          outlined
          class="form-field"
          :placeholder="$t('auth.namePlaceholder')"
          :rules="[val => !!val || $t('auth.nameRequired')]"
        />
        
        <q-input 
          v-model="registerForm.email"
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
          type="password"
          outlined
          class="form-field"
          :placeholder="$t('auth.confirmPasswordPlaceholder')"
          :rules="[
            val => !!val || $t('auth.confirmPasswordRequired'),
            val => val === registerForm.password || $t('auth.passwordMismatch')
          ]"
        />
        
        <div class="invitation-field-wrapper">
          <q-input 
            v-model="registerForm.invitation"
            outlined
            class="form-field"
            :placeholder="$t('auth.invitationPlaceholder')"
            :rules="[val => !!val || $t('auth.invitationRequired')]"
          />
          
          <div class="invitation-help">
            <span class="invitation-help-text" @click="showInvitationHelp = true">
              {{ $t('auth.noInvitationCode') }}
            </span>
          </div>
        </div>
        
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
          :disable="!registerForm.agreeTerms"
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
    
    <!-- 邀请码获取帮助对话框 -->
    <q-dialog v-model="showInvitationHelp">
      <q-card style="min-width: 350px; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('auth.invitationCodeHelpTitle') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-body2 q-mb-md">{{ $t('auth.invitationCodeHelpMessage') }}</p>
          
          <div class="community-links q-gutter-sm">
            <q-btn
              outline
              color="primary"
              icon="forum"
              :label="$t('auth.telegramCommunity')"
              class="full-width"
              @click="openTelegram"
            />
            
            <q-btn
              outline
              color="primary"
              icon="chat"
              :label="$t('auth.discordCommunity')"
              class="full-width"
              @click="openDiscord"
            />
            
            <q-separator class="q-my-md" />
            
            <q-btn
              unelevated
              color="primary"
              icon="public"
              :label="$t('auth.visitVillage')"
              class="full-width"
              @click="openVillage"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import debug from 'src/utils/debug'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuth } from '../../composables/useAuth'
import { APP_CONFIG } from '../../config/app'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const { registerForm, isLoading, validateEmail, register } = useAuth()

// 邀请码帮助对话框状态
const showInvitationHelp = ref(false)

const handleRegister = async () => {
  try {
    await register()
    
    // 显示成功提示
    $q.notify({
      type: 'positive',
      message: t('auth.registrationSuccessful'),
      timeout: 3000
    })
    
    // 跳转到激活页面，传递邮箱参数
    await router.push({
      path: '/auth/activate',
      query: { 
        email: registerForm.email,
        from: 'register'
      }
    })
  } catch (error) {
    debug.error('Registration failed:', error)
  }
}

// 打开Telegram社区
const openTelegram = () => {
  window.open('https://t.me/+QjdreEYp2ZRkMjc1', '_blank')
  showInvitationHelp.value = false
}

// 打开Discord社区
const openDiscord = () => {
  window.open('https://discord.gg/7e3NaPnJ', '_blank')
  showInvitationHelp.value = false
}

// 打开社区主页
const openVillage = () => {
  window.open(`${APP_CONFIG.urls.www}/village`, '_blank')
  showInvitationHelp.value = false
}

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

.invitation-field-wrapper {
  position: relative;
  
  .invitation-help {
    margin-top: 0.5rem;
    text-align: right;
    
    .invitation-help-text {
      font-size: 0.8125rem;
      color: var(--q-primary);
      cursor: pointer;
      text-decoration: none;
      transition: color 0.15s ease;
      
      &:hover {
        color: var(--q-primary);
        text-decoration: underline;
      }
    }
  }
}

.community-links {
  .q-btn {
    justify-content: flex-start;
    
    :deep(.q-icon) {
      margin-right: 8px;
    }
  }
}

// Dark模式下的对话框优化
.body--dark {
  .q-dialog__backdrop {
    background: rgba(0, 0, 0, 0.6);
  }
  
  .q-card {
    background: var(--q-dark);
    color: var(--q-grey-1);
    
    .text-body2 {
      color: var(--q-grey-3);
    }
  }
}
</style>
