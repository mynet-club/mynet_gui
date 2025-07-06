# 开发阶段多语言配置说明

## 当前状态（开发阶段）
为了提高开发效率，当前项目配置为只使用中文语言包：

### 修改的文件
1. `src/boot/i18n.ts` - 语言配置
   - 固定使用 `zh-CN` 语言
   - 注释了语言切换相关功能
   - 回退语言也设为中文

### 开发阶段的好处
- 只需要维护中文语言包
- 避免重复更新英文语言包
- 提高开发效率
- 功能测试时专注于中文界面

## 项目完成后恢复多语言的步骤

### 1. 恢复 i18n.ts 配置
```typescript
// 恢复原始配置
const i18n = createI18n({
  legacy: false,
  locale: (LocalStorage.getItem('locale') as string) || 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  // ...其他配置
})

// 恢复语言切换函数
export const setLocale = (locale: 'zh-CN' | 'en-US') => {
  i18n.global.locale.value = locale
  LocalStorage.set('locale', locale)
  document.documentElement.lang = locale
  document.documentElement.setAttribute('data-locale', locale)
}

// 恢复支持的语言列表
export const getSupportedLocales = () => {
  return [
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' }
  ]
}

// 恢复boot函数
export default boot(({ app }: { app: any }) => {
  app.use(i18n)
  const savedLocale = (LocalStorage.getItem('locale') as 'zh-CN' | 'en-US') || 'zh-CN'
  setLocale(savedLocale)
  // ...
})
```

### 2. 批量翻译英文语言包
可以使用以下方法批量翻译：

#### 方法1: 使用翻译工具
```bash
# 使用 AI 翻译工具批量翻译
# 将 zh-CN.ts 的内容复制给 AI，要求翻译为英文
```

#### 方法2: 使用脚本工具
```bash
# 可以编写脚本自动对比中英文语言包差异
# 并生成需要翻译的键值对清单
```

### 3. 测试多语言功能
```bash
# 恢复配置后测试
npm run dev

# 在浏览器中测试语言切换
# 检查所有页面的中英文显示
```

### 4. 注意事项
- 恢复时注意检查所有新增的中文键是否都有对应的英文翻译
- 测试语言切换功能是否正常
- 检查 LocalStorage 中的语言设置是否生效
- 验证回退语言机制是否正常工作

## 当前开发模式下新增翻译的流程
1. 只在 `src/i18n/zh-CN.ts` 中添加新的键值对
2. 暂时不需要更新 `src/i18n/en-US.ts`
3. 项目结束后一次性批量翻译所有新增内容

## 待翻译内容记录
请在这里记录开发过程中新增的需要翻译的功能模块：

- [x] IP池创建功能相关翻译（已添加中文）
  - quotaInfo: 配额信息显示
  - quotaExhausted: 配额用尽提示
  - createCount: 创建数量
  - poolsUnit: 数量单位
  - continuous/discontinuous: 连续性选项
  - selectTargetPool: 目标池选择

- [ ] 其他待添加功能...
