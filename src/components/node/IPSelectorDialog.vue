<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">选择节点虚拟IP</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-grey-6 q-mb-md">
          从你的IP池中选择一个可用的IP地址作为节点的虚拟IP
        </div>

        <!-- 搜索框 -->
        <q-input
          v-model="searchText"
          :placeholder="$t('node.ip.searchPlaceholder')"
          outlined
          dense
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center q-py-md">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm text-grey-6">{{ $t('node.ip.loadingMessage') }}</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredPools.length === 0" class="text-center q-py-md">
          <q-icon name="info" size="2em" color="grey-5" />
          <div class="q-mt-sm text-grey-6">
            {{ ipPools.length === 0 ? $t('node.ip.noIPAddress') : $t('node.ip.noMatchingIP') }}
          </div>
          <div class="q-mt-sm text-grey-6 text-caption">
            {{ ipPools.length === 0 ? $t('node.ip.createIPPoolHint') : $t('node.ip.tryOtherKeywords') }}
          </div>
        </div>

        <!-- IP组列表 -->
        <div v-else style="max-height: 500px; overflow-y: auto;">
          <div
            v-for="pool in filteredPools"
            :key="pool.seq"
            class="q-mb-lg"
          >
            <!-- 池标题 -->
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ pool.name }}
              <q-chip
                size="sm"
                color="grey-4"
                text-color="grey-8"
                class="q-ml-sm"
              >
                {{ pool.available }}个可用
              </q-chip>
              <q-chip
                size="sm"
                color="blue-2"
                text-color="blue-8"
                class="q-ml-xs"
              >
                容量: {{ pool.capacity }}
              </q-chip>
            </div>

            <!-- IP按钮网格 -->
            <div class="ip-grid">
              <q-btn
                v-for="ip in pool.availableIPs"
                :key="ip.addr"
                :color="selectedIP === ip.addr ? 'primary' : 'grey-4'"
                :text-color="selectedIP === ip.addr ? 'white' : 'grey-8'"
                :outline="selectedIP !== ip.addr"
                @click="selectIP(ip, pool.seq)"
                class="ip-button"
                no-caps
              >
                {{ ip.addr }}
                <q-tooltip>
                  IP: {{ ip.addr }}<br>
                  索引: {{ ip.idx }}<br>
                  组序号: {{ pool.seq }}<br>
                  {{ $t('node.ip.status') }}: {{ ip.consumed ? $t('node.ip.used') : $t('node.ip.available') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="totalAvailableIPs > 0" class="text-caption text-grey-6 q-mt-md">
          共 {{ totalPools }} 个IP池，{{ totalAvailableIPs }} 个可用IP地址
          <span v-if="statistics" class="q-ml-sm">
            (总容量: {{ statistics.total_capacity }}，已使用: {{ statistics.total_consumed }})
          </span>
        </div>

        <!-- 选中的IP信息 -->
        <div v-if="selectedIPInfo" class="q-mt-md q-pa-sm bg-blue-1 rounded-borders">
          <div class="text-caption text-grey-7">
            <strong>已选择:</strong> {{ selectedIPInfo.addr }}
            (组序号: {{ selectedIPGroupSequenceNumber }})
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" v-close-popup />
        <q-btn
          color="primary"
          :label="$t('common.confirm')"
          :disable="!selectedIP"
          @click="confirmSelection"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import debug from 'src/utils/debug'
import { nodeService } from '../../services/node/nodeService'
import type { AvailableIP, IPPool, IPStatistics } from '../../types/node'

interface Props {
  modelValue: boolean
  currentIP?: string
  currentIPGroupSequenceNumber?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'selected', ip: string, ipGroupSequenceNumber: number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentIP: '',
  currentIPGroupSequenceNumber: 0
})

const emit = defineEmits<Emits>()

// 响应式数据
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const ipPools = ref<IPPool[]>([])
const statistics = ref<IPStatistics | null>(null)
const selectedIP = ref<string>('')
const selectedIPGroupSequenceNumber = ref<number>(0)
const searchText = ref('')

// 扩展的IP池接口（包含处理后的可用IP）
interface ExtendedIPPool extends IPPool {
  availableIPs: AvailableIP[]
}

// 计算属性
const totalAvailableIPs = computed(() => {
  return ipPools.value.reduce((total, pool) => total + pool.available, 0)
})

const totalPools = computed(() => {
  return ipPools.value.length
})

const filteredPools = computed((): ExtendedIPPool[] => {
  const pools = ipPools.value.map(pool => ({
    ...pool,
    availableIPs: pool.ips.filter(ip => !ip.consumed)
  }))

  if (!searchText.value) return pools
  
  const searchLower = searchText.value.toLowerCase()
  return pools.map(pool => ({
    ...pool,
    availableIPs: pool.availableIPs.filter(ip => 
      ip.addr.toLowerCase().includes(searchLower) ||
      pool.name.toLowerCase().includes(searchLower)
    )
  })).filter(pool => pool.availableIPs.length > 0)
})

const selectedIPInfo = computed(() => {
  if (!selectedIP.value) return null
  
  for (const pool of ipPools.value) {
    const ip = pool.ips.find(ip => ip.addr === selectedIP.value)
    if (ip) {
      return {
        ...ip,
        addr: ip.addr,
        idx: ip.idx
      }
    }
  }
  return null
})

// 方法
const loadAvailableIPs = async () => {
  loading.value = true
  try {
    const response = await nodeService.getAvailableIPs()
    const responseData = response.data
    
    // 处理新的API格式
    ipPools.value = responseData.pools || []
    statistics.value = responseData.statistics || null
    
    debug.log('加载可用IP成功:', {
      pools: ipPools.value.length,
      statistics: statistics.value
    })
  } catch (error) {
    debug.error('加载可用IP失败:', error)
    ipPools.value = []
    statistics.value = null
  } finally {
    loading.value = false
  }
}

const selectIP = (ip: AvailableIP, poolSeq: number) => {
  selectedIP.value = ip.addr
  selectedIPGroupSequenceNumber.value = poolSeq
}

const confirmSelection = () => {
  if (selectedIP.value && selectedIPGroupSequenceNumber.value) {
    emit('selected', selectedIP.value, selectedIPGroupSequenceNumber.value)
    isOpen.value = false
  }
}

// 重置选择
const resetSelection = () => {
  selectedIP.value = props.currentIP || ''
  selectedIPGroupSequenceNumber.value = props.currentIPGroupSequenceNumber || 0
  searchText.value = ''
}

// 监听对话框打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      resetSelection()
      loadAvailableIPs()
    }
  }
)

// 监听当前IP变化
watch(
  () => props.currentIP,
  (newVal) => {
    if (newVal) {
      selectedIP.value = newVal
    }
  },
  { immediate: true }
)

// 监听当前IP组序号变化
watch(
  () => props.currentIPGroupSequenceNumber,
  (newVal) => {
    if (newVal) {
      selectedIPGroupSequenceNumber.value = newVal
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.ip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.ip-button {
  min-height: 36px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.ip-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 600px) {
  .ip-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .ip-button {
    font-size: 11px;
    min-height: 32px;
  }
}

@media (min-width: 900px) {
  .ip-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
</style>
