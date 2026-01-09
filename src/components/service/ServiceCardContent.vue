<template>
  <q-card class="service-card-content" flat bordered>
    <!-- 服务信息 -->
    <q-card-section class="service-header">
      <div class="service-title-row">
        <q-icon 
          :name="serviceIcon" 
          :color="serviceIconColor"
          size="32px"
          class="service-icon"
        />
        <div class="service-title">{{ service.service_name }}</div>
      </div>
      
      <!-- 服务类型标签 -->
      <div class="service-type">
        <q-chip 
          dense
          :color="serviceTypeColor"
          text-color="white"
          size="sm"
        >
          {{ serviceTypeLabel }}
        </q-chip>
        
        <!-- 服务状态 -->
        <StatusDisplay 
          :status="service.enabled ? 2 : 0"
          variant="chip"
          :show-detail="false"
        />
      </div>
    </q-card-section>
    
    <!-- 服务描述 -->
    <q-card-section v-if="service.description" class="service-description">
      <div class="description-text">{{ service.description }}</div>
    </q-card-section>
    
    <!-- 服务详情（折叠） -->
    <q-expansion-item
      class="service-details-expansion"
      dense
      expand-separator
      icon="info"
      label="服务详情"
      header-class="text-caption text-grey-7"
    >
      <q-card-section class="service-details">
        <div class="detail-row">
          <span class="detail-label">服务端口：</span>
          <span class="detail-value">{{ service.listen_port || '未设置' }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">目标地址：</span>
          <span class="detail-value">{{ targetAddress }}</span>
        </div>
        
        <div v-if="service.node_name" class="detail-row">
          <span class="detail-label">关联节点：</span>
          <span class="detail-value">{{ service.node_name }}</span>
        </div>
        
        <div v-if="service.created_at" class="detail-row">
          <span class="detail-label">创建时间：</span>
          <span class="detail-value">{{ formattedCreateTime }}</span>
        </div>
      </q-card-section>
    </q-expansion-item>
    
    <!-- 所有者信息（针对好友服务） -->
    <q-card-section 
      v-if="showOwnerInfo" 
      class="owner-info-section"
    >
      <div class="owner-label">服务提供者</div>
      <div class="owner-info">
        <q-avatar size="32px">
          <img 
            v-if="service.owner_avatar" 
            :src="service.owner_avatar" 
            :alt="ownerName"
          />
          <q-icon 
            v-else 
            name="account_circle" 
            size="32px"
            color="grey-5"
          />
        </q-avatar>
        <span class="owner-name">{{ ownerName }}</span>
      </div>
    </q-card-section>
    
    <!-- 操作按钮 -->
    <q-card-actions align="center">
      <!-- 主操作按钮 -->
      <q-btn
        flat
        :color="primaryActionConfig.color"
        :icon="primaryActionConfig.icon"
        :label="primaryActionConfig.label"
        :disable="primaryActionConfig.disabled"
        @click="handlePrimaryAction"
      />
      
      <q-space />
      
      <!-- 更多菜单 -->
      <q-btn flat dense round icon="more_vert">
        <q-menu>
          <q-list dense style="min-width: 140px">
            <q-item 
              clickable 
              v-close-popup
              @click="handleViewDetails"
            >
              <q-item-section avatar>
                <q-icon name="visibility" size="20px" />
              </q-item-section>
              <q-item-section>查看详情</q-item-section>
            </q-item>
            
            <q-item 
              v-if="canEdit"
              clickable 
              v-close-popup
              @click="handleEdit"
            >
              <q-item-section avatar>
                <q-icon name="edit" size="20px" />
              </q-item-section>
              <q-item-section>编辑服务</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              v-close-popup
              @click="handleCopyInfo"
            >
              <q-item-section avatar>
                <q-icon name="content_copy" size="20px" />
              </q-item-section>
              <q-item-section>复制信息</q-item-section>
            </q-item>
            
            <template v-if="canEdit">
              <q-separator />
              
              <q-item 
                clickable 
                v-close-popup
                @click="handleDelete"
              >
                <q-item-section avatar>
                  <q-icon name="delete" size="20px" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">删除服务</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import StatusDisplay from '../common/StatusDisplay.vue'

/**
 * 服务卡片内容组件
 * 
 * 职责：
 * 1. 显示服务基本信息（名称、类型、状态）
 * 2. 显示服务详细配置（端口、目标地址、节点）
 * 3. 显示服务所有者信息（针对好友服务）
 * 4. 提供主操作（订阅/访问/编辑）
 * 5. 提供更多操作（查看详情、编辑、复制、删除）
 * 
 * 使用场景：
 * - 公开服务列表页
 * - 好友服务列表页
 * - 匿名服务列表页
 * - 我的服务列表页
 */

interface Service {
  id: number | string
  service_name: string
  description?: string
  service_type: 'public' | 'friends' | 'anonymous' | 'custom'
  listen_port?: number
  target_ip?: string
  target_port?: number
  node_id?: number
  node_name?: string
  owner_id?: number
  owner_name?: string
  owner_avatar?: string
  enabled?: boolean
  created_at?: string
}

interface Props {
  /** 服务数据 */
  service: Service
  
  /** 是否可以编辑（用户自己的服务） */
  canEdit?: boolean
  
  /** 是否显示所有者信息 */
  showOwnerInfo?: boolean
}

interface Emits {
  (e: 'subscribe', serviceId: number | string): void
  (e: 'access', serviceId: number | string): void
  (e: 'view-details', serviceId: number | string): void
  (e: 'edit', serviceId: number | string): void
  (e: 'delete', serviceId: number | string): void
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  showOwnerInfo: false
})

