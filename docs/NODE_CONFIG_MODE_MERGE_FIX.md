# 节点配置模式切换数据合并修复报告

## 问题描述

在基本模式和专家模式之间切换时，保存时只提交当前模式的参数，这会覆盖另一个模式的配置，而不是合并两种模式的参数。

## 问题分析

### 原有实现问题

1. **数据覆盖**：模式切换时会调用 `initializeFormData()` 重新初始化表单，丢失另一个模式的数据
2. **单模式保存**：保存时只提交 `formData.value`，即当前模式的配置
3. **数据丢失**：切换模式后，之前模式修改的配置会丢失

### 原有代码逻辑

```typescript
// 模式切换时重新初始化（问题所在）
watch([vpnType, configMode], () => {
  initializeFormData() // 这会丢失另一个模式的数据
})

// 保存时只保存当前模式
const saveData = {
  basic_config: { ...formData.value } // 只保存当前模式
}
```

## 解决方案

### 1. 分离存储两种模式的数据

```typescript
// 分别存储基本模式和专家模式的配置数据
const basicModeData = ref<Record<string, any>>({})
const expertModeData = ref<Record<string, any>>({})
const originalBasicModeData = ref<Record<string, any>>({})
const originalExpertModeData = ref<Record<string, any>>({})
```

### 2. 实现智能模式切换

```typescript
// 切换模式时保存当前模式的数据并加载目标模式的数据
const switchConfigMode = (newMode: 'base' | 'expert') => {
  // 保存当前模式的数据
  if (configMode.value === 'base') {
    basicModeData.value = { ...formData.value }
  } else {
    expertModeData.value = { ...formData.value }
  }
  
  // 切换到新模式
  configMode.value = newMode
  
  // 加载目标模式的数据
  if (newMode === 'base') {
    formData.value = { ...basicModeData.value }
  } else {
    formData.value = { ...expertModeData.value }
  }
  
  // 如果目标模式还没有数据，初始化默认值
  if (Object.keys(formData.value).length === 0) {
    initializeFormData()
  }
}
```

### 3. 改进数据加载逻辑

```typescript
// 从API加载时同时处理两种模式的数据
if (customConfig && customConfig.basic_config) {
  const filteredParams = Object.fromEntries(
    Object.entries(customConfig.basic_config).filter(([key]) => !networkFields.includes(key))
  )
  
  // 如果有expert_config，也加载专家模式的配置
  const expertParams = customConfig.expert_config ? 
    Object.fromEntries(
      Object.entries(customConfig.expert_config).filter(([key]) => !networkFields.includes(key))
    ) : {}
  
  // 分别存储两种模式的数据
  basicModeData.value = { ...basicModeData.value, ...filteredParams }
  expertModeData.value = { ...expertModeData.value, ...expertParams }
  
  // 根据当前模式设置表单数据
  if (configMode.value === 'base') {
    formData.value = { ...basicModeData.value }
  } else {
    formData.value = { ...expertModeData.value }
  }
}
```

### 4. 实现数据合并保存

```typescript
const onSubmit = async () => {
  // 保存当前模式的数据
  if (configMode.value === 'base') {
    basicModeData.value = { ...formData.value }
  } else {
    expertModeData.value = { ...formData.value }
  }
  
  // 合并两种模式的配置数据
  const mergedBasicConfig = { ...basicModeData.value }
  const mergedExpertConfig = { ...expertModeData.value }
  
  // 保存时提交合并后的数据
  const saveData: ConfigUpdateRequest = {
    vpn_type: vpnType.value,
    vpn_version: 'merged',
    config_mode: configMode.value as 'basic' | 'expert',
    basic_config: mergedBasicConfig, // 基本模式的所有配置
    network: { /* 网络配置 */ }
  }
  
  // 如果有专家模式的配置，添加到保存数据中
  if (Object.keys(mergedExpertConfig).length > 0) {
    saveData.expert_config = mergedExpertConfig
  }
  
  await nodeConfigService.updateNodeConfig(nodeId.value, saveData)
}
```

