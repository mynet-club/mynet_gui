export interface User {
  id: number
  user_id: number
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
  friendship_date: string
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
  id: string
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
  id: string
  source_node_id: string
  target_node_id: string
  source_node_name: string
  target_node_name: string
  source_ip: string
  target_ip: string
  source_mask: string
  target_mask: string
  friend_id?: string
  friend_name?: string
  status: 'active' | 'inactive' | 'connecting' | 'error'
  connection_type: 'direct' | 'relay'
  bandwidth_usage: string
  latency: number
  packet_loss: number
  last_active: string
  created_at: string
  updated_at: string
}

export interface RouteOverview {
  active_routes: number
  pending_connections: number
  connected_nodes: number
  total_bandwidth: string
}

export interface PendingConnection {
  id: string
  requester_id: string
  target_id: string
  requester_name: string
  target_name: string
  requester_node_id: string
  target_node_id: string
  requester_node_name: string
  target_node_name: string
  requester_ip: string
  target_ip: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  connection_type: 'direct' | 'relay'
  created_at: string
  updated_at: string
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
  total_routes: number
  active_routes: number
  inactive_routes: number
  pending_connections: number
  connected_nodes: number
  total_bandwidth_in: string
  total_bandwidth_out: string
  average_latency: number
  total_data_transfer: string
}

export interface RouteDataResponse {
  routes: Route[]
  pending_connections: PendingConnection[]
  outgoing_connections: PendingConnection[]
  friend_nodes: FriendNode[]
  config: RouteConfig
  stats: RouteStats
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