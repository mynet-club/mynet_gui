import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// 本仓首个 vitest 套件（M0「单元测试可运行」）的落地配置。
// 只收 src 下的 *.test.ts / *.spec.ts：避免把 dist/、.quasar/ 里的构建产物当用例。
export default defineConfig({
  resolve: {
    alias: {
      // 源码里有 `import ... from 'src/utils/debug'` 这种 root 相对写法
      // （quasar.config.ts dev 下 alias 'src' -> '/src'）。vitest 不带这条
      // 别名就解析不了被测模块 —— 与应用同一口径。
      src: fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules/**', 'dist/**', '.quasar/**']
  }
})
