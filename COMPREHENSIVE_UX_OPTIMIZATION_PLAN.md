# MyNet 全站 UX 优化统一规划

> 创建日期：2025-12-26  
> 规划范围：全站所有功能模块  
> 核心原则：轻松 / 明亮 / 统一 / 信息不松散

---

## 📊 功能模块全景图

基于项目结构扫描，识别出以下 **10 大功能模块**：

| 模块 | 页面数 | 组件数 | 优先级 | 说明 |
|------|--------|--------|--------|------|
| **Dashboard（仪表盘）** | 1 | 4 | P0 | 系统首页，用户入口 |
| **Node（节点管理）** | 3 + 4编辑 | 8 | P0 | 核心功能，技术属性最重 |
| **Route（路由管理）** | 6 | 10+ | P0 | 核心功能，连接节点 |
| **Social（社交）** | 3 | 5 | P1 | 好友管理，社交化体验 |
| **Services（服务）** | 5 | 3 | P1 | 服务发现与共享 |
| **IPPool（IP池）** | 1 | 2 | P2 | 技术性管理功能 |
| **Zone（区域）** | 2 | 1 | P2 | 高级管理功能 |
| **User（用户）** | 1 | 2 | P1 | 个人资料，头像管理 |
| **Help（帮助）** | 2 | 0 | P3 | 文档页面 |
| **Auth（认证）** | 2 | 0 | P3 | 登录/注册 |

---

## 🎯 全站统一UX原则

### 1. 信息层次（三级制度）

**所有页面和组件统一遵循：**

```
┌─────────────────────────────────────┐
│ 🔴 主信息层（Primary）              │
│ - 用户最关心的核心信息              │
│ - 大字号、高对比度、显眼位置        │
│ - 示例：节点名称、状态、好友名称    │
├─────────────────────────────────────┤
│ 🟡 次要信息层（Secondary）          │
│ - 辅助决策的重要信息                │
│ - 中字号、中对比度、紧跟主信息      │
│ - 示例：地理位置、最后在线时间      │
├─────────────────────────────────────┤
│ ⚪ 技术信息层（Technical）          │
│ - 专业用户需要的技术参数            │
│ - 小字号、低对比度、默认折叠        │
│ - 示例：IP地址、端口、VPN类型       │
└─────────────────────────────────────┘
```

**实施方式：**
- 主信息：`text-h6` / `text-subtitle1` / 高对比色
- 次要信息：`text-body2` / `text-caption` / 中对比色
- 技术信息：`q-expansion-item` 折叠 / `text-caption` / 低对比色

---

### 2. 状态语义统一（三色系统）

**全站状态映射标准：**

| 原始状态 | 用户感知 | 颜色 | 图标 | 文案 |
|----------|----------|------|------|------|
| ONLINE (2) | 🟢 可用 | positive (绿) | wifi | 在线 |
| ENABLED (1) | 🟡 待连接 | warning (橙) | schedule | 待连接 |
| MAINTENANCE (99) | ⚪ 不可用 | grey | build | 不可用（维护中） |
| DISABLED (0) | ⚪ 不可用 | grey | block | 不可用（已禁用） |
| UNCONFIGURED (-1) | ⚪ 不可用 | grey | settings | 不可用（未配置） |

**实施策略：**
1. 创建全局 `StatusDisplay.vue` 组件
2. 创建全局 `statusMapping.ts` 工具函数
3. 所有模块统一使用，禁止自定义状态展示逻辑

---

### 3. 操作按钮简化（1+N模式）

**所有卡片/列表项统一规则：**

```vue
<!-- ✅ 正确示例 -->
<q-card-actions>
  <!-- 主操作：最多1个，根据状态智能切换 -->
  <q-btn unelevated color="primary" label="连接" />
  
  <!-- 更多操作：统一收纳到菜单 -->
  <q-btn flat dense round icon="more_vert">
    <q-menu>
      <q-item>查看详情</q-item>
      <q-item>编辑</q-item>
      <q-item>删除</q-item>
    </q-menu>
  </q-btn>
</q-card-actions>

<!-- ❌ 错误示例：3-5个并排按钮 -->
<q-card-actions>
  <q-btn>连接</q-btn>
  <q-btn>查看</q-btn>
  <q-btn>编辑</q-btn>
  <q-btn>删除</q-btn>
  <q-btn>配置</q-btn>
</q-card-actions>
```

