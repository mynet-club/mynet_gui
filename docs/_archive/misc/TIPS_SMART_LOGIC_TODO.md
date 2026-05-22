# Tips智能推荐逻辑 - 待完善的判断条件

## 当前推荐逻辑存在的问题

### 问题1: IP资源池推荐不够智能

**当前逻辑:**
```typescript
if (details.ipPoolCount === 0) {
  // 推荐创建IP资源池
  possibleActions.push('create_ippool')
}
```

**问题:** 
- 没有检查资源池的使用情况
- 用户已有资源池且未用尽时，仍可能推荐创建新池

**需要补充的判断条件:**
```typescript
// 需要后端API支持
interface IPPoolUsage {
  pool_id: number
  total_capacity: number      // 总容量
  allocated_count: number     // 已分配
  available_count: number     // 可用
  utilization_rate: number    // 使用率
}

// 智能判断逻辑
if (ipPoolCount === 0) {
  // 推荐创建第一个资源池
} else if (ipPoolUsage.has_unused_capacity) {
  // 有未用尽的资源池 -> 推荐分配IP而非创建新池
} else {
  // 资源池已满 -> 推荐扩容或创建新池
}
```

---

## 需要从后端获取的关键状态

### 1. IP资源池使用情况

**当前缺失:** 无法判断资源池是否有富余

**需要的数据结构:**
```typescript
interface IPPoolSummary {
  total_pools: number
  pools: Array<{
    pool_id: number
    pool_name: string
    total_capacity: number
    allocated_count: number
    available_count: number
    utilization_rate: number
    is_full: boolean
  }>
  summary: {
    total_capacity: number
    total_allocated: number
    total_available: number
    overall_utilization: number
    has_unused_capacity: boolean  // 关键字段
  }
}
```

**建议API:** `GET /api/v1/ippools/usage-summary`

---

### 2. 节点配置完整性

**当前缺失:** 无法判断节点是否完全配置

**需要的数据结构:**
```typescript
interface NodeConfigCheck {
  node_id: number
  checks: {
    has_ip_assigned: boolean        // 是否分配了IP
    has_network_config: boolean     // 是否配置了网络参数
    has_valid_keys: boolean         // 是否有有效密钥
    keys_expire_soon: boolean       // 密钥是否即将过期 (30天内)
    is_fully_configured: boolean    // 是否完全配置
  }
  missing_configs: string[]         // 缺失的配置项
  warnings: string[]                // 警告信息
}
```

**建议API:** `GET /api/v1/nodes/{id}/config-check`

---

### 3. 路由健康度

**当前缺失:** 无法判断路由质量

**需要的数据结构:**
```typescript
interface RouteHealthSummary {
  total_routes: number
  healthy_routes: number
  unhealthy_routes: number
  routes_with_issues: Array<{
    route_id: number
    peer_node_name: string
    issue_type: 'high_latency' | 'packet_loss' | 'unstable'
    severity: 'info' | 'warning' | 'critical'
    description: string
  }>
}
```

**建议API:** `GET /api/v1/routes/health-summary`

---

### 4. 用户引导进度

**当前缺失:** 无法判断用户完成了哪些关键步骤

**需要的数据结构:**
```typescript
interface OnboardingStatus {
  user_id: number
  onboarding_completed: boolean
  stages: {
    created_first_ippool: boolean
    added_first_node: boolean
    configured_first_route: boolean
    invited_friend: boolean
    accepted_friend_request: boolean
    created_service: boolean
  }
  completion_rate: number           // 0-100
  next_suggested_action: string
}
```

**建议API:** `GET /api/v1/user/onboarding-status`

---

### 5. 好友关系统计

**当前缺失:** 无法判断社交网络状态

**需要的数据结构:**
```typescript
interface SocialSummary {
  total_friends: number
  pending_requests: number            // 待处理的好友请求
  friends_with_routes: number         // 已建立路由的好友数
  friends_without_routes: number      // 未建立路由的好友数
  available_friend_nodes: number      // 好友可用节点总数
}
```

**建议API:** `GET /api/v1/social/summary`

---

## 智能推荐决策树（需要你补充判断条件）

### 场景1: IP资源池推荐

```
用户有IP资源池？
  └─ NO → 推荐: 创建第一个IP资源池 (优先级 1)
  └─ YES → 检查资源池使用情况
       ├─ 有富余 (利用率 < 80%) → 推荐: 创建节点(设备)/为节点(设备)分配IP (优先级 2)
       ├─ 接近满载 (80% <= 利用率 < 95%) → 推荐: 创建新IP池 (优先级 1)
       └─ 已满 (利用率 >= 95%) → 推荐: 创建新IP池 (优先级 0 - 紧急)
```

