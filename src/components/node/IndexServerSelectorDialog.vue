<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">选择索引服务器</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-grey-6 q-mb-md">
          从可用的索引服务器中选择一个或多个服务器
        </div>

        <!-- 搜索框 -->
        <q-input
          v-model="searchText"
          placeholder="搜索服务器名称或地址..."
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
          <div class="q-mt-sm text-grey-6">正在加载索引服务器...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredServices.length === 0" class="text-center q-py-md">
          <q-icon name="info" size="2em" color="grey-5" />
          <div class="q-mt-sm text-grey-6">
            {{ indexServices.length === 0 ? '暂无可用索引服务器' : '没有找到匹配的服务器' }}
          </div>
          <div class="q-mt-sm text-grey-6 text-caption">
            {{ indexServices.length === 0 ? '请联系管理员配置索引服务器' : '请尝试其他搜索关键词' }}
          </div>
        </div>

        <!-- 服务器列表 -->
        <div v-else style="max-height: 500px; overflow-y: auto;">
          <div
            v-for="service in filteredServices"
            :key="service.service_id"
            class="q-mb-sm"
          >
            <q-card 
              flat 
              bordered
              :class="[
                'cursor-pointer transition-all',
                selectedServices.includes(service.connection_info.endpoint) 
                  ? 'bg-blue-1 border-primary' 
                  : 'bg-grey-1'
              ]"
              @click="toggleService(service)"
            >
              <q-card-section class="q-pa-md">
                <div class="row items-center">
                  <!-- 选择图标 -->
                  <div class="col-auto q-mr-md">
                    <q-icon
                      :name="selectedServices.includes(service.connection_info.endpoint) 
                        ? 'check_circle' 
                        : 'radio_button_unchecked'"
                      :color="selectedServices.includes(service.connection_info.endpoint) 
                        ? 'primary' 
                        : 'grey-5'"
                      size="md"
                    />
                  </div>
                  
                  <!-- 服务器信息 -->
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium">
                      {{ service.service_name }}
                      <q-chip
                        size="sm"
                        :color="service.service_type === 'public' ? 'green' : 'blue'"
                        text-color="white"
                        class="q-ml-sm"
                      >
                        {{ service.service_type === 'public' ? '公共' : '好友共享' }}
                      </q-chip>
                    </div>
                    
                    <div class="text-body2 text-grey-7 q-mt-xs">
                      <q-icon name="language" size="sm" class="q-mr-xs" />
                      {{ service.connection_info.endpoint }}
                    </div>
                    
                    <div class="text-caption text-grey-6 q-mt-xs">
                      <span class="q-mr-md">
                        <q-icon name="person" size="xs" class="q-mr-xs" />
                        {{ service.owner_name }}
                      </span>
                      <span class="q-mr-md">
                        <q-icon name="timeline" size="xs" class="q-mr-xs" />
                        {{ service.connection_info.protocol.toUpperCase() }}
                      </span>
                      <span>
                        <q-icon name="groups" size="xs" class="q-mr-xs" />
                        {{ service.connection_info.current_connections }}/{{ service.connection_info.max_connections }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- 状态指示器 -->
                  <div class="col-auto">
                    <q-badge
                      :color="service.connection_info.current_connections < service.connection_info.max_connections 
                        ? 'green' 
                        : 'orange'"
                      :label="service.connection_info.current_connections < service.connection_info.max_connections 
                        ? '可用' 
                        : '繁忙'"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="meta" class="text-caption text-grey-6 q-mt-md">
          共 {{ meta.total_services }} 个服务器
          (公共: {{ meta.public_services }}，好友共享: {{ meta.friend_shared_services }})
        </div>

        <!-- 已选择的服务器 -->
        <div v-if="selectedServices.length > 0" class="q-mt-md q-pa-sm bg-blue-1 rounded-borders">
          <div class="text-caption text-grey-7">
            <strong>已选择 {{ selectedServices.length }} 个服务器:</strong>
            <div class="q-mt-xs">
              <q-chip
                v-for="endpoint in selectedServices"
                :key="endpoint"
                size="sm"
                color="primary"
                text-color="white"
                removable
                @remove="removeService(endpoint)"
                class="q-mr-xs q-mb-xs"
              >
                {{ endpoint }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" v-close-popup />
        <q-btn
          color="primary"
          label="确认选择"
          :disable="selectedServices.length === 0"
          @click="confirmSelection"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { zoneService } from '../../services/zone/zoneService'
import type { IndexService, IndexServiceMeta } from '../../types'

interface Props {
  modelValue: boolean
  currentServers?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'selected', servers: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentServers: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const indexServices = ref<IndexService[]>([])
const meta = ref<IndexServiceMeta | null>(null)
const selectedServices = ref<string[]>([])
const searchText = ref('')

// 计算属性
const filteredServices = computed(() => {
  if (!searchText.value) return indexServices.value
  
  const searchLower = searchText.value.toLowerCase()
  return indexServices.value.filter(service => 
    service.service_name.toLowerCase().includes(searchLower) ||
    service.service_address.toLowerCase().includes(searchLower) ||
    service.connection_info.endpoint.toLowerCase().includes(searchLower) ||
    service.owner_name.toLowerCase().includes(searchLower)
  )
})

// 方法
const loadIndexServices = async () => {
  loading.value = true
  try {
    const response = await zoneService.getIndexServices()
    const responseData = response.data
    
    indexServices.value = responseData.index_services || []
    meta.value = responseData.meta || null
    
    console.log('加载索引服务器成功:', {
      services: indexServices.value.length,
      meta: meta.value
    })
  } catch (error) {
    console.error('加载索引服务器失败:', error)
    indexServices.value = []
    meta.value = null
  } finally {
    loading.value = false
  }
}

const toggleService = (service: IndexService) => {
  const endpoint = service.connection_info.endpoint
  const index = selectedServices.value.indexOf(endpoint)
  
  if (index > -1) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push(endpoint)
  }
}

const removeService = (endpoint: string) => {
  const index = selectedServices.value.indexOf(endpoint)
  if (index > -1) {
    selectedServices.value.splice(index, 1)
  }
}

const confirmSelection = () => {
  emit('selected', [...selectedServices.value])
  isOpen.value = false
}

// 重置选择
const resetSelection = () => {
  selectedServices.value = [...(props.currentServers || [])]
  searchText.value = ''
}

// 监听对话框打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      resetSelection()
      loadIndexServices()
    }
  }
)

// 监听当前服务器变化
watch(
  () => props.currentServers,
  (newVal) => {
    if (newVal) {
      selectedServices.value = [...newVal]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.border-primary {
  border-color: var(--q-primary) !important;
}

.cursor-pointer:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 600px) {
  .q-card {
    margin: 0;
  }
}
</style>
