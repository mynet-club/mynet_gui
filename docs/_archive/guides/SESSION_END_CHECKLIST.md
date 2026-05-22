# 开发规范总结 - 会话结束检查清单

## 📋 每次会话结束必做事项

### 如果本次会话修改了页面文件（.vue/.ts），必须：

1. **代码规范检查**
   ```bash
   npm run lint
   ```
   
2. **国际化检查** ⭐️ **强制要求**
   ```bash
   npm run check:i18n
   ```
   
3. **修复所有问题**
   - 修复 lint 报告的代码规范问题
   - 添加所有缺失的 i18n 键值（中英文）
   - 确保没有硬编码的 UI 文本

4. **清理调试代码**
   - 移除所有 `console.log`
   - 移除调试用的注释代码

5. **提交代码**
   ```bash
   git add .
   git commit -m "描述: 本次修改内容"
   ```

## ⚠️ 重要提醒

- **未通过 `npm run check:i18n` 检查的代码不允许提交**
- i18n 检查工具位于：`dev-tools/check-i18n.js`
- 详细规范请查看：`docs/03-开发指南.md#国际化开发规范`

## 🔧 快速修复指南

### 缺失中文翻译

在 `src/i18n/zh-CN.ts` 中添加对应键值：

```typescript
{
  module: {
    submodule: {
      key: '中文翻译'
    }
  }
}
```

### 缺失英文翻译

在 `src/i18n/en-US.ts` 中添加对应键值：

```typescript
{
  module: {
    submodule: {
      key: 'English Translation'
    }
  }
}
```

## 📖 相关文档

- [开发指南完整版](docs/03-开发指南.md)
- [开发工具说明](dev-tools/README.md)
- [国际化配置](src/i18n/)
