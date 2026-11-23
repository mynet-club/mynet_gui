<template>
  <PageLayout
    :title="$t('navigation.zones')"
    :subtitle="$t('zones.subtitle')"
    icon="public"
  >
    <template #actions>
      <q-btn
        color="primary"
        icon="refresh"
        :label="$t('common.refresh')"
        @click="handleRefresh"
        :loading="loading || switchesLoading"
      />
    </template>

    <!-- 当前网络区信息 -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-card class="current-zone-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ $t('zones.currentZone') }}</div>
                <div v-if="currentTenant" class="text-body1 q-mt-sm">
                  <q-chip
                    :color="currentTenant.status === 'active' ? 'positive' : 'negative'"
                    :label="currentTenant.name"
                    size="md"
                    icon="public"
                  />
                  <div class="text-body2 text-grey-7 q-mt-xs">
                    网关域名：{{ currentTenant.gateway_domain || currentTenant.domain || currentTenant.slug || '—' }}
                  </div>
                  <div v-if="currentTenant.description" class="text-body2 text-grey-6 q-mt-xs">
                    {{ currentTenant.description }}
                  </div>
                </div>
                <div v-else class="text-body2 text-grey-6">
                  {{ $t('zones.noCurrentZone') }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 租户服务开关：Proxy / UTC 加速（租户提供节点） -->
    <div v-if="currentTenant" class="row q-mb-lg">
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h6">网络区服务开关</div>
              <div class="text-caption text-grey-6">
                控制当前网络区可开启的基础服务（Proxy 代理、UTC 加速节点服务）
              </div>
            </div>
            <q-badge v-if="!canManageServices && !switchesLoading" color="grey-6" outline>
              只读（需网络区管理员权限）
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="switchesLoading && !serviceSwitches" class="row justify-center q-py-md">
              <q-spinner-dots color="primary" size="2em" />
            </div>

            <div v-else-if="serviceSwitches" class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered class="service-switch-card">
                  <q-card-section class="row items-center justify-between no-wrap">
                    <div class="q-pr-md">
                      <div class="row items-center q-gutter-xs">
                        <q-icon name="vpn_lock" color="primary" size="20px" />
                        <span class="text-subtitle1 text-weight-medium">
                          {{ serviceSwitches.proxy.label }}
                        </span>
                        <q-chip
                          dense
                          size="sm"
                          :color="serviceSwitches.proxy.enabled ? 'positive' : 'grey-5'"
                          text-color="white"
                        >
                          {{ serviceSwitches.proxy.enabled ? '已开启' : '未开启' }}
                        </q-chip>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        {{ serviceSwitches.proxy.description }}
                      </div>
                    </div>
                    <q-toggle
                      :model-value="serviceSwitches.proxy.enabled"
                      color="positive"
                      :disable="!canManageServices || updatingKey === 'proxy'"
                      @update:model-value="(val) => handleToggleService('proxy', val)"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered class="service-switch-card">
                  <q-card-section class="row items-center justify-between no-wrap">
                    <div class="q-pr-md">
                      <div class="row items-center q-gutter-xs">
                        <q-icon name="speed" color="secondary" size="20px" />
                        <span class="text-subtitle1 text-weight-medium">
                          {{ serviceSwitches.utc_acceleration.label }}
                        </span>
                        <q-chip
                          dense
                          size="sm"
                          :color="serviceSwitches.utc_acceleration.enabled ? 'positive' : 'grey-5'"
                          text-color="white"
                        >
                          {{ serviceSwitches.utc_acceleration.enabled ? '已开启' : '未开启' }}
                        </q-chip>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        {{ serviceSwitches.utc_acceleration.description }}
                      </div>
                    </div>
                    <q-toggle
                      :model-value="serviceSwitches.utc_acceleration.enabled"
                      color="positive"
                      :disable="!canManageServices || updatingKey === 'utc_acceleration'"
                      @update:model-value="(val) => handleToggleService('utc_acceleration', val)"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 可用网络区列表 -->
    <div class="row">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('zones.availableZones') }}</div>

            <div v-if="loading && availableTenants.length === 0" class="row justify-center q-py-lg">
              <q-spinner-dots color="primary" size="2em" />
            </div>

            <div v-else-if="availableTenants.length === 0" class="text-center q-py-lg">
              <q-icon name="public_off" size="3rem" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-6">{{ $t('zones.noAvailableZones') }}</div>
            </div>

            <div v-else>
              <div class="row q-gutter-md">
                <div
                  v-for="tenant in availableTenants"
                  :key="tenant.tenant_id"
                  class="col-12 col-md-6 col-lg-4"
                >
                  <q-card
                    class="zone-card cursor-pointer"
                    :class="{ 'current-zone': currentTenant?.tenant_id === tenant.tenant_id }"
                    @click="handleSwitchTenant(tenant)"
                  >
                    <q-card-section>
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-h6">{{ tenant.name }}</div>
                          <div class="text-body2 text-grey-6">
                            {{ tenant.gateway_domain || tenant.domain || tenant.slug || `ID: ${tenant.tenant_id}` }}
                          </div>
                        </div>
                        <div class="col-auto">
                          <q-chip
                            :color="tenant.status === 'active' ? 'positive' : 'negative'"
                            :label="tenant.status === 'active' ? $t('common.active') : $t('common.inactive')"
                            size="sm"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <div class="text-body2 text-grey-6" v-if="tenant.description">
                        {{ tenant.description }}
                      </div>
                      <div v-if="tenant.service_switches" class="row q-gutter-xs q-mt-xs">
                        <q-chip
                          dense
                          size="xs"
                          :color="tenant.service_switches.proxy.enabled ? 'positive' : 'grey-4'"
                          :text-color="tenant.service_switches.proxy.enabled ? 'white' : 'grey-8'"
                        >
                          Proxy: {{ tenant.service_switches.proxy.enabled ? '开' : '关' }}
                        </q-chip>
                        <q-chip
                          dense
                          size="xs"
                          :color="tenant.service_switches.utc_acceleration.enabled ? 'positive' : 'grey-4'"
                          :text-color="tenant.service_switches.utc_acceleration.enabled ? 'white' : 'grey-8'"
                        >
                          UTC 加速: {{ tenant.service_switches.utc_acceleration.enabled ? '开' : '关' }}
                        </q-chip>
                      </div>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn
                        v-if="currentTenant?.tenant_id !== tenant.tenant_id"
                        flat
                        :label="$t('zones.switchToZone')"
                        color="primary"
                        @click.stop="handleSwitchTenant(tenant)"
                      />
                      <q-btn
                        v-else
                        flat
                        :label="$t('zones.currentZone')"
                        color="positive"
                        disable
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Zone切换确认对话框 -->
    <q-dialog v-model="switchDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('zones.dialogs.switchZone.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            {{ $t('zones.dialogs.switchZone.message', {
              zoneName: switchDialog.tenantName
            }) }}
          </div>
          <q-banner class="bg-warning text-dark">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            {{ $t('zones.dialogs.switchZone.warning') }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('zones.actions.switch')"
            color="primary"
            @click="confirmSwitchTenant"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useTenants } from '../../composables/useTenants'
