# MyNet Frontend - AI Coding Instructions

> Vue 3 + TypeScript + Quasar Framework  
> Last Updated: 2026-01-14

---

## 🚨 CRITICAL RULES - Read First (Prevent 80% of Errors)

**违反以下规则将导致构建失败或运行时错误，必须严格遵守：**

### 1. 🔧 Use `debug` Tool, NOT `console` ⚠️ MANDATORY
```typescript
// ❌ WRONG - Will be stripped in production incorrectly
console.log('User data:', user)

// ✅ CORRECT - Auto-optimized by debug tool
import debug from 'src/utils/debug'
debug.log('User data:', user)
```
- **Why**: `debug` tool handles dev/prod environments automatically
- **File**: `src/utils/debug.ts`

### 2. 🌐 All User-Visible Text MUST Use `$t()` ⚠️ MANDATORY
```vue
<!-- ❌ WRONG - Hardcoded text -->
<q-btn label="删除" />

<!-- ✅ CORRECT - i18n -->
<q-btn :label="$t('common.delete')" />
```
- **Why**: Multi-language support (zh-CN/en-US)
- **Check**: Run `npm run check:i18n` before commit

### 3. 🏢 Zone Architecture - X-Zone-ID Auto-Injection ⚠️ CRITICAL
```typescript
// Zone-based multi-tenant isolation
// X-Zone-ID is AUTO-INJECTED in all API requests via interceptor
// src/services/api.ts handles this automatically

// ❌ NEVER manually add X-Zone-ID
// ✅ Just use apiService - it's automatic
```
- **Why**: Data isolation between tenants
- **File**: `src/services/api.ts` (request interceptor)

### 4. 📦 Use `apiService`, NOT Direct `api` Instance
```typescript
// ❌ WRONG
import { api } from '../boot/axios'
api.get('/api/v1/nodes')

// ✅ CORRECT
import { apiService } from '../services/api'
apiService.get('/nodes')  // /api/v1 prefix auto-added
```
- **Why**: `apiService` handles Zone ID, token refresh, base path

### 5. ✅ Run Session-End-Check Before Commit ⚠️ MANDATORY
```bash
./dev-tools/session-end-check.sh
```
- Lint check
- TypeScript check (via build)
- i18n completeness check
- Production build test

---

## 🏗️ 技术架构

### Boot 文件初始化顺序 ⚠️ **关键**

Quasar 启动文件按以下顺序执行（定义在 `quasar.config.ts`）：

```typescript
boot: [
  'i18n',       // 1️⃣ 国际化（最先初始化）
  'init',       // 2️⃣ 全局初始化
  'pinia',      // 3️⃣ 状态管理
  'notify',     // 4️⃣ 通知系统
  'axios',      // 5️⃣ HTTP 客户端 + 拦截器
  'theme',      // 6️⃣ 主题系统
  'auth',       // 7️⃣ 认证守卫
  'websocket'   // 8️⃣ WebSocket 连接
]
```

**关键细节**：
- **i18n 必须最先初始化**：其他 boot 文件可能需要 `$t()`
- **axios 配置了 Token 自动刷新**：401 错误时自动刷新 token 并重试
- **axios 自动注入 X-Zone-ID**：从 localStorage 用户信息中读取
- **auth 设置路由守卫**：未登录时重定向到 `/auth/login`

### Zone 隔离架构 ⚠️ **关键概念**

MyNet 使用 **Zone-based 多租户隔离架构**：

**Zone 概念**：
- 每个用户属于一个 Zone（区域/租户）
- Zone 之间数据完全隔离
- API 请求必须携带 `X-Zone-ID` 头部

**实现机制**（在 `src/services/api.ts`）：
```typescript
// Request interceptor automatically injects X-Zone-ID
api.interceptors.request.use((config) => {
  const userInfo = LocalStorage.getItem('user_info')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    if (user.zone_id) {
      config.headers['X-Zone-ID'] = user.zone_id
      debug.log('🔧 [API] Injected X-Zone-ID header:', user.zone_id)
    }
  }
  return config
})
```

**重要规则**：
- ✅ **X-Zone-ID 自动注入**：所有 API 请求自动携带
- ✅ **用户登录后存储**：zone_id 存储在 localStorage 的 user_info 中
- ❌ **禁止跨 Zone 操作**：后端会拒绝不匹配的请求
- ⚠️ **数据列表过滤**：所有数据列表已按 Zone 过滤

