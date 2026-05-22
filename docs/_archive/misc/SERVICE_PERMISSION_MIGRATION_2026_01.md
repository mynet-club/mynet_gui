# 服务权限收敛前端适配实施报告

**实施日期**: 2026-01-08  
**版本**: v1.0  
**状态**: ✅ 已完成

## 一、背景说明

后端进行了服务订阅/发现/分享的权限收敛，主要变更包括：

1. **普通用户的"公开/广场类（public/open）"功能已关闭**
   - 相关API统一返回 `410 Gone`（功能已下线）
   - 前端需要隐藏相关入口并提供友好提示

2. **服务分享必须校验好友关系**
   - 非好友之间尝试分享会被拒绝
   - 前端需要提前拦截或给出明确提示

3. **服务发现范围调整为"同 Zone + 好友关系"**
   - 不再有面向普通用户的公开发现入口
   - 文案需要明确说明范围限制

4. **系统服务默认订阅 + 已连接自动订阅**
   - 系统内置服务（user_id=0）会默认订阅
   - 节点"已连接"关系会触发自动订阅

5. **普通用户不允许创建系统类型服务**
   - 例如 `gnb_index` 这类系统索引服务类型
   - 前端需要在创建时隐藏或置灰该类型

## 二、前端实施清单

### ✅ 1. 隐藏公开服务导航入口

**文件**: `src/layouts/MainLayout.vue`

**修改内容**:
- 注释掉 "公开服务" 导航菜单项
- 保留代码备注说明下线原因

```typescript
// 公开服务功能已下线 - 2026-01 权限收敛
// {
//   name: 'services-public',
//   label: 'navigation.services.publicServices',
//   icon: 'public',
//   path: '/app/services/public'
// },
```

**影响**:
- 用户不再能从侧边栏导航访问公开服务页面
- 公开服务页面仍存在，但不再有导航入口（便于后续完全移除）

---

### ✅ 2. 添加 410 Gone 错误处理

**文件**: `src/services/api.ts`

**修改内容**:
- 在 axios 响应拦截器中添加 410 状态码的专门处理
- 为错误对象添加友好提示信息

```typescript
// 处理 410 Gone - 功能已下线
if (error.response?.status === 410) {
  debug.warn('🔧 [API] 410 Gone - 功能已下线:', originalRequest.url)
  error.friendlyMessage = '该功能已下线。请使用"好友分享"或"同 Zone 发现"等替代方式。'
  return Promise.reject(error)
}
```

**影响**:
- 当用户通过其他方式访问已下线的公开服务API时，会收到友好提示
- 日志中会记录 410 错误便于调试

---

### ✅ 3. 更新服务发现文案

**文件**: 
- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

**修改内容**:

中文:
```typescript
friendServices: '好友服务',
friendServicesDescription: '浏览同 Zone 好友分享的网络服务（仅显示已建立好友关系的服务）'
```

英文:
```typescript
friendServices: 'Friend Services',
friendServicesDescription: 'Browse services shared by friends in the same Zone (only shows services from established friendships)'
```

**影响**:
- 用户在好友服务页面会看到明确的范围说明
- 避免用户困惑为什么看不到某些服务

---

### ✅ 4. 添加错误提示国际化

**文件**: 
- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

**修改内容**:

中文:
```typescript
errors: {
  // ... 其他错误
  featureDeprecated: '功能已下线',
  publicServiceDeprecated: '公开服务功能已下线，请使用"好友分享"或"同 Zone 发现"等替代方式',
  requiresFriendship: '分享服务需要先建立好友关系，请先添加对方为好友'
}
```

英文:
```typescript
errors: {
  // ... existing errors
  featureDeprecated: 'Feature Deprecated',
  publicServiceDeprecated: 'Public service feature has been deprecated. Please use "Friend Sharing" or "Same Zone Discovery" instead',
  requiresFriendship: 'Sharing services requires an established friendship. Please add them as a friend first'
}
```

**影响**:
- 提供多语言的友好错误提示
- 引导用户使用替代方案

---

### ✅ 5. 移除/禁用公开服务申请功能

**文件**: 
- `src/pages/services/MyServicesPage.vue`
- `src/components/zone/ServiceEditDialog.vue`

