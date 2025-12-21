# 活跃路由页面时区显示修复

## 问题描述

在活跃路由页面的"最后可见时间"列中，时间显示存在时区问题。原因是使用了 `toLocaleString()` 或 `toLocaleDateString()` 方法，这些方法在不同浏览器和环境下可能产生不一致的时区显示。

## 解决方案

创建统一的日期时间格式化工具库 `src/utils/dateFormat.ts`，提供项目级别的标准化时间显示方法。

### 核心功能

#### 1. 时间格式化函数

```typescript
// 相对时间显示（推荐用于"最后可见时间"）
formatRelativeTime(dateStr: string): string
// 输出示例：
// - "刚刚" (< 1分钟)
// - "5分钟前" (< 1小时)
// - "2小时前" (< 24小时)
// - "昨天 14:30" (昨天)
// - "12-15 14:30" (更早)

// 完整日期时间
formatDateTime(dateStr: string, includeSeconds = true): string
// 输出：2025-12-15 14:30:45

// 仅日期
formatDate(dateStr: string): string
// 输出：2025-12-15

// 仅时间
formatTime(dateStr: string, includeSeconds = true): string
// 输出：14:30:45

// 智能日期时间（根据日期自动选择格式）
formatSmartDateTime(dateStr: string): string
// 输出：
// - "今天 14:30"
// - "昨天 14:30"
// - "2025-12-15 14:30"
```

#### 2. 数据格式化函数

```typescript
// 字节大小
formatBytes(bytes: number, decimals = 2): string
// 输出：1.5 MB

// 网络速度
formatSpeed(bytesPerSecond: number, decimals = 2): string
// 输出：1.5 MB/s

// 延迟
formatLatency(latency: number): string
// 输出：25.5ms
```

#### 3. 辅助判断函数

```typescript
isToday(dateStr: string): boolean
isYesterday(dateStr: string): boolean
```

### 实现原理

所有时间格式化函数都使用 `Date` 对象的 `getFullYear()`, `getMonth()`, `getDate()`, `getHours()`, `getMinutes()`, `getSeconds()` 等方法，这些方法返回的是**本地时间**，避免了时区转换问题。

```typescript
// ❌ 错误做法 - 可能有时区问题
date.toLocaleString('zh-CN', options)

// ✅ 正确做法 - 使用本地时间方法
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')
const hours = String(date.getHours()).padStart(2, '0')
const minutes = String(date.getMinutes()).padStart(2, '0')
```

## 已修复的文件

### 1. RouteListView.vue

**修改位置：**
- 第 193 行：添加导入
- 第 347-348 行：使用统一工具函数

**修改内容：**
```typescript
// 导入
import { formatRelativeTime, formatBytes as utilFormatBytes } from '../../utils/dateFormat'

// 使用
const formatBytes = utilFormatBytes
const formatDateTime = formatRelativeTime
```

**应用场景：**
- 表格中的"最后可见"列
- 流量统计（上传/下载字节）

### 2. ConnectionDetailsPage.vue

**修改位置：**
- 第 298 行：添加导入
- 第 554-555 行：使用统一工具函数

**修改内容：**
```typescript
// 导入
import { formatRelativeTime, formatBytes as utilFormatBytes, formatLatency } from '../../utils/dateFormat'

// 使用
const formatBytes = utilFormatBytes
const formatDateTime = formatRelativeTime
```

**应用场景：**
- 连接详情中的"最后可见时间"
- 接收/发送字节统计
- 延迟显示（未来可使用 formatLatency）

## 使用建议

### 根据场景选择函数

1. **实时性数据（最后可见时间、更新时间）**
   - 使用 `formatRelativeTime()`
   - 优点：用户友好，直观显示时间差
   - 示例："5分钟前"、"2小时前"

2. **历史记录时间轴**
   - 使用 `formatSmartDateTime()`
   - 优点：近期数据显示相对时间，远期数据显示完整日期
   - 示例："今天 14:30"、"2025-12-15 14:30"

3. **精确时间戳（日志、审计）**
   - 使用 `formatDateTime()`
   - 优点：完整信息，便于追溯
   - 示例："2025-12-15 14:30:45"

