<template>
  <div class="node-config-page q-pa-md">
    <!-- 页面标题和VPN类型显示 -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="column">
        <div class="text-h6">节点配置</div>
        <div class="text-caption text-grey-6">
          {{ currentVpnConfig?.name }} - {{ currentVpnConfig?.description }}
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
                  {{ currentModeConfig.name }}
                  <q-icon name="info" class="q-ml-sm text-grey-6" size="sm">
                    <q-tooltip>{{ currentModeConfig.description }}</q-tooltip>
                  </q-icon>
                </div>
                
                <!-- 动态渲染配置参数 -->
                <div
                  v-for="(param, key) in currentModeConfig.parameters"
                  :key="key"
                  class="config-item q-mb-md"
                >
                  <div class="config-label text-subtitle2 q-mb-sm">
                    {{ param.name }}
                    <span v-if="param.required" class="text-red">*</span>
                    <q-icon name="help" class="q-ml-xs text-grey-6" size="sm">
                      <q-tooltip>{{ param.description }}</q-tooltip>
                    </q-icon>
                  </div>
                  
                  <!-- 字符串输入 -->
                  <q-input
                    v-if="param.type === 'string'"
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
                    :label="formData[key] ? '启用' : '禁用'"
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
                  保存配置
                </q-btn>
                
                <q-btn
                  color="grey-7"
                  outline
                  @click="resetForm"
                  :disable="saving || !hasChanges || loading"
                  no-caps
                >
                  <q-icon name="refresh" class="q-mr-sm" />
                  重置
                </q-btn>
                
                <q-btn
                  color="secondary"
                  outline
                  @click="exportConfig"
                  :disable="loading"
                  no-caps
                >
                  <q-icon name="download" class="q-mr-sm" />
                  导出配置
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
                <div class="text-h6">配置预览</div>
                <q-btn
                  color="grey-7"
                  flat
                  round
                  dense
                  icon="content_copy"
                  @click="copyConfig"
                  size="sm"
                >
                  <q-tooltip>复制配置</q-tooltip>
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
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNotify } from '../../../composables'
import { vpnConfigData } from '../../../config/vpnConfig'
import { VPNConfigParameter, NodeConfigForm } from '../../../types/vpnConfig'
import { VPNConfigService } from '../../../services/vpnConfigService'

const route = useRoute()
const $q = useQuasar()
const { success: notifySuccess, error: notifyError } = useNotify()

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 基础配置
const vpnType = ref<'gnb' | 'wireguard'>('gnb')
const configMode = ref<'base' | 'expert'>('base')

// 表单数据
const formData = ref<Record<string, any>>({})
const originalFormData = ref<Record<string, any>>({})

// 网络配置相关字段（在网络配置页面处理，本页面不显示）
const networkFields = ['nodeid', 'ifname', 'listen_address', 'listen_port']

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
  { label: '基本配置', value: 'base' },
  { label: '专家配置', value: 'expert' }
])

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalFormData.value)
})

// 配置预览
const configPreview = computed(() => {
  if (!currentModeConfig.value || !formData.value) return '# 请填写配置参数'
  
  const lines: string[] = []
  
  if (vpnType.value === 'gnb') {
    // GNB 配置格式 (key=value)
    lines.push('# GNB 节点配置文件')
    lines.push(`# 生成时间: ${new Date().toLocaleString()}`)
    lines.push('')
    
    Object.entries(formData.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const param = currentModeConfig.value?.parameters[key]
        if (param) {
          lines.push(`# ${param.description || param.name}`)
          lines.push(`${key}=${value}`)
          lines.push('')
        }
      }
    })
  } else if (vpnType.value === 'wireguard') {
    // WireGuard 配置格式 (INI格式)
    lines.push('# WireGuard 节点配置文件')
    lines.push(`# 生成时间: ${new Date().toLocaleString()}`)
    lines.push('')
    lines.push('[Interface]')
    
    Object.entries(formData.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const param = currentModeConfig.value?.parameters[key]
        if (param) {
          lines.push(`# ${param.description || param.name}`)
          lines.push(`${key}=${value}`)
        }
      }
    })
    
    lines.push('')
    lines.push('[Peer]')
    lines.push('# Peer配置需要根据具体需求设置')
    lines.push('# PublicKey = <对端公钥>')
    lines.push('# Endpoint = <对端地址:端口>')
    lines.push('# AllowedIPs = <允许的IP范围>')
  }
  
  return lines.join('\n') || '# 暂无配置内容'
})

