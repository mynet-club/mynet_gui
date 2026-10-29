<template>
  <div class="local-onboarding">
    <div class="row items-center q-mb-md">
      <div class="text-h5">配置向导</div>
      <q-space />
      <q-btn flat dense label="关闭" to="/home" />
    </div>

    <!-- 步骤条 -->
    <q-stepper v-model="step" animated flat class="q-mb-md">
      <q-step :name="1" title="接入方式" icon="settings" :done="step > 1" />
      <q-step :name="2" title="登录" icon="person" :done="step > 2" :caption="logged ? '已登录' : ''" />
      <q-step :name="3" title="选择设备" icon="lan" :done="step > 3" />
      <q-step :name="4" title="接入本机" icon="link" :done="step > 4" />
      <q-step :name="5" title="完成" icon="check" />
    </q-stepper>

    <q-banner v-if="msg" dense class="q-mb-md" :class="msgOk ? 'bg-positive' : 'bg-negative'" style="color:#fff">
      {{ msg }}
    </q-banner>

    <!-- 1. 模式 -->
    <MynetConfigCard v-if="step === 1" title="这台设备要如何加入网络？">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-btn class="full-width choice-btn" size="lg" color="primary" outline @click="chooseOnline">
            <div class="text-left q-pa-sm">
              <div class="text-weight-bold">MyNet 云端</div>
              <div class="text-caption">加入组织，选择网络设备</div>
            </div>
          </q-btn>
        </div>
        <div class="col-12 col-md-6">
          <q-btn class="full-width choice-btn" size="lg" outline color="primary" @click="chooseLocal">
            <div class="text-left q-pa-sm">
              <div class="text-weight-bold">自主管理模式</div>
              <div class="text-caption">自己维护网络配置和启动方式</div>
            </div>
          </q-btn>
        </div>
      </div>
    </MynetConfigCard>

    <!-- 2. 登录 -->
    <MynetConfigCard v-else-if="step === 2" title="登录 MyNet 账号">
      <MynetFieldRow label="Gateway（只读）">
        <q-input :model-value="gateway" dense outlined readonly />
      </MynetFieldRow>
      <MynetFieldRow label="邮箱">
        <q-input v-model="email" type="email" dense outlined autocomplete="username" />
      </MynetFieldRow>
      <MynetFieldRow label="密码">
        <q-input v-model="password" type="password" dense outlined autocomplete="current-password" @keyup.enter="onLogin" /><!-- GUARD-OK A1 误报：autocomplete 是表单属性，非凭据 -->
      </MynetFieldRow>
      <div class="row q-gutter-sm">
        <q-btn color="primary" label="登录" :loading="busy" :disable="!email || !password" @click="onLogin" />
        <q-btn flat label="稍后再说" to="/home" />
        <q-btn v-if="logged" flat label="已登录，下一步" @click="step = 3" />
      </div>
      <p class="text-caption text-grey-7 q-mt-sm">登录经本机服务 → gateway → 云端，无需填写 API 地址。</p>
    </MynetConfigCard>

    <!-- 3. 选节点 -->
    <MynetConfigCard v-else-if="step === 3" title="选择本机对应的节点" :subtitle="`已登录 ${email || '云端账号'}`">
      <div class="row q-gutter-sm q-mb-md">
        <q-btn outline color="primary" label="刷新节点列表" :loading="loadingNodes" @click="loadNodes" />
        <q-btn v-if="!nodes.length" color="primary" label="创建设备" @click="consoleOpen = true" />
      </div>
      <div v-if="!nodes.length" class="text-grey-7 q-pa-md">
        {{ TERM.zone }}里还没有设备 —— 点击「创建设备」，只需名称和 VPN 类型。
      </div>
      <div v-for="n in nodes" :key="n.node_id" class="node-row q-mb-sm">
        <div class="col">
          <b>{{ n.node_name || n.node_id }}</b>
          <div class="text-caption mono">{{ n.vip || n.node_id }}</div>
        </div>
        <q-badge :color="n.online ? 'positive' : 'grey'">{{ n.online ? '在线' : '离线' }}</q-badge>
        <q-btn dense :color="n.node_id === focusNode ? 'primary' : 'grey-7'" :label="n.node_id === focusNode ? '已选' : '切换到这台'" class="q-ml-sm" :loading="busy" @click="onUseNode(n.node_id)" />
      </div>

      <q-dialog v-model="consoleOpen" maximized>
        <q-card>
          <q-bar>
            <div>创建设备（网络区控制台）</div>
            <q-space />
            <q-btn dense flat icon="close" v-close-popup />
          </q-bar>
          <iframe class="console-frame" src="/gui/app/nodes/create" title="创建设备"></iframe>
        </q-card>
      </q-dialog>

      <div class="row q-gutter-sm q-mt-md">
        <q-btn color="primary" label="下一步：接入本机" :disable="!focusNode" @click="step = 4" />
        <q-btn flat label="上一步" @click="step = 2" />
      </div>
    </MynetConfigCard>

    <!-- 4. 接入本机 -->
    <MynetConfigCard v-else-if="step === 4" title="接入本机">
      <p class="text-body2">
        自动准备本机密钥、同步公钥、加载配置并启动连接。已有密钥会保留；失败后可重试。
      </p>
      <div v-if="connectSteps.length" class="q-mb-md">
        <div v-for="(s, i) in connectSteps" :key="i" class="row items-center q-mb-xs">
          <q-icon :name="s.state === 'done' ? 'check_circle' : s.state === 'failed' ? 'cancel' : 'hourglass_empty'"
            :color="s.state === 'done' ? 'positive' : s.state === 'failed' ? 'negative' : 'grey'" class="q-mr-sm" />
          <span>{{ s.name }}</span>
          <q-space />
          <span class="text-caption">{{ s.state === 'done' ? '已完成' : s.state === 'failed' ? '未完成' : '处理中' }}</span>
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn color="primary" :label="connectFailed ? '重试接入' : '接入本机'" :loading="busy" @click="onConnect" />
        <q-btn v-if="localMode" outline color="primary" label="应用并启动" :loading="busy" @click="onLocalStart" />
        <q-btn flat label="上一步" :disable="busy" @click="step = 3" />
      </div>
    </MynetConfigCard>

    <!-- 5. 完成 -->
    <MynetConfigCard v-else title="配置已准备">
      <p class="text-body2">{{ doneText }}</p>
      <div class="row q-gutter-sm">
        <q-btn color="primary" label="启动网络" :loading="busy" @click="onStart" />
        <q-btn outline color="primary" label="稍后启动" to="/home" />
        <q-btn flat label="查看概览" to="/home" />
      </div>
    </MynetConfigCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useExperienceStore } from '../../stores/experience'
