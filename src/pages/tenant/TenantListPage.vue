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
        :loading="loading"
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
                    <div class="text-body2 text-grey-6 q-mt-xs">
                      {{ $t('zones.domain') }}: {{ currentTenant.domain }}
                    </div>
                    <div class="text-body2 text-grey-6">
                      {{ $t('zones.admin') }}: {{ currentTenant.admin_name }}
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
                            <div class="text-body2 text-grey-6">{{ tenant.domain }}</div>
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
                        <div class="text-body2 text-grey-6">
                          {{ $t('zones.admin') }}: {{ tenant.admin_name }}
                        </div>
                        <div class="text-body2 text-grey-6" v-if="tenant.description">
                          {{ tenant.description }}
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
import { useTenants } from '../../composables/useTenants'
import PageLayout from '../../components/layout/PageLayout.vue'
import type { Tenant } from '../../types'

const {
  loading,
  currentTenant,
  availableTenants,
  switchTenant,
  init
} = useTenants()

// 对话框状态
const switchDialog = ref({
  show: false,
  tenant: null as Tenant | null,
  tenantName: ''
})

// 处理网络区切换
const handleSwitchTenant = (tenant: Tenant) => {
  if (currentTenant.value?.tenant_id === tenant.tenant_id) {
    return // 已经是当前网络区，无需切换
  }

  switchDialog.value = {
    show: true,
    tenant,
    tenantName: tenant.name
  }
}

// 确认切换
const confirmSwitchTenant = async () => {
  if (!switchDialog.value.tenant) return

  const switched = await switchTenant(switchDialog.value.tenant.tenant_id)
  if (switched) {
    switchDialog.value.show = false
  }
}

// 刷新数据
const handleRefresh = async () => {
  await init()
}

// 初始化
onMounted(async () => {
  await init()
})
</script>

<style lang="scss" scoped>
.zones-page {
  .current-zone-card {
    background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
    color: white;
    
    .q-chip {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }

  .stats-card, .zone-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .zone-card {
    border: 2px solid transparent;
    
    &.current-zone {
      border-color: var(--q-primary);
      background: rgba(var(--q-primary-rgb), 0.05);
    }
    
    &:hover {
      border-color: var(--q-primary);
    }
  }
}
</style>
