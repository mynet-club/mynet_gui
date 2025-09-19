/**
 * 密钥生成和验证工具函数
 * 支持本地密钥生成和验证
 */

import type { KeyType, LocalKeyPair, KeyValidationResult } from '../types/nodeKeys'
import debug from "src/utils/debug"
import { ED25519_KEY_SPEC } from '../types/nodeKeys'

/**
 * 生成随机ed25519密钥对
 * 注意：这是一个简化的实现，实际应用中建议使用专业的密钥库
 */
export const generateEd25519KeyPair = (): LocalKeyPair => {
  // 生成随机私钥（64字节，128个十六进制字符）
  const privateKey = generateRandomHex(ED25519_KEY_SPEC.PRIVATE_KEY_LENGTH)
  
  // 从私钥生成公钥（实际应用中需要使用ed25519算法）
  // 这里使用简化的哈希方法，实际应用中应该使用正确的ed25519算法
  const publicKey = generatePublicKeyFromPrivate(privateKey)
  
  // 生成指纹
  const fingerprint = generateFingerprint(publicKey)
  
  return {
    public_key: publicKey,
    private_key: privateKey,
    fingerprint,
    key_type: 'ed25519'
  }
}

/**
 * 验证密钥格式
 */
export const validateKeyFormat = (publicKey: string, keyType: KeyType): KeyValidationResult => {
  const result: KeyValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    key_length: publicKey.length,
    expected_length: 0
  }

  if (keyType === 'ed25519') {
    result.expected_length = ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH
    
    // 检查长度
    if (publicKey.length !== ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH) {
      result.errors.push(`密钥长度错误：期望 ${ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH} 个字符，实际 ${publicKey.length} 个字符`)
    }
    
    // 检查格式
    if (!ED25519_KEY_SPEC.HEX_PATTERN.test(publicKey)) {
      result.errors.push('密钥格式错误：必须是十六进制字符')
    }
    
    // 检查是否全为零
    if (publicKey === '0'.repeat(ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH)) {
      result.errors.push('密钥无效：不能全为零')
    }
  } else if (keyType === 'gnb') {
    // GNB密钥验证（与ed25519类似）
    result.expected_length = 64
    
    if (publicKey.length !== 64) {
      result.errors.push(`密钥长度错误：期望 64 个字符，实际 ${publicKey.length} 个字符`)
    }
    
    if (!ED25519_KEY_SPEC.HEX_PATTERN.test(publicKey)) {
      result.errors.push('密钥格式错误：必须是十六进制字符')
    }
  } else {
    result.errors.push(`不支持的密钥类型：${keyType}`)
  }

  result.valid = result.errors.length === 0
  return result
}

/**
 * 验证密钥对是否匹配
 */
export const validateKeyPairMatch = (publicKey: string, privateKey: string, keyType: KeyType): KeyValidationResult => {
  const result: KeyValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    key_length: publicKey.length,
    expected_length: keyType === 'ed25519' ? ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH : 64
  }

  // 先验证单独的密钥格式
  const publicKeyValidation = validateKeyFormat(publicKey, keyType)
  const privateKeyValidation = validateKeyFormat(privateKey, keyType)

  if (!publicKeyValidation.valid) {
    result.errors.push(...publicKeyValidation.errors.map(e => `公钥：${e}`))
  }

  if (!privateKeyValidation.valid) {
    result.errors.push(...privateKeyValidation.errors.map(e => `私钥：${e}`))
  }

  // 如果格式都正确，验证是否匹配
  if (publicKeyValidation.valid && privateKeyValidation.valid) {
    // 简化的匹配验证（实际应用中需要使用正确的密钥算法）
    const derivedPublicKey = generatePublicKeyFromPrivate(privateKey)
    if (derivedPublicKey !== publicKey) {
      result.errors.push('密钥对不匹配：公钥和私钥不对应')
    }
  }

  result.valid = result.errors.length === 0
  return result
}

/**
 * 生成密钥指纹
 */
export const generateFingerprint = (publicKey: string): string => {
  // 简化的指纹生成算法
  // 实际应用中应该使用SHA256或其他标准哈希算法
  const hash = hashString(publicKey)
  return hash.substring(0, ED25519_KEY_SPEC.FINGERPRINT_LENGTH)
}

/**
 * 检查密钥强度
 */