import { localHttp, localGatewayApi, LocalApiError } from '../../services/local/localApi'
import { useLocalCommand } from '../../composables/useLocalCommand'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'

const TERM = { zone: '网络区' }

const store = useExperienceStore()
const step = ref(1)
const busy = ref(false)
const msg = ref('')
const msgOk = ref(true)
const email = ref('')
const password = ref('')
const logged = ref(false)
const localMode = ref(false)
const gateway = ref('wss://gw.mynet.club/v1/node/connect')
const loadingNodes = ref(false)
const nodes = ref<{ node_id: string; node_name?: string; vip?: string; online?: boolean }[]>([])
const focusNode = ref('')
const consoleOpen = ref(false)
const connectSteps = ref<{ name: string; state: string }[]>([])
const connectFailed = ref(false)
const cmd = useLocalCommand()

const doneText = computed(() =>
  connectFailed.value
    ? '接入尚未完成。已完成步骤与本机身份会保留，可重试或稍后从首页启动。'
    : '现在可以启动网络，也可以稍后从首页启动。'
)

function toast(ok: boolean, text: string) {
  msgOk.value = ok
  msg.value = text
}

async function refreshSession() {
  try {
    const r = await localHttp.get('/wizard/state')
    const d = (r.data as { data?: { logged_in?: boolean } })?.data
    logged.value = !!d?.logged_in
    if (logged.value && step.value === 2) step.value = 3
  } catch { /* optional */ }
}

function chooseOnline() {
  localMode.value = false
  step.value = 2
}

