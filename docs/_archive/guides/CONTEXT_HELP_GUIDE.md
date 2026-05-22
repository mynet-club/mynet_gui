# ContextHelp 上下文帮助组件使用指南

## 组件概述

`ContextHelp` 是一个轻量级的上下文帮助组件，在操作或字段旁边显示"?"图标，点击弹出帮助信息。

## 特点

- ✅ 非侵入式，不打断用户操作
- ✅ 就近显示，即时帮助
- ✅ 两种模式：Popover（简短）/ Dialog（详细）
- ✅ 支持 HTML 内容和插槽
- ✅ 可选择性查看

## 基础用法

### 1. Popover 模式（推荐）- 简短帮助

```vue
<template>
  <div class="form-field">
    <label>
      IP 地址段 
      <ContextHelp
        tooltip="点击查看 IP 地址段说明"
        title="IP 地址段格式"
        content="<p>使用 CIDR 格式，如：<code>10.0.0.0/24</code></p>
                 <p>常用配置：</p>
                 <ul>
                   <li>/24 = 254 个地址</li>
                   <li>/16 = 65534 个地址</li>
                 </ul>"
      />
    </label>
    <q-input v-model="ipRange" />
  </div>
</template>

<script setup>
import ContextHelp from '@/components/common/ContextHelp.vue'
</script>
```

### 2. Dialog 模式 - 详细帮助

```vue
<template>
  <div class="card-header">
    <div class="card-title">
      路由配置
      <ContextHelp
        mode="dialog"
        title="路由配置说明"
        tooltip="点击查看详细的路由配置帮助"
        :content="routeHelpContent"
        link="/docs/routing"
        linkText="查看完整文档"
      />
    </div>
  </div>
</template>

<script setup>
import ContextHelp from '@/components/common/ContextHelp.vue'

const routeHelpContent = `
  <p><strong>什么是路由？</strong></p>
  <p>路由定义了设备之间如何连接和通信...</p>
  <p><strong>配置步骤：</strong></p>
  <ol>
    <li>选择源设备</li>
    <li>选择目标设备</li>
    <li>设置连接参数</li>
  </ol>
`
</script>
```

### 3. 使用插槽 - 自定义内容

```vue
<template>
  <ContextHelp title="高级选项">
    <div class="custom-help">
      <p>这里可以放任意自定义内容</p>
      <q-list dense>
        <q-item>
          <q-item-section>选项 1</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>选项 2</q-item-section>
        </q-item>
      </q-list>
    </div>
  </ContextHelp>
</template>
```

## 实际应用场景

### 场景 1: 表单字段帮助

```vue
<template>
  <q-form class="q-gutter-md">
    <!-- IP Pool 名称 -->
    <q-input 
      v-model="form.name" 
      label="资源池名称"
    >
      <template #append>
        <ContextHelp
          tooltip="资源池命名建议"
          content="<p>建议使用有意义的名称，如：</p>
                   <ul>
                     <li>办公网络</li>
                     <li>家庭设备</li>
                     <li>测试环境</li>
                   </ul>"
        />
      </template>
    </q-input>
    
    <!-- CIDR -->
    <q-input 
      v-model="form.cidr" 
      label="IP 地址段"
    >
      <template #append>
        <ContextHelp
          title="CIDR 格式说明"
          content="<p>使用 CIDR 表示法：<code>IP地址/子网掩码位数</code></p>
                   <p><strong>示例：</strong></p>
                   <ul>
                     <li><code>10.0.0.0/24</code> - 254个可用地址</li>
                     <li><code>192.168.1.0/16</code> - 65534个可用地址</li>
                   </ul>
                   <p class='text-caption text-warning'>⚠️ 避免与本地网络冲突</p>"
        />
      </template>
    </q-input>
    
    <!-- Listen Port -->
    <q-input 
      v-model.number="form.listenPort" 
      type="number"
      label="监听端口"
    >
      <template #append>
        <ContextHelp
          tooltip="WireGuard 监听端口"
          content="<p>WireGuard 使用的 UDP 端口</p>
                   <ul>
                     <li>默认：51820</li>
                     <li>范围：1024-65535</li>
                     <li>确保端口未被占用</li>
                   </ul>"
        />
      </template>
    </q-input>
  </q-form>
</template>
```

### 场景 2: 按钮旁边的操作说明

```vue
<template>
  <div class="actions">
    <q-btn 
      color="primary" 
      label="生成密钥"
      @click="generateKey"
    />
    <ContextHelp
      tooltip="什么是密钥生成？"
      title="密钥生成说明"
      mode="dialog"
      content="<p><strong>密钥生成方式：</strong></p>
               <p>1. <strong>服务端生成</strong>（推荐）</p>
               <ul>
                 <li>安全性更高</li>
                 <li>无需客户端操作</li>
                 <li>适合批量创建</li>
               </ul>
               <p>2. <strong>上传公钥</strong></p>
               <ul>
                 <li>使用已有密钥对</li>
                 <li>更灵活的密钥管理</li>
               </ul>"
    />
  </div>
</template>
```