import { tenantService } from '../../services/tenant/tenantService'
import PageLayout from '../../components/layout/PageLayout.vue'
import type { Tenant, TenantServiceSwitches } from '../../types'

const $q = useQuasar()

const {
  loading,
  currentTenant,
  availableTenants,
  switchTenant,
  init
} = useTenants()

const switchesLoading = ref(false)
const updatingKey = ref<'' | 'proxy' | 'utc_acceleration'>('')
const canManageServices = ref(false)
const serviceSwitches = ref<TenantServiceSwitches | null>(null)

const loadServiceSwitches = async () => {
  if (!currentTenant.value) {
    serviceSwitches.value = null
    return
  }
  switchesLoading.value = true
  try {
    const res = await tenantService.getServiceSwitches()
    serviceSwitches.value = res.switches
    canManageServices.value = res.can_manage
  } catch (error: any) {
    // 回退使用列表里自带的开关
    if (currentTenant.value.service_switches) {
      serviceSwitches.value = currentTenant.value.service_switches
      canManageServices.value = Boolean(currentTenant.value.can_manage_services)
    }
  } finally {
    switchesLoading.value = false
  }
}

const handleToggleService = async (key: 'proxy' | 'utc_acceleration', enabled: boolean) => {
  if (!canManageServices.value) return
  updatingKey.value = key
  try {
    const res = await tenantService.updateServiceSwitches({ [key]: enabled })
    serviceSwitches.value = res.switches
    canManageServices.value = res.can_manage
    if (currentTenant.value) {
      currentTenant.value.service_switches = res.switches
    }
    $q.notify({
      type: 'positive',
      message: `${res.switches[key].label}已${enabled ? '开启' : '关闭'}`,
      timeout: 2000
    })
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || '更新服务开关失败'
    $q.notify({
      type: 'negative',
      message: msg,
      timeout: 3000
    })
  } finally {
    updatingKey.value = ''
  }
}

const switchDialog = ref({
  show: false,
  tenant: null as Tenant | null,
  tenantName: ''
})

const handleSwitchTenant = (tenant: Tenant) => {
  if (currentTenant.value?.tenant_id === tenant.tenant_id) {
    return
  }

  switchDialog.value = {
    show: true,
    tenant,
    tenantName: tenant.name
  }
}

const confirmSwitchTenant = async () => {
  if (!switchDialog.value.tenant) return

  const switched = await switchTenant(switchDialog.value.tenant.tenant_id)
  if (switched) {
    switchDialog.value.show = false
    await loadServiceSwitches()
  }
}

const handleRefresh = async () => {
  await init()
  await loadServiceSwitches()
}

onMounted(async () => {
  await init()
  await loadServiceSwitches()
})
</script>

<style lang="scss" scoped>
.service-switch-card {
  height: 100%;
}

.zone-card {
  border: 2px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-color: var(--q-primary);
  }

  &.current-zone {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.05);
  }
}
</style>
