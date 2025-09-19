<template>
  <PageLayout
    :title="$t('nodes.detail.title')"
    :subtitle="node?.node_name || $t('common.loading')"
    icon="device_hub"
  >
    <template #actions>
      <div class="row q-gutter-sm">
        <!-- 编辑下拉菜单 -->
        <q-btn-dropdown
          color="primary"
          outline
          icon="edit"
          :label="$t('common.edit')"
          :disable="!node || isLoading"
        >
          <q-list>
            <q-item clickable v-close-popup @click="goToEditBasic">
              <q-item-section avatar>
                <q-icon name="info" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('nodes.detail.basicInfo') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="goToEditConfig">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('nodes.detail.nodeConfig') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="goToEditNetwork">
              <q-item-section avatar>
                <q-icon name="router" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('nodes.detail.networkConfig') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="goToEditKeys">
              <q-item-section avatar>
                <q-icon name="vpn_key" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('nodes.detail.keyManagement') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- 删除按钮 -->
        <q-btn
          color="negative"
          outline
          icon="delete"
          :label="$t('common.delete')"
          @click="showDeleteConfirm = true"
          :disable="!node || isLoading"
        />
        
        <!-- 返回按钮 -->
        <q-btn
          color="grey-7"
          outline
          icon="arrow_back"
          :label="$t('common.back')"
          @click="$router.push('/app/nodes')"
        />
      </div>
    </template>

    <div class="row q-gutter-md">
      <!-- 左侧：基本信息和应用信息 -->
      <div class="col-12 col-md-6">
        <!-- 基本信息 - 紧凑布局 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="info" class="q-mr-sm text-primary" size="sm" />
              <div class="text-h6">{{ $t('nodes.detail.basicInfo') }}</div>
            </div>
            <q-skeleton-loader v-if="isLoading" type="QCard" />
            <div v-else-if="node" class="row q-col-gutter-md">
              <!-- 第一行 -->
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.nodeName') }}</div>
                <div class="text-body1 text-weight-medium">{{ node.node_name }}</div>
              </div>
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.nodeId') }}</div>
                <div class="text-body2">
                  <q-chip color="blue-grey-2" text-color="dark" square size="sm">
                    {{ node.node_id }}
                  </q-chip>
                </div>
              </div>
              
              <!-- 第二行 -->
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.status') }}</div>
                <div class="text-body2">
                  <q-chip
                    :color="getStatusColor(node.node_status || node.status)"
                    text-color="white"
                    :icon="getStatusIcon(node.node_status || node.status)"
                    size="sm"
                  >
                    {{ getStatusText(node.node_status || node.status) }}
                  </q-chip>
                </div>
              </div>
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.lastOnline') }}</div>
                <div class="text-body2">{{ node.last_seen ? formatDate(node.last_seen) : $t('common.unknown') }}</div>
              </div>
              
              <!-- 第三行 -->
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.createdAt') }}</div>
                <div class="text-body2">{{ formatDate(node.created_at) }}</div>
              </div>
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.updatedAt') }}</div>
                <div class="text-body2">{{ formatDate(node.updated_at) }}</div>
              </div>
              
              <!-- 第四行 - 节点类型 -->
              <div class="col-12" v-if="getNodeTypeNames(node.node_type).length > 0">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.nodeType') }}</div>
                <div class="text-body2 q-pt-xs">
                  <q-chip
                    v-for="typeName in getNodeTypeNames(node.node_type)"
                    :key="typeName"
                    color="blue"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs"
                  >
                    {{ typeName }}
                  </q-chip>
                </div>
              </div>
              
              <!-- 第五行 - 描述 -->
              <div class="col-12" v-if="node.description || node.node_remarks">
                <div class="text-caption text-grey-6">{{ $t('nodes.fields.description') }}</div>
                <div class="text-body2">{{ node.description || node.node_remarks || $t('common.noDescription') }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 设备信息 - 详细展示 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="computer" class="q-mr-sm text-secondary" size="sm" />
              <div class="text-h6">{{ $t('nodes.detail.deviceInfo') }}</div>
            </div>
            <q-skeleton-loader v-if="isLoading || loadingDeviceInfo" type="QCard" />
            <div v-else-if="deviceInfo || node" class="column q-gutter-md">
              
              <!-- 应用信息 -->
              <div class="q-pa-sm rounded-borders" style="background-color: rgba(33, 150, 243, 0.1);">
                <div class="text-subtitle2 text-primary q-mb-sm">
                  <q-icon name="apps" class="q-mr-xs" />
                  {{ $t('nodes.detail.appInfo') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.vpnType') }}</div>
                    <div class="text-body2">
                      <q-chip 
                        :color="getVpnTypeColor(node?.vpn_type)" 
                        text-color="white"
                        size="sm"
                      >
                        {{ getVpnTypeText(node?.vpn_type) }}
                      </q-chip>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.appVersion') }}</div>
                    <div class="text-body2">{{ node?.node_app_version || $t('common.unknown') }}</div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.listenPort') }}</div>
                    <div class="text-body2">{{ node?.node_port || node?.port || $t('common.notSet') }}</div>
                  </div>
                </div>
              </div>

              <!-- 硬件信息 -->
              <div v-if="deviceInfo" class="q-pa-sm rounded-borders" style="background-color: rgba(76, 175, 80, 0.1);">
                <div class="text-subtitle2 text-green q-mb-sm">
                  <q-icon name="memory" class="q-mr-xs" />
                  {{ $t('nodes.detail.hardwareInfo') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.cpuModel') }}</div>
                    <div class="text-body2">{{ deviceInfo.cpu_model || $t('common.unknown') }}</div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.cpuArch') }}</div>
                    <div class="text-body2">{{ deviceInfo.cpu_arch || $t('common.unknown') }}</div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.cpuCores') }}</div>
                    <div class="text-body2">
                      {{ deviceInfo.cpu_cores || $t('common.unknown') }} {{ $t('common.cores') }}
                      <span v-if="deviceInfo.cpu_threads && deviceInfo.cpu_threads !== deviceInfo.cpu_cores">
                        / {{ deviceInfo.cpu_threads }}{{ $t('nodes.detail.threads') }}
                      </span>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.totalMemory') }}</div>
                    <div class="text-body2">{{ formatMemory(deviceInfo.memory_total_mb) }}</div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.availableMemory') }}</div>
                    <div class="text-body2">{{ formatMemory(deviceInfo.memory_free_mb) }}</div>
                  </div>
                  <div class="col-6 col-sm-4" v-if="deviceInfo.virtualization">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.virtualization') }}</div>
                    <div class="text-body2">{{ deviceInfo.virtualization }}</div>
                  </div>
                </div>
              </div>

              <!-- 系统信息 -->
              <div v-if="deviceInfo" class="q-pa-sm rounded-borders" style="background-color: rgba(255, 152, 0, 0.1);">
                <div class="text-subtitle2 text-orange q-mb-sm">
                  <q-icon name="desktop_windows" class="q-mr-xs" />
                  {{ $t('nodes.detail.systemInfo') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.operatingSystem') }}</div>
                    <div class="text-body2">{{ formatOSInfo(deviceInfo) }}</div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.kernelVersion') }}</div>
                    <div class="text-body2">{{ deviceInfo.kernel_version || $t('common.unknown') }}</div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.systemArch') }}</div>
                    <div class="text-body2">{{ deviceInfo.system_arch || $t('common.unknown') }}</div>
                  </div>
                  <div class="col-6 col-sm-4" v-if="deviceInfo.libc_type">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.cLibrary') }}</div>
                    <div class="text-body2">{{ formatLibcInfo(deviceInfo) }}</div>
                  </div>
                  <div class="col-6 col-sm-4" v-if="deviceInfo.container_type">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.containerType') }}</div>
                    <div class="text-body2">{{ deviceInfo.container_type }}</div>
                  </div>
                  <div class="col-6 col-sm-4" v-if="deviceInfo.collected_at">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.infoCollectedAt') }}</div>
                    <div class="text-body2">{{ formatDate(deviceInfo.collected_at) }}</div>
                  </div>
                </div>
              </div>

              <!-- 网络设备信息 -->
              <div v-if="deviceInfo" class="q-pa-sm rounded-borders" style="background-color: rgba(156, 39, 176, 0.1);">
                <div class="text-subtitle2 text-purple q-mb-sm">
                  <q-icon name="router" class="q-mr-xs" />
                  {{ $t('nodes.detail.networkDevice') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-4" v-if="deviceInfo.nic_count">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.nicCount') }}</div>
                    <div class="text-body2">{{ deviceInfo.nic_count }} {{ $t('nodes.detail.units') }}</div>
                  </div>
                  <div class="col-6 col-sm-4" v-if="deviceInfo.firewall_type">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.firewall') }}</div>
                    <div class="text-body2">
                      {{ deviceInfo.firewall_type }}
                      <q-chip 
                        :color="deviceInfo.firewall_enabled ? 'positive' : 'negative'" 
                        text-color="white" 
                        size="xs"
                        class="q-ml-xs"
                      >
                        {{ deviceInfo.firewall_enabled ? $t('common.enabled') : $t('common.disabled') }}
                      </q-chip>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="text-caption text-grey-6">{{ $t('nodes.detail.ipForwarding') }}</div>
                    <div class="text-body2">
                      <q-chip 
                        :color="deviceInfo.ip_forwarding ? 'positive' : 'negative'" 
                        text-color="white" 
                        size="xs"
                      >
                        {{ deviceInfo.ip_forwarding ? $t('common.enabled') : $t('common.disabled') }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 无设备信息时的占位 -->
              <div v-if="!deviceInfo" class="text-center q-pa-lg text-grey-6">
                <q-icon name="device_unknown" size="md" class="q-mb-sm" />
                <div>{{ $t('nodes.detail.noDeviceInfo') }}</div>
                <div class="text-caption">{{ $t('nodes.detail.deviceInfoNote') }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 网络信息 + 快速操作 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center">
                <q-icon name="network_check" class="q-mr-sm text-green" size="sm" />
                <div class="text-h6">{{ $t('nodes.detail.networkInfo') }}</div>
              </div>
              <q-btn
                color="green"
                outline
                size="sm"
                icon="settings"
                :label="$t('nodes.networkConfig')"
                @click="goToNetworkConfig"
                :disable="!node || isLoading"
              />
            </div>
            <q-skeleton-loader v-if="isLoading || loadingNetworkConfig" type="QCard" />
            <div v-else class="row q-col-gutter-md">
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.virtualInterface') }}</div>
                <div class="text-body2">{{ networkConfig?.ifname || $t('common.notSet') }}</div>
              </div>
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.virtualIpAddress') }}</div>
                <div class="text-body2">
                  {{ getVirtualIPWithSequence() }}
                </div>
              </div>
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.endpointAddress') }}</div>
                <div class="text-body2">{{ getEndpointAddress() }}</div>
              </div>
              <div class="col-6 col-sm-6">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.ipGroupSequence') }}</div>
                <div class="text-body2">{{ networkConfig?.ip_group_sequence_number || node?.ip_group_sequence_number || $t('common.notSet') }}</div>
              </div>
              
              <!-- LAN IPs -->
              <div v-if="networkConfig?.lan_ips && networkConfig.lan_ips.length > 0" class="col-12">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.lanIpAddress') }}</div>
                <div class="text-body2 q-pt-xs">
                  <q-chip 
                    v-for="(lanIp, index) in (networkConfig.lan_ips || []).filter((ip: string) => ip.trim())" 
                    :key="index"
                    color="blue-2" 
                    text-color="dark"
                    size="sm"
                    class="q-mr-xs q-mb-xs"
                  >
                    {{ lanIp }}
                  </q-chip>
                </div>
              </div>
              
              <!-- Public IPs -->
              <div v-if="(networkConfig?.public_ips && networkConfig.public_ips.length > 0) || node?.public_ip" class="col-12">
                <div class="text-caption text-grey-6">{{ $t('nodes.detail.publicIpAddress') }}</div>
                <div class="text-body2 q-pt-xs">
                  <q-chip 
                    v-for="(publicIp, index) in getPublicIPs()" 
                    :key="index"
                    color="green-2" 
                    text-color="dark"
                    size="sm"
                    :icon="isIPv6(publicIp) ? 'language' : 'public'"
                    class="q-mr-xs q-mb-xs"
                  >
                    {{ publicIp }}
                    <q-tooltip v-if="isIPv6(publicIp)">{{ $t('nodes.detail.ipv6Address') }}</q-tooltip>
                  </q-chip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- IP分组信息 -->
        <q-card class="q-mb-md" v-if="indexServices.length > 0">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center">
                <q-icon name="dns" class="q-mr-sm text-secondary" size="sm" />
                <div class="text-h6">{{ $t('nodes.detail.ipGrouping') }}</div>
              </div>
              <q-btn
                color="secondary"
                outline
                size="sm"
                icon="settings"
                :label="$t('nodes.fields.ipManagement')"
                @click="goToIPManagement"
                :disable="!node || isLoading"
              />
            </div>
            <q-skeleton-loader v-if="loadingIndexServices" type="QCard" />
            <div v-else class="q-gutter-sm">
              <div 
                v-for="(service, index) in indexServices" 
                :key="index"
                class="row items-center q-py-xs"
              >
                <q-icon 
                  :name="service.is_active ? 'check_circle' : 'radio_button_unchecked'" 
                  :color="service.is_active ? 'positive' : 'grey'" 
                  size="sm" 
                  class="q-mr-sm" 
                />
                <div class="col-grow">
                  <div class="text-body2 text-weight-medium">{{ service.service_name }}</div>
                  <div class="text-caption text-grey-6">{{ service.endpoint }}</div>
                </div>
                <div class="text-right">
                  <q-chip 
                    v-if="service.is_default" 
                    color="orange" 
                    text-color="white" 
                    size="xs"
                  >
                    {{ $t('nodes.detail.defaultGroup') }}
                  </q-chip>
                  <q-chip 
                    :color="service.is_active ? 'positive' : 'grey'" 
                    text-color="white" 
                    size="xs"
                    class="q-ml-xs"
                  >
                    {{ service.is_active ? $t('common.active') : $t('common.inactive') }}
                  </q-chip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 统计信息占位 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="analytics" class="q-mr-sm text-purple" size="sm" />
              <div class="text-h6">{{ $t('nodes.detail.statistics') }}</div>
            </div>
            <div class="text-center q-pa-lg text-grey-6">
              <q-icon name="construction" size="md" class="q-mb-sm" />
              <div>{{ $t('nodes.detail.statisticsInDevelopment') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧操作面板 -->
      <div class="col-12 col-lg-4">
        <!-- 快速操作 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="flash_on" class="q-mr-sm text-orange" size="sm" />
              <div class="text-h6">{{ $t('nodes.detail.quickActions') }}</div>
            </div>
            <div class="q-gutter-sm">
              <q-btn
                color="primary"
                outline
                block
                icon="refresh"
                :label="$t('nodes.refreshData')"
                @click="refreshData"
                :loading="isRefreshing"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('nodes.deleteConfirm', { name: node?.node_name }) }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="deleteNode"
            :loading="isDeleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import debug from "src/utils/debug"
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useNode, useNotify } from '../../composables'
import { NodeStatus, VpnType, NODE_STATUS, NODE_TYPE, NODE_TYPE_NAMES, type NodeIndexService, type NodeDeviceInfo } from '../../types/node'
import { nodeService } from '../../services/node/nodeService'
import type { NodeNetworkConfig } from '../../types/node'
import PageLayout from '../../components/layout/PageLayout.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 使用组合式函数
const { node, loading: isLoading, loadNode, deleteNode: removeNode } = useNode()

// 新增状态
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const isRefreshing = ref(false)
const indexServices = ref<NodeIndexService[]>([])
const loadingIndexServices = ref(false)
const networkConfig = ref<NodeNetworkConfig | null>(null)
const loadingNetworkConfig = ref(false)
const routeCount = ref(0)
const loadingRoutes = ref(false)
const deviceInfo = ref<NodeDeviceInfo | null>(null)
const loadingDeviceInfo = ref(false)

// 状态相关工具函数
const getStatusColor = (status?: NodeStatus | string | number) => {
  // 处理数字状态码
  if (typeof status === 'number') {
    switch (status) {
      case NODE_STATUS.UNCONFIGURED: return 'warning'
      case NODE_STATUS.DISABLED: return 'grey'
      case NODE_STATUS.ENABLED: return 'orange'
      case NODE_STATUS.ONLINE: return 'positive'
      case NODE_STATUS.MAINTENANCE: return 'info'
      default: return 'grey'
    }
  }
  
  // 处理字符串状态
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'negative'
    case 'pending': return 'warning'
    case 'maintenance': return 'info'
    default: return 'grey'
  }
}

const getStatusIcon = (status?: NodeStatus | string | number) => {
  // 处理数字状态码
  if (typeof status === 'number') {
    switch (status) {
      case NODE_STATUS.UNCONFIGURED: return 'settings'
      case NODE_STATUS.DISABLED: return 'cancel'
      case NODE_STATUS.ENABLED: return 'check_circle_outline'
      case NODE_STATUS.ONLINE: return 'check_circle'
      case NODE_STATUS.MAINTENANCE: return 'build'
      default: return 'help'
    }
  }
  
  // 处理字符串状态
  switch (status) {
    case 'active': return 'check_circle'
    case 'inactive': return 'cancel'
    case 'pending': return 'schedule'
    case 'maintenance': return 'build'
    default: return 'help'
  }
}

const getStatusText = (status?: NodeStatus | string | number) => {
  // 处理数字状态码
  if (typeof status === 'number') {
    switch (status) {
      case NODE_STATUS.UNCONFIGURED: return t('nodes.status.unconfigured')
      case NODE_STATUS.DISABLED: return t('nodes.status.disabled')
      case NODE_STATUS.ENABLED: return t('nodes.status.enabled')
      case NODE_STATUS.ONLINE: return t('nodes.status.online')
      case NODE_STATUS.MAINTENANCE: return t('nodes.status.maintenance')
      default: return t('common.unknown')
    }
  }
  
  // 处理字符串状态
  switch (status) {
    case 'active': return t('nodes.status.active')
    case 'inactive': return t('nodes.status.inactive')
    case 'pending': return t('nodes.status.pending')
    case 'maintenance': return t('nodes.status.maintenance')
    default: return t('common.unknown')
  }
}

// VPN类型相关工具函数
const getVpnTypeColor = (vpnType?: VpnType | string) => {
  switch (vpnType) {
    case 'gnb': return 'purple'
    case 'wireguard': return 'blue'
    case 'openvpn': return 'green'
    default: return 'grey'
  }
}

const getVpnTypeText = (vpnType?: VpnType | string) => {
  switch (vpnType) {
    case 'gnb': return 'GNB'
    case 'wireguard': return 'WireGuard'
    case 'openvpn': return 'OpenVPN'
    default: return t('common.unknown')
  }
}

// 节点类型相关工具函数
const getNodeTypeNames = (nodeType?: number | string | string[]): string[] => {
  if (!nodeType) return []
  
  // 如果是字符串数组，直接返回
  if (Array.isArray(nodeType)) {
    return nodeType
  }
  
  // 如果是字符串，返回单个元素数组
  if (typeof nodeType === 'string') {
    return [nodeType]
  }
  
  // 如果是数字，解析位掩码
  if (typeof nodeType === 'number') {
    const typeNames: string[] = []
    Object.entries(NODE_TYPE).forEach(([key, value]) => {
      if (nodeType & value) {
        typeNames.push(NODE_TYPE_NAMES[value as keyof typeof NODE_TYPE_NAMES])
      }
    })
    return typeNames
  }
  
  return []
}

// 网络相关工具函数
const getPublicIPs = () => {
  const ips: string[] = []
  if (networkConfig.value?.public_ips?.length) {
    ips.push(...networkConfig.value.public_ips.filter(ip => ip.trim()))
  }
  if (node.value?.public_ip && !ips.includes(node.value.public_ip)) {
    ips.push(node.value.public_ip)
  }
  return ips
}

const isIPv6 = (ip: string) => {
  return ip.includes(':')
}

// 格式化工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatUptime = (seconds?: number) => {
  if (!seconds) return `0 ${t('common.seconds')}`
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}${t('common.days')} ${hours}${t('common.hours')}`
  } else if (hours > 0) {
    return `${hours}${t('common.hours')} ${minutes}${t('common.minutes')}`
  } else {
    return `${minutes}${t('common.minutes')}`
  }
}

// 设备信息格式化函数
const formatMemory = (mb?: number) => {
  if (!mb) return t('common.unknown')
  
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`
  } else {
    return `${mb} MB`
  }
}

const formatOSInfo = (deviceInfo: NodeDeviceInfo) => {
  const parts: string[] = []
  
  if (deviceInfo.os_name) {
    parts.push(deviceInfo.os_name)
  }
  
  if (deviceInfo.os_version) {
    parts.push(deviceInfo.os_version)
  }
  
  return parts.length > 0 ? parts.join(' ') : t('common.unknown')
}

const formatLibcInfo = (deviceInfo: NodeDeviceInfo) => {
  const parts: string[] = []
  
  if (deviceInfo.libc_type) {
    parts.push(deviceInfo.libc_type)
  }
  
  if (deviceInfo.libc_version) {
    parts.push(deviceInfo.libc_version)
  }
  
  return parts.length > 0 ? parts.join(' ') : t('common.unknown')
}

// 数据加载函数
const loadIndexServices = async () => {
  if (!nodeId.value) return
  
  try {
    loadingIndexServices.value = true
    const response = await nodeService.getNodeIndexServices(nodeId.value)
    indexServices.value = response.data?.index_services || []
  } catch (error) {
    debug.error('加载索引服务器失败:', error)
    indexServices.value = []
  } finally {
    loadingIndexServices.value = false
  }
}

const loadNetworkConfig = async () => {
  if (!nodeId.value) return
  
  try {
    loadingNetworkConfig.value = true
    const response = await nodeService.getNodeNetworkConfig(nodeId.value)
    networkConfig.value = response.data
  } catch (error) {
    debug.error('加载网络配置失败:', error)
    networkConfig.value = null
  } finally {
    loadingNetworkConfig.value = false
  }
}

const loadDeviceInfo = async () => {
  if (!nodeId.value) return
  
  try {
    loadingDeviceInfo.value = true
    const response = await nodeService.getNodeDeviceInfo(nodeId.value)
    if (response.success && response.data.exists) {
      deviceInfo.value = response.data.device_info
    } else {
      deviceInfo.value = null
    }
  } catch (error) {
    debug.error('加载设备信息失败:', error)
    deviceInfo.value = null
  } finally {
    loadingDeviceInfo.value = false
  }
}

const loadRouteCount = async () => {
  if (!nodeId.value) return
  
  try {
    loadingRoutes.value = true
    // TODO: 这里需要实际的路由数量API
    // const response = await routeService.getNodeRoutes(nodeId.value)
    // routeCount.value = response.data?.length || 0
    routeCount.value = 0 // 临时设置为0
  } catch (error) {
    debug.error('加载路由数量失败:', error)
    routeCount.value = 0
  } finally {
    loadingRoutes.value = false
  }
}

// 操作函数
const goToEdit = () => {
  router.push(`/app/nodes/${nodeId.value}/edit`)
}

// 新增的编辑操作方法
const goToEditBasic = () => {
  router.push(`/app/nodes/${nodeId.value}/edit/basic`)
}

const goToEditConfig = () => {
  router.push(`/app/nodes/${nodeId.value}/edit/config`)
}

const goToEditNetwork = () => {
  router.push(`/app/nodes/${nodeId.value}/edit/network`)
}

const goToEditKeys = () => {
  router.push(`/app/nodes/${nodeId.value}/edit/keys`)
}

// 网络信息显示方法
const getVirtualIPWithSequence = () => {
  const virtualIP = networkConfig.value?.node_ip || node.value?.node_ip || node.value?.ip_address
  const sequence = networkConfig.value?.ip_group_sequence_number || node.value?.ip_group_sequence_number
  
  if (!virtualIP) return t('common.notAllocated')
  if (!sequence) return virtualIP
  
  return `${virtualIP}@${sequence}`
}

const getEndpointAddress = () => {
  // 如果有端点地址，直接返回
  if (node.value?.endpoint) {
    return node.value.endpoint
  }
  
  // 如果端点地址为空，显示公网地址
  const publicIPs = getPublicIPs()
  if (publicIPs.length > 0) {
    return publicIPs[0] // 取第一个公网IP
  }
  
  return t('common.notSet')
}

// 新增的快速操作方法
const goToNetworkConfig = () => {
  router.push(`/app/nodes/${nodeId.value}/network`)
}

const goToIPManagement = () => {
  router.push(`/app/nodes/${nodeId.value}/ips`)
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      loadNode(nodeId.value),
      loadIndexServices(),
      loadNetworkConfig(),
      loadDeviceInfo(),
      loadRouteCount()
    ])
    notifySuccess(t('nodes.dataRefreshed'))
  } catch (error) {
    debug.error('刷新数据失败:', error)
    notifyError(t('nodes.refreshFailed'))
  } finally {
    isRefreshing.value = false
  }
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const deleteNode = async () => {
  if (!node.value) return
  
  try {
    isDeleting.value = true
    const success = await removeNode()
    if (success) {
      notifySuccess(t('nodes.deleteSuccess'))
      router.push('/app/nodes')
    }
  } catch (error) {
    debug.error('删除节点失败:', error)
    notifyError(t('node.detail.deleteNodeFailed'))
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  if (nodeId.value) {
    await Promise.all([
      loadNode(nodeId.value),
      loadIndexServices(),
      loadNetworkConfig(),
      loadDeviceInfo(),
      loadRouteCount()
    ])
  }
})
</script>

<style scoped>
.q-page {
  min-height: calc(100vh - 150px);
}

.q-field {
  margin-bottom: 16px;
}
</style>
