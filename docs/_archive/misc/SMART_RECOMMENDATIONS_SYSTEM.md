# 智能推荐系统实现文档

## 概述

实现了基于用户状态的智能推荐系统，能够根据用户当前的使用情况，智能判断并推荐下一步行动。

## 核心架构

### 1. 用户状态分析器 (UserStateAnalyzer)

**文件位置**: `src/services/recommendations/UserStateAnalyzer.ts`

**功能**:
- 分析用户当前数据（IP池、设备、好友、连接、服务等）
- 判断用户处于哪个使用阶段
- 识别已完成的里程碑
- 生成可能的下一步行动列表

**用户状态枚举**:
```typescript
enum UserState {
  NewUser              // 新用户，刚注册
  HasIPPool            // 已创建IP池，但无设备
  SingleDevice         // 有单个设备
  MultipleDevices      // 有多个设备，但无连接
  HasConnectionsNoFriends      // 有连接但无好友
  HasFriendsNoConnections      // 有好友但未连接
  HasCrossUserConnections      // 有跨用户连接
  HasServices          // 有服务
  FullyActive          // 完整功能用户
}
```

### 2. 推荐引擎 (RecommendationEngine)

**文件位置**: `src/services/recommendations/RecommendationEngine.ts`

**功能**:
- 根据用户状态生成个性化推荐
- 为每个推荐分配优先级
- 生成欢迎消息和进度提示
- 提供路由和处理函数

**推荐行动类型**:
- **setup**: 初始配置（创建IP池、添加设备等）
- **network**: 网络管理（管理连接、审批请求等）
- **social**: 社交功能（邀请好友、加入网络等）
- **service**: 服务管理（设置服务、浏览服务等）
- **optimization**: 性能优化（网络质量监控等）

### 3. 推荐组合式函数 (useRecommendations)

**文件位置**: `src/composables/useRecommendations.ts`

**提供的功能**:
```typescript
{
  currentState,          // 当前用户状态分析
  recommendations,       // 所有推荐列表
  topRecommendations,    // 前3个推荐
  welcomeMessage,        // 智能欢迎消息
  progressTip,           // 进度提示
  isAnalyzing,           // 是否正在分析
  refreshRecommendations // 刷新推荐
}
```

### 4. 推荐卡片组件 (RecommendationsCard)

**文件位置**: `src/components/dashboard/RecommendationsCard.vue`

**UI特性**:
- 智能欢迎消息（根据时间和用户状态）
- 进度提示条
- 最多显示3个优先推荐
- 每个推荐显示：图标、标题、描述、预计时间、行动按钮
- 不同类别用不同颜色标识
- 支持查看更多推荐

## 智能推荐流程

### 典型用户旅程

```
新注册用户
  ↓
创建IP池 → 推荐: add_first_device
  ↓
添加第一个设备 → 推荐: add_second_device | invite_friend
  ↓
路径A: 添加第二个设备
  ↓
设备自动连接 → 推荐: invite_friend
  ↓
路径B: 邀请好友
  ↓
有好友但无跨用户连接 → 推荐: connect_to_friend_device
  ↓
建立跨用户连接 → 推荐: setup_service | browse_services
  ↓
有服务运行 → 推荐: optimize_network | share_service
  ↓
完整功能用户 → 推荐: monitor_quality
```

## 推荐优先级

系统会根据以下因素自动调整推荐优先级：

1. **紧急程度**: 待审批请求 (priority: 10)
2. **基础配置**: 创建IP池、添加设备 (priority: 8-10)
3. **社交功能**: 邀请好友、连接设备 (priority: 6-7)
4. **高级功能**: 服务管理 (priority: 5-6)
5. **优化功能**: 性能监控 (priority: 3-4)

## 集成方式

### Dashboard 集成

在 `DashboardPage.vue` 中添加：

```vue
<template>
  <RecommendationsCard class="q-mb-lg" />
</template>

<script setup>
import RecommendationsCard from '../../components/dashboard/RecommendationsCard.vue'
</script>
```

### 其他页面集成

任何页面都可以使用推荐系统：

```typescript
import { useRecommendations } from '@/composables/useRecommendations'

const { topRecommendations, welcomeMessage } = useRecommendations()
```

## 扩展点

### 1. 添加新的用户状态

在 `UserStateAnalyzer.ts` 中添加新的状态枚举和判断逻辑。

### 2. 添加新的推荐行动

在 `RecommendationEngine.ts` 的 `getActionDefinition` 方法中添加新行动：

```typescript
new_action_id: {
  id: 'new_action_id',
  priority: 7,
  title: '行动标题',
  description: '行动描述',
  icon: 'icon_name',
  actionLabel: '按钮文字',
  route: { name: 'route_name' },
  estimatedMinutes: 5,
  category: 'setup'
}
```

### 3. 自定义推荐逻辑

可以基于更多数据源（如使用时长、活跃度等）优化推荐算法。

### 4. A/B测试

可以为不同用户群体展示不同的推荐策略，测试哪种更有效。

## 数据依赖

推荐系统依赖以下Store：
- `ipPoolStore` - IP资源池数据
- `nodeStore` - 设备数据
- `friendStore` - 好友数据
- `connectionStore` - 连接数据
- (待开发) `serviceStore` - 服务数据

## 性能考虑

1. **计算优化**: 使用 Vue 的 `computed` 自动缓存推荐结果
2. **按需刷新**: 只在数据变化时重新计算
3. **限制显示**: Dashboard 只显示前3个推荐，减少渲染开销

## 未来改进

1. ✅ **基础推荐系统**
2. ⏳ **服务管理集成** - 等服务功能开发完成
3. ⏳ **使用分析** - 记录用户点击了哪些推荐，优化算法
4. ⏳ **个性化学习** - 根据用户行为调整推荐权重
5. ⏳ **推荐历史** - 显示已完成的推荐
6. ⏳ **推荐通知** - 有重要推荐时弹出提醒
7. ⏳ **多语言支持** - 国际化推荐文案

## 测试场景

### 场景1: 新用户
- 期望: 推荐创建IP池

### 场景2: 有IP池无设备
- 期望: 推荐添加第一个设备

### 场景3: 单个设备
- 期望: 推荐添加更多设备或邀请好友

### 场景4: 有待审批请求
- 期望: 优先推荐处理待审批请求

### 场景5: 完整功能用户
- 期望: 推荐优化和监控功能

## 总结

智能推荐系统通过分析用户当前状态，提供个性化的下一步建议，帮助用户：
- 快速完成初始配置
- 发现更多功能
- 优化使用体验
- 提高用户活跃度和留存率

系统设计模块化，易于扩展和维护。
