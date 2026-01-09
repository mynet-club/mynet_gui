# Tips 帮助系统使用指南

## ⚡ 快速解决：多个 Tips 轮流展示问题

### 问题
同一页面有多个 tips（Modal、Card、Spotlight）会轮流展示，造成干扰。

### 解决方案

#### 1. **优先级系统**（已实现）
```typescript
{
  priority: 100,  // Modal: 100, Spotlight: 50, Card: 10
}
```
- 数字越大优先级越高
- 引擎按优先级排序，优先显示高优先级 tips

#### 2. **分组机制**（新增）⭐
```typescript
{
  group: 'dashboard',  // 同一分组只显示一个 tip
}
```
- 同一 `group` 只会显示优先级最高的一个 tip
- 避免同一页面多个 tips 叠加

#### 3. **并发控制**
```typescript
{
  maxConcurrent: 1  // 同时最多显示 1 个 tip
}
```

### 最佳实践

#### 页面分组策略
```typescript
// Dashboard 页面
welcome tip: { group: 'dashboard', priority: 100 }
dashboard_overview: { group: 'dashboard', priority: 50 }
// 结果：只显示 welcome（优先级更高）

// IP池页面  
ippool_management: { group: 'ippools', priority: 50 }
create_ippool_spotlight: { group: 'ippools', priority: 70 }
// 结果：只显示 create_ippool_spotlight

// 设备列表页
node_list_help: { group: 'nodes', priority: 10 }
add_node_spotlight: { group: 'nodes', priority: 50 }
// 结果：只显示 add_node_spotlight
```

#### 优先级分配建议
| 类型 | 优先级范围 | 说明 |
|------|-----------|------|
| Modal | 80-100 | 首次欢迎、关键决策 |
| Spotlight | 40-70 | 功能引导、步骤提示 |
| Card | 10-30 | 页面帮助、操作说明 |
| Tooltip | 1-5 | 字段说明、快速提示 |

---

## 系统概述

MyNet 帮助系统包含 4 种 Tips 形态，每种都有明确的使用场景和设计原则。

## 四种 Tips 类型

### 1. Modal（模态对话框）
**文件**: `WelcomeModal.vue`

#### 使用场景
- **首次访问欢迎**：用户第一次进入系统
- **重要功能介绍**：需要用户完全聚焦的重要信息
- **路径选择**：引导用户选择体验路径（设备优先 vs 好友优先）

#### 特点
- ✅ 全屏遮罩，强制用户关注
- ✅ 内容丰富，可包含图片、视频
- ✅ 明确的操作按钮（继续、跳过）
- ❌ 打断性强，不可频繁使用

#### 设计原则
```typescript
{
  type: TipType.Modal,
  trigger: {
    route: '/',
    once: true,  // 只显示一次
    condition: () => !user.hasSeenWelcome
  },
  closable: true,
  skippable: true
}
```

#### 最佳实践
- 仅用于关键流程节点
- 每个用户生命周期最多 3-5 个 Modal
- 必须可关闭、可跳过
- 内容简洁，3-5 句话说清楚

---

### 2. Spotlight（聚光灯引导）
**文件**: `SpotlightGuide.vue`

#### 使用场景
- **功能高亮**：突出页面上的特定按钮或区域
- **步骤引导**：多步骤流程中的单步提示
- **新功能介绍**：版本更新后的功能说明

#### 特点
- ✅ 突出目标元素，模糊其他区域
- ✅ 引导用户注意力到具体位置
- ✅ 支持箭头、位置锚点
- ❌ 需要精确的 DOM 选择器

#### 设计原则
```typescript
{
  type: TipType.Spotlight,
  display: {
    target: '#create-node-button',  // CSS 选择器
    placement: TipPlacement.Bottom,
    title: '创建你的第一个设备',
    content: '点击此按钮开始创建设备'
  },
  trigger: {
    route: '/app/nodes',
    condition: () => nodeCount === 0
  }
}
```

#### 最佳实践
- 目标元素必须稳定存在
- 一次只高亮一个元素
- 配合用户操作流程设计
- 避免在动态内容上使用

---

### 3. Card（卡片提示）⭐ 推荐
**文件**: `CardTip.vue`

#### 使用场景
- **页面内帮助**：与内容相关的上下文提示
- **操作指引**：不打断用户的友好建议
- **功能说明**：页面功能的简要介绍

#### 特点
- ✅ 非侵入性，用户可选择查看
- ✅ 支持"不再显示"功能
- ✅ 视觉醒目但不强制
- ✅ 适合长期存在的帮助信息

#### 设计原则
```typescript
{
  type: TipType.Card,
  display: {
    title: '💡 操作提示',
    content: '这是关于当前页面的帮助信息...',
    class: 'dashboard-tip'
  },
  trigger: {
    route: '/app/dashboard',
    once: false,  // 可重复显示
    delay: 1000   // 延迟显示
  },
  closable: true,
  skippable: true
}
```

#### 最佳实践
- **优先使用** Card 而非 Modal
- 每个页面最多 1-2 个 Card
- 内容 3-5 行，不超过 150 字
- 必须包含"不再显示"选项
- 配色使用黄色系警示色（#FFFBEA 背景）

---

### 4. Tooltip（工具提示）
**文件**: `TooltipTip.vue`

#### 使用场景
- **快速提示**：鼠标悬停显示的简短说明
- **字段解释**：表单字段的额外信息
- **图标说明**：图标按钮的功能描述

