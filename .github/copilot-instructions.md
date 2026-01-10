# GitHub Copilot 使用规范 - MyNet 项目

> 项目：MyNet Frontend - 网络管理系统前端应用  
> 技术栈：Vue 3 + TypeScript + Quasar Framework  
> 更新日期：2026-01-10

---

## 📋 项目概述

MyNet 是一个基于 Vue 3 + Quasar Framework 的现代化网络管理系统前端应用，提供节点管理、路由配置、好友社交、服务管理等功能。

### 核心特性
- 🎨 **柔和清新主题**：低对比度、大圆角、柔和色彩
- 🌐 **多语言支持**：中英文国际化 (vue-i18n)
- 🔐 **JWT 认证**：Token 自动刷新机制
- 📱 **响应式设计**：桌面 + 移动端适配
- 🎯 **智能推荐**：基于用户状态的智能引导系统
- 🌓 **主题切换**：亮色/暗色模式

---

## 🏗️ 技术架构

### 技术栈版本
```json
{
  "vue": "^3.4.0",
  "quasar": "^2.14.0",
  "typescript": "^5.0.0",
  "pinia": "^2.1.0",
  "vue-router": "^4.2.0",
  "vue-i18n": "^12.0.0",
  "axios": "^1.6.0",
  "date-fns": "^4.1.0",
  "echarts": "^6.0.0",
  "laravel-echo": "^2.1.6",
  "pusher-js": "^8.4.0"
}
```

### 核心依赖说明
- **Vue 3 Composition API**：所有组件使用 `<script setup>` 语法
- **TypeScript**：严格模式，需要明确类型定义
- **Quasar Framework**：UI 组件库，使用 Quasar CLI
- **Pinia**：状态管理，替代 Vuex
- **Vue I18n**：国际化，所有文本必须使用 `$t()` 包裹
- **Axios**：HTTP 客户端，已配置拦截器
- **date-fns**：日期格式化，使用 `zhCN` locale

---

## 📁 目录结构

```
src/
├── boot/                    # 启动文件 (axios, i18n, router guards 等)
├── components/              # 可复用组件
│   ├── common/             # 通用组件 (StatusDisplay, ContextHelp 等)
│   ├── dashboard/          # Dashboard 组件
│   ├── node/               # 节点相关组件
│   ├── route/              # 路由相关组件
│   ├── social/             # 社交相关组件
│   ├── service/            # 服务相关组件
│   ├── tips/               # Tips 引导系统组件
│   └── zone/               # Zone 区域组件
├── composables/             # 组合式函数 (useNodes, useRoutes 等)
├── layouts/                 # 布局组件
├── pages/                   # 页面组件
├── router/                  # 路由配置
├── services/                # API 服务和业务逻辑
│   ├── api/                # API 调用封装
│   ├── recommendations/    # 智能推荐引擎
│   └── tips/               # Tips 系统核心
├── stores/                  # Pinia 状态管理
├── types/                   # TypeScript 类型定义
├── utils/                   # 工具函数
├── i18n/                    # 国际化资源文件
└── styles/                  # 全局样式
```

---

## 🎨 设计系统

### 柔和清新主题规范

**核心原则**：
1. **低对比度**：避免纯黑纯白，使用柔和灰色调
2. **大圆角**：12-20px，营造柔和感
3. **柔和阴影**：透明度 0.03-0.08，避免生硬
4. **充足间距**：padding/margin 充足，呼吸感强

**CSS 变量**（定义在 `src/css/soft-theme.scss`）：
```scss
// 背景色
--soft-bg-primary: #f5f7fa;      // 主背景
--soft-bg-secondary: #e8ecf1;    // 次级背景
--soft-bg-card: #f8fafc;         // 卡片背景
--soft-bg-hover: #eef2f7;        // 悬停背景

// 文字颜色
--soft-text-primary: #2d3748;    // 主文字 (替代纯黑)
--soft-text-secondary: #718096;  // 次要文字
--soft-text-tertiary: #a0aec0;   // 辅助文字

// 边框
--soft-border-light: #e2e8f0;    // 浅色边框
--soft-border-medium: #cbd5e0;   // 中度边框

// 圆角
--soft-radius-sm: 8px;           // 小圆角
--soft-radius-md: 12px;          // 中等圆角
--soft-radius-lg: 16px;          // 大圆角
--soft-radius-xl: 20px;          // 超大圆角

// 阴影
--soft-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.03);
--soft-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
--soft-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);
```

