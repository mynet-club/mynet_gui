/**
 * vpn_type 归一成字符串。
 *
 * 新库的 CHECK 约束要 JSON 数组 ["gnb"]，老库是裸 "gnb"，
 * 前端渲染处都按字符串调 .toUpperCase() —— 数组上直接 TypeError。
 */
export function normalizeVpnType(vt: unknown): string {
  if (vt == null) return ''
  if (Array.isArray(vt)) {
    return vt.filter(Boolean).join('+').toUpperCase()
  }
  return String(vt).toUpperCase()
}
