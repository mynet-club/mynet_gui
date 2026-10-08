<template>
  <PageLayout :title="$t(createdDevice ? 'workflow.deviceCreated' : 'nodes.createNode')" :subtitle="$t(createdDevice ? 'workflow.deviceCreatedHint' : 'workflow.simpleCreateHint')" icon="add_circle">
    <div class="create-device">
      <q-card v-if="!createdDevice">
        <q-card-section>
          <q-form ref="createForm" @submit="onSubmit" class="q-gutter-lg">
            <q-input
              v-model="form.node_name" :label="$t('nodes.name')" :placeholder="$t('nodes.namePlaceholder')"
              outlined autofocus maxlength="255" lazy-rules :readonly="isCreating"
              :rules="[value => (!!value && value.trim().length >= 3 && value.trim().length <= 255) || $t('nodes.quickCreate.nameRule')]"
            />
            <div>
              <div class="text-subtitle2 q-mb-sm">{{ $t('workflow.vpnType') }}</div>
              <q-btn-toggle
                v-model="form.vpn_type" :options="vpnOptions" :disable="isCreating"
                :aria-label="$t('workflow.vpnType')" no-caps unelevated toggle-color="primary"
              />
            </div>
            <div class="creation-defaults text-body2">
              <q-icon name="auto_awesome" color="primary" class="q-mr-sm" />
              {{ $t('workflow.automaticDefaults') }}
            </div>
            <q-expansion-item v-model="expertMode" :disable="isCreating" :label="$t('workflow.expertMode')" icon="tune" dense>
              <div class="q-pt-md">
                <q-banner v-if="ipPoolId || ipGroupSequenceNumber" class="q-mb-md" rounded>
                  {{ $t('workflow.selectedPool') }}: {{ ipPoolId || ipGroupSequenceNumber }}
                </q-banner>
                <q-input v-model="form.description" :label="$t('workflow.optionalDescription')" outlined type="textarea" rows="3" maxlength="1000" :readonly="isCreating" />
                <div class="text-caption q-mt-md">{{ $t('workflow.expertAfterCreate') }}</div>
                <q-btn flat color="primary" icon="dns" :label="$t('workflow.manageIpPools')" to="/app/ippools" :disable="isCreating" class="q-mt-sm" />
              </div>
            </q-expansion-item>
            <q-banner v-if="createError" rounded class="creation-error" role="alert">{{ createError }}</q-banner>
            <div class="row q-gutter-sm">
              <q-btn type="submit" unelevated color="primary" icon="add" :label="$t('nodes.createNode')" :loading="isCreating" />
              <q-btn flat :label="$t('common.cancel')" to="/app/nodes" :disable="isCreating" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
      <q-card v-else>
        <q-card-section class="text-center" role="status">
          <q-icon name="check_circle" color="positive" size="48px" />
          <h2 class="text-h6 q-my-md">{{ createdDevice.name }}</h2>
          <div class="text-body1 q-mb-sm">{{ createdDevice.ip || $t('nodes.quickCreate.ipPending') }}</div>
          <div class="text-caption">{{ createdDevice.vpnType }}</div>
          <p v-if="createdDevice.poolCreated" class="text-body2 q-mt-md">{{ $t('workflow.firstPoolCreated') }}</p>
          <p class="text-body2 q-mt-md">{{ $t('workflow.deviceNextStep') }}</p>
        </q-card-section>
        <q-card-actions class="creation-actions" align="center">
          <q-btn v-if="isLocalPanel" unelevated color="primary" icon="link" :label="$t('workflow.connectLocally')" @click="connectLocally" />
          <q-btn unelevated :color="isLocalPanel ? 'secondary' : 'primary'" icon="device_hub" :label="$t('nodes.quickCreate.viewNode')" :to="`/app/nodes/${createdDevice.id}`" />
          <q-btn flat color="primary" :label="$t('workflow.expertMode')" :to="`/app/nodes/${createdDevice.id}/edit/config?mode=expert`" />
          <q-btn flat :label="$t('workflow.createAnotherDevice')" @click="createAnother" />
        </q-card-actions>
      </q-card>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import type { QForm } from 'quasar'