**深色模式变量**：
```scss
--soft-bg-card-dark: #1e293b;
--soft-border-dark: #334155;
--soft-text-primary-dark: #e2e8f0;
--soft-shadow-lg-dark: 0 10px 15px rgba(0, 0, 0, 0.3);
```

---

## 🧩 组件开发规范

### 1. 组件结构模板

```vue
<template>
  <q-card class="component-name" flat bordered>
    <!-- 内容区域 -->
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * 组件名称
 * 
 * 职责：
 * 1. 功能描述 1
 * 2. 功能描述 2
 * 
 * 使用场景：
 * - 场景 1
 * - 场景 2
 */

interface Props {
  /** 属性说明 */
  propName: string
}

interface Emits {
  (e: 'event-name', payload: Type): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态
const localState = ref('')

// 计算属性
const computedValue = computed(() => {
  return props.propName.toUpperCase()
})

// 方法
const handleAction = () => {
  emit('event-name', localState.value)
}
</script>

<style lang="scss" scoped>
.component-name {
  background: var(--soft-bg-card);
  border-radius: var(--soft-radius-lg);
  border: 1px solid var(--soft-border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: var(--soft-shadow-lg);
    transform: translateY(-2px);
  }
}

// 深色模式
.body--dark {
  .component-name {
    background: var(--soft-bg-card-dark);
    border-color: var(--soft-border-dark);
  }
}
</style>
```

### 2. 卡片组件规范

**参考标准**：`src/components/node/NodeCardContent.vue`

**结构要求**：
```vue
<q-card-section class="card-content">
  <!-- 1. 顶部：标题 + 状态（浅灰背景）-->
  <div class="card-header">
    <div class="title">{{ title }}</div>
    <StatusDisplay :status="status" />
  </div>
  
  <!-- 2. 中间：主要信息（白色背景）-->
  <div class="card-body">
    <div class="info-line">
      <q-icon name="icon" size="20px" />
      <span class="info-value">{{ value }}</span>
    </div>
  </div>
  
  <!-- 3. 底部：辅助信息 + 操作（浅灰背景）-->
  <div class="card-footer">
    <div class="meta-info">...</div>
    <div class="actions">...</div>
  </div>
</q-card-section>
```

**样式模板**：
```scss
.card-content {
  background: var(--soft-bg-card);
  border-radius: var(--soft-radius-lg);
  overflow: hidden;
  
  .card-header {
    padding: 1rem 1.5rem;
    background: var(--soft-bg-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-body {
    padding: 1.5rem;
    background: var(--soft-bg-card);
    
    .info-line {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      
      .info-value {
        font-size: 0.875rem;
        color: var(--soft-text-secondary);
      }
    }
  }
  
  .card-footer {
    padding: 1rem 1.5rem;
    background: var(--soft-bg-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```

### 3. 表单组件规范

**参考**：`FORM_STYLE_GUIDE.md`

**认证表单**（纯 Placeholder）：
```vue
<q-input
  v-model="form.email"
  :placeholder="$t('auth.email')"
  type="email"
  outlined
  class="form-field"
>
  <template v-slot:prepend>
    <q-icon name="email" />
  </template>
</q-input>
```

**管理表单**（Label + Placeholder）：
```vue
<q-input
  v-model="form.nodeName"
  :label="$t('node.name')"
  :placeholder="$t('node.namePlaceholder')"
  outlined
  class="form-field"
/>
```

**必填字段标识**：
```vue
<q-input
  v-model="form.required"
  :label="$t('field.label')"
  outlined
  :rules="[val => !!val || $t('validation.required')]"
>
  <template v-slot:label>
    {{ $t('field.label') }} <span class="text-negative">*</span>
  </template>
</q-input>
```

---

## 🔧 开发规范

### 1. TypeScript 规范

**必须明确类型**：
```typescript
// ✅ 正确
interface Node {
  id: number
  name: string
  status: NodeStatus
}

const node: Node = { id: 1, name: 'Node1', status: 'online' }

// ❌ 错误
const node = { id: 1, name: 'Node1' }  // 缺少类型
```

