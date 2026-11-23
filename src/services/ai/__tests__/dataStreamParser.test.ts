import { describe, expect, it } from 'vitest'
import { DataStreamParser, type AiStreamEvent } from '../dataStreamParser'

const collect = (parser: DataStreamParser, chunks: string[]): AiStreamEvent[] => {
  const events: AiStreamEvent[] = []
  for (const chunk of chunks) events.push(...parser.push(chunk))
  events.push(...parser.flush())
  return events
}

describe('DataStreamParser', () => {
  it('aggregates text deltas and tolerates frames split across chunks', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, ['0:"你', '好"\n0:"，世界"\n'])

    expect(events).toEqual([
      { type: 'text', text: '你好' },
      { type: 'text', text: '，世界' },
    ])
  })

  it('reads conversation meta from data frames', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, ['2:[{"type":"meta","conversation_id":42,"agent_id":0}]\n'])

    expect(events).toEqual([
      { type: 'data', data: [{ type: 'meta', conversation_id: 42, agent_id: 0 }] },
    ])
  })

  it('parses tool call / result frames', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, [
      '9:{"toolCallId":"c1","toolName":"mynet.user.nodes.list","args":{}}\n',
      'a:{"toolCallId":"c1","result":{"count":2}}\n',
    ])

    expect(events[0]).toMatchObject({ type: 'tool-call', id: 'c1', toolName: 'mynet.user.nodes.list' })
    expect(events[1]).toMatchObject({ type: 'tool-result', id: 'c1' })
  })

  it('surfaces error and finish frames', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, ['3:"模型超时"\n', 'd:{"finishReason":"stop"}\n'])

    expect(events).toEqual([
      { type: 'error', message: '模型超时' },
      { type: 'finish', reason: 'stop' },
    ])
  })

  it('tolerates SSE "data:" prefix and CRLF line endings', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, ['data: 0:"hi"\r\n', '\r\n', ': ping\n'])

    expect(events).toEqual([{ type: 'text', text: 'hi' }])
  })

  it('flushes a trailing frame without newline', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, ['0:"末尾"'])

    expect(events).toEqual([{ type: 'text', text: '末尾' }])
  })

  it('does not throw on a malformed frame', () => {
    const parser = new DataStreamParser()

    const events = collect(parser, ['0:not-json\n', 'zzz\n'])

    // 非法 JSON 的文本帧按原文返回；无法识别的行落 unknown，不中断整段回答
    expect(events[0]).toEqual({ type: 'text', text: 'not-json' })
    expect(events[1]).toMatchObject({ type: 'unknown' })
  })
})
