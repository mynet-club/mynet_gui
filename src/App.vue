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

// Add debug tools in development environment
if (import.meta.env.DEV) {
  onMounted(() => {
    // Mount debug tools to window object
    (window as any).$tips = {
      // Reset onboarding (clear localStorage)
      reset: () => {
        console.log('🔄 Starting reset...')
        
        // 1. Stop current engine
        console.log('🛑 Stopping Tips engine...')
        resetTipsEngine()
        
        // 2. Clear all onboarding-related localStorage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('onboarding')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          console.log('🗑️ Removing:', key)
          localStorage.removeItem(key)
        })
        
        console.log('✅ localStorage cleaned')
        console.log('🔄 Refreshing page in 3 seconds...')
        setTimeout(() => {
          location.reload()
        }, 3000)
      },
      
      // View status
      status: () => {
        const store = useOnboardingStore()
        console.table({
          'User ID': store.userId,
          'Completed': store.completed,
          'Current Stage': store.currentStage,
          'Progress': `${store.progress}%`,
          'Selected Path': store.selectedPath
        })
        console.log('Stage Details:', store.stages)
        return {
          userId: store.userId,
          completed: store.completed,
          currentStage: store.currentStage,
          progress: store.progress,
          selectedPath: store.selectedPath,
          stages: store.stages
        }
      },
      
      // Export state
      export: () => {
        const store = useOnboardingStore()
        const state = store.exportState()
        console.log(JSON.stringify(state, null, 2))
        return state
      },
      
      // Skip all
      skipAll: () => {
        const store = useOnboardingStore()
        store.skipAll()
        console.log('✅ All onboarding skipped')
      },
      
      // Complete specific stage (for testing)
      completeStage: (stage: number) => {
        const store = useOnboardingStore()
        store.completeStage(stage)
        console.log(`✅ Stage ${stage} completed`)
      },
      
      // Select path (for testing)
      selectPath: (path: 'device-first' | 'friend-first') => {
        const store = useOnboardingStore()
        store.selectPath(path as any)
        console.log(`✅ Path selected: ${path}`)
      },
      
      // Force show welcome dialog
      welcome: () => {
        console.log('🎯 [Test] Forcing welcome dialog display...')
        
        const store = useOnboardingStore()
        const engine = getTipsEngine()
        
        console.log('📊 [Test] Current state:', {
          userId: store.userId,
          isStarted: store.isStarted,
          completed: store.completed,
          currentStage: store.currentStage,
          shouldSkip: store.shouldSkip,
          welcomeShown: store.stages.welcome_shown,
          skipAll: store.preferences.skipAll
        })
        
        console.log('📍 [Test] Current route:', window.location.pathname)
        
        // 1. Reset welcome stage state
        console.log('🔄 [Test] Resetting welcome stage state...')
        store.stages.welcome_shown = false
        store.currentStage = OnboardingStage.Welcome
        store.preferences.skipAll = false
        store.save()
        
        // 2. Ensure onboarding is started
        if (!store.isStarted) {
          console.log('▶️ [Test] Starting onboarding...')
          store.start()
        }
        
        // 3. Clear engine state
        console.log('🧹 [Test] Clearing engine state...')
        engine.hideAll()
        engine.clearShownTips('welcome')
        
        // 4. Delay trigger check
        console.log('⏰ [Test] Triggering check in 500ms...')
        setTimeout(() => {
          console.log('🔍 [Test] Triggering check...')
          engine.triggerCheck()
          
          // 5. Check active tips again
          setTimeout(() => {
            const activeTips = engine.getActiveTips()
            console.log('📋 [Test] Active Tips count:', activeTips.length)
            activeTips.forEach(tip => {
              console.log('  📌', tip.config.id, 'Type:', tip.config.type, 'Visible:', tip.visible)
            })
            
            if (activeTips.length === 0) {
              console.error('❌ [Test] No active Tips!')
              console.error('  Possible reasons: Route mismatch, condition not met, TipsContainer not rendered')
            } else {
              console.log('✅ [Test] Found active Tips')
            }
          }, 100)
        }, 500)
      },
      
      // Test Spotlight highlighting guide (with arrow)
      spotlight: () => {
        const engine = getTipsEngine()
        console.log('🎯 Test Spotlight guide - Please navigate to IP Pools page (/app/ippools) first')
        console.log('Tip: The "Create" button on IP Pools page will be highlighted')
        
        // Manually create a test Spotlight
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
            title: '📍 Create IP Pool',
            content: 'Click this button to create your first IP pool',
            placement: 'bottom' as any
          },
          actions: [
            {
              label: 'Got it',
              type: 'primary' as any,
              closeOnClick: true
            }
          ],
          priority: 10,
          skippable: true,
          closable: true
        }
        
        console.log('✅ Spotlight test Tip created, visit /app/ippools to see the effect')
      },
      
      // View currently active Tips
      active: () => {
        const engine = getTipsEngine()
        const active = engine.getActiveTips()
        console.log('📋 Currently active Tips:', active.length)
        active.forEach(tip => {
          console.log(`  - ${tip.config.id} (${tip.config.type})`, tip.visible ? 'Visible' : 'Hidden')
        })
        return active
      },
      
      // Check if TipsContainer exists
      checkContainer: () => {
        const container = document.querySelector('.tips-container')
        console.log('📦 TipsContainer element:', container ? '✅ Exists' : '❌ Not found')
        if (container) {
          console.log('   Child element count:', container.children.length)
          console.log('   Child elements:', Array.from(container.children).map(el => el.tagName))
        }
        return container
      }
    }
    
    console.log('%c💡 Developer tools loaded', 'color: #42b983; font-size: 14px; font-weight: bold;')
    console.log('%c Use $tips to access onboarding system debug tools:', 'color: #666; font-size: 12px;')
    console.log('%c  $tips.reset()          - Reset onboarding', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.welcome()        - Show welcome dialog', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.active()         - View active Tips', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.checkContainer() - Check if container exists', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.status()         - View status', 'color: #999; font-size: 11px;')
    console.log('%c  $tips.export()         - Export state', 'color: #999; font-size: 11px;')
  })
}
</script>