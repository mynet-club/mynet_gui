# 服务模块完善方案

**创建日期**: 2026-01-09  
**状态**: 📋 待实施

## 一、现状分析

### 🔍 已发现的问题

1. **匿名服务功能存在但定位不清**
   - 导航菜单中仍有"匿名服务"入口
   - 在新的权限模型下，匿名服务的定位不明确
   - 与"已连接设备自动共享"的概念有重叠

2. **申请公开服务功能残留**
   - ServiceCard 组件中没有 `@requestPublic` 事件定义
   - MyServicesPage 中仍在监听 `@requestPublic` 事件（会报错）
   - ZoneSharingPage 中还有完整的申请公开逻辑

3. **服务分类概念混乱**
   - public（公共）vs anonymous（匿名）概念不清晰
   - 在新权限模型下，服务应该只有：系统服务、好友服务、我的服务

4. **UI 层级不一致**
   - ServiceCard 组件功能简单，缺少分享、申请等操作
   - 不同页面对服务卡片的使用方式不统一

## 二、权限模型梳理

### ✅ 新的权限模型应该是

```
服务分类：
├── 公共服务 (Public Services)
│   ├── 系统服务 (user_id=0)
│   └── 已连接设备服务 (自动共享)
│
├── 好友服务 (Friend Services)
│   └── 同 Zone 好友分享的服务
│
└── 我的服务 (My Services)
    └── 用户自己创建的服务
```

### ⛔ 应该移除的概念

- **匿名服务（Anonymous Services）**
  - 在新模型下没有明确定位
  - 容易与"已连接设备服务"混淆
  - 增加用户理解成本

## 三、完善计划

### 阶段一：移除匿名服务功能

#### 1.1 移除导航菜单项
**文件**: `src/layouts/MainLayout.vue`

```typescript
// 移除这一段
{
  name: 'services-anonymous',
  label: 'navigation.services.anonymousServices',
  icon: 'visibility_off',
  path: '/app/services/anonymous'
}
```

#### 1.2 移除路由定义
**文件**: `src/router/routes.ts`

```typescript
// 移除或注释
{
  path: 'services/anonymous',
  name: 'services-anonymous',
  component: () => import('../pages/services/AnonymousServicesPage.vue'),
  meta: { title: '匿名服务', requiresAuth: true }
}
```

#### 1.3 移除服务分类配置
**文件**: `src/composables/useZoneServices.ts`

```typescript
// 移除 anonymousServices 状态
const anonymousServices = ref<ZoneService[]>([])

// 移除服务分类配置中的 anonymous
{
  key: 'anonymous',
  title: t('zoneServices.categories.anonymous'),
  icon: 'visibility_off',
  color: 'warning',
  description: t('zoneServices.categories.anonymousDesc')
}

// 移除 loadAllServices 中的匿名服务加载
zoneServiceApi.getAnonymousServices()
```

#### 1.4 移除 API 调用
**文件**: `src/services/zone/zoneServiceApi.ts`

```typescript
// 可以保留 API 方法但不在 UI 中使用
// 或者直接注释掉 getAnonymousServices
```

#### 1.5 更新服务概览页面
**文件**: `src/pages/services/ServiceListPage.vue`

```vue
<!-- 移除匿名服务统计卡片 -->
<div class="col-12 col-sm-6 col-md-3">
  <q-card class="overview-card">
    <q-card-section class="text-center">
      <q-icon name="visibility_off" size="2rem" color="warning" class="q-mb-sm" />
      <div class="text-h4 text-weight-bold text-warning">{{ anonymousServices.length }}</div>
      <div class="text-body2 text-grey-6">{{ $t('zoneServices.categories.anonymous') }}</div>
    </q-card-section>
  </q-card>
</div>
```

---

### 阶段二：清理申请公开服务功能

#### 2.1 修复 MyServicesPage 事件监听
**文件**: `src/pages/services/MyServicesPage.vue`

```vue
<!-- 移除 @requestPublic 事件监听 -->
<ServiceCard
  :service="item"
  category="my"
  @edit="handleEdit"
  @delete="handleDelete"
  @share="handleShare"
  <!-- 移除这行 -->
  @requestPublic="handleRequestPublic"
/>

<!-- 同时移除或保留（已注释）的申请公开对话框 -->
```

#### 2.2 完全移除 ZoneSharingPage 中的申请公开逻辑
**文件**: `src/pages/zone/ZoneSharingPage.vue`

需要检查并移除：
- 申请公开对话框 HTML
- handleRequestPublic 函数
- confirmApproval 函数
- approvalService 状态
- approvalReason 状态

