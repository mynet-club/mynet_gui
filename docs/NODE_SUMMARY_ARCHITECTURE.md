# NodeSummary 统一认知模型 - 技术架构

## 📦 模块结构

```
src/
├── types/
│   └── nodeSummary.ts              # ✅ 核心类型定义
├── composables/
│   └── useNodeSummary.ts           # ✅ 数据提炼层
├── utils/
│   └── nodeSummaryDisplay.ts       # ✅ 展示工具库
└── models/
    └── nodeSummary.ts              # ✅ 统一入口（推荐导入）
```

---

## 🎯 设计目标

> **在代码层面实现三视图（Card/List/Topology）的认知模型统一**

### 问题背景
之前虽然有文档定义了 NodeSummary 概念，但代码层面缺少：
1. ❌ 没有统一的 TypeScript 类型定义
2. ❌ 数据提炼逻辑分散在各个组件中
3. ❌ 展示逻辑（颜色/图标/文本）重复实现

### 解决方案
通过四层架构实现集中化管理：

```
┌─────────────────────────────────────────┐
│  API 数据层                             │
│  (connections + nodes_metadata)         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  数据提炼层 (useNodeSummary.ts)         │
│  extractNodeSummaries()                 │
│  → 将 API 数据提炼为 NodeSummary        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  NodeSummary 统一模型                   │
│  (nodeSummary.ts 类型定义)              │
│  - 身份: node_name, user_name           │
│  - 状态: node_status, link_status       │
│  - 网络: virtual_ip, wan_ip, latency    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  展示工具层 (nodeSummaryDisplay.ts)    │
│  getNodeCardDisplay()    → Card 视图    │
│  getNodeListDisplay()    → List 视图    │
│  getNodeTopologyDisplay() → Topology    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Card 组件  List 组件  Topology 组件
```

---

## 📋 核心文件说明

### 1️⃣ `types/nodeSummary.ts` - 类型定义层

**职责**: 定义 NodeSummary 的 TypeScript 接口

**核心类型**:
```typescript
interface NodeSummary {
  // 身份
  peer_id: number
  node_name: string
  user_name: string
  
  // 状态（两个独立维度）
  node_status: NodeStatus      // 节点配置状态
  link_status: LinkStatus       // 链路连通状态
  
  // 网络
  virtual_ip: string            // 虚拟IP（必显）
  wan_ip?: string               // 公网IP（可选）
  lan_ips: string[]             // 局域网IP列表
  latency?: number              // 延迟（仅在线时）
  conn_type?: string            // 连接类型（仅在线时）
  
  // ...
}
```

**关键特性**:
- ✅ 明确字段来源（哪些来自 connections，哪些来自 metadata）
- ✅ 区分必填/可选字段
- ✅ 使用枚举强化类型安全（`NodeStatus`, `LinkStatus`）

---

### 2️⃣ `composables/useNodeSummary.ts` - 数据提炼层

**职责**: 将 API 原始数据转换为 NodeSummary

**核心函数**:
```typescript
// 单个提炼
extractNodeSummary(
  connection: any,
  metadata: NodeMetadata
): NodeSummary

// 批量提炼
extractNodeSummaries(
  connections: any[],
  nodesMetadata: Record<string, NodeMetadata>
): NodeSummary[]
```

**数据来源规则**（关键！）:
```typescript
// ✅ 节点状态 - 从 metadata 读取
node_status: metadata.node_status

// ✅ 链路状态 - 从 connection.online 直接读取（不计算！）
link_status: connection.online ? 1 : 0

// ✅ 虚拟IP - 优先 node_ip，兜底 ip_addresses
virtual_ip: metadata.node_ip || 
  ip_addresses.find(ip => ip.route_type === 'node_ip')?.ip_address

// ✅ 公网IP - 从 connection 读取
wan_ip: connection.wanip
```

---

### 3️⃣ `utils/nodeSummaryDisplay.ts` - 展示工具库

**职责**: 提供统一的状态文本、颜色、图标映射

**三种复合函数**（推荐使用）:
```typescript
// Card 视图专用
getNodeCardDisplay(summary: NodeSummary)
// 返回: { name, nodeStatus, linkStatus, virtualIp, wanIp, ... }

// List 视图专用
getNodeListDisplay(summary: NodeSummary)
// 返回: { name, virtualIp, wanIp, nodeStatus, linkStatus, ... }

// Topology 视图专用
getNodeTopologyDisplay(summary: NodeSummary)
// 返回: { title, status, network, details, time }
```

