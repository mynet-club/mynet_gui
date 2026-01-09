# MyNet UX 优化实施计划

> 创建日期：2025-12-26  
> 基于需求：轻松/明亮/统一/信息不松散  
> 目标用户：长期使用者 + 非工程用户

---

## 📋 已确认的产品决策

### 1. 状态语义映射（三色系统）

```typescript
// 状态映射规则
NODE_STATUS.ONLINE (2)         → 🟢 可用 (Available)
NODE_STATUS.ENABLED (1)        → 🟡 待连接 (Pending)
NODE_STATUS.MAINTENANCE (99)   → ⚪ 不可用 (Unavailable)
NODE_STATUS.DISABLED (0)       → ⚪ 不可用 (Unavailable)
NODE_STATUS.UNCONFIGURED (-1)  → ⚪ 不可用 (Unavailable)
```

### 2. 好友节点卡片改进

- ✅ 底部显示好友头像和名称
- ✅ 只保留 1 个主操作按钮
- ✅ 其他操作移到"更多"菜单
- ✅ 鼓励/提醒用户完善头像

### 3. 数据字段

- 🔄 地理/场景信息 - 需要后端添加（见后端需求清单）
- ⏳ 短期方案：从 `node_name` 智能解析

---

## 🎯 实施阶段

### Phase 1: 状态映射统一（P0 - 立即实施）

**耗时：0.5 天**

#### 1.1 创建统一状态映射组件

**文件：** `src/components/common/StatusDisplay.vue`

```vue
<template>
  <div class="status-display" :class="statusClass">
    <q-icon :name="statusIcon" :size="iconSize" />
    <span class="status-text">{{ statusText }}</span>
    <span v-if="statusDetail" class="status-detail">· {{ statusDetail }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NODE_STATUS } from '../../types/node'

interface Props {
  status: number | string
  showDetail?: boolean
  iconSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  showDetail: false,
  iconSize: '14px'
})

// 状态映射逻辑
const statusMap = computed(() => {
  const statusNum = typeof props.status === 'number' 
    ? props.status 
    : parseInt(props.status)
  
  switch (statusNum) {
    case NODE_STATUS.ONLINE:
      return {
        semantic: 'available',
        text: '在线',
        detail: '可连接',
        icon: 'wifi',
        color: 'positive',
        class: 'status-available'
      }
    
    case NODE_STATUS.ENABLED:
      return {
        semantic: 'pending',
        text: '待连接',
        detail: '已启用等待上线',
        icon: 'schedule',
        color: 'warning',
        class: 'status-pending'
      }
    
    case NODE_STATUS.MAINTENANCE:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detail: '维护中',
        icon: 'build',
        color: 'grey',
        class: 'status-unavailable'
      }
    
    case NODE_STATUS.DISABLED:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detail: '已禁用',
        icon: 'block',
        color: 'grey',
        class: 'status-unavailable'
      }
    
    case NODE_STATUS.UNCONFIGURED:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detail: '未配置',
        icon: 'settings',
        color: 'grey',
        class: 'status-unavailable'
      }
    
    default:
      return {
        semantic: 'unknown',
        text: '未知',
        detail: '',
        icon: 'help',
        color: 'grey',
        class: 'status-unknown'
      }
  }
})

const statusText = computed(() => statusMap.value.text)
const statusDetail = computed(() => props.showDetail ? statusMap.value.detail : '')
const statusIcon = computed(() => statusMap.value.icon)
const statusClass = computed(() => statusMap.value.class)
</script>

<style lang="scss" scoped>
.status-display {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--soft-radius-full, 999px);
  font-size: 0.875rem;
  font-weight: 500;
  
  &.status-available {
    background-color: var(--soft-success-bg, #f0fdf4);
    color: var(--soft-success, #48bb78);
  }
  
  &.status-pending {
    background-color: var(--soft-warning-bg, #fffaf0);
    color: var(--soft-warning, #ed8936);
  }
  
  &.status-unavailable {
    background-color: var(--soft-bg-secondary, #e8ecf1);
    color: var(--soft-text-secondary, #718096);
  }
  
  .status-text {
    font-weight: 600;
  }
  
  .status-detail {
    font-weight: 400;
    opacity: 0.8;
  }
}
</style>
```

#### 1.2 更新全局工具函数

**文件：** `src/utils/statusMapping.ts`

