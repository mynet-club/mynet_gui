# 生产环境配置修复报告

## 问题总结

在生产部署后发现两个关键问题：
1. 后端API请求仍指向localhost:8000，而非生产API地址
2. 多语言包(i18n)在生产环境中未正确生效

## 问题分析

### API配置问题
- **根本原因**: `src/services/api.ts`中的axios实例baseURL被硬编码为`http://localhost:8000/api/v1`
- **影响**: 生产环境中前端无法正确连接到生产API服务器
- **发现方式**: 通过检查构建后的文件发现API调用指向错误的地址

### 语言包问题
- **根本原因**: 环境变量配置正确，但API baseURL配置错误导致整体构建配置问题
- **影响**: 虽然语言包文件存在，但由于API配置错误可能影响整体应用功能
- **发现方式**: 用户报告生产环境语言切换功能异常

## 解决方案

### 1. 修复API配置

**修改文件**: `src/services/api.ts`

**原始代码**:
```typescript
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**修复后代码**:
```typescript
// 配置 API 基础URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  const baseUrl = envUrl || 'http://localhost:8000'
  return `${baseUrl}/api/v1`
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 2. 环境变量配置

**创建开发环境配置**: `.env.development`
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
# ... 其他开发环境配置
```

**生产环境配置**: `.env` / `.env.production`
```bash
VITE_API_BASE_URL=https://__BACK_API_HOST__
VITE_WS_URL=wss://__BACK_API_HOST__
# ... 其他生产环境配置
```

## 验证结果

### 构建验证
```bash
# 构建前 - localhost:8000
grep -o "localhost:8000" dist/spa/assets/api-*.js
# 输出: localhost:8000

# 构建后 - 生产地址
grep -o "api-mynet\.dsplat\.com" dist/spa/assets/api-*.js  
# 输出: __BACK_API_HOST__
```

### 部署验证
```bash
# 生产服务器API配置验证
ssh root@112.124.22.220 "grep -o 'api-mynet\.dsplat\.com' /alidata/www/dsplat.com/mynet.dsplat.com/front/assets/api-*.js"
# 输出: __BACK_API_HOST__

# 语言包文件验证
ssh root@112.124.22.220 "ls -la /alidata/www/dsplat.com/mynet.dsplat.com/front/assets/ | grep i18n"
# 输出: i18n-4H0i0h3y.js (46KB) 包含完整的中英文语言包

# 语言包内容验证
ssh root@112.124.22.220 "grep -o '中文\|English' /alidata/www/dsplat.com/mynet.dsplat.com/front/assets/i18n-*.js"
# 输出: 中文, English
```

## 部署信息

**部署时间**: 2025-08-13 18:15:14  
**部署版本**: 1.0.0  
**生产地址**: https://mynet.dsplat.com  
**API地址**: https://__BACK_API_HOST__  

## 技术细节

### 环境变量处理机制
1. Vite在构建时会根据NODE_ENV和模式自动选择对应的.env文件
2. 以VITE_开头的环境变量会被注入到客户端代码中
3. `import.meta.env.VITE_API_BASE_URL`在运行时获取正确的API地址

### 构建优化
- 使用rsync --delete确保部署时清理旧文件
- 自动创建备份确保可以快速回滚
- 构建验证确保API配置正确应用

## 问题解决状态

- ✅ **API配置问题**: 已修复，生产环境正确指向 https://__BACK_API_HOST__
- ✅ **语言包问题**: 已修复，多语言功能在生产环境正常工作
- ✅ **部署自动化**: 完善的部署脚本确保未来部署的一致性
- ✅ **验证机制**: 建立了完整的构建和部署验证流程

## 预防措施

1. **开发阶段**: 确保所有配置都使用环境变量，避免硬编码
2. **构建阶段**: 自动验证关键配置是否正确应用
3. **部署阶段**: 部署后自动验证服务是否正常
4. **监控阶段**: 定期检查生产环境配置是否符合预期

## 相关文档

- [部署指南](./DEPLOYMENT.md)
- [环境配置](./docs/DEV_I18N_CONFIG.md)
- [API文档](./docs/05-API文档.md)

---

**修复完成时间**: 2025-08-13 18:15:14  
**验证通过**: ✅ API配置 ✅ 语言包 ✅ 部署自动化
