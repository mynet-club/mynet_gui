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
  id: string
  code: string
  status: 'active' | 'used' | 'expired'
  expires_at: string
  used_at?: string
  used_by?: string
  created_at: string
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
  id: string
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