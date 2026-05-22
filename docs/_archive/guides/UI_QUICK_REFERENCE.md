# MyNet UI 快速参考指南

> 基于专业级网络管理控制台设计规范的快速查阅手册

---

## 🎨 颜色使用速查

### 状态色（仅图标、Badge、数值）

```vue
<!-- ✅ 正确 -->
<q-icon name="wifi" color="positive" />
<q-chip color="positive" text-color="white">在线</q-chip>
<span class="text-success">{{ value }}</span>

<!-- ❌ 错误 -->
<div class="bg-positive q-pa-md">...</div>  <!-- 禁止状态色背景块 -->
```

| 状态 | 颜色变量 | Quasar | 使用场景 |
|------|----------|--------|----------|
| 正常 | `--color-success` | `positive` | 在线、成功 |
| 警告 | `--color-warning` | `warning` | 待处理 |
| 异常 | `--color-error` | `negative` | 离线、错误 |
| 不可用 | `--color-disabled` | `grey-6` | N/A、未配置 |

### 按钮颜色

```vue
<!-- ✅ 主操作 -->
<q-btn unelevated color="primary" icon="add" />

<!-- ✅ 次要操作 -->
<q-btn flat color="grey-7" icon="refresh" />

<!-- ❌ 避免 -->
<q-btn color="secondary" />
<q-btn color="positive" />
```

---

## 📏 间距速查

### 基础单位：8px

```scss
$spacing-xs: 4px;      // 0.5x
$spacing-sm: 8px;      // 1x
$spacing-md: 12px;     // 1.5x
$spacing-base: 16px;   // 2x (默认)
$spacing-lg: 20px;     // 2.5x
$spacing-xl: 24px;     // 3x
$spacing-2xl: 32px;    // 4x (模块间距)
```

### 常用间距

| 用途 | 变量 | 值 |
|------|------|-----|
| 卡片内边距 | `$card-padding` | 16px |
| 卡片间距 | `$card-gap` | 20px |
| 模块间距 | `$module-gap` | 32px |

---

## 🃏 卡片结构

### 标准卡片（三段式）

```vue
<q-card class="standard-card">
  <!-- 1. Header: 实体名称 + 图标 -->
  <q-card-section class="card-header">
    <div class="card-title">
      <q-icon name="device_hub" size="20px" color="primary" />
      设备列表
    </div>
  </q-card-section>
  
  <!-- 2. Body: 核心信息 -->
  <q-card-section class="card-body">
    <div class="info-line">
      <q-icon name="vpn_key" size="20px" color="primary" />
      <span class="info-value">10.182.236.182</span>
    </div>
  </q-card-section>
  
  <!-- 3. Footer: 归属 + Badge -->
  <q-card-section class="card-footer">
    <span>arthur</span>
    <q-badge color="positive">在线</q-badge>
  </q-card-section>
</q-card>
```

### 卡片规则

- ✅ 状态优先于说明文字
- ✅ 技术信息完整展示
- ❌ 禁止教程性文案
- ❌ 禁止流程引导

---

## 📝 字体规范

### 字体大小

| 用途 | 大小 | 变量 | Quasar 类 |
|------|------|------|-----------|
| 页面标题 | 20-22px | `$font-size-2xl` | `.text-h5` |
| 卡片标题 | 16px | `$font-size-lg` | `.text-h6` |
| 主要数值 | 14-15px | `$font-size-base` | `.text-body1` |
| 辅助信息 | 12-13px | `$font-size-xs` | `.text-caption` |

### 字重使用

```vue
<!-- ✅ 适度使用 -->
<div class="text-weight-semibold">重要标题</div>
<div class="text-weight-medium">次要信息</div>

<!-- ❌ 避免滥用 Bold -->
<div class="text-weight-bold">...</div>  <!-- 仅特殊情况 -->
```

---

## 🎯 页面类型检查清单

### 1. 实体列表页 (Entity List)

```vue
<PageLayout title="设备列表">
  <template #actions>
    <q-btn unelevated color="primary" icon="add" />
    <q-btn flat color="grey-7" icon="refresh" />
  </template>
  
  <ResponsiveCardGrid :items="nodes">
    <template #default="{ item }">
      <NodeCardContent :node="item" />
    </template>
  </ResponsiveCardGrid>
</PageLayout>
```

**检查清单**：
- [ ] 使用统一卡片组件
- [ ] 按钮颜色符合规范
- [ ] 无教程性文案

### 2. 实体详情页 (Entity Detail)

```vue
<PageLayout :title="node.name">
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section class="card-header">基本信息</q-card-section>
        <q-card-section class="card-body">...</q-card-section>
      </q-card>
    </div>
  </div>
</PageLayout>
```

**检查清单**：
- [ ] 信息密度适中
- [ ] 技术信息完整
- [ ] 向列表页对齐

