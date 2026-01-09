# MyNet 产品优化技术实施方案

> 基于产品优化方案和Tips系统设计的完整技术实施计划
> 创建时间: 2026-01-06

---

## 📋 目录

1. [技术评审](#技术评审)
2. [架构设计](#架构设计)
3. [任务分解](#任务分解)
4. [实施计划](#实施计划)
5. [风险评估](#风险评估)
6. [验收标准](#验收标准)

---

## 🔍 技术评审

### 现有技术栈

**前端**:
- ✅ Vue 3.4+ (Composition API)
- ✅ Quasar 2.x (UI框架)
- ✅ Pinia (状态管理)
- ✅ Vue Router 4.x
- ✅ TypeScript 5.3+
- ✅ Vite 5.0+

**已有组件和工具**:
- ✅ `src/stores/auth.ts` - 用户认证状态
- ✅ `src/composables/` - 组合式函数
- ✅ `src/layouts/MainLayout.vue` - 主布局
- ✅ `src/router/routes.ts` - 路由配置
- ✅ LocalStorage - 本地存储

### 技术可行性评估

#### 1. Tips系统架构 ✅ 可行

**优势**:
- Pinia已集成，可直接用于状态管理
- Vue 3 Composition API适合模块化设计
- Quasar提供丰富的对话框和通知组件

**挑战**:
- 需要实现高亮遮罩层（Spotlight）
- 需要精确定位Tips气泡
- 需要处理路由变化时的Tips显示逻辑

**解决方案**:
- 使用 Teleport + fixed定位实现遮罩
- 使用 getBoundingClientRect() 计算目标位置
- 使用 Router beforeEach hook 监听路由变化

#### 2. 产品页面重构 ✅ 可行

**优势**:
- 现有页面结构清晰，易于重构
- 组件化设计，修改影响范围可控

**挑战**:
- Dashboard重构影响范围大
- 导航结构调整需要同步更新路由和i18n

**解决方案**:
- 创建新的Dashboard组件，逐步迁移
- 使用Feature Flag控制新旧版本切换
- 分阶段上线，降低风险

#### 3. 数据同步和状态管理 ⚠️ 需注意

**挑战**:
- 引导状态需要跨设备同步
- 用户可能在多个设备同时使用

**解决方案**:
- 引导状态优先使用LocalStorage
- 关键节点同步到服务器（可选）
- 使用版本号处理状态冲突

---

## 🏗️ 架构设计

### Tips系统架构

```
src/
├── stores/
│   └── onboarding.ts              # 引导状态管理
├── composables/
│   └── useTips.ts                 # Tips逻辑封装
├── services/
│   └── tips/
│       ├── TipsEngine.ts          # 核心引擎
│       ├── TipsConfig.ts          # Tips配置
│       └── TipsRegistry.ts        # Tips注册表
├── components/
│   └── tips/
│       ├── TipsContainer.vue      # 全局容器
│       ├── WelcomeModal.vue       # 欢迎弹窗
│       ├── SpotlightGuide.vue     # 高亮引导
│       ├── TooltipTip.vue         # 工具提示
│       └── CardTip.vue            # 卡片提示
└── types/
    └── tips.ts                    # 类型定义
```

### 状态管理架构

```typescript
// stores/onboarding.ts
interface OnboardingState {
  userId: string
  version: string
  completed: boolean
  currentStage: number
  
  stages: {
    welcome_shown: boolean
    first_ippool_created: boolean
    first_device_added: boolean
    // 路径A
    second_device_added: boolean
    auto_connection_understood: boolean
    // 路径B
    inviter_friend_added: boolean
    inviter_devices_viewed: boolean
    // 通用
    cross_user_connection_established: boolean
    connection_management_shown: boolean
  }
  
  preferences: {
    skipAll: boolean
    autoProgress: boolean
  }
}
```

### 页面重构架构

```
src/pages/
├── dashboard/
│   ├── DashboardPage.vue          # 重构为连接概览
│   └── components/
│       ├── ConnectionOverview.vue # 连接状态摘要
│       ├── ActiveConnections.vue  # 活跃连接列表
│       └── QuickActions.vue       # 快速操作
├── connections/
│   ├── ConnectionsPage.vue        # 新增：连接管理
│   ├── ConnectionDetail.vue       # 连接详情
│   └── ConnectionRequests.vue     # 连接请求
├── devices/
│   └── DeviceListPage.vue         # 优化：从节点到设备
├── friends/
│   ├── FriendsPage.vue            # 好友列表
│   ├── FriendsDevices.vue         # 好友的设备
│   └── InviteFriend.vue           # 邀请好友
└── auth/
    ├── RegisterPage.vue           # 优化注册流程
    └── LoginPage.vue              # 优化登录
```

---

## 📦 任务分解

### Phase 1: Tips系统基础架构 (Week 1-2)

#### 1.1 状态管理 (3天)
- [ ] 创建 `stores/onboarding.ts`
- [ ] 实现状态持久化（LocalStorage）
- [ ] 实现状态getter和actions
- [ ] 编写单元测试

**文件清单**:
```
src/stores/onboarding.ts
src/types/tips.ts
tests/unit/stores/onboarding.spec.ts
```

#### 1.2 核心引擎 (4天)
- [ ] 创建 `TipsEngine.ts` 核心类
- [ ] 实现Tips注册和触发机制
- [ ] 实现路由监听和条件判断
- [ ] 实现Tips优先级队列

**文件清单**:
```
src/services/tips/TipsEngine.ts
src/services/tips/TipsRegistry.ts
src/services/tips/TipsConfig.ts
```

#### 1.3 基础UI组件 (3天)
- [ ] 创建 `TipsContainer.vue` 全局容器
- [ ] 实现 `WelcomeModal.vue` 欢迎弹窗
- [ ] 实现遮罩层和动画效果
- [ ] 响应式适配（桌面/移动端）

**文件清单**:
```
src/components/tips/TipsContainer.vue
src/components/tips/WelcomeModal.vue
src/styles/tips.scss
```

**验收标准**:
- ✅ 欢迎弹窗能正常显示和关闭
- ✅ 状态能正确保存和恢复
- ✅ 移动端和桌面端显示正常

---

### Phase 2: 引导流程实现 (Week 3-4)

#### 2.1 高亮引导组件 (4天)
- [ ] 实现 `SpotlightGuide.vue` 组件
- [ ] 实现遮罩层高亮效果
- [ ] 实现Tips气泡定位算法
- [ ] 实现箭头指向动画

**技术要点**:
```typescript
// 计算目标元素位置
const calculatePosition = (target: HTMLElement) => {
  const rect = target.getBoundingClientRect()
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  // 确定Tips最佳位置（上下左右）
  const position = determineBestPosition(rect, viewport)
  
  return {
    top: rect.top + rect.height + 10,
    left: rect.left + rect.width / 2,
    placement: position
  }
}
```

#### 2.2 阶段0-2：基础引导 (3天)
- [ ] 实现欢迎引导（阶段0）
- [ ] 实现资源池创建引导（阶段1）
- [ ] 实现第一个设备添加引导（阶段2）
- [ ] 实现引导进度追踪

**Tips配置示例**:
```typescript
// 阶段1: 创建资源池
{
  id: 'create_ippool',
  stage: 1,
  type: 'spotlight',
  trigger: {
    route: '/app/advanced/ippools',
    condition: () => !onboardingStore.stages.first_ippool_created,
    once: true
  },
  display: {
    title: '💡 第一步: 创建IP资源池',
    content: '资源池为你的设备提供IP地址...',
    target: '[data-tip-target="create-ippool-btn"]',
    placement: 'bottom'
  }
}
```

#### 2.3 阶段3-5：双路径引导 (4天)
- [ ] 实现路径选择逻辑
- [ ] 实现路径A：第二设备添加引导
- [ ] 实现路径B：邀请人连接引导
- [ ] 实现路径切换和状态同步

**路径选择逻辑**:
```typescript
// 在第一个设备添加后显示选择
const showPathSelection = () => {
  const hasInviter = authStore.user?.inviter_id
  
  showTip({
    id: 'path_selection',
    actions: [
      {
        label: '添加第二个设备',
        handler: () => startPathA()
      },
      hasInviter && {
        label: '连接邀请人',
        handler: () => startPathB()
      }
    ]
  })
}
```

**验收标准**:
- ✅ 所有阶段Tips正确触发
- ✅ 路径选择逻辑正确
- ✅ 状态正确记录和更新

---

### Phase 3: 产品页面优化 (Week 5-6)

#### 3.1 Dashboard重构 (5天)

**任务列表**:
- [ ] 设计新的ConnectionOverview组件
- [ ] 实现连接状态摘要卡片
- [ ] 实现活跃连接列表
- [ ] 实现快速操作区
- [ ] 数据接口对接

**组件结构**:
```vue
<!-- DashboardPage.vue -->
<template>
  <PageLayout title="连接概览">
    <!-- Zone仅在顶部 -->
    <template #header-actions>
      <ZoneSwitcher />
      <q-btn label="退出此空间" @click="leaveZone" />
    </template>

    <!-- 连接状态摘要 -->
    <ConnectionOverview
      :stats="connectionStats"
      :devices="onlineDevices"
    />

    <!-- 活跃连接 -->
    <ActiveConnections
      :connections="activeConnections"
      @disconnect="handleDisconnect"
    />

    <!-- 快速操作 -->
    <QuickActions
      @add-device="showAddDevice"
      @view-friends="goToFriends"
    />

    <!-- 提醒 -->
    <Notifications :items="notifications" />
  </PageLayout>
</template>
```

**数据结构**:
```typescript
interface ConnectionStats {
  deviceCount: number      // 设备数
  connectionCount: number  // 连接数
  friendCount: number      // 好友数
  healthStatus: 'good' | 'fair' | 'poor'
}

interface ActiveConnection {
  id: string
  sourceDevice: Device
  targetDevice: Device
  type: 'auto' | 'cross-user'  // 自动连接 or 跨用户
  status: 'active' | 'paused'
  quality: {
    latency: number
    bandwidth: { upload: number, download: number }
  }
  canDisconnect: boolean  // 自己设备间不可断开
}
```

#### 3.2 导航栏重构 (2天)

**任务列表**:
- [ ] 更新 `MainLayout.vue` 导航结构
- [ ] 更新路由配置
- [ ] 更新i18n翻译
- [ ] 调整图标和排序

**新导航结构**:
```typescript
const navigationItems = [
  {
    name: 'overview',
    label: 'navigation.overview',
    icon: 'dashboard',
    path: '/app/dashboard'
  },
  {
    name: 'connections',
    label: 'navigation.connections',
    icon: 'link',
    path: '/app/connections',
    children: [
      { name: 'active', label: '活跃连接', path: '/app/connections' },
      { name: 'requests', label: '连接请求', path: '/app/connections/requests' }
    ]
  },
  {
    name: 'devices',
    label: 'navigation.devices',
    icon: 'devices',
    path: '/app/devices'
  },
  {
    name: 'friends',
    label: 'navigation.friends',
    icon: 'people',
    path: '/app/friends',
    children: [
      { name: 'list', label: '好友列表', path: '/app/friends' },
      { name: 'devices', label: '好友的设备', path: '/app/friends/devices' },
      { name: 'invite', label: '邀请好友', path: '/app/friends/invite' }
    ]
  },
  {
    name: 'resources',
    label: 'navigation.resources',
    icon: 'folder_shared',
    path: '/app/resources'
  },
  // IP池移到高级功能
  {
    name: 'advanced',
    label: 'navigation.advanced',
    icon: 'settings',
    children: [
      { name: 'ippools', label: 'IP资源池', path: '/app/advanced/ippools' }
    ]
  }
]
```

#### 3.3 连接管理页面 (3天)

**新页面**:
- [ ] `ConnectionsPage.vue` - 连接列表
- [ ] `ConnectionDetail.vue` - 连接详情
- [ ] `ConnectionRequests.vue` - 连接请求

**ConnectionsPage.vue**:
```vue
<template>
  <PageLayout title="连接管理">
    <!-- 筛选 -->
    <q-tabs v-model="activeTab">
      <q-tab name="all" label="全部" />
      <q-tab name="active" label="活跃" />
      <q-tab name="requests" label="待批准" />
      <q-tab name="history" label="历史" />
    </q-tabs>

    <!-- 连接列表 -->
    <q-list>
      <ConnectionCard
        v-for="conn in filteredConnections"
        :key="conn.id"
        :connection="conn"
        @view="viewDetail"
        @disconnect="handleDisconnect"
        @approve="handleApprove"
        @reject="handleReject"
      />
    </q-list>
  </PageLayout>
</template>
```

#### 3.4 注册/登录优化 (2天)

**RegisterForm.vue 优化**:
- [ ] 调整文案为"加入MyNet"
- [ ] 根据邀请码显示Zone信息
- [ ] 简化表单字段
- [ ] 优化邀请码帮助提示

**关键改动**:
```vue
<template>
  <q-card class="auth-card">
    <div class="auth-header">
      <div class="auth-title">加入 MyNet</div>
      <div class="auth-subtitle" v-if="inviterInfo">
        通过 {{ inviterInfo.name }} 的邀请加入
      </div>
    </div>

    <q-form @submit="handleRegister">
      <!-- 邀请码 - 优先级最高 -->
      <q-input
        v-model="form.invitationCode"
        label="邀请码"
        :hint="inviterInfo ? `将加入 ${inviterInfo.zoneName}` : '从邀请人处获取'"
        @blur="checkInvitationCode"
      />
      
      <!-- 其他字段... -->
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
const checkInvitationCode = async (code: string) => {
  try {
    const info = await apiService.validateInvitation(code)
    inviterInfo.value = info
    // 显示将要加入的Zone信息
  } catch (error) {
    // 显示错误提示
  }
}
</script>
```

**验收标准**:
- ✅ Dashboard正确显示连接概览
- ✅ 导航结构清晰，无死链
- ✅ 连接管理功能完整
- ✅ 注册流程体验优化

---

### Phase 4: 测试和迭代 (Week 7-8)

#### 4.1 单元测试 (3天)
- [ ] Tips引擎测试
- [ ] 状态管理测试
- [ ] 组件测试
- [ ] 覆盖率 >80%

#### 4.2 集成测试 (3天)
- [ ] 完整引导流程测试
- [ ] 路径切换测试
- [ ] 状态同步测试
- [ ] 跨浏览器测试

#### 4.3 用户测试 (4天)
- [ ] 内部测试（5-10人）
- [ ] 收集反馈
- [ ] 数据分析
- [ ] 问题修复

#### 4.4 优化迭代 (4天)
- [ ] 性能优化
- [ ] 文案优化
- [ ] 动画优化
- [ ] Bug修复

---

## 📅 实施计划

### 时间线 (8周)

```
Week 1-2: Phase 1 - Tips系统基础
├─ Week 1
│  ├─ Day 1-3: 状态管理
│  ├─ Day 4-5: 核心引擎 (Part 1)
│
├─ Week 2
│  ├─ Day 1-2: 核心引擎 (Part 2)
│  ├─ Day 3-5: 基础UI组件

Week 3-4: Phase 2 - 引导流程
├─ Week 3
│  ├─ Day 1-4: 高亮引导组件
│  ├─ Day 5: 阶段0-1引导
│
├─ Week 4
│  ├─ Day 1-2: 阶段2引导
│  ├─ Day 3-5: 双路径引导

Week 5-6: Phase 3 - 产品优化
├─ Week 5
│  ├─ Day 1-5: Dashboard重构
│
├─ Week 6
│  ├─ Day 1-2: 导航栏重构
│  ├─ Day 3-5: 连接管理页面

Week 7-8: Phase 4 - 测试迭代
├─ Week 7
│  ├─ Day 1-3: 单元+集成测试
│  ├─ Day 4-5: 用户测试准备
│
├─ Week 8
│  ├─ Day 1-2: 用户测试
│  ├─ Day 3-5: 优化迭代
```

### 里程碑

- **M1 (Week 2末)**: Tips系统基础完成，欢迎弹窗可用
- **M2 (Week 4末)**: 完整引导流程可走通
- **M3 (Week 6末)**: 产品页面优化完成
- **M4 (Week 8末)**: 测试通过，准备上线

---

## ⚠️ 风险评估

### 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 高亮定位不准确 | 高 | 中 | 提前做原型验证，准备降级方案 |
| 状态同步冲突 | 中 | 低 | 使用版本号，优先本地存储 |
| 性能问题 | 中 | 低 | 懒加载，虚拟滚动 |
| 浏览器兼容性 | 低 | 低 | 测试主流浏览器，提供降级 |

### 产品风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 用户跳过引导 | 高 | 高 | 设计吸引人的引导，可重新触发 |
| 引导流程过长 | 中 | 中 | 允许跳过，分段引导 |
| 文案不清晰 | 中 | 中 | 多轮用户测试，迭代文案 |
| 移动端体验差 | 中 | 低 | 响应式设计，独立测试 |

### 进度风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 人力不足 | 高 | 中 | 优先核心功能，分阶段上线 |
| 技术难度超预期 | 中 | 低 | 预留buffer时间，准备B方案 |
| 需求变更 | 中 | 中 | 冻结核心需求，次要功能可延后 |

---

## ✅ 验收标准

### 功能验收

#### Tips系统
- [ ] 欢迎弹窗正确显示
- [ ] 高亮引导准确定位
- [ ] 所有阶段Tips正确触发
- [ ] 状态正确保存和恢复
- [ ] 双路径选择逻辑正确
- [ ] 可以跳过和重置引导
- [ ] 移动端显示正常

#### 产品页面
- [ ] Dashboard展示连接概览
- [ ] 导航结构符合设计
- [ ] 连接管理功能完整
- [ ] 注册流程体验优化
- [ ] Zone透明化处理正确
- [ ] 所有链接可点击，无404

### 性能验收
- [ ] 首次加载 <3s
- [ ] Tips显示延迟 <500ms
- [ ] 路由切换流畅
- [ ] 内存占用合理
- [ ] 无明显卡顿

### 质量验收
- [ ] 单元测试覆盖率 >80%
- [ ] 无Critical Bug
- [ ] 主流浏览器兼容
- [ ] 响应式适配完成
- [ ] 代码Review通过

### 用户验收
- [ ] 引导完成率 >70%
- [ ] 平均完成时间 <10分钟
- [ ] 用户满意度 >4.0/5.0
- [ ] 跳过率 <30%

---

## 🚀 下一步行动

### 立即开始

1. **创建开发分支**
```bash
git checkout -b feature/product-optimization
git checkout -b feature/tips-system
```

2. **环境准备**
- [ ] 安装依赖（如有新增）
- [ ] 配置开发环境
- [ ] 准备测试数据

3. **开始开发**
- 从Phase 1开始
- 每日站会同步进度
- 及时更新任务状态

### 开发规范

**Commit规范**:
```
feat: 新功能
fix: 修复
refactor: 重构
style: 样式调整
docs: 文档更新
test: 测试相关
chore: 构建/工具相关
```

**PR规范**:
- 每个Phase一个PR
- 提供测试截图
- 说明改动影响范围
- 至少1人Review

---

## 📝 附录

### A. API需求

需要后端配合的接口：

```typescript
// 邀请码验证
GET /api/invitations/validate?code=xxx
Response: {
  valid: boolean,
  inviter: { id, name, zoneName },
  zone: { id, name }
}

// 引导状态同步（可选）
POST /api/user/onboarding-state
PUT /api/user/onboarding-state
GET /api/user/onboarding-state
```

### B. 数据库需求（可选）

如果需要服务器端存储引导状态：

```sql
CREATE TABLE user_onboarding (
  user_id INT PRIMARY KEY,
  state JSON,
  version VARCHAR(10),
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### C. 监控埋点

关键指标埋点：

```typescript
// 引导事件
trackEvent('onboarding_started')
trackEvent('onboarding_completed', { duration })
trackEvent('onboarding_skipped', { stage })
trackEvent('onboarding_path_selected', { path: 'A' | 'B' })

// 产品事件
trackEvent('device_added', { deviceType })
trackEvent('connection_established', { type: 'auto' | 'cross-user' })
trackEvent('friend_added')
```

---

**文档状态**: 实施方案 v1.0  
**负责人**: 开发团队  
**开始时间**: 2026-01-06  
**预计完成**: 2026-03-01 (8周)
