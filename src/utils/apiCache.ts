import { cacheManager, type CacheOptions } from './cacheManager'

/**
 * API缓存装饰器配置
 */
interface ApiCacheConfig extends CacheOptions {
  key?: string | ((args: any[]) => string) // 缓存键生成函数
  invalidateOnMutation?: boolean // 变更操作时是否清除缓存
  tags?: string[] // 缓存标签，用于批量清除
}

/**
 * API缓存装饰器
 * 用于自动缓存API响应
 */
export function apiCache(config: ApiCacheConfig = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const {
        key,
        ttl = 5 * 60 * 1000, // 默认5分钟
        storage = 'memory',
        tags = [],
        invalidateOnMutation = false
      } = config

      // 生成缓存键
      let cacheKey: string
      if (typeof key === 'function') {
        cacheKey = key(args)
      } else if (typeof key === 'string') {
        cacheKey = key
      } else {
        // 默认使用方法名和参数生成缓存键
        const argsKey = JSON.stringify(args)
        cacheKey = `${target.constructor.name}_${propertyKey}_${argsKey}`
      }

      // 如果是变更操作，先清除相关缓存
      if (invalidateOnMutation) {
        tags.forEach(tag => {
          cacheManager.delete(`tag_${tag}`, storage)
        })
      }

      // 尝试从缓存获取
      const cached = cacheManager.get(cacheKey, storage)
      if (cached !== null) {
        console.log(`📦 [Cache] Hit: ${cacheKey}`)
        return cached
      }

      // 执行原方法
      console.log(`🔄 [Cache] Miss: ${cacheKey}`)
      const result = await originalMethod.apply(this, args)

      // 缓存结果
      cacheManager.set(cacheKey, result, { ttl, storage })

      // 设置标签缓存
      tags.forEach(tag => {
        const taggedKeys = cacheManager.get(`tag_${tag}`, storage) as string[] || []
        if (!taggedKeys.includes(cacheKey)) {
          taggedKeys.push(cacheKey)
          cacheManager.set(`tag_${tag}`, taggedKeys, { ttl: ttl * 2, storage })
        }
      })

      return result
    }

    return descriptor
  }
}

/**
 * 清除标签相关的所有缓存
 */
export function invalidateByTag(tag: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory') {
  const taggedKeys = cacheManager.get(`tag_${tag}`, storage)
  if (taggedKeys && Array.isArray(taggedKeys)) {
    taggedKeys.forEach((key: string) => {
      cacheManager.delete(key, storage)
    })
    cacheManager.delete(`tag_${tag}`, storage)
  }
}

/**
 * 生成标准API缓存键
 */
export function generateApiCacheKey(endpoint: string, params?: any): string {
  const paramString = params ? JSON.stringify(params) : ''
  return `api_${endpoint}_${paramString}`.replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * API响应缓存包装器
 * 用于包装API调用函数
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: ApiCacheConfig = {}
): T {
  const {
    ttl = 5 * 60 * 1000,
    storage = 'memory',
    key,
    tags = []
  } = config

  return (async (...args: any[]) => {
    // 生成缓存键
    let cacheKey: string
    if (typeof key === 'function') {
      cacheKey = key(args)
    } else if (typeof key === 'string') {
      cacheKey = key
    } else {
      cacheKey = `fn_${fn.name}_${JSON.stringify(args)}`
    }

    // 尝试从缓存获取
    const cached = cacheManager.get(cacheKey, storage)
    if (cached !== null) {
      return cached
    }

    // 执行函数
    const result = await fn(...args)

    // 缓存结果
    cacheManager.set(cacheKey, result, { ttl, storage })

    return result
  }) as T
}
