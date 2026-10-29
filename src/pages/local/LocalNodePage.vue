<template>
  <div class="local-node">
    <div class="row items-center q-mb-md">
      <div class="text-h5">节点</div>
      <q-space />
      <!-- 低频操作只留入口，不铺配置卡 -->
      <q-btn flat dense icon="more_vert" label="管理">
        <q-menu>
          <q-list dense style="min-width:180px">
            <q-item clickable v-close-popup @click="showSwitch = true">
              <q-item-section>切换节点</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="showKeys = true">
              <q-item-section>密钥工具</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onPull">
              <q-item-section>从云端同步</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onApply">
              <q-item-section>应用配置</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onParity">
              <q-item-section>一致性检查</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-banner v-if="cmd.message.value" dense class="q-mb-md" :class="cmd.ok.value ? 'bg-positive' : 'bg-negative'" style="color:#fff">
      {{ cmd.message.value }}
    </q-banner>
    <pre v-if="parityOut" class="raw mono q-mb-md">{{ parityOut }}</pre>

    <!-- 纯信息展示，无输入控件 -->
    <div class="info-grid">
      <section class="info-block">
        <h3>本机身份</h3>
        <dl>
          <dt>节点名称</dt><dd>{{ identityView.node_name || '—' }}</dd>
          <dt>节点 ID</dt><dd class="mono">{{ identityView.node_id || status.node_id || '—' }}</dd>
          <dt>虚拟 IP</dt><dd class="mono">{{ status.overlay_ip || '—' }}</dd>
          <dt>接口</dt><dd class="mono">{{ status.tun_iface || '—' }}</dd>
          <dt>网络区</dt><dd>{{ identityView.tenant_name || '—' }}</dd>
          <dt>账号</dt><dd>{{ identityView.user_email || '—' }}</dd>
        </dl>
      </section>

      <section class="info-block">
        <h3>当前设备</h3>
        <dl>
          <dt>驱动</dt><dd>{{ driverLabel }}</dd>
          <dt>进程</dt><dd>{{ status.process_up ? '运行中' : '未运行' }}<span v-if="processPid" class="mono muted"> · PID {{ processPid }}</span></dd>
          <dt>连接</dt><dd>{{ nodeState }}</dd>
          <dt>说明</dt><dd>{{ status.one_line || status.detail || '—' }}</dd>
          <dt>对端</dt><dd>{{ peerSummary }}</dd>
        </dl>
      </section>

      <section class="info-block">
        <h3>网络情况</h3>
        <dl>
          <dt>加速</dt><dd>{{ accelLabel }}<span v-if="accelDetail" class="muted"> · {{ accelDetail }}</span></dd>
          <dt>加速出口</dt><dd>{{ exitPeer }}</dd>
          <dt>DNS</dt><dd>{{ dnsActive }}</dd>
          <dt>本机出口</dt><dd class="mono">{{ localExit }}</dd>
          <dt>系统路由</dt><dd>{{ status.routes_ok ? '正常' : '未就绪' }}<span class="muted"> · 缺失 {{ missingCount }}</span></dd>
        </dl>
      </section>
    </div>

    <!-- 切换节点 -->
    <q-dialog v-model="showSwitch">
      <q-card style="min-width:420px;max-width:560px">
        <q-card-section>
          <div class="text-h6">切换节点</div>
          <div class="text-caption text-grey-7">这台机器改用哪台设备的身份接入网络</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-select v-model="focusNode" :options="focusOptions" dense outlined emit-value map-options />
          <div class="text-caption text-grey-7 q-mt-sm">正在使用：{{ identityView.node_id || status.node_id || '—' }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="刷新列表" @click="loadCloudNodes" />
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" label="切换到这台" :loading="cmd.busy.value" :disable="!focusNode" @click="onSwitchNode" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 密钥工具 -->
    <q-dialog v-model="showKeys" maximized>
      <q-card>
        <q-bar>
          <div>密钥工具</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-pt-md">
          <div class="text-caption text-grey-7 q-mb-md">超低频。写入/生成会改变本机身份。</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <MynetFieldRow label="私钥" help="粘贴备份导出的私钥；公钥可留空">
                <q-input v-model="importPriv" type="textarea" dense outlined rows="3" spellcheck="false" />
              </MynetFieldRow>
              <MynetFieldRow label="公钥（可选）">
                <q-input v-model="importPub" dense outlined />
              </MynetFieldRow>
              <div class="row q-gutter-sm">
                <q-btn color="primary" label="写入密钥" :loading="cmd.busy.value" :disable="!importPriv.trim()" @click="onWriteKey" />
                <q-btn color="negative" outline label="生成新密钥" :loading="cmd.busy.value" @click="onGenerateKey" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="row q-gutter-sm q-mb-md">
                <q-btn outline color="primary" label="同步当前公钥" :loading="cmd.busy.value" @click="onSyncKey" />
                <q-btn outline color="primary" label="导出配置备份" :loading="cmd.busy.value" @click="onExport" />
              </div>
              <div class="text-caption q-mb-xs">当前公钥</div>
              <div class="mono text-caption" style="word-break:break-all">{{ keys.pub || '—' }}</div>
              <q-table class="q-mt-md" flat dense :rows="backupRows" :columns="backupCols" :pagination="{ rowsPerPage: 5 }" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useExperienceStore } from '../../stores/experience'
