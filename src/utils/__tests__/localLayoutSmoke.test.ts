import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * M5 三宽度验收的静态护栏：LocalLayout 必须有 max-width 与小屏收窄，
 * 业务页用 Quasar 栅格（col-12 col-md-*），不得依赖横向滚动布局。
 */
describe('本机 SPA 布局宽度护栏（1280 / 900 / 640）', () => {
  const layoutPath = join(__dirname, '../../layouts/LocalLayout.vue')
  const layout = readFileSync(layoutPath, 'utf-8')

  it('内容壳 max-width 1280px', () => {
    expect(layout).toMatch(/max-width:\s*1280px/)
  })

  it('小屏有收窄媒体查询', () => {
    // 小屏收窄在全局 local-ui.scss（经 css/app.css 装载）；壳的 max-width 在 .vue scoped。
    const styles = readFileSync(join(__dirname, '../../styles/local-ui.scss'), 'utf-8')
    expect(styles).toMatch(/@media/)
  })

  it('不在 html/body 上用 100vh 整屏锁死', () => {
    expect(layout).not.toMatch(/height:\s*100vh/)
  })

  it('本地页面文件存在且使用响应式 col 类', () => {
    const home = readFileSync(join(__dirname, '../../pages/local/LocalHomePage.vue'), 'utf-8')
    expect(home).toMatch(/col-12 col-md-/)
  })
})
