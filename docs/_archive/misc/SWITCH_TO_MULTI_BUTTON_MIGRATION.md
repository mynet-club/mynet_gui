# Switch到Multi-Button控件迁移记录

## 迁移原因

用户指出：对于使用字符串值（如"on"/"off"）而不是0/1的参数，multi-button比switch更合适，UI表现更一致和直观。

## 迁移的参数

将以下8个参数从`switch`类型改为`multi-button`类型：

### 基础配置
1. **multi_socket**（多路复用）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'off'`

### 专家配置  
2. **direct_forwarding**（直接转发）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'on'`

3. **standard_forwarding**（标准中继转发）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'on'`

4. **address_secure**（地址安全）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'on'`

5. **ipv4_only**（仅IPv4）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'off'`

6. **ipv6_only**（仅IPv6）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'off'`

7. **forward**（转发功能）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'on'`

8. **daemon**（守护进程）
   - 选项：`'off': '禁用'`, `'on': '启用'`
   - 默认值：`'on'`

## 配置变更细节

### 修改前（switch）
```typescript
multi_socket: {
  name: '多路复用',
  type: 'switch',
  default: 'off',
  options: {
    'on': '启用',
    'off': '禁用'
  }
}
```

### 修改后（multi-button）
```typescript  
multi_socket: {
  name: '多路复用',
  type: 'multi-button',
  default: 'off',
  options: {
    'off': '禁用',
    'on': '启用'
  }
}
```

### 关键差异
1. **类型**：`'switch'` → `'multi-button'`
2. **选项顺序**：调整为 `'off'` 在前，`'on'` 在后（更符合禁用/启用的逻辑顺序）

## UI渲染变化

### Switch渲染（旧）
```vue
<q-toggle
  v-model="formData[key]"
  :true-value="Object.keys(param.options)[0]"
  :false-value="Object.keys(param.options)[1]"
  :label="param.options[formData[key]]"
/>
```

### Multi-Button渲染（新）
```vue
<q-btn-group outline>
  <q-btn
    v-for="(optionLabel, optionValue) in param.options"
    :key="optionValue"
    :label="optionLabel"
    :color="formData[key] === optionValue ? 'primary' : 'grey-7'"
    :outline="formData[key] !== optionValue"
    @click="formData[key] = optionValue"
  />
</q-btn-group>
```

## 数据处理优化

### 数据验证更新
```javascript
// 对multi-button类型进行验证
if (param.type === 'multi-button' && param.options) {
  const validOptions = Object.keys(param.options)
  if (validOptions.includes(String(value))) {
    convertedValue = String(value)
  } else {
    convertedValue = param.default || validOptions[0] // 使用第一个选项作为fallback
  }
}
```

## 优势分析

### UI一致性
- ✅ 所有选项类控件都使用统一的multi-button样式
- ✅ 视觉表现更清晰，用户一眼就能看到所有可选项
- ✅ 避免了switch控件在字符串值场景下的语义模糊

### 用户体验
- ✅ 点击区域更大，操作更方便
- ✅ 当前选中状态更明显（高亮显示）
- ✅ 所有选项都可见，无需理解switch的true/false映射

### 开发维护
- ✅ 统一的控件类型，减少特殊处理逻辑
- ✅ 更容易扩展（如果将来需要添加第三个选项）
- ✅ 数据处理逻辑更简单统一

## 影响范围

### 前端
- ✅ `/src/config/vpnConfig.ts`：参数类型定义更新
- ✅ `/src/pages/node/edit/NodeConfigPage.vue`：移除switch特殊处理逻辑
- ✅ UI渲染：自动使用multi-button组件

### 后端兼容性
- ✅ 数据格式不变：仍然是字符串值（"on"/"off"）
- ✅ API接口不变：无需修改后端代码
- ✅ 存储格式不变：配置文件格式保持一致

## 测试验证

### 功能测试
1. ✅ 所有原switch参数现在显示为button group
2. ✅ 点击切换功能正常
3. ✅ 数据保存和加载正确
4. ✅ 默认值显示正确

### 兼容性测试
1. ✅ 现有配置数据正常加载
2. ✅ API数据格式保持兼容
3. ✅ 配置预览显示正确

## 版本信息
- 迁移日期：2025年8月31日
- 影响版本：当前开发版本  
- 迁移类型：UI优化，向后兼容
