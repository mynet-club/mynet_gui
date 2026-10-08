<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 420px; max-width: 560px">

      <!-- ── 第一屏：创建表单 ── -->
      <template v-if="step === 'form'">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="bolt" color="teal" size="md" class="q-mr-sm" />
          <span class="text-h6">{{ $t('nodes.quickCreate.title') }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-md">
            {{ $t('nodes.quickCreate.hint') }}
          </div>
          <q-input
            v-model="nodeName"
            :label="$t('nodes.quickCreate.nameLabel')"
            :placeholder="$t('nodes.quickCreate.namePlaceholder')"
            outlined
            autofocus
            :rules="[
              (v: string) => !!v || $t('validation.required'),
              (v: string) => (v.length >= 3 && v.length <= 255) || $t('nodes.quickCreate.nameRule')
            ]"
            @keyup.enter="doCreate"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="$t('common.cancel')" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="$t('nodes.quickCreate.createBtn')"
            color="teal"
            icon="bolt"
            :loading="creating"
            :disable="nodeName.length < 3"
            @click="doCreate"
          />
        </q-card-actions>
      </template>

      <!-- ── 第二屏：创建成功 + 引导 ── -->
      <template v-if="step === 'created'">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="check_circle" color="positive" size="md" class="q-mr-sm" />
          <span class="text-h6">{{ $t('nodes.quickCreate.successTitle') }}</span>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeAndRefresh" />
        </q-card-section>

        <!-- 节点基本信息 -->
        <q-card-section>
          <q-list dense>
            <q-item>
              <q-item-section side><q-icon name="label" /></q-item-section>
              <q-item-section>
                {{ $t('nodes.quickCreate.nodeName') }}<strong>{{ createdNode?.node_name }}</strong>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section side><q-icon name="lan" /></q-item-section>
              <q-item-section>
                {{ $t('nodes.quickCreate.nodeIp') }}<strong>{{ createdNode?.node_ip ?? $t('nodes.quickCreate.ipPending') }}</strong>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section side><q-icon name="settings_ethernet" /></q-item-section>
              <q-item-section>
                {{ $t('nodes.quickCreate.nodePort') }}<strong>{{ createdConfig?.listen ?? 9016 }}</strong>
                &nbsp;&nbsp;{{ $t('nodes.quickCreate.nodeIface') }}<strong>{{ createdConfig?.ifname ?? 'gnb_tun' }}</strong>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <!-- 引导步骤 -->
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">{{ $t('nodes.quickCreate.stepsTitle') }}</div>

          <!-- Step 1: 生成密钥 -->
          <div class="row items-center q-mb-sm">
            <q-badge :color="keyGenerated ? 'positive' : 'grey'" label="1" class="q-mr-sm" />
            <span class="text-body2" :class="keyGenerated ? 'text-grey-5 text-strike' : ''">
              {{ $t('nodes.quickCreate.step1') }}
            </span>
            <q-space />
            <q-btn
              v-if="!keyGenerated"
              dense unelevated size="sm"
              color="primary" icon="vpn_key"
              :label="$t('nodes.quickCreate.generateKey')"
              :loading="generatingKey"
              @click="doGenerateKey"
            />
            <q-icon v-else name="check" color="positive" />
          </div>

          <!-- 私钥展示（仅一次）-->
          <q-banner v-if="privateKeyOnce" class="bg-amber-1 q-mb-sm" rounded>
            <template v-slot:avatar><q-icon name="warning" color="amber-8" /></template>
            <div class="text-caption text-amber-9">{{ $t('nodes.quickCreate.privateKeyWarning') }}</div>
            <q-input
              :model-value="privateKeyOnce"
              type="textarea"
              :rows="3"
              readonly
              outlined
              dense
              class="q-mt-xs"
            >
              <template v-slot:append>
                <q-btn flat dense icon="content_copy" @click="copyKey" />
              </template>
            </q-input>
          </q-banner>

          <!-- Step 2: 启用节点 -->
          <div class="row items-center">
            <q-badge :color="nodeEnabled ? 'positive' : (keyGenerated ? 'warning' : 'grey')" label="2" class="q-mr-sm" />
            <span class="text-body2" :class="nodeEnabled ? 'text-grey-5 text-strike' : ''">
              {{ $t('nodes.quickCreate.step2') }}
            </span>
            <q-space />
            <q-btn
              v-if="!nodeEnabled"
              dense unelevated size="sm"
              color="teal" icon="play_arrow"
              :label="$t('nodes.quickCreate.enableNode')"
              :loading="enabling"
              :disable="!keyGenerated"
              @click="doEnable"
            />
            <q-icon v-else name="check" color="positive" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="$t('common.close')" color="grey-7" @click="closeAndRefresh" />
          <q-btn
            v-if="nodeEnabled"
            unelevated
            :label="$t('nodes.quickCreate.viewNode')"
            icon="open_in_new"
            color="primary"
            @click="goToDetail"
          />
        </q-card-actions>
      </template>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { nodeService } from '../../services/node/nodeService'
