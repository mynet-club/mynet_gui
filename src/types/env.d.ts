/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_PUSHER_APP_KEY: string
  readonly VITE_REVERB_APP_ID: string
  readonly VITE_REVERB_HOST: string
  readonly VITE_REVERB_PORT: string
  readonly VITE_REVERB_SCHEME: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_VERSION: string
  
  // Debug 和日志相关
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_CONSOLE_LOG: string
  readonly VITE_LOG_LEVEL: string
  
  // 功能开关
  readonly VITE_ENABLE_PWA: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_HTTPS: string
  readonly VITE_ENABLE_CSRF: string
  readonly VITE_ENABLE_CACHE: string
  readonly VITE_CACHE_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
