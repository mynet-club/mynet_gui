# Phase 2 快速开始指南

> 如何将Tips系统集成到MyNet应用中并开始使用

**目标**: 在接下来的1-2天内完成基础集成，让Tips系统运行起来  
**预计时间**: 4-6小时

---

## 🎯 目标检查清单

- [ ] TipsContainer添加到MainLayout
- [ ] 引导状态初始化
- [ ] 欢迎弹窗可以显示
- [ ] IP资源池按钮可以高亮
- [ ] 设备添加按钮可以高亮
- [ ] 状态能保存和恢复

---

## 🚀 快速开始（3步）

### Step 1: 添加TipsContainer到MainLayout (15分钟)

打开 `src/layouts/MainLayout.vue`，添加：

```vue
<template>
  <q-layout view="hHh lpR fFf">
    <!-- 现有的header, drawer, page等 -->
    
    <!-- 🆕 添加这一行 -->
    <TipsContainer />
  </q-layout>
</template>

<script setup lang="ts">
// 现有的imports...

// 🆕 添加这些imports
import { onMounted } from 'vue'
import TipsContainer from '@/components/tips/TipsContainer.vue'
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import { getTipsEngine } from '@/services/tips/TipsEngine'

const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

// 🆕 添加这个onMounted hook
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    // 初始化引导状态
    onboardingStore.initialize(authStore.user.id.toString())
    
    // 启动Tips引擎（开发环境启用调试）
    getTipsEngine({
      enabled: true,
      autoStart: true,
      debug: import.meta.env.DEV
    })
    
    // 首次登录自动开始引导
    if (!onboardingStore.isStarted && !onboardingStore.completed) {
      onboardingStore.start()
    }
  }
})
</script>
```

**测试**: 刷新页面，打开浏览器控制台，应该看到：
```
[TipsEngine] TipsEngine initialized { enabled: true, ... }
[TipsEngine] Starting engine
[Onboarding] State loaded from storage: { progress: 0, ... }
```

---

### Step 2: 添加开发者工具（调试用）(10分钟)

在 `src/App.vue` 或 `src/layouts/MainLayout.vue` 添加开发者快捷方式：

```vue
<script setup lang="ts">
import { useOnboardingStore } from '@/stores/onboarding'
import { resetTipsEngine } from '@/services/tips/TipsEngine'

// 🆕 开发环境添加调试工具
if (import.meta.env.DEV) {
  // 添加到window对象方便控制台调用
  window.$tips = {
    // 重置引导
    reset: () => {
      const store = useOnboardingStore()
      store.reset()
      resetTipsEngine()
      location.reload()
      console.log('✅ 引导已重置，页面已刷新')
    },
    
    // 查看状态
    status: () => {
      const store = useOnboardingStore()
      console.table({
        '用户ID': store.userId,
        '是否完成': store.completed,
        '当前阶段': store.currentStage,
        '进度': `${store.progress}%`,
        '选择路径': store.selectedPath
      })
      console.log('阶段详情:', store.stages)
    },
    
    // 导出状态
    export: () => {
      const store = useOnboardingStore()
      const state = store.exportState()
      console.log(JSON.stringify(state, null, 2))
      return state
    },
    
    // 跳过所有
    skipAll: () => {
      const store = useOnboardingStore()
      store.skipAll()
      console.log('✅ 已跳过所有引导')
    }
  }
  
  console.log('💡 开发者工具已加载，使用 window.$tips 访问：')
  console.log('  - $tips.reset()  : 重置引导')
  console.log('  - $tips.status() : 查看状态')
  console.log('  - $tips.export() : 导出状态')
  console.log('  - $tips.skipAll(): 跳过引导')
}
</script>
```

**测试**: 在浏览器控制台输入：
```javascript
$tips.status()
// 应该看到当前引导状态的表格
```

---

### Step 3: 添加第一个高亮目标（快速验证）(15分钟)

找到IP资源池页面，添加目标标记。如果暂时找不到页面，可以在Dashboard添加一个测试按钮：

#### 方案A: 修改IP资源池页面

找到 `src/pages/advanced/ippools/IPPoolPage.vue`（或类似路径），修改创建按钮：

```vue
<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h5>IP资源池</h5>
      
      <!-- 🆕 添加 data-tip-target 属性 -->
      <q-btn
        color="primary"
        label="创建资源池"
        icon="add"
        data-tip-target="create-ippool-btn"
        @click="showCreateDialog"
      />
    </div>
    
    <!-- 其他内容... -->
  </q-page>
</template>
```

