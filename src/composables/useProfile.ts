import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { apiService } from '../services/api'
import { useAuthStore } from '../stores/auth'

export function useProfile() {
  const $q = useQuasar()
  const { t } = useI18n()
  const authStore = useAuthStore()

  // 表单数据
  const form = reactive({
    name: '',
    phone: '',
    signature: ''
  })

  // 加载状态
  const loading = ref({
    profile: false
  })

  // 初始化表单数据
  const initializeForm = () => {
    console.log('🔧 [useProfile] Initializing form with user:', authStore.user)
    
    if (authStore.user) {
      form.name = authStore.user.name || ''
      form.phone = authStore.user.phone || ''
      form.signature = authStore.user.signature || ''
      
      console.log('🔧 [useProfile] Form initialized:', {
        name: form.name,
        phone: form.phone,
        signature: form.signature
      })
    } else {
      console.log('🔧 [useProfile] No user data available for form initialization')
    }
  }

  // 更新基本资料
  const updateProfile = async () => {
    if (!authStore.user) return

    try {
      loading.value.profile = true

      const response = await apiService.updateUserProfile({
        name: form.name,
        phone: form.phone,
        signature: form.signature
      })

      if (response.data.success) {
        // 更新本地用户数据
        authStore.user.name = response.data.name
        authStore.user.phone = response.data.phone || authStore.user.phone
        authStore.user.signature = response.data.signature || ''

        $q.notify({
          type: 'positive',
          message: response.data.message || t('user.profileUpdated')
        })
      } else {
        throw new Error(response.data.message || 'Update failed')
      }
    } catch (error: any) {
      console.error('资料更新失败:', error)
      
      let errorMessage = t('user.profileUpdateFailed')
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
      loading.value.profile = false
    }
  }

  return {
    form,
    loading,
    initializeForm,
    updateProfile
  }
}
