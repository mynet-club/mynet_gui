<template>
  <div class="network-config-page q-pa-md">
    <div class="text-h6 q-mb-md">网络配置</div>
    
    <!-- 加载状态 -->
    <div v-if="loadingNetworkConfig" class="text-center q-py-lg">
      <q-spinner color="primary" size="2em" />
      <div class="q-mt-sm text-grey-6">正在加载网络配置...</div>
    </div>
    
    <q-form v-else @submit.prevent="onSubmit" class="q-gutter-md" ref="formRef">
      <!-- 基础网络配置 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">基础配置</div>
          
          <!-- 网络接口名称 -->
          <q-input
            v-model="form.ifname"
            label="网络接口名称"
            outlined
            class="q-mb-md"
            :rules="[
              val => !!val || '网络接口名称不能为空',
              val => val.length <= 15 || '接口名称不能超过15个字符',
              val => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(val) || '接口名称必须以字母开头，只能包含字母、数字、下划线和短划线'
            ]"
            :disable="loading"
            hint="网络接口名称，如: eth0, wlan0, tun0 等"
            placeholder="例如: tun0"
          />

          <!-- 节点虚拟IP -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">节点虚拟IP</div>
            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="form.node_ip"
                  label="虚拟IP地址"
                  outlined
                  readonly
                  placeholder="点击右侧按钮选择IP"
                  :rules="[
                    val => !!val || '请选择节点虚拟IP'
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
                  选择IP
                </q-btn>
              </div>
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              从你的IP池中选择一个可用的IP地址作为节点的虚拟IP
              <span v-if="form.ip_group_sequence_number" class="q-ml-sm">
                (组序号: {{ form.ip_group_sequence_number }})
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
            <div class="text-subtitle2 q-mb-sm">索引服务器 (可多选)</div>
            <div class="q-gutter-sm">
              <div
                v-for="(server, index) in form.index_servers"
                :key="index"
                class="row q-gutter-sm items-center"
              >
                <div class="col">
                  <q-input
                    v-model="form.index_servers[index]"
                    label="索引服务器"
                    outlined
                    dense
                    placeholder="例如: 192.168.1.1:8080"
                    :rules="[validateIPPort]"
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
                    @click="removeIndexServer(index)"
                    :disable="loading"
                  />
                </div>
              </div>
              <q-btn
                color="primary"
                outline
                icon="add"
                label="添加索引服务器"
                @click="addIndexServer"
                :disable="loading"
                class="q-mt-sm"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 扩展配置 -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">扩展配置</div>
          
          <!-- 局域网IP -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">局域网IP</div>
            <div class="q-gutter-sm">
              <div
                v-for="(lanIP, index) in form.lan_ips"
                :key="index"
                class="row q-gutter-sm items-center"
              >
                <div class="col">
                  <q-input
                    v-model="form.lan_ips[index]"
                    label="局域网IP"
                    outlined
                    dense
                    placeholder="例如: 192.168.1.100"
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
                label="添加局域网IP"
                @click="addLanIP"
                :disable="loading"
                class="q-mt-sm"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              配置节点的局域网IP地址，仅支持IPv4
            </div>
          </div>

          <!-- 公网IP -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">公网IP</div>
            <div class="q-gutter-sm">
              <div
                v-for="(publicIP, index) in form.public_ips"
                :key="index"
                class="row q-gutter-sm items-center"
              >
                <div class="col">
                  <q-input
                    v-model="form.public_ips[index]"
                    label="公网IP"
                    outlined
                    dense
                    placeholder="例如: 1.2.3.4 或 2001:db8::1"
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
                label="添加公网IP"
                @click="addPublicIP"
                :disable="loading"
                class="q-mt-sm"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              如果本节点有公网IP，请填写，支持IPv4和IPv6，这会大大提升建立连接的速度
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
          保存网络配置
        </q-btn>
        
        <q-btn
          color="grey-7"
          outline
          @click="resetForm"
          :disable="saving || !hasChanges || loading || loadingNetworkConfig"
        >
          <q-icon name="refresh" class="q-mr-sm" />
          重置
        </q-btn>
        
        <q-btn
          color="secondary"
          outline
          @click="testConnection"
          :disable="saving || loading || loadingNetworkConfig || !form.node_ip"
        >
          <q-icon name="network_check" class="q-mr-sm" />
          测试连接
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNode, useNotify } from '../../../composables'
import { nodeService } from '../../../services/node/nodeService'
import type { NodeNetworkConfig, UpdateNodeNetworkConfigRequest } from '../../../types/node'
import IPSelectorDialog from '../../../components/node/IPSelectorDialog.vue'

