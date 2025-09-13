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

    <!-- 版本选择 -->
    <div class="row q-mb-md" v-if="currentVpnConfig?.supported_versions.length > 1">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="q-py-sm">
            <div class="text-caption text-grey-6 q-mb-sm">版本选择</div>
            <q-btn-group outline>
              <q-btn
                v-for="version in currentVpnConfig.supported_versions"
                :key="version"
                :label="getVersionLabel(version)"
                :color="vpnVersion === version ? 'primary' : 'grey-7'"
                :outline="vpnVersion !== version"
                @click="vpnVersion = version"
                :disable="loading"
                size="sm"
              />
            </q-btn-group>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-gutter-md">
      <!-- 左侧配置表单 -->
      <div class="col-12" :class="{ 'col-lg-7': $q.screen.gt.md }">
        <q-card>
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- 动态参数配置 -->
              <div v-if="currentModeConfig">
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
                      @click="handleMultiButtonClick(key, optionValue)"
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
                        @click="handleMultiButtonClick(key, optionValue)"
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

      <!-- 右侧配置预览 - 仅在大屏幕显示 -->
      <div class="col-5 gt-md-only">
        <q-card class="sticky-preview">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNotify } from '../../../composables'
import { vpnConfigData } from '../../../config/vpnConfig'
import { VPNConfigParameter, NodeConfigForm } from '../../../types/vpnConfig'

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
const vpnVersion = ref('default')
const configMode = ref<'base' | 'expert'>('base')

// 表单数据
const formData = ref<Record<string, any>>({})
const originalFormData = ref<Record<string, any>>({})

// 计算属性
const currentVpnConfig = computed(() => {
  return vpnConfigData[vpnType.value]
})

const currentVersionConfig = computed(() => {
  return currentVpnConfig.value?.versions[vpnVersion.value]
})

const currentModeConfig = computed(() => {
  return currentVersionConfig.value?.modes[configMode.value]
})

const modeOptions = computed(() => [
  { label: '基本配置', value: 'base' },
  { label: '专家配置', value: 'expert' }
])

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalFormData.value)
})

// 配置预览 - 始终显示完整配置
const configPreview = computed(() => {
  if (!currentVpnConfig.value || !currentVersionConfig.value) return ''
  
  const config: string[] = []
  
  if (vpnType.value === 'gnb') {
    // GNB 完整配置格式
    config.push('# GNB 节点配置文件')
    config.push(`# 节点ID: ${nodeId.value}`)
    config.push(`# 当前编辑模式: ${configMode.value === 'base' ? '基本配置' : '专家配置'}`)
    config.push('')
    
    // 网络配置部分（从表单数据获取）
    config.push('# 网络配置')
    config.push(`nodeid ${nodeId.value}`)
    config.push(`ifname ${formData.value.ifname || 'gnb_tun'}`)
    
    // 处理listen参数：根据IPv4/IPv6设置组装地址
    const listenPort = formData.value.listen || 9001
    const ipv4Only = formData.value.ipv4_only === 'on'
    const ipv6Only = formData.value.ipv6_only === 'on'
    
    let listenDisplay
    if (ipv4Only) {
      listenDisplay = `0.0.0.0:${listenPort}`
    } else if (ipv6Only) {
      listenDisplay = `[::]:${listenPort}`
    } else {
      listenDisplay = listenPort // 只显示端口号，代表全部监听
    }
    config.push(`listen ${listenDisplay}`)
    config.push('')
    
    // 基础配置部分 - 始终显示
    const baseConfig = currentVersionConfig.value.modes.base
    if (baseConfig) {
      config.push('# 基础配置')
      Object.entries(baseConfig.parameters).forEach(([key, param]) => {
        if (!['nodeid'].includes(key)) { // 只排除nodeid，因为它在网络配置部分已经显示
          const value = formData.value[key] ?? param.default
          if (value !== undefined && value !== null && value !== '') {
            const isCurrentMode = configMode.value === 'base'
            const prefix = isCurrentMode ? '→ ' : '  '
            // 转换参数名：下划线换成连字符，等号换成空格
            const configKey = key.replace(/_/g, '-')
            config.push(`${prefix}${configKey} ${value}${isCurrentMode ? ' (当前编辑)' : ''}`)
          }
        }
      })
      config.push('')
    }
    
    // 专家配置部分 - 始终显示
    const expertConfig = currentVersionConfig.value.modes.expert
    if (expertConfig) {
      config.push('# 专家配置')
      Object.entries(expertConfig.parameters).forEach(([key, param]) => {
        const value = formData.value[key] ?? param.default
        if (value !== undefined && value !== null && value !== '') {
          const isCurrentMode = configMode.value === 'expert'
          const prefix = isCurrentMode ? '→ ' : '  '
          // 转换参数名：下划线换成连字符，等号换成空格
          const configKey = key.replace(/_/g, '-')
          config.push(`${prefix}${configKey} ${value}${isCurrentMode ? ' (当前编辑)' : ''}`)
        }
      })
    }
    
  } else if (vpnType.value === 'wireguard') {
    // WireGuard 完整配置格式
    config.push('# WireGuard 节点配置文件')
    config.push(`# 节点ID: ${nodeId.value}`)
    config.push(`# 当前编辑模式: ${configMode.value === 'base' ? '基本配置' : '专家配置'}`)
    config.push('')
    
    config.push('[Interface]')
    config.push(`# 网络接口名称: ${currentVersionConfig.value.interface_name || 'WG01'}`)
    config.push(`Address=${formData.value.listen || '10.0.0.1/24'}`)
    config.push(`ListenPort=${currentVersionConfig.value.default_port || 51820}`)
    config.push('')
    
    // 基础配置参数
    const baseConfig = currentVersionConfig.value.modes.base
    if (baseConfig) {
      config.push('# 基础配置参数')
      Object.entries(baseConfig.parameters).forEach(([key, param]) => {
        if (!['nodeid'].includes(key)) { // 只排除nodeid
          const value = formData.value[key] ?? param.default
          if (value !== undefined && value !== null && value !== '') {
            const isCurrentMode = configMode.value === 'base'
            const prefix = isCurrentMode ? '# → ' : '# '
            // WireGuard保持原格式：key = value
            config.push(`${prefix}${key}=${value}${isCurrentMode ? ' (当前编辑)' : ''}`)
          }
        }
      })
      config.push('')
    }
    
    // 专家配置参数
    const expertConfig = currentVersionConfig.value.modes.expert
    if (expertConfig) {
      config.push('# 专家配置参数')
      Object.entries(expertConfig.parameters).forEach(([key, param]) => {
        const value = formData.value[key] ?? param.default
        if (value !== undefined && value !== null && value !== '') {
          const isCurrentMode = configMode.value === 'expert'
          const prefix = isCurrentMode ? '# → ' : '# '
          // WireGuard保持原格式：key = value
          config.push(`${prefix}${key}=${value}${isCurrentMode ? ' (当前编辑)' : ''}`)
        }
      })
    }
    
    config.push('')
    config.push('[Peer]')
    config.push('# Peer配置需要单独设置')
    config.push('# PublicKey = <对端公钥>')
    config.push('# AllowedIPs = 0.0.0.0/0')
    config.push('# Endpoint = <对端地址:端口>')
  }
  
  return config.join('\n')
})

