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
 * 同日越权收敛后，这里不再编 `pivot.is_admin`：`tenant_users` 表根本没有这一列，
 * 管理员属 operator/console 面，用户面前端不该据此渲染管理入口。
 */
const PLATFORM_TENANT_ID = 9007199254740991

/**
 * 「当前网络区」选择的本地存储键名（单点）。
 *
 * 历史：早期叫 `current_zone` 且存整个对象；现在叫 `current_network` 只存 tenant_id。
 * 读旧键时兼容并迁移一次（`stores/auth.ts` 的 readSavedTenantId），
 * 否则改名当天所有老用户的已选网络区会静默回到默认值。
 *
 * 2026-10-04 裁定 A2 之后，这个键**只是显示缓存**：「当前区」的唯一权威是服务端指针
 * `users.tenant_id`（由 `POST /user/tenants/switch` 写、由 `ResolveTenantFromUser` 解析成
 * 租户上下文）。用户面整组不挂框架的 `IdentifyTenant`，`X-Tenant-ID` / `?tenant_id=`
 * 也不再被 `BaseApiController::getCurrentTenantId()` 采 —— 所以这里的值只影响
 * 刷新前的首屏渲染，不影响服务端按哪个区回数据。真正让两边一致的仍是
 * `stores/auth.ts:switchTenant()` 的「先拿服务端确认、再写本地状态」顺序。
 */
export const TENANT_SELECTION_KEY = 'current_network'
export const LEGACY_TENANT_SELECTION_KEY = 'current_zone'

// 平台兜底网络区（界面叫「网络区」）
export const DEFAULT_PLATFORM_TENANT: Tenant = {
  tenant_id: PLATFORM_TENANT_ID,
  name: 'Global',
  domain: 'global',
  status: 'active',
  admin_id: 1,
  admin_name: 'System',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  description: 'Default Global tenant',
  pivot: { user_id: 1, tenant_id: PLATFORM_TENANT_ID }
}

// 应用配置
export const APP_CONFIG = {
  // 网络区相关配置
  // ⚠️ 下面这两项全仓无任何读取者（死配置），保留只为不破 APP_CONFIG 的形状。
  tenants: {
    defaultPlatformTenant: DEFAULT_PLATFORM_TENANT,
    defaultTenantId: PLATFORM_TENANT_ID
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