**主操作判定规则：**
- 节点：在线→连接 | 离线→启用 | 未配置→配置
- 路由：活跃→查看详情 | 未连接→连接
- 好友：未添加→添加好友 | 已添加→发送消息
- 服务：未订阅→订阅 | 已订阅→访问

---

### 4. 社交化元素（好友优先）

**涉及多方协作的功能，必须体现"人"的存在：**

```vue
<!-- 好友节点卡片 -->
<q-card>
  <!-- 节点信息（技术） -->
  <q-card-section>
    <h3>herenet北京</h3>
    <StatusDisplay status="2" />
  </q-card-section>
  
  <!-- 好友信息（社交）- 必须在底部显示 -->
  <q-card-section class="friend-info">
    <q-avatar :src="friendAvatar" />
    <span>{{ friendName }}</span>
    <span v-if="!friendAvatar" class="hint">建议完善头像</span>
  </q-card-section>
</q-card>
```

**适用场景：**
- 好友节点列表
- 路由创建流程
- 服务共享列表
- 区域分享页面

---

## 📁 各模块优化详细规划

### Module 1: Dashboard（仪表盘）✅ 已优化

**现状：**
- ✅ 卡片样式统一
- ✅ 活动监控系统
- ✅ 柔和主题应用

**待优化（增强）：**
- [ ] 健康摘要简化（移除系统介绍文字）
- [ ] 统计卡片精简（只保留4个核心指标）
- [ ] 快速操作优先级排序

**优化时间：** 0.5天

---

### Module 2: Node（节点管理）⚠️ 需重点优化

#### 2.1 节点列表页（NodeListPage.vue）

**当前问题：**
```vue
<!-- 现状：技术信息过多 -->
<q-card-section>
  <div>节点名称：herenet北京</div>
  <div>VPN类型：gnb</div>
  <div>IP地址：10.144.144.1</div>
  <div>端口：40000</div>
  <div>节点类型：边缘节点</div>
  <div>状态：ENABLED（启用但离线）</div>
  <div>最后在线：2小时前</div>
</q-card-section>
<q-card-actions>
  <q-btn>查看</q-btn>
  <q-btn>编辑</q-btn>
  <q-btn>启用</q-btn>
  <q-btn>禁用</q-btn>
  <q-btn>配置</q-btn>
</q-card-actions>
```

**优化方案：**
```vue
<!-- 优化后：信息分层+操作简化 -->
<q-card-section>
  <!-- 主信息层 -->
  <div class="primary-info">
    <h3>herenet北京</h3>
    <StatusDisplay :status="node.status" show-detail />
  </div>
  
  <!-- 次要信息层 -->
  <div class="secondary-info">
    <span>最后在线: 2小时前</span>
  </div>
  
  <!-- 技术信息层（默认折叠）-->
  <q-expansion-item dense label="技术详情" icon="code">
    <div class="technical-info">
      <div>VPN: gnb</div>
      <div>IP: 10.144.144.1</div>
      <div>端口: 40000</div>
      <div>类型: 边缘节点</div>
    </div>
  </q-expansion-item>
</q-card-section>

<q-card-actions>
  <!-- 主操作：智能判定 -->
  <q-btn v-if="isOnline" color="positive" label="管理" />
  <q-btn v-else-if="isEnabled" color="warning" label="等待上线" disabled />
  <q-btn v-else color="primary" label="启用" />
  
  <!-- 更多操作 -->
  <q-btn flat round icon="more_vert">
    <q-menu>
      <q-item>查看详情</q-item>
      <q-item>编辑配置</q-item>
      <q-item>启用/禁用</q-item>
      <q-item>删除节点</q-item>
    </q-menu>
  </q-btn>
</q-card-actions>
```

**修改文件：**
- `src/pages/node/NodeListPage.vue`
- `src/components/node/NodeCard.vue`（新建）

**优化时间：** 1天

---

#### 2.2 节点详情页（NodeDetailPage.vue）

