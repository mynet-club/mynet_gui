// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// quasar.config.ts 运行在 Node.js 上下文，process.env 里只有 .env（开发配置）。
// 生产 build 时需要主动把 .env.prod 加载进来，否则下面的 build.env 块会用 undefined
// 覆盖掉 Quasar 自己从 .env.prod 读到的 fileEnv（getBuildSystemDefine 里 buildEnv 后写、胜出），
// 产物就锁定回开发 URL。
// 文件名是 .env.prod 而不是 .env.production：Quasar 的 buildType 只有 dev|prod
// （@quasar/app-vite/lib/utils/env.js:31），development/production 它不认。
function loadEnvProduction() {
  try {
    const lines = readFileSync(resolve(process.cwd(), '.env.prod'), 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      // 只在 process.env 里没有（即未从 OS 环境注入）时才覆盖
      if (key && !Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = val;
      }
    }
  } catch (_) { /* .env.prod 不存在时静默忽略 */ }
}

export default defineConfig((ctx) => {
  if (ctx.prod) {
    loadEnvProduction();
  }
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'i18n',  // 确保i18n最先初始化
      'init',
      'pinia',
      'notify',
      'axios',
      'theme',
      'auth',
      'websocket'
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: [
      'app.css'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16'
      },

      typescript: {
        strict: true,
        vueShim: true
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'

      // 确保生产环境变量正确加载
      env: {
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
        VITE_ROUTER_BASE: process.env.VITE_ROUTER_BASE,
        VITE_WS_URL: process.env.VITE_WS_URL,
        VITE_PUSHER_APP_KEY: process.env.VITE_PUSHER_APP_KEY,
        VITE_REVERB_HOST: process.env.VITE_REVERB_HOST,
        VITE_REVERB_PORT: process.env.VITE_REVERB_PORT,
        VITE_REVERB_SCHEME: process.env.VITE_REVERB_SCHEME,
        // Debug 相关环境变量
        VITE_ENABLE_DEBUG: process.env.VITE_ENABLE_DEBUG,
        VITE_ENABLE_CONSOLE_LOG: process.env.VITE_ENABLE_CONSOLE_LOG,
        VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL
      },

      // 生产环境移除调试代码
      minify: 'terser',
      terserOptions: {
        compress: {
          // 生产环境默认移除 console.log
          drop_console: true,
          // 移除所有 debugger 语句
          drop_debugger: true,
          // 移除特定的调试函数
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        }
      },

      // 扩展 Vite 配置以支持更精细的控制
      extendViteConf(viteConf, { isClient, isServer }) {
        // 开发环境优化配置
        if (process.env.NODE_ENV === 'development') {
          // 确保路径解析正确
          viteConf.resolve = {
            ...viteConf.resolve,
            alias: {
              ...viteConf.resolve?.alias,
              'src': '/src'
            }
          }

          // 优化服务器配置
          viteConf.server = {
            ...viteConf.server,
            fs: {
              strict: false
            },
            hmr: {
              overlay: true
            }
          }
        }
      },

      // viteVuePluginOptions: {},

      // 移除Vue i18n编译插件，使用纯运行时模式
      // vitePlugins: []

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      publicPath: '/gui/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // viteVuePluginOptions: {},

      // 移除Vue i18n编译插件，使用纯运行时模式
      // vitePlugins: []
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      port: 5173,
      host: '0.0.0.0',
      open: false,
      allowedHosts: ['my.mynet.local'],
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'Notify',
        'Dialog',
        'Loading',
        'LocalStorage',
        'SessionStorage'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,
      prodPort: 3000, // The default port that the production server should use
      middlewares: [
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      inspectPort: 5858,
      bundler: 'packager', // 'packager' or 'builder'
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
      },
      builder: {
        // https://www.electron.build/configuration/configuration
        appId: 'mynet-quasar'
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: [
        'my-content-script'
      ],
    }
  }
}); 