# 通知系统使用文档

## 概述

通知系统提供完整的应用内通知管理功能，包括通知的接收、显示、标记已读、删除等操作。

## API 接口

### 基础 URL
所有通知相关的 API 都位于 `/api/v1/notifications` 下。

### 接口列表

#### 1. 获取通知列表
```
GET /api/v1/notifications
```

**查询参数:**
- `unread_only` (boolean, 可选): 是否只显示未读通知
- `page` (number, 可选): 页码，默认为 1
- `per_page` (number, 可选): 每页数量，默认为 20
- `type` (string, 可选): 通知类型过滤

**响应示例:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "系统通知",
      "message": "节点 server-01 CPU 使用率过高",
      "type": "warning",
      "timestamp": "2024-01-01T12:00:00Z",
      "read": false,
      "data": {}
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

#### 2. 获取未读数量
```
GET /api/v1/notifications/unread-count
```

**响应示例:**
```json
{
  "unread_count": 15
}
```

#### 3. 获取统计信息
```
GET /api/v1/notifications/stats
```

**响应示例:**
```json
{
  "total": 100,
  "unread": 15,
  "read": 85,
  "today": 5,
  "this_week": 25
}
```

#### 4. 标记已读
```
POST /api/v1/notifications/{id}/read
```

#### 5. 全部标记为已读
```
POST /api/v1/notifications/read-all
```

#### 6. 删除通知
```
DELETE /api/v1/notifications/{id}
```

#### 7. 批量删除
```
POST /api/v1/notifications/batch-delete
```

**请求体:**
```json
{
  "ids": [1, 2, 3]
}
```

#### 8. 清空已读通知
```
POST /api/v1/notifications/clear-read
```

## 前端实现

### 1. 类型定义

通知类型定义位于 `src/types/notification.ts`:

```typescript
interface Notification {
  id: number
  title: string
  message: string
  type: NotificationType  // 'info' | 'success' | 'warning' | 'error' | 'system'
  timestamp: string
  read: boolean
  data?: Record<string, any>
}
```

### 2. API 服务

通知 API 服务位于 `src/services/notification/index.ts`:

```typescript
import { notificationService } from '@/services/notification'

// 获取通知列表
const response = await notificationService.getNotifications({
  unread_only: true,
  page: 1,
  per_page: 20
})

// 获取未读数量
const count = await notificationService.getUnreadCount()

// 标记已读
await notificationService.markAsRead(notificationId)

// 全部标记已读
await notificationService.markAllAsRead()

// 删除通知
await notificationService.deleteNotification(notificationId)

// 批量删除
await notificationService.batchDelete({ ids: [1, 2, 3] })

// 清空已读
await notificationService.clearRead()
```

### 3. Composable 使用

通知状态管理 Composable 位于 `src/composables/useNotifications.ts`:

```typescript
import { useNotifications } from '@/composables/useNotifications'

const {
  // 状态
  notifications,          // 通知列表
  unreadCount,           // 未读数量
  loading,               // 加载状态
  hasUnread,            // 是否有未读
  displayUnreadCount,   // 显示用未读数量 (99+)
  
  // 方法
  loadNotifications,    // 加载通知列表
  refreshUnreadCount,   // 刷新未读数量
  markAsRead,          // 标记已读
  markAllAsRead,       // 全部已读
  deleteNotification,  // 删除通知
  batchDelete,         // 批量删除
  clearRead,           // 清空已读
  showUnreadOnly,      // 只显示未读
  showAll,             // 显示全部
  goToPage,            // 翻页
  startPolling,        // 开始轮询未读数量
  stopPolling,         // 停止轮询
  getNotificationIcon, // 获取通知图标
  getNotificationColor // 获取通知颜色
} = useNotifications()

// 加载通知列表
await loadNotifications()

// 标记已读
await markAsRead(notificationId)

// 全部标记已读
await markAllAsRead()
```

### 4. 通知组件

通知对话框组件位于 `src/components/notification/NotificationDialog.vue`:

```vue
<template>
  <NotificationDialog v-model="showDialog" />
</template>

<script setup>
import NotificationDialog from '@/components/notification/NotificationDialog.vue'
import { ref } from 'vue'

const showDialog = ref(false)
</script>
```

### 5. MainLayout 集成

在 `src/layouts/MainLayout.vue` 中已经集成了通知系统:

```vue
<template>
  <!-- 通知按钮 -->
  <q-btn 
    flat 
    dense
    round
    icon="notifications"
    @click="showNotificationDialog = true"
  >
    <q-badge 
      v-if="unreadNotifications > 0"
      color="negative"
      floating
      :label="displayUnreadCount"
    />
  </q-btn>

  <!-- 通知对话框 -->
  <NotificationDialog v-model="showNotificationDialog" />
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications'

const { unreadCount: unreadNotifications, displayUnreadCount } = useNotifications()
const showNotificationDialog = ref(false)
</script>
```

## 特性

### 1. 自动轮询
通知系统会自动每 60 秒轮询一次未读数量，保持数据实时性。

```typescript
// 在 useNotifications 中
onMounted(() => {
  refreshUnreadCount()
  startPolling(60000) // 每 60 秒轮询一次
})
```

### 2. 未读标记
- 未读通知会以浅蓝色背景显示
- 铃铛图标会显示未读数量徽章
- 超过 99 条未读显示为 "99+"

### 3. 通知类型
支持 5 种通知类型，每种类型有不同的图标和颜色:
- `info`: 蓝色，信息图标
- `success`: 绿色，勾选图标
- `warning`: 橙色，警告图标
- `error`: 红色，错误图标
- `system`: 紫色，设置图标

### 4. 筛选功能
- 显示全部通知
- 只显示未读通知

### 5. 批量操作
- 全部标记为已读
- 清空所有已读通知

### 6. 分页支持
支持分页浏览通知，默认每页 20 条。

## 国际化

通知系统完全支持国际化，翻译文件位于:
- 中文: `src/i18n/zh-CN.ts`
- 英文: `src/i18n/en-US.ts`

翻译键:
```typescript
notifications: {
  empty: '暂无通知',
  markAllRead: '全部已读',
  markedAsRead: '已标记为已读',
  deleted: '通知已删除',
  clearRead: '清空已读',
  filter: '筛选',
  all: '全部',
  unreadOnly: '仅未读'
  // ... 更多
}
```

## 样式定制

通知组件使用 Quasar 组件，可以通过以下方式定制样式:

```scss
// 在组件的 style 标签中
.notification-item {
  transition: background-color 0.3s;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}
```

## 最佳实践

1. **性能优化**: 使用分页而不是一次加载所有通知
2. **用户体验**: 点击通知自动标记为已读
3. **实时更新**: 通过轮询保持未读数量实时更新
4. **错误处理**: 所有 API 调用都有错误处理和用户提示
5. **状态同步**: 本地状态和服务器状态保持同步

## 扩展

如果需要添加新的通知类型或功能:

1. 在 `src/types/notification.ts` 中添加新的类型定义
2. 在 `src/services/notification/index.ts` 中添加新的 API 方法
3. 在 `src/composables/useNotifications.ts` 中添加新的状态管理逻辑
4. 在 `src/i18n/` 中添加对应的翻译

## 测试

建议测试以下场景:
1. 通知列表加载
2. 未读数量更新
3. 标记已读功能
4. 删除通知功能
5. 筛选功能
6. 分页功能
7. 实时轮询
8. 网络错误处理
