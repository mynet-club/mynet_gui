<template>
  <div class="ip-pool-manager">
    <!-- 工具栏 - 可选显示 -->
    <div v-if="!hideToolbar" class="toolbar q-mb-md">
      <div class="row q-gutter-md items-center">
        <div class="col-auto">
          <q-btn-group>
            <q-btn
              color="primary"
              icon="add"
              :label="$t('ippools.createPool')"
              @click="showCreateDialog = true"
            />
            <q-btn
              color="secondary"
              icon="refresh"
              :label="$t('common.refresh')"
              @click="refreshData"
            />
          </q-btn-group>
        </div>
        
        <q-space />
        
        <div class="col-auto text-caption text-grey-6">
          {{ $t('ippools.totalIPPoolsCount', { count: pools.length }) }}
        </div>
      </div>
    </div>

    <!-- 快速统计 -->
    <ResponsiveCardGrid
      :items="statsCards"
      :loading="loading"
      :loading-count="5"
      variant="compact"
      spacing="normal"
      :clickable="false"
      class="q-mb-md"
    >
      <template #default="{ item }">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">{{ item.value }}</div>
              <div class="text-caption text-grey-6">{{ item.title }}</div>
            </div>
            <div class="col-auto">
              <q-icon v-if="item.id !== 'usage_rate'" :name="item.icon" size="24px" :color="item.color" />
              <q-circular-progress
                v-else
                :value="statistics.usage_percentage || 0"
                size="24px"
                :thickness="0.2"
                color="warning"
                track-color="grey-3"
              />
            </div>
          </div>
        </q-card-section>
      </template>
    </ResponsiveCardGrid>

    <!-- IP池列表 -->
    <ResponsiveCardGrid
      :items="pools"
      :loading="loading"
      :loading-count="8"
      variant="standard"
      spacing="normal"
      :clickable="false"
      :item-key="(item) => item.sequence_number || item.id"
      :empty-icon="'storage'"
      :empty-title="$t('ippools.noPools')"
      :empty-description="$t('ippools.noPoolsHint')"
    >
      <template #default="{ item: pool }">
        <!-- 卡片标题区域 -->
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col">
              <div class="text-h6 text-weight-bold pool-title">{{ pool.name || $t('ippools.unnamedPool') }}</div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="pool-info q-mb-md">
            <div class="row q-gutter-md">
              <div class="col-12">
                <div class="info-row">
                  <q-icon name="settings_ethernet" size="sm" color="info" />
                  <span class="info-label">{{ $t('ippools.ipRange') }}:</span>
                  <span class="info-value text-mono">{{ pool.ip_range?.start || pool.ip_start }} - {{ pool.ip_range?.end || pool.ip_end }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 使用情况 -->
          <div class="usage-section q-mb-md">
            <div class="row items-center q-gutter-md">
              <div class="col-auto">
                <q-circular-progress
                  :value="getUsagePercent(pool)"
                  size="60px"
                  :thickness="0.15"
                  :color="getUsageColor(getUsagePercent(pool))"
                  track-color="grey-3"
                  show-value
                  class="text-weight-bold"
                />
              </div>
              <div class="col">
                <div class="usage-stats">
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('ippools.totalCount') }}:</span>
                    <span class="stat-value">{{ pool.total_ips || pool.ip_count || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('ippools.usedCount') }}:</span>
                    <span class="stat-value">{{ pool.used_ips || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ $t('ippools.availableCount') }}:</span>
                    <span class="stat-value">{{ pool.available_ips || (pool.total_ips || pool.ip_count || 0) - (pool.used_ips || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>          <!-- 底部功能区 -->
        <q-card-actions class="justify-between items-center">
          <!-- 左侧：IP池ID显示 -->
          <div class="text-caption text-grey-6">
            序列号: {{ pool.sequence_number || pool.id }}
          </div>
          
          <!-- 右侧：功能按钮 -->
          <div class="row q-gutter-xs">
            <q-btn
              icon="delete"
              size="sm"
              flat
              round
              color="negative"
              @click="deletePool(pool)"
              :title="$t('ippools.delete')"
            />
          </div>
        </q-card-actions>
      </template>
    </ResponsiveCardGrid>
    
    <!-- IP池创建对话框 -->
    <IPPoolCreateDialog
      v-model="showCreateDialog"
      :existing-pools="pools"
      @created="handlePoolsCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useIPPools } from '../../composables/useIPPools'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import IPPoolCreateDialog from './IPPoolCreateDialog.vue'
import type { IPPool } from '../../types/ippool'

interface Props {
  hideToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideToolbar: false
})

const { t } = useI18n()
const $q = useQuasar()

const {
  pools,
  statistics,
  loading,
  fetchPools,
  fetchStatistics,
  deletePool: deletePoolAction
} = useIPPools()

// 本地状态
const showCreateDialog = ref(false)

// 计算属性
const usagePercentage = computed(() => {
  if (statistics.value.total_ips === 0) return 0
  return Math.round((statistics.value.allocated_ips / statistics.value.total_ips) * 100)
})

// 统计卡片数据 - 展示4个指标：已创建IP池、可创建IP池、IP总数、已分配IP数
const statsCards = computed(() => {
  // 使用API统计数据或从IP池计算的统计数据
  const userQuota = statistics.value.user_quota || 3
  const createdCount = statistics.value.total_pools || pools.value.length
  const availableCount = Math.max(0, userQuota - createdCount)
  
  return [
    {
      id: 'created_pools',
      title: t('ippools.createdPools'),
      value: createdCount,
      icon: 'storage',
      color: 'primary'
    },
    {
      id: 'available_pools',
      title: t('ippools.availablePools'),
      value: availableCount,
      icon: 'add_circle',
      color: 'positive'
    },
    {
      id: 'total_ips',
      title: t('ippools.totalIPs'),
      value: statistics.value.total_ips || 0,
      icon: 'language',
      color: 'info'
    },
    {
      id: 'usage_rate',
      title: t('ippools.poolUsageRate'),
      value: `${Math.round(statistics.value.usage_percentage || 0)}%`,
      icon: 'pie_chart',
      color: 'warning'
    }
  ]
})

// IP池卡片相关方法
const getUsagePercent = (pool: IPPool): number => {
  const total = pool.total_ips || pool.ip_count || 0
  if (total === 0) return 0
  const used = pool.used_ips || 0
  return Math.round((used / total) * 100)
}

const getUsageColor = (percent: number): string => {
  if (percent >= 80) return 'negative'
  if (percent >= 60) return 'warning'
  return 'positive'
}

const getStatusColor = (status: string | number): string => {
  if (typeof status === 'number') {
    return status === 1 ? 'warning' : 'positive'
  }
  switch (status) {
    case 'available': return 'positive'
    case 'allocated': return 'warning'
    case 'full': return 'negative'
    default: return 'grey'
  }
}

const getStatusText = (status: string | number): string => {
  if (typeof status === 'number') {
    return status === 1 ? 'Allocated' : 'Available'
  }
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// 方法
const handlePoolsCreated = (createdPools: IPPool[]) => {
  debug.log('IP pools created:', createdPools)
  refreshData()
}

const viewPool = (pool: IPPool) => {
  debug.log('View pool:', pool)
  // TODO: 实现查看池详情
}

const editPool = (pool: IPPool) => {
  debug.log('Edit pool:', pool)
  // TODO: 实现编辑池
}

const managePool = (pool: IPPool) => {
  debug.log('Manage pool:', pool)
  // TODO: 实现管理池
}

const deletePool = (pool: IPPool) => {
  $q.dialog({
    title: t('ippools.deleteConfirmTitle'),
    message: t('ippools.deleteConfirmMessage', { name: pool.name || `IP池 ${pool.sequence_number || pool.id}` }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const identifier = pool.sequence_number || pool.id
    await deletePoolAction(identifier.toString(), pool.sequence_number)
    refreshData()
  })
}

const refreshData = () => {
  fetchPools()
  fetchStatistics()
}

// 生命周期
onMounted(async () => {
  debug.log('IPPoolManager mounted, fetching data...')
  await fetchPools()
  debug.log('Pools fetched:', pools.value)
  debug.log('Pools count:', pools.value.length)
  
  // 确保先获取IP池数据，然后尝试获取统计信息
  try {
    await fetchStatistics()
    debug.log('Statistics fetched:', statistics.value)
  } catch (error) {
    // 如果统计API失败，statisticsFromPools 已经在 fetchPools 中被调用
    debug.log('Using calculated statistics from pools data:', statistics.value)
  }
})
</script>

<style lang="scss" scoped>
.ip-pool-manager {
  .stat-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  // IP池卡片样式
  :deep(.responsive-card-grid) {
    .standard-card {
      transition: all 0.3s ease;
      border-radius: 8px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  // 卡片标题样式 - 减小字号
  .pool-title {
    font-size: 1.125rem !important; // 约为text-h6的0.75倍
    line-height: 1.4;
  }
  
  .pool-info {
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .info-label {
        font-weight: 500;
        color: var(--q-text-grey-7);
        min-width: 80px;
      }
      
      .info-value {
        font-weight: 600;
        
        &.text-mono {
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
  
  .usage-section {
    .usage-stats {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--q-text-grey-6);
        }
        
        .stat-value {
          font-weight: 600;
          font-size: 0.875rem;
        }
      }
    }
  }
}
</style>