### 场景 3: 卡片标题说明

```vue
<template>
  <q-card class="standard-card">
    <q-card-section class="card-header">
      <div class="card-title">
        <q-icon name="router" size="18px" />
        设备列表
        <ContextHelp
          size="14px"
          tooltip="查看设备列表说明"
          content="<p>这里显示你添加的所有设备</p>
                   <p><strong>设备状态：</strong></p>
                   <ul>
                     <li>🟢 在线 - 设备正常连接</li>
                     <li>🔴 离线 - 设备未连接</li>
                     <li>⚠️ 异常 - 连接不稳定</li>
                   </ul>"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
```

### 场景 4: 表格列头说明

```vue
<template>
  <q-table :columns="columns">
    <template #header="props">
      <q-tr :props="props">
        <q-th key="name">
          设备名称
          <ContextHelp 
            size="14px"
            tooltip="设备名称用于识别不同的设备"
          />
        </q-th>
        <q-th key="status">
          在线状态
          <ContextHelp 
            size="14px"
            tooltip="最后心跳时间决定在线状态"
            content="<p>超过 5 分钟未收到心跳即为离线</p>"
          />
        </q-th>
      </q-tr>
    </template>
  </q-table>
</template>
```

## Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 帮助标题 |
| `content` | `string` | - | 帮助内容（支持 HTML） |
| `tooltip` | `string` | - | 悬停提示文字 |
| `link` | `string` | - | "了解更多"链接 |
| `linkText` | `string` | `'了解更多'` | 链接文本 |
| `mode` | `'popover' \| 'dialog'` | `'popover'` | 显示模式 |
| `icon` | `string` | `'help_outline'` | 图标名称 |
| `size` | `string` | `'16px'` | 图标大小 |
| `color` | `string` | `'grey-6'` | 图标颜色 |
| `disableTooltip` | `boolean` | `false` | 禁用悬停提示 |

## 模式选择指南

### Popover 模式（默认）
适用于：
- ✅ 简短说明（3-5 行）
- ✅ 列表形式的要点
- ✅ 快速参考信息
- ✅ 表单字段帮助

### Dialog 模式
适用于：
- ✅ 详细说明文档
- ✅ 多个章节的内容
- ✅ 包含图片或复杂布局
- ✅ 需要"了解更多"链接

## 样式自定义

### 自定义图标

```vue
<ContextHelp
  icon="info"
  color="primary"
  size="18px"
/>
```

### 自定义位置（内联）

```vue
<span class="inline-help">
  某个概念
  <ContextHelp 
    size="14px" 
    style="vertical-align: middle; margin-left: 4px;"
  />
</span>
```

## 与 Tips 系统的对比

| 特性 | ContextHelp | Tips 系统 |
|------|-------------|-----------|
| **主动性** | 被动，用户点击 | 主动，自动弹出 |
| **位置** | 就近显示 | 固定位置/遮罩 |
| **内容** | 简短操作帮助 | 完整引导流程 |
| **使用场景** | 字段说明、操作提示 | 首次引导、功能介绍 |
| **干扰程度** | 零干扰 | 有一定打断性 |

## 最佳实践

### ✅ 推荐做法

1. **简洁明了**
   ```vue
   <ContextHelp
     content="<p>端口范围：1024-65535</p>"
   />
   ```

2. **关键信息加粗**
   ```vue
   content="<p><strong>重要：</strong>此操作不可撤销</p>"
   ```

3. **使用列表**
   ```vue
   content="<ul>
     <li>选项 1</li>
     <li>选项 2</li>
   </ul>"
   ```

4. **提供示例**
   ```vue
   content="<p>示例：<code>10.0.0.0/24</code></p>"
   ```

### ❌ 避免做法

1. ❌ 内容过长（超过 10 行） → 改用 Dialog 模式
2. ❌ 复制字段 label → 提供额外信息
3. ❌ 营销化语言 → 使用专业术语
4. ❌ 所有字段都加帮助 → 仅在复杂概念处使用

## 迁移现有帮助

如果你的代码中有这样的注释或提示：

```vue
<!-- 旧方式：注释 -->
<q-input label="CIDR" /> <!-- 格式：10.0.0.0/24 -->

<!-- 新方式：ContextHelp -->
<q-input label="CIDR">
  <template #append>
    <ContextHelp content="<p>格式：<code>10.0.0.0/24</code></p>" />
  </template>
</q-input>
```

## 总结

ContextHelp 组件用于：
- 📍 **位置**：操作旁边、字段附近
- 🎯 **目的**：即时解答具体问题
- 📝 **内容**：简短、精准的操作指导
- 👆 **交互**：用户主动点击查看
- 🎨 **风格**：克制、专业、非营销化

与 Tips 系统配合使用，形成完整的帮助体系。
