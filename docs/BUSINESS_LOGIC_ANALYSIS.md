# MyNet 核心业务模块学习总结

## 🏗️ 整体架构概览

MyNet是一个基于社交化组网的分布式网络管理平台，通过"加好友"的方式实现节点间的安全通信。系统采用Zone多租户隔离架构，确保不同租户的网络资源完全物理隔离。

### 核心业务特点
- **社交化组网**: 通过好友关系建立网络信任机制，简化复杂的网络配置
- **Zone多租户隔离**: 完全物理隔离的多租户架构，确保数据安全
- **模块化业务设计**: 每个业务模块都有独立的API、服务层和组件层
- **实时状态同步**: 支持WebSocket实时通信，及时更新网络状态
- **统一权限管理**: 基于Zone的分层权限控制机制

## 🔗 核心业务模块分析

### 1. Zone模块 - 多租户隔离核心

#### 1.1 业务概念
- **Zone**: 网络区域/租户空间，每个Zone是完全隔离的网络环境
- **用途**: 实现多租户隔离，每个企业/用户组拥有独立的网络空间
- **关系**: 所有资源(节点、IP池、路由、社交关系)都归属于特定Zone

#### 1.2 数据结构
```typescript
interface Zone {
  id: number                 // 数据库主键ID
  zone_id: number           // 业务ID
  zone_name: string         // Zone名称
  zone_domain: string       // Zone域名
  zone_status: number       // Zone状态(1:活跃, 0:非活跃)
  zone_admin_id: number     // Zone管理员ID
  zone_admin_name: string   // Zone管理员名称
  zone_remarks: string      // Zone备注
  can_access: boolean       // 当前用户是否可访问
  pivot: {                  // 用户与Zone的关联关系
    user_id: number
    zone_id: number
    is_admin: number        // 是否为管理员
  }
  created_at: string
  updated_at: string
}
```

#### 1.3 核心操作
- **Zone切换**: 用户在不同Zone间切换，改变当前操作上下文
- **Zone管理**: 创建、更新、删除Zone
- **权限控制**: 基于Zone的资源访问控制

### 2. Node模块 - 网络节点管理

#### 2.1 业务概念
- **Node**: 网络中的节点设备，如网关、服务器、客户端
- **用途**: 作为网络通信的端点，承载实际的网络服务
- **特点**: 每个Node必须归属于特定Zone，具有唯一的网络标识

#### 2.2 数据结构
```typescript
interface Node {
  id: number                          // 数据库主键ID
  node_id: string                     // 业务ID (如: N20240101123456)
  node_name: string                   // 节点名称
  node_type: string                   // 节点类型(Gateway/Server/Client)
  ip_address: string                  // IP地址
  port: number                        // 端口号
  status: 'active' | 'inactive' | 'pending'  // 节点状态
  zone_id: number                     // 所属Zone ID
  description?: string                // 节点描述
  created_at: string
  updated_at: string
}
```

#### 2.3 核心操作
- **节点管理**: CRUD操作，支持批量操作
- **状态监控**: 实时监控节点在线状态
- **配置管理**: 节点配置更新和同步
- **密钥管理**: 节点间通信密钥的生成和管理

#### 2.4 业务逻辑
```typescript
// 节点状态更新流程
const updateNodeStatus = async (nodeId: string, status: string) => {
  // 1. 验证权限(Zone级别)
  // 2. 更新节点状态
  // 3. 通知相关路由
  // 4. 发送WebSocket实时更新
  // 5. 更新统计数据
}
```

### 3. IPPools模块 - IP地址池管理

#### 3.1 业务概念
- **IPPool**: IP地址池，管理网络中可用的IP地址段
- **用途**: 为节点分配IP地址，避免IP冲突
- **特点**: 每个IP池归属于特定Zone，支持自动分配和手动管理

#### 3.2 数据结构
```typescript
interface IPPool {
  id: string                          // IP池ID
  zone_id: string                     // 所属Zone ID
  name?: string                       // IP池名称
  network?: string                    // 网络段 (如: 10.0.0.0/24)
  ip_range: {                         // IP地址范围
    start: string                     // 起始IP (如: 192.168.1.1)
    end: string                       // 结束IP (如: 192.168.1.254)
  }
  status: 'allocated' | 'available'   // IP池状态
  total_ips?: number                  // 总IP数量
  used_ips?: number                   // 已使用IP数量
  available_ips?: number              // 可用IP数量
  allocated_at?: string               // 分配时间
  created_at: string
  updated_at: string
}
```

