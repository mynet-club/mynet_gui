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

    <!-- 当前Zone信息 -->
      <div class="row q-mb-lg">
        <div class="col-12">
          <q-card class="current-zone-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ $t('zones.currentZone') }}</div>
                  <div v-if="currentZone" class="text-body1 q-mt-sm">
                    <q-chip 
                      :color="currentZone.zone_status === 1 ? 'positive' : 'negative'"
                      :label="currentZone.zone_name" 
                      size="md"
                      icon="public"
                    />
                    <div class="text-body2 text-grey-6 q-mt-xs">
                      {{ $t('zones.domain') }}: {{ currentZone.zone_domain }}
                    </div>
                    <div class="text-body2 text-grey-6">
                      {{ $t('zones.admin') }}: {{ currentZone.zone_admin_name }}
                    </div>
                  </div>
                  <div v-else class="text-body2 text-grey-6">
                    {{ $t('zones.noCurrentZone') }}
                  </div>
                </div>
                <div class="col-auto" v-if="isCurrentZoneAdmin">
                  <q-chip color="info" :label="$t('zones.adminRole')" icon="admin_panel_settings" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Zone概览统计 -->
      <div v-if="currentZone && zoneStatistics[currentZone.zone_id]" class="q-mb-lg">
        <ResponsiveCardGrid
          :items="zoneStatsCards"
          variant="standard"
        />
      </div>

      <!-- 可用Zones列表 -->
      <div class="row">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('zones.availableZones') }}</div>
              
              <div v-if="loading && availableZones.length === 0" class="row justify-center q-py-lg">
                <q-spinner-dots color="primary" size="2em" />
              </div>

              <div v-else-if="availableZones.length === 0" class="text-center q-py-lg">
                <q-icon name="public_off" size="3rem" color="grey-5" class="q-mb-md" />
                <div class="text-h6 text-grey-6">{{ $t('zones.noAvailableZones') }}</div>
              </div>

              <div v-else>
                <div class="row q-gutter-md">
                  <div
                    v-for="zone in availableZones"
                    :key="zone.id"
                    class="col-12 col-md-6 col-lg-4"
                  >
                    <q-card 
                      class="zone-card cursor-pointer"
                      :class="{ 'current-zone': currentZone?.id === zone.id }"
                      @click="handleSwitchZone(zone)"
                    >
                      <q-card-section>
                        <div class="row items-center">
                          <div class="col">
                            <div class="text-h6">{{ zone.zone_name }}</div>
                            <div class="text-body2 text-grey-6">{{ zone.zone_domain }}</div>
                          </div>
                          <div class="col-auto">
                            <q-chip
                              :color="zone.zone_status === 1 ? 'positive' : 'negative'"
                              :label="zone.zone_status === 1 ? $t('common.active') : $t('common.inactive')"
                              size="sm"
                            />
                            <q-icon 
                              v-if="zone.pivot.is_admin === 1" 
                              name="admin_panel_settings"
                              color="info"
                              size="sm"
                              class="q-ml-sm"
                              :title="$t('zones.adminRole')"
                            />
                          </div>
                        </div>
                      </q-card-section>

                      <q-card-section class="q-pt-none">
                        <div class="text-body2 text-grey-6">
                          {{ $t('zones.admin') }}: {{ zone.zone_admin_name }}
                        </div>
                        <div class="text-body2 text-grey-6" v-if="zone.zone_remarks">
                          {{ zone.zone_remarks }}
                        </div>
                      </q-card-section>

                      <q-card-actions align="right">
                        <q-btn
                          v-if="currentZone?.id !== zone.id"
                          flat
                          :label="$t('zones.switchToZone')"
                          color="primary"
                          @click.stop="handleSwitchZone(zone)"
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
              zoneName: switchDialog.zoneName 
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
            @click="confirmSwitchZone"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useZones } from '../../composables/useZones'
import { useNotify } from '../../composables/useNotify'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import type { Zone } from '../../types'

const { t } = useI18n()
const notify = useNotify()

const {
  loading,
  currentZone,
  availableZones,
  zoneStatistics,
  isCurrentZoneAdmin,
  switchZone,
  getZoneStatistics,
  initForUser
} = useZones()

// Zone统计卡片数据
const zoneStatsCards = computed(() => {
  if (!currentZone.value || !zoneStatistics.value[currentZone.value.zone_id]) {
    return []
  }
  
  const stats = zoneStatistics.value[currentZone.value.zone_id]
  return [
    {
      id: 'total_nodes',
      title: t('zones.stats.totalNodes'),
      value: stats.node_count,
      icon: 'dns',
      color: 'primary'
    },
    {
      id: 'active_nodes',
      title: t('zones.stats.activeNodes'),
      value: stats.active_node_count,
      icon: 'wifi',
      color: 'positive'
    },
    {
      id: 'routes',
      title: t('zones.stats.routes'),
      value: stats.route_count,
      icon: 'route',
      color: 'info'
    },
    {
      id: 'users',
      title: t('zones.stats.users'),
      value: stats.user_count,
      icon: 'group',
      color: 'orange'
    }
  ]
})

// 对话框状态
const switchDialog = ref({
  show: false,
  zone: null as Zone | null,
  zoneName: ''
})

// 处理Zone切换
const handleSwitchZone = (zone: Zone) => {
  if (currentZone.value?.id === zone.id) {
    return // 已经是当前zone，无需切换
  }
  
  switchDialog.value = {
    show: true,
    zone,
    zoneName: zone.zone_name
  }
}

// 确认切换Zone
const confirmSwitchZone = async () => {
  if (!switchDialog.value.zone) return
  
  const success = await switchZone(switchDialog.value.zone.zone_id)
  if (success) {
    // 获取新zone的统计信息
    await getZoneStatistics(switchDialog.value.zone.zone_id.toString())
    switchDialog.value.show = false
  }
}

// 刷新数据
const handleRefresh = async () => {
  await initForUser()
  if (currentZone.value) {
    await getZoneStatistics(currentZone.value.zone_id.toString())
  }
}

// 初始化
onMounted(async () => {
  await initForUser()
  if (currentZone.value) {
    await getZoneStatistics(currentZone.value.zone_id.toString())
  }
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
