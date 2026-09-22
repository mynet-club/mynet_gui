<template>
  <div class="node-config-page q-pa-md">
    <!-- 页面标题和VPN类型显示 -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="column">
        <div class="text-h6">{{ $t('nodes.edit.config.title') }}</div>
        <div class="text-caption text-grey-6">
          {{ currentVpnConfig?.name?.startsWith('vpn.config.') ? $t(currentVpnConfig.name) : currentVpnConfig?.name }} - {{ currentVpnConfig?.description }}
        </div>
      </div>
      
      <!-- 配置模式切换 -->
      <div class="row items-center q-gutter-md">
        <q-btn-toggle
          v-model="configMode"
          :options="modeOptions"
          color="primary"
          :disable="loading"
          toggle-color="primary"
          outline
          @update:model-value="(newMode) => switchConfigMode(newMode)"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- 左侧配置表单 -->
      <div class="col-7">
        <q-card>
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- 动态参数配置 -->
              <div v-if="currentModeConfig">
                <!-- 隐藏的节点ID字段 -->
                <input type="hidden" :value="nodeId" name="nodeid" />
                
                <div class="text-subtitle1 q-mb-md">
                  {{ currentModeConfig.name.startsWith('vpn.config.') ? $t(currentModeConfig.name) : currentModeConfig.name }}
                  <q-icon name="info" class="q-ml-sm text-grey-6" size="sm">
                    <q-tooltip>{{ currentModeConfig.description.startsWith('vpn.config.') ? $t(currentModeConfig.description) : currentModeConfig.description }}</q-tooltip>
                  </q-icon>
                </div>
                
                <!-- 动态渲染配置参数 -->
                <div
                  v-for="(param, key) in currentModeConfig.parameters"
                  :key="key"
                  class="config-item q-mb-md"
                >
                  <div class="config-label text-subtitle2 q-mb-sm">
                    {{ param.name.startsWith('vpn.config.') ? $t(param.name) : param.name }}
                    <span v-if="param.required" class="text-red">*</span>
                    <q-icon name="help" class="q-ml-xs text-grey-6" size="sm">
                      <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-icon>
                  </div>
                  
                  <!-- 开关类型 -->
                  <q-toggle
                    v-if="param.type === 'switch' && param.options"
                    v-model="formData[key]"
                    :true-value="Object.keys(param.options)[0]"
                    :false-value="Object.keys(param.options)[1]"
                    :label="param.options[formData[key]] || Object.values(param.options)[0]"
                    :disable="loading"
                    color="primary"
                  />
                  
                  <!-- 多按钮类型 -->
                  <q-btn-group
                    v-else-if="param.type === 'multi-button' && param.options"
                    outline
                  >
                    <q-btn
                      v-for="(optionLabel, optionValue) in param.options"
                      :key="optionValue"
                      :label="optionLabel"
                      :color="formData[key] === optionValue ? 'primary' : 'grey-7'"
                      :outline="formData[key] !== optionValue"
                      @click="handleMultiButtonClick(key, optionValue as any)"
                      :disable="loading"
                      size="sm"
                      no-caps
                    />
                  </q-btn-group>
                  
                  <!-- 字符串输入 -->
                  <q-input
                    v-else-if="param.type === 'string'"
                    v-model="formData[key]"
                    :placeholder="param.default?.toString() || ''"
                    outlined
                    dense
                    :disable="loading"
                    :rules="getValidationRules(param)"
                    style="max-width: 400px;"
                  />
                  
                  <!-- 数字输入 -->
                  <q-input
                    v-else-if="param.type === 'integer'"
                    v-model.number="formData[key]"
                    type="number"
                    :placeholder="param.default?.toString() || ''"
                    outlined
                    dense
                    :disable="loading"
                    :rules="getValidationRules(param)"
                    style="max-width: 200px;"
                  />
                  
                  <!-- 文本域 -->
                  <q-input
                    v-else-if="param.type === 'text'"
                    v-model="formData[key]"
                    type="textarea"
                    :placeholder="param.default?.toString() || ''"
                    outlined
                    dense
                    rows="3"
                    :disable="loading"
                    style="max-width: 600px;"
                  />
                  
                  <!-- 布尔类型 - 使用switch -->
                  <q-toggle
                    v-if="param.type === 'boolean'"
                    v-model="formData[key]"
                    :label="formData[key] ? $t('common.enabled') : $t('common.disabled')"
                    :disable="loading"
                    color="primary"
                  />
                  
                  <!-- 选择项 - 使用按钮组 -->
                  <div v-else-if="param.type === 'select' && param.options">
                    <q-btn-group
                      v-if="Object.keys(param.options).length <= 3"
                      outline
                    >
                      <q-btn
                        v-for="(optionLabel, optionValue) in param.options"
                        :key="optionValue"
                        :label="optionLabel"
                        :color="formData[key] === optionValue ? 'primary' : 'grey-7'"
                        :outline="formData[key] !== optionValue"
                        @click="formData[key] = optionValue"
                        :disable="loading"
                        size="sm"
                      />
                    </q-btn-group>
                    
                    <!-- 选项太多时使用开关 -->
                    <div v-else-if="Object.keys(param.options).length === 2">
                      <q-toggle
                        v-model="formData[key]"
                        :true-value="Object.keys(param.options)[0]"
                        :false-value="Object.keys(param.options)[1]"
                        :label="param.options[formData[key]] || Object.values(param.options)[0]"
                        :disable="loading"
                      />
                    </div>
                    
                    <!-- 选项很多时使用选择器 -->
                    <q-select
                      v-else
                      v-model="formData[key]"
                      :options="getSelectOptions(param.options)"
                      emit-value
                      map-options
                      outlined
                      dense
                      :disable="loading"
                      style="max-width: 300px;"
                    />
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="row q-gutter-sm q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  :loading="saving"
                  :disable="!hasChanges || loading"
                  no-caps
                >
                  <q-icon name="save" class="q-mr-sm" />
                  {{ $t('nodes.edit.config.saveConfig') }}
                </q-btn>
                
                <q-btn
                  color="grey-7"
                  outline
                  @click="resetForm"
                  :disable="saving || !hasChanges || loading"
                  no-caps
                >
                  <q-icon name="refresh" class="q-mr-sm" />
                  {{ $t('common.reset') }}
                </q-btn>
                
                <q-btn
                  color="secondary"
                  outline
                  @click="exportConfig"
                  :disable="loading || exporting"
                  :loading="exporting"
                  no-caps
                >
                  <q-icon name="download" class="q-mr-sm" />
                  {{ $t('nodes.edit.config.exportConfig') }}
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧配置预览 -->
      <div class="col-5">
        <div class="sticky-preview">
          <q-card>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">{{ $t('nodes.edit.config.previewConfig') }}</div>
                <div class="text-caption text-grey-6">{{ $t('nodes.edit.config.fullConfigPreview') }}</div>
                <q-btn
                  color="grey-7"
                  flat
                  round
                  dense
                  icon="content_copy"
                  @click="copyConfig"
                  size="sm"
                >
                  <q-tooltip>{{ $t('nodes.edit.config.copyConfig') }}</q-tooltip>
                </q-btn>
              </div>
              <div class="config-preview-container">
                <pre class="config-preview">{{ configPreview }}</pre>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import debug from 'src/utils/debug'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useNotify } from '../../../composables'
