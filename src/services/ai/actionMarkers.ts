/**
 * AI 回答里的「修复动作」标记解析（Phase 5b 增强）。
 *
 * 约定：本地排障模式的回答可以用 `[[action:<id>]]` 引用**动作目录内的 id**。
 * 这里只做纯文本解析，且必须传入已知 id 白名单 —— 未知 id 一律忽略，
 * 所以模型无法凭想象引入一个新动作。UI 拿到 id 后仍然打开确认卡片，
 * 用户点击前不会有任何命令被执行。
 *
 * 单独成模块（不 import repairActions）是为了让云端助手 chunk 不背 localApi。
 */
const ACTION_MARKER = /\[\[action:([a-z0-9-]+)\]\]/g

export function extractActionIds(text: string, knownIds: readonly string[]): string[] {
  const ids: string[] = []
  for (const match of text.matchAll(ACTION_MARKER)) {
    const id = match[1]
    if (knownIds.includes(id) && !ids.includes(id)) ids.push(id)
  }
  return ids
}

export function stripActionMarkers(text: string): string {
  return text.replace(ACTION_MARKER, '').replace(/[ \t]+\n/g, '\n').trim()
}
