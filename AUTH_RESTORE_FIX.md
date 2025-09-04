# 登录状态恢复修复

## 问题描述
刷新页面后，用户登录状态丢失，导致区域选择无法保持。

## 根本原因
1. 在 boot/auth.ts 中恢复登录状态时，没有设置 `tokenExpiry`
2. 在 MainLayout.vue 中，即使用户未认证也显示模拟区域数据

## 修复方案

### 1. 修复 boot/auth.ts 中的登录状态恢复
添加了 token 过期时间的恢复：

```typescript
// 恢复 token 过期时间
const tokenExpiry = localStorage.getItem('token_expiry')
if (tokenExpiry) {
  authStore.tokenExpiry = parseInt(tokenExpiry)
}
```

### 2. 修复 MainLayout.vue 中的区域数据加载
只在用户已认证时才加载模拟区域数据：

```typescript
// 如果区域数据仍然为空且用户已认证，使用模拟数据
if (authStore.isAuthenticated && availableZones.value.length === 0) {
  // ... 模拟数据加载逻辑
}
```

### 3. 添加调试信息
在 boot/auth.ts 中添加了调试信息来跟踪登录状态恢复过程：

```typescript
console.log('🔐 [Boot] Checking auth state:', { 
  hasToken: !!token, 
  hasUserInfo: !!userInfo,
  token: token ? token.substring(0, 20) + '...' : null
})
```

## 修复后的流程

1. **应用启动时**：
   - 检查 localStorage 中的 token 和 userInfo
   - 如果存在，验证 token 有效性
   - 恢复用户信息、token 和 tokenExpiry
   - 加载区域数据
   - 恢复保存的区域选择

2. **区域切换时**：
   - 调用 API 切换区域
   - 更新用户信息
   - 保存区域选择到 localStorage

3. **页面刷新时**：
   - 从 localStorage 恢复所有认证信息
   - 恢复区域选择
   - 保持用户的选择

## 测试验证

修复后应该能够：
1. 登录后，刷新页面保持登录状态
2. 切换区域后，刷新页面保持区域选择
3. 登出后，清除所有状态
4. 重新登录后，恢复之前的选择

## 调试信息

现在可以通过控制台查看：
- 登录状态检查过程
- 区域数据加载过程
- 区域选择恢复过程 