import { vpnConfigData } from '../../../config/vpnConfig'
import { VPNConfigParameter, NodeConfigForm } from '../../../types/vpnConfig'
import { VPNConfigService } from '../../../services/vpnConfigService'
import { nodeConfigService } from '../../../services/node/nodeConfigService'
import { bundleEnvelopeService } from '../../../services/node/bundleEnvelopeService'
import type { ConfigUpdateRequest, NodeConfigApiResponse } from '../../../types/nodeConfig'

const route = useRoute()
const $q = useQuasar()
const { t } = useI18n()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 加载状态
const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)

// 基础配置
const vpnType = ref<'gnb' | 'wireguard'>('gnb')
const configMode = ref<'base' | 'expert'>('base')

// 完整的表单数据结构（包含所有参数的完整结构）
const formData = ref<Record<string, any>>({})
const originalFormData = ref<Record<string, any>>({})

// API参数架构缓存（用于安全的数据覆盖）
const apiSchema = ref<Record<string, any>>({})

// 编辑状态
const hasUserEdited = ref(false)

// 网络配置相关字段（在网络配置页面处理，本页面不显示）
// 注意：现在只排除nodeid，其他字段都移动到节点配置页面
const networkFields = ['nodeid']

// 计算属性
const currentVpnConfig = computed(() => {
  return vpnConfigData[vpnType.value]
})