**一致性保证**:
- 所有颜色映射统一在此文件
- 所有图标映射统一在此文件
- 所有文本映射统一在此文件

**示例**:
```typescript
// 节点状态颜色映射（统一）
NodeStatus.ONLINE (2)          → 'positive' (绿)
NodeStatus.ENABLED_OFFLINE (1) → 'orange'   (橙)
NodeStatus.DISABLED (0)        → 'grey'     (灰)

// 链路状态颜色映射（统一）
LinkStatus.ONLINE (1)  → 'positive' (绿) + 实心
LinkStatus.OFFLINE (0) → 'grey-6' (灰) + outline
```

---

### 4️⃣ `models/nodeSummary.ts` - 统一入口

**职责**: 导出所有 NodeSummary 相关的类型和工具

**推荐导入方式**:
```typescript
// ✅ 从统一入口导入
import {
  type NodeSummary,
  extractNodeSummaries,
  getNodeCardDisplay
} from '@/models/nodeSummary'

// ❌ 不推荐分散导入
import { NodeSummary } from '@/types/nodeSummary'
import { extractNodeSummaries } from '@/composables/useNodeSummary'
import { getNodeCardDisplay } from '@/utils/nodeSummaryDisplay'
```

---

## 🔧 使用指南

### 步骤 1: 在页面获取数据后提炼 NodeSummary

```typescript
// ActiveRoutesPage.vue
import { extractNodeSummaries } from '@/models/nodeSummary'

const fetchData = async () => {
  const response = await api.get('/monitor/history/connections')
  const { connections, nodes_metadata } = response.data
  
  // ✅ 提炼为 NodeSummary 数组
  const summaries = extractNodeSummaries(connections, nodes_metadata)
  
  // 传递给子组件
  return summaries
}
```

### 步骤 2: 在视图组件中使用展示工具

#### Card 视图示例

```vue
<script setup lang="ts">
import type { NodeSummary } from '@/models/nodeSummary'
import { getNodeCardDisplay } from '@/models/nodeSummary'

defineProps<{
  summaries: NodeSummary[]
}>()
</script>

<template>
  <q-card v-for="summary in summaries" :key="summary.peer_id">
    <q-card-section>
      <!-- 使用 cardDisplay 获取预处理的展示数据 -->
      <div v-bind="(cardDisplay = getNodeCardDisplay(summary))">
        <!-- 节点名 -->
        <div class="text-h6">{{ cardDisplay.name }}</div>
        
        <!-- 状态芯片 -->
        <q-chip 
          :color="cardDisplay.nodeStatus.color"
          :icon="cardDisplay.nodeStatus.icon"
        >
          {{ cardDisplay.nodeStatus.text }}
        </q-chip>
        
        <q-chip 
          :color="cardDisplay.linkStatus.color"
          :icon="cardDisplay.linkStatus.icon"
          :outline="cardDisplay.linkStatus.outline"
        >
          {{ cardDisplay.linkStatus.text }}
        </q-chip>
        
        <!-- IP 信息 -->
        <div>
          <q-icon :name="cardDisplay.virtualIp.icon" :color="cardDisplay.virtualIp.color" />
          {{ cardDisplay.virtualIp.text }}
        </div>
        
        <div v-if="cardDisplay.wanIp">
          <q-icon :name="cardDisplay.wanIp.icon" :color="cardDisplay.wanIp.color" />
          {{ cardDisplay.wanIp.text }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
```

#### List 视图示例

```vue
<script setup lang="ts">
import { getNodeListDisplay } from '@/models/nodeSummary'

const columns = [
  { name: 'node_name', label: '节点名称' },
  { name: 'virtual_ip', label: '虚拟IP' },
  { name: 'wan_ip', label: '公网IP' },
  { name: 'node_status', label: '节点状态' },
  { name: 'link_status', label: '链路状态' }
]
</script>

<template>
  <q-table :rows="summaries" :columns="columns">
    <template #body-cell-node_name="{ row }">
      <q-td>
        {{ getNodeListDisplay(row).name }}
        <q-tooltip>{{ getNodeListDisplay(row).userNameTooltip }}</q-tooltip>
      </q-td>
    </template>
    
    <template #body-cell-node_status="{ row }">
      <q-td>
        <q-chip :color="getNodeListDisplay(row).nodeStatus.color">
          {{ getNodeListDisplay(row).nodeStatus.text }}
        </q-chip>
      </q-td>
    </template>
  </q-table>
</template>
```

