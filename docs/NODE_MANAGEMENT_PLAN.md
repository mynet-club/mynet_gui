# 节点管理模块开发计划 (重构版)

## 📋 项目概述

基于现有的MyNet系统架构和OpenAPI文档，重新实现节点管理功能。采用独立页面架构替代对话框，降低复杂度，提升用户体验。密钥管理支持用户本地生成和服务端生成两种模式。

## 🎯 功能需求

### 1. 节点列表页面 (NodesPage.vue)
- **布局**: 卡片式布局，不使用表格
- **功能**: 
  - 显示节点基本信息
  - 支持分页
  - 基础搜索功能
  - 快速操作按钮（编辑、删除、查看详情）
  - 节点状态实时显示
- **暂不实现**: 复杂过滤器、连接信息、操作日志

### 2. 节点详情页面 (NodeDetailPage.vue)
- **方式**: 独立页面 `/nodes/:id`
- **内容**:
  - 基础信息展示
  - 网络配置信息
  - 运行状态和统计
- **暂不实现**: 连接信息、操作日志

### 3. 节点编辑页面架构 (独立页面)
- **方式**: 独立页面 `/nodes/:id/edit`，分为多个子路由
- **页面结构**:
  - `/nodes/:id/edit/basic` - 基础信息编辑
  - `/nodes/:id/edit/network` - 网络配置编辑
  - `/nodes/:id/edit/config` - 节点配置编辑
  - `/nodes/:id/edit/keys` - 密钥管理
- **导航**: 左侧导航菜单，顶部面包屑

### 4. 节点创建功能 (简化)
- **方式**: 简化的创建表单
- **流程**: 只收集必要信息 → 创建节点 → 自动跳转到编辑页面
- **必要信息**: 节点名称、描述(可选)

## 🏗️ 技术架构

### 1. 文件结构 (独立页面架构)
```
src/
├── pages/network/
│   ├── NodesPage.vue                    # 节点列表主页
│   ├── NodeDetailPage.vue              # 节点详情页 (/nodes/:id)
│   ├── NodeCreatePage.vue              # 节点创建页 (/nodes/create)
│   └── node-edit/                      # 节点编辑页面目录
│       ├── NodeEditLayout.vue          # 编辑页面布局 (/nodes/:id/edit)
│       ├── BasicInfoPage.vue           # 基础信息页 (/nodes/:id/edit/basic)
│       ├── NetworkConfigPage.vue       # 网络配置页 (/nodes/:id/edit/network)
│       ├── NodeConfigPage.vue          # 节点配置页 (/nodes/:id/edit/config)
│       └── KeyManagementPage.vue       # 密钥管理页 (/nodes/:id/edit/keys)
├── components/network/
│   ├── NodeCard.vue                    # 节点卡片组件
│   ├── NodeStatusBadge.vue             # 节点状态标识
│   ├── NodeQuickActions.vue            # 节点快速操作
│   └── node-forms/                     # 节点表单组件目录
│       ├── BasicInfoForm.vue           # 基础信息表单
│       ├── NetworkConfigForm.vue       # 网络配置表单
│       ├── NodeConfigForm.vue          # 节点配置表单
│       └── KeyManagementForm.vue       # 密钥管理表单
├── services/
│   ├── nodeService.ts                  # 节点基础服务
│   ├── nodeKeysService.ts              # 节点密钥服务
│   └── nodeConfigService.ts            # 节点配置服务
├── composables/
│   ├── useNodes.ts                     # 节点列表管理
│   ├── useNode.ts                      # 单个节点管理
│   ├── useNodeKeys.ts                  # 节点密钥管理
│   └── useNodeConfig.ts                # 节点配置管理
├── types/
│   ├── node.ts                         # 节点基础类型
│   ├── nodeKeys.ts                     # 节点密钥类型
│   └── nodeConfig.ts                   # 节点配置类型
└── utils/
    ├── nodeHelpers.ts                  # 节点工具函数
    └── keyGenerators.ts                # 密钥生成工具
```

### 2. 路由配置
```typescript
const routes = [
  {
    path: '/nodes',
    name: 'nodes',
    component: () => import('../pages/network/NodesPage.vue')
  },
  {
    path: '/nodes/create',
    name: 'node-create',
    component: () => import('../pages/network/NodeCreatePage.vue')
  },
  {
    path: '/nodes/:id',
    name: 'node-detail',
    component: () => import('../pages/network/NodeDetailPage.vue')
  },
  {
    path: '/nodes/:id/edit',
    component: () => import('../pages/network/node-edit/NodeEditLayout.vue'),
    children: [
      {
        path: '',
        redirect: to => ({ name: 'node-edit-basic', params: to.params })
      },
      {
        path: 'basic',
        name: 'node-edit-basic',
        component: () => import('../pages/network/node-edit/BasicInfoPage.vue')
      },
      {
        path: 'network',
        name: 'node-edit-network',
        component: () => import('../pages/network/node-edit/NetworkConfigPage.vue')
      },
      {
        path: 'config',
        name: 'node-edit-config',
        component: () => import('../pages/network/node-edit/NodeConfigPage.vue')
      },
      {
        path: 'keys',
        name: 'node-edit-keys',
        component: () => import('../pages/network/node-edit/KeyManagementPage.vue')
      }
    ]
  }
]
```

## 📊 数据结构设计

### 1. 基于OpenAPI的Node接口
```typescript
interface Node {
  // 基础信息 (来自OpenAPI)
  id: string                          // 节点ID
  node_id: string                     // 节点业务ID (如: N20240101123456)
  node_name: string                   // 节点名称
  description?: string                // 节点描述
  status: 'active' | 'inactive' | 'pending'  // 节点状态
  
  // 时间戳
  created_at: string
  updated_at: string
  
  // 扩展字段 (前端补充)
  zone_id?: string                    // 所属Zone ID
  node_type?: 'Gateway' | 'Server' | 'Client' | 'Router'
  ip_address?: string                 // 内网IP
  public_ip?: string                  // 公网IP
  port?: number                       // 端口
  
  // 统计信息 (可选)
  stats?: {
    bytes_sent?: number
    bytes_received?: number
    connections_count?: number
    uptime?: number
    last_seen?: string
  }
}
```

