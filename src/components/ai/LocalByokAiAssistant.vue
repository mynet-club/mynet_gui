<template>
  <q-dialog v-model="open" position="right" full-height transition-show="slide-left" transition-hide="slide-right">
    <q-card class="ai-card column no-wrap">
      <q-toolbar class="ai-toolbar">
        <q-icon name="smart_toy" size="22px" class="q-mr-sm" />
        <div class="column">
          <div class="text-subtitle1">本机 AI 助手</div>
          <div class="text-caption subtitle-text">
            {{ activeModelBadge }}
          </div>
        </div>
        <q-space />
        <q-btn
          flat
          round
          dense
          :icon="showSettings ? 'expand_less' : 'tune'"
          aria-label="模型与 Key 设置"
          @click="showSettings = !showSettings"
        >
          <q-tooltip>模型与 Key 设置</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="restart_alt" aria-label="清空对话" :disable="streaming" @click="reset">
          <q-tooltip>清空对话</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="close" aria-label="关闭" @click="open = false" />
      </q-toolbar>

      <!-- 模型与 API Key 配置区（Key 仅存本机浏览器 localStorage） -->
      <q-slide-transition>
        <div v-show="showSettings" class="settings-panel q-pa-md">
          <div class="text-caption text-grey-7 q-mb-sm">
            选择 Flash / 轻量模型并填写你自己的 API Key（仅保存在本机浏览器，不上传 MyNet 服务器）。
          </div>

          <q-select
            v-model="form.provider"
            :options="providerOptions"
            emit-value
            map-options
            outlined
            dense
            label="模型提供商"
            class="q-mb-sm"
            @update:model-value="onProviderChange"
          />

          <q-select
            v-if="currentPreset.models.length > 0"
            v-model="form.model"
            :options="currentPreset.models"
            use-input
            hide-selected
            fill-input
            new-value-mode="add"
            outlined
            dense
            label="模型（可直接选 Flash 模型或手动输入）"
            class="q-mb-sm"
            @input-value="(val: string) => { if (val) form.model = val }"
          />
          <q-input
            v-else
            v-model="form.model"
            outlined
            dense
            label="模型名称"
            placeholder="例如：gemini-2.5-flash / qwen-flash / deepseek-chat"
            class="q-mb-sm"
          />

          <q-input
            v-model="form.apiKey"
            :type="showKey ? 'text' : 'password'"
            outlined
            dense
            label="API Key"
            :placeholder="currentPreset.keyPlaceholder"
            class="q-mb-sm"
          >
            <template #append>
              <q-icon
                :name="showKey ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showKey = !showKey"
              />
            </template>
          </q-input>

          <q-input
            v-if="form.provider === 'custom' || showAdvancedUrl"
            v-model="form.baseUrl"
            outlined
            dense
            label="API Base URL（OpenAI 兼容）"
            placeholder="https://api.example.com/v1"
            class="q-mb-sm"
          />

          <div class="row items-center q-gutter-xs">
            <q-btn
              v-if="form.provider !== 'custom'"
              flat
              dense
              size="sm"
              color="grey-7"
              :label="showAdvancedUrl ? '隐藏地址' : '自定义地址'"
              @click="showAdvancedUrl = !showAdvancedUrl"
            />
            <q-space />
            <q-btn v-if="form.apiKey" flat dense size="sm" color="negative" label="清除 Key" @click="onClearKey" />
            <q-btn unelevated dense color="primary" label="保存配置" @click="onSaveConfig" />
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">{{ currentPreset.hint }}</div>
        </div>
      </q-slide-transition>

      <q-separator />

      <q-banner v-if="!isConfigured" dense class="bg-warning text-dark">
        请先在上方选择模型并输入你的 API Key 后即可开始对话。
      </q-banner>
      <q-banner v-else-if="error" dense class="bg-negative text-white">
        <div class="row items-start no-wrap">
          <q-icon name="error_outline" class="q-mr-sm q-mt-xs" />
          <div class="col">{{ error }}</div>
          <q-btn flat dense icon="close" @click="error = ''" />
        </div>
      </q-banner>

      <q-scroll-area ref="scrollRef" class="col q-pa-md">
        <div v-if="messages.length === 0" class="empty">
          <div class="text-subtitle2 q-mb-sm">本机智能排障与配置助手</div>
          <div class="text-caption text-grey-7 q-mb-md">
            已自动加载脱敏后的本机运行状态（不含私钥与 token）；涉及修改本机的建议需经你确认后执行。
          </div>
          <div class="q-gutter-sm">
            <q-chip
              v-for="question in quickQuestions"
              :key="question"
              clickable
              outline
              color="primary"
              :disable="streaming || !isConfigured"
              @click="askQuick(question)"
            >{{ question }}</q-chip>
          </div>
        </div>

        <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
          <div class="bubble" :class="message.role">
            <div v-if="message.role === 'assistant' && message.pending && !message.content" class="typing">
              <q-spinner-dots size="18px" />
              <span class="q-ml-sm text-caption">思考中…</span>
            </div>
            <div v-else-if="message.role === 'assistant'" class="content md-body" v-html="renderAssistantHtml(message)" />
            <div v-else class="content">{{ message.content }}</div>
            <div v-if="message.role === 'assistant'" class="action-row">
              <q-btn
                v-for="id in messageActionIds(message)"
                :key="id"
                dense
                unelevated
                color="primary"
                icon="build"
                :label="`执行：${actionTitle(id)}`"
                class="q-mr-sm q-mt-sm"
                @click="openRepairById(id)"
              />
            </div>
          </div>
        </div>
      </q-scroll-area>

      <q-separator />

      <div class="compose q-pa-md">
        <q-input
          v-model="draft"
          type="textarea"
          autogrow
          outlined
          dense
          :maxlength="2000"
          placeholder="输入问题，例如：帮我看看本机隧道和路由状态是否正常？"
          :disable="!isConfigured"
          @keydown.enter.exact.prevent="send"
        />
        <div class="row items-center q-mt-sm">
          <span class="text-caption text-grey-7">{{ draft.length }} / 2000</span>
          <q-space />
          <q-btn v-if="streaming" outline color="negative" icon="stop" label="停止" @click="stop" />
          <q-btn v-else color="primary" unelevated icon="send" label="发送" :disable="!canSend" @click="send" />
        </div>
      </div>
    </q-card>
  </q-dialog>

  <!-- 本机修复动作确认卡片（复用 repairActions 三道闸） -->
  <q-dialog v-model="repairOpen">
    <q-card style="min-width: 420px; max-width: 92vw">
      <q-card-section class="text-subtitle1">{{ repairTarget?.title }}</q-card-section>
      <q-card-section class="q-pt-none">
        <div class="text-caption text-grey-7 q-mb-sm">{{ repairTarget?.description }}</div>
        <div class="mono text-caption command-preview q-mb-sm">mynet {{ repairTarget?.argv.join(' ') }}</div>
        <div class="text-body2 q-mb-sm">影响：{{ repairTarget?.impact }}</div>
        <q-checkbox
          v-if="repairTarget?.mutating"
          v-model="repairAcknowledged"
          dense
          label="我已了解影响，并确认现在执行"
        />
        <div v-if="repairResult" class="q-mt-sm">
          <div class="text-caption text-grey-7">执行结果</div>
          <pre class="raw mono compact">{{ repairResult }}</pre>
        </div>
        <div v-if="repairError" class="text-negative text-caption q-mt-sm">{{ repairError }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" v-close-popup :disable="repairRunning" />
        <q-btn
          unelevated
          :color="repairTarget?.mutating ? 'warning' : 'primary'"
          :label="repairRunning ? '执行中…' : '确认执行'"
          :loading="repairRunning"
          :disable="repairTarget?.mutating ? !repairAcknowledged : false"
          @click="confirmRepair"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
  BYOK_PROVIDER_PRESETS,
  buildLocalSystemPrompt,
  clearByokApiKey,
  clearByokHistory,
  getProviderPreset,
  loadByokConfig,
  loadByokHistory,
  saveByokConfig,
  saveByokHistory,
  streamByokChat,
  type ByokConfig,
  type ByokMessage,
  type ByokProviderId,
} from '../../services/ai/byokChat'
import { buildLocalDiagnosticSnapshot } from '../../services/ai/localContext'
import { extractActionIds, stripActionMarkers } from '../../services/ai/actionMarkers'
import { renderAiMarkdown } from '../../services/ai/markdown'
import { localApi, localGatewayApi, listCloudNodes, LocalApiError } from '../../services/local/localApi'
import {
  REPAIR_ACTIONS,
  actionCatalogForPrompt,
  getRepairAction,
  runRepairAction,
  type RepairAction,
} from '../../services/local/repairActions'

