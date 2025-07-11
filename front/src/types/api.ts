/**
 * API响应相关类型定义
 * 基于OpenAPI文档 v1.0.0 统一响应格式
 */

// 基础API响应接口 (基于OpenAPI)
export interface BaseApiResponse {
  success: boolean                    // 请求是否成功
  code: number                        // HTTP状态码
  message: string                     // 响应消息
  request_id: string                  // 请求唯一标识符，用于追踪和调试
  timestamp: string                   // 响应时间戳
}

// 成功响应接口
export interface ApiResponse<T = any> extends BaseApiResponse {
  data: T                             // 响应数据
  success: true                       // 成功响应
}

// 错误响应接口
export interface ApiErrorResponse extends BaseApiResponse {
  success: false                      // 失败响应
  error_code?: string                 // 业务错误代码
  errors?: {
    [field: string]: string[]         // 字段验证错误
  }
  details?: any                       // 错误详情
}

// 分页元数据
export interface PaginationMeta {
  current_page: number                // 当前页码
  per_page: number                    // 每页数量
  total: number                       // 总记录数
  last_page: number                   // 最后一页
  from?: number                       // 起始记录号
  to?: number                         // 结束记录号
  has_more?: boolean                  // 是否有更多数据
}

// 分页响应接口
export interface PaginatedApiResponse<T> extends BaseApiResponse {
  data: T[]                           // 数据列表
  meta: PaginationMeta                // 分页元数据
  success: true                       // 成功响应
}

// 节点列表特殊响应格式 (基于实际API响应)
export interface NodesListApiResponse extends BaseApiResponse {
  data: {
    nodes: {
      data: any[]                     // 节点数据列表
      total: number                   // 总记录数
      per_page: number                // 每页数量
      current_page: number            // 当前页码
      last_page: number               // 最后一页
      from: number                    // 起始记录号
      to: number                      // 结束记录号
      zone_id: number                 // 区域ID
    }
    meta: {
      total: number                   // 总记录数
      zone_id: number                 // 区域ID
      user_id: number                 // 用户ID
      filters_applied: any            // 应用的过滤器
    }
  }
  success: true                       // 成功响应
}

// 请求参数基础接口
export interface BaseRequestParams {
  page?: number                       // 页码
  per_page?: number                   // 每页数量
  sort?: string                       // 排序字段
  order?: 'asc' | 'desc'             // 排序方向
  search?: string                     // 搜索关键词
}

// API请求配置
export interface ApiRequestConfig {
  timeout?: number                    // 超时时间(毫秒)
  retry?: number                      // 重试次数
  headers?: Record<string, string>    // 请求头
  params?: Record<string, any>        // 查询参数
  data?: any                          // 请求体数据
  responseType?: 'json' | 'blob' | 'text' // 响应类型
}

// API错误类型
export type ApiErrorType = 
  | 'network_error'                   // 网络错误
  | 'timeout_error'                   // 超时错误
  | 'server_error'                    // 服务器错误
  | 'validation_error'                // 验证错误
  | 'authentication_error'            // 认证错误
  | 'authorization_error'             // 授权错误
  | 'not_found_error'                 // 资源未找到
  | 'conflict_error'                  // 冲突错误
  | 'rate_limit_error'                // 限流错误
  | 'unknown_error'                   // 未知错误

// 扩展的API错误接口
export interface ApiError extends Error {
  type: ApiErrorType                  // 错误类型
  code: number                        // HTTP状态码
  response?: ApiErrorResponse         // 服务器错误响应
  request_id?: string                 // 请求ID
  timestamp?: string                  // 错误时间
  details?: any                       // 错误详情
}

// 上传进度回调
export interface UploadProgressCallback {
  (progress: {
    loaded: number                    // 已上传字节数
    total: number                     // 总字节数
    percentage: number                // 上传百分比
  }): void
}

// 文件上传配置
export interface FileUploadConfig extends ApiRequestConfig {
  onProgress?: UploadProgressCallback // 上传进度回调
  maxSize?: number                    // 最大文件大小
  allowedTypes?: string[]             // 允许的文件类型
}

// 批量操作请求
export interface BatchOperationRequest<T = any> {
  items: T[]                          // 操作项目
  operation: string                   // 操作类型
  options?: {
    stop_on_error?: boolean           // 遇到错误时停止
    parallel?: boolean                // 并行执行
    batch_size?: number               // 批处理大小
  }
}

// 批量操作响应
export interface BatchOperationResponse<T = any> {
  success_count: number               // 成功数量
  error_count: number                 // 失败数量
  total_count: number                 // 总数量
  results: Array<{
    item: T                           // 操作项目
    success: boolean                  // 是否成功
    error?: string                    // 错误信息
    data?: any                        // 返回数据
  }>
}

// WebSocket消息接口
export interface WebSocketMessage {
  type: string                        // 消息类型
  data: any                           // 消息数据
  timestamp: string                   // 时间戳
  channel?: string                    // 频道
  event?: string                      // 事件名
}

// 实时数据订阅
export interface RealtimeSubscription {
  channel: string                     // 订阅频道
  events: string[]                    // 订阅事件
  callback: (message: WebSocketMessage) => void // 回调函数
  error_handler?: (error: Error) => void // 错误处理
}

// 缓存配置
export interface CacheConfig {
  enabled: boolean                    // 是否启用缓存
  ttl: number                         // 缓存时间(秒)
  key_prefix?: string                 // 缓存键前缀
  strategy?: 'memory' | 'localStorage' | 'sessionStorage' // 缓存策略
}

// API服务配置
export interface ApiServiceConfig {
  baseURL: string                     // 基础URL
  timeout: number                     // 默认超时时间
  retry: number                       // 默认重试次数
  headers: Record<string, string>     // 默认请求头
  cache?: CacheConfig                 // 缓存配置
  interceptors?: {
    request?: Array<(config: ApiRequestConfig) => ApiRequestConfig>
    response?: Array<(response: any) => any>
    error?: Array<(error: ApiError) => Promise<any>>
  }
}

// 常用HTTP状态码
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// 常用错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络状态',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  SERVER_ERROR: '服务器错误，请联系管理员',
  VALIDATION_ERROR: '数据验证失败，请检查输入',
  AUTHENTICATION_ERROR: '认证失败，请重新登录',
  AUTHORIZATION_ERROR: '权限不足，无法执行此操作',
  NOT_FOUND_ERROR: '请求的资源不存在',
  CONFLICT_ERROR: '操作冲突，请刷新页面后重试',
  RATE_LIMIT_ERROR: '请求过于频繁，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试'
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  CREATED: '创建成功',
  UPDATED: '更新成功',
  DELETED: '删除成功',
  UPLOADED: '上传成功',
  DOWNLOADED: '下载成功',
  SAVED: '保存成功',
  SENT: '发送成功',
  IMPORTED: '导入成功',
  EXPORTED: '导出成功'
} as const

// 类型守护函数
export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'type' in error && 'code' in error
}

export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && typeof response === 'object' && 'success' in response && response.success === true
}

export function isApiErrorResponse(response: any): response is ApiErrorResponse {
  return response && typeof response === 'object' && 'success' in response && response.success === false
}

export function isPaginatedResponse<T>(response: any): response is PaginatedApiResponse<T> {
  return isApiResponse(response) && 'meta' in response && Array.isArray(response.data)
}
