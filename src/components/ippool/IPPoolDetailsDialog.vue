<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="min-width: 800px">
      <q-card-section>
        <div class="text-h6">{{ $t('ippools.poolDetailsDialog') }}</div>
      </q-card-section>

      <q-card-section v-if="pool">
        <div class="row q-gutter-md">
          <!-- 基本信息 -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">{{ $t('common.information') }}</div>
                <div class="q-gutter-sm">
                  <div class="row">
                    <div class="col-4 text-grey-6">{{ $t('ippools.poolName') }}:</div>
                    <div class="col-8">{{ pool.name || '-' }}</div>
                  </div>
                  <div class="row">
                    <div class="col-4 text-grey-6">{{ $t('ippools.network') }}:</div>
                    <div class="col-8 text-mono">{{ pool.network || '-' }}</div>
                  </div>
                  <div class="row">
                    <div class="col-4 text-grey-6">{{ $t('ippools.ipRange') }}:</div>
                    <div class="col-8 text-mono">{{ pool.ip_range.start }} - {{ pool.ip_range.end }}</div>
                  </div>
                  <div class="row">
                    <div class="col-4 text-grey-6">{{ $t('ippools.status') }}:</div>
                    <div class="col-8">
                      <q-badge
                        :color="getStatusColor(pool.status)"
                        :label="$t(`ippools.status${pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}`)"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-4 text-grey-6">{{ $t('ippools.createdAt') }}:</div>
                    <div class="col-8">{{ new Date(pool.created_at).toLocaleString() }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- 使用统计 -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">{{ $t('ippools.statisticsView') }}</div>
                <div class="row items-center q-gutter-md">
                  <div class="col-auto">
                    <q-circular-progress
                      :value="getUsagePercent(pool)"
                      size="80px"
                      :thickness="0.1"
                      color="primary"
                      track-color="grey-3"
                      show-value
                      class="text-primary"
                    >
                      {{ getUsagePercent(pool) }}%
                    </q-circular-progress>
                  </div>
                  <div class="col">
                    <div class="q-gutter-sm">
                      <div class="row">
                        <div class="col-6 text-grey-6">{{ $t('ippools.totalCount') }}:</div>
                        <div class="col-6">{{ pool.total_ips || 0 }}</div>
                      </div>
                      <div class="row">
                        <div class="col-6 text-grey-6">{{ $t('ippools.usedCount') }}:</div>
                        <div class="col-6">{{ pool.used_ips || 0 }}</div>
                      </div>
                      <div class="row">
                        <div class="col-6 text-grey-6">{{ $t('ippools.availableCount') }}:</div>
                        <div class="col-6">{{ pool.available_ips || 0 }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="row q-gutter-md q-mt-md">
          <div class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">{{ $t('ippools.actions') }}</div>
                <div class="row q-gutter-md">
                  <q-btn
                    color="primary"
                    icon="add"
                    :label="$t('ippools.allocate')"
                    @click="showAllocateDialog = true"
                  />
                  <q-btn
                    color="secondary"
                    icon="list"
                    :label="$t('ippools.allocations')"
                    @click="loadAllocations"
                  />
                  <q-btn
                    color="info"
                    icon="file_download"
                    :label="$t('ippools.export')"
                    @click="exportPool"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 分配记录 -->
        <div class="row q-mt-md" v-if="showAllocations">
          <div class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">{{ $t('ippools.allocations') }}</div>
                <q-table
                  :rows="allocations"
                  :columns="allocationColumns"
                  :loading="allocationsLoading"
                  row-key="id"
                  dense
                  :no-data-label="$t('ippools.noAllocations')"
                >
                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        v-if="props.row.status === 'active'"
                        icon="delete"
                        size="sm"
                        flat
                        color="negative"
                        @click="confirmReleaseIP(props.row)"
                        :title="$t('ippools.release')"
                      />
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.close')" @click="onClose" />
      </q-card-actions>
    </q-card>

    <!-- 分配IP对话框 -->
    <q-dialog :model-value="showAllocateDialog" @update:model-value="showAllocateDialog = $event" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('ippools.allocateIPDialog') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onAllocateSubmit" class="q-gutter-md">
            <q-select
              v-model="allocateForm.node_id"
              :options="nodeOptions"
              :label="$t('ippools.nodeLabel')"
              :hint="$t('ippools.nodeHint')"
              :loading="nodesLoading"
              outlined
              emit-value
              map-options
              clearable
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showAllocateDialog = false" />
          <q-btn
            color="primary"
            :label="$t('ippools.allocate')"
            :loading="allocateLoading"
            @click="onAllocateSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useIPPools } from '../../composables/useIPPools'
import { api } from '../../services/api'
import type { IPPool, IPAllocation } from '../../types/ippool'

interface Node {
  id: string
  node_name: string
  node_id: string
}

interface Props {
  modelValue: boolean
  pool?: IPPool | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'allocate'): void
  (e: 'release'): void
}

const props = withDefaults(defineProps<Props>(), {
  pool: null
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const $q = useQuasar()
const { fetchAllocations, allocateIP, releaseIP } = useIPPools()

const allocations = ref<IPAllocation[]>([])
const allocationsLoading = ref(false)
const showAllocations = ref(false)
const showAllocateDialog = ref(false)
const allocateLoading = ref(false)
const nodesLoading = ref(false)

const allocateForm = ref({
  node_id: ''
})

const nodeOptions = ref<Array<{ label: string; value: string }>>([])

// 获取Node列表
const fetchNodes = async () => {
  nodesLoading.value = true
  try {
    const response = await api.get('/nodes')
    if (response.data.success) {
      const nodes: Node[] = response.data.data.nodes || []
      nodeOptions.value = nodes.map(node => ({
        label: node.node_name,
        value: node.node_id
      }))
    }
  } catch (error) {
    debug.error('Failed to fetch nodes:', error)
  } finally {
    nodesLoading.value = false
  }
}

const allocationColumns = computed(() => [
  {
    name: 'ip_address',
    required: true,
    label: t('ippools.ipAddress'),
    align: 'left' as const,
    field: 'ip_address',
    sortable: true
  },
  {
    name: 'node_name',
    required: true,
    label: t('ippools.allocatedTo'),
    align: 'left' as const,
    field: 'node_name',
    sortable: true
  },
  {
    name: 'allocated_at',
    required: true,
    label: t('ippools.allocatedAt'),
    align: 'center' as const,
    field: 'allocated_at',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleString()
  },
  {
    name: 'actions',
    required: true,
    label: t('ippools.actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false
  }
])

const getUsagePercent = (pool: IPPool): number => {
  if (!pool.total_ips || pool.total_ips === 0) return 0
  return Math.round(((pool.used_ips || 0) / pool.total_ips) * 100)
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available': return 'positive'
    case 'allocated': return 'warning'
    default: return 'grey'
  }
}

const loadAllocations = async () => {
  if (!props.pool) return
  
  allocationsLoading.value = true
  try {
    const response = await fetchAllocations(props.pool.id)
    allocations.value = response.allocations || []
    showAllocations.value = true
  } catch (error) {
    debug.error('Failed to load allocations:', error)
  } finally {
    allocationsLoading.value = false
  }
}

const onAllocateSubmit = async () => {
  if (!props.pool) return
  
  allocateLoading.value = true
  try {
    await allocateIP(props.pool.id, allocateForm.value.node_id)
    showAllocateDialog.value = false
    allocateForm.value.node_id = ''
    emit('allocate')
    if (showAllocations.value) {
      loadAllocations()
    }
  } catch (error) {
    debug.error('Failed to allocate IP:', error)
  } finally {
    allocateLoading.value = false
  }
}

const confirmReleaseIP = (allocation: IPAllocation) => {
  $q.dialog({
    title: t('ippools.releaseIPDialog'),
    message: t('ippools.releaseIPConfirm', { ip: allocation.ip_address }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    if (!props.pool) return
    
    try {
      await releaseIP(props.pool.id, allocation.ip_address)
      emit('release')
      loadAllocations()
    } catch (error) {
      debug.error('Failed to release IP:', error)
    }
  })
}

const exportPool = () => {
  // 实现导出功能
  debug.log('Export pool:', props.pool)
}

const onClose = () => {
  emit('update:modelValue', false)
  showAllocations.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchNodes()
  } else {
    showAllocations.value = false
    allocations.value = []
  }
})
</script>

<style lang="scss" scoped>
.text-mono {
  font-family: 'Courier New', monospace;
}
</style>
