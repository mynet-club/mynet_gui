<template>
  <div class="local-settings">
    <div class="text-h5 q-mb-md">设置</div>

    <q-banner v-if="cmd.message.value" dense class="q-mb-md" :class="cmd.ok.value ? 'bg-positive' : 'bg-negative'" style="color:#fff">
      {{ cmd.message.value }}
    </q-banner>

    <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary">
      <q-tab name="node" label="节点配置" />
      <q-tab name="form" label="运行形态" />
      <q-tab name="driver" label="驱动配置（只读）" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="node" class="panel-pad">
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
import { localGatewayApi } from '../../services/local/localApi'
import { useLocalCommand } from '../../composables/useLocalCommand'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'

const $q = useQuasar()
const cmd = useLocalCommand()
const runtime = ref<Record<string, string | number>>({})
const identity = ref<Record<string, string>>({})
const form = ref('pc')
const currentForm = ref('pc')
const tab = ref<'node' | 'form' | 'driver'>('node')
const drvTab = ref<'gnb' | 'wireguard'>('gnb')
const expandDrv = ref(false)

const formOptions = [
  { label: 'PC：加速本机应用', value: 'pc' },
  { label: 'GW：为下游设备分流', value: 'gw' }
]

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
      // 驱动类型决定默认 tab
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
  loadForm()
  loadRuntime()
  loadIdentity()
})
</script>