**当前问题：**
- 所有信息平铺展示，无层次
- 技术参数占据大量屏幕空间
- 状态显示使用技术术语

**优化方案：**

```vue
<template>
  <div class="node-detail-page">
    <!-- 顶部：核心信息卡片 -->
    <q-card class="primary-card">
      <q-card-section>
        <div class="node-header">
          <h2>{{ node.node_name }}</h2>
          <StatusDisplay :status="node.status" show-detail />
        </div>
        <div class="node-meta">
          <span>最后在线: {{ formatLastSeen(node.last_seen) }}</span>
        </div>
      </q-card-section>
      
      <q-card-actions>
        <q-btn v-if="canConnect" color="positive" label="连接此节点" />
        <q-btn v-else-if="canEnable" color="warning" label="启用节点" />
        <q-btn flat label="编辑配置" />
      </q-card-actions>
    </q-card>
    
    <!-- 中部：关键统计 -->
    <div class="stats-grid">
      <q-card>
        <q-card-section>
          <div class="stat-value">{{ node.activeRoutes }}</div>
          <div class="stat-label">活跃路由</div>
        </q-card-section>
      </q-card>
      <q-card>
        <q-card-section>
          <div class="stat-value">{{ formatUptime(node.uptime) }}</div>
          <div class="stat-label">运行时长</div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- 底部：技术详情（Tabs组织）-->
    <q-card>
      <q-tabs v-model="activeTab">
        <q-tab name="network" label="网络配置" />
        <q-tab name="device" label="设备信息" />
        <q-tab name="services" label="索引服务" />
        <q-tab name="advanced" label="高级设置" />
      </q-tabs>
      
      <q-tab-panels v-model="activeTab">
        <!-- 各技术模块独立面板 -->
      </q-tab-panels>
    </q-card>
  </div>
</template>
```

**修改文件：**
- `src/pages/node/NodeDetailPage.vue`

**优化时间：** 1天

---

#### 2.3 节点编辑页（edit/ 系列）

**当前问题：**
- 4个编辑子页面，导航不清晰
- 表单字段缺少说明文字
- 高级选项无折叠

**优化方案：**
1. **步骤指示器**：清晰显示当前编辑的部分
2. **表单优化**：必填项高亮，可选项说明
3. **高级选项**：默认折叠，减少干扰

**修改文件：**
- `src/pages/node/edit/BasicInfoPage.vue`
- `src/pages/node/edit/NetworkConfigPage.vue`
- `src/pages/node/edit/NodeConfigPage.vue`
- `src/pages/node/edit/KeyManagementPage.vue`

**优化时间：** 0.5天

---

### Module 3: Route（路由管理）⚠️ 需重点优化

#### 3.1 路由列表页（RouteListPage.vue）

**优化要点：**
- 表格列简化（隐藏技术参数）
- 状态统一使用 `StatusDisplay`
- 主操作判定（活跃→查看详情 | 未连接→连接）

**修改文件：**
- `src/pages/route/RouteListPage.vue`

**优化时间：** 0.5天

---

#### 3.2 活跃路由页（ActiveRoutesPage.vue）

**当前架构：**
- ✅ 组件结构清晰（NodeListView → NodeRouteCardView/RouteListView）
- ✅ 卡片视图已优化
- ⚠️ 列表视图技术信息过多

**优化要点：**
- 列表视图应用信息分层原则
- 统一使用 NodeSummary 展示工具

**修改文件：**
- `src/components/route/RouteListView.vue`

**优化时间：** 0.5天

---

#### 3.3 好友节点页（FriendNodesPage.vue）✅ 已规划

**参考前面的实施计划：**
- 新建 `FriendNodeCard.vue` 组件
- 底部显示好友头像和名称
- 主操作按钮简化
- 场景信息智能解析

**优化时间：** 1天

---

#### 3.4 创建路由流程（Step1-4）

**当前问题：**
- 4步流程，用户容易迷失
- 节点选择卡片样式不统一
- 缺少进度指示

