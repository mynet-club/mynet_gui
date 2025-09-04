<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md">
      <q-card>
        <q-card-section>
          <h5 class="q-mb-md">Token 刷新调试工具</h5>
          
          <!-- Token 信息 -->
          <div class="q-mb-md">
            <h6>当前 Token 状态:</h6>
            <pre class="bg-grey-2 q-pa-md">{{ JSON.stringify(tokenInfo, null, 2) }}</pre>
          </div>
          
          <!-- 操作按钮 -->
          <div class="row q-gutter-md">
            <q-btn 
              color="primary" 
              label="刷新 Token 信息" 
              @click="updateTokenInfo"
            />
            <q-btn 
              color="secondary" 
              label="测试 Token 刷新" 
              @click="testRefresh"
              :loading="testing"
            />
            <q-btn 
              color="orange" 
              label="测试自动刷新" 
              @click="testAutoRefresh"
            />
            <q-btn 
              color="negative" 
              label="清除所有 Token" 
              @click="clearTokens"
            />
          </div>
        </q-card-section>
      </q-card>
      
      <!-- WebSocket 时间广播测试 -->
      <q-card>
        <q-card-section>
          <h6 class="q-mb-md">WebSocket 时间广播测试</h6>
          
          <!-- 连接状态 -->
          <div class="q-mb-md">
            <q-chip 
              :color="wsConnected ? 'positive' : 'negative'"
              :icon="wsConnected ? 'wifi' : 'wifi_off'"
              text-color="white"
            >
              {{ wsConnected ? '已连接' : '未连接' }}
            </q-chip>
            <span class="q-ml-md text-caption">
              最后更新: {{ lastTimeUpdate || '无' }}
            </span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="row q-gutter-md q-mb-md">
            <q-btn 
              color="positive" 
              label="连接 WebSocket" 
              @click="connectWebSocket"
              :disable="wsConnected"
            />
            <q-btn 
              color="negative" 
              label="断开 WebSocket" 
              @click="disconnectWebSocket"
              :disable="!wsConnected"
            />
            <q-btn 
              color="info" 
              label="清除时间日志" 
              @click="clearTimeLogs"
            />
          </div>
          
          <!-- 时间信息显示 -->
          <div v-if="latestTimeData" class="bg-grey-2 q-pa-md">
            <h6>最新时间数据:</h6>
            <pre>{{ JSON.stringify(latestTimeData, null, 2) }}</pre>
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 日志显示 -->
      <q-card>
        <q-card-section>
          <div class="row items-center q-mb-md">
            <h6 class="q-ma-none">操作日志:</h6>
            <q-space />
            <q-btn 
              size="sm" 
              color="grey" 
              label="清除日志" 
              @click="logs = []"
            />
          </div>
          <div class="bg-black text-white q-pa-md" style="height: 300px; overflow-y: auto;">
            <div v-for="(log, index) in logs" :key="index" class="q-mb-xs">
              <span :class="getLogColor(log.level)">[{{ log.time }}] {{ log.message }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { tokenManager } from '../../utils/tokenManager'
import { testTokenRefresh, testAutoRefresh, getTokenInfo } from '../../utils/tokenRefreshTest'
import { useNotify } from '../../composables/useNotify'
import { useWebSocket } from '../../services/websocket'
import { useAuthStore } from '../../stores/auth'
import type { TimeUpdateMessage } from '../../services/websocket'

const notify = useNotify()
const authStore = useAuthStore()
const { isConnected, connect, disconnect, on, off } = useWebSocket()

const testing = ref(false)
const tokenInfo = ref<any>({})
const logs = ref<Array<{ time: string; level: string; message: string }>>([])
const updateInterval = ref<number | null>(null)

// WebSocket 相关状态
const wsConnected = ref(false)
const lastTimeUpdate = ref<string>('')
const latestTimeData = ref<TimeUpdateMessage | null>(null)

// 添加日志
const addLog = (level: string, message: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    level,
    message
  })
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

// 获取日志颜色
const getLogColor = (level: string) => {
  switch (level) {
    case 'error': return 'text-red'
    case 'warn': return 'text-orange'
    case 'success': return 'text-green'
    default: return 'text-white'
  }
}