```typescript
import { NODE_STATUS } from '../types/node'

/**
 * 统一的状态语义类型
 */
export type StatusSemantic = 'available' | 'pending' | 'unavailable' | 'unknown'

/**
 * 状态显示配置
 */
export interface StatusDisplay {
  semantic: StatusSemantic
  text: string
  detailText: string
  icon: string
  color: string
  bgColor: string
}

/**
 * 获取用户友好的状态显示
 */
export function getUserFriendlyStatus(status: number | string): StatusDisplay {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  
  switch (statusNum) {
    case NODE_STATUS.ONLINE:
      return {
        semantic: 'available',
        text: '在线',
        detailText: '可连接',
        icon: 'wifi',
        color: 'positive',
        bgColor: '#f0fdf4'
      }
    
    case NODE_STATUS.ENABLED:
      return {
        semantic: 'pending',
        text: '待连接',
        detailText: '已启用等待上线',
        icon: 'schedule',
        color: 'warning',
        bgColor: '#fffaf0'
      }
    
    case NODE_STATUS.MAINTENANCE:
    case NODE_STATUS.DISABLED:
    case NODE_STATUS.UNCONFIGURED:
      return {
        semantic: 'unavailable',
        text: '不可用',
        detailText: getUnavailableReason(statusNum),
        icon: 'block',
        color: 'grey',
        bgColor: '#f5f7fa'
      }
    
    default:
      return {
        semantic: 'unknown',
        text: '未知',
        detailText: '',
        icon: 'help',
        color: 'grey',
        bgColor: '#f5f7fa'
      }
  }
}

function getUnavailableReason(status: number): string {
  switch (status) {
    case NODE_STATUS.MAINTENANCE: return '维护中'
    case NODE_STATUS.DISABLED: return '已禁用'
    case NODE_STATUS.UNCONFIGURED: return '未配置'
    default: return ''
  }
}

/**
 * 判断状态是否可连接
 */
export function isStatusConnectable(status: number | string): boolean {
  const statusNum = typeof status === 'number' ? status : parseInt(status)
  return statusNum === NODE_STATUS.ONLINE
}
```

---

### Phase 2: Dashboard 优化（P0 - 立即实施）

**耗时：0.5 天**

#### 2.1 简化健康摘要

**文件：** `src/components/dashboard/NetworkHealthSummary.vue`

**修改点：**
1. 移除重复的状态说明
2. 只保留一句话结论
3. 弱化系统介绍文字

**Before:**
```
✅ 网络运行正常（8 个节点在线）
MyNet 提供安全的虚拟专用网络服务...（介绍文字）
```

**After:**
```
✅ 网络运行正常 · 8 个节点在线
```

#### 2.2 统计卡片优化

**文件：** `src/components/dashboard/DashboardStats.vue`

**保留 4 个卡片：**
1. 在线节点 (最重要)
2. 活跃路由
3. 异常数（如有）
4. 待处理（如有）

**移除：**
- 总节点数（不重要）
- 总路由数（不重要）
- 其他次要统计

#### 2.3 快速操作优化

**文件：** `src/pages/dashboard/DashboardPage.vue`

**保留操作：**
- 创建路由（主要操作）
- 处理异常（如有异常时显示）

**移除：**
- 创建节点（下沉到节点页面）
- 其他次要操作

---

### Phase 3: 好友节点卡片重构（P0 - 立即实施）

**耗时：1 天**

#### 3.1 新建好友节点卡片组件

**文件：** `src/components/route/FriendNodeCard.vue`