import { nodeService } from '../../services/node/nodeService'
import { useOnboardingActions } from '../../composables/useOnboardingActions'
import type { VpnType } from '../../types/node'
import PageLayout from '../../components/layout/PageLayout.vue'

const route = useRoute()
const { t } = useI18n()
const { onNodeCreated, onIpPoolCreated } = useOnboardingActions()
const createForm = ref<QForm | null>(null)
const form = ref({ node_name: '', description: '', vpn_type: 'gnb' as VpnType })
const isCreating = ref(false)
const createError = ref('')
const ipPoolId = computed(() => route.query.ip_pool_id as string | undefined)
const ipGroupSequenceNumber = computed(() => route.query.ip_group_sequence_number as string | undefined)
const expertMode = ref(!!(ipPoolId.value || ipGroupSequenceNumber.value))
watch(expertMode, enabled => { if (!enabled && form.value.vpn_type === 'openvpn') form.value.vpn_type = 'gnb' })
const vpnOptions = computed(() => [
  { label: 'GNB', value: 'gnb' },
  { label: 'WireGuard', value: 'wireguard' },
  ...(expertMode.value ? [{ label: 'OpenVPN', value: 'openvpn' }] : [])
])
// Only the same-origin local panel can consume this explicit user action.
const isLocalPanel = window.parent !== window && window.location.pathname.startsWith('/gui/')
const connectLocally = () => {
  if (!createdDevice.value) return
  window.parent.postMessage({ type: 'mynet:connect-device', nodeId: String(createdDevice.value.id) }, window.location.origin)
}
const createdDevice = ref<{ id: string | number; name: string; ip?: string | null; vpnType: string; poolCreated: boolean } | null>(null)
onBeforeRouteLeave(() => !isCreating.value)

const onSubmit = async () => {
  if (isCreating.value || createdDevice.value) return
  if (!await createForm.value?.validate() || isCreating.value) return
  isCreating.value = true
  createError.value = ''
  try {
    // Explicit pool and legacy driver selections retain the existing expert path.
    if (ipPoolId.value || ipGroupSequenceNumber.value || form.value.vpn_type === 'openvpn') {
      const response = await nodeService.createNode({
        node_name: form.value.node_name.trim(), vpn_type: form.value.vpn_type,
        ...(form.value.description && { description: form.value.description }),
        ...(ipPoolId.value && { ip_pool_id: ipPoolId.value }),
        ...(ipGroupSequenceNumber.value && { ip_group_sequence_number: ipGroupSequenceNumber.value })
      })
      if (!response.success || !response.data) throw new Error(response.message || t('nodes.operations.createFailed'))
      const node = response.data
      createdDevice.value = { id: node.node_id || node.id, name: node.node_name, ip: node.node_ip ?? null, vpnType: form.value.vpn_type.toUpperCase(), poolCreated: false }
    } else {
      const response = await nodeService.quickCreateNode(form.value.node_name.trim(), form.value.vpn_type, form.value.description)
      if (!response.success || !response.data?.node?.node_id) throw new Error(response.message || t('nodes.operations.createFailed'))
      const node = response.data.node
      createdDevice.value = { id: node.node_id, name: node.node_name, ip: node.node_ip ?? null, vpnType: form.value.vpn_type.toUpperCase(), poolCreated: response.data.ip_pool_created ?? false }
      onIpPoolCreated()
    }
    onNodeCreated()
  } catch (error: any) {
    createError.value = error?.response?.data?.message || error?.message || t('nodes.operations.createFailed')
  } finally {
    isCreating.value = false
  }
}
const createAnother = () => {
  form.value = { node_name: '', description: '', vpn_type: 'gnb' }
  createdDevice.value = null
  createError.value = ''
}
</script>

<style scoped lang="scss">
.create-device { max-width: 680px; margin: 0 auto; }
.creation-defaults { padding: 16px; border-radius: 8px; background: var(--primary-soft); color: var(--text-secondary); }
.creation-error { color: var(--status-error); }
.creation-actions { flex-wrap: wrap; gap: 8px; padding-bottom: 24px; }
</style>