### 2. 密钥管理接口 (基于OpenAPI + ed25519规范)
```typescript
interface NodeKey {
  // 基础信息 (来自OpenAPI)
  id: string                          // 密钥ID
  node_id: string                     // 节点ID
  key_type: 'ed25519' | 'wireguard' | 'gnb'  // 密钥类型
  public_key: string                  // 公钥 (64字符 for ed25519)
  private_key?: string                // 私钥 (128字符 for ed25519, 仅生成时显示一次)
  created_at: string                  // 创建时间
  expires_at?: string                 // 过期时间
  
  // 扩展字段
  key_source: 'server_generated' | 'user_uploaded'  // 密钥来源
  fingerprint?: string                // 密钥指纹
  is_active: boolean                  // 是否活跃
}

interface KeyGenerationResult {
  public_key: string                  // 公钥 (64字符)
  private_key: string                 // 私钥 (128字符, 仅显示一次)
  fingerprint: string                 // 密钥指纹
  warning_shown: boolean              // 是否已显示保存警告
  user_confirmed_save: boolean        // 用户是否确认已保存
}

interface KeyUploadRequest {
  public_key: string                  // 用户上传的公钥
  key_type: 'ed25519'                 // 密钥类型
}
```

### 3. 节点配置接口 (简化版)
```typescript
interface NodeConfig {
  // 基础配置
  vpn_type: 'gnb' | 'wireguard'       // VPN类型
  vpn_version: string                 // VPN版本
  config_mode: 'basic' | 'expert'     // 配置模式
  
  // 网络配置
  network: {
    interface_name: string            // 网络接口名称
    listen_address: string            // 监听地址
    listen_port: number               // 监听端口
    mtu: number                       // MTU值
  }
  
  // 基础配置
  basic_config: {
    [key: string]: any                // 动态配置参数
  }
  
  // 高级配置 (专家模式)
  expert_config?: {
    [key: string]: any                // 高级配置参数
  }
  
  // 生成的配置文件
  generated_config?: string
}
```

### 4. API响应接口 (基于OpenAPI)
```typescript
interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
  request_id: string                  // 请求追踪ID
  timestamp: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
```
```

### 2. VPN配置模板接口 (保留，后续扩展用)
```typescript
interface VPNConfigTemplate {
  vpn_type: 'gnb' | 'wireguard'
  name: string
  description: string
  enabled: boolean
  supported_versions: string[]
  default_version: string
  
  versions: {
    [version: string]: {
      name: string
      interface_name: string
      default_port: number
      recommended_mtu: number
      config_file_extension: string
      
      modes: {
        basic: VPNConfigMode
        expert: VPNConfigMode
      }
    }
  }
}

interface VPNConfigMode {
  name: string
  description: string
  parameters: {
    [key: string]: VPNConfigParameter
  }
}

interface VPNConfigParameter {
  name: string
  type: 'string' | 'integer' | 'select' | 'boolean' | 'text'
  default?: any
  required?: boolean
  min?: number
  max?: number
  options?: { [key: string]: string }
  validation?: string
  description: string
}
```

### 3. 节点配置接口 (简化版)
```typescript
interface NodeConfig {
  // 基础配置
  vpn_type: 'gnb' | 'wireguard'       // VPN类型
  vpn_version: string                 // VPN版本
  config_mode: 'basic' | 'expert'     // 配置模式
  
  // 网络配置
  network: {
    interface_name: string            // 网络接口名称
    listen_address: string            // 监听地址
    listen_port: number               // 监听端口
    mtu: number                       // MTU值
  }
  
  // 基础配置
  basic_config: {
    [key: string]: any                // 动态配置参数
  }
  
  // 高级配置 (专家模式)
  expert_config?: {
    [key: string]: any                // 高级配置参数
  }
  
  // 生成的配置文件
  generated_config?: string
}
```

### 4. 密钥管理接口 (基于OpenAPI + ed25519规范)
```typescript
interface NodeKey {
  // 基础信息 (来自OpenAPI)
  id: string                          // 密钥ID
  node_id: string                     // 节点ID
  key_type: 'ed25519' | 'wireguard' | 'gnb'  // 密钥类型
  public_key: string                  // 公钥 (64字符 for ed25519)
  private_key?: string                // 私钥 (128字符 for ed25519, 仅生成时显示一次)
  created_at: string                  // 创建时间
  expires_at?: string                 // 过期时间
  
  // 扩展字段
  key_source: 'server_generated' | 'user_uploaded'  // 密钥来源
  fingerprint?: string                // 密钥指纹
  is_active: boolean                  // 是否活跃
}

interface KeyGenerationResult {
  public_key: string                  // 公钥 (64字符)
  private_key: string                 // 私钥 (128字符, 仅显示一次)
  fingerprint: string                 // 密钥指纹
  warning_shown: boolean              // 是否已显示保存警告
  user_confirmed_save: boolean        // 用户是否确认已保存
}

interface KeyUploadRequest {
  public_key: string                  // 用户上传的公钥
  key_type: 'ed25519'                 // 密钥类型
}

interface ConfigPreview {
  content: string
  format: 'ini' | 'json' | 'key_value'
  filename: string
  downloadable: boolean
}
```

## 🔧 核心组件设计

### 1. NodeCard.vue - 节点卡片 (简化)
```vue
<template>
  <q-card class="node-card" :class="{ 'node-card--active': node.status === 'active' }">
    <q-card-section>
      <!-- 节点基本信息 -->
      <div class="row items-center">
        <q-icon :name="getNodeStatusIcon(node.status)" :color="getNodeStatusColor(node.status)" size="md" />
        <div class="col q-ml-md">
          <div class="text-h6">{{ node.node_name }}</div>
          <div class="text-caption text-grey-6">{{ node.node_id }}</div>
        </div>
        <NodeStatusBadge :status="node.status" />
      </div>
      
      <!-- 描述信息 -->
      <div class="q-mt-md" v-if="node.description">
        <div class="text-body2 text-grey-7">{{ node.description }}</div>
      </div>
      
      <!-- 时间信息 -->
      <div class="q-mt-md">
        <div class="text-caption text-grey-6">
          创建时间: {{ formatDateTime(node.created_at) }}
        </div>
      </div>
    </q-card-section>
    
    <q-card-actions align="right">
      <NodeQuickActions :node="node" @action="$emit('action', $event)" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { Node } from '@/types/node'
import NodeStatusBadge from './NodeStatusBadge.vue'
import NodeQuickActions from './NodeQuickActions.vue'
import { useNodes } from '@/composables/useNodes'

interface Props {
  node: Node
}

defineProps<Props>()
defineEmits<{
  action: [{ type: string, node: Node }]
}>()

