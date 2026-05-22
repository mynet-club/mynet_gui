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
      {{ currentZone?.zone_name || currentZone?.name || $t('zones.selectZone') }}
    </q-tooltip>
    
    <!-- Zone 切换弹窗 -->
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
              v-for="zone in availableZones" 
              :key="zone.zone_id"
              clickable
              @click="switchZone(zone.zone_id)"
              :active="zone.zone_id === currentZone?.zone_id"
            >
              <q-item-section avatar>
                <q-icon 
                  name="travel_explore" 
                  :color="zone.is_active ? 'primary' : 'grey'" 
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ zone.zone_name || zone.name }}</q-item-label>
                <q-item-label caption>{{ zone.zone_remarks || zone.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end">
                  <q-chip 
                    :label="zone.is_active ? $t('common.active') : $t('common.inactive')"
                    :color="zone.is_active ? 'positive' : 'grey'"
                    text-color="white"
                    size="sm"
                  />
                  <q-icon 
                    v-if="zone.zone_id === currentZone?.zone_id"
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
import type { Zone } from '../../types'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// 对话框显示状态
const showDialog = ref(false)

// 计算属性
const currentZone = computed(() => authStore.currentZone)
const availableZones = computed(() => authStore.availableZones)

// Zone切换方法
const switchZone = async (zoneId: number) => {
  debug.log('🔧 [ZoneSelector] Switching to zone:', zoneId)
  debug.log('🔧 [ZoneSelector] Current zone before switch:', currentZone.value?.zone_name)
  
  try {
    // 先找到要切换到的zone
    const targetZone = availableZones.value.find(z => z.zone_id === zoneId)
    const targetZoneName = targetZone?.zone_name || targetZone?.name || 'Unknown Zone'
    debug.log('🔧 [ZoneSelector] Target zone:', targetZoneName)
    
    await authStore.switchZone(zoneId)
    
    debug.log('🔧 [ZoneSelector] Current zone after switch:', currentZone.value?.zone_name)
    
    $q.notify({
      type: 'positive',
      message: t('zones.switchedTo', { zoneName: targetZoneName }),
      timeout: 3000
    })
    
    // 切换成功后关闭对话框
    showDialog.value = false
  } catch (error) {
    debug.error('🔧 [ZoneSelector] Failed to switch zone:', error)
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
