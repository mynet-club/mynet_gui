import { reactive, ref, computed } from 'vue'
import debug from 'src/utils/debug'
import { api } from '../services/api'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import type { 
  IPPool, 
  IPPoolStatistics, 
  IPPoolFilters,
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
  const fetchPools = async (tenantId?: string) => {
    loading.value = true
    try {
      const params = tenantId ? { zone_id: tenantId } : {}
      const response = await api.get('/ippools', { params })
      
      debug.log('fetchPools API response:', response.data)
      
      // 处理API响应格式
      if (response.data.success) {
        // API返回的数据在 response.data.data 中（是一个数组）
        const rawPoolsData = response.data.data || []
        
        // 转换API数据格式到我们的类型
        const poolsData = rawPoolsData.map((pool: any) => ({
          // ⚠️ API 的主键是 ippool_id、租户是 tenant_id，前端类型是 id/zone_id。
          // 只按 id 取会 undefined.toString() —— 实测进 IP 池页就炸。
          id: String(pool.id ?? pool.ippool_id ?? ''),
          ippool_id: pool.ippool_id,
          sequence_number: pool.sequence_number, // 保存序列号用于删除
          name: `IP池 ${pool.sequence_number}`, // 生成名称
          network: '', // API中没有network字段，暂时留空
          ip_range: {
            start: pool.ip_start,
            end: pool.ip_end
          },
          zone_id: String(pool.zone_id ?? pool.tenant_id ?? ''),
          user_id: pool.user_id != null ? String(pool.user_id) : undefined,
          total_ips: pool.ip_statistics?.capacity || pool.ip_count || 0, // 优先使用统计数据
          used_ips: pool.ip_statistics?.consumed || 0, // 使用统计中的已消耗数量
          available_ips: pool.ip_statistics?.available || pool.ip_count || 0, // 使用统计中的可用数量
          status: pool.status_text,
          is_allocated: pool.is_allocated,
          created_at: pool.created_at,
          updated_at: pool.updated_at,
          // 新增字段：保存分配的IP详情（可选）
          allocated_ips: pool.allocated_ips || [],
          ip_statistics: pool.ip_statistics
        }))
        
        pools.value = poolsData
        debug.log('pools.value updated:', pools.value)
        
        // 获取数据后自动计算统计信息
        calculateStatisticsFromPools()
      } else {
        debug.warn('fetchPools API failed:', response.data.message)
        pools.value = []
        notifyError(response.data.message || t('ippools.fetchError'))
      }
      
      return response.data
    } catch (error) {
      debug.error('fetchPools error:', error)
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

  /**
   * 删除 IP 池 —— 后端是 `DELETE /ippools/{sequence}`（IPPoolController::release），
   * {sequence} 只认**序号**（数字）。原先「无序号就回退 poolId」把 16 位全局 ID
   * 发进 {sequence} 槽：纯数字 poolId 能过路由正则，按序号查不到行 → 404/误删
   * 同序号池。缺序号直接报错，不再猜。
   */
  const deletePool = async (sequenceNumber?: number) => {
    if (!sequenceNumber) {
      notifyError(t('ippools.deleteError'))
      throw new Error('sequence_number is required to delete an IP pool')
    }
    try {
      const response = await api.delete(`/ippools/${sequenceNumber}`)
      
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

  // 统计信息方法
  const fetchStatistics = async (tenantId?: string) => {
    try {
      const params = tenantId ? { zone_id: tenantId } : {}
      const response = await api.get('/ippools/statistics', { params })
      
      if (response.data.success) {
        // API返回的数据在 response.data.data 中
        const apiData = response.data.data
        
        // 映射API返回的字段到我们的统计结构
        statistics.value = {
          zone_id: apiData.zone_id,
          user_id: apiData.user_id,
          total_pools: apiData.pools_allocated || 0,
          allocated_pools: apiData.pools_allocated || 0,
          available_pools: apiData.pools_remaining || 0,
          total_ips: apiData.ips_total_capacity || 0,
          allocated_ips: apiData.ips_consumed || 0,
          available_ips: apiData.ips_available || 0,
          active_ips: apiData.ips_consumed || 0,
          free_ips: apiData.ips_available || 0,
          user_quota: apiData.pools_quota || 3,
          usage_percentage: apiData.pools_usage_percentage || 0
        }
        
        debug.log('Statistics fetched from API:', statistics.value)
        return response.data.data
      } else {
        // 如果统计API失败，从IP池数据中计算统计信息
        calculateStatisticsFromPools()
        return { statistics: statistics.value }
      }
    } catch (error) {
      debug.error('Failed to fetch statistics:', error)
      // 如果统计API失败，从IP池数据中计算统计信息
      calculateStatisticsFromPools()
      return { statistics: statistics.value }
    }
  }

  // 从IP池数据计算统计信息
  const calculateStatisticsFromPools = () => {
    const poolsToCalculate = pools.value || []
    
    debug.log('calculateStatisticsFromPools called with pools:', poolsToCalculate)
    
    const totalPools = poolsToCalculate.length
    const allocatedPools = poolsToCalculate.filter(pool => pool.is_allocated).length
    const availablePools = poolsToCalculate.filter(pool => !pool.is_allocated).length
    const totalIPs = poolsToCalculate.reduce((sum, pool) => sum + (pool.total_ips || pool.ip_count || 0), 0)
    const allocatedIPs = poolsToCalculate.reduce((sum, pool) => sum + (pool.used_ips || 0), 0)
    const availableIPs = poolsToCalculate.reduce((sum, pool) => sum + (pool.available_ips || 0), 0)
    
    const userQuota = 3 // 默认配额为3个IP池
    const remainingPools = Math.max(0, userQuota - totalPools)
    
    statistics.value = {
      total_pools: totalPools,
      allocated_pools: allocatedPools,
      available_pools: remainingPools, // 这里显示剩余可创建的池数量
      total_ips: totalIPs,
      allocated_ips: allocatedIPs,
      available_ips: availableIPs,
      active_ips: allocatedIPs, // 假设 active_ips 等于 allocated_ips
      free_ips: availableIPs,
      user_quota: userQuota,
      usage_percentage: userQuota > 0 ? Math.round((totalPools / userQuota) * 100) : 0
    }
    
    debug.log('calculated statistics:', statistics.value)
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
    purpose: string = 'server_cluster',
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
            id: String(group.sequence ?? ''),
            sequence_number: group.sequence,
            ip_group_sequence_number: group.sequence,
            zone_id: String(createResponse.data.zone_id ?? createResponse.data.tenant_id ?? ''),
            user_id: String(createResponse.data.user_id ?? ''),
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
        
        // 连续性只看**序号**（不看 IP 位置）：相邻池的序号必须首尾相接。
        // 序号连续在同一 /24 内等价于 IP 段相接；跨 /24 边界（序号 40→41）IP 不相接，
        // 但序号仍连续 —— 那是寻址方案本身的空洞，不该被当成「未连续」。
        const checkSequenceContinuity = (pool1: IPPool, pool2: IPPool): boolean => {
          return (pool2.sequence_number ?? 0) === (pool1.sequence_number ?? 0) + 1
        }

        const bySequence = (a: IPPool, b: IPPool): number => (a.sequence_number ?? 0) - (b.sequence_number ?? 0)

        // 检查整体连续性（基于最新的池列表）
        const checkOverallContinuity = (targetSequence?: number, newlyCreatedPools: IPPool[] = []): boolean => {
          if (!targetSequence) {
            // 如果没有目标池，只检查新创建的池之间是否连续
            if (newlyCreatedPools.length <= 1) return true
            const sortedNewPools = [...newlyCreatedPools].sort(bySequence)
            for (let i = 1; i < sortedNewPools.length; i++) {
              const prevPool = sortedNewPools[i-1]
              const currentPool = sortedNewPools[i]
              if (prevPool && currentPool && !checkSequenceContinuity(prevPool, currentPool)) {
                return false
              }
            }
            return true
          }

          // 有目标池的情况：检查目标池与新创建的池是否连续
          const targetPool = pools.value.find(p => p.sequence_number === targetSequence)
          if (!targetPool || newlyCreatedPools.length === 0) return false

          // 将目标池和新创建的池合并，按序号排序
          const allPools = [targetPool, ...newlyCreatedPools].sort(bySequence)

          // 检查相邻池之间是否连续
          for (let i = 1; i < allPools.length; i++) {
            const prevPool = allPools[i-1]
            const currentPool = allPools[i]
            if (prevPool && currentPool && !checkSequenceContinuity(prevPool, currentPool)) {
              debug.log(`连续性检查失败: 序号 ${prevPool.sequence_number} 与 ${currentPool.sequence_number} 不连续`)
              return false
            }
          }

          debug.log('连续性检查通过:', allPools.map(p => `序号 ${p.sequence_number}`).join(' -> '))
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
            debug.warn('IP池创建成功，但未能实现连续分配:', poolInfo)
            notifySuccess(`${t('ippools.createSuccess')} - ${t('ippools.continuityWarning')}`)
          } else {
            debug.log('IP池创建成功，实现连续分配:', poolInfo)
            notifySuccess(t('ippools.createSuccess'))
          }
        } else {
          const poolInfo = createdPools.map(p => `序列号 ${p.sequence_number} (${p.ip_range.start}-${p.ip_range.end})`).join(', ')
          debug.log('IP池创建成功:', poolInfo)
          notifySuccess(t('ippools.createSuccess'))
        }
        
        return createdPools
      } else {
        notifyError(response.data.message || t('ippools.createError'))
        throw new Error(response.data.message)
      }
    } catch (error) {
      debug.error('IP池创建失败:', error)
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

  return {
    // 响应式数据
    pools,
    statistics,
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
    deletePool,
    
    // IP池创建相关方法
    createPoolAdvanced,
    autoAllocatePool: createPoolAdvanced, // 保持向后兼容

    // 统计信息方法
    fetchStatistics,
    calculateStatisticsFromPools,

    // 工具方法
    numberToIP,
    resetFilters
  }
}