**决策逻辑补充:**
- **接近满载时:** 主推创建新IP池，避免资源耗尽影响新设备添加
- **已满时:** 紧急推荐创建新IP池（优先级提升至0），同时提示可能无法分配新IP
- **多个资源池时:** 统计所有资源池的总体利用率，按上述规则判断；如果各资源池利用率差异大，优先推荐使用低利用率的资源池

---

### 场景2: 节点添加推荐

```
用户有节点？
  └─ NO → 推荐: 添加第一个节点 (优先级 1)
  └─ YES → 检查节点配置状态
       ├─ 有未完全配置的节点 (status=-1) → 推荐: 完成配置 (优先级 0 - 紧急)
       │                                     同时提供: 添加新节点入口 (优先级 2)
       ├─ 只有1个节点 → 推荐: 添加第二个节点 (优先级 2)
       └─ 有多个节点 → 检查连接状态
            ├─ 节点间无连接 → 正常状态(自己的节点自动连接)
            │                 推荐: 添加好友 (优先级 3) 或 创建服务 (优先级 2)
            └─ 节点间有连接 → 推荐:
                              1. 查看连接质量/优化路由 (优先级 4)
                              2. 添加好友并建立跨用户连接 (优先级 3)
                              3. 创建服务 (优先级 2)
```

**决策逻辑补充:**
- **有未配置节点时:** 优先推荐完成配置(紧急优先级)，但同时在卡片底部提供"继续添加新节点"的次要入口
- **多个节点无连接时:** 这是正常状态(自己的节点会自动连接)，推荐下一步操作：添加好友或创建服务
- **已有多节点+连接后:** 进入成熟阶段，推荐:
  1. 优化类操作（检查路由健康度）
  2. 社交扩展（添加更多好友）
  3. 功能扩展（创建服务） (优先级 3)
  └─ YES → 检查好友连接状态
       ├─ 有待处理的好友请求 → 推荐: 处理请求 (优先级 0 - 紧急)
       ├─ 有好友但无跨用户连接 → 推荐: 和好友的设备(节点)建立连接 (优先级 2)
       └─ 有好友连接 → 根据好友数量:
            ├─ 好友数 < 3 → 推荐: 邀请更多好友 (优先级 3)
            ├─ 好友数 >= 3 且部分好友无连接 → 推荐: 与未连接的好友建立连接 (优先级 3)
            └─ 好友数 >= 3 且全部已连接 → 推荐: 创建服务 (优先级 2) 或 查看连接质量 (优先级 4)
```

**决策逻辑补充:**
- **有好友但未连接时:** 推荐建立与好友设备间的连接，这是体验跨用户功能的关键步骤
- **已有好友连接后:** 
  - 如果好友数量较少(<3)，推荐继续邀请好友扩展社交网络
  - 如果好友数量足够但部分未连接，推荐建立更多跨用户连接
  - 如果好友数量充足且全部连接，推荐进入下一阶段：创建服务或优化现有连接
- **好友数量影响:** 
  - 0个: 新手阶段，强烈推荐邀请
  - 1-2个: 推荐继续邀请
  - 3+个: 重点转向连接质量和服务创建
  - 待处理请求始终为最高优先级(紧急)但无跨用户连接 → 推荐: [和好友的设备(节点)建立链接]
       ├─ 有待处理的好友请求 → 推荐: 处理请求
       └─ 有好友连接 → 推荐: [和好友的设备(节点)建立链接]
```

**请补充:**
- 有好友但未连接时，推荐什么？
- 已有好友连接后，推荐什么？(至少1个) → 推荐: 创建你的第一个服务 (优先级 2)
       ├─ 有节点但无连接 → 推荐: 先添加第二个节点或添加好友建立连接 (优先级 2)
       └─ 无节点 → 不推荐，优先引导创建节点
  └─ YES → 根据服务数量和状态:
       ├─ 服务数 = 1 → 不推荐 (用户已掌握基础功能)
       ├─ 服务数 = 2-5 → 不推荐 (用户已经熟练)
       └─ 服务数 > 5 → 推荐: 查看服务质量/优化服务配置 (优先级 4 - 仅在Dashboard随机展示)