// 方法
const getValidationRules = (param: VPNConfigParameter) => {
  const rules: any[] = []
  
  if (param.required) {
    rules.push((val: any) => (val !== undefined && val !== null && val !== '') || '此项为必填项')
  }
  
  if (param.type === 'integer') {
    rules.push((val: any) => {
      if (val === undefined || val === null || val === '') return true
      const num = Number(val)
      return !isNaN(num) || '请输入有效的数字'
    })
    
    if (param.min !== undefined) {
      rules.push((val: any) => {
        if (val === undefined || val === null || val === '') return true
        return Number(val) >= param.min! || `最小值为 ${param.min}`
      })
    }
    
    if (param.max !== undefined) {
      rules.push((val: any) => {
        if (val === undefined || val === null || val === '') return true
        return Number(val) <= param.max! || `最大值为 ${param.max}`
      })
    }
  }
  
  if (param.validation) {
    rules.push((val: any) => {
      if (val === undefined || val === null || val === '') return true
      const regex = new RegExp(param.validation!)
      return regex.test(val) || '输入格式不正确'
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

const initializeFormData = () => {
  if (!currentModeConfig.value) return
  
  const data: Record<string, any> = {}
  
  Object.entries(currentModeConfig.value.parameters).forEach(([key, param]) => {
    // 设置默认值
    if (param.default !== undefined) {
      data[key] = param.default
    } else if (param.type === 'integer') {
      data[key] = 0
    } else if (param.type === 'boolean') {
      data[key] = false
    } else if (param.type === 'select' && param.options) {
      data[key] = Object.keys(param.options)[0]
    } else {
      data[key] = ''
    }
  })
  
  formData.value = { ...data }
  originalFormData.value = { ...data }
}

const resetForm = () => {
  formData.value = { ...originalFormData.value }
  notifySuccess('表单已重置')
}

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(configPreview.value)
    notifySuccess('配置已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    notifyError('复制失败，请手动选择复制')
  }
}

const exportConfig = () => {
  const content = configPreview.value
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `node-${nodeId.value}-${vpnType.value}-config${currentVersionConfig.value?.config_file_extension || '.conf'}`
  a.click()
  URL.revokeObjectURL(url)
  notifySuccess('配置文件已导出')
}

const onSubmit = async () => {
  if (!hasChanges.value) {
    notifyError('没有需要保存的更改')
    return
  }
  
  saving.value = true
  
  try {
    // 构建配置对象
    const configData: NodeConfigForm = {
      vpn_type: vpnType.value,
      vpn_version: 'merged', // 表示使用合并版本
      config_mode: configMode.value,
      parameters: { ...formData.value }
    }
    
    // 验证配置
    const validation = VPNConfigService.validateConfig(
      vpnType.value,
      'default', // 验证时使用默认版本的规则
      configMode.value,
      formData.value
    )
    
    if (!validation.valid) {
      notifyError(`配置验证失败: ${validation.errors.join(', ')}`)
      return
    }
    
    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新原始数据
    originalFormData.value = { ...formData.value }
    
    notifySuccess('节点配置保存成功')
    
  } catch (error) {
    console.error('保存节点配置失败:', error)
    notifyError('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 监听配置变化，重新初始化表单
watch(
  [vpnType, configMode],
  () => {
    initializeFormData()
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(async () => {
  loading.value = true
  
  try {
    // 根据节点ID自动判断VPN类型
    if (nodeId.value) {
      const detectedVpnType = VPNConfigService.detectVpnType(nodeId.value)
      vpnType.value = detectedVpnType
      
      // 模拟加载节点配置
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 这里可以从API获取节点的具体配置
      // const nodeConfig = await loadNodeConfig(nodeId.value)
      // vpnVersion.value = nodeConfig.vpn_version || 'default'
      // configMode.value = nodeConfig.config_mode || 'base'
      // if (nodeConfig.parameters) {
      //   formData.value = { ...nodeConfig.parameters }
      //   originalFormData.value = { ...nodeConfig.parameters }
      // }
    }
    
    initializeFormData()
    
  } catch (error) {
    console.error('加载节点配置失败:', error)
    notifyError('加载配置失败')
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
