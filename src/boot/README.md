# Boot 文件说明

Boot 文件是 Quasar 框架的一个重要特性，用于在应用启动时执行初始化操作。这些文件按配置顺序执行，确保应用在启动时正确初始化所有必要的服务和配置。

## 文件执行顺序

在 `quasar.config.js` 中配置的 boot 文件按以下顺序执行：

1. **init.ts** - 应用基础初始化
2. **i18n.ts** - 国际化系统初始化
3. **notify.ts** - 通知系统配置
4. **axios.ts** - HTTP 客户端配置
5. **theme.ts** - 主题系统初始化
6. **websocket.ts** - WebSocket 连接管理
7. **auth.ts** - 认证系统初始化

## 各文件功能说明

### init.ts - 应用初始化
- 设置应用标题
- 配置全局错误处理
- 设置全局属性
- 应用启动日志

### i18n.ts - 国际化系统
- 初始化 Vue I18n
- 加载语言包
- 设置默认语言
- 提供语言切换功能
- 支持中文和英文

### notify.ts - 通知系统
- 配置全局通知设置
- 提供成功、错误、警告、信息通知函数
- 统一的通知样式和行为

### axios.ts - HTTP 客户端
- 配置全局错误处理
- 处理不同 HTTP 状态码
- 自动处理认证失败
- 网络错误处理

### theme.ts - 主题系统
- 深色模式管理
- 主题设置持久化
- 系统主题跟随
- 主题切换功能

### websocket.ts - WebSocket 管理
- 自动连接管理
- 事件监听设置
- 连接状态监控
- 实时数据更新

### auth.ts - 认证系统
- 自动登录检查
- 路由守卫配置
- Token 验证
- 认证状态管理

## 使用方式

### 在组件中使用全局属性

```vue
<template>
  <div>
    <p>应用名称: {{ $appName }}</p>
    <p>当前语言: {{ $getLocale() }}</p>
    <p>深色模式: {{ $getDarkMode() }}</p>
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

// 使用全局方法
const handleSuccess = () => {
  proxy.$showSuccess('操作成功')
}

const toggleTheme = () => {
  proxy.$toggleDarkMode()
}

const switchLanguage = () => {
  proxy.$setLocale('en-US')
}
</script>
```

### 在组合式函数中使用

```typescript
import { useQuasar } from 'quasar'
import { setLocale, getLocale } from '../boot/i18n'

export function useLanguage() {
  const $q = useQuasar()
  
  const switchLanguage = (locale: 'zh-CN' | 'en-US') => {
    setLocale(locale)
    $q.notify({
      type: 'positive',
      message: '语言切换成功'
    })
  }
  
  return {
    currentLocale: getLocale(),
    switchLanguage
  }
}
```

## 最佳实践

1. **执行顺序** - 确保依赖关系正确的执行顺序
2. **错误处理** - 每个 boot 文件都应该有适当的错误处理
3. **日志记录** - 添加适当的日志来跟踪初始化过程
4. **类型安全** - 使用 TypeScript 确保类型安全
5. **模块化** - 每个 boot 文件专注于单一职责
6. **可配置** - 通过配置文件控制功能开关

## 扩展建议

可以根据项目需要添加更多 boot 文件：

- **analytics.ts** - 分析工具初始化
- **permissions.ts** - 权限系统初始化
- **cache.ts** - 缓存系统配置
- **logging.ts** - 日志系统配置
- **performance.ts** - 性能监控初始化 