**优化方案：**
```vue
<!-- 添加步骤指示器 -->
<q-stepper v-model="step" animated>
  <q-step :name="1" title="选择好友" icon="person" />
  <q-step :name="2" title="选择好友节点" icon="router" />
  <q-step :name="3" title="选择我的节点" icon="devices" />
  <q-step :name="4" title="提交申请" icon="send" />
</q-stepper>

<!-- 统一卡片样式 -->
<FriendNodeCard 
  v-for="node in friendNodes" 
  :key="node.id"
  :node="node"
  :friend-name="friend.name"
  :friend-avatar="friend.avatar"
  @select="handleSelect"
/>
```

**修改文件：**
- `src/pages/route/create/Step1FriendSelection.vue`
- `src/pages/route/create/Step2FriendNodeSelection.vue`
- `src/pages/route/create/Step3MyNodeSelection.vue`
- `src/pages/route/create/Step4RequestForm.vue`
- `src/components/route/NodeSelectorCard.vue`（新建）

**优化时间：** 1天

---

### Module 4: Social（社交）⚠️ 需优化

#### 4.1 好友列表页（FriendsPage.vue）

**优化要点：**
- 好友卡片显示头像（鼓励完善）
- 好友状态（在线/离线）
- 节点数量统计

**修改文件：**
- `src/pages/social/FriendsPage.vue`
- `src/components/social/FriendCard.vue`（新建）

**优化时间：** 0.5天

---

#### 4.2 好友请求页（FriendRequestsPage.vue）

**优化要点：**
- 主操作：接受/拒绝
- 显示对方头像和基本信息

**修改文件：**
- `src/pages/social/FriendRequestsPage.vue`

**优化时间：** 0.5天

---

### Module 5: Services（服务）⚠️ 需优化

**5个子页面统一优化：**
- 服务卡片信息分层（名称、描述、技术参数）
- 主操作判定（未订阅→订阅 | 已订阅→访问）
- 所有者信息显示（社交化）

**修改文件：**
- `src/pages/services/ServiceListPage.vue`
- `src/pages/services/PublicServicesPage.vue`
- `src/pages/services/FriendServicesPage.vue`
- `src/pages/services/AnonymousServicesPage.vue`
- `src/pages/services/MyServicesPage.vue`
- `src/components/services/ServiceCard.vue`（新建）

**优化时间：** 1天

---

### Module 6: IPPool（IP池管理）

**优化要点：**
- 技术模块，保持简洁
- 状态显示统一
- 操作按钮简化

**修改文件：**
- `src/pages/ippool/IpPoolListPage.vue`

**优化时间：** 0.5天

---

### Module 7: Zone（区域管理）

**优化要点：**
- 区域分享信息分层
- 成员列表显示头像
- 权限信息默认折叠

**修改文件：**
- `src/pages/zone/ZoneListPage.vue`
- `src/pages/zone/ZoneSharingPage.vue`

**优化时间：** 0.5天

---

### Module 8: User（用户）⚠️ 需优化

#### 8.1 个人资料页（ProfilePageSimple.vue）

**优化要点：**
- 突出头像上传功能
- 如果无头像，显示醒目提示
- 简化设置项，常用功能优先

**修改文件：**
- `src/pages/user/ProfilePageSimple.vue`
- `src/components/social/AvatarReminder.vue`（新建）

**优化时间：** 0.5天

---

## 🧩 通用组件体系架构

### 核心设计理念：分层解耦

```
┌─────────────────────────────────────────────┐
│  ResponsiveCardGrid.vue (布局容器层)         │
│  ✅ 已存在 - 不需要重新创建                   │
│  职责：响应式网格、加载状态、空状态           │
└─────────────────────────────────────────────┘
                    ↓  提供插槽
┌─────────────────────────────────────────────┐
│  业务卡片组件 (内容设计层)                    │
│  ⚠️ 待创建 - 本次UX优化的核心                │
│  职责：信息层次、状态展示、操作简化           │
└─────────────────────────────────────────────┘
                    ↓  使用工具
┌─────────────────────────────────────────────┐
│  工具函数和通用组件 (基础设施层)              │
│  ⚠️ 待创建 - 提供统一的展示逻辑              │
│  职责：状态映射、场景解析、格式化             │
└─────────────────────────────────────────────┘
```

### 1. 布局容器（已完成 ✅）