```vue
<template>
  <q-card class="friend-node-card" :class="cardClass">
    <!-- 主信息区 -->
    <q-card-section class="card-primary">
      <div class="node-header">
        <div class="node-name-wrapper">
          <h3 class="node-name">{{ displayName }}</h3>
          <StatusDisplay :status="node.node_status" show-detail />
        </div>
      </div>
      
      <!-- 场景信息（智能解析） -->
      <div v-if="sceneInfo" class="node-scene">
        <q-icon name="place" size="14px" />
        <span>{{ sceneInfo }}</span>
      </div>
    </q-card-section>
    
    <!-- 技术信息（默认折叠） -->
    <q-card-section class="card-technical">
      <q-expansion-item 
        dense
        header-class="text-caption text-soft-tertiary"
        label="技术详情"
        icon="code"
      >
        <div class="technical-details">
          <div class="detail-row">
            <span class="label">VPN类型</span>
            <span class="value">{{ node.vpn_type || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Endpoint</span>
            <span class="value">{{ node.endpoint || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">节点IP</span>
            <span class="value">{{ node.node_ip || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">最后在线</span>
            <span class="value">{{ formatLastSeen(node.last_seen) }}</span>
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
    
    <!-- 好友信息区（底部） -->
    <q-card-section class="card-friend-info">
      <div class="friend-wrapper">
        <q-avatar size="32px" class="friend-avatar">
          <img 
            v-if="friendAvatar" 
            :src="friendAvatar" 
            :alt="friendName"
          />
          <q-icon v-else name="person" size="20px" />
        </q-avatar>
        <div class="friend-details">
          <div class="friend-name">{{ friendName }}</div>
          <div v-if="!friendAvatar" class="avatar-hint">
            <q-icon name="info" size="12px" />
            <span>建议完善头像</span>
          </div>
        </div>
      </div>
    </q-card-section>
    
    <!-- 操作区 -->
    <q-separator />
    <q-card-actions align="between">
      <!-- 主操作按钮 -->
      <q-btn
        v-if="isConnectable"
        unelevated
        color="positive"
        icon="link"
        label="连接"
        @click="handleConnect"
        class="primary-action"
      />
      <q-btn
        v-else
        unelevated
        disable
        color="grey"
        icon="block"
        label="不可用"
        class="primary-action"
      />
      
      <!-- 更多操作菜单 -->
      <q-btn flat dense round icon="more_vert" class="more-actions">
        <q-menu>
          <q-list dense>
            <q-item clickable @click="handleViewDetails">
              <q-item-section avatar>
                <q-icon name="visibility" size="18px" />
              </q-item-section>
              <q-item-section>查看详情</q-item-section>
            </q-item>
            
            <q-item clickable @click="handleViewFriend">
              <q-item-section avatar>
                <q-icon name="person" size="18px" />
              </q-item-section>
              <q-item-section>查看好友</q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable @click="handleCopyInfo">
              <q-item-section avatar>
                <q-icon name="content_copy" size="18px" />
              </q-item-section>
              <q-item-section>复制信息</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import StatusDisplay from '../common/StatusDisplay.vue'
import { getUserFriendlyStatus, isStatusConnectable } from '../../utils/statusMapping'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  node: any
  friendName: string
  friendAvatar?: string
  friendId: string | number
}

const props = defineProps<Props>()
const emit = defineEmits(['connect', 'view-details'])
const router = useRouter()

// 显示名称
const displayName = computed(() => {
  return props.node.node_name || '未命名节点'
})

// 场景信息（智能解析）
const sceneInfo = computed(() => {
  // 从节点名称智能解析地理/场景信息
  const name = props.node.node_name || ''
  
  // 简单的地理位置匹配
  const locations = ['北京', '上海', '深圳', '广州', '杭州', '成都', '新加坡', '东京', '首尔']
  const location = locations.find(loc => name.includes(loc))
  
  // 简单的场景匹配
  const scenes = ['家', '办公室', 'Office', 'Home', '公司', '家用']
  const scene = scenes.find(s => name.includes(s))
  
  // 设备类型匹配
  const devices = ['Mac', 'Windows', 'Linux', 'iPhone', 'Android', 'Router', '路由器']
  const device = devices.find(d => name.includes(d))
  
  const parts = [location, scene, device].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : null
})

// 卡片状态类
const cardClass = computed(() => {
  const status = getUserFriendlyStatus(props.node.node_status)
  return `card-${status.semantic}`
})

// 是否可连接
const isConnectable = computed(() => {
  return isStatusConnectable(props.node.node_status)
})

// 格式化最后在线时间
const formatLastSeen = (lastSeen: string | null) => {
  if (!lastSeen) return '从未在线'
  
  try {
    const date = new Date(lastSeen)
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
  } catch {
    return lastSeen
  }
}

// 事件处理
const handleConnect = () => {
  emit('connect', props.node)
}

const handleViewDetails = () => {
  emit('view-details', props.node)
}

const handleViewFriend = () => {
  router.push(`/app/social?friend=${props.friendId}`)
}

const handleCopyInfo = () => {
  const info = `节点：${displayName.value}\n状态：${getUserFriendlyStatus(props.node.node_status).text}\n好友：${props.friendName}`
  navigator.clipboard.writeText(info)
}
</script>

<style lang="scss" scoped>
.friend-node-card {
  position: relative;
  transition: all 0.3s ease;
  
  &.card-available {
    border-left: 3px solid var(--soft-success, #48bb78);
  }
  
  &.card-pending {
    border-left: 3px solid var(--soft-warning, #ed8936);
  }
  
  &.card-unavailable {
    opacity: 0.7;
    border-left: 3px solid var(--soft-border-medium, #cbd5e0);
  }
  
  .card-primary {
    padding: var(--soft-spacing-lg);
    
    .node-header {
      .node-name-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        
        .node-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--soft-text-primary);
          margin: 0;
        }
      }
    }
    
    .node-scene {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--soft-text-secondary);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  }
  
  .card-technical {
    padding: 0.5rem var(--soft-spacing-lg);
    background-color: var(--soft-bg-hover);
    
    .technical-details {
      padding: 0.5rem 0;
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;
        font-size: 0.8125rem;
        
        .label {
          color: var(--soft-text-tertiary);
        }
        
        .value {
          color: var(--soft-text-secondary);
          font-family: monospace;
        }
      }
    }
  }
  
  .card-friend-info {
    padding: var(--soft-spacing-md) var(--soft-spacing-lg);
    background-color: var(--soft-bg-secondary);
    
    .friend-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      
      .friend-avatar {
        border: 2px solid white;
        box-shadow: var(--soft-shadow-sm);
      }
      
      .friend-details {
        flex: 1;
        
        .friend-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--soft-text-primary);
        }
        
        .avatar-hint {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--soft-warning);
          margin-top: 0.125rem;
        }
      }
    }
  }
  
  .q-card-actions {
    padding: var(--soft-spacing-md) var(--soft-spacing-lg);
    
    .primary-action {
      flex: 1;
      max-width: 200px;
    }
    
    .more-actions {
      margin-left: auto;
    }
  }
}
</style>
```

