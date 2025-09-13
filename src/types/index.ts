export interface User {
  user_id: number
  id: number  // 保留向后兼容性，但主要使用user_id
  zone_id: number
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
  invitation_count: number
  invitation_points: number
  invited_by_user_id: number | null
  profile_photo_url: string
  permissions?: string[]
  avatar?: string
  signature?: string  // 用户签名
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface Zone {
  id: number
  zone_id: number
  zone_name: string
  zone_domain: string
  zone_status: number
  zone_admin_id: number
  zone_admin_name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  zone_remarks: string
  can_access: boolean
  pivot: {
    user_id: number
    zone_id: number
    is_admin: number
  }
  // 兼容旧的属性名
  name?: string
  is_active?: boolean
  description?: string
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
  invitations: Invitation[]
  stats: {
    friends_count: number
    pending_count: number
    outgoing_count: number
    invitations_count: number
    connected_nodes?: number
    active_routes?: number
  }
}

export interface Invitation {
  id: number
  invitation_code: string
  description: string
  max_uses: number
  used_count: number
  expires_at: string
  invitation_status: number
  is_valid: boolean
  can_use: boolean
  created_at: string
  used_at?: string
  used_by?: string
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
  total_invitations: number
  active_invitations: number
  used_invitations: number
  expired_invitations: number
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

// Zone Module Types
export interface ZoneOverview {
  total_zones: number
  active_zones: number
  total_nodes: number
  total_routes: number
}

export interface ZoneStatistics {
  zone_id: string
  node_count: number
  active_node_count: number
  route_count: number
  ip_pool_count: number
  user_count: number
}

export interface PaginatedZoneResponse {
  data: Zone[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}