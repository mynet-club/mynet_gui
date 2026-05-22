# Switch控件初始化问题修复记录

## 问题描述

在节点配置页面中，多路复用(multi_socket)的switch控件无法正常初始化。

## 问题分析

### API返回数据格式
```json
{
    "success": true,
    "code": 200,
    "message": "节点配置获取成功",
    "data": {
        "ifname": "gnb_tun",
        "listen_address": "0.0.0.0",
        "listen_port": 9001,
        "mtu": 1450,
        "multi_socket": "on",  // ← 这里是字符串值
        "zip": "auto",
        "daemon": "on",
        // ... 其他字段
    }
}
```

### 配置定义
```typescript
multi_socket: {
  name: '多路复用',
  type: 'switch',
  default: 'off',
  options: {
    'on': '启用',    // ← true-value
    'off': '禁用'    // ← false-value
  },
  description: '多套接字打洞（NAT 环境下更好）'
}
```

### 问题根源
1. **数据格式变化**：API返回格式从嵌套结构改为扁平化结构
2. **类型处理缺失**：原来的数据加载逻辑没有针对switch类型进行特殊处理
3. **数据格式识别**：加载逻辑没有适配新的API响应格式

## 解决方案

### 1. 修改数据加载逻辑
支持新的扁平化API响应格式：
```javascript
// 检查新的扁平化数据格式
if (configResponse.success && configResponse.data) {
  // 直接使用返回的数据覆盖表单
  safeOverrideWithServerData(configResponse.data)
}
```

### 2. 增强数据转换函数
在`safeOverrideWithServerData`中添加switch类型的特殊处理：
```javascript
// 对switch类型进行特殊处理
if (param.type === 'switch' && param.options) {
  const validOptions = Object.keys(param.options)
  if (validOptions.includes(String(value))) {
    convertedValue = String(value)  // 确保是字符串
  } else {
    convertedValue = param.default || validOptions[1] // 使用默认值
  }
}
```

### 3. 添加调试信息
在switch控件下方显示调试信息：
```vue
<small v-if="key === 'multi_socket'" class="text-grey-6 block q-mt-xs">
  调试: 当前值={{ formData[key] }}, true值={{ Object.keys(param.options)[0] }}, false值={{ Object.keys(param.options)[1] }}
</small>
```

## 修改的文件

### `/src/pages/node/edit/NodeConfigPage.vue`
1. **safeOverrideWithServerData函数**：增加switch类型处理逻辑
2. **onMounted函数**：支持新的扁平化API响应格式
3. **模板部分**：添加switch控件调试信息

## 验证步骤

1. **加载页面**：检查控制台日志，确认API数据正确加载
2. **查看调试信息**：确认switch当前值、true值、false值是否正确
3. **测试切换**：手动切换switch，确认值的变化
4. **保存测试**：保存配置，确认提交的数据格式正确

## 预期结果

- ✅ multi_socket switch能正确显示服务器返回的值（"on"状态）
- ✅ 调试信息显示：当前值=on, true值=on, false值=off  
- ✅ 用户可以正常切换switch状态
- ✅ 保存时提交正确的字符串值（"on"/"off"）

## 其他Switch控件
此修复同样适用于其他使用switch类型的配置项：
- `daemon`（守护进程）
- `forward`（转发）
- `address_secure`（地址安全）
- `direct_forwarding`（直接转发）
- `ipv4_only`（仅IPv4）
- `ipv6_only`（仅IPv6）

## 版本信息
- 修复日期：2025年8月31日
- 影响版本：当前开发版本
- 修复类型：Bug修复
