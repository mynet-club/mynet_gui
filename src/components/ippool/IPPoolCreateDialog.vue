<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 400px; max-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ $t('ippools.createPool') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <!-- 配额信息 -->
          <q-banner
            v-if="remainingPools === 0"
            class="text-negative bg-negative-1"
            rounded
          >
            <template #avatar>
              <q-icon name="warning" />
            </template>
            {{ $t('ippools.quotaExhausted') }}
          </q-banner>
          <q-banner
            v-else
            class="text-info bg-info-1"
            rounded
          >
            <template #avatar>
              <q-icon name="info" />
            </template>
            {{ $t('ippools.quotaInfo', { 
              current: currentPoolsCount, 
              max: statistics?.user_quota || MAX_POOLS_PER_ZONE 
            }) }}
            <!-- 调试信息（生产环境应移除） -->
            <div class="text-caption q-mt-xs" style="opacity: 0.7;">
              调试: 统计池数={{ statistics?.total_pools || 0 }}, 
              传入池数={{ existingPools.length }}, 
              配额={{ statistics?.user_quota || MAX_POOLS_PER_ZONE }}
            </div>
          </q-banner>

          <!-- 创建数量 -->
          <div class="column q-gutter-sm">
            <q-item-label class="text-subtitle2">
              {{ $t('ippools.createCount') }}
              <ContextHelp
                tooltip="点击查看创建数量说明"
                content="<p>一次可以创建多个 IP 资源池</p>
                         <ul>
                           <li>每个池独立管理 IP 地址段</li>
                           <li>建议按用途分别创建（如：办公、家庭、测试）</li>
                         </ul>"
              />
            </q-item-label>
            <q-option-group
              v-model="form.poolsCount"
              :options="poolsCountOptions"
              :disable="remainingPools === 0"
              color="primary"
              inline
            />
          </div>

          <!-- 连续性选择 -->
          <div v-if="currentPoolsCount > 0" class="column q-gutter-sm">
            <q-item-label class="text-subtitle2">
              {{ $t('ippools.continuous') }}
              <ContextHelp
                tooltip="什么是连续性？"
                title="IP 池连续性"
                mode="dialog"
                content="<p><strong>连续性</strong>指相邻的 IP 池使用连续的 IP 地址段</p>
                         <p><strong>优点：</strong></p>
                         <ul>
                           <li>便于统一管理和规划</li>
                           <li>路由配置更简单</li>
                           <li>避免地址碎片化</li>
                         </ul>
                         <p><strong>示例：</strong></p>
                         <ul>
                           <li>池1: 10.0.0.0/24 (10.0.0.1-254)</li>
                           <li>池2: 10.0.1.0/24 (10.0.1.1-254) ← 连续</li>
                         </ul>"
              />
            </q-item-label>
            <q-option-group
              v-model="form.continuous"
              :options="continuousOptions"
              color="primary"
              inline
            />
          </div>

          <!-- 目标池选择 -->
          <div v-if="shouldShowTargetPool" class="column q-gutter-sm">
            <q-item-label class="text-subtitle2">{{ $t('ippools.selectTargetPool') }}</q-item-label>
            <q-select
              v-model="form.targetPoolSequence"
              :options="targetPoolOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              :hint="targetPoolHint"
            />
          </div>
          
          <!-- 连续性策略说明 -->
          <div v-if="form.continuous && shouldShowTargetPool" class="q-pa-sm bg-grey-2 rounded-borders">
            <div class="text-body2 text-grey-8">
              <q-icon name="lightbulb" class="q-mr-sm" />
              <strong>连续性说明：</strong>
              <ul class="q-ma-none q-pl-md">
                <li>选择带有 [↑连续] 标记的池：新IP池将在其前面创建</li>
                <li>选择带有 [↓连续] 标记的池：新IP池将在其后面创建</li>
                <li>选择带有 [↑连续 ↓连续] 标记的池：系统将自动选择最佳位置</li>
                <li>选择无连续标记的池：将在其附近创建新的连续区域</li>
              </ul>
            </div>
          </div>
          
          <!-- 当只有1个池时的提示 -->
          <div v-if="form.continuous && currentPoolsCount === 1" class="q-pa-sm bg-blue-1 rounded-borders">
            <div class="text-body2 text-blue-8">
              <q-icon name="info" class="q-mr-sm" />
              {{ $t('ippools.autoSelectSinglePool', { poolName: targetPoolOptions[0]?.label || 'IP池' }) }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" v-close-popup />
        <q-btn
          color="primary"
          :label="$t('ippools.createPool')"
          :loading="createLoading"
          :disable="!canCreate"
          @click="handleCreate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useIPPools } from '../../composables/useIPPools'
import type { IPPool } from '../../types/ippool'
import ContextHelp from '../common/ContextHelp.vue'

// Props
interface Props {
  modelValue: boolean
  existingPools: IPPool[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  existingPools: () => []
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': [pools: IPPool[]]
}>()

// Constants
const MAX_POOLS_PER_ZONE = 3

// Composables
const { t } = useI18n()
const { createLoading, autoAllocatePool, statistics, fetchStatistics } = useIPPools()

// Reactive data
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  poolsCount: 1,
  continuous: false,
  targetPoolSequence: ''
})

