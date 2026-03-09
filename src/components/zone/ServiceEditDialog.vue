<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 520px; max-width: 600px">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6">
          {{ isEdit ? $t('zoneServices.editService') : $t('zoneServices.addService') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- 服务名称 -->
          <q-input
            v-model="formData.service_name"
            :label="$t('zoneServices.form.serviceName')"
            outlined
            :hint="formData.service_name ? '' : $t('zoneServices.form.serviceNameRequired')"
            lazy-rules
            :rules="[val => !!val || '']"
          />

          <!-- 服务类型 + 协议 -->
          <div class="row q-col-gutter-md">
            <!-- 服务类型 -->
            <div class="col-6">
              <q-select
                v-model="formData.service_type"
                :label="$t('zoneServices.form.serviceType')"
                :options="serviceTypeOptions"
                outlined
                emit-value
                map-options
                @update:model-value="handleServiceTypeChange"
              />
            </div>
            
            <!-- 协议 -->
            <div class="col-6">
              <q-select
                v-model="formData.service_protocol"
                :label="$t('zoneServices.form.serviceProtocol')"
                :options="protocolOptions"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>

          <!-- 绑定设备（必选） -->
          <q-btn
            :label="selectedNodeLabel"
            outlined
            class="full-width justify-start"
            color="primary"
            @click="showNodeSelector = true"
            :loading="loadingNodes"
          >
            <template v-slot:prepend>
              <q-icon name="devices" size="xs" />
            </template>
          </q-btn>

          <!-- 提供方式 -->
          <div class="provide-mode-container">
            <div class="text-body2 text-weight-medium q-mb-sm">{{ $t('zoneServices.form.provideMode') }}</div>
            <div class="provide-mode-buttons">
              <q-btn
                v-for="option in provideModeOptions"
                :key="option.value"
                :label="option.label"
                :color="formData.bind_mode === option.value ? 'primary' : 'grey-5'"
                :text-color="formData.bind_mode === option.value ? 'white' : 'dark'"
                :unelevated="formData.bind_mode === option.value"
                :outline="formData.bind_mode !== option.value"
                :disable="option.disable || !formData.node_id"
                size="md"
                no-caps
                class="provide-mode-btn"
                @click="handleProvideModeChange(option.value)"
              >
                <q-tooltip v-if="option.disableReason">
                  {{ option.disableReason }}
                </q-tooltip>
              </q-btn>
            </div>
            <!-- 提供方式说明 -->
            <q-banner v-if="provideModeDescription && formData.node_id" dense class="provide-mode-desc q-mt-sm" rounded>
              <template v-slot:avatar>
                <q-icon :name="provideModeIcon" :color="provideModeIconColor" size="sm" />
              </template>
              <div class="text-caption">{{ provideModeDescription }}</div>
            </q-banner>
          </div>

          <!-- IP地址 + 端口（同一行） -->
          <div class="row q-col-gutter-md">
            <!-- IP地址 -->
            <div class="col-8">
              <q-input
                ref="ipAddressInput"
                v-model="formData.service_address"
                :label="ipAddressLabel"
                :hint="ipAddressPlaceholder"
                outlined
                :readonly="formData.bind_mode === 'direct'"
                lazy-rules
                :rules="ipAddressRules"
                @focus="ipAddressInput?.resetValidation()"
              />
            </div>
            <!-- 服务端口 -->
            <div class="col-4">
              <q-input
                v-model.number="formData.service_port"
                :label="$t('zoneServices.form.servicePort')"
                outlined
                type="number"
                lazy-rules
                :rules="[val => !!val || '', val => (val > 0 && val <= 65535) || '']"
              />
            </div>
          </div>

          <!-- 认证设置（公网暴露、代理模式时可用） -->
          <div v-if="formData.bind_mode === 'public' || formData.bind_mode === 'proxy' || formData.service_auth_required">
            <div class="row items-center q-gutter-md">
              <q-checkbox
                v-model="formData.service_auth_required"
                :label="$t('zoneServices.form.authRequired')"
                :disable="formData.bind_mode === 'public'"
              />
              <template v-if="formData.service_auth_required">
                <q-radio
                  v-model="formData.service_auth_type"
                  val="bearer"
                  :label="$t('zoneServices.form.authTypes.bearer')"
                />
                <q-radio
                  v-model="formData.service_auth_type"
                  val="basic"
                  :label="$t('zoneServices.form.authTypes.basic')"
                />
                <q-radio
                  v-model="formData.service_auth_type"
                  val="password"
                  :label="$t('zoneServices.form.authTypes.password')"
                />
              </template>
            </div>
            <div v-if="formData.bind_mode === 'public'" class="text-caption text-warning q-mt-xs">
              {{ $t('zoneServices.form.publicExposeWarning') }}
            </div>
          </div>

          <!-- Bearer Token -->
          <q-input
            v-if="formData.service_auth_required && formData.service_auth_type === 'bearer'"
            v-model="formData.service_auth_token"
            :label="$t('zoneServices.form.authToken')"
            :type="showToken ? 'text' : 'password'"
            outlined
          >
            <template v-slot:append>
              <q-btn
                :icon="showToken ? 'visibility_off' : 'visibility'"
                flat
                round
                dense
                @click="showToken = !showToken"
              />
            </template>
          </q-input>

          <!-- Basic Auth Username -->
          <q-input
            v-if="formData.service_auth_required && formData.service_auth_type === 'basic'"
            v-model="formData.service_auth_username"
            :label="$t('zoneServices.form.authUsername')"
            outlined
          />
          
          <!-- Basic Auth Password -->
          <q-input
            v-if="formData.service_auth_required && formData.service_auth_type === 'basic'"
            v-model="formData.service_auth_password"
            :label="$t('zoneServices.form.authPassword')"
            :type="showPassword ? 'text' : 'password'"
            outlined
          >
            <template v-slot:append>
              <q-btn
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                flat
                round
                dense
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Password Auth (仅密码) -->
          <q-input
            v-if="formData.service_auth_required && formData.service_auth_type === 'password'"
            v-model="formData.service_auth_password"
            :label="$t('zoneServices.form.authPassword')"
            :type="showPassword ? 'text' : 'password'"
            outlined
          >
            <template v-slot:append>
              <q-btn
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                flat
                round
                dense
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- 服务描述（可选） - 放在最后 -->
          <q-input
            v-model="formData.service_description"
            :label="$t('zoneServices.form.serviceDescription')"
            type="textarea"
            rows="2"
            outlined
          />
        </q-form>
      </q-card-section>

      <!-- 设备选择弹窗 -->
      <q-dialog v-model="showNodeSelector">
        <q-card style="width: 650px; max-width: 90vw">
          <q-card-section class="row items-center q-pb-sm">
            <div class="text-subtitle1">{{ $t('zoneServices.form.selectNode') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          
          <q-separator />
          
          <q-card-section class="q-pa-sm" style="max-height: 50vh; overflow-y: auto">
            <div v-if="loadingNodes" class="text-center q-pa-md">
              <q-spinner color="primary" size="30px" />
            </div>
            <div v-else-if="allNodes.length === 0" class="text-center text-grey-6 q-pa-md">
              {{ $t('zoneServices.form.noNodes') }}
            </div>
            <div v-else class="row q-col-gutter-sm">
              <div
                v-for="node in allNodes"
                :key="node.id || node.node_id"
                :class="allNodes.length === 1 ? 'col-12' : 'col-6'"
              >
                <q-card
                  flat
                  bordered
                  :class="[
                    'cursor-pointer node-select-card',
                    formData.node_id === (node.id || node.node_id) ? 'selected' : ''
                  ]"
                  @click="selectNodeAndClose(node)"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 ellipsis">{{ node.node_name }}</div>
                    <div class="text-caption text-grey-6 ellipsis">
                      IP: {{ node.node_ip || $t('common.noIP') }}
                    </div>
                    <div v-if="(node as any).network_config?.lan_ips?.length" class="text-caption text-grey-6 ellipsis">
                      LAN: {{ (node as any).network_config.lan_ips[0] }}
                    </div>
                    <div v-if="isGatewayNode(node)" class="text-caption text-primary">
                      {{ $t('zoneServices.form.gatewayNode') }}
                    </div>
                  </q-card-section>
                  <q-card-section v-if="formData.node_id === (node.id || node.node_id)" class="q-pa-none">
                    <q-separator />
                    <div class="text-center text-primary q-py-xs">
                      <q-icon name="check_circle" size="20px" />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="handleCancel"
        />
        <q-btn
          color="primary"
          :label="isEdit ? $t('common.update') : $t('common.create')"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import debug from 'src/utils/debug'
import { useZoneServices } from '../../composables/useZoneServices'
import { useNodes } from '../../composables/useNodes'
import type { ZoneService, CreateZoneServiceRequest, UpdateZoneServiceRequest, ServiceType, BindMode } from '../../types/zoneService'

interface Props {
  modelValue: boolean
  service?: ZoneService
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { createService, updateService, serviceTypes, loading } = useZoneServices()
const { loadNodes, nodes: allNodes } = useNodes()

// 状态
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.service)
const showToken = ref(false)
const showPassword = ref(false)
const loadingNodes = ref(false)
const showNodeSelector = ref(false)
const ipAddressInput = ref<any>(null)

// 表单数据
const formData = ref<CreateZoneServiceRequest & { 
  service_id?: number
  service_address?: string
  node_id?: string | number
  bind_mode?: BindMode
  service_auth_username?: string
  service_auth_password?: string
}>({
  service_name: '',
  service_type: '',
  service_description: '',
  service_address: '',
  service_port: 9000,
  service_protocol: '',
  service_auth_required: false,
  service_auth_type: 'none',
  service_auth_token: '',
  node_id: undefined,
  bind_mode: 'direct',
  service_auth_username: '',
  service_auth_password: ''
})

// 节点选项 - 显示"节点名称:虚拟IP"
const nodeOptions = computed(() => 
  allNodes.value.map(node => ({
    label: `${node.node_name}${node.node_ip ? ':' + node.node_ip : ''}`,
    value: node.id || node.node_id,
    node: node  // 保存完整节点信息用于校验
  }))
)

// 当前选中的节点
const selectedNode = computed(() => {
  if (!formData.value.node_id) return null
  return allNodes.value.find(n => (n.id || n.node_id) === formData.value.node_id)
})

// 选中节点的显示标签
const selectedNodeLabel = computed(() => {
  if (!selectedNode.value) return t('zoneServices.form.selectNode')
  return `${selectedNode.value.node_name}${selectedNode.value.node_ip ? ':' + selectedNode.value.node_ip : ''}`
})

// 判断是否为网关节点
const isGatewayNode = (node: any) => {
  if (!node) return false
  // 检查node_type是否包含网关标志（位运算，支持多类型）
  const nodeType = node.node_type
  if (typeof nodeType === 'number') {
    // 位运算检查：0x04 (4) 代表网关类型
    // 0x01 (1) = 客户端, 0x02 (2) = 服务端, 0x04 (4) = 网关
    // 一个节点可能同时拥有多个类型（如 0x05 = 客户端+网关）
    return (nodeType & 0x04) !== 0
  }
  return false
}

// 提供方式说明
const provideModeDescription = computed(() => {
  const mode = formData.value.bind_mode
  if (mode === 'direct') return t('zoneServices.form.hints.directMode')
  if (mode === 'dnat') return t('zoneServices.form.hints.dnatMode')
  if (mode === 'lan') return t('zoneServices.form.hints.lanMode')
  if (mode === 'proxy') return t('zoneServices.form.hints.proxyMode')
  if (mode === 'public') return t('zoneServices.form.hints.publicMode')
  return ''
})

// 提供方式图标
const provideModeIcon = computed(() => {
  const mode = formData.value.bind_mode
  if (mode === 'direct') return 'dns'
  if (mode === 'dnat') return 'swap_horiz'
  if (mode === 'lan') return 'router'
  if (mode === 'proxy') return 'vpn_lock'
  if (mode === 'public') return 'warning'
  return 'info'
})

const provideModeIconColor = computed(() => {
  return formData.value.bind_mode === 'public' ? 'warning' : 'primary'
})

// 提供方式选项
const provideModeOptions = computed(() => {
  const node: any = selectedNode.value
  const isGateway = isGatewayNode(node)
  
  // Lan网提供：只要是网关节点就允许（简化逻辑）
  const canUseLan = isGateway
  
  // Lan网禁用原因
  const lanDisableReason = !isGateway ? t('zoneServices.form.lanDisableReason.notGateway') : ''
  
  // 顺序：直接提供、DNAT转发、Lan网提供、代理转发、公网暴露
  return [
    { label: t('zoneServices.form.provideModes.direct'), value: 'direct' },
    { label: t('zoneServices.form.provideModes.dnat'), value: 'dnat' },
    { 
      label: t('zoneServices.form.provideModes.lan'), 
      value: 'lan',
      disable: !canUseLan,
      disableReason: lanDisableReason
    },
    { 
      label: t('zoneServices.form.provideModes.proxy'), 
      value: 'proxy'
    },
    { 
      label: t('zoneServices.form.provideModes.public'), 
      value: 'public'
    }
  ]
})

// 选项 - 过滤掉系统专用服务类型
const serviceTypeOptions = computed(() => {
  const options = serviceTypes.value
    .filter(type => !type.systemOnly)
    .map(type => ({
      label: type.label,
      value: type.key
    }))
  // 添加默认空选项
  return [
    { label: '服务类型', value: '' },
    ...options
  ]
})

const protocolOptions = [
  { label: '协议', value: '' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' }
]

// IP地址标签和提示
const ipAddressLabel = computed(() => {
  const mode = formData.value.bind_mode
  if (mode === 'direct') return t('zoneServices.form.targetIP')
  if (mode === 'dnat') return t('zoneServices.form.dnatTargetIP')
  if (mode === 'lan') return t('zoneServices.form.lanIP')
  return t('zoneServices.form.serviceAddress')
})

const ipAddressPlaceholder = computed(() => {
  const mode = formData.value.bind_mode
  if (mode === 'direct') return '192.168.1.100'
  if (mode === 'dnat') return '10.0.0.50'
  if (mode === 'lan') return '192.168.0.100'
  if (mode === 'public') return 'example.com or 1.2.3.4'
  return '192.168.1.100 or example.com'
})

// IP地址校验规则
const ipAddressRules = computed(() => {
  const rules: any[] = [
    (val: string) => !!val || t('zoneServices.form.serviceAddressRequired')
  ]
  
  const mode = formData.value.bind_mode
  const protocol = formData.value.service_protocol
  
  // 根据绑定方式和协议类型进行校验
  if (mode === 'direct' || mode === 'dnat' || mode === 'lan') {
    // 这些模式需要IP地址
    rules.push((val: string) => {
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      return ipv4Regex.test(val) || t('zoneServices.form.invalidIPv4')
    })
  }
  
  if (mode === 'public') {
    // 公网模式可以是域名或IP
    rules.push((val: string) => {
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
      return ipv4Regex.test(val) || domainRegex.test(val) || t('zoneServices.form.invalidAddress')
    })
  }
  
  return rules
})

// 认证类型选项（去掉无认证，因为已经有需要认证的复选框）
const authTypeOptions = [
  { label: t('zoneServices.form.authTypes.bearer'), value: 'bearer' },
  { label: t('zoneServices.form.authTypes.basic'), value: 'basic' },
  { label: t('zoneServices.form.authTypes.password'), value: 'password' }
]

// 加载节点列表
const loadNodeList = async () => {
  loadingNodes.value = true
  try {
    await loadNodes()
  } catch (error) {
    debug.error('Failed to load nodes:', error)
  } finally {
    loadingNodes.value = false
  }
}

// 监听服务类型变化，自动设置默认端口和协议
const handleServiceTypeChange = (serviceType: string) => {
  // 忽略空选项
  if (!serviceType) return
  
  formData.value.service_type = serviceType as ServiceType
  const typeConfig = serviceTypes.value.find(t => t.key === serviceType)
  if (typeConfig) {
    formData.value.service_port = typeConfig.defaultPort
    formData.value.service_protocol = typeConfig.defaultProtocol
  }
}

// 选择节点并关闭弹窗
const selectNodeAndClose = (node: any) => {
  const nodeId = node.id || node.node_id
  formData.value.node_id = nodeId
  showNodeSelector.value = false
  
  // 如果是网关节点且选择直接提供，给出警告
  if (isGatewayNode(node) && formData.value.bind_mode === 'direct') {
    // 这里可以添加通知提示
    debug.warn('Gateway node selected for direct service. Consider using DNAT instead.')
  }
  
  // 根据提供方式自动填充IP
  autoFillServiceAddress()
}

// 处理提供方式改变
const handleProvideModeChange = (mode: string) => {
  formData.value.bind_mode = mode as BindMode
}

// 自动填充服务地址
const autoFillServiceAddress = () => {
  const node: any = selectedNode.value
  if (!node) return
  
  const mode = formData.value.bind_mode
  
  if (mode === 'direct' && node.node_ip) {
    // 直接提供：填充节点虚拟IP
    formData.value.service_address = node.node_ip
  } else if (mode === 'lan') {
    // Lan网直供：填充LAN网段前三段
    const lanIp = node.network_config?.lan_ip || node.lan_ip
    if (lanIp) {
      // 提取前三段：192.168.1.100 -> 192.168.1.
      const segments = lanIp.split('.')
      if (segments.length >= 3) {
        formData.value.service_address = `${segments[0]}.${segments[1]}.${segments[2]}.`
      } else {
        formData.value.service_address = ''
      }
    } else {
      formData.value.service_address = ''
    }
  } else if (mode === 'public') {
    // 公网暴露：尝试填充WAN IP（如果有）
    const wanIp = node.network_config?.public_ips?.[0]
    if (wanIp) {
      formData.value.service_address = wanIp
    } else {
      formData.value.service_address = ''
    }
  } else {
    // DNAT转发：清空，让用户手动输入
    formData.value.service_address = ''
  }
}

// 监听提供方式变化
watch(() => formData.value.bind_mode, (newMode, oldMode) => {
  // 如果切换到公网暴露模式，强制要求认证
  if (newMode === 'public') {
    formData.value.service_auth_required = true
  }
  
  // 如果切换到Lan网直供，检查节点是否为网关
  if (newMode === 'lan') {
    const node: any = selectedNode.value
    const isGateway = isGatewayNode(node)
    if (!isGateway) {
      // 如果不是网关，切换回直接提供
      formData.value.bind_mode = 'direct'
      return
    }
  }
  
  // 自动填充IP地址
  autoFillServiceAddress()
})

// 监听节点选择变化
watch(() => formData.value.node_id, () => {
  // 自动填充IP地址
  autoFillServiceAddress()
})

// 组件挂载时加载节点列表
onMounted(() => {
  loadNodeList()
})

// 监听对话框打开，初始化表单
watch(() => props.modelValue, (show) => {
  if (show) {
    // 加载节点列表
    loadNodeList()
    
    if (props.service) {
      // 编辑模式：填充现有数据
      const serviceConfig = (props.service as any).service_config || {}
      const authConfig = serviceConfig.auth || {}
      const bindConfig = serviceConfig.bind || {}
      
      formData.value = {
        service_id: parseInt(props.service.service_id as any) || 0,
        service_name: props.service.service_name,
        service_type: props.service.service_type,
        service_description: props.service.service_description || '',
        service_address: props.service.service_address,
        service_port: props.service.service_port,
        service_protocol: props.service.service_protocol,
        service_auth_required: authConfig.required || false,
        service_auth_type: authConfig.type || 'bearer',
        service_auth_token: authConfig.token || '',
        node_id: (props.service as any).node_id || undefined,
        bind_mode: (bindConfig.mode || (props.service as any).bind_mode || 'direct') as BindMode,
        service_auth_username: authConfig.username || '',
        service_auth_password: authConfig.password || ''
      }
    } else {
      // 新建模式：重置表单
      formData.value = {
        service_name: '',
        service_type: '',
        service_description: '',
        service_address: '',
        service_port: 9000,
        service_protocol: '',
        service_auth_required: false,
        service_auth_type: 'bearer',
        service_auth_token: '',
        node_id: undefined,
        bind_mode: 'direct',
        service_auth_username: '',
        service_auth_password: ''
      }
    }
    showToken.value = false
    showPassword.value = false
  }
})

// 提交表单
const handleSubmit = async () => {
  // 公网暴露模式必须设置认证
  if (formData.value.bind_mode === 'public' && !formData.value.service_auth_required) {
    formData.value.service_auth_required = true
  }
  
  // 确保端口是数字类型
  const portNumber = parseInt(formData.value.service_port as any)
  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    return
  }
  
  const submitData = {
    ...formData.value,
    service_port: portNumber
  }

  if (isEdit.value && props.service) {
    // 编辑模式
    const updateData: UpdateZoneServiceRequest & {
      node_id?: string | number
      service_bind_mode?: BindMode
      service_auth_username?: string
      service_auth_password?: string
    } = {
      service_name: submitData.service_name,
      service_address: submitData.service_address,
      service_port: submitData.service_port,
      service_protocol: submitData.service_protocol,
      service_auth_required: submitData.service_auth_required,
      service_auth_type: submitData.service_auth_type
    }
    
    // 只有当字段有值时才添加到更新数据中
    if (submitData.service_description) {
      updateData.service_description = submitData.service_description
    }
    if (submitData.service_auth_token) {
      updateData.service_auth_token = submitData.service_auth_token
    }
    if (submitData.node_id) {
      updateData.node_id = submitData.node_id
    }
    if (submitData.bind_mode) {
      updateData.service_bind_mode = submitData.bind_mode
    }
    if (submitData.service_auth_username) {
      updateData.service_auth_username = submitData.service_auth_username
    }
    if (submitData.service_auth_password) {
      updateData.service_auth_password = submitData.service_auth_password
    }
    
    const success = await updateService(parseInt(props.service.service_id), updateData)
    if (success) {
      emit('success')
      showDialog.value = false
    }
  } else {
    // 新建模式
    const createData = {
      ...submitData,
      ...(submitData.node_id && { node_id: submitData.node_id }),
      ...(submitData.bind_mode && { service_bind_mode: submitData.bind_mode }),
      ...(submitData.service_auth_username && { service_auth_username: submitData.service_auth_username }),
      ...(submitData.service_auth_password && { service_auth_password: submitData.service_auth_password })
    }
    
    const success = await createService(createData)
    if (success) {
      emit('success')
      showDialog.value = false
    }
  }
}

// 取消
const handleCancel = () => {
  showDialog.value = false
}
</script>

<style scoped lang="scss">
// 提供方式容器 - 整体框架
.provide-mode-container {
  padding: 16px 0;
  background: var(--q-color-grey-1);
  border-radius: 8px;
  border: 1px solid var(--q-color-grey-3);
  margin-left: -1px !important;
  margin-right: -1px !important;
}

.provide-mode-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  
  .provide-mode-btn {
    flex: 0 1 auto;
    white-space: nowrap;
    padding: 8px 12px;
    font-size: 13px;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  }
}

.provide-mode-desc {
  background: white;
  border: 1px solid var(--q-color-grey-4);
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  
  .text-caption {
    line-height: 1.5;
  }
}

// 设备选择卡片
.node-select-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 100px;
  
  &:hover {
    border-color: var(--q-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.05);
  }
  
  .q-card__section {
    padding: 8px 12px;
  }
}

// 紧凑布局
:deep(.q-field) {
  margin-bottom: 0;
}

// 响应式设计
@media (max-width: 600px) {
  .provide-mode-buttons {
    .provide-mode-btn {
      flex: 1 1 calc(50% - 4px);
      min-width: 0;
    }
  }
}
</style>
