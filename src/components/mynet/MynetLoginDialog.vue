<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width:380px;max-width:460px">
      <q-card-section>
        <div class="text-h6">登录 MyNet</div>
        <div class="text-caption text-grey-7">经本机服务 → gateway → 云端，无需填写 API 地址</div>
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
import { LocalApiError } from '../../services/local/localApi'
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

watch(() => props.modelValue, (open) => {
  if (open) error.value = ''
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
    // 登录成功：清登录错误并刷新全站状态
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
