<template>
  <div class="local-settings">
    <div class="text-h5 q-mb-md">设置</div>

    <q-banner v-if="cmd.message.value" dense class="q-mb-md" :class="cmd.ok.value ? 'bg-positive' : 'bg-negative'" style="color:#fff">
      {{ cmd.message.value }}
    </q-banner>

    <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary">
      <q-tab name="node" label="网关与节点" />
      <q-tab name="form" label="运行形态" />
      <q-tab name="driver" label="驱动配置（只读）" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="node" class="panel-pad">
        <!-- 本机反代网关域名配置（决定登录与中继归属的网络区） -->
        <MynetConfigCard
          title="网关域名"
          subtitle="本机页面运行在 127.0.0.1:8096，实际归属网络区由这里配置的网关二级域名决定（如 gw.mynet.club 或自定义二级域名）"
          class="q-mb-md"
        >
          <q-banner v-if="gwConfig.env_override" dense rounded class="bg-orange-1 text-warning q-mb-sm">
            当前由环境变量 MYNET_GATEWAYS 覆盖（{{ gwConfig.host || gwConfig.gateway }}），修改已写入 conf/gateways.json，移除环境变量后生效。
          </q-banner>

          <MynetFieldRow label="网关域名" help="直接填写域名（例如 gw.mynet.club 或 xxx.mynet.club），程序自动补全 wss:// 与中继路径">
            <div class="row items-center q-gutter-sm">
              <q-input
                v-model="gatewayInput"
                dense
                outlined
                class="col"
                style="max-width: 380px"
                placeholder="gw.mynet.club"
                :disable="gwSaving"
                @keyup.enter="onSaveGateway"
              />
              <q-btn
                color="primary"
                label="保存网关"
                :loading="gwSaving"
                :disable="!gatewayInput.trim()"
                @click="onSaveGateway"
              />
              <q-btn
                flat
                color="grey-7"
                label="恢复默认"
                :disable="gwSaving || gatewayInput.trim() === (gwConfig.default_host || 'gw.mynet.club')"
                @click="onResetDefaultGateway"
              />
            </div>
          </MynetFieldRow>

          <dl class="kv q-mt-sm">
            <dt>当前识别网络区</dt>
            <dd>
              <span v-if="gwZoneLoading" class="text-grey-6">识别中…</span>
              <span v-else-if="gwZoneLabel" class="text-primary text-weight-medium">{{ gwZoneLabel }}</span>
              <span v-else class="text-grey-6">未识别（请检查网关域名或网络连接）</span>
            </dd>
            <dt>完整网关地址</dt><dd class="mono">{{ gwConfig.gateway || '—' }}</dd>
            <dt>配置来源</dt><dd class="mono">{{ gwConfig.source || '—' }}</dd>
          </dl>

          <div v-if="gwMsg" class="text-caption q-mt-xs" :class="gwOk ? 'text-positive' : 'text-negative'">
            {{ gwMsg }}
          </div>
        </MynetConfigCard>

        <MynetConfigCard title="节点配置" subtitle="当前节点身份；切换请到「节点」页">
          <dl class="kv">
            <dt>节点名称</dt><dd>{{ identity.node_name || '—' }}</dd>
            <dt>节点 ID</dt><dd class="mono">{{ identity.node_id || '—' }}</dd>
            <dt>网络区</dt><dd>{{ identity.tenant_name || '—' }}</dd>
            <dt>账号</dt><dd>{{ identity.user_email || '—' }}</dd>
          </dl>
          <q-btn class="q-mt-md" outline color="primary" dense label="去节点页管理" to="/node" />
        </MynetConfigCard>
      </q-tab-panel>

      <q-tab-panel name="form" class="panel-pad">
        <MynetConfigCard title="运行形态">
          <MynetFieldRow label="当前形态" help="PC：加速本机应用 · GW：为下游设备分流">
            <q-select v-model="form" :options="formOptions" dense outlined emit-value map-options :disable="cmd.busy.value" />
          </MynetFieldRow>
          <q-btn color="primary" label="切换形态" :loading="cmd.busy.value" :disable="!form || form === currentForm" @click="onFormSwitch" />
        </MynetConfigCard>
      </q-tab-panel>

      <q-tab-panel name="driver" class="panel-pad">
        <MynetConfigCard title="驱动配置（只读）" subtitle="原文展示；修改走 CLI 或后续编辑面">
          <q-tabs v-model="drvTab" dense align="left" active-color="primary" indicator-color="primary">
            <q-tab name="gnb" label="gnb" />
            <q-tab name="wireguard" label="wireguard" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="drvTab" animated>
            <q-tab-panel name="gnb" class="panel-pad">
              <MynetFieldRow label="驱动目录">
                <div class="mono text-caption">{{ runtime.gnb_conf || '—' }}</div>
              </MynetFieldRow>
              <MynetFieldRow label="node.conf">
                <pre class="raw mono collapsed">{{ runtime.node_conf || '—' }}</pre>
              </MynetFieldRow>
              <MynetFieldRow label="address.conf">
                <pre class="raw mono collapsed">{{ runtime.address_conf || '—' }}</pre>
              </MynetFieldRow>
              <MynetFieldRow label="route.conf">
                <pre class="raw mono collapsed">{{ runtime.route_conf || '—' }}</pre>
              </MynetFieldRow>
              <div class="text-caption text-blue q-mt-xs" style="cursor:pointer" @click="expandDrv = !expandDrv">
                {{ expandDrv ? '收起' : '展开全部' }}
              </div>
              <div class="text-caption text-grey-7">
                对端 {{ runtime.peer_count ?? '—' }} · 网段 {{ runtime.network_count ?? '—' }} · endpoint {{ runtime.endpoint_count ?? '—' }}
              </div>
            </q-tab-panel>
            <q-tab-panel name="wireguard" class="panel-pad">
              <MynetFieldRow v-if="runtime.wg_conf" label="wg.conf">
                <pre class="raw mono">{{ runtime.wg_conf }}</pre>
              </MynetFieldRow>
              <div v-else class="text-caption text-grey-7">
                当前未使用 WireGuard（驱动 {{ identity.driver || 'gnb' }}），无 wg.conf。
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </MynetConfigCard>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { localApi, localGatewayApi, LocalApiError } from '../../services/local/localApi'
import { useLocalCommand } from '../../composables/useLocalCommand'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'
import type { ZoneContext } from '../../types'

