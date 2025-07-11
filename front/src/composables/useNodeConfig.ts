import { ref, computed, watch } from 'vue'
import type { 
  NodeConfig, 
  VPNConfigTemplate, 
  ConfigValidationResult,
  ConfigTemplateApplyRequest,
  ConfigImport,
  ConfigExport
} from '../types/nodeConfig'
import { nodeConfigService } from '../services/nodeConfigService'
import { useNotify } from './useNotify'

/**
 * 节点配置管理组合式函数
 */
export function useNodeConfig(nodeId?: string) {
  // 临时通知函数
  const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotify()

  // 状态
  const config = ref<NodeConfig | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const validating = ref(false)
  const error = ref<string | null>(null)
  const isDirty = ref(false)

  // 验证结果
  const validationResult = ref<ConfigValidationResult | null>(null)

  // 编辑模式
  const editMode = ref<'basic' | 'expert'>('basic')
  const showAdvanced = ref(false)

  // 可用模板
  const templates = ref<VPNConfigTemplate[]>([])
  const selectedTemplate = ref<string | null>(null)

  // 计算属性
  const isValid = computed(() => {
    return validationResult.value ? validationResult.value.valid : true
  })

  const hasWarnings = computed(() => {
    return validationResult.value ? validationResult.value.warnings.length > 0 : false
  })

  const hasChanges = computed(() => isDirty.value)

  // 网络配置
  const networkConfig = computed(() => config.value?.network || null)

  // 基础配置
  const basicConfig = computed(() => config.value?.basic_config || {})

  // 专家配置
  const expertConfig = computed(() => config.value?.expert_config || {})

  // 配置预览
  const configPreview = computed(() => {
    if (!config.value) return ''
    return config.value.generated_config || ''
  })

  /**
   * 加载节点配置
   */
  const loadConfig = async (targetNodeId?: string) => {
    const id = targetNodeId || nodeId
    if (!id) {
      error.value = '节点ID不能为空'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await nodeConfigService.getNodeConfig(id)
      config.value = result.data
      isDirty.value = false
      
      // 自动验证配置
      await validateConfig()
    } catch (err) {
      console.error('加载配置失败:', err)
      error.value = '加载配置失败'
      notifyError('加载配置失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存配置
   */
  const saveConfig = async (): Promise<boolean> => {
    if (!config.value || !nodeId) {
      error.value = '配置或节点ID不能为空'
      return false
    }

    // 验证配置
    const validation = await validateConfig()
    if (!validation.valid) {
      notifyError('配置验证失败，请检查后重试')
      return false
    }

    saving.value = true
    error.value = null

    try {
      const result = await nodeConfigService.updateNodeConfig(nodeId, config.value)
      config.value = result.data
      isDirty.value = false
      notifySuccess('配置保存成功')
      return true
    } catch (err) {
      console.error('保存配置失败:', err)
      error.value = '保存配置失败'
      notifyError('保存配置失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * 验证配置
   */
  const validateConfig = async (): Promise<ConfigValidationResult> => {
    if (!config.value) {
      const result: ConfigValidationResult = {
        valid: false,
        errors: ['配置不能为空'],
        warnings: [],
        suggestions: [],
        field_errors: {}
      }
      validationResult.value = result
      return result
    }

    validating.value = true

    try {
      const result = await nodeConfigService.validateConfig(config.value)
      validationResult.value = result.data
      return result.data
    } catch (err) {
      console.error('验证配置失败:', err)
      const result: ConfigValidationResult = {
        valid: false,
        errors: ['验证失败'],
        warnings: [],
        suggestions: [],
        field_errors: {}
      }
      validationResult.value = result
      return result
    } finally {
      validating.value = false
    }
  }

  /**
   * 加载配置模板
   */
  const loadTemplates = async () => {
    try {
      const result = await nodeConfigService.getVPNConfigTemplates()
      templates.value = result.data
    } catch (err) {
      console.error('加载模板失败:', err)
      notifyError('加载模板失败')
    }
  }

  /**
   * 应用配置模板
   */
  const applyTemplate = async (templateRequest: ConfigTemplateApplyRequest): Promise<boolean> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return false
    }

    try {
      const result = await nodeConfigService.applyConfigTemplate(nodeId, templateRequest)
      config.value = result.data
      isDirty.value = true
      selectedTemplate.value = templateRequest.template_name
      notifySuccess('模板应用成功')
      
      // 重新验证配置
      await validateConfig()
      
      return true
    } catch (err) {
      console.error('应用模板失败:', err)
      error.value = '应用模板失败'
      notifyError('应用模板失败')
      return false
    }
  }

  /**
   * 重置配置到默认值
   */
  const resetConfig = async (): Promise<boolean> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return false
    }

    try {
      // 重新创建默认配置
      const defaultConfig: NodeConfig = {
        node_id: nodeId,
        vpn_type: 'gnb',
        vpn_version: '1.0',
        config_mode: 'basic',
        config_version: '1.0',
        network: {
          interface_name: 'gnb0',
          listen_address: '0.0.0.0',
          listen_port: 9001,
          mtu: 1420
        },
        basic_config: {}
      }
      
      config.value = defaultConfig
      isDirty.value = true
      selectedTemplate.value = null
      notifySuccess('配置重置成功')
      
      // 重新验证配置
      await validateConfig()
      
      return true
    } catch (err) {
      console.error('重置配置失败:', err)
      error.value = '重置配置失败'
      notifyError('重置配置失败')
      return false
    }
  }

  /**
   * 更新网络配置
   */
  const updateNetworkConfig = (updates: Partial<NodeConfig['network']>) => {
    if (!config.value) return

    config.value.network = {
      ...config.value.network,
      ...updates
    }

    isDirty.value = true
  }

  /**
   * 更新基础配置
   */
  const updateBasicConfig = (key: string, value: any) => {
    if (!config.value) return

    config.value.basic_config[key] = value
    isDirty.value = true
  }

  /**
   * 更新专家配置
   */
  const updateExpertConfig = (key: string, value: any) => {
    if (!config.value) return

    if (!config.value.expert_config) {
      config.value.expert_config = {}
    }

    config.value.expert_config[key] = value
    isDirty.value = true
  }

  /**
   * 批量更新配置
   */
  const updateConfig = (updates: Partial<NodeConfig>) => {
    if (!config.value) return

    config.value = {
      ...config.value,
      ...updates
    }

    isDirty.value = true
  }

  /**
   * 导出配置
   */
  const exportConfig = async (format: 'json' | 'yaml' = 'json') => {
    if (!config.value) {
      notifyWarning('没有可导出的配置')
      return
    }

    try {
      const exportData: ConfigExport = {
        node_id: config.value.node_id,
        node_name: `Node ${config.value.node_id}`,
        config: config.value,
        exported_at: new Date().toISOString(),
        exported_by: 'current_user',
        format
      }

      const content = format === 'json' ? 
        JSON.stringify(exportData, null, 2) : 
        JSON.stringify(exportData) // 简化处理，实际应使用yaml库

      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `node_config_${nodeId || 'unknown'}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      notifySuccess('配置导出成功')
    } catch (err) {
      console.error('导出配置失败:', err)
      notifyError('导出配置失败')
    }
  }

  /**
   * 导入配置
   */
  const importConfig = async (fileContent: string, format: 'json' | 'yaml' = 'json'): Promise<boolean> => {
    if (!nodeId) {
      error.value = '节点ID不能为空'
      return false
    }

    try {
      const importData: ConfigImport = {
        file_content: fileContent,
        format,
        validate_only: false,
        override_existing: true
      }

      const result = await nodeConfigService.importConfig(nodeId, importData)
      config.value = result.data
      isDirty.value = true
      notifySuccess('配置导入成功')
      
      // 重新验证配置
      await validateConfig()
      
      return true
    } catch (err) {
      console.error('导入配置失败:', err)
      error.value = '导入配置失败'
      notifyError('导入配置失败')
      return false
    }
  }

  /**
   * 切换编辑模式
   */
  const switchEditMode = (mode: 'basic' | 'expert') => {
    editMode.value = mode
    showAdvanced.value = mode === 'expert'
    
    // 如果切换到专家模式，确保配置结构包含expert_config
    if (mode === 'expert' && config.value && !config.value.expert_config) {
      config.value.expert_config = {}
    }
  }

  /**
   * 切换高级选项显示
   */
  const toggleAdvanced = () => {
    showAdvanced.value = !showAdvanced.value
  }

  /**
   * 检查是否有未保存的更改
   */
  const checkUnsavedChanges = (): boolean => {
    return isDirty.value
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    config.value = null
    loading.value = false
    saving.value = false
    validating.value = false
    error.value = null
    isDirty.value = false
    validationResult.value = null
    editMode.value = 'basic'
    showAdvanced.value = false
    templates.value = []
    selectedTemplate.value = null
  }

  // 监听配置变化，自动标记为脏数据
  watch(config, () => {
    if (config.value) {
      isDirty.value = true
    }
  }, { deep: true })

  // 如果提供了nodeId，自动加载配置
  if (nodeId) {
    loadConfig(nodeId)
    loadTemplates()
  }

  return {
    // 状态
    config,
    loading,
    saving,
    validating,
    error,
    isDirty,
    validationResult,
    editMode,
    showAdvanced,
    templates,
    selectedTemplate,
    
    // 计算属性
    isValid,
    hasWarnings,
    hasChanges,
    networkConfig,
    basicConfig,
    expertConfig,
    configPreview,
    
    // 方法
    loadConfig,
    saveConfig,
    validateConfig,
    loadTemplates,
    applyTemplate,
    resetConfig,
    updateNetworkConfig,
    updateBasicConfig,
    updateExpertConfig,
    updateConfig,
    exportConfig,
    importConfig,
    switchEditMode,
    toggleAdvanced,
    checkUnsavedChanges,
    clearError,
    reset
  }
}
