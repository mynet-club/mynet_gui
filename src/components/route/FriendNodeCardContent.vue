<template>
  <q-card-section class="friend-node-card-content">
    <!-- 主信息层 -->
    <div class="primary-info">
      <div class="node-header">
        <h3 class="node-name">{{ displayName }}</h3>
        <StatusDisplay 
          :status="nodeStatus" 
          :show-detail="false"
          variant="chip"
        />
      </div>
      
      <!-- 场景信息（智能解析）-->
      <div v-if="sceneText" class="scene-info">
        <q-icon :name="sceneIcon" size="14px" :color="sceneColor" />
        <span>{{ sceneText }}</span>
      </div>
      
      <!-- 最后在线时间 -->
      <div v-if="lastSeenText" class="secondary-info">
        <q-icon name="schedule" size="14px" />
        <span>{{ lastSeenText }}</span>
      </div>
    </div>
    
    <!-- 技术信息层（默认折叠）-->
    <q-expansion-item
      dense
      header-class="text-caption text-soft-tertiary"
      class="technical-section"
      label="技术详情"
      icon="code"
    >
      <div class="technical-details">
        <div v-if="node.vpn_type" class="detail-row">
          <span class="label">VPN类型</span>
          <span class="value">{{ node.vpn_type?.toUpperCase() }}</span>
        </div>
        <div v-if="node.endpoint" class="detail-row">
          <span class="label">Endpoint</span>
          <span class="value">{{ node.endpoint }}</span>
        </div>
        <div v-if="node.node_ip" class="detail-row">
          <span class="label">节点IP</span>
          <span class="value">{{ node.node_ip }}</span>
        </div>
        <div v-if="node.last_seen" class="detail-row">
          <span class="label">最后在线</span>
          <span class="value">{{ formatLastSeen(node.last_seen) }}</span>
        </div>
      </div>
    </q-expansion-item>
    
    <!-- 好友信息区（底部）-->
    <div class="friend-info-section">
      <div class="friend-wrapper">
        <q-avatar size="32px" class="friend-avatar">
          <img 
            v-if="friendAvatar" 
            :src="friendAvatar" 
            :alt="friendName"
          />
          <q-icon v-else name="person" size="20px" />
        </q-avatar>
        <div class="friend-details">
          <div class="friend-name">{{ friendName }}</div>
          <div v-if="!friendAvatar && showAvatarHint" class="avatar-hint">
            <q-icon name="info" size="12px" />
            <span>建议完善头像</span>
          </div>
        </div>
      </div>
    </div>
  </q-card-section>
  
  <!-- 操作区 -->
  <q-separator />
  <q-card-actions align="between">
    <!-- 主操作按钮 -->
    <q-btn
      v-if="isConnectable"
      unelevated
      color="positive"
      icon="link"
      label="连接"
      @click="$emit('connect', node)"
      class="primary-action"
    />
    <q-btn
      v-else
      unelevated
      disable
      color="grey"
      icon="block"
      label="不可用"
      class="primary-action"
    />
    
    <!-- 更多操作菜单 -->
    <q-btn flat dense round icon="more_vert" class="more-actions">
      <q-menu>
        <q-list dense>
          <q-item clickable @click="$emit('view-details', node)">
            <q-item-section avatar>
              <q-icon name="visibility" size="18px" />
            </q-item-section>
            <q-item-section>查看详情</q-item-section>
          </q-item>
          
          <q-item clickable @click="handleViewFriend">
            <q-item-section avatar>
              <q-icon name="person" size="18px" />
            </q-item-section>
            <q-item-section>查看好友</q-item-section>
          </q-item>
          
          <q-separator />
          
          <q-item clickable @click="handleCopyInfo">
            <q-item-section avatar>
              <q-icon name="content_copy" size="18px" />
            </q-item-section>
            <q-item-section>复制信息</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </q-card-actions>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useQuasar } from 'quasar'
import { NODE_STATUS } from '../../types/node'
import StatusDisplay from '../common/StatusDisplay.vue'
import { isStatusConnectable, getUserFriendlyStatus } from '../../utils/statusMapping'
import { parseSceneInfo, formatSceneInfo, getSceneIcon, getSceneColor } from '../../utils/sceneParser'

/**
 * 好友节点卡片内容组件
 * 
 * 设计原则：
 * 1. 社交化优先：底部显示好友头像和名称
 * 2. 场景信息智能解析：从节点名称提取地理/场景/设备
 * 3. 操作简化：1个主操作按钮（连接/不可用）
 * 4. 技术信息折叠：默认隐藏技术参数
 * 
 * 配合 ResponsiveCardGrid 使用
 */

interface Props {
  node: any
  friendName: string
  friendAvatar?: string
  friendId?: string | number
  showAvatarHint?: boolean
}

interface Emits {
  (e: 'connect', node: any): void
  (e: 'view-details', node: any): void
}

const props = withDefaults(defineProps<Props>(), {
  showAvatarHint: true
})

const emit = defineEmits<Emits>()
const router = useRouter()
const $q = useQuasar()

