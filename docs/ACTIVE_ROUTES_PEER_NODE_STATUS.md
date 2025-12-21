# 活跃路由页面节点状态显示

## 更新概述

完成了活跃路由页面（卡片视图和列表视图）的节点状态显示功能，正确使用 `peer_node_status` 字段显示对端节点的配置和运行状态。

## 节点状态定义

根据后端API返回的 `peer_node_status` 字段，节点状态分为以下几种：

  | 状态码 | 含义 | 颜色 | 图标 | 说明 |
|--------|------|------|------|------|
| -1 | 未完成配置 | warning (黄色) | settings | 节点尚未完成基础配置 |
| 0 | 完成配置未启用 | grey (灰色) | cancel | 节点已配置但被管理员禁用 |
|  | 在线 | positive (绿色) | check_circle | 节点正常在线运行 |

## API 数据结构

### 请求

```
GET /monitor/history/connections?node_id=3764021915150630&last=1
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "node_id": 3764021915150630,
        "peer_id": 8283289760467957,
        "online": true,
        "conn_type": "direct_ipv4",
        "latency": 33.624,
        "rx_bytes": 91949,
        "tx_bytes": 12636,
        "seen_at": "2025-12-15T15:09:46+00:00",
        "peer_node_status": 2  // 对端节点状态
      }
    ],
    "nodes_metadata": {
      "8283289760467957": {
        "node_id": 8283289760467957,
        "node_name": "和谐家园",
        "zone_id": 3678250676883169,
        "node_status": 2,
        "user_id": 3844197700300659,
        "user_name": null
      }
    }
  }
}
```

## 数据字段说明

### connections 数组

每个连接对象包含：

- **基础信息**
  - `node_id`: 当前节点ID
  - `peer_id`: 对端节点ID
  - `id`: 连接记录ID（实时数据时为null）

- **连接状态**
  - `online`: 是否在线（布尔值）
  - `conn_type`: 连接类型（direct_ipv4, direct_ipv6, relay, derp, none）
  - `latency`: 延迟（毫秒）
  - `rx_bytes`: 接收字节数
  - `tx_bytes`: 发送字节数

- **时间戳**
  - `seen_at`: 最后可见时间
  - `snapshot_at`: 快照时间
  - `created_at`: 创建时间

- **关键字段**
  - `peer_node_status`: **对端节点状态**（-1/0/1/2）
  - `is_realtime`: 是否为实时数据

### nodes_metadata 对象

以 `peer_id` 为键，包含对端节点的元数据：

- `node_id`: 节点ID
- `node_name`: 节点名称
- `zone_id`: 区域ID
- `node_status`: 节点状态（与 peer_node_status 相同）
- `user_id`: 所属用户ID
- `user_name`: 用户名称
- `ip_addresses`: IP地址列表（可选）

## 实现细节

### 1. ActiveRoutesPage.vue - 数据获取和处理

**修改前（旧逻辑）：**
```typescript
// 分别调用两个接口
const routeResponse = await api.get(`/route/node/${nodeId}`)
const monitorResponse = await api.get('/monitor/history/connections', {
  params: { node_id: nodeId, last: 1 }
})
// 手动合并数据
```

**修改后（新逻辑）：**
```typescript
// 只调用一个接口，包含所有需要的数据
const monitorResponse = await api.get('/monitor/history/connections', {
  params: { node_id: nodeId, last: 1 }
})

const connections = monitorResponse.data.data.connections || []
const nodesMetadata = monitorResponse.data.data.nodes_metadata || {}

// 处理并合并数据
const processedConnections = connections.map((conn: any) => {
  const peerId = String(conn.peer_id)
  const peerMetadata = nodesMetadata[peerId] || {}
  
  return {
    // 连接状态
    online: conn.online,
    conn_type: conn.conn_type,
    latency: conn.latency,
    
    // 对端节点状态（关键字段）
    peer_node_status: conn.peer_node_status,
    node_status: conn.peer_node_status,
    
    // 对端节点信息
    node_name: peerMetadata.node_name,
    user_name: peerMetadata.user_name,
    ip_addresses: peerMetadata.ip_addresses || []
  }
})
```

### 2. NodeRouteCardView.vue - 卡片视图

**状态显示代码：**
```vue
<q-chip
  :color="NodeStatusManager.getStatusColor(node.node_status)"
  text-color="white"
  :label="NodeStatusManager.getStatusText(node.node_status)"
  size="sm"
/>
```

**效果：**
- 使用统一的 NodeStatusManager 管理状态显示
- 根据 `node_status`（即 `peer_node_status`）动态显示颜色和文本
- 自动处理所有状态码（-1, 0, 1, 2）

### 3. RouteListView.vue - 列表视图

**修改内容：**

1. **导入 NodeStatusManager：**
```typescript
import { NodeStatusManager } from '../../utils/nodeStatus'
```

2. **更新列定义：**
```typescript
{
  name: 'online',
  label: '节点状态',      // 从"状态"改为"节点状态"
  field: 'node_status',   // 从"online"改为"node_status"
  align: 'center',
  sortable: true
}
```

