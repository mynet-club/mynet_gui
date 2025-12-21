# 缓存系统技术实现示例

## 🛠️ 核心基础设施增强

### 1. 增强的缓存管理器

```typescript
// src/utils/enhancedCacheManager.ts
import { cacheManager } from './cacheManager'
import debug from './debug'

export interface LoadFetchOptions {
  cache?: boolean          // 是否使用缓存
  force?: boolean         // 是否强制刷新
  ttl?: number           // 缓存时间
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  tags?: string[]        // 缓存标签
}

export class EnhancedCacheManager extends CacheManager {
  private websocketHandlers = new Map<string, Function>()
  
  /**
   * 通用的 load/fetch 包装器
   */
  createLoadFetch<T>(
    apiCall: (...args: any[]) => Promise<T>,
    defaultOptions: LoadFetchOptions = {}
  ) {
    return {
      // load: 优先使用缓存
      load: async (...args: any[]): Promise<T> => {
        const options = { cache: true, ...defaultOptions }
        return this.executeWithCache(apiCall, args, options)
      },
      
      // fetch: 强制从API获取
      fetch: async (...args: any[]): Promise<T> => {
        const options = { cache: false, force: true, ...defaultOptions }
        return this.executeWithCache(apiCall, args, options)
      },
      
      // refresh: 智能刷新
      refresh: async (force = false, ...args: any[]): Promise<T> => {
        const options = { 
          cache: !force, 
          force, 
          ...defaultOptions 
        }
        return this.executeWithCache(apiCall, args, options)
      }
    }
  }
  
  private async executeWithCache<T>(
    apiCall: Function,
    args: any[],
    options: LoadFetchOptions
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(apiCall.name, args)
    
    // 如果强制刷新，先清除缓存
    if (options.force) {
      this.delete(cacheKey, options.storage)
    }
    
    // 尝试从缓存读取
    if (options.cache && !options.force) {
      const cached = this.get<T>(cacheKey, options.storage)
      if (cached !== null) {
        debug.log(`🔧 [Cache] Hit for ${cacheKey}`)
        return cached
      }
    }
    
    // 缓存未命中，调用API
    debug.log(`🔧 [Cache] Miss for ${cacheKey}, fetching...`)
    const result = await apiCall(...args)
    
    // 存储到缓存
    if (options.cache) {
      this.set(cacheKey, result, {
        ttl: options.ttl,
        storage: options.storage
      })
      
      // 添加标签
      if (options.tags) {
        this.addTags(cacheKey, options.tags)
      }
    }
    
    return result
  }
  
  private generateCacheKey(functionName: string, args: any[]): string {
    const argsStr = args.length > 0 ? JSON.stringify(args) : ''
    return `${functionName}_${argsStr}`
  }
  
  // WebSocket缓存失效支持
  setupWebSocketSync(websocket: any) {
    websocket.on('cache_invalidate', (data: { tags: string[], keys: string[] }) => {
      if (data.tags) {
        data.tags.forEach(tag => this.invalidateByTag(tag))
      }
      if (data.keys) {
        data.keys.forEach(key => this.delete(key))
      }
    })
  }
}

export const enhancedCacheManager = new EnhancedCacheManager()
```

### 2. 缓存配置管理

```typescript
// src/config/cacheConfigs.ts
export const CACHE_CONFIGS = {
  // 用户区域 - 永久缓存
  USER_ZONES: {
    ttl: Infinity,
    storage: 'localStorage' as const,
    tags: ['user_data', 'zones', 'persistent']
  },
  
  // 节点列表 - 长期缓存
  NODES_LIST: {
    ttl: 30 * 60 * 1000, // 30分钟
    storage: 'memory' as const,
    tags: ['nodes', 'user_data']
  },
  
  // 节点详情 - 长期缓存
  NODE_DETAIL: {
    ttl: 30 * 60 * 1000,
    storage: 'memory' as const,
    tags: ['nodes', 'node_detail']
  },
  
  // 公共服务 - 中期缓存
  PUBLIC_SERVICES: {
    ttl: 5 * 60 * 1000, // 5分钟
    storage: 'memory' as const,
    tags: ['services', 'public']
  },
  
  // 我的服务 - 短期缓存
  MY_SERVICES: {
    ttl: 30 * 1000, // 30秒
    storage: 'memory' as const,
    tags: ['services', 'my']
  },
  
  // 统计数据 - 极短缓存
  STATISTICS: {
    ttl: 10 * 1000, // 10秒
    storage: 'memory' as const,
    tags: ['statistics']
  }
} as const

export type CacheConfigKey = keyof typeof CACHE_CONFIGS
```

## 🔄 Composables 改造示例

### 1. useZones 增强版