**Zone 相关字段**：
```typescript
interface User {
  id: number
  zone_id: number      // 所属 Zone ID
  name: string
  email: string
}

interface Node {
  id: number
  zone_id: number      // 节点所属 Zone ID
  node_name: string
  // ...
}
```

### 技术栈版本
```json
{
  "vue": "^3.4.0",
  "quasar": "^2.14.0",
  "typescript": "^5.3.0",
  "pinia": "^2.1.0",
  "vue-router": "^4.2.0",
  "vue-i18n": "^12.0.0",
  "axios": "^1.6.0",
  "date-fns": "^4.1.0",
  "echarts": "^6.0.0",
  "laravel-echo": "^2.1.6",
  "pusher-js": "^8.4.0",
  "marked": "^16.3.0"
}
```

### 核心依赖说明
- **Vue 3 Composition API**：所有组件使用 `<script setup lang="ts">` 语法
- **TypeScript**：严格模式 (`strict: true`)，需要明确类型定义
- **Quasar Framework**：UI 组件库，使用 Quasar CLI + Vite
- **Pinia**：状态管理（Setup Store 模式），替代 Vuex
- **Vue I18n**：国际化，所有文本必须使用 `$t()` 包裹
- **Axios**：HTTP 客户端，已配置拦截器、Token 自动刷新、Zone ID 注入
- **date-fns**：日期格式化，使用 `zhCN` locale
- **marked**：Markdown 渲染（帮助文档系统）
- **Laravel Echo + Pusher**：实时通信（WebSocket）

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
  outli调试工具规范 ⚠️ **强制要求**

**使用 `debug` 工具替代 `console`**：

```typescript
// ❌ 错误 - 禁止直接使用 console
console.log('User data:', user)

// ✅ 正确 - 使用 debug 工具
import debug from 'src/utils/debug'
debug.log('User data:', user)
```

**debug 工具特性**（定义在 `src/utils/debug.ts`）：
- ✅ **开发环境自动启用**：`NODE_ENV === 'development'` 时所有日志正常输出
- ✅ **生产环境自动禁用**：日志调用编译为空操作（零性能开销）
- ✅ **环境变量控制**：可通过 `VITE_ENABLE_DEBUG` 强制启用
- ✅ **完全兼容 console API**：支持 `log`, `warn`, `error`, `group`, `table` 等
- ⚠️ **error 日志特殊处理**：根据 `VITE_LOG_LEVEL` 决定是否在生产环境显示

**Terser 自动移除配置**（`quasar.config.ts`）：
```typescript
terserOptions: {
  compress: {
    drop_console: true,           // 移除 console.log
    drop_debugger: true,          // 移除 debugger
    pure_funcs: ['console.log', 'console.info', 'console.debug']
  }
}
```

### 1. ned
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

### 0. 代码语言规范 ⭐️ **强制要求**

**所有代码必须遵守以下语言规范**：
 debug 工具 + 英文**：
```typescript
// ❌ 错误 - 直接使用 console
console.log('加载用户数据失败:', error)

// ✅ 正确 - 使用 debug 工具 + 英文
import debug from 'src/utils/debug'
debug.log('Failed to load user data:', error)
debug.error('API request failed:', error)
```

**注意**：
- ⚠️ **禁止直接使用 `console`**：必须通过 `debug` 工具调用
- 开发环境：debug 日志正常输出
- 生产2境：debug 日志自动禁用（编译为空操作）
- 错误日志：`debug.error()` 根据 `VITE_LOG_LEVEL` 决定是否显示
#### 用户不可见文本（注释、日志等）
✅ **必须使用英文**：
```typescript
// ❌ 错误
// 显示用户名称（优先使用备注，否则使用用户名）
const displayName = computed(() => {
  return props.user.remark || props.user.name
})

// ✅ 正确
// Display name (use remark first, fallback to username)
const displayName = computed(() => {
  return props.user.remark || props.user.name
})
```

```vue
<!-- ❌ 错误 -->
<!-- 顶部：头像 + 名称（浅灰背景）-->
<div class="card-header">

<!-- ✅ 正确 -->
<!-- Header: Avatar + Name (light gray background) -->
<div class="card-header">
```