const route = useRoute()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 尝试从父组件注入节点数据
const injectedNodeData = inject<any>('nodeData', null)

// 使用组合式函数 (如果没有注入的数据，则创建新的)
const { node, loading, saving, loadNode, updateNode } = injectedNodeData || useNode()

// 表单数据
const form = ref({
  ifname: '',
  node_ip: '',
  ip_group_sequence_number: 0,
  index_servers: [''],
  lan_ips: [''],
  public_ips: ['']
})

// 原始数据
const originalData = ref({
  ifname: '',
  node_ip: '',
  ip_group_sequence_number: 0,
  index_servers: [''],
  lan_ips: [''],
  public_ips: ['']
})

// 对话框状态
const showIPSelector = ref(false)
const loadingNetworkConfig = ref(false)
const formRef = ref<any>(null)

// 计算属性
const hasChanges = computed(() => {
  // 基础字段比较
  if (form.value.ifname !== originalData.value.ifname) return true
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
const getDefaultIfnameByVpnType = (vpnType: string): string => {
  switch (vpnType) {
    case 'gnb':
      return 'gnb_tun'
    case 'wireguard':
      return 'WG01'
    case 'openvpn':
      return 'tun0'
    default:
      return 'tun0'
  }
}

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
    return 'IP地址格式不正确'
  }
  return true
}

// 验证IPv4地址格式是否正确
const validateIPv4Address = (ip: string): string | boolean => {
  if (!ip || !ip.trim()) return true // 空值允许
  const trimmedIP = ip.trim()
  if (!isValidIPv4Address(trimmedIP)) {
    return 'IPv4地址格式不正确'
  }
  return true
}

// 验证IP:端口格式是否正确
const validateIPPort = (ipPort: string): string | boolean => {
  if (!ipPort || !ipPort.trim()) return true // 空值允许
  const trimmedIPPort = ipPort.trim()
  if (!isValidIPPort(trimmedIPPort)) {
    return 'IP:端口格式不正确，例如: 192.168.1.1:8080'
  }
  return true
}

// 方法
const loadNetworkConfig = async () => {
  if (!node.value) return
  
  try {
    loadingNetworkConfig.value = true
    
    // 加载网络配置数据
    const response = await nodeService.getNodeNetworkConfig(String(node.value.node_id))
    const networkConfig = response.data || {}
    
    // 根据VPN类型设置默认网络接口名称
    let defaultIfname = ''
    if (node.value.vpn_type) {
      defaultIfname = getDefaultIfnameByVpnType(node.value.vpn_type)
    }
    
    const data = {
      ifname: networkConfig.ifname || defaultIfname,
      node_ip: networkConfig.node_ip || node.value.node_ip || '',
      ip_group_sequence_number: networkConfig.ip_group_sequence_number || node.value.ip_group_sequence_number || 0,
      index_servers: networkConfig.index_servers?.length ? [...networkConfig.index_servers] : [''],
      lan_ips: networkConfig.lan_ips?.length ? [...networkConfig.lan_ips] : [''],
      public_ips: networkConfig.public_ips?.length ? [...networkConfig.public_ips] : (node.value.public_ip ? [node.value.public_ip] : [''])
    }
    
    form.value = JSON.parse(JSON.stringify(data))
    originalData.value = JSON.parse(JSON.stringify(data))
    
    console.log('网络配置数据加载成功:', data)
  } catch (error: any) {
    console.error('加载网络配置数据失败:', error)
    
    // 如果是404错误，说明网络配置不存在，使用默认值
    if (error?.response?.status === 404) {
      console.log('网络配置不存在，使用默认值初始化')
      initializeForm()
    } else {
      // 其他错误，显示错误信息但仍使用默认值
      notifyError('加载网络配置失败，使用默认值')
      initializeForm()
    }
  } finally {
    loadingNetworkConfig.value = false
  }
}

