# Tips系统集成指南

> 如何将Tips系统集成到MyNet应用中

---

## 📦 已完成的组件

### 核心文件

- ✅ `src/types/tips.ts` - 类型定义
- ✅ `src/stores/onboarding.ts` - 状态管理
- ✅ `src/services/tips/TipsEngine.ts` - 核心引擎
- ✅ `src/services/tips/TipsRegistry.ts` - Tips配置注册表
- ✅ `src/composables/useTips.ts` - 组合式函数

### UI组件

- ✅ `src/components/tips/TipsContainer.vue` - 全局容器
- ✅ `src/components/tips/WelcomeModal.vue` - 欢迎弹窗
- ✅ `src/components/tips/SpotlightGuide.vue` - 高亮引导
- ✅ `src/components/tips/TooltipTip.vue` - 工具提示
- ✅ `src/components/tips/CardTip.vue` - 卡片提示

---

## 🔧 集成步骤

### 第1步：在主布局中添加TipsContainer

修改 `src/layouts/MainLayout.vue`:

```vue
<template>
  <q-layout view="hHh lpR fFf">
    <!-- 现有布局代码... -->
    
    <!-- 添加Tips容器 -->
    <TipsContainer />
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TipsContainer from '@/components/tips/TipsContainer.vue'
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import { getTipsEngine } from '@/services/tips/TipsEngine'

const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

onMounted(() => {
  // 初始化引导状态
  if (authStore.isAuthenticated && authStore.user) {
    onboardingStore.initialize(authStore.user.id.toString())
    
    // 启动Tips引擎
    const engine = getTipsEngine({
      enabled: true,
      autoStart: true,
      debug: import.meta.env.DEV // 开发环境启用调试
    })
  }
})
</script>
```

### 第2步：在需要高亮的元素上添加标记

在各个页面组件中，使用 `data-tip-target` 属性标记目标元素：

#### IP资源池页面 (`src/pages/advanced/ippools/IPPoolPage.vue`):

```vue
<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h5>IP资源池</h5>
      <q-btn
        color="primary"
        label="创建资源池"
        icon="add"
        data-tip-target="create-ippool-btn"
        @click="showCreateDialog"
      />
    </div>
    
    <!-- 资源池列表... -->
  </q-page>
</template>
```

#### 设备页面 (`src/pages/devices/DeviceListPage.vue`):

```vue
<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h5>我的设备</h5>
      <q-btn
        color="primary"
        label="添加设备"
        icon="add"
        data-tip-target="add-device-btn"
        @click="showAddDialog"
      />
    </div>
    
    <!-- 设备列表... -->
  </q-page>
</template>
```

#### 连接管理页面 (新建 `src/pages/connections/ConnectionsPage.vue`):

```vue
<template>
  <q-page padding>
    <q-tabs v-model="tab" data-tip-target="connections-tabs">
      <q-tab name="all" label="全部" />
      <q-tab name="active" label="活跃" />
      <q-tab name="requests" label="待批准" />
    </q-tabs>
    
    <!-- 连接列表... -->
  </q-page>
</template>
```

#### 好友页面 (`src/pages/friends/FriendsPage.vue`):

```vue
<template>
  <q-page padding>
    <q-list data-tip-target="friends-list">
      <!-- 好友列表... -->
    </q-list>
  </q-page>
</template>
```

### 第3步：在关键事件处标记阶段完成

在创建资源池、添加设备等操作成功后，标记对应阶段完成：

#### IP资源池创建成功后:

```typescript
import { useOnboardingStore } from '@/stores/onboarding'
import { OnboardingStage } from '@/types/tips'

const onboardingStore = useOnboardingStore()

const createIPPool = async (data) => {
  try {
    await api.createIPPool(data)
    
    // 标记阶段完成
    if (!onboardingStore.stages.first_ippool_created) {
      onboardingStore.completeStage(OnboardingStage.CreateIPPool)
    }
    
    // 其他逻辑...
  } catch (error) {
    // 错误处理...
  }
}
```

#### 设备添加成功后:

```typescript
import { useOnboardingStore } from '@/stores/onboarding'
import { useTips } from '@/composables/useTips'
import { OnboardingStage, OnboardingPath } from '@/types/tips'

const onboardingStore = useOnboardingStore()
const { showPathSelection } = useTips()

const addDevice = async (data) => {
  try {
    await api.addDevice(data)
    
    // 第一个设备
    if (!onboardingStore.stages.first_device_added) {
      onboardingStore.completeStage(OnboardingStage.AddFirstDevice)
      
      // 显示路径选择
      setTimeout(() => {
        showPathSelection()
      }, 1000)
    }
    // 第二个设备（路径A）
    else if (
      onboardingStore.selectedPath === OnboardingPath.DeviceFirst &&
      !onboardingStore.stages.second_device_added
    ) {
      onboardingStore.completeStage(OnboardingStage.AddSecondDevice)
    }
    
    // 其他逻辑...
  } catch (error) {
    // 错误处理...
  }
}
```

### 第4步：在App初始化时检查引导状态

在 `src/App.vue` 或主入口文件中：

