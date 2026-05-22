# MyNet Frontend 部署文档

## 概述

本文档描述了MyNet前端项目的部署流程、配置和维护操作。

## 服务器信息

- **服务器地址**: 112.124.22.220
- **用户**: root
- **部署路径**: /alidata/www/dsplat.com/mynet.dsplat.com/front
- **域名**: mynet.dsplat.com
- **后端API**: api.mynet.dsplat.com

## 部署脚本说明

### 1. deployment.sh - 完整部署脚本

功能最完整的部署脚本，包含所有检查和优化步骤。

```bash
# 赋予执行权限
chmod +x deployment.sh

# 执行部署
./deployment.sh
```

**功能包括**:
- 环境依赖检查
- SSH连接测试
- 依赖安装
- 环境配置更新
- 项目构建
- 远程备份
- 文件同步
- 权限设置
- Nginx重启
- 部署验证

### 2. quick-deploy.sh - 快速部署脚本

简化版部署脚本，适用于频繁更新的场景。

```bash
# 赋予执行权限
chmod +x quick-deploy.sh

# 快速部署
./quick-deploy.sh
```

**功能包括**:
- 快速构建
- 文件同步
- Nginx重载

### 3. pre-deploy-check.sh - 部署前检查

在部署前检查环境和配置是否正确。

```bash
# 赋予执行权限
chmod +x pre-deploy-check.sh

# 执行检查
./pre-deploy-check.sh
```

**检查项目**:
- Node.js版本
- 依赖安装
- 代码质量
- Git状态
- SSH连接
- 远程权限
- Nginx配置

### 4. rollback.sh - 回滚脚本

当部署出现问题时，快速回滚到之前的版本。

```bash
# 赋予执行权限
chmod +x rollback.sh

# 执行回滚
./rollback.sh
```

## 配置文件说明

### 1. .env.production - 生产环境配置

包含生产环境的所有配置变量：

```bash
NODE_ENV=production
VITE_API_BASE_URL=https://api.mynet.dsplat.com
VITE_WS_URL=wss://api.mynet.dsplat.com
# ... 其他配置
```

### 2. nginx.conf - Nginx配置模板

完整的Nginx配置文件模板，包含：
- SSL配置
- 静态文件缓存
- Gzip压缩
- 安全标头
- API代理配置
- WebSocket支持

**部署到服务器**:
```bash
# 复制配置文件
scp nginx.conf root@112.124.22.220:/etc/nginx/sites-available/mynet.dsplat.com

# 启用站点
ssh root@112.124.22.220 "ln -sf /etc/nginx/sites-available/mynet.dsplat.com /etc/nginx/sites-enabled/"

# 测试配置
ssh root@112.124.22.220 "nginx -t"

# 重载Nginx
ssh root@112.124.22.220 "systemctl reload nginx"
```

## 部署流程

### 首次部署

1. **环境准备**
   ```bash
   # 确保SSH密钥已配置
   ssh-copy-id root@112.124.22.220
   
   # 安装依赖
   npm install
   ```

2. **配置Nginx**
   ```bash
   # 部署Nginx配置
   scp nginx.conf root@112.124.22.220:/etc/nginx/sites-available/mynet.dsplat.com
   ssh root@112.124.22.220 "ln -sf /etc/nginx/sites-available/mynet.dsplat.com /etc/nginx/sites-enabled/"
   ```

3. **执行部署**
   ```bash
   ./deployment.sh
   ```

### 日常更新

1. **代码更新后快速部署**
   ```bash
   ./quick-deploy.sh
   ```

2. **重要更新使用完整部署**
   ```bash
   ./deployment.sh
   ```

### 紧急回滚

```bash
./rollback.sh
```

## 监控和维护

### 1. 检查部署状态

```bash
# 检查部署信息
curl https://mynet.dsplat.com/deployment-info

# 检查健康状态
curl https://mynet.dsplat.com/health
```

### 2. 查看日志

```bash
# Nginx访问日志
ssh root@112.124.22.220 "tail -f /var/log/nginx/mynet.dsplat.com.access.log"

# Nginx错误日志
ssh root@112.124.22.220 "tail -f /var/log/nginx/mynet.dsplat.com.error.log"
```

### 3. 服务器维护

```bash
# 清理旧备份（保留最近10个）
ssh root@112.124.22.220 "ls -1t /tmp/mynet-frontend-backup-* | tail -n +11 | xargs rm -rf"

# 检查磁盘空间
ssh root@112.124.22.220 "df -h"

# 检查Nginx状态
ssh root@112.124.22.220 "systemctl status nginx"
```

## 故障排除

### 1. 部署失败

1. **检查SSH连接**
   ```bash
   ssh root@112.124.22.220
   ```

2. **检查远程目录权限**
   ```bash
   ssh root@112.124.22.220 "ls -la /alidata/www/dsplat.com/mynet.dsplat.com/"
   ```

3. **查看构建错误**
   ```bash
   npm run build
   ```

### 2. 网站无法访问

1. **检查Nginx状态**
   ```bash
   ssh root@112.124.22.220 "systemctl status nginx"
   ```

2. **检查Nginx配置**
   ```bash
   ssh root@112.124.22.220 "nginx -t"
   ```

3. **检查端口监听**
   ```bash
   ssh root@112.124.22.220 "netstat -tlnp | grep :80\|:443"
   ```

### 3. API连接问题

1. **检查API服务状态**
   ```bash
   curl -I https://api.mynet.dsplat.com/health
   ```

2. **检查跨域配置**
   - 确认API服务器允许 `mynet.dsplat.com` 域名

3. **检查网络连接**
   ```bash
   ssh root@112.124.22.220 "curl -I https://api.mynet.dsplat.com"
   ```

## 安全注意事项

1. **SSH密钥管理**
   - 定期更新SSH密钥
   - 使用强密码保护私钥

2. **SSL证书**
   - 定期检查证书过期时间
   - 及时更新SSL证书

3. **访问日志监控**
   - 定期查看访问日志
   - 监控异常访问模式

4. **备份策略**
   - 定期清理旧备份
   - 保持合理的备份数量

## 联系信息

如有问题，请联系开发团队或系统管理员。

---

**注意**: 首次使用前，请确保所有脚本都有执行权限：

```bash
chmod +x *.sh
```
