/**
 * 日期时间格式化工具
 * 统一处理时区和格式化问题
 */

/**
 * 格式化日期时间 - 显示完整的日期和时间
 * @param dateStr 日期字符串（ISO 8601格式或其他可解析格式）
 * @param includeSeconds 是否包含秒
 * @returns 格式化后的本地时间字符串，如：2025-12-15 14:30:45
 */
export function formatDateTime(dateStr: string | null | undefined, includeSeconds = true): string {
  if (!dateStr) return 'N/A'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    if (includeSeconds) {
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } else {
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  } catch (error) {
    console.error('日期格式化失败:', error)
    return 'Invalid Date'
  }
}

/**
 * 格式化日期 - 只显示日期部分
 * @param dateStr 日期字符串
 * @returns 格式化后的日期字符串，如：2025-12-15
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('日期格式化失败:', error)
    return 'Invalid Date'
  }
}

/**
 * 格式化时间 - 只显示时间部分
 * @param dateStr 日期字符串
 * @param includeSeconds 是否包含秒
 * @returns 格式化后的时间字符串，如：14:30:45
 */
export function formatTime(dateStr: string | null | undefined, includeSeconds = true): string {
  if (!dateStr) return 'N/A'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Time'
    
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    if (includeSeconds) {
      return `${hours}:${minutes}:${seconds}`
    } else {
      return `${hours}:${minutes}`
    }
  } catch (error) {
    console.error('时间格式化失败:', error)
    return 'Invalid Time'
  }
}

/**
 * 格式化相对时间 - 显示"刚刚"、"5分钟前"等
 * @param dateStr 日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSeconds < 60) {
      return '刚刚'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      // 超过7天显示完整日期
      return formatDateTime(dateStr, false)
    }
  } catch (error) {
    console.error('相对时间格式化失败:', error)
    return 'Invalid Date'
  }
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的大小字符串，如：1.5 MB
 */
export function formatBytes(bytes: number | null | undefined, decimals = 2): string {
  if (bytes === null || bytes === undefined) return 'N/A'
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化网络速度
 * @param bytesPerSecond 每秒字节数
 * @param decimals 小数位数
 * @returns 格式化后的速度字符串，如：1.5 MB/s
 */
export function formatSpeed(bytesPerSecond: number | null | undefined, decimals = 2): string {
  if (bytesPerSecond === null || bytesPerSecond === undefined) return 'N/A'
  return formatBytes(bytesPerSecond, decimals) + '/s'
}

/**
 * 格式化延迟
 * @param latency 延迟（毫秒）
 * @returns 格式化后的延迟字符串，如：25.5ms
 */
export function formatLatency(latency: number | null | undefined): string {
  if (latency === null || latency === undefined) return 'N/A'
  return `${latency.toFixed(1)}ms`
}

/**
 * 检查日期是否为今天
 * @param dateStr 日期字符串
 */
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

/**
 * 检查日期是否为昨天
 * @param dateStr 日期字符串
 */
export function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear()
}

/**
 * 智能格式化日期时间
 * - 今天：显示"今天 14:30"
 * - 昨天：显示"昨天 14:30"
 * - 本年：显示"12-15 14:30"
 * - 其他：显示"2024-12-15 14:30"
 * @param dateStr 日期字符串
 */
export function formatSmartDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    const timeStr = formatTime(dateStr, false)
    
    if (isToday(dateStr)) {
      return `今天 ${timeStr}`
    } else if (isYesterday(dateStr)) {
      return `昨天 ${timeStr}`
    } else if (date.getFullYear() === new Date().getFullYear()) {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day} ${timeStr}`
    } else {
      return formatDateTime(dateStr, false)
    }
  } catch (error) {
    console.error('智能日期格式化失败:', error)
    return 'Invalid Date'
  }
}