const currentVersionConfig = computed(() => {
  // 使用节点支持的最高版本配置（合并版本）
  return VPNConfigService.getNodeVersionConfig(vpnType.value, nodeId.value)
})

const currentModeConfig = computed(() => {
  const versionConfig = currentVersionConfig.value
  if (!versionConfig) return null
  
  const modeConfig = versionConfig.modes[configMode.value]
  if (!modeConfig) return null
  
  // 过滤掉网络配置字段
  const filteredParameters = Object.fromEntries(
    Object.entries(modeConfig.parameters).filter(([key]) => !networkFields.includes(key))
  )
  
  return {
    ...modeConfig,
    parameters: filteredParameters
  }
})

const modeOptions = computed(() => [
  { label: t('nodes.edit.config.basicConfig'), value: 'base' },
  { label: t('nodes.edit.config.expertConfig'), value: 'expert' }
])

const hasChanges = computed(() => {
  // 简化的变更检测：只检查表单数据是否有变化或用户是否进行过编辑
  return hasUserEdited.value || JSON.stringify(formData.value) !== JSON.stringify(originalFormData.value)
})

// 完整配置预览（包含基本配置和专家配置）
const configPreview = computed(() => {
  const versionConfig = currentVersionConfig.value
  if (!versionConfig || !formData.value) return t('nodes.edit.config.pleaseConfigureParams')
  
  const lines: string[] = []
  
  if (vpnType.value === 'gnb') {
    // GNB 配置格式 (key=value)
    lines.push(t('nodes.edit.config.gnbConfigFile'))
    lines.push(`${t('nodes.edit.config.generateTime')}: ${new Date().toLocaleString()}`)
    lines.push('')
    
    // 基本配置部分
    lines.push(`# ==================== ${t('nodes.edit.config.basicConfig')} ====================`)
    const baseConfig = versionConfig.modes.base
    if (baseConfig) {
      renderConfigSection(lines, baseConfig.parameters, t('nodes.edit.config.basicConfig'))
    }
    
    lines.push('')
    lines.push(`# ==================== ${t('nodes.edit.config.expertConfig')} ====================`)
    const expertConfig = versionConfig.modes.expert
    if (expertConfig) {
      renderConfigSection(lines, expertConfig.parameters, t('nodes.edit.config.expertConfig'))
    }
    
  } else if (vpnType.value === 'wireguard') {
    // WireGuard 配置格式 (INI格式)
    lines.push(t('nodes.edit.config.wireguardConfigFile'))
    lines.push(`${t('nodes.edit.config.generateTime')}: ${new Date().toLocaleString()}`)
    lines.push('')
    lines.push('[Interface]')
    
    // 基本配置部分
    lines.push(`# ==================== ${t('nodes.edit.config.basicConfig')} ====================`)
    const baseConfig = versionConfig.modes.base
    if (baseConfig) {
      renderConfigSection(lines, baseConfig.parameters, t('nodes.edit.config.basicConfig'), true)
    }
    
    lines.push(`# ==================== ${t('nodes.edit.config.expertConfig')} ====================`)
    const expertConfig = versionConfig.modes.expert
    if (expertConfig) {
      renderConfigSection(lines, expertConfig.parameters, t('nodes.edit.config.expertConfig'), true)
    }
    
    lines.push('')
    lines.push('[Peer]')
    lines.push(t('nodes.edit.config.peerConfigNote'))
    lines.push(t('nodes.edit.config.peerPublicKey'))
    lines.push(t('nodes.edit.config.peerEndpoint'))
    lines.push(t('nodes.edit.config.peerAllowedIPs'))
  }
  
  return lines.join('\n') || t('nodes.edit.config.noConfigContent')
})

