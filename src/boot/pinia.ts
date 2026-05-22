import { boot } from 'quasar/wrappers'
import debug from 'src/utils/debug'
import { createPinia } from 'pinia'

export default boot(({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
  
  debug.log('🍍 [Boot] Pinia initialized successfully')
})
