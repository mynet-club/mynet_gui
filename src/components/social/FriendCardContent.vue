<template>
  <div class="friend-card-content">
    <!-- 顶部：头像 + 名称 + 在线状态（浅灰背景）-->
    <div class="card-header">
      <div class="friend-avatar-wrapper">
        <q-avatar size="48px" class="friend-avatar">
          <img 
            v-if="friend.avatar" 
            :src="friend.avatar" 
            :alt="displayName"
          />
          <q-icon 
            v-else 
            name="account_circle" 
            size="48px"
            color="grey-5"
          />
        </q-avatar>
        
        <!-- 在线状态指示器 -->
        <div 
          v-if="hasOnlineNodes" 
          class="online-indicator"
          :class="{ 'pulse': hasOnlineNodes }"
        >
          <q-tooltip>{{ $t('social.onlineNodes', { count: onlineNodeCount }) }}</q-tooltip>
        </div>
      </div>
      
      <div class="friend-name-section">
        <div class="friend-name">{{ displayName }}</div>
        <div v-if="friend.email" class="friend-email">{{ friend.email }}</div>
      </div>
    </div>
    
    <!-- 中间：节点信息 + 标签（白色背景）-->
    <div class="card-body">
      <!-- 节点统计 -->
      <div class="info-line">
        <q-icon name="router" size="18px" color="primary" />
        <span class="info-value">{{ nodeCount }} {{ $t('social.nodes') }}</span>
        <div v-if="hasOnlineNodes" class="online-badge">
          <q-icon name="wifi" size="12px" />
          <span>{{ onlineNodeCount }}</span>
        </div>
      </div>
      
      <!-- 标签 -->
      <div v-if="friend.tags && friend.tags.length > 0" class="info-line">
        <q-icon name="label" size="18px" color="secondary" />
        <div class="friend-tags">
          <q-chip 
            v-for="tag in friend.tags.slice(0, 3)" 
            :key="tag"
            dense
            size="sm"
            outline
            color="primary"
          >
            {{ tag }}
          </q-chip>
          <q-chip 
            v-if="friend.tags.length > 3"
            dense
            size="sm"
            outline
            color="grey-6"
          >
            +{{ friend.tags.length - 3 }}
          </q-chip>
        </div>
      </div>
      
      <!-- 备注 -->
      <div v-if="friend.remark" class="info-line">
        <q-icon name="sticky_note_2" size="18px" color="orange" />
        <span class="info-value remark-text">{{ friend.remark }}</span>
      </div>
    </div>
    
    <!-- 底部：成为好友时间 + 操作（浅灰背景）-->
    <div class="card-footer">
      <div class="friend-meta">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span class="meta-text">
          {{ $t('social.friendSince', { date: friendSince }) }}
        </span>
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
            <q-list dense style="min-width: 160px">
              <q-item clickable v-close-popup @click="handleViewNodes">
                <q-item-section avatar>
                  <q-icon name="router" size="20px" />
                </q-item-section>
                <q-item-section>{{ $t('social.viewNodes') }}</q-item-section>
              </q-item>
              
              <q-item clickable v-close-popup @click="handleViewDetails">
                <q-item-section avatar>
                  <q-icon name="visibility" size="20px" />
                </q-item-section>
                <q-item-section>{{ $t('common.viewDetails') }}</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable v-close-popup @click="handleEditRemark">
                <q-item-section avatar>
                  <q-icon name="edit_note" size="20px" />
                </q-item-section>
                <q-item-section>{{ $t('social.editRemark') }}</q-item-section>
              </q-item>
              
              <q-item clickable v-close-popup @click="handleEditTags">
                <q-item-section avatar>
                  <q-icon name="label" size="20px" />
                </q-item-section>
                <q-item-section>{{ $t('social.editTags') }}</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable v-close-popup @click="handleRemoveFriend">
                <q-item-section avatar>
                  <q-icon name="person_remove" size="20px" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">{{ $t('social.removeFriend') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 好友卡片内容组件
 * 
 * 职责：
 * 1. 显示好友基本信息（头像、名称、备注）
 * 2. 显示好友节点统计（总数、在线数）
 * 3. 显示在线状态指示器
 * 4. 提供快捷操作（发消息、查看详情、查看节点）
 * 5. 提供更多操作（编辑备注、编辑标签、删除好友）
 * 
 * 使用场景：
 * - 好友列表页
 * - Dashboard 好友卡片
 */

interface Friend {
  id: number | string
  name: string
  email?: string
  avatar?: string
  remark?: string
  tags?: string[]
  created_at?: string
  node_count?: number
  online_node_count?: number
}

interface Props {
  /** 好友数据 */
  friend: Friend
}

