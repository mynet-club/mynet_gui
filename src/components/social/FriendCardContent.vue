<template>
  <q-card class="friend-card-content" flat bordered>
    <!-- 好友头像 -->
    <div class="friend-avatar-section">
      <q-avatar size="80px" class="friend-avatar">
        <img 
          v-if="friend.avatar" 
          :src="friend.avatar" 
          :alt="displayName"
        />
        <q-icon 
          v-else 
          name="account_circle" 
          size="80px"
          color="grey-5"
        />
      </q-avatar>
      
      <!-- 在线状态指示器 -->
      <div 
        v-if="hasOnlineNodes" 
        class="online-indicator"
        :class="{ 'pulse': hasOnlineNodes }"
      >
        <q-tooltip>有 {{ onlineNodeCount }} 个节点在线</q-tooltip>
      </div>
    </div>
    
    <!-- 好友信息 -->
    <q-card-section class="friend-info-section">
      <div class="friend-name">{{ displayName }}</div>
      
      <div class="friend-stats">
        <div class="stat-item">
          <q-icon name="router" size="16px" />
          <span>{{ nodeCount }} 个节点</span>
        </div>
        
        <div v-if="hasOnlineNodes" class="stat-item online">
          <q-icon name="wifi" size="16px" color="positive" />
          <span>{{ onlineNodeCount }} 在线</span>
        </div>
      </div>
      
      <!-- 标签 -->
      <div v-if="friend.tags && friend.tags.length > 0" class="friend-tags">
        <q-chip 
          v-for="tag in friend.tags.slice(0, 3)" 
          :key="tag"
          dense
          size="sm"
          color="primary"
          text-color="white"
        >
          {{ tag }}
        </q-chip>
        <q-chip 
          v-if="friend.tags.length > 3"
          dense
          size="sm"
          color="grey-3"
          text-color="grey-7"
        >
          +{{ friend.tags.length - 3 }}
        </q-chip>
      </div>
      
      <!-- 备注 -->
      <div v-if="friend.remark" class="friend-remark">
        <q-icon name="sticky_note_2" size="14px" />
        {{ friend.remark }}
      </div>
    </q-card-section>
    
    <!-- 操作按钮 -->
    <q-card-actions align="center">
      <q-btn
        flat
        dense
        color="primary"
        icon="chat"
        label="发消息"
        @click="handleSendMessage"
      />
      <q-btn
        flat
        dense
        color="primary"
        icon="visibility"
        label="查看详情"
        @click="handleViewDetails"
      />
      
      <q-space />
      
      <!-- 更多菜单 -->
      <q-btn flat dense round icon="more_vert">
        <q-menu>
          <q-list dense style="min-width: 140px">
            <q-item 
              clickable 
              v-close-popup
              @click="handleViewNodes"
            >
              <q-item-section avatar>
                <q-icon name="router" size="20px" />
              </q-item-section>
              <q-item-section>查看节点</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              v-close-popup
              @click="handleEditRemark"
            >
              <q-item-section avatar>
                <q-icon name="edit_note" size="20px" />
              </q-item-section>
              <q-item-section>编辑备注</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              v-close-popup
              @click="handleEditTags"
            >
              <q-item-section avatar>
                <q-icon name="label" size="20px" />
              </q-item-section>
              <q-item-section>编辑标签</q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item 
              clickable 
              v-close-popup
              @click="handleRemoveFriend"
            >
              <q-item-section avatar>
                <q-icon name="person_remove" size="20px" color="negative" />
              </q-item-section>
              <q-item-section class="text-negative">删除好友</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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
.friend-card-content {
  background: var(--soft-bg-card, #ffffff);
  border-radius: var(--soft-radius-lg, 16px);
  border: 1px solid var(--soft-border-light, #e2e8f0);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: var(--soft-shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.08));
    transform: translateY(-2px);
  }
  
  // 头像区域
  .friend-avatar-section {
    position: relative;
    padding: 2rem 1.5rem 1rem;
    text-align: center;
    background: linear-gradient(
      135deg,
      var(--soft-bg-primary, #f5f7fa) 0%,
      var(--soft-bg-card, #ffffff) 100%
    );
    
    .friend-avatar {
      border: 3px solid var(--soft-bg-card, #ffffff);
      box-shadow: var(--soft-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.05));
    }
    
    // 在线状态指示器
    .online-indicator {
      position: absolute;
      bottom: 1.25rem;
      left: 50%;
      transform: translateX(10px);
      width: 16px;
      height: 16px;
      background-color: var(--q-positive);
      border: 3px solid var(--soft-bg-card, #ffffff);
      border-radius: 50%;
      
      &.pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    }
  }
  
  // 好友信息区域
  .friend-info-section {
    padding: 1rem 1.5rem;
    
    .friend-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--soft-text-primary, #2d3748);
      text-align: center;
      margin-bottom: 0.75rem;
      
      // 文本溢出处理
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .friend-stats {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--soft-text-secondary, #718096);
        
        &.online {
          color: var(--q-positive);
          font-weight: 500;
        }
      }
    }
    
    .friend-tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }
    
    .friend-remark {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      color: var(--soft-text-tertiary, #a0aec0);
      font-style: italic;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--soft-bg-secondary, #f9fafb);
      border-radius: var(--soft-radius-md, 8px);
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
    
    .friend-avatar-section {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.02) 100%
      );
      
      .friend-avatar {
        border-color: var(--soft-bg-card-dark, #1e293b);
      }
      
      .online-indicator {
        border-color: var(--soft-bg-card-dark, #1e293b);
      }
    }
    
    .friend-info-section {
      .friend-name {
        color: var(--soft-text-primary-dark, #e2e8f0);
      }
      
      .friend-stats {
        .stat-item {
          color: var(--soft-text-secondary-dark, #a0aec0);
        }
      }
      
      .friend-remark {
        color: var(--soft-text-tertiary-dark, #64748b);
        background: var(--soft-bg-secondary-dark, #0f172a);
      }
    }
  }
}
</style>