**ResponsiveCardGrid.vue** - 全站统一布局容器
- **位置**: `src/components/common/ResponsiveCardGrid.vue`
- **状态**: ✅ 已存在，无需修改
- **文档**: [CARD_LAYOUT_GUIDE.md](docs/CARD_LAYOUT_GUIDE.md)
- **特性**:
  - 响应式网格（1/2/3/4列自适应）
  - 3种布局变体（standard / compact / spacious）
  - 4种间距（tight / normal / loose / xl）
  - 内置加载骨架屏和空状态
  - 支持选择和点击事件
- **已使用场景**:
  - DashboardStats (仪表盘统计)
  - NodeRouteCardView (节点路由)
  - IPPoolManager (IP池管理)
  - 等6处组件

### 2. 核心业务卡片组件（待创建 ⚠️）

> 这些组件作为 ResponsiveCardGrid 的 `#default` 插槽内容

| 组件名 | 路径 | 职责 | 使用方式 |
|--------|------|------|----------|
| `StatusDisplay.vue` | `src/components/common/` | 统一状态显示（三色系统） | 在所有卡片中直接使用 |
| `FriendNodeCardContent.vue` | `src/components/route/` | 好友节点卡片内容设计 | `<ResponsiveCardGrid><template #default="{ item }"><FriendNodeCardContent :node="item" /></template></ResponsiveCardGrid>` |
| `NodeCardContent.vue` | `src/components/node/` | 节点卡片内容设计 | 同上 |
| `FriendCardContent.vue` | `src/components/social/` | 好友卡片内容设计 | 同上 |
| `ServiceCardContent.vue` | `src/components/services/` | 服务卡片内容设计 | 同上 |
| `AvatarReminder.vue` | `src/components/social/` | 头像提醒横幅 | 独立组件，非卡片 |

**命名说明**：
- 原计划：`FriendNodeCard.vue`（暗示完整的卡片组件）
- 调整为：`FriendNodeCardContent.vue`（明确只是内容部分）
- 原因：避免与 ResponsiveCardGrid 的职责混淆

### 3. 工具函数和基础组件（待创建 ⚠️）

| 文件名 | 路径 | 功能 |
|--------|------|------|
| `statusMapping.ts` | `src/utils/` | 状态映射逻辑（三色系统） |
| `sceneParser.ts` | `src/utils/` | 场景信息智能解析 |
| `friendUtils.ts` | `src/utils/` | 好友相关工具函数 |

---

## 📐 组件使用模式（标准范式）

### 标准卡片页面结构

```vue
<template>
  <div class="page-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>节点管理</h2>
      <q-btn label="创建节点" />
    </div>
    
    <!-- 使用 ResponsiveCardGrid 作为布局容器 -->
    <ResponsiveCardGrid
      :items="nodes"
      :loading="loading"
      variant="standard"
      spacing="normal"
      empty-icon="router"
      empty-title="暂无节点"
      empty-description="请创建您的第一个节点"
      @card-click="handleNodeClick"
    >
      <!-- 卡片内容插槽 -->
      <template #default="{ item: node, index }">
        <NodeCardContent 
          :node="node"
          :show-actions="true"
          @connect="handleConnect"
          @edit="handleEdit"
        />
      </template>
      
      <!-- 空状态操作 -->
      <template #emptyAction>
        <q-btn color="primary" label="创建节点" @click="createNode" />
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import ResponsiveCardGrid from '@/components/common/ResponsiveCardGrid.vue'
import NodeCardContent from '@/components/node/NodeCardContent.vue'
// ... 逻辑代码
</script>
```

### ❌ 错误示例（不要这样做）

```vue
<!-- 错误1: 自己写网格布局 -->
<div class="row q-col-gutter-md">
  <div v-for="node in nodes" class="col-12 col-sm-6 col-md-4">
    <q-card>...</q-card>
  </div>
</div>

<!-- 错误2: 创建包含布局的完整卡片组件 -->
<NodeCard :node="node" />  <!-- NodeCard 内部又定义了 q-card -->

<!-- 错误3: 不使用 ResponsiveCardGrid -->
<div class="custom-grid">
  <NodeCardContent v-for="node in nodes" :key="node.id" :node="node" />
</div>
```

