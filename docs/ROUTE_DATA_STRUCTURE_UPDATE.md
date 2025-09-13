# 路由管理数据结构更新报告

## 概述
根据新的API返回数据结构，更新了路由管理模块的数据解析和展示逻辑。

## 主要更改

### 1. 类型定义更新 (`src/types/index.ts`)

#### Route接口更新
- 将`id`改为`route_id`
- 新增详细的节点信息字段：
  - 源节点信息：`source_node_name`, `source_node_status`, `source_vpn_type`, `source_user_name`等
  - 目标节点信息：`target_node_name`, `target_node_status`, `target_vpn_type`, `target_user_name`等
- 将`status`字段从字符串改为数字类型（1=活跃，0=非活跃）
- 新增`target_network`(数字格式的IP)和`target_mask`字段
- 新增`relay_mode`, `priority`, `description`等字段

#### PendingConnection接口更新
- 将`id`字段从字符串改为数字类型
- 更新字段名以匹配新API：
  - `requester_*` → `source_*`
  - `message` → `request_message`
- 新增详细的用户和节点信息字段
- 新增`vpn_type`, `expired_at`, `responded_at`等字段

#### RouteStats接口更新
- 简化统计字段，移除带宽相关统计
- 新增`zone_id`, `pending_routes`, `rejected_routes`字段

#### RouteDataResponse接口更新
- 更新为新的数据结构：
  - `routes`: 活跃路由数组
  - `statistics`: 统计信息
  - `requests`: 包含`pending`和`sent`数组的请求信息
  - `zone_id`, `timestamp`: 区域ID和时间戳

### 2. 服务层更新 (`src/services/route/routesService.ts`)
- 更新`getOverview`方法的返回类型为`RouteDataResponse`
- 导入新的类型定义

### 3. Composable更新 (`src/composables/useRoutes.ts`)
- 更新`fetchOverview`函数的数据解析逻辑：
  - 正确映射新的统计数据结构
  - 分离活跃路由和待处理连接数据
- 更新`approveConnection`和`rejectConnection`函数以支持数字类型ID
- 更新`disconnectRoute`函数使用`route_id`而非`id`
- 注释掉暂不可用的配置相关方法

### 4. 组件更新

#### ActiveRoutesTab组件 (`src/components/route/ActiveRoutesTab.vue`)
- 更新模板以显示新的数据字段：
  - 网络地址显示：使用`formatNetwork`函数将数字IP转换为点分十进制格式
  - 路由信息：显示`relay_mode`, `priority`, `vpn_type`
  - 用户信息：显示目标用户名和邮箱
- 更新状态处理逻辑以支持数字状态值
- 更新搜索过滤逻辑以适配新字段
- 新增辅助函数：
  - `getStatusLabel`: 状态标签获取
  - `formatNetwork`: 网络地址格式化

#### PendingConnectionsTab组件 (`src/components/route/PendingConnectionsTab.vue`)
- 更新模板以显示新的数据字段：
  - 用户信息：使用`source_user_name`/`target_user_name`
  - 节点信息：使用`source_node_name`/`target_node_name`
  - 消息显示：使用`request_message`
- 更新接口定义以支持数字类型的连接ID
- 适配新的VPN类型字段

### 5. 翻译更新 (`src/i18n/zh-CN.ts`)
- 新增路由相关翻译键：
  - `relayMode`: 中继模式
  - `priority`: 优先级  
  - `vpnType`: VPN类型
  - `targetUser`: 目标用户
  - `lastUpdate`: 最后更新
- 更新待处理连接翻译：
  - `vpnType`: VPN类型
- 新增状态翻译：
  - `unknown`: 未知

## 关键特性

### 1. 网络地址处理
新增`formatNetwork`函数，将数字格式的IP地址（如167772416）转换为人类可读的点分十进制格式（如10.0.1.0/24）。

### 2. 数字状态支持
路由状态现在使用数字表示：
- 1 = 活跃
- 0 = 非活跃

### 3. 增强的用户信息
现在每个路由和连接都包含详细的源用户和目标用户信息，包括用户名、邮箱、角色和头像URL。

### 4. 改进的连接请求
连接请求现在包含更详细的信息，如VPN类型、过期时间、响应时间等。

## API数据结构示例

```json
{
  "routes": [
    {
      "route_id": "1849675619627370",
      "target_network": 167772416,
      "target_mask": 24,
      "status": 1,
      "relay_mode": "direct",
      "priority": 1,
      "source_node_name": "名称名称",
      "target_node_name": "arthur-工作站",
      "target_user_name": "arthur",
      "target_user_email": "arthur@gmail.com"
    }
  ],
  "statistics": {
    "total_routes": 6,
    "active_routes": 6,
    "inactive_routes": 0
  },
  "requests": {
    "pending": [],
    "sent": [
      {
        "id": 12,
        "status": "pending",
        "request_message": "连接请求消息",
        "source_node_name": "源节点",
        "target_node_name": "目标节点"
      }
    ]
  }
}
```

## 兼容性说明
- 保持了现有的UI交互逻辑
- 维护了原有的路由管理功能
- 所有更改都是向后兼容的，只是数据源和显示内容有所调整

## 测试验证
已通过模拟数据测试验证了数据解析逻辑的正确性，包括：
- 统计数据解析
- 路由列表解析  
- 连接请求解析
- 网络地址格式化