// Computed properties
const currentPoolsCount = computed(() => {
  // 优先使用统计数据中的池数量，如果没有则使用传入的 pools 数量
  const statsCount = statistics.value?.total_pools || 0
  const propsCount = props.existingPools.length
  const result = statsCount || propsCount
  
  debug.log('currentPoolsCount computed:', {
    statsCount,
    propsCount,
    result,
    statisticsValue: statistics.value
  })
  
  return result
})

const remainingPools = computed(() => {
  const userQuota = statistics.value?.user_quota || MAX_POOLS_PER_ZONE
  const result = Math.max(0, userQuota - currentPoolsCount.value)
  
  debug.log('remainingPools computed:', {
    userQuota,
    currentCount: currentPoolsCount.value,
    result
  })
  
  return result
})

const poolsCountOptions = computed(() => {
  const options = []
  for (let i = 1; i <= remainingPools.value && i <= 3; i++) {
    options.push({
      label: `${i} ${t('ippools.poolsUnit')}`,
      value: i
    })
  }
  return options
})

const continuousOptions = computed(() => [
  { label: t('ippools.discontinuous'), value: false },
  { label: t('ippools.continuous'), value: true }
])

// 简化的目标池选择逻辑：
// - 0个池: 连续选项不可选
// - 1个池: 连续选项可选，但不显示目标池选择（自动以那1个池为目标）
// - 2个或更多池: 连续选项可选，显示目标池选择
const shouldShowTargetPool = computed(() => {
  return form.value.continuous && props.existingPools.length > 1
})

const targetPoolOptions = computed(() => {
  // 按IP地址排序现有池
  const sortedPools = [...props.existingPools].sort((a, b) => {
    const aStart = ipToNumber(a.ip_range.start)
    const bStart = ipToNumber(b.ip_range.start)
    return aStart - bStart
  })
  
  return sortedPools.map((pool, index) => {
    const poolName = pool.name || `IP池 ${pool.sequence_number || pool.id}`
    const ipRange = `${pool.ip_range.start} - ${pool.ip_range.end}`
    
    // 检查这个池是否与其他池连续
    let continuityInfo = ''
    if (sortedPools.length > 1) {
      const isFirstPool = index === 0
      const isLastPool = index === sortedPools.length - 1
      
      if (!isFirstPool) {
        const prevPool = sortedPools[index - 1]
        if (prevPool) {
          const prevEnd = ipToNumber(prevPool.ip_range.end)
          const currentStart = ipToNumber(pool.ip_range.start)
          if (currentStart === prevEnd + 1) {
            continuityInfo += '↑连续'
          }
        }
      }
      
      if (!isLastPool) {
        const nextPool = sortedPools[index + 1]
        if (nextPool) {
          const currentEnd = ipToNumber(pool.ip_range.end)
          const nextStart = ipToNumber(nextPool.ip_range.start)
          if (nextStart === currentEnd + 1) {
            continuityInfo += continuityInfo ? ' ↓连续' : '↓连续'
          }
        }
      }
      
      if (continuityInfo) {
        continuityInfo = ` [${continuityInfo}]`
      }
    }
    
    return {
      label: `${poolName} (${ipRange})${continuityInfo}`,
      value: (pool.sequence_number || pool.id).toString()
    }
  })
})

