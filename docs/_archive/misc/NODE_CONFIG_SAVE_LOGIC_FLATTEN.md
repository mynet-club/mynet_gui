# 节点配置保存逻辑扁平化修改记录

## 修改概述

根据用户需求，将节点配置功能的保存配置逻辑修改为**分别提交字段**的形式，即直接将所有配置字段提交到API，而不是嵌套在对象结构中。

## 最终实现
提交的数据格式为扁平化结构，所有配置字段直接在顶层：
```json
{
  "vpn_type": "gnb",
  "vpn_version": "merged",
  "config_mode": "base",
  "nodeid": 7175750762685433,
  "ifname": "gnb_tun", 
  "listen_address": "0.0.0.0",
  "listen_port": 9001,
  "mtu": 1450,
  "multi_socket": "off",
  "listen6": "::",
  "direct_forwarding": "on",
  "unified_forwarding": "auto",
  "standard_forwarding": "on",
  "address_secure": "on", 
  "ipv4_only": "off",
  "ipv6_only": "off",
  "keepalive": 25,
  "forward": "on",
  "daemon": "on",
  "zip": "auto",
  "zip_level": -1,
  "memory": "tiny"
}
```

## 修改时间
2024年12月19日（最终更新：2025年8月31日）

## 涉及文件

### 1. /src/pages/node/edit/NodeConfigPage.vue
**修改内容：**
- 重构 `onSubmit` 函数保存逻辑
- 数据结构从嵌套的 `{parameters: {...}}` 改为直接的字段提交格式
- 移除复杂的配置验证和嵌套数据构建逻辑

**修改前：**
```javascript
const configData: NodeConfigForm = {
  vpn_type: vpnType.value,
  vpn_version: 'merged',
  config_mode: configMode.value,
  parameters: configParameters
}

const saveData: ConfigUpdateRequest = {
  vpn_type: vpnType.value,
  vpn_version: 'merged',
  config_mode: configMode.value as 'basic' | 'expert',
  basic_config: configParameters,
  network: { ... }
}
```

**修改后：**
```javascript
const submitData = {
  // 基础元数据
  vpn_type: vpnType.value,
  vpn_version: 'merged',
  config_mode: configMode.value,
  
  // 展平的配置字段（直接在顶层）
  ...formData.value,
  
  // 确保必要的网络字段有值
  nodeid: formData.value.nodeid || parseInt(nodeId.value) || 1000000000000000,
  ifname: formData.value.ifname || 'gnb_tun',
  listen_address: formData.value.listen_address || '0.0.0.0',
  listen_port: formData.value.listen_port || 9001
}
```

### 2. /src/pages/node/edit/NodeConfigPageNew.vue
**修改内容：**
- 同步修改 `onSubmit` 函数，保持与主页面一致的保存逻辑
- 数据结构扁平化处理

### 4. /src/types/nodeConfig.ts
**修改内容：**
- 修正配置模式类型定义，从 `'basic' | 'expert'` 改为 `'base' | 'expert'`
- 新增 `FlatConfigUpdateRequest` 接口，支持扁平化字段提交
- 更新相关类型接口以保持一致性

**新增接口：**
```typescript
export interface FlatConfigUpdateRequest {
  vpn_type: VPNType
  vpn_version: string
  config_mode: ConfigMode
  
  // 所有配置字段直接提交，不嵌套
  nodeid?: number
  ifname?: string
  listen_address?: string
  listen_port?: number
  mtu?: number
  // ... 其他字段
  [key: string]: any  // 允许动态字段
}
```

### 5. /src/services/node/nodeConfigService.ts
**修改内容：**
- 更新 `updateNodeConfig` 方法签名，支持新的 `FlatConfigUpdateRequest` 类型
- 修正示例数据中的配置模式类型错误

## 技术细节

### 数据结构变化

**原有嵌套结构：**
```json
{
  "vpn_type": "gnb",
  "vpn_version": "merged",
  "config_mode": "base",
  "parameters": {
    "listen_port": 9001,
    "nodeid": 1000000000000000,
    "ifname": "gnb_tun",
    "mtu": 1400,
    // ... 其他配置字段
  }
}
```

**新的扁平化结构：**
```json
{
  "vpn_type": "gnb",
  "vpn_version": "merged", 
  "config_mode": "base",
  "listen_port": 9001,
  "nodeid": 1000000000000000,
  "ifname": "gnb_tun",
  "mtu": 1400,
  // ... 其他配置字段直接在顶层
}
```

### 优势分析

1. **API简化**：减少了前后端数据结构的复杂性
2. **数据处理简化**：无需在前端进行额外的数据嵌套/展平操作
3. **维护便利**：降低了数据结构变更的复杂度
4. **一致性提升**：配置字段直接对应API字段，减少映射错误

### 配置类型统一

解决了配置模式类型不一致的问题：
- 配置文件 (`vpnConfig.ts`) 中使用 `base`
- 类型定义中原本使用 `basic`
- 统一修改为 `base` 以保持一致性

## 影响范围

### 前端影响
- ✅ 节点配置页面保存逻辑简化
- ✅ 数据提交格式统一
- ✅ TypeScript 类型检查通过

### 后端影响
- ⚠️ 需要确认后端 API 是否支持扁平化的数据接收格式
- ⚠️ 可能需要更新后端数据处理逻辑

## 测试建议

1. **功能测试**
   - 测试基础模式下的配置保存
   - 测试专家模式下的配置保存
   - 验证所有配置字段是否正确提交

2. **API测试**
   - 确认后端能正确接收扁平化数据
   - 验证数据验证逻辑是否正常工作
   - 测试配置更新后的节点功能

3. **兼容性测试**
   - 验证现有节点配置是否能正常加载
   - 测试不同VPN类型的配置保存

## 注意事项

1. **向后兼容性**：确保修改不影响现有的节点配置数据
2. **API契约**：需要与后端团队确认新的数据格式是否符合API预期
3. **错误处理**：保持原有的错误处理逻辑，确保用户体验不受影响

## 后续工作

1. 与后端团队确认API接收格式
2. 更新相关的API文档
3. 进行完整的集成测试
4. 如需要，更新其他相关页面的数据提交逻辑

## 版本信息
- 修改版本：当前开发版本
- 修改人：GitHub Copilot
- 审核状态：待审核
