# Dashboard UX 改进计划

> 创建日期：2025-12-26  
> 优先级：P1 高优先级  
> 预计工期：1-2 天

---

## 📋 问题分析

### 当前问题

1. **统计卡片不统一**
   - "在线节点" 卡片显示了额外的百分比信息，与其他三个卡片样式不一致
   - 所有卡片都没有点击跳转功能，是孤立的数据展示

2. **布局优先级不合理**
   - "快速操作"放在最后，但这应该是用户常用的功能
   - "最近活动"使用展开面板，但内容空洞（目前仅有模拟数据）

3. **缺少实时性**
   - 最近活动没有真实数据支撑
   - 缺少系统动态感知

---

## 🎯 改进方案

### 一、统一统计卡片样式与增加交互

#### 1.1 样式统一
- 移除"在线节点"卡片的特殊样式（百分比显示）
- 所有卡片保持一致的布局：图标 + 数值 + 标题

#### 1.2 增加点击跳转
每个卡片都应该是可点击的，跳转到对应的详情页面：

| 卡片 | 跳转路径 | 说明 |
|------|---------|------|
| 总节点数 | `/app/nodes` | 跳转到节点列表 |
| 在线节点 | `/app/nodes?filter=online` | 跳转到节点列表并筛选在线节点 |
| 总路由数 | `/app/routes` | 跳转到路由列表 |
| 活跃路由 | `/app/routes?filter=active` | 跳转到路由列表并筛选活跃路由 |

#### 1.3 卡片悬停效果
- 添加悬停时的阴影效果
- 添加鼠标指针变化
- 添加轻微的 transform 动画

---

### 二、调整布局顺序

#### 2.1 新的布局顺序

```
1. 网络健康摘要（保持不变）
2. 异常优先区（保持不变）
3. 快速操作（从最后移到这里）⬆️
4. 统计卡片（可点击）⬆️
5. 最近活动（重新设计内容）⬇️
```

**调整理由：**
- 快速操作是高频功能，应该在用户视线聚焦区域
- 统计卡片是概览信息，可以稍微靠后
- 最近活动是补充信息，放在最后合理

---

### 三、重新设计"最近活动"内容

#### 3.1 数据来源设计

最近活动可以展示以下内容（按优先级排序）：

##### 方案 A：基于现有 API 的活动（推荐，无需后端改动）

通过分析现有数据变化生成活动记录：

1. **节点状态变化**
   - 数据来源：定期轮询 `GET /api/nodes`
   - 记录内容：
     - 节点上线：`node_status` 从 0 → 1
     - 节点离线：`node_status` 从 1 → 0
     - 新节点添加：节点列表中出现新 ID
   - 示例："节点 'MyNode-01' 刚刚上线"

2. **路由状态变化**
   - 数据来源：定期轮询 `GET /api/routes/overview` 和 `GET /api/routes`
   - 记录内容：
     - 新路由创建：路由列表中出现新 ID
     - 路由连接成功：状态从 pending → connected
     - 路由断开：从列表中消失或状态变化
   - 示例："新建了与节点 'FriendNode-05' 的路由连接"

3. **待处理连接请求变化**
   - 数据来源：`GET /api/routes/pending-connections`
   - 记录内容：
     - 新的连接请求：pending 列表中出现新项
     - 连接请求处理：pending 列表项消失
   - 示例："收到来自 'Node-XX' 的新连接请求"

4. **用户操作记录（前端本地记录）**
   - 创建节点操作
   - 删除节点操作
   - 创建/删除路由操作
   - 示例："你创建了新节点 'MyNode-03'"

##### 方案 B：基于 WebSocket 实时推送（需要后端支持）

如果后端支持 WebSocket 推送，可以实时接收：

```typescript
// WebSocket 事件类型
interface WebSocketActivityEvent {
  type: 'node.online' | 'node.offline' | 'route.created' | 'route.deleted' | 'connection.request'
  data: {
    nodeId?: string
    nodeName?: string
    routeId?: string
    routeName?: string
    timestamp: string
  }
}
```

**后端需求：**
```
1. WebSocket 频道：dashboard.activities
2. 推送事件：
   - node.status.changed (node_id, old_status, new_status)
   - route.created (route_id, from_node, to_node)
   - route.deleted (route_id)
   - connection.request.new (from_node, to_node)
   - connection.request.accepted (request_id)
```