// 更新 token 信息
const updateTokenInfo = () => {
  tokenInfo.value = getTokenInfo()
  addLog('info', 'Token 信息已更新')
}

// 测试 token 刷新
const testRefresh = async () => {
  if (testing.value) return
  
  testing.value = true
  addLog('info', '开始测试 Token 刷新...')
  
  try {
    await testTokenRefresh()
    addLog('success', 'Token 刷新测试成功!')
    notify.success('Token 刷新测试成功!')
    updateTokenInfo()
  } catch (error: any) {
    addLog('error', `Token 刷新测试失败: ${error.message}`)
    notify.error('Token 刷新测试失败')
  } finally {
    testing.value = false
  }
}

// 测试自动刷新
const testAutoRefreshFn = () => {
  try {
    testAutoRefresh()
    addLog('info', '自动刷新测试已设置，请等待25秒后的自动刷新')
    notify.success('自动刷新测试已设置')
    updateTokenInfo()
  } catch (error: any) {
    addLog('error', `自动刷新测试设置失败: ${error.message}`)
    notify.error('自动刷新测试设置失败')
  }
}

// 清除所有 token
const clearTokens = () => {
  tokenManager.clearTokens()
  addLog('warn', '所有 Token 已清除')
  notify.success('所有 Token 已清除')
  updateTokenInfo()
}

// WebSocket 相关方法
const connectWebSocket = () => {
  if (!authStore.token || !authStore.currentZone) {
    addLog('error', 'WebSocket 连接失败：缺少认证信息或区域信息')
    notify.error('缺少认证信息或区域信息')
    return
  }
  
  connect(authStore.token, authStore.currentZone.zone_id.toString())
  addLog('info', `WebSocket 连接尝试: Zone ID ${authStore.currentZone.zone_id}`)
}

const disconnectWebSocket = () => {
  disconnect()
  addLog('info', 'WebSocket 连接已断开')
}

const clearTimeLogs = () => {
  latestTimeData.value = null
  lastTimeUpdate.value = ''
  addLog('info', '时间日志已清除')
}

// WebSocket 事件监听器
const handleTimeUpdate = (data: TimeUpdateMessage) => {
  latestTimeData.value = data
  lastTimeUpdate.value = new Date().toLocaleTimeString()
  addLog('success', `🕐 收到时间更新: ${data.formatted_time} (Zone: ${data.zone_id})`)
}

const handleConnected = (data: any) => {
  wsConnected.value = true
  addLog('success', `✅ WebSocket 连接成功: Zone ${data.zone_id}`)
}

const handleDisconnected = (data: any) => {
  wsConnected.value = false
  addLog('warn', '❌ WebSocket 连接断开')
}

// 监听控制台输出
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

const setupConsoleInterception = () => {
  console.log = (...args) => {
    originalConsoleLog(...args)
    const message = args.join(' ')
    if (message.includes('[TokenManager]')) {
      addLog('info', message)
    }
  }
  
  console.error = (...args) => {
    originalConsoleError(...args)
    const message = args.join(' ')
    if (message.includes('[TokenManager]')) {
      addLog('error', message)
    }
  }
  
  console.warn = (...args) => {
    originalConsoleWarn(...args)
    const message = args.join(' ')
    if (message.includes('[TokenManager]')) {
      addLog('warn', message)
    }
  }
}

const restoreConsole = () => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
}

onMounted(() => {
  updateTokenInfo()
  setupConsoleInterception()
  
  // 每秒更新一次 token 信息
  updateInterval.value = window.setInterval(updateTokenInfo, 1000)
  
  // 设置 WebSocket 事件监听器
  on('time_update', handleTimeUpdate)
  on('connected', handleConnected)
  on('disconnected', handleDisconnected)
  
  // 同步初始连接状态
  wsConnected.value = isConnected.value
  
  addLog('info', 'Token 调试工具已启动')
  addLog('info', 'WebSocket 事件监听器已设置')
})

onUnmounted(() => {
  restoreConsole()
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
  
  // 清理 WebSocket 事件监听器
  off('time_update', handleTimeUpdate)
  off('connected', handleConnected)
  off('disconnected', handleDisconnected)
})
</script>

<style scoped>
pre {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