```scss
// ❌ 错误
// 顶部样式
.card-header {
  background: var(--soft-bg-secondary);
}

// ✅ 正确
// Header styles
.card-header {
  background: var(--soft-bg-secondary);
}
```

#### 控制台日志
✅ **必须使用英文**：
```typescript
// ❌ 错误
console.log('加载用户数据失败:', error)

// ✅ 正确
console.log('Failed to load user data:', error)
```

**注意**：
- 生产构建时 `console.log` 会被自动移除（Terser 配置）
- 开发环境可以保留 `console.log` 用于调试
- `console.warn` 和 `console.error` 会被保留用于错误追踪

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
cons3 node = { id: 1, name: 'Node1' }  // 缺少类型
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

**所有4本必须使用 `$t()`**：
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
impo5t { defineStore } from 'pinia'
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
import { ref, reactive } from 'vue'
import debug from 'src/utils/debug'
import type { Node } from '../types/node'
import { nodeService } from '../services/node/nodeService'

export function useNodes() {
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  
  // Pagination state (reactive object)
  const pagination = reactive({
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0
  })
  
  const loadNodes = async () => {
    loading.value = true
    try {
      const response = await nodeService.getNodesList({ 
        page: pagination.page,
        per_page: pagination.rowsPerPage 
      })
      nodes.value = response.data
      pagination.rowsNumber = response.total
    } catch (error: any) {
      debug.error('Failed to load nodes:', error)
      throw error  // Let component handle notification
    } finally {
      loading.value = false
    }
  }
  
  return {
    nodes,
    loading,
    pagination,
    loadNodes
  }
}
```

**Composables 规范**：
- ✅ 使用 `debug` 记录错误而非 `console`
- ✅ 分页状态使用 `reactive` 对象
- ✅ 错误向上抛出，由组件处理通知
- ✅ 返回 `readonly()` 包装不应修改的状态

**API 服务封装**Service } from '../api'  // 使用统一的 apiService
import type { Node, CreateNodeDto } from '../../types/node'

export const nodeApi = {
  async getNodes(): Promise<{ data: Node[] }> {
    return apiService.get('/nodes')  // apiService 已包含 /api/v1 前缀
  },
  
  async createNode(data: CreateNodeDto): Promise<{ data: Node }> {
    return apiService.post('/nodes', data)
  },
  
  async updateNode(id: number, data: Partial<Node>): Promise<{ data: Node }> {
    return apiService.put(`/nodes/${id}`, data)
  },
  
  async deleteNode(id: number): Promise<void> {
    return apiService.delete(`/nodes/${id}`)
  }
}
```

**关键细节**：
- ✅ 使用 `apiService` 而非直接使用 `api` 实例
- ✅ `apiService` 已配置 `/api/v1` 基础路径
- ✅ `apiService` 自动注入 `X-Zone-ID` 头部
- ✅ `apiService` 支持 Token 自动刷新（401 自动重试） return api.delete(`/api/v1/nodes/${id}`)
  }
}6
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

## ✅ 会话结束检查清单

### 每次会话结束前必须执行

在提交代码并结束会话之前，**必须**通过以下检查：

**1. 代码格式和规范检查** ❌ **阻塞性**
```bash
npm run lint
```
- ❌ 如果失败，**必须**运行 `npm run lint:fix` 自动修复
- ❌ **必须**手动修复无法自动修复的问题
- ✅ 通过后才能继续

**2. TypeScript 类型检查** ❌ **阻塞性**
```bash
# Quasar 项目通过构建验证类型
npm run build
```
- ❌ **必须**确保构建成功
- ❌ **必须**修复所有 TypeScript 类型错误
- ❌ 避免使用 `any` 类型（除非特殊情况且有注释说明）
- ✅ 通过后才能继续

**3. 国际化完整性检查** ⭐️ **强制要求** ❌ **阻塞性**
```bash
npm run check:i18n
```
- ❌ **必须**补充所有缺失的翻译键值（中英文）
- ❌ 所有用户可见文本**必须**使用 `$t()` 包裹
- ❌ 参数化文本格式必须正确：`$t('key', { param: value })`
- ✅ 通过后才能继续

