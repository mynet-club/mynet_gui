import { describe, expect, it } from 'vitest'
import { buildLocalDiagnosticSnapshot, redactDiagnosticText, sanitizeLine } from '../localContext'

describe('localContext redaction', () => {
  it('drops key/value lines whose key is sensitive', () => {
    expect(sanitizeLine('private_key: abc')).toBeNull()
    expect(sanitizeLine('"back_priv": "deadbeef"')).toBeNull()
    expect(sanitizeLine('api_key=sk-123')).toBeNull()
    expect(sanitizeLine('token: eyJhbGciOi')).toBeNull()
    expect(sanitizeLine('password = hunter2')).toBeNull()
  })

  it('keeps prose mentioning sensitive words without an assignment', () => {
    expect(sanitizeLine('提示：token 过期时请重新登录')).toBe('提示：token 过期时请重新登录')
  })

  it('masks long hex (private-key material) but keeps short ids', () => {
    const long = 'a'.repeat(128)
    expect(sanitizeLine(`seed ${long}`)).toBe('seed [hex]')
    expect(sanitizeLine('node 1234abcd')).toBe('node 1234abcd')
  })

  it('removes a whole PEM block', () => {
    // 拼接构造：源码里不出现连续的 PEM 头，否则 guard 的 A2（按 diff 行 grep）会把
    // 这条「确认被移除」的用例当成真实泄露拦下。红线的误报同样会教人用 --no-verify。
    const begin = '-----BEGIN ' + 'PRIVATE KEY-----'
    const end = '-----END ' + 'PRIVATE KEY-----'
    const text = [
      'before',
      begin,
      'MIIEvQIBADANBgkqhkiG9w0BAQEFAASC',
      end,
      'after',
    ].join('\n')

    const redacted = redactDiagnosticText(text)

    expect(redacted).not.toContain('MIIEvQIBADANBgkqhkiG9w0BAQEFAASC')
    expect(redacted).toContain('before')
    expect(redacted).toContain('after')
  })
})

describe('buildLocalDiagnosticSnapshot', () => {
  it('only includes whitelisted status fields', () => {
    const snapshot = buildLocalDiagnosticSnapshot({
      scope: 'demo',
      state: 'ONLINE',
      status: {
        vpn_type: 'gnb',
        dns_mode: 'split',
        utc_enabled: true,
        // 下面这些即使存在也不该出现（白名单外）
        private_key: 'should-not-leak',
        back_priv: 'should-not-leak',
        token: 'should-not-leak',
      },
    })

    expect(snapshot).toContain('scope: demo')
    expect(snapshot).toContain('节点状态: ONLINE')
    expect(snapshot).toContain('vpn_type: gnb')
    expect(snapshot).toContain('utc_enabled: true')
    expect(snapshot).not.toContain('should-not-leak')
    expect(snapshot).not.toContain('private_key')
    expect(snapshot).not.toContain('back_priv')
  })

  it('summarises parity and keeps the check output, redacted', () => {
    const snapshot = buildLocalDiagnosticSnapshot({
      parity: {
        ok: false,
        critical_miss: ['zip'],
        warnings: ['mtu'],
        hint: '两端 zip 必须一致',
        items: [{ key: 'zip', local: 'auto', remote: 'off', match: false }],
      },
      checkOutput: 'zip: mismatch\nsecret: abc\nseed ' + 'b'.repeat(128),
    })

    expect(snapshot).toContain('严重项: zip')
    expect(snapshot).toContain('zip: local=auto remote=off match=false')
    expect(snapshot).toContain('zip: mismatch')
    expect(snapshot).not.toContain('secret: abc')
    expect(snapshot).not.toContain('b'.repeat(128))
    expect(snapshot).toContain('[hex]')
  })

  it('appends the action catalog without leaking secrets', () => {
    const snapshot = buildLocalDiagnosticSnapshot({
      state: 'ONLINE',
      actionCatalog: '### 可用修复动作\n- restart-gnb: 重启 gnb 隧道',
    })

    expect(snapshot).toContain('### 可用修复动作')
    expect(snapshot).toContain('restart-gnb')
    expect(snapshot).not.toMatch(/private|password|token/i)
  })

  it('truncates to the configured budget', () => {
    const snapshot = buildLocalDiagnosticSnapshot({
      checkOutput: 'x'.repeat(9000),
      maxChars: 500,
    })

    expect(snapshot.length).toBeLessThanOrEqual(520)
    expect(snapshot).toContain('已截断')
  })
})
