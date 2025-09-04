import { reactive, ref, computed } from 'vue'
import { api } from '../services/api'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import type { 
  IPPool, 
  IPPoolStatistics, 
  IPAllocation, 
  IPPoolForm, 
  IPPoolFilters,
  UserIPResources,
  IPPoolCreateResponse,
  IPPoolCreateAdvancedRequest
} from '../types/ippool'

export function useIPPools() {
  const { t } = useI18n()
  const { success: notifySuccess, error: notifyError } = useNotify()

  // 响应式数据
  const pools = ref<IPPool[]>([])
  const statistics = ref<IPPoolStatistics>({
    total_pools: 0,
    allocated_pools: 0,
    available_pools: 0,
    total_ips: 0,
    allocated_ips: 0,
    available_ips: 0,
    active_ips: 0,
    free_ips: 0,
    user_quota: 0,
    usage_percentage: 0
  })
  const allocations = ref<IPAllocation[]>([])
  const loading = ref(false)
  const filters = reactive<IPPoolFilters>({
    zone_id: '',
    status: 'all',
    search: ''
  })

  // 创建相关的响应式数据
  const createLoading = ref(false)

  // 计算属性
  const filteredPools = computed(() => {
    let result = pools.value

    // 按Zone过滤
    if (filters.zone_id) {
      result = result.filter(pool => pool.zone_id === filters.zone_id)
    }

    // 按状态过滤
    if (filters.status !== 'all') {
      result = result.filter(pool => pool.status === filters.status)
    }

    // 按搜索关键词过滤
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(pool => 
        pool.name?.toLowerCase().includes(search) ||
        pool.network?.toLowerCase().includes(search) ||
        pool.ip_range.start.includes(search) ||
        pool.ip_range.end.includes(search)
      )
    }

    return result
  })

  const poolsUsageRate = computed(() => {
    if (statistics.value.total_ips === 0) return 0
    return Math.round((statistics.value.allocated_ips / statistics.value.total_ips) * 100)
  })

  // IP池管理方法
  const fetchPools = async (zoneId?: string) => {
    loading.value = true
    try {
      const params = zoneId ? { zone_id: zoneId } : {}
      const response = await api.get('/ippools', { params })
      
      console.log('fetchPools API response:', response.data)
      
      // 处理API响应格式
      if (response.data.success) {
        // API返回的数据在 response.data.data 中（是一个数组）
        const rawPoolsData = response.data.data || []
        
        // 转换API数据格式到我们的类型
        const poolsData = rawPoolsData.map((pool: any) => ({
          id: pool.id.toString(),
          sequence_number: pool.sequence_number, // 保存序列号用于删除
          name: `IP池 ${pool.sequence_number}`, // 生成名称
          network: '', // API中没有network字段，暂时留空
          ip_range: {
            start: pool.ip_start,
            end: pool.ip_end
          },
          zone_id: pool.zone_id.toString(),
          user_id: pool.user_id?.toString(),
          total_ips: pool.ip_count,
          used_ips: pool.is_allocated ? pool.ip_count : 0, // 如果已分配，则全部使用
          available_ips: pool.is_allocated ? 0 : pool.ip_count, // 如果已分配，则无可用
          status: pool.status_text,
          is_allocated: pool.is_allocated,
          created_at: pool.created_at,
          updated_at: pool.updated_at
        }))
        
        pools.value = poolsData
        console.log('pools.value updated:', pools.value)
        
        // 获取数据后自动计算统计信息
        calculateStatisticsFromPools()
      } else {
        console.warn('fetchPools API failed:', response.data.message)
        pools.value = []
        notifyError(response.data.message || t('ippools.fetchError'))
      }
      
      return response.data
    } catch (error) {
      console.error('fetchPools error:', error)
      pools.value = []
      notifyError(t('ippools.fetchError'))
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchPoolById = async (poolId: string) => {
    try {
      const response = await api.get(`/ippools/${poolId}`)
      
      if (response.data.success) {
        return response.data.data.ippool
      } else {
        notifyError(response.data.message || t('ippools.fetchPoolError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.fetchPoolError'))
      throw error
    }
  }

  const createPool = async (poolData: IPPoolForm) => {
    try {
      const response = await api.post('/ippools', poolData)
      
      if (response.data.success) {
        notifySuccess(t('ippools.createSuccess'))
        await fetchPools()
        return response.data.data.ippool
      } else {
        notifyError(response.data.message || t('ippools.createError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.createError'))
      throw error
    }
  }

  const updatePool = async (poolId: string, poolData: Partial<IPPoolForm>) => {
    try {
      const response = await api.put(`/ippools/${poolId}`, poolData)
      
      if (response.data.success) {
        notifySuccess(t('ippools.updateSuccess'))
        await fetchPools()
        return response.data.data.ippool
      } else {
        notifyError(response.data.message || t('ippools.updateError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.updateError'))
      throw error
    }
  }

  const deletePool = async (poolId: string, sequenceNumber?: number) => {
    try {
      // 优先使用sequence_number，如果没有则使用poolId
      const identifier = sequenceNumber || poolId
      const response = await api.delete(`/ippools/${identifier}`)
      
      if (response.data.success) {
        notifySuccess(t('ippools.deleteSuccess'))
        await fetchPools()
      } else {
        notifyError(response.data.message || t('ippools.deleteError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.deleteError'))
      throw error
    }
  }

  // IP分配方法
  const allocateIP = async (poolId: string, nodeId?: string) => {
    try {
      const requestData = nodeId ? { node_id: nodeId } : {}
      const response = await api.post(`/ippools/${poolId}/allocate`, requestData)
      
      if (response.data.success) {
        notifySuccess(t('ippools.allocateSuccess'))
        await fetchPools()
        return response.data.data.allocation
      } else {
        notifyError(response.data.message || t('ippools.allocateError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.allocateError'))
      throw error
    }
  }

  const releaseIP = async (poolId: string, ipAddress: string) => {
    try {
      const response = await api.post(`/ippools/${poolId}/release`, { ip_address: ipAddress })
      
      if (response.data.success) {
        notifySuccess(t('ippools.releaseSuccess'))
        await fetchPools()
      } else {
        notifyError(response.data.message || t('ippools.releaseError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.releaseError'))
      throw error
    }
  }

  const fetchAllocations = async (poolId: string) => {
    try {
      const response = await api.get(`/ippools/${poolId}/allocations`)
      
      if (response.data.success) {
        allocations.value = response.data.data.allocations || []
        return response.data.data
      } else {
        allocations.value = []
        notifyError(response.data.message || t('ippools.fetchAllocationsError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.fetchAllocationsError'))
      throw error
    }
  }

  const checkIPAvailability = async (poolId: string, ipAddress: string) => {
    try {
      const response = await api.get(`/ippools/${poolId}/check-ip`, {
        params: { ip: ipAddress }
      })
      
      if (response.data.success) {
        return response.data.data.available
      } else {
        notifyError(response.data.message || t('ippools.checkIPError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.checkIPError'))
      throw error
    }
  }

  // 统计信息方法
  const fetchStatistics = async (zoneId?: string) => {
    try {
      const params = zoneId ? { zone_id: zoneId } : {}
      const response = await api.get('/ippools/statistics', { params })
      
      if (response.data.success) {
        // API返回的数据在 response.data.data 中
        const apiData = response.data.data
        
        // 映射API返回的字段到我们的统计结构
        statistics.value = {
          zone_id: apiData.zone_id,
          user_id: apiData.user_id,
          total_pools: apiData.total_pools || 0,
          allocated_pools: apiData.allocated_pools || 0,
          available_pools: apiData.available_pools || 0,
          total_ips: apiData.total_ips || 0,
          allocated_ips: apiData.allocated_ips || 0,
          available_ips: apiData.available_ips || 0,
          active_ips: apiData.active_ips || 0,
          free_ips: apiData.free_ips || 0,
          user_quota: apiData.user_quota || 0,
          usage_percentage: apiData.usage_percentage || 0
        }
        
        console.log('Statistics fetched from API:', statistics.value)
        return response.data.data
      } else {
        // 如果统计API失败，从IP池数据中计算统计信息
        calculateStatisticsFromPools()
        return { statistics: statistics.value }
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      // 如果统计API失败，从IP池数据中计算统计信息
      calculateStatisticsFromPools()
      return { statistics: statistics.value }
    }
  }

  // 从IP池数据计算统计信息
  const calculateStatisticsFromPools = () => {
    const poolsToCalculate = pools.value || []
    
    console.log('calculateStatisticsFromPools called with pools:', poolsToCalculate)
    
    const totalPools = poolsToCalculate.length
    const allocatedPools = poolsToCalculate.filter(pool => pool.status === 'allocated').length
    const availablePools = poolsToCalculate.filter(pool => pool.status === 'available').length
    const totalIPs = poolsToCalculate.reduce((sum, pool) => sum + (pool.total_ips || 0), 0)
    const allocatedIPs = poolsToCalculate.reduce((sum, pool) => sum + (pool.used_ips || 0), 0)
    const availableIPs = poolsToCalculate.reduce((sum, pool) => sum + (pool.available_ips || 0), 0)
    
    statistics.value = {
      total_pools: totalPools,
      allocated_pools: allocatedPools,
      available_pools: availablePools,
      total_ips: totalIPs,
      allocated_ips: allocatedIPs,
      available_ips: availableIPs,
      active_ips: allocatedIPs, // 假设 active_ips 等于 allocated_ips
      free_ips: availableIPs,
      user_quota: 0,
      usage_percentage: totalIPs > 0 ? Math.round((allocatedIPs / totalIPs) * 100) : 0
    }
    
    console.log('calculated statistics:', statistics.value)
  }

  const fetchUserResources = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/ip-resources`)
      
      if (response.data.success) {
        return response.data.data.resources as UserIPResources
      } else {
        notifyError(response.data.message || t('ippools.fetchUserResourcesError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.fetchUserResourcesError'))
      throw error
    }
  }

  // 批量操作方法
  const batchOperations = async (operation: string, poolIds: string[]) => {
    try {
      const response = await api.post('/ippools/batch', {
        operation,
        pool_ids: poolIds
      })
      
      if (response.data.success) {
        notifySuccess(t('ippools.batchOperationSuccess'))
        await fetchPools()
        return response.data.data
      } else {
        notifyError(response.data.message || t('ippools.batchOperationError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.batchOperationError'))
      throw error
    }
  }

  const exportPools = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await api.get('/ippools/export', {
        params: { format },
        responseType: 'blob'
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ippools_export_${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      notifySuccess(t('ippools.exportSuccess'))
    } catch (error) {
      notifyError(t('ippools.exportError'))
      throw error
    }
  }

  // 工具方法
  const calculateIPCount = (startIP: string, endIP: string): number => {
    const start = ipToNumber(startIP)
    const end = ipToNumber(endIP)
    return end - start + 1
  }

  const ipToNumber = (ip: string): number => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
  }

  const validateIPRange = (startIP: string, endIP: string): boolean => {
    const start = ipToNumber(startIP)
    const end = ipToNumber(endIP)
    return start <= end
  }

  const isValidIP = (ip: string): boolean => {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!pattern.test(ip)) return false
    
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part)
      return num >= 0 && num <= 255
    })
  }

  // 清理方法
  const resetFilters = () => {
    filters.zone_id = ''
    filters.status = 'all'
    filters.search = ''
  }

  // IP池创建相关方法（适配新API返回格式）
  const createPoolAdvanced = async (
    groupCount: number = 1,
    preferContinuous: boolean = false,
    targetPoolSequence?: number,
    purpose: string = "server_cluster",
    notes?: string
  ): Promise<IPPool[]> => {
    createLoading.value = true
    try {
      const requestData: IPPoolCreateAdvancedRequest = {
        group_count: groupCount,
        purpose: purpose,
        prefer_continuous: preferContinuous
      }
      
      // 添加可选参数
      if (notes) {
        requestData.notes = notes
      }
      
      if (preferContinuous && targetPoolSequence) {
        requestData.targetPoolSequence = targetPoolSequence
      }
      
      const response = await api.post('/ippools', requestData)
      
      if (response.data.success) {
        const createResponse: IPPoolCreateResponse = response.data
        const allocatedGroups = createResponse.data.allocated_groups
        
        // 将新API返回的数据转换为IPPool格式
        const createdPools: IPPool[] = allocatedGroups.map(group => {
          // 从IP列表中提取起始和结束IP
          const ips = group.ips
          const startIp = ips[0] || ''
          const endIp = ips[ips.length - 1] || ''
          const ipCount = group.ip_count
          
          const poolData: IPPool = {
            id: group.sequence.toString(),
            sequence_number: group.sequence,
            ip_group_sequence_number: group.sequence,
            zone_id: createResponse.data.zone_id.toString(),
            user_id: createResponse.data.user_id.toString(),
            name: `IP池 ${group.sequence}`,
            ip_range: {
              start: startIp,
              end: endIp
            },
            ip_start: startIp,
            ip_end: endIp,
            status: 'allocated',
            is_allocated: true,
            allocated_at: createResponse.timestamp,
            created_at: createResponse.timestamp,
            updated_at: createResponse.timestamp,
            // IP数量信息
            ip_count: ipCount,
            total_ips: ipCount,
            used_ips: 0,
            available_ips: ipCount
          }
          
          // 添加可选字段
          if (purpose) {
            poolData.purpose = purpose
          }
          if (notes) {
            poolData.notes = notes
          }
          
          return poolData
        })
        
        // 检查两个IP池的IP范围是否连续
        const checkIPRangeContinuity = (pool1: IPPool, pool2: IPPool): boolean => {
          const pool1End = ipToNumber(pool1.ip_range.end)
          const pool2Start = ipToNumber(pool2.ip_range.start)
          return pool2Start === pool1End + 1
        }

        // 检查整体连续性（基于最新的池列表）
        const checkOverallContinuity = (targetSequence?: number, newlyCreatedPools: IPPool[] = []): boolean => {
          if (!targetSequence) {
            // 如果没有目标池，只检查新创建的池之间是否连续
            if (newlyCreatedPools.length <= 1) return true
            const sortedNewPools = [...newlyCreatedPools].sort((a, b) => ipToNumber(a.ip_range.start) - ipToNumber(b.ip_range.start))
            for (let i = 1; i < sortedNewPools.length; i++) {
              const prevPool = sortedNewPools[i-1]
              const currentPool = sortedNewPools[i]
              if (prevPool && currentPool && !checkIPRangeContinuity(prevPool, currentPool)) {
                return false
              }
            }
            return true
          }

          // 有目标池的情况：检查目标池与新创建的池是否连续
          const targetPool = pools.value.find(p => p.sequence_number === targetSequence)
          if (!targetPool || newlyCreatedPools.length === 0) return false

          // 将目标池和新创建的池合并，按IP地址排序
          const allPools = [targetPool, ...newlyCreatedPools].sort((a, b) => ipToNumber(a.ip_range.start) - ipToNumber(b.ip_range.start))
          
          // 检查相邻池之间是否连续
          for (let i = 1; i < allPools.length; i++) {
            const prevPool = allPools[i-1]
            const currentPool = allPools[i]
            if (prevPool && currentPool && !checkIPRangeContinuity(prevPool, currentPool)) {
              console.log(`连续性检查失败: ${prevPool.ip_range.end} 与 ${currentPool.ip_range.start} 不连续`)
              return false
            }
          }
          
          console.log('连续性检查通过:', allPools.map(p => `${p.ip_range.start}-${p.ip_range.end}`).join(' -> '))
          return true
        }

        // 先刷新池列表，然后再检查连续性
        await fetchPools()
        await fetchStatistics()
        
        // 检查连续性（仅在用户要求连续时检查）
        if (preferContinuous) {
          // 重新检查连续性，基于最新的池列表
          const isContinuous = checkOverallContinuity(targetPoolSequence, createdPools)
          const poolInfo = createdPools.map(p => `序列号 ${p.sequence_number} (${p.ip_range.start}-${p.ip_range.end})`).join(', ')
          if (!isContinuous) {
            // 创建成功但不连续，给出警告而不是错误
            console.warn('IP池创建成功，但未能实现连续分配:', poolInfo)
            notifySuccess(`${t('ippools.createSuccess')} - ${t('ippools.continuityWarning')}`)
          } else {
            console.log('IP池创建成功，实现连续分配:', poolInfo)
            notifySuccess(t('ippools.createSuccess'))
          }
        } else {
          const poolInfo = createdPools.map(p => `序列号 ${p.sequence_number} (${p.ip_range.start}-${p.ip_range.end})`).join(', ')
          console.log('IP池创建成功:', poolInfo)
          notifySuccess(t('ippools.createSuccess'))
        }
        
        return createdPools
      } else {
        notifyError(response.data.message || t('ippools.createError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('IP池创建失败:', error)
      notifyError(t('ippools.createError'))
      throw error
    } finally {
      createLoading.value = false
    }
  }

  // 辅助函数：将数字转换为IP地址字符串
  const numberToIP = (num: number): string => {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.')
  }

  const extendPool = async (poolId: string, additionalSize: number): Promise<IPPool> => {
    createLoading.value = true
    try {
      const response = await api.post(`/ippools/${poolId}/extend`, {
        size: additionalSize
      })
      
      if (response.data.success) {
        notifySuccess(t('ippools.extendSuccess'))
        await fetchPools()
        await fetchStatistics()
        return response.data.data
      } else {
        notifyError(response.data.message || t('ippools.extendError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      notifyError(t('ippools.extendError'))
      throw error
    } finally {
      createLoading.value = false
    }
  }

  return {
    // 响应式数据
    pools,
    statistics,
    allocations,
    loading,
    filters,
    
    // 创建相关的响应式数据
    createLoading,
    
    // 计算属性
    filteredPools,
    poolsUsageRate,
    
    // IP池管理方法
    fetchPools,
    fetchPoolById,
    createPool,
    updatePool,
    deletePool,
    
    // IP池创建相关方法
    createPoolAdvanced,
    autoAllocatePool: createPoolAdvanced, // 保持向后兼容
    extendPool,
    
    // IP分配方法
    allocateIP,
    releaseIP,
    fetchAllocations,
    checkIPAvailability,
    
    // 统计信息方法
    fetchStatistics,
    calculateStatisticsFromPools,
    fetchUserResources,
    
    // 批量操作方法
    batchOperations,
    exportPools,
    
    // 工具方法
    calculateIPCount,
    validateIPRange,
    isValidIP,
    numberToIP,
    resetFilters
  }
}
