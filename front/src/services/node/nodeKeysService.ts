/**
 * 节点密钥管理服务
 * 基于OpenAPI文档 v1.0.0 和 ed25519 密钥规范
 */

import { api } from '../api'
import type {
  NodeKey,
  NodeKeyApiResponse,
  KeyGenerationApiResponse,
  KeyGenerationRequest,
  KeyGenerationResult,
  KeyUploadRequest,
  KeyOperationResult,
  KeysListParams,
  LocalKeyPair,
  KeyValidationResult,
  KeyType
} from '../../types/nodeKeys'
import { ED25519_KEY_SPEC } from '../../types/nodeKeys'
import type {
  ApiResponse,
  PaginatedApiResponse
} from '../../types/api'

/**
 * 节点密钥服务类
 * 提供密钥的生成、上传、管理等功能
 */
export class NodeKeysService {

  /**
   * 获取节点密钥列表
   * @param nodeId 节点ID
   * @returns 密钥列表
   */
  async getNodeKeys(nodeId: string): Promise<ApiResponse<NodeKeyApiResponse>> {
    const response = await api.get(`/nodes/${nodeId}/keys`)
    return response.data
  }

  /**
   * 服务端生成密钥
   * @param nodeId 节点ID
   * @param request 生成请求参数
   * @returns 生成的密钥（包含私钥，仅显示一次）
   */
  async generateNodeKeys(nodeId: string, request?: KeyGenerationRequest): Promise<ApiResponse<KeyGenerationApiResponse>> {
    const response = await api.post(`/nodes/${nodeId}/keys/generate`, request || { key_type: 'ed25519' })
    return response.data
  }

  /**
   * 上传用户公钥
   * @param nodeId 节点ID
   * @param request 上传请求
   * @returns 上传结果
   */
  async uploadPublicKey(nodeId: string, request: KeyUploadRequest): Promise<ApiResponse<NodeKey>> {
    // 首先验证公钥格式
    const validation = this.validatePublicKey(request.public_key, request.key_type)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    const response = await api.post(`/nodes/${nodeId}/keys/upload`, request)
    return response.data
  }

