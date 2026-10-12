# MyNet Frontend - AI Coding Instructions

> Vue 3 + TypeScript + Quasar Framework  
> Last Updated: 2026-03-26

## 📚 MyNet 生态系统知识库

> **SSOT 知识库**位于 `mynet_ctl/docs/knowledge-base/`。开发前请查阅：
> - [ecosystem.md](../../mynet_ctl/docs/knowledge-base/ecosystem.md) — 项目全景与关系图
> - [architecture.md](../../mynet_ctl/docs/knowledge-base/architecture.md) — 系统架构、认证链
> - [projects/mynet_gui.md](../../mynet_ctl/docs/knowledge-base/projects/mynet_gui.md) — 本项目速查卡

---

## 🚨 CRITICAL RULES - Read First (Prevent 80% of Errors)

**违反以下规则将导致构建失败或运行时错误，必须严格遵守：**

### 0. 🌐 部署目标服务器：my.mynet.club（前端站点） ⚠️ MANDATORY
```
GUI 静态文件部署到：root@my.mynet.club:/data/app/mynet.club/my/public/
API 请求由 my.mynet.club 上的 nginx 反向代理到后端
```
- **❌ 禁止**：`REMOTE_HOST` 填后端 API 部署地址或其 IP（地址不落仓库、不入前端）
- **✅ 正确**：`REMOTE_HOST="my.mynet.club"`
- GUI 前端**从不直接连接后端 API**，一律同源相对路径，nginx 在 `my.mynet.club` 上做代理

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

## 🏗️ Architecture Essentials

### Tech Stack Versions
```json
{
  "vue": "^3.4.0",
  "quasar": "^2.14.0",
  "typescript": "^5.3.0",
  "pinia": "^2.1.0",
  "axios": "^1.6.0",
  "vue-i18n": "^12.0.0"
}
```

### Boot File Initialization Order ⚠️ CRITICAL

Quasar boot files execute in this order (defined in `quasar.config.ts`):

```typescript
boot: [
  'i18n',       // 1️⃣ i18n MUST be first (other boots need $t())
  'init',       // 2️⃣ Global initialization
  'pinia',      // 3️⃣ State management
  'notify',     // 4️⃣ Notification system
  'axios',      // 5️⃣ HTTP client + interceptors (Zone ID injection)
  'theme',      // 6️⃣ Theme system
  'auth',       // 7️⃣ Auth guards
  'websocket'   // 8️⃣ WebSocket connection
]
```

**Key Details**:
- `axios` configures token auto-refresh (401 → refresh → retry)
- `axios` auto-injects X-Zone-ID from localStorage user_info
- `auth` sets route guards (redirect to /auth/login if not authenticated)

### Zone Isolation Architecture ⚠️ CORE CONCEPT

**Zone Concept**:
- Each user belongs to a Zone (tenant)
- Data is fully isolated between Zones
- API requests MUST carry `X-Zone-ID` header

**Implementation** (in `src/services/api.ts`):
```typescript
// Request interceptor automatically injects X-Zone-ID
api.interceptors.request.use((config) => {
  const userInfo = LocalStorage.getItem('user_info')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    if (user.zone_id) {
      config.headers['X-Zone-ID'] = user.zone_id
    }
  }
  return config
})
```

**Important Rules**:
- ✅ X-Zone-ID is AUTO-INJECTED in all API requests
- ✅ zone_id stored in localStorage user_info after login
- ❌ FORBIDDEN to perform cross-Zone operations
- ⚠️ All data lists are pre-filtered by Zone on backend

---

## 📋 Development Patterns

### Component Structure Template
```vue
<template>
  <q-card class="component-name" flat bordered>
    <!-- Content -->
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Component Name
 * 
 * Responsibilities:
 * 1. Feature description 1
 * 2. Feature description 2
 */

interface Props {
  /** Property description */
  propName: string
}

interface Emits {
  (e: 'event-name', payload: Type): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style lang="scss" scoped>
.component-name {
  background: var(--soft-bg-card);
  border-radius: var(--soft-radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
```

### Composable Pattern (API Calls)
```typescript
// composables/useNodes.ts
import { ref, reactive } from 'vue'
import debug from 'src/utils/debug'
import { nodeService } from '../services/node/nodeService'

export function useNodes() {
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  
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
  
  return { nodes, loading, pagination, loadNodes }
}
```

### API Service Encapsulation
```typescript
// services/api/nodeApi.ts
import { apiService } from '../api'  // Use unified apiService
import type { Node, CreateNodeDto } from '../../types/node'

export const nodeApi = {
  async getNodes(): Promise<{ data: Node[] }> {
    return apiService.get('/nodes')  // apiService includes /api/v1 prefix
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

**Key Details**:
- ✅ Use `apiService` instead of direct `api` instance
- ✅ `apiService` has `/api/v1` base path configured
- ✅ `apiService` auto-injects `X-Zone-ID` header
- ✅ `apiService` supports token auto-refresh (401 auto-retry)

### TypeScript Standards
```typescript
// ✅ CORRECT - Explicit types
interface Node {
  id: number
  name: string
  status: NodeStatus
}

// ❌ WRONG - Avoid any
const data: any = response.data

// ✅ CORRECT - Typed Props/Emits
interface Props {
  /** Node ID */
  nodeId: number
}

