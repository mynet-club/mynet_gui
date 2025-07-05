declare module 'quasar/wrappers' {
  import { App } from 'vue'
  import { Router } from 'vue-router'

  interface BootContext {
    app: App
    router: Router
    store: any
    ssrContext?: any
  }

  export function boot(fn: (context: BootContext) => void | Promise<void>): void
} 