const { getNodeStatusIcon, getNodeStatusColor } = useNodes()

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
```

### 2. NodeEditLayout.vue - 编辑页面布局
```vue
<template>
  <q-page class="node-edit-layout">
    <!-- 页面头部 -->
    <div class="row q-mb-md">
      <div class="col">
        <q-breadcrumbs>
          <q-breadcrumbs-el icon="home" to="/dashboard" />
          <q-breadcrumbs-el label="节点管理" to="/nodes" />
          <q-breadcrumbs-el :label="node?.node_name || '加载中...'" />
          <q-breadcrumbs-el label="编辑" />
        </q-breadcrumbs>
        <div class="text-h4 q-mt-sm">编辑节点 - {{ node?.node_name }}</div>
      </div>
      <div class="col-auto">
        <q-btn 
          flat 
          color="primary" 
          label="返回列表" 
          icon="arrow_back"
          @click="$router.push('/nodes')" 
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- 左侧导航 -->
      <div class="col-12 col-md-3">
        <q-list bordered separator>
          <q-item 
            v-for="item in menuItems" 
            :key="item.name"
            clickable 
            :active="$route.name === item.name"
            @click="$router.push({ name: item.name, params: $route.params })"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
              <q-item-label caption>{{ item.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 右侧内容区域 -->
      <div class="col-12 col-md-9">
        <q-card>
          <router-view :node="node" @updated="onNodeUpdated" />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNode } from '@/composables/useNode'

const route = useRoute()
const { node, loadNode } = useNode()

const menuItems = [
  {
    name: 'node-edit-basic',
    label: '基础信息',
    description: '节点名称、描述等',
    icon: 'info'
  },
  {
    name: 'node-edit-network',
    label: '网络配置',
    description: 'IP地址、端口等',
    icon: 'lan'
  },
  {
    name: 'node-edit-config',
    label: '节点配置',
    description: 'VPN配置参数',
    icon: 'settings'
  },
  {
    name: 'node-edit-keys',
    label: '密钥管理',
    description: '公私钥管理',
    icon: 'key'
  }
]

onMounted(() => {
  const nodeId = route.params.id as string
  loadNode(nodeId)
})

const onNodeUpdated = () => {
  const nodeId = route.params.id as string
  loadNode(nodeId)
}
</script>
```

## 🔐 密钥管理详细设计

### 1. 密钥管理核心功能

#### A. 服务端生成密钥
- **流程**：用户点击"生成密钥" → 调用API生成 → 显示私钥确认对话框 → 用户确认保存 → 关闭对话框
- **安全措施**：
  - 私钥仅在生成时显示一次
  - 必须用户勾选"已保存"才能关闭对话框
  - 对话框不能通过ESC或点击外部关闭
  - 提供复制按钮方便用户保存

#### B. 本地生成并上传公钥
- **流程**：用户本地生成密钥对 → 上传公钥到服务器 → 用户自己保管私钥
- **实现方式**：
  - 提供密钥生成工具（使用WebCrypto API）
  - 用户上传64字符的ed25519公钥
  - 服务器验证公钥格式和有效性

#### C. 密钥规范（ed25519）
- **公钥**：64字符十六进制字符串
- **私钥**：128字符十六进制字符串
- **指纹**：公钥的SHA256哈希值前16字符

### 2. 密钥管理组件设计

#### A. PrivateKeyDisplayDialog.vue - 私钥显示对话框
```vue
<template>
  <q-dialog v-model="show" persistent no-esc-dismiss>
    <q-card style="width: 600px; max-width: 90vw">
      <q-card-section class="bg-negative text-white">
        <div class="text-h6">
          <q-icon name="warning" class="q-mr-sm" />
          重要：私钥安全提醒
        </div>
      </q-card-section>
      
      <q-card-section>
        <q-banner class="bg-orange-1 text-orange-8 q-mb-md">
          <template v-slot:avatar>
            <q-icon name="security" />
          </template>
          <div class="text-subtitle1 q-mb-sm">私钥仅显示一次，请立即保存！</div>
          <div class="text-body2">
            • 私钥用于节点间通信加密，请妥善保管<br>
            • 一旦关闭此对话框，私钥将无法再次查看<br>
            • 建议将私钥保存到安全的密码管理器中
          </div>
        </q-banner>

        <div class="q-mb-md">
          <q-input
            v-model="privateKey"
            label="ed25519私钥 (128字符)"
            type="textarea"
            rows="4"
            readonly
            class="private-key-display"
          >
            <template v-slot:append>
              <q-btn 
                flat 
                dense 
                icon="content_copy" 
                @click="copyPrivateKey"
                color="primary"
              >
                <q-tooltip>复制私钥</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <q-checkbox 
          v-model="userConfirmedSave" 
          label="我已经将私钥安全保存到本地"
          color="primary"
          class="q-mb-md"
        />

        <div class="text-caption text-grey-6">
          私钥长度: {{ privateKey.length }} 字符 (应为128字符)
        </div>
      </q-card-section>
      
      <q-card-actions align="right" class="bg-grey-1">
        <q-btn 
          flat 
          label="我已保存，关闭" 
          color="primary"
          :disable="!userConfirmedSave"
          @click="confirmAndClose"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { copyToClipboard } from 'quasar'
import { useNotify } from '@/composables/useNotify'

interface Props {
  modelValue: boolean
  privateKey: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmed-saved': []
}>()

const { notifySuccess, notifyError } = useNotify()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const userConfirmedSave = ref(false)

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    userConfirmedSave.value = false
  }
})

const copyPrivateKey = async () => {
  try {
    await copyToClipboard(props.privateKey)
    notifySuccess('私钥已复制到剪贴板')
  } catch (error) {
    notifyError('复制失败，请手动选择复制')
  }
}

const confirmAndClose = () => {
  if (userConfirmedSave.value) {
    emit('confirmed-saved')
    show.value = false
  }
}
</script>
```

#### B. PublicKeyUploadDialog.vue - 公钥上传对话框
```vue
<template>
  <q-dialog v-model="show" persistent>
    <q-card style="width: 600px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">上传公钥</div>
        <div class="text-caption text-grey-6">
          上传您本地生成的ed25519公钥
        </div>
      </q-card-section>
      
      <q-card-section>
        <div class="q-mb-md">
          <q-input
            v-model="publicKeyInput"
            label="ed25519公钥 (64字符)"
            type="textarea"
            rows="3"
            placeholder="输入64字符的十六进制公钥..."
            :rules="publicKeyRules"
            @blur="validatePublicKey"
          />
          <div class="text-caption text-grey-6 q-mt-xs">
            当前长度: {{ publicKeyInput.length }} 字符 (需要64字符)
          </div>
        </div>

        <q-banner v-if="validationError" class="bg-negative text-white q-mb-md">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ validationError }}
        </q-banner>

        <q-expansion-item 
          icon="help" 
          label="如何生成ed25519密钥？"
          class="bg-grey-1"
        >
          <div class="q-pa-md">
            <div class="text-subtitle2 q-mb-sm">使用命令行工具生成：</div>
            <q-code>
              # 使用ssh-keygen生成<br>
              ssh-keygen -t ed25519 -f mykey<br><br>
              # 使用openssl生成<br>
              openssl genpkey -algorithm ed25519 -out private.pem<br>
              openssl pkey -in private.pem -pubout -out public.pem
            </q-code>
            <div class="text-caption text-grey-6 q-mt-md">
              注意：请只上传公钥，私钥请自己妥善保管
            </div>
          </div>
        </q-expansion-item>
      </q-card-section>
      
      <q-card-actions align="right">
        <q-btn flat label="取消" @click="show = false" />
        <q-btn 
          color="primary" 
          label="上传公钥" 
          @click="uploadPublicKey"
          :loading="uploading"
          :disable="!isValidPublicKey"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotify } from '@/composables/useNotify'