const emit = defineEmits<Emits>()
const router = useRouter()
const $q = useQuasar()

// 服务类型映射
const SERVICE_TYPE_MAP = {
  public: { label: '公开服务', color: 'positive', icon: 'public' },
  friends: { label: '好友服务', color: 'info', icon: 'people' },
  anonymous: { label: '匿名服务', color: 'warning', icon: 'visibility_off' },
  custom: { label: '自定义', color: 'grey', icon: 'settings' }
}

// 服务类型标签
const serviceTypeLabel = computed(() => {
  return SERVICE_TYPE_MAP[props.service.service_type]?.label || '未知类型'
})

// 服务类型颜色
const serviceTypeColor = computed(() => {
  return SERVICE_TYPE_MAP[props.service.service_type]?.color || 'grey'
})

// 服务图标
const serviceIcon = computed(() => {
  return SERVICE_TYPE_MAP[props.service.service_type]?.icon || 'settings'
})

// 服务图标颜色
const serviceIconColor = computed(() => {
  return props.service.enabled ? serviceTypeColor.value : 'grey-5'
})

// 目标地址
const targetAddress = computed(() => {
  if (props.service.target_ip && props.service.target_port) {
    return `${props.service.target_ip}:${props.service.target_port}`
  }
  return '未设置'
})

// 格式化创建时间
const formattedCreateTime = computed(() => {
  if (!props.service.created_at) return ''
  
  try {
    const date = new Date(props.service.created_at)
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: zhCN 
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return props.service.created_at
  }
})

// 所有者名称
const ownerName = computed(() => {
  return props.service.owner_name || '未知用户'
})

// 主操作配置
const primaryActionConfig = computed(() => {
  // 如果是用户自己的服务
  if (props.canEdit) {
    return {
      label: props.service.enabled ? '编辑' : '启用',
      icon: props.service.enabled ? 'edit' : 'play_arrow',
      color: props.service.enabled ? 'primary' : 'positive',
      disabled: false
    }
  }
  
  // 如果是其他用户的服务
  if (props.service.enabled) {
    // 已启用的服务，显示"访问"
    return {
      label: '访问',
      icon: 'link',
      color: 'positive',
      disabled: false
    }
  } else {
    // 未启用的服务，显示"不可用"
    return {
      label: '不可用',
      icon: 'block',
      color: 'grey',
      disabled: true
    }
  }
})

// 主操作处理
const handlePrimaryAction = () => {
  if (props.canEdit) {
    if (props.service.enabled) {
      // 编辑服务
      handleEdit()
    } else {
      // 启用服务（实际上应该是打开编辑对话框并启用）
      handleEdit()
    }
  } else {
    if (props.service.enabled) {
      // 访问服务
      emit('access', props.service.id)
    }
  }
}

// 查看详情
const handleViewDetails = () => {
  emit('view-details', props.service.id)
  router.push(`/app/services/${props.service.id}`)
}