interface UiMessage {
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const $q = useQuasar()

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const initial = loadByokConfig()
const form = reactive<ByokConfig>({ ...initial })
const showKey = ref(false)
const showAdvancedUrl = ref(false)
const showSettings = ref(!form.apiKey && form.provider !== 'custom')

const providerOptions = BYOK_PROVIDER_PRESETS.map((p) => ({ label: p.label, value: p.id }))
const currentPreset = computed(() => getProviderPreset(form.provider))

const isConfigured = computed(() => {
  if (!form.baseUrl.trim() || !form.model.trim()) return false
  if (form.provider === 'custom') return true
  return form.apiKey.trim() !== ''
})

const activeModelBadge = computed(() => {
  if (!isConfigured.value) return '未配置模型 Key · 点击右上角设置'
  return `${currentPreset.value.label} · ${form.model}`
})

function onProviderChange(providerId: ByokProviderId): void {
  const preset = getProviderPreset(providerId)
  form.baseUrl = preset.baseUrl
  form.model = preset.defaultModel
}

function onSaveConfig(): void {
  saveByokConfig(form)
  if (isConfigured.value) {
    showSettings.value = false
    $q.notify({ type: 'positive', message: `已保存模型配置（${form.model}）`, timeout: 1800 })
  } else {
    $q.notify({ type: 'warning', message: '请填全模型名称、接口地址与 API Key', timeout: 2200 })
  }
}

function onClearKey(): void {
  form.apiKey = ''
  clearByokApiKey()
  $q.notify({ type: 'info', message: '已清除本机保存的 API Key', timeout: 1800 })
}

const messages = ref<UiMessage[]>(loadByokHistory())
const draft = ref('')
const streaming = ref(false)
const error = ref('')
const scrollRef = ref<any>(null)
const localSnapshot = ref('')
let controller: AbortController | null = null

const knownActionIds = REPAIR_ACTIONS.map((a) => a.id)
const quickQuestions = [
  '帮我分析本机节点与隧道状态是否正常？',
  '节点连不上对端该按什么步骤排查？',
  '如何安全地刷新本机路由或重启隧道？',
]

const canSend = computed(() => isConfigured.value && !streaming.value && draft.value.trim() !== '')

function persistHistory(): void {
  saveByokHistory(
    messages.value
      .filter((m) => !m.pending && m.content.trim() !== '')
      .map((m) => ({ role: m.role, content: m.content })),
  )
}

function renderAssistantHtml(message: UiMessage): string {
  return renderAiMarkdown(stripActionMarkers(message.content))
}

function messageActionIds(message: UiMessage): string[] {
  return message.role === 'assistant' ? extractActionIds(message.content, knownActionIds) : []
}

function actionTitle(id: string): string {
  return getRepairAction(id)?.title ?? id
}

function scrollToBottom(): void {
  nextTick(() => {
    const target = scrollRef.value
    if (target && typeof target.setScrollPercentage === 'function') {
      target.setScrollPercentage('vertical', 1, 0)
    }
  })
}

async function refreshLocalSnapshot(): Promise<void> {
  try {
    // 本机数据一律经 localapi，云端数据经本机 relay（未登录或离线静默忽略）
    const [nodeStatus, statusObj, utcStatus, cloudNodes] = await Promise.all([
      localGatewayApi.getNodeStatus().catch(() => ({} as Record<string, unknown>)),
      localGatewayApi.getStatus().catch(() => ({} as Record<string, unknown>)),
      localApi.getUtcStatus().catch(() => null),
      listCloudNodes().catch(() => []),
    ])
    const mergedStatus: Record<string, unknown> = {
      ...statusObj,
      ...(utcStatus
        ? {
            utc_enabled: utcStatus.enabled,
            utc_state: utcStatus.running ? 'running' : 'stopped',
          }
        : {}),
    }
    const baseSnapshot = buildLocalDiagnosticSnapshot({
      scope: typeof statusObj.scope === 'string' ? statusObj.scope : null,
      state: typeof (nodeStatus as { state?: string }).state === 'string'
        ? (nodeStatus as { state?: string }).state ?? null
        : null,
      status: mergedStatus,
      actionCatalog: actionCatalogForPrompt(),
    })
    if (cloudNodes.length > 0) {
      const names = cloudNodes
        .slice(0, 12)
        .map((n) => n.node_name || n.name || n.node_id || n.id || 'unnamed')
        .join('、')
      localSnapshot.value = `${baseSnapshot}\n\n### 云端节点（经本机 relay，共 ${cloudNodes.length} 个）\n- ${names}`
    } else {
      localSnapshot.value = baseSnapshot
    }
  } catch {
    localSnapshot.value = buildLocalDiagnosticSnapshot({
      actionCatalog: actionCatalogForPrompt(),
    })
  }
}

function reset(): void {
  controller?.abort()
  controller = null
  messages.value = []
  clearByokHistory()
  error.value = ''
  streaming.value = false
}

function askQuick(question: string): void {
  draft.value = question
  send()
}

async function send(): Promise<void> {
  const question = draft.value.trim()
  if (!canSend.value || question === '') return

  saveByokConfig(form)
  error.value = ''
  controller?.abort()
  controller = new AbortController()

  if (!localSnapshot.value) {
    await refreshLocalSnapshot()
  }

  messages.value.push({ role: 'user', content: question })
  draft.value = ''

  const reply: UiMessage = { role: 'assistant', content: '', pending: true }
  messages.value.push(reply)
  streaming.value = true
  scrollToBottom()

  const outgoing: ByokMessage[] = [
    { role: 'system', content: buildLocalSystemPrompt(localSnapshot.value) },
    ...messages.value
      .filter((m) => !m.pending)
      .map((m): ByokMessage => ({ role: m.role, content: m.content })),
  ]

  try {
    const result = await streamByokChat({
      config: { ...form },
      messages: outgoing,
      signal: controller.signal,
      onDelta: (chunk) => {
        reply.content += chunk
        scrollToBottom()
      },
    })
    if (reply.content === '') reply.content = result.text
    reply.pending = false
    if (reply.content.trim() === '') {
      error.value = '模型未返回任何内容，请检查模型名称与 Key 配额。'
    }
  } catch (cause: any) {
    reply.pending = false
    if (cause?.name !== 'AbortError') {
      error.value = cause?.message || '调用模型接口失败'
    }
  } finally {
    streaming.value = false
    controller = null
    persistHistory()
    scrollToBottom()
  }
}

function stop(): void {
  controller?.abort()
  controller = null
  streaming.value = false
}

// ── 本机修复动作确认卡片 ──
const repairOpen = ref(false)
const repairRunning = ref(false)
const repairAcknowledged = ref(false)
const repairTarget = ref<RepairAction | null>(null)
const repairResult = ref('')
const repairError = ref('')

function openRepairById(id: string): void {
  const action = getRepairAction(id)
  if (!action) return
  repairTarget.value = action
  repairAcknowledged.value = false
  repairResult.value = ''
  repairError.value = ''
  repairOpen.value = true
}

async function confirmRepair(): Promise<void> {
  const action = repairTarget.value
  if (!action) return
  repairRunning.value = true
  repairError.value = ''
  repairResult.value = ''
  try {
    const result = await runRepairAction(action.id, {
      confirmed: action.mutating ? repairAcknowledged.value : true,
    })
    repairResult.value = ((result.stdout || '') + (result.stderr ? `\n${result.stderr}` : '')).trim() || '执行完成'
    await refreshLocalSnapshot()
  } catch (e) {
    repairError.value = e instanceof LocalApiError
      ? (e.stdout || e.stderr || e.message)
      : (e as Error).message
  } finally {
    repairRunning.value = false
  }
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    refreshLocalSnapshot().catch(() => undefined)
    scrollToBottom()
  }
})
</script>