// 渲染配置段的辅助函数
const renderConfigSection = (lines: string[], parameters: Record<string, VPNConfigParameter>, sectionName: string, isWireGuard = false) => {
  let hasContent = false
  
  Object.entries(parameters).forEach(([key, param]) => {
    // 跳过网络字段（这些在网络配置页面管理）
    if (networkFields.includes(key)) return
    
    const value = formData.value[key]
    if (value !== undefined && value !== null && value !== '') {
      hasContent = true
      lines.push(`# ${param.description || param.name}`)
      
      // 转换参数名：下划线换成连字符
      const configKey = key.replace(/_/g, '-')
      
      // 特殊处理listen参数：根据IPv4/IPv6设置组装完整地址
      let displayValue = value
      if (key === 'listen') {
        const ipv4Only = formData.value.ipv4_only === 'on'
        const ipv6Only = formData.value.ipv6_only === 'on'
        
        if (ipv4Only) {
          displayValue = `0.0.0.0:${value}`
        } else if (ipv6Only) {
          displayValue = `[::]:${value}`
        } else {
          displayValue = value // 只显示端口号，代表全部监听
        }
      }
      
      if (isWireGuard) {
        lines.push(`${configKey} = ${displayValue}`)
      } else {
        // GNB格式：使用空格而不是等号
        lines.push(`${configKey} ${displayValue}`)
      }
      lines.push('')
    } else if (param.required || param.default !== undefined) {
      // 显示必填项或有默认值的项，即使当前值为空
      hasContent = true
      const rawValue = value || param.default || ''
      lines.push(`# ${param.description || param.name} ${param.required ? t('node.config.required') : t('node.config.optional')}`)
      
      // 转换参数名：下划线换成连字符
      const configKey = key.replace(/_/g, '-')
      
      // 特殊处理listen参数：根据IPv4/IPv6设置组装完整地址
      let displayValue = rawValue
      if (key === 'listen') {
        const ipv4Only = formData.value.ipv4_only === 'on'
        const ipv6Only = formData.value.ipv6_only === 'on'
        
        if (ipv4Only) {
          displayValue = `0.0.0.0:${rawValue}`
        } else if (ipv6Only) {
          displayValue = `[::]:${rawValue}`
        } else {
          displayValue = rawValue // 只显示端口号，代表全部监听
        }
      }
      
      if (isWireGuard) {
        lines.push(`${configKey} = ${displayValue}`)
      } else {
        // GNB格式：使用空格而不是等号
        lines.push(`${configKey} ${displayValue}`)
      }
      lines.push('')
    }
  })
  
  if (!hasContent) {
    lines.push(`# ${sectionName}暂无配置内容`)
    lines.push('')
  }
}

// 方法
const handleMultiButtonClick = (key: string, value: any) => {
  // 设置当前参数的值
  formData.value[key] = value
  
  // 实现IPv4和IPv6互斥逻辑
  if (key === 'ipv4_only') {
    if (value === 'on') {
      // 启用IPv4 only时，明确禁用IPv6 only
      formData.value.ipv6_only = 'off'
    }
  } else if (key === 'ipv6_only') {
    if (value === 'on') {
      // 启用IPv6 only时，明确禁用IPv4 only
      formData.value.ipv4_only = 'off'
    }
  }
}

const getValidationRules = (param: VPNConfigParameter) => {
  const rules: any[] = []
  
  if (param.required) {
    rules.push((val: any) => (val !== undefined && val !== null && val !== '') || t('node.config.validation.required'))
  }
  
  if (param.type === 'integer') {
    rules.push((val: any) => {
      if (val === undefined || val === null || val === '') return true
      const num = Number(val)
      return !isNaN(num) || t('node.config.validation.invalidNumber')
    })
    
    if (param.min !== undefined) {
      rules.push((val: any) => {
        if (val === undefined || val === null || val === '') return true
        return Number(val) >= param.min! || t('node.config.validation.minValue', { min: param.min })
      })
    }
    
    if (param.max !== undefined) {
      rules.push((val: any) => {
        if (val === undefined || val === null || val === '') return true
        return Number(val) <= param.max! || t('node.config.validation.maxValue', { max: param.max })
      })
    }
  }
  
  if (param.validation) {
    rules.push((val: any) => {
      if (val === undefined || val === null || val === '') return true
      const regex = new RegExp(param.validation!)
      return regex.test(val) || t('node.config.validation.invalidFormat')
    })
  }
  
  return rules
}

const getSelectOptions = (options: Record<string, string>) => {
  return Object.entries(options).map(([value, label]) => ({
    label,
    value
  }))
}

