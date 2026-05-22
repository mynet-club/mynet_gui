# 表单输入风格统一指南

## 📋 概述

本文档提供了项目中表单输入控件的统一风格规范和使用指导。

## 🎯 访问方式

访问示例页面：`/app/examples/form-style-guide`

完整URL：`http://localhost:9000/app/examples/form-style-guide`

## 🎨 推荐风格规范

### 1. 认证表单风格 - 纯 Placeholder
**适用场景**：登录、注册、找回密码等认证相关表单

```vue
<q-input
  v-model="form.email"
  :placeholder="$t('auth.email')"
  type="email"
  outlined
  class="form-field"
>
  <template v-slot:prepend>
    <q-icon name="email" />
  </template>
</q-input>
```

**特点**：
- 简洁直观，无额外标签
- 适合紧凑布局
- 配合图标使用效果更佳

### 2. 搜索框风格 - 简洁 Placeholder
**适用场景**：各种搜索功能

```vue
<q-input
  v-model="searchQuery"
  :placeholder="$t('common.searchPlaceholder')"
  outlined
  dense
  clearable
>
  <template v-slot:prepend>
    <q-icon name="search" />
  </template>
</q-input>
```

**特点**：
- 使用 `dense` 属性节省空间
- 添加 `clearable` 提供清除功能
- 搜索图标放在前置位置

### 3. 编辑表单风格 - 纯 Placeholder（统一后）
**适用场景**：用户资料编辑、节点配置等正式表单

```vue
<q-input
  v-model="form.name"
  :placeholder="$t('user.name')"
  outlined
  :rules="[val => !!val || '姓名不能为空']"
/>
```

**特点**：
- 简洁统一的风格
- 节省垂直空间
- 支持验证规则显示

### 4. 对话框表单风格 - 详细 Placeholder
**适用场景**：弹窗、对话框中的紧凑表单

```vue
<q-input
  v-model="form.address"
  placeholder="服务地址 (192.168.1.100 或 example.com)"
  outlined
  dense
/>
```

**特点**：
- 节省垂直空间
- 提供详细的输入说明
- 使用 `dense` 属性

### 5. 只读显示风格 - q-field 包装
**适用场景**：信息展示、只读字段、复杂布局

```vue
<q-field :label="$t('nodes.edit.keys.keyId')" stack-label>
  <template v-slot:control>
    <div class="self-center full-width no-outline">
      {{ selectedKey.id }}
    </div>
  </template>
</q-field>
```

**特点**：
- 支持复杂布局
- 统一的标签样式
- 适合只读内容展示

## 📏 使用原则

### 避免的做法
❌ **标签与占位符重复**
```vue
<!-- 不推荐：重复信息 -->
<q-input
  :label="$t('user.name')"
  :placeholder="$t('user.name')"
  outlined
/>
```

❌ **混乱的风格**
```vue
<!-- 不推荐：同一页面混用不同风格 -->
<q-input :placeholder="$t('user.name')" outlined />
<q-input :label="$t('user.email')" outlined />
```

### 推荐的做法
✅ **风格一致**
```vue
<!-- 推荐：同类表单使用统一风格 -->
<q-input :placeholder="$t('user.name')" outlined />
<q-input :placeholder="$t('user.email')" outlined />
<q-input :placeholder="$t('user.phone')" outlined />
```

## 🎯 迁移建议

1. **按页面类型分批迁移**
   - 先统一认证相关页面
   - 再处理编辑表单页面
   - 最后优化对话框和特殊场景

2. **保持现有功能**
   - 迁移时确保验证规则不变
   - 保持原有的事件处理
   - 维持样式的视觉一致性

3. **测试验证**
   - 每次迁移后进行功能测试
   - 确认样式在不同屏幕尺寸下的表现
   - 验证国际化翻译的正确显示

## 📋 相关文件

- 示例页面：`src/pages/examples/FormStyleGuidePage.vue`
- 路由配置：`src/router/routes.ts`
- 翻译文件：`src/i18n/zh-CN.ts`

## 🔄 下一步计划

1. 根据这个指南逐步统一现有表单
2. 建立更详细的组件库文档
3. 考虑创建统一的表单组件封装