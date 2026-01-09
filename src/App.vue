<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from './stores/onboarding'
import { resetTipsEngine, getTipsEngine } from './services/tips/TipsEngine'
import { OnboardingStage } from './types/tips'

// 开发环境添加调试工具
if (import.meta.env.DEV) {
  onMounted(() => {
    // 将调试工具挂载到window对象
    (window as any).$tips = {
      // 重置引导（清空localStorage）
      reset: () => {
        console.log('🔄 开始重置...')
        
        // 1. 停止当前引擎
        console.log('🛑 停止Tips引擎...')
        resetTipsEngine()
        
        // 2. 清除所有onboarding相关的localStorage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('onboarding')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          console.log('🗑️ 删除:', key)
          localStorage.removeItem(key)
        })
        
        console.log('✅ localStorage已清理')
        console.log('🔄 3秒后刷新页面...')
        setTimeout(() => {
          location.reload()
        }, 3000)
      },
      
      // 查看状态
      status: () => {
        const store = useOnboardingStore()
        console.table({
          '用户ID': store.userId,
          '是否完成': store.completed,
          '当前阶段': store.currentStage,
          '进度': `${store.progress}%`,
          '选择路径': store.selectedPath
        })
        console.log('阶段详情:', store.stages)
        return {
          userId: store.userId,
          completed: store.completed,
          currentStage: store.currentStage,
          progress: store.progress,
          selectedPath: store.selectedPath,
          stages: store.stages
        }
      },
      
      // 导出状态
      export: () => {
        const store = useOnboardingStore()
        const state = store.exportState()
        console.log(JSON.stringify(state, null, 2))
        return state
      },
      
      // 跳过所有
      skipAll: () => {
        const store = useOnboardingStore()
        store.skipAll()
        console.log('✅ 已跳过所有引导')
      },
      
      // 完成指定阶段（用于测试）
      completeStage: (stage: number) => {
        const store = useOnboardingStore()
        store.completeStage(stage)
        console.log(`✅ 已完成阶段 ${stage}`)
      },
      
      // 选择路径（用于测试）
      selectPath: (path: 'device-first' | 'friend-first') => {
        const store = useOnboardingStore()
        store.selectPath(path as any)
        console.log(`✅ 已选择路径: ${path}`)
      },
      
      // 强制显示欢迎弹窗
      welcome: () => {
        console.log('🎯 [Test] 开始强制显示欢迎弹窗...')
        
        const store = useOnboardingStore()
        const engine = getTipsEngine()
        
        console.log('📊 [Test] 当前状态:', {
          userId: store.userId,
          isStarted: store.isStarted,
          completed: store.completed,
          currentStage: store.currentStage,
          shouldSkip: store.shouldSkip,
          welcomeShown: store.stages.welcome_shown,
          skipAll: store.preferences.skipAll
        })
        
        console.log('📍 [Test] 当前路由:', window.location.pathname)
        
        // 1. 重置欢迎阶段状态
        console.log('🔄 [Test] 重置欢迎阶段状态...')
        store.stages.welcome_shown = false
        store.currentStage = OnboardingStage.Welcome
        store.preferences.skipAll = false
        store.save()
        
        // 2. 确保引导已开始
        if (!store.isStarted) {
          console.log('▶️ [Test] 启动引导...')
          store.start()
        }
        
        // 3. 清除引擎状态
        console.log('🧹 [Test] 清除引擎状态...')
        engine.hideAll()
        engine.clearShownTips('welcome')
        
        // 4. 延迟触发检查
        console.log('⏰ [Test] 500ms后触发检查...')
        setTimeout(() => {
          console.log('🔍 [Test] 触发检查...')
          engine.triggerCheck()
          
          // 5. 再次检查活跃的tips
          setTimeout(() => {
            const activeTips = engine.getActiveTips()
            console.log('📋 [Test] 活跃的Tips数量:', activeTips.length)
            activeTips.forEach(tip => {
              console.log('  📌', tip.config.id, '类型:', tip.config.type, '可见:', tip.visible)
            })
            
            if (activeTips.length === 0) {
              console.error('❌ [Test] 没有活跃的Tips！')
              console.error('  可能的原因：路由不匹配、条件不满足、TipsContainer未渲染')
            } else {
              console.log('✅ [Test] 找到活跃的Tips')
            }
          }, 100)
        }, 500)
      },
      
      // 测试Spotlight高亮引导（带箭头）
      spotlight: () => {
        const engine = getTipsEngine()
        console.log('🎯 测试Spotlight引导 - 请先导航到IP资源池页面 (/app/ippools)')
        console.log('提示：IP资源池页面的"创建"按钮会被高亮显示')
        
        // 手动创建一个测试Spotlight
        const testTip = {
          id: 'test-spotlight',
          type: 'spotlight' as any,
          stage: 1,
          trigger: {
            route: '/app/ippools',
            element: '[data-tip-target="create-ippool-btn"]',
            condition: () => true,
            once: false
          },
          display: {
            title: '📍 创建IP资源池',
            content: '点击此按钮创建你的第一个IP资源池',
            placement: 'bottom' as any
          },
          actions: [
            {
              label: '知道了',
              type: 'primary' as any,
              closeOnClick: true
            }
          ],
          priority: 10,
          skippable: true,
          closable: true
        }
        
        console.log('✅ Spotlight测试Tip已创建，请访问 /app/ippools 查看效果')
      },
      
      // 查看当前活跃的Tips
      active: () => {
        const engine = getTipsEngine()
        const active = engine.getActiveTips()
        console.log('📋 当前活跃Tips:', active.length)
        active.forEach(tip => {
          console.log(`  - ${tip.config.id} (${tip.config.type})`, tip.visible ? '可见' : '隐藏')
        })
        return active
      },
      
      // 检查 TipsContainer 是否存在
      checkContainer: () => {
        const container = document.querySelector('.tips-container')
        console.log('📦 TipsContainer 元素:', container ? '✅ 存在' : '❌ 不存在')
        if (container) {
          console.log('   子元素数量:', container.children.length)
          console.log('   子元素:', Array.from(container.children).map(el => el.tagName))
        }
        return container
      }
    }
    
    console.log('%c💡 开发者工具已加载', 'color: #42b983; font-size: 14px; font-weight: bold;')
    console.log('%c使用 $tips 访问引导系统调试工具：', 'color: #666; font-size: 12px;')
    console.log('%c  $tips.reset()          - 重置引导', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.welcome()        - 显示欢迎弹窗', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.active()         - 查看活跃Tips', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.checkContainer() - 检查容器是否存在', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.status()         - 查看状态', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.export()         - 导出状态', 'color: #999; font-size: 11px;')
  })
}
</script>