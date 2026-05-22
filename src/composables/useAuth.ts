import { ref, reactive } from 'vue'
import debug from 'src/utils/debug'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api' // 修复导入路径

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const $q = useQuasar()
  const { t } = useI18n()
  const authStore = useAuthStore()

  const isLoading = ref(false)
  const loginError = ref<string | null>(null)

  // 登录表单
  const loginForm = reactive({
    email: '',
    password: '',
    rememberMe: false
  })

  // 注册表单
  const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    ageVerified: false,
    invitation: '' // 添加邀请码字段
  })

  // 忘记密码表单
  const forgotPasswordForm = reactive({
    email: ''
  })

  // 邮件验证表单
  const emailVerificationForm = reactive({
    email: '',
    verificationCode: ''
  })

  // 重置密码表单
  const resetPasswordForm = reactive({
    token: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 清除登录错误
  const clearError = () => {
    loginError.value = null
  }

  // 处理账户激活错误
  const handleActivationError = (code: number, email: string, message?: string) => {
    if (code === 4031) {
      // 4031: 提醒用户去邮箱激活（可选择重新发送）
      $q.dialog({
        title: t('auth.accountNeedsActivation'),
        message: message || t('auth.accountNeedsActivationMessage'),
        persistent: true,
        ok: {
          label: t('auth.gotoActivationPage'),
          color: 'primary'
        },
        cancel: {
          label: t('auth.resendActivationEmail'),
          color: 'secondary',
          flat: true
        }
      }).onOk(() => {
        router.push(`/auth/activate?email=${encodeURIComponent(email)}`)
      }).onCancel(() => {
        resendActivationEmail(email)
      })
    } else if (code === 4032) {
      // 4032: 激活邮件已失效，必须重新发送
      $q.dialog({
        title: t('auth.activationEmailExpired'),
        message: message || t('auth.activationEmailExpiredMessage'),
        persistent: true,
        ok: {
          label: t('auth.resendActivationEmail'),
          color: 'primary'
        },
        cancel: {
          label: t('auth.gotoActivationPage'),
          color: 'secondary',
          flat: true
        }
      }).onOk(() => {
        resendActivationEmail(email)
      }).onCancel(() => {
        router.push(`/auth/activate?email=${encodeURIComponent(email)}&expired=1`)
      })
    }
  }

  // 重新发送激活邮件
  const resendActivationEmail = async (email: string) => {
    try {
      const response = await apiService.resendActivationEmail({ email })

      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: t('auth.activationEmailResent'),
          timeout: 3000
        })

        // 跳转到激活页面
        router.push(`/auth/activate?email=${encodeURIComponent(email)}&resent=1`)
      } else {
        throw new Error(response.data.message || 'Failed to send')
      }
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: error.message || t('auth.resendActivationFailed'),
        timeout: 3000
      })
    }
  }

  // 登录
  const login = async () => {
    isLoading.value = true
    loginError.value = null // 清除之前的错误
    try {
      await authStore.login({
        email: loginForm.email,
        password: loginForm.password
      })

      debug.log('🔧 [useAuth] Login successful, checking auth state:', {
        isAuthenticated: authStore.isAuthenticated,
        hasUser: !!authStore.user,
        hasToken: !!authStore.token,
        tokenExpiry: authStore.tokenExpiry,
        currentTime: Date.now(),
        tokenExpired: authStore.tokenExpiry <= Date.now()
      })

      // 确保认证状态已经更新
      if (authStore.isAuthenticated) {
        // 检查是否有外部回调（如 CTL setup 跳转登录）
        const callback = route.query.callback as string
        if (callback) {
          debug.log('[useAuth] OAuth callback detected, redirecting to:', callback)
          const sep = callback.includes('?') ? '&' : '?'
          window.location.href = callback + sep + 'token=' + encodeURIComponent(authStore.token!)
          return
        }

        debug.log('🔧 [useAuth] Navigating to dashboard...')
        await router.push('/app/dashboard')
        debug.log('🔧 [useAuth] Navigation to dashboard completed')
      } else {
        debug.error('🔧 [useAuth] Login succeeded but not authenticated')
      }
    } catch (error: any) {
      debug.error('Login failed:', error)

      // 根据不同的错误类型显示不同的错误信息
      let errorMessage = 'Login failed. Please try again.'

      if (error.response) {
        // 服务器响应了错误状态码
        const { status, data } = error.response

        switch (status) {
          case 401:
            errorMessage = data?.message || 'Invalid email or password. Please check your credentials.'
            break
          case 403: {
            // 检查是否是账户激活相关的错误 (403 + error_code)
            // error_code 可能是字符串或数字，都要兼容
            const errorCode = data?.error_code
            if (errorCode === 4031 || errorCode === '4031' || errorCode === 4032 || errorCode === '4032') {
              // 统一转换为数字
              const numericCode = typeof errorCode === 'string' ? parseInt(errorCode) : errorCode
              handleActivationError(numericCode, loginForm.email, data.message)
              return // 不继续执行后面的错误处理
            }
            // 兼容处理：如果没有 error_code 但消息提示未激活，也进入激活流程
            else if (data?.message?.includes('not activated') || data?.message?.includes('activation')) {
              handleActivationError(4031, loginForm.email, data.message)
              return
            }
            errorMessage = data?.message || 'Account is disabled or access forbidden.'
            break
          }
          case 422:
            errorMessage = data?.message || 'Invalid input data. Please check your email and password format.'
            break
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.'
            break
          case 500:
            errorMessage = 'Server error. Please try again later.'
            break
          default:
            errorMessage = data?.message || `Login failed (${status}). Please try again.`
        }
      } else if (error.request) {
        // 网络错误
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else {
        // 其他错误
        errorMessage = error.message || 'An unexpected error occurred. Please try again.'
      }

      // 设置错误状态供组件显示
      loginError.value = errorMessage

      // 也保留通知，但缩短显示时间
      $q.notify({
        type: 'negative',
        message: errorMessage,
        timeout: 3000, // 缩短通知时间
        position: 'top'
      })

      // 不刷新页面，让用户有机会重新尝试或查看错误信息
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async () => {
    isLoading.value = true
    try {
      const response = await apiService.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        invitation: registerForm.invitation,
        device_name: 'Web Browser',
        activation_url: `${window.location.origin}/auth/activate`
      });

      $q.notify({
        type: 'positive',
        message: response.data.message || 'Registration successful! Please check your email or enter the activation code.',
        timeout: 5000
      });

      // 不再自动跳转，而是由调用组件处理后续逻辑
    } catch (error: any) {
      debug.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      $q.notify({
        type: 'negative',
        message: errorMessage,
        timeout: 3000
      });
      throw error; // 重新抛出错误供调用组件处理
    } finally {
      isLoading.value = false;
    }
  }

  // 忘记密码
  const forgotPassword = async (data?: { email: string; redirect_url?: string }) => {
    isLoading.value = true
    try {
      const email = data?.email || forgotPasswordForm.email
      const response = await apiService.forgotPassword({
        email,
        redirect_url: data?.redirect_url || `${window.location.origin}/auth/reset-password`
      })

      if (response.data.success) {
        return response.data
      } else {
        throw new Error(response.data.message || '发送重置邮件失败')
      }
    } catch (error: any) {
      debug.error('Forgot password failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 邮件验证
  const verifyEmail = async (email?: string) => {
    isLoading.value = true
    try {
      const emailToVerify = email || emailVerificationForm.email || forgotPasswordForm.email || registerForm.email
      if (!emailToVerify) {
        throw new Error('邮箱地址不能为空')
      }

      const response = await apiService.activateAccount({
        email: emailToVerify,
        token: emailVerificationForm.verificationCode
      })

      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || '邮箱验证成功！',
          timeout: 3000
        })

        return true
      } else {
        throw new Error(response.data.message || '邮箱验证失败')
      }
    } catch (error: any) {
      debug.error('Email verification failed:', error)
      $q.notify({
        type: 'negative',
        message: error.message || '邮箱验证失败，请检查验证码',
        timeout: 3000
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 重新发送验证码
  const resendCode = async (email?: string) => {
    try {
      const emailToSend = email || emailVerificationForm.email || forgotPasswordForm.email || registerForm.email
      if (!emailToSend) {
        throw new Error('邮箱地址不能为空')
      }

      const response = await apiService.resendActivationEmail({
        email: emailToSend,
        activation_url: `${window.location.origin}/auth/activate`
      })

      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || '验证码已重新发送',
          timeout: 3000
        })

        // 返回冷却时间（秒）
        return response.data.cooldown_seconds || 60
      } else {
        throw new Error(response.data.message || '重新发送验证码失败')
      }
    } catch (error: any) {
      debug.error('Resend verification code failed:', error)
      $q.notify({
        type: 'negative',
        message: error.message || '重新发送验证码失败，请稍后再试',
        timeout: 3000
      })
      return 0
    }
  }

  // 重置密码
  const resetPassword = async () => {
    isLoading.value = true
    try {
      const response = await apiService.resetPassword({
        token: resetPasswordForm.token,
        email: resetPasswordForm.email,
        password: resetPasswordForm.password,
        password_confirmation: resetPasswordForm.confirmPassword
      })

      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || '密码重置成功！',
          timeout: 3000
        })

        router.push('/auth/login')
      } else {
        throw new Error(response.data.message || '密码重置失败')
      }
    } catch (error: any) {
      debug.error('Reset password failed:', error)
      $q.notify({
        type: 'negative',
        message: error.message || '密码重置失败，请稍后再试',
        timeout: 3000
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    isLoading,
    loginError,
    loginForm,
    registerForm,
    forgotPasswordForm,
    emailVerificationForm,
    resetPasswordForm,

    // 方法
    validateEmail,
    clearError,
    login,
    register,
    forgotPassword,
    verifyEmail,
    resendCode,
    resetPassword,
    handleActivationError,
    resendActivationEmail
  }
}
