<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width:380px;max-width:480px">
      <q-card-section>
        <div class="text-h6">登录 MyNet</div>
        <div class="text-caption text-grey-7">经本机服务 → gateway → 云端，按配置的网关域名自动识别网络区</div>
        <div class="row items-center q-gutter-xs q-mt-sm">
          <q-chip
            dense
            color="blue-1"
            text-color="primary"
            icon="public"
          >
            {{ zoneLabel ? `当前网络区：${zoneLabel}` : (gatewayHost ? `当前网关：${gatewayHost}` : '默认网关：gw.mynet.club') }}
          </q-chip>
          <q-btn
            flat
            dense
            size="sm"
            color="primary"
            :label="editingGateway ? '收起' : '切换网关'"
            @click="editingGateway = !editingGateway"
          />
        </div>

        <div v-if="editingGateway" class="q-mt-sm q-pa-sm bg-grey-1 rounded-borders">
          <div class="row items-center q-gutter-xs">
            <q-input
              v-model="gatewayInput"
              dense
              outlined
              class="col"
              placeholder="输入网关域名，如 gw.mynet.club"
              :disable="savingGateway"
              @keyup.enter="onSaveGateway"
            />
            <q-btn
              dense
              color="primary"
              label="应用"
              :loading="savingGateway"
              :disable="!gatewayInput.trim()"
              @click="onSaveGateway"
            />
          </div>
          <div v-if="gatewayError" class="text-caption text-negative q-mt-xs">{{ gatewayError }}</div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <MynetFieldRow label="邮箱">
          <q-input v-model="email" type="email" dense outlined autofocus autocomplete="username" @keyup.enter="onLogin" />
        </MynetFieldRow>
        <MynetFieldRow label="密码">
          <q-input v-model="password" type="password" dense outlined autocomplete="current-password" @keyup.enter="onLogin" /><!-- GUARD-OK A1 误报：autocomplete 是表单属性，非凭据 -->
        </MynetFieldRow>
        <div v-if="error" class="text-caption text-negative q-mt-sm">{{ error }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="稍后" :disable="busy" @click="close" />
        <q-btn color="primary" label="登录" :loading="busy" :disable="!email || !password" @click="onLogin" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useExperienceStore } from '../../stores/experience'
import { localApi, LocalApiError } from '../../services/local/localApi'
import type { ZoneContext } from '../../types'
import MynetFieldRow from './MynetFieldRow.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const store = useExperienceStore()
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const zoneLabel = ref('')
const gatewayHost = ref('')
const gatewayInput = ref('')
const editingGateway = ref(false)
const savingGateway = ref(false)
const gatewayError = ref('')

async function loadGatewayZone() {
  try {
    const gw = await localApi.getGatewayConfig()
    gatewayHost.value = gw.host || gw.default_host || 'gw.mynet.club'
    gatewayInput.value = gatewayHost.value
  } catch {
    gatewayHost.value = ''
  }

  try {
    const { localHttp } = await import('../../services/local/localApi')
    const res = await localHttp.get('/wizard/zone-context')
    const ctx = ((res as any)?.data?.data ?? (res as any)?.data ?? res) as ZoneContext | undefined
    if (ctx?.resolved) {
      const name = ctx.name || (ctx.is_default_gateway ? '默认网络区' : '网络区')
      zoneLabel.value = ctx.gateway_host ? `${name}（${ctx.gateway_host}）` : name
    } else {
      zoneLabel.value = ''
    }
  } catch {
    zoneLabel.value = ''
  }
}

async function onSaveGateway() {
  const val = gatewayInput.value.trim()
  if (!val || savingGateway.value) return
  savingGateway.value = true
  gatewayError.value = ''
  try {
    const res = await localApi.putGatewayConfig(val)
    gatewayHost.value = res.host || val
    gatewayInput.value = gatewayHost.value
    editingGateway.value = false
    await loadGatewayZone()
  } catch (e) {
    gatewayError.value = e instanceof LocalApiError ? e.message : e instanceof Error ? e.message : String(e)
  } finally {
    savingGateway.value = false
  }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    error.value = ''
    gatewayError.value = ''
    editingGateway.value = false
    void loadGatewayZone()
  }
})

function close() {
  if (busy.value) return
  emit('update:modelValue', false)
}

async function onLogin() {
  if (!email.value || !password.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const { localHttp } = await import('../../services/local/localApi')
    await localHttp.post('/wizard/login', {
      email: email.value.trim(),
      password: password.value
    })
    password.value = ''
    store.error = null
    await store.refreshAll()
    emit('success')
    emit('update:modelValue', false)
  } catch (e) {
    error.value = e instanceof LocalApiError ? e.message : e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>