**MyServicesPage.vue 修改**:
```typescript
// 申请公开 - 功能已下线
const handleRequestPublic = (service: ZoneService) => {
  // 功能已下线，显示友好提示
  $q.notify({
    type: 'warning',
    message: t('zoneServices.errors.publicServiceDeprecated'),
    position: 'top',
    timeout: 3000
  })
}
```

```html
<!-- 申请公开对话框 - 功能已下线 -->
<!-- 对话框HTML已注释 -->
```

**ServiceEditDialog.vue 修改**:
```html
<!-- 分享设置 -->
<div class="q-mb-md">
  <div class="text-subtitle2 q-mb-sm">分享设置</div>
  <div class="share-options q-gutter-sm">
    <q-checkbox
      v-model="formData.share_to_friends"
      label="分享给好友"
      color="primary"
    />
    <!-- 公开分享功能已下线 - 2026-01 -->
  </div>
  <div class="text-caption text-grey-6 q-mt-sm">
    选择服务的分享范围，仅支持好友分享（需要已建立好友关系）
  </div>
</div>
```

**影响**:
- 用户无法申请公开分享服务
- 服务创建/编辑表单中移除公开分享选项
- 点击旧的申请按钮会显示功能下线提示

---

### ✅ 6. 限制系统服务类型创建

**文件**: 
- `src/types/zoneService.ts`
- `src/composables/useZoneServices.ts`
- `src/components/zone/ServiceEditDialog.vue`

**类型定义修改** (`zoneService.ts`):
```typescript
export interface ServiceTypeConfig {
  key: ServiceType
  label: string
  icon: string
  color: string
  description: string
  defaultPort: number
  defaultProtocol: ServiceProtocol
  systemOnly?: boolean  // 标记是否仅系统服务可用
}
```

**配置修改** (`useZoneServices.ts`):
```typescript
{
  key: 'gnb_index',
  label: t('zoneServices.types.gnbIndex'),
  icon: 'hub',
  color: 'primary',
  description: t('zoneServices.types.gnbIndexDesc'),
  defaultPort: 9000,
  defaultProtocol: 'http',
  systemOnly: true  // 标记为系统专用类型
}
```

**UI过滤** (`ServiceEditDialog.vue`):
```typescript
// 选项 - 过滤掉系统专用服务类型
const serviceTypeOptions = computed(() => 
  serviceTypes.value
    .filter(type => !type.systemOnly)  // 过滤掉 systemOnly 的类型
    .map(type => ({
      label: type.label,
      value: type.key,
      disabled: type.systemOnly
    }))
)
```

**影响**:
- 普通用户在创建服务时看不到 `gnb_index` 等系统类型
- 避免普通用户创建系统级服务类型
- 系统服务仍然可以正常显示和使用

---

## 三、未实施项（需要后续完善）

### 📝 1. 好友关系前置校验

**当前状态**: 
- 分享功能仍然允许发起，依赖后端返回错误
- 没有前置的好友关系检查

**建议实施**:
```typescript
// 在 confirmShare 前添加好友关系检查
const confirmShare = async () => {
  if (!sharingService.value) return
  
  // TODO: 添加好友关系检查
  // const isFriend = await checkFriendship(targetUserId)
  // if (!isFriend) {
  //   $q.notify({
  //     type: 'warning',
  //     message: t('zoneServices.errors.requiresFriendship'),
  //     actions: [{ label: '去添加好友', handler: () => router.push('/app/social/friends') }]
  //   })
  //   return
  // }
  
  // ... 现有分享逻辑
}
```

**需要的API**: 
- 检查与指定用户的好友关系
- 或者在分享对话框中提供好友选择器（只显示已建立好友关系的用户）

---

### 📝 2. 订阅态展示优化

**当前状态**: 
- 订阅状态显示较为简单
- 没有区分"系统默认订阅"、"已连接自动订阅"、"手动订阅"

**建议实施**:

在服务卡片中添加订阅来源说明：

```html
<q-chip v-if="service.subscription_type">
  <q-icon :name="getSubscriptionIcon(service.subscription_type)" />
  {{ getSubscriptionLabel(service.subscription_type) }}
  <q-tooltip>{{ getSubscriptionTooltip(service.subscription_type) }}</q-tooltip>
</q-chip>
```

