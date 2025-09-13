# 监听参数合并调整记录

## 修改概述

根据用户需求，对GNB配置参数进行简化调整：
1. **删除**：`listen6` 参数（IPv6监听地址）
2. **合并**：`listen_address` 和 `listen_port` 合并为单一的 `listen` 参数
3. **默认值**：新的 `listen` 参数默认为 `0.0.0.0:9001`（全监听）

## 修改详情

### 参数变化

**修改前**：
```typescript
// 基础配置
listen_address: {
  name: '监听地址',
  type: 'string',
  default: '0.0.0.0',
  required: true,
  description: '节点监听的IP地址'
},
listen_port: {
  name: '监听端口', 
  type: 'integer',
  default: 9001,
  min: 1024,
  max: 65535,
  required: true,
  description: '节点监听的UDP端口号'
}

// 专家配置
listen6: {
  name: 'IPv6监听地址',
  type: 'string', 
  default: '::',
  description: 'IPv6监听地址，默认监听所有IPv6地址'
}
```

**修改后**：
```typescript
// 基础配置
listen: {
  name: '监听地址',
  type: 'string',
  default: '0.0.0.0:9001',
  required: true,
  description: '节点监听的地址和端口，格式：IP:端口，默认全监听'
}

// listen6 参数已删除
```

### 配置文件格式变化

**修改前**：
```bash
# GNB 节点配置文件
listen-address 0.0.0.0
listen-port 9001
listen6 ::
```

**修改后**：
```bash
# GNB 节点配置文件
listen 0.0.0.0:9001
```

### 数据提交格式变化

**修改前**：
```json
{
  "listen_address": "0.0.0.0",
  "listen_port": 9001,
  "listen6": "::"
}
```

**修改后**：
```json
{
  "listen": "0.0.0.0:9001"
}
```

## 修改的文件

### 1. `/src/config/vpnConfig.ts`
- 删除 `listen6` 参数定义
- 将 `listen_address` 和 `listen_port` 合并为 `listen`
- 更新默认值和描述

### 2. `/src/pages/node/edit/NodeConfigPage.vue`
- 更新数据预填充逻辑
- 修改配置提交数据结构
- 移除对旧参数的引用

### 3. `/src/pages/node/edit/NodeConfigPageNew.vue`
- 更新配置预览显示逻辑
- 修改GNB和WireGuard配置模板
- 更新数据提交结构

### 4. `/src/types/nodeConfig.ts`
- 更新 `FlatConfigUpdateRequest` 接口
- 移除 `listen_address`、`listen_port`、`listen6` 字段
- 添加新的 `listen` 字段定义

## 优势分析

### 🎯 配置简化
- **参数减少**：从3个监听相关参数减少到1个
- **格式统一**：`IP:端口` 格式更直观
- **默认全监听**：`0.0.0.0:9001` 适合大多数场景

### 📝 配置文件清晰
- **行数减少**：配置文件更简洁
- **语义明确**：单一参数避免地址/端口分离的混淆
- **易于理解**：标准的 `host:port` 格式

### 🔧 维护便利
- **代码简化**：减少参数验证和处理逻辑
- **类型安全**：统一的字符串类型处理
- **错误减少**：避免地址/端口不匹配的问题

## 兼容性考虑

### 后端适配
⚠️ **需要后端配合**：
- 后端需要支持解析 `listen` 参数的 `IP:端口` 格式
- 需要处理从旧的 `listen_address` + `listen_port` 格式的迁移
- IPv6支持需要通过 `listen` 参数实现（如 `[::]:9001`）

### 数据迁移
```javascript
// 迁移示例
const oldConfig = {
  listen_address: "0.0.0.0",
  listen_port: 9001
}

const newConfig = {
  listen: `${oldConfig.listen_address}:${oldConfig.listen_port}`
}
```

## 格式示例

### IPv4 监听
```bash
listen 0.0.0.0:9001      # 全监听
listen 192.168.1.100:9001 # 指定IP
listen :9001             # 所有接口（简写）
```

### IPv6 监听
```bash
listen [::]:9001         # IPv6全监听
listen [2001:db8::1]:9001 # 指定IPv6地址
```

## 验证步骤

1. ✅ 检查基础配置中 `listen` 参数显示正确
2. ✅ 验证默认值 `0.0.0.0:9001` 生效
3. ✅ 确认配置预览格式正确：`listen 0.0.0.0:9001`
4. ✅ 测试数据保存和加载
5. ✅ 验证类型检查通过

## 版本信息
- 修改日期：2025年8月31日
- 影响范围：监听配置参数
- 兼容性：需要后端配合
- 类型：参数合并优化
