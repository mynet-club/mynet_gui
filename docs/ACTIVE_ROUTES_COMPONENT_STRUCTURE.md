# 活跃路由页面组件结构文档

## 概述

活跃路由功能已从单个 602 行的组件重构为模块化的组件架构，提高了可维护性和代码组织。

## 组件架构

```
ActiveRoutesPage.vue (315行) - 主协调器
├── NodeListView.vue (204行) - 节点选择视图
├── NodeRouteCardView.vue (174行) - 卡片视图
├── RouteListView.vue (383行) - 列表视图
└── ConnectionDetailsPage.vue (530行) - 连接详情页
```

## 文件说明

### 1. ActiveRoutesPage.vue (主协调器)

**路径**: `src/pages/route/ActiveRoutesPage.vue`
**行数**: 315 行（从 602 行优化而来）
**职责**: 
- 路由参数管理
- 视图状态切换
- 组件协调
- 数据获取协调

**核心逻辑**:
```typescript
// 视图计算
const currentView = computed(() => {
  if (route.params.peerId) return 'connection-details'
  if (route.path.includes('/list')) return 'route-list'
  if (route.params.nodeId) return 'route-card'
  return 'node-list'
})

// 路由监听
watch(() => route.params.nodeId, async (newNodeId) => {
  if (newNodeId) {
    const nodeIdValue = Array.isArray(newNodeId) ? newNodeId[0] : newNodeId
    if (nodeIdValue) await fetchNodeRoutes(nodeIdValue)
  }
})
```

**特点**:
- ✅ 轻量级协调器
- ✅ 清晰的视图切换逻辑
- ✅ 统一的事件处理
- ✅ 最小化业务逻辑

---

### 2. NodeListView.vue (节点选择)

**路径**: `src/components/route/NodeListView.vue`
**行数**: 204 行
**职责**: 
- 显示可用节点列表
- 节点过滤（仅显示启用的节点）
- 节点状态展示
- 节点统计信息

**Props**:
```typescript
interface Props {
  nodes: Node[]              // 节点列表
  loading?: boolean          // 加载状态
  activeRoutes: any[]        // 活跃路由数据
}
```

**Events**:
```typescript
emit('node-select', node)  // 节点选择事件
```

**核心功能**:
- 节点过滤（仅显示 node_status 为 1 或 2 的节点）
- 节点状态统计（总数、可用、未配置、已禁用）
- 响应式卡片网格布局
- 节点信息展示（VPN类型、活跃路由数、端点）

**UI组件**:
- ResponsiveCardGrid（响应式网格）
- NodeStatusBadge（状态徽章）
- Quasar q-card（卡片容器）

---

### 3. NodeRouteCardView.vue (卡片视图)

**路径**: `src/components/route/NodeRouteCardView.vue`
**行数**: 174 行
**职责**:
- 以卡片形式展示节点的连接
- 按用户分组显示
- 连接信息展示
- 点击跳转详情

**Props**:
```typescript
interface Props {
  nodeId: string | number    // 节点ID
  routes: any[]              // 路由数据
  loading?: boolean          // 加载状态
  currentNode?: any          // 当前节点信息
}
```

**Events**:
```typescript
emit('connection-click', connection)  // 连接点击事件
emit('switch-to-list')                // 切换到列表视图
```

**核心功能**:
- 按用户分组路由（groupedByUser）
- 连接状态展示（在线/离线）
- IP地址格式化显示
- 流量统计展示
- 视图模式切换按钮

**特点**:
- ✅ 视觉友好的卡片布局
- ✅ 用户分组逻辑清晰
- ✅ 丰富的连接信息展示
- ✅ 无编译错误

---

### 4. RouteListView.vue (列表视图)

**路径**: `src/components/route/RouteListView.vue`
**行数**: 383 行
**职责**:
- 表格形式展示路由
- 搜索和过滤
- 分页
- 排序

**Props**:
```typescript
interface Props {
  nodeId: string | number    // 节点ID
  routes: any[]              // 路由数据
  loading?: boolean          // 加载状态
  currentNode?: any          // 当前节点信息
}
```

**Events**:
```typescript
emit('connection-click', connection)  // 连接点击事件
emit('switch-to-card')                // 切换到卡片视图
```

**表格列**:
1. 用户名（username）
2. 对端节点（peer_node）
3. 源地址（source_address）
4. 目标地址（destination_address）
5. 状态（status）
6. 建立时间（established_time）
7. 流量（traffic）
8. 操作（actions）

**核心功能**:
- 实时搜索过滤（用户名、IP地址）
- 表格排序
- 分页控制（10/20/50条/页）
- 流量格式化（formatBytes）
- 时间格式化（formatDateTime）
- 状态图标展示

**特点**:
- ✅ 强大的搜索功能
- ✅ 灵活的分页选项
- ✅ 清晰的数据展示
- ✅ 无编译错误

---

