# 节点连接历史查询 API

## 概述

此 API 用于查询节点在过去时间段内与其他节点的连接数据，支持时间过滤、对端节点过滤和分页。

## 端点

```
GET /api/v1/monitor/history/connections
```

## 认证

需要 Token 认证（Laravel Sanctum）

```bash
Authorization: Bearer {your_access_token}
```

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `node_id` | integer | **是** | 要查询的节点ID |
| `start_time` | string | 否 | 开始时间 (格式: `Y-m-d H:i:s`)，默认为当前时间-24小时 |
| `end_time` | string | 否 | 结束时间 (格式: `Y-m-d H:i:s`)，默认为当前时间 |
| `peer_node_id` | integer | 否 | 对端节点ID，用于过滤特定节点的连接 |
| `last` | integer | 否 | 是否只返回每个peer的最新记录 (1=是, 0=否)，默认为 0 |
| `page` | integer | 否 | 页码，默认为 1 (当 last=0 时有效) |
| `per_page` | integer | 否 | 每页数量，默认为 20，最大 100 (当 last=0 时有效) |

## 响应格式

### 成功响应 (200 OK)

```json
{
    "success": true,
    "message": "连接历史查询成功",
    "data": {
        "connections": [
            {
                "id": 12345,
                "node_id": 1234567,
                "peer_id": 7654321,
                "online": true,
                "conn_type": "direct_ipv4",
                "latency": 25.5,
                "rx_bytes": 2048000,
                "tx_bytes": 1024000,
                "seen_at": "2025-12-15 04:30:00",
                "snapshot_at": "2025-12-15 04:25:00"
            }
        ],
        "nodes_metadata": {
            "1234567": {
                "node_id": 1234567,
                "node_name": "My Node",
                "zone_id": 3678250676883169,
                "node_status": 2,
                "user_id": 123,
                "user_name": "John Doe"
            },
            "7654321": {
                "node_id": 7654321,
                "node_name": "Peer Node",
                "zone_id": 3678250676883169,
                "node_status": 2,
                "user_id": 456,
                "user_name": "Jane Smith"
            }
        },
        "pagination": {
            "total": 150,
            "per_page": 20,
            "current_page": 1,
            "last_page": 8,
            "from": 1,
            "to": 20
        },
        "filter": {
            "node_id": 1234567,
            "start_time": "2025-12-14 05:00:00",
            "end_time": "2025-12-15 05:00:00",
            "peer_node_id": null
        }
    }
}
```

### 字段说明

#### connections (连接数据数组)
- `id`: 记录ID
- `node_id`: 本节点ID
- `peer_id`: 对端节点ID
- `online`: 是否在线 (true/false)
- `conn_type`: 连接类型 (如 `direct_ipv4`, `relay`)
- `latency`: 延迟 (毫秒)
- `rx_bytes`: 接收字节数
- `tx_bytes`: 发送字节数
- `seen_at`: 最后可见时间
- `snapshot_at`: 数据快照时间 (查询时基于此字段过滤)

#### nodes_metadata (节点元数据)
以节点ID为键的对象，包含节点和用户信息：
- `node_id`: 节点ID
- `node_name`: 节点名称
- `zone_id`: 所属Zone ID
- `node_status`: 节点状态 (0=禁用, 1=启用离线, 2=在线)
- `user_id`: 所属用户ID
- `user_name`: 用户名称

## 使用示例

### 示例 1: 获取节点所有对端的最新连接状态 (推荐)

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567&last=1" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

**说明**: 使用 `last=1` 参数，返回该节点与所有对端的最新连接记录（每个peer_id一条），大幅降低数据量，适合实时状态查询。

### 示例 2: 获取指定对端节点的最新状态

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567&last=1&peer_node_id=7654321" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

**说明**: 结合 `last=1` 和 `peer_node_id`，只返回指定对端的最新一条记录。

### 示例 3: 查询节点过去24小时的所有连接历史

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

### 示例 2: 查询特定时间范围的连接

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567&start_time=2025-12-14%2010:00:00&end_time=2025-12-14%2020:00:00" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

### 示例 3: 过滤特定对端节点的连接

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567&peer_node_id=7654321" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

### 示例 4: 分页查询（每页10条，查询第2页）

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567&per_page=10&page=2" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

### 示例 5: 组合条件查询

```bash
curl -X GET "https://api.example.com/api/v1/monitor/history/connections?node_id=1234567&start_time=2025-12-14%2010:00:00&end_time=2025-12-14%2020:00:00&peer_node_id=7654321&per_page=20&page=1" \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

## 错误响应

### 401 Unauthorized (未认证)

```json
{
    "message": "Unauthenticated."
}
```

### 422 Validation Error (验证失败)

```json
{
    "message": "节点ID为必填项",
    "errors": {
        "node_id": [
            "节点ID为必填项"
        ]
    }
}
```

常见验证错误：
- `node_id` 必填且必须存在
- `start_time` 和 `end_time` 必须符合 `Y-m-d H:i:s` 格式
- `end_time` 必须晚于 `start_time`
- `peer_node_id` 如果提供，必须存在
- `per_page` 最大不超过 100

## 注意事项

1. **last 参数优化**: 
   - 当 `last=1` 时，返回每个 peer_id 的最新一条记录，忽略 `page` 和 `per_page` 参数
   - 适合实时状态查询，大幅降低数据传输量
   - 不带 `last` 或 `last=0` 时，按传统分页方式返回历史数据

2. **默认时间范围**: 如果不提供时间参数，默认查询过去24小时的数据

3. **时间格式**: 必须使用 `Y-m-d H:i:s` 格式 (如 `2025-12-14 10:30:00`)

4. **URL 编码**: 时间参数在 URL 中需要进行 URL 编码 (空格编码为 `%20`)

5. **数据隔离**: API 自动过滤当前用户所属 Zone 的节点数据

6. **节点元数据**: `nodes_metadata` 包含所有出现过的节点信息（包括本节点和对端节点）

7. **排序**: 结果按 `snapshot_at` 降序排列（最新的在前面）

## 实现细节

### 数据表
- 主表: `node_peer_connections` (存储节点连接历史数据)
- 关联表: `nodes` (节点信息), `users` (用户信息)

### 架构
- **Request**: `NodeConnectionHistoryRequest` - 参数验证
- **Service**: `MonitorHistoryService` - 业务逻辑
- **Controller**: `MonitorHistoryController` - HTTP 处理层
- **Model**: `NodePeerConnection` - 数据模型

### DDD 架构规范
✅ Controller 薄层 - 只负责 HTTP 处理
✅ Service 层 - 处理所有业务逻辑
✅ 0 违规 - 完全符合 DDD 架构规范

## 测试

测试文件位置: `tests/Feature/Api/V1/Monitor/MonitorHistoryApiTest.php`

运行测试:
```bash
php artisan test --filter MonitorHistoryApiTest
```

测试覆盖:
- ✅ 默认24小时查询
- ✅ 按对端节点过滤
- ✅ 按时间范围过滤
- ✅ 分页功能
- ✅ 认证验证
- ✅ 参数验证
- ✅ 时间格式验证

## 更新日志

### 2025-12-15
- ✅ 创建 API 端点
- ✅ 实现 Service 层业务逻辑
- ✅ 添加完整的功能测试
- ✅ 通过 DDD 架构检查 (0 违规)
- ✅ 所有测试通过 (7/7)
- ✅ 新增 `last` 参数支持，优化实时状态查询性能
