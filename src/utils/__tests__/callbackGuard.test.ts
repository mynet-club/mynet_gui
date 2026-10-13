import { describe, it, expect } from 'vitest'
import { resolveCallbackRedirect } from '../callbackGuard'

// 防回归锁（S1 开放重定向）：callback 曾把 access token 拼进任意外域 URL。
// 本套件锁死「同源 / 注册回调域」判据，任何放宽都会红。
const ORIGIN = 'https://my.mynet.club'

describe('resolveCallbackRedirect：callback 目标白名单', () => {
  it('放行注册回调域（mynet_ctl setup 链路）', () => {
    expect(resolveCallbackRedirect('https://ctl.mynet.club/setup', ORIGIN))
      .toBe('https://ctl.mynet.club/setup')
    expect(resolveCallbackRedirect('https://mynet.local/setup', ORIGIN))
      .toBe('https://mynet.local/setup')
  })

  it('放行同源与相对路径', () => {
    expect(resolveCallbackRedirect('https://my.mynet.club/app/dashboard', ORIGIN))
      .toBe('https://my.mynet.club/app/dashboard')
    expect(resolveCallbackRedirect('/setup', ORIGIN))
      .toBe('https://my.mynet.club/setup')
    expect(resolveCallbackRedirect('/setup?a=1', ORIGIN))
      .toBe('https://my.mynet.club/setup?a=1')
  })

  it('拒任意外域（原漏洞形态）', () => {
    expect(resolveCallbackRedirect('https://evil.example/steal', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('http://evil.example/', ORIGIN)).toBeNull()
  })

  it('拒域边界绕过：后缀沾边不算注册域', () => {
    expect(resolveCallbackRedirect('https://evil-mynet.club/', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('https://mynet.club.evil.example/', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('https://evil.example/?x=mynet.club', ORIGIN)).toBeNull()
  })

  it('拒协议相对与反斜杠伪装', () => {
    expect(resolveCallbackRedirect('//evil.example/steal', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('/\\evil.example/steal', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('\\\\evil.example\\steal', ORIGIN)).toBeNull()
  })

  it('拒非 http(s) 协议', () => {
    expect(resolveCallbackRedirect('javascript:alert(1)', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('data:text/html,x', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('file:///etc/passwd', ORIGIN)).toBeNull()
  })

  it('拒凭据伪装（userinfo 混淆 host）', () => {
    expect(resolveCallbackRedirect('https://mynet.club@evil.example/steal', ORIGIN)).toBeNull()
  })

  it('拒空值与非字符串（query 参数可重复，可能是数组）', () => {
    expect(resolveCallbackRedirect('', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect('   ', ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect(undefined, ORIGIN)).toBeNull()
    expect(resolveCallbackRedirect(['https://evil.example/'], ORIGIN)).toBeNull()
  })
})
