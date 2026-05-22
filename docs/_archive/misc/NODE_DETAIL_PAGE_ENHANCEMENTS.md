# 节点详情页面功能增强

## 修复的问题

### 1. 节点状态显示修复
**问题**：当 `node_status = 2` 时，显示"未知"而不是"在线"
**解决方案**：
- 确认 `NODE_STATUS.ONLINE = 2` 的定义正确
- 状态处理逻辑 `getStatusText()` 方法中正确映射 `case NODE_STATUS.ONLINE: return '在线'`
- 状态显示使用 `node.status || node.node_status` 确保兼容性

### 2. 编辑操作入口优化
**问题**：编辑功能需要提供多个直接入口
**解决方案**：
- 将原有的"编辑"按钮改为下拉菜单
- 添加4个独立的编辑入口：
  - `/nodes/{id}/edit/basic` - 基本信息编辑
  - `/nodes/{id}/edit/config` - 节点配置编辑  
  - `/nodes/{id}/edit/network` - 网络配置编辑
  - `/nodes/{id}/edit/keys` - 密钥管理编辑

**实现的方法**：
```typescript
const goToEditBasic = () => {
  router.push(`/nodes/${nodeId.value}/edit/basic`)
}
const goToEditConfig = () => {
  router.push(`/nodes/${nodeId.value}/edit/config`)
}
const goToEditNetwork = () => {
  router.push(`/nodes/${nodeId.value}/edit/network`)
}
const goToEditKeys = () => {
  router.push(`/nodes/${nodeId.value}/edit/keys`)
}
```

### 3. 虚拟IP地址显示优化
**问题**：需要在虚拟IP地址后显示IP组序号
**解决方案**：
- 实现 `getVirtualIPWithSequence()` 方法
- 格式：`10.244.124.193@2503551`
- 如果没有IP组序号，只显示IP地址
- 如果没有IP地址，显示"未分配"

**实现的方法**：
```typescript
const getVirtualIPWithSequence = () => {
  const virtualIP = networkConfig.value?.node_ip || node.value?.node_ip || node.value?.ip_address
  const sequence = networkConfig.value?.ip_group_sequence_number || node.value?.ip_group_sequence_number
  
  if (!virtualIP) return '未分配'
  if (!sequence) return virtualIP
  
  return `${virtualIP}@${sequence}`
}
```

### 4. 端点地址显示优化
**问题**：端点地址为空时，应该显示公网地址
**解决方案**：
- 实现 `getEndpointAddress()` 方法
- 优先显示端点地址 `node.endpoint`
- 如果端点地址为空，显示第一个公网IP地址
- 如果都没有，显示"未设置"

**实现的方法**：
```typescript
const getEndpointAddress = () => {
  // 如果有端点地址，直接返回
  if (node.value?.endpoint) {
    return node.value.endpoint
  }
  
  // 如果端点地址为空，显示公网地址
  const publicIPs = getPublicIPs()
  if (publicIPs.length > 0) {
    return publicIPs[0] // 取第一个公网IP
  }
  
  return '未设置'
}
```

## UI/UX 改进

### 编辑按钮组
- 使用 `q-btn-dropdown` 组件创建下拉菜单
- 每个编辑选项有独立的图标和说明：
  - 基本信息：`info` 图标
  - 节点配置：`settings` 图标
  - 网络配置：`router` 图标
  - 密钥管理：`vpn_key` 图标

### 网络信息显示
- **虚拟IP地址**：显示IP@序号格式，便于识别IP分组
- **端点地址**：智能显示，确保用户总能看到有效的连接地址

## 技术实现

### 路由配置
需要确保以下路由存在：
```typescript
{
  path: '/nodes/:id/edit/basic',
  component: () => import('pages/node/NodeEditBasicPage.vue')
},
{
  path: '/nodes/:id/edit/config', 
  component: () => import('pages/node/NodeEditConfigPage.vue')
},
{
  path: '/nodes/:id/edit/network',
  component: () => import('pages/node/NodeEditNetworkPage.vue')
},
{
  path: '/nodes/:id/edit/keys',
  component: () => import('pages/node/NodeEditKeysPage.vue')
}
```

### 状态处理
- 支持数字状态码（-1, 0, 1, 2, 99）
- 向后兼容字符串状态（'active', 'inactive', 'pending'）
- 统一的状态显示逻辑

### 数据来源优先级
1. **虚拟IP**：`networkConfig.node_ip` → `node.node_ip` → `node.ip_address`
2. **IP组序号**：`networkConfig.ip_group_sequence_number` → `node.ip_group_sequence_number`
3. **端点地址**：`node.endpoint` → `publicIPs[0]` → "未设置"

## 测试要点

1. **状态显示测试**：验证所有状态码（-1,0,1,2,99）的正确显示
2. **编辑按钮测试**：确认4个编辑入口路由正确跳转
3. **网络信息测试**：
   - 有IP组序号时显示格式正确
   - 无IP组序号时只显示IP
   - 无IP时显示"未分配"
4. **端点地址测试**：
   - 有端点地址时直接显示
   - 无端点地址但有公网IP时显示公网IP
   - 都没有时显示"未设置"

## 兼容性保证

- 保持现有API调用不变
- 向后兼容旧的状态显示逻辑
- 优雅处理缺失数据的情况
- 不影响其他页面的功能
