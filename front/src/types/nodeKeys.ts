/**
 * 节点密钥管理相关类型定义
 * 基于OpenAPI文档 v1.0.0 和 ed25519 密钥规范
 */

// 支持的密钥类型
export type KeyType = 'ed25519' | 'wireguard' | 'gnb'

// 密钥来源
export type KeySource = 'server_generated' | 'user_uploaded'

// 节点密钥接口 (基于OpenAPI)
export interface NodeKey {
  // 基础信息 (来自OpenAPI)
  id: string                          // 密钥ID
  node_id: string                     // 节点ID
  key_type: KeyType                   // 密钥类型
  public_key: string                  // 公钥 (ed25519: 64字符)
  private_key?: string                // 私钥 (ed25519: 128字符, 仅生成时显示一次)
  created_at: string                  // 创建时间
  expires_at?: string                 // 过期时间
  
  // 扩展字段 (前端补充)
  key_source?: KeySource              // 密钥来源
  fingerprint?: string                // 密钥指纹
  is_active?: boolean                 // 是否活跃
  description?: string                // 密钥描述
}

// API返回的密钥信息结构
export interface NodeKeyApiResponse {
  node_id: number                     // 节点ID
  has_key: boolean                    // 是否有密钥
  public_key: string | null           // 公钥
  key_type: KeyType | null            // 密钥类型
  created_at: string | null           // 创建时间
  fingerprint?: string                // 密钥指纹
}

// 密钥生成API响应结构
export interface KeyGenerationApiResponse {
  node_id: number                     // 节点ID
  public_key: string                  // 生成的公钥字符串
  private_key: string                 // 生成的私钥字符串
  key_type: KeyType                   // 密钥类型
  generated_at: string                // 生成时间
}

// 密钥生成请求接口 (基于OpenAPI)
export interface KeyGenerationRequest {
  key_type?: KeyType                  // 密钥类型，默认为 ed25519
}

// 密钥生成结果接口 (服务端生成)
export interface KeyGenerationResult {
  public_key: string                  // 公钥 (64字符)
  private_key: string                 // 私钥 (128字符, 仅显示一次)
  fingerprint: string                 // 密钥指纹
  key_type: KeyType                   // 密钥类型
  warning_message: string             // 安全警告信息
}

// 公钥上传请求接口 (扩展API)
export interface KeyUploadRequest {
  public_key: string                  // 用户上传的公钥
  key_type: KeyType                   // 密钥类型
  description?: string                // 密钥描述
}

// 本地密钥生成结果
export interface LocalKeyPair {
  public_key: string                  // 公钥 (64字符)
  private_key: string                 // 私钥 (128字符)
  fingerprint: string                 // 密钥指纹
  key_type: KeyType                   // 密钥类型
}

// 私钥显示状态
export interface PrivateKeyDisplayState {
  private_key: string                 // 私钥内容
  shown_at: string                    // 显示时间
  user_confirmed_save: boolean        // 用户是否确认已保存
  can_close: boolean                  // 是否可以关闭对话框
}

// 密钥验证结果
export interface KeyValidationResult {
  valid: boolean                      // 是否有效
  errors: string[]                    // 错误信息
  warnings: string[]                  // 警告信息
  key_length: number                  // 密钥长度
  expected_length: number             // 期望长度
}

// 密钥操作结果
export interface KeyOperationResult {
  success: boolean                    // 操作是否成功
  message: string                     // 操作消息
  key?: NodeKey                       // 密钥信息
  private_key?: string                // 私钥 (仅生成时返回)
}

// 密钥列表查询参数
export interface KeysListParams {
  node_id: string                     // 节点ID
  key_type?: KeyType                  // 密钥类型过滤
  active_only?: boolean               // 仅活跃密钥
}

// 密钥安全配置
export interface KeySecurityConfig {
  min_key_length: number              // 最小密钥长度
  max_key_length: number              // 最大密钥长度
  allowed_key_types: KeyType[]        // 允许的密钥类型
  require_user_confirmation: boolean   // 是否需要用户确认
  private_key_display_timeout: number // 私钥显示超时时间(秒)
}

// ed25519 密钥规范常量
export const ED25519_KEY_SPEC = {
  PUBLIC_KEY_LENGTH: 64,              // 公钥长度
  PRIVATE_KEY_LENGTH: 128,            // 私钥长度
  FINGERPRINT_LENGTH: 16,             // 指纹长度
  HEX_PATTERN: /^[0-9a-fA-F]+$/       // 十六进制正则
} as const

// 密钥类型配置
export const KEY_TYPE_CONFIG: Record<KeyType, {
  name: string
  description: string
  public_key_length: number
  private_key_length: number
  supported: boolean
}> = {
  ed25519: {
    name: 'ED25519',
    description: 'ed25519 椭圆曲线签名算法',
    public_key_length: 64,
    private_key_length: 128,
    supported: true
  },
  wireguard: {
    name: 'WireGuard',
    description: 'WireGuard VPN 密钥',
    public_key_length: 44,
    private_key_length: 44,
    supported: false // 暂不支持
  },
  gnb: {
    name: 'GNB',
    description: 'GNB 虚拟网络密钥',
    public_key_length: 64,
    private_key_length: 128,
    supported: true
  }
} as const

// 密钥安全提示信息
export const KEY_SECURITY_MESSAGES = {
  PRIVATE_KEY_WARNING: '私钥仅显示一次，请立即保存到安全位置！',
  LOCAL_GENERATION_WARNING: '浏览器生成的密钥安全性相对较低，推荐使用专业工具生成',
  UPLOAD_SECURITY_TIP: '请确保上传的是公钥，私钥应由您自己保管',
  SAVE_CONFIRMATION_REQUIRED: '您必须确认已保存私钥才能继续操作'
} as const