#### 3.2 更新好友节点页面

**文件：** `src/pages/route/FriendNodesPage.vue`

使用新的 `FriendNodeCard` 组件替换现有卡片。

---

### Phase 4: 列表页优化（P1 - 次优先）

**耗时：0.5 天**

#### 4.1 节点列表页

**文件：** `src/pages/node/NodesPage.vue`

**简化显示：**
- 名称
- 状态（使用 StatusDisplay 组件）
- 最后在线
- 操作按钮

**隐藏/下沉：**
- VPN类型（移到详情页）
- IP地址（移到详情页）
- 端口（移到详情页）

#### 4.2 路由列表页

**文件：** `src/pages/route/RoutesPage.vue`

**简化显示：**
- 路由名称
- 连接状态
- 两端节点
- 操作按钮

---

### Phase 5: 头像提醒功能（P2 - 增强体验）

**耗时：0.5 天**

#### 5.1 创建头像提醒组件

**文件：** `src/components/social/AvatarReminder.vue`

```vue
<template>
  <q-banner 
    v-if="shouldShowReminder" 
    class="avatar-reminder bg-soft-info-bg"
    dense
    rounded
  >
    <template #avatar>
      <q-avatar color="info" text-color="white" icon="account_circle" />
    </template>
    
    <div class="reminder-content">
      <div class="reminder-title">完善个人头像</div>
      <div class="reminder-text">
        设置个人头像可以让好友更容易识别你的节点
      </div>
    </div>
    
    <template #action>
      <q-btn 
        flat 
        dense 
        label="去设置" 
        color="info"
        @click="goToProfile"
      />
      <q-btn 
        flat 
        dense 
        icon="close" 
        @click="dismissReminder"
      />
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 是否应该显示提醒
const shouldShowReminder = computed(() => {
  // 检查用户是否有头像
  const hasAvatar = !!authStore.user?.avatar
  
  // 检查是否已经关闭过提醒
  const dismissed = localStorage.getItem('avatar-reminder-dismissed')
  
  return !hasAvatar && !dismissed
})

const goToProfile = () => {
  router.push('/app/profile')
}

const dismissReminder = () => {
  localStorage.setItem('avatar-reminder-dismissed', 'true')
}
</script>

<style lang="scss" scoped>
.avatar-reminder {
  margin-bottom: var(--soft-spacing-lg);
  
  .reminder-content {
    .reminder-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .reminder-text {
      font-size: 0.875rem;
      color: var(--soft-text-secondary);
    }
  }
}
</style>
```

#### 5.2 在关键页面显示提醒

在以下页面添加 `AvatarReminder` 组件：
- Dashboard
- 好友列表页
- 好友节点页

---

## 📊 后端需求清单

### 需求 1: 节点地理/场景信息字段

**目标：** 为节点添加地理位置和使用场景标签

**新增字段：**