export const checkKeyStrength = (publicKey: string, keyType: KeyType): { 
  strength: 'weak' | 'medium' | 'strong'
  score: number
  issues: string[]
} => {
  const issues: string[] = []
  let score = 0

  // 检查密钥长度
  if (keyType === 'ed25519' && publicKey.length === ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH) {
    score += 30
  } else if (keyType === 'gnb' && publicKey.length === 64) {
    score += 30
  }

  // 检查字符分布
  const charCount = new Map<string, number>()
  for (const char of publicKey) {
    charCount.set(char, (charCount.get(char) || 0) + 1)
  }

  // 检查是否有重复字符过多
  const maxRepeats = Math.max(...charCount.values())
  if (maxRepeats > publicKey.length * 0.5) {
    issues.push('密钥中有过多重复字符')
  } else if (maxRepeats > publicKey.length * 0.3) {
    issues.push('密钥中重复字符较多')
    score += 10
  } else {
    score += 30
  }

  // 检查熵
  const entropy = calculateEntropy(publicKey)
  if (entropy < 3.0) {
    issues.push('密钥熵值过低')
  } else if (entropy < 3.5) {
    issues.push('密钥熵值较低')
    score += 10
  } else {
    score += 40
  }

  // 确定强度
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 80) {
    strength = 'strong'
  } else if (score >= 50) {
    strength = 'medium'
  }

  return { strength, score, issues }
}

/**
 * 格式化密钥显示
 */
export const formatKeyForDisplay = (key: string, chunkSize: number = 8): string => {
  const chunks = []
  for (let i = 0; i < key.length; i += chunkSize) {
    chunks.push(key.substring(i, i + chunkSize))
  }
  return chunks.join(' ')
}

/**
 * 复制密钥到剪贴板
 */
export const copyKeyToClipboard = async (key: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(key)
    return true
  } catch (err) {
    debug.error('复制到剪贴板失败:', err)
    return false
  }
}

/**
 * 从文件读取密钥
 */
export const readKeyFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // 清理密钥内容（去除空格、换行等）
        const cleanKey = content.replace(/\s+/g, '')
        resolve(cleanKey)
      } catch (err) {
        reject(new Error('读取文件失败'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

/**
 * 下载密钥到文件
 */
export const downloadKeyToFile = (key: string, filename: string, keyType: 'public' | 'private'): void => {
  const content = `# ${keyType === 'public' ? 'Public' : 'Private'} Key\n# Generated at: ${new Date().toISOString()}\n\n${key}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// --- 辅助函数 ---

/**
 * 生成随机十六进制字符串
 */
function generateRandomHex(length: number): string {
  const chars = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/**
 * 从私钥生成公钥（简化版本）
 * 实际应用中应该使用正确的ed25519算法
 */
function generatePublicKeyFromPrivate(privateKey: string): string {
  // 这是一个简化的实现，实际应用中应该使用正确的ed25519算法
  const hash = hashString(privateKey)
  return hash.substring(0, ED25519_KEY_SPEC.PUBLIC_KEY_LENGTH)
}

/**
 * 简单的哈希函数
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

/**
 * 计算字符串熵值
 */
function calculateEntropy(str: string): number {
  const charCount = new Map<string, number>()
  for (const char of str) {
    charCount.set(char, (charCount.get(char) || 0) + 1)
  }
  
  let entropy = 0
  for (const count of charCount.values()) {
    const probability = count / str.length
    entropy -= probability * Math.log2(probability)
  }
  
  return entropy
}

/**
 * 密钥安全提示
 */
export const getKeySecurityTips = (keyType: KeyType): string[] => {
  const commonTips = [
    '请将私钥保存在安全的地方，不要与他人分享',
    '建议使用密码管理器或硬件密钥存储设备',
    '定期备份密钥，但要确保备份的安全性',
    '不要在不安全的网络环境中传输私钥'
  ]

  const typeSpecificTips = {
    ed25519: [
      'ed25519密钥具有较高的安全性和性能',
      '密钥长度为64字节（128个十六进制字符）',
      '请验证密钥的完整性，避免输入错误'
    ],
    gnb: [
      'GNB密钥用于虚拟网络连接',
      '请确保密钥符合GNB网络的要求',
      '密钥格式应为64个十六进制字符'
    ],
    wireguard: [
      'WireGuard密钥用于VPN连接',
      '请使用WireGuard官方工具生成密钥',
      '密钥采用Base64编码格式'
    ]
  }

  return [...commonTips, ...typeSpecificTips[keyType]]
}
