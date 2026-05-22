# 服务权限调整前端适配报告

**实施日期**: 2026-01-08  
**版本**: v1.1 (修正版)  
**状态**: ✅ 已完成

## 一、正确的需求理解

### 核心变更

1. **公共服务保留** ✅
   - 公共服务导航和页面保留
   - 用于展示系统提供的服务（user_id=0）
   - 已连接设备的服务会自动出现在公共服务中

2. **限制普通用户发布公共服务** ⛔
   - 普通用户不能将自己的服务"申请公开"给陌生人
   - 只有系统可以发布公共服务
   - 后端会返回 410 Gone 拒绝普通用户的申请

3. **已连接设备自动共享** ✅
   - 已连接的设备之间服务自动可见
   - 无需手动申请或授权
   - 在公共服务列表中自动显示

4. **好友分享功能保留** ✅
   - 好友之间可以正常分享服务
   - 需要已建立好友关系
   - 同 Zone 内的好友优先

5. **系统服务类型限制** ⛔
   - 普通用户不能创建 gnb_index 等系统服务类型
   - 这些类型仅供系统内部使用

## 二、前端实施的修改

### ✅ 1. 保留公共服务导航和页面

**文件**: `src/layouts/MainLayout.vue`

**修改内容**: 
- **恢复**公共服务导航菜单项
- 保持用户可以访问公共服务页面

```typescript
{
  name: 'services-public',
  label: 'navigation.services.publicServices',
  icon: 'public',
  path: '/app/services/public'
}
```

**原因**: 
- 用户需要查看系统提供的公共服务
- 已连接设备的服务会自动显示在这里

---

### ✅ 2. 更新公共服务文案说明

**文件**: 
- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

**中文文案**:
```typescript
publicServices: '公共服务',
publicServicesDescription: '浏览系统提供的公共网络服务（已连接设备自动共享）'
```

**英文文案**:
```typescript
publicServices: 'Public Services',
publicServicesDescription: 'Browse public services provided by system (connected devices share automatically)'
```

**原因**: 
- 明确说明公共服务来源（系统 + 已连接设备）
- 避免用户误以为可以发布公共服务

---

### ✅ 3. 调整 410 错误提示信息

**文件**: `src/services/api.ts`

**修改内容**:
```typescript
// 处理 410 Gone - 普通用户申请公开服务功能已下线
if (error.response?.status === 410) {
  debug.warn('🔧 [API] 410 Gone - 普通用户不可发布公共服务:', originalRequest.url)
  error.friendlyMessage = '普通用户不能发布公共服务。公共服务仅限系统提供，已连接设备会自动共享服务。'
  return Promise.reject(error)
}
```

**原因**: 
- 当普通用户尝试申请公开服务时，后端返回 410
- 前端需要给出准确的错误说明和替代方案

---

### ✅ 4. 更新错误提示国际化

**文件**: 
- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

**中文**:
```typescript
publicServiceDeprecated: '普通用户不能发布公共服务，公共服务仅限系统提供。已连接设备会自动共享服务，好友间可使用"好友分享"功能。'
```

**英文**:
```typescript
publicServiceDeprecated: 'Regular users cannot publish public services. Public services are system-only. Connected devices share automatically, and you can use "Friend Sharing" for friends.'
```

**原因**: 
- 提供准确的多语言错误提示
- 说明替代方案（已连接设备自动共享 + 好友分享）

---

### ✅ 5. 禁用普通用户申请公开服务

**文件**: `src/pages/services/MyServicesPage.vue`

**修改内容**: 
```typescript
// 申请公开 - 功能已下线
const handleRequestPublic = (service: ZoneService) => {
  // 普通用户不能申请公开服务，显示友好提示
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
<!-- 对话框已注释 -->
```

**原因**: 
- 普通用户不应该看到"申请公开"的选项
- 如果仍然触发，显示清晰的说明

---

### ✅ 6. 移除服务编辑中的公开分享选项

**文件**: `src/components/zone/ServiceEditDialog.vue`

**修改内容**:
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
    <!-- 公开分享功能已限制 - 仅系统可发布公共服务 -->
  </div>
  <div class="text-caption text-grey-6 q-mt-sm">
    选择服务的分享范围，仅支持好友分享（需要已建立好友关系）
  </div>
