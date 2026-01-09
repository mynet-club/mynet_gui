# MyNet 核心概念迁移评估报告

## 📋 背景说明

基于 https://mynet.club/ 官方网站和用户体验原则,需要将技术术语调整为更贴近用户理解的表述:

### 核心调整
1. **路由 (Route) → 连接 (Connection)**  
   - 官网表述: "连接你的设备"、"连接你需要的一切"
   - 用户更容易理解"连接"的含义

2. **节点 (Node) → 设备 (Device)**  
   - 官网表述: "手机、电脑、路由器、服务器"都是设备
   - "节点"过于技术化,普通用户不易理解

---

## 🔍 影响范围分析

### 一、"节点" → "设备" 迁移影响

#### 1. 文件命名影响 (11个核心文件)
```
📁 Types (类型定义)
├── src/types/node.ts → device.ts
├── src/types/nodeConfig.ts → deviceConfig.ts
├── src/types/nodeKeys.ts → deviceKeys.ts
└── src/types/nodeSummary.ts → deviceSummary.ts

📁 Services (服务层)
├── src/services/node/nodeService.ts → deviceService.ts
├── src/services/node/nodeConfigService.ts → deviceConfigService.ts
└── src/services/node/nodeKeysService.ts → deviceKeysService.ts

📁 Utils (工具函数)
├── src/utils/nodeStatus.ts → deviceStatus.ts
└── src/utils/nodeSummaryDisplay.ts → deviceSummaryDisplay.ts

📁 Models & Router
├── src/models/nodeSummary.ts → deviceSummary.ts
└── src/router/nodeRoutes.ts → deviceRoutes.ts
```

#### 2. 目录结构影响
```
src/
├── pages/
│   └── node/ → device/
│       ├── NodeListPage.vue → DeviceListPage.vue
│       ├── NodeDetailPage.vue → DeviceDetailPage.vue
│       ├── NodeCreatePage.vue → DeviceCreatePage.vue
│       └── edit/
│           ├── NodeBasicInfoPage.vue → DeviceBasicInfoPage.vue
│           ├── NodeNetworkPage.vue → DeviceNetworkPage.vue
│           ├── NodeConfigPage.vue → DeviceConfigPage.vue
│           └── NodeKeysPage.vue → DeviceKeysPage.vue
│
├── components/
│   └── node/ → device/
│       ├── NodeCard.vue → DeviceCard.vue
│       ├── NodeStatusChip.vue → DeviceStatusChip.vue
│       ├── NodeSelectorCard.vue → DeviceSelectorCard.vue
│       └── ...更多组件
│
└── composables/
    └── useNodeSummary.ts → useDeviceSummary.ts
```

#### 3. 代码中的术语替换
**高频术语 (100+ 处):**
- `node` → `device`
- `Node` → `Device`
- `NODE` → `DEVICE`
- `节点` → `设备`

**示例:**
```typescript
// 类型定义
interface NodeStatus → interface DeviceStatus
type NodeConfig → type DeviceConfig

// 变量命名
const nodeId → const deviceId
const nodeList → const deviceList
const activeNodes → const activeDevices

// 函数命名
getNodeStatus() → getDeviceStatus()
updateNode() → updateDevice()
deleteNode() → deleteDevice()

// 常量
NODE_STATUS → DEVICE_STATUS
NODE_ROUTES → DEVICE_ROUTES
```

#### 4. UI 文本替换
```vue
<!-- 页面标题 -->
节点管理 → 设备管理
节点列表 → 设备列表
节点详情 → 设备详情
创建节点 → 添加设备

<!-- 按钮文本 -->
添加节点 → 添加设备
编辑节点 → 编辑设备
删除节点 → 删除设备

<!-- 状态显示 -->
节点在线 → 设备在线
节点离线 → 设备离线
节点配置 → 设备配置

<!-- 表单标签 -->
节点名称 → 设备名称
节点类型 → 设备类型
节点IP → 设备IP
```

#### 5. API 兼容性考虑
```typescript
// 后端 API 可能仍使用 node 字段
interface ApiResponse {
  node_id: number        // 后端字段保持不变
  node_name: string      // 后端字段保持不变
  node_status: number    // 后端字段保持不变
}

// 前端映射层
interface Device {
  id: number            // 映射自 node_id
  name: string          // 映射自 node_name
  status: DeviceStatus  // 映射自 node_status
}
```

---

### 二、"路由" → "连接" 迁移影响

#### 1. 文件命名影响 (2个核心文件)
```
src/
├── router/
│   └── routes.ts (Vue Router,保持不变)
│
└── services/
    └── route/ → connection/
        └── routesService.ts → connectionsService.ts
```

