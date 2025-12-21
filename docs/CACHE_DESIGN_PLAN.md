# 缓存系统设计方案与实施计划

## 📋 概述

基于当前项目的分析，我们提出一套完整的缓存策略来优化数据加载性能和用户体验。核心思想是建立 `load` 和 `fetch` 的明确约定，通过智能缓存减少不必要的API调用。

## 🎯 核心约定：Load vs Fetch

### 基本原则

- **`load`方法**: 优先从缓存读取，缓存未命中或过期时才调用API
- **`fetch`方法**: 直接调用API，获取最新数据，并更新缓存

### 使用场景

| 场景 | 推荐方法 | 原因 |
|------|----------|------|
| 页面初始化 | `load` | 优先使用缓存，提升加载速度 |
| 刷新按钮 | `fetch` | 强制获取最新数据 |
| 导航切换 | `load` | 缓存命中率高，提升体验 |
| 编辑后确认 | `fetch` | 确保数据一致性 |
| 实时状态查看 | `fetch` | 需要最新状态 |
| 定期轮询 | `fetch` | 保持数据新鲜度 |

## 📊 数据分类与缓存策略

### 1. 用户区域数据 (99.9%稳定)
```typescript
// 缓存策略：永久缓存，直到重新登录
const ZONE_CACHE_CONFIG = {
  ttl: Infinity, // 永久缓存
  storage: 'localStorage',
  invalidateOnLogin: true,
  tags: ['user_zones', 'persistent']
}
```

**特征**:
- 几乎不变更
- 重新登录时清除
- 跨会话持久化

### 2. 节点数据 (高稳定性)
```typescript
// 缓存策略：长期缓存 + WebSocket更新
const NODE_CACHE_CONFIG = {
  ttl: 30 * 60 * 1000, // 30分钟
  storage: 'memory',
  websocketUpdate: true,
  invalidateOnEdit: true,
  tags: ['nodes', 'user_data']
}
```

**特征**:
- 用户很少变更
- 支持WebSocket实时更新
- 编辑操作后失效

### 3. 公共服务数据 (中等稳定性)
```typescript
// 缓存策略：中期缓存
const PUBLIC_SERVICE_CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5分钟
  storage: 'memory',
  tags: ['services', 'public']
}
```

### 4. 个人服务数据 (低稳定性)
```typescript
// 缓存策略：短期缓存
const MY_SERVICE_CACHE_CONFIG = {
  ttl: 30 * 1000, // 30秒
  storage: 'memory',
  tags: ['services', 'my', 'realtime']
}
```

### 5. 统计数据 (实时性要求)
```typescript
// 缓存策略：极短期缓存，避免重复请求
const STATS_CACHE_CONFIG = {
  ttl: 10 * 1000, // 10秒
  storage: 'memory',
  tags: ['statistics']
}
```

## 🔄 缓存失效机制

### 1. 主动刷新触发
```typescript
// 用户点击刷新按钮
const handleRefresh = async () => {
  // 清除相关缓存
  invalidateByTag('services')
  // 强制获取最新数据
  await fetchServices()
}
```

### 2. WebSocket事件触发
```typescript
// WebSocket消息处理
const handleWebSocketMessage = (message) => {
  switch (message.type) {
    case 'node_status_update':
      invalidateByTag('nodes')
      break
    case 'service_created':
      invalidateByTag('services')
      break
  }
}
```

### 3. 编辑操作触发
```typescript
// 编辑操作后清除缓存
const updateNode = async (nodeId, data) => {
  const result = await api.put(`/nodes/${nodeId}`, data)
  // 清除相关缓存
  invalidateByTag('nodes')
  invalidateByTag(`node_${nodeId}`)
  return result
}
```

### 4. 路由切换触发
```typescript
// 切换zone时清除相关缓存
const switchZone = async (zoneId) => {
  await api.post('/user/switch-zone', { zone_id: zoneId })
  // 清除当前zone相关的缓存
  invalidateByTag('zone_data')
  invalidateByTag('services')
}
```

## 🛠️ 实现方案

### 1. 增强现有的 Composables

为现有的 composables 添加 load/fetch 双模式支持：

```typescript
// src/composables/useNodes.ts 增强示例
export function useNodes() {
  // 现有方法保持不变，保证向后兼容
  const fetchNodes = async () => { /* 直接API调用 */ }
  
  // 新增 load 方法
  const loadNodes = async () => {
    const cached = cacheManager.get('nodes_list')
    if (cached) return cached
    return await fetchNodes()
  }
  
  // 新增智能刷新
  const refreshNodes = async (force = false) => {
    if (force) {
      return await fetchNodes()
    } else {
      return await loadNodes()
    }
  }
  
  return {
    // 保持现有接口
    fetchNodes,
    // 新增接口
    loadNodes,
    refreshNodes,
    // ...其他方法
  }
}
```

