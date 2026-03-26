import type { Zone } from '../types'

// 默认的Global Zone配置
export const DEFAULT_GLOBAL_ZONE: Zone = {
  id: 999999999,
  zone_id: 999999999,
  zone_name: 'Global',
  zone_domain: 'global',
  zone_status: 1,
  zone_admin_id: 1,
  zone_admin_name: 'System',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  zone_remarks: 'Default Global Zone',
  can_access: true,
  pivot: { user_id: 1, zone_id: 999999999, is_admin: 1 },
  name: 'Global',
  is_active: true,
  description: 'Default Global Zone'
}

// 应用配置
export const APP_CONFIG = {
  // Zone相关配置
  zones: {
    defaultGlobalZone: DEFAULT_GLOBAL_ZONE,
    defaultZoneId: 999999999
  },
  
  // API相关配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000
  },

  // 外部链接
  urls: {
    www: import.meta.env.VITE_WWW_URL || 'https://mynet.club'
  },
  
  // WebSocket相关配置
  websocket: {
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  }
}
