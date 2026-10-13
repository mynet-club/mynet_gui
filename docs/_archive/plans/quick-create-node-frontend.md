# 一键快速创建节点 — 前端改造提示词

## 背景与目标

后端已提供 `POST /api/v1/nodes/quick-create` 接口，只需传入 `node_name` + `zone_id`，即可自动完成：
- 创建节点（vpn_type=gnb, node_type=edge）
- 从 IP 池自动分配 IP
- 写入默认配置（端口9016, MTU 1450, gnb_tun, multi_socket=on）

创建后节点处于 **UNCONFIGURED（-1）** 状态，用户只需再做两步即可使用：
1. 生成密钥 → `POST /api/v1/nodes/{id}/keys/generate`
2. 启用节点 → `PATCH /api/v1/nodes/{id}/status` `{"status": 1}`

前端目标：**在节点列表页增加"快速创建"入口，引导用户一步填写名称、一键完成创建，并内联引导完成密钥生成和启用。**

---

## 涉及文件清单

| 文件 | 操作 |
|------|------|
| `src/services/node/nodeService.ts` | 新增 `quickCreateNode()` 方法 |
| `src/pages/node/NodeListPage.vue` | 新增"快速创建"按钮，挂载对话框 |
| `src/components/node/QuickCreateDialog.vue` | 新建对话框组件（主体工作） |

---

## 一、nodeService.ts — 新增方法

在 `NodeService` 类中，紧跟 `createNode()` 方法之后，新增：

```ts
/**
 * 一键快速创建节点（使用默认配置，自动分配IP）
 * POST /api/v1/nodes/quick-create
 * @param nodeName 节点名称（3-255字符）
 * @param zoneId   所属Zone ID
 */
async quickCreateNode(nodeName: string, zoneId: number): Promise<ApiResponse<QuickCreateNodeResponse>> {
  const response = await api.post('/nodes/quick-create', {
    node_name: nodeName,
    zone_id: zoneId,
  })
  return response.data
}
```

同时在 `src/types/node.ts`（或相应的类型文件）中新增类型：

```ts
export interface QuickCreateNodeResponse {
  node: {
    node_id: number | string
    node_name: string
    vpn_type: string
    node_ip: string | null   // 已转为点分十进制，如 "10.1.0.5"
    node_type: number
    created_at: string
  }
  config: {
    nodeid: number | string
    ifname: string
    listen: number
    mtu: number
    multi_socket: string
    direct_forwarding: string
    unified_forwarding: string
    standard_forwarding: string
    address_secure: string
  }
  next_steps: Record<string, string>
}
```

---

## 二、NodeListPage.vue — 按钮入口

在现有按钮组中，**紧跟"创建节点"按钮之后**，新增"快速创建"按钮：

```vue
<template #actions>
  <q-btn-group>
    <!-- 已有按钮：创建节点 -->
    <q-btn
      unelevated
      color="primary"
      icon="add"
      :label="$t('nodes.createNode')"
      @click="goToCreate"
      :disable="loading"
    />

    <!-- 新增：快速创建 -->
    <q-btn
      unelevated
      color="teal"
      icon="bolt"
      label="快速创建"
      @click="showQuickCreate = true"
      :disable="loading"
    />

    <!-- 已有按钮：刷新 -->
    <q-btn flat color="grey-7" icon="refresh" ... />
  </q-btn-group>
</template>
```

在 `<script setup>` 中新增：

```ts
import QuickCreateDialog from '../../components/node/QuickCreateDialog.vue'

const showQuickCreate = ref(false)

// 快速创建成功后刷新列表
const handleQuickCreated = () => {
  showQuickCreate.value = false
  loadNodes()
}
```

在模板尾部挂载对话框：

```vue
<QuickCreateDialog
  v-model="showQuickCreate"
  @created="handleQuickCreated"
/>
```

---

## 三、QuickCreateDialog.vue — 核心组件

### 交互流程

```
打开对话框
  │
  ├─ 第一屏：填写节点名称
  │    └─ [快速创建] → 调 API → 成功
  │
  └─ 第二屏：创建成功引导（内联 next_steps）
       ├─ 显示：节点名、IP、端口
       ├─ [生成密钥] → 调 generateNodeKeys() → 显示私钥（⚠️仅此一次）
       └─ [启用节点] → 调 updateNodeStatusCode(id, 1) → 完成
            └─ [前往节点详情] → router.push
```

### 组件模板结构（Quasar）

