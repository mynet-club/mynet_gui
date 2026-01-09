<template>
  <q-card-section class="node-card-content">
    <!-- 顶部：名称 + 状态（浅灰背景）-->
    <div class="card-header">
      <div class="node-name">
        <q-icon :name="sceneIcon" size="22px" :color="sceneColor" class="q-mr-xs" />
        <span>{{ displayName }}</span>
      </div>
      <StatusDisplay 
        :status="nodeStatus" 
        :show-detail="false"
        variant="icon"
      />
    </div>
    
    <!-- 中间：IP 信息 + OS/架构（白色背景）-->
    <div class="card-body">
      <!-- VPN IP -->
      <div class="info-line">
        <q-icon name="vpn_key" size="20px" color="primary" />
        <span class="info-value">{{ node.vpn_ip || node.node_ip || '-' }}</span>
      </div>
      
      <!-- WAN IP (公网) + 系统信息 -->
      <div class="info-line">
        <q-icon name="public" size="20px" color="secondary" />
        <span class="info-value">{{ wanIpDisplay }}</span>
        <div v-if="systemInfo" class="system-badge">
          <q-icon name="desktop_windows" size="16px" />
          <span>{{ systemInfo }}</span>
        </div>
      </div>
      
      <!-- LAN IP (局域网) -->
      <div v-if="lanIpDisplay" class="info-line">
        <q-icon name="router" size="20px" color="teal" />
        <span class="info-value">{{ lanIpDisplay }}</span>
      </div>
      
      <!-- 延迟 + 架构 -->
      <div v-if="latency" class="info-line">
        <q-icon name="speed" size="20px" color="purple" />
        <span class="info-value">{{ latency }}</span>
        <span v-if="architecture" class="arch-badge">{{ architecture }}</span>
      </div>
      
      <!-- VPN 类型 + 连接方式 -->
      <div v-if="connectionType" class="info-line">
        <q-icon name="link" size="20px" color="blue-grey-6" />
        <span class="info-value">{{ connectionType }}</span>
      </div>
    </div>
    
    <!-- 底部：节点ID + 操作（浅灰背景）-->
    <div class="card-footer">
      <div class="node-id-section" @click.stop="copyNodeId">
        <q-icon name="router" size="18px" color="grey-6" />
        <span class="node-id">ID: {{ displayNodeId }}</span>
        <q-tooltip>点击复制 ID</q-tooltip>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions-wrapper">
        <q-btn
          flat
          dense
          round
          color="primary"
          icon="more_horiz"
          size="sm"
          @click.stop
        >
          <q-menu anchor="top right" self="bottom right">
            <q-list dense style="min-width: 140px">
              <q-item clickable v-close-popup @click.stop="$emit('edit', node)">
                <q-item-section avatar>
                  <q-icon name="edit" size="20px" />
                </q-item-section>
                <q-item-section>编辑</q-item-section>
              </q-item>
              
              <q-separator v-if="!isUnconfigured" />
              
              <!-- 状态切换 -->
              <template v-if="!isUnconfigured">
                <q-item 
                  v-if="isOnline || isEnabled"
                  clickable 
                  v-close-popup
                  @click.stop="$emit('disable', node)"
                >
                  <q-item-section avatar>
                    <q-icon name="power_off" color="negative" size="20px" />
                  </q-item-section>
                  <q-item-section>禁用</q-item-section>
                </q-item>
                
                <q-item 
                  v-else
                  clickable 
                  v-close-popup
                  @click.stop="$emit('enable', node)"
                >
                  <q-item-section avatar>
                    <q-icon name="power_settings_new" color="positive" size="20px" />
                  </q-item-section>
                  <q-item-section>启用</q-item-section>
                </q-item>
                
                <q-separator />
                
                <!-- 节点操作 -->
                <q-item clickable v-close-popup @click.stop="$emit('start', node)">
                  <q-item-section avatar>
                    <q-icon name="play_arrow" color="positive" size="20px" />
                  </q-item-section>
                  <q-item-section>启动</q-item-section>
                </q-item>
                
                <q-item clickable v-close-popup @click.stop="$emit('stop', node)">
                  <q-item-section avatar>
                    <q-icon name="stop" color="negative" size="20px" />
                  </q-item-section>
                  <q-item-section>停止</q-item-section>
                </q-item>
                
                <q-item clickable v-close-popup @click.stop="$emit('restart', node)">
                  <q-item-section avatar>
                    <q-icon name="refresh" color="orange" size="20px" />
                  </q-item-section>
                  <q-item-section>重启</q-item-section>
                </q-item>
              </template>
              
              <q-separator />
              
              <q-item clickable v-close-popup @click.stop="$emit('delete', node)">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" size="20px" />
                </q-item-section>
                <q-item-section class="text-negative">删除</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Node } from '../../types/node'