import { localGatewayApi } from '../../services/local/localApi'
import { useLocalCommand } from '../../composables/useLocalCommand'
import type { LocalNodeStatus } from '../../types/local'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'

const $q = useQuasar()
const store = useExperienceStore()
const cmd = useLocalCommand()
const status = ref<LocalNodeStatus>({})
const identity = ref<Record<string, string>>({})
const keys = ref<{ pub?: string }>({})
const showSwitch = ref(false)
const showKeys = ref(false)
const importPriv = ref('')
const importPub = ref('')
const backups = ref<unknown[]>([])
const parityOut = ref('')
const focusNode = ref('')
const cloudNodes = ref<{ node_id: string; node_name?: string; online?: boolean }[]>([])

const identityView = computed(() => {
  const w = store.experience?.wizard as Record<string, string> | undefined
  return {
    node_name: identity.value.node_name || '',
    node_id: identity.value.node_id || status.value.node_id || '',
    tenant_name: identity.value.tenant_name || w?.tenant_name || '',
    user_email: identity.value.user_email || w?.user_email || ''
  }
})

const nodeState = computed(() => String(status.value.state || '—'))
const driverLabel = computed(() => {
  const d = String(status.value.driver || 'gnb')
  return d === 'wireguard' ? 'WireGuard' : 'gnb (OpenGNB)'
})
const processPid = computed(() => {
  const n = store.experience?.node as { process_pid?: number } | undefined
  return n?.process_pid ? String(n.process_pid) : ''
})
const peerSummary = computed(() => {
  const total = status.value.peers_total
  if (typeof total === 'number') return `${status.value.peers_routed ?? 0} / ${total}`
  const list = (status.value.peers || []).filter((p) => !p.is_self && p.node_id)
  return list.length ? `${list.filter((p) => p.routed).length} / ${list.length}` : '0'
})
const missingCount = computed(() => (status.value.missing_routes || []).length)

const accelLabel = computed(() => {
  const a = store.acceleration
  if (!a) return '加速：状态未知'
  if (a.runtime?.state === 'dns_overridden' || a.lifecycle === 'degraded') return '加速：已中断'
  if (a.runtime?.active || a.lifecycle === 'active') return '加速：运行中'
  if (a.lifecycle === 'waiting_tunnel' || a.enabled) return '加速：已暂停'
  return '加速：未开启'
})
const accelDetail = computed(() => {
  const a = store.acceleration
  if (!a) return ''
  if (a.runtime?.state === 'dns_overridden') return 'DNS 已被外部更改'
  const n = a.runtime?.domains ?? 0
  return a.runtime?.active && n ? `DNS 钉扎 ${n} 个域名` : ''
})
const exitPeer = computed(() => {
  const a = store.acceleration
  return a?.exit_label || a?.exit_peer || '未选择'
})
const dnsActive = computed(() => {
  const a = store.acceleration
  if (!a) return '未生效'
  return a.dns_active || (a.dns_enabled ? '已开' : '未开')
})
const localExit = computed(() => {
  const m = (status.value.system_routes_text || '').match(/^default\s+(\S+)/m)
  return m?.[1] || '—'
})

