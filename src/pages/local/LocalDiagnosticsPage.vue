<template>
  <div class="local-diagnostics">
    <div class="row items-center q-mb-sm">
      <div class="text-h5">诊断</div>
      <q-space />
      <span v-if="lastRun" class="text-caption text-grey-7 q-mr-sm">最近运行 {{ lastRun }}</span>
      <q-btn class="q-mr-sm" color="primary" unelevated dense icon="smart_toy" label="AI 排障" @click="aiOpen = true" />
      <q-btn outline color="primary" dense label="全部重跑" :loading="busy" @click="runAll" />
    </div>

    <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary" class="q-mb-none">
      <q-tab name="check" label="健康检查" />
      <q-tab name="parity" label="一致性" />
      <q-tab name="facts" label="运行事实" />
      <q-tab name="raw" label="原始状态 / 导出" />
      <q-tab name="repair" label="修复动作" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="check" class="panel-pad">
        <div class="row items-center q-gutter-sm q-mb-md">
          <q-btn color="primary" outline dense label="运行检查" :loading="checking" @click="runCheck" />
          <span class="text-caption text-grey-7">mynet check：配置、驱动与路由是否一致</span>
        </div>
        <pre v-if="checkOut" class="raw mono q-mt-sm">{{ checkOut }}</pre>
        <MynetEmpty v-else text="尚未运行健康检查" icon="fact_check" action-label="运行检查" :busy="checking" @action="runCheck" />
      </q-tab-panel>

      <q-tab-panel name="parity" class="panel-pad">
        <div class="row items-center q-gutter-sm q-mb-md">
          <q-btn color="primary" outline dense label="检查 parity" :loading="checkingParity" @click="runParity" />
          <span class="text-caption text-grey-7">node.conf 与对端约定是否一致</span>
        </div>
        <!-- 结果以 block / key / value 呈现（不裸甩 JSON） -->
        <template v-if="parity">
          <div class="info-card q-mb-sm">
            <div class="info-head">
              <div>
                <div class="info-title">结论</div>
                <div class="info-value">{{ parity.ok ? '一致' : '存在不一致' }}</div>
              </div>
              <span v-if="!parity.ok" class="text-negative text-caption">critical 需处理</span>
            </div>
            <dl class="kv q-mt-sm">
              <dt>配置文件</dt><dd class="mono">{{ parity.node_conf || '—' }}</dd>
              <dt v-if="parity.critical_miss?.length">严重项</dt>
              <dd v-if="parity.critical_miss?.length">{{ parity.critical_miss.join('、') }}</dd>
              <dt v-if="parity.warnings?.length">警告项</dt>
              <dd v-if="parity.warnings?.length">{{ parity.warnings.join('、') }}</dd>
              <dt>说明</dt><dd>{{ parity.hint || '—' }}</dd>
            </dl>
          </div>
          <div v-if="parity.error" class="info-card q-mb-sm">
            <div class="info-title">错误</div>
            <div class="info-value text-negative">{{ parity.error }}</div>
          </div>
          <div v-for="it in parity.items" :key="it.key" class="info-card q-mb-sm">
            <div class="info-head">
              <div>
                <div class="info-title">key</div>
                <div class="info-value mono">{{ it.key }}</div>
              </div>
              <span class="text-caption" :class="it.match ? 'text-positive' : it.critical ? 'text-negative' : 'text-warning'">
                {{ it.match ? '✓ 一致' : it.critical ? '✗ 不一致（critical）' : '⚠ 不一致' }}
              </span>
            </div>
            <dl class="kv q-mt-sm">
              <dt>local</dt><dd class="mono">{{ it.local || '—' }}</dd>
              <dt>remote</dt><dd class="mono">{{ it.remote || '—' }}</dd>
              <dt v-if="it.source">来源</dt><dd v-if="it.source">{{ it.source }}</dd>
              <dt v-if="it.hint">提示</dt><dd v-if="it.hint">{{ it.hint }}</dd>
            </dl>
          </div>
        </template>
        <pre v-else-if="parityOut" class="raw mono q-mt-sm">{{ parityOut }}</pre>
        <MynetEmpty v-else text="尚未运行一致性检查" icon="rule" action-label="检查 parity" :busy="checkingParity" @action="runParity" />
      </q-tab-panel>

      <q-tab-panel name="facts" class="panel-pad">
        <dl class="kv">
          <dt>状态</dt><dd>{{ status.state || '—' }}</dd>
          <dt>一句话</dt><dd>{{ status.one_line || status.detail || '—' }}</dd>
          <dt>接口 / IP</dt><dd class="mono">{{ status.tun_iface || '—' }} · {{ status.overlay_ip || '—' }}</dd>
          <dt>驱动进程</dt><dd>{{ status.process_up ? '运行中' : '未运行' }}</dd>
          <dt>系统路由</dt><dd>{{ status.routes_ok ? '正常' : '未就绪' }}（缺失 {{ (status.missing_routes || []).length }}）</dd>
          <dt>对端</dt><dd>{{ status.peers_routed ?? 0 }} / {{ status.peers_total ?? 0 }}</dd>
        </dl>
      </q-tab-panel>

      <q-tab-panel name="raw" class="panel-pad">
        <div class="row q-gutter-sm q-mb-sm">
          <q-btn outline color="primary" dense label="导出 system.json" :loading="exporting" @click="onExport" />
          <q-btn flat dense label="查看日志" to="/logs" />
        </div>
        <pre class="raw mono compact">{{ statusRaw }}</pre>
      </q-tab-panel>

      <q-tab-panel name="repair" class="panel-pad">
        <div class="text-caption text-grey-7 q-mb-md">
          目录内动作才可执行（命令是常量，AI 不参与构造）。会改动本机状态的动作需在确认卡片上勾选后才能执行。
        </div>
        <div class="row q-col-gutter-md">
          <div v-for="action in repairActions" :key="action.id" class="col-12 col-md-6">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-xs">
                <div class="row items-center no-wrap">
                  <div class="text-subtitle2">{{ action.title }}</div>
                  <q-space />
                  <q-chip dense size="sm" :color="action.mutating ? 'warning' : 'positive'" text-color="white">
                    {{ action.mutating ? '会改动本机' : '只读' }}
                  </q-chip>
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">{{ action.description }}</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="text-caption text-grey-8 q-mb-xs">影响：{{ action.impact }}</div>
                <div class="mono text-caption command-preview">mynet {{ action.argv.join(' ') }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn outline :color="action.mutating ? 'warning' : 'primary'" dense
                  :label="action.mutating ? '执行（需确认）' : '执行'" @click="openRepair(action)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- 修复动作确认卡片：argv 来自服务层目录常量，不是 AI 生成 -->
    <q-dialog v-model="repairOpen">
      <q-card style="min-width: 420px; max-width: 92vw">
        <q-card-section class="text-subtitle1">{{ repairTarget?.title }}</q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey-7 q-mb-sm">{{ repairTarget?.description }}</div>
          <div class="mono text-caption command-preview q-mb-sm">mynet {{ repairTarget?.argv.join(' ') }}</div>
          <div class="text-body2 q-mb-sm">影响：{{ repairTarget?.impact }}</div>
          <q-checkbox v-if="repairTarget?.mutating" v-model="repairAcknowledged" dense
            label="我已了解影响，并确认现在执行" />
          <div v-if="repairResult" class="q-mt-sm">
            <div class="text-caption text-grey-7">执行结果</div>
            <pre class="raw mono compact">{{ repairResult }}</pre>
          </div>
          <div v-if="repairError" class="text-negative text-caption q-mt-sm">{{ repairError }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup :disable="repairRunning" />
          <q-btn unelevated :color="repairTarget?.mutating ? 'warning' : 'primary'"
            :label="repairRunning ? '执行中…' : '确认执行'" :loading="repairRunning"
            :disable="repairTarget?.mutating ? !repairAcknowledged : false" @click="confirmRepair" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 本地 AI 排障：只送脱敏摘要；任何修改仍需用户确认后走 localapi -->
    <UserAiAssistant
      v-model="aiOpen"
      :title-override="t('ai.localTitle')"
      :subtitle-override="t('ai.localSubtitle')"
      :context-snapshot="aiSnapshot"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { LocalNodeStatus } from '../../types/local'
import UserAiAssistant from '../../components/ai/UserAiAssistant.vue'
import { buildLocalDiagnosticSnapshot } from '../../services/ai/localContext'
import { REPAIR_ACTIONS as repairActions, runRepairAction, type RepairAction } from '../../services/local/repairActions'

const { t } = useI18n()

const aiOpen = ref(false)

// 修复动作（Phase 5b）：目录常量 + 确认闸；写动作不经过 AI 工具面
const repairOpen = ref(false)
const repairRunning = ref(false)
const repairAcknowledged = ref(false)
const repairTarget = ref<RepairAction | null>(null)
const repairResult = ref('')
const repairError = ref('')

function openRepair(action: RepairAction): void {
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
    // 动作可能改变节点状态：刷新本页事实，并重跑健康检查
    await loadStatus()
    await runCheck().catch(() => undefined)
  } catch (e) {
    repairError.value = e instanceof LocalApiError
      ? (e.stdout || e.stderr || e.message)
      : (e as Error).message
  } finally {
    repairRunning.value = false
  }
}

// 只送「已脱敏 + 白名单字段」的摘要：不读磁盘、不带 token/私钥（见 localContext.ts）
const aiSnapshot = computed(() => buildLocalDiagnosticSnapshot({
  scope: typeof statusObj.value.scope === 'string' ? statusObj.value.scope : null,
  state: typeof status.value.state === 'string' ? status.value.state : null,
  status: statusObj.value,
  parity: parity.value,
  checkOutput: checkOut.value,
}))

const tab = ref<'check' | 'parity' | 'facts' | 'raw' | 'repair'>('check')
const statusObj = ref<Record<string, unknown>>({})
const status = ref<LocalNodeStatus>({})
const checking = ref(false)
const checkingParity = ref(false)
const exporting = ref(false)
const busy = ref(false)
const checkOut = ref('')
const parityOut = ref('')

// parity 结构化结果（block / key / value 呈现的数据源）
interface ParityItemView {
  key: string
  local: string
  remote?: string | undefined
  source?: string | undefined
  match: boolean
  critical: boolean
  hint?: string | undefined
}
interface ParityView {
  ok: boolean
  node_conf?: string | undefined
  items: ParityItemView[]
  critical_miss?: string[] | undefined
  warnings?: string[] | undefined
  hint?: string | undefined
  error?: string | undefined
}
const parity = ref<ParityView | null>(null)

// stdout 是 config parity 的 JSON 报告；解析不了（异常输出/非 JSON）返回 null 走原文兜底
function parseParity(stdout: string): ParityView | null {
  try {
    const o = JSON.parse(stdout) as ParityView
    if (o && typeof o === 'object' && Array.isArray(o.items)) return o
  } catch {
    /* 非 JSON：走原文兜底 */
  }
  return null
}
const lastRun = ref('')

const statusRaw = computed(() => {
  try {
    return JSON.stringify(statusObj.value, null, 2) || '—'
  } catch {
    return String(statusObj.value)
  }
})

// 命令输出整形：避免只裸露 "exit status 1" 占大块
function formatCmdOutput(stdout?: string, stderr?: string, fallbackLabel = '命令结束') {
  const out = ((stdout || '') + (stderr ? '\n' + (stderr) : '')).trim()
  if (!out) return fallbackLabel + '（无输出）'
  // 只有 "exit status N" 时给可读说明，不单独占一行大盒
  if (/^exit status \d+$/i.test(out)) return fallbackLabel + '（exit status ' + out.replace(/\D+/g, '') + '）'
  return out
}

function stamp() {
  lastRun.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

async function runCheck() {
  checking.value = true
  checkOut.value = ''
  try {
    const res = await localGatewayApi.runCommand(['check'], 60000)
    checkOut.value = formatCmdOutput(res.stdout, res.stderr, '检查未通过')
  } catch (e) {
    // exit≠0 也是有效结果：mynet check 用退出码表达「有 ✗」，报告在 stdout——
    // 只报「exit status 1」等于把检查结果丢了（2026-10-28 修）。
    const err = e instanceof LocalApiError ? e : null
    checkOut.value = (err?.stdout || err?.stderr)
      ? formatCmdOutput(err.stdout, err.stderr, '检查未通过')
      : formatCmdOutput('', e instanceof Error ? e.message : String(e), '检查执行失败')
  } finally {
    checking.value = false
    stamp()
  }
}

async function runParity() {
  checkingParity.value = true
  parityOut.value = ''
  parity.value = null
  const settle = (stdout?: string | undefined, stderr?: string | undefined, errText?: string | undefined) => {
    const parsed = parseParity((stdout || '').trim())
    if (parsed) {
      parity.value = parsed
      return
    }
    parityOut.value = stdout || stderr
      ? formatCmdOutput(stdout, stderr, '存在不一致')
      : formatCmdOutput('', errText || '', '检查执行失败')
  }
  try {
    const r = await localGatewayApi.runCommand(['config', 'parity', '--json'], 20000)
    settle(r.stdout, r.stderr)
  } catch (e) {
    // exit≠0 也带报告（LocalApiError 携带子进程输出）
    const err = e instanceof LocalApiError ? e : null
    settle(err?.stdout, err?.stderr, e instanceof Error ? e.message : String(e))
  } finally {
    checkingParity.value = false
    stamp()
  }
}

async function onExport() {
  exporting.value = true
  try {
    const { localHttp } = await import('../../services/local/localApi')
    const res = await localHttp.get('/system.json', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mynet-diagnostics.json'
    a.click()
    URL.revokeObjectURL(url)
    stamp()
  } catch { /* 忽略导出失败 */ } finally {
    exporting.value = false
  }
}

async function runAll() {
  busy.value = true
  try {
    await runCheck()
    await runParity()
  } finally {
    busy.value = false
  }
}

async function loadStatus() {
  try {
    status.value = await localGatewayApi.getNodeStatus()
  } catch { /* optional */ }
  try {
    statusObj.value = await localGatewayApi.getStatus()
  } catch { /* optional */ }
}

onMounted(() => {
  loadStatus()
  // 空态即 CTA：进页自动跑一次健康检查，避免「尚未运行。」大空白
  runCheck().catch(() => undefined)
})
</script>