#### 特点
- ✅ 轻量级，不占用页面空间
- ✅ 悬停即显示，离开即消失
- ✅ 适合简短的补充信息
- ❌ 不适合复杂内容

#### 设计原则
```typescript
{
  type: TipType.Tooltip,
  display: {
    target: '#help-icon',
    placement: TipPlacement.Top,
    content: '点击查看完整帮助文档'
  },
  trigger: {
    // Tooltip 通常由用户交互触发，不需要复杂触发条件
  }
}
```

#### 最佳实践
- 内容限制在 1-2 句话
- 使用简洁的文本，不包含 HTML
- 不要依赖 Tooltip 传递关键信息
- 配合原生 `q-tooltip` 使用

---

## 使用决策流程图

```
开始
  ↓
是否是首次访问或关键流程？
  ├─ 是 → 使用 Modal
  └─ 否
      ↓
    是否需要突出特定元素？
      ├─ 是 → 使用 Spotlight
      └─ 否
          ↓
        是否是页面级帮助信息？
          ├─ 是 → 使用 Card ⭐
          └─ 否
              ↓
            是否是简短的补充说明？
              ├─ 是 → 使用 Tooltip
              └─ 否 → 考虑使用独立帮助页面
```

## 系统平衡原则

### 1. **克制原则**（最重要）
- 每个页面最多 1 个主动触发的 Tips（Modal/Card）
- 整个引导流程不超过 8-10 个步骤
- 优先使用 Card，减少 Modal 使用

### 2. **渐进式原则**
```
第一次访问: Modal (欢迎) → Spotlight (关键按钮)
后续访问: Card (页面帮助) → Tooltip (细节说明)
```

### 3. **用户控制原则**
- 所有 Tips 必须可关闭
- 提供"跳过所有引导"选项
- "不再显示"状态存储在 localStorage
- 可通过头部帮助图标恢复隐藏的 Tips

### 4. **内容一致性**
所有 Tips 遵循统一的写作风格：
- ✅ 使用"你"而非"您"
- ✅ 简洁直接，动作导向
- ✅ 避免营销化语言
- ❌ 不使用"太棒了！""继续探索"等情绪化表达

### 5. **技术实现原则**
- 使用 `TipsStorage` 统一管理隐藏状态
- TipsEngine 在评估时先检查隐藏状态
- 避免多个 Tips 同时显示（maxConcurrent: 1）
- Card 使用固定容器，避免布局抖动

## 配置示例

### Dashboard 页面配置（推荐）
```typescript
// 首次访问 - Modal
{
  id: 'dashboard-welcome',
  type: TipType.Modal,
  trigger: {
    route: '/app/dashboard',
    once: true,
    condition: () => !user.hasSeenDashboard
  }
}

// 页面帮助 - Card
{
  id: 'dashboard-help',
  type: TipType.Card,
  trigger: {
    route: '/app/dashboard',
    delay: 2000
  },
  display: {
    title: '了解 Dashboard',
    content: '这里显示你的网络概览和最近活动...'
  }
}

// 不推荐：同时使用多个 Modal/Card
```

### 功能引导配置（Spotlight + Card）
```typescript
// 步骤 1: 突出按钮
{
  id: 'create-node-spotlight',
  type: TipType.Spotlight,
  trigger: {
    route: '/app/nodes',
    condition: () => nodes.length === 0
  },
  display: {
    target: '#create-button',
    title: '创建第一个设备'
  }
}

// 步骤 2: 页面说明
{
  id: 'node-list-help',
  type: TipType.Card,
  trigger: {
    route: '/app/nodes',
    condition: () => nodes.length > 0
  },
  display: {
    title: '设备列表说明',
    content: '已连接的设备会自动显示在这里...'
  }
}
```

## 常见问题

### Q: 什么时候用 Card，什么时候用 Modal？
**A**: 
- 默认使用 **Card**（90% 场景）
- 仅在以下情况使用 Modal：
  - 首次欢迎
  - 路径选择
  - 破坏性操作警告

### Q: 如何避免 Tips 过多干扰用户？
**A**:
1. 使用 `once: true` 限制显示次数
2. 添加 `delay` 延迟显示
3. 提供"不再显示"选项
4. 遵循每页最多 1 个主动 Tips 的原则

### Q: 用户隐藏后如何重新显示？
**A**:
点击头部帮助图标 → "恢复已隐藏的帮助" → 确认

### Q: 如何测试 Tips 系统？
**A**:
```javascript
// 开发环境控制台
$tips.reset()        // 重置所有状态
$tips.active()       // 查看活跃 Tips
$tips.status()       // 查看引导状态
TipsStorage.restoreAllTips()  // 恢复隐藏的 Tips
```

## 迁移建议

如果当前系统中存在过多 Modal，建议迁移：

```
Modal → Card
- 页面级帮助说明
- 功能介绍
- 操作指引

Modal → Spotlight
- 特定按钮引导
- 多步骤流程

保留 Modal
- 首次欢迎
- 关键决策点
```

## 总结

| 类型 | 优先级 | 使用频率 | 典型场景 |
|------|--------|----------|----------|
| **Card** | ⭐⭐⭐⭐⭐ | 高 | 页面帮助、操作指引 |
| **Tooltip** | ⭐⭐⭐⭐ | 中 | 字段说明、快速提示 |
| **Spotlight** | ⭐⭐⭐ | 低 | 功能高亮、步骤引导 |
| **Modal** | ⭐⭐ | 极低 | 首次欢迎、关键决策 |

**核心原则：优先 Card，慎用 Modal，克制设计，用户至上。**
