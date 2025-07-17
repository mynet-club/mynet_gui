<template>
  <div class="active-routes-tab">
    <!-- 搜索和过滤栏 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('routes.activeRoutes.searchPlaceholder')"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          :label="$t('routes.activeRoutes.statusFilter')"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- 路由列表 -->
    <ResponsiveCardGrid
      :items="filteredRoutes"
      :loading="loading"
      variant="standard"
      spacing="normal"
      empty-icon="route"
      :empty-title="searchQuery ? $t('routes.activeRoutes.noSearchResults') : $t('routes.activeRoutes.noRoutes')"
    >
      <template #default="{ item: route }">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="row items-center q-mb-sm">
                <q-icon 
                  :name="getRouteIcon(route.status)" 
                  :color="getRouteColor(route.status)"
                  size="md"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-h6">{{ route.source_node_name }} ↔ {{ route.target_node_name }}</div>
                  <div class="text-subtitle2 text-grey-6">
                    {{ route.source_ip }} → {{ route.target_ip }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-chip
                :color="getRouteColor(route.status)"
                :label="$t(`routes.status.${route.status}`)"
                size="sm"
              />
            </div>
            <div class="col-auto">
              <q-btn-dropdown
                flat
                round
                icon="more_vert"
                size="sm"
                no-caps
              >
                <q-list>
                  <q-item clickable @click="$emit('view-details', route)">
                    <q-item-section avatar>
                      <q-icon name="info" />
                    </q-item-section>
                    <q-item-section>{{ $t('routes.activeRoutes.viewDetails') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="$emit('disconnect', route.id)">
                    <q-item-section avatar>
                      <q-icon name="link_off" color="negative" />
                    </q-item-section>
                    <q-item-section class="text-negative">{{ $t('routes.activeRoutes.disconnect') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <div class="row q-gutter-md text-center">
                <div class="col">
                  <div class="text-h6 text-info">{{ route.bandwidth_usage }}</div>
                  <div class="text-caption text-grey-6">{{ $t('routes.activeRoutes.bandwidth') }}</div>
                </div>
                <div class="col">
                  <div class="text-h6 text-positive">{{ route.latency }}ms</div>
                  <div class="text-caption text-grey-6">{{ $t('routes.activeRoutes.latency') }}</div>
                </div>
                <div class="col">
                  <div class="text-h6" :class="route.packet_loss > 5 ? 'text-negative' : 'text-positive'">
                    {{ route.packet_loss }}%
                  </div>
                  <div class="text-caption text-grey-6">{{ $t('routes.activeRoutes.packetLoss') }}</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="row items-center">
                <div class="col">
                  <div class="text-body2">
                    <q-icon name="person" size="sm" class="q-mr-xs" />
                    <span v-if="route.friend_name">{{ route.friend_name }}</span>
                    <span v-else class="text-grey-6">{{ $t('routes.activeRoutes.unknownUser') }}</span>
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ $t('routes.activeRoutes.connectionType') }}: {{ $t(`routes.connectionType.${route.connection_type}`) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ $t('routes.activeRoutes.lastActive') }}: {{ formatDate(route.last_active) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import type { Route } from '../../types'

interface Props {
  routes: Route[]
  loading: boolean
}

interface Emits {
  (e: 'disconnect', routeId: string): void
  (e: 'view-details', route: Route): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

// 搜索和过滤
const searchQuery = ref('')
const statusFilter = ref('')

const statusOptions = [
  { label: t('routes.status.active'), value: 'active' },
  { label: t('routes.status.inactive'), value: 'inactive' },
  { label: t('routes.status.connecting'), value: 'connecting' },
  { label: t('routes.status.error'), value: 'error' }
]

// 过滤后的路由
const filteredRoutes = computed(() => {
  let filtered = props.routes

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(route => 
      route.source_node_name.toLowerCase().includes(query) ||
      route.target_node_name.toLowerCase().includes(query) ||
      route.source_ip.includes(query) ||
      route.target_ip.includes(query) ||
      (route.friend_name && route.friend_name.toLowerCase().includes(query))
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(route => route.status === statusFilter.value)
  }

  return filtered
})

// 获取路由图标
const getRouteIcon = (status: string) => {
  switch (status) {
    case 'active': return 'link'
    case 'inactive': return 'link_off'
    case 'connecting': return 'sync'
    case 'error': return 'error'
    default: return 'help'
  }
}

// 获取路由颜色
const getRouteColor = (status: string) => {
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'grey'
    case 'connecting': return 'warning'
    case 'error': return 'negative'
    default: return 'grey'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style lang="scss" scoped>
.active-routes-tab {
  .route-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
