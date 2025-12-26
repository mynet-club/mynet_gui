<template>
  <q-card 
    class="health-summary" 
    :class="`health-${healthStatus}`"
  >
    <q-card-section>
      <div class="row items-start q-gutter-md">
        <!-- 健康状态图标 -->
        <div class="col-auto">
          <q-avatar 
            :icon="getHealthIcon()" 
            :color="getHealthColor()"
            text-color="white"
            size="56px"
          />
        </div>
        
        <!-- 健康摘要信息 -->
        <div class="col">
          <div class="text-h6 text-weight-bold">
            {{ healthMessage }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            最后更新：{{ formatLastUpdate() }}
          </div>
          
          <!-- 待处理任务列表 -->
          <div v-if="pendingTasks.length > 0" class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-xs">待处理任务：</div>
            <div class="row q-gutter-xs">
              <q-chip
                v-for="task in pendingTasks"
                :key="task.type"
                :color="getTaskColor(task.priority)"
                text-color="white"
                size="sm"
                clickable
                @click="handleTaskClick(task)"
              >
                <q-icon 
                  :name="getTaskIcon(task.type)" 
                  size="xs" 
                  class="q-mr-xs"
                />
                {{ task.message }}
                <q-icon name="arrow_forward" size="xs" class="q-ml-xs" />
              </q-chip>
            </div>
          </div>
        </div>
        
        <!-- 快速操作按钮 -->
        <div class="col-auto">
          <q-btn
            v-if="healthStatus !== 'healthy'"
            color="primary"
            icon="search"
            label="查看详情"
            @click="scrollToAbnormalSection"
            unelevated
          />
        </div>
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
.health-summary {
  transition: all 0.3s ease;
  
  &.health-healthy {
    border-left: 4px solid var(--q-positive);
  }
  
  &.health-warning {
    border-left: 4px solid var(--q-warning);
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.05) 0%, transparent 100%);
  }
  
  &.health-critical {
    border-left: 4px solid var(--q-negative);
    background: linear-gradient(90deg, rgba(244, 67, 54, 0.05) 0%, transparent 100%);
  }
  
  .q-chip {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
