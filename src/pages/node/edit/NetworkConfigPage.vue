<template>
  <div class="network-config-page q-pa-md">
    <div class="text-h6 q-mb-md">{{ $t('nodes.edit.tabs.network') }}</div>
    
    <!-- 加载状态 -->
    <div v-if="loadingNetworkConfig" class="text-center q-py-lg">
      <q-spinner color="primary" size="2em" />
      <div class="q-mt-sm text-grey-6">{{ $t('nodes.edit.network.loadingConfig') }}</div>
    </div>
    
    <q-form v-else @submit.prevent="onSubmit" class="q-gutter-md" ref="formRef">
      <!-- 基础网络配置 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">{{ $t('nodes.edit.network.basicConfig') }}</div>
          
          <!-- 节点虚拟IP -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('nodes.edit.network.nodeVirtualIP') }}</div>
            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="form.node_ip"
                  outlined
                  readonly
                  :placeholder="$t('nodes.edit.network.selectIPFromPool')"
                  :rules="[
                    val => !!val || $t('nodes.edit.network.nodeVirtualIP') + $t('common.required')
                  ]"
                  :disable="loading"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  outline
                  icon="list"
                  @click="showIPSelector = true"
                  :disable="loading"
                  class="q-mt-sm"
                >
                  {{ $t('nodes.edit.network.selectIP') }}
                </q-btn>
              </div>
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ $t('nodes.edit.network.selectIPFromPool') }}
              <span v-if="form.ip_group_sequence_number" class="q-ml-sm">
                ({{ $t('nodes.edit.network.ipGroupSequence') }}: {{ form.ip_group_sequence_number }})
              </span>
            </div>
            
            <!-- 隐藏字段：IP组序号 -->
            <input
              type="hidden"
              :value="form.ip_group_sequence_number"
              name="ip_group_sequence_number"
            />
          </div>

          <!-- 索引服务器 -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('nodes.edit.network.indexServers') }}
              <span class="text-caption text-grey-6">({{ $t('common.optional') }})</span>
            </div>
            <div class="q-gutter-sm">
              <div
                v-for="(server, index) in form.index_servers"
                :key="index"
                class="row q-gutter-sm items-center"
              >
                <div class="col">
                  <q-input
                    v-model="form.index_servers[index]"
                    outlined
                    dense
                    :placeholder="$t('nodes.edit.network.indexServersDescription')"
                    :rules="[validateIPPort]"
                    :disable="loading"
                    @focus="!isProcessingSelection && (showIndexServerSelector = true)"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    icon="remove"
                    color="negative"
                    flat
                    dense
                    round
                    @click="removeIndexServer(index)"
                    :disable="loading"
                  />
                </div>
              </div>
              <q-btn
                color="primary"
                outline
                icon="add"
                :label="$t('nodes.edit.network.addIndexServer')"
                @click="addIndexServer"
                :disable="loading"
                class="q-mt-sm"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ $t('nodes.edit.network.indexServersHint') }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 扩展配置 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">{{ $t('nodes.edit.network.advancedConfig') }}</div>
          
          <!-- 局域网IP -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('nodes.edit.network.lanIPs') }}
              <span class="text-caption text-grey-6">({{ $t('common.optional') }})</span>
            </div>
            <div class="q-gutter-sm">
              <div
                v-for="(lanIP, index) in form.lan_ips"
                :key="index"
                class="row q-gutter-sm items-center"
              >
                <div class="col">
                  <q-input
                    v-model="form.lan_ips[index]"
                    outlined
                    dense
                    :placeholder="$t('nodes.edit.network.lanIPsDescription')"
                    :rules="[validateIPv4Address]"
                    :disable="loading"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    icon="remove"
                    color="negative"
                    flat
                    dense
                    round
                    @click="removeLanIP(index)"
                    :disable="loading"
                  />
                </div>
              </div>
              <q-btn
                color="primary"
                outline
                icon="add"
                :label="$t('nodes.edit.network.addLanIP')"
                @click="addLanIP"
                :disable="loading"
                class="q-mt-sm"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ $t('nodes.edit.network.lanIPsHint') }}
            </div>
          </div>

          <!-- 公网IP -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('nodes.edit.network.publicIPs') }}
              <span class="text-caption text-grey-6">({{ $t('common.optional') }})</span>
            </div>
            <div class="q-gutter-sm">
              <div
                v-for="(publicIP, index) in form.public_ips"
                :key="index"
                class="row q-gutter-sm items-center"
              >
                <div class="col">
                  <q-input
                    v-model="form.public_ips[index]"
                    outlined
                    dense
                    :placeholder="$t('nodes.edit.network.publicIPsDescription')"
                    :rules="[validateIPAddress]"
                    :disable="loading"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    icon="remove"
                    color="negative"
                    flat
                    dense
                    round
                    @click="removePublicIP(index)"
                    :disable="loading"
                  />
                </div>
              </div>
              <q-btn
                color="primary"
                outline
                icon="add"
                :label="$t('nodes.edit.network.addPublicIP')"
                @click="addPublicIP"
                :disable="loading"
                class="q-mt-sm"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ $t('nodes.edit.network.publicIPsHint') }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 操作按钮 -->
      <div class="row q-gutter-sm q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          :loading="saving"
          :disable="!hasChanges || loading || loadingNetworkConfig"
        >
          <q-icon name="save" class="q-mr-sm" />
          {{ $t('nodes.edit.network.saveNetworkConfig') }}
        </q-btn>
        
        <q-btn
          color="grey-7"
          outline
          @click="resetForm"
          :disable="saving || !hasChanges || loading || loadingNetworkConfig"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          {{ $t('common.reset') }}
        </q-btn>
      </div>
    </q-form>

    <!-- IP选择对话框 -->
    <IPSelectorDialog
      v-model="showIPSelector"
      :current-ip="form.node_ip"
      :current-ip-group-sequence-number="form.ip_group_sequence_number"
      @selected="onIPSelected"
    />

    <!-- 索引服务器选择对话框 -->
    <IndexServerSelectorDialog
      v-model="showIndexServerSelector"
      :current-servers="form.index_servers.filter(s => s.trim())"
      @selected="onIndexServersSelected"
      @update:model-value="onIndexDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import debug from "src/utils/debug"