### 5. 优化变化检测

```typescript
const hasChanges = computed(() => {
  // 检查当前模式是否有变化
  const currentModeChanged = JSON.stringify(formData.value) !== JSON.stringify(originalFormData.value)
  
  // 检查基本模式是否有变化
  const basicModeChanged = JSON.stringify(basicModeData.value) !== JSON.stringify(originalBasicModeData.value)
  
  // 检查专家模式是否有变化
  const expertModeChanged = JSON.stringify(expertModeData.value) !== JSON.stringify(originalExpertModeData.value)
  
  return currentModeChanged || basicModeChanged || expertModeChanged
})
```

### 6. 改进 Watch 监听器

```typescript
// 分离VPN类型和配置模式的监听
watch([vpnType], () => {
  // VPN类型变化时重新初始化所有数据
  initializeFormData()
})

// 配置模式变化时使用智能切换
watch(configMode, (newMode, oldMode) => {
  if (oldMode && newMode !== oldMode) {
    switchConfigMode(newMode)
  }
})
```

## 数据流程图

```
用户操作流程：
1. 加载页面 → 从API获取basic_config和expert_config
2. 初始化 → basicModeData和expertModeData分别存储
3. 模式切换 → switchConfigMode保存当前模式数据，切换到目标模式
4. 编辑配置 → 在当前模式的formData中编辑
5. 保存配置 → 合并basicModeData和expertModeData后提交

数据存储结构：
- formData: 当前模式的表单数据
- basicModeData: 基本模式的所有配置
- expertModeData: 专家模式的所有配置
- originalXXXData: 对应的原始数据（用于检测变化）
```

## 界面交互

### 模式切换按钮

```vue
<q-btn-toggle
  v-model="configMode"
  :options="modeOptions"
  @update:model-value="(newMode) => switchConfigMode(newMode)"
/>
```

用户点击模式切换按钮时：
1. 自动保存当前模式的表单数据
2. 切换到目标模式
3. 加载目标模式的已有数据
4. 如果目标模式没有数据，使用默认值初始化

## 测试场景

### 场景1：基本配置 → 专家配置
1. 在基本模式设置 `mtu=1500`, `daemon=on`
2. 切换到专家模式，设置 `log_level=debug`
3. 保存配置
4. **结果**：两种模式的配置都会被保存

### 场景2：专家配置 → 基本配置
1. 在专家模式设置 `log_level=debug`, `keep_alive=25`
2. 切换到基本模式，修改 `mtu=1400`
3. 保存配置
4. **结果**：基本模式的新值和专家模式的配置都会被保存

### 场景3：重复切换
1. 基本模式：设置 `mtu=1500`
2. 切换到专家模式：设置 `log_level=debug`
3. 切换回基本模式：`mtu=1500` 仍然存在
4. 修改 `mtu=1400`
5. 保存配置
6. **结果**：`mtu=1400` 和 `log_level=debug` 都会被保存

## 修复结果

- ✅ **数据保持**：模式切换时不再丢失另一个模式的数据
- ✅ **合并保存**：保存时合并两种模式的所有配置
- ✅ **智能切换**：切换模式时自动保存当前数据并加载目标数据
- ✅ **变化检测**：正确检测两种模式的数据变化
- ✅ **用户体验**：无缝的模式切换体验，不丢失用户输入

## 相关文件

- `/src/pages/node/edit/NodeConfigPage.vue` - 主要修复文件
- `/src/types/nodeConfig.ts` - 类型定义

## 注意事项

1. **向后兼容**：保留了原有的 `formData` 和 `originalFormData`，确保其他代码不受影响
2. **类型安全**：正确处理 `expert_config` 的可选性
3. **性能优化**：只在必要时初始化默认值，避免重复计算
4. **日志输出**：添加详细日志便于调试和验证数据流程