// 初始化完整的表单数据结构（包含所有模式的所有参数）
const initializeFormData = () => {
  debug.log('初始化完整表单数据结构')
  
  const fullData: Record<string, any> = {}
  
  // 获取当前VPN类型的完整版本配置
  const versionConfig = currentVersionConfig.value
  if (!versionConfig) {
    debug.warn('未找到版本配置')
    return
  }
  
  // 遍历所有模式（base和expert），收集所有参数
  Object.entries(versionConfig.modes).forEach(([modeName, modeConfig]) => {
    Object.entries(modeConfig.parameters).forEach(([key, param]) => {
      // 如果参数还不存在，则添加默认值
      if (!(key in fullData)) {
        if (param.default !== undefined) {
          fullData[key] = param.default
        } else if (param.type === 'integer') {
          fullData[key] = 0
        } else if (param.type === 'boolean') {
          fullData[key] = false
        } else if (param.type === 'select' && param.options) {
          fullData[key] = Object.keys(param.options)[0]
        } else if (param.type === 'switch' && param.options) {
          fullData[key] = Object.keys(param.options)[1] // 默认关闭状态
        } else if (param.type === 'multi-button' && param.options) {
          fullData[key] = Object.keys(param.options)[0] // 默认第一个选项
        } else {
          fullData[key] = ''
        }
      }
    })
  })
  
  // 添加网络字段的默认值（虽然不显示，但提交时需要）
  networkFields.forEach(field => {
    if (!(field in fullData)) {
      fullData[field] = getNetworkFieldDefault(field)
    }
  })
  
  // 更新表单数据
  formData.value = { ...fullData }
  originalFormData.value = { ...fullData }
  
  // 确保IPv4/IPv6字段有明确的默认值，给用户安全感
  if (!formData.value.ipv4_only || formData.value.ipv4_only === '') {
    formData.value.ipv4_only = 'off' // 明确设为禁用
  }
  if (!formData.value.ipv6_only || formData.value.ipv6_only === '') {
    formData.value.ipv6_only = 'off' // 明确设为禁用
  }
  
  // 重置编辑状态
  hasUserEdited.value = false
  
  debug.log('完整表单数据初始化完成:', fullData)
}

// 获取网络字段的默认值
const getNetworkFieldDefault = (field: string): any => {
  switch (field) {
    case 'nodeid':
      return nodeId.value || ''
    case 'ifname':
      return 'tun0'
    case 'listen':
      return 9001
    default:
      return ''
  }
}

// 安全地用服务器数据覆盖对应参数（只覆盖API架构中存在的参数）
const safeOverrideWithServerData = (serverData: Record<string, any>) => {
  debug.log('安全覆盖服务器数据:', serverData)
  
  const versionConfig = currentVersionConfig.value
  if (!versionConfig) {
    debug.warn('无版本配置，跳过服务器数据覆盖')
    return
  }
  
  debug.log('当前版本配置模式:', Object.keys(versionConfig.modes))
  
  // 收集所有有效的参数键和配置（来自所有模式）
  const validParams = new Map<string, any>()
  Object.values(versionConfig.modes).forEach(modeConfig => {
    Object.entries(modeConfig.parameters).forEach(([key, param]) => {
      validParams.set(key, param)
    })
  })
  
  debug.log('有效参数列表:', Array.from(validParams.keys()))
  
  // 只覆盖有效的参数，并进行类型转换
  Object.entries(serverData).forEach(([key, value]) => {
    const param = validParams.get(key)
    if (param && value !== undefined && value !== null) {
      let convertedValue = value
      
      // 对multi-button类型进行验证
      if (param.type === 'multi-button' && param.options) {
        const validOptions = Object.keys(param.options)
        if (validOptions.includes(String(value))) {
          convertedValue = String(value)  // 确保是字符串
          debug.log(`验证multi-button参数 ${key}: ${value} -> ${convertedValue}`)
        } else {
          debug.warn(`multi-button参数 ${key} 的值 ${value} 不在有效选项中:`, validOptions)
          convertedValue = param.default || validOptions[0] // 使用默认值或第一个选项
        }
      }
      
      formData.value[key] = convertedValue
      debug.log(`✅ 覆盖参数 ${key}:`, value, '->', convertedValue)
    } else {
      debug.log(`❌ 跳过无效参数 ${key}:`, value, '(param存在:', !!param, ')')
    }
  })
  
  debug.log('覆盖后的表单数据:', formData.value)
}

// 简化的模式切换（不需要保存和加载数据，因为使用统一的数据结构）
const switchConfigMode = (newMode: 'base' | 'expert') => {
  debug.log(`切换配置模式: ${configMode.value} -> ${newMode}`)
  configMode.value = newMode
  // 不需要额外的数据操作，因为使用统一的formData
}

