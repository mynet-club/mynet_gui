import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../services/api'

export function usePasswordManagement() {
  const $q = useQuasar()
  const { t } = useI18n()

  // 密码修改表单
  const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 对话框状态
  const showPasswordDialog = ref(false)

  // 加载状态
  const loading = ref({
    password: false
  })

  // 重置密码表单
  const resetPasswordForm = () => {
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }

  // 验证密码表单
  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      $q.notify({
        type: 'negative',
        message: t('user.validation.currentPasswordRequired')
      })
      return false
    }

    if (!passwordForm.newPassword) {
      $q.notify({
        type: 'negative',
        message: t('user.validation.newPasswordRequired')
      })
      return false
    }

    if (passwordForm.newPassword.length < 6) {
      $q.notify({
        type: 'negative',
        message: t('user.validation.passwordTooShort')
      })
      return false
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      $q.notify({
        type: 'negative',
        message: t('user.validation.passwordMismatch')
      })
      return false
    }

    return true
  }

  // 修改密码
  const changePassword = async () => {
    if (!validatePasswordForm()) return

    try {
      loading.value.password = true

      const response = await apiService.changePassword({
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword
      })

      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: response.data.message || t('user.passwordChanged')
        })
        
        showPasswordDialog.value = false
        resetPasswordForm()
      } else {
        throw new Error(response.data.message || 'Password change failed')
      }
    } catch (error: any) {
      console.error('密码修改失败:', error)
      
      let errorMessage = t('user.passwordChangeFailed')
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      $q.notify({
        type: 'negative',
        message: errorMessage
      })
    } finally {
      loading.value.password = false
    }
  }

  return {
    passwordForm,
    showPasswordDialog,
    loading,
    resetPasswordForm,
    validatePasswordForm,
    changePassword
  }
}
