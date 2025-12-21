# 活跃路由监控API集成

## 更新说明

已将活跃路由页面的数据源从旧的路由API切换到监控API，以获取更准确和完整的连接数据。

## API变更

### 之前（错误的API）
```typescript
// ❌ 旧代码 - 使用了不正确的API
const response = await api.get(`/route/node/${nodeId}`)
```

### 现在（正确的监控API）
```typescript
// ✅ 新代码 - 使用监控历史API
const response = await api.get('/monitor/history/connections', {
  params: {
    node_id: nodeId,
    per_page: 100
  }
})
```

## 监控API详情

### 端点
```
GET /api/v1/monitor/history/connections
```

### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `node_id` | integer | 是 | 本地节点ID |
| `peer_node_id` | integer | 否 | 对端节点ID（用于过滤） |
| `start_time` | string | 否 | 开始时间 (Y-m-d H:i:s) |
| `end_time` | string | 否 | 结束时间 (Y-m-d H:i:s) |
| `page` | integer | 否 | 页码，默认1 |
| `per_page` | integer | 否 | 每页数量，默认20，最大100 |

### 响应数据结构
```typescript
{
  success: true,
  data: {
    connections: [
      {
        id: number              // 记录ID
        node_id: number         // 本地节点ID
        peer_id: number         // 对端节点ID
        online: boolean         // 是否在线
        conn_type: string       // 连接类型 (direct_ipv4, relay等)
        latency: number         // 延迟(毫秒)
        rx_bytes: number        // 接收字节数
        tx_bytes: number        // 发送字节数
        seen_at: string         // 最后可见时间
        snapshot_at: string     // 数据快照时间
      }
    ],
    nodes_metadata: {
      [node_id: string]: {
        node_id: number
        node_name: string
        zone_id: number
        node_status: number     // 0=禁用, 1=启用离线, 2=在线
        user_id: number
        user_name: string
      }
    },
    pagination: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
}
```

## 数据处理流程

### 1. ActiveRoutesPage - 节点连接列表

**函数**: `fetchNodeConnections(nodeId)`

**处理步骤**:
```typescript
1. 调用监控API获取原始数据
   ↓
2. 从 nodes_metadata 中提取节点信息
   ↓
3. 合并连接数据和元数据
   processedConnections = connections.map(conn => ({
     ...conn,
     peer_node_name: metadata.node_name,
     peer_user_name: metadata.user_name,
     status: conn.online ? 'online' : 'offline',
     connection_type: conn.conn_type,
     bytes_sent: conn.tx_bytes,
     bytes_received: conn.rx_bytes
   }))
   ↓
4. 按用户分组 (processConnectionsByUser)
   groupedByUser = {
     "用户A": [连接1, 连接2],
     "用户B": [连接3]
   }
   ↓
5. 展平并添加分组信息
   [{
     ...connection,
     userEmail: "用户A",
     isFirstInGroup: true,
     groupSize: 2
   }]
```

**使用场景**:
- `/app/routes/active/:nodeId` - 卡片视图
- `/app/routes/active/:nodeId/list` - 列表视图

### 2. ConnectionDetailsPage - 连接详情

**函数**: `loadConnectionDetails()`

**处理步骤**:
```typescript
1. 调用监控API获取特定连接
   params: {
     node_id: nodeId,
     peer_node_id: peerId,
     per_page: 1
   }
   ↓
2. 提取连接详情和节点元数据
   ↓
3. 设置三个状态:
   - connectionDetails (连接信息)
   - peerNodeInfo (对端节点)
   - sourceNodeInfo (本地节点)
```

**使用场景**:
- `/app/routes/active/:nodeId/p-:peerId` - 连接详情页

### 3. 历史数据查询

**函数**: `loadHistoryData()`

**参数**:
```typescript
{
  node_id: nodeId,
  peer_node_id: peerId,
  start_time: computed from time range,
  end_time: now,
  per_page: 50
}
```

**时间范围选项**:
- `1h`: 最近1小时
- `6h`: 最近6小时
- `24h`: 最近24小时
- `7d`: 最近7天

## 数据字段映射

### 监控API → 前端显示

| 监控API字段 | 前端字段 | 说明 |
|------------|---------|------|
| `peer_id` | `peer_id` | 对端节点ID |
| `online` | `status` | true → 'online', false → 'offline' |
| `conn_type` | `connection_type` | 连接类型 |
| `tx_bytes` | `bytes_sent` | 发送字节数 |
| `rx_bytes` | `bytes_received` | 接收字节数 |
| `seen_at` | `last_seen` | 最后可见时间 |
| `snapshot_at` | `established_time` | 建立时间 |
| `latency` | `latency` | 延迟 |

