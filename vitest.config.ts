import { defineConfig } from 'vitest/config'

// 本仓首个 vitest 套件（M0「单元测试可运行」）的落地配置。
// 只收 src 下的 *.test.ts / *.spec.ts：避免把 dist/、.quasar/ 里的构建产物当用例。
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules/**', 'dist/**', '.quasar/**']
  }
})