#### 3.3 核心操作
- **IP池管理**: 创建、更新、删除IP池
- **IP分配**: 自动/手动分配IP给节点
- **IP回收**: 释放不再使用的IP地址
- **可用性检查**: 检查特定IP是否可用
- **统计分析**: IP使用率统计和分析

#### 3.4 业务逻辑
```typescript
// IP自动分配流程
const autoAllocateIP = async (zoneId: string, nodeId: string) => {
  // 1. 查找Zone内可用的IP池
  // 2. 按策略选择合适的IP池
  // 3. 分配可用IP给节点
  // 4. 更新IP池状态
  // 5. 记录分配历史
}
```

### 4. Social模块 - 社交化组网

#### 4.1 业务概念
- **社交组网**: 通过"加好友"的方式建立节点间的信任关系
- **用途**: 简化网络配置，提高安全性
- **特点**: 基于用户关系建立网络连接，支持邀请码机制

#### 4.2 数据结构
```typescript
interface Friend {
  id: string                          // 好友ID
  name: string                        // 好友名称
  avatar?: string                     // 头像URL
  node_count: number                  // 节点数量
  connected_node_count: number        // 已连接节点数量
  active_route_count: number          // 活跃路由数量
  friendship_date: string             // 成为好友的时间
}

interface SocialOverview {
  friend_count: number                // 好友总数
  pending_requests: number            // 待处理好友请求
  connected_nodes: number             // 已连接节点数
  active_routes: number               // 活跃路由数
}

interface Invitation {
  id: string                          // 邀请码ID
  code: string                        // 邀请码
  status: 'active' | 'used' | 'expired'  // 状态
  expires_at: string                  // 过期时间
  used_at?: string                    // 使用时间
  used_by?: string                    // 使用者ID
}
```

#### 4.3 核心操作
- **好友管理**: 搜索用户、发送好友请求、接受/拒绝请求
- **邀请码**: 生成和管理邀请码
- **节点连接**: 基于好友关系建立节点间连接
- **社交统计**: 好友关系和连接状态统计

### 5. Routes模块 - 路由管理

#### 5.1 业务概念
- **Route**: 网络路由，定义节点间的通信路径
- **用途**: 建立节点间的网络连接，实现数据传输
- **特点**: 基于社交关系创建，支持路径优化和负载均衡

#### 5.2 数据结构
```typescript
interface Route {
  id: string                          // 路由ID
  route_id: string                    // 业务ID
  source_node_id: string              // 源节点ID
  target_node_id: string              // 目标节点ID
  description?: string                // 路由描述
  status: 'active' | 'inactive' | 'pending'  // 路由状态
  metrics: {                          // 路由指标
    latency: number                   // 延迟(ms)
    packet_loss: number               // 丢包率(%)
    bandwidth: number                 // 带宽(Mbps)
  }
  created_at: string
  updated_at: string
}
```

## 🔄 模块间数据关系和业务流程

### 1. 数据依赖关系
```
Zone (根级别)
├── Users (用户归属于Zone)
├── Nodes (节点归属于Zone)
├── IPPools (IP池归属于Zone)
├── Routes (路由在Zone内部)
└── Social Relations (社交关系在Zone内部)
```

### 2. 典型业务流程

#### 2.1 新用户加入网络流程
```typescript
const joinNetwork = async (invitationCode: string) => {
  // 1. 验证邀请码
  const invitation = await validateInvitation(invitationCode)
  
  // 2. 创建用户账户
  const user = await createUser(userInfo)
  
  // 3. 加入邀请者的Zone
  await addUserToZone(user.id, invitation.zone_id)
  
  // 4. 建立好友关系
  await createFriendship(user.id, invitation.inviter_id)
  
  // 5. 分配初始资源
  await allocateInitialResources(user.id, invitation.zone_id)
}
```

#### 2.2 节点连接建立流程
```typescript
const establishNodeConnection = async (localNodeId: string, friendNodeId: string) => {
  // 1. 验证好友关系
  await verifyFriendship(localNodeId.owner, friendNodeId.owner)
  
  // 2. 检查IP可用性
  const localIP = await allocateIP(localNodeId)
  const remoteIP = await getFriendNodeIP(friendNodeId)
  
  // 3. 创建路由
  const route = await createRoute({
    source_node_id: localNodeId,
    target_node_id: friendNodeId,
    local_ip: localIP,
    remote_ip: remoteIP
  })
  
  // 4. 配置网络
  await configureNetworking(route)
  
  // 5. 测试连通性
  await testConnectivity(route)
}
```

