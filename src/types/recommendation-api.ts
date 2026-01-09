/**
 * 智能推荐系统需要的API接口定义
 * 
 * 这些接口是根据 TIPS_SMART_LOGIC_TODO.md 中定义的需求设计的
 * 当后端实现这些API后，前端可以更智能地进行推荐
 */

/**
 * IP资源池使用情况摘要
 * API: GET /api/v1/ippools/usage-summary
 */
export interface IPPoolUsageSummary {
  total_pools: number
  pools: Array<{
    pool_id: number
    pool_name: string
    total_capacity: number
    allocated_count: number
    available_count: number
    utilization_rate: number
    is_full: boolean
  }>
  summary: {
    total_capacity: number
    total_allocated: number
    total_available: number
    overall_utilization: number
    has_unused_capacity: boolean  // 关键字段：是否有富余容量
  }
}

/**
 * 节点配置完整性检查
 * API: GET /api/v1/nodes/{id}/config-check
 */
export interface NodeConfigCheck {
  node_id: number
  checks: {
    has_ip_assigned: boolean        // 是否分配了IP
    has_network_config: boolean     // 是否配置了网络参数
    has_valid_keys: boolean         // 是否有有效密钥
    keys_expire_soon: boolean       // 密钥是否即将过期 (30天内)
    is_fully_configured: boolean    // 是否完全配置
  }
  missing_configs: string[]         // 缺失的配置项
  warnings: string[]                // 警告信息
}

/**
 * 路由健康度摘要
 * API: GET /api/v1/routes/health-summary
 */
export interface RouteHealthSummary {
  total_routes: number
  healthy_routes: number
  unhealthy_routes: number
  routes_with_issues: Array<{
    route_id: number
    peer_node_name: string
    issue_type: 'high_latency' | 'packet_loss' | 'unstable'
    severity: 'info' | 'warning' | 'critical'
    description: string
  }>
}

/**
 * 用户引导进度
 * API: GET /api/v1/user/onboarding-status
 */
export interface OnboardingStatus {
  user_id: number
  onboarding_completed: boolean
  stages: {
    created_first_ippool: boolean
    added_first_node: boolean
    configured_first_route: boolean
    invited_friend: boolean
    accepted_friend_request: boolean
    created_service: boolean
  }
  completion_rate: number           // 0-100
  next_suggested_action: string
}

/**
 * 好友关系统计
 * API: GET /api/v1/social/summary
 */
export interface SocialSummary {
  total_friends: number
  pending_requests: number            // 待处理的好友请求
  friends_with_routes: number         // 已建立路由的好友数
  friends_without_routes: number      // 未建立路由的好友数
  available_friend_nodes: number      // 好友可用节点总数
}

/**
 * 服务质量统计
 * API: GET /api/v1/services/quality-summary
 */
export interface ServiceQualitySummary {
  total_services: number
  active_services: number
  services_with_issues: Array<{
    service_id: number
    service_name: string
    issue_type: 'unreachable' | 'slow_response' | 'high_error_rate'
    severity: 'info' | 'warning' | 'critical'
    description: string
  }>
}