**4. 生产构建测试** ❌ **阻塞性**
```bash
npm run build
```
- ❌ **必须**确保构建成功
- ❌ **必须**修复所有编译错误
- ✅ 通过后才能继续

**5. 代码清理**
- ⚠️  移除注释掉的废弃代码
- ⚠️  移除 TODO 注释（或转移到专门的 TODO 文档）
- ✅ **debug 调用不需要手动移除**：生产构建时自动优化
  - 开发环境：保留所有 debug 调用（正常输出）
  - 生产环境：debug 调用编译为空操作（零性能开销）
  - 错误日志：`debug.error()` 根据 `VITE_LOG_LEVEL` 决定

**6. Git 提交检查**
```bash
git status
```
- 确保所有修改已添加
- commit message 清晰描述改动
- 使用约定式提交格式：`feat:`, `fix:`, `refactor:` 等

### 快速检查脚本

使用项目提供的自动检查脚本：

```bash
./dev-tools/session-end-check.sh
```

该脚本会自动执行：
- ✅ 代码格式检查 (npm run lint)
- ✅ TypeScript 类型检查（通过构建验证）
- ⭐ 国际化完整性检查 (npm run check:i18n) **强制要求**
- ✅ 生debug 调用检测（仅提示，生产构建时自动优化
- 💡 console.log 检测（仅提示，生产构建时自动移除）
- ⚠️  硬编码文本检测（警告，不阻止提交）
- 📋 未提交文件提示

### 常见问题快速修复

**国际化缺失**：
```typescript
// zh-CN.ts
export default {
  social: {
    viewNodes: '查看设备',
    friendSince: '成为好友于 {date}'
  }
}

// en-US.ts
export default {
  social: {
    viewNodes: 'View Nodes',
    friendSince: 'Friends since {date}'
  }
}
```

**ESLint 错误**：
```bash
npm run lint:fix
```

**TypeScript 错误**：
- 添加明确类型定义
- 避免使用 `any`
- 为 Props/Emits 定义接口

### ❌ 阻塞性错误（必须修复才能结束会话）

以下错误**必须修复**才能提交代码和结束会话：

1. ❌ **构建失败** - 运行 `npm run build` 必须成功
2. ❌ **TypeScript 类型错误** - 必须修复所有类型错误
3. ❌ **ESLint 错误**（error 级别）- 运行 `npm run lint:fix` 修复
4. ❌ **缺失国际化键值** - 必须补充所有缺失的翻译（中英文）

**重要规则**：
- 🚫 未通过阻塞性检查的代码**禁止提交**
- 🚫 必须运行 `./dev-tools/session-end-check.sh` 并通过所有检查
- ✅ 所有 ❌ 标记的检查项都是阻塞性的，必须修复

### 警告性问题（建议但不强制）

以下问题建议修复，但不阻塞提交：
debug 调用** - 生产构建时会自动优化为空操作，开发时可以保留
2. ⚠️  **注释代码** - 建议清理废弃代码
3. ⚠️  **ESLint 警告**（warning 级别）- 建议修复但不强制

**debug 工具自动优化机制**：
- 🛠️ 开发环境 (`npm run dev`)：所有 debug 调用正常输出
- 🚀 生产构建：debug 调用编译为空操作（`if (false) { ... }`）
- ✅ 零性能开销：生产代码不包含任何 debug 逻辑
- ⚠️ 错误日志：`debug.error()` 根据 `VITE_LOG_LEVEL` 决定
- 📝 工具定义：`src/utils/debug.t
- 📝 配置文件：`quasar.config.ts` > `terserOptions.compress`

---

## 🔄 持续更新

本规范会随项目演进持续更新，请定期查看最新版本。

**关键开发工具**：
- `npm run dev` - 开发服务器（热重载）
- `npm run build` - 生产构建
- `npm run lint` / `npm run lint:fix` - 代码检查/自动修复
- `npm run check:i18n` - 国际化完整性检查
- `./dev-tools/session-end-check.sh` - 会话结束检查脚本

**重要脚本位置**：
- 会话检查：`dev-tools/session-end-check.sh`
- i18n 检查：`dev-tools/check-i18n.js`
- 部署脚本：`deployment.sh`, `quick-deploy.sh`

最后更新：2026-01-14  
维护者：MyNet Team