interface Emits {
  (e: 'update', node: Node): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
```

### i18n Pattern
```vue
<!-- ❌ WRONG - Hardcoded -->
<q-btn label="删除" />

<!-- ✅ CORRECT - i18n -->
<q-btn :label="$t('common.delete')" />

<!-- With parameters -->
<span>{{ $t('node.summary', { count: nodeCount }) }}</span>

<!-- Pluralization -->
{{ $tc('node.count', nodeCount, { count: nodeCount }) }}
```

**i18n File Structure**:
```
i18n/
├── zh-CN/
│   ├── index.ts
│   ├── common.ts
│   ├── auth.ts
│   ├── node.ts
│   └── ...
└── en-US/
    └── ...
```

---

## 🎨 Design System

### Soft Theme CSS Variables
```scss
// Backgrounds
--soft-bg-primary: #f5f7fa;
--soft-bg-card: #f8fafc;
--soft-bg-hover: #eef2f7;

// Text Colors
--soft-text-primary: #2d3748;      // Replace pure black
--soft-text-secondary: #718096;
--soft-text-tertiary: #a0aec0;

// Borders & Radius
--soft-border-light: #e2e8f0;
--soft-radius-sm: 8px;
--soft-radius-md: 12px;
--soft-radius-lg: 16px;
--soft-radius-xl: 20px;

// Shadows
--soft-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.03);
--soft-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
--soft-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);
```

### Card Component Standard
**Reference**: `src/components/node/NodeCardContent.vue`

```vue
<q-card-section class="card-content">
  <!-- 1. Header: Title + Status (light gray bg) -->
  <div class="card-header">
    <div class="title">{{ title }}</div>
    <StatusDisplay :status="status" />
  </div>
  
  <!-- 2. Body: Main info (white bg) -->
  <div class="card-body">
    <div class="info-line">
      <q-icon name="icon" size="20px" />
      <span class="info-value">{{ value }}</span>
    </div>
  </div>
  
  <!-- 3. Footer: Meta + Actions (light gray bg) -->
  <div class="card-footer">
    <div class="meta-info">...</div>
    <div class="actions">...</div>
  </div>
</q-card-section>
```

### Form Patterns
**Auth Forms** (Placeholder only):
```vue
<q-input
  v-model="form.email"
  :placeholder="$t('auth.email')"
  type="email"
  outlined
>
  <template v-slot:prepend>
    <q-icon name="email" />
  </template>
</q-input>
```

**Management Forms** (Label + Placeholder):
```vue
<q-input
  v-model="form.nodeName"
  :label="$t('node.name')"
  :placeholder="$t('node.namePlaceholder')"
  outlined
/>
```

**Required Fields**:
```vue
<q-input
  :rules="[val => !!val || $t('validation.required')]"
>
  <template v-slot:label>
    {{ $t('field.label') }} <span class="text-negative">*</span>
  </template>
</q-input>
```

---

## ✅ Session-End Checklist

### MANDATORY Before Commit

**1. Lint Check** ❌ BLOCKING
```bash
npm run lint
# If fails: npm run lint:fix
```

**2. TypeScript Check** ❌ BLOCKING
```bash
npm run build  # Quasar validates types via build
```

**3. i18n Completeness** ⭐️ MANDATORY ❌ BLOCKING
```bash
npm run check:i18n
```
- Add missing translation keys (zh-CN & en-US)
- All user-visible text must use `$t()`

**4. Production Build** ❌ BLOCKING
```bash
npm run build
```

**5. Quick Check Script**
```bash
./dev-tools/session-end-check.sh
```
- Runs all above checks
- Detects console.log (warning only - auto-removed in production)
- Detects debug calls (info only - auto-optimized in production)

### ❌ Blocking Errors (MUST Fix)
1. Build failure
2. TypeScript errors
3. ESLint errors (error level)
4. Missing i18n keys

### ⚠️ Warnings (Recommended)
1. console.log usage (auto-removed in production)
2. Commented code
3. ESLint warnings

---

## 📂 Key Files & Commands

### Critical Files
- `quasar.config.ts` - Boot order, build settings
- `src/boot/axios.ts` - HTTP client config
- `src/services/api.ts` - Zone ID injection, token refresh
- `src/utils/debug.ts` - Debug tool implementation
- `dev-tools/session-end-check.sh` - Pre-commit validation
- `dev-tools/check-i18n.js` - i18n completeness checker

### Development Commands
```bash
npm run dev              # Development server (hot reload)
npm run build            # Production build
npm run lint             # Code check
npm run lint:fix         # Auto-fix lint errors
npm run check:i18n       # i18n completeness check
./dev-tools/session-end-check.sh  # Full pre-commit check
```

### Directory Structure
```
src/
├── boot/           # Boot files (initialization order)
├── components/     # Reusable components
├── composables/    # Composition functions (useNodes, etc.)
├── layouts/        # Layout components
├── pages/          # Page components
├── router/         # Route configuration
├── services/       # API services & business logic
├── stores/         # Pinia state management
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── i18n/           # i18n resource files
└── styles/         # Global styles
```

---

## 📚 Additional References

### Internal Documentation
- [SOFT_THEME_GUIDE.md](./SOFT_THEME_GUIDE.md) - Soft theme system
- [FORM_STYLE_GUIDE.md](./FORM_STYLE_GUIDE.md) - Form style guide
- [TIPS_SMART_LOGIC_TODO.md](./TIPS_SMART_LOGIC_TODO.md) - Smart recommendation logic
- [SESSION_END_CHECKLIST.md](./SESSION_END_CHECKLIST.md) - Detailed checklist

### External Documentation
- [Vue 3](https://vuejs.org/)
- [Quasar](https://quasar.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue I18n](https://vue-i18n.intlify.dev/)

---

## 🔄 Update History

**2026-01-14**: Compressed version created
- Focused on "Critical Rules First" approach
- Removed verbose component templates (reference project files)
- Maintained all essential architecture patterns
- Target: Prevent 80% of errors with minimal token consumption

**Previous**: Detailed version (1176 lines)
- Available in `.github/copilot-instructions-详细版.md`
- Contains comprehensive component examples and detailed explanations

---

**Last Updated**: 2026-01-14  
**Maintainer**: MyNet Team
