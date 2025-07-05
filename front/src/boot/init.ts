import { boot } from 'quasar/wrappers'

// 立即执行的日志，确认文件被加载
console.log('🚀 [Boot] Init module loaded')

export default boot(async () => {
  console.log('🚀 [Boot] Starting application initialization...')
  
  // 记录环境信息
  console.log('🚀 [Boot] Environment:', {
    mode: process.env.NODE_ENV,
    dev: process.env.DEV,
    prod: process.env.PROD,
    debugging: process.env.DEBUGGING
  })
  
  // 记录启动时间
  console.log('🚀 [Boot] Application boot started at:', new Date().toISOString())
}) 