# 全站节点状态统一管理方案

## 问题背景

在当前系统中，不同页面和组件使用各自独立的状态显示逻辑，导致：

1. **状态显示不一致**：同样的 `node_status = 2`，在节点详情页显示"在线"，在路由页面可能显示"未配置"
2. **代码重复**：每个组件都有自己的 `getStatusText`、`getStatusColor`、`getStatusIcon` 方法
3. **维护困难**：新增状态或修改显示逻辑需要在多个文件中同步修改
4. **类型不安全**：状态映射逻辑分散，容易出现遗漏

## 解决方案

### 1. 统一状态管理工具 (`src/utils/nodeStatus.ts`)

创建 `NodeStatusManager` 类，提供全站统一的状态管理：

#### 核心特性：
- **状态标准化**：优先使用数字状态码，向后兼容字符串状态
- **配置中心化**：所有状态映射在一个文件中管理
- **类型安全**：完整的 TypeScript 类型定义
- **便捷方法**：提供状态判断的快捷方法

#### 主要方法：
```typescript
// 基础方法
NodeStatusManager.getStatusText(status)    // 获取状态文本
NodeStatusManager.getStatusColor(status)   // 获取状态颜色
NodeStatusManager.getStatusIcon(status)    // 获取状态图标

// 判断方法
NodeStatusManager.isOnline(status)         // 是否在线
NodeStatusManager.isOffline(status)        // 是否离线
NodeStatusManager.needsConfiguration(status) // 是否需要配置

// 工具方法
normalizeNodeStatus(nodeStatus, status)    // 状态标准化
```

### 2. 状态映射表

#### 数字状态码（主要）
| 状态码 | 常量名 | 显示文本 | 颜色 | 图标 | 描述 |
|--------|--------|----------|------|------|------|
| -1 | UNCONFIGURED | 未完成配置 | warning | settings | 节点尚未完成基础配置 |
| 0 | DISABLED | 已禁用 | grey | cancel | 节点已被管理员禁用 |
| 1 | ENABLED | 已启用 | orange | check_circle_outline | 节点已启用但暂未在线 |
| 2 | ONLINE | 在线 | positive | check_circle | 节点正常在线运行 |
| 99 | MAINTENANCE | 维护模式 | info | build | 节点处于维护模式 |

#### 字符串状态码（兼容）
| 状态字符串 | 显示文本 | 颜色 | 图标 | 描述 |
|------------|----------|------|------|------|
| active | 在线 | positive | check_circle | 节点正常在线运行 |
| inactive | 离线 | negative | cancel | 节点离线或不可达 |
| pending | 待连接 | warning | schedule | 节点等待连接 |
| maintenance | 维护模式 | info | build | 节点处于维护模式 |
| disabled | 已禁用 | grey | cancel | 节点已被禁用 |

### 3. 迁移计划

#### 已完成的迁移：
✅ **节点详情页** (`NodeDetailPage.vue`)  
✅ **节点列表页** (`NodeListPage.vue`)  
✅ **路由管理页** (`NodeBasedRoutesTab.vue`)  

#### 待迁移的组件：
- [ ] 节点选择器组件 (`NodeSelectorCard.vue`)
- [ ] 路由创建向导 (`Step2FriendNodeSelection.vue`)
- [ ] 其他使用节点状态的组件

#### 迁移步骤：

**第一步：导入统一工具**
```typescript
import { NodeStatusManager, normalizeNodeStatus } from '../../utils/nodeStatus'
```

**第二步：替换模板中的方法调用**
```vue
<!-- 旧版本 -->
<q-chip
  :color="getStatusColor(node.status)"
  :icon="getStatusIcon(node.status)"
>
  {{ getStatusText(node.status) }}
</q-chip>

<!-- 新版本 -->
<q-chip
  :color="NodeStatusManager.getStatusColor(normalizeNodeStatus(node.node_status, node.status))"
  :icon="NodeStatusManager.getStatusIcon(normalizeNodeStatus(node.node_status, node.status))"
>
  {{ NodeStatusManager.getStatusText(normalizeNodeStatus(node.node_status, node.status)) }}
</q-chip>
```

**第三步：删除本地状态处理方法**
删除组件中的 `getStatusText`、`getStatusColor`、`getStatusIcon` 等方法

**第四步：更新状态判断逻辑**
```typescript
// 旧版本
const isOnline = node.status === 'active' || node.node_status === 2

// 新版本
const isOnline = NodeStatusManager.isOnline(normalizeNodeStatus(node.node_status, node.status))
```

## 技术优势

### 1. 一致性保证
- 全站状态显示统一，用户体验一致
- 状态语义明确，避免混淆

### 2. 维护性提升
- 单一配置源，修改一处生效全站
- 类型安全，减少运行时错误
- 清晰的状态映射，易于理解和扩展

### 3. 开发效率
- 减少重复代码，提高开发效率
- 提供便捷的状态判断方法
- 良好的 IDE 支持和代码提示

### 4. 向后兼容
- 同时支持数字和字符串状态码
- 渐进式迁移，不影响现有功能
- 优雅的降级处理

## 扩展指南

### 添加新状态类型
1. 在 `NODE_STATUS_CONFIG` 或 `STRING_STATUS_CONFIG` 中添加映射
2. 更新相关的 TypeScript 类型定义
3. 编写测试用例验证新状态

### 添加新的状态判断方法
```typescript
// 在 NodeStatusManager 类中添加
static isSpecialStatus(status?: NodeStatus | string | number): boolean {
  // 实现判断逻辑
}
```

### 自定义状态配置
```typescript
// 可以扩展状态配置
const customConfig: StatusConfig = {
  text: '自定义状态',
  color: 'purple',
  icon: 'star',
  description: '这是一个自定义状态'
}
```

## 测试验证

### 单元测试覆盖
- [ ] 数字状态码映射测试
- [ ] 字符串状态码映射测试
- [ ] 状态标准化测试
- [ ] 边界情况测试

### 集成测试验证
- [ ] 节点列表页状态显示
- [ ] 节点详情页状态显示
- [ ] 路由管理页状态显示
- [ ] 状态切换功能

### 用户验收测试
- [ ] 状态显示一致性验证
- [ ] 状态切换操作验证
- [ ] 多页面状态同步验证

## 监控和维护

### 状态使用情况监控
- 收集各状态类型的使用频率
- 监控状态显示的用户反馈
- 跟踪状态相关的错误日志

### 定期维护任务
- 清理不再使用的状态类型
- 优化状态映射性能
- 更新文档和示例代码

## 总结

通过实施全站节点状态统一管理方案，我们解决了状态显示不一致的问题，提升了代码质量和维护效率。该方案具有良好的可扩展性和向后兼容性，为后续的功能开发提供了坚实的基础。

关键收益：
- ✅ 修复了路由页面状态显示错误的问题
- ✅ 统一了全站状态显示逻辑
- ✅ 提供了类型安全的状态管理工具
- ✅ 简化了组件开发和维护工作
