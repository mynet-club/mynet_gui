/**
 * API 版本兼容性检查服务 - v2.2.0
 * 确保 mynet_gui 客户端符合后端 API 版本要求
 */

import debug from 'src/utils/debug'
import { apiService } from '../api'

/**
 * API 版本信息
 */
export interface ApiVersionInfo {
  back_api: {
    version: string
    released_at: string
    changelog: string
    known_issues: string[]
  }
  ctl_api: {
    version: string
    released_at: string
    changelog: string
  }
  clients: {
    mynet_gui: {
      min_back_api: string
      min_ctl_api: string
      current: string
      status: string
    }
  }
}

/**
 * 版本兼容性检查结果
 */
export interface VersionCompatibilityResult {
  compatible: boolean
  current_back_api: string
  current_ctl_api: string
  required_back_api: string
  required_ctl_api: string
  warnings: string[]
  upgrade_required: boolean
}

/**
 * API 版本检查服务
 */
export class ApiVersionService {
  
  // 当前客户端版本
  private readonly CLIENT_VERSION = '2.2.0'
  
  // 最低要求的 API 版本
  private readonly MIN_BACK_API = '2.2.0'
  private readonly MIN_CTL_API = '1.0.0'
  
  /**
   * 检查 API 版本兼容性
   * @returns 兼容性检查结果
   */
  async checkVersionCompatibility(): Promise<VersionCompatibilityResult> {
    debug.log('🔧 [Version] 开始检查 API 版本兼容性')
    
    try {
      // 从 ctl.mynet.club 获取版本信息
      const versionInfo = await this.fetchVersionInfo()
      
      const result: VersionCompatibilityResult = {
        compatible: true,
        current_back_api: versionInfo.back_api.version,
        current_ctl_api: versionInfo.ctl_api.version,
        required_back_api: this.MIN_BACK_API,
        required_ctl_api: this.MIN_CTL_API,
        warnings: [],
        upgrade_required: false
      }
      
      // 检查 back_api 版本
      if (this.compareVersions(versionInfo.back_api.version, this.MIN_BACK_API) < 0) {
        result.compatible = false
        result.upgrade_required = true
        result.warnings.push(`后端 API 版本过低: ${versionInfo.back_api.version}，需要至少 ${this.MIN_BACK_API}`)
      }
      
      // 检查 ctl_api 版本
      if (this.compareVersions(versionInfo.ctl_api.version, this.MIN_CTL_API) < 0) {
        result.compatible = false
        result.upgrade_required = true
        result.warnings.push(`控制中心 API 版本过低: ${versionInfo.ctl_api.version}，需要至少 ${this.MIN_CTL_API}`)
      }
      
      // 检查客户端状态
      const clientInfo = versionInfo.clients.mynet_gui
      if (clientInfo.status.includes('需升级')) {
        result.warnings.push(`客户端需要升级: ${clientInfo.status}`)
      }
      
      if (result.compatible) {
        debug.log('🔧 [Version] API 版本兼容性检查通过')
      } else {
        debug.warn('🔧 [Version] API 版本兼容性检查失败:', result.warnings)
      }
      
      return result
      
    } catch (error: any) {
      debug.error('🔧 [Version] API 版本检查失败:', error)
      
      // 默认兼容，避免阻塞用户
      return {
        compatible: true,
        current_back_api: 'unknown',
        current_ctl_api: 'unknown', 
        required_back_api: this.MIN_BACK_API,
        required_ctl_api: this.MIN_CTL_API,
        warnings: ['无法获取 API 版本信息，使用默认兼容模式'],
        upgrade_required: false
      }
    }
  }
  
  /**
   * 从配置中心获取版本信息
   */
  private async fetchVersionInfo(): Promise<ApiVersionInfo> {
    const ctlBaseUrl = import.meta.env.PROD ? 'https://ctl.mynet.club' : 'http://localhost:8001'
    
    const response = await fetch(`${ctlBaseUrl}/d/docs/api-versions.json`)
    if (!response.ok) {
      throw new Error(`获取版本信息失败: ${response.status}`)
    }
    
    return await response.json()
  }
  
  /**
   * 比较版本号
   * @param version1 版本1
   * @param version2 版本2  
   * @returns -1: v1 < v2, 0: v1 = v2, 1: v1 > v2
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length)
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part < v2Part) return -1
      if (v1Part > v2Part) return 1
    }
    
    return 0
  }
  
  /**
   * 获取当前客户端版本
   */
  getClientVersion(): string {
    return this.CLIENT_VERSION
  }
  
  /**
   * 检查是否支持 config-bundle API
   */
  supportsConfigBundle(backApiVersion: string): boolean {
    return this.compareVersions(backApiVersion, '2.1.0') >= 0
  }
  
  /**
   * 检查是否支持 warnings 字段 
   */
  supportsWarningsField(backApiVersion: string): boolean {
    return this.compareVersions(backApiVersion, '2.2.0') >= 0
  }
}

// 创建服务实例
export const apiVersionService = new ApiVersionService()

// 默认导出
export default apiVersionService