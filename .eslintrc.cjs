module.exports = {
  root: true,
  
  env: {
    browser: true,
    es2021: true,
    node: true
  },

  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],

  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },

  plugins: [
    'vue',
    '@typescript-eslint'
  ],

  globals: {
    ga: 'readonly',
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  rules: {
    'generator-star-spacing': 'off',
    'arrow-parens': 'off',
    'one-var': 'off',
    'no-void': 'error',
    'multiline-ternary': 'off',
    'prefer-promise-reject-errors': 'off',
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-undef': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'vue/multi-word-component-names': 'off'
  }
}
