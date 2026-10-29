/**
 * 本机模式判定：地址是本机即本机面，不在 URL 里再写 local。
 * 127.0.0.1 / localhost / [::1] 或显式 VITE_FORCE_LOCAL。
 */
export function isLocalHost(hostname: string = window.location.hostname): boolean {
  const h = hostname.toLowerCase()
  return h === '127.0.0.1' || h === 'localhost' || h === '[::1]' || h === '::1'
}

export function isLocalMode(): boolean {
  if (import.meta.env.VITE_FORCE_LOCAL === '1') return true
  return isLocalHost()
}