### 3. Dashboard（系统概览）

```vue
<PageLayout title="仪表盘">
  <!-- 1. 系统状态摘要 -->
  <NetworkHealthSummary />
  
  <!-- 2. 统计卡片 -->
  <DashboardStats />
  
  <!-- 3. 最近活动 -->
  <RecentActivities />
</PageLayout>
```

**禁止项**：
- ❌ 欢迎语
- ❌ 智能推荐
- ❌ 教程引导
- ❌ 渐变背景

---

## 🎨 Design Tokens 使用

### 在 Vue 组件中

```vue
<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.my-component {
  // 颜色
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  
  // 间距
  padding: $card-padding;
  gap: $spacing-md;
  
  // 边框
  border: $border-width solid var(--color-border);
  border-radius: var(--card-radius);
  
  // 阴影
  box-shadow: var(--shadow-sm);
}
</style>
```

### CSS 自定义属性

```scss
// Light Mode
--color-bg-primary: #f9fafb;
--color-text-primary: #111827;
--color-success: #10b981;

// Dark Mode（自动切换）
body.body--dark {
  --color-bg-primary: #1f2937;
  --color-text-primary: #f9fafb;
  --color-success: #059669;  // 降饱和
}
```

---

## 🚫 常见错误与修正

### 错误 1：颜色滥用

```vue
<!-- ❌ 错误 -->
<q-btn color="positive" />
<q-btn color="secondary" />
<q-btn color="accent" />

<!-- ✅ 正确 -->
<q-btn unelevated color="primary" />  <!-- 主操作 -->
<q-btn flat color="grey-7" />         <!-- 次要操作 -->
```

### 错误 2：间距不规范

```vue
<!-- ❌ 错误 -->
<div class="q-pa-md" style="margin-bottom: 15px">

<!-- ✅ 正确 -->
<div class="q-pa-md q-mb-base">  <!-- 16px -->
<div class="q-pa-lg q-mb-lg">    <!-- 20px -->
```

### 错误 3：情绪化文案

```vue
<!-- ❌ 错误 -->
<div>太棒了！你已经完成了配置</div>
<div>继续探索 MyNet 的各项功能吧</div>

<!-- ✅ 正确 -->
<div>配置已完成</div>
<div>所有设备正常运行</div>
```

### 错误 4：教程式引导

```vue
<!-- ❌ 错误 -->
<q-card>
  <div>点击"添加设备"开始创建您的第一台设备</div>
  <q-btn>添加设备</q-btn>
</q-card>

<!-- ✅ 正确 -->
<q-card>
  <div class="empty-state">
    <q-icon name="device_hub" size="48px" color="grey-5" />
    <div>暂无设备</div>
    <q-btn flat color="primary" icon="add">添加设备</q-btn>
  </div>
</q-card>
```

---

## 🔍 审查检查点

### 新组件提交前检查

```markdown
## 设计规范检查

- [ ] 页面类型明确（列表/详情/Dashboard/工具）
- [ ] 颜色使用符合规范（灰阶 ≥70%）
- [ ] 间距为 8px 倍数
- [ ] 卡片结构统一（Header→Body→Footer）
- [ ] 状态色仅用于图标/Badge/数值
- [ ] 无情绪化文案
- [ ] 无教程性内容
- [ ] 使用 Design Tokens
- [ ] Dark Mode 测试通过
```

### Dashboard 特殊检查

```markdown
## Dashboard 检查

- [ ] 无欢迎语
- [ ] 无智能推荐卡片
- [ ] 无渐变背景
- [ ] 无强视觉按钮
- [ ] 只显示状态摘要
- [ ] 问题项 < 5 个
```

---

## 📚 参考资源

| 资源 | 路径 |
|------|------|
| 完整设计规范 | [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) |
| 优化实施报告 | [UI_OPTIMIZATION_REPORT.md](./UI_OPTIMIZATION_REPORT.md) |
| Design Tokens | `src/styles/design-tokens.scss` |
| 卡片样式 | `src/css/card-styles.scss` |

### 设计参考

- **Cloudflare Dashboard**：专业、克制、信息密度高
- **GitHub Settings**：清晰的层级结构
- **Linear App**：简洁的操作流程

---

## 💡 快速命令

### 新建遵循规范的组件

```bash
# 使用模板创建
# TODO: 添加组件模板脚本
```

### 检查颜色使用

```bash
# 搜索不规范的颜色使用
grep -r "color=\"positive\"" src/pages/
grep -r "color=\"secondary\"" src/pages/
```

### 检查间距

```bash
# 搜索硬编码的间距
grep -r "margin-bottom: [0-9]" src/
grep -r "padding: [0-9]" src/
```

---

**最后更新**: 2026-01-09  
**维护者**: GitHub Copilot  
**问题反馈**: 参考 UI_DESIGN_SYSTEM.md
