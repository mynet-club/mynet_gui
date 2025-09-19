/**
 * 开发环境调试工具
 * 在生产环境下，所有调试函数都会被优化掉
 * 
 * 使用方法：
 * 1. 导入: import debug from '../utils/debug'
 * 2. 使用: debug.log(...) 替代 console.log(...)
 * 3. 生产环境自动移除
 */

// 检查是否启用调试模式
const isDebugEnabled = () => {
  // 首先检查是否为开发环境
  const isDev = process.env.NODE_ENV === 'development' || import.meta.env.DEV
  
  // 检查环境变量中的调试开关
  const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true'
  const enableConsoleLog = import.meta.env.VITE_ENABLE_CONSOLE_LOG === 'true'
  
  // 开发环境 或者 明确启用了调试 或者 明确启用了控制台日志
  return isDev || enableDebug || enableConsoleLog
}

// 只在错误日志时启用（即使在生产环境）
const isErrorLogEnabled = () => {
  const logLevel = import.meta.env.VITE_LOG_LEVEL || 'debug'
  // error 级别总是启用，除非明确设置为 'none'
  return logLevel !== 'none'
}

const isEnabled = isDebugEnabled()

/**
 * 调试对象 - 完全兼容 console API
 */
const debug = {
  // 基础日志方法
  log: (...args: any[]): void => {
    if (isEnabled) console.log(...args)
  },

  info: (...args: any[]): void => {
    if (isEnabled) console.info(...args)
  },

  warn: (...args: any[]): void => {
    if (isEnabled) console.warn(...args)
  },

  error: (...args: any[]): void => {
    // 错误日志在生产环境也可能需要显示，根据 LOG_LEVEL 决定
    if (isEnabled || isErrorLogEnabled()) console.error(...args)
  },

  debug: (...args: any[]): void => {
    if (isEnabled && console.debug) console.debug(...args)
  },

  // 分组方法
  group: (...args: any[]): void => {
    if (isEnabled && console.group) console.group(...args)
  },

  groupCollapsed: (...args: any[]): void => {
    if (isEnabled && console.groupCollapsed) console.groupCollapsed(...args)
  },

  groupEnd: (): void => {
    if (isEnabled && console.groupEnd) console.groupEnd()
  },

  // 表格和计数
  table: (data: any, columns?: string[]): void => {
    if (isEnabled && console.table) console.table(data, columns)
  },

  count: (label?: string): void => {
    if (isEnabled && console.count) console.count(label)
  },

  countReset: (label?: string): void => {
    if (isEnabled && console.countReset) console.countReset(label)
  },

  // 时间测量
  time: (label?: string): void => {
    if (isEnabled && console.time) console.time(label)
  },

  timeEnd: (label?: string): void => {
    if (isEnabled && console.timeEnd) console.timeEnd(label)
  },

  timeLog: (label?: string, ...data: any[]): void => {
    if (isEnabled && console.timeLog) console.timeLog(label, ...data)
  },

  // 追踪和断言
  trace: (...args: any[]): void => {
    if (isEnabled && console.trace) console.trace(...args)
  },

  assert: (condition?: boolean, ...data: any[]): void => {
    if (isEnabled && console.assert) console.assert(condition, ...data)
  },

  // 清屏
  clear: (): void => {
    if (isEnabled && console.clear) console.clear()
  },

  // 目录显示
  dir: (obj: any, options?: any): void => {
    if (isEnabled && console.dir) console.dir(obj, options)
  },

  dirxml: (...data: any[]): void => {
    if (isEnabled && console.dirxml) console.dirxml(...data)
  },

  // 性能分析
  profile: (label?: string): void => {
    if (isEnabled && console.profile) console.profile(label)
  },

  profileEnd: (label?: string): void => {
    if (isEnabled && console.profileEnd) console.profileEnd(label)
  },

  timeStamp: (label?: string): void => {
    if (isEnabled && console.timeStamp) console.timeStamp(label)
  }
}

/**
 * 创建模块专用的调试器
 * @param moduleName 模块名称
 * @returns 带模块前缀的调试器
 */
export function createModuleDebugger(moduleName: string) {
  return {
    log: (...args: any[]): void => {
      if (isEnabled) console.log(`[${moduleName}]`, ...args)
    },
    info: (...args: any[]): void => {
      if (isEnabled) console.info(`[${moduleName}]`, ...args)
    },
    warn: (...args: any[]): void => {
      if (isEnabled) console.warn(`[${moduleName}]`, ...args)
    },
    error: (...args: any[]): void => {
      if (isEnabled || isErrorLogEnabled()) console.error(`[${moduleName}]`, ...args)
    },
    debug: (...args: any[]): void => {
      if (isEnabled && console.debug) console.debug(`[${moduleName}]`, ...args)
    }
  }
}

// 确保在生产环境中这些方法不会报错
if (!isEnabled) {
  // 在生产环境中，大部分方法都是空函数（除了错误日志）
  Object.keys(debug).forEach(key => {
    if (key !== 'error' || !isErrorLogEnabled()) {
      (debug as any)[key] = () => {}
    }
  })
}

export default debug