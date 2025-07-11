/**
 * VPN配置相关的组合式函数
 */

import { ref, computed, reactive } from 'vue'
import { VPNConfigService } from '../services/vpnConfigService'
import { NodeConfigForm } from '../types/vpnConfig'

export function useVpnConfig() {
  // 状态
  const loading = ref(false)
  const saving = ref(false)
  const configs = ref<Record<string, NodeConfigForm>>({})
  
  // 方法
  const loadNodeConfig = async (nodeId: string): Promise<NodeConfigForm | null> => {
    loading.value = true
    try {
      // 这里应该调用实际的API
      // const response = await api.get(`/nodes/${nodeId}/config`)
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 自动检测VPN类型
      const vpnType = VPNConfigService.detectVpnType(nodeId)
      
      // 返回默认配置
      const defaultConfig: NodeConfigForm = {
        vpn_type: vpnType,
        vpn_version: 'default',
        config_mode: 'base',
        parameters: {}
      }
      
      configs.value[nodeId] = defaultConfig
      return defaultConfig
      
    } catch (error) {
      console.error('加载节点配置失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  const saveNodeConfig = async (nodeId: string, config: NodeConfigForm): Promise<boolean> => {
    saving.value = true
    try {
      // 验证配置
      const validation = VPNConfigService.validateConfig(
        config.vpn_type,
        config.vpn_version,
        config.config_mode,
        config.parameters
      )
      
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`)
      }
      
      // 这里应该调用实际的API
      // await api.put(`/nodes/${nodeId}/config`, config)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      configs.value[nodeId] = config
      return true
      
    } catch (error) {
      console.error('保存节点配置失败:', error)
      throw error
    } finally {
      saving.value = false
    }
  }
  
  const exportConfig = (nodeId: string): string => {
    const config = configs.value[nodeId]
    if (!config) return ''
    
    return VPNConfigService.generateConfigFile(config)
  }
  
  const validateConfig = (config: NodeConfigForm) => {
    return VPNConfigService.validateConfig(
      config.vpn_type,
      config.vpn_version,
      config.config_mode,
      config.parameters
    )
  }
  
  const detectVpnType = (nodeId: string) => {
    return VPNConfigService.detectVpnType(nodeId)
  }
  
  const getPortRange = (vpnType: 'gnb' | 'wireguard') => {
    return VPNConfigService.getPortRange(vpnType)
  }
  
  return {
    // 状态
    loading: readonly(loading),
    saving: readonly(saving),
    configs: readonly(configs),
    
    // 方法
    loadNodeConfig,
    saveNodeConfig,
    exportConfig,
    validateConfig,
    detectVpnType,
    getPortRange
  }
}

// 导入readonly函数
import { readonly } from 'vue'