// 方法
const handleMultiButtonClick = (key: string, value: any) => {
  // 设置当前参数的值
  formData.value[key] = value
  
  // 实现IPv4和IPv6互斥逻辑
  if (key === 'ipv4_only' && value !== '0' && value !== 0) {
    // 启用IPv4 only时，禁用IPv6 only
    formData.value.ipv6_only = '0'
  } else if (key === 'ipv6_only' && value !== '0' && value !== 0) {
    // 启用IPv6 only时，禁用IPv4 only
    formData.value.ipv4_only = '0'
  }
}

const getVersionLabel = (version: string) => {
  if (version === 'default') return '默认版本'
  return version
}

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
  if (!currentVpnConfig.value) return
  
  const data: Record<string, any> = {}
  
  // 初始化基础配置和专家配置的所有参数
  const baseConfig = currentVpnConfig.value.versions[vpnVersion.value]?.modes.base
  const expertConfig = currentVpnConfig.value.versions[vpnVersion.value]?.modes.expert
  
  // 合并所有配置参数
  const allParams = { ...baseConfig?.parameters, ...expertConfig?.parameters }
  
  Object.entries(allParams).forEach(([key, param]) => {
    // 设置默认值
    if (param.default !== undefined) {
      data[key] = param.default
    } else if (param.type === 'integer') {
      data[key] = 0
    } else if (param.type === 'boolean') {
      data[key] = false
    } else if (param.type === 'select' && param.options) {
      data[key] = Object.keys(param.options)[0]
    } else if (param.type === 'switch' && param.options) {
      data[key] = Object.keys(param.options)[1] // 默认关闭状态
    } else if (param.type === 'multi-button' && param.options) {
      data[key] = Object.keys(param.options)[0] // 默认第一个选项
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
    // 直接提交字段数据，不组织为嵌套结构
    const submitData: any = {
      // 基础元数据
      vpn_type: vpnType.value,
      vpn_version: vpnVersion.value,
      config_mode: configMode.value,
      
      // 展平的配置字段（直接在顶层）
      ...formData.value,
      
      // 确保必要的网络字段有值
      nodeid: formData.value.nodeid || parseInt(nodeId.value) || 1000000000000000,
      ifname: formData.value.ifname || 'gnb_tun',
      listen: formData.value.listen || 9001
    }
    
    console.log('提交的配置数据（分别提交字段）:', submitData)
    
    // 调用API保存配置（扁平化字段格式）
    // 模拟API调用 - 实际项目中应调用 nodeConfigService.updateNodeConfig
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
  [vpnType, vpnVersion, configMode],
  () => {
    initializeFormData()
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(async () => {
  loading.value = true
  
  try {
    // 这里可以根据节点ID加载现有配置
    if (nodeId.value) {
      // 模拟加载节点配置
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 可以从API获取节点的VPN类型和版本
      // const nodeConfig = await loadNodeConfig(nodeId.value)
      // vpnType.value = nodeConfig.vpn_type
      // vpnVersion.value = nodeConfig.vpn_version
      // configMode.value = nodeConfig.config_mode
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
  max-width: 1200px;
  margin: 0 auto;
}

.sticky-preview {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
}

.config-preview-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
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
  min-height: 200px;
}

/* 高亮当前编辑的参数 */
.config-preview {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.config-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 2px,
    rgba(33, 150, 243, 0.05) 2px,
    rgba(33, 150, 243, 0.05) 4px
  );
  pointer-events: none;
  border-radius: 4px;
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

/* 移动端优化 */
@media (max-width: 1023px) {
  .node-config-page {
    padding: 8px;
  }
}
</style>
