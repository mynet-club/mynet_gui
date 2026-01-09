/**
 * 推荐系统组合式函数
 */

import { ref, computed } from 'vue'
import { UserStateAnalyzer } from '../services/recommendations/UserStateAnalyzer'
import { RecommendationEngine, type RecommendedAction } from '../services/recommendations/RecommendationEngine'
import { useNodes } from './useNodes'
import { useRoutes } from './useRoutes'
import { useIPPools } from './useIPPools'

export function useRecommendations() {
  const { nodes, loadNodes } = useNodes()
  const { overview, pendingConnections, friendNodes, fetchOverview } = useRoutes()
  const { pools, fetchPools } = useIPPools()

  const isAnalyzing = ref(false)

  /**
   * 分析用户状态
   */
  const analyzeUserState = () => {
    return UserStateAnalyzer.analyzeUserState({
      ipPools: pools.value || [],
      nodes: [...(nodes.value || [])],
      friends: friendNodes.value || [],
      routes: [], // TODO: 从routes获取
      connections: [], // TODO: 从API获取connections
      services: [] // TODO: 服务管理功能待开发
    })
  }

  /**
   * 当前用户状态
   */
  const currentState = computed(() => {
    return analyzeUserState()
  })

  /**
   * 推荐的行动（已去重和排序）
   */
  const recommendations = computed(() => {
    const analysis = currentState.value
    return RecommendationEngine.generateRecommendations(analysis)
  })

  /**
   * 顶部推荐（Dashboard展示，最多3个，已随机）
   */
  const topRecommendations = computed(() => {
    return RecommendationEngine.selectRecommendationsForDisplay(recommendations.value, 3)
  })

  /**
   * 欢迎消息
   */
  const welcomeMessage = computed(() => {
    const analysis = currentState.value
    return RecommendationEngine.getWelcomeMessage(analysis)
  })

  /**
   * 进度提示
   */
  const progressTip = computed(() => {
    const analysis = currentState.value
    return RecommendationEngine.generateProgressTip(analysis)
  })

  /**
   * 刷新推荐
   */
  const refreshRecommendations = async () => {
    isAnalyzing.value = true
    try {
      // 刷新所有数据
      await Promise.all([
        fetchPools(),
        loadNodes(),
        fetchOverview()
      ])
    } finally {
      isAnalyzing.value = false
    }
  }

  return {
    // 状态
    currentState,
    recommendations,
    topRecommendations,
    welcomeMessage,
    progressTip,
    isAnalyzing,

    // 方法
    analyzeUserState,
    refreshRecommendations
  }
}