import { computed, watch, ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNode, useNotify } from '../../../composables'
import { nodeService } from '../../../services/node/nodeService'
import type { NodeNetworkConfig, UpdateNodeNetworkConfigRequest } from '../../../types/node'
import IPSelectorDialog from '../../../components/node/IPSelectorDialog.vue'
import IndexServerSelectorDialog from '../../../components/node/IndexServerSelectorDialog.vue'

const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 尝试从父组件注入节点数据
const injectedNodeData = inject<any>('nodeData', null)

// 使用组合式函数 (如果没有注入的数据，则创建新的)
const { node, loading, saving, loadNode, updateNode } = injectedNodeData || useNode()

// 表单数据
const form = ref({
  node_ip: '',
  ip_group_sequence_number: 0,
  index_servers: [''],
  lan_ips: [''],
  public_ips: ['']
})

// 原始数据
const originalData = ref({
  node_ip: '',
  ip_group_sequence_number: 0,
  index_servers: [''],
  lan_ips: [''],
  public_ips: ['']
})

// 选择的索引服务器列表（保留用于其他可能的用途）
const selectedIndexServers = ref<string[]>([])

// 对话框状态
const showIPSelector = ref(false)
const showIndexServerSelector = ref(false)
const isProcessingSelection = ref(false)
const loadingNetworkConfig = ref(false)
const formRef = ref<any>(null)

// 计算属性
const hasChanges = computed(() => {
  // 基础字段比较
  if (form.value.node_ip !== originalData.value.node_ip) return true
  if (form.value.ip_group_sequence_number !== originalData.value.ip_group_sequence_number) return true
  
  // 数组字段比较（过滤空值后比较）
  const currentIndexServers = form.value.index_servers.filter(server => server.trim())
  const originalIndexServers = originalData.value.index_servers.filter(server => server.trim())
  if (JSON.stringify(currentIndexServers) !== JSON.stringify(originalIndexServers)) return true
  
  const currentLanIPs = form.value.lan_ips.filter(ip => ip.trim())
  const originalLanIPs = originalData.value.lan_ips.filter(ip => ip.trim())
  if (JSON.stringify(currentLanIPs) !== JSON.stringify(originalLanIPs)) return true
  
  const currentPublicIPs = form.value.public_ips.filter(ip => ip.trim())
  const originalPublicIPs = originalData.value.public_ips.filter(ip => ip.trim())
  if (JSON.stringify(currentPublicIPs) !== JSON.stringify(originalPublicIPs)) return true
  
  return false
})

