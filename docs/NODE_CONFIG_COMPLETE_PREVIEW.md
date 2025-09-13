# 节点配置完整预览和导出功能实现

## 🎯 功能目标

实现配置预览和导出功能显示完整的节点配置内容，不受当前编辑模式限制，按照"基本配置在前，专家配置在后"的顺序展示。

## 📊 功能特性

### 1. 完整配置预览
- **统一显示**：无论当前处于基本模式还是专家模式，预览都显示完整配置
- **分段展示**：基本配置和专家配置分别标识，便于用户理解
- **实时更新**：配置修改后预览内容实时更新

### 2. 完整配置导出 
- **完整内容**：导出文件包含所有配置参数
- **格式正确**：支持GNB和WireGuard的标准配置格式
- **文件命名**：智能的文件命名规则

## 🔧 实现方案

### 1. 重构配置预览逻辑

**新的 `configPreview` 计算属性：**
```typescript
const configPreview = computed(() => {
  const versionConfig = currentVersionConfig.value
  if (!versionConfig || !formData.value) return '# 请填写配置参数'
  
  const lines: string[] = []
  
  if (vpnType.value === 'gnb') {
    lines.push('# GNB 节点配置文件 (完整配置)')
    lines.push(`# 生成时间: ${new Date().toLocaleString()}`)
    lines.push('')
    
    // 基本配置部分
    lines.push('# ==================== 基本配置 ====================')
    const baseConfig = versionConfig.modes.base
    if (baseConfig) {
      renderConfigSection(lines, baseConfig.parameters, '基本配置')
    }
    
    // 专家配置部分
    lines.push('# ==================== 专家配置 ====================')
    const expertConfig = versionConfig.modes.expert
    if (expertConfig) {
      renderConfigSection(lines, expertConfig.parameters, '专家配置')
    }
  }
  
  return lines.join('\n')
})
```

### 2. 配置段渲染函数

**`renderConfigSection` 辅助函数：**
```typescript
const renderConfigSection = (
  lines: string[], 
  parameters: Record<string, VPNConfigParameter>, 
  sectionName: string, 
  isWireGuard = false
) => {
  let hasContent = false
  
  Object.entries(parameters).forEach(([key, param]) => {
    // 跳过网络字段（在网络配置页面管理）
    if (networkFields.includes(key)) return
    
    const value = formData.value[key]
    if (value !== undefined && value !== null && value !== '') {
      hasContent = true
      lines.push(`# ${param.description || param.name}`)
      
      if (isWireGuard) {
        lines.push(`${key} = ${value}`)
      } else {
        lines.push(`${key}=${value}`)
      }
      lines.push('')
    } else if (param.required || param.default !== undefined) {
      // 显示必填项或有默认值的项
      hasContent = true
      const displayValue = value || param.default || ''
      lines.push(`# ${param.description || param.name} ${param.required ? '(必填)' : '(可选)'}`)
      
      if (isWireGuard) {
        lines.push(`${key} = ${displayValue}`)
      } else {
        lines.push(`${key}=${displayValue}`)
      }
      lines.push('')
    }
  })
  
  if (!hasContent) {
    lines.push(`# ${sectionName}暂无配置内容`)
    lines.push('')
  }
}
```

## 📋 配置格式支持

### 1. GNB 格式
```bash
# GNB 节点配置文件 (完整配置)
# 生成时间: 2025-01-25 14:30:00

# ==================== 基本配置 ====================
# 节点名称
node_name=MyNode01

# 监听端口
port=9999

# ==================== 专家配置 ====================
# 高级网络设置
mtu=1400

# 加密算法
crypto=aes256
```

### 2. WireGuard 格式
```ini
# WireGuard 节点配置文件 (完整配置)
# 生成时间: 2025-01-25 14:30:00

[Interface]
# ==================== 基本配置 ====================
# 私钥
PrivateKey = <generated_private_key>

# 监听端口
ListenPort = 51820

# ==================== 专家配置 ====================
# MTU设置
MTU = 1420

# DNS设置
DNS = 8.8.8.8

[Peer]
# Peer配置需要根据具体需求设置
# PublicKey = <对端公钥>
# Endpoint = <对端地址:端口>
# AllowedIPs = <允许的IP范围>
```

## 🎨 用户界面改进

### 1. 预览面板标题更新
```vue
<div class="row items-center justify-between q-mb-md">
  <div class="text-h6">完整配置预览</div>
  <div class="text-caption text-grey-6">基本配置 + 专家配置</div>
  <q-btn color="grey-7" flat round icon="content_copy" @click="copyConfig">
    <q-tooltip>复制配置</q-tooltip>
  </q-btn>
</div>
```

### 2. 智能参数显示
- **有值参数**：直接显示当前值
- **必填空参数**：显示默认值并标记"(必填)"
- **可选参数**：显示默认值并标记"(可选)"
- **无内容段落**：显示"暂无配置内容"提示

## 🔄 功能流程

### 1. 配置预览流程
```
用户修改配置 → 触发计算属性更新 → 重新渲染预览内容
          ↓
     分别处理基本配置和专家配置
          ↓
     按格式生成完整配置文件内容
          ↓
     在预览面板中显示格式化内容
```

### 2. 配置导出流程
```
用户点击导出 → 获取完整配置预览内容 → 创建Blob对象
         ↓
    生成下载链接 → 触发文件下载 → 清理临时对象
         ↓
    显示成功提示
```

## 📈 优势特点

### 1. 用户体验改进
- ✅ **完整性**：无论在哪个模式下都能看到完整配置
- ✅ **清晰性**：基本配置和专家配置明确分段
- ✅ **实时性**：配置修改立即反映在预览中
- ✅ **便捷性**：一键复制和导出完整配置

### 2. 技术特点
- ✅ **响应式**：使用计算属性实现自动更新
- ✅ **格式支持**：支持多种VPN配置格式
- ✅ **参数过滤**：自动过滤网络配置字段
- ✅ **智能显示**：根据参数类型智能显示内容

### 3. 维护性
- ✅ **模块化**：配置段渲染逻辑独立
- ✅ **可扩展**：容易添加新的配置格式支持
- ✅ **类型安全**：使用TypeScript确保类型安全

## 🧪 测试要点

### 1. 功能测试
- [ ] 基本模式下预览显示完整配置
- [ ] 专家模式下预览显示完整配置
- [ ] 配置修改后预览实时更新
- [ ] 导出功能生成完整配置文件

### 2. 格式测试
- [ ] GNB格式配置正确生成
- [ ] WireGuard格式配置正确生成
- [ ] 参数注释正确显示
- [ ] 分段标题正确显示

### 3. 边界测试
- [ ] 空配置时显示提示信息
- [ ] 必填参数为空时显示默认值
- [ ] 网络字段正确过滤
- [ ] 特殊字符正确处理

## 🎉 预期效果

1. **用户视角**：
   - 始终能看到完整的节点配置内容
   - 清楚地了解基本配置和专家配置的区别
   - 方便地复制和导出完整配置

2. **开发视角**：
   - 代码逻辑更清晰
   - 配置预览功能更完善
   - 用户体验更一致

3. **维护视角**：
   - 减少用户关于"配置不完整"的疑问
   - 提高配置导出的实用性
   - 简化配置文件的管理

---

**实现日期：** 2025-01-25  
**影响文件：** `src/pages/node/edit/NodeConfigPage.vue`  
**功能类型：** 用户体验改进