// 简化的重置函数
const resetForm = () => {
  // 重置为原始数据
  formData.value = { ...originalFormData.value }
  hasUserEdited.value = false
  notifySuccess(t('common.formReset'))
}

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(configPreview.value)
    notifySuccess(t('node.config.configCopied'))
  } catch (error) {
    debug.error('复制失败:', error)
    notifyError(t('node.config.copyFailed'))
  }
}

const exportConfig = async () => {
  exporting.value = true
  try {
    // 从 API 获取渲染后的配置内容
    const renderedContent = await nodeConfigService.getRenderedConfig(nodeId.value)
    
    // 创建并下载文件
    const blob = new Blob([renderedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `node-${nodeId.value}-${vpnType.value}-config${currentVersionConfig.value?.config_file_extension || '.conf'}`
    a.click()
    URL.revokeObjectURL(url)
    notifySuccess(t('node.config.configExported'))
  } catch (error) {
    debug.error('导出配置失败:', error)
    notifyError(t('node.config.exportFailed'))
  } finally {
    exporting.value = false
  }
}

const onSubmit = async () => {
  if (!hasChanges.value) {
    notifyError(t('common.noChangesToSave'))
    return
  }
  
  saving.value = true
  
  try {
    // 直接提交字段数据，不组织为嵌套结构
    const submitData: any = {
      // 基础元数据
      vpn_type: vpnType.value,
      vpn_version: 'merged',
      config_mode: configMode.value,
      
      // 展平的配置字段（直接在顶层）
      ...formData.value,
      
      // 确保必要的网络字段有值
      nodeid: formData.value.nodeid || parseInt(nodeId.value) || 1000000000000000,
      ifname: formData.value.ifname || 'gnb_tun',
      listen: formData.value.listen || 9001
    }
    
    debug.log('提交的配置数据（分别提交字段）:', submitData)
    
    // 调用API保存配置（扁平化字段格式）
    await nodeConfigService.updateNodeConfig(nodeId.value, submitData)

    // R8：保存后发布 BundleEnvelope，节点才会收到 bundle_changed
    const published = await bundleEnvelopeService.publishAfterChange(nodeId.value, 'saveDeviceConfig')
    if (published?.generation) {
      notifySuccess(`${t('nodes.edit.config.saveSuccess')} · ${published.generation}`)
    }

    // 更新原始数据并重置编辑状态
    originalFormData.value = { ...formData.value }
    hasUserEdited.value = false

    if (!published?.generation) {
      notifySuccess(t('nodes.edit.config.saveSuccess'))
    }
    
  } catch (error: any) {
    debug.error(t('nodes.edit.config.saveFailedLog'), error)
    const errorMsg = error?.response?.data?.message || error?.message || t('nodes.edit.config.saveFailedRetry')
    notifyError(`${t('nodes.edit.config.saveFailedPrefix')}: ${errorMsg}`)
  } finally {
    saving.value = false
  }
}

// 监听表单数据变化，设置编辑状态
watch(
  formData,
  () => {
    // 用户有任何编辑行为时，设置编辑状态
    if (!hasUserEdited.value) {
      hasUserEdited.value = true
    }
  },
  { deep: true }
)

// 监听配置变化
watch(
  [vpnType],
  () => {
    // VPN类型变化时重新初始化所有数据
    initializeFormData()
  }
)

// 监听配置模式变化
watch(
  configMode,
  (newMode, oldMode) => {
    if (oldMode && newMode !== oldMode) {
      // 使用新的模式切换逻辑
      switchConfigMode(newMode)
    }
  }
)

// 组件挂载时初始化
onMounted(async () => {
  loading.value = true
  
  try {
    // 根据节点ID自动判断VPN类型
    if (nodeId.value) {
      const detectedVpnType = VPNConfigService.detectVpnType(nodeId.value)
      vpnType.value = detectedVpnType
      
      // 尝试从API获取节点的具体配置
      try {
        debug.log('尝试加载节点配置:', nodeId.value)
        const configResponse = await nodeConfigService.getNodeConfig(nodeId.value)
        
        debug.log('API返回的完整响应:', configResponse)
        
        // 检查新的扁平化数据格式
        if (configResponse.success && configResponse.data) {
          debug.log('检测到新的扁平化数据格式:', configResponse.data)
          
          // 先初始化完整的默认数据结构
          initializeFormData()
          
          // API 返回 { vpn: {...}, network: {...} } 结构，合并两个子对象的参数
          const apiData = configResponse.data as any
          const vpnData = apiData.vpn ?? {}
          const networkData = apiData.network ?? {}
          // 合并 vpn 和 network，vpn 优先（防止重复key时 network 覆盖 vpn）
          const rawMerged = Object.keys(vpnData).length > 0 || Object.keys(networkData).length > 0
            ? { ...networkData, ...vpnData }
            : apiData
          debug.log('提取 VPN 配置数据:', vpnData)
          debug.log('提取 Network 配置数据:', networkData)
          debug.log('合并后原始数据:', rawMerged)
          
          // API key → 配置架构 key 映射（处理命名不一致问题）
          const keyMap: Record<string, string> = {
            listen_port: 'listen',          // API 用 listen_port, 架构用 listen
            interface_name: 'ifname',       // API 用 interface_name, 架构用 ifname
          }
          const mergedData: Record<string, any> = {}
          Object.entries(rawMerged).forEach(([k, v]) => {
            const mappedKey = keyMap[k] ?? k
            mergedData[mappedKey] = v
          })
          debug.log('key映射后数据:', mergedData)
          
          safeOverrideWithServerData(mergedData)
          
          // 保存为原始数据
          originalFormData.value = { ...formData.value }
          
          debug.log('节点配置加载成功（新格式）:', {
            vpnType: vpnType.value,
            configMode: configMode.value,
            formData: formData.value,
            特别关注multi_socket: formData.value.multi_socket
          })
        } else {
          // 尝试旧的数据格式
          debug.log('尝试旧的数据格式...')
          const responseData = configResponse.data as unknown as NodeConfigApiResponse
          
          debug.log('API返回的配置数据（旧格式）:', responseData)
          
          // 从API响应中提取配置信息
          const customConfig = responseData.custom_config
          const nodeInfo = responseData.node_info
          
          if (customConfig && customConfig.basic_config) {
            // 过滤出非网络配置字段
            const filteredParams = Object.fromEntries(
              Object.entries(customConfig.basic_config).filter(([key]) => !networkFields.includes(key))
            )
            
            // 更新VPN类型和配置模式
            if (nodeInfo?.vpn_type) {
              vpnType.value = nodeInfo.vpn_type as 'gnb' | 'wireguard'
            }
            if (customConfig.config_mode) {
              configMode.value = customConfig.config_mode as 'base' | 'expert'
            }
            
            // 先初始化完整的默认数据结构
            initializeFormData()
            
            // 安全地用服务器数据覆盖对应参数
            safeOverrideWithServerData(filteredParams)
            
            // 如果有expert_config，也进行安全覆盖
            if (customConfig.expert_config) {
              const expertParams = Object.fromEntries(
                Object.entries(customConfig.expert_config).filter(([key]) => !networkFields.includes(key))
              )
              safeOverrideWithServerData(expertParams)
            }
            
            // 保存为原始数据
            originalFormData.value = { ...formData.value }
            
            debug.log('节点配置加载成功（旧格式）:', {
              vpnType: vpnType.value,
              configMode: configMode.value,
              formData: formData.value
            })
          } else {
            debug.log('custom_config 或 basic_config 不存在，使用默认值')
            // 如果没有配置数据，使用默认值
            initializeFormData()
          }
        }
      } catch (configError: any) {
        debug.log('节点配置不存在或加载失败，使用默认值:', configError?.response?.status)
        // 如果是404错误或其他错误，使用默认值初始化
        initializeFormData()
      }
    } else {
      initializeFormData()
    }
    
  } catch (error: any) {
    debug.error('加载节点配置失败:', error)
    notifyError(t('node.config.loadConfigFailed'))
    initializeFormData() // 出错时使用默认值
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.node-config-page {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.sticky-preview {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.config-preview-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f8f9fa;
}

.config-preview {
  background: #f8f9fa;
  padding: 16px;
  margin: 0;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2d3748;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 300px;
}

.config-item {
  border-left: 3px solid transparent;
  padding-left: 8px;
  transition: all 0.3s ease;
}

.config-item:hover {
  border-left-color: #1976d2;
  background-color: #f5f5f5;
}

.config-label {
  font-weight: 500;
}
</style>