```vue
<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 420px; max-width: 560px">

      <!-- ── 第一屏：创建表单 ── -->
      <template v-if="step === 'form'">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="bolt" color="teal" size="md" class="q-mr-sm" />
          <span class="text-h6">快速创建节点</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-md">
            仅需填写名称，VPN类型、IP、默认配置均自动完成。
          </div>
          <q-input
            v-model="nodeName"
            label="节点名称"
            outlined
            autofocus
            :rules="[
              v => !!v || '名称不能为空',
              v => (v.length >= 3 && v.length <= 255) || '长度 3-255 字符'
            ]"
            @keyup.enter="doCreate"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="一键创建"
            color="teal"
            icon="bolt"
            :loading="creating"
            :disable="nodeName.length < 3"
            @click="doCreate"
          />
        </q-card-actions>
      </template>

      <!-- ── 第二屏：创建成功 + 引导 ── -->
      <template v-if="step === 'created'">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="check_circle" color="positive" size="md" class="q-mr-sm" />
          <span class="text-h6">节点创建成功</span>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeAndRefresh" />
        </q-card-section>

        <!-- 节点基本信息 -->
        <q-card-section>
          <q-list dense>
            <q-item>
              <q-item-section side><q-icon name="label" /></q-item-section>
              <q-item-section>名称：<strong>{{ createdNode?.node_name }}</strong></q-item-section>
            </q-item>
            <q-item>
              <q-item-section side><q-icon name="lan" /></q-item-section>
              <q-item-section>VPN IP：<strong>{{ createdNode?.node_ip ?? '分配中…' }}</strong></q-item-section>
            </q-item>
            <q-item>
              <q-item-section side><q-icon name="settings_ethernet" /></q-item-section>
              <q-item-section>端口：<strong>9016</strong>　接口：<strong>gnb_tun</strong></q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <!-- 引导步骤 -->
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">完成以下步骤即可上线使用：</div>

          <!-- Step 1: 生成密钥 -->
          <div class="row items-center q-mb-sm">
            <q-badge :color="keyGenerated ? 'positive' : 'grey'" label="1" class="q-mr-sm" />
            <span class="text-body2" :class="keyGenerated ? 'text-grey-5 text-strike' : ''">生成节点密钥</span>
            <q-space />
            <q-btn
              v-if="!keyGenerated"
              dense unelevated size="sm"
              color="primary" icon="vpn_key" label="生成密钥"
              :loading="generatingKey"
              @click="doGenerateKey"
            />
            <q-icon v-else name="check" color="positive" />
          </div>

          <!-- 私钥展示（仅一次）-->
          <q-banner v-if="privateKeyOnce" class="bg-amber-1 q-mb-sm" rounded>
            <template v-slot:avatar><q-icon name="warning" color="amber-8" /></template>
            <div class="text-caption text-amber-9">私钥仅显示一次，请立即保存！</div>
            <q-input
              :model-value="privateKeyOnce"
              type="textarea" rows="3" readonly outlined dense
              class="q-mt-xs"
            >
              <template v-slot:append>
                <q-btn flat dense icon="content_copy" @click="copyKey" />
              </template>
            </q-input>
          </q-banner>

          <!-- Step 2: 启用节点 -->
          <div class="row items-center">
            <q-badge :color="nodeEnabled ? 'positive' : (keyGenerated ? 'warning' : 'grey')" label="2" class="q-mr-sm" />
            <span class="text-body2" :class="nodeEnabled ? 'text-grey-5 text-strike' : ''">启用节点</span>
            <q-space />
            <q-btn
              v-if="!nodeEnabled"
              dense unelevated size="sm"
              color="teal" icon="play_arrow" label="启用"
              :loading="enabling"
              :disable="!keyGenerated"
              @click="doEnable"
            />
            <q-icon v-else name="check" color="positive" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="关闭" color="grey-7" @click="closeAndRefresh" />
          <q-btn
            v-if="nodeEnabled"
            unelevated label="查看节点" icon="open_in_new"
            color="primary"
            @click="goToDetail"
          />
        </q-card-actions>
      </template>

    </q-card>
  </q-dialog>
</template>
```

### 组件逻辑（script setup）

