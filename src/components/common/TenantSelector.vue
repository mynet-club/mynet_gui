<template>
  <q-btn
    flat 
    dense
    round
    icon="travel_explore"
    @click="showDialog = true"
    class="zone-selector"
  >
    <q-tooltip>
      {{ currentTenant?.zone_name || currentTenant?.name || $t('zones.selectZone') }}
    </q-tooltip>
    
    <!-- Tenant 切换弹窗 -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('zones.switchZone') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item 
              v-for="tenant in availableTenants" 
              :key="tenant.zone_id"
              clickable
              @click="switchTenant(tenant.zone_id)"
              :active="tenant.zone_id === currentTenant?.zone_id"
            >
              <q-item-section avatar>
                <q-icon 
                  name="travel_explore" 
                  :color="tenant.is_active ? 'primary' : 'grey'" 
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tenant.zone_name || tenant.name }}</q-item-label>
                <q-item-label caption>{{ tenant.zone_remarks || tenant.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end">
                  <q-chip 
                    :label="tenant.is_active ? $t('common.active') : $t('common.inactive')"
                    :color="tenant.is_active ? 'positive' : 'grey'"
                    text-color="white"
                    size="sm"
                  />
                  <q-icon 
                    v-if="tenant.zone_id === currentTenant?.zone_id"
                    name="check" 
                    color="positive" 
                    class="q-mt-xs"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import debug from 'src/utils/debug'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import type { Tenant } from '../../types'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// 对话框显示状态
const showDialog = ref(false)

// 计算属性
const currentTenant = computed(() => authStore.currentTenant)
const availableTenants = computed(() => authStore.availableTenants)

// Zone切换方法
const switchTenant = async (tenantId: number) => {
  debug.log('🔧 [TenantSelector] Switching to zone:', tenantId)
  debug.log('🔧 [TenantSelector] Current zone before switch:', currentTenant.value?.zone_name)
  
  try {
    // 先找到要切换到的zone
    const targetTenant = availableTenants.value.find(z => z.zone_id === tenantId)
    const targetTenantName = targetTenant?.zone_name || targetTenant?.name || t('zones.unknownZone')
    debug.log('🔧 [TenantSelector] Target zone:', targetTenantName)
    
    await authStore.switchTenant(tenantId)
    
    debug.log('🔧 [TenantSelector] Current zone after switch:', currentTenant.value?.zone_name)
    
    $q.notify({
      type: 'positive',
      message: t('zones.switchedTo', { zoneName: targetTenantName }),
      timeout: 3000
    })
    
    // 切换成功后关闭对话框
    showDialog.value = false
  } catch (error) {
    debug.error('🔧 [TenantSelector] Failed to switch zone:', error)
    $q.notify({
      type: 'negative',
      message: t('zones.switchFailed')
    })
  }
}
</script>

<style lang="scss" scoped>
.zone-selector {
  transition: all 0.2s ease;
  border-radius: 6px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .q-btn__content {
    gap: 6px;
    font-weight: 500;
  }
}
</style>