**注意:** Vue Router 的 `routes.ts` 保持不变,因为这是框架层面的路由配置

#### 2. 代码中的术语替换
**需要区分两种"路由":**

1. **业务概念的"路由"** → **"连接"**
```typescript
// ✅ 需要改
interface Route → interface Connection
const routesList → const connectionsList
createRoute() → createConnection()
```

2. **Vue Router 的"路由"** → **保持不变**
```typescript
// ❌ 不改 (框架层面)
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
```

#### 3. UI 文本替换
```vue
<!-- 页面标题 -->
路由管理 → 连接管理
活动路由 → 活动连接
路由列表 → 连接列表

<!-- 按钮文本 -->
创建路由 → 创建连接
编辑路由 → 编辑连接
删除路由 → 删除连接

<!-- 状态显示 -->
路由状态 → 连接状态
路由类型 → 连接类型
```

#### 4. 搜索匹配统计
基于 grep 搜索结果:
- `route` 相关匹配: ~100+ 处
- 需要仔细区分: Vue Router vs 业务路由

---

## 💡 迁移策略建议

### 方案一: 渐进式迁移 (推荐)

#### 阶段 1: 别名层 (1-2天)
**目标:** 保持向后兼容,新旧术语并存

```typescript
// 1. 创建类型别名
export type Device = Node
export type DeviceConfig = NodeConfig
export type DeviceStatus = NodeStatus

// 2. 创建函数别名
export const getDeviceStatus = getNodeStatus
export const updateDevice = updateNode

// 3. 创建常量别名
export const DEVICE_STATUS = NODE_STATUS
export const DEVICE_ROUTES = NODE_ROUTES
```

**优点:**
- ✅ 零破坏性,现有代码继续运行
- ✅ 可以逐个组件迁移
- ✅ 便于回滚
- ✅ 团队可以并行工作

**实施步骤:**
1. 在原文件中添加新术语的别名导出
2. 新代码使用新术语
3. 逐步重构旧代码
4. 最后删除旧术语

#### 阶段 2: UI 文本国际化 (同步进行)
**目标:** 通过 i18n 统一术语

```typescript
// zh-CN.json
{
  "device": {
    "title": "设备管理",
    "list": "设备列表",
    "detail": "设备详情",
    "create": "添加设备",
    "edit": "编辑设备",
    "delete": "删除设备",
    "status": {
      "online": "在线",
      "offline": "离线",
      "unconfigured": "未配置"
    }
  },
  "connection": {
    "title": "连接管理",
    "list": "连接列表",
    "create": "创建连接",
    "active": "活动连接"
  }
}
```

**优点:**
- ✅ 集中管理所有文案
- ✅ 便于多语言支持
- ✅ 修改文案不需要改代码

#### 阶段 3: 代码重构 (2-3周)
**目标:** 彻底替换内部实现

1. **文件重命名** (使用 Git mv 保留历史)
2. **类型定义重构**
3. **组件重构**
4. **测试验证**
5. **删除旧别名**

#### 阶段 4: API 适配层 (持续)
**目标:** 前后端术语解耦

```typescript
// adapters/deviceAdapter.ts
export function adaptNodeToDevice(node: ApiNode): Device {
  return {
    id: node.node_id,
    name: node.node_name,
    status: adaptNodeStatus(node.node_status),
    // ...其他字段映射
  }
}

export function adaptDeviceToNode(device: Device): ApiNode {
  return {
    node_id: device.id,
    node_name: device.name,
    node_status: device.status,
    // ...其他字段映射
  }
}
```

---

### 方案二: 一次性迁移 (高风险)

#### 优点
- ✅ 一步到位,无历史包袱
- ✅ 代码库保持一致性

#### 缺点
- ❌ 高风险,可能导致大量 bug
- ❌ 需要暂停其他开发工作
- ❌ 难以回滚
- ❌ 需要大量回归测试

**不推荐理由:**
- 影响范围过大 (100+ 文件)
- 容易遗漏细节
- 测试成本高

---

## 🛠️ 技术实施细节

### 1. TypeScript 类型迁移

```typescript
// ✅ 第一步: 添加别名
// src/types/device.ts (新文件)
export * from './node'  // 重导出
export type {
  Node as Device,
  NodeStatus as DeviceStatus,
  NodeConfig as DeviceConfig
}

// ✅ 第二步: 逐步替换
// src/types/device.ts (重构后)
export interface Device {
  id: number
  name: string
  status: DeviceStatus
  // ...
}
```

