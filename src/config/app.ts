import type { Tenant } from '../types'

/**
 * 平台兜底租户 —— 与服务端同源。
 *
 * SSOT: mynet_api `config/id.php` 的 `platform_tenant_id`
 * （默认 9007199254740991 = 2^53-1，JS 安全整数上限，正好可精确表示）。
 * 服务端在 `SocialDomainService` 里用它兜 `tenant_id` 为空的场合。
 *
 * 2026-10-04 用户裁定 B：原先这里硬编码 999999999，那个值在服务端**零对应物**
 * （`grep -rnw 999999999` 全仓 0 命中），拿它当 X-Tenant-ID 发出去只会一路 403/404。
 * 改指真实平台租户后，属于该租户的用户能正常兜底，不属于的用户仍被服务端
 * IdentifyTenant 的 tenant_users 归属校验挡下（fail-closed）。
 *
 * ⚠️ 未决：`pivot.is_admin: 1` 是原先伪造 999999999 时一起编的，现在指向真实租户，
 * 等于在客户端断言「当前用户是平台租户管理员」。它只影响 UI
 * （`useTenants.ts:39/234`、`TenantListPage.vue:101` 读它决定是否渲染管理入口），
 * 真正的鉴权在服务端，所以不是提权；但会渲染出点了就 403 的按钮。
 * 这属权限语义，未自行改动 —— 见 spec/zone-removal.md 议题 2 的后续项。
 */
const PLATFORM_TENANT_ID = 9007199254740991

// 默认的Global Zone配置
export const DEFAULT_PLATFORM_TENANT: Tenant = {
  id: PLATFORM_TENANT_ID,
  zone_id: PLATFORM_TENANT_ID,
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
  pivot: { user_id: 1, zone_id: PLATFORM_TENANT_ID, is_admin: 1 },
  name: 'Global',
  is_active: true,
  description: 'Default Global Zone'
}

// 应用配置
export const APP_CONFIG = {
  // Zone相关配置
  // ⚠️ 下面这两项全仓无任何读取者（死配置），保留只为不破 APP_CONFIG 的形状。
  tenants: {
    defaultGlobalZone: DEFAULT_PLATFORM_TENANT,
    defaultZoneId: PLATFORM_TENANT_ID
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
