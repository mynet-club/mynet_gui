# 待实现功能清单

本文档记录了代码中标记为 TODO 的待实现功能，按模块分类。

## 节点管理

### 节点列表 (NodeListPage.vue)
- **连接功能**: 实现真正的节点连接逻辑
  - 位置: `src/pages/node/NodeListPage.vue:256`
  - 说明: 当前仅为占位符，需要实现实际的节点连接API调用

### 节点详情 (NodeDetailPage.vue)
- **路由统计**: 获取节点的实际路由数量
  - 位置: `src/pages/node/NodeDetailPage.vue:811`
  - 说明: 需要后端提供节点路由数量统计API

### 节点卡片 (NodeCardContent.vue)
- **复制成功提示**: 添加复制成功后的用户反馈
  - 位置: `src/components/node/NodeCardContent.vue:349`
  - 说明: 可使用 Quasar Notify 显示成功提示

### 密钥管理 (KeyManagementPage.vue)
- **强制重新生成**: 实现上传公钥时的强制重新生成参数
  - 位置: `src/pages/node/edit/KeyManagementPage.vue:507`
  - 说明: 需要传递 `force_regenerate` 参数到API

## Dashboard

### 推荐卡片 (RecommendationsCard.vue)
- **查看全部推荐**: 打开对话框显示所有推荐项
  - 位置: `src/components/dashboard/RecommendationsCard.vue:122`
  - 说明: 需要设计并实现推荐详情对话框

### 最近活动 (RecentActivities.vue)
- **活动历史页面**: 查看所有历史活动
  - 位置: `src/components/dashboard/RecentActivities.vue:127`
  - 说明: 可以是新页面或模态框形式

## 路由管理

### 节点选择 (Step3MyNodeSelection.vue)
- **请求历史**: 显示被拒绝的请求历史
  - 位置: `src/pages/route/create/Step3MyNodeSelection.vue:615`
  - 说明: 需要后端提供被拒绝的请求历史API

## IP资源池

### IP池管理器 (IPPoolManager.vue)
- **查看池详情**: 实现IP池详情查看功能
  - 位置: `src/components/ippool/IPPoolManager.vue:282`
  
- **编辑IP池**: 实现IP池编辑功能
  - 位置: `src/components/ippool/IPPoolManager.vue:287`
  
- **管理IP池**: 实现IP池高级管理功能
  - 位置: `src/components/ippool/IPPoolManager.vue:292`

## 社交功能

### 好友管理 (FriendsPage.vue)
- **查看好友节点**: 实现查看好友节点详情
  - 位置: `src/pages/social/FriendsPage.vue:147`
  - 说明: 跳转到好友节点列表或详情页

### 好友请求 (FriendRequestsPage.vue)
- **取消请求**: 实现取消已发送的好友请求
  - 位置: `src/pages/social/FriendRequestsPage.vue:153`
  - 说明: 需要调用取消请求API

### 好友节点 (FriendNodesPage.vue)
- **节点详情**: 查看好友节点详细信息
  - 位置: `src/pages/route/FriendNodesPage.vue:373`

### 好友卡片 (FriendCardContent.vue)
- **消息功能**: 实现好友私信功能
  - 位置: `src/components/social/FriendCardContent.vue:223`
  - 说明: 需要先实现消息系统，然后跳转到聊天页面

## 服务管理

### 我的服务 (MyServicesPage.vue)
- **用户选择**: 添加分享服务时的目标用户选择
  - 位置: `src/pages/services/MyServicesPage.vue:248`
  - 说明: 需要实现用户选择对话框

## 区域分享

### 区域分享 (ZoneSharingPage.vue)
- **好友选择**: 选择要分享给哪个好友
  - 位置: `src/pages/zone/ZoneSharingPage.vue:348`
  - 说明: 需要实现好友选择对话框

## 用户资料

### 个人资料页面 (ProfilePageNew.vue)
- **头像上传**: 实现用户头像上传功能
  - 位置: `src/pages/user/ProfilePageNew.vue:855`
  
- **2FA切换**: 实现两步验证开关
  - 位置: `src/pages/user/ProfilePageNew.vue:878`
  
- **会话管理**: 实现会话撤销功能
  - 位置: `src/pages/user/ProfilePageNew.vue:899`
  
- **资料更新**: 实现更新用户资料逻辑
  - 位置: `src/pages/user/ProfilePageNew.vue:927`
  
- **密码修改**: 实现修改密码功能
  - 位置: `src/pages/user/ProfilePageNew.vue:959`

## 实现优先级建议

### 高优先级 (影响核心功能)
1. 节点连接逻辑 (NodeListPage)
2. 密钥管理强制重生成 (KeyManagementPage)
3. 取消好友请求 (FriendRequestsPage)
4. 用户资料更新 (ProfilePageNew)
5. 密码修改 (ProfilePageNew)

### 中优先级 (增强用户体验)
1. 复制成功提示 (NodeCardContent)
2. 查看全部推荐 (RecommendationsCard)
3. 活动历史查看 (RecentActivities)
4. IP池详情/编辑/管理 (IPPoolManager)
5. 查看好友节点 (FriendsPage)

### 低优先级 (辅助功能)
1. 路由数量统计 (NodeDetailPage)
2. 请求历史记录 (Step3MyNodeSelection)
3. 消息功能 (FriendCardContent) - 需要先实现消息系统
4. 头像上传 (ProfilePageNew)
5. 2FA功能 (ProfilePageNew)
6. 会话管理 (ProfilePageNew)

## 注意事项

1. **API依赖**: 部分功能需要后端提供新的API接口
2. **组件复用**: 用户选择、好友选择等对话框可以开发通用组件
3. **安全性**: 密码修改、2FA等安全相关功能需要特别注意安全性设计
4. **用户体验**: 建议优先实现那些能明显提升用户体验的功能
