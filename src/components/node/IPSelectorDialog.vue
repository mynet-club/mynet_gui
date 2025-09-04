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
          placeholder="搜索IP地址或IP池组名称..."
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
          <div class="q-mt-sm text-grey-6">正在加载可用IP...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredGroups.length === 0" class="text-center q-py-md">
          <q-icon name="info" size="2em" color="grey-5" />
          <div class="q-mt-sm text-grey-6">
            {{ ipGroups.length === 0 ? '暂无可用IP地址' : '没有找到匹配的IP地址' }}
          </div>
          <div class="q-mt-sm text-grey-6 text-caption">
            {{ ipGroups.length === 0 ? '请先创建IP池或分配IP资源' : '请尝试其他搜索关键词' }}
          </div>
        </div>

        <!-- IP组列表 -->
        <div v-else style="max-height: 500px; overflow-y: auto;">
          <div
            v-for="group in filteredGroups"
            :key="group.group_id"
            class="q-mb-lg"
          >
            <!-- 组标题 -->
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ group.pool_name }}
              <q-chip
                size="sm"
                color="grey-4"
                text-color="grey-8"
                class="q-ml-sm"
              >
                {{ group.available_ips.length }}个IP
              </q-chip>
            </div>

            <!-- IP按钮网格 -->
            <div class="ip-grid">
              <q-btn
                v-for="ip in group.available_ips"
                :key="ip.ip_address"
                :color="selectedIP === ip.ip_address ? 'primary' : 'grey-4'"
                :text-color="selectedIP === ip.ip_address ? 'white' : 'grey-8'"
                :outline="selectedIP !== ip.ip_address"
                @click="selectIP(ip)"
                class="ip-button"
                no-caps
              >
                {{ ip.ip_address }}
                <q-tooltip>
                  IP: {{ ip.ip_address }}<br>
                  索引: {{ ip.index }}<br>
                  组序号: {{ ip.ip_group_sequence_number }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="totalAvailableIPs > 0" class="text-caption text-grey-6 q-mt-md">
          共 {{ ipGroups.length }} 个IP池组，{{ totalAvailableIPs }} 个可用IP地址
        </div>

        <!-- 选中的IP信息 -->
        <div v-if="selectedIPInfo" class="q-mt-md q-pa-sm bg-blue-1 rounded-borders">
          <div class="text-caption text-grey-7">
            <strong>已选择:</strong> {{ selectedIPInfo.ip_address }}
            (组序号: {{ selectedIPInfo.ip_group_sequence_number }})
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" v-close-popup />
        <q-btn
          color="primary"
          label="确认选择"
          :disable="!selectedIP"
          @click="confirmSelection"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { nodeService } from '../../services/node/nodeService'
import type { AvailableIP, IPGroup } from '../../types/node'

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
const ipGroups = ref<IPGroup[]>([])
const selectedIP = ref<string>('')
const selectedIPGroupSequenceNumber = ref<number>(0)
const searchText = ref('')

// 计算属性
const totalAvailableIPs = computed(() => {
  return ipGroups.value.reduce((total, group) => total + group.available_ips.length, 0)
})

const filteredGroups = computed(() => {
  if (!searchText.value) return ipGroups.value
  
  const searchLower = searchText.value.toLowerCase()
  return ipGroups.value.map(group => ({
    ...group,
    available_ips: group.available_ips.filter(ip => 
      ip.ip_address.toLowerCase().includes(searchLower) ||
      group.pool_name.toLowerCase().includes(searchLower)
    )
  })).filter(group => group.available_ips.length > 0)
})

const selectedIPInfo = computed(() => {
  if (!selectedIP.value) return null
  
  for (const group of ipGroups.value) {
    const ip = group.available_ips.find(ip => ip.ip_address === selectedIP.value)
    if (ip) return ip
  }
  return null
})

// 方法
const loadAvailableIPs = async () => {
  loading.value = true
  try {
    const response = await nodeService.getAvailableIPs()
    ipGroups.value = response.data.groups || []
  } catch (error) {
    console.error('加载可用IP失败:', error)
    ipGroups.value = []
  } finally {
    loading.value = false
  }
}

const selectIP = (ip: AvailableIP) => {
  selectedIP.value = ip.ip_address
  selectedIPGroupSequenceNumber.value = ip.ip_group_sequence_number
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