---

### 阶段三：优化服务卡片组件

#### 3.1 统一服务卡片操作
**文件**: `src/components/zone/ServiceCard.vue`

当前问题：
- 缺少分享操作按钮
- 缺少更多操作菜单

建议增强：

```vue
<q-card-actions v-if="showActions" align="right" class="q-pa-md">
  <!-- 我的服务：显示管理操作 -->
  <template v-if="isMyService">
    <q-btn-dropdown
      flat
      size="sm"
      color="primary"
      icon="more_vert"
      dropdown-icon="none"
    >
      <q-list dense>
        <q-item clickable v-close-popup @click="$emit('edit', service)">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>编辑</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="$emit('share', service)">
          <q-item-section avatar>
            <q-icon name="share" />
          </q-item-section>
          <q-item-section>分享给好友</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item clickable v-close-popup @click="$emit('delete', service)">
          <q-item-section avatar>
            <q-icon name="delete" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">删除</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </template>

  <!-- 其他服务：显示连接操作 -->
  <template v-else>
    <!-- 保持现有逻辑 -->
  </template>
</q-card-actions>
```

更新事件定义：

```typescript
interface Emits {
  (e: 'edit', service: ZoneService): void
  (e: 'delete', service: ZoneService): void
  (e: 'share', service: ZoneService): void  // 添加分享事件
  (e: 'connect', service: ZoneService): void
  (e: 'details', service: ZoneService): void
}
```

---

### 阶段四：完善文案和提示

#### 4.1 更新国际化文案

**移除匿名服务相关**：
```typescript
// zh-CN.ts
navigation: {
  services: {
    // 移除 anonymousServices
    // 移除 anonymousServicesDescription
  }
}

zoneServices: {
  categories: {
    // 移除 anonymous 分类
  },
  empty: {
    // 移除 anonymousServices
    // 移除 anonymousServicesDesc
  }
}
```

**添加更清晰的说明**：
```typescript
// zh-CN.ts
zoneServices: {
  categories: {
    public: '公共服务',
    publicDesc: '系统提供的服务和已连接设备自动共享的服务',
    friend: '好友服务',
    friendDesc: '同 Zone 内已建立好友关系的用户分享的服务',
    my: '我的服务',
    myDesc: '你创建和管理的服务，可以分享给好友'
  },
  hints: {
    connectedDevicesAutoShare: '已连接的设备会自动共享服务到公共服务列表',
    friendShareOnly: '你可以将服务分享给同 Zone 内的好友',
    systemServicesReadOnly: '系统服务由管理员提供，无法编辑或删除'
  }
}
```

#### 4.2 添加服务来源标识

在公共服务列表中，区分服务来源：

```vue
<!-- ServiceCard.vue -->
<q-chip
  v-if="serviceSource"
  size="sm"
  :color="serviceSourceColor"
  :icon="serviceSourceIcon"
>
  {{ serviceSourceLabel }}
</q-chip>
```

```typescript
// 计算服务来源
const serviceSource = computed(() => {
  if (props.service.user_id === 0) {
    return 'system'
  } else if (props.service.is_connected_device) {
    return 'connected'
  }
  return null
})

const serviceSourceLabel = computed(() => {
  switch (serviceSource.value) {
    case 'system': return '系统服务'
    case 'connected': return '已连接设备'
    default: return ''
  }
})
```

---

### 阶段五：增强用户引导

#### 5.1 添加操作提示

**在服务概览页面添加提示卡片**：

```vue
<!-- ServiceListPage.vue -->
<q-banner class="bg-blue-1 q-mb-md" rounded>
  <template v-slot:avatar>
    <q-icon name="info" color="primary" />
  </template>
  <div class="text-body2">
    <strong>服务共享说明：</strong>
    <ul class="q-my-sm">
      <li>已连接的设备会自动共享服务，无需手动操作</li>
      <li>可以将服务分享给同 Zone 内的好友</li>
      <li>系统服务由管理员统一管理</li>
    </ul>
  </div>
</q-banner>
```

#### 5.2 优化空状态提示

```vue
<!-- PublicServicesPage.vue -->
<template #empty>
  <div class="text-center q-pa-xl">
    <q-icon name="public" size="4rem" color="grey-5" />
    <div class="text-h6 text-grey-7 q-mt-md">暂无公共服务</div>
    <div class="text-body2 text-grey-6 q-mt-sm">
      公共服务包括：
      <ul class="q-mt-sm text-left" style="max-width: 400px; margin: 0 auto;">
        <li>系统提供的基础服务</li>
        <li>已连接设备自动共享的服务</li>
      </ul>
    </div>
    <q-btn
      flat
      color="primary"
      label="查看我的设备"
      icon="devices"
      class="q-mt-md"
      @click="navigateToDevices"
    />
  </div>
</template>
```

