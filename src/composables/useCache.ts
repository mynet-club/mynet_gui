import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cacheManager } from '../utils/cacheManager'

/**
 * 缓存状态管理 Composable
 */
export function useCacheStatus() {
  const stats = ref(cacheManager.getStats())
  const isEnabled = ref(true)
  
  // 定期更新统计信息
  let timer: NodeJS.Timeout | null = null
  
  const updateStats = () => {
    stats.value = cacheManager.getStats()
  }
  
  const toggleCache = () => {
    isEnabled.value = !isEnabled.value
    if (!isEnabled.value) {
      cacheManager.clear()
    }
  }
  
  const clearAllCache = () => {
    cacheManager.clear()
    updateStats()
  }
  
  const clearMemoryCache = () => {
    cacheManager.clear('memory')
    updateStats()
  }
  
  const clearStorageCache = () => {
    cacheManager.clear('localStorage')
    cacheManager.clear('sessionStorage')
    updateStats()
  }
  
  // 格式化缓存大小
  const formattedMemorySize = computed(() => {
    const size = stats.value.memory.size
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  })
  
  onMounted(() => {
    timer = setInterval(updateStats, 5000) // 每5秒更新一次
  })
  
  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })
  
  return {
    stats,
    isEnabled,
    formattedMemorySize,
    updateStats,
    toggleCache,
    clearAllCache,
    clearMemoryCache,
    clearStorageCache
  }
}

/**
 * API 缓存钩子
 * 用于在组件中管理特定 API 的缓存
 */
export function useApiCache<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: {
    key: string
    ttl?: number
    storage?: 'memory' | 'localStorage' | 'sessionStorage'
    dependencies?: any[]
  }
) {
  const { key, ttl = 5 * 60 * 1000, storage = 'memory', dependencies = [] } = options
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)
  
  const execute = async (...args: any[]): Promise<T | null> => {
    // 先尝试从缓存获取
    const cached = cacheManager.get<T>(key, storage)
    if (cached !== null) {
      data.value = cached
      return cached
    }
    
    // 缓存未命中，执行API调用
    loading.value = true
    error.value = null
    
    try {
      const result = await apiCall(...args)
      data.value = result
      
      // 缓存结果
      cacheManager.set(key, result, { ttl, storage })
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '请求失败'
      return null
    } finally {
      loading.value = false
    }
  }
  
  const refresh = async (...args: any[]): Promise<T | null> => {
    // 强制刷新，先清除缓存
    cacheManager.delete(key, storage)
    return execute(...args)
  }
  
  const clear = () => {
    cacheManager.delete(key, storage)
    data.value = null
  }
  
  // 监听依赖变化，自动清除缓存
  if (dependencies.length > 0) {
    // 这里可以使用 watchEffect 或 watch 来监听依赖变化
    // 为了简化，暂时不实现自动依赖监听
  }
  
  return {
    data,
    loading,
    error,
    execute,
    refresh,
    clear
  }
}

/**
 * 数据预取钩子
 * 用于预取用户可能需要的数据
 */
export function useDataPrefetch() {
  const prefetchQueue = ref<Array<{
    key: string
    apiCall: () => Promise<any>
    priority: number
    ttl?: number
  }>>([])
  
  const addToPrefetchQueue = (
    key: string,
    apiCall: () => Promise<any>,
    priority = 1,
    ttl = 5 * 60 * 1000
  ) => {
    prefetchQueue.value.push({ key, apiCall, priority, ttl })
    // 按优先级排序
    prefetchQueue.value.sort((a, b) => b.priority - a.priority)
  }
  
  const processPrefetchQueue = async () => {
    while (prefetchQueue.value.length > 0) {
      const item = prefetchQueue.value.shift()
      if (!item) continue
      
      // 检查是否已经有缓存
      const cached = cacheManager.get(item.key)
      if (cached !== null) continue
      
      try {
        const result = await item.apiCall()
        cacheManager.set(item.key, result, { 
          ttl: item.ttl || 5 * 60 * 1000,
          storage: 'memory'
        })
      } catch (error) {
        console.warn(`预取数据失败: ${item.key}`, error)
      }
      
      // 添加延迟避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return {
    prefetchQueue,
    addToPrefetchQueue,
    processPrefetchQueue
  }
}