### 节点元数据映射

| 元数据字段 | 前端字段 | 说明 |
|-----------|---------|------|
| `node_name` | `peer_node_name` | 对端节点名称 |
| `node_status` | `peer_node_status` | 节点状态 (0/1/2) |
| `user_name` | `peer_user_name` | 所属用户名 |
| `user_id` | `peer_user_id` | 所属用户ID |

## 节点状态说明

### node_status 数值含义

| 值 | 状态 | 说明 |
|----|------|------|
| 0 | 禁用 (disabled) | 节点已被禁用 |
| 1 | 启用但离线 (enabled_offline) | 节点启用但当前离线 |
| 2 | 在线 (online) | 节点启用且在线 |

### 前端过滤逻辑

**NodeListView**:
```typescript
// 仅显示启用的节点（状态1和2）
const filteredNodes = computed(() => {
  return props.nodes.filter(node => {
    const nodeStatus = (node as any).node_status
    return nodeStatus === 1 || nodeStatus === 2
  })
})
```

**统计计算**:
```typescript
const nodeStatusStats = computed(() => {
  const total = props.nodes.length
  const available = filteredNodes.value.length  // status = 1 or 2
  const unconfigured = ...                       // status = 0
  const disabled = ...                           // status = 0
})
```

## 组件更新总结

### 修改的文件

1. **ActiveRoutesPage.vue**
   - ✅ 新增 `processConnectionsByUser()` 函数
   - ✅ 重命名 `fetchNodeRoutes()` → `fetchNodeConnections()`
   - ✅ 使用监控API `/monitor/history/connections`
   - ✅ 处理 `nodes_metadata` 数据结构
   - ✅ 更新 watch 和 handleRefresh 调用

2. **ConnectionDetailsPage.vue**
   - ✅ 修改 `loadConnectionDetails()` 使用监控API
   - ✅ 添加 `peer_node_id` 参数过滤特定连接
   - ✅ 使用 `nodes_metadata` 设置节点信息
   - ✅ 修正 `localNodeInfo` → `sourceNodeInfo`

3. **NodeListView.vue**
   - ✅ 已正确过滤 `node_status` 为 1 或 2 的节点
   - ✅ 节点状态统计逻辑正确

4. **RouteListView.vue** & **NodeRouteCardView.vue**
   - ✅ 无需修改，接收处理后的数据

## 测试要点

### 1. 节点列表视图 (`/app/routes/active`)
- [ ] 仅显示 `node_status` 为 1 或 2 的节点
- [ ] 节点统计数字正确
- [ ] 点击节点跳转到连接列表

### 2. 卡片视图 (`/app/routes/active/:nodeId`)
- [ ] 发起监控API请求
- [ ] 显示节点的所有连接
- [ ] 按用户正确分组
- [ ] 显示在线/离线状态
- [ ] 显示流量数据

### 3. 列表视图 (`/app/routes/active/:nodeId/list`)
- [ ] 发起监控API请求
- [ ] 表格显示所有字段
- [ ] 搜索功能正常
- [ ] 分页功能正常
- [ ] 排序功能正常

### 4. 连接详情 (`/app/routes/active/:nodeId/p-:peerId`)
- [ ] 发起监控API请求（带 peer_node_id 过滤）
- [ ] 显示连接基本信息
- [ ] 显示本地和对端节点信息
- [ ] 历史数据查询正常
- [ ] 时间范围切换正常

## 性能优化

### 分页建议
- 节点列表: `per_page: 100` (一次性加载所有活跃连接)
- 连接详情: `per_page: 1` (只需要一条记录)
- 历史数据: `per_page: 50` (适中的历史记录数)

### 缓存策略
考虑在 `useRoutes` composable 中添加缓存：
```typescript
const connectionsCache = new Map<string, {
  data: any[],
  timestamp: number
}>()

const CACHE_TTL = 30000 // 30秒

const getCachedConnections = (nodeId: string) => {
  const cached = connectionsCache.get(nodeId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}
```

## 下一步改进

1. **实时更新**: 通过 WebSocket 接收连接状态变化
2. **错误处理**: 更详细的错误提示和重试机制
3. **离线支持**: 缓存最近的连接数据
4. **性能监控**: 添加API响应时间追踪
5. **批量操作**: 支持批量查询多个节点的连接

## 相关文档

- [Monitor API 文档](./api-monitor.md)
- [组件结构文档](./ACTIVE_ROUTES_COMPONENT_STRUCTURE.md)
- [优化计划](./ACTIVE_ROUTES_OPTIMIZATION_PLAN.md)