// 工具函数
const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

const isValidIPv4Address = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

const isValidIPPort = (ipPort: string): boolean => {
  const ipPortRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{1,5}$/
  if (!ipPortRegex.test(ipPort)) return false
  
  const parts = ipPort.split(':')
  if (parts.length !== 2) return false
  
  const [ip, port] = parts
  if (!ip || !port) return false
  
  const portNum = parseInt(port)
  return isValidIPv4Address(ip) && portNum >= 1 && portNum <= 65535
}

// 验证IP地址格式是否正确
const validateIPAddress = (ip: string): string | boolean => {
  if (!ip || !ip.trim()) return true // 空值允许
  const trimmedIP = ip.trim()
  if (!isValidIPAddress(trimmedIP)) {
    return t('node.network.invalidIPFormat')
  }
  return true
}

// 验证IPv4地址格式是否正确
const validateIPv4Address = (ip: string): string | boolean => {
  if (!ip || !ip.trim()) return true // 空值允许
  const trimmedIP = ip.trim()
  if (!isValidIPv4Address(trimmedIP)) {
    return t('node.network.invalidIPv4Format')
  }
  return true
}

// 验证IP:端口格式是否正确
const validateIPPort = (ipPort: string): string | boolean => {
  if (!ipPort || !ipPort.trim()) return true // 空值允许
  const trimmedIPPort = ipPort.trim()
  if (!isValidIPPort(trimmedIPPort)) {
    return t('node.network.invalidIPPortFormat')
  }
  return true
}

// 方法
const loadNetworkConfig = async () => {
  if (!node.value) return
  
  try {
    loadingNetworkConfig.value = true
    
    // 并行加载网络配置数据和索引服务器数据
    const [networkResponse, indexServicesResponse] = await Promise.all([
      nodeService.getNodeNetworkConfig(String(node.value.node_id)),
      nodeService.getNodeIndexServices(String(node.value.node_id)).catch(() => ({ data: { index_services: [] } }))
    ])
    
    const networkConfig = networkResponse.data || {}
    const nodeIndexServices = indexServicesResponse.data?.index_services || []
    
    // 初始化索引服务器：使用已保存的配置 + 当前节点的索引服务器
    let indexServers: string[] = []
    if (networkConfig.index_servers?.length) {
      // 如果有保存的配置，使用保存的配置
      indexServers = [...networkConfig.index_servers]
    } else if (nodeIndexServices.length) {
      // 如果没有保存的配置但有节点索引服务器，使用节点的endpoint
      indexServers = nodeIndexServices.map(service => service.endpoint)
    }
    // 确保至少有一个空的输入框
    if (indexServers.length === 0 || indexServers.every(s => s.trim())) {
      indexServers.push('')
    }
    
    const data = {
      node_ip: networkConfig.node_ip || node.value.node_ip || '',
      ip_group_sequence_number: networkConfig.ip_group_sequence_number || node.value.ip_group_sequence_number || 0,
      index_servers: indexServers,
      lan_ips: networkConfig.lan_ips?.length ? [...networkConfig.lan_ips] : [''],
      public_ips: networkConfig.public_ips?.length ? [...networkConfig.public_ips] : (node.value.public_ip ? [node.value.public_ip] : [''])
    }
    
    form.value = JSON.parse(JSON.stringify(data))
    originalData.value = JSON.parse(JSON.stringify(data))
    
    debug.log('网络配置数据加载成功:', data)
    debug.log('节点索引服务器:', nodeIndexServices)
  } catch (error: any) {
    debug.error('加载网络配置数据失败:', error)
    
    // 如果是404错误，说明网络配置不存在，使用默认值
    if (error?.response?.status === 404) {
      debug.log('网络配置不存在，使用默认值初始化')
      await initializeForm()
    } else {
      // 其他错误，显示错误信息但仍使用默认值
      notifyError(t('node.network.loadConfigFailed'))
      await initializeForm()
    }
  } finally {
    loadingNetworkConfig.value = false
  }
}

