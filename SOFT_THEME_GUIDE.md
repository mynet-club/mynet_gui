# 柔和清新主题使用指南

> 创建日期：2025-12-26  
> 主题版本：v1.0  
> 灵感来源：节点卡片的清新柔和设计

---

## 🎨 设计理念

本主题学习了节点卡片的设计精髓，提取了以下核心特点并应用于整站：

### 核心设计原则

1. **低对比度** 📉
   - 摒弃纯黑 (#000000) 和纯白 (#FFFFFF)
   - 使用柔和的深灰 (#4a5568) 替代黑色
   - 使用带蓝调的浅灰 (#f5f7fa) 替代纯白

2. **圆润柔和** 🌊
   - 大圆角设计（12-20px）
   - 柔和的阴影（透明度 0.03-0.06）
   - 平滑的过渡动画

3. **舒适间距** 📏
   - 充足的内边距和外边距
   - 行高适中，不拥挤
   - 留白恰当，呼吸感强

4. **柔和色彩** 🎨
   - 降低颜色饱和度
   - 使用柔和的状态色
   - 渐变和半透明效果

---

## 🎯 主题特色

### 1. 颜色系统

#### 背景色
```scss
--soft-bg-primary: #f5f7fa;      // 主背景 - 柔和灰蓝
--soft-bg-secondary: #e8ecf1;    // 次级背景
--soft-bg-card: #f8fafc;         // 卡片背景
--soft-bg-hover: #eef2f7;        // 悬停背景
```

#### 文字颜色
```scss
--soft-text-primary: #4a5568;    // 主文字 - 深灰
--soft-text-secondary: #718096;  // 次要文字
--soft-text-tertiary: #a0aec0;   // 辅助文字
```

#### 状态颜色
```scss
--soft-success: #48bb78;         // 成功 - 柔和绿
--soft-warning: #ed8936;         // 警告 - 柔和橙
--soft-error: #f56565;           // 错误 - 柔和红
--soft-info: #4299e1;            // 信息 - 柔和蓝
```

### 2. 阴影系统

```scss
// 小阴影 - 用于按钮、标签
--soft-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);

// 中等阴影 - 用于卡片
--soft-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03);

// 大阴影 - 用于对话框、抽屉
--soft-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03);

// 悬停阴影
--soft-shadow-hover: 0 12px 20px rgba(0, 0, 0, 0.06), 0 6px 8px rgba(0, 0, 0, 0.04);
```

**关键点：** 阴影透明度极低（0.03-0.06），营造轻盈感

### 3. 圆角系统

```scss
--soft-radius-sm: 8px;    // 小圆角 - 按钮、输入框
--soft-radius-md: 12px;   // 中等圆角 - 一般卡片
--soft-radius-lg: 16px;   // 大圆角 - 主要卡片
--soft-radius-xl: 20px;   // 超大圆角 - 对话框
--soft-radius-full: 999px; // 完全圆角 - 徽章、标签
```

---

## 🛠️ 使用方法

### 1. 卡片组件

自动应用柔和样式，无需额外代码：

```vue
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">标题</div>
      <div class="text-subtitle2">副标题</div>
    </q-card-section>
    <q-card-section>
      内容区域
    </q-card-section>
  </q-card>
</template>
```

**效果：**
- ✅ 自动应用柔和背景色
- ✅ 自动应用圆角（16px）
- ✅ 自动应用轻柔阴影
- ✅ 悬停时自动提升

### 2. 按钮组件

```vue
<q-btn color="primary" label="主要按钮" />
<q-btn outline color="primary" label="轮廓按钮" />
<q-btn flat color="primary" label="扁平按钮" />
```

**效果：**
- ✅ 圆角 12px
- ✅ 无文字大写转换
- ✅ 柔和的悬停效果

### 3. 状态标签/徽章

使用预定义的类：

```vue
<div class="status-badge status-online">
  <q-icon name="wifi" size="14px" class="q-mr-xs" />
  在线
</div>

<div class="status-badge status-offline">
  <q-icon name="wifi_off" size="14px" class="q-mr-xs" />
  离线
</div>

<div class="status-badge status-pending">
  <q-icon name="schedule" size="14px" class="q-mr-xs" />
  待处理
</div>
```

**效果：**
- ✅ 柔和的背景色
- ✅ 完全圆角
- ✅ 轻微阴影

### 4. 特殊卡片（节点卡片风格）

使用专门的类：

```vue
<div class="node-card">
  <div class="row items-center">
    <q-icon name="dns" size="32px" color="primary" />
    <div class="q-ml-md">
      <div class="text-h6">节点名称</div>
      <div class="text-caption text-soft-secondary">10.237.149.244</div>
    </div>
  </div>
</div>
```

**效果：**
- ✅ 渐变背景
- ✅ 悬停时图标放大
- ✅ 更强的视觉层次

### 5. 使用工具类

```vue
<!-- 文字颜色 -->
<div class="text-soft-primary">主要文字</div>
<div class="text-soft-secondary">次要文字</div>
<div class="text-soft-tertiary">辅助文字</div>

<!-- 背景色 -->
<div class="bg-soft-card q-pa-md rounded-soft-lg">
  卡片风格容器
</div>

<!-- 圆角 -->
<div class="rounded-soft-sm">小圆角</div>
<div class="rounded-soft-md">中等圆角</div>
<div class="rounded-soft-lg">大圆角</div>
<div class="rounded-soft-full">完全圆角</div>

<!-- 阴影 -->
<div class="shadow-soft-sm">小阴影</div>
<div class="shadow-soft-md">中等阴影</div>
<div class="shadow-soft-lg">大阴影</div>
```

---

## 📐 布局建议

### 页面容器

```vue
<template>
  <div class="page-container">
    <!-- 你的内容 -->
  </div>
</template>
```

**特点：**
- 最大宽度 1400px
- 自动居中
- 响应式内边距

### 卡片网格

```vue
<template>
  <div class="soft-card-grid">
    <q-card v-for="item in items" :key="item.id">
      <!-- 卡片内容 -->
    </q-card>
  </div>
</template>
```

**特点：**
- 自动响应式列数
- 统一间距
- 最小宽度 300px

---

## 🎭 组件示例

### 完整的节点卡片示例

```vue
<template>
  <div class="node-card">
    <!-- 头部 -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-avatar color="primary" text-color="white" size="40px">
          <q-icon name="dns" size="24px" />
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-h6 text-soft-primary">节点名称</div>
          <div class="text-caption text-soft-secondary">OpenWrt / amd64</div>
        </div>
      </div>
      
      <!-- 状态徽章 -->
      <div class="status-badge status-online">
        <q-icon name="wifi" size="14px" class="q-mr-xs" />
        在线
      </div>
    </div>
    
    <!-- 信息列表 -->
    <div class="q-gutter-y-sm">
      <div class="row items-center">
        <q-icon name="key" color="primary" size="18px" class="q-mr-sm" />
        <span class="text-soft-secondary">10.237.149.244</span>
      </div>
      
      <div class="row items-center">
        <q-icon name="public" color="secondary" size="18px" class="q-mr-sm" />
        <span class="text-soft-secondary">47.201.35.85</span>
      </div>
      
      <div class="row items-center">
        <q-icon name="speed" color="accent" size="18px" class="q-mr-sm" />
        <span class="text-soft-secondary">96.2 ms</span>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="row q-gutter-sm q-mt-md">
      <q-btn 
        flat 
        dense 
        icon="settings" 
        label="配置" 
        color="primary"
        class="col"
      />
      <q-btn 
        flat 
        dense 
        icon="visibility" 
        label="详情" 
        color="secondary"
        class="col"
      />
    </div>
  </div>
</template>

<style scoped>
/* 如需额外样式，建议使用主题变量 */
.custom-section {
  padding: var(--soft-spacing-md);
  background-color: var(--soft-bg-secondary);
  border-radius: var(--soft-radius-md);
}
</style>
```

---

## 🌙 深色模式

主题自动支持深色模式，所有变量都有对应的深色版本。

**切换深色模式：**

```typescript
import { useQuasar } from 'quasar'

const $q = useQuasar()
$q.dark.set(true)  // 开启深色模式
$q.dark.set(false) // 关闭深色模式
$q.dark.toggle()   // 切换
```

深色模式下的颜色会自动切换为：
- 背景色变为深色调
- 文字颜色反转
- 阴影加深
- 边框颜色调整

---

## 📊 对比表

### 改进前 vs 改进后

| 项目 | 改进前 | 改进后 |
|------|--------|--------|
| **主背景** | #FFFFFF (纯白) | #f5f7fa (柔和灰蓝) |
| **文字颜色** | #000000 (纯黑) | #4a5568 (深灰) |
| **卡片阴影** | rgba(0,0,0,0.1) | rgba(0,0,0,0.04) |
| **圆角** | 4-8px | 12-20px |
| **状态色** | 高饱和度 | 降低饱和度 |
| **边框** | 1px 实线，明显 | 1px 实线，极浅 |
| **对比度** | 高对比 | 舒适对比 |

---

## ✨ 最佳实践

### 1. 颜色使用

❌ **不推荐：**
```vue
<div style="color: #000000; background: #FFFFFF;">
  高对比度文字
</div>
```

✅ **推荐：**
```vue
<div class="text-soft-primary bg-soft-card">
  柔和舒适的文字
</div>
```

### 2. 阴影使用

❌ **不推荐：**
```scss
.my-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); // 太重
}
```

✅ **推荐：**
```scss
.my-card {
  box-shadow: var(--soft-shadow-md); // 轻柔
}
```

### 3. 间距使用

❌ **不推荐：**
```vue
<div style="padding: 5px;">  <!-- 太紧凑 -->
```

✅ **推荐：**
```vue
<div class="q-pa-md">  <!-- 或使用 var(--soft-spacing-md) -->
```

---

## 🔧 自定义配置

如果需要微调主题，可以在组件中覆盖 CSS 变量：

```vue
<style>
/* 全局覆盖 */
:root {
  --soft-radius-lg: 18px;  /* 调整大圆角为 18px */
  --soft-spacing-lg: 1.75rem;  /* 调整大间距 */
}

/* 局部覆盖 */
.my-component {
  --soft-primary: #6b7fda;  /* 使用不同的主色调 */
}
</style>
```

---

## 📱 响应式

主题在不同设备上自动调整：

- **移动端（<768px）**
  - 减小间距
  - 减小圆角
  - 单列布局

- **平板（768px-1024px）**
  - 中等间距
  - 标准圆角
  - 2-3列布局

- **桌面（>1024px）**
  - 完整间距
  - 大圆角
  - 3-4列布局

---

## 🎨 设计灵感来源

### 节点卡片的设计精髓

1. **背景色**
   - 使用浅蓝/浅灰渐变
   - 不是纯白，更舒适

2. **圆角**
   - 大圆角（约16px）
   - 柔和不生硬

3. **图标**
   - 彩色但不刺眼
   - 适中的大小

4. **状态标签**
   - 圆润的徽章
   - 柔和的背景色
   - 轻微的边框

5. **间距**
   - 充足的内边距
   - 元素之间留白适中

6. **交互**
   - 柔和的悬停效果
   - 平滑的过渡动画

---

## 🚀 快速开始

主题已自动应用，无需额外配置！

1. **检查导入**
   - 确认 `src/css/app.css` 已导入 `soft-theme.scss`
   
2. **使用组件**
   - 直接使用 Quasar 组件，自动应用柔和样式
   
3. **使用工具类**
   - 使用 `.text-soft-*`, `.bg-soft-*`, `.rounded-soft-*` 等类
   
4. **享受舒适体验** 🎉

---

## 📝 总结

柔和清新主题通过以下方式提升用户体验：

1. ✅ **视觉舒适** - 低对比度，不刺眼
2. ✅ **设计现代** - 大圆角，轻阴影
3. ✅ **交互流畅** - 平滑动画，柔和反馈
4. ✅ **响应灵敏** - 适配各种设备
5. ✅ **深色友好** - 完善的深色模式支持

**从此告别强对比、刺眼的界面，享受清新柔和的视觉体验！** 🌟
