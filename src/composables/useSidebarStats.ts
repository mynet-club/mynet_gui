import { ref, computed } from 'vue'
import debug from 'src/utils/debug'
import { apiService } from '../services/api'

export interface SidebarStats {
  nodes: number
  ippools: number
  routes: number
  connections: number
  tenants: number
}

export function useSidebarStats() {
  const stats = ref<SidebarStats>({
    nodes: 0,
    ippools: 0,
    routes: 0,
    connections: 0,
    tenants: 0
  })

  const isLoading = ref(false)

  // 获取统计数据
  const fetchStats = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      // 这里应该调用真实的API获取统计数据
      // 现在使用模拟数据，但添加防抖机制
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 生成相对稳定的模拟数据，避免过于频繁的变化
      const baseTime = Math.floor(Date.now() / 30000) // 30秒为一个周期
      const seedValue = baseTime % 100
      
      stats.value = {
        nodes: Math.floor((seedValue * 0.5) % 50) + 10,
        ippools: Math.floor((seedValue * 0.2) % 20) + 5,
        routes: Math.floor((seedValue * 1.0) % 100) + 20,
        connections: Math.floor((seedValue * 2.0) % 200) + 50,
        tenants: Math.floor((seedValue * 0.1) % 10) + 3
      }
      
      debug.log('📊 [SidebarStats] Updated stats:', stats.value)
    } catch (error) {
      debug.error('Failed to fetch sidebar stats:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 计算属性
  const totalItems = computed(() => {
    return stats.value.nodes + stats.value.ippools + stats.value.routes + stats.value.connections + stats.value.tenants
  })

  const hasData = computed(() => {
    return totalItems.value > 0
  })

  // 初始化
  const init = async () => {
    await fetchStats()
    
    // 增加更新间隔到60秒，减少频繁更新
    setInterval(fetchStats, 60000)
  }

  return {
    stats,
    isLoading,
    totalItems,
    hasData,
    fetchStats,
    init
  }
}