const initializeForm = async () => {
  if (node.value) {
    const networkConfig = node.value.network_config || {}
    
    // 尝试加载节点的索引服务器作为初始值
    let indexServers: string[] = ['']
    try {
      const indexServicesResponse = await nodeService.getNodeIndexServices(String(node.value.node_id))
      const nodeIndexServices = indexServicesResponse.data?.index_services || []
      if (nodeIndexServices.length) {
        indexServers = nodeIndexServices.map(service => service.endpoint)
        // 确保至少有一个空的输入框
        if (indexServers.every(s => s.trim())) {
          indexServers.push('')
        }
      }
    } catch (error) {
      debug.log('获取节点索引服务器失败，使用默认值:', error)
    }
    
    const data = {
      node_ip: networkConfig.node_ip || node.value.node_ip || '',
      ip_group_sequence_number: networkConfig.ip_group_sequence_number || node.value.ip_group_sequence_number || 0,
      index_servers: networkConfig.index_servers?.length ? [...networkConfig.index_servers] : indexServers,
      lan_ips: networkConfig.lan_ips?.length ? [...networkConfig.lan_ips] : [''],
      public_ips: networkConfig.public_ips?.length ? [...networkConfig.public_ips] : (node.value.public_ip ? [node.value.public_ip] : [''])
    }
    
    form.value = JSON.parse(JSON.stringify(data))
    originalData.value = JSON.parse(JSON.stringify(data))
  }
}

const resetForm = () => {
  form.value = JSON.parse(JSON.stringify(originalData.value))
  // 重置选择的索引服务器列表
  selectedIndexServers.value = []
  notifySuccess(t('common.formReset'))
}

// 索引服务器管理
const addIndexServer = () => {
  form.value.index_servers.push('')
}

const removeIndexServer = (index: number) => {
  if (form.value.index_servers.length > 1) {
    form.value.index_servers.splice(index, 1)
  } else {
    // 如果只剩一个，清空内容而不是删除
    form.value.index_servers[0] = ''
  }
}

// 局域网IP管理
const addLanIP = () => {
  form.value.lan_ips.push('')
}

const removeLanIP = (index: number) => {
  if (form.value.lan_ips.length > 1) {
    form.value.lan_ips.splice(index, 1)
  } else {
    // 如果只剩一个，清空内容而不是删除
    form.value.lan_ips[0] = ''
  }
}

// 公网IP管理
const addPublicIP = () => {
  form.value.public_ips.push('')
}

const removePublicIP = (index: number) => {
  if (form.value.public_ips.length > 1) {
    form.value.public_ips.splice(index, 1)
  } else {
    // 如果只剩一个，清空内容而不是删除
    form.value.public_ips[0] = ''
  }
}

// IP选择处理
const onIPSelected = (ip: string, ipGroupSequenceNumber: number) => {
  form.value.node_ip = ip
  form.value.ip_group_sequence_number = ipGroupSequenceNumber
  notifySuccess(t('node.network.ipSelected', { ip, ipGroupSequenceNumber }))
}

// 索引服务器选择处理
const onIndexServersSelected = (servers: string[]) => {
  // 设置处理状态，防止focus事件触发对话框
  isProcessingSelection.value = true
  
  // 去重：过滤掉已存在的服务器
  const existingServers = form.value.index_servers.filter(s => s.trim())
  const newServers = servers.filter(server => !existingServers.includes(server))
  
  if (newServers.length === 0) {
    notifyError(t('node.indexServer.serverAlreadyExists'))
    setTimeout(() => {
      isProcessingSelection.value = false
    }, 300)
    return
  }
  
  // 找到第一个空的输入框，如果没有则添加新的
  let targetIndex = form.value.index_servers.findIndex(server => !server.trim())
  
  // 如果没有空的输入框，从当前位置开始添加
  if (targetIndex === -1) {
    targetIndex = form.value.index_servers.length
  }
  
  // 确保有足够的输入框
  while (form.value.index_servers.length < targetIndex + newServers.length) {
    form.value.index_servers.push('')
  }
  
  // 将选择的服务器填入输入框
  newServers.forEach((server, index) => {
    form.value.index_servers[targetIndex + index] = server
  })
  
  // 确保最后有一个空的输入框
  if (form.value.index_servers.every(s => s.trim())) {
    form.value.index_servers.push('')
  }
  
  notifySuccess(t('node.indexServer.serversAdded', { count: newServers.length }))
  
  // 延迟重置处理状态，避免立即触发focus
  setTimeout(() => {
    isProcessingSelection.value = false
  }, 300)
}

