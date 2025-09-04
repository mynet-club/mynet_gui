import { ref, computed } from 'vue'
import { apiService } from '../services/api'

export interface SidebarStats {
  nodes: number
  ippools: number
  routes: number
  connections: number
  zones: number
}

export function useSidebarStats() {
  const stats = ref<SidebarStats>({
    nodes: 0,
    ippools: 0,
    routes: 0,
    connections: 0,
    zones: 0
  })

  const isLoading = ref(false)

  // 获取统计数据
  const fetchStats = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      // 这里应该调用真实的API获取统计数据
      // 现在使用模拟数据
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      stats.value = {
        nodes: Math.floor(Math.random() * 50) + 10,
        ippools: Math.floor(Math.random() * 20) + 5,
        routes: Math.floor(Math.random() * 100) + 20,
        connections: Math.floor(Math.random() * 200) + 50,
        zones: Math.floor(Math.random() * 10) + 3
      }
      
      console.log('📊 [SidebarStats] Updated stats:', stats.value)
    } catch (error) {
      console.error('Failed to fetch sidebar stats:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 计算属性
  const totalItems = computed(() => {
    return stats.value.nodes + stats.value.ippools + stats.value.routes + stats.value.connections + stats.value.zones
  })

  const hasData = computed(() => {
    return totalItems.value > 0
  })

  // 初始化
  const init = async () => {
    await fetchStats()
    
    // 每30秒更新一次统计数据
    setInterval(fetchStats, 30000)
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
