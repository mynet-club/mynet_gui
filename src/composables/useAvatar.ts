import { ref, computed } from 'vue'
import debug from '../utils/debug'
import { apiService } from '../services/api'

// 头像缓存
const avatarCache = new Map<string, string>()

// 默认头像
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyMCIgeT0iMjAiPgo8cGF0aCBkPSJNMTIgMTJDMTQuNDg1MyAxMiAxNi41IDkuOTg1MjggMTYuNSA3LjVDMTYuNSA1LjAxNDcyIDE0LjQ4NTMgMyAxMiAzQzkuNTE0NzIgMyA3LjUgNS4wMTQ3MiA3LjUgNy41QzcuNSA5Ljk4NTI4IDkuNTE0NzIgMTIgMTIgMTJaIiBmaWxsPSIjOTCA5Q0E5Ii8+CjxwYXRoIGQ9Ik0yMSAxOUMyMSAxNi4zNCAyMSAxNS4wMSAyMC4yOTMgMTQuMjkzQzE5LjU3NiAxMy41NzYgMTguMjQgMTMuNTc2IDE1LjU2NSAxMy41NzZIOC40MzVDNS43NiAxMy41NzYgNC40MjQgMTMuNTc2IDMuNzA3IDE0LjI5M0MzIDE1LjAxIDMgMTYuMzQgMyAxOUMzIDIwLjEwNDYgMy44OTU0MyAyMSA1IDIxSDE5QzIwLjEwNDYgMjEgMjEgMjAuMTA0NiAyMSAxOVoiIGZpbGw9IiM5Q0E5Q0EiLz4KPC9zdmc+Cjwvc3ZnPgo='

export function useAvatar() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取用户头像
   * @param userId 用户ID，如果不提供则获取当前用户头像
   * @param useCache 是否使用缓存，默认true
   */
  const getAvatarUrl = async (userId?: string | number, useCache = true): Promise<string> => {
    const cacheKey = userId ? String(userId) : 'current'
    
    // 检查缓存
    if (useCache && avatarCache.has(cacheKey)) {
      const cachedUrl = avatarCache.get(cacheKey)!
      debug.log('🔧 [Avatar] Using cached avatar for:', cacheKey, cachedUrl.substring(0, 50) + '...')
      return cachedUrl
    }

    loading.value = true
    error.value = null

    try {
      debug.log('🔧 [Avatar] Loading avatar for:', cacheKey)
      const response = await apiService.getAvatar(userId ? String(userId) : undefined)
      
      if (response.data && response.data.size > 0) {
        const blob = response.data
        const url = URL.createObjectURL(blob)
        
        // 缓存URL
        avatarCache.set(cacheKey, url)
        debug.log('🔧 [Avatar] Avatar loaded and cached for:', cacheKey, url.substring(0, 50) + '...')
        
        return url
      } else {
        debug.warn('🔧 [Avatar] Empty avatar response for:', cacheKey)
        return defaultAvatar
      }
    } catch (err: any) {
      // 404错误是正常的，用户可能没有设置头像，不记录日志
      if (err?.response?.status === 404) {
        // 静默处理404，返回默认头像
      } else {
        // 只有非404错误才记录日志
        debug.error('🔧 [Avatar] Failed to load avatar for:', cacheKey, err)
        error.value = err.message || 'Failed to load avatar'
      }
      return defaultAvatar
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除头像缓存
   * @param userId 用户ID，如果不提供则清除当前用户缓存
   */
  const clearAvatarCache = (userId?: string | number) => {
    const cacheKey = userId ? String(userId) : 'current'
    if (avatarCache.has(cacheKey)) {
      const url = avatarCache.get(cacheKey)!
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
      avatarCache.delete(cacheKey)
      debug.log('🔧 [Avatar] Cleared cache for:', cacheKey)
    }
  }

  /**
   * 清除所有头像缓存
   */
  const clearAllAvatarCache = () => {
    for (const [key, url] of avatarCache.entries()) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    }
    avatarCache.clear()
    debug.log('🔧 [Avatar] Cleared all avatar cache')
  }

  /**
   * 刷新头像（清除缓存并重新加载）
   * @param userId 用户ID
   */
  const refreshAvatar = async (userId?: string | number): Promise<string> => {
    clearAvatarCache(userId)
    return getAvatarUrl(userId, false)
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    defaultAvatar,
    getAvatarUrl,
    clearAvatarCache,
    clearAllAvatarCache,
    refreshAvatar
  }
}

/**
 * 创建响应式头像URL
 * @param userId 用户ID
 */
export function useReactiveAvatar(userId?: string | number) {
  const { getAvatarUrl, refreshAvatar, loading, error } = useAvatar()
  const avatarUrl = ref<string>(defaultAvatar)

  const loadAvatar = async () => {
    try {
      avatarUrl.value = await getAvatarUrl(userId)
    } catch (err) {
      debug.error('Failed to load reactive avatar:', err)
      avatarUrl.value = defaultAvatar
    }
  }

  const refresh = async () => {
    try {
      avatarUrl.value = await refreshAvatar(userId)
    } catch (err) {
      debug.error('Failed to refresh reactive avatar:', err)
      avatarUrl.value = defaultAvatar
    }
  }

  // 自动加载
  loadAvatar()

  return {
    avatarUrl: computed(() => avatarUrl.value),
    loading,
    error,
    refresh,
    loadAvatar
  }
}