// 处理对话框关闭事件（包括取消操作）
const onIndexDialogClose = (value: boolean) => {
  if (!value) {
    // 对话框被关闭（取消或点击外部），设置处理状态防止立即重新打开
    isProcessingSelection.value = true
    setTimeout(() => {
      isProcessingSelection.value = false
    }, 300)
  }
}

const onSubmit = async () => {
  debug.log('onSubmit 函数被调用')
  
  try {
    // 检查是否有变化
    if (!hasChanges.value) {
      notifySuccess(t('nodes.edit.network.save.noChanges'))
      return
    }
    
    // 验证表单
    if (formRef.value) {
      const isValid = await formRef.value.validate()
      if (!isValid) {
        notifyError(t('nodes.edit.network.validation.formErrors'))
        return
      }
    }
    
    // 验证必填字段
    if (!form.value.node_ip?.trim()) {
      notifyError(t('nodes.edit.network.validation.virtualIpRequired'))
      return
    }
    
    // 构建更新数据，只包含有变化的字段
    const updateData: Partial<UpdateNodeNetworkConfigRequest> = {}
    
    // 检查基础字段的变化
    if (form.value.node_ip !== originalData.value.node_ip) {
      updateData.node_ip = form.value.node_ip.trim()
    }
    
    if (form.value.ip_group_sequence_number !== originalData.value.ip_group_sequence_number) {
      updateData.ip_group_sequence_number = form.value.ip_group_sequence_number
    }
    
    // 检查数组字段的变化
    const currentIndexServers = form.value.index_servers.filter(server => server.trim())
    const originalIndexServers = originalData.value.index_servers.filter(server => server.trim())
    if (JSON.stringify(currentIndexServers) !== JSON.stringify(originalIndexServers)) {
      updateData.index_servers = currentIndexServers
    }
    
    const currentLanIPs = form.value.lan_ips.filter(ip => ip.trim())
    const originalLanIPs = originalData.value.lan_ips.filter(ip => ip.trim())
    if (JSON.stringify(currentLanIPs) !== JSON.stringify(originalLanIPs)) {
      updateData.lan_ips = currentLanIPs
    }
    
    const currentPublicIPs = form.value.public_ips.filter(ip => ip.trim())
    const originalPublicIPs = originalData.value.public_ips.filter(ip => ip.trim())
    if (JSON.stringify(currentPublicIPs) !== JSON.stringify(originalPublicIPs)) {
      updateData.public_ips = currentPublicIPs
    }
    
    // 如果没有任何字段需要更新
    if (Object.keys(updateData).length === 0) {
      notifySuccess(t('nodes.edit.network.save.noChangesDetected'))
      return
    }

    debug.log('提交网络配置数据到API端点 PUT /nodes/' + String(node.value.node_id) + '/network-config:', updateData)
    debug.log('变化的字段:', Object.keys(updateData))

    if (node.value) {
      saving.value = true
      await nodeService.updateNodeNetworkConfig(String(node.value.node_id), updateData as UpdateNodeNetworkConfigRequest)
      
      // 更新原始数据为当前表单数据
      originalData.value = JSON.parse(JSON.stringify(form.value))
      
      notifySuccess(t('nodes.edit.network.save.success', { count: Object.keys(updateData).length }))
      
      // 重新加载节点数据
      if (loadNode) {
        await loadNode(String(node.value.node_id))
      }
    }
  } catch (error: any) {
    debug.error(t('nodes.edit.network.save.errorLog'), error)
    const errorMsg = error?.response?.data?.message || error?.message || t('nodes.edit.network.save.defaultError')
    notifyError(`${t('nodes.edit.network.save.errorPrefix')}: ${errorMsg}`)
  } finally {
    saving.value = false
  }
}

// 监听节点数据变化
watch(
  () => node.value,
  (newNode) => {
    if (newNode) {
      // 节点数据加载后，加载网络配置数据
      loadNetworkConfig()
    }
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(async () => {
  // 如果使用了注入的数据并且节点已经存在，直接加载网络配置
  if (injectedNodeData && node.value) {
    await loadNetworkConfig()
  } 
  // 如果没有注入的数据，则需要加载节点数据（节点数据加载后会自动触发网络配置加载）
  else if (!injectedNodeData && nodeId.value) {
    await loadNode(nodeId.value)
  }
})
</script>

<style scoped>
.network-config-page {
  max-width: 800px;
  margin: 0 auto;
}
</style>