#### 3.2 实现建议（方案 A - 前端实现，推荐）

优势：
- ✅ 无需后端改动
- ✅ 可以立即实现
- ✅ 利用现有的数据轮询机制

实现方式：
```typescript
// 在 useDashboard.ts 中实现
const activityMonitor = {
  previousState: {
    nodes: new Map(),
    routes: new Map(),
    pendingConnections: []
  },
  
  detectChanges(currentNodes, currentRoutes, currentPending) {
    const activities = []
    
    // 检测节点状态变化
    for (const node of currentNodes) {
      const prevNode = this.previousState.nodes.get(node.id)
      if (!prevNode) {
        activities.push({
          type: 'node_added',
          message: `新增节点 "${node.node_name}"`
        })
      } else if (prevNode.node_status !== node.node_status) {
        if (node.node_status === 1) {
          activities.push({
            type: 'node_online',
            message: `节点 "${node.node_name}" 上线`
          })
        } else {
          activities.push({
            type: 'node_offline',
            message: `节点 "${node.node_name}" 离线`
          })
        }
      }
    }
    
    // 检测路由变化
    // ...类似逻辑
    
    return activities
  }
}
```

#### 3.3 UI 展示设计

```vue
<q-card>
  <q-card-section>
    <div class="row items-center justify-between">
      <div class="text-h6">最近活动</div>
      <q-chip size="sm" color="grey-3">
        实时监控
      </q-chip>
    </div>
  </q-card-section>
  
  <q-separator />
  
  <q-card-section class="q-pa-none">
    <q-list>
      <!-- 最新的 10 条活动 -->
      <q-item v-for="activity in recentActivities.slice(0, 10)" :key="activity.id">
        <q-item-section avatar>
          <q-avatar :color="getActivityColor(activity.type)" size="32px">
            <q-icon :name="getActivityIcon(activity.type)" color="white" size="18px" />
          </q-avatar>
        </q-item-section>
        
        <q-item-section>
          <q-item-label>{{ activity.message }}</q-item-label>
          <q-item-label caption>
            {{ formatRelativeTime(activity.timestamp) }}
          </q-item-label>
        </q-item-section>
        
        <!-- 如果有关联链接，显示查看按钮 -->
        <q-item-section side v-if="activity.link">
          <q-btn
            flat
            dense
            round
            icon="arrow_forward"
            size="sm"
            @click="$router.push(activity.link)"
          />
        </q-item-section>
      </q-item>
      
      <!-- 空状态 -->
      <q-item v-if="recentActivities.length === 0">
        <q-item-section class="text-center text-grey-6">
          <div class="q-py-md">
            <q-icon name="history" size="48px" color="grey-4" />
            <div class="q-mt-sm">暂无活动记录</div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card-section>
  
  <!-- 查看更多 -->
  <q-card-actions v-if="recentActivities.length > 10" align="center">
    <q-btn
      flat
      dense
      label="查看全部活动"
      icon-right="arrow_forward"
      @click="showAllActivities"
    />
  </q-card-actions>
</q-card>
```

---

## 🛠️ 实施步骤

### 第一阶段：统一卡片样式并添加交互（0.5 天）

- [x] 修改 DashboardStats.vue
  - 移除在线节点卡片的特殊副标题
  - 添加 clickable 属性
  - 添加点击事件处理
  - 添加悬停效果样式

- [x] 修改 ResponsiveCardGrid.vue
  - 支持 clickable 模式
  - 支持自定义点击事件

### 第二阶段：调整布局顺序（0.5 天）

- [x] 修改 DashboardPage.vue
  - 调整组件顺序
  - 更新样式间距

### 第三阶段：实现活动监控（1 天）

- [x] 扩展 useDashboard.ts
  - 实现状态变化检测
  - 实现活动记录生成
  - 实现活动持久化（localStorage）

- [x] 重新设计 RecentActivities.vue
  - 更新 UI 展示
  - 添加活动类型图标
  - 添加跳转链接

### 第四阶段：测试与优化（0.5 天）

- [x] 功能测试
- [x] 性能优化
- [x] 文档更新

---

## 📊 数据结构设计

### 活动记录类型