4. **仅关心日期**
   - 使用 `formatDate()`
   - 示例："2025-12-15"

### 数据类型处理

工具函数会自动处理以下情况：
- `null` / `undefined` → 返回 `'N/A'`
- 无效日期字符串 → 返回原字符串
- 数字 0 → 返回 `'0 B'` (字节) 或 `'N/A'` (时间)

### 示例：在组件中使用

```vue
<script setup lang="ts">
import { formatRelativeTime, formatBytes } from '../../utils/dateFormat'

// 直接使用
const displayTime = formatRelativeTime(data.seen_at)
const displaySize = formatBytes(data.file_size)
</script>

<template>
  <div>最后更新: {{ formatRelativeTime(item.updated_at) }}</div>
  <div>文件大小: {{ formatBytes(item.size) }}</div>
</template>
```

## 后续优化建议

### 1. 全局替换计划

项目中还有约 30+ 处使用了 `toLocaleDateString()` 或自定义格式化函数，建议逐步迁移：

```bash
# 查找所有使用旧方法的位置
grep -r "toLocaleDateString\|toLocaleString" src/
```

**优先级：**
1. 高频用户界面（✅ 已完成：活跃路由页面）
2. 监控和日志页面
3. 表单和详情页
4. 其他辅助页面

### 2. 国际化支持

当前工具函数固定使用中文显示（"分钟前"、"小时前"），未来可以结合 i18n 实现多语言：

```typescript
// 示例
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

if (minutes > 0) {
  return t('time.minutesAgo', { count: minutes })
}
```

### 3. 性能优化

对于大量数据的表格，可以考虑：
- 使用计算属性缓存格式化结果
- 虚拟滚动时按需格式化
- 使用 Web Worker 处理大批量数据格式化

### 4. 单元测试

建议为 `dateFormat.ts` 添加完整的单元测试：

```typescript
describe('formatRelativeTime', () => {
  it('should display "刚刚" for time within 1 minute', () => {
    const now = new Date()
    const result = formatRelativeTime(now.toISOString())
    expect(result).toBe('刚刚')
  })
  
  it('should display minutes ago for time within 1 hour', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const result = formatRelativeTime(tenMinutesAgo.toISOString())
    expect(result).toBe('10分钟前')
  })
})
```

## 验证方法

### 1. 本地开发环境测试

访问路由列表页面：
- `/app/routes/active/{nodeId}/list`
- 检查"最后可见"列显示格式
- 确认时间相对当前时间准确

### 2. 跨时区测试

修改系统时区，验证时间显示：
```bash
# macOS
sudo systemsetup -settimezone "Asia/Tokyo"
sudo systemsetup -settimezone "America/New_York"

# 恢复
sudo systemsetup -settimezone "Asia/Shanghai"
```

### 3. 浏览器控制台验证

```javascript
// 导入测试
import { formatRelativeTime } from './utils/dateFormat'

// 测试当前时间
console.log(formatRelativeTime(new Date().toISOString()))
// 输出：刚刚

// 测试5分钟前
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
console.log(formatRelativeTime(fiveMinutesAgo.toISOString()))
// 输出：5分钟前
```

## 相关文档

- [活跃路由优化计划](./ACTIVE_ROUTES_OPTIMIZATION_PLAN.md)
- [活跃路由组件结构](./ACTIVE_ROUTES_COMPONENT_STRUCTURE.md)
- [监控API集成](./ACTIVE_ROUTES_MONITOR_API_INTEGRATION.md)
- [API监控文档](./api-monitor.md)

## 总结

通过引入统一的日期时间格式化工具库，解决了以下问题：

1. ✅ **时区显示问题**：使用本地时间方法，避免时区转换
2. ✅ **格式不一致**：项目范围内使用统一格式
3. ✅ **代码重复**：多个组件共享同一套工具函数
4. ✅ **用户体验**：提供更友好的相对时间显示
5. ✅ **可维护性**：集中管理，易于修改和扩展

此修复确保了活跃路由页面的时间显示准确、一致、用户友好。
