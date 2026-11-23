import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 将 AI 回复的 Markdown 文本安全渲染为 HTML（marked + DOMPurify）。
 * 禁止 raw script/iframe/事件处理器，外链默认新窗口安全打开。
 */
export function renderAssistantMarkdown(text: string): string {
  if (!text) return ''
  const rawHtml = marked.parse(text, {
    async: false,
    breaks: true,
    gfm: true,
  }) as string

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  })
}

export const renderAiMarkdown = renderAssistantMarkdown
