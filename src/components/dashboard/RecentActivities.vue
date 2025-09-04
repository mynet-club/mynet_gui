<template>
  <q-card class="recent-activities">
    <q-card-section>
      <div class="text-h6">{{ $t('dashboard.recentActivities') }}</div>
    </q-card-section>
    
    <q-card-section>
      <q-list>
        <q-item v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <q-item-section avatar>
            <q-icon 
              :name="getActivityIcon(activity.type)" 
              :color="getActivityColor(activity.type)"
              size="1.5rem"
            />
          </q-item-section>
          
          <q-item-section>
            <q-item-label>{{ activity.message }}</q-item-label>
            <q-item-label caption>
              {{ formatTimestamp(activity.timestamp) }}
            </q-item-label>
          </q-item-section>
        </q-item>
        
        <q-item v-if="recentActivities.length === 0" class="text-center text-grey-6">
          <q-item-section>
            {{ $t('dashboard.noActivities') }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

interface Activity {
  id: number
  type: string
  message: string
  timestamp: Date
}

interface Props {
  recentActivities: Activity[]
}

const props = defineProps<Props>()

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'node_online': return 'wifi'
    case 'node_offline': return 'wifi_off'
    case 'route_created': return 'add_road'
    case 'route_deleted': return 'remove_road'
    case 'user_login': return 'login'
    case 'user_logout': return 'logout'
    default: return 'info'
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'node_online':
    case 'route_created':
    case 'user_login':
      return 'positive'
    case 'node_offline':
    case 'route_deleted':
    case 'user_logout':
      return 'negative'
    default:
      return 'primary'
  }
}

const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const locale = document.documentElement.lang === 'zh-CN' ? zhCN : enUS
  
  return formatDistanceToNow(timestamp, { 
    addSuffix: true, 
    locale 
  })
}
</script>

<style lang="scss" scoped>
.recent-activities {
  .activity-item {
    border-bottom: 1px solid var(--q-grey-3);
    
    &:last-child {
      border-bottom: none;
    }
  }
}
</style> 