import { NODE_STATUS } from '../../types/node'
import StatusDisplay from '../common/StatusDisplay.vue'
import { 
  getUserFriendlyStatus, 
  getPrimaryActionConfig,
  isStatusConnectable 
} from '../../utils/statusMapping'
import { parseSceneInfo, formatSceneInfo, getSceneIcon, getSceneColor } from '../../utils/sceneParser'

/**
 * 节点卡片内容组件（参考截图风格）
 * 
 * 设计原则：
 * 1. 展示所有技术信息，不折叠
 * 2. 保留完整的功能按钮（启用、禁用、启动、停止、重启）
 * 3. 参考截图的清新风格
 * 
 * 配合 ResponsiveCardGrid 使用
 */

interface Props {
  node: Node
}

interface Emits {
  (e: 'connect', node: Node): void
  (e: 'enable', node: Node): void
  (e: 'disable', node: Node): void
  (e: 'configure', node: Node): void
  (e: 'view-details', node: Node): void
  (e: 'edit', node: Node): void
  (e: 'start', node: Node): void
  (e: 'stop', node: Node): void
  (e: 'restart', node: Node): void
  (e: 'delete', node: Node): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取节点状态（兼容多种字段名）
const nodeStatus = computed(() => {
  return props.node.node_status ?? props.node.status ?? NODE_STATUS.UNCONFIGURED
})

// 状态判断
const isOnline = computed(() => nodeStatus.value === NODE_STATUS.ONLINE)
const isEnabled = computed(() => nodeStatus.value === NODE_STATUS.ENABLED)
const isDisabled = computed(() => nodeStatus.value === NODE_STATUS.DISABLED)
const isUnconfigured = computed(() => nodeStatus.value === NODE_STATUS.UNCONFIGURED)

// 解析场景信息
const sceneInfo = computed(() => parseSceneInfo(props.node.node_name))
const sceneIcon = computed(() => getSceneIcon(sceneInfo.value))
const sceneColor = computed(() => getSceneColor(sceneInfo.value))

// 显示名称（优先使用场景位置，否则使用节点名称）
const displayName = computed(() => {
  if (sceneInfo.value.location) {
    return sceneInfo.value.location
  }
  return props.node.node_name
})

// WAN IP 显示（公网IP）
const wanIpDisplay = computed(() => {
  // 优先使用 endpoint 字段
  if (props.node.endpoint) {
    return props.node.endpoint
  }
  // 其次组合 endpoint_ip 和 endpoint_port
  if (props.node.endpoint_ip) {
    if (props.node.endpoint_port) {
      return `${props.node.endpoint_ip}:${props.node.endpoint_port}`
    }
    return props.node.endpoint_ip
  }
  // 再次使用 public_ip
  if (props.node.public_ip) {
    return props.node.public_ip
  }
  // 最后尝试 wan_ip
  if (props.node.wan_ip) {
    return props.node.wan_ip
  }
  return '-'
})

// LAN IP 显示（局域网IP）
const lanIpDisplay = computed(() => {
  // 优先使用 local_ips（设备信息）
  if (props.node.local_ips) {
    // 如果是字符串形式JSON，需要解析
    if (typeof props.node.local_ips === 'string') {
      try {
        const ips = JSON.parse(props.node.local_ips)
        if (Array.isArray(ips) && ips.length > 0) {
          return ips[0]
        }
      } catch (e) {
        // 如果不是JSON，直接返回
        return props.node.local_ips
      }
    }
    // 如果已经是数组
    if (Array.isArray(props.node.local_ips) && props.node.local_ips.length > 0) {
      return props.node.local_ips[0]
    }
  }
  // 其次使用 lan_ips 数组
  if (props.node.lan_ips) {
    if (typeof props.node.lan_ips === 'string') {
      try {
        const ips = JSON.parse(props.node.lan_ips)
        if (Array.isArray(ips) && ips.length > 0) {
          return ips[0]
        }
      } catch (e) {
        return props.node.lan_ips
      }
    }
    if (Array.isArray(props.node.lan_ips) && props.node.lan_ips.length > 0) {
      return props.node.lan_ips[0]
    }
  }
  return null
})

// 延迟信息
const latency = computed(() => {
  // 优先使用 stats.latency
  if (props.node.stats?.latency !== undefined && props.node.stats.latency !== null) {
    return `${props.node.stats.latency} ms`
  }
  // 其次使用直接的 latency 字段
  if (props.node.latency !== undefined && props.node.latency !== null) {
    return `${props.node.latency} ms`
  }
  return null
})

// 系统信息（OS + 设备类型）
const systemInfo = computed(() => {
  const parts: string[] = []
  
  // 操作系统名称（只显示主名称，不显示版本）
  if (props.node.os_name) {
    // 提取第一个单词，如 "Debian GNU/Linux 12 (bookworm)" -> "Debian"
    const osName = props.node.os_name.split(/[\s\/]/)[0]
    parts.push(osName)
  }
  
  // 设备类型（从场景解析）
  if (sceneInfo.value.device) {
    parts.push(`(${sceneInfo.value.device})`)
  }
  
  return parts.length > 0 ? parts.join(' ') : null
})

// 架构信息（使用cpu_arch字段）
const architecture = computed(() => {
  return props.node.cpu_arch || props.node.system_arch || props.node.architecture || null
})

// 连接方式
const connectionType = computed(() => {
  // VPN 类型优先
  if (props.node.vpn_type) {
    return props.node.vpn_type.toUpperCase()
  }
  // 判断是否直连
  if (props.node.direct_connection) {
    return '直连 IPv4'
  }
  // 判断是否 IPv6
  if (props.node.ipv6_enabled) {
    return 'IPv6'
  }
  return null
})

// 显示的节点 ID
const displayNodeId = computed(() => {
  return props.node.node_id?.toString() || props.node.id?.toString() || '-'
})

// 复制节点 ID
const copyNodeId = async () => {
  const id = displayNodeId.value
  if (id && id !== '-') {
    try {
      await navigator.clipboard.writeText(id)
      // TODO: 添加成功提示（可以使用 Quasar Notify）
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/design-tokens.scss';

.node-card-content {
  padding: 0;
  display: flex;
  flex-direction: column;
}

// ===== 顶部：名称 + 状态（浅灰背景）=====
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base - 2px $spacing-base;
  background: var(--color-bg-secondary);
  border-bottom: $border-width solid var(--color-border);
}

.node-name {
  display: flex;
  align-items: center;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: var(--color-text-primary);
  gap: $spacing-sm;
}

// ===== 中间：IP 信息区（白色背景）=====
.card-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm + 2px;
  padding: $spacing-base;
  background: var(--color-bg-tertiary);
}

.info-line {
  display: flex;
  align-items: center;
  gap: $spacing-sm + 2px;
  font-size: $font-size-base;
  
  .q-icon {
    flex-shrink: 0;
  }
}

.info-value {
  flex: 1;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  letter-spacing: 0.2px;
}

// 系统信息标签（显示在 WAN IP 右侧）
.system-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--color-bg-primary);
  border-radius: $radius-base;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: var(--color-text-secondary);
  white-space: nowrap;
  
  .q-icon {
    font-size: 16px;
  }
}

// 架构标签
.arch-badge {
  padding: 4px 10px;
  background: var(--color-bg-primary);
  border-radius: $radius-base;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: var(--color-text-secondary);
}

// ===== 底部：ID + 操作（浅灰背景）=====
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base - 4px $spacing-base;
  background: var(--color-bg-secondary);
  border-top: $border-width solid var(--color-border);
}

.node-id-section {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: $radius-base;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--color-bg-primary);
  }
  
  .node-id {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--color-text-secondary);
    user-select: none;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  }
}

.actions-wrapper {
  display: flex;
  align-items: center;
}
</style>