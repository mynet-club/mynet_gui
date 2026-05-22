# Dashboard 改造详细方案（P0 最高优先级）

> 方案版本：v1.0  
> 创建日期：2025-12-22  
> 预计工期：3-4 天  
> 目标：将 Dashboard 从"入口集合页"升级为"状态决策页"

---

## 📋 目录

1. [改造目标](#改造目标)
2. [现状分析](#现状分析)
3. [详细设计](#详细设计)
4. [实施步骤](#实施步骤)
5. [代码实现](#代码实现)
6. [测试验收](#测试验收)

---

## 🎯 改造目标

### 必须新增的能力（不是 UI，而是职责）

1. ✅ **用一句话回答：当前网络是否健康**
   - 示例："网络运行正常（8 个节点在线）"
   - 示例："检测到 3 个异常节点，需要处理"

2. ✅ **明确展示：是否存在异常节点 / 异常路由**
   - 离线节点列表
   - 待处理连接请求
   - 未完成配置的节点

3. ✅ **让用户一眼知道：下一步最该点哪里**
   - 可操作的待办事项
   - 清晰的操作入口

### 实现约束

- ✅ 不新增复杂图表
- ✅ 不引入新概念
- ✅ 只复用现有数据源（nodes / routes / services）
- ✅ 保持现有技术栈（Vue 3 + Quasar）

---

## 📊 现状分析

### 当前文件结构

```
src/
├── pages/dashboard/
│   └── DashboardPage.vue          # 主页面（58 行）
├── components/dashboard/
│   ├── DashboardStats.vue         # 统计卡片（75 行）
│   ├── RealtimeMetrics.vue        # 实时指标（60 行）
│   └── RecentActivities.vue       # 最近活动（101 行）
└── composables/
    └── useDashboard.ts            # 数据逻辑（150 行）
```

### 当前数据流

```typescript
// useDashboard.ts
const dashboardData = ref({
  totalNodes: 0,           // ✅ 可用
  onlineNodes: 0,          // ✅ 可用
  offlineNodes: 0,         // ✅ 可用
  totalRoutes: 0,          // ✅ 可用
  activeRoutes: 0,         // ✅ 可用
  systemStatus: 'healthy', // ❌ 写死的
  lastUpdate: new Date()
})

const realtimeData = ref({
  cpuUsage: 0,             // ❌ 模拟数据
  memoryUsage: 0,          // ❌ 模拟数据
  networkTraffic: 0,       // ❌ 模拟数据
  activeConnections: 0     // ❌ 模拟数据
})

const recentActivities = ref<Activity[]>([])  // ❌ 模拟数据
```

### 问题诊断

| 问题 | 现状 | 影响 |
|------|------|------|
| **缺乏状态判断** | systemStatus 固定为 'healthy' | 用户无法判断系统是否正常 |
| **信息不聚焦** | 在线/离线节点平等展示 | 异常节点不突出 |
| **缺少操作引导** | 只有数字统计 | 用户不知道下一步该做什么 |
| **数据割裂** | 实时数据和统计数据分离 | 缺乏整体视角 |

---

## 🎨 详细设计

### 新布局结构（三段式）

```
┌─────────────────────────────────────────────┐
│  1. 网络健康摘要（顶部）                      │
│  ┌─────────────────────────────────────────┐│
│  │ 🟢 网络运行正常（8 个节点在线）          ││
│  │ 待处理：[2个待处理连接] [1个未配置节点] ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  2. 异常优先区（中部）                        │
│  ┌─────────────────────────────────────────┐│
│  │ ⚠️ 需要关注的问题                        ││
│  │                                          ││
│  │ 📵 离线节点（2）                         ││
│  │   - node-server-01  2小时前离线         ││
│  │   - node-gateway-03 30分钟前离线        ││
│  │                                          ││
│  │ ⏰ 待处理连接（2）                       ││
│  │   - friend-user-123 请求连接            ││
│  │   [立即处理]                             ││
│  └─────────────────────────────────────────┘│
│  ✅ 所有系统运行正常，无需处理任何问题        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  3. 统计卡片 + 快速操作（底部）               │
│  ┌────────┬────────┬────────┬────────┐      │
│  │总节点数│在线节点│总路由数│活跃路由│      │
│  │   10   │   8    │   15   │   12   │      │
│  └────────┴────────┴────────┴────────┘      │
│                                              │
│  [创建节点] [创建路由] [处理连接(2)]         │
└─────────────────────────────────────────────┘
```

### 数据结构设计

#### 扩展 DashboardData

```typescript
interface DashboardData {
  // 基础统计（保留）
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
  totalRoutes: number
  activeRoutes: number
  lastUpdate: Date
  
  // 新增：健康状态
  healthStatus: HealthStatus
  healthMessage: string
  healthIcon: string
  healthColor: string
  
  // 新增：异常项目
  abnormalItems: AbnormalItems
  
  // 新增：待处理任务
  pendingTasks: PendingTask[]
  
  // 新增：社交统计（可选）
  friendConnections?: number
}

type HealthStatus = 'healthy' | 'warning' | 'critical'

interface AbnormalItems {
  offlineNodes: NodeSummary[]
  unconfiguredNodes: NodeSummary[]
  failedRoutes: RouteSummary[]
}

interface NodeSummary {
  id: string
  node_name: string
  node_status: number
  last_seen: string
  offlineDuration?: number  // 离线时长（分钟）
}

interface PendingTask {
  type: 'offline_node' | 'pending_connection' | 'unconfigured_node' | 'failed_route'
  count: number
  message: string
  actionText: string
  actionPath: string
  priority: 'high' | 'medium' | 'low'
}
```

#### 健康状态判断规则

```typescript
function calculateHealthStatus(data: DashboardData): HealthStatus {
  const { totalNodes, onlineNodes, abnormalItems } = data
  
  // 严重情况（Critical）
  const hasCriticalIssues = 
    onlineNodes === 0 ||  // 所有节点离线
    abnormalItems.offlineNodes.length >= totalNodes * 0.5 ||  // 50%以上节点离线
    abnormalItems.failedRoutes.length > 0  // 有路由故障
  
  if (hasCriticalIssues) {
    return 'critical'
  }
  
  // 警告情况（Warning）
  const hasWarnings = 
    abnormalItems.offlineNodes.length > 0 ||  // 有离线节点
    abnormalItems.unconfiguredNodes.length > 0 ||  // 有未配置节点
    (onlineNodes / totalNodes) < 0.8  // 在线率低于80%
  
  if (hasWarnings) {
    return 'warning'
  }
  
  // 健康情况（Healthy）
  return 'healthy'
}

function getHealthMessage(data: DashboardData): string {
  const { healthStatus, onlineNodes, totalNodes, abnormalItems } = data
  
  switch (healthStatus) {
    case 'healthy':
      return `网络运行正常（${onlineNodes} 个节点在线）`
    
    case 'warning':
      if (abnormalItems.offlineNodes.length > 0) {
        return `检测到 ${abnormalItems.offlineNodes.length} 个离线节点，建议检查`
      }
      if (abnormalItems.unconfiguredNodes.length > 0) {
        return `有 ${abnormalItems.unconfiguredNodes.length} 个节点未完成配置`
      }
      return `网络状态需要关注（在线率 ${Math.round(onlineNodes/totalNodes*100)}%）`
    
    case 'critical':
      return `检测到 ${abnormalItems.offlineNodes.length} 个异常节点，需要立即处理`
    
    default:
      return '网络状态未知'
  }
}
```

---

## 🚀 实施步骤

### 第一步：数据层改造（Day 1）

**任务清单：**
- [x] 扩展 DashboardData 接口
- [ ] 实现健康状态计算逻辑
- [ ] 实现异常项目收集逻辑
- [ ] 实现待处理任务生成逻辑
- [ ] 集成真实节点和路由数据

**修改文件：**
- `src/composables/useDashboard.ts`
- `src/types/dashboard.ts`（新建）

**关键代码位置：**

```typescript
// src/composables/useDashboard.ts

import { useNodes } from './useNodes'
import { useRoutes } from './useRoutes'

export function useDashboard() {
  const { nodes, loadNodes } = useNodes()
  const { overview, pendingConnections, fetchOverview } = useRoutes()
  
  // 扩展的 Dashboard 数据
  const dashboardData = ref<DashboardData>({
    totalNodes: 0,
    onlineNodes: 0,
    offlineNodes: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    lastUpdate: new Date(),
    healthStatus: 'healthy',
    healthMessage: '',
    healthIcon: '',
    healthColor: '',
    abnormalItems: {
      offlineNodes: [],
      unconfiguredNodes: [],
      failedRoutes: []
    },
    pendingTasks: []
  })
  
  // 计算异常项目
  const collectAbnormalItems = () => {
    const abnormal: AbnormalItems = {
      offlineNodes: [],
      unconfiguredNodes: [],
      failedRoutes: []
    }
    
    nodes.value.forEach(node => {
      // 离线节点（状态为1：启用但离线）
      if (node.node_status === 1) {
        abnormal.offlineNodes.push({
          id: node.id,
          node_name: node.node_name,
          node_status: node.node_status,
          last_seen: node.last_seen,
          offlineDuration: calculateOfflineDuration(node.last_seen)
        })
      }
      
      // 未配置节点（状态为-1）
      if (node.node_status === -1) {
        abnormal.unconfiguredNodes.push({
          id: node.id,
          node_name: node.node_name,
          node_status: node.node_status,
          last_seen: node.last_seen
        })
      }
    })
    
    return abnormal
  }
  
  // 生成待处理任务
  const generatePendingTasks = (): PendingTask[] => {
    const tasks: PendingTask[] = []
    const abnormal = dashboardData.value.abnormalItems
    
    // 离线节点任务
    if (abnormal.offlineNodes.length > 0) {
      tasks.push({
        type: 'offline_node',
        count: abnormal.offlineNodes.length,
        message: `${abnormal.offlineNodes.length} 个节点离线`,
        actionText: '检查节点',
        actionPath: '/app/nodes?filter=offline',
        priority: 'high'
      })
    }
    
    // 待处理连接任务
    if (pendingConnections.value.length > 0) {
      tasks.push({
        type: 'pending_connection',
        count: pendingConnections.value.length,
        message: `${pendingConnections.value.length} 个待处理连接`,
        actionText: '立即处理',
        actionPath: '/app/routes/pending',
        priority: 'medium'
      })
    }
    
    // 未配置节点任务
    if (abnormal.unconfiguredNodes.length > 0) {
      tasks.push({
        type: 'unconfigured_node',
        count: abnormal.unconfiguredNodes.length,
        message: `${abnormal.unconfiguredNodes.length} 个节点未配置`,
        actionText: '完成配置',
        actionPath: '/app/nodes?filter=unconfigured',
        priority: 'low'
      })
    }
    
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }
  
  // 刷新 Dashboard 数据
  const fetchDashboardData = async () => {
    isLoading.value = true
    try {
      // 并行加载节点和路由数据
      await Promise.all([
        loadNodes(),
        fetchOverview()
      ])
      
      // 基础统计
      dashboardData.value.totalNodes = nodes.value.length
      dashboardData.value.onlineNodes = nodes.value.filter(n => n.node_status === 2).length
      dashboardData.value.offlineNodes = nodes.value.filter(n => n.node_status === 1).length
      dashboardData.value.totalRoutes = overview.value.connected_nodes
      dashboardData.value.activeRoutes = overview.value.active_routes
      
      // 收集异常项目
      dashboardData.value.abnormalItems = collectAbnormalItems()
      
      // 生成待处理任务
      dashboardData.value.pendingTasks = generatePendingTasks()
      
      // 计算健康状态
      dashboardData.value.healthStatus = calculateHealthStatus(dashboardData.value)
      dashboardData.value.healthMessage = getHealthMessage(dashboardData.value)
      
      // 更新时间
      dashboardData.value.lastUpdate = new Date()
      
    } catch (error) {
      debug.error('获取 Dashboard 数据失败:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    dashboardData,
    isLoading,
    fetchDashboardData
  }
}
```

### 第二步：UI 组件开发（Day 2-3）

#### 2.1 网络健康摘要组件

**新建：** `src/components/dashboard/NetworkHealthSummary.vue`

```vue
<template>
  <q-card 
    class="health-summary" 
    :class="`health-${healthStatus}`"
  >
    <q-card-section>
      <div class="row items-start q-gutter-md">
        <!-- 健康状态图标 -->
        <div class="col-auto">
          <q-avatar 
            :icon="getHealthIcon()" 
            :color="getHealthColor()"
            text-color="white"
            size="56px"
          />
        </div>
        
        <!-- 健康摘要信息 -->
        <div class="col">
          <div class="text-h6 text-weight-bold">
            {{ healthMessage }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            最后更新：{{ formatRelativeTime(lastUpdate) }}
          </div>
          
          <!-- 待处理任务列表 -->
          <div v-if="pendingTasks.length > 0" class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-xs">待处理任务：</div>
            <div class="row q-gutter-xs">
              <q-chip
                v-for="task in pendingTasks"
                :key="task.type"
                :color="getTaskColor(task.priority)"
                text-color="white"
                size="sm"
                clickable
                @click="handleTaskClick(task)"
              >
                <q-icon 
                  :name="getTaskIcon(task.type)" 
                  size="xs" 
                  class="q-mr-xs"
                />
                {{ task.message }}
                <q-icon name="arrow_forward" size="xs" class="q-ml-xs" />
              </q-chip>
            </div>
          </div>
        </div>
        
        <!-- 快速操作按钮 -->
        <div class="col-auto">
          <q-btn
            v-if="healthStatus !== 'healthy'"
            color="primary"
            icon="search"
            label="查看详情"
            @click="scrollToAbnormalSection"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '@/utils/dateFormat'
import type { PendingTask, HealthStatus } from '@/types/dashboard'

interface Props {
  healthStatus: HealthStatus
  healthMessage: string
  pendingTasks: PendingTask[]
  lastUpdate: Date
}

const props = defineProps<Props>()
const router = useRouter()

const getHealthIcon = () => {
  switch (props.healthStatus) {
    case 'healthy': return 'check_circle'
    case 'warning': return 'warning'
    case 'critical': return 'error'
    default: return 'help'
  }
}

const getHealthColor = () => {
  switch (props.healthStatus) {
    case 'healthy': return 'positive'
    case 'warning': return 'warning'
    case 'critical': return 'negative'
    default: return 'grey'
  }
}

const getTaskColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'grey'
  }
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'offline_node': return 'wifi_off'
    case 'pending_connection': return 'schedule'
    case 'unconfigured_node': return 'settings'
    case 'failed_route': return 'error'
    default: return 'info'
  }
}

const handleTaskClick = (task: PendingTask) => {
  router.push(task.actionPath)
}

const scrollToAbnormalSection = () => {
  const element = document.querySelector('.abnormal-section')
  element?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.health-summary {
  transition: all 0.3s ease;
  
  &.health-healthy {
    border-left: 4px solid var(--q-positive);
  }
  
  &.health-warning {
    border-left: 4px solid var(--q-warning);
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.05) 0%, transparent 100%);
  }
  
  &.health-critical {
    border-left: 4px solid var(--q-negative);
    background: linear-gradient(90deg, rgba(244, 67, 54, 0.05) 0%, transparent 100%);
  }
}
</style>
```

#### 2.2 异常项目展示组件

**新建：** `src/components/dashboard/AbnormalItemsSection.vue`

```vue
<template>
  <div class="abnormal-section">
    <!-- 有异常情况 -->
    <template v-if="hasAbnormalItems">
      <div class="section-header q-mb-md">
        <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
        <span class="text-h6">需要关注的问题</span>
      </div>
      
      <!-- 离线节点 -->
      <q-card v-if="offlineNodes.length > 0" class="q-mb-md abnormal-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="wifi_off" color="negative" class="q-mr-sm" />
              离线节点（{{ offlineNodes.length }}）
            </div>
            <q-btn 
              flat 
              dense 
              color="primary"
              label="查看全部" 
              icon-right="arrow_forward"
              @click="$router.push('/app/nodes?filter=offline')"
            />
          </div>
          
          <q-list dense separator>
            <q-item 
              v-for="node in displayedOfflineNodes" 
              :key="node.id"
              clickable
              @click="$router.push(`/app/nodes/${node.id}`)"
              class="offline-node-item"
            >
              <q-item-section avatar>
                <q-avatar color="grey-3" text-color="grey-7" icon="router" />
              </q-item-section>
              
              <q-item-section>
                <q-item-label>{{ node.node_name }}</q-item-label>
                <q-item-label caption>
                  <q-icon name="schedule" size="xs" />
                  {{ getOfflineText(node) }}
                </q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <q-chip 
                  :color="getOfflineSeverityColor(node.offlineDuration)"
                  text-color="white"
                  size="sm"
                >
                  {{ getOfflineDurationText(node.offlineDuration) }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div v-if="offlineNodes.length > 5" class="text-center q-mt-sm">
            <q-btn 
              flat 
              dense 
              size="sm"
              :label="`还有 ${offlineNodes.length - 5} 个离线节点`"
              @click="$router.push('/app/nodes?filter=offline')"
            />
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 待处理连接 -->
      <q-card v-if="pendingConnections.length > 0" class="q-mb-md abnormal-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="schedule" color="orange" class="q-mr-sm" />
              待处理连接（{{ pendingConnections.length }}）
            </div>
            <q-btn 
              flat 
              dense 
              color="primary"
              label="立即处理" 
              icon-right="arrow_forward"
              @click="$router.push('/app/routes/pending')"
            />
          </div>
          
          <div class="text-body2 text-grey-7">
            您有 {{ pendingConnections.length }} 个待处理的路由连接请求
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 未配置节点 -->
      <q-card v-if="unconfiguredNodes.length > 0" class="abnormal-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="settings" color="warning" class="q-mr-sm" />
              未完成配置（{{ unconfiguredNodes.length }}）
            </div>
            <q-btn 
              flat 
              dense 
              color="primary"
              label="完成配置" 
              icon-right="arrow_forward"
              @click="$router.push('/app/nodes?filter=unconfigured')"
            />
          </div>
          
          <div class="text-body2 text-grey-7">
            {{ unconfiguredNodes.map(n => n.node_name).join('、') }} 需要完成配置才能使用
          </div>
        </q-card-section>
      </q-card>
    </template>
    
    <!-- 一切正常 -->
    <q-banner v-else class="bg-positive-1 text-positive-8 rounded-borders">
      <template #avatar>
        <q-icon name="check_circle" color="positive" size="md" />
      </template>
      <div class="text-body1 text-weight-medium">
        ✨ 所有系统运行正常，无需处理任何问题
      </div>
      <div class="text-body2 q-mt-xs">
        {{ totalNodes }} 个节点全部在线，{{ totalRoutes }} 条路由正常运行
      </div>
    </q-banner>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '@/utils/dateFormat'
import type { NodeSummary } from '@/types/dashboard'

interface Props {
  offlineNodes: NodeSummary[]
  pendingConnections: any[]
  unconfiguredNodes: NodeSummary[]
  totalNodes: number
  totalRoutes: number
}

const props = defineProps<Props>()
const router = useRouter()

const hasAbnormalItems = computed(() => {
  return props.offlineNodes.length > 0 || 
         props.pendingConnections.length > 0 || 
         props.unconfiguredNodes.length > 0
})

const displayedOfflineNodes = computed(() => {
  return props.offlineNodes.slice(0, 5)
})

const getOfflineText = (node: NodeSummary) => {
  if (node.last_seen) {
    return `最后在线：${formatRelativeTime(node.last_seen)}`
  }
  return '从未在线'
}

const getOfflineDurationText = (minutes?: number) => {
  if (!minutes) return '未知'
  if (minutes < 60) return `${minutes}分钟`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时`
  return `${Math.floor(minutes / 1440)}天`
}

const getOfflineSeverityColor = (minutes?: number) => {
  if (!minutes) return 'grey'
  if (minutes < 60) return 'warning'      // < 1小时：警告
  if (minutes < 1440) return 'orange'     // < 1天：橙色
  return 'negative'                        // >= 1天：严重
}
</script>

<style lang="scss" scoped>
.abnormal-section {
  .section-header {
    display: flex;
    align-items: center;
  }
  
  .abnormal-card {
    border-left: 3px solid var(--q-warning);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  .offline-node-item {
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
}
</style>
```

#### 2.3 更新主页面

**修改：** `src/pages/dashboard/DashboardPage.vue`

```vue
<template>
  <PageLayout
    :title="$t('dashboard.title')"
    :subtitle="$t('dashboard.subtitle')"
    icon="dashboard"
  >
    <template #actions>
      <q-btn-group>
        <q-btn
          color="primary"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="isLoading"
        />
        <q-btn
          color="secondary"
          icon="settings"
          :label="$t('common.settings')"
          @click="showSettings = true"
        />
      </q-btn-group>
    </template>

    <!-- 加载状态 -->
    <q-inner-loading :showing="isLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <div v-if="!isLoading">
      <!-- 1. 网络健康摘要 -->
      <NetworkHealthSummary
        :health-status="dashboardData.healthStatus"
        :health-message="dashboardData.healthMessage"
        :pending-tasks="dashboardData.pendingTasks"
        :last-update="dashboardData.lastUpdate"
        class="q-mb-lg"
      />
      
      <!-- 2. 异常优先区 -->
      <AbnormalItemsSection
        :offline-nodes="dashboardData.abnormalItems.offlineNodes"
        :pending-connections="pendingConnections"
        :unconfigured-nodes="dashboardData.abnormalItems.unconfiguredNodes"
        :total-nodes="dashboardData.totalNodes"
        :total-routes="dashboardData.totalRoutes"
        class="q-mb-lg"
      />
      
      <!-- 3. 统计卡片（简化版）-->
      <DashboardStats 
        :dashboard-data="dashboardData"
        :online-rate="onlineRate"
        class="q-mb-lg"
      />
      
      <!-- 4. 快速操作 -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">快速操作</div>
          <div class="row q-gutter-md">
            <q-btn
              color="primary"
              icon="add"
              label="创建节点"
              @click="$router.push('/app/nodes/create')"
              class="col"
              unelevated
            />
            <q-btn
              color="secondary"
              icon="add_road"
              label="创建路由"
              @click="$router.push('/app/routes/create')"
              class="col"
              unelevated
            />
            <q-btn
              v-if="dashboardData.pendingTasks.some(t => t.type === 'pending_connection')"
              color="warning"
              icon="schedule"
              :label="`处理连接 (${pendingConnections.length})`"
              @click="$router.push('/app/routes/pending')"
              class="col"
              unelevated
            />
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 5. 最近活动（可选展开）-->
      <q-expansion-item
        label="最近活动"
        icon="history"
        header-class="text-h6"
        default-opened
      >
        <RecentActivities :recent-activities="recentActivities" />
      </q-expansion-item>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDashboard } from '@/composables/useDashboard'
import { useRoutes } from '@/composables/useRoutes'
import PageLayout from '@/components/layout/PageLayout.vue'
import NetworkHealthSummary from '@/components/dashboard/NetworkHealthSummary.vue'
import AbnormalItemsSection from '@/components/dashboard/AbnormalItemsSection.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import RecentActivities from '@/components/dashboard/RecentActivities.vue'

const {
  dashboardData,
  realtimeData,
  recentActivities,
  isLoading,
  fetchDashboardData
} = useDashboard()

const { pendingConnections } = useRoutes()

const onlineRate = computed(() => {
  if (dashboardData.value.totalNodes === 0) return 0
  return Math.round((dashboardData.value.onlineNodes / dashboardData.value.totalNodes) * 100)
})

const handleRefresh = async () => {
  await fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
})
</script>
```

### 第三步：国际化支持（Day 3）

**更新：** `src/i18n/zh-CN.ts`

```typescript
export default {
  dashboard: {
    title: '仪表板',
    subtitle: '网络状态总览',
    connected: '已连接',
    disconnected: '未连接',
    
    // 健康状态
    health: {
      healthy: '健康',
      warning: '警告',
      critical: '严重'
    },
    
    // 健康消息模板
    healthMessages: {
      allOnline: '网络运行正常（{count} 个节点在线）',
      someOffline: '检测到 {count} 个离线节点，建议检查',
      criticalIssues: '检测到 {count} 个异常节点，需要立即处理',
      lowOnlineRate: '网络状态需要关注（在线率 {rate}%）',
      unconfigured: '有 {count} 个节点未完成配置'
    },
    
    // 待处理任务
    pendingTasks: {
      offlineNodes: '{count} 个节点离线',
      pendingConnections: '{count} 个待处理连接',
      unconfiguredNodes: '{count} 个节点未配置',
      failedRoutes: '{count} 个路由故障'
    },
    
    // 异常项目
    abnormalItems: {
      title: '需要关注的问题',
      noIssues: '所有系统运行正常，无需处理任何问题',
      offlineNodes: '离线节点',
      pendingConnections: '待处理连接',
      unconfiguredNodes: '未完成配置',
      viewAll: '查看全部',
      handleNow: '立即处理',
      completeConfig: '完成配置',
      lastSeen: '最后在线：{time}',
      neverOnline: '从未在线'
    },
    
    // 快速操作
    quickActions: {
      title: '快速操作',
      createNode: '创建节点',
      createRoute: '创建路由',
      handleConnections: '处理连接 ({count})'
    },
    
    // 统计
    stats: {
      totalNodes: '总节点数',
      onlineNodes: '在线节点',
      offlineNodes: '离线节点',
      totalRoutes: '总路由数',
      activeRoutes: '活跃路由',
      onlineRate: '在线率',
      friendConnections: '好友连接'
    }
  }
}
```

---

## ✅ 测试验收

### 单元测试清单

- [ ] **健康状态计算测试**
  - [ ] 所有节点在线 → healthy
  - [ ] 少量节点离线 → warning
  - [ ] 大量节点离线 → critical
  - [ ] 无节点时的边界情况

- [ ] **异常项目收集测试**
  - [ ] 正确识别离线节点
  - [ ] 正确识别未配置节点
  - [ ] 正确计算离线时长

- [ ] **待处理任务生成测试**
  - [ ] 按优先级排序
  - [ ] 正确生成跳转路径

### 集成测试清单

- [ ] **数据加载测试**
  - [ ] 首次加载正确显示
  - [ ] 刷新后数据更新
  - [ ] 加载失败的错误处理

- [ ] **交互测试**
  - [ ] 点击待处理任务跳转正确
  - [ ] 点击查看详情滚动正确
  - [ ] 快速操作按钮跳转正确

### 验收标准

#### ✅ 必须通过的验收项

1. **5秒内判断系统健康**
   - [ ] 用户登录后立即看到健康摘要
   - [ ] 健康状态颜色清晰（绿/黄/红）
   - [ ] 健康消息一目了然

2. **异常问题快速发现**
   - [ ] 离线节点在前3屏内可见
   - [ ] 待处理连接有明显提示
   - [ ] 未配置节点有操作引导

3. **下一步操作明确**
   - [ ] 每个待处理任务都有操作按钮
   - [ ] 按钮跳转到正确页面
   - [ ] 操作文案清晰易懂

4. **无"未知"状态**
   - [ ] 所有状态都有解释
   - [ ] 加载失败有友好提示
   - [ ] 边界情况有合理显示

5. **性能要求**
   - [ ] Dashboard 加载时间 < 2秒
   - [ ] 刷新操作响应时间 < 1秒
   - [ ] 无明显卡顿

---

## 📝 实施检查清单

### Day 1：数据层（必须完成）
- [ ] 创建 `src/types/dashboard.ts`
- [ ] 扩展 `useDashboard.ts` 数据结构
- [ ] 实现 `calculateHealthStatus()`
- [ ] 实现 `collectAbnormalItems()`
- [ ] 实现 `generatePendingTasks()`
- [ ] 集成 `useNodes()` 和 `useRoutes()`
- [ ] 单元测试通过

### Day 2：UI 组件（必须完成）
- [ ] 创建 `NetworkHealthSummary.vue`
- [ ] 创建 `AbnormalItemsSection.vue`
- [ ] 更新 `DashboardPage.vue`
- [ ] 组件样式调整
- [ ] 响应式布局测试

### Day 3：完善和测试
- [ ] 国际化文案补充
- [ ] 边界情况处理
- [ ] 错误处理完善
- [ ] 集成测试
- [ ] 性能优化
- [ ] 验收标准全部通过

---

## 🎉 预期成果

### 改造前 vs 改造后

**改造前：**
```
仪表板
├── 统计卡片（10个节点、8个在线）
├── 实时指标（CPU、内存）
└── 最近活动（3条）

❌ 用户需要自己判断：8/10在线是否正常？
❌ 看不出有哪些节点离线
❌ 不知道下一步该做什么
```

**改造后：**
```
仪表板
├── 健康摘要
│   ✅ "检测到2个离线节点，建议检查"
│   ✅ [2个节点离线] [1个待处理连接]
│
├── 异常优先区
│   ✅ 离线节点列表：node-01（2小时前）、node-03（30分钟前）
│   ✅ 待处理连接：friend-user-123 请求连接 [立即处理]
│
├── 统计卡片（简化）
└── 快速操作
    ✅ [创建节点] [创建路由] [处理连接(1)]

✅ 用户一眼知道：系统有问题
✅ 用户清楚看到：哪2个节点离线
✅ 用户明确知道：点击[立即处理]去处理连接
```

---

**方案完成日期：** 2025-12-22  
**下一步：** 开始实施 Day 1 任务
