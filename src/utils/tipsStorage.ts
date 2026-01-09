/**
 * Tips 本地存储管理工具
 */

const HIDDEN_TIPS_KEY = 'hidden_tips'

export class TipsStorage {
  /**
   * 获取所有隐藏的 tip IDs
   */
  static getHiddenTips(): string[] {
    try {
      const stored = localStorage.getItem(HIDDEN_TIPS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get hidden tips:', error)
      return []
    }
  }

  /**
   * 检查某个 tip 是否被隐藏
   */
  static isTipHidden(tipId: string): boolean {
    const hiddenTips = this.getHiddenTips()
    return hiddenTips.includes(tipId)
  }

  /**
   * 隐藏某个 tip
   */
  static hideTip(tipId: string): void {
    try {
      const hiddenTips = this.getHiddenTips()
      if (!hiddenTips.includes(tipId)) {
        hiddenTips.push(tipId)
        localStorage.setItem(HIDDEN_TIPS_KEY, JSON.stringify(hiddenTips))
      }
    } catch (error) {
      console.error('Failed to hide tip:', error)
    }
  }

  /**
   * 恢复显示某个 tip
   */
  static showTip(tipId: string): void {
    try {
      const hiddenTips = this.getHiddenTips()
      const index = hiddenTips.indexOf(tipId)
      if (index > -1) {
        hiddenTips.splice(index, 1)
        localStorage.setItem(HIDDEN_TIPS_KEY, JSON.stringify(hiddenTips))
      }
    } catch (error) {
      console.error('Failed to show tip:', error)
    }
  }

  /**
   * 恢复所有隐藏的 tips
   */
  static restoreAllTips(): void {
    try {
      localStorage.removeItem(HIDDEN_TIPS_KEY)
    } catch (error) {
      console.error('Failed to restore tips:', error)
    }
  }

  /**
   * 检查是否有隐藏的 tips
   */
  static hasHiddenTips(): boolean {
    return this.getHiddenTips().length > 0
  }

  /**
   * 获取隐藏的 tips 数量
   */
  static getHiddenTipsCount(): number {
    return this.getHiddenTips().length
  }
}
