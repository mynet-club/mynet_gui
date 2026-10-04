import { api } from '../api'
import type { InviteCodeUsage, MyInviteCode } from '../../types'

/**
 * 用户侧邀请码（框架端点，代码层 = invite code，界面词「邀请码」）。
 *
 * 这两条路由是 **dsplat 框架自带的**，不在 back 的业务模块里：
 * · `GET /api/v1/app/invite-code` → `InviteCodeController@myCode`
 *   —— 取「我在这个网络区的个人码」，没有就懒建（`max_uses=0` 不限次）。
 * · `GET /api/v1/app/invite-code/usages` → `@myUsages`，分页的归因记录。
 *
 * 两个必须知道的口径：
 * 1. **「这个码是哪个网络区的」取自请求上下文**（框架读 request 属性 `tenant_id`），
 *    而该上下文由 `api.ts` 拦截器注入的 `X-Tenant-ID` 决定 —— 它来自本地存的
 *    `user.tenant_id`。切了网络区再取码，拿到的就是新区的码；同一账号在不同区的码不同。
 *    若上下文缺失（例如 X-Tenant-ID 指向已退出的区），框架会把租户解析成 0 并照样建码，
 *    所以调用方**必须保证当前网络区已就绪**（见 `stores/auth.ts` 的 currentTenant）。
 * 2. **框架的码管的是「注册时加入该区」**。已注册用户凭码入区走
 *    `POST /api/v1/user/tenants/join`（back 补的接线，在 `tenantService.joinTenant`），
 *    两者共用同一张码、同一份用量与归因记录。
 *
 * 旧实现（back 自建 `invitations` 表 + `/social/invitation*` 三条接口）已于
 * 2026-10-04 裁定下架：不再由用户「生成多张带备注的码」，也没有「删除码」。
 */

/** 框架信封是 `{ success, data }`，没有 back 用户面的 message/code 字段 */
const unwrap = (response: any) => {
  if (response.data?.success) return response.data.data
  throw new Error(
    response.data?.message ||
    response.response?.data?.message ||
    'Request failed'
  )
}

export interface InviteUsagePage {
  data: InviteCodeUsage[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export const inviteService = {
  // 我在当前网络区的个人邀请码（首次调用懒建）
  async getMyInviteCode(): Promise<MyInviteCode> {
    const response = await api.get('/app/invite-code')
    return unwrap(response)
  },

  // 谁用我的码进来了（归因记录，按使用时间倒序分页）
  async getMyInviteUsages(page = 1, perPage = 20): Promise<InviteUsagePage> {
    const response = await api.get('/app/invite-code/usages', {
      params: { page, per_page: perPage }
    })
    return unwrap(response)
  }
}
