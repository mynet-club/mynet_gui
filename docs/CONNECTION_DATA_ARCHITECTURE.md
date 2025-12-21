# 连接数据处理架构文档

## 概述

本文档说明了连接数据（connections）的统一处理架构，确保卡片视图、列表视图、拓扑视图等多个组件能够复用相同的数据处理逻辑。

## 架构设计

### 数据流向

```
API Response (connections + nodes_metadata)
    ↓
useConnectionsData.processConnectionsData()  [统一处理]
    ↓
ConnectionData[]  [标准化数据结构]
    ↓
   ┌─────────────────┬─────────────────┬─────────────────┐
   ↓                 ↓                 ↓                 ↓
卡片视图          列表视图          拓扑视图         其他视图
```

### 核心 Composable

**文件位置**: `src/composables/useConnectionsData.ts`

这个 composable 提供了：
- 数据处理函数
- 数据查询函数
- 状态转换函数
- 类型定义

## API 数据结构

### 输入数据

#### 1. Connections 数据（连接信息）

```typescript
{
  "id": null,
  "node_id": 3764021915150630,
  "peer_id": 8283289760467957,
  "online": true,                      // 连接状态
  "conn_type": "direct_ipv4",          // 连接类型
  "latency": 54.262,                   // 延迟（ms）
  "rx_bytes": 88788,                   // 接收字节
  "tx_bytes": 88620,                   // 发送字节
  "seen_at": "2025-12-21T09:51:55",   // 最后通信时间
  "snapshot_at": "2025-12-21T09:52:17",
  "wanip": "192.168.0.2"              // 公网IP
}
```

#### 2. Nodes Metadata（节点元数据）

```typescript
{
  "8283289760467957": {
    "node_id": 8283289760467957,
    "node_name": "和谐家园",
    "zone_id": 3678250676883169,
    "node_status": 1,                  // 节点状态
    "node_ip": "10.182.236.182",      // 虚拟IP
    "user_id": 3844197700300659,
    "user_name": "arthur",
    "user_email": "luoyueliang@gmail.com",
    "ip_addresses": [                  // IP地址列表
      {
        "ip_address": "10.182.236.182",
        "route_type": "node_ip"
      },
      {
        "ip_address": "192.168.0.2",
        "route_type": "lan_ip"
      }
    ]
  }
}
```

### 输出数据（标准化后）

```typescript
interface ConnectionData {
  // 基础信息
  id: any
  node_id: number
  peer_id: number
  
  // 连接状态（来自 connection）
  online: boolean              // 直接使用API的online值
  conn_type: string            // direct_ipv4, direct_ipv6, relay, derp, offline
  latency: number
  rx_bytes: number
  tx_bytes: number
  seen_at: string | null
  wanip: string | null         // 公网IP
  
  // 节点状态（来自 nodes_metadata）
  peer_node_status: number     // 从 metadata.node_status 获取
  node_status: number          // 同上（兼容字段）
  
  // 节点信息（来自 nodes_metadata）
  node_name: string
  node_ip: string
  user_name: string
  ip_addresses: Array<{
    ip_address: string
    route_type: string         // node_ip, lan_ip
  }>
}
```

## 关键数据映射

### 1. 连接状态 (online)

**数据来源**: `connection.online`  
**处理逻辑**: 直接使用API返回值，不做额外计算

```typescript
// ✅ 正确
online: conn.online

// ❌ 错误（之前的实现）
online: isRealtimeSnapshot ? isInLatestSnapshot : conn.online
```

**说明**: API已经根据 `conn_type` 正确判断了连接状态：
- `online: true` + `conn_type: "direct_ipv4"` → 在线直连
- `online: false` + `conn_type: "offline"` → 离线

### 2. 节点状态 (node_status)

**数据来源**: `nodes_metadata[peer_id].node_status`  
**处理逻辑**: 从 metadata 获取，不从 connection 获取

```typescript
// ✅ 正确
peer_node_status: peerMetadata.node_status

// ❌ 错误（之前的实现）
peer_node_status: conn.peer_node_status  // connection中没有这个字段
```

**状态值说明**:
- `2`: 在线
- `1`: 启用但离线
- `0`: 已禁用
- `-1`: 未完成配置

### 3. 公网IP (wanip)

**数据来源**: `connection.wanip`

```typescript
// ✅ 正确
wanip: conn.wanip
```

### 4. 虚拟IP

**数据来源**: `nodes_metadata[peer_id].ip_addresses[0]`  
**优先级**: node_ip 类型 > 第一个IP > node_ip 字段

```typescript
export function getVirtualIp(connection: ConnectionData): string {
  if (connection.ip_addresses && connection.ip_addresses.length > 0) {
    const nodeIp = connection.ip_addresses.find(ip => ip.route_type === 'node_ip')
    if (nodeIp) return nodeIp.ip_address
    return connection.ip_addresses[0].ip_address
  }
  return connection.node_ip || ''
}
```