interface Props {
  modelValue: boolean
  nodeId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploaded': [key: NodeKey]
}>()

const { notifySuccess, notifyError } = useNotify()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const publicKeyInput = ref('')
const uploading = ref(false)
const validationError = ref('')

const publicKeyRules = [
  (val: string) => !!val || '请输入公钥',
  (val: string) => val.length === 64 || '公钥必须是64字符',
  (val: string) => /^[0-9a-fA-F]+$/.test(val) || '公钥必须是十六进制字符'
]

const isValidPublicKey = computed(() => {
  return publicKeyInput.value.length === 64 && 
         /^[0-9a-fA-F]+$/.test(publicKeyInput.value)
})

const validatePublicKey = () => {
  validationError.value = ''
  if (!isValidPublicKey.value) {
    validationError.value = '公钥格式不正确，请检查长度和字符'
  }
}

const uploadPublicKey = async () => {
  if (!isValidPublicKey.value) return
  
  uploading.value = true
  try {
    const response = await nodeKeysService.uploadPublicKey(props.nodeId, {
      public_key: publicKeyInput.value,
      key_type: 'ed25519'
    })
    
    emit('uploaded', response.data)
    notifySuccess('公钥上传成功')
    show.value = false
    publicKeyInput.value = ''
  } catch (error) {
    notifyError('公钥上传失败')
  } finally {
    uploading.value = false
  }
}
</script>
```

#### C. LocalKeyGeneratorDialog.vue - 本地密钥生成对话框
```vue
<template>
  <q-dialog v-model="show" persistent>
    <q-card style="width: 700px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">本地生成密钥</div>
        <div class="text-caption text-grey-6">
          在浏览器中生成ed25519密钥对
        </div>
      </q-card-section>
      
      <q-card-section>
        <q-banner class="bg-orange-1 text-orange-8 q-mb-md">
          <template v-slot:avatar>
            <q-icon name="info" />
          </template>
          <div class="text-body2">
            注意：浏览器生成的密钥安全性相对较低，推荐使用专业密钥生成工具
          </div>
        </q-banner>

        <div v-if="!generated" class="text-center">
          <q-btn 
            color="primary" 
            label="生成密钥对" 
            @click="generateKeyPair"
            :loading="generating"
            icon="key"
          />
        </div>

        <div v-else>
          <div class="q-mb-md">
            <q-input
              v-model="generatedKeys.publicKey"
              label="公钥 (64字符)"
              type="textarea"
              rows="2"
              readonly
            >
              <template v-slot:append>
                <q-btn 
                  flat 
                  dense 
                  icon="content_copy" 
                  @click="copyPublicKey"
                  color="primary"
                >
                  <q-tooltip>复制公钥</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>

          <div class="q-mb-md">
            <q-input
              v-model="generatedKeys.privateKey"
              label="私钥 (128字符) - 请保存到安全位置"
              type="textarea"
              rows="3"
              readonly
            >
              <template v-slot:append>
                <q-btn 
                  flat 
                  dense 
                  icon="content_copy" 
                  @click="copyPrivateKey"
                  color="primary"
                >
                  <q-tooltip>复制私钥</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>

          <q-checkbox 
            v-model="userConfirmedSave" 
            label="我已经将私钥安全保存到本地"
            color="primary"
            class="q-mb-md"
          />

          <div class="text-caption text-grey-6">
            指纹: {{ generatedKeys.fingerprint }}
          </div>
        </div>
      </q-card-section>
      
      <q-card-actions align="right">
        <q-btn flat label="取消" @click="show = false" />
        <q-btn 
          v-if="generated"
          color="primary" 
          label="上传公钥" 
          @click="uploadGeneratedPublicKey"
          :loading="uploading"
          :disable="!userConfirmedSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { copyToClipboard } from 'quasar'
import { useNotify } from '@/composables/useNotify'
import { generateEd25519KeyPair } from '@/utils/keyGenerators'

interface Props {
  modelValue: boolean
  nodeId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploaded': [key: NodeKey]
}>()

const { notifySuccess, notifyError } = useNotify()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const generating = ref(false)
const uploading = ref(false)
const generated = ref(false)
const userConfirmedSave = ref(false)

const generatedKeys = ref({
  publicKey: '',
  privateKey: '',
  fingerprint: ''
})

const generateKeyPair = async () => {
  generating.value = true
  try {
    const keyPair = await generateEd25519KeyPair()
    generatedKeys.value = keyPair
    generated.value = true
  } catch (error) {
    notifyError('密钥生成失败')
  } finally {
    generating.value = false
  }
}

const copyPublicKey = async () => {
  try {
    await copyToClipboard(generatedKeys.value.publicKey)
    notifySuccess('公钥已复制到剪贴板')
  } catch (error) {
    notifyError('复制失败')
  }
}

const copyPrivateKey = async () => {
  try {
    await copyToClipboard(generatedKeys.value.privateKey)
    notifySuccess('私钥已复制到剪贴板')
  } catch (error) {
    notifyError('复制失败')
  }
}

const uploadGeneratedPublicKey = async () => {
  if (!userConfirmedSave.value) return
  
  uploading.value = true
  try {
    const response = await nodeKeysService.uploadPublicKey(props.nodeId, {
      public_key: generatedKeys.value.publicKey,
      key_type: 'ed25519'
    })
    
    emit('uploaded', response.data)
    notifySuccess('公钥上传成功')
    show.value = false
    resetDialog()
  } catch (error) {
    notifyError('公钥上传失败')
  } finally {
    uploading.value = false
  }
}