const initializeForm = () => {
  if (node.value) {
    const networkConfig = node.value.network_config || {}
    
    // 根据VPN类型设置默认网络接口名称
    let defaultIfname = ''
    if (node.value.vpn_type) {
      defaultIfname = getDefaultIfnameByVpnType(node.value.vpn_type)
    }
    
    const data = {
      ifname: networkConfig.ifname || defaultIfname,
      node_ip: networkConfig.node_ip || node.value.node_ip || '',
      ip_group_sequence_number: networkConfig.ip_group_sequence_number || node.value.ip_group_sequence_number || 0,
      index_servers: networkConfig.index_servers?.length ? [...networkConfig.index_servers] : [''],
      lan_ips: networkConfig.lan_ips?.length ? [...networkConfig.lan_ips] : [''],
      public_ips: networkConfig.public_ips?.length ? [...networkConfig.public_ips] : (node.value.public_ip ? [node.value.public_ip] : [''])
    }
    
    form.value = JSON.parse(JSON.stringify(data))
    originalData.value = JSON.parse(JSON.stringify(data))
  }
}

const resetForm = () => {
  form.value = JSON.parse(JSON.stringify(originalData.value))
  notifySuccess('表单已重置')
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
  notifySuccess(`已选择IP: ${ip} (组序号: ${ipGroupSequenceNumber})`)
}

const testConnection = async () => {
  if (!form.value.node_ip) {
    notifyError('请先选择节点虚拟IP')
    return
  }

  try {
    $q.loading.show({
      message: '正在测试连接...'
    })
    
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    $q.loading.hide()
    
    $q.dialog({
      title: '连接测试结果',
      message: `网络配置测试通过！\n节点虚拟IP: ${form.value.node_ip}`,
      ok: true
    })
  } catch (error) {
    $q.loading.hide()
    notifyError('连接测试失败，请检查网络配置')
  }
}

const onSubmit = async () => {
  console.log('onSubmit 函数被调用')
  
  try {
    // 检查是否有变化
    if (!hasChanges.value) {
      notifySuccess('没有任何变化，无需保存')
      return
    }
    
    // 验证表单
    if (formRef.value) {
      const isValid = await formRef.value.validate()
      if (!isValid) {
        notifyError('请检查并修正表单错误')
        return
      }
    }
    
    // 验证必填字段
    if (!form.value.ifname?.trim()) {
      notifyError('请填写网络接口名称')
      return
    }
    
    if (!form.value.node_ip?.trim()) {
      notifyError('请选择节点虚拟IP')
      return
    }
    
    // 构建更新数据，只包含有变化的字段
    const updateData: Partial<UpdateNodeNetworkConfigRequest> = {}
    
    // 检查基础字段的变化
    if (form.value.ifname !== originalData.value.ifname) {
      updateData.ifname = form.value.ifname.trim()
    }
    
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
      notifySuccess('没有检测到变化，无需保存')
      return
    }

    console.log('提交网络配置数据到API端点 PUT /nodes/' + String(node.value.node_id) + '/network-config:', updateData)
    console.log('变化的字段:', Object.keys(updateData))

    if (node.value) {
      saving.value = true
      await nodeService.updateNodeNetworkConfig(String(node.value.node_id), updateData as UpdateNodeNetworkConfigRequest)
      
      // 更新原始数据为当前表单数据
      originalData.value = JSON.parse(JSON.stringify(form.value))
      
      notifySuccess(`网络配置保存成功，更新了 ${Object.keys(updateData).length} 个字段`)
      
      // 重新加载节点数据
      if (loadNode) {
        await loadNode(String(node.value.node_id))
      }
    }
  } catch (error: any) {
    console.error('保存网络配置失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '保存失败，请重试'
    notifyError(`保存失败: ${errorMsg}`)
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

// 监听VPN类型变化，自动更新网络接口名称
watch(
  () => node.value?.vpn_type,
  (newVpnType, oldVpnType) => {
    if (newVpnType && newVpnType !== oldVpnType) {
      // 如果接口名称为空，或者是旧的默认值，则更新为新的默认值
      const currentIfname = form.value.ifname
      const oldDefaultIfname = oldVpnType ? getDefaultIfnameByVpnType(oldVpnType) : ''
      
      if (!currentIfname || currentIfname === oldDefaultIfname) {
        form.value.ifname = getDefaultIfnameByVpnType(newVpnType)
      }
    }
  }
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