## 辅助函数

### 状态转换函数

```typescript
// 获取连接状态文本
getConnectionStatusText(online: boolean): string
// 返回: "在线" | "离线"

// 获取连接类型文本
getConnectionTypeText(connType: string): string
// 返回: "直连 IPv4" | "直连 IPv6" | "中继" | "DERP 中继" | "离线" | "无连接"

// 获取节点状态文本
getNodeStatusText(nodeStatus: number): string
// 返回: "在线" | "启用但离线" | "已禁用" | "未完成配置" | "未知状态"

// 获取节点状态颜色
getNodeStatusColor(nodeStatus: number): string
// 返回: "positive" | "warning" | "grey"
```

### 数据查询函数

```typescript
// 获取虚拟IP
getVirtualIp(connection: ConnectionData): string

// 获取局域网IP列表
getLanIps(connection: ConnectionData): string[]
```

## 使用示例

### 在页面组件中使用

```typescript
import { processConnectionsData } from '../../composables/useConnectionsData'

// 获取API数据
const connections = monitorResponse.data.data.connections || []
const nodesMetadata = monitorResponse.data.data.nodes_metadata || {}

// 处理数据
const processedConnections = processConnectionsData(connections, nodesMetadata)

// 使用处理后的数据
nodeRoutesList.value = processedConnections
```

### 在视图组件中使用

```typescript
import { 
  getConnectionTypeText, 
  getNodeStatusText, 
  getNodeStatusColor,
  getVirtualIp
} from '../../composables/useConnectionsData'

// 在模板或computed中使用
const connectionType = getConnectionTypeText(connection.conn_type)
const nodeStatus = getNodeStatusText(connection.peer_node_status)
const statusColor = getNodeStatusColor(connection.peer_node_status)
const virtualIp = getVirtualIp(connection)
```

## 视图组件更新

所有使用连接数据的组件应该：

1. ✅ 使用 `processConnectionsData()` 处理原始数据
2. ✅ 使用 `getConnectionTypeText()` 等辅助函数显示文本
3. ✅ 不再直接处理原始API数据
4. ✅ 不再重复实现数据转换逻辑

### 已更新的组件

- [x] `src/pages/route/ActiveRoutesPage.vue` - 数据处理页面
- [x] `src/components/route/NodeTopologyView.vue` - 拓扑视图
- [ ] `src/components/route/NodeRouteCardView.vue` - 卡片视图（待更新）
- [ ] `src/components/route/RouteListView.vue` - 列表视图（待更新）

## 数据一致性保证

### 1. 连接状态与节点状态独立

- **连接状态** (`online`): 反映当前连接是否建立
- **节点状态** (`peer_node_status`): 反映节点的配置状态

**示例**:
- 节点状态=2（在线）+ 连接状态=false → 节点已启用，但当前连接断开
- 节点状态=1（启用但离线）+ 连接状态=true → 节点已启用且当前连接成功

### 2. 数据来源明确

| 字段 | 数据来源 | 说明 |
|-----|---------|-----|
| online | connection.online | API已正确判断 |
| conn_type | connection.conn_type | 连接类型 |
| latency | connection.latency | 连接延迟 |
| wanip | connection.wanip | 公网IP |
| seen_at | connection.seen_at | 最后通信时间 |
| peer_node_status | metadata.node_status | 节点状态 |
| node_name | metadata.node_name | 节点名称 |
| ip_addresses | metadata.ip_addresses | IP地址列表 |

### 3. 类型安全

所有数据处理函数都使用 TypeScript 类型定义，确保：
- 编译时类型检查
- IDE 智能提示
- 减少运行时错误

## 最佳实践

1. **始终使用 composable 中的函数**，不要在组件中重复实现
2. **数据处理在页面层完成**，视图组件只负责展示
3. **保持数据结构一致**，使用统一的 ConnectionData 类型
4. **避免直接修改原始数据**，使用处理后的数据

## 调试建议

如果遇到数据显示问题：

1. 检查 API 返回的原始数据
2. 检查 `processConnectionsData()` 的输出
3. 确认组件使用的是处理后的数据
4. 使用 debug.log 追踪数据流

```typescript
import debug from '../utils/debug'

debug.log('原始连接数据:', connections)
debug.log('节点元数据:', nodesMetadata)
debug.log('处理后的数据:', processedConnections)
```

## 总结

通过将数据处理逻辑提升到 composable 层：

- ✅ **代码复用**: 多个视图共享相同逻辑
- ✅ **维护简单**: 只需在一处修改
- ✅ **类型安全**: TypeScript 类型定义
- ✅ **测试友好**: 纯函数易于测试
- ✅ **职责分离**: 页面处理数据，组件负责展示