**Props 和 Emits 类型化**：
```typescript
interface Props {
  /** 节点 ID */
  nodeId: number
  /** 是否只读 */
  readonly?: boolean
}

interface Emits {
  (e: 'update', node: Node): void
  (e: 'delete', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
```

**避免 `any`**：
```typescript
// ❌ 错误
const data: any = response.data

// ✅ 正确
interface ApiResponse {
  data: Node[]
  total: number
}
const response: ApiResponse = await api.getNodes()
```

### 2. 国际化规范

**所有文本必须使用 `$t()`**：
```vue
<!-- ❌ 错误 -->
<q-btn label="删除" />

<!-- ✅ 正确 -->
<q-btn :label="$t('common.delete')" />
```

**动态参数**：
```vue
<span>{{ $t('node.summary', { count: nodeCount }) }}</span>
```

**复数形式**：
```vue
{{ $tc('node.count', nodeCount, { count: nodeCount }) }}
```

**i18n 文件结构**：
```
i18n/
├── zh-CN/
│   ├── index.ts           # 总入口
│   ├── common.ts          # 通用词汇
│   ├── auth.ts            # 认证相关
│   ├── node.ts            # 节点相关
│   ├── route.ts           # 路由相关
│   ├── social.ts          # 社交相关
│   └── service.ts         # 服务相关
└── en-US/
    └── ... (同上)
```

### 3. 状态管理规范

**使用 Pinia Store**：
```typescript
// stores/nodeStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node } from '../types/node'

export const useNodeStore = defineStore('node', () => {
  // 状态
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  
  // 计算属性
  const onlineNodes = computed(() => {
    return nodes.value.filter(n => n.status === 'online')
  })
  
  // 方法
  const fetchNodes = async () => {
    loading.value = true
    try {
      const response = await api.getNodes()
      nodes.value = response.data
    } finally {
      loading.value = false
    }
  }
  
  return {
    nodes,
    loading,
    onlineNodes,
    fetchNodes
  }
})
```

### 4. API 调用规范

**使用 Composables**：
```typescript
// composables/useNodes.ts
import { ref } from 'vue'
import type { Node } from '../types/node'
import { nodeApi } from '../services/api/nodeApi'

export function useNodes() {
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const loadNodes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await nodeApi.getNodes()
      nodes.value = response.data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  
  return {
    nodes,
    loading,
    error,
    loadNodes
  }
}
```

**API 服务封装**：
```typescript
// services/api/nodeApi.ts
import { api } from '../../boot/axios'
import type { Node, CreateNodeDto } from '../../types/node'

export const nodeApi = {
  async getNodes(): Promise<{ data: Node[] }> {
    return api.get('/api/v1/nodes')
  },
  
  async createNode(data: CreateNodeDto): Promise<{ data: Node }> {
    return api.post('/api/v1/nodes', data)
  },
  
  async updateNode(id: number, data: Partial<Node>): Promise<{ data: Node }> {
    return api.put(`/api/v1/nodes/${id}`, data)
  },
  
  async deleteNode(id: number): Promise<void> {
    return api.delete(`/api/v1/nodes/${id}`)
  }
}
```

### 5. 路由规范

**路由定义**：
```typescript
// router/routes.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { 
          title: 'Dashboard',
          icon: 'dashboard'
        }
      }
    ]
  }
]
```

**路由导航**：
```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// ✅ 使用命名路由
router.push({ name: 'node-detail', params: { id: 123 } })

// ✅ 带查询参数
router.push({ name: 'nodes', query: { status: 'online' } })
```

---

## 🎯 智能推荐系统

### 推荐优先级体系

**0 级 - 紧急处理**：
- 处理好友请求
- 完成未配置节点
- IP 池满载警告

**1 级 - 新手引导**：
- 创建首个 IP 池
- 添加首个节点
- 创建首个服务

**2 级 - 功能扩展**：
- 添加更多节点
- 建立跨用户连接
- 创建服务

**3 级 - 社交增强**：
- 邀请好友
- 与好友建立连接

**4 级 - 优化建议**：
- 路由健康检查
- 服务质量监控

### 用户状态定义