const $q = useQuasar()
const cmd = useLocalCommand()
const runtime = ref<Record<string, string | number>>({})
const identity = ref<Record<string, string>>({})
const form = ref('pc')
const currentForm = ref('pc')
const tab = ref<'node' | 'form' | 'driver'>('node')
const drvTab = ref<'gnb' | 'wireguard'>('gnb')
const expandDrv = ref(false)

const gwConfig = ref({
  gateway: '',
  host: '',
  gateways: [] as string[],
  source: '',
  env_override: false,
  default_host: 'gw.mynet.club'
})
const gatewayInput = ref('')
const gwSaving = ref(false)
const gwMsg = ref('')
const gwOk = ref(true)
const gwZoneLoading = ref(false)
const gwZoneLabel = ref('')

const formOptions = [
  { label: 'PC：加速本机应用', value: 'pc' },
  { label: 'GW：为下游设备分流', value: 'gw' }
]

async function loadGatewayZoneContext() {
  gwZoneLoading.value = true
  try {
    const { localHttp } = await import('../../services/local/localApi')
    const res = await localHttp.get('/wizard/zone-context')
    const ctx = ((res as any)?.data?.data ?? (res as any)?.data ?? res) as ZoneContext | undefined
    if (ctx?.resolved) {
      const name = ctx.name || (ctx.is_default_gateway ? '默认网络区' : '网络区')
      gwZoneLabel.value = ctx.gateway_host ? `${name}（${ctx.gateway_host}）` : name
    } else {
      gwZoneLabel.value = ''
    }
  } catch {
    gwZoneLabel.value = ''
  } finally {
    gwZoneLoading.value = false
  }
}

async function loadGatewayConfig() {
  try {
    const data = await localApi.getGatewayConfig()
    gwConfig.value = data
    gatewayInput.value = data.host || data.default_host || 'gw.mynet.club'
  } catch {
    /* ignore */
  }
  await loadGatewayZoneContext()
}

async function onSaveGateway() {
  const val = gatewayInput.value.trim()
  if (!val || gwSaving.value) return
  gwSaving.value = true
  gwMsg.value = ''
  try {
    const data = await localApi.putGatewayConfig(val)
    gwConfig.value = data
    gatewayInput.value = data.host || val
    gwOk.value = true
    gwMsg.value = '网关域名已保存并生效'
    await loadGatewayZoneContext()
  } catch (e) {
    gwOk.value = false
    gwMsg.value = e instanceof LocalApiError ? e.message : e instanceof Error ? e.message : String(e)
  } finally {
    gwSaving.value = false
  }
}

async function onResetDefaultGateway() {
  gatewayInput.value = gwConfig.value.default_host || 'gw.mynet.club'
  await onSaveGateway()
}

async function loadRuntime() {
  try {
    const { localHttp } = await import('../../services/local/localApi')
    const res = await localHttp.get('/config/runtime')
    const d = (res.data as { data?: Record<string, string | number> })?.data
    if (d) runtime.value = d
  } catch {
    runtime.value = {}
  }
}

async function loadIdentity() {
  try {
    const { localHttp } = await import('../../services/local/localApi')
    const res = await localHttp.get('/config/identity')
    const d = (res.data as { data?: Record<string, string> })?.data
    if (d) {
      identity.value = d
      drvTab.value = d.driver === 'wireguard' ? 'wireguard' : 'gnb'
    }
  } catch { /* optional */ }
}

async function loadForm() {
  try {
    const r = await localGatewayApi.runCommand(['config', 'form', '--json'], 10000)
    const data = JSON.parse(r.stdout || '{}') as { mode?: string }
    currentForm.value = data.mode || 'pc'
    form.value = currentForm.value
  } catch { /* keep default */ }
}

function onFormSwitch() {
  $q.dialog({
    title: '切换运行形态？',
    message: `将切换到 ${form.value === 'pc' ? 'PC（本机加速）' : 'GW（下游分流）'}。会释放旧形态资源并重新应用。`,
    cancel: true
  }).onOk(() => {
    cmd.run(['config', 'form', form.value], '切换形态', 60000).then(loadForm)
  })
}

onMounted(() => {
  void loadGatewayConfig()
  loadForm()
  loadRuntime()
  loadIdentity()
})
</script>
