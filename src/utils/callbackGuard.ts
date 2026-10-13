/**
 * callback 转发目标白名单（S1 开放重定向收口，2026-10-13）
 *
 * 背景：`/auth/login?callback=<url>` 会把 access token 拼进 `<url>` 跳回去
 * （mynet_ctl 的 `/setup` 配置部署页在用这条链路：setup.blade.php 的
 * 「前往用户中心登录」链接构造 `callback=<ctl 自身 /setup>`）。
 * 原实现对 callback 不做任何校验 ⇒ 攻击者构造任意外域即可把已登录用户的
 * Bearer token 送进任意站点（开放重定向 + token 外泄）。
 *
 * 判据（同源 / 注册回调域，逐条硬校验）：
 *   1. 只接受字符串；空 / 非字符串一律拒；
 *   2. 只接受 http/https（顺带拒掉 javascript:、data:、file: 等）；
 *   3. 相对路径按当前源解析 ⇒ 同源天然放行；
 *   4. 绝对 URL 必须同源，或落在注册回调域（mynet.club / mynet.local 及其子域，
 *      域边界匹配——`evil-mynet.club` 不算）。
 *
 * 这里刻意做成纯函数（currentOrigin 由调用方传入），便于在 node 环境单测锁死。
 */

/** 注册回调域：生产（*.mynet.club，mynet_ctl setup 等 MyNet 属性站）+ 本地开发（*.mynet.local） */
const REGISTERED_CALLBACK_DOMAINS = ['mynet.club', 'mynet.local']

function hostMatchesDomain (hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith('.' + domain)
}

/**
 * 解析并校验 callback 目标。
 *
 * @param callback      路由 query 里的原始 callback 值（可能是任意类型）
 * @param currentOrigin 当前页面源（如 `window.location.origin`）
 * @returns 通过校验的绝对 URL 字符串；不通过返回 null（调用方应走正常站内跳转）
 */
export function resolveCallbackRedirect (callback: unknown, currentOrigin: string): string | null {
  if (typeof callback !== 'string' || callback.trim() === '') return null

  let url: URL
  try {
    // 相对路径按当前源解析；`//evil` / `/\evil` 会解析出外域 origin，随后被白名单拦下
    url = new URL(callback, currentOrigin)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  const sameOrigin = url.origin === new URL(currentOrigin).origin
  const registeredDomain = REGISTERED_CALLBACK_DOMAINS.some((d) => hostMatchesDomain(url.hostname, d))

  return sameOrigin || registeredDomain ? url.href : null
}
