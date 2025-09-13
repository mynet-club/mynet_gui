# IP Pool 创建对话框数据显示修复

## 问题描述

在IP池创建对话框中显示"当前 0 个池，最多 3 个池"，即使实际上已经有IP池存在。

## 根本原因分析

1. **数据时序问题**: 对话框打开时，统计数据可能还没有加载完成
2. **数据源优先级**: 组件同时依赖两个数据源（props.existingPools 和 statistics.value），但没有正确的优先级处理
3. **响应式更新**: 统计数据更新后，计算属性没有正确反映最新状态

## 修复内容

### 1. 更新 `currentPoolsCount` 计算逻辑

**修复前:**
```typescript
const currentPoolsCount = computed(() => props.existingPools.length)
```

**修复后:**
```typescript
const currentPoolsCount = computed(() => {
  // 优先使用统计数据中的池数量，如果没有则使用传入的 pools 数量
  const statsCount = statistics.value?.total_pools || 0
  const propsCount = props.existingPools.length
  const result = statsCount || propsCount
  
  console.log('currentPoolsCount computed:', {
    statsCount,
    propsCount,
    result,
    statisticsValue: statistics.value
  })
  
  return result
})
```

### 2. 增强 `remainingPools` 计算逻辑

**修复后:**
```typescript
const remainingPools = computed(() => {
  const userQuota = statistics.value?.user_quota || MAX_POOLS_PER_ZONE
  const result = Math.max(0, userQuota - currentPoolsCount.value)
  
  console.log('remainingPools computed:', {
    userQuota,
    currentCount: currentPoolsCount.value,
    result
  })
  
  return result
})
```

### 3. 改进对话框打开时的数据加载

**修复前:**
```typescript
watch(isOpen, (open) => {
  if (open) {
    resetForm()
    fetchStatistics()
    // ...
  }
})
```

**修复后:**
```typescript
watch(isOpen, async (open) => {
  if (open) {
    resetForm()
    // 获取最新的统计数据
    try {
      await fetchStatistics()
      console.log('Create dialog - Statistics loaded:', statistics.value)
      console.log('Create dialog - Current pools count:', currentPoolsCount.value)
      console.log('Create dialog - Remaining pools:', remainingPools.value)
    } catch (error) {
      console.warn('Failed to fetch statistics in create dialog:', error)
    }
    // ...
  }
})
```

### 4. 添加调试信息到模板

在配额信息横幅中添加了调试信息：
```vue
{{ $t('ippools.quotaInfo', { 
  current: currentPoolsCount, 
  max: statistics?.user_quota || MAX_POOLS_PER_ZONE 
}) }}
<!-- 调试信息（生产环境应移除） -->
<div class="text-caption q-mt-xs" style="opacity: 0.7;">
  调试: 统计池数={{ statistics?.total_pools || 0 }}, 
  传入池数={{ existingPools.length }}, 
  配额={{ statistics?.user_quota || MAX_POOLS_PER_ZONE }}
</div>
```

## 数据流修复逻辑

1. **对话框打开**: 触发 `watch(isOpen)` → 调用 `fetchStatistics()`
2. **统计数据更新**: `statistics.value` 更新 → `currentPoolsCount` 重新计算
3. **显示更新**: 模板响应式更新，显示正确的池数量

## 预期效果

基于您提供的API数据（2个已分配的IP池），对话框应该显示：
- **修复前**: "当前 0 个池，最多 3 个池"
- **修复后**: "当前 2 个池，最多 3 个池"

## 调试验证

通过控制台日志可以验证：
1. 对话框打开时统计数据是否正确加载
2. `currentPoolsCount` 计算结果是否正确
3. `remainingPools` 计算结果是否正确

## 注意事项

- 调试信息应在生产环境中移除
- 如果统计API失败，会回退到使用 `props.existingPools.length`
- 确保父组件正确传递 `existingPools` prop
