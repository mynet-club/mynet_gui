import { ref } from 'vue'
import debug from "src/utils/debug"
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../services/api'
import { useAuthStore } from '../stores/auth'

export function useAvatarManagement() {
  const $q = useQuasar()
  const { t } = useI18n()
  const authStore = useAuthStore()

  // 加载状态
  const loading = ref({
    avatar: false
  })

  // 文件上传限制
  const MAX_FILE_SIZE = 1024 * 1024 // 1MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  // 验证文件
  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      $q.notify({
        type: 'negative',
        message: t('user.validation.fileTooLarge')
      })
      return false
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      $q.notify({
        type: 'negative',
        message: t('user.validation.invalidFileType')
      })
      return false
    }

    return true
  }

  // 更改头像
  const changeAvatar = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file && validateFile(file)) {
        await uploadAvatar(file)
      }
    }
    input.click()
  }

  // 上传头像
  const uploadAvatar = async (file: File) => {
    try {
      loading.value.avatar = true
      
      // 调用API上传头像
      const response = await apiService.uploadAvatar(file)
      
      if (response.data.success) {
        debug.log('🔧 [Avatar] Upload response:', response.data)
        
        $q.notify({
          type: 'positive',
          message: response.data.message || t('user.avatarUpdated')
        })

        return true
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error: any) {
      debug.error('头像上传失败:', error)
      
      let errorMessage = t('user.avatarUpdateFailed')
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ')
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      $q.notify({
        type: 'negative',
        message: errorMessage
      })
      
      return false
    } finally {
      loading.value.avatar = false
    }
  }

  return {
    loading,
    changeAvatar,
    uploadAvatar,
    validateFile
  }
}
