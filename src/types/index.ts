export interface User {
  user_id: number
  id: number  // 保留向后兼容性，但主要使用user_id
  tenant_id: number
  name: string
  email: string
  phone: string
  user_role: string
  email_verified_at: string | null
  current_team_id: number | null
  profile_photo_path: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  profile_photo_url: string
  // 没有 permissions 这一列：用户面（GUI）只有「自己 + 本租户作用域」一种权限语义
  // （权限矩阵 R2 / 裁定 B3，2026-10-05）。后端从未下发过它，前端也不许再长出门椒。
  avatar?: string
  signature?: string  // 用户签名
  preferences?: {
    theme?: string      // 主题设置：'light' | 'dark' | 'auto'
    language?: string   // 语言设置：'zh-CN' | 'en-US'
    timezone?: string   // 时区设置：'Asia/Shanghai' 等
  }
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

/**
 * 网络区（代码层 = Tenant）。字段名与 wire 一一对应，不再做 zone_* 别名映射。
 *
 * 注意：`tenant_users` 表没有 is_admin 列，所以这里没有权限语义——用户面只做
 * 「我归属哪些网络区、当前选哪个」，管理面在 console（operator）。
 */
export interface Tenant {
  tenant_id: number
  name: string
  domain?: string
  status: 'active' | 'inactive'
  description?: string
  admin_id?: number
  admin_name?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  pivot: {
    user_id: number
    tenant_id: number
  }
}

// 索引服务器相关类型定义
export interface IndexServiceConnectionInfo {
  endpoint: string
  protocol: string
  max_connections: number
  current_connections: number
}

export interface IndexService {
  service_id: number
  service_name: string
  service_address: string
  service_port: number
  service_type: string
  owner_name: string
  connection_info: IndexServiceConnectionInfo
}

export interface IndexServiceMeta {
  zone_id: number
  total_services: number
  public_services: number
  friend_shared_services: number
  user_id: number
}

export interface IndexServicesResponse {
  index_services: IndexService[]
  meta: IndexServiceMeta
}

export interface Node {
  id: number
  node_name: string
  node_type: string
  ip_address: string
  port: number
  status: 'active' | 'inactive' | 'pending'
  zone_id: number
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  status: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Social Module Types
export interface Friend {
  id: string
  name: string
  avatar?: string
  node_count: number
  connected_node_count: number
  active_route_count: number
  available_node_count?: number // 新增：可用节点数量
  friendship_date: string
  created_at: string // 添加 created_at 属性
  status: 'online' | 'offline'
  last_active: string
}

export interface SocialOverview {
  friend_count: number
  pending_requests: number
  connected_nodes: number
  active_routes: number
}

export interface SocialDataResponse {
  friends: Friend[]
  pending_requests: FriendRequest[]
  outgoing_requests: FriendRequest[]
  stats: {
    friends_count: number
    pending_count: number
    outgoing_count: number
    connected_nodes?: number
    active_routes?: number
  }
}

/**
 * 我的邀请码（框架 `invite_codes` 的用户侧视图）。
 *
 * 来源是框架端点 `GET /api/v1/app/invite-code`，它**只回这五个键**，且取码时懒建
 * （首次调用就会有一张 `max_uses=0` 的个人码）。旧实现里 GUI 依赖的
 * `invitation_status`（1=pending/2=used/0=expired）、`is_valid`、`description`、
 * 软删除等字段在框架口径下不存在 —— 状态一律由 `used_count`/`max_uses`/`expires_at`
 * 现算，不要在前端再造一套档位。
 */
export interface MyInviteCode {
  invite_code_id: string | number
  code: string
  /** 0 = 不限次数 */
  max_uses: number
  used_count: number
  /** null = 永不过期 */
  expires_at: string | null
}

/**
 * 一条归因记录（框架 `invite_code_usages`，不可变表：只有 created_at）。
 *
 * `channel` 取值：`email`/`sms`/`oauth:<provider>`（注册核销）与 `join`
 * （back 的 `POST /api/v1/user/tenants/join`，已注册用户凭码入区）。
 */
export interface InviteCodeUsage {
  usage_id: string | number
  invite_code_id: string | number
  tenant_id: string | number
  inviter_user_id: string | number | null
  invitee_user_id: string | number
  channel: string | null
  used_at: string
  created_at?: string | null
  invitee?: { user_id: string | number; name: string; avatar?: string | null }
}

export interface FriendRequest {
  request_id: number
  from_user_name: string
  to_user_name: string
  requester_id: string
  target_id: string
  requester_name: string
  target_name: string
  requester_avatar?: string
  target_avatar?: string
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  created_at: string
  updated_at: string
}

export interface SearchUser {
  id: string  // 保留id字段以保持向后兼容
  user_id: string  // 添加user_id字段，这是业务主键
  name: string
  avatar?: string
  node_count: number
  zone_id: string
  zone_name: string
  is_friend: boolean
  has_pending_request: boolean
  last_active: string
}

export interface BaseResponse<T = any> {
  success: boolean
  code: number
  message: string
  data?: T
  request_id: string
  timestamp: string
}

export interface SocialStats {
  total_friends: number
  pending_friend_requests: number
  sent_requests: number
  received_requests: number
  connected_nodes: number
  active_routes: number
}

// Routes Module Types
export interface Route {
  route_id: string
  node_id: string
  target_node_id: string
  target_network: number
  target_mask: number
  user_id: string
  zone_id: string
  status: number
  description: string
  relay_nodes: string
  relay_mode: string
  priority: number
  created_at: string
  updated_at: string
  // 源节点信息
  source_node_name: string
  source_node_status: number
  source_node_type: number
  source_vpn_type: string
  source_endpoint: string | null
  source_node_remarks: string
  source_user_name: string
  source_user_email: string
  source_user_role: string
  source_profile_photo_url: string
  // 目标节点信息
  target_node_name: string
  target_node_status: number
  target_node_type: number
  target_vpn_type: string
  target_endpoint: string | null
  target_node_remarks: string
  target_user_name: string
  target_user_email: string
  target_user_role: string
  target_profile_photo_url: string
}

export interface RouteOverview {
  active_routes: number
  pending_connections: number
  connected_nodes: number
  total_bandwidth: string
}

export interface PendingConnection {
  id: number
  source_node_id: string
  source_user_id: string
  target_node_id: string
  target_user_id: string
  zone_id: string
  vpn_type: string
  status: string
  target_network: number | null
  target_mask: number
  request_message: string
  response_message: string | null
  expired_at: string
  responded_at: string | null
  created_at: string
  updated_at: string
  // 源节点信息
  source_node_name: string
  source_node_status: number
  source_node_type: number
  source_vpn_type: string
  source_endpoint: string | null
  source_node_remarks: string
  source_user_name: string
  source_user_email: string
  source_user_role: string
  source_profile_photo_url: string
  // 目标节点信息
  target_node_name: string
  target_node_status: number
  target_node_type: number
  target_vpn_type: string
  target_endpoint: string | null
  target_node_remarks: string
  target_user_name: string
  target_user_email: string
  target_user_role: string
  target_profile_photo_url: string
}

export interface FriendNode {
  id: string
  node_name: string
  node_type: string
  ip_address: string
  port: number
  friend_id: string
  friend_name: string
  friend_avatar?: string
  connection_status: 'available' | 'connected' | 'pending' | 'unavailable'
  last_seen: string
  zone_id: string
  zone_name: string
  created_at: string
  updated_at: string
}

export interface RouteConfig {
  id: string
  user_id: string
  config_content: string
  config_format: 'gnb' | 'tinc' | 'wireguard'
  routes: RouteConfigEntry[]
  last_updated: string
  version: number
  checksum: string
}

export interface RouteConfigEntry {
  node_id: string
  ip_address: string
  mask: string
  gateway?: string
  metric?: number
}

export interface RouteConnection {
  id: string
  source_node_id: string
  target_node_id: string
  connection_type: 'direct' | 'relay'
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  bandwidth_in: string
  bandwidth_out: string
  latency: number
  packet_loss: number
  bytes_sent: number
  bytes_received: number
  last_active: string
  created_at: string
}

export interface RouteStats {
  zone_id: number
  total_routes: number
  active_routes: number
  inactive_routes: number
  pending_routes: number
  rejected_routes: number
}

export interface RouteDataResponse {
  routes: Route[]
  statistics: RouteStats
  requests: {
    pending: PendingConnection[]
    sent: PendingConnection[]
  }
  zone_id: number
  timestamp: string
}

// Tenant Module Types
//
// 用户面只有「我归属哪些网络区 + 当前选哪个」，没有管理视图：
// overview / statistics / 分页列表属 console（operator）面，此前 GUI 从 /tenants*
// 读它们，2026-10-04 越权收敛后那些端点在用户面已不可达。