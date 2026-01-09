<template>
  <q-banner 
    v-if="shouldShowReminder" 
    class="avatar-reminder"
    dense
    rounded
  >
    <template #avatar>
      <q-avatar color="info" text-color="white" size="48px">
        <q-icon name="account_circle" size="32px" />
      </q-avatar>
    </template>
    
    <div class="reminder-content">
      <div class="reminder-title">完善个人头像，让好友更容易识别你</div>
      <div class="reminder-text">
        设置头像后，你的节点在好友的节点列表中会显示你的头像，更易于识别
      </div>
    </div>
    
    <template #action>
      <q-btn 
        flat 
        dense 
        label="去设置" 
        color="primary"
        @click="goToProfile"
      />
      <q-btn 
        flat 
        dense 
        icon="close"
        @click="dismissReminder"
      />
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 头像提醒横幅组件
 * 
 * 职责：
 * 1. 检测用户是否设置了头像
 * 2. 显示友好的提醒信息
 * 3. 提供快捷跳转到设置页面
 * 4. 支持用户关闭提醒
 * 
 * 使用场景：
 * - Dashboard 顶部
 * - 好友列表页顶部
 * - 好友节点页顶部
 */

interface Props {
  /** 用户头像URL */
  userAvatar?: string
  
  /** 存储键名（用于记录是否已关闭）*/
  storageKey?: string
  
  /** 是否强制显示（忽略关闭状态）*/
  forceShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: 'avatar-reminder-dismissed',
  forceShow: false
})

const router = useRouter()

// 是否应该显示提醒
const shouldShowReminder = computed(() => {
  // 如果强制显示，直接返回true
  if (props.forceShow) {
    return !props.userAvatar
  }
  
  // 检查用户是否有头像
  const hasAvatar = !!props.userAvatar
  if (hasAvatar) {
    return false
  }
  
  // 检查是否已经关闭过提醒
  const dismissed = localStorage.getItem(props.storageKey)
  if (dismissed === 'true') {
    return false
  }
  
  return true
})

// 跳转到个人资料页
const goToProfile = () => {
  router.push('/app/profile')
}

// 关闭提醒
const dismissReminder = () => {
  localStorage.setItem(props.storageKey, 'true')
  // 强制重新计算 shouldShowReminder
  // 由于我们直接修改了 localStorage，Vue 不会自动检测到变化
  // 这里通过刷新页面或触发父组件重新渲染来隐藏横幅
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.avatar-reminder {
  margin-bottom: var(--soft-spacing-lg, 1.5rem);
  background: linear-gradient(
    135deg,
    var(--soft-info-bg, #ebf8ff) 0%,
    var(--soft-bg-card, #ffffff) 100%
  );
  border-left: 4px solid var(--q-info);
  box-shadow: var(--soft-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.05));
  
  .reminder-content {
    flex: 1;
    
    .reminder-title {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--soft-text-primary, #2d3748);
      margin-bottom: 0.25rem;
    }
    
    .reminder-text {
      font-size: 0.875rem;
      color: var(--soft-text-secondary, #718096);
      line-height: 1.5;
    }
  }
  
  :deep(.q-banner__actions) {
    align-items: center;
  }
}

// 深色模式适配
.body--dark {
  .avatar-reminder {
    background: linear-gradient(
      135deg,
      rgba(66, 153, 225, 0.15) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    
    .reminder-content {
      .reminder-title {
        color: var(--soft-text-primary-dark, #e2e8f0);
      }
      
      .reminder-text {
        color: var(--soft-text-secondary-dark, #a0aec0);
      }
    }
  }
}
</style>
