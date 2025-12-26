<template>
  <div class="node-route-card-view">
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ $t('routes.nodeBased.nodesList') }}</div>
        
        <ResponsiveCardGrid
          :items="connections"
          :loading="loading"
          variant="standard"
          spacing="normal"
          empty-icon="router"
          :empty-title="$t('routes.nodeBased.noNodes')"
          :empty-description="$t('routes.nodeBased.noNodesForNode')"
          :clickable="true"
          @card-click="handleConnectionClick"
        >
          <template #default="{ item: summary }">
            <q-card-section class="node-card-content">
              <template v-if="(display = getDisplay(summary))">
                <!-- 上部：节点名称 + 连接状态（一行） -->
                <div class="card-header">
                  <div class="node-name">
                    <q-icon name="router" size="18px" class="text-blue-grey-6" />
                    <span class="text-subtitle2 text-weight-medium">{{ display.name }}</span>
                  </div>
                  <q-icon 
                    :name="display.linkStatus.icon" 
                    :color="getWifiColor(summary)"
                    size="24px"
                  >
                    <q-tooltip>{{ display.linkStatus.text }}</q-tooltip>
                  </q-icon>
                </div>

                <!-- 中部：节点信息 -->
                <div class="card-body">
                  <div class="info-left">
                    <!-- 虚拟 IP -->
                    <div class="info-row">
                      <q-icon name="vpn_key" size="16px" class="text-blue-6" />
                      <span class="text-body2 text-weight-medium">{{ display.virtualIp.text }}</span>
                    </div>

                    <!-- 公网 IP -->
                    <div v-if="display.wanIp" class="info-row">
                      <q-icon name="public" size="16px" class="text-teal-6" />
                      <span class="text-caption text-grey-7">{{ display.wanIp.text }}</span>
                    </div>

                    <!-- 连接详情（在线时） -->
                    <div v-if="display.connection" class="info-row">
                      <q-icon :name="display.connection.latency.icon" size="16px" class="text-purple-6" />
                      <span class="text-caption text-grey-7">{{ display.connection.latency.text }}</span>
                    </div>

                    <div v-if="display.connection" class="info-row">
                      <q-icon name="cable" size="16px" class="text-indigo-6" />
                      <span class="text-caption text-grey-7">{{ display.connection.connType.text }}</span>
                    </div>
                  </div>

                  <!-- 右侧：OS + 平台信息（仅有数据时显示） -->
                  <div v-if="summary.os || summary.arch" class="info-right">
                    <div v-if="summary.os" class="os-info">
                      <q-icon :name="getOsIcon(summary.os)" size="20px" class="text-grey-6" />
                      <span class="text-caption text-grey-7">{{ summary.os }}</span>
                    </div>
                    <div v-if="summary.arch" class="platform-info">
                      <span class="text-caption text-grey-6">{{ summary.arch }}</span>
                    </div>
                  </div>
                </div>

                <!-- 下部：用户信息 + 节点状态（一行） -->
                <div class="card-footer">
                  <div class="user-info">
                    <q-icon name="person_outline" size="14px" class="text-grey-6" />
                    <span class="text-caption text-grey-7">{{ summary.user_name }}</span>
                  </div>
                  <q-chip
                    :color="getNodeStatusChipColor(summary.node_status)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    <q-icon 
                      :name="getNodeStatusIcon(summary.node_status)" 
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ display.nodeStatus.text }}
                  </q-chip>
                </div>
              </template>
            </q-card-section>
          </template>
        </ResponsiveCardGrid>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ResponsiveCardGrid from '../common/ResponsiveCardGrid.vue'
import type { NodeSummary } from '../../models/nodeSummary'
import { getNodeCardDisplay } from '../../models/nodeSummary'
import { NodeStatusManager } from '../../utils/nodeStatus'

interface Props {
  connections: NodeSummary[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'connection-click': [connection: any]
}>()

const { t } = useI18n()

// 辅助方法 - 使用 NodeSummary 展示工具
const getDisplay = (summary: NodeSummary) => {
  return getNodeCardDisplay(summary)
}

// 节点状态图标映射 - 使用统一的NodeStatusManager
const getNodeStatusIcon = (status: number) => {
  return NodeStatusManager.getStatusIcon(status)
}

// WiFi 状态颜色（根据延迟和链路状态）
const getWifiColor = (summary: NodeSummary) => {
  // 离线显示灰色
  if (summary.link_status === 0) {
    return 'grey-5'
  }
  
  // 在线时根据延迟显示颜色
  const latency = summary.latency
  if (!latency) return 'grey-5'
  if (latency < 50) return 'positive'   // 绿色：优秀
  if (latency < 100) return 'warning'   // 橙色：良好
  return 'negative'                      // 红色：较差
}

// 节点状态 Chip 颜色（使用统一的NodeStatusManager）
const getNodeStatusChipColor = (nodeStatus: number) => {
  return NodeStatusManager.getStatusColor(nodeStatus)
}

const getFriendName = (node: any) => {
  return node.user_name || '未知用户'
}

const handleConnectionClick = (connection: any, index: number) => {
  emit('connection-click', connection)
}

// 获取操作系统图标
const getOsIcon = (os: string) => {
  const osLower = os.toLowerCase()
  if (osLower.includes('windows')) return 'desktop_windows'
  if (osLower.includes('mac') || osLower.includes('darwin')) return 'laptop_mac'
  if (osLower.includes('linux')) return 'computer'
  if (osLower.includes('android')) return 'phone_android'
  if (osLower.includes('ios')) return 'phone_iphone'
  return 'devices'
}
</script>

<style lang="scss" scoped>
.node-route-card-view {
  // 固定卡片大小
  :deep(.responsive-card-grid) {
    .grid-item {
      .q-card {
        height: 220px;
        background: #ffffff;
        border: 1px solid #e0e4e8;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
      }
    }
  }
  
  .node-card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
  }
  
  // 上部：节点名称 + 连接状态
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, #f0f4f8 0%, #e8eef3 100%);
    border-bottom: 2px solid #d1dbe5;
    
    .node-name {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
      
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #2c3e50;
      }
    }
  }
  
  // 中部：信息区域
  .card-body {
    flex: 1;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #ffffff;
    
    .info-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      .info-row {
        display: flex;
        align-items: center;
        gap: 10px;
        
        span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    
    .info-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
      min-width: 80px;
      
      .os-info {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .platform-info {
        text-align: right;
      }
    }
  }
  
  // 下部：用户信息 + 节点状态
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
    border-top: 1px solid #e8ecf0;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
      
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
