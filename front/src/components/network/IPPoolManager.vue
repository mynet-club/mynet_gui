<template>
  <div class="ip-pool-manager">
    <!-- 工具栏 -->
    <div class="toolbar q-mb-md">
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
        
        <div class="col-auto">
          <q-separator vertical />
        </div>
        
        <div class="col-auto">
          <q-btn
            color="info"
            icon="file_download"
            :label="$t('ippools.export')"
            @click="exportData"
          />
        </div>
        
        <q-space />
        
        <div class="col-auto text-caption text-grey-6">
          {{ $t('ippools.totalIPPoolsCount', { count: pools.length }) }}
        </div>
      </div>
    </div>

    <!-- 快速统计 -->
    <div class="quick-stats q-mb-md">
      <div class="row q-gutter-md">
        <div class="col-12 col-md-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ statistics.total_pools }}</div>
                  <div class="text-caption text-grey-6">{{ $t('ippools.totalPools') }}</div>
                </div>
                <div class="col-auto">
                  <q-icon name="storage" size="24px" color="primary" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ statistics.total_ips }}</div>
                  <div class="text-caption text-grey-6">{{ $t('ippools.totalIPs') }}</div>
                </div>
                <div class="col-auto">
                  <q-icon name="language" size="24px" color="info" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ statistics.allocated_ips }}</div>
                  <div class="text-caption text-grey-6">{{ $t('ippools.allocatedIPs') }}</div>
                </div>
                <div class="col-auto">
                  <q-icon name="assignment" size="24px" color="positive" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ statistics.free_ips || statistics.available_ips || 0 }}</div>
                  <div class="text-caption text-grey-6">{{ $t('ippools.availableIPs') }}</div>
                </div>
                <div class="col-auto">
                  <q-icon name="check_circle" size="24px" color="positive" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ statistics.usage_percentage?.toFixed(1) || usagePercentage }}%</div>
                  <div class="text-caption text-grey-6">{{ $t('ippools.usageRate') }}</div>
                </div>
                <div class="col-auto">
                  <q-circular-progress
                    :value="statistics.usage_percentage || usagePercentage"
                    size="24px"
                    :thickness="0.2"
                    color="warning"
                    track-color="grey-3"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div class="card-view">
      <div class="row q-gutter-md">
        <div
          v-for="pool in pools"
          :key="pool.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <IPPoolCard
            :pool="pool"
            @view="viewPool"
            @edit="editPool"
            @manage="managePool"
            @delete="deletePool"
          />
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="pools.length === 0 && !loading" class="empty-state">
        <q-icon name="storage" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">{{ $t('ippools.noPools') }}</div>
        <div class="text-body2 text-grey-6">{{ $t('ippools.noPoolsHint') }}</div>
      </div>
    </div>
    
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
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useIPPools } from '../../composables/useIPPools'
import IPPoolCard from './IPPoolCard.vue'
import IPPoolCreateDialog from './IPPoolCreateDialog.vue'
import type { IPPool } from '../../types/ippool'

const { t } = useI18n()
const $q = useQuasar()

const {
  pools,
  statistics,
  loading,
  fetchPools,
  fetchStatistics,
  deletePool: deletePoolAction,
  exportPools
} = useIPPools()

// 本地状态
const showCreateDialog = ref(false)

// 计算属性
const usagePercentage = computed(() => {
  if (statistics.value.total_ips === 0) return 0
  return Math.round((statistics.value.allocated_ips / statistics.value.total_ips) * 100)
})

// 方法
const handlePoolsCreated = (createdPools: IPPool[]) => {
  console.log('IP pools created:', createdPools)
  refreshData()
}

const viewPool = (pool: IPPool) => {
  console.log('View pool:', pool)
  // TODO: 实现查看池详情
}

const editPool = (pool: IPPool) => {
  console.log('Edit pool:', pool)
  // TODO: 实现编辑池
}

const managePool = (pool: IPPool) => {
  console.log('Manage pool:', pool)
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

const exportData = () => {
  exportPools('csv')
}

// 生命周期
onMounted(async () => {
  console.log('IPPoolManager mounted, fetching data...')
  await fetchPools()
  console.log('Pools fetched:', pools.value)
  
  // 确保先获取IP池数据，然后尝试获取统计信息
  try {
    await fetchStatistics()
    console.log('Statistics fetched:', statistics.value)
  } catch (error) {
    // 如果统计API失败，statisticsFromPools 已经在 fetchPools 中被调用
    console.log('Using calculated statistics from pools data:', statistics.value)
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
  
  .card-view {
    min-height: 300px;
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      
      .q-icon {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
