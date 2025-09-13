# 环境配置说明

## 环境文件优先级

Quasar/Vite 按以下优先级加载环境文件：

1. `.env.[mode].local` （最高优先级，会被 git 忽略）
2. `.env.local` （总是被加载，会被 git 忽略）
3. `.env.[mode]` （如 `.env.development`, `.env.production`）
4. `.env` （默认配置，最低优先级）

## 开发环境配置

### 本地开发
- 编辑 `.env.local` 文件配置您的本地开发环境
- 默认配置：
  - API: `http://localhost:8000`
  - WebSocket: `ws://localhost:1080`

### 开发模式运行
```bash
npm run dev
```

## 生产环境配置

### 生产环境配置文件
- `.env.production` - 生产环境配置
- 配置：
  - API: `https://my.mynet.club` (代码会自动添加 /api/v1)
  - WebSocket: `wss://my.mynet.club/wss`

### 生产环境构建
```bash
npm run build:prod
```

### 部署到生产环境
```bash
./deployment.sh
```

## 注意事项

1. **不要修改 `.env` 文件** - 这是默认的开发环境配置
2. **本地配置使用 `.env.local`** - 此文件会被 git 忽略
3. **生产环境配置在 `.env.production`** - 此文件会被提交到 git
4. **部署脚本会自动使用生产环境配置** - 不会影响本地开发配置

## 环境变量说明

| 变量名 | 说明 | 开发环境 | 生产环境 |
|--------|------|----------|----------|
| `VITE_API_BASE_URL` | 后端API地址 | `http://localhost:8000` | `https://my.mynet.club` |
| `VITE_WS_URL` | WebSocket地址 | `ws://localhost:1080` | `wss://my.mynet.club/wss` |
| `VITE_PUSHER_APP_KEY` | Pusher应用密钥 | `mynet-dev-key` | `mynet-prod-key` |
| `VITE_ENABLE_DEBUG` | 调试模式 | `true` | `false` |
| `VITE_ENABLE_CONSOLE_LOG` | 控制台日志 | `true` | `false` |
| `VITE_LOG_LEVEL` | 日志级别 | `debug` | `error` |