---

### 阶段六：完善服务订阅态展示

#### 6.1 添加订阅状态说明

```vue
<!-- ServiceCard.vue -->
<div class="subscription-status">
  <q-chip
    v-if="subscriptionType"
    size="sm"
    :color="subscriptionColor"
    :icon="subscriptionIcon"
  >
    {{ subscriptionLabel }}
    <q-tooltip>{{ subscriptionTooltip }}</q-tooltip>
  </q-chip>
</div>
```

```typescript
const subscriptionType = computed(() => {
  // 系统服务默认订阅
  if (props.service.user_id === 0) {
    return 'system_default'
  }
  // 已连接设备自动订阅
  if (props.service.is_connected_device) {
    return 'auto_connected'
  }
  // 手动订阅
  if (props.service.is_subscribed) {
    return 'manual'
  }
  return null
})

const subscriptionLabel = computed(() => {
  switch (subscriptionType.value) {
    case 'system_default': return '系统默认'
    case 'auto_connected': return '自动订阅'
    case 'manual': return '已订阅'
    default: return '未订阅'
  }
})

const subscriptionTooltip = computed(() => {
  switch (subscriptionType.value) {
    case 'system_default': return '系统内置服务，默认订阅'
    case 'auto_connected': return '设备已连接，自动订阅其服务'
    case 'manual': return '手动订阅的服务'
    default: return '点击订阅以使用此服务'
  }
})
```

---

## 四、实施优先级

### 🔴 高优先级（必须完成）

1. **移除匿名服务功能**
   - 避免概念混淆
   - 简化用户理解

2. **修复 MyServicesPage 事件监听错误**
   - 避免运行时错误
   - 保证页面正常工作

3. **清理申请公开服务残留代码**
   - 保持代码整洁
   - 避免误导开发者

### 🟡 中优先级（建议完成）

4. **优化服务卡片组件**
   - 统一用户体验
   - 增强交互一致性

5. **完善文案和提示**
   - 帮助用户理解新权限模型
   - 减少困惑

### 🟢 低优先级（锦上添花）

6. **增强用户引导**
   - 优化空状态
   - 添加操作提示

7. **完善订阅态展示**
   - 明确订阅来源
   - 提供详细说明

---

## 五、测试清单

### 功能测试

- [ ] 导航菜单中不再显示"匿名服务"
- [ ] 服务概览页面只显示三个分类（公共、好友、我的）
- [ ] 公共服务页面正常显示系统服务
- [ ] 已连接设备的服务显示在公共服务列表
- [ ] 好友服务页面正常工作
- [ ] 我的服务页面操作正常（编辑、删除、分享）
- [ ] ServiceCard 组件操作按钮正常工作
- [ ] 没有控制台错误或警告

### UI/UX 测试

- [ ] 服务分类清晰易懂
- [ ] 文案准确无歧义
- [ ] 空状态提示友好
- [ ] 操作流程顺畅
- [ ] 错误提示清晰

### 兼容性测试

- [ ] 中英文切换正常
- [ ] 亮色/暗色主题正常
- [ ] 响应式布局正常
- [ ] 各浏览器显示一致

---

## 六、实施时间估算

- **阶段一**（移除匿名服务）: 2-3小时
- **阶段二**（清理申请公开）: 1-2小时  
- **阶段三**（优化服务卡片）: 2-3小时
- **阶段四**（完善文案）: 1-2小时
- **阶段五**（增强引导）: 2-3小时
- **阶段六**（订阅态展示）: 2-3小时

**总计**: 10-16小时（约2个工作日）

---

## 七、后续优化方向

1. **服务发现优化**
   - 按来源筛选（系统/已连接设备/好友）
   - 按类型筛选（音乐/视频/网桥等）
   - 搜索和排序功能

2. **服务监控**
   - 服务在线状态实时更新
   - 服务使用统计
   - 连接质量监控

3. **批量操作**
   - 批量订阅/取消订阅
   - 批量分享给多个好友
   - 批量删除服务

4. **高级功能**
   - 服务标签和分组
   - 服务访问权限细粒度控制
   - 服务使用日志

---

**文档维护者**: GitHub Copilot  
**创建日期**: 2026-01-09  
**状态**: 📋 待审核和实施
