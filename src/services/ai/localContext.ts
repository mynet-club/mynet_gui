/**
 * 本地排障助手的**脱敏上下文**构造器。
 *
 * 本地诊断里有大量东西可以帮 AI 定位问题（驱动、路由、DNS、UTC 状态、parity 差异），
 * 也有绝对不能离开本机的：私钥、`back_priv`、token、口令、PEM 文本。所以规则是
 * **白名单式构造 + 黑名单式清洗**双保险：
 *
 * 1. 只从页面已经拿到的结构化字段取值（status / parity / check 输出），不读磁盘、不扫目录；
 * 2. 逐行清洗：命中敏感词的行整行丢弃；PEM 块整块丢弃；长 hex（≥64）掩码；
 * 3. 总长度截断（默认 4000 字符）：上下文太长既烧 token 也更容易夹带敏感内容。
 *
 * 这个文件是纯函数，单元测试直接钉清洗规则 —— 它比 UI 更值得测：漏一个 `private_key`
 * 就是把节点私钥送进模型上下文。
 */

const SENSITIVE_LINE = /(private[\s_-]?key|back_priv|secret|passphrase|password|token|api[\s_-]?key|credential)/i
const PEM_BLOCK = /-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g
const LONG_HEX = /\b[a-f0-9]{64,}\b/gi

/** 单行清洗：敏感行返回 null，其余做掩码。 */
export function sanitizeLine(line: string): string | null {
  const trimmed = line.trim()
  if (trimmed === '') return ''

  // 结构化的 `key: value`：键名命中敏感词就整行丢弃（值可能被改写成 "***" 但键名仍泄漏布局）
  const keyMatch = /^["']?([A-Za-z0-9_.-]+)["']?\s*[:=]/.exec(trimmed)
  if (keyMatch && SENSITIVE_LINE.test(keyMatch[1])) return null

  // 纯文本行：命中敏感词且像赋值/长值，丢弃；仅出现单词（如「token 过期」）保留
  if (SENSITIVE_LINE.test(trimmed) && /[:=]/.test(trimmed)) return null

  return trimmed.replace(LONG_HEX, '[hex]')
}

/** 文本清洗：PEM 块整体移除 + 逐行过滤。 */
export function redactDiagnosticText(text: string): string {
  if (!text) return ''

  const withoutPem = text.replace(PEM_BLOCK, '[pem-removed]')
  const lines = withoutPem.split('\n')
  const kept: string[] = []

  for (const line of lines) {
    const clean = sanitizeLine(line)
    if (clean !== null) kept.push(clean)
  }

  return kept.join('\n')
}

function clip(text: string, max: number): string {
  if (max <= 0) return ''
  return text.length <= max ? text : `${text.slice(0, max)}\n…（已截断）`
}

export interface LocalDiagnosticInput {
  scope?: string | null
  state?: string | null
  status?: Record<string, unknown> | null
  parity?: { ok?: boolean; critical_miss?: string[]; warnings?: string[]; hint?: string; items?: Array<Record<string, unknown>> } | null
  checkOutput?: string | null
  maxChars?: number
}

/** 组装脱敏摘要（中文小标题，便于模型定位；不含任何密钥/token）。 */
export function buildLocalDiagnosticSnapshot(input: LocalDiagnosticInput): string {
  const max = input.maxChars ?? 4000
  const parts: string[] = ['## 本机诊断摘要（已脱敏）']

  if (input.scope) parts.push(`- scope: ${input.scope}`)
  if (input.state) parts.push(`- 节点状态: ${input.state}`)

  const status = input.status ?? {}
  const statusKeys = ['vpn_type', 'vpn_types', 'driver', 'route_mode', 'dns_mode', 'utc_enabled', 'utc_state', 'interface', 'listen_port']
  const statusPairs = statusKeys
    .filter((key) => status[key] !== undefined && status[key] !== null && status[key] !== '')
    .map((key) => `- ${key}: ${String(status[key])}`)
  if (statusPairs.length > 0) {
    parts.push('', '### 运行事实', ...statusPairs)
  }

  if (input.parity) {
    parts.push('', '### 一致性（config parity）', `- 结论: ${input.parity.ok ? '一致' : '存在不一致'}`)
    if (input.parity.critical_miss?.length) parts.push(`- 严重项: ${input.parity.critical_miss.join('、')}`)
    if (input.parity.warnings?.length) parts.push(`- 警告项: ${input.parity.warnings.join('、')}`)
    if (input.parity.hint) parts.push(`- 提示: ${input.parity.hint}`)
    for (const item of (input.parity.items ?? []).slice(0, 12)) {
      const key = String(item.key ?? '?')
      parts.push(`  - ${key}: local=${String(item.local ?? '—')} remote=${String(item.remote ?? '—')} match=${String(item.match ?? '?')}`)
    }
  }

  if (input.checkOutput) {
    parts.push('', '### 健康检查输出', '```', input.checkOutput, '```')
  }

  return clip(redactDiagnosticText(parts.join('\n')), max)
}
