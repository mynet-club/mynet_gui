<template>
  <div class="friend-card-content">
    <!-- Header: Avatar + Name + Online Status (light gray background) -->
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
        
        <!-- Online status indicator -->
        <div 
          v-if="isOnline" 
          class="online-indicator"
          :class="{ 'pulse': isOnline }"
        >
          <q-tooltip>{{ $t('social.online') }}</q-tooltip>
        </div>
      </div>
      
      <div class="friend-name-section">
        <div class="friend-name">{{ displayName }}</div>
      </div>
      
      <!-- Action buttons (moved to right side) -->
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
    
    <!-- Middle: Connection stats + Remark + Tags + Email (white background) -->
    <div class="card-body">
      <!-- Connection count statistics -->
      <div class="info-line">
        <q-icon name="link" size="18px" color="primary" />
        <span class="info-value">{{ routeCount }} {{ $t('social.connections') }}</span>
        <div v-if="routeCount > 0" class="active-badge">
          <q-icon name="check_circle" size="12px" />
          <span>{{ $t('social.active') }}</span>
        </div>
      </div>
      
      <!-- Device count statistics -->
      <div class="info-line">
        <q-icon name="router" size="18px" color="secondary" />
        <span class="info-value">{{ nodeCount }} {{ $t('social.nodes') }}</span>
        <div v-if="connectedNodeCount > 0" class="online-badge">
          <q-icon name="wifi" size="12px" />
          <span>{{ connectedNodeCount }}</span>
        </div>
      </div>
      
      <!-- Remark -->
      <div v-if="friend.remark" class="info-line">
        <q-icon name="sticky_note_2" size="18px" color="orange" />
        <span class="info-value remark-text">{{ friend.remark }}</span>
      </div>
      
      <!-- Email -->
      <div v-if="friend.email" class="info-line">
        <q-icon name="email" size="18px" color="blue-grey-6" />
        <span class="info-value email-text">{{ friend.email }}</span>
      </div>
      
      <!-- Tags -->
      <div v-if="friend.tags && friend.tags.length > 0" class="info-line">
        <q-icon name="label" size="18px" color="purple" />
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
    </div>
    
    <!-- Footer: Friends since date (light gray background) -->
    <div class="card-footer">
      <div class="friend-meta">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span class="meta-text">
          {{ $t('social.friendSince', { date: friendSince }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Friend } from '../../types'

/**
 * Friend Card Content Component
 * 
 * Responsibilities:
 * 1. Display friend basic information (avatar, name)
 * 2. Display connection count and device count statistics
 * 3. Display online status indicator
 * 4. Display remark, email, tags and other details
 * 5. Provide action menu (view, edit, delete)
 * 
 * Usage:
 * - Friends list page
 * - Dashboard friend cards
 */

interface Props {
  /** Friend data */
  friend: Friend
}

interface Emits {
  (e: 'send-message', friendId: string): void
  (e: 'view-details', friendId: string): void
  (e: 'view-nodes', friendId: string): void
  (e: 'edit-remark', friendId: string): void
  (e: 'edit-tags', friendId: string): void
  (e: 'remove-friend', friendId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

// Display name (use friend name)
const displayName = computed(() => {
  return props.friend.name
})

// Connection count (priority display)
const routeCount = computed(() => {
  return props.friend.active_route_count || 0
})

// Device count
const nodeCount = computed(() => {
  return props.friend.node_count || 0
})

// Connected device count
const connectedNodeCount = computed(() => {
  return props.friend.connected_node_count || 0
})

// Is online
const isOnline = computed(() => {
  return props.friend.status === 'online'
})

// Friends since date (formatted)
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

// Send message
const handleSendMessage = () => {
  emit('send-message', props.friend.id)
}

// View details
const handleViewDetails = () => {
  emit('view-details', props.friend.id)
  router.push(`/app/social/friends/${props.friend.id}`)
}

// View nodes
const handleViewNodes = () => {
  emit('view-nodes', props.friend.id)
  router.push(`/app/routes/friend-nodes?friend_id=${props.friend.id}`)
}

// Edit remark
const handleEditRemark = () => {
  emit('edit-remark', props.friend.id)
}

// Edit tags
const handleEditTags = () => {
  emit('edit-tags', props.friend.id)
}

// Remove friend
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
  
  // Header: Avatar + Name + Actions (light gray background, single line)
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
      
      // Online status indicator
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .actions-wrapper {
      flex-shrink: 0;
    }
  }
  
  // Middle: Node info + Tags (white background)
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
        
        &.email-text {
          font-size: $font-size-sm;
          color: var(--soft-text-tertiary, #a0aec0);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      
      .active-badge {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        padding: 4px 10px;
        background: var(--q-primary);
        color: white;
        border-radius: $radius-base;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        white-space: nowrap;
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
  
  // Footer: Friends since date (light gray background, single line)
  .card-footer {
    display: flex;
    justify-content: center;
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
  }
}

// Pulse animation
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Dark mode adaptation
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