```

**决策逻辑补充:**
- **什么情况推荐发布服务:**
  - 必要条件: 至少有1个节点 + 至少有1个连接(自己的多节点或与好友的连接)
  - 推荐时机: 完成基础网络搭建后，作为功能扩展引导
  - 优先级: 2 (功能扩展类)，低于基础设施建设但高于优化建议
  
- **服务数量影响:**
  - 0个: 满足条件时推荐创建第一个服务
  - 1个: 不再推荐创建服务，用户已掌握功能
  - 2-5个: 用户已熟练，不做推荐
  - 5+个: 仅在随机推荐中偶尔出现"服务质量检查"建议
  
- **服务质量检查:**
  - 不作为主要推荐项
  - 仅在用户已有较多服务(5+)时，作为优化建议(优先级4)随机展示
  优先级排序规则:**

**核心原则:** 
1. 0-1阶段(从无到有) > 1→N阶段(扩展)
2. 前置业务 > 后续业务 (如: 创建IP池 > 添加节点 > 建立连接)
3. 紧急处理 > 新手引导 > 功能扩展 > 社交增强 > 优化建议

**优先级定义 (数字越小优先级越高):**

**0级 - 紧急处理类 (需立即处理):**
- 处理待定的好友请求 (`approve_pending_requests`)
- 完成未配置的节点 (`complete_node_config`)
- IP资源池已满警告 (`create_ippool_urgent`)
- 密钥即将过期警告 (`renew_keys`)

**1级 - 新手引导类 (0→1的创建):**
- 创建第一个IP资源池 (`create_ippool`)
- 添加第一个节点 (`add_first_device`)
- 创建第一个服务 (`create_first_service`)

**2级 - 功能扩展类 (1→N的扩展):**
- 添加第二个/更多节点 (`add_second_device`, `add_more_devices`)
- 与好友节点建立连接 (`create_cross_user_connection`)
- 创建更多服务 (`create_service`)
- 扩容IP资源池 (`expand_ippool`)

**3级 - 社交增强类:**
- 邀请好友 (`invite_friend`)
- 邀请更多好友 (`invite_more_friends`)
- 与未连接的好友建立连接 (`connect_with_friend`)

**展示规则详细定义:**

**1. Dashboard展示数量:**
- 最多展示 **3条** 推荐
- 如果推荐总数 < 3条，全部展示
- 如果推荐总数 >= 3条，按规则筛选

**2. 推荐选择策略:**
```typescript
// 展示算法
function selectRecommendations(allRecommendations) {
  // 第1步: 按优先级分组
  const grouped = groupByPriority(allRecommendations)
  
  // 第2步: 优先选择最高优先级的推荐
  const urgent = grouped[0] || []  // 优先级0 - 紧急
  const guide = grouped[1] || []   // 优先级1 - 新手引导
  const expand = grouped[2] || []  // 优先级2 - 功能扩展
  const social = grouped[3] || []  // 优先级3 - 社交
  const optimize = grouped[4] || [] // 优先级4 - 优化
  
  // 第3步: 选择展示项
  const selected = []
  各状态的精确边界条件定义:**

```typescript
enum UserState {
  // 1. 新用户阶段 - 尚未完成任何基础创建
  NewUser = 'new_user',
  // 条件: ipPoolCount === 0 && deviceCount === 0
  // 推荐: 创建IP资源池 (优先级1)
  // 特征: 完全空白的账号，需要从零开始引导
  
  // 2. 已创建IP池 - 完成第一步但未添加设备
  HasIPPool = 'has_ippool',
  // 条件: ipPoolCount >= 1 && deviceCount === 0
  // 推荐: 添加第一个节点 (优先级1)
  // 特征: 有资源但未使用，需要引导添加设备
  
  // 3. 单设备用户 - 仅有一个节点
  SingleDevice = 'single_device',
  // 条件: deviceCount === 1 && connectionCount === 0
  // 推荐: 添加第二个节点 (优先级2) 或 邀请好友 (优先级3)
  // 特征: 最小化配置，需要扩展以体验连接功能
  
  // 4. 多设备用户 - 有多个节点且节点间已自动连接
  MultipleDevices = 'multiple_devices',
  // 条件: deviceCount >= 2 && connectionCount >= 1 && friendCount === 0
  // 推荐: 邀请好友 (优先级3) 或 创建服务 (优先级2)
  // 特征: 自己的网络已建立，引导社交功能
  
  // 5. 有连接但无好友 - 自己多设备互连但未社交
  HasConnectionsNoFriends = 'has_connections_no_friends',
  // 条件: connectionCount >= 1 && friendCount === 0 && deviceCount >= 2
  // 推荐: 邀请好友 (优先级3)
  // 特征: 技术上已掌握连接，但未尝试跨用户功能
  
  // 6. 有好友但无连接 - 已添加好友但未建立跨用户连接
  HasFriendsNoConnections = 'has_friends_no_connections',
  // 条件: friendCount >= 1 && crossUserConnectionCount === 0
  // 推荐: 与好友的节点建立连接 (优先级2)
  // 特征: 社交关系已建立，需要引导建立实际网络连接
  
  // 7. 有跨用户连接 - 已与好友建立网络连接
  HasCrossUserConnections = 'has_cross_user_connections',
  // 条件: crossUserConnectionCount >= 1 && serviceCount === 0
  // 推荐: 创建服务 (优先级2) 或 邀请更多好友 (优先级3)
  // 特征: 已体验跨用户功能，引导创建服务或扩展社交
  
  // 8. 已创建服务 - 开始发布服务
  HasServices = 'has_services',
  // 条件: serviceCount >= 1 && serviceCount < 5
  // 推荐: 优化现有配置 (优先级4) 或 扩展网络 (优先级3)
  // 特征: 已掌握核心功能，引导优化和扩展
  
  // 9. 完全活跃用户 - 成熟用户
  FullyActive = 'fully_active'
  // 条件: deviceCount >= 2 && friendCount >= 1 && crossUserConnectionCount >= 1 && serviceCount >= 1
  // 推荐: 仅优化建议 (优先级4)，如路由健康检查、服务质量监控
  // 特征: 已充分使用系统，仅提供优化建议，不再做新手引导
}
```

**状态转换流程图:**
```
NewUser (无任何创建)
  ↓ 创建IP池
HasIPPool (有池但无设备)
  ↓ 添加第1个设备
SingleDevice (1个设备)
  ↓ 添加第2个设备
MultipleDevices (多设备自动互连) ────┐
  ↓ 邀请好友                        │
HasFriendsNoConnections             │
  ↓ 建立跨用户连接                   │ 或者直接创建服务
HasCrossUserConnections ←───────────┘
  ↓ 创建服务
HasServices (1-4个服务)
  ↓ 持续使用
FullyActive (成熟用户)
```

**特殊状态判断:**
```typescript
// 未完成配置的节点(status=-1)存在时，强制插入紧急推荐
if (hasIncompleteNodes) {
  recommendations.unshift({
    action: 'complete_node_config',
    priority: 0,  // 紧急
    target: incompleteNodeId
  })
}

// 有待处理的好友请求时，强制插入最高优先级
if (pendingFriendRequests > 0) {
  recommendations.unshift({
    action: 'approve_pending_requests',
    priority: 0,  // 紧急
    count: pendingFriendRequests
  })
}

// IP资源池完全满载时，提升优先级
if (ipPoolUtilization >= 95) {
  recommendations.unshift({
    action: 'create_ippool_urgent',
    priority: 0,  // 紧急
    reason: 'IP资源即将耗尽'
  })length))
  
  return selected
}
```

**3. 查看全部推荐入口:**
- **不需要** 专门的"查看全部"入口
- 推荐采用随机展示，每次刷新可能看到不同的推荐
- 用户通过多次访问Dashboard可以看到不同的建议

**4. 去重规则:**
```typescript
// 去重维度
interface DeduplicationRule {
  // 1. 同类型操作去重
  sameActionType: true  // 例如: 多个"添加节点"推荐只保留1个
  
  // 2. 同目标对象去重
  sameTarget: true      // 例如: 针对同一节点的多个推荐只保留最高优先级
  
  // 3. 逻辑冲突去重
  conflictingActions: true  // 例如: "创建IP池"和"使用现有IP池"互斥，只保留优先级高的
}

// 去重示例
const recommendations = [
  { action: 'add_device', priority: 2, target: null },
  { action: 'add_device', priority: 2, target: null },  // 重复 -> 删除
  { action: 'complete_config', priority: 0, target: 'node_1' },
  { action: 'complete_config', priority: 0, target: 'node_1' },  // 重复 -> 删除
  { action: 'create_ippool', priority: 1 },
  { action: 'use_existing_ippool', priority: 2 }  // 冲突 -> 保留priority=1的
]

// 去重后结果
const deduplicated = [
  { action: 'add_device', priority: 2 },
  { action: 'complete_config', priority: 0, target: 'node_1' },
  { action: 'create_ippool', priority: 1 }
]
```

**5. 刷新策略:**
- Dashboard数据刷新时重新计算推荐
- 用户完成某个推荐操作后，立即重新计算并更新推荐列表
- 随机展示部分每次刷新时重新洗牌，给用户新鲜感ig`)

**同优先级排序规则:**
- 同优先级内，按照前置依赖关系排序 (如: IP池 > 节点 > 连接)
- 如果无依赖关系，按照创建时间倒序 (新问题优先)
- Dashboard随机展示时，同优先级项随机排列

**动态优先级调整:**
- 不根据用户活跃度调整优先级数值
- 但根据用户状态动态决定显示哪些推荐项
- 例如: 新用户只看到0-2级推荐，成熟用户看到3-4级推荐
---

## 推荐优先级规则（需要你定义）

### 当前优先级定义

```typescript
create_ippool: priority 10
add_first_device: priority 9
add_second_device: priority 8
invite_friend: priority 7
approve_pending_requests: priority 10
```

**问题:**
- `approve_pending_requests` 和 `create_ippool` 优先级相同，如何排序？ 答: 如果有需求是0-1阶段的(从0-1的创建),优先;都是1->1+阶段 的话, 哪个是前置业务哪个优先, 比如创建池子比添加设备(节点)优先级高. 
- 多个同优先级推荐时的展示策略？
- 是否需要根据用户活跃度动态调整优先级？

**请定义优先级规则:**
1. 紧急处理类（待处理请求等）: 优先级 = 0
2. 新手引导类（创建资源池等）: 优先级 = 1
3. 功能扩展类（添加节点等）: 优先级 = 2
4. 社交增强类（邀请好友等）: 优先级 = 3
5. 优化建议类（路由优化等）: 优先级 = 4
- 数字越小优先级越高
---

## 推荐展示规则（需要你定义）

### 当前问题
- 一个页面可能有多个推荐，如何选择展示哪些？
- Dashboard卡片只能展示3-4条推荐
- 是否需要根据页面上下文过滤推荐？

**请定义展示规则:**
1. Dashboard最多展示几条推荐？3
2. 如何选择展示的推荐（优先级？类别？）？随机
3. 是否需要"查看全部推荐"入口？不需要,随机展示就可以.
4. 推荐是否需要去重（避免重复推荐类似的操作）？需要

---

## 用户状态判断的边界条件（需要你明确）

### 问题1: "新用户" 的定义
- 注册后多久算新用户？没有完成所有环节至少1个创建的用户
- 创建了IP池但长时间未添加节点，算什么状态？新用户

### 问题2: "活跃用户" 的定义
- 多少个节点算活跃？至少有1个连接(自己有2个设备或者有一个朋友设备之间的连接)
- 多少个连接算活跃？ 1个
- 是否需要时间维度（最近7天登录等）？不需要

### 问题3: "成熟用户" 的定义
- 什么条件下不再推荐基础操作？有了和朋友之间的连接了
- 是否需要推荐高级功能？需要

**请明确各状态的边界条件:**

```typescript
enum UserState {
  NewUser = 'new_user',              // 条件: [你来定义]
  HasIPPool = 'has_ippool',          // 条件: [你来定义]
  SingleDevice = 'single_device',    // 条件: [你来定义]
  MultipleDevices = 'multiple_devices', // 条件: [你来定义]
  HasConnectionsNoFriends = 'has_connections_no_friends', // 条件: [你来定义]
  HasFriendsNoConnections = 'has_friends_no_connections', // 条件: [你来定义]
  HasCrossUserConnections = 'has_cross_user_connections', // 条件: [你来定义]
  HasServices = 'has_services',      // 条件: [你来定义]
  FullyActive = 'fully_active'       // 条件: [你来定义]
}
```

---

## 需要你手动完善的部分总结

### 高优先级（影响推荐准确性）
1. ✅ IP资源池使用情况判断逻辑 只要用了一个就算用过了
2. ✅ 节点配置完整性判断逻辑 (节点状态为-1为未完成配置, 其余都是已完成)
3. ✅ 各场景的推荐决策树补充

### 中优先级（影响用户体验）
4. 推荐优先级规则定义
5. 推荐展示规则定义
6. 用户状态边界条件明确

### 低优先级（锦上添花）
7. 路由健康度推荐
8. 服务发布推荐
9. 高级功能推荐

---

## 前端实现位置

**UserStateAnalyzer.ts** (第86-166行)
- 分析用户状态
- 判断当前阶段
- 生成可能的行动列表

**RecommendationEngine.ts** (第37-274行)
- 根据状态生成具体推荐
- 定义每个推荐的优先级、文案、路由

**使用位置:**
- `src/components/dashboard/RecommendationsCard.vue`
- `src/composables/useRecommendations.ts`