// 编辑服务
const handleEdit = () => {
  emit('edit', props.service.id)
}

// 复制信息
const handleCopyInfo = () => {
  const info = `服务名称：${props.service.service_name}
服务类型：${serviceTypeLabel.value}
服务端口：${props.service.listen_port || '未设置'}
目标地址：${targetAddress.value}
${props.showOwnerInfo ? `服务提供者：${ownerName.value}` : ''}`

  navigator.clipboard.writeText(info).then(() => {
    $q.notify({
      type: 'positive',
      message: '服务信息已复制到剪贴板',
      position: 'top',
      timeout: 2000
    })
  }).catch(() => {
    $q.notify({
      type: 'negative',
      message: '复制失败',
      position: 'top',
      timeout: 2000
    })
  })
}

// 删除服务
const handleDelete = () => {
  emit('delete', props.service.id)
}
</script>

<style lang="scss" scoped>
.service-card-content {
  background: var(--soft-bg-card, #ffffff);
  border-radius: var(--soft-radius-lg, 16px);
  border: 1px solid var(--soft-border-light, #e2e8f0);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: var(--soft-shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.08));
    transform: translateY(-2px);
  }
  
  // 服务头部
  .service-header {
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      var(--soft-bg-primary, #f5f7fa) 0%,
      var(--soft-bg-card, #ffffff) 100%
    );
    
    .service-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      
      .service-icon {
        flex-shrink: 0;
      }
      
      .service-title {
        flex: 1;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--soft-text-primary, #2d3748);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .service-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
  
  // 服务描述
  .service-description {
    padding: 1rem 1.5rem;
    
    .description-text {
      font-size: 0.875rem;
      color: var(--soft-text-secondary, #718096);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  // 服务详情展开项
  .service-details-expansion {
    :deep(.q-item) {
      min-height: 40px;
      padding: 0.5rem 1.5rem;
    }
  }
  
  .service-details {
    padding: 0.75rem 1.5rem 1rem;
    background: var(--soft-bg-secondary, #f9fafb);
    
    .detail-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        flex-shrink: 0;
        min-width: 80px;
        color: var(--soft-text-tertiary, #a0aec0);
        font-weight: 500;
      }
      
      .detail-value {
        flex: 1;
        color: var(--soft-text-secondary, #718096);
        font-family: 'Monaco', 'Menlo', monospace;
        word-break: break-all;
      }
    }
  }
  
  // 所有者信息区域
  .owner-info-section {
    padding: 1rem 1.5rem;
    background: var(--soft-bg-secondary, #f9fafb);
    border-top: 1px solid var(--soft-border-light, #e2e8f0);
    
    .owner-label {
      font-size: 0.75rem;
      color: var(--soft-text-tertiary, #a0aec0);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    
    .owner-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .owner-name {
        font-size: 0.875rem;
        color: var(--soft-text-primary, #2d3748);
        font-weight: 500;
      }
    }
  }
}

// 深色模式适配
.body--dark {
  .service-card-content {
    background: var(--soft-bg-card-dark, #1e293b);
    border-color: var(--soft-border-dark, #334155);
    
    &:hover {
      box-shadow: var(--soft-shadow-lg-dark, 0 10px 15px rgba(0, 0, 0, 0.3));
    }
    
    .service-header {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.02) 100%
      );
      
      .service-title {
        color: var(--soft-text-primary-dark, #e2e8f0);
      }
    }
    
    .service-description {
      .description-text {
        color: var(--soft-text-secondary-dark, #a0aec0);
      }
    }
    
    .service-details {
      background: var(--soft-bg-secondary-dark, #0f172a);
      
      .detail-label {
        color: var(--soft-text-tertiary-dark, #64748b);
      }
      
      .detail-value {
        color: var(--soft-text-secondary-dark, #a0aec0);
      }
    }
    
    .owner-info-section {
      background: var(--soft-bg-secondary-dark, #0f172a);
      border-top-color: var(--soft-border-dark, #334155);
      
      .owner-label {
        color: var(--soft-text-tertiary-dark, #64748b);
      }
      
      .owner-info {
        .owner-name {
          color: var(--soft-text-primary-dark, #e2e8f0);
        }
      }
    }
  }
}
</style>
