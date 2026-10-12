# Laravel Reverb WebSocket 配置指南

## 🎯 Laravel Reverb 介绍

Laravel Reverb 是 Laravel 官方的 WebSocket 服务器，替代了第三方 Pusher 服务。

## 🔧 后端配置解析

### 后端环境变量
```bash
REVERB_APP_ID=686554
REVERB_APP_KEY=oyzmmhlqzmar2uvanq2k
REVERB_APP_SECRET=yabimhxofy2jud7f3lo5
REVERB_HOST="__BACK_API_HOST__"
REVERB_PORT=1080
REVERB_SCHEME=http
WEBSOCKET_ENABLED=true

# 前端使用的变量
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 配置说明
- `REVERB_APP_ID`: Reverb 应用ID
- `REVERB_APP_KEY`: 客户端连接密钥（与前端同步）
- `REVERB_APP_SECRET`: 服务器端密钥（仅后端使用）
- `REVERB_HOST`: WebSocket 服务器主机
- `REVERB_PORT`: WebSocket 服务器端口
- `REVERB_SCHEME`: 协议 (http/https)

## 🖥️ 前端配置

### 开发环境 (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:1080

# Laravel Reverb WebSocket 配置
VITE_PUSHER_APP_KEY=oyzmmhlqzmar2uvanq2k
VITE_REVERB_APP_ID=686554
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=1080
VITE_REVERB_SCHEME=ws
```

### 生产环境 (.env.production)
```bash
VITE_API_BASE_URL=https://my.mynet.club
VITE_WS_URL=wss://my.mynet.club/wss

# Laravel Reverb WebSocket 配置
VITE_PUSHER_APP_KEY=oyzmmhlqzmar2uvanq2k
VITE_REVERB_APP_ID=686554
VITE_REVERB_HOST=__BACK_API_HOST__
VITE_REVERB_PORT=1080
VITE_REVERB_SCHEME=https
```

## 📡 Laravel Echo 配置

### 更新的配置
```typescript
// src/services/websocket.ts
const config = {
  broadcaster: 'reverb',  // 使用 reverb 而不是 pusher
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  wsPath: wsPath,
  forceTLS: useTLS,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  encrypted: useTLS,
  namespace: null,
  cluster: 'local'
}
```

## 🚀 部署配置

### nginx 代理配置
```nginx
# /wss 路径代理到 Reverb 服务器
location /wss {
    proxy_pass http://__BACK_API_HOST__:1080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Reverb 特定的头部
    proxy_set_header X-Reverb-Server "my.mynet.club";
}
```

### SSL 配置（生产环境）
如果使用 HTTPS，需要配置 SSL 终止：
```nginx
# SSL 终止后，内部使用 HTTP 连接到 Reverb
location /wss {
    proxy_pass http://__BACK_API_HOST__:1080;
    proxy_set_header X-Forwarded-Proto https;
    # ... 其他配置
}
```

## 🔍 连接验证

### 1. 检查配置一致性
```bash
# 后端配置
REVERB_APP_KEY=oyzmmhlqzmar2uvanq2k

# 前端配置（必须一致）
VITE_PUSHER_APP_KEY=oyzmmhlqzmar2uvanq2k
```

### 2. 测试连接
```javascript
// 浏览器控制台
console.log('Reverb 配置:', {
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  host: import.meta.env.VITE_REVERB_HOST,
  port: import.meta.env.VITE_REVERB_PORT,
  scheme: import.meta.env.VITE_REVERB_SCHEME
});
```

### 3. 连接日志
```
WebSocket: 连接参数 - Host: __BACK_API_HOST__, Port: 1080, Path: /wss, TLS: true
WebSocket: Echo 配置 {broadcaster: "reverb", key: "oyzmmhlqzmar2uvanq2k", ...}
WebSocket: Laravel Echo 连接成功
```

## ⚠️ 注意事项

### 1. broadcaster 类型
- 使用 `reverb` 而不是 `pusher`
- Laravel Echo 会自动处理 Reverb 协议

### 2. 端口配置
- 开发环境: 通常是 `1080`
- 生产环境: 可能需要通过 nginx 代理

### 3. 路径配置
- Reverb 默认路径通常是 `/`
- 通过 nginx 可以映射到 `/wss`

### 4. 安全性
- 生产环境使用 HTTPS/WSS
- `REVERB_APP_SECRET` 仅在后端使用，不要暴露给前端

## 🐛 故障排除

### 常见错误
1. **连接失败**: 检查 `REVERB_APP_KEY` 是否一致
2. **端口错误**: 确认 `REVERB_PORT` 配置正确
3. **路径错误**: 检查 nginx 代理配置
4. **SSL 错误**: 确认生产环境 TLS 配置

### 调试命令
```bash
# 检查 Reverb 服务状态
php artisan reverb:start --debug

# 测试 WebSocket 连接
wscat -c ws://__BACK_API_HOST__:1080
```

现在前端配置已与后端 Laravel Reverb 完全同步！
