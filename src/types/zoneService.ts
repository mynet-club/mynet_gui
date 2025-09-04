// Zone Service 相关类型定义

export type ServiceType = 'gnb_index' | 'music' | 'video' | 'netbridge'
export type ServiceStatus = 'active' | 'inactive' | 'pending'
export type ServiceProtocol = 'http' | 'https' | 'tcp' | 'udp'
export type AuthType = 'bearer' | 'basic' | 'none'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ZoneService {
  service_id: number
  service_name: string
  service_type: ServiceType
  service_status: ServiceStatus
  service_description?: string
  service_url: string
  service_port: number
  service_protocol: ServiceProtocol
  service_auth_required: boolean
  service_auth_type: AuthType
  service_auth_token?: string
  service_created_by: number
  service_zone_id: number
  service_shared_with: number[]
  service_approved_by?: number
  service_approval_status: ApprovalStatus
  service_approval_reason?: string
  service_created_at: string
  service_updated_at: string
  // 扩展字段
  creator_name?: string
  is_owner?: boolean
  share_type?: 'public' | 'friend' | 'anonymous' | 'private'
}

export interface CreateZoneServiceRequest {
  service_name: string
  service_type: ServiceType
  service_description?: string
  service_url: string
  service_port: number
  service_protocol: ServiceProtocol
  service_auth_required: boolean
  service_auth_type: AuthType
  service_auth_token?: string
}

export interface UpdateZoneServiceRequest {
  service_name?: string
  service_description?: string
  service_url?: string
  service_port?: number
  service_protocol?: ServiceProtocol
  service_auth_required?: boolean
  service_auth_type?: AuthType
  service_auth_token?: string
}

export interface ShareZoneServiceRequest {
  target_user_id: number
  message?: string
}

export interface RequestApprovalRequest {
  approval_reason?: string
}

export interface ZoneServiceListResponse {
  success: boolean
  data: ZoneService[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ZoneServiceResponse {
  success: boolean
  data: ZoneService
}

// 服务分类
export interface ServiceCategory {
  key: 'public' | 'friend' | 'anonymous' | 'my'
  title: string
  icon: string
  color: string
  description: string
}

// 服务类型配置
export interface ServiceTypeConfig {
  key: ServiceType
  label: string
  icon: string
  color: string
  description: string
  defaultPort: number
  defaultProtocol: ServiceProtocol
}