### 2. 统一缓存键命名规范

```typescript
// 缓存键生成规则
const generateCacheKey = (type: string, params?: any) => {
  const baseKey = `${type}_${currentZone.value?.zone_id || 'global'}`
  if (params) {
    return `${baseKey}_${JSON.stringify(params)}`
  }
  return baseKey
}

// 示例
const CACHE_KEYS = {
  USER_ZONES: 'user_zones',
  NODES_LIST: (zoneId) => `nodes_list_${zoneId}`,
  NODE_DETAIL: (nodeId) => `node_detail_${nodeId}`,
  PUBLIC_SERVICES: (zoneId) => `public_services_${zoneId}`,
  MY_SERVICES: (zoneId) => `my_services_${zoneId}`
}
```

### 3. 页面级缓存策略

```vue
<!-- 页面组件示例 -->
<template>
  <div>
    <q-btn @click="handleRefresh" icon="refresh">刷新</q-btn>
    <NodeList :nodes="nodes" />
  </div>
</template>

<script setup>
import { useNodes } from '@/composables/useNodes'

const { nodes, loadNodes, fetchNodes } = useNodes()

// 页面初始化 - 使用缓存
onMounted(async () => {
  await loadNodes()
})

// 刷新按钮 - 强制获取最新数据
const handleRefresh = async () => {
  await fetchNodes()
}
</script>
```

## 📈 预期收益

### 性能提升
- **首次加载**: 减少 30-50% 的API请求
- **页面切换**: 减少 60-80% 的等待时间
- **重复访问**: 近乎即时的数据展示

### 用户体验改善
- 更快的页面响应
- 减少加载闪烁
- 更平滑的操作体验

### 服务器负载降低
- 减少重复API调用
- 降低数据库查询压力
- 提升整体系统性能

## 🚀 实施计划

### 第一阶段：基础设施完善 (1-2天)
- [ ] 完善 CacheManager 类
- [ ] 实现统一的缓存键管理
- [ ] 添加 WebSocket 缓存失效支持
- [ ] 编写缓存工具函数

### 第二阶段：核心模块改造 (2-3天)
- [ ] 改造 useZones composable
- [ ] 改造 useNodes composable  
- [ ] 改造 useZoneServices composable
- [ ] 添加统一的 load/fetch 接口

### 第三阶段：页面级优化 (2-3天)
- [ ] 更新主要页面的数据加载逻辑
- [ ] 统一刷新按钮的行为
- [ ] 优化路由切换的缓存策略
- [ ] 添加缓存状态指示器

### 第四阶段：测试与优化 (1-2天)
- [ ] 功能测试
- [ ] 性能测试
- [ ] 缓存策略调优
- [ ] 文档更新

## 🔧 技术细节

### 缓存配置管理
```typescript
// src/config/cache.ts
export const CACHE_CONFIGS = {
  USER_ZONES: {
    ttl: Infinity,
    storage: 'localStorage' as const,
    tags: ['user_data', 'persistent']
  },
  NODES: {
    ttl: 30 * 60 * 1000,
    storage: 'memory' as const,
    tags: ['nodes', 'user_data']
  },
  // ... 其他配置
}
```

### WebSocket集成
```typescript
// src/plugins/websocket.ts
export const setupWebSocketCacheSync = () => {
  websocket.on('node_update', (data) => {
    invalidateByTag('nodes')
    // 可选：预加载更新的数据
    prefetchNodeData(data.node_id)
  })
}
```

### 缓存监控
```typescript
// 添加缓存使用统计
export const useCacheMetrics = () => {
  const metrics = ref({
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0
  })
  
  return { metrics, recordHit, recordMiss }
}
```

## ⚠️ 注意事项

1. **数据一致性**: 确保缓存失效策略正确，避免展示过期数据
2. **内存管理**: 定期清理过期缓存，防止内存泄漏
3. **错误处理**: 缓存读取失败时的降级策略
4. **调试支持**: 开发环境下的缓存状态可视化
5. **逐步迁移**: 保持向后兼容，渐进式引入新的缓存策略

## 🎛️ 配置选项

用户可以通过设置面板控制缓存行为：

```typescript
// 缓存设置
interface CacheSettings {
  enableCache: boolean          // 是否启用缓存
  cacheLevel: 'aggressive' | 'normal' | 'conservative'  // 缓存强度
  autoRefresh: boolean          // 是否自动刷新
  debugMode: boolean           // 调试模式
}
```

通过这套方案，我们可以显著提升应用性能，同时保持良好的数据一致性和用户体验。