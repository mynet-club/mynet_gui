import { boot } from 'quasar/wrappers'
import debug from 'src/utils/debug'

/**
 * 用户面实时通道（Echo/Reverb）已按 2026-11-03 架构裁定下线：
 * 不再经 /gui/api 连云端 Reverb。极少数需要推送的场景改由 mynetd 本机能力面实现。
 * 本 boot 保留占位，避免其它模块误以为「还没初始化」。
 */
export default boot(() => {
  debug.log('🔌 [Boot] 用户面 Echo/Reverb 已停用（实时走 mynetd 本机面）')
})
