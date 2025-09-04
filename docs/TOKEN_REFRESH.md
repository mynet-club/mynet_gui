# Token 刷新功能实现

## 概述

我们已经实现了一个完整的 JWT Token 自动刷新机制，包括：

- 自动检测 token 过期
- 自动刷新 token
- 防止并发刷新
- 自动定时刷新
- 失败时的清理机制

## 核心组件

### 1. TokenManager (`src/utils/tokenManager.ts`)

负责 token 的生命周期管理：

```typescript
import { tokenManager } from '../utils/tokenManager'

// 保存 token
tokenManager.saveTokenData({
  access_token: 'your_access_token',
  refresh_token: 'your_refresh_token',
  expires_at: Date.now() + 3600000, // 1小时后过期
  token_type: 'Bearer'
})

// 检查 token 状态
const isExpired = tokenManager.isTokenExpired()
const isNearExpiry = tokenManager.isTokenNearExpiry()
const remainingTime = tokenManager.getTokenRemainingTime() // 剩余分钟数

// 手动刷新 token
const newToken = await tokenManager.refreshToken()
```

### 2. API 拦截器 (`src/services/api.ts`)

- **请求拦截器**: 自动添加 token 到请求头
- **响应拦截器**: 检测 401 错误并自动刷新 token

### 3. Auth Store (`src/stores/auth.ts`)

与 TokenManager 集成，管理认证状态：

```typescript
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// 登录会自动保存 token
await authStore.login({ email, password })

// 登出会清除所有 token
await authStore.logout()

// 检查认证状态
const isAuthenticated = authStore.isAuthenticated
```

## 自动刷新机制

### 时机

1. **定时刷新**: Token 过期前 5 分钟自动刷新
2. **401 响应**: API 返回 401 时立即刷新
3. **手动刷新**: 调用 `tokenManager.refreshToken()`

### 防并发机制

- 如果已有刷新请求在进行，后续请求会等待结果
- 刷新成功后，所有等待的请求会使用新 token 重试

### 失败处理

- 刷新失败时清除所有 token
- 重定向到登录页面

## 测试功能

### Token 调试页面

访问 `/system/token-debug` (仅开发模式)：

- 查看当前 token 状态
- 测试 token 刷新
- 测试自动刷新
- 清除所有 token
- 实时日志监控

### 测试函数

```typescript
import { testTokenRefresh, testAutoRefresh } from '../utils/tokenRefreshTest'

// 测试立即刷新
await testTokenRefresh()

// 测试自动刷新（30秒后过期，25秒时自动刷新）
testAutoRefresh()
```

## API 端点

### 刷新 Token

```
POST /api/v1/auth/refresh
Authorization: Bearer {refresh_token}

{
  "refresh_token": "your_refresh_token"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token", // 可选
    "expires_at": 1234567890, // 时间戳或ISO字符串
    "expires_in": 3600 // 秒数（可选）
  }
}
```

## 使用示例

### 基本使用

```typescript
// 在组件中使用
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// 检查认证状态
if (authStore.isAuthenticated) {
  // 用户已登录，token 有效
  console.log('用户:', authStore.user?.name)
  console.log('Token 剩余时间:', tokenManager.getTokenRemainingTime(), '分钟')
}

// 进行 API 请求（自动处理 token）
import { apiService } from '../services/api'

const data = await apiService.getUserProfile() // 自动附加 token，失败时自动刷新
```

### 监听 Token 状态

```typescript
import { tokenManager } from '../utils/tokenManager'

// 定期检查 token 状态
setInterval(() => {
  if (tokenManager.isTokenNearExpiry()) {
    console.log('Token 即将过期，将自动刷新')
  }
}, 60000) // 每分钟检查一次
```

## 配置

### 环境变量

```bash
# .env
# API 基础 URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# 是否使用模拟数据
VITE_USE_MOCK_DATA=false
```

### 自定义配置

在 `src/utils/tokenManager.ts` 中可以调整：

- `scheduleTokenRefresh()`: 提前刷新时间（默认5分钟）
- `performTokenRefresh()`: 刷新 API 端点
- 错误处理逻辑

## 错误处理

### 常见错误

1. **No refresh token available**: 没有可用的刷新 token
   - 解决：重新登录

2. **Token refresh failed: 401**: 刷新 token 也过期了
   - 解决：自动清除 token 并重定向到登录页

3. **Network error**: 网络连接问题
   - 解决：显示错误消息，保持当前状态

### 调试

1. 打开浏览器开发者工具
2. 查看 Console 日志，搜索 `[TokenManager]`
3. 或使用调试页面 `/system/token-debug`

## 安全注意事项

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **Refresh Token 存储**: 考虑使用 HttpOnly Cookie
3. **Token 过期时间**: 合理设置 access token 和 refresh token 的过期时间
4. **错误日志**: 不要在日志中暴露完整的 token 内容

## 后端配置

确保后端 API 支持：

1. `/auth/login` - 返回 access_token 和 refresh_token
2. `/auth/refresh` - 接受 refresh_token，返回新的 access_token
3. `/auth/logout` - 使 refresh_token 失效
4. 正确的 CORS 配置
5. 适当的错误响应格式
