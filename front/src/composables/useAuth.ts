import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth'

export function useAuth() {
  const router = useRouter()
  const $q = useQuasar()
  const authStore = useAuthStore()

  const isLoading = ref(false)

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
    agreeTerms: false
  })

  // 忘记密码表单
  const forgotPasswordForm = reactive({
    email: ''
  })

  // 邮件验证表单
  const emailVerificationForm = reactive({
    verificationCode: ''
  })

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 登录
  const login = async () => {
    isLoading.value = true
    try {
      await authStore.login({ 
        email: loginForm.email, 
        password: loginForm.password 
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      $q.notify({
        type: 'negative',
        message: 'Login failed. Please check your credentials.',
        timeout: 3000
      })
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async () => {
    isLoading.value = true
    try {
      // TODO: 实现注册逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      $q.notify({
        type: 'positive',
        message: 'Registration successful! Please check your email for verification.',
        timeout: 3000
      })
      
      router.push('/auth/login')
    } catch (error) {
      console.error('Registration failed:', error)
      $q.notify({
        type: 'negative',
        message: 'Registration failed. Please try again.',
        timeout: 3000
      })
    } finally {
      isLoading.value = false
    }
  }

  // 忘记密码
  const forgotPassword = async () => {
    isLoading.value = true
    try {
      // TODO: 实现忘记密码逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      $q.notify({
        type: 'positive',
        message: 'Password reset link sent to your email!',
        timeout: 3000
      })
      
      router.push('/auth/login')
    } catch (error) {
      console.error('Forgot password failed:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to send reset link. Please try again.',
        timeout: 3000
      })
    } finally {
      isLoading.value = false
    }
  }

  // 邮件验证
  const verifyEmail = async () => {
    isLoading.value = true
    try {
      // TODO: 实现邮件验证逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      $q.notify({
        type: 'positive',
        message: 'Email verified successfully!',
        timeout: 3000
      })
      
      return true
    } catch (error) {
      console.error('Email verification failed:', error)
      $q.notify({
        type: 'negative',
        message: 'Email verification failed. Please try again.',
        timeout: 3000
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 重新发送验证码
  const resendCode = async () => {
    try {
      // TODO: 实现重新发送验证码逻辑
      await new Promise(resolve => setTimeout(resolve, 500))
      
      $q.notify({
        type: 'positive',
        message: 'Verification code sent!',
        timeout: 3000
      })
      
      return 60 // 返回倒计时秒数
    } catch (error) {
      console.error('Resend code failed:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to resend code. Please try again.',
        timeout: 3000
      })
      return 0
    }
  }

  return {
    // 状态
    isLoading,
    loginForm,
    registerForm,
    forgotPasswordForm,
    emailVerificationForm,
    
    // 方法
    validateEmail,
    login,
    register,
    forgotPassword,
    verifyEmail,
    resendCode
  }
} 