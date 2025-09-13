# Pusher Key 配置说明

## 问题描述

之前的代码中使用了硬编码的 Pusher Key: `'oyzmmhlqzmar2uvanq2k'`，这在生产环境中是不安全和不正确的做法。

## 解决方案

### 1. 环境变量配置

现在 Pusher Key 从环境变量中读取：

```typescript
// src/services/websocket.ts
const config = {
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'mynet-websocket-key',
  // ... 其他配置
}
```

### 2. 环境配置文件

#### 开发环境 (.env.development)
```bash
VITE_PUSHER_APP_KEY=mynet-dev-key
```

#### 生产环境 (.env.production)
```bash
VITE_PUSHER_APP_KEY=mynet-prod-key
```

#### 默认配置 (.env)
```bash
VITE_PUSHER_APP_KEY=mynet-dev-key
```

## Pusher Key 的作用

在 Laravel Echo + Pusher 架构中，Pusher Key 用于：

1. **客户端标识**: 标识前端应用
2. **连接验证**: 服务器验证连接的合法性
3. **频道隔离**: 不同的 key 可以隔离不同的应用或环境

## 后端配置对应

确保后端 Laravel WebSocket 服务器使用相同的 key：

### Laravel 配置 (config/broadcasting.php)
```php
'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY', 'mynet-prod-key'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        // ... 其他配置
    ],
],
```

### 环境变量 (.env)
```bash
# Laravel 后端配置
PUSHER_APP_ID=mynet-app
PUSHER_APP_KEY=mynet-prod-key  # 与前端保持一致
PUSHER_APP_SECRET=your-secret-key
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

## 安全建议

### 1. 生产环境
- 使用强随机字符串作为 key
- 定期轮换密钥
- 不要在代码中硬编码

### 2. 开发环境
- 使用简单易识别的 key
- 与生产环境分离

### 3. Key 生成示例
```bash
# 生成随机 key（推荐生产环境使用）
openssl rand -hex 16

# 或使用有意义的命名（开发环境）
mynet-dev-2024
mynet-prod-2024
```

## 验证配置

### 1. 检查前端配置
```javascript
console.log('Pusher Key:', import.meta.env.VITE_PUSHER_APP_KEY)
```

### 2. 检查连接日志
```javascript
// 在浏览器控制台查看
WebSocket: Echo 配置 {key: "mynet-prod-key", wsHost: "my.mynet.club", ...}
```

### 3. 后端日志
检查 Laravel WebSocket 服务器日志，确认使用了正确的 key。

## 故障排除

### 常见问题
1. **连接失败**: 检查前后端 key 是否一致
2. **频道订阅失败**: 验证 key 权限配置
3. **认证错误**: 确保 key 在后端正确配置

### 调试命令
```bash
# 检查环境变量
echo $VITE_PUSHER_APP_KEY

# 检查构建后的配置
npm run build && grep -r "PUSHER_APP_KEY" dist/
```

现在的配置更加安全和灵活，支持不同环境使用不同的 Pusher Key。
