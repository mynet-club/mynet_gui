# WebSocket 路径配置问题解决方案

## 问题描述

当配置了 `VITE_WS_URL=wss://my.mynet.club/wss` 时，在生产环境中 WebSocket 连接路径变成了 `wss://my.mynet.club/app/`，而不是期望的 `wss://my.mynet.club/wss`。

## 原因分析

Laravel Echo 在初始化 Pusher 客户端时，如果没有明确指定 `wsPath` 参数，会使用默认路径。不同的 WebSocket 服务器可能有不同的默认路径：

- **Laravel WebSocket**: 默认路径通常是 `/app/{app_key}`
- **Pusher**: 默认路径是 `/app/{app_key}`
- **Socket.io**: 默认路径是 `/socket.io/`
- **自定义路径**: 需要显式配置

## 解决方案

### 方案一：在 Laravel Echo 配置中指定 wsPath（推荐）

在 `src/services/websocket.ts` 中，我们已经修改了配置：

```typescript
const config = {
  broadcaster: 'pusher',
  key: 'oyzmmhlqzmar2uvanq2k',
  wsHost: wsHost,
  wsPort: wsPort,
  wsPath: wsPath,  // 从环境变量URL中自动提取路径
  forceTLS: useTLS,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  encrypted: useTLS,
  namespace: null,
  cluster: 'local'
}
```

### 方案二：URL 解析逻辑

代码会自动从 `VITE_WS_URL` 中提取路径：

```typescript
// 环境变量配置
VITE_WS_URL=wss://my.mynet.club/wss

// 自动解析结果
wsHost = 'my.mynet.club'
wsPort = 443
wsPath = '/wss'
useTLS = true
```

## 配置验证

### 1. 环境变量配置
```bash
# .env.production
VITE_API_BASE_URL=https://my.mynet.club
VITE_WS_URL=wss://my.mynet.club/wss
VITE_PUSHER_APP_KEY=mynet-prod-key

# .env.development  
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:1080
VITE_PUSHER_APP_KEY=mynet-dev-key
```

### 2. nginx 代理配置
```nginx
# nginx.conf
location /wss {
    proxy_pass http://backend_websocket_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### 3. 后端 WebSocket 服务器路径
确保后端 WebSocket 服务器监听正确的路径：
- Laravel WebSocket: 配置监听 `/wss` 路径
- 或者配置nginx代理规则

## 调试方法

### 1. 浏览器开发工具
1. 打开 Network 面板
2. 筛选 WS/WSS 连接
3. 查看实际连接的URL是否正确

### 2. 控制台日志
检查控制台输出：
```javascript
WebSocket: 连接参数 - Host: my.mynet.club, Port: 443, Path: /wss, TLS: true
```

### 3. 测试连接
```javascript
// 手动测试 WebSocket 连接
const ws = new WebSocket('wss://my.mynet.club/wss');
ws.onopen = () => console.log('WebSocket 连接成功');
ws.onerror = (error) => console.error('WebSocket 连接错误:', error);
```

## 常见的 wsPath 配置

| WebSocket 服务器 | 默认路径 | 自定义路径示例 |
|------------------|----------|----------------|
| Laravel WebSocket | `/app/{app_key}` | `/wss` |
| Pusher | `/app/{app_key}` | `/pusher` |
| Socket.io | `/socket.io/` | `/ws` |
| 原生 WebSocket | `/` | `/wss` |

## 验证步骤

1. ✅ 修改 `websocket.ts` 添加 `wsPath` 配置
2. ✅ 确保从环境变量正确解析路径
3. 🔄 重新构建并部署应用
4. 🔄 检查浏览器 Network 面板中的 WebSocket 连接URL
5. 🔄 验证连接是否成功建立

修改后，WebSocket 连接应该使用正确的路径 `/wss` 而不是默认的 `/app/`。
