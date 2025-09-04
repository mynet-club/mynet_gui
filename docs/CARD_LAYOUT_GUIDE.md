# 响应式卡片布局系统

本项目提供了一套统一的响应式卡片布局系统，以确保在不同屏幕尺寸下提供一致的用户体验。

## 📱 响应式设计

### 断点配置
```scss
// 移动端：1列
@media (max-width: 599px)

// 平板：2列  
@media (min-width: 600px)

// 桌面：3列
@media (min-width: 1024px)

// 大屏：4列
@media (min-width: 1440px)
```

## 🎨 组件使用

### ResponsiveCardGrid 组件

#### 基础用法
```vue
<template>
  <ResponsiveCardGrid
    :items="dataList"
    :loading="isLoading"
    variant="standard"
    spacing="normal"
  >
    <template #default="{ item, index }">
      <q-card-section>
        <div class="text-h6">{{ item.title }}</div>
        <div class="text-body2">{{ item.description }}</div>
      </q-card-section>
    </template>
  </ResponsiveCardGrid>
</template>
```

#### 完整配置
```vue
<template>
  <ResponsiveCardGrid
    :items="items"
    :loading="loading"
    :loading-count="8"
    
    <!-- 网格配置 -->
    variant="standard" 
    spacing="normal"
    
    <!-- 空状态 -->
    empty-icon="inbox"
    empty-title="暂无数据"
    empty-description="请添加一些内容"
    
    <!-- 选择功能 -->
    :selectable="true"
    :selected-items="selectedItems"
    
    <!-- 事件处理 -->
    @card-click="handleCardClick"
    @selection-change="handleSelectionChange"
  >
    <template #default="{ item, index, isSelected }">
      <!-- 卡片内容 -->
    </template>
    
    <template #emptyAction>
      <q-btn color="primary" label="添加内容" />
    </template>
  </ResponsiveCardGrid>
</template>
```

### Props 说明

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `items` | `T[]` | - | 数据列表 |
| `loading` | `boolean` | `false` | 加载状态 |
| `loadingCount` | `number` | `8` | 加载骨架屏数量 |
| `variant` | `'standard' \| 'compact' \| 'spacious'` | `'standard'` | 网格布局变体 |
| `spacing` | `'tight' \| 'normal' \| 'loose' \| 'xl'` | `'normal'` | 卡片间距 |
| `emptyIcon` | `string` | `'inbox'` | 空状态图标 |
| `emptyTitle` | `string` | `'暂无数据'` | 空状态标题 |
| `emptyDescription` | `string` | - | 空状态描述 |
| `selectable` | `boolean` | `false` | 是否可选择 |
| `selectedItems` | `T[]` | - | 已选择项目 |
| `clickable` | `boolean` | `false` | 是否可点击 |

### 网格变体

#### standard（标准）
- 移动端：1列
- 平板：2列  
- 桌面：3列
- 大屏：4列

#### compact（紧凑）
- 移动端：1列
- 平板：2列
- 桌面：4列
- 大屏：6列

#### spacious（宽松）
- 移动端：1列
- 平板：1列
- 桌面：2列
- 大屏：3列

### 间距选项

- `tight`: 0.5rem
- `normal`: 1rem  
- `loose`: 1.5rem
- `xl`: 2rem

## 🎯 直接使用样式类

如果不需要组件的额外功能，可以直接使用 CSS 类：

### CSS Grid 方式
```vue
<template>
  <div class="card-grid gap-normal">
    <q-card v-for="item in items" :key="item.id" class="standard-card">
      <!-- 卡片内容 -->
    </q-card>
  </div>
</template>
```

### Quasar Row/Col 方式  
```vue
<template>
  <div class="row responsive-card-row">
    <div 
      v-for="item in items" 
      :key="item.id"
      class="col-xs-12 col-sm-6 col-md-4 col-lg-3 card-item"
    >
      <q-card class="standard-card">
        <!-- 卡片内容 -->
      </q-card>
    </div>
  </div>
</template>
```

## 🎨 样式类参考

### 卡片样式
- `.standard-card` - 标准卡片样式（悬停效果、圆角、阴影）
- `.card-compact` - 紧凑内边距
- `.card-spacious` - 宽松内边距
- `.card-loading` - 加载动画效果

### 状态样式
- `.card-status` - 状态指示器
- `.status-success` - 成功状态（绿色）
- `.status-warning` - 警告状态（橙色）
- `.status-error` - 错误状态（红色）
- `.status-info` - 信息状态（蓝色）

### 布局样式
- `.card-header` - 卡片头部
- `.card-content` - 卡片内容
- `.card-actions` - 卡片操作区

### 网格样式
- `.card-grid` - CSS Grid 布局
- `.card-grid-tight` - 紧凑间距
- `.card-grid-loose` - 宽松间距
- `.card-grid-xl` - 超大间距

## 🏗️ 迁移现有组件

### 步骤 1：导入组件
```typescript
import ResponsiveCardGrid from '@/components/common/ResponsiveCardGrid.vue'
```

### 步骤 2：替换模板
```vue
<!-- 旧方式 -->
<div class="row q-gutter-md">
  <div v-for="item in items" :key="item.id" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
    <q-card>
      <!-- 内容 -->
    </q-card>
  </div>
</div>

<!-- 新方式 -->
<ResponsiveCardGrid :items="items">
  <template #default="{ item }">
    <q-card-section>
      <!-- 内容 -->
    </q-card-section>
  </template>
</ResponsiveCardGrid>
```

### 步骤 3：移除旧样式
删除组件中的自定义卡片样式，使用统一的样式系统。

## 📋 最佳实践

### 1. 统一使用标准样式
```vue
<!-- ✅ 推荐 -->
<q-card class="standard-card">

<!-- ❌ 避免 -->
<q-card class="my-custom-card">
```

### 2. 合理选择网格变体
- 简单列表项：使用 `compact`
- 详细信息卡片：使用 `standard`  
- 重要内容：使用 `spacious`

### 3. 保持一致的间距
- 大部分场景：使用 `normal`
- 密集布局：使用 `tight`
- 展示性布局：使用 `loose` 或 `xl`

### 4. 正确处理空状态
```vue
<ResponsiveCardGrid
  :items="items"
  empty-icon="person_add"
  empty-title="还没有朋友"
  empty-description="邀请一些朋友加入吧"
>
  <template #emptyAction>
    <q-btn color="primary" label="邀请朋友" @click="showInviteDialog" />
  </template>
</ResponsiveCardGrid>
```

## 🔧 自定义配置

如果需要特殊的响应式断点，可以修改 `card-layout.scss` 文件中的媒体查询：

```scss
.card-grid {
  // 自定义断点
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 📱 移动端优化

系统自动处理移动端适配：
- 触摸友好的按钮尺寸
- 合适的卡片间距
- 单列布局避免内容拥挤
- 自适应字体大小

## 🎯 性能建议

1. **虚拟滚动**：对于大量数据，考虑使用 Quasar 的 `q-virtual-scroll`
2. **懒加载**：使用 `q-intersection` 实现图片懒加载
3. **分页**：避免一次性渲染过多卡片

```vue
<!-- 虚拟滚动示例 -->
<q-virtual-scroll
  :items="largeDataSet"
  separator
  v-slot="{ item, index }"
>
  <ResponsiveCardGrid :items="[item]">
    <template #default="{ item }">
      <!-- 卡片内容 -->
    </template>
  </ResponsiveCardGrid>
</q-virtual-scroll>
```