</div>
```

**原因**: 
- 普通用户不能将服务发布为公共服务
- 只保留好友分享选项

---

### ✅ 7. 限制系统服务类型创建

**文件**: 
- `src/types/zoneService.ts`
- `src/composables/useZoneServices.ts`
- `src/components/zone/ServiceEditDialog.vue`

**类型定义**:
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

**配置标记**:
```typescript
{
  key: 'gnb_index',
  // ...
  systemOnly: true  // 标记为系统专用类型
}
```

**UI 过滤**:
```typescript
const serviceTypeOptions = computed(() => 
  serviceTypes.value
    .filter(type => !type.systemOnly)  // 过滤掉系统专用类型
    .map(type => ({
      label: type.label,
      value: type.key
    }))
)
```

**原因**: 
- gnb_index 等类型仅供系统内部使用
- 普通用户创建这些类型没有意义且可能导致问题

---

### ✅ 8. 保留好友服务发现范围说明

**文件**: 
- `src/i18n/zh-CN.ts`
- `src/i18n/en-US.ts`

**修改内容** (已在之前实施):
```typescript
friendServicesDescription: '浏览同 Zone 好友分享的网络服务（仅显示已建立好友关系的服务）'
```

**原因**: 
- 明确好友服务的发现范围
- 避免用户困惑

---

## 三、功能对比表

| 功能 | 普通用户 | 系统 | 已连接设备 |
|------|---------|------|-----------|
| 查看公共服务 | ✅ 可以 | ✅ 可以 | ✅ 可以 |
| 发布公共服务 | ⛔ 不可以 | ✅ 可以 | ⛔ 不可以 |
| 申请公开服务 | ⛔ 不可以（410） | N/A | N/A |
| 好友分享 | ✅ 可以 | N/A | ✅ 可以 |
| 创建 gnb_index | ⛔ 不可以 | ✅ 可以 | ⛔ 不可以 |
| 自动服务发现 | ⛔ 不可以 | N/A | ✅ 自动可见 |

## 四、用户体验流程

### 场景 1: 查看公共服务

**用户操作**:
1. 点击侧边栏"公共服务"
2. 看到系统提供的服务列表
3. 看到已连接设备共享的服务

**预期结果**: ✅ 正常显示所有公共可用的服务

---

### 场景 2: 尝试发布公共服务

**用户操作**:
1. 在"我的服务"页面创建服务
2. 尝试点击"申请公开"按钮

**预期结果**: 
- ⚠️ 显示提示："普通用户不能发布公共服务，公共服务仅限系统提供。已连接设备会自动共享服务，好友间可使用'好友分享'功能。"
- 引导用户使用好友分享或等待设备连接后自动共享

---

### 场景 3: 已连接设备服务共享

**系统行为**:
1. 设备 A 和设备 B 建立连接
2. 设备 A 的服务自动出现在设备 B 的"公共服务"列表
3. 无需用户手动操作

**预期结果**: ✅ 自动生效，用户无感知

---

### 场景 4: 好友分享服务

**用户操作**:
1. 在"我的服务"页面选择要分享的服务
2. 点击"分享"按钮
3. 选择好友并发送

**预期结果**: ✅ 正常分享，好友在"好友服务"列表中看到

---

## 五、测试清单

### 功能测试

- [ ] 侧边栏显示"公共服务"导航菜单
- [ ] 公共服务页面正常加载系统服务
- [ ] 已连接设备的服务显示在公共服务列表
- [ ] 点击"申请公开"显示正确的提示信息
- [ ] 服务编辑表单中没有"申请公开分享"选项
- [ ] 创建服务时看不到 gnb_index 类型
- [ ] 好友分享功能正常工作
- [ ] 410 错误显示友好提示

### 文案测试

- [ ] 公共服务描述准确（系统 + 已连接设备）
- [ ] 好友服务描述准确（同 Zone + 好友关系）
- [ ] 错误提示文案清晰易懂
- [ ] 中英文文案一致且准确

### 权限测试

- [ ] 普通用户无法申请公开服务（显示提示）
- [ ] 普通用户无法创建系统服务类型
- [ ] 系统服务正常显示在公共服务列表
- [ ] 已连接设备服务自动可见

---

## 六、已修改文件列表

1. ✅ `src/layouts/MainLayout.vue` - 恢复公共服务导航
2. ✅ `src/services/api.ts` - 调整 410 错误处理
3. ✅ `src/i18n/zh-CN.ts` - 更新中文文案
4. ✅ `src/i18n/en-US.ts` - 更新英文文案
5. ✅ `src/pages/services/MyServicesPage.vue` - 禁用申请公开功能
6. ✅ `src/components/zone/ServiceEditDialog.vue` - 移除公开分享选项
7. ✅ `src/types/zoneService.ts` - 添加系统服务类型标记
8. ✅ `src/composables/useZoneServices.ts` - 标记系统服务类型

---

## 七、关键区别总结

### ❌ 之前的错误理解

- 认为公共服务功能完全下线
- 隐藏了公共服务导航入口
- 文案提示用户不能查看公共服务

### ✅ 正确的理解

- 公共服务功能保留（用于系统服务和已连接设备）
- 保留公共服务导航入口
- 限制的是**普通用户发布公共服务**的能力
- 已连接设备的服务自动共享到公共服务列表

---

## 八、后续优化建议

1. **添加服务来源标识**
   - 在公共服务列表中标识服务来源（系统/已连接设备）
   - 方便用户区分不同类型的服务

2. **已连接设备管理**
   - 提供已连接设备列表查看
   - 显示每个设备共享的服务数量

3. **订阅状态优化**
   - 明确显示"系统默认订阅"、"已连接自动订阅"、"手动订阅"
   - 添加 tooltip 说明

4. **服务发现优化**
   - 优化服务发现的排序和筛选
   - 添加按来源过滤（系统/已连接设备/好友）

---

**文档维护者**: GitHub Copilot  
**最后更新**: 2026-01-08
