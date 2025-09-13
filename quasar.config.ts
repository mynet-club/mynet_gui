// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
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
        browser: [ 'es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1' ],
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
        VITE_WS_URL: process.env.VITE_WS_URL,
        VITE_PUSHER_APP_KEY: process.env.VITE_PUSHER_APP_KEY,
        VITE_REVERB_HOST: process.env.VITE_REVERB_HOST,
        VITE_REVERB_PORT: process.env.VITE_REVERB_PORT,
        VITE_REVERB_SCHEME: process.env.VITE_REVERB_SCHEME
      },
      
      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      // 移除Vue i18n编译插件，使用纯运行时模式
      // vitePlugins: []
      
      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
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
      port: 8080,
      host: '0.0.0.0',
      open: true // opens browser window automatically
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