const resetDialog = () => {
  generated.value = false
  userConfirmedSave.value = false
  generatedKeys.value = {
    publicKey: '',
    privateKey: '',
    fingerprint: ''
  }
}
</script>
```

### 3. 密钥生成工具函数

#### keyGenerators.ts
```typescript
// 使用WebCrypto API生成ed25519密钥对
export async function generateEd25519KeyPair(): Promise<{
  publicKey: string
  privateKey: string
  fingerprint: string
}> {
  try {
    // 生成ed25519密钥对
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'Ed25519',
        namedCurve: 'Ed25519'
      },
      true, // 可导出
      ['sign', 'verify']
    )
    
    // 导出公钥
    const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey)
    const publicKey = Array.from(new Uint8Array(publicKeyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // 导出私钥
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    const privateKey = Array.from(new Uint8Array(privateKeyBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // 生成指纹
    const fingerprint = await generateFingerprint(publicKey)
    
    return {
      publicKey,
      privateKey,
      fingerprint
    }
  } catch (error) {
    throw new Error('密钥生成失败: ' + error.message)
  }
}

// 生成公钥指纹
async function generateFingerprint(publicKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(publicKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}

// 验证公钥格式
export function validateEd25519PublicKey(publicKey: string): boolean {
  return publicKey.length === 64 && /^[0-9a-fA-F]+$/.test(publicKey)
}

// 验证私钥格式
export function validateEd25519PrivateKey(privateKey: string): boolean {
  return privateKey.length === 128 && /^[0-9a-fA-F]+$/.test(privateKey)
}
```
              </div>
              <div class="text-body2 text-grey-7 q-mb-md">
                上传您本地生成的ed25519公钥
              </div>
              <q-btn 
                color="secondary" 
                label="上传公钥" 
                @click="showUploadDialog = true"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- 服务端生成密钥对话框 -->
    <ServerKeyGenerateDialog 
      v-model="showServerGenerateDialog"
      :node-id="nodeId"
      @generated="onKeyGenerated"
    />

    <!-- 上传公钥对话框 -->
    <PublicKeyUploadDialog 
      v-model="showUploadDialog"
      :node-id="nodeId"
      @uploaded="onKeyUploaded"
    />

    <!-- 私钥显示对话框（仅显示一次） -->
    <PrivateKeyDisplayDialog 
      v-model="showPrivateKeyDialog"
      :private-key="generatedPrivateKey"
      @confirmed-saved="onPrivateKeySaveConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNodeKeys } from '@/composables/useNodeKeys'
import ServerKeyGenerateDialog from '@/components/network/node-forms/ServerKeyGenerateDialog.vue'
import PublicKeyUploadDialog from '@/components/network/node-forms/PublicKeyUploadDialog.vue'
import PrivateKeyDisplayDialog from '@/components/network/node-forms/PrivateKeyDisplayDialog.vue'

interface Props {
  node: Node
}

const props = defineProps<Props>()
const nodeId = computed(() => props.node?.id || '')

const { 
  keys, 
  loadKeys, 
  generateServerKey, 
  uploadPublicKey,
  generating 
} = useNodeKeys()

const showServerGenerateDialog = ref(false)
const showUploadDialog = ref(false)
const showPrivateKeyDialog = ref(false)
const generatedPrivateKey = ref('')

onMounted(() => {
  if (nodeId.value) {
    loadKeys(nodeId.value)
  }
})

const onKeyGenerated = (result: KeyGenerationResult) => {
  generatedPrivateKey.value = result.private_key
  showPrivateKeyDialog.value = true
  showServerGenerateDialog.value = false
  loadKeys(nodeId.value)
}

const onKeyUploaded = () => {
  showUploadDialog.value = false
  loadKeys(nodeId.value)
}

const onPrivateKeySaveConfirmed = () => {
  showPrivateKeyDialog.value = false
  generatedPrivateKey.value = ''
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
```

## 🔐 密钥管理核心组件

### 1. PrivateKeyDisplayDialog.vue - 私钥显示对话框
```vue
<template>
  <q-dialog v-model="show" persistent no-esc-dismiss>
    <q-card style="width: 600px; max-width: 90vw">
      <q-card-section class="bg-negative text-white">
        <div class="text-h6">
          <q-icon name="warning" class="q-mr-sm" />
          重要：私钥安全提醒
        </div>
      </q-card-section>
      
      <q-card-section>
        <q-banner class="bg-orange-1 text-orange-8 q-mb-md">
          <template v-slot:avatar>
            <q-icon name="security" />
          </template>
          <div class="text-subtitle1 q-mb-sm">私钥仅显示一次，请立即保存！</div>
          <div class="text-body2">
            • 私钥用于节点间通信加密，请妥善保管<br>
            • 一旦关闭此对话框，私钥将无法再次查看<br>
            • 建议将私钥保存到安全的密码管理器中
          </div>
        </q-banner>

        <div class="q-mb-md">
          <q-input
            v-model="privateKey"
            label="ed25519私钥 (128字符)"
            type="textarea"
            rows="4"
            readonly
            class="private-key-display"
          >
            <template v-slot:append>
              <q-btn 
                flat 
                dense 
                icon="content_copy" 
                @click="copyPrivateKey"
                color="primary"
              >
                <q-tooltip>复制私钥</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <q-checkbox 
          v-model="userConfirmedSave" 
          label="我已经将私钥安全保存到本地"
          color="primary"
          class="q-mb-md"
        />

        <div class="text-caption text-grey-6">
          私钥长度: {{ privateKey.length }} 字符 (应为128字符)
        </div>
      </q-card-section>
      
      <q-card-actions align="right" class="bg-grey-1">
        <q-btn 
          flat 
          label="我已保存，关闭" 
          color="primary"
          :disable="!userConfirmedSave"
          @click="confirmAndClose"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { copyToClipboard } from 'quasar'
import { useNotify } from '@/composables/useNotify'

interface Props {
  modelValue: boolean
  privateKey: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmed-saved': []
}>()

const { notifySuccess, notifyError } = useNotify()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const userConfirmedSave = ref(false)

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    userConfirmedSave.value = false
  }
})

const copyPrivateKey = async () => {
  try {
    await copyToClipboard(props.privateKey)
    notifySuccess('私钥已复制到剪贴板')
  } catch (error) {
    notifyError('复制失败，请手动选择复制')
  }
}

const confirmAndClose = () => {
  if (userConfirmedSave.value) {
    emit('confirmed-saved')
    show.value = false
  }
}
</script>

<style scoped>
.private-key-display :deep(.q-field__control) {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>
```

### 2. PublicKeyUploadDialog.vue - 公钥上传对话框
```vue
<template>
  <q-dialog v-model="show">
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">上传公钥</div>
        <div class="text-caption text-grey-6">
          上传您本地生成的ed25519公钥
        </div>
      </q-card-section>
      
      <q-card-section>
        <q-form @submit="uploadKey" class="q-gutter-md">
          <q-input
            v-model="publicKey"
            label="ed25519公钥 (64字符)"
            type="textarea"
            rows="3"
            :rules="[
              val => !!val || '请输入公钥',
              val => val.length === 64 || '公钥长度应为64字符',
              val => /^[a-fA-F0-9]+$/.test(val) || '公钥应为十六进制字符'
            ]"
          />
          
          <div class="text-caption text-grey-6">
            当前长度: {{ publicKey.length }} / 64
          </div>
          
          <q-banner class="bg-blue-1 text-blue-8">
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            <div class="text-body2">
              请确保您已安全保存对应的私钥。上传公钥后，系统将使用此公钥进行节点间通信验证。
            </div>
          </q-banner>
        </q-form>
      </q-card-section>
      
      <q-card-actions align="right">
        <q-btn flat label="取消" @click="show = false" />
        <q-btn 
          color="primary" 
          label="上传" 
          @click="uploadKey"
          :loading="uploading"
          :disable="!isValidPublicKey"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNodeKeys } from '@/composables/useNodeKeys'
import { useNotify } from '@/composables/useNotify'

interface Props {
  modelValue: boolean
  nodeId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploaded': [key: NodeKey]
}>()

const { uploadPublicKey } = useNodeKeys()
const { notifySuccess, notifyError } = useNotify()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const publicKey = ref('')
const uploading = ref(false)

const isValidPublicKey = computed(() => {
  return publicKey.value.length === 64 && /^[a-fA-F0-9]+$/.test(publicKey.value)
})

const uploadKey = async () => {
  if (!isValidPublicKey.value) return
  
  uploading.value = true
  try {
    const result = await uploadPublicKey(props.nodeId, publicKey.value)
    notifySuccess('公钥上传成功')
    emit('uploaded', result)
    publicKey.value = ''
  } catch (error) {
    notifyError('公钥上传失败: ' + error.message)
  } finally {
    uploading.value = false
  }
}
</script>
```

## 🌐 API服务设计 (基于OpenAPI)

### 1. nodeService.ts - 基础节点服务
```typescript
import { api } from './api'
import type { Node, ApiResponse, PaginatedResponse } from '@/types'

export const nodeService = {
  // 基础CRUD (基于OpenAPI)
  async getNodes(params?: {
    page?: number
    per_page?: number
    status?: 'active' | 'inactive' | 'pending'
    search?: string
  }): Promise<PaginatedResponse<Node>> {
    const response = await api.get('/nodes', { params })
    return response.data
  },
  
  async getNode(id: string): Promise<ApiResponse<Node>> {
    const response = await api.get(`/nodes/${id}`)
    return response.data
  },
  
  async createNode(data: {
    node_name: string
    description?: string
  }): Promise<ApiResponse<Node>> {
    const response = await api.post('/nodes', data)
    return response.data
  },
  
  async updateNode(id: string, data: {
    node_name?: string
    description?: string
  }): Promise<ApiResponse<Node>> {
    const response = await api.put(`/nodes/${id}`, data)
    return response.data
  },
  
  async deleteNode(id: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/nodes/${id}`)
    return response.data
  },
  
  async updateNodeStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<ApiResponse<any>> {
    const response = await api.patch(`/nodes/${id}/status`, { status })
    return response.data
  }
}
```

### 2. nodeKeysService.ts - 密钥管理服务
```typescript
import { api } from './api'
import type { NodeKey, KeyGenerationResult, KeyUploadRequest, ApiResponse } from '@/types'