### ✅ 正确示例

```vue
<!-- 正确: 使用 ResponsiveCardGrid + 内容组件 -->
<ResponsiveCardGrid :items="nodes">
  <template #default="{ item }">
    <NodeCardContent :node="item" />
  </template>
</ResponsiveCardGrid>
```

---

## 📅 实施时间线（完整版）

### Phase 1: 基础设施（3天）

**Day 1-2: 核心组件和工具**
- [ ] 创建 `StatusDisplay.vue` 组件
- [ ] 创建 `statusMapping.ts` 工具
- [ ] 创建 `sceneParser.ts` 工具
- [ ] Dashboard 优化（健康摘要简化）

**Day 3: 通用卡片组件**
- [ ] 创建 `NodeCard.vue`
- [ ] 创建 `FriendCard.vue`
- [ ] 创建 `ServiceCard.vue`
- [ ] 创建 `AvatarReminder.vue`

---

### Phase 2: 核心模块优化（5天）

**Day 4-5: 节点管理模块**
- [ ] 节点列表页优化
- [ ] 节点详情页重构
- [ ] 节点编辑页优化

**Day 6-7: 路由管理模块**
- [ ] 路由列表页优化
- [ ] 活跃路由页优化
- [ ] 创建 `FriendNodeCard.vue`
- [ ] 好友节点页重构

**Day 8: 路由创建流程**
- [ ] Step1-4 统一优化
- [ ] 步骤指示器添加

---

### Phase 3: 社交与服务模块（3天）

**Day 9: 社交模块**
- [ ] 好友列表页优化
- [ ] 好友请求页优化
- [ ] 邀请页优化

**Day 10-11: 服务模块**
- [ ] 5个服务页面统一优化
- [ ] 服务卡片组件应用

---

### Phase 4: 管理模块（2天）

**Day 12: IP池 + 区域**
- [ ] IP池列表页优化
- [ ] 区域列表页优化
- [ ] 区域分享页优化

**Day 13: 用户模块**
- [ ] 个人资料页优化
- [ ] 头像提醒部署

---

### Phase 5: 全站验收（1天）

**Day 14: 测试与调整**
- [ ] 全站状态显示一致性检查
- [ ] 全站操作按钮一致性检查
- [ ] 信息层次一致性检查
- [ ] 性能测试
- [ ] 文档更新

---

## ✅ 验收标准（全站统一）

### 1. 状态显示

- [ ] 全站不再出现 "ENABLED"、"DISABLED" 等技术术语
- [ ] 所有状态统一使用三色系统
- [ ] 所有状态图标一致（🟢wifi / 🟡schedule / ⚪block）

### 2. 信息层次

- [ ] 所有卡片/列表项遵循三层信息结构
- [ ] 技术信息默认折叠（超过3项）
- [ ] 主信息字号 >= 16px，技术信息字号 <= 12px

### 3. 操作简化

- [ ] 所有卡片主操作 <= 1个
- [ ] 超过2个操作必须使用"更多"菜单
- [ ] 主操作根据状态智能变化

### 4. 社交化

- [ ] 所有涉及协作的功能显示对方头像
- [ ] 无头像用户看到提醒
- [ ] 好友信息在卡片底部显示

### 5. 性能

- [ ] 列表页首屏加载 < 2秒
- [ ] 详情页加载 < 1.5秒
- [ ] 卡片渲染流畅（60fps）

---

## 📊 后端需求汇总（优先级排序）

### P0 - 必须在Phase 1前完成

1. **状态字段规范化**
   - 确保所有API返回 `node_status` 为数字类型（-1, 0, 1, 2, 99）
   - 确保所有API返回 `link_status` 为数字类型（0, 1）

### P1 - 应在Phase 2前完成

2. **节点地理/场景信息**
   - 添加字段：`location`, `scene`, `device_type`, `tags`
   - API：`POST /api/v1/nodes`, `PUT /api/v1/nodes/{id}`

3. **用户头像管理**
   - API：`POST /api/v1/user/avatar`, `GET /api/v1/user/profile`, `DELETE /api/v1/user/avatar`
   - 返回字段：`avatar_url`

### P2 - 可在Phase 3前完成