```typescript
// src/composables/useZones.ts - 增强版
import { ref, computed } from 'vue'
import { enhancedCacheManager } from '../utils/enhancedCacheManager'
import { CACHE_CONFIGS } from '../config/cacheConfigs'
import { zoneService } from '../services/zone/zoneService'

export function useZones() {
  const loading = ref(false)
  const zones = ref<Zone[]>([])
  const currentZone = ref<Zone | null>(null)
  
  // 创建 load/fetch 方法
  const { load: loadUserZones, fetch: fetchUserZones, refresh: refreshUserZones } = 
    enhancedCacheManager.createLoadFetch(
      () => zoneService.getUserZones(),
      CACHE_CONFIGS.USER_ZONES
    )
  
  const { load: loadZones, fetch: fetchZones, refresh: refreshZones } = 
    enhancedCacheManager.createLoadFetch(
      (params?: any) => zoneService.getZones(params),
      CACHE_CONFIGS.NODES_LIST // 使用相同的TTL
    )
  
  // 包装方法，添加loading状态和错误处理
  const loadUserZonesWrapper = async () => {
    try {
      loading.value = true
      const result = await loadUserZones()
      zones.value = result || []
      return result
    } catch (error) {
      console.error('Load user zones failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const fetchUserZonesWrapper = async () => {
    try {
      loading.value = true
      const result = await fetchUserZones()
      zones.value = result || []
      return result
    } catch (error) {
      console.error('Fetch user zones failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 智能刷新方法
  const handleRefresh = async (force = false) => {
    try {
      loading.value = true
      const result = await refreshUserZones(force)
      zones.value = result || []
      return result
    } catch (error) {
      console.error('Refresh user zones failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 切换Zone时的缓存处理
  const switchZone = async (zoneId: number) => {
    try {
      loading.value = true
      const response = await zoneService.switchZone(zoneId)
      
      // 切换zone后，清除相关缓存
      enhancedCacheManager.invalidateByTag('zone_data')
      enhancedCacheManager.invalidateByTag('services')
      
      currentZone.value = response.zone
      return response
    } catch (error) {
      console.error('Switch zone failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  return {
    // 状态
    loading: readonly(loading),
    zones: readonly(zones),
    currentZone: readonly(currentZone),
    
    // 方法 - 保持向后兼容
    fetchUserZones: fetchUserZonesWrapper,  // 原有方法
    
    // 新增方法
    loadUserZones: loadUserZonesWrapper,    // 缓存优先
    refreshZones: handleRefresh,            // 智能刷新
    switchZone,
    
    // 工具方法
    clearZoneCache: () => enhancedCacheManager.invalidateByTag('zones')
  }
}
```

### 2. useNodes 增强版

```typescript
// src/composables/useNodes.ts - 增强版示例
export function useNodes() {
  const loading = ref(false)
  const nodes = ref<Node[]>([])
  
  // 创建不同的缓存策略方法
  const { load: loadNodesList, fetch: fetchNodesList } = 
    enhancedCacheManager.createLoadFetch(
      (params?: any) => nodeService.getNodes(params),
      CACHE_CONFIGS.NODES_LIST
    )
  
  const { load: loadNodeDetail, fetch: fetchNodeDetail } = 
    enhancedCacheManager.createLoadFetch(
      (nodeId: string) => nodeService.getNode(nodeId),
      CACHE_CONFIGS.NODE_DETAIL
    )
  
  // 包装的load方法
  const loadNodes = async (params?: any) => {
    try {
      loading.value = true
      const result = await loadNodesList(params)
      nodes.value = result?.data || []
      return result
    } finally {
      loading.value = false
    }
  }
  
  // 包装的fetch方法
  const fetchNodes = async (params?: any) => {
    try {
      loading.value = true
      const result = await fetchNodesList(params)
      nodes.value = result?.data || []
      return result
    } finally {
      loading.value = false
    }
  }
  
  // 刷新方法
  const refreshNodes = async (force = false) => {
    return force ? await fetchNodes() : await loadNodes()
  }
  
  // 节点编辑后的缓存失效
  const updateNode = async (nodeId: string, data: any) => {
    try {
      const result = await nodeService.updateNode(nodeId, data)
      
      // 清除相关缓存
      enhancedCacheManager.invalidateByTag('nodes')
      enhancedCacheManager.delete(`getNode_["${nodeId}"]`)
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  return {
    loading: readonly(loading),
    nodes: readonly(nodes),
    
    // 保持向后兼容
    fetchNodes,
    
    // 新增方法
    loadNodes,
    refreshNodes,
    updateNode,
    
    // 工具方法
    clearNodeCache: () => enhancedCacheManager.invalidateByTag('nodes')
  }
}
```

### 3. useZoneServices 增强版