// 显示名称
const displayName = computed(() => {
  return props.node.node_name || props.node.name || '未命名节点'
})

// 获取节点状态
const nodeStatus = computed(() => {
  return props.node.node_status ?? props.node.status ?? NODE_STATUS.UNCONFIGURED
})

// 场景信息解析
const sceneInfo = computed(() => parseSceneInfo(displayName.value))

const sceneText = computed(() => formatSceneInfo(sceneInfo.value))

const sceneIcon = computed(() => getSceneIcon(sceneInfo.value))

const sceneColor = computed(() => getSceneColor(sceneInfo.value))

// 是否可连接
const isConnectable = computed(() => {
  return isStatusConnectable(nodeStatus.value)
})

// 最后在线时间
const lastSeenText = computed(() => {
  const lastSeen = props.node.last_seen
  if (!lastSeen) return null
  
  try {
    const date = new Date(lastSeen)
    return `最后在线: ${formatDistanceToNow(date, { addSuffix: true, locale: zhCN })}`
  } catch {
    return null
  }
})

// 格式化最后在线时间（用于技术详情）
const formatLastSeen = (lastSeen: string | null) => {
  if (!lastSeen) return '从未在线'
  
  try {
    const date = new Date(lastSeen)
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
  } catch {
    return lastSeen
  }
}

// 查看好友资料
const handleViewFriend = () => {
  if (props.friendId) {
    router.push(`/app/social/friends/${props.friendId}`)
  }
}

// 复制节点信息
const handleCopyInfo = () => {
  const statusInfo = getUserFriendlyStatus(nodeStatus.value)
  const info = `节点：${displayName.value}\n状态：${statusInfo.text}\n好友：${props.friendName}\n${sceneText.value ? `场景：${sceneText.value}\n` : ''}`
  
  navigator.clipboard.writeText(info).then(() => {
    $q.notify({
      type: 'positive',
      message: '信息已复制',
      position: 'top',
      timeout: 1500
    })
  })
}
</script>

<style lang="scss" scoped>
.friend-node-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--soft-spacing-md, 1rem);
  padding: var(--soft-spacing-lg, 1.5rem);
}

.primary-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    
    .node-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--soft-text-primary, #2d3748);
      margin: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .scene-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--soft-text-primary, #2d3748);
  }
  
  .secondary-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--soft-text-secondary, #718096);
  }
}

.technical-section {
  margin-top: 0.5rem;
  
  :deep(.q-expansion-item__container) {
    border: 1px solid var(--soft-border-light, #e2e8f0);
    border-radius: var(--soft-radius-md, 8px);
    overflow: hidden;
  }
}

.technical-details {
  padding: var(--soft-spacing-md, 1rem);
  background-color: var(--soft-bg-hover, #f7fafc);
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    font-size: 0.8125rem;
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--soft-border-light, #e2e8f0);
    }
    
    .label {
      color: var(--soft-text-tertiary, #a0aec0);
      min-width: 80px;
    }
    
    .value {
      color: var(--soft-text-secondary, #718096);
      font-family: monospace;
      text-align: right;
      word-break: break-all;
    }
  }
}

.friend-info-section {
  padding-top: var(--soft-spacing-sm, 0.5rem);
  margin-top: var(--soft-spacing-sm, 0.5rem);
  border-top: 1px solid var(--soft-border-light, #e2e8f0);
  
  .friend-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .friend-avatar {
      border: 2px solid white;
      box-shadow: var(--soft-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
      background-color: var(--soft-bg-secondary, #e8ecf1);
      
      .q-icon {
        color: var(--soft-text-tertiary, #a0aec0);
      }
    }
    
    .friend-details {
      flex: 1;
      
      .friend-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--soft-text-primary, #2d3748);
      }
      
      .avatar-hint {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--soft-warning, #ed8936);
        margin-top: 0.125rem;
      }
    }
  }
}

.q-card-actions {
  padding: var(--soft-spacing-md, 1rem) var(--soft-spacing-lg, 1.5rem);
  
  .primary-action {
    flex: 1;
    max-width: 200px;
  }
  
  .more-actions {
    margin-left: auto;
  }
}

// 深色模式适配
.body--dark {
  .friend-node-card-content {
    .primary-info {
      .node-name,
      .scene-info {
        color: var(--soft-text-primary-dark, #e2e8f0);
      }
      
      .secondary-info {
        color: var(--soft-text-secondary-dark, #a0aec0);
      }
    }
  }
  
  .technical-details {
    background-color: rgba(255, 255, 255, 0.05);
    
    .detail-row {
      border-bottom-color: rgba(255, 255, 255, 0.1);
      
      .label {
        color: var(--soft-text-tertiary-dark, #718096);
      }
      
      .value {
        color: var(--soft-text-secondary-dark, #a0aec0);
      }
    }
  }
  
  .friend-info-section {
    border-top-color: rgba(255, 255, 255, 0.1);
    
    .friend-wrapper {
      .friend-avatar {
        border-color: rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .friend-details {
        .friend-name {
          color: var(--soft-text-primary-dark, #e2e8f0);
        }
      }
    }
  }
}
</style>