```ts
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth'
import { nodeService } from '../../services/node/nodeService'
import { nodeKeysService } from '../../services/node/nodeKeysService'
import type { QuickCreateNodeResponse } from '../../types/node'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'created'): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// ── 表单 ──
const nodeName = ref('')
const step = ref<'form' | 'created'>('form')
const creating = ref(false)
const createdNode = ref<QuickCreateNodeResponse['node'] | null>(null)
const createdNodeId = ref<string>('')

// ── 密钥 ──
const generatingKey = ref(false)
const keyGenerated = ref(false)
const privateKeyOnce = ref<string | null>(null)

// ── 启用 ──
const enabling = ref(false)
const nodeEnabled = ref(false)

// 重置状态（每次打开对话框时调用）
const reset = () => {
  nodeName.value = ''
  step.value = 'form'
  createdNode.value = null
  createdNodeId.value = ''
  keyGenerated.value = false
  privateKeyOnce.value = null
  nodeEnabled.value = false
}

// ── Step 0: 一键创建 ──
const doCreate = async () => {
  if (nodeName.value.length < 3) return
  const zoneId = authStore.currentZone?.zone_id
  if (!zoneId) {
    $q.notify({ type: 'negative', message: '当前无可用 Zone，请先切换或加入 Zone' })
    return
  }

  try {
    creating.value = true
    const res = await nodeService.quickCreateNode(nodeName.value, zoneId)
    if (res.success && res.data) {
      createdNode.value = res.data.node
      createdNodeId.value = String(res.data.node.node_id)
      step.value = 'created'
    } else {
      $q.notify({ type: 'negative', message: res.message || '创建失败，请重试' })
    }
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || '创建失败' })
  } finally {
    creating.value = false
  }
}

// ── Step 1: 生成密钥 ──
const doGenerateKey = async () => {
  try {
    generatingKey.value = true
    const res = await nodeKeysService.generateNodeKeys(createdNodeId.value, { key_type: 'ed25519' })
    if (res.success && res.data) {
      keyGenerated.value = true
      // 私钥仅在响应中出现一次
      privateKeyOnce.value = res.data.private_key ?? null
      $q.notify({ type: 'positive', message: '密钥生成成功，请立即保存私钥！' })
    } else {
      $q.notify({ type: 'negative', message: res.message || '密钥生成失败' })
    }
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || '密钥生成失败' })
  } finally {
    generatingKey.value = false
  }
}

// ── Step 2: 启用节点 ──
const doEnable = async () => {
  try {
    enabling.value = true
    await nodeService.updateNodeStatusCode(createdNodeId.value, 1)
    nodeEnabled.value = true
    $q.notify({ type: 'positive', message: '节点已启用' })
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || '启用失败' })
  } finally {
    enabling.value = false
  }
}

// 复制私钥
const copyKey = async () => {
  if (privateKeyOnce.value) {
    await navigator.clipboard.writeText(privateKeyOnce.value)
    $q.notify({ type: 'positive', message: '已复制到剪贴板' })
  }
}

// 关闭并通知父组件刷新列表
const closeAndRefresh = () => {
  open.value = false
  emit('created')
  reset()
}

// 前往节点详情
const goToDetail = () => {
  closeAndRefresh()
  router.push(`/app/nodes/${createdNodeId.value}`)
}

// 每次对话框打开时重置
watch(() => props.modelValue, v => { if (v) reset() })
</script>
```

---

## 四、注意事项

### zone_id 来源
`authStore.currentZone?.zone_id` — 已在 `src/stores/auth.ts` 中维护，登录后自动填充。若为 `null`，需提示用户先选择 Zone。

### 私钥安全
后端私钥**仅在 `keys/generate` 响应中返回一次**，之后无法再获取。前端必须：
- 在 UI 中给予醒目警告
- 提供"复制"按钮
- 不得把私钥持久化到 localStorage / Pinia

### 错误场景
| 错误 | 原因 | 提示文案 |
|------|------|---------|
| IP池无可用IP | IP池未配置或已用尽 | "当前IP池无可用地址，请联系管理员" |
| zone_id 缺失 | 未登录 / 无 Zone | "请先选择一个 Zone" |
| node_name 重复 | 同 Zone 下名称重复 | 返回 422，展示后端 message |

### API 路径确认
- 快速创建：`POST /api/v1/nodes/quick-create`
- 生成密钥：`POST /api/v1/nodes/{id}/keys/generate`  → 已有 `nodeKeysService.generateNodeKeys()`
- 启用节点：`PATCH /api/v1/nodes/{id}/status` `{"status": 1}` → 已有 `nodeService.updateNodeStatusCode()`

### 路由无需新增
整个流程在对话框内完成，不需要新增页面路由。