  /**
   * 撤销节点密钥
   * @param nodeId 节点ID
   * @returns 撤销结果
   */
  async revokeNodeKeys(nodeId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/nodes/${nodeId}/keys`)
    return response.data
  }

  /**
   * 撤销特定密钥
   * @param nodeId 节点ID
   * @param keyId 密钥ID
   * @returns 撤销结果
   */
  async revokeSpecificKey(nodeId: string, keyId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/nodes/${nodeId}/keys/${keyId}`)
    return response.data
  }

  /**
   * 更新密钥状态
   * @param nodeId 节点ID
   * @param keyId 密钥ID
   * @param active 是否活跃
   * @returns 更新结果
   */
  async updateKeyStatus(nodeId: string, keyId: string, active: boolean): Promise<ApiResponse<NodeKey>> {
    const response = await api.patch(`/nodes/${nodeId}/keys/${keyId}/status`, { active })
    return response.data
  }

  // --- 本地密钥生成和验证 ---

  /**
   * 本地生成ed25519密钥对
   * @returns 本地生成的密钥对
   */
  async generateLocalKeyPair(): Promise<LocalKeyPair> {
    try {
      // 检查浏览器是否支持WebCrypto API
      if (!crypto.subtle) {
        throw new Error('浏览器不支持WebCrypto API')
      }

      // 生成ed25519密钥对
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519'
        },
        true, // 可导出
        ['sign', 'verify']
      )

      // 导出公钥
      const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey)
      const publicKey = Array.from(new Uint8Array(publicKeyBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // 导出私钥 (使用PKCS#8格式)
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
      const privateKey = Array.from(new Uint8Array(privateKeyBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // 生成指纹
      const fingerprint = await this.generateFingerprint(publicKey)

      return {
        public_key: publicKey,
        private_key: privateKey,
        fingerprint,
        key_type: 'ed25519'
      }
    } catch (error) {
      throw new Error(`密钥生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 生成公钥指纹
   * @param publicKey 公钥
   * @returns 指纹
   */
  async generateFingerprint(publicKey: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(publicKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
  }

  /**
   * 验证公钥格式
   * @param publicKey 公钥
   * @param keyType 密钥类型
   * @returns 验证结果
   */
  validatePublicKey(publicKey: string, keyType: KeyType): KeyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 基础检查
    if (!publicKey || publicKey.trim().length === 0) {
      errors.push('公钥不能为空')
      return {
        valid: false,
        errors,
        warnings,
        key_length: 0,
        expected_length: this.getExpectedKeyLength(keyType, 'public')
      }
    }

    // 去除空白字符
    const cleanKey = publicKey.trim()

    // 检查是否为十六进制
    if (!ED25519_KEY_SPEC.HEX_PATTERN.test(cleanKey)) {
      errors.push('公钥必须是十六进制字符串')
    }

    // 检查长度
    const expectedLength = this.getExpectedKeyLength(keyType, 'public')
    if (cleanKey.length !== expectedLength) {
      errors.push(`公钥长度应为${expectedLength}字符，当前为${cleanKey.length}字符`)
    }

    // ed25519特定检查
    if (keyType === 'ed25519') {
      if (cleanKey.length === 64) {
        // 检查是否为有效的ed25519公钥（这里可以添加更多验证逻辑）
        if (cleanKey.startsWith('00000000')) {
          warnings.push('公钥可能无效：以过多零开头')
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      key_length: cleanKey.length,
      expected_length: expectedLength
    }
  }

  /**
   * 验证私钥格式
   * @param privateKey 私钥
   * @param keyType 密钥类型
   * @returns 验证结果
   */
  validatePrivateKey(privateKey: string, keyType: KeyType): KeyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!privateKey || privateKey.trim().length === 0) {
      errors.push('私钥不能为空')
      return {
        valid: false,
        errors,
        warnings,
        key_length: 0,
        expected_length: this.getExpectedKeyLength(keyType, 'private')
      }
    }

    const cleanKey = privateKey.trim()

    // 检查是否为十六进制
    if (!ED25519_KEY_SPEC.HEX_PATTERN.test(cleanKey)) {
      errors.push('私钥必须是十六进制字符串')
    }

    // 检查长度
    const expectedLength = this.getExpectedKeyLength(keyType, 'private')
    if (cleanKey.length !== expectedLength) {
      errors.push(`私钥长度应为${expectedLength}字符，当前为${cleanKey.length}字符`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      key_length: cleanKey.length,
      expected_length: expectedLength
    }
  }

  /**
   * 获取期望的密钥长度
   * @param keyType 密钥类型
   * @param keyKind 密钥种类
   * @returns 期望长度
   */
  getExpectedKeyLength(keyType: KeyType, keyKind: 'public' | 'private'): number {
    switch (keyType) {
      case 'ed25519':
      case 'gnb':
        return keyKind === 'public' ? ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH : ED25519_KEY_SPEC.PRIVATE_KEY_LENGTH
      case 'wireguard':
        return 44 // WireGuard密钥为44字符Base64编码
      default:
        return 0
    }
  }

  /**
   * 格式化密钥显示
   * @param key 密钥字符串
   * @param showLength 显示长度
   * @returns 格式化后的密钥
   */
  formatKeyDisplay(key: string, showLength: number = 16): string {
    if (!key || key.length <= showLength) {
      return key
    }
    return `${key.substring(0, showLength)}...`
  }

  /**
   * 检查密钥是否即将过期
   * @param expiresAt 过期时间
   * @param warningDays 警告天数
   * @returns 是否即将过期
   */
  isKeyExpiringSoon(expiresAt?: string, warningDays: number = 30): boolean {
    if (!expiresAt) return false
    
    const expiryDate = new Date(expiresAt)
    const warningDate = new Date()
    warningDate.setDate(warningDate.getDate() + warningDays)
    
    return expiryDate <= warningDate
  }

  /**
   * 获取密钥状态文本
   * @param key 密钥对象
   * @returns 状态文本
   */
  getKeyStatusText(key: NodeKey): string {
    if (!key.is_active) return '非活跃'
    if (this.isKeyExpiringSoon(key.expires_at)) return '即将过期'
    return '正常'
  }

  /**
   * 获取密钥状态颜色
   * @param key 密钥对象
   * @returns 颜色名称
   */
  getKeyStatusColor(key: NodeKey): string {
    if (!key.is_active) return 'grey'
    if (this.isKeyExpiringSoon(key.expires_at)) return 'orange'
    return 'positive'
  }

  /**
   * 生成密钥备份建议
   * @param key 密钥对象
   * @returns 备份建议
   */
  getKeyBackupAdvice(key: NodeKey): string[] {
    const advice: string[] = []
    
    advice.push('请将私钥保存到安全的密码管理器中')
    advice.push('建议定期备份密钥文件')
    
    if (key.key_source === 'server_generated') {
      advice.push('服务端生成的私钥仅显示一次，请立即保存')
    }
    
    if (this.isKeyExpiringSoon(key.expires_at)) {
      advice.push('密钥即将过期，请及时更新')
    }
    
    return advice
  }

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   * @returns 是否成功
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'absolute'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        return successful
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error)
      return false
    }
  }
}

// 创建服务实例
export const nodeKeysService = new NodeKeysService()

// 默认导出
export default nodeKeysService