const backupRows = computed(() =>
  backups.value.map((b) => {
    const o = b as Record<string, unknown>
    return { name: String(o.name || o.file || o.path || '—'), time: String(o.time || o.created_at || o.mtime || '—') }
  })
)
const backupCols = [
  { name: 'name', label: '备份', field: 'name', align: 'left' as const },
  { name: 'time', label: '时间', field: 'time', align: 'left' as const }
]
const focusOptions = computed(() =>
  cloudNodes.value.map((n) => ({
    label: `${n.node_name || n.node_id}${n.online ? ' · 在线' : ''}`,
    value: String(n.node_id)
  }))
)

async function loadAll() {
  try { status.value = await localGatewayApi.getNodeStatus() } catch { /* partial */ }
  try {
    const id = await localGatewayApi.runCommand(['config', 'identity', '--json'], 15000)
    identity.value = JSON.parse(id.stdout || '{}')
  } catch { /* optional */ }
  try {
    const k = await localGatewayApi.runCommand(['config', 'keys', '--json'], 15000)
    keys.value = JSON.parse(k.stdout || '{}')
  } catch { /* optional */ }
  store.refreshAcceleration().catch(() => undefined)
}

async function loadCloudNodes() {
  try {
    const res = await import('../../services/local/localApi').then((m) => m.localHttp.get('/config/cloud'))
    const payload = res.data as { data?: { nodes?: unknown[] }; nodes?: unknown[] }
    const raw = payload?.data?.nodes || payload?.nodes || []
    cloudNodes.value = (raw as { node_id?: string; id?: string; node_name?: string; name?: string; online?: boolean; status?: string }[])
      .map((n) => {
        const row: { node_id: string; node_name?: string; online?: boolean } = {
          node_id: String(n.node_id ?? n.id ?? '')
        }
        const name = n.node_name || n.name
        if (name) row.node_name = name
        row.online = n.online === true || n.status === 'online' || n.status === 'active'
        return row
      })
      .filter((n) => n.node_id)
  } catch {
    cloudNodes.value = []
  }
}

async function loadBackups() {
  try {
    const r = await localGatewayApi.runCommand(['config', 'backups', '--json'], 15000)
    const data = JSON.parse(r.stdout || '[]')
    backups.value = Array.isArray(data) ? data : (data.items || data.backups || [])
  } catch {
    backups.value = []
  }
}

function onSwitchNode() {
  cmd.run(['config', 'use', focusNode.value], '切换节点', 60000).then(() => {
    showSwitch.value = false
    loadAll()
  })
}

function onWriteKey() {
  $q.dialog({
    title: '写入密钥？',
    message: '将覆盖当前本机身份，旧身份立即失效。',
    cancel: true
  }).onOk(async () => {
    try {
      const { localHttp } = await import('../../services/local/localApi')
      await localHttp.post('/config/keys', {
        private_hex: importPriv.value.trim(),
        public_hex: importPub.value.trim() || undefined
      })
      cmd.ok.value = true
      cmd.message.value = '密钥已写入'
      importPriv.value = ''
      importPub.value = ''
    } catch (e) {
      cmd.ok.value = false
      cmd.message.value = e instanceof Error ? e.message : String(e)
    }
    await loadAll()
  })
}

function onGenerateKey() {
  $q.dialog({
    title: '生成新密钥？',
    message: '旧身份立即失效。',
    cancel: true,
    ok: { color: 'negative', label: '确认生成' }
  }).onOk(async () => {
    try {
      const { localHttp } = await import('../../services/local/localApi')
      await localHttp.post('/config/keys', { generate: true })
      cmd.ok.value = true
      cmd.message.value = '密钥已生成并同步'
    } catch (e) {
      cmd.ok.value = false
      cmd.message.value = e instanceof Error ? e.message : String(e)
    }
    await loadAll()
  })
}

function onSyncKey() { cmd.run(['config', 'keys', 'sync', '--json'], '同步公钥').then(loadAll) }
function onExport() { cmd.run(['config', 'export'], '导出备份').then(loadBackups) }
function onPull() { cmd.run(['config', 'pull', '--json'], '同步配置', 90000).then(loadAll) }
function onApply() { cmd.run(['apply', '--auto'], '应用配置', 90000).then(loadAll) }
async function onParity() {
  try {
    const r = await localGatewayApi.runCommand(['config', 'parity', '--json'], 20000)
    parityOut.value = r.stdout || r.stderr || '一致'
  } catch (e) {
    parityOut.value = e instanceof Error ? e.message : String(e)
  }
}

onMounted(() => {
  loadAll()
  loadCloudNodes()
  loadBackups()
})
</script>
