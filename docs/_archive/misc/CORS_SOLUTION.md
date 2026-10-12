# CORS跨域问题解决方案

## 问题描述

当前端域名（`my.mynet.club`）与API域名（`__BACK_API_HOST__`）不同时，浏览器会认为这是跨域请求，导致：

1. **CORS预检请求** - 浏览器会先发送OPTIONS请求
2. **增加网络延迟** - 每个API请求前都要预检
3. **配置复杂性** - 需要在后端配置CORS头

## 解决方案

### 方案一：nginx代理（推荐）

通过nginx代理，让前端和API使用同一域名：

```
前端: https://my.mynet.club/
API:  https://my.mynet.club/api/v1/  (代理到 __BACK_API_HOST__/api/v1/)
WSS:  wss://my.mynet.club/wss        (代理到后端WebSocket)
```

**优势：**
- ✅ 完全避免CORS问题
- ✅ 减少网络请求数量
- ✅ 更好的性能
- ✅ 统一的域名管理

### 方案二：后端CORS配置

在API服务器设置CORS头：

```php
// PHP示例
header('Access-Control-Allow-Origin: https://my.mynet.club');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**缺点：**
- ❌ 每个请求都有额外开销
- ❌ 需要维护允许的域名列表
- ❌ 预检请求增加延迟

## 当前配置

### 前端配置
```bash
# .env.production
VITE_API_BASE_URL=https://my.mynet.club
VITE_WS_URL=wss://my.mynet.club/wss
```

> 注意：前端代码会自动在 API_BASE_URL 后添加 `/api/v1` 路径

### nginx配置要点

1. **API代理**
```nginx
location /api/ {
    # 保持完整路径代理
    proxy_pass https://__BACK_API_HOST__;
    proxy_set_header Host __BACK_API_HOST__;
}
```

2. **WebSocket代理**
```nginx
location /wss {
    proxy_pass http://backend_websocket_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 测试验证

### 1. 检查CORS
在浏览器开发工具中查看Network面板：
- ✅ 没有OPTIONS预检请求
- ✅ 所有API请求直接发送

### 2. 测试API请求
```javascript
// 前端发送请求到同域名（代码自动添加 /api/v1）
fetch('/api/v1/user/profile')  // 实际请求
// nginx自动代理到 https://__BACK_API_HOST__/api/v1/user/profile
```

### 3. 测试WebSocket
```javascript
const ws = new WebSocket('wss://my.mynet.club/wss');
// nginx自动代理到后端WebSocket服务
```

## 部署注意事项

1. **确保nginx配置正确** - 检查代理规则
2. **SSL证书配置** - 确保HTTPS正常工作
3. **后端API可访问** - 确保 __BACK_API_HOST__ 可正常访问
4. **WebSocket服务运行** - 确保WebSocket服务正常

这种方案是业界标准做法，既解决了CORS问题，又提供了更好的性能和安全性。
