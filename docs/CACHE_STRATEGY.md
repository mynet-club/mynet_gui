# 缓存策略实施指南

## 📦 缓存系统概述

本项目现已实施完整的缓存管理系统，包括：

- **统一缓存管理器** (`CacheManager`)
- **API缓存装饰器** (`@apiCache`, `withCache`)
- **Vue组合式函数** (`useCache`, `useApiCache`)

> 原第 4 项「可视化管理界面 `CacheManagementPage`」已删除（2026-10-05）：该页没有任何路由
> 与入口引用它，属于死代码。缓存能力本身（上面三件）仍在 `src/utils/cacheManager.ts`、
> `src/utils/apiCache.ts`、`src/composables/useCache.ts` 里活着，不受影响。
> 需要管理界面时按现有 API 重新接线，别去找这个旧页。

## 🚀 使用方法

### 1. 基础API缓存

```typescript
import { withCache, generateApiCacheKey } from '@/utils/apiCache'

// 为API函数添加缓存
const getUsers = withCache(
  async (params) => {
    const response = await api.get('/users', { params })
    return response.data
  },
  {
    ttl: 5 * 60 * 1000, // 5分钟缓存
    storage: 'memory',
    key: (args) => generateApiCacheKey('users', args[0]),
    tags: ['users']
  }
)
```

### 2. 在组件中使用

```vue
<script setup lang="ts">
import { useApiCache } from '@/composables/useCache'
import { api } from '@/services/api'

const { data, loading, error, execute, refresh } = useApiCache(
  (userId) => api.get(`/users/${userId}`),
  {
    key: 'user_profile',
    ttl: 10 * 60 * 1000, // 10分钟
    storage: 'localStorage'
  }
)

// 组件挂载时执行
onMounted(() => {
  execute(userId.value)
})
</script>
```

### 3. 智能缓存失效

```typescript
import { invalidateByTag } from '@/utils/apiCache'

// 创建用户后清除相关缓存
async function createUser(userData) {
  const result = await api.post('/users', userData)
  
  // 清除用户列表相关的所有缓存
  invalidateByTag('users')
  
  return result
}
```

## 📊 缓存策略配置

### 数据分类与策略

| 数据类型 | TTL | 存储方式 | 标签 | 说明 |
|---------|-----|---------|------|------|
| 用户信息 | 10分钟 | localStorage | `user_info` | 相对稳定 |
| 公共服务 | 5分钟 | memory | `services`, `public` | 变化较少 |
| 好友列表 | 1分钟 | memory | `services`, `friends` | 实时性要求高 |
| 我的服务 | 30秒 | memory | `services`, `my` | 需要实时更新 |
| 系统配置 | 30分钟 | localStorage | `config` | 很少变化 |
| 统计数据 | 2分钟 | memory | `stats` | 定期更新 |

### 缓存键命名规范

```typescript
// API缓存键格式
const cacheKey = `api_${endpoint}_${JSON.stringify(params)}`

// 用户相关数据
const userCacheKey = `user_${userId}_${dataType}`

// 区域相关数据
const zoneCacheKey = `zone_${zoneId}_${dataType}`
```

## 🔧 配置示例

### 1. Zone Services API 缓存配置

```typescript
export const zoneServiceApi = {
  // 公共服务 - 长期缓存
  getPublicServices: withCache(async () => {
    const response = await api.get('/zones/services/public')
    return response.data
  }, {
    ttl: 5 * 60 * 1000,
    storage: 'memory',
    key: 'public_services',
    tags: ['zone_services', 'public_services']
  }),

  // 我的服务 - 短期缓存
  getMyServices: withCache(async () => {
    const response = await api.get('/zones/services/my')
    return response.data
  }, {
    ttl: 30 * 1000,
    storage: 'memory',
    key: 'my_services',
    tags: ['zone_services', 'my_services']
  })
}
```

### 2. 变更操作缓存失效

```typescript
// 创建服务后清除相关缓存
async createService(data) {
  const response = await api.post('/zones/services', data)
  
  // 清除相关缓存
  invalidateByTag('zone_services')
  invalidateByTag('my_services')
  
  return response.data
}
```

## 📈 性能优化建议

### 1. 缓存层次设计

```
内存缓存 (最快)
├── 热点数据 (30秒-2分钟)
├── 用户会话数据 (5-10分钟)
└── 静态配置 (30分钟+)

本地存储 (持久化)
├── 用户偏好设置
├── 认证信息
└── 长期配置数据

会话存储 (标签页生命周期)
├── 临时状态
├── 表单数据
└── 页面状态
```

### 2. 预取策略

```typescript
import { useDataPrefetch } from '@/composables/useCache'

const { addToPrefetchQueue, processPrefetchQueue } = useDataPrefetch()

// 在用户进入页面时预取可能需要的数据
onMounted(() => {
  addToPrefetchQueue('user_zones', () => api.get('/zones'), 1)
  addToPrefetchQueue('user_services', () => api.get('/zones/services/my'), 2)
  
  // 空闲时处理预取队列
  requestIdleCallback(() => {
    processPrefetchQueue()
  })
})
```

### 3. 缓存监控

```typescript
import { useCacheStatus } from '@/composables/useCache'

const { stats, formattedMemorySize } = useCacheStatus()

// 监控缓存使用情况
watchEffect(() => {
  if (stats.value.memory.count > 100) {
    console.warn('内存缓存条目过多，考虑清理')
  }
})
```

## 🛠️ 开发工具

### 缓存管理页面

访问 `/system/cache` 查看：
- 缓存统计信息
- 缓存操作控制
- 性能优化建议
- 缓存策略说明

### 控制台调试

```javascript
// 在浏览器控制台中
window.cacheManager.getStats() // 查看统计
window.cacheManager.clear() // 清除所有缓存
```

## 📋 最佳实践

### 1. 缓存键设计
- 使用描述性的键名
- 包含必要的参数信息
- 避免键名冲突

### 2. TTL设置原则
- 根据数据更新频率设置
- 考虑用户体验和实时性需求
- 平衡性能和数据新鲜度

### 3. 标签使用
- 为相关的缓存设置相同标签
- 便于批量清除操作
- 支持复杂的失效策略

### 4. 存储选择
- **memory**: 频繁访问的数据
- **localStorage**: 需要持久化的数据
- **sessionStorage**: 临时会话数据

## 🚨 注意事项

1. **内存管理**: 定期清理过期缓存，避免内存泄漏
2. **数据一致性**: 及时清除过期或无效的缓存
3. **安全考虑**: 敏感数据不要存储在localStorage
4. **容量限制**: 注意浏览器存储限制
5. **兼容性**: 确保在不支持的浏览器中优雅降级

## 🔍 故障排除

### 常见问题

1. **缓存未生效**
   - 检查TTL设置
   - 确认缓存键是否正确
   - 查看是否被意外清除

2. **数据不更新**
   - 检查缓存失效机制
   - 确认变更操作是否清除了相关缓存
   - 手动刷新或清除缓存

3. **性能问题**
   - 监控缓存命中率
   - 调整TTL和存储策略
   - 优化缓存键设计

通过以上缓存策略，可以显著提升应用性能，减少不必要的API请求，改善用户体验。
