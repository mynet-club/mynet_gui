<template>
  <q-card class="node-info-card">
    <q-card-section class="q-pa-md">
      <!-- 上部：节点名称 + 状态（单行）-->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">{{ nodeInfo?.node_name || title }}</div>
        <q-chip
          v-if="nodeInfo"
          :color="getStatusColor(nodeInfo.node_status)"
          text-color="white"
          size="sm"
        >
          <q-icon 
            :name="getStatusIcon(nodeInfo.node_status)" 
            size="xs"
            class="q-mr-xs"
          />
          {{ getStatusText(nodeInfo.node_status) }}
        </q-chip>
      </div>
      
      <div v-if="nodeInfo" class="node-content">
        <!-- 中部：IP 地址信息（紧凑显示）-->
        <div class="ip-section">
          <div class="ip-row">
            <q-icon name="fingerprint" size="16px" color="purple" />
            <span class="text-caption text-grey-6">节点ID</span>
            <span class="text-body2 text-weight-medium">{{ nodeInfo.node_id || t('common.noData') }}</span>
          </div>
          
          <div class="ip-row">
            <q-icon name="vpn_key" size="16px" color="primary" />
            <span class="text-caption text-grey-6">虚拟IP</span>
            <span class="text-body2 text-weight-medium">{{ nodeInfo.node_ip || nodeInfo.network_config?.node_ip || t('common.noData') }}</span>
          </div>
          
          <div class="ip-row">
            <q-icon name="public" size="16px" color="teal" />
            <span class="text-caption text-grey-6">公网IP</span>
            <span class="text-body2">{{ nodeInfo.wanip || nodeInfo.network_config?.public_ips?.[0] || t('common.noData') }}</span>
          </div>
          
          <div class="ip-row" v-if="getLanIPs(nodeInfo).length > 0">
            <q-icon name="router" size="16px" color="orange" />
            <span class="text-caption text-grey-6">局域网IP</span>
            <div class="lan-ips">
              <span v-for="ip in getLanIPs(nodeInfo)" :key="ip" class="text-body2">{{ ip }}</span>
            </div>
          </div>
        </div>
        
        <!-- 下部：用户 + 设备信息（一行）-->
        <div class="footer-section border-top">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-xs">
              <q-icon name="person_outline" size="16px" class="text-grey-6" />
              <span class="text-body2 text-grey-7">{{ nodeInfo.user_name || t('common.unknownUser') }}</span>
            </div>
            <div v-if="nodeInfo.os || nodeInfo.arch" class="row items-center q-gutter-xs">
              <q-icon :name="getOsIcon(nodeInfo.os)" size="16px" class="text-grey-6" />
              <span class="text-caption text-grey-7">{{ nodeInfo.os || t('common.unknown') }}</span>
              <span v-if="nodeInfo.arch" class="text-caption text-grey-6">· {{ nodeInfo.arch }}</span>
            </div>
          </div>
        </div>

      </div>
      <div v-else-if="loading" class="text-center q-pa-md text-grey-6">
        <q-spinner :color="color" size="2em" />
        <div class="q-mt-sm">加载中...</div>
      </div>
      <div v-else class="text-grey-6">加载中...</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { NodeDeviceInfo } from '../../types/node'
import { NodeStatusManager } from '../../utils/nodeStatus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  title: string
  icon?: string
  color?: string
  nodeInfo: any | null
  deviceInfo?: NodeDeviceInfo | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'router',
  color: 'primary',
  loading: false
})

// 辅助函数（使用统一的NodeStatusManager）
const getStatusColor = (status: number) => {
  return NodeStatusManager.getStatusColor(status)
}

const getStatusIcon = (status: number) => {
  return NodeStatusManager.getStatusIcon(status)
}

const getStatusText = (status: number) => {
  return NodeStatusManager.getStatusText(status)
}

const getLanIPs = (nodeInfo: any) => {
  // 优先从 network_config.lan_ips 获取
  if (nodeInfo.network_config?.lan_ips?.length) {
    return nodeInfo.network_config.lan_ips
  }
  // 从 ip_addresses 中提取 lan_ip 类型
  if (nodeInfo.ip_addresses?.length) {
    return nodeInfo.ip_addresses
      .filter((ip: any) => ip.route_type === 'lan_ip')
      .map((ip: any) => ip.ip_address)
  }
  return []
}

const getOsIcon = (os: string) => {
  if (!os) return 'devices'
  const osLower = os.toLowerCase()
  if (osLower.includes('windows')) return 'desktop_windows'
  if (osLower.includes('mac') || osLower.includes('darwin')) return 'laptop_mac'
  if (osLower.includes('linux')) return 'computer'
  if (osLower.includes('android')) return 'phone_android'
  if (osLower.includes('ios')) return 'phone_iphone'
  if (osLower.includes('openwrt')) return 'router'
  return 'devices'
}
</script>

<style lang="scss" scoped>
.node-info-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .q-card__section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.node-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.ip-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 16px;
}

.ip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .text-caption {
    min-width: 60px;
  }
  
  .lan-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.footer-section {
  flex-shrink: 0;
  padding-top: 12px;
}
</style>
