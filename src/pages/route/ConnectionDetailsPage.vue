<template>
  <PageLayout
    :title="pageTitle"
    :subtitle="pageSubtitle"
    icon="cable"
  >
    <!-- 面包屑 -->
    <template #breadcrumbs>
      <q-breadcrumbs>
        <q-breadcrumbs-el label="活跃路由" to="/app/routes/active" icon="route" />
        <q-breadcrumbs-el 
          :label="sourceNodeInfo?.node_name || '节点'"
          :to="`/app/routes/active/${nodeId}`"
        />
        <q-breadcrumbs-el 
          :label="peerNodeInfo?.node_name || '对端节点'"
        />
      </q-breadcrumbs>
    </template>

    <template #actions>
      <q-btn
        flat
        icon="arrow_back"
        label="返回"
        @click="handleBack"
      />
      <q-btn
        color="primary"
        icon="sync"
        label="刷新"
        @click="loadConnectionDetails"
        :loading="loading"
      />
    </template>

    <!-- 加载中 -->
    <div v-if="loading && !connectionDetails.node_id" class="column items-center q-py-xl">
      <q-spinner color="primary" size="3em" />
      <div class="text-subtitle1 q-mt-md text-grey-6">加载连接详情...</div>
    </div>

    <!-- 内容区 -->
    <div v-else class="q-gutter-lg">
      <!-- 节点信息卡片 -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <NodeInfoCard
            title="本节点"
            icon="router"
            color="primary"
            :node-info="sourceNodeInfo"
            :device-info="sourceDeviceInfo"
            :loading="loadingDeviceInfo"
          />
        </div>
        <div class="col-12 col-md-6">
          <NodeInfoCard
            title="对端节点"
            icon="router"
            color="secondary"
            :node-info="peerNodeInfo"
            :device-info="peerDeviceInfo"
            :loading="loadingDeviceInfo"
          />
        </div>
      </div>

      <!-- 连接状态卡片 -->
      <ConnectionStatusCard :connection-details="connectionDetails" />

      <!-- 流量统计卡片 -->
      <TrafficStatsCard
        :traffic-stats="trafficStats"
        :history-time-range="historyTimeRange"
        @update-time-range="handleTimeRangeUpdate"
      />

      <!-- 连接历史卡片 -->
      <ConnectionHistoryCard
        :connection-history="connectionHistory"
        :loading="historyLoading"
      />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '../../components/layout/PageLayout.vue'
import NodeInfoCard from '../../components/route/NodeInfoCard.vue'
import ConnectionStatusCard from '../../components/route/ConnectionStatusCard.vue'
import TrafficStatsCard from '../../components/route/TrafficStatsCard.vue'
import ConnectionHistoryCard from '../../components/route/ConnectionHistoryCard.vue'
import { api } from '../../services/api'
import { useNotify } from '../../composables/useNotify'
import { nodeService } from '../../services/node/nodeService'
import type { NodeDeviceInfo } from '../../types/node'

const notify = useNotify()

const route = useRoute()
const router = useRouter()

// 路由参数
const nodeId = computed(() => route.params.nodeId as string)
const peerId = computed(() => (route.params.peerId as string).replace(/^p-/, ''))

// 页面标题
const pageTitle = computed(() => {
  if (sourceNodeInfo.value && peerNodeInfo.value) {
    return `${sourceNodeInfo.value.node_name} ↔ ${peerNodeInfo.value.node_name}`
  }
  return '连接详情'
})

const pageSubtitle = computed(() => {
  if (connectionDetails.value.online) {
    return `${connectionDetails.value.conn_type || '未知类型'} · ${connectionDetails.value.latency ? `${connectionDetails.value.latency.toFixed(1)} ms` : 'N/A'}`
  }
  return '离线'
})

// 数据状态
const loading = ref(false)
const loadingDeviceInfo = ref(false)
const historyLoading = ref(false)

// 连接详情
const connectionDetails = ref<any>({
  online: false,
  conn_type: '',
  latency: 0,
  seen_at: ''
})

// 节点信息
const sourceNodeInfo = ref<any>(null)
const peerNodeInfo = ref<any>(null)

// 设备信息
const sourceDeviceInfo = ref<NodeDeviceInfo | null>(null)
const peerDeviceInfo = ref<NodeDeviceInfo | null>(null)

// 连接历史
const connectionHistory = ref<any[]>([])
const historyTimeRange = ref('24h')

// 流量统计
const trafficStats = ref({
  totalRx: 0,
  totalTx: 0,
  avgDownSpeed: 0,
  avgUpSpeed: 0
})

