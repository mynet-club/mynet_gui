/**
 * AI SDK data-stream 协议解析（浏览器侧）。
 *
 * Node SSE 引擎响应的是 Vercel AI SDK 的 **data stream**（`toDataStreamResponse`），
 * 不是 classic `event: message` SSE。每一帧是一行 `code:payload`：
 *
 * | code | 含义 | payload |
 * |---|---|---|
 * | `0` | 文本增量 | JSON 字符串（如 `"你好"`） |
 * | `1` | 文本增量（旧编码） | 同上 |
 * | `2` | 自定义数据 | JSON 数组（如 `[{"type":"meta","conversation_id":123}]`） |
 * | `3` | 错误 | 字符串 |
 * | `a` | 工具结果 | `{toolCallId, result}` |
 * | `9` / `b` | 工具调用 | `{toolCallId, toolName, args}` |
 * | `d` / `e` | 本轮结束 | `{finishReason, usage}` |
 *
 * 实现要点：
 * - **必须容忍半行**：fetch 的 chunk 边界与帧边界无关，按 `\n` 切、保留尾部；
 * - 兼容代理把行首写成 `data: 0:...`（nginx 误按 SSE 包装时会出现）；
 * - 单帧解析失败 → 产生 `unknown` 事件而不是抛错（一个坏帧不该让整段回答消失）；
 * - `flush()` 处理最后一帧没有换行符的情况。
 */

export type AiStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'data'; data: unknown[] }
  | { type: 'error'; message: string }
  | { type: 'tool-call'; id?: string; toolName?: string; args?: unknown }
  | { type: 'tool-result'; id?: string; result?: unknown }
  | { type: 'finish'; reason?: string }
  | { type: 'unknown'; code: string; payload?: unknown }

function parsePayload(raw: string): { ok: true; value: unknown } | { ok: false } {
  const trimmed = raw.trim()
  if (trimmed === '') return { ok: true, value: null }

  try {
    return { ok: true, value: JSON.parse(trimmed) }
  } catch {
    return { ok: false }
  }
}

function normalizeLine(line: string): string {
  let text = line.replace(/\r$/, '')

  // 兼容 nginx/网关把 data stream 包装成 SSE 的情况
  if (text.startsWith('data:')) {
    text = text.slice(5).trimStart()
  }

  return text
}

export class DataStreamParser {
  private buffer = ''

  push(chunk: string): AiStreamEvent[] {
    this.buffer += chunk

    const events: AiStreamEvent[] = []
    let index = this.buffer.indexOf('\n')

    while (index !== -1) {
      const line = this.buffer.slice(0, index)
      this.buffer = this.buffer.slice(index + 1)
      events.push(...this.parseLine(line))
      index = this.buffer.indexOf('\n')
    }

    return events
  }

  flush(): AiStreamEvent[] {
    const rest = this.buffer
    this.buffer = ''

    return rest === '' ? [] : this.parseLine(rest)
  }

  private parseLine(line: string): AiStreamEvent[] {
    const text = normalizeLine(line).trim()
    if (text === '' || text.startsWith(':') || text === '[DONE]') {
      return []
    }

    const match = /^([0-9A-Za-z]):([\s\S]*)$/.exec(text)
    if (!match) {
      return [{ type: 'unknown', code: '?', payload: text }]
    }

    const code = match[1]
    const raw = match[2]
    const parsed = parsePayload(raw)

    switch (code) {
      case '0':
      case '1': {
        const value = parsed.ok ? parsed.value : raw
        return typeof value === 'string' && value !== ''
          ? [{ type: 'text', text: value }]
          : []
      }
      case '2': {
        const value = parsed.ok ? parsed.value : null
        return Array.isArray(value) ? [{ type: 'data', data: value }] : []
      }
      case '3': {
        const value = parsed.ok ? parsed.value : raw
        return [{ type: 'error', message: typeof value === 'string' ? value : 'AI 返回错误' }]
      }
      case '9':
      case 'b': {
        const value = parsed.ok && parsed.value && typeof parsed.value === 'object'
          ? (parsed.value as Record<string, unknown>)
          : {}
        return [{
          type: 'tool-call',
          id: typeof value.toolCallId === 'string' ? value.toolCallId : undefined,
          toolName: typeof value.toolName === 'string' ? value.toolName : undefined,
          args: value.args,
        }]
      }
      case 'a':
      case 'c': {
        const value = parsed.ok && parsed.value && typeof parsed.value === 'object'
          ? (parsed.value as Record<string, unknown>)
          : {}
        return [{
          type: 'tool-result',
          id: typeof value.toolCallId === 'string' ? value.toolCallId : undefined,
          result: value.result,
        }]
      }
      case 'd':
      case 'e': {
        const value = parsed.ok && parsed.value && typeof parsed.value === 'object'
          ? (parsed.value as Record<string, unknown>)
          : {}
        return [{ type: 'finish', reason: typeof value.finishReason === 'string' ? value.finishReason : undefined }]
      }
      default:
        return [{ type: 'unknown', code, payload: parsed.ok ? parsed.value : raw }]
    }
  }
}
