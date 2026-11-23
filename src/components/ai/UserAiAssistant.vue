<template>
  <q-dialog v-model="open" position="right" full-height transition-show="slide-left" transition-hide="slide-right">
    <q-card class="ai-card column no-wrap">
      <q-toolbar class="ai-toolbar">
        <q-icon name="smart_toy" size="22px" class="q-mr-sm" />
        <div class="column">
          <div class="text-subtitle1">{{ title }}</div>
          <div class="text-caption text-grey-7">{{ subtitle }}</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="restart_alt" :aria-label="t('ai.clear')" :disable="streaming" @click="reset">
          <q-tooltip>{{ t('ai.clear') }}</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="close" :aria-label="t('common.close')" @click="open = false" />
      </q-toolbar>

      <q-separator />

      <q-banner v-if="!loggedIn" dense class="bg-warning text-dark">
        {{ t('ai.needLogin') }}
      </q-banner>
      <q-banner v-else-if="error" dense class="bg-negative text-white">
        <div class="row items-start no-wrap">
          <q-icon name="error_outline" class="q-mr-sm q-mt-xs" />
          <div class="col">{{ error }}</div>
          <q-btn flat dense icon="close" @click="error = ''" />
        </div>
      </q-banner>
      <q-banner v-else-if="fallbackNotice" dense class="bg-info text-white">{{ t('ai.fallbackNotice') }}</q-banner>

      <q-scroll-area ref="scrollRef" class="col q-pa-md">
        <div v-if="messages.length === 0" class="empty">
          <div class="text-subtitle2 q-mb-sm">{{ t('ai.emptyTitle') }}</div>
          <div class="text-caption text-grey-7 q-mb-md">{{ t('ai.emptyHint') }}</div>
          <div class="q-gutter-sm">
            <q-chip
              v-for="question in quickQuestions"
              :key="question"
              clickable
              outline
              color="primary"
              :disable="streaming"
              @click="askQuick(question)"
            >{{ question }}</q-chip>
          </div>
        </div>

        <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
          <div class="bubble" :class="message.role">
            <div v-if="message.role === 'assistant' && message.pending && !message.content" class="typing">
              <q-spinner-dots size="18px" />
              <span class="q-ml-sm text-caption">{{ t('ai.thinking') }}</span>
            </div>
            <div v-else class="content">{{ displayContent(message) }}</div>
            <div v-if="actionMarkers && message.role === 'assistant'" class="action-row">
              <q-btn
                v-for="id in messageActionIds(message)"
                :key="id"
                dense
                unelevated
                color="primary"
                icon="build"
                :label="t('ai.runAction', { title: actionTitle(id) })"
                class="q-mr-sm q-mt-sm"
                @click="emit('action-request', id)"
              />
            </div>
          </div>
        </div>

        <div v-if="toolTraces.length > 0" class="tools">
          <div v-for="(trace, index) in toolTraces" :key="index" class="tool-row text-caption">
            <q-spinner v-if="trace.state === 'running'" size="12px" class="q-mr-xs" />
            <q-icon v-else :name="trace.state === 'error' ? 'error_outline' : 'check_circle'" size="14px" class="q-mr-xs" :class="trace.state === 'error' ? 'text-negative' : 'text-positive'" />
            <span>{{ toolLabel(trace) }}</span>
          </div>
        </div>

        <div v-if="sources.length > 0" class="sources q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">{{ t('ai.sources') }}</div>
          <div v-for="(source, index) in sources" :key="index" class="source-item text-caption">
            <q-icon name="article" size="14px" class="q-mr-xs" />
            <span>{{ sourceLabel(source) }}</span>
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
          :placeholder="t('ai.placeholder')"
          :disable="!loggedIn"
          @keydown.enter.exact.prevent="send"
        />
        <div class="row items-center q-mt-sm">
          <span class="text-caption text-grey-7">{{ draft.length }} / 2000</span>
          <q-space />
          <q-btn v-if="streaming" outline color="negative" icon="stop" :label="t('ai.stop')" @click="stop" />
          <q-btn v-else color="primary" unelevated icon="send" :label="t('ai.send')" :disable="!canSend" @click="send" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { askUserAi, resolveTenantSlug, streamUserAiChat, shouldFallback, type ChatMessage, type ChatToolTrace } from '../../services/ai/userAiChat'