import { nodeKeysService } from '../../services/node/nodeKeysService'
import type { QuickCreateNodeResponse } from '../../types/node'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'created'): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// ── 表单 ──
const nodeName = ref('')
const step = ref<'form' | 'created'>('form')
const creating = ref(false)
const createdNode = ref<QuickCreateNodeResponse['node'] | null>(null)
const createdConfig = ref<QuickCreateNodeResponse['config'] | null>(null)
const createdNodeId = ref<string>('')

// ── 密钥 ──
const generatingKey = ref(false)
const keyGenerated = ref(false)
const privateKeyOnce = ref<string | null>(null)

// ── 启用 ──
const enabling = ref(false)
const nodeEnabled = ref(false)

// 重置状态（每次打开对话框时调用）
const reset = () => {
  nodeName.value = ''
  step.value = 'form'
  createdNode.value = null
  createdConfig.value = null
  createdNodeId.value = ''
  keyGenerated.value = false
  privateKeyOnce.value = null
  nodeEnabled.value = false
}

// ── Step 0: 一键创建 ──
const doCreate = async () => {
  if (nodeName.value.length < 3) return
  const tenantId = authStore.currentTenant?.tenant_id
  if (!tenantId) {
    $q.notify({ type: 'negative', message: t('nodes.quickCreate.noZone') })
    return
  }

  try {
    creating.value = true
    const res = await nodeService.quickCreateNode(nodeName.value)
    if (res.success && res.data) {
      createdNode.value = res.data.node
      createdConfig.value = res.data.config
      createdNodeId.value = String(res.data.node.node_id)
      step.value = 'created'
    } else {
      $q.notify({ type: 'negative', message: (res as any).message || t('nodes.quickCreate.createFailed') })
    }
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || t('nodes.quickCreate.createFailed') })
  } finally {
    creating.value = false
  }
}

// ── Step 1: 生成密钥 ──
const doGenerateKey = async () => {
  try {
    generatingKey.value = true
    const res = await nodeKeysService.generateNodeKeys(createdNodeId.value, { key_type: 'ed25519' })
    if (res.success && res.data) {
      keyGenerated.value = true
      // 私钥仅在响应中出现一次
      privateKeyOnce.value = (res.data as any).private_key ?? null
      $q.notify({ type: 'positive', message: t('nodes.quickCreate.keyGenSuccess') })
    } else {
      $q.notify({ type: 'negative', message: (res as any).message || t('nodes.quickCreate.keyGenFailed') })
    }
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || t('nodes.quickCreate.keyGenFailed') })
  } finally {
    generatingKey.value = false
  }
}

// ── Step 2: 启用节点 ──
const doEnable = async () => {
  try {
    enabling.value = true
    await nodeService.updateNodeStatusCode(createdNodeId.value, 1)
    nodeEnabled.value = true
    $q.notify({ type: 'positive', message: t('nodes.quickCreate.enableSuccess') })
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || t('nodes.quickCreate.enableFailed') })
  } finally {
    enabling.value = false
  }
}

// 复制私钥
const copyKey = async () => {
  if (privateKeyOnce.value) {
    await navigator.clipboard.writeText(privateKeyOnce.value)
    $q.notify({ type: 'positive', message: t('nodes.quickCreate.copied') })
  }
}

// 关闭并通知父组件刷新列表
const closeAndRefresh = () => {
  open.value = false
  emit('created')
  reset()
}

// 前往节点详情
const goToDetail = () => {
  const nodeId = createdNodeId.value
  closeAndRefresh()
  router.push(`/app/nodes/${nodeId}`)
}

// 每次对话框打开时重置
watch(() => props.modelValue, (v: boolean) => { if (v) reset() })
</script>