export const nodeKeysService = {
  // 获取节点密钥 (基于OpenAPI)
  async getNodeKeys(nodeId: string): Promise<ApiResponse<NodeKey[]>> {
    const response = await api.get(`/nodes/${nodeId}/keys`)
    return response.data
  },
  
  // 服务端生成密钥 (基于OpenAPI)
  async generateNodeKeys(nodeId: string): Promise<ApiResponse<NodeKey>> {
    const response = await api.post(`/nodes/${nodeId}/keys`)
    return response.data
  },
  
  // 上传用户公钥 (扩展API)
  async uploadPublicKey(nodeId: string, data: KeyUploadRequest): Promise<ApiResponse<NodeKey>> {
    const response = await api.post(`/nodes/${nodeId}/keys/upload`, data)
    return response.data
  },
  
  // 撤销密钥 (基于OpenAPI)
  async revokeNodeKeys(nodeId: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/nodes/${nodeId}/keys`)
    return response.data
  },
  
  // 本地生成ed25519密钥对
  generateLocalKeyPair(): { publicKey: string; privateKey: string; fingerprint: string } {
    // 使用crypto-js或其他加密库生成ed25519密钥对
    // 注意：浏览器环境下生成的密钥安全性有限，建议提醒用户
    return {
      publicKey: '', // 64字符
      privateKey: '', // 128字符  
      fingerprint: ''
    }
  }
}
```

### 3. nodeConfigService.ts - 节点配置服务 (简化版)
```typescript
import { api } from './api'
import type { NodeConfig, ConfigPreview, ApiResponse } from '@/types'

export const nodeConfigService = {
  // 获取节点配置
  async getNodeConfig(nodeId: string): Promise<ApiResponse<NodeConfig>> {
    const response = await api.get(`/nodes/${nodeId}/config`)
    return response.data
  },
  
  // 更新节点配置
  async updateNodeConfig(nodeId: string, config: NodeConfig): Promise<ApiResponse<NodeConfig>> {
    const response = await api.put(`/nodes/${nodeId}/config`, config)
    return response.data
  },
  
  // 预览配置文件
  async previewConfig(nodeId: string, config: NodeConfig): Promise<ApiResponse<ConfigPreview>> {
    const response = await api.post(`/nodes/${nodeId}/config/preview`, config)
    return response.data
  },
  
  // 下载配置文件
  async downloadConfig(nodeId: string): Promise<Blob> {
    const response = await api.get(`/nodes/${nodeId}/config/download`, {
      responseType: 'blob'
    })
    return response.data
  }
}
```

## 🧩 组合式函数设计

### 1. useNodes.ts - 节点列表管理
```typescript
export function useNodes() {
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0
  })
  
  const loadNodes = async (params?: {
    page?: number
    per_page?: number
    status?: string
    search?: string
  }) => {
    loading.value = true
    try {
      const response = await nodeService.getNodes(params)
      nodes.value = response.data
      pagination.value.rowsNumber = response.meta.total
    } catch (error) {
      console.error('Load nodes error:', error)
    } finally {
      loading.value = false
    }
  }
  
  const createNode = async (data: { node_name: string; description?: string }) => {
    const response = await nodeService.createNode(data)
    nodes.value.unshift(response.data)
    return response.data
  }
  
  const updateNode = async (id: string, data: { node_name?: string; description?: string }) => {
    const response = await nodeService.updateNode(id, data)
    const index = nodes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      nodes.value[index] = response.data
    }
    return response.data
  }
  
  const deleteNode = async (id: string) => {
    await nodeService.deleteNode(id)
    nodes.value = nodes.value.filter(n => n.id !== id)
  }
  
  // 状态相关工具函数
  const getNodeStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'circle'
      case 'inactive': return 'radio_button_unchecked'
      case 'pending': return 'hourglass_empty'
      default: return 'help'
    }
  }
  
  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'positive'
      case 'inactive': return 'grey'
      case 'pending': return 'warning'
      default: return 'grey'
    }
  }
  
  return {
    nodes: readonly(nodes),
    loading: readonly(loading),
    pagination,
    loadNodes,
    createNode,
    updateNode,
    deleteNode,
    getNodeStatusIcon,
    getNodeStatusColor
  }
}
```

### 2. useNode.ts - 单个节点管理
```typescript
export function useNode() {
  const node = ref<Node | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  
  const loadNode = async (id: string) => {
    loading.value = true
    try {
      const response = await nodeService.getNode(id)
      node.value = response.data
    } catch (error) {
      console.error('Load node error:', error)
    } finally {
      loading.value = false
    }
  }
  
  const updateNode = async (id: string, data: { node_name?: string; description?: string }) => {
    saving.value = true
    try {
      const response = await nodeService.updateNode(id, data)
      node.value = response.data
      return response.data
    } finally {
      saving.value = false
    }
  }
  
  const updateNodeStatus = async (id: string, status: 'active' | 'inactive' | 'pending') => {
    await nodeService.updateNodeStatus(id, status)
    if (node.value) {
      node.value.status = status
    }
  }
  
  return {
    node: readonly(node),
    loading: readonly(loading),
    saving: readonly(saving),
    loadNode,
    updateNode,
    updateNodeStatus
  }
}
```

### 3. useNodeKeys.ts - 密钥管理
```typescript
export function useNodeKeys() {
  const keys = ref<NodeKey[]>([])
  const loading = ref(false)
  const generating = ref(false)
  
  const loadKeys = async (nodeId: string) => {
    loading.value = true
    try {
      const response = await nodeKeysService.getNodeKeys(nodeId)
      keys.value = response.data
    } catch (error) {
      console.error('Load keys error:', error)
    } finally {
      loading.value = false
    }
  }
  
  const generateServerKey = async (nodeId: string): Promise<KeyGenerationResult> => {
    generating.value = true
    try {
      const response = await nodeKeysService.generateNodeKeys(nodeId)
      const key = response.data
      
      // 构造返回结果，包含私钥信息
      return {
        public_key: key.public_key,
        private_key: key.private_key || '',
        fingerprint: key.fingerprint || '',
        warning_shown: false,
        user_confirmed_save: false
      }
    } finally {
      generating.value = false
    }
  }
  
  const uploadPublicKey = async (nodeId: string, publicKey: string) => {
    const response = await nodeKeysService.uploadPublicKey(nodeId, {
      public_key: publicKey,
      key_type: 'ed25519'
    })
    
    keys.value.push(response.data)
    return response.data
  }
  
  const generateLocalKeyPair = () => {
    return nodeKeysService.generateLocalKeyPair()
  }
  
  const revokeKeys = async (nodeId: string) => {
    await nodeKeysService.revokeNodeKeys(nodeId)
    keys.value = []
  }
  
  return {
    keys: readonly(keys),
    loading: readonly(loading),
    generating: readonly(generating),
    loadKeys,
    generateServerKey,
    uploadPublicKey,
    generateLocalKeyPair,
    revokeKeys
  }
}
```

## 🎨 UI/UX 设计要求

### 1. 页面布局
- **页面标题**: 包含面包屑和操作按钮
- **搜索栏**: 简单的关键词搜索
- **节点网格**: 响应式卡片布局
- **分页组件**: 底部分页导航

### 2. 颜色方案
- **在线状态**: 绿色 (positive)
- **离线状态**: 灰色 (grey)
- **错误状态**: 红色 (negative)
- **待处理状态**: 橙色 (warning)

### 3. 交互设计
- **加载状态**: 骨架屏或加载动画
- **操作确认**: 删除操作需要确认对话框
- **错误处理**: Toast通知显示错误信息
- **成功反馈**: 操作成功后的Toast提示

### 4. 响应式设计
- **桌面端**: 每行4-6个卡片
- **平板端**: 每行2-3个卡片
- **移动端**: 每行1个卡片

## 🔐 安全和权限

### 1. 密钥管理原则
- **服务端生成**: 所有密钥由服务端生成和管理
- **客户端只读**: 前端只能查看公钥，不能查看私钥
- **安全传输**: 密钥传输使用HTTPS加密
- **定期轮换**: 支持密钥定期轮换功能

### 2. 权限控制
- **Zone级别**: 只能管理当前Zone的节点
- **操作权限**: 根据用户角色限制操作权限
- **API验证**: 所有API请求需要身份验证

## 🎯 新增功能亮点

### 1. 模块化编辑页面
- **独立组件**: 每个编辑标签页为独立Vue文件，便于维护
- **数据同步**: 各组件间通过props和emit进行数据同步
- **条件渲染**: 根据VPN类型和版本动态加载对应配置

### 2. 双模式配置系统
- **基本模式**: 显示必需参数，适合大多数用户
- **专家模式**: 展示所有可配置参数，满足高级用户需求
- **智能切换**: 保持配置数据一致性，支持模式间无缝切换

### 3. 动态配置表单
- **模板驱动**: 基于服务端配置模板动态生成表单
- **类型适配**: 根据参数类型自动选择合适的表单组件
- **实时验证**: 表单输入时进行实时验证和错误提示

### 4. 配置预览系统
- **实时预览**: 配置更改时实时生成预览
- **多格式支持**: 支持INI、JSON、键值对等多种格式
- **一键下载**: 支持配置文件直接下载

### 5. VPN多技术支持
- **GNB支持**: 完整的GNB虚拟网络配置
- **WireGuard支持**: 现代VPN协议配置
- **版本管理**: 支持多版本配置模板
- **扩展性**: 预留OpenVPN等其他VPN技术接入

## 📋 开发阶段 (重新规划，共18天)

### 阶段1：基础架构搭建 (3天)
- [ ] 创建基于OpenAPI的类型定义文件
  - [ ] `types/node.ts` - 节点基础类型
  - [ ] `types/nodeKeys.ts` - 节点密钥类型
  - [ ] `types/nodeConfig.ts` - 节点配置类型
  - [ ] `types/api.ts` - API响应类型
- [ ] 创建API服务层
  - [ ] `services/nodeService.ts` - 节点基础服务
  - [ ] `services/nodeKeysService.ts` - 密钥管理服务
  - [ ] `services/nodeConfigService.ts` - 配置管理服务
- [ ] 创建组合式函数
  - [ ] `composables/useNodes.ts` - 节点列表管理
  - [ ] `composables/useNode.ts` - 单个节点管理
  - [ ] `composables/useNodeKeys.ts` - 密钥管理
- [ ] 创建工具函数
  - [ ] `utils/keyGenerators.ts` - 密钥生成工具
  - [ ] `utils/nodeHelpers.ts` - 节点辅助函数
- [ ] 设置路由配置

### 阶段2：节点列表页面 (2天)
- [ ] 创建 `NodesPage.vue` 主页面
- [ ] 创建 `NodeCard.vue` 节点卡片组件
- [ ] 创建 `NodeStatusBadge.vue` 状态标识组件
- [ ] 创建 `NodeQuickActions.vue` 快速操作组件
- [ ] 实现搜索和分页功能
- [ ] 添加加载状态和错误处理

### 阶段3：节点详情页面 (2天)
- [ ] 创建 `NodeDetailPage.vue` 详情页面
- [ ] 实现节点基础信息展示
- [ ] 实现节点统计信息展示
- [ ] 添加操作按钮（编辑、删除）
- [ ] 实现响应式布局

### 阶段4：节点创建页面 (1天)
- [ ] 创建 `NodeCreatePage.vue` 创建页面
- [ ] 实现简化的创建表单
- [ ] 集成表单验证
- [ ] 实现创建成功后自动跳转到编辑页面

### 阶段5：节点编辑页面架构 (2天)
- [ ] 创建 `NodeEditLayout.vue` 编辑页面布局
- [ ] 实现左侧导航菜单
- [ ] 实现面包屑导航
- [ ] 创建编辑页面的路由配置
- [ ] 实现页面间的数据同步

### 阶段6：基础信息编辑页面 (1天)
- [ ] 创建 `BasicInfoPage.vue` 基础信息编辑页
- [ ] 创建 `BasicInfoForm.vue` 基础信息表单组件
- [ ] 实现表单验证和保存功能
- [ ] 添加成功/失败反馈

### 阶段7：密钥管理页面 (3天)
- [ ] 创建 `KeyManagementPage.vue` 密钥管理页面
- [ ] 创建 `PrivateKeyDisplayDialog.vue` 私钥显示对话框
- [ ] 创建 `PublicKeyUploadDialog.vue` 公钥上传对话框
- [ ] 创建 `LocalKeyGeneratorDialog.vue` 本地密钥生成对话框
- [ ] 实现服务端密钥生成功能
- [ ] 实现本地密钥生成功能（WebCrypto API）
- [ ] 实现公钥上传功能
- [ ] 实现私钥只显示一次的安全机制
- [ ] 实现用户确认保存的强制流程

### 阶段8：网络配置编辑页面 (2天)
- [ ] 创建 `NetworkConfigPage.vue` 网络配置编辑页
- [ ] 创建 `NetworkConfigForm.vue` 网络配置表单组件
- [ ] 实现网络配置表单验证
- [ ] 实现配置保存功能
- [ ] 添加配置预览功能

### 阶段9：节点配置编辑页面 (3天)
- [ ] 创建 `NodeConfigPage.vue` 节点配置编辑页
- [ ] 创建 `NodeConfigForm.vue` 节点配置表单组件
- [ ] 实现基本模式/专家模式切换
- [ ] 实现动态配置表单生成
- [ ] 实现配置验证和保存
- [ ] 实现配置预览功能
- [ ] 添加配置模板支持

### 阶段10：测试和优化 (3天)
- [ ] 完善所有表单验证
- [ ] 优化用户体验和交互
- [ ] 完善错误处理和反馈
- [ ] 进行移动端适配测试
- [ ] 性能优化和代码重构
- [ ] 完整功能测试
- [ ] 密钥管理安全性测试

## 🎯 成功标准 (更新版)

### 1. 功能完整性
- [ ] 节点列表页面正常显示，支持搜索和分页
- [ ] 节点详情页面完整展示节点信息
- [ ] 节点创建流程简化，创建后自动跳转编辑
- [ ] 节点编辑页面支持多个独立子页面
- [ ] 密钥管理支持服务端生成和本地上传两种方式
- [ ] 私钥只显示一次，用户必须确认保存
- [ ] 所有API调用基于OpenAPI文档，不使用模拟数据

### 2. 用户体验
- [ ] 界面美观，符合Quasar设计规范
- [ ] 页面导航清晰，面包屑导航完整
- [ ] 操作流程直观，减少用户学习成本
- [ ] 表单验证实时反馈，错误提示明确
- [ ] 加载状态显示，避免用户等待焦虑

### 3. 技术实现
- [ ] 代码结构清晰，组件职责单一
- [ ] 类型定义完整，基于OpenAPI规范
- [ ] 错误处理完善，用户友好的错误提示
- [ ] 性能优化，页面加载速度快
- [ ] 安全性保障，特别是密钥管理部分

### 4. 移动端适配
- [ ] 响应式设计，支持移动端操作
- [ ] 触摸友好的交互设计
- [ ] 移动端导航体验优化

### 5. 密钥管理安全
- [ ] 私钥只在生成时显示一次
- [ ] 用户必须确认保存私钥才能关闭对话框
- [ ] 本地生成的密钥有安全提示
- [ ] 公钥上传时进行格式验证
- [ ] ed25519密钥规范严格遵循（公钥64字符，私钥128字符）

## � 技术要点

### 1. 密钥安全
- 使用 WebCrypto API 进行本地密钥生成
- 私钥显示对话框使用 `persistent` 和 `no-esc-dismiss` 属性
- 强制用户确认保存流程
- 密钥格式严格验证

### 2. 页面架构
- 使用 Vue Router 的嵌套路由
- 页面间数据通过 composables 共享
- 独立页面降低复杂度，便于维护

### 3. API集成
- 所有接口基于 OpenAPI 文档
- 统一的错误处理和响应格式
- 请求追踪ID支持

### 4. 用户体验
- 简化的节点创建流程
- 清晰的页面导航
- 实时的表单验证反馈

---

**重要提醒**：
1. **不实现连接信息和操作日志**
2. **密钥管理严格遵循安全规范**
3. **所有API调用基于OpenAPI文档**
4. **页面架构采用独立页面，不使用对话框**
5. **ed25519密钥规范：公钥64字符，私钥128字符**