---

## ✅ 一致性检查清单

使用 NodeSummary 模型后，请确保：

- [ ] **数据提炼统一**: 所有视图都使用 `extractNodeSummaries()` 获取数据
- [ ] **类型约束**: 组件 props 使用 `NodeSummary` 类型而非 `any`
- [ ] **展示工具统一**: 使用 `getNode*Display()` 函数而非手写映射
- [ ] **命名一致**: 三个视图中"链路状态"术语一致
- [ ] **颜色一致**: 同一状态在三个视图中颜色相同
- [ ] **不重新计算**: 链路状态直接使用 `link_status`，不要 `conn_type !== 'offline'`

---

## 📊 对比：优化前 vs 优化后

### 优化前 ❌
```typescript
// 各组件分散实现
// NodeRouteCardView.vue
const getStatus = (node: any) => {
  return node.online ? '在线' : '离线'  // ❌ 命名不统一
}

// RouteListView.vue
const getStatus = (node: any) => {
  return node.conn_type !== 'offline' ? '连接' : '断开'  // ❌ 重新计算
}

// NodeTopologyView.vue
const statusColor = computed(() => {
  return props.node.online ? 'green' : 'red'  // ❌ 颜色映射不一致
})
```

### 优化后 ✅
```typescript
// 统一使用 NodeSummary 模型
import { extractNodeSummaries, getNodeCardDisplay } from '@/models/nodeSummary'

// 1. 数据提炼统一
const summaries = extractNodeSummaries(connections, metadata)

// 2. 展示工具统一
const display = getNodeCardDisplay(summaries[0])

// 3. 三个视图获得一致的：
// - display.linkStatus.text = "链路在线" （命名统一）
// - display.linkStatus.color = "positive" （颜色统一）
// - 直接使用 link_status，不重新计算 （逻辑统一）
```

---

## 🎓 最佳实践

### ✅ DO - 推荐做法

```typescript
// 1. 在页面层提炼 NodeSummary
const summaries = extractNodeSummaries(connections, nodesMetadata)

// 2. 传递给子组件
<NodeRouteCardView :summaries="summaries" />

// 3. 子组件使用 display 函数
const display = getNodeCardDisplay(summary)

// 4. 模板直接使用预处理数据
<q-chip :color="display.linkStatus.color">
  {{ display.linkStatus.text }}
</q-chip>
```

### ❌ DON'T - 避免做法

```typescript
// ❌ 不要在组件内重新映射颜色
const statusColor = node.online ? 'green' : 'red'

// ❌ 不要重新计算链路状态
const isOnline = node.conn_type !== 'offline'

// ❌ 不要直接使用 API 原始数据
<div>{{ node.peer_node_status }}</div>  // ❌ 应使用 summary.node_status

// ❌ 不要手写状态文本
{{ node.status === 2 ? '在线' : '离线' }}  // ❌ 应使用 getNodeStatusText()
```

---

## 🔍 troubleshooting

### Q: 我应该在哪里调用 `extractNodeSummaries()`？
**A**: 在数据获取的页面层（如 `ActiveRoutesPage.vue`），而不是在每个子组件中。

### Q: 三个视图都要用 `getNode*Display()` 吗？
**A**: 是的。每个视图有专属函数：
- Card → `getNodeCardDisplay()`
- List → `getNodeListDisplay()`
- Topology → `getNodeTopologyDisplay()`

### Q: 如果需要新增字段怎么办？
**A**: 按顺序修改：
1. `types/nodeSummary.ts` - 添加字段定义
2. `composables/useNodeSummary.ts` - 添加提炼逻辑
3. `utils/nodeSummaryDisplay.ts` - 添加展示映射（如需要）

### Q: 原有的 `useConnectionsData.ts` 还用吗？
**A**: 建议逐步迁移到 `useNodeSummary.ts`。新代码直接使用 NodeSummary 模型。

---

## 📚 相关文档

- [NodeSummary 认知模型设计文档](../docs/NODE_SUMMARY_CONSISTENCY.md)
- [用户体验一致性升级报告](../NODE_SUMMARY_UX_UPGRADE.md)
- API 文档: `/monitor/history/connections` 响应格式

---

**总结**: 通过四层架构（类型定义 → 数据提炼 → 展示工具 → 统一入口），在代码层面实现了 NodeSummary 认知模型的集中定义和一致性提炼。
