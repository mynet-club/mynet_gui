# 监听参数逻辑修正记录

## 修正概述

根据用户澄清，修正了`listen`参数的设计逻辑：
- **配置存储**：`listen`参数只存储端口号（整数类型）
- **预览显示**：根据`ipv4_only`/`ipv6_only`设置动态组装完整的监听地址

## 正确的设计逻辑

### 配置参数
```typescript
listen: {
  name: '监听端口',
  type: 'integer',        // 整数类型，只存储端口号
  default: 9001,
  min: 1024,
  max: 65535,
  required: true,
  description: '节点监听的UDP端口号'
}
```

### 显示逻辑（配置预览时）
```javascript
const listenPort = formData.value.listen || 9001
const ipv4Only = formData.value.ipv4_only === 'on'
const ipv6Only = formData.value.ipv6_only === 'on'

let listenDisplay
if (ipv4Only) {
  listenDisplay = `0.0.0.0:${listenPort}`     // IPv4专用
} else if (ipv6Only) {
  listenDisplay = `[::]:${listenPort}`        // IPv6专用  
} else {
  listenDisplay = listenPort                  // 全部监听（只显示端口）
}
```

## 预览示例

### 场景1：默认设置（全部监听）
**配置**：
```json
{
  "listen": 9001,
  "ipv4_only": "off",
  "ipv6_only": "off"
}
```

**预览显示**：
```bash
listen 9001
```

### 场景2：仅IPv4
**配置**：
```json
{
  "listen": 9001,
  "ipv4_only": "on",
  "ipv6_only": "off"
}
```

**预览显示**：
```bash
listen 0.0.0.0:9001
```

### 场景3：仅IPv6
**配置**：
```json
{
  "listen": 9001,
  "ipv4_only": "off", 
  "ipv6_only": "on"
}
```

**预览显示**：
```bash
listen [::]:9001
```

## 修正的文件

### 1. `/src/config/vpnConfig.ts`
- 将`listen`改为`integer`类型
- 名称改为"监听端口"
- 描述更新为端口号相关

### 2. `/src/types/nodeConfig.ts`  
- `FlatConfigUpdateRequest`中`listen`字段改为`number`类型

### 3. `/src/pages/node/edit/NodeConfigPage.vue`
- **配置预览逻辑**：在`renderConfigSection`中添加`listen`参数的特殊处理
- **默认值**：改为数字`9001`
- **数据提交**：确保提交数字类型

### 4. `/src/pages/node/edit/NodeConfigPageNew.vue`
- **配置预览逻辑**：在网络配置部分添加动态地址组装
- **数据提交**：确保提交数字类型

## 优势分析

### 🎯 逻辑清晰
- **存储简单**：只存储端口号，避免地址格式复杂性
- **显示灵活**：根据IPv4/IPv6设置动态组装显示
- **配置直观**：用户只需关心端口号

### 🔧 实现简洁
- **类型统一**：端口号使用标准整数类型
- **验证简单**：只需验证端口号范围（1024-65535）
- **兼容性好**：后端容易处理整数端口号

### 📝 配置文件语义
- **全监听**：`listen 9001` - 简洁明了
- **IPv4专用**：`listen 0.0.0.0:9001` - 明确指定IPv4
- **IPv6专用**：`listen [::]:9001` - 标准IPv6格式

## 数据流程

### 用户输入
```
端口号：9001
仅IPv4：启用
```

### 存储格式
```json
{
  "listen": 9001,
  "ipv4_only": "on"
}
```

### 配置预览
```bash
# 节点监听的UDP端口号
listen 0.0.0.0:9001
```

### 实际部署
后端根据`listen`端口号和`ipv4_only`设置进行相应的网络绑定。

## 验证要点

1. ✅ `listen`参数在表单中显示为数字输入框
2. ✅ 默认值9001正确设置
3. ✅ 配置预览根据IPv4/IPv6设置正确显示地址格式
4. ✅ 数据提交时`listen`为数字类型
5. ✅ 端口号验证范围正确（1024-65535）

## 版本信息
- 修正日期：2025年8月31日
- 修正类型：逻辑澄清和实现修正
- 影响范围：监听端口配置和预览显示
- 兼容性：向后兼容，数据类型更标准
