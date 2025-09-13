# Quasar 构建模式说明

## 🚨 问题解决

### 错误信息
```bash
quasar build --mode production
App • ⚠️  Unknown mode "production"
[ERROR] 构建失败
```

### 原因分析
Quasar CLI 不支持 `--mode production` 参数。在 Quasar 中：
- `--mode` 参数用于指定目标平台（如 pwa, electron, capacitor）
- 不是用于指定开发/生产环境模式

## ✅ 正确的构建方式

### 1. 标准构建命令
```bash
# 开发模式
npm run dev
# 等同于: quasar dev

# 生产构建
npm run build  
# 等同于: quasar build
```

### 2. Quasar 环境模式

Quasar 通过以下方式确定环境：

#### 开发模式 (`quasar dev`)
- 自动设置 `NODE_ENV=development`
- 加载 `.env.development` 文件
- 启用热重载、source map 等开发功能

#### 生产模式 (`quasar build`)
- 自动设置 `NODE_ENV=production`
- 加载 `.env.production` 文件
- 启用代码压缩、优化等生产功能

### 3. 环境文件优先级
```
1. .env.local (最高优先级，被 git 忽略)
2. .env.[NODE_ENV].local 
3. .env.[NODE_ENV] (如 .env.production, .env.development)
4. .env (默认配置)
```

## 🛠️ 修复后的配置

### package.json 脚本
```json
{
  "scripts": {
    "dev": "quasar dev",           // 开发模式
    "build": "quasar build",       // 生产构建
    "build:prod": "quasar build",  // 生产构建（别名）
    "build:pwa": "quasar build -m pwa",
    "build:electron": "quasar build -m electron"
  }
}
```

### 部署脚本修改
```bash
# 之前（错误）
npm run build:prod  # quasar build --mode production

# 修复后（正确）
npm run build       # quasar build
```

## 📱 Quasar 目标平台模式

如果需要构建不同平台版本，使用 `-m` 参数：

```bash
# SPA (默认)
quasar build

# PWA
quasar build -m pwa

# Electron 桌面应用
quasar build -m electron

# Capacitor 移动应用
quasar build -m capacitor

# 多个平台
quasar build -m pwa,electron
```

## 🔧 环境变量验证

### 检查当前环境
```javascript
// 在应用中检查
console.log('当前环境:', process.env.NODE_ENV)
console.log('API地址:', import.meta.env.VITE_API_BASE_URL)
console.log('是否开发模式:', process.env.DEV)
console.log('是否生产模式:', process.env.PROD)
```

### 开发模式特征
- `process.env.NODE_ENV === 'development'`
- `process.env.DEV === true`
- `process.env.PROD === false`

### 生产模式特征  
- `process.env.NODE_ENV === 'production'`
- `process.env.DEV === false`
- `process.env.PROD === true`

## 🚀 部署最佳实践

### 1. 本地测试生产构建
```bash
# 构建生产版本
npm run build

# 预览生产构建（可选）
npm install -g serve
serve dist/spa
```

### 2. 环境配置检查
```bash
# 确保生产环境文件存在
ls -la .env*

# 检查生产配置
cat .env.production
```

### 3. 构建产物验证
```bash
# 检查构建目录
ls -la dist/spa/

# 检查文件大小
du -sh dist/spa/
```

现在构建命令已修复，应该可以正常工作了！
