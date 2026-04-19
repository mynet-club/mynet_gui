/**
 * Config Bundle 组合式函数 - v2.2.0
 * 统一配置包管理和版本兼容性检查
 */

import { ref, computed, readonly } from 'vue'
import debug from 'src/utils/debug'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import { configBundleService } from '../services/node/configBundleService'
import { apiVersionService } from '../services/apiVersionService'
import type { 
  ConfigBundleResponse,
  ConfigBundleWarning,
  VersionCompatibilityResult,
  HeartbeatRequest 
} from '../types/nodeConfig'

/**
 * Config Bundle 管理组合式函数
 */
export function useConfigBundle() {
  const { t } = useI18n()
  const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotify()
  
  // 状态
  const loading = ref(false)
  const configBundle = ref<ConfigBundleResponse | null>(null)
  const warnings = ref<ConfigBundleWarning[]>([])
  const versionCheck = ref<VersionCompatibilityResult | null>(null)
  
  // 计算属性
  const hasWarnings = computed(() => warnings.value.length > 0)
  const isVersionCompatible = computed(() => versionCheck.value?.compatible ?? true)
  const supportsConfigBundle = computed(() => {
    if (!versionCheck.value) return false
    return apiVersionService.supportsConfigBundle(versionCheck.value.current_back_api)
  })
  const supportsWarnings = computed(() => {
    if (!versionCheck.value) return false
    return apiVersionService.supportsWarningsField(versionCheck.value.current_back_api)
  })
  
  /**
   * 检查 API 版本兼容性
   */
  const checkVersionCompatibility = async () => {
    debug.log('🔧 [useConfigBundle] 检查 API 版本兼容性')
    
    try {
      const result = await apiVersionService.checkVersionCompatibility()
      versionCheck.value = result
      
      if (!result.compatible) {
        notifyWarning(t('common.version.incompatible') + ': ' + result.warnings.join(', '))
      }
      
      return result
    } catch (error: any) {
      debug.error('🔧 [useConfigBundle] 版本检查失败:', error)
      notifyError(t('common.version.versionCheckFailed'))
      throw error
    }
  }
  
  /**
   * 获取节点配置包
   * @param nodeId 节点ID
   */
  const getConfigBundle = async (nodeId: string) => {
    loading.value = true
    warnings.value = []
    
    try {
      debug.log(`🔧 [useConfigBundle] 获取节点 ${nodeId} 配置包`)
      
      const response = await configBundleService.getConfigBundle(nodeId)
      configBundle.value = response.data
      
      // 处理警告信息
      if (response.data.warnings) {
        warnings.value = response.data.warnings
        handleWarnings(response.data.warnings)
      }
      
      // 验证配置包完整性
      if (!configBundleService.isConfigBundleValid(response.data)) {
        notifyWarning(t('common.configBundle.invalidBundle'))
      } else {
        notifySuccess(t('common.configBundle.loadSuccess'))
      }
      
      debug.log(`🔧 [useConfigBundle] 节点 ${nodeId} 配置包获取成功`)
      return response.data
      
    } catch (error: any) {
      debug.error(`🔧 [useConfigBundle] 获取节点 ${nodeId} 配置包失败:`, error)
      notifyError(t('common.configBundle.loadFailed') + ': ' + (error?.message || '未知错误'))
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 处理配置包警告
   * @param configWarnings 警告列表
   */
  const handleWarnings = (configWarnings: ConfigBundleWarning[]) => {
    configWarnings.forEach(warning => {
      let message = warning.message
      
      switch (warning.type) {
        case 'missing_peer_key':
          message = `${t('common.configBundle.missingPeerKey')}: ${warning.node_id}`
          break
        case 'config_error':
          message = `${t('common.configBundle.configError')}: ${warning.message}`
          break
        case 'network_issue':
          message = `${t('common.configBundle.networkIssue')}: ${warning.message}`
          break
      }
      
      notifyWarning(message)
    })
  }
  
  /**
   * 发送心跳数据
   * @param nodeId 节点ID
   * @param heartbeat 心跳数据
   */
  const sendHeartbeat = async (nodeId: string, heartbeat: HeartbeatRequest) => {
    try {
      debug.log(`🔧 [useConfigBundle] 发送节点 ${nodeId} 心跳`)
      
      const response = await configBundleService.sendHeartbeat(nodeId, heartbeat)
      
      debug.log(`🔧 [useConfigBundle] 节点 ${nodeId} 心跳发送成功`)
      return response
      
    } catch (error: any) {
      debug.error(`🔧 [useConfigBundle] 节点 ${nodeId} 心跳发送失败:`, error)
      throw error
    }
  }
  
  /**
   * 清除当前配置包数据
   */
  const clearConfigBundle = () => {
    configBundle.value = null
    warnings.value = []
  }
  
  /**
   * 获取配置文件内容
   * @param fileName 配置文件名
   */
  const getConfigFile = (fileName: 'node.conf' | 'address.conf' | 'route.conf'): string | null => {
    if (!configBundle.value) return null
    return configBundle.value.files[fileName] || null
  }
  
  return {
    // 状态
    loading: readonly(loading),
    configBundle: readonly(configBundle),
    warnings: readonly(warnings),
    versionCheck: readonly(versionCheck),
    
    // 计算属性
    hasWarnings,
    isVersionCompatible,
    supportsConfigBundle,
    supportsWarnings,
    
    // 方法
    checkVersionCompatibility,
    getConfigBundle,
    sendHeartbeat,
    clearConfigBundle,
    getConfigFile,
    handleWarnings
  }
}