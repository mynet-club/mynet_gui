import { api } from '../api'
import type { IPPool, IPPoolForm, IPPoolStatistics, IPAllocation } from '../../types/ippool'

export class IPPoolService {
  // 获取IP池列表
  static async getPools(params?: { zone_id?: string; status?: string; search?: string }) {
    const response = await api.get('/ippools', { params })
    return response.data
  }

  // 获取单个IP池详情
  static async getPool(poolId: string) {
    const response = await api.get(`/ippools/${poolId}`)
    return response.data
  }

  // 创建IP池
  static async createPool(poolData: IPPoolForm) {
    const response = await api.post('/ippools', poolData)
    return response.data
  }

  // 更新IP池
  static async updatePool(poolId: string, poolData: Partial<IPPoolForm>) {
    const response = await api.put(`/ippools/${poolId}`, poolData)
    return response.data
  }

  // 删除IP池
  static async deletePool(poolId: string) {
    const response = await api.delete(`/ippools/${poolId}`)
    return response.data
  }

  // 获取IP池统计信息
  static async getStatistics(params?: { zone_id?: string }) {
    const response = await api.get('/ippools/statistics', { params })
    return response.data
  }

  // 分配IP地址
  static async allocateIP(poolId: string, nodeId?: string) {
    const data = nodeId ? { node_id: nodeId } : {}
    const response = await api.post(`/ippools/${poolId}/allocate`, data)
    return response.data
  }

  // 释放IP地址
  static async releaseIP(poolId: string, ipAddress: string) {
    const response = await api.post(`/ippools/${poolId}/release`, { ip_address: ipAddress })
    return response.data
  }

  // 获取IP池分配记录
  static async getAllocations(poolId: string) {
    const response = await api.get(`/ippools/${poolId}/allocations`)
    return response.data
  }

  // 检查IP地址可用性
  static async checkIPAvailability(poolId: string, ipAddress: string) {
    const response = await api.get(`/ippools/${poolId}/check-ip`, {
      params: { ip: ipAddress }
    })
    return response.data
  }

  // 自动分配IP池
  static async autoAllocatePool(zoneId: string, size?: number) {
    const data = { zone_id: zoneId, ...(size && { size }) }
    const response = await api.post('/ippools/auto-allocate', data)
    return response.data
  }

  // 批量操作IP池
  static async batchOperation(operation: string, poolIds: string[]) {
    const response = await api.post('/ippools/batch', {
      operation,
      pool_ids: poolIds
    })
    return response.data
  }

  // 导出IP池数据
  static async exportPools(format: 'csv' | 'json' = 'csv', params?: any) {
    const response = await api.get('/ippools/export', {
      params: { format, ...params },
      responseType: 'blob'
    })
    return response.data
  }

  // 获取用户IP资源
  static async getUserIPResources(userId: string) {
    const response = await api.get(`/users/${userId}/ip-resources`)
    return response.data
  }

  // 工具方法：计算IP地址数量
  static calculateIPCount(startIP: string, endIP: string): number {
    const start = this.ipToNumber(startIP)
    const end = this.ipToNumber(endIP)
    return end - start + 1
  }

  // 工具方法：IP地址转数字
  static ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
  }

  // 工具方法：数字转IP地址
  static numberToIP(num: number): string {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.')
  }

  // 工具方法：验证IP地址格式
  static isValidIP(ip: string): boolean {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!pattern.test(ip)) return false
    
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part)
      return num >= 0 && num <= 255
    })
  }

  // 工具方法：验证IP地址范围
  static validateIPRange(startIP: string, endIP: string): boolean {
    if (!this.isValidIP(startIP) || !this.isValidIP(endIP)) return false
    
    const start = this.ipToNumber(startIP)
    const end = this.ipToNumber(endIP)
    return start <= end
  }

  // 工具方法：生成IP地址范围内的下一个IP
  static getNextIP(startIP: string, offset: number): string {
    const startNum = this.ipToNumber(startIP)
    const nextNum = startNum + offset
    return this.numberToIP(nextNum)
  }

  // 工具方法：检查IP地址是否在范围内
  static isIPInRange(ip: string, startIP: string, endIP: string): boolean {
    const ipNum = this.ipToNumber(ip)
    const startNum = this.ipToNumber(startIP)
    const endNum = this.ipToNumber(endIP)
    return ipNum >= startNum && ipNum <= endNum
  }

  // 工具方法：解析CIDR表示法
  static parseCIDR(cidr: string): { network: string; start: string; end: string; count: number } {
    const [networkIP, prefixLength] = cidr.split('/')
    
    if (!networkIP || !prefixLength) {
      throw new Error('Invalid CIDR format')
    }
    
    const prefix = parseInt(prefixLength)
    const hostBits = 32 - prefix
    const hostCount = Math.pow(2, hostBits)
    
    const networkNum = this.ipToNumber(networkIP)
    const mask = (0xFFFFFFFF << hostBits) >>> 0
    const networkStart = networkNum & mask
    const networkEnd = networkStart + hostCount - 1
    
    return {
      network: this.numberToIP(networkStart),
      start: this.numberToIP(networkStart + 1), // 跳过网络地址
      end: this.numberToIP(networkEnd - 1),     // 跳过广播地址
      count: hostCount - 2                      // 减去网络地址和广播地址
    }
  }

  // 工具方法：生成可用的IP地址列表
  static generateIPList(startIP: string, endIP: string, excludeIPs: string[] = []): string[] {
    const start = this.ipToNumber(startIP)
    const end = this.ipToNumber(endIP)
    const excludeSet = new Set(excludeIPs)
    const ipList: string[] = []
    
    for (let i = start; i <= end; i++) {
      const ip = this.numberToIP(i)
      if (!excludeSet.has(ip)) {
        ipList.push(ip)
      }
    }
    
    return ipList
  }
}

export default IPPoolService