```typescript
// src/composables/useZoneServices.ts - 增强版
export function useZoneServices() {
  const loading = ref(false)
  const publicServices = ref<ZoneService[]>([])
  const myServices = ref<ZoneService[]>([])
  
  // 不同类型服务的缓存策略
  const { load: loadPublicServices, fetch: fetchPublicServices } = 
    enhancedCacheManager.createLoadFetch(
      () => zoneServiceApi.getPublicServices(),
      CACHE_CONFIGS.PUBLIC_SERVICES
    )
  
  const { load: loadMyServices, fetch: fetchMyServices } = 
    enhancedCacheManager.createLoadFetch(
      () => zoneServiceApi.getMyServices(),
      CACHE_CONFIGS.MY_SERVICES
    )
  
  // 统一的加载方法
  const loadAllServices = async () => {
    try {
      loading.value = true
      const [publicRes, myRes] = await Promise.all([
        loadPublicServices(),
        loadMyServices()
      ])
      
      publicServices.value = publicRes.data || []
      myServices.value = myRes.data || []
    } finally {
      loading.value = false
    }
  }
  
  // 强制刷新所有服务
  const fetchAllServices = async () => {
    try {
      loading.value = true
      const [publicRes, myRes] = await Promise.all([
        fetchPublicServices(),
        fetchMyServices()
      ])
      
      publicServices.value = publicRes.data || []
      myServices.value = myRes.data || []
    } finally {
      loading.value = false
    }
  }
  
  // 创建服务后的缓存处理
  const createService = async (data: CreateZoneServiceRequest) => {
    try {
      const result = await zoneServiceApi.createService(data)
      
      if (result.success) {
        // 清除相关缓存，强制刷新
        enhancedCacheManager.invalidateByTag('services')
        // 重新加载我的服务
        await fetchMyServices().then(res => {
          myServices.value = res.data || []
        })
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  return {
    loading: readonly(loading),
    publicServices: readonly(publicServices),
    myServices: readonly(myServices),
    
    // 保持向后兼容
    loadAllServices,
    
    // 新增方法
    fetchAllServices,    // 强制刷新
    createService,
    
    // 分类加载方法
    loadPublicServices: () => loadPublicServices().then(res => {
      publicServices.value = res.data || []
    }),
    loadMyServices: () => loadMyServices().then(res => {
      myServices.value = res.data || []
    }),
    
    // 工具方法
    clearServicesCache: () => enhancedCacheManager.invalidateByTag('services')
  }
}
```

## 🖼️ 页面组件使用示例

### 1. 列表页面标准模式

```vue
<!-- src/pages/nodes/NodeListPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <q-space />
      <q-btn 
        color="primary" 
        icon="refresh" 
        :loading="loading"
        @click="handleRefresh"
      >
        刷新
      </q-btn>
    </div>
    
    <NodeList :nodes="nodes" :loading="loading" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNodes } from '@/composables/useNodes'

const { 
  nodes, 
  loading, 
  loadNodes,      // 缓存优先
  fetchNodes,     // 强制刷新
  refreshNodes    // 智能刷新
} = useNodes()

// 页面初始化 - 使用缓存
onMounted(async () => {
  await loadNodes()
})

// 刷新按钮 - 强制获取最新数据
const handleRefresh = async () => {
  await fetchNodes()
}

// 可选：定期刷新
const startAutoRefresh = () => {
  setInterval(async () => {
    await refreshNodes(false) // 智能刷新，优先使用缓存
  }, 60000) // 每分钟
}
</script>
```

### 2. 详情页面模式

```vue
<!-- src/pages/nodes/NodeDetailPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <q-btn flat icon="arrow_back" @click="$router.back()">返回</q-btn>
      <q-space />
      <q-btn 
        color="primary" 
        icon="refresh" 
        :loading="loading"
        @click="handleRefresh"
      >
        刷新
      </q-btn>
    </div>
    
    <NodeDetail :node="node" :loading="loading" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNode } from '@/composables/useNode'

const route = useRoute()
const nodeId = route.params.id as string

const { 
  node, 
  loading, 
  loadNode,    // 缓存优先
  fetchNode    // 强制刷新
} = useNode()

// 页面初始化 - 使用缓存
onMounted(async () => {
  await loadNode(nodeId)
})

// 刷新按钮 - 强制获取最新数据
const handleRefresh = async () => {
  await fetchNode(nodeId)
}
</script>
```

## 📊 缓存状态监控组件

```vue
<!-- src/components/debug/CacheStatusIndicator.vue -->
<template>
  <div v-if="showDebugInfo" class="cache-status">
    <q-badge :color="cacheStatusColor">
      缓存: {{ hitRate }}% 命中率
    </q-badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCacheStatus } from '@/composables/useCache'

const { stats } = useCacheStatus()

const showDebugInfo = computed(() => {
  return import.meta.env.DEV // 只在开发环境显示
})

const hitRate = computed(() => {
  const total = stats.value.memory.hits + stats.value.memory.misses
  if (total === 0) return 0
  return Math.round((stats.value.memory.hits / total) * 100)
})

const cacheStatusColor = computed(() => {
  const rate = hitRate.value
  if (rate >= 80) return 'positive'
  if (rate >= 60) return 'warning'
  return 'negative'
})
</script>
```

这套实现方案提供了：

1. **向后兼容**: 保持现有API不变
2. **渐进式引入**: 可以逐步迁移到新的缓存策略
3. **灵活配置**: 不同数据类型可以使用不同的缓存策略
4. **智能失效**: 支持多种缓存失效触发方式
5. **开发友好**: 提供调试和监控工具

通过这种方式，我们可以在不破坏现有功能的前提下，大幅提升应用性能和用户体验。