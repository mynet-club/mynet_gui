import { ref, computed } from 'vue'
import debug from 'src/utils/debug'
import type { 
  NodeKey, 
  NodeKeyApiResponse,
  LocalKeyPair, 
  KeyGenerationRequest, 
  KeyUploadRequest 
} from '../types/nodeKeys'
import { nodeKeysService } from '../services/node/nodeKeysService'
import { useNotify } from './useNotify'

/**
 * 节点密钥管理组合式函数
 */
export function useNodeKeys(nodeId?: string) {
  // 临时通知函数
  const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotify()

  // 状态
  const keys = ref<NodeKey[]>([])
  const loading = ref(false)
  const generating = ref(false)
  const uploading = ref(false)
  const error = ref<string | null>(null)

  // 生成的密钥对（只在生成时临时存储）
  const generatedKeyPair = ref<LocalKeyPair | null>(null)
  const showPrivateKey = ref(false)
  const privateKeyConfirmed = ref(false)

  // 计算属性
  const hasKeys = computed(() => keys.value.length > 0)
  const activeKeys = computed(() => keys.value.filter(key => key.is_active === true))
  const expiredKeys = computed(() => keys.value.filter(key => {
    if (!key.expires_at) return false
    return new Date(key.expires_at) < new Date()
  }))
  const revokedKeys = computed(() => keys.value.filter(key => key.is_active === false))
  const hasActiveKeys = computed(() => activeKeys.value.length > 0)

  /**
   * 加载节点密钥列表
   */
  const loadKeys = async (targetNodeId?: string) => {
    const id = targetNodeId || nodeId
    if (!id) {
      error.value = '节点ID不能为空'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await nodeKeysService.getNodeKeys(id)
      // 处理API返回的数据结构
      const keyData = result.data as NodeKeyApiResponse
      
      // 如果返回的是单个密钥对象，转换为数组
      if (keyData && typeof keyData === 'object' && !Array.isArray(keyData)) {
        // 只有当确实有密钥时才添加到列表中
        if (keyData.has_key && keyData.public_key) {
          const nodeKey: NodeKey = {
            id: keyData.node_id?.toString() || id, // 使用node_id作为id
            node_id: keyData.node_id?.toString() || id,
            key_type: keyData.key_type || 'ed25519',
            public_key: keyData.public_key,
            created_at: keyData.created_at || new Date().toISOString(),
            is_active: true,
            fingerprint: keyData.fingerprint || ''
          }
          keys.value = [nodeKey]
        } else {
          // 没有密钥
          keys.value = []
        }
      } else if (Array.isArray(keyData)) {
        // 如果返回的是数组，直接使用
        keys.value = keyData
      } else {
        // 其他情况，设置为空数组
        keys.value = []
      }
    } catch (err) {
      debug.error('加载密钥列表失败:', err)
      error.value = '加载密钥列表失败'
      notifyError('加载密钥列表失败')
      // 发生错误时设置为空数组
      keys.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成新的密钥对
   */
  const generateKeyPair = async (request: KeyGenerationRequest): Promise<LocalKeyPair | null> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return null
    }

    generating.value = true
    error.value = null
    generatedKeyPair.value = null
    showPrivateKey.value = false
    privateKeyConfirmed.value = false

    try {
      const result = await nodeKeysService.generateNodeKeys(nodeId, request)
      // 根据新的API响应格式转换为 LocalKeyPair 格式
      const keyPair: LocalKeyPair = {
        public_key: result.data.public_key,
        private_key: result.data.private_key,
        fingerprint: '', // API没有返回fingerprint，设为空字符串
        key_type: result.data.key_type
      }
      generatedKeyPair.value = keyPair
      showPrivateKey.value = true
      notifySuccess('密钥对生成成功')
      
      // 重新加载密钥列表
      await loadKeys()
      
      return keyPair
    } catch (err) {
      debug.error('生成密钥对失败:', err)
      error.value = '生成密钥对失败'
      notifyError('生成密钥对失败')
      return null
    } finally {
      generating.value = false
    }
  }

  /**
   * 上传密钥对
   */
  const uploadKeyPair = async (request: KeyUploadRequest): Promise<boolean> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return false
    }

    uploading.value = true
    error.value = null

    try {
      await nodeKeysService.uploadPublicKey(nodeId, request)
      notifySuccess('密钥上传成功')
      
      // 重新加载密钥列表
      await loadKeys()
      
      return true
    } catch (err) {
      debug.error('上传密钥失败:', err)
      error.value = '上传密钥失败'
      notifyError('上传密钥失败')
      return false
    } finally {
      uploading.value = false
    }
  }

  /**
   * 撤销密钥
   */
  const revokeKey = async (keyId: string): Promise<boolean> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return false
    }

    try {
      await nodeKeysService.revokeSpecificKey(nodeId, keyId)
      notifySuccess('密钥撤销成功')
      
      // 更新本地状态
      const keyIndex = keys.value.findIndex(k => k.id === keyId)
      if (keyIndex !== -1 && keys.value[keyIndex]) {
        keys.value[keyIndex].is_active = false
      }
      
      return true
    } catch (err) {
      debug.error('撤销密钥失败:', err)
      error.value = '撤销密钥失败'
      notifyError('撤销密钥失败')
      return false
    }
  }

  /**
   * 删除密钥 (设置为非活跃状态)
   */
  const deleteKey = async (keyId: string): Promise<boolean> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return false
    }

    try {
      await nodeKeysService.updateKeyStatus(nodeId, keyId, false)
      notifySuccess('密钥删除成功')
      
      // 从本地列表中移除
      const keyIndex = keys.value.findIndex(k => k.id === keyId)
      if (keyIndex !== -1) {
        keys.value.splice(keyIndex, 1)
      }
      
      return true
    } catch (err) {
      debug.error('删除密钥失败:', err)
      error.value = '删除密钥失败'
      notifyError('删除密钥失败')
      return false
    }
  }

  /**
   * 下载公钥
   */
  const downloadPublicKey = (key: NodeKey) => {
    try {
      const blob = new Blob([key.public_key], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${key.description || 'node_key'}_public.key`
      a.click()
      URL.revokeObjectURL(url)
      notifySuccess('公钥下载成功')
    } catch (err) {
      debug.error('下载公钥失败:', err)
      notifyError('下载公钥失败')
    }
  }

  /**
   * 下载私钥 (仅在生成时可用)
   */
  const downloadPrivateKey = () => {
    if (!generatedKeyPair.value) {
      notifyWarning('私钥不可用')
      return
    }

    try {
      const blob = new Blob([generatedKeyPair.value.private_key], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'node_key_private.key'
      a.click()
      URL.revokeObjectURL(url)
      notifySuccess('私钥下载成功')
    } catch (err) {
      debug.error('下载私钥失败:', err)
      notifyError('下载私钥失败')
    }
  }

  /**
   * 复制公钥到剪贴板
   */
  const copyPublicKey = async (key: NodeKey) => {
    try {
      await navigator.clipboard.writeText(key.public_key)
      notifySuccess('公钥已复制到剪贴板')
    } catch (err) {
      debug.error('复制公钥失败:', err)
      notifyError('复制公钥失败')
    }
  }

  /**
   * 复制私钥到剪贴板 (仅在生成时可用)
   */
  const copyPrivateKey = async () => {
    if (!generatedKeyPair.value) {
      notifyWarning('私钥不可用')
      return
    }

    try {
      await navigator.clipboard.writeText(generatedKeyPair.value.private_key)
      notifySuccess('私钥已复制到剪贴板')
    } catch (err) {
      debug.error('复制私钥失败:', err)
      notifyError('复制私钥失败')
    }
  }

  /**
   * 确认私钥已保存
   */
  const confirmPrivateKeySaved = () => {
    privateKeyConfirmed.value = true
    showPrivateKey.value = false
    generatedKeyPair.value = null
    notifySuccess('私钥保存确认完成')
  }

  /**
   * 取消私钥显示
   */
  const hidePrivateKey = () => {
    showPrivateKey.value = false
    generatedKeyPair.value = null
  }

  /**
   * 格式化密钥类型
   */
  const formatKeyType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'ed25519': 'ED25519',
      'rsa': 'RSA',
      'ecdsa': 'ECDSA'
    }
    return typeMap[type] || type.toUpperCase()
  }

  /**
   * 格式化密钥状态
   */
  const formatKeyStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'active': '活跃',
      'expired': '已过期',
      'revoked': '已撤销'
    }
    return statusMap[status] || status
  }

  /**
   * 获取密钥状态颜色
   */
  const getKeyStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'active': 'positive',
      'expired': 'warning',
      'revoked': 'negative'
    }
    return colorMap[status] || 'grey'
  }

  /**
   * 验证密钥是否即将过期
   */
  const isKeyExpiringSoon = (key: NodeKey): boolean => {
    if (!key.expires_at) return false
    
    const expiresAt = new Date(key.expires_at)
    const now = new Date()
    const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return diffDays <= 30 && diffDays > 0
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    keys.value = []
    loading.value = false
    generating.value = false
    uploading.value = false
    error.value = null
    generatedKeyPair.value = null
    showPrivateKey.value = false
    privateKeyConfirmed.value = false
  }

  // 注意：不在这里自动加载，由调用方控制加载时机
  // 这样可以避免重复请求和更好地控制加载逻辑

  return {
    // 状态
    keys,
    loading,
    generating,
    uploading,
    error,
    generatedKeyPair,
    showPrivateKey,
    privateKeyConfirmed,
    
    // 计算属性
    hasKeys,
    activeKeys,
    expiredKeys,
    revokedKeys,
    hasActiveKeys,
    
    // 方法
    loadKeys,
    generateKeyPair,
    uploadKeyPair,
    revokeKey,
    deleteKey,
    downloadPublicKey,
    downloadPrivateKey,
    copyPublicKey,
    copyPrivateKey,
    confirmPrivateKeySaved,
    hidePrivateKey,
    formatKeyType,
    formatKeyStatus,
    getKeyStatusColor,
    isKeyExpiringSoon,
    clearError,
    reset
  }
}