```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'
import { getTipsEngine } from '@/services/tips/TipsEngine'

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

// 监听认证状态
watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated && authStore.user) {
      // 初始化引导
      onboardingStore.initialize(authStore.user.id.toString())
      
      // 如果是首次使用，自动开始引导
      if (!onboardingStore.isStarted && !onboardingStore.completed) {
        onboardingStore.start()
        
        // 跳转到Dashboard
        router.push('/app/dashboard')
      }
    }
  },
  { immediate: true }
)
</script>
```

---

## 🎯 使用示例

### 在组件中使用useTips

```vue
<template>
  <q-page>
    <!-- 显示进度 -->
    <q-linear-progress
      v-if="isOnboarding"
      :value="progress / 100"
      color="primary"
    />
    
    <!-- 页面内容 -->
    <div>
      <p>当前阶段: {{ currentStage }}</p>
      <p>进度: {{ progress }}%</p>
      
      <q-btn
        v-if="isOnboarding"
        label="跳过引导"
        @click="skipAll"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useTips } from '@/composables/useTips'

const {
  isOnboarding,
  progress,
  currentStage,
  skipAll
} = useTips()
</script>
```

### 监听Tips事件

```typescript
import { getTipsEngine } from '@/services/tips/TipsEngine'

const engine = getTipsEngine()

// 监听阶段完成
engine.on('stage:complete', (stage) => {
  console.log('阶段完成:', stage)
  
  // 发送埋点
  trackEvent('onboarding_stage_complete', { stage })
})

// 监听引导完成
engine.on('onboarding:complete', () => {
  console.log('引导完成！')
  
  // 显示祝贺消息
  $q.notify({
    type: 'positive',
    message: '恭喜完成引导！'
  })
})

// 监听路径选择
engine.on('path:select', (path) => {
  console.log('选择路径:', path)
  
  trackEvent('onboarding_path_selected', { path })
})
```

### 手动触发Tips

```typescript
import { getTipsEngine } from '@/services/tips/TipsEngine'
import { getTipById } from '@/services/tips/TipsRegistry'

const engine = getTipsEngine()

// 显示特定Tip
const tip = getTipById('create_ippool')
if (tip) {
  engine.showTip(tip)
}

// 显示路径选择
engine.showPathSelection()
```

### 调试和测试

```typescript
import { useOnboardingStore } from '@/stores/onboarding'
import { getTipsEngine, resetTipsEngine } from '@/services/tips/TipsEngine'

// 重置引导（开发环境）
if (import.meta.env.DEV) {
  window.resetOnboarding = () => {
    const store = useOnboardingStore()
    store.reset()
    resetTipsEngine()
    location.reload()
  }
  
  // 导出状态（调试）
  window.exportOnboardingState = () => {
    const store = useOnboardingStore()
    console.log(JSON.stringify(store.exportState(), null, 2))
  }
}
```

---

## ✅ 验收检查清单

### 基础功能
- [ ] TipsContainer在MainLayout中正确渲染
- [ ] 首次登录显示欢迎弹窗
- [ ] 欢迎弹窗可以正常关闭
- [ ] 引导状态正确保存到LocalStorage
- [ ] 刷新页面后状态正确恢复

### 高亮引导
- [ ] IP资源池按钮正确高亮
- [ ] 设备添加按钮正确高亮
- [ ] 高亮遮罩正确显示
- [ ] Tips气泡定位准确
- [ ] 滚动和窗口大小变化时位置更新

### 路径选择
- [ ] 添加第一个设备后显示路径选择
- [ ] 有邀请人时显示路径B选项
- [ ] 无邀请人时只显示路径A
- [ ] 选择路径后正确触发对应阶段

### 状态管理
- [ ] 各阶段完成状态正确记录
- [ ] 进度百分比正确计算
- [ ] 跳过引导功能正常
- [ ] 重置引导功能正常

### 响应式
- [ ] 桌面端显示正常
- [ ] 移动端显示正常
- [ ] 不同屏幕尺寸适配良好

### 性能
- [ ] Tips显示延迟<500ms
- [ ] 无明显内存泄漏
- [ ] 状态保存不阻塞UI

---

## 🐛 常见问题

### Q: Tips不显示？

**检查项**:
1. TipsContainer是否在MainLayout中添加？
2. Tips引擎是否启动？（检查控制台日志）
3. 目标元素是否有`data-tip-target`属性？
4. 引导状态是否已完成？（可能需要重置）

### Q: 高亮定位不准确？

**解决方案**:
1. 确保目标元素在DOM中已渲染
2. 检查目标元素的`position`属性
3. 尝试增加trigger的delay时间

### Q: 状态不同步？

**解决方案**:
1. 检查LocalStorage是否被清除
2. 检查userId是否正确传递
3. 尝试清除浏览器缓存

### Q: 暗色主题下样式异常？

**解决方案**:
1. 检查CSS变量是否正确定义
2. 补充`.body--dark`样式规则

---

## 📝 下一步

1. **测试**: 完整走一遍引导流程
2. **优化**: 根据测试结果调整文案和时序
3. **埋点**: 添加数据追踪
4. **文档**: 补充用户帮助文档

---

**创建时间**: 2026-01-06  
**版本**: v1.0  
**状态**: Phase 1 完成 ✅
