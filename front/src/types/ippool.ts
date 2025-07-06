// IP池相关类型定义
export interface IPPool {
  id: string | number
  sequence_number?: number  // API返回的序列号，用于删除操作
  ip_group_sequence_number?: number  // 新API返回的IP组序列号
  group_sequence?: number   // 新API返回的组序列号
  zone_id: string | number
  user_id?: string | number
  name?: string
  network?: string
  ip_range: {
    start: string
    end: string
  }
  // API返回的字段
  ip_start?: string
  ip_end?: string
  ip_count?: number
  is_allocated?: boolean
  status: 'allocated' | 'available' | number
  status_text?: string
  // 计算字段
  total_ips?: number
  used_ips?: number
  available_ips?: number
  allocated_at?: string
  created_at: string
  updated_at: string
  // 新API字段
  purpose?: string          // 用途
  notes?: string           // 备注
}

export interface IPPoolStatistics {
  zone_id?: string
  user_id?: string
  total_pools: number
  allocated_pools: number
  available_pools: number
  total_ips: number
  allocated_ips: number
  available_ips?: number  // 可能来自 free_ips
  active_ips?: number     // API 返回的活跃IP数
  free_ips?: number       // API 返回的可用IP数
  user_quota?: number     // 用户配额
  usage_percentage?: number // 使用百分比
}

export interface IPAllocation {
  id: string
  pool_id: string
  ip_address: string
  node_id?: string
  node_name?: string
  allocated_at: string
  status: 'active' | 'released'
}

export interface IPPoolForm {
  name: string
  network?: string
  ip_range: {
    start: string
    end: string
  }
  zone_id: string
}

export interface IPPoolFilters {
  zone_id?: string
  status?: 'allocated' | 'available' | 'all'
  search?: string
}

export interface UserIPResources {
  user_id: string
  total_pools: number
  total_ips: number
  usage_by_zone: Array<{
    zone_id: string
    pool_count: number
    ip_count: number
  }>
}

// IP池创建相关类型
export interface IPPoolCreateRequest {
  zone_id: string
  pools_count?: number  // 创建的IP池数量（1-3）
  continuous?: boolean  // 是否要求连续IP
  target_pool_id?: string  // 目标连续池ID（仅当continuous=true且存在不连续池时）
  ip_range?: {
    start: string
    end: string
  }
  size?: number  // 每个池的IP数量
}

// IP池创建表单类型（用于前端表单）
export interface IPPoolCreateForm extends IPPoolCreateRequest {
  custom_start_ip?: string  // 自定义起始IP
  custom_end_ip?: string    // 自定义结束IP
}

// 新的创建API返回格式（仅影响POST /ippools）
export interface IPPoolCreateResponse {
  success: boolean
  code: number
  message: string
  data: {
    allocated_groups: Array<{
      sequence: number            // 序列号
      ips: string[]              // IP地址列表
      ip_count: number           // IP数量
    }>
    total_count: number
    requested_count: number
    allocation_mode: string
    user_id: number
    zone_id: number
  }
  request_id: string
  timestamp: string
}

// 创建请求参数（对应新的API）
export interface IPPoolCreateAdvancedRequest {
  group_count: number         // 要创建的组数
  purpose?: string           // 用途，默认 "server_cluster"
  notes?: string            // 备注
  prefer_continuous?: boolean // 是否偏好连续分配
  targetPoolSequence?: number // 目标池序列号（仅当 prefer_continuous=true 时使用）
}

export interface IPPoolAvailabilityCheck {
  zone_id: string
  available_continuous_ranges: Array<{
    start_ip: string
    end_ip: string
    size: number
  }>
  existing_pools: Array<{
    id: string
    pool_id: string
    ip_range: {
      start: string
      end: string
    }
    is_continuous: boolean
    can_extend: boolean
  }>
  can_allocate_pools: number  // 可分配的IP池数量
  recommendations: Array<{
    type: 'auto' | 'extend' | 'new'
    description: string
    pools_count: number
    continuous: boolean
    target_pool_id?: string
  }>
}

export interface IPPoolUserQuota {
  user_id: string
  max_pools: number
  current_pools: number
  remaining_pools: number
  max_ips_per_pool: number
  total_allocated_ips: number
}