interface Emits {
  (e: 'send-message', friendId: number | string): void
  (e: 'view-details', friendId: number | string): void
  (e: 'view-nodes', friendId: number | string): void
  (e: 'edit-remark', friendId: number | string): void
  (e: 'edit-tags', friendId: number | string): void
  (e: 'remove-friend', friendId: number | string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

// 显示名称（优先使用备注，否则使用用户名）
const displayName = computed(() => {
  return props.friend.remark || props.friend.name
})

// 节点数量
const nodeCount = computed(() => {
  return props.friend.node_count || 0
})

// 在线节点数量
const onlineNodeCount = computed(() => {
  return props.friend.online_node_count || 0
})

// 是否有在线节点
const hasOnlineNodes = computed(() => {
  return onlineNodeCount.value > 0
})

// 成为好友的时间（格式化）
const friendSince = computed(() => {
  if (!props.friend.created_at) return '-'
  try {
    return formatDistanceToNow(new Date(props.friend.created_at), {
      addSuffix: true,
      locale: zhCN
    })
  } catch {
    return '-'
  }
})

// 发送消息
const handleSendMessage = () => {
  emit('send-message', props.friend.id)
  // TODO: 实现消息功能后，可以直接跳转到聊天页面
  // router.push(`/app/messages/${props.friend.id}`)
}

// 查看详情
const handleViewDetails = () => {
  emit('view-details', props.friend.id)
  router.push(`/app/social/friends/${props.friend.id}`)
}

// 查看节点
const handleViewNodes = () => {
  emit('view-nodes', props.friend.id)
  router.push(`/app/routes/friend-nodes?friend_id=${props.friend.id}`)
}

// 编辑备注
const handleEditRemark = () => {
  emit('edit-remark', props.friend.id)
}

// 编辑标签
const handleEditTags = () => {
  emit('edit-tags', props.friend.id)
}

// 删除好友
const handleRemoveFriend = () => {
  emit('remove-friend', props.friend.id)
}
</script>

<style lang="scss" scoped>
@import '../../styles/design-tokens.scss';

.friend-card-content {
  background: var(--soft-bg-card, #ffffff);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 顶部：头像 + 名称（浅灰背景）
  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-base - 2px $spacing-base;
    background: var(--soft-bg-secondary, #f5f7fa);
    border-bottom: 1px solid var(--soft-border-light, #e2e8f0);
    
    .friend-avatar-wrapper {
      position: relative;
      flex-shrink: 0;
      
      .friend-avatar {
        border: 2px solid var(--soft-bg-card, #ffffff);
        box-shadow: var(--soft-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.05));
      }
      
      // 在线状态指示器
      .online-indicator {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        background-color: var(--q-positive);
        border: 2px solid var(--soft-bg-secondary, #f5f7fa);
        border-radius: 50%;
        
        &.pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      }
    }
    
    .friend-name-section {
      flex: 1;
      min-width: 0;
      
      .friend-name {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: var(--soft-text-primary, #2d3748);
        margin-bottom: $spacing-xs - 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .friend-email {
        font-size: $font-size-sm;
        color: var(--soft-text-tertiary, #a0aec0);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  // 中间：节点信息 + 标签（白色背景）
  .card-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm + 2px;
    padding: $spacing-base;
    background: var(--soft-bg-card, #ffffff);
    
    .info-line {
      display: flex;
      align-items: center;
      gap: $spacing-sm + 2px;
      
      .info-value {
        flex: 1;
        font-size: $font-size-base;
        color: var(--soft-text-secondary, #718096);
        
        &.remark-text {
          font-style: italic;
          color: var(--soft-text-tertiary, #a0aec0);
        }
      }
      
      .online-badge {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        padding: 4px 10px;
        background: var(--q-positive);
        color: white;
        border-radius: $radius-base;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        white-space: nowrap;
      }
      
      .friend-tags {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;
      }
    }
  }
  
  // 底部：元信息 + 操作（浅灰背景）
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base - 4px $spacing-base;
    background: var(--soft-bg-secondary, #f5f7fa);
    border-top: 1px solid var(--soft-border-light, #e2e8f0);
    
    .friend-meta {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      
      .meta-text {
        font-size: $font-size-sm;
        color: var(--soft-text-tertiary, #a0aec0);
      }
    }
    
    .actions-wrapper {
      display: flex;
      gap: $spacing-sm;
    }
  }
}

// 脉动动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 深色模式适配
.body--dark {
  .friend-card-content {
    background: var(--soft-bg-card-dark, #1e293b);
    border-color: var(--soft-border-dark, #334155);
    
    &:hover {
      box-shadow: var(--soft-shadow-lg-dark, 0 10px 15px rgba(0, 0, 0, 0.3));
    }
    
    .card-header {
      background: var(--soft-bg-secondary-dark, #0f172a);
      border-color: var(--soft-border-dark, #334155);
      
      .friend-avatar {
        border-color: var(--soft-bg-card-dark, #1e293b);
      }
      
      .online-indicator {
        border-color: var(--soft-bg-secondary-dark, #0f172a);
      }
      
      .friend-name-section {
        .friend-name {
          color: var(--soft-text-primary-dark, #e2e8f0);
        }
        
        .friend-email {
          color: var(--soft-text-tertiary-dark, #64748b);
        }
      }
    }
    
    .card-body {
      background: var(--soft-bg-card-dark, #1e293b);
      
      .info-value {
        color: var(--soft-text-secondary-dark, #a0aec0);
        
        &.remark-text {
          color: var(--soft-text-tertiary-dark, #64748b);
        }
      }
    }
    
    .card-footer {
      background: var(--soft-bg-secondary-dark, #0f172a);
      border-color: var(--soft-border-dark, #334155);
      
      .meta-text {
        color: var(--soft-text-tertiary-dark, #64748b);
      }
    }
  }
}
</style>