```typescript
enum UserState {
  NewUser = 'new_user',                    // 无IP池且无设备
  HasIPPool = 'has_ippool',                // 有IP池但无设备
  SingleDevice = 'single_device',          // 1个设备
  MultipleDevices = 'multiple_devices',    // 多设备且已连接
  HasFriendsNoConnections = 'has_friends_no_connections',  // 有好友但未连接
  HasCrossUserConnections = 'has_cross_user_connections',  // 有跨用户连接
  HasServices = 'has_services',            // 已创建服务
  FullyActive = 'fully_active'             // 完全活跃用户
}
```

---

## 📝 代码注释规范

### 组件注释
```typescript
/**
 * 节点卡片内容组件
 * 
 * 职责：
 * 1. 显示节点基本信息（名称、状态、IP）
 * 2. 显示系统信息和网络延迟
 * 3. 提供快捷操作（启用、禁用、启动、停止、重启）
 * 
 * 使用场景：
 * - 节点列表页
 * - Dashboard 节点卡片
 */
```

### 函数注释
```typescript
/**
 * 分析用户状态并生成推荐
 * @param data - 用户数据（IP池、节点、好友等）
 * @returns 用户状态分析结果
 */
function analyzeUserState(data: UserData): UserStateAnalysis {
  // ...
}
```

### TODO 注释
```typescript
// TODO: 实现消息功能后，可以直接跳转到聊天页面
// router.push(`/app/messages/${friendId}`)
```

---

## ⚠️ 常见问题和注意事项

### 1. 避免使用的模式

❌ **直接修改 Props**：
```typescript
// 错误
props.node.name = 'New Name'

// 正确
const localNode = ref({ ...props.node })
localNode.value.name = 'New Name'
emit('update', localNode.value)
```

❌ **未处理异步错误**：
```typescript
// 错误
const data = await api.getData()

// 正确
try {
  const data = await api.getData()
} catch (error) {
  console.error('Failed to fetch data:', error)
  Notify.create({ type: 'negative', message: '加载失败' })
}
```

❌ **硬编码文本**：
```typescript
// 错误
const message = '操作成功'

// 正确
const { t } = useI18n()
const message = t('common.success')
```

### 2. 性能优化建议

**使用 computed 而非 watch**：
```typescript
// ✅ 推荐
const filteredNodes = computed(() => {
  return nodes.value.filter(n => n.status === 'online')
})

// ❌ 避免
watch(() => nodes.value, (newNodes) => {
  filteredNodes.value = newNodes.filter(n => n.status === 'online')
})
```

**大列表虚拟滚动**：
```vue
<q-virtual-scroll
  :items="largeList"
  virtual-scroll-item-size="80"
>
  <template v-slot="{ item }">
    <NodeCard :node="item" />
  </template>
</q-virtual-scroll>
```

### 3. 响应式设计

**使用 Quasar 断点**：
```vue
<div class="row q-col-gutter-md">
  <div class="col-12 col-md-6 col-lg-4">
    <NodeCard />
  </div>
</div>
```

**条件渲染（移动端）**：
```vue
<q-btn 
  :label="$q.screen.lt.sm ? '' : $t('common.save')"
  :icon="$q.screen.lt.sm ? 'save' : undefined"
/>
```

---

## 🚀 部署相关

### 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=ap3

# .env.production
VITE_API_BASE_URL=https://api.mynet.com
VITE_PUSHER_KEY=production_key
VITE_PUSHER_CLUSTER=ap3
```

### 构建命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码修复
npm run lint:fix
```

---

## 📚 参考文档

### 项目内部文档
- [柔和主题指南](./SOFT_THEME_GUIDE.md)
- [表单样式指南](./FORM_STYLE_GUIDE.md)
- [智能推荐逻辑](./TIPS_SMART_LOGIC_TODO.md)
- [术语迁移](./TERMINOLOGY_MIGRATION_ASSESSMENT.md)

### 外部文档
- [Vue 3 文档](https://vuejs.org/)
- [Quasar 文档](https://quasar.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue I18n 文档](https://vue-i18n.intlify.dev/)

---

## 🔄 持续更新

本规范会随项目演进持续更新，请定期查看最新版本。

最后更新：2026-01-10  
维护者：MyNet Team