3. **更新状态列模板：**
```vue
<!-- 节点状态列 -->
<template #body-cell-online="props">
  <q-td :props="props">
    <q-chip
      :color="NodeStatusManager.getStatusColor(props.row.node_status)"
      text-color="white"
      size="sm"
    >
      {{ NodeStatusManager.getStatusText(props.row.node_status) }}
    </q-chip>
  </q-td>
</template>
```

4. **移除旧的辅助函数：**
```typescript
// ❌ 删除
const getOnlineStatus = (row: any) => {
  if (row.node_status !== undefined) {
    return row.node_status === 2
  }
  return row.online || false
}
```

## 状态显示效果

### 卡片视图

每个节点卡片右上角显示状态标签：

- **在线** (绿色) - peer_node_status: 2
- **启用但离线** (橙色) - peer_node_status: 1
- **已禁用** (灰色) - peer_node_status: 0
- **未完成配置** (黄色) - peer_node_status: -1

### 列表视图

表格中的"节点状态"列显示：

| 节点名称 | IP地址 | 节点状态 | 连接类型 | 延迟 |
|---------|--------|---------|---------|------|
| 和谐家园 | 192.168.1.1 | **在线** | 直连 IPv4 | 33.6ms |
| 新加坡 | 10.0.0.1 | **在线** | 直连 IPv4 | 119.0ms |
| 馒头内网 | - | **启用但离线** | 中继 | - |
| 天津Home | 172.16.0.1 | **启用但离线** | 直连 IPv4 | 426.3ms |

## 连接类型映射

在列表和卡片中都使用的连接类型映射：

```typescript
const connectionTypeMap = {
  'direct_ipv4': '直连 IPv4',
  'direct_ipv6': '直连 IPv6',
  'relay': '中继',
  'derp': 'DERP 中继',
  'none': '无连接',
  'unknown': '未知'
}
```

**颜色映射：**
- `direct_ipv4` / `direct_ipv6` → 绿色 (positive)
- `relay` / `derp` → 蓝色 (info)
- `none` / `unknown` → 灰色 (grey)

## 优势

### 1. 数据一致性
- 单一数据源，避免数据不同步
- `peer_node_status` 直接来自后端，无需前端判断

### 2. 性能优化
- 减少API请求（从2个减少到1个）
- `last=1` 参数只获取最新数据，减少数据量

### 3. 可维护性
- 使用统一的 NodeStatusManager
- 所有状态显示逻辑集中管理
- 易于扩展新的状态类型

### 4. 用户体验
- 清晰的状态标识（颜色 + 文字 + 图标）
- 一目了然的节点配置和运行状态
- 区分"在线"、"离线"、"禁用"、"未配置"等不同场景

## 测试验证

### 场景1：完全在线的节点
```json
{
  "online": true,
  "peer_node_status": 2
}
```
**显示：** 绿色标签"在线"

### 场景2：启用但离线的节点
```json
{
  "online": false,
  "peer_node_status": 1
}
```
**显示：** 橙色标签"启用但离线"

### 场景3：禁用的节点
```json
{
  "online": false,
  "peer_node_status": 0
}
```
**显示：** 灰色标签"已禁用"

### 场景4：未完成配置的节点
```json
{
  "online": false,
  "peer_node_status": -1
}
```
**显示：** 黄色标签"未完成配置"

## 浏览器测试

访问以下路径验证功能：

1. **卡片视图：** `/app/routes/active/3764021915150630`
2. **列表视图：** `/app/routes/active/3764021915150630/list`

**检查点：**
- ✅ 状态标签显示正确的颜色和文本
- ✅ 节点名称从 nodes_metadata 正确显示
- ✅ 所有节点状态（-1, 0, 1, 2）都能正确识别
- ✅ IP地址列表正确渲染
- ✅ 连接类型显示正确

## 相关文档

- [活跃路由优化计划](./ACTIVE_ROUTES_OPTIMIZATION_PLAN.md)
- [活跃路由组件结构](./ACTIVE_ROUTES_COMPONENT_STRUCTURE.md)
- [监控API集成](./ACTIVE_ROUTES_MONITOR_API_INTEGRATION.md)
- [时区显示修复](./ACTIVE_ROUTES_TIMEZONE_FIX.md)
- [节点状态管理](../src/utils/nodeStatus.ts)

## 总结

本次更新完成了：

1. ✅ 使用新的API数据结构（包含 peer_node_status）
2. ✅ 卡片视图正确显示节点状态
3. ✅ 列表视图正确显示节点状态
4. ✅ 统一使用 NodeStatusManager 管理状态显示
5. ✅ 优化API请求，减少数据量
6. ✅ 完整的状态码支持（-1, 0, 1, 2）
7. ✅ 正确显示节点元数据（名称、用户、IP等）

确保了活跃路由页面能够准确、清晰地显示对端节点的配置和运行状态。