async function chooseLocal() {
  localMode.value = true
  busy.value = true
  try {
    await localHttp.post('/config/mode', { mode: 'local' })
    toast(true, '已切换到自主管理模式')
    step.value = 4
  } catch (e) {
    toast(false, e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

async function onLogin() {
  busy.value = true
  try {
    await localHttp.post('/wizard/login', {
      email: email.value.trim(),
      password: password.value
    })
    password.value = ''
    toast(true, '登录成功')
    logged.value = true
    step.value = 3
    await store.refreshAll()
    await loadNodes()
  } catch (e) {
    toast(false, e instanceof LocalApiError ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

async function loadNodes() {
  loadingNodes.value = true
  try {
    await localGatewayApi.runCommand(['config', 'pull', '--json'], 60000)
    const res = await localHttp.get('/config/cloud')
    const payload = (res.data as { data?: { nodes?: unknown[] }; nodes?: unknown[] })
    const raw = payload?.data?.nodes || payload?.nodes || []
    nodes.value = (raw as { node_id?: string; id?: string; node_name?: string; name?: string; virtual_ip?: unknown; online?: boolean; status?: string }[])
      .map((n) => {
        const id = String(n.node_id ?? n.id ?? '')
        let vip = ''
        const rawVip = n.virtual_ip ?? (n as { node_ip?: unknown }).node_ip
        if (typeof rawVip === 'number' && rawVip > 0) {
          vip = [(rawVip >>> 24) & 255, (rawVip >>> 16) & 255, (rawVip >>> 8) & 255, rawVip & 255].join('.')
        } else if (rawVip) {
          vip = String(rawVip)
        }
        return {
          node_id: id,
          ...(n.node_name || n.name ? { node_name: n.node_name || n.name } : {}),
          vip,
          online: n.online === true || n.status === 'online' || n.status === 'active'
        }
      })
      .filter((n) => n.node_id)
  } catch (e) {
    toast(false, e instanceof Error ? e.message : '节点列表拉取失败')
    nodes.value = []
  } finally {
    loadingNodes.value = false
  }
}

async function onUseNode(id: string) {
  focusNode.value = id
  busy.value = true
  try {
    await localGatewayApi.runCommand(['config', 'use', id], 60000)
    toast(true, `已选择节点 ${id}`)
    await refreshSession()
  } catch (e) {
    toast(false, e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

async function onConnect() {
  busy.value = true
  connectFailed.value = false
  connectSteps.value = [
    { name: '准备本机密钥', state: 'pending' },
    { name: '同步公钥', state: 'pending' },
    { name: '加载云端配置', state: 'pending' },
    { name: '启动连接', state: 'pending' }
  ]
  try {
    const res = await localHttp.post('/config/connect', {}, { timeout: 180000 })
    const body = res.data as { success?: boolean; message?: string; steps?: { name?: string; state?: string }[] }
    if (Array.isArray(body.steps) && body.steps.length) {
      connectSteps.value = body.steps.map((s) => ({
        name: s.name || '',
        state: s.state || 'done'
      }))
    } else {
      connectSteps.value = connectSteps.value.map((s) => ({ ...s, state: 'done' }))
    }
    if (body.success !== false) {
      toast(true, body.message || '连接已启动')
      step.value = 5
    } else {
      connectFailed.value = true
      toast(false, body.message || '接入尚未完成')
    }
  } catch (e) {
    connectFailed.value = true
    connectSteps.value = connectSteps.value.map((s, i) =>
      i === connectSteps.value.length - 1 ? { ...s, state: 'failed' } : { ...s, state: i === 0 ? 'done' : s.state }
    )
    toast(false, e instanceof LocalApiError ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

async function onLocalStart() {
  busy.value = true
  try {
    await localHttp.post('/config/apply', { start: true }, { timeout: 90000 })
    toast(true, '本机网络已启动')
    step.value = 5
  } catch (e) {
    toast(false, e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

function onStart() {
  cmd.run(['service', 'start', 'gnb'], '启动网络', 60000).then((ok) => {
    if (ok) {
      toast(true, '网络已启动')
      location.href = '/gui/home'
    } else {
      toast(false, cmd.message.value)
    }
  })
}

onMounted(async () => {
  refreshSession()
  await store.refreshAll().catch(() => undefined)
  // 探一次云端：会话失效（401/need_login）就直接落登录步
  try {
    const { listCloudNodes } = await import('../../services/local/localApi')
    await listCloudNodes()
    await loadNodes()
  } catch (e) {
    const { LocalApiError } = await import('../../services/local/localApi')
    if (e instanceof LocalApiError && e.needLogin) {
      store.error = e
      step.value = 2
    }
  }
})
</script>

<style scoped>
.choice-btn {
  min-height: 88px;
  justify-content: flex-start;
}
.node-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--line, var(--color-border, #e5e7eb));
  border-radius: 8px;
}
</style>
