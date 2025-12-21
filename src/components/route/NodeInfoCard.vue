<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <q-icon :name="icon" :color="color" size="md" class="q-mr-sm" />
        <div class="text-h6">{{ title }}</div>
      </div>
      <div v-if="nodeInfo" class="q-gutter-y-md">
        <!-- 基本信息 -->
        <div class="q-mb-sm">
          <div class="text-caption text-grey-6">节点名称</div>
          <div class="text-subtitle1 text-weight-medium">{{ nodeInfo.node_name }}</div>
        </div>
        <div class="q-mb-sm">
          <div class="text-caption text-grey-6">节点ID</div>
          <div class="text-body2">{{ nodeInfo.node_id }}</div>
        </div>
        <div class="q-mb-sm">
          <div class="text-caption text-grey-6">所属用户</div>
          <div class="text-body2">{{ nodeInfo.user_name || '未知' }}</div>
        </div>
        <div class="q-mb-sm">
          <div class="text-caption text-grey-6">节点状态</div>
          <q-chip
            :color="getStatusColor(nodeInfo.node_status)"
            text-color="white"
            size="sm"
          >
            {{ getStatusText(nodeInfo.node_status) }}
          </q-chip>
        </div>
        
        <!-- 设备信息 -->
        <div v-if="deviceInfo" class="q-mt-md q-pt-md border-top">
          <div class="text-caption text-weight-medium text-grey-7 q-mb-sm">设备信息</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12" v-if="deviceInfo.cpu_model">
              <div class="text-caption text-grey-6">CPU</div>
              <div class="text-body2">
                {{ deviceInfo.cpu_model }}
                <span v-if="deviceInfo.cpu_cores" class="text-grey-6">
                  ({{ deviceInfo.cpu_cores }}核{{ deviceInfo.cpu_threads ? `/${deviceInfo.cpu_threads}线程` : '' }})
                </span>
              </div>
            </div>
            <div class="col-12" v-if="deviceInfo.memory_total_mb">
              <div class="text-caption text-grey-6">内存</div>
              <div class="text-body2">
                {{ formatMemory(deviceInfo.memory_total_mb) }}
                <span v-if="deviceInfo.memory_free_mb" class="text-grey-6">
                  (可用 {{ formatMemory(deviceInfo.memory_free_mb) }})
                </span>
              </div>
            </div>
            <div class="col-12" v-if="deviceInfo.os_name">
              <div class="text-caption text-grey-6">操作系统</div>
              <div class="text-body2">
                {{ deviceInfo.os_name }} {{ deviceInfo.os_version || '' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- IP地址信息 -->
        <div v-if="nodeInfo.network_config" class="q-mt-md q-pt-md border-top">
          <div class="text-caption text-weight-medium text-grey-7 q-mb-sm">IP地址</div>
          
          <!-- 虚拟IP -->
          <div v-if="nodeInfo.network_config.node_ip" class="q-mb-xs">
            <div class="text-caption text-grey-6">虚拟IP</div>
            <div class="text-body2">
              <q-chip size="sm" color="primary" text-color="white" dense>
                {{ nodeInfo.network_config.node_ip }}
              </q-chip>
            </div>
          </div>
          
          <!-- 公网IP -->
          <div v-if="getPublicIPs(nodeInfo.network_config).length > 0" class="q-mb-xs">
            <div class="text-caption text-grey-6">公网IP</div>
            <div class="q-gutter-xs">
              <q-chip
                v-for="ip in getPublicIPs(nodeInfo.network_config)"
                :key="ip"
                size="sm"
                :color="isIPv6(ip) ? 'purple' : 'green'"
                text-color="white"
                dense
              >
                {{ ip }}
                <q-tooltip>{{ isIPv6(ip) ? 'IPv6' : 'IPv4' }}</q-tooltip>
              </q-chip>
            </div>
          </div>
          
          <!-- 局域网IP -->
          <div v-if="nodeInfo.network_config.lan_ips?.length > 0" class="q-mb-xs">
            <div class="text-caption text-grey-6">局域网IP</div>
            <div class="q-gutter-xs">
              <q-chip
                v-for="ip in nodeInfo.network_config.lan_ips"
                :key="ip"
                size="sm"
                color="orange"
                text-color="white"
                dense
              >
                {{ ip }}
              </q-chip>
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

// 辅助函数
const getStatusColor = (status: number) => {
  if (status === 2) return 'positive' // 在线
  if (status === 1) return 'info' // 启用但离线
  return 'grey' // 禁用
}

const getStatusText = (status: number) => {
  if (status === 2) return '在线'
  if (status === 1) return '启用'
  return '禁用'
}

const formatMemory = (mb: number) => {
  if (!mb) return '0 MB'
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`
  }
  return `${mb} MB`
}

const getPublicIPs = (networkConfig: any) => {
  const ips: string[] = []
  if (networkConfig?.public_ips?.length) {
    ips.push(...networkConfig.public_ips.filter((ip: string) => ip.trim()))
  }
  return ips
}

const isIPv6 = (ip: string) => {
  return ip.includes(':')
}
</script>

<style lang="scss" scoped>
.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