import { tokenManager } from '../../utils/tokenManager'
import { extractActionIds, stripActionMarkers } from '../../services/ai/actionMarkers'

interface UiMessage extends ChatMessage {
  pending?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  /** 本地排障模式：把脱敏摘要作为首轮上下文（只在发送时拼接，不显示在气泡里） */
  contextSnapshot?: string
  titleOverride?: string
  subtitleOverride?: string
  /** 可执行动作目录（本地模式）：回答里的 [[action:id]] 会渲染成按钮 */
  actions?: Array<{ id: string; title: string }>
  /** 是否解析动作标记（云端助手不开） */
  actionMarkers?: boolean
}>(), {
  contextSnapshot: '',
  titleOverride: '',
  subtitleOverride: '',
  actions: () => [],
  actionMarkers: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'action-request': [id: string]
}>()

const knownActionIds = computed(() => props.actions.map((action) => action.id))

function displayContent(message: UiMessage): string {
  return props.actionMarkers && message.role === 'assistant'
    ? stripActionMarkers(message.content)
    : message.content
}

function messageActionIds(message: UiMessage): string[] {
  return props.actionMarkers && message.role === 'assistant'
    ? extractActionIds(message.content, knownActionIds.value)
    : []
}

function actionTitle(id: string): string {
  return props.actions.find((action) => action.id === id)?.title ?? id
}

const { t } = useI18n()

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const title = computed(() => props.titleOverride || t('ai.title'))
const subtitle = computed(() => props.subtitleOverride || t('ai.subtitle'))

const loggedIn = computed(() => Boolean(tokenManager.getAccessToken()))

const messages = ref<UiMessage[]>([])
const draft = ref('')
const streaming = ref(false)
const error = ref('')
const fallbackNotice = ref(false)
const conversationId = ref<number | null>(null)
const toolTraces = ref<ChatToolTrace[]>([])
const sources = ref<Array<Record<string, unknown>>>([])
const scrollRef = ref<any>(null)
let controller: AbortController | null = null

const quickQuestions = computed(() => [
  t('ai.quick.nodes'),
  t('ai.quick.utc'),
  t('ai.quick.troubleshoot'),
])

const canSend = computed(() => loggedIn.value && !streaming.value && draft.value.trim() !== '')

function scrollToBottom(): void {
  nextTick(() => {
    const target = scrollRef.value
    if (target && typeof target.setScrollPercentage === 'function') {
      target.setScrollPercentage('vertical', 1, 0)
    }
  })
}

function reset(): void {
  controller?.abort()
  controller = null
  messages.value = []
  toolTraces.value = []
  sources.value = []
  conversationId.value = null
  error.value = ''
  fallbackNotice.value = false
  streaming.value = false
}

function askQuick(question: string): void {
  draft.value = question
  send()
}

const TOOL_LABELS: Record<string, string> = {
  'mynet_user_nodes_list': '查询你的节点',
  'mynet_user_connections_list': '查询你的连接',
  'mynet_user_services_list': '查询你的服务',
  'mynet_user_utc_status': '查询 UTC 状态',
  'mynet_user_kb_search': '查阅使用手册',
  knowledge_search: '查阅资料',
}

function toolLabel(trace: ChatToolTrace): string {
  const name = TOOL_LABELS[trace.name] ?? trace.name
  if (trace.state === 'running') return t('ai.toolRunning', { name })
  if (trace.state === 'error') return t('ai.toolError', { name })
  return t('ai.toolDone', { name })
}

function sourceLabel(source: Record<string, unknown>): string {
  const title = source.title ?? source.name ?? source.document_name ?? source.id
  const heading = source.heading ?? source.section
  const base = typeof title === 'string' ? title : t('ai.sources')
  return typeof heading === 'string' && heading !== '' ? `${base} · ${heading}` : base
}

