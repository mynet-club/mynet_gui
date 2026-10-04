// 服务共享（service-sharing）面的 API 封装。
// ⚠️ 这里的 "zone" 是历史前缀，指的是**租户内共享的服务**，不是租户实体本身。
// 租户实体的 service 已随 2026-10-04「Zone→Tenant 改名保留」裁定搬到
// `services/tenant/tenantService.ts`。本目录剩下的 zoneServiceApi 该不该跟着改叫
// `services/service/`（它调的全是 `/services/*` 端点）属另一轮命名裁决，未自行处置。
export * from './zoneServiceApi'
