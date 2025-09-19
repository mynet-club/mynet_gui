<template>
  <q-btn-dropdown 
    flat 
    dense
    :icon="'business'"
    :label="$q.screen.gt.sm ? (currentZone?.zone_name || currentZone?.name || $t('zones.selectZone')) : ''"
    class="q-mr-sm zone-selector"
    :color="currentZone ? 'white' : 'orange'"
  >
    <q-list>
      <q-item-label header class="text-weight-bold">
        {{ $t('zones.switchZone') }}
      </q-item-label>
      <q-item 
        v-for="zone in availableZones" 
        :key="zone.zone_id"
        clickable
        @click="switchZone(zone.zone_id)"
        :active="zone.zone_id === currentZone?.zone_id"
      >
        <q-item-section avatar>
          <q-icon 
            name="business" 
            :color="zone.is_active ? 'positive' : 'grey'" 
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
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import debug from "src/utils/debug"
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import type { Zone } from '../../types'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

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
