<template>
  <q-card class="health-summary standard-card">
    <q-card-section class="card-header">
      <div class="card-title">
        <q-icon 
          :name="getHealthIcon()" 
          :color="getHealthColor()"
          size="18px"
        />
        系统状态
      </div>
      <q-badge 
        :color="getHealthColor()"
        :label="healthMessage"
      />
    </q-card-section>

    <q-card-section v-if="pendingTasks.length > 0" class="card-body">
      <q-list dense separator>
        <q-item
          v-for="task in pendingTasks"
          :key="task.type"
          clickable
          @click="handleTaskClick(task)"
          class="task-item"
        >
          <q-item-section avatar>
            <q-icon 
              :name="getTaskIcon(task.type)" 
              :color="getTaskColor(task.priority)"
              size="16px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body2">{{ task.message }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="arrow_forward" color="grey-6" size="14px" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    
    <q-card-section v-else class="card-body">
      <div class="info-line">
        <q-icon name="check_circle" color="positive" size="18px" />
        <span class="text-body2 text-grey-7">系统运行正常</span>
      </div>
      <div class="text-caption text-grey-6 q-mt-xs">
        最后更新：{{ formatLastUpdate() }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '../../utils/dateFormat'
import type { PendingTask, HealthStatus } from '../../types/dashboard'

interface Props {
  healthStatus: HealthStatus
  healthMessage: string
  pendingTasks: PendingTask[]
  lastUpdate: Date
}

const props = defineProps<Props>()
const router = useRouter()

const getHealthIcon = () => {
  switch (props.healthStatus) {
    case 'healthy': return 'check_circle'
    case 'warning': return 'warning'
    case 'critical': return 'error'
    default: return 'help'
  }
}

const getHealthColor = () => {
  switch (props.healthStatus) {
    case 'healthy': return 'positive'
    case 'warning': return 'warning'
    case 'critical': return 'negative'
    default: return 'grey'
  }
}

const getTaskColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'negative'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'grey'
  }
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'offline_node': return 'wifi_off'
    case 'pending_connection': return 'schedule'
    case 'unconfigured_node': return 'settings'
    case 'failed_route': return 'error'
    default: return 'info'
  }
}

const handleTaskClick = (task: PendingTask) => {
  router.push(task.actionPath)
}

const scrollToAbnormalSection = () => {
  const element = document.querySelector('.abnormal-section')
  element?.scrollIntoView({ behavior: 'smooth' })
}

const formatLastUpdate = () => {
  return formatRelativeTime(props.lastUpdate.toISOString())
}
</script>

<style lang="scss" scoped>
@import '../../styles/design-tokens.scss';

.health-summary {
  height: 100%;
  
  .task-item {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--color-bg-primary);
    }
  }
  
  .info-line {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}
</style>
