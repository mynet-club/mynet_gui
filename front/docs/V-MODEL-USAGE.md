# V-Model 使用指南

## 为什么使用 v-model？

### 1. 表单数据绑定
```vue
<!-- 传统方式 -->
<q-input 
  :value="form.name" 
  @input="form.name = $event.target.value"
  label="名称"
/>

<!-- 使用 v-model -->
<q-input 
  v-model="form.name"
  label="名称"
/>
```

### 2. 优势
- **代码简洁**：减少模板代码
- **双向绑定**：数据和视图自动同步
- **类型安全**：TypeScript 支持良好
- **响应式**：自动触发更新

## Vue 3 中的 v-model 变化

### 1. 默认 prop 名变化
```vue
<!-- Vue 2 -->
<MyComponent v-model="value" />
<!-- 相当于 -->
<MyComponent :value="value" @input="value = $event" />

<!-- Vue 3 -->
<MyComponent v-model="value" />
<!-- 相当于 -->
<MyComponent :model-value="value" @update:model-value="value = $event" />
```

### 2. 多个 v-model 支持
```vue
<!-- Vue 3 支持多个 v-model -->
<MyComponent 
  v-model:title="title"
  v-model:content="content"
/>
```

## 在组件中正确使用 v-model

### 1. 子组件定义
```vue
<!-- 子组件 -->
<template>
  <q-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- 内容 -->
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

### 2. 父组件使用
```vue
<!-- 父组件 -->
<template>
  <MyDialog v-model="showDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDialog = ref(false)
</script>
```

## 常见问题和解决方案

### 1. 不能在 prop 上直接使用 v-model
```vue
<!-- ❌ 错误 -->
<q-dialog v-model="modelValue">

<!-- ✅ 正确 -->
<q-dialog 
  :model-value="modelValue" 
  @update:model-value="$emit('update:modelValue', $event)"
>
```

### 2. 复杂对象的 v-model
```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

// 使用 reactive 处理复杂对象
const form = reactive({
  name: '',
  network: '',
  ip_range: {
    start: '',
    end: ''
  }
})

// 或者使用 ref
const form = ref({
  name: '',
  network: '',
  ip_range: {
    start: '',
    end: ''
  }
})
</script>
```

### 3. 类型安全
```typescript
// 定义明确的类型
interface IPPoolForm {
  name: string
  network: string
  ip_range: {
    start: string
    end: string
  }
  zone_id: string
}

const form = ref<IPPoolForm>({
  name: '',
  network: '',
  ip_range: {
    start: '',
    end: ''
  },
  zone_id: ''
})
```

## 在 IP 池模块中的使用场景

### 1. 表单绑定
- 创建/编辑 IP 池表单
- 搜索和过滤器
- 用户输入验证

### 2. 对话框控制
- 显示/隐藏对话框
- 父子组件通信
- 状态管理

### 3. 列表交互
- 选择项管理
- 批量操作
- 视图控制

## 最佳实践

1. **明确类型定义**：使用 TypeScript 定义 props 和 emits
2. **避免直接修改 props**：使用事件发射器
3. **合理使用 reactive/ref**：根据数据复杂度选择
4. **验证数据**：在表单提交前验证
5. **处理异步操作**：loading 状态管理