### 5. ConnectionDetailsPage.vue (连接详情)

**路径**: `src/pages/route/ConnectionDetailsPage.vue`
**行数**: 530 行
**职责**:
- 显示单个连接的详细信息
- 连接历史数据展示
- 流量统计
- 时间范围选择

**Props**: 无（使用路由参数）

**路由参数**:
```typescript
route.params.nodeId   // 本地节点ID
route.params.peerId   // 对端节点ID
```

**API集成**:
```typescript
// Monitor History API
GET /api/v1/monitor/history/connections
Query: {
  nodeId: string
  peerId: string
  startTime: ISO8601
  endTime: ISO8601
}
```

**核心功能**:
- 连接基本信息展示（协议、端口、IP地址）
- 历史数据查询（1小时/6小时/24小时/7天）
- 历史记录表格
- 流量统计图表
- 详情卡片展示

**数据结构**:
```typescript
interface ConnectionHistory {
  timestamp: string
  status: string
  bytes_sent: number
  bytes_received: number
  latency?: number
}
```

**特点**:
- ✅ 完整的历史数据集成
- ✅ 时间范围选择器
- ✅ 流量统计展示
- ✅ 无编译错误

---

## 路由配置

```typescript
{
  path: '/app/routes',
  component: Layout,
  children: [
    // Level 1: 节点列表
    {
      path: 'active',
      name: 'routes-active',
      component: () => import('pages/route/ActiveRoutesPage.vue')
    },
    // Level 2: 节点路由（卡片视图）
    {
      path: 'active/:nodeId',
      name: 'routes-active-node',
      component: () => import('pages/route/ActiveRoutesPage.vue')
    },
    // Level 2.1: 节点路由（列表视图）
    {
      path: 'active/:nodeId/list',
      name: 'routes-active-node-list',
      component: () => import('pages/route/ActiveRoutesPage.vue')
    },
    // Level 3: 连接详情
    {
      path: 'active/:nodeId/p-:peerId',
      name: 'routes-active-connection',
      component: () => import('pages/route/ConnectionDetailsPage.vue')
    }
  ]
}
```

## 导航流程

```
1. /app/routes/active
   ↓ 点击节点卡片
   
2. /app/routes/active/123
   ↓ 切换视图 / 点击连接
   
2.1 /app/routes/active/123/list
   ↓ 点击详情按钮
   
3. /app/routes/active/123/p-456
   ← 返回上一页
```

## 数据流

```
ActiveRoutesPage (协调器)
  ├── 获取所有节点数据 (useNodes)
  ├── 获取活跃路由数据 (useRoutes)
  └── 传递给子组件
       ├── NodeListView (nodes, activeRoutes)
       ├── NodeRouteCardView (nodeId, routes)
       ├── RouteListView (nodeId, routes)
       └── ConnectionDetailsPage (nodeId, peerId) → API调用
```

## 状态管理

### ActiveRoutesPage
```typescript
const currentNodeId = ref<string | number | null>(null)
const currentRoutes = ref<any[]>([])
const routesLoading = ref(false)
```

### 子组件
- 通过 props 接收数据
- 通过 emit 发送事件
- 无内部复杂状态

## 优化成果

### 代码组织
- ✅ 从单个 602 行文件拆分为 5 个模块
- ✅ 每个组件职责单一明确
- ✅ 便于单独测试和维护

### 性能
- ✅ 按需加载组件
- ✅ 计算属性缓存
- ✅ 事件委托

### 可维护性
- ✅ 清晰的组件边界
- ✅ 统一的数据流
- ✅ 规范的事件命名

### 类型安全
- ✅ 所有组件零编译错误
- ✅ 使用 TypeScript 类型断言处理兼容性
- ✅ 明确的 Props 和 Events 接口

## 未来扩展

### 可能的优化方向
1. **状态管理**: 引入 Pinia 统一管理路由数据
2. **缓存策略**: 实现路由数据缓存，减少 API 调用
3. **虚拟滚动**: 对大量数据使用虚拟滚动优化性能
4. **实时更新**: 通过 WebSocket 实现实时路由状态更新
5. **导出功能**: 添加路由数据导出（CSV/Excel）
6. **高级筛选**: 更多筛选条件（协议、流量范围等）

### 组件复用
这些组件可以在其他页面复用：
- **NodeListView**: 任何需要显示节点列表的场景
- **RouteListView**: 其他路由列表展示场景
- **ConnectionDetailsPage**: 连接监控和分析功能

## 总结

重构后的组件架构：
- 📦 **模块化**: 5个独立组件，职责明确
- 🎯 **可维护**: 平均每个组件 200-400 行，易于理解
- 🚀 **可扩展**: 清晰的接口，便于功能扩展
- 🐛 **零错误**: 所有组件通过TypeScript编译检查
- 📱 **响应式**: 适配不同屏幕尺寸

这个架构为活跃路由功能提供了坚实的基础，便于后续迭代和功能增强。