const canCreate = computed(() => {
  return !!(
    remainingPools.value > 0 &&
    form.value.poolsCount > 0 &&
    form.value.poolsCount <= remainingPools.value &&
    (!shouldShowTargetPool.value || form.value.targetPoolSequence)
  )
})

// 获取实际的目标池序列号（用于API调用）
const getActualTargetPoolSequence = computed(() => {
  if (!form.value.continuous) return null
  
  // 如果只有1个池，自动使用那个池
  if (props.existingPools.length === 1) {
    const pool = props.existingPools[0]
    return (pool?.sequence_number || pool?.id)?.toString() || null
  }
  
  // 如果有多个池，使用用户选择的池
  return form.value.targetPoolSequence || null
})

// 动态目标池提示信息
const targetPoolHint = computed(() => {
  if (props.existingPools.length <= 1) {
    return t('ippools.selectTargetPoolHint')
  }
  
  // 检查现有池是否已经连续
  const sortedPools = [...props.existingPools].sort((a, b) => {
    const aStart = ipToNumber(a.ip_range.start)
    const bStart = ipToNumber(b.ip_range.start)
    return aStart - bStart
  })
  
  let hasContinuousRegion = false
  if (sortedPools.length >= 2) {
    for (let i = 1; i < sortedPools.length; i++) {
      const prevPool = sortedPools[i-1]
      const currentPool = sortedPools[i]
      if (prevPool && currentPool) {
        const prevEnd = ipToNumber(prevPool.ip_range.end)
        const currentStart = ipToNumber(currentPool.ip_range.start)
        if (currentStart === prevEnd + 1) {
          hasContinuousRegion = true
          break
        }
      }
    }
  }
  
  if (hasContinuousRegion) {
    return t('ippools.selectTargetPoolAdvancedHint')
  } else {
    return t('ippools.selectTargetPoolHint')
  }
})

// 辅助函数：IP地址转数字
const ipToNumber = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
}

// Methods
const handleCreate = async () => {
  try {
    // 获取目标池序列号
    const targetSequence = getActualTargetPoolSequence.value
    
    // 一次性创建所有IP池
    const createdPools = await autoAllocatePool(
      form.value.poolsCount,
      form.value.continuous,
      targetSequence ? parseInt(targetSequence) : undefined,
      "server_cluster",
      `批量创建${form.value.poolsCount}个IP池`
    )
    
    // 创建成功后关闭对话框并重置表单
    emit('created', createdPools)
    isOpen.value = false
    resetForm()
  } catch (error) {
    debug.error('创建IP池失败:', error)
    // 即使创建失败，也不关闭对话框，让用户看到错误信息
  }
}

const resetForm = () => {
  form.value = {
    poolsCount: 1,
    continuous: false,
    targetPoolSequence: ''
  }
}

// Watch for form changes
watch(() => form.value.continuous, (continuous) => {
  if (!continuous) {
    form.value.targetPoolSequence = ''
  }
})

// 当现有池数量变化时，重置连续性选择
watch(() => props.existingPools.length, (newLength) => {
  // 如果没有现有池，强制设为不连续
  if (newLength === 0 && form.value.continuous) {
    form.value.continuous = false
    form.value.targetPoolSequence = ''
  }
})

watch(isOpen, async (open) => {
  if (open) {
    resetForm()
    // 获取最新的统计数据
    try {
      await fetchStatistics()
      debug.log('Create dialog - Statistics loaded:', statistics.value)
      debug.log('Create dialog - Current pools count:', currentPoolsCount.value)
      debug.log('Create dialog - Remaining pools:', remainingPools.value)
    } catch (error) {
      debug.warn('Failed to fetch statistics in create dialog:', error)
    }
    
    if (remainingPools.value === 1) {
      form.value.poolsCount = 1
    }
  }
})
</script>

<style scoped>
.q-option-group {
  margin-top: 8px;
}

.q-option-group .q-radio {
  margin-right: 16px;
}
</style>
