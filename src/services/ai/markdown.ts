/**
 * C 端 AI 回答的 Markdown 渲染（服务端返回的是 md，不是纯文本）。
 *
 * - `marked` 负责 GFM（粗体/列表/表格/代码块/链接）；
 * - **必须 sanitize**：回答来自模型，属于不可信 HTML。DOMPurify 只放行 HTML
 *   白名单，并用 hook 给外链补 `target=_blank rel=noopener noreferrer`，避免
 *   模型输出里的 `<script>`、`javascript:` 链接被当成可执行内容。
 */
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export function renderAssistantMarkdown(text: string): string {
  if (!text) return ''
  const html = marked.parse(text, { async: false }) as string
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
