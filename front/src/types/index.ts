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