```typescript
// src/types/dashboard.ts

export interface Activity {
  id: string                    // 唯一 ID
  type: ActivityType            // 活动类型
  message: string               // 显示消息
  timestamp: Date               // 发生时间
  link?: string                 // 关联链接（可选）
  metadata?: Record<string, any> // 元数据（可选）
}

export type ActivityType = 
  | 'node_added'           // 新增节点
  | 'node_online'          // 节点上线
  | 'node_offline'         // 节点离线
  | 'node_deleted'         // 删除节点
  | 'route_created'        // 创建路由
  | 'route_deleted'        // 删除路由
  | 'route_connected'      // 路由连接成功
  | 'connection_request'   // 新的连接请求
  | 'connection_accepted'  // 连接请求已接受
  | 'connection_rejected'  // 连接请求已拒绝

// 活动配置
export const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: string
  color: string
  priority: number
}> = {
  node_added: { icon: 'add_circle', color: 'positive', priority: 5 },
  node_online: { icon: 'wifi', color: 'positive', priority: 7 },
  node_offline: { icon: 'wifi_off', color: 'negative', priority: 8 },
  node_deleted: { icon: 'remove_circle', color: 'negative', priority: 4 },
  route_created: { icon: 'add_road', color: 'primary', priority: 5 },
  route_deleted: { icon: 'remove_road', color: 'warning', priority: 4 },
  route_connected: { icon: 'check_circle', color: 'positive', priority: 6 },
  connection_request: { icon: 'notification_important', color: 'warning', priority: 9 },
  connection_accepted: { icon: 'done_all', color: 'positive', priority: 6 },
  connection_rejected: { icon: 'block', color: 'grey', priority: 3 },
}
```

### 活动存储策略

```typescript
// 本地存储 key
const ACTIVITIES_STORAGE_KEY = 'mynet_dashboard_activities'
const MAX_ACTIVITIES_STORED = 100  // 最多存储 100 条

// 存储结构
interface ActivitiesStorage {
  version: number
  activities: Activity[]
  lastUpdate: string
}
```

---

## 🎨 视觉效果

### 卡片悬停效果

```scss
.stat-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    
    .q-icon {
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
}
```

### 活动列表动画

```scss
.activity-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## ✅ 验收标准

### 功能验收

- [x] 所有统计卡片样式统一
- [x] 点击卡片能正确跳转到对应页面
- [x] 布局顺序调整完成
- [x] 最近活动能正确显示节点和路由的变化
- [x] 活动记录能持久化存储
- [x] 页面刷新后活动记录不丢失

### 体验验收

- [x] 卡片悬停效果流畅
- [x] 活动列表更新无闪烁
- [x] 时间显示友好（使用相对时间）
- [x] 空状态显示友好

### 性能验收

- [x] 活动检测不影响页面性能
- [x] 大量活动记录不卡顿（虚拟滚动）
- [x] 本地存储占用合理（<1MB）

---

## 🔄 后续优化建议

### 短期优化（1 周内）

1. **活动过滤**
   - 添加活动类型筛选
   - 添加日期范围筛选

2. **活动详情**
   - 点击活动查看详细信息
   - 显示更多上下文

### 中期优化（1 个月内）

1. **WebSocket 集成**
   - 如果后端支持，切换到 WebSocket 实时推送
   - 减少轮询频率，提升性能

2. **活动导出**
   - 导出活动记录为 CSV
   - 用于审计和分析

### 长期优化（3 个月内）

1. **活动统计**
   - 活动趋势图表
   - 高频事件分析

2. **智能提醒**
   - 异常活动自动提醒
   - 关键事件桌面通知

---

## 📝 总结

### 改进亮点

1. ✅ **统一体验** - 所有卡片样式一致，交互统一
2. ✅ **增强导航** - 卡片可点击跳转，减少用户操作路径
3. ✅ **合理布局** - 快速操作前置，符合用户使用习惯
4. ✅ **实时感知** - 活动监控让系统更有生命力
5. ✅ **无需后端** - 方案 A 可完全前端实现，快速上线

### 技术选择

- **优先使用方案 A**（前端监控）- 快速实现，无依赖
- **预留方案 B 接口**（WebSocket）- 未来可平滑升级

### 预期效果

- 用户能更快速地访问核心功能
- 用户能感知到系统的实时变化
- Dashboard 不再是"死"的数据展示，而是"活"的控制中心