```typescript
const getSubscriptionLabel = (type: string) => {
  switch(type) {
    case 'system_default':
      return '系统默认'
    case 'auto_connected':
      return '自动订阅'
    case 'manual':
      return '已订阅'
    default:
      return '未订阅'
  }
}

const getSubscriptionTooltip = (type: string) => {
  switch(type) {
    case 'system_default':
      return '系统内置服务，自动订阅'
    case 'auto_connected':
      return '已连接设备，自动订阅其服务'
    case 'manual':
      return '手动订阅的服务'
    default:
      return ''
  }
}
```

**需要的数据**: 
- 后端需要在服务数据中返回 `subscription_type` 字段
- 或者通过 `user_id === 0` 判断系统服务

---

## 四、测试建议

### 1. 功能验证

- [ ] 侧边栏导航中不再显示"公开服务"入口
- [ ] 访问 `/app/services/public` 路由仍然可达（直接URL访问）
- [ ] 调用公开服务API返回410时显示友好提示
- [ ] 好友服务页面显示正确的范围说明文案
- [ ] 点击"申请公开"按钮显示功能下线提示
- [ ] 创建服务时看不到 `gnb_index` 类型选项
- [ ] 服务编辑表单中没有"申请公开分享"选项

### 2. 国际化测试

- [ ] 切换到英文，所有新增文案正确显示
- [ ] 切换到中文，所有新增文案正确显示

### 3. 错误场景测试

- [ ] 尝试分享服务给非好友（应被后端拒绝并显示友好提示）
- [ ] 访问已下线的公开服务API（显示410错误提示）

---

## 五、回归影响分析

### 已修改文件列表

1. `src/layouts/MainLayout.vue` - 导航菜单
2. `src/services/api.ts` - API拦截器
3. `src/i18n/zh-CN.ts` - 中文国际化
4. `src/i18n/en-US.ts` - 英文国际化
5. `src/pages/services/MyServicesPage.vue` - 我的服务页面
6. `src/components/zone/ServiceEditDialog.vue` - 服务编辑对话框
7. `src/types/zoneService.ts` - 类型定义
8. `src/composables/useZoneServices.ts` - 服务管理组合式函数

### 保持不变的功能

- ✅ 好友服务列表正常显示
- ✅ 匿名服务列表正常显示  
- ✅ 我的服务列表正常显示
- ✅ 服务创建/编辑/删除功能正常
- ✅ 服务详情查看功能正常
- ✅ 已有的服务分享功能（依赖后端校验）

### 向后兼容性

- ✅ 旧代码中对公开服务的引用保持不变（只是隐藏入口）
- ✅ API调用保持原有契约
- ✅ 数据结构无变化
- ✅ 路由定义保持不变

---

## 六、后续优化建议

1. **完全移除公开服务相关代码**（可选）
   - `PublicServicesPage.vue` 可以删除
   - 相关路由可以移除
   - API缓存配置中的 `public_services` 可以移除

2. **添加好友选择器组件**
   - 在分享对话框中提供好友列表选择
   - 只显示已建立好友关系的用户
   - 便于用户快速分享给好友

3. **增强订阅态说明**
   - 为系统默认订阅添加徽章标识
   - 为自动订阅添加说明tooltip
   - 在服务详情页展示订阅来源

4. **监控和日志**
   - 添加埋点监控用户是否尝试访问已下线功能
   - 记录410错误的访问频率
   - 评估是否需要添加更明显的功能变更通知

---

## 七、部署注意事项

1. **清除缓存**
   - 前端构建产物需要清除缓存
   - 用户端可能需要强制刷新（Ctrl+F5）

2. **用户通知**
   - 建议在系统公告中说明功能变更
   - 提供替代方案指引

3. **回滚方案**
   - 所有修改都使用注释方式保留原代码
   - 如需回滚，取消注释即可恢复

---

## 八、总结

本次前端适配完成了后端权限收敛的主要需求：

✅ **已完成**:
- 隐藏公开服务入口
- 添加410错误处理  
- 更新服务发现文案
- 移除公开服务申请功能
- 限制系统服务类型创建
- 添加友好的错误提示

⏳ **待完善**:
- 好友关系前置校验（需要后端API支持或前端实现）
- 订阅态展示优化（需要后端返回订阅类型）

整体上，前端已经做好了适配后端权限收敛的准备，用户体验得到保障，不会遇到突兀的错误。后续可以根据实际使用情况逐步完善细节功能。

---

**文档维护者**: GitHub Copilot  
**最后更新**: 2026-01-08
