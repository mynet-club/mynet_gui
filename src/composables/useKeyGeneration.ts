import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import debug from "src/utils/debug"
import type { KeyType, LocalKeyPair, KeyValidationResult } from '../types/nodeKeys'
import { 
  generateEd25519KeyPair, 
  validateKeyFormat, 
  validateKeyPairMatch,
  checkKeyStrength,
  formatKeyForDisplay,
  copyKeyToClipboard,
  downloadKeyToFile,
  readKeyFromFile,
  getKeySecurityTips
} from '../utils/keyUtils'
import { useNotify } from './useNotify'

/**
 * 本地密钥生成组合式函数
 */
export function useKeyGeneration() {
  // i18n
  const { t } = useI18n()
  
  // 临时通知函数
  const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotify()

  // 状态
  const generating = ref(false)
  const generatedKeyPair = ref<LocalKeyPair | null>(null)
  const showPrivateKey = ref(false)
  const privateKeyConfirmed = ref(false)
  const keyType = ref<KeyType>('ed25519')
  const error = ref<string | null>(null)

  // 上传相关状态
  const uploading = ref(false)
  const uploadedPublicKey = ref('')
  const uploadedPrivateKey = ref('')
  const uploadValidation = ref<KeyValidationResult | null>(null)

  // 计算属性
  const hasGeneratedKey = computed(() => generatedKeyPair.value !== null)
  const canShowPrivateKey = computed(() => hasGeneratedKey.value && !privateKeyConfirmed.value)
  const keySecurityTips = computed(() => getKeySecurityTips(keyType.value))

  // 格式化显示
  const formattedPublicKey = computed(() => {
    if (!generatedKeyPair.value) return ''
    return formatKeyForDisplay(generatedKeyPair.value.public_key)
  })

  const formattedPrivateKey = computed(() => {
    if (!generatedKeyPair.value) return ''
    return formatKeyForDisplay(generatedKeyPair.value.private_key)
  })

  // 密钥强度检查
  const keyStrength = computed(() => {
    if (!generatedKeyPair.value) return null
    return checkKeyStrength(generatedKeyPair.value.public_key, keyType.value)
  })

  // 上传密钥验证
  const uploadKeyValidation = computed(() => {
    if (!uploadedPublicKey.value) return null
    return validateKeyFormat(uploadedPublicKey.value, keyType.value)
  })

  /**
   * 生成新密钥对
   */
  const generateKeyPair = async (targetKeyType: KeyType = 'ed25519'): Promise<LocalKeyPair | null> => {
    generating.value = true
    error.value = null
    generatedKeyPair.value = null
    showPrivateKey.value = false
    privateKeyConfirmed.value = false
    keyType.value = targetKeyType

    try {
      let keyPair: LocalKeyPair

      if (targetKeyType === 'ed25519' || targetKeyType === 'gnb') {
        keyPair = generateEd25519KeyPair()
      } else {
        throw new Error(`不支持的密钥类型: ${targetKeyType}`)
      }

      // 验证生成的密钥
      const validation = validateKeyPairMatch(keyPair.public_key, keyPair.private_key, targetKeyType)
      if (!validation.valid) {
        throw new Error(`生成的密钥验证失败: ${validation.errors.join(', ')}`)
      }

      generatedKeyPair.value = keyPair
      showPrivateKey.value = true
      notifySuccess(t('nodes.keys.keyPairGenerated'))
      
      return keyPair
    } catch (err) {
      debug.error('生成密钥对失败:', err)
      error.value = err instanceof Error ? err.message : '生成密钥对失败'
      notifyError(error.value)
      return null
    } finally {
      generating.value = false
    }
  }

  /**
   * 重新生成密钥对
   */
  const regenerateKeyPair = async (): Promise<LocalKeyPair | null> => {
    return generateKeyPair(keyType.value)
  }

  /**
   * 复制公钥到剪贴板
   */
  const copyPublicKey = async (): Promise<boolean> => {
    if (!generatedKeyPair.value) {
      notifyWarning('没有可复制的公钥')
      return false
    }

    const success = await copyKeyToClipboard(generatedKeyPair.value.public_key)
    if (success) {
      notifySuccess(t('nodes.keys.publicKeyCopied'))
    } else {
      notifyError(t('nodes.keys.keyCopyFailed'))
    }
    return success
  }

  /**
   * 复制私钥到剪贴板
   */
  const copyPrivateKey = async (): Promise<boolean> => {
    if (!generatedKeyPair.value) {
      notifyWarning('没有可复制的私钥')
      return false
    }

    const success = await copyKeyToClipboard(generatedKeyPair.value.private_key)
    if (success) {
      notifySuccess(t('nodes.keys.privateKeyCopied'))
    } else {
      notifyError(t('nodes.keys.keyCopyFailed'))
    }
    return success
  }

  /**
   * 下载公钥文件
   */
  const downloadPublicKey = (): void => {
    if (!generatedKeyPair.value) {
      notifyWarning('没有可下载的公钥')
      return
    }

    try {
      const filename = `node_public_key_${keyType.value}_${Date.now()}.key`
      downloadKeyToFile(generatedKeyPair.value.public_key, filename, 'public')
      notifySuccess(t('nodes.keys.downloadSuccess'))
    } catch (err) {
      debug.error('下载公钥失败:', err)
      notifyError(t('nodes.keys.downloadFailed'))
    }
  }

  /**
   * 下载私钥文件
   */
  const downloadPrivateKey = (): void => {
    if (!generatedKeyPair.value) {
      notifyWarning('没有可下载的私钥')
      return
    }

    try {
      const filename = `node_private_key_${keyType.value}_${Date.now()}.key`
      downloadKeyToFile(generatedKeyPair.value.private_key, filename, 'private')
      notifySuccess(t('nodes.keys.privateKeyDownloadSuccess'))
    } catch (err) {
      debug.error('下载私钥失败:', err)
      notifyError(t('nodes.keys.privateKeyDownloadFailed'))
    }
  }

  /**
   * 从文件上传公钥
   */
  const uploadPublicKeyFile = async (file: File): Promise<boolean> => {
    uploading.value = true
    error.value = null

    try {
      const keyContent = await readKeyFromFile(file)
      uploadedPublicKey.value = keyContent
      
      // 验证上传的密钥
      const validation = validateKeyFormat(keyContent, keyType.value)
      uploadValidation.value = validation
      
      if (validation.valid) {
        notifySuccess(t('nodes.keys.uploadSuccess'))
        return true
      } else {
        notifyError(`${t('nodes.keys.uploadFailed')}: ${validation.errors.join(', ')}`)
        return false
      }
    } catch (err) {
      debug.error('上传公钥失败:', err)
      error.value = err instanceof Error ? err.message : '上传公钥失败'
      notifyError(error.value)
      return false
    } finally {
      uploading.value = false
    }
  }

  /**
   * 手动输入公钥
   */
  const inputPublicKey = (keyContent: string): KeyValidationResult => {
    uploadedPublicKey.value = keyContent.trim()
    
    // 验证输入的密钥
    const validation = validateKeyFormat(uploadedPublicKey.value, keyType.value)
    uploadValidation.value = validation
    
    if (validation.valid) {
      notifySuccess(t('nodes.keys.validationSuccess'))
    } else {
      notifyWarning(`${t('nodes.keys.uploadFailed')}: ${validation.errors.join(', ')}`)
    }
    
    return validation
  }

  /**
   * 确认私钥已保存
   */
  const confirmPrivateKeySaved = (): void => {
    privateKeyConfirmed.value = true
    showPrivateKey.value = false
    notifySuccess(t('nodes.keys.privateKeySaved'))
  }

  /**
   * 重新显示私钥
   */
  const showPrivateKeyAgain = (): void => {
    if (!privateKeyConfirmed.value && generatedKeyPair.value) {
      showPrivateKey.value = true
    }
  }

  /**
   * 隐藏私钥
   */
  const hidePrivateKey = (): void => {
    showPrivateKey.value = false
  }

  /**
   * 清理生成的密钥
   */
  const clearGeneratedKeys = (): void => {
    generatedKeyPair.value = null
    showPrivateKey.value = false
    privateKeyConfirmed.value = false
  }

  /**
   * 清理上传的密钥
   */
  const clearUploadedKeys = (): void => {
    uploadedPublicKey.value = ''
    uploadedPrivateKey.value = ''
    uploadValidation.value = null
  }

  /**
   * 清除错误
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * 重置所有状态
   */
  const reset = (): void => {
    generating.value = false
    uploading.value = false
    error.value = null
    keyType.value = 'ed25519'
    clearGeneratedKeys()
    clearUploadedKeys()
  }

  /**
   * 获取密钥使用指南
   */
  const getKeyUsageGuide = (): string[] => {
    return [
      '1. 生成密钥对或上传现有公钥',
      '2. 立即保存私钥到安全位置（私钥只显示一次）',
      '3. 将公钥提交给节点配置',
      '4. 确认私钥已安全保存',
      '5. 使用私钥进行节点连接认证'
    ]
  }

  return {
    // 状态
    generating,
    generatedKeyPair,
    showPrivateKey,
    privateKeyConfirmed,
    keyType,
    error,
    uploading,
    uploadedPublicKey,
    uploadedPrivateKey,
    uploadValidation,
    
    // 计算属性
    hasGeneratedKey,
    canShowPrivateKey,
    keySecurityTips,
    formattedPublicKey,
    formattedPrivateKey,
    keyStrength,
    uploadKeyValidation,
    
    // 方法
    generateKeyPair,
    regenerateKeyPair,
    copyPublicKey,
    copyPrivateKey,
    downloadPublicKey,
    downloadPrivateKey,
    uploadPublicKeyFile,
    inputPublicKey,
    confirmPrivateKeySaved,
    showPrivateKeyAgain,
    hidePrivateKey,
    clearGeneratedKeys,
    clearUploadedKeys,
    clearError,
    reset,
    getKeyUsageGuide
  }
}
