<template>
  <div class="local-exit">
    <div class="text-h5 q-mb-md">出口与 ACL</div>
    <MynetAsyncState :state="uiState" :error="err" @retry="load">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <MynetConfigCard title="出口节点" subtitle="有序出站节点">
            <div v-if="exits.length === 0" class="text-body2 text-grey-7">暂无出口配置</div>
            <div v-for="(ex, i) in exits" :key="ex.node_id || i" class="exit-row q-mb-sm">
              <span class="mono">{{ i + 1 }}</span>
              <span class="col">
                {{ displayExit(ex.node_id) }}
                <span class="text-caption text-grey-7 mono q-ml-sm">{{ ex.node_id }}</span>
              </span>
              <q-badge :color="ex.enabled ? 'positive' : 'grey'">{{ ex.enabled ? '启用' : '停用' }}</q-badge>
            </div>
            <MynetFieldRow label="新增出口 node_id">
              <div class="row q-gutter-sm">
                <q-input v-model="newExit" dense outlined class="col" />
                <q-btn outline color="primary" dense label="添加" :disable="!newExit || busy" @click="addExit" />
              </div>
            </MynetFieldRow>
          </MynetConfigCard>
        </div>

        <div class="col-12 col-md-6">
          <MynetConfigCard title="ACL" subtitle="对谁开放出口（server 侧）">
            <MynetFieldRow label="模式">
              <q-select
                v-model="acl.mode"
                :options="aclModes"
                dense
                outlined
                emit-value
                map-options
                :disable="busy"
              />
            </MynetFieldRow>
            <MynetFieldRow v-if="acl.mode === 'allowlist'" label="允许的 node_id" help="每行一个">
              <q-input v-model="allowedText" type="textarea" dense outlined rows="4" :disable="busy" />
            </MynetFieldRow>
            <MynetFieldRow v-if="acl.mode === 'denylist'" label="拒绝的 node_id" help="每行一个">
              <q-input v-model="deniedText" type="textarea" dense outlined rows="4" :disable="busy" />
            </MynetFieldRow>
          </MynetConfigCard>
        </div>
      </div>

      <div class="row items-center q-mt-md q-gutter-sm">
        <div v-if="dirty" class="text-caption text-warning">有未保存更改</div>
        <q-space />
        <q-btn flat label="重置" :disable="busy || !dirty" @click="resetDraft" />
        <q-btn color="primary" label="保存" :loading="busy" :disable="busy || !dirty" @click="save" />
      </div>
    </MynetAsyncState>
  </div>
</template>

<script setup lang="ts">
import { useExperienceStore } from '../../stores/experience'
import { computed, onMounted, ref, watch } from 'vue'
import { mergePersistedNames, loadPersistedNames, peerDisplayName, type NodeNameSource } from '../../utils/nodeDisplay'
import { localGatewayApi, LocalApiError } from '../../services/local/localApi'
import type { PluginProxyStatus, ProxyACLView, ProxyExitView, UiState } from '../../types/local'
import MynetAsyncState from '../../components/mynet/MynetAsyncState.vue'
import MynetConfigCard from '../../components/mynet/MynetConfigCard.vue'
import MynetFieldRow from '../../components/mynet/MynetFieldRow.vue'

const store = useExperienceStore()
const data = ref<PluginProxyStatus>({})
const nodeNames = ref<NodeNameSource>({})
const err = ref<LocalApiError | null>(null)
const loading = ref(false)
const busy = ref(false)
const newExit = ref('')

const uiState = computed<UiState>(() => {
  if (loading.value && !data.value.effective && !data.value.local) return 'loading'
  if (err.value && !data.value.effective && !data.value.local) return 'error'
  return 'ready'
})

const policy = computed(() => data.value.effective?.policy || data.value.local?.policy || {})
const exits = ref<ProxyExitView[]>([])
const acl = ref<ProxyACLView>({ mode: 'open' })
const allowedText = ref('')
const deniedText = ref('')
const savedJson = ref('')

const dirty = computed(() => JSON.stringify({ exits: exits.value, acl: acl.value }) !== savedJson.value)

const aclModes = [
  { label: '开放（组织内）', value: 'open' },
  { label: '白名单', value: 'allowlist' },
  { label: '黑名单', value: 'denylist' }
]

watch(allowedText, (t) => {
  acl.value = {
    ...acl.value,
    allowed_node_ids: t.split('\n').map((s) => s.trim()).filter(Boolean)
  }
})
watch(deniedText, (t) => {
  acl.value = {
    ...acl.value,
    denied_node_ids: t.split('\n').map((s) => s.trim()).filter(Boolean)
  }
})

function resetDraft() {
  exits.value = (policy.value.exits || []).map((e) => ({ ...e }))
  acl.value = {
    mode: policy.value.acl?.mode || 'open',
    allowed_node_ids: [...(policy.value.acl?.allowed_node_ids || [])],
    denied_node_ids: [...(policy.value.acl?.denied_node_ids || [])]
  }
  allowedText.value = (acl.value.allowed_node_ids || []).join('\n')
  deniedText.value = (acl.value.denied_node_ids || []).join('\n')
  savedJson.value = JSON.stringify({ exits: exits.value, acl: acl.value })
}

function addExit() {
  const id = newExit.value.trim()
  if (!id) return
  exits.value = [...exits.value, { node_id: id, enabled: true }]
  newExit.value = ''
}

async function load() {
  loading.value = true
  err.value = null
  try {
    data.value = await localGatewayApi.getPluginProxy()
    resetDraft()
  } catch (e) {
    err.value = e instanceof LocalApiError ? e : new LocalApiError({ success: false, message: String(e) })
  } finally {
    loading.value = false
  }
}

async function save() {
  busy.value = true
  err.value = null
  try {
    const body = {
      ...(policy.value || {}),
      enabled: true,
      role: policy.value.role || 'server',
      exits: exits.value,
      acl: acl.value
    }
    await localGatewayApi.postPluginProxy(body)
    await load()
  } catch (e) {
    err.value = e instanceof LocalApiError ? e : new LocalApiError({ success: false, message: String(e) })
  } finally {
    busy.value = false
  }
}

function displayExit(id?: string) {
  if (!id) return '—'
  return nodeNames.value[id] || peerDisplayName({ node_id: id }, nodeNames.value)
}

async function loadNames() {
  try {
    const { localApi } = await import('../../services/local/localApi')
    const res = await localApi.getNodeNames()
    nodeNames.value = mergePersistedNames(res.names || {})
  } catch {
    nodeNames.value = loadPersistedNames()
  }
}

onMounted(() => {
  load()
  loadNames()
})
</script>

<style scoped>
.exit-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 8px;
  align-items: center;
}
</style>