#### 方案B: 临时在Dashboard添加测试按钮

```vue
<template>
  <q-page padding>
    <!-- 现有内容... -->
    
    <!-- 🆕 临时测试按钮 -->
    <q-btn
      v-if="import.meta.env.DEV"
      color="primary"
      label="测试高亮"
      data-tip-target="create-ippool-btn"
      class="q-mt-md"
    />
  </q-page>
</template>
```

**测试**:
1. 在控制台运行 `$tips.reset()` 重置引导
2. 刷新页面
3. 应该看到欢迎弹窗
4. 点击"开始使用"
5. 导航到IP资源池页面（或有测试按钮的页面）
6. 应该看到高亮引导

---

## 🔍 验证和调试

### 检查点 1: 欢迎弹窗显示

**预期**: 首次登录或重置后，应该在Dashboard显示欢迎弹窗

**调试**:
```javascript
// 查看引导状态
$tips.status()

// 如果没显示，手动触发
const store = useOnboardingStore()
store.reset()
store.start()
```

### 检查点 2: 高亮引导触发

**预期**: 在IP资源池页面应该看到高亮遮罩和Tips气泡

**调试**:
```javascript
// 检查目标元素是否存在
document.querySelector('[data-tip-target="create-ippool-btn"]')
// 应该返回按钮元素，如果是null说明标记未添加

// 检查Tips配置
import { getTipById } from '@/services/tips/TipsRegistry'
const tip = getTipById('create_ippool')
console.log(tip) // 应该返回配置对象

// 检查路由
console.log(router.currentRoute.value.path)
// 应该匹配tip的route配置
```

### 检查点 3: 状态持久化

**预期**: 刷新页面后状态应该保持

**调试**:
```javascript
// 完成一个阶段
const store = useOnboardingStore()
store.completeStage(OnboardingStage.Welcome)

// 刷新页面，再检查
$tips.status()
// welcome_shown应该是true
```

---

## 🐛 常见问题速查

### Q1: 欢迎弹窗不显示

**可能原因**:
- TipsContainer未添加到MainLayout
- 引导状态未初始化
- 引导已经完成

**解决**:
```javascript
// 检查
$tips.status()

// 重置
$tips.reset()
```

### Q2: 高亮引导不显示

**可能原因**:
- 目标元素的data-tip-target未设置
- 路由不匹配
- 阶段未完成

**解决**:
```javascript
// 检查目标元素
document.querySelector('[data-tip-target="create-ippool-btn"]')

// 检查当前路由
console.log(router.currentRoute.value.path)

// 手动完成前置阶段
const store = useOnboardingStore()
store.completeStage(OnboardingStage.Welcome)
```

### Q3: 控制台报错

**常见错误**:
```
Cannot find module '@/components/tips/TipsContainer.vue'
```
**解决**: 确认文件路径正确，组件已创建

```
Uncaught TypeError: Cannot read property 'id' of undefined
```
**解决**: 确认用户已登录，authStore.user存在

---

## ✅ 完成标准

完成以下检查即可进入下一阶段：

- [ ] 浏览器控制台无报错
- [ ] 首次登录显示欢迎弹窗
- [ ] 可以通过 `$tips.status()` 查看状态
- [ ] 可以通过 `$tips.reset()` 重置引导
- [ ] IP资源池按钮有data-tip-target标记
- [ ] 访问IP资源池页面能看到高亮引导
- [ ] 刷新页面状态保持不变

---

## 📚 相关文档

- [完整集成指南](TIPS_INTEGRATION_GUIDE.md) - 详细的集成步骤和示例
- [实施方案](IMPLEMENTATION_PLAN.md) - 8周完整计划
- [Phase 1完成报告](PHASE_1_COMPLETION_REPORT.md) - 已完成的工作

---

## 🎯 下一步

完成快速开始后：

1. **添加更多目标标记**
   - 设备添加按钮
   - 连接管理标签
   - 好友列表

2. **集成事件处理**
   - IP资源池创建成功
   - 设备添加成功
   - 连接建立成功

3. **测试完整流程**
   - 走通路径A
   - 走通路径B
   - 测试边界情况

---

**创建时间**: 2026-01-06  
**预计完成**: 2026-01-07  
**下一文档**: 完整的Phase 2实施指南