```typescript
// Node 接口扩展
interface Node {
  // ... 现有字段
  
  // 新增字段
  location?: string           // 地理位置（如：北京、新加坡）
  scene?: string             // 使用场景（如：家用、办公室）
  device_type?: string       // 设备类型（如：Mac、路由器）
  tags?: string[]            // 自定义标签
}
```

**API 变更：**

1. **创建节点 API**
   - `POST /api/v1/nodes`
   - 请求体添加可选字段：`location`, `scene`, `device_type`, `tags`

2. **更新节点 API**
   - `PUT /api/v1/nodes/{id}`
   - 请求体添加可选字段：`location`, `scene`, `device_type`, `tags`

3. **节点列表/详情 API**
   - 返回数据包含新字段

**优先级：** P1 - 高优先级

**预期收益：**
- 用户可以快速识别节点用途
- 减少技术术语依赖
- 提升社交化体验

---

### 需求 2: 节点昵称字段

**目标：** 允许用户为节点设置易记的昵称

**新增字段：**

```typescript
interface Node {
  // ... 现有字段
  
  node_alias?: string  // 节点昵称（用户自定义的友好名称）
}
```

**API 变更：**

1. **创建/更新节点 API**
   - 添加 `node_alias` 字段

2. **显示优先级：**
   - 如果有 `node_alias`，优先显示昵称
   - 否则显示 `node_name`

**优先级：** P2 - 中优先级

---

### 需求 3: 用户头像上传/管理

**目标：** 完善用户头像功能

**API 需求：**

1. **上传头像**
   - `POST /api/v1/user/avatar`
   - 支持图片格式：JPG, PNG, WebP
   - 自动生成缩略图

2. **获取用户信息**
   - `GET /api/v1/user/profile`
   - 返回包含 `avatar_url` 字段

3. **删除头像**
   - `DELETE /api/v1/user/avatar`

**优先级：** P1 - 高优先级

---

## ✅ 验收标准

### Phase 1: 状态映射

- [ ] 全站不再显示 "enabled"、"disabled" 等技术术语
- [ ] 所有状态统一使用三色系统
- [ ] StatusDisplay 组件在各页面正常工作

### Phase 2: Dashboard

- [ ] Dashboard 加载时间 < 2秒
- [ ] 新用户 5 秒内能判断系统状态
- [ ] 统计卡片数量 = 4
- [ ] 移除系统介绍文字

### Phase 3: 好友节点卡片

- [ ] 每张卡片只有 1 个主操作按钮
- [ ] 好友头像和名称显示在卡片底部
- [ ] 技术信息默认折叠
- [ ] 场景信息智能解析正确率 > 60%

### Phase 4: 列表页

- [ ] 列表页不显示完整技术配置
- [ ] 详情页展示完整信息
- [ ] 列表加载速度提升 30%

### Phase 5: 头像提醒

- [ ] 无头像用户看到提醒
- [ ] 提醒可以关闭且不再显示
- [ ] 点击"去设置"正确跳转

---

## 📅 时间规划

| 阶段 | 耗时 | 开始日期 | 完成日期 |
|------|------|----------|----------|
| Phase 1 | 0.5天 | D1 上午 | D1 下午 |
| Phase 2 | 0.5天 | D1 下午 | D2 上午 |
| Phase 3 | 1天 | D2 上午 | D3 上午 |
| Phase 4 | 0.5天 | D3 上午 | D3 下午 |
| Phase 5 | 0.5天 | D3 下午 | D4 上午 |
| **总计** | **3天** | - | - |

---

## 🎯 成功指标

**定量指标：**
- Dashboard 首屏加载时间 < 2秒
- 好友节点页加载时间 < 3秒
- 用户完成连接操作的平均步骤数 < 5步

**定性指标：**
- 新用户 5 秒内能理解系统状态
- 非技术用户无需查看文档即可完成连接
- 页面滚动无压迫感

---

## 📝 注意事项

1. **向后兼容**
   - 保持 API 响应格式不变
   - 新字段为可选字段
   - 旧数据仍然可以正常显示

2. **性能优化**
   - 智能解析场景信息不影响加载速度
   - 使用缓存减少重复计算

3. **用户体验**
   - 所有修改渐进式推出
   - 保留高级用户的技术信息查看入口
   - 提供清晰的视觉反馈

---

## 🚀 下一步行动

**立即开始：**
1. 创建 StatusDisplay 组件
2. 创建 statusMapping 工具函数
3. 更新 Dashboard 页面

**需要确认：**
1. 后端需求优先级排序
2. 后端开发时间表
3. 是否需要数据迁移计划

---

**准备好开始实施了吗？** 🎉
