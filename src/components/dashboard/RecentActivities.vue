<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">
          <q-icon name="history" class="q-mr-sm" />
          最近活动
        </div>
        <q-chip size="sm" color="primary" text-color="white" dense>
          <q-icon name="sensors" size="14px" class="q-mr-xs" />
          实时监控
        </q-chip>
      </div>
    </q-card-section>
    
    <q-separator />
    
    <q-card-section class="q-pa-none">
      <q-list v-if="displayActivities.length > 0" separator>
        <q-item 
          v-for="activity in displayActivities" 
          :key="activity.id" 
          class="activity-item"
          :clickable="!!activity.link"
          @click="handleActivityClick(activity)"
        >
          <q-item-section avatar>
            <q-avatar :color="getActivityColor(activity.type)" size="36px">
              <q-icon :name="getActivityIcon(activity.type)" color="white" size="20px" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label>{{ activity.message }}</q-item-label>
            <q-item-label caption>
              {{ formatTimestamp(activity.timestamp) }}
            </q-item-label>
          </q-item-section>
          
          <q-item-section side v-if="activity.link">
            <q-icon name="arrow_forward" color="grey-5" size="18px" />
          </q-item-section>
        </q-item>
      </q-list>
      
      <!-- 空状态 -->
      <div v-else class="empty-state q-pa-lg text-center">
        <q-icon name="history" size="64px" color="grey-4" />
        <div class="text-grey-6 q-mt-md">暂无活动记录</div>
        <div class="text-caption text-grey-5 q-mt-xs">
          系统变化将自动记录在此
        </div>
      </div>
    </q-card-section>
    
    <!-- 查看更多 -->
    <q-card-actions v-if="recentActivities.length > maxDisplay" align="center">
      <q-btn
        flat
        dense
        :label="`查看全部 ${recentActivities.length} 条活动`"
        icon-right="expand_more"
        color="primary"
        @click="showAllActivities"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import type { Activity, ActivityType } from '../../types/dashboard'
import { ACTIVITY_CONFIG } from '../../types/dashboard'

interface Props {
  recentActivities: Activity[]
  maxDisplay?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 10
})

const router = useRouter()

// 显示的活动（限制数量）
const displayActivities = computed(() => {
  return props.recentActivities.slice(0, props.maxDisplay)
})

// 获取活动图标
const getActivityIcon = (type: ActivityType): string => {
  return ACTIVITY_CONFIG[type]?.icon || 'info'
}

// 获取活动颜色
const getActivityColor = (type: ActivityType): string => {
  return ACTIVITY_CONFIG[type]?.color || 'primary'
}

// 格式化时间戳
const formatTimestamp = (timestamp: Date) => {
  const locale = document.documentElement.lang === 'zh-CN' ? zhCN : enUS
  
  try {
    return formatDistanceToNow(timestamp, { 
      addSuffix: true, 
      locale 
    })
  } catch (error) {
    return '刚刚'
  }
}

// 处理活动点击
const handleActivityClick = (activity: Activity) => {
  if (activity.link) {
    router.push(activity.link)
  }
}

// 查看全部活动（将来可以打开一个模态框或新页面）
const showAllActivities = () => {
  // TODO: 实现全部活动查看功能
  console.log('查看全部活动')
}
</script>

<style lang="scss" scoped>
.activity-item {
  transition: background-color 0.2s ease;
  
  &.q-item--clickable:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style> 