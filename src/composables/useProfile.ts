import { ref, reactive } from 'vue'
import debug from "src/utils/debug"
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
    debug.log('🔧 [useProfile] Initializing form with user:', authStore.user)
    
    if (authStore.user) {
      form.name = authStore.user.name || ''
      form.phone = authStore.user.phone || ''
      form.signature = authStore.user.signature || ''
      
      debug.log('🔧 [useProfile] Form initialized:', {
        name: form.name,
        phone: form.phone,
        signature: form.signature
      })
    } else {
      debug.log('🔧 [useProfile] No user data available for form initialization')
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

      // API 服务层已经处理了成功判断，这里直接使用返回的用户数据
      const userData = response.data
      
      // 更新本地用户数据
      authStore.user.name = userData.name
      authStore.user.phone = userData.phone || authStore.user.phone
      authStore.user.signature = userData.signature || ''

      $q.notify({
        type: 'positive',
        message: t('user.profileUpdated')
      })
    } catch (error: any) {
      debug.error('资料更新失败:', error)
      
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
