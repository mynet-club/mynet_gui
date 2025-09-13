/**
 * 统一缓存管理器
 * 支持内存缓存、LocalStorage、SessionStorage
 */

export interface CacheItem<T = any> {
  value: T
  expiry: number
  timestamp: number
  key: string
}

export interface CacheOptions {
  ttl?: number // 缓存时间(毫秒)
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  maxSize?: number // 最大缓存条目数
}

export class CacheManager {
  private memoryCache = new Map<string, CacheItem>()
  private defaultTTL = 5 * 60 * 1000 // 5分钟
  private maxMemorySize = 100

  /**
   * 设置缓存
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      storage = 'memory',
      maxSize = this.maxMemorySize
    } = options

    const now = Date.now()
    const cacheItem: CacheItem<T> = {
      value,
      expiry: now + ttl,
      timestamp: now,
      key
    }

    switch (storage) {
      case 'memory':
        this.setMemoryCache(key, cacheItem, maxSize)
        break
      case 'localStorage':
        this.setStorageCache(key, cacheItem, localStorage)
        break
      case 'sessionStorage':
        this.setStorageCache(key, cacheItem, sessionStorage)
        break
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): T | null {
    let cacheItem: CacheItem<T> | null = null

    switch (storage) {
      case 'memory':
        cacheItem = this.memoryCache.get(key) as CacheItem<T> || null
        break
      case 'localStorage':
        cacheItem = this.getStorageCache(key, localStorage)
        break
      case 'sessionStorage':
        cacheItem = this.getStorageCache(key, sessionStorage)
        break
    }

    if (!cacheItem) return null

    // 检查是否过期
    if (Date.now() > cacheItem.expiry) {
      this.delete(key, storage)
      return null
    }

    return cacheItem.value
  }

  /**
   * 删除缓存
   */
  delete(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    switch (storage) {
      case 'memory':
        this.memoryCache.delete(key)
        break
      case 'localStorage':
        localStorage.removeItem(`cache_${key}`)
        break
      case 'sessionStorage':
        sessionStorage.removeItem(`cache_${key}`)
        break
    }
  }

  /**
   * 清除所有缓存
   */
  clear(storage?: 'memory' | 'localStorage' | 'sessionStorage'): void {
    if (!storage || storage === 'memory') {
      this.memoryCache.clear()
    }
    
    if (!storage || storage === 'localStorage') {
      this.clearStorageCache(localStorage)
    }
    
    if (!storage || storage === 'sessionStorage') {
      this.clearStorageCache(sessionStorage)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const memoryCount = this.memoryCache.size
    const localStorageCount = this.getStorageCacheCount(localStorage)
    const sessionStorageCount = this.getStorageCacheCount(sessionStorage)

    return {
      memory: {
        count: memoryCount,
        size: this.getMemorySize()
      },
      localStorage: {
        count: localStorageCount
      },
      sessionStorage: {
        count: sessionStorageCount
      }
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    // 清理内存缓存
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.memoryCache.delete(key)
      }
    }

    // 清理localStorage缓存
    this.cleanupStorageCache(localStorage)
    
    // 清理sessionStorage缓存
    this.cleanupStorageCache(sessionStorage)
  }

  // 私有方法
  private setMemoryCache<T>(key: string, item: CacheItem<T>, maxSize: number): void {
    // 如果超过最大大小，删除最老的条目
    if (this.memoryCache.size >= maxSize) {
      const entries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      if (entries.length > 0 && entries[0]) {
        const oldestKey = entries[0][0]
        this.memoryCache.delete(oldestKey)
      }
    }
    
    this.memoryCache.set(key, item)
  }

  private setStorageCache<T>(key: string, item: CacheItem<T>, storage: Storage): void {
    try {
      storage.setItem(`cache_${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('设置存储缓存失败:', error)
    }
  }

  private getStorageCache<T>(key: string, storage: Storage): CacheItem<T> | null {
    try {
      const data = storage.getItem(`cache_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn('获取存储缓存失败:', error)
      return null
    }
  }

  private clearStorageCache(storage: Storage): void {
    const keys = Object.keys(storage).filter(key => key.startsWith('cache_'))
    keys.forEach(key => storage.removeItem(key))
  }

  private getStorageCacheCount(storage: Storage): number {
    return Object.keys(storage).filter(key => key.startsWith('cache_')).length
  }

  private cleanupStorageCache(storage: Storage): void {
    const now = Date.now()
    const keys = Object.keys(storage).filter(key => key.startsWith('cache_'))
    
    keys.forEach(key => {
      try {
        const data = storage.getItem(key)
        if (data) {
          const item = JSON.parse(data)
          if (now > item.expiry) {
            storage.removeItem(key)
          }
        }
      } catch (error) {
        // 删除无效的缓存项
        storage.removeItem(key)
      }
    })
  }

  private getMemorySize(): number {
    let size = 0
    for (const item of this.memoryCache.values()) {
      size += JSON.stringify(item).length
    }
    return size
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager()

// 定期清理过期缓存
setInterval(() => {
  cacheManager.cleanup()
}, 10 * 60 * 1000) // 每10分钟清理一次