4. **节点昵称字段**
   - 添加字段：`node_alias`
   - 显示优先级：`node_alias` > `node_name`

5. **好友在线状态**
   - API：`GET /api/v1/friends` 返回好友最后在线时间
   - 添加字段：`last_seen`, `online_status`

### P3 - Phase 4前完成

6. **服务所有者信息**
   - API：`GET /api/v1/services` 返回服务所有者信息
   - 添加字段：`owner_name`, `owner_avatar`

---

## 🎯 成功指标

### 定量指标

| 指标 | 当前 | 目标 | 提升 |
|------|------|------|------|
| Dashboard 首屏加载 | 3.5s | < 2s | 42% ↓ |
| 节点列表加载 | 4.2s | < 2.5s | 40% ↓ |
| 路由创建完成率 | 65% | > 85% | 31% ↑ |
| 技术信息默认可见 | 100% | < 30% | 70% ↓ |
| 单卡片操作按钮数 | 4-6个 | 1-2个 | 67% ↓ |

### 定性指标

- [ ] 新用户 **5秒内** 理解系统状态
- [ ] 非技术用户无需查看文档即可完成连接
- [ ] 页面滚动无压迫感
- [ ] 用户能识别出"好友"的存在
- [ ] 技术参数不干扰普通用户

---

## 📝 实施注意事项

### 1. 向后兼容

- ✅ 保持所有API响应格式
- ✅ 新字段为可选字段
- ✅ 旧数据仍可正常显示
- ✅ 不删除现有组件，创建新组件替换

### 2. 渐进式推出

**第一批上线（Phase 1-2）：**
- Dashboard
- 节点列表
- 路由列表

**第二批上线（Phase 3）：**
- 社交模块
- 服务模块

**第三批上线（Phase 4-5）：**
- 管理模块
- 全站细节调整

### 3. 性能优化

- 使用虚拟滚动（长列表）
- 懒加载图片（头像、图标）
- 组件按需加载
- 缓存策略优化

### 4. 测试策略

**单元测试：**
- StatusDisplay 组件
- statusMapping 工具函数

**集成测试：**
- 路由创建完整流程
- 节点管理完整流程

**E2E测试：**
- 新用户首次使用体验
- 非技术用户创建连接

---

## 🚀 立即开始

**第一步：创建基础设施（工具函数和通用组件）**
```bash
# 1. 创建状态映射工具
touch src/utils/statusMapping.ts

# 2. 创建 StatusDisplay 组件
touch src/components/common/StatusDisplay.vue

# 3. 创建场景解析工具
touch src/utils/sceneParser.ts
```

**第二步：创建业务卡片内容组件**
```bash
# 节点相关
touch src/components/node/NodeCardContent.vue

# 路由相关
touch src/components/route/FriendNodeCardContent.vue

# 社交相关
touch src/components/social/FriendCardContent.vue
touch src/components/social/AvatarReminder.vue

# 服务相关
touch src/components/services/ServiceCardContent.vue
```

**第三步：逐页面应用**
```vue
<!-- 典型改造流程 -->

<!-- Before: 自定义布局 -->
<div class="row q-col-gutter-md">
  <div v-for="node in nodes" class="col-12 col-sm-6 col-md-4">
    <q-card>
      <!-- 大量重复的卡片代码 -->
    </q-card>
  </div>
</div>

<!-- After: 使用统一体系 -->
<ResponsiveCardGrid :items="nodes">
  <template #default="{ item }">
    <NodeCardContent :node="item" />
  </template>
</ResponsiveCardGrid>
```

**第四步：逐模块提交**
- 每完成一个模块提交一次
- 提交信息遵循规范

---

## 📚 参考文档

- [柔和主题指南](SOFT_THEME_GUIDE.md)
- [Dashboard UX 改进实施](DASHBOARD_UX_IMPROVEMENT_IMPLEMENTATION.md)
- [NodeSummary 统一认知模型](docs/NODE_SUMMARY_ARCHITECTURE.md)
- [活跃路由组件结构](docs/ACTIVE_ROUTES_COMPONENT_STRUCTURE.md)

---

**准备好了吗？让我们从 Phase 1 开始！** 🎉