### 2. 组件迁移示例

```vue
<!-- ✅ 第一步: 文件共存 -->
<!-- src/components/device/DeviceCard.vue (新) -->
<script setup lang="ts">
import type { Device } from '@/types/device'
// 使用新类型
</script>

<!-- src/components/node/NodeCard.vue (旧,保留) -->
<!-- 逐步弃用 -->
```

### 3. 路由迁移注意事项

```typescript
// ✅ 正确区分
import { useRoute, useRouter } from 'vue-router'  // Vue Router,不改
import { getConnections } from '@/services/connection'  // 业务连接,改

// ❌ 错误示例
import { useConnection } from 'vue-connection'  // 不存在!
```

### 4. i18n 文本替换

```typescript
// ✅ 推荐方式
<template>
  <h1>{{ $t('device.title') }}</h1>
  <q-btn :label="$t('device.create')" />
</template>

// ❌ 避免硬编码
<template>
  <h1>设备管理</h1>  <!-- 难以维护 -->
</template>
```

---

## 📊 工作量估算

### 人力估算 (1名开发者)

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| **阶段1** | 创建别名和适配层 | 1-2天 |
| **阶段2** | i18n 文案整理 | 1天 |
| **阶段3** | 类型定义重构 | 2-3天 |
| **阶段4** | 组件重构 (20+组件) | 1-2周 |
| **阶段5** | 页面重构 (10+页面) | 1周 |
| **阶段6** | 测试和验证 | 3-5天 |
| **阶段7** | 清理旧代码 | 2-3天 |
| **总计** | | **3-4周** |

### 风险等级

| 风险项 | 等级 | 缓解措施 |
|--------|------|----------|
| 遗漏替换点 | 🟡 中 | 使用 grep 全局搜索验证 |
| 类型错误 | 🟢 低 | TypeScript 编译检查 |
| 运行时错误 | 🟡 中 | 完整的回归测试 |
| API 兼容性 | 🟢 低 | 适配层隔离 |
| 用户混淆 | 🟢 低 | 文档和提示更新 |

---

## ✅ 执行建议

### 立即可行的快速验证 (1小时内)

1. **创建概念验证分支**
```bash
git checkout -b feature/terminology-migration-poc
```

2. **快速测试: 添加一个别名**
```typescript
// src/types/device.ts (新建)
export * from './node'
export type { Node as Device }
```

3. **在一个组件中试用**
```vue
<!-- src/components/TestDevice.vue -->
<script setup lang="ts">
import type { Device } from '@/types/device'  // 使用新术语
const device: Device = { ... }
</script>
```

4. **验证编译和运行**
```bash
npm run type-check
npm run dev
```

### 正式迁移建议

**如果 POC 成功,建议:**
1. ✅ 采用**方案一 (渐进式迁移)**
2. ✅ 从**UI 文本 i18n** 开始 (用户可见,风险低)
3. ✅ 然后**类型别名** (开发者可见,风险低)
4. ✅ 最后**代码重构** (逐步推进)

**启动条件:**
- [ ] 团队达成共识
- [ ] 预留 3-4 周开发时间
- [ ] 制定回滚方案
- [ ] 准备测试用例

---

## 📝 待确认问题

1. **后端 API 是否同步修改?**
   - 如果后端也改,需要前后端联调
   - 如果后端不改,前端需要适配层

2. **数据库字段是否修改?**
   - `node_id`, `node_name` 等字段
   - 影响数据迁移脚本

3. **文档是否同步更新?**
   - API 文档
   - 用户手册
   - 开发文档

4. **其他语言包是否同步?**
   - 英文 (en-US)
   - 其他语言

---

## 🎯 结论

### 可行性评估: ✅ **完全可行**

**理由:**
1. ✅ 影响范围可控 (主要在前端)
2. ✅ TypeScript 提供类型安全保障
3. ✅ 可以渐进式迁移,风险低
4. ✅ 符合用户体验优化目标
5. ✅ 与官网概念保持一致

### 建议优先级: 🔥 **高优先级**

**理由:**
1. 提升用户体验 (易理解的术语)
2. 与官网品牌形象统一
3. 减少用户学习成本
4. 为后续推广打基础

### 下一步行动

1. **立即行动:** 创建 POC 分支验证可行性 (1小时)
2. **短期目标:** UI 文本 i18n 迁移 (1周)
3. **中期目标:** 类型别名和适配层 (2周)
4. **长期目标:** 完整代码重构 (1个月)

---

**文档版本:** v1.0  
**创建日期:** 2026-01-06  
**状态:** 待评审