<style scoped>
.ai-card { width: 520px; max-width: 96vw; height: 100vh; }
.ai-toolbar { background: var(--q-primary); color: #fff; }
.subtitle-text { color: rgba(255, 255, 255, 0.8); }
.settings-panel { background: rgba(15, 23, 42, 0.03); }
.body--dark .settings-panel { background: rgba(255, 255, 255, 0.04); }
.empty { padding: 24px 8px; text-align: center; }
.message { display: flex; margin-bottom: 12px; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }
.bubble { max-width: 86%; padding: 10px 12px; border-radius: 12px; word-break: break-word; }
.bubble.user { background: var(--q-primary); color: #fff; border-bottom-right-radius: 4px; white-space: pre-wrap; }
.bubble.assistant { background: #f1f5f9; color: #0f172a; border-bottom-left-radius: 4px; }
.body--dark .bubble.assistant { background: #1e293b; color: #e2e8f0; }
.md-body { line-height: 1.6; font-size: 13.5px; }
.md-body :deep(p) { margin: 0 0 8px; }
.md-body :deep(p:last-child) { margin-bottom: 0; }
.md-body :deep(h1), .md-body :deep(h2), .md-body :deep(h3), .md-body :deep(h4) { margin: 10px 0 6px; font-weight: 600; line-height: 1.35; }
.md-body :deep(h1) { font-size: 16px; }
.md-body :deep(h2) { font-size: 15px; }
.md-body :deep(h3) { font-size: 14px; }
.md-body :deep(ul), .md-body :deep(ol) { margin: 4px 0 8px; padding-left: 18px; }
.md-body :deep(li) { margin: 2px 0; }
.md-body :deep(code) { padding: 1px 4px; border-radius: 4px; background: rgba(15, 23, 42, 0.08); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.body--dark .md-body :deep(code) { background: rgba(255, 255, 255, 0.12); }
.md-body :deep(pre) { margin: 8px 0; padding: 10px; border-radius: 8px; background: #0f172a; color: #e2e8f0; overflow-x: auto; }
.md-body :deep(pre code) { padding: 0; background: transparent; color: inherit; }
.md-body :deep(blockquote) { margin: 6px 0; padding: 4px 10px; border-left: 3px solid var(--q-primary); background: rgba(15, 23, 42, 0.04); }
.md-body :deep(table) { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12.5px; }
.md-body :deep(th), .md-body :deep(td) { border: 1px solid rgba(148, 163, 184, 0.4); padding: 4px 8px; text-align: left; }
.md-body :deep(a) { color: var(--q-primary); text-decoration: underline; }
.typing { display: flex; align-items: center; }
.compose { background: var(--q-card-background, #fff); }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.command-preview { padding: 6px 10px; border-radius: 6px; background: #f1f5f9; color: #0f172a; }
.body--dark .command-preview { background: #1e293b; color: #e2e8f0; }
.raw { margin: 4px 0 0; padding: 8px; border-radius: 6px; background: #0f172a; color: #e2e8f0; overflow-x: auto; font-size: 12px; max-height: 220px; }
</style>