// 加载连接详情
const loadConnectionDetails = async () => {
  try {
    loading.value = true
    
    // 获取最新的连接监控数据（从历史数据中获取最近1分钟的记录）
    try {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      
      const response = await api.get('/monitor/history/connections', {
        params: {
          node_id: nodeId.value,
          peer_node_id: peerId.value,
          start_time: oneMinuteAgo.toISOString().slice(0, 19).replace('T', ' '),
          end_time: now.toISOString().slice(0, 19).replace('T', ' '),
          per_page: 1  // 只需要最新的一条记录
        }
      })
      
      if (response.data && response.data.data?.connections?.[0]) {
        const conn = response.data.data.connections[0]
        connectionDetails.value = {
          node_id: conn.node_id,
          peer_node_id: conn.peer_node_id,
          online: conn.online || false,
          conn_type: conn.conn_type || '',
          latency: conn.latency || 0,
          seen_at: conn.seen_at || new Date().toISOString(),
          rx_bytes: conn.rx_bytes || 0,
          tx_bytes: conn.tx_bytes || 0
        }
        
        // 如果监控数据包含节点元数据，更新节点信息
        const metadata = response.data.data.nodes_metadata
        if (metadata) {
          if (metadata[nodeId.value]) {
            const nodeData = metadata[nodeId.value]
            // 从ip_addresses数组中提取不同类型的IP
            const nodeIp = nodeData.ip_addresses?.find((ip: any) => ip.route_type === 'node_ip')?.ip_address
            const lanIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'lan_ip').map((ip: any) => ip.ip_address) || []
            const publicIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'public_ip').map((ip: any) => ip.ip_address) || []
            
            sourceNodeInfo.value = {
              ...nodeData,
              last_active: conn.seen_at,
              network_config: {
                node_ip: nodeIp,
                virtual_ip: nodeIp,
                lan_ips: lanIps,
                public_ips: publicIps
              }
            }
          }
          if (metadata[peerId.value]) {
            const nodeData = metadata[peerId.value]
            // 从ip_addresses数组中提取不同类型的IP
            const nodeIp = nodeData.ip_addresses?.find((ip: any) => ip.route_type === 'node_ip')?.ip_address
            const lanIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'lan_ip').map((ip: any) => ip.ip_address) || []
            const publicIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'public_ip').map((ip: any) => ip.ip_address) || []
            
            peerNodeInfo.value = {
              ...nodeData,
              last_active: conn.seen_at,
              network_config: {
                node_ip: nodeIp,
                virtual_ip: nodeIp,
                lan_ips: lanIps,
                public_ips: publicIps
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('获取监控数据失败，仅显示路由配置信息:', error)
    }
    
    // 加载历史数据
    await loadHistoryData()
    
    // 加载设备信息
    await loadDeviceInfo()
    
    // 获取节点的详细信息（包含IP配置）
    try {
      const [sourceNodeResponse, peerNodeResponse] = await Promise.allSettled([
        api.get(`/nodes/${nodeId.value}`),
        api.get(`/nodes/${peerId.value}`)
      ])
      
      if (sourceNodeResponse.status === 'fulfilled' && sourceNodeResponse.value.data.success) {
        const nodeData = sourceNodeResponse.value.data.data
        console.log('本节点详细信息:', nodeData)
        if (sourceNodeInfo.value) {
          // 构建network_config对象，从API数据中提取IP信息
          sourceNodeInfo.value.network_config = {
            node_ip: nodeData.node_ip || nodeData.virtual_ip,
            virtual_ip: nodeData.virtual_ip || nodeData.node_ip,
            public_ips: [], // 公网IP需要从其他来源获取
            lan_ips: [] // 局域网IP需要从其他来源获取
          }
        }
      }
      
      if (peerNodeResponse.status === 'fulfilled' && peerNodeResponse.value.data.success) {
        const nodeData = peerNodeResponse.value.data.data
        console.log('对端节点详细信息:', nodeData)
        if (peerNodeInfo.value) {
          // 构建network_config对象
          peerNodeInfo.value.network_config = {
            node_ip: nodeData.node_ip || nodeData.virtual_ip,
            virtual_ip: nodeData.virtual_ip || nodeData.node_ip,
            public_ips: [],
            lan_ips: []
          }
        }
      }
    } catch (error) {
      console.warn('获取节点详细信息失败:', error)
    }
    
  } catch (error) {
    console.error('加载连接详情失败:', error)
    notify.error('加载连接详情失败')
  } finally {
    loading.value = false
  }
}

// 加载历史数据
const loadHistoryData = async () => {
  try {
    historyLoading.value = true
    
    const timeRanges: Record<string, { hours: number }> = {
      '1h': { hours: 1 },
      '6h': { hours: 6 },
      '24h': { hours: 24 }
    }
    
    const range = timeRanges[historyTimeRange.value] || { hours: 24 }
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - range.hours * 60 * 60 * 1000)
    
    const response = await api.get('/monitor/history/connections', {
      params: {
        node_id: nodeId.value,
        peer_node_id: peerId.value,
        start_time: startTime.toISOString().slice(0, 19).replace('T', ' '),
        end_time: endTime.toISOString().slice(0, 19).replace('T', ' '),
        per_page: 100
      }
    })
    
    if (response.data && response.data.data) {
      connectionHistory.value = response.data.data.connections || []
      
      // 计算流量统计
      calculateTrafficStats()
      
      // 如果有节点元数据，更新节点信息
      const metadata = response.data.data.nodes_metadata
      if (metadata) {
        if (metadata[nodeId.value] && !sourceNodeInfo.value) {
          const nodeData = metadata[nodeId.value]
          const nodeIp = nodeData.ip_addresses?.find((ip: any) => ip.route_type === 'node_ip')?.ip_address
          const lanIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'lan_ip').map((ip: any) => ip.ip_address) || []
          const publicIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'public_ip').map((ip: any) => ip.ip_address) || []
          
          sourceNodeInfo.value = {
            ...nodeData,
            network_config: {
              node_ip: nodeIp,
              virtual_ip: nodeIp,
              lan_ips: lanIps,
              public_ips: publicIps
            }
          }
        }
        if (metadata[peerId.value] && !peerNodeInfo.value) {
          const nodeData = metadata[peerId.value]
          const nodeIp = nodeData.ip_addresses?.find((ip: any) => ip.route_type === 'node_ip')?.ip_address
          const lanIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'lan_ip').map((ip: any) => ip.ip_address) || []
          const publicIps = nodeData.ip_addresses?.filter((ip: any) => ip.route_type === 'public_ip').map((ip: any) => ip.ip_address) || []
          
          peerNodeInfo.value = {
            ...nodeData,
            network_config: {
              node_ip: nodeIp,
              virtual_ip: nodeIp,
              lan_ips: lanIps,
              public_ips: publicIps
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('加载历史数据失败:', error)
    notify.error('加载历史数据失败')
  } finally {
    historyLoading.value = false
  }
}

// 加载节点设备信息
const loadDeviceInfo = async () => {
  try {
    loadingDeviceInfo.value = true
    
    // 并行加载两个节点的设备信息
    const [sourceResponse, peerResponse] = await Promise.allSettled([
      nodeService.getNodeDeviceInfo(nodeId.value),
      nodeService.getNodeDeviceInfo(peerId.value)
    ])
    
    if (sourceResponse.status === 'fulfilled' && sourceResponse.value.success && sourceResponse.value.data.exists) {
      sourceDeviceInfo.value = sourceResponse.value.data.device_info
    }
    
    if (peerResponse.status === 'fulfilled' && peerResponse.value.success && peerResponse.value.data.exists) {
      peerDeviceInfo.value = peerResponse.value.data.device_info
    }
  } catch (error) {
    console.error('加载设备信息失败:', error)
  } finally {
    loadingDeviceInfo.value = false
  }
}

// 计算流量统计（根据时间范围）
const calculateTrafficStats = () => {
  if (connectionHistory.value.length === 0) {
    trafficStats.value = {
      totalRx: 0,
      totalTx: 0,
      avgDownSpeed: 0,
      avgUpSpeed: 0
    }
    return
  }
  
  // 获取最新和最早的数据点
  const latest = connectionHistory.value[0]
  const oldest = connectionHistory.value[connectionHistory.value.length - 1]
  
  const rxBytes = (latest.rx_bytes || 0) - (oldest.rx_bytes || 0)
  const txBytes = (latest.tx_bytes || 0) - (oldest.tx_bytes || 0)
  
  // 计算时间差（秒）
  const timeDiff = (new Date(latest.snapshot_at).getTime() - new Date(oldest.snapshot_at).getTime()) / 1000
  
  trafficStats.value = {
    totalRx: rxBytes,
    totalTx: txBytes,
    avgDownSpeed: timeDiff > 0 ? rxBytes / timeDiff : 0,
    avgUpSpeed: timeDiff > 0 ? txBytes / timeDiff : 0
  }
}

// 处理时间范围更新
const handleTimeRangeUpdate = (value: string) => {
  historyTimeRange.value = value
  loadHistoryData()
}

const handleBack = () => {
  router.push(`/app/routes/active/${nodeId.value}`)
}

// 初始化
onMounted(() => {
  loadConnectionDetails()
})
</script>

<style lang="scss" scoped>
</style>