async function send(): Promise<void> {
  const question = draft.value.trim()
  if (!canSend.value || question === '') return

  error.value = ''
  fallbackNotice.value = false
  sources.value = []
  toolTraces.value = []
  controller?.abort()
  controller = new AbortController()

  messages.value.push({ role: 'user', content: question })
  draft.value = ''

  const reply: UiMessage = { role: 'assistant', content: '', pending: true }
  messages.value.push(reply)
  streaming.value = true
  scrollToBottom()

  // 本地排障模式：把脱敏摘要拼进**本轮**提问（首轮），气泡里仍显示原问题
  const contextPrefix = props.contextSnapshot && messages.value.length <= 2
    ? `${props.contextSnapshot}\n\n---\n问题：`
    : ''

  const outgoing: ChatMessage[] = messages.value
    .filter((message) => !message.pending)
    .map((message) => ({ role: message.role, content: message.content }))

  if (contextPrefix !== '') {
    const last = outgoing[outgoing.length - 1]
    if (last) last.content = `${contextPrefix}${last.content}`
  }

  try {
    const result = await streamUserAiChat({
      messages: outgoing,
      conversationId: conversationId.value,
      signal: controller.signal,
      onEvent: (event) => {
        if (event.type === 'text') {
          reply.content += event.text
          scrollToBottom()
        } else if (event.type === 'data') {
          for (const item of event.data) {
            const record = item as Record<string, unknown> | null
            if (record?.type === 'meta' && typeof record.conversation_id === 'number') {
              conversationId.value = record.conversation_id
            }
          }
        } else if (event.type === 'tool-call') {
          const id = event.id
          const name = event.toolName ?? id ?? 'tool'
          const existing = toolTraces.value.find((trace) => id !== undefined && trace.id === id)
          if (existing) existing.state = 'running'
          else toolTraces.value.push({ id, name, state: 'running' })
        } else if (event.type === 'tool-result') {
          const trace = toolTraces.value.find((item) => item.id !== undefined && item.id === event.id)
          if (trace) {
            const failed = Boolean(
              event.result && typeof event.result === 'object'
              && (event.result as Record<string, unknown>).error,
            )
            trace.state = failed ? 'error' : 'done'
          }
        }
        scrollToBottom()
      },
    })

    conversationId.value = result.conversationId
    // 流式增量已在 onEvent 里写入；这里兜底（服务端只在结束时才知道的完整文本）
    if (reply.content === '') reply.content = result.text
    reply.pending = false
    if (result.tools.length > 0) toolTraces.value = result.tools
    if (result.error) {
      error.value = result.error
    } else if (result.text.trim() === '') {
      error.value = t('ai.errorGeneric')
    }
  } catch (cause: any) {
    const status = Number(cause?.status ?? 0)
    if (status !== 0 && shouldFallback(status)) {
      // Node 未部署/未开通：退到同步 ask（需要 tenant_slug 定位租户）
      try {
        const slug = await resolveTenantSlug()
        if (!slug) throw new Error(t('ai.errorGeneric'))
        fallbackNotice.value = true
        const result = await askUserAi(question, slug)
        reply.content = result.answer
        reply.pending = false
        sources.value = result.sources
        if (!result.answer) error.value = t('ai.errorGeneric')
      } catch (fallbackError: any) {
        reply.pending = false
        error.value = fallbackError?.message || t('ai.errorGeneric')
      }
    } else if (cause?.name === 'AbortError') {
      reply.pending = false
    } else {
      reply.pending = false
      error.value = cause?.message || t('ai.errorGeneric')
    }
  } finally {
    streaming.value = false
    controller = null
    scrollToBottom()
  }
}

function stop(): void {
  controller?.abort()
  controller = null
  streaming.value = false
}

watch(() => props.modelValue, (value) => {
  if (value) scrollToBottom()
})
</script>

<style scoped>
.ai-card { width: 520px; max-width: 96vw; height: 100vh; }
.ai-toolbar { background: var(--q-primary); color: #fff; }
.ai-toolbar .text-caption { color: rgba(255, 255, 255, 0.75); }
.empty { padding: 24px 8px; text-align: center; }
.message { display: flex; margin-bottom: 12px; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }
.bubble { max-width: 86%; padding: 10px 12px; border-radius: 12px; white-space: pre-wrap; word-break: break-word; }
.bubble.user { background: var(--q-primary); color: #fff; border-bottom-right-radius: 4px; }
.bubble.assistant { background: #f1f5f9; color: #0f172a; border-bottom-left-radius: 4px; }
.body--dark .bubble.assistant { background: #1e293b; color: #e2e8f0; }
.typing { display: flex; align-items: center; }
.tools { display: flex; flex-direction: column; gap: 4px; margin: 4px 0 8px; color: #64748b; }
.tool-row { display: flex; align-items: center; }
.sources { border-top: 1px dashed #cbd5e1; padding-top: 8px; }
.source-item { display: flex; align-items: center; color: #475569; }
.compose { background: var(--q-card-background, #fff); }
</style>
