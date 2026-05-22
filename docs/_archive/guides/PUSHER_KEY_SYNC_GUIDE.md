# 前后端 Pusher Key 同步配置指南

## 🎯 核心问题

**Pusher Key 必须在前端和后端保持完全一致**，否则 WebSocket 连接将失败。

## 🔧 配置同步方案

### 方案一：使用统一的环境变量命名（推荐）

#### 前端配置
```bash
# .env.production
VITE_PUSHER_APP_KEY=mynet-prod-2024

# .env.development  
VITE_PUSHER_APP_KEY=mynet-dev-2024
```

#### 后端配置 (Laravel)
```bash
# 后端 .env 文件
PUSHER_APP_KEY=mynet-prod-2024  # 与前端保持一致
PUSHER_APP_SECRET=your-secret-key
PUSHER_APP_ID=mynet-app
```

#### Laravel 配置文件 (config/broadcasting.php)
```php
<?php
return [
    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'), 
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'local'),
                'host' => env('PUSHER_HOST') ?: null,
                'port' => env('PUSHER_PORT') ?: null,
                'scheme' => env('PUSHER_SCHEME', 'http'),
                'encrypted' => true,
                'useTLS' => env('PUSHER_SCHEME', 'http') === 'https',
            ],
        ],
    ],
];
```

### 方案二：使用配置中心（企业级）

#### 1. 创建配置服务器端点
```php
// Laravel 路由: /api/config/websocket
Route::get('/config/websocket', function() {
    return response()->json([
        'pusher_key' => config('broadcasting.connections.pusher.key'),
        'pusher_cluster' => config('broadcasting.connections.pusher.options.cluster'),
        'websocket_url' => config('app.websocket_url'),
    ]);
});
```

#### 2. 前端动态获取配置
```typescript
// src/services/websocket.ts
async function getWebSocketConfig() {
  try {
    const response = await fetch('/api/config/websocket');
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('获取WebSocket配置失败，使用默认配置');
    return {
      pusher_key: import.meta.env.VITE_PUSHER_APP_KEY,
      pusher_cluster: 'local',
      websocket_url: import.meta.env.VITE_WS_URL,
    };
  }
}

// 在连接时使用
const wsConfig = await getWebSocketConfig();
const config = {
  broadcaster: 'pusher',
  key: wsConfig.pusher_key,
  // ... 其他配置
};
```

## 🔍 当前推荐配置

### 开发环境同步
```bash
# 前端 .env.development
VITE_PUSHER_APP_KEY=mynet-dev-2024

# 后端 .env (开发环境)
PUSHER_APP_KEY=mynet-dev-2024
PUSHER_APP_SECRET=dev-secret-key
PUSHER_APP_ID=mynet-dev
```

### 生产环境同步
```bash
# 前端 .env.production
VITE_PUSHER_APP_KEY=mynet-prod-2024

# 后端 .env (生产环境)
PUSHER_APP_KEY=mynet-prod-2024
PUSHER_APP_SECRET=prod-secret-key
PUSHER_APP_ID=mynet-prod
```

## 🚀 部署检查清单

### 1. 部署前验证
```bash
# 检查前端配置
echo "前端 Pusher Key: $VITE_PUSHER_APP_KEY"

# 检查后端配置
php artisan config:show broadcasting.connections.pusher.key
```

### 2. 连接测试
```javascript
// 浏览器控制台测试
console.log('前端配置的 Pusher Key:', import.meta.env.VITE_PUSHER_APP_KEY);

// WebSocket 连接日志
WebSocket: Echo 配置 {key: "mynet-prod-2024", wsHost: "my.mynet.club", ...}
```

### 3. 后端验证
```php
// Laravel 控制器或中间件中验证
Log::info('WebSocket配置', [
    'pusher_key' => config('broadcasting.connections.pusher.key'),
    'app_id' => config('broadcasting.connections.pusher.app_id'),
]);
```

## ⚠️ 常见错误和解决方案

### 错误1: Key 不匹配
```
WebSocket: Laravel Echo 连接错误 Pusher: Invalid key
```
**解决**: 检查前后端 key 是否完全一致

### 错误2: App ID 错误  
```
WebSocket: Laravel Echo 连接错误 App not found
```
**解决**: 检查后端 PUSHER_APP_ID 配置

### 错误3: Secret 配置错误
```
Laravel Broadcasting: Authentication failed
```
**解决**: 检查后端 PUSHER_APP_SECRET 配置

## 🔐 安全建议

### 1. Key 命名规范
```bash
# 格式: 项目名-环境-年份
mynet-dev-2024      # 开发环境
mynet-prod-2024     # 生产环境
mynet-test-2024     # 测试环境
```

### 2. 定期轮换
- 每季度更换一次 key
- 记录更换历史
- 同时更新前后端配置

### 3. 环境隔离
- 开发、测试、生产使用不同的 key
- 不要在代码中硬编码
- 使用环境变量管理

## 📝 当前需要修改的配置

基于您的项目，建议以下配置：

```bash
# 前端 .env.production
VITE_PUSHER_APP_KEY=mynet-club-prod-2024

# 前端 .env.development
VITE_PUSHER_APP_KEY=mynet-club-dev-2024

# 后端需要相应配置
PUSHER_APP_KEY=mynet-club-prod-2024  # 生产环境
PUSHER_APP_KEY=mynet-club-dev-2024   # 开发环境
```

这样可以确保前后端 Pusher Key 完全同步！