#### 2.3 Zone切换流程
```typescript
const switchZone = async (newZoneId: number) => {
  // 1. 验证用户对新Zone的访问权限
  await verifyZoneAccess(user.id, newZoneId)
  
  // 2. 保存当前Zone状态
  await saveCurrentZoneState()
  
  // 3. 切换用户上下文
  await updateUserContext(user.id, newZoneId)
  
  // 4. 重新加载Zone相关数据
  await loadZoneResources(newZoneId)
  
  // 5. 更新WebSocket连接
  await reconnectWebSocket(newZoneId)
}
```

## 🎯 核心业务逻辑洞察

### 1. 数据管理策略
- **统一数据模型**: 集中管理所有业务规则和验证规则
- **状态同步机制**: 实时数据变化监听，支持防抖优化和批量更新
- **缓存策略**: 支持TTL过期、最大容量限制和定期清理

### 2. 业务流程优化
- **Zone切换优化**: 状态保存/恢复、数据预加载、WebSocket重连
- **社交关系验证**: 节点连接前的权限检查和信任度评估
- **IP分配策略**: 基于使用率的智能分配和冲突检测

### 3. UI/UX设计模式
- **状态指示**: loading、refreshing、error等状态的统一管理
- **分页组件**: 标准化的分页逻辑和页码显示算法
- **筛选器**: 多维度筛选条件的组合和重置逻辑

### 4. 性能优化策略
- **懒加载**: 组件按需加载，避免初始化时的性能问题
- **防抖机制**: 搜索、筛选等高频操作的防抖处理
- **数据预取**: 基于用户行为的数据预加载

### 5. 安全和权限模型
- **Zone级隔离**: 所有数据操作严格按Zone隔离
- **Token管理**: 自动刷新、过期处理和安全存储
- **权限验证**: 多层级权限检查（Zone、用户、资源）

## 📊 统计和监控

### 1. 侧边栏统计
```typescript
interface SidebarStats {
  nodes: number        // 节点总数
  ippools: number      // IP池总数
  routes: number       // 路由总数
  connections: number  // 连接总数
  zones: number        // Zone总数
}
```

### 2. 实时监控指标
```typescript
interface RealtimeMetrics {
  cpuUsage: number           // CPU使用率
  memoryUsage: number        // 内存使用率
  networkTraffic: number     // 网络流量
  activeConnections: number  // 活跃连接数
}
```

## 🔐 安全和权限

### 1. Zone级别隔离
- 所有资源操作都需要Zone权限验证
- API请求必须包含正确的X-Zone-ID头部
- 数据查询自动过滤不属于当前Zone的资源

### 2. 社交关系验证
- 节点间连接需要验证用户的好友关系
- 路由创建需要确认双方的授权
- IP分配需要考虑社交网络的信任度

## 🚀 扩展性设计

### 1. 模块化架构
- 每个业务模块独立的Service层
- 统一的API接口规范
- 可插拔的功能模块

### 2. 数据一致性
- 分布式锁机制
- 事务性操作
- 最终一致性保证

## 📝 总结

MyNet的核心业务模块通过Zone实现多租户隔离，以社交关系为纽带建立网络连接，通过Node、IPPools、Routes等资源模块提供完整的网络管理功能。整个系统设计具有良好的扩展性和安全性，支持大规模的分布式网络部署。

### 关键设计原则：
1. **Zone First**: 所有操作都基于Zone上下文，严格的多租户隔离
2. **Social Trust**: 通过社交关系建立网络信任，简化网络配置
3. **Resource Isolation**: 严格的资源隔离和权限控制机制
4. **Real-time Sync**: 实时数据同步和状态更新，支持WebSocket通信
5. **API Consistency**: 统一的API设计和响应格式，支持request_id追踪

### 业务流程亮点：
1. **智能IP分配**: 基于使用率的自动分配算法
2. **社交化组网**: 通过好友关系简化节点连接配置
3. **Zone无缝切换**: 状态保存/恢复的用户体验优化
4. **权限分层**: Zone、用户、资源三层权限验证体系
5. **故障处理**: 完善的错误处理和降级策略

这套业务逻辑为新版Quasar项目提供了完整的参考模板，确保了核心业务逻辑的一致性，同时支持现代化技术栈的实现。
