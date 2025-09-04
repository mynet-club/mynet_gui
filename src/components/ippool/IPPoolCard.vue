<template>
  <q-card class="ip-pool-card" :class="cardClass">
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h6 text-weight-bold">{{ pool.name || $t('ippools.unnamedPool') }}</div>
          <div class="text-caption text-grey-6">ID: {{ pool.id }}</div>
        </div>
        <div class="col-auto">
          <q-badge 
            :color="getStatusColor(pool.status)" 
            :label="$t(`ippools.status${pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}`)" 
          />
        </div>
      </div>

      <div class="pool-info q-mb-md">
        <div class="row q-gutter-md">
          <div class="col-12">
            <div class="info-row">
              <q-icon name="language" size="sm" color="primary" />
              <span class="info-label">{{ $t('ippools.network') }}:</span>
              <span class="info-value text-mono">{{ pool.network || '-' }}</span>
            </div>
          </div>
          <div class="col-12">
            <div class="info-row">
              <q-icon name="settings_ethernet" size="sm" color="info" />
              <span class="info-label">{{ $t('ippools.ipRange') }}:</span>
              <span class="info-value text-mono">{{ pool.ip_range.start }} - {{ pool.ip_range.end }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="usage-section q-mb-md">
        <div class="row items-center q-gutter-md">
          <div class="col-auto">
            <q-circular-progress
              :value="getUsagePercent(pool)"
              size="60px"
              :thickness="0.15"
              :color="getUsageColor(getUsagePercent(pool))"
              track-color="grey-3"
              show-value
              class="text-weight-bold"
            />
          </div>
          <div class="col">
            <div class="usage-stats">
              <div class="stat-item">
                <span class="stat-label">{{ $t('ippools.totalCount') }}:</span>
                <span class="stat-value">{{ pool.total_ips || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('ippools.usedCount') }}:</span>
                <span class="stat-value">{{ pool.used_ips || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('ippools.availableCount') }}:</span>
                <span class="stat-value">{{ pool.available_ips || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="meta-info">
        <div class="row q-gutter-sm">
          <div class="col-6">
            <div class="meta-item">
              <q-icon name="schedule" size="sm" color="grey-6" />
              <span class="meta-label">{{ $t('ippools.createdAt') }}:</span>
            </div>
            <div class="meta-value">{{ formatDate(pool.created_at) }}</div>
          </div>
          <div class="col-6">
            <div class="meta-item">
              <q-icon name="update" size="sm" color="grey-6" />
              <span class="meta-label">{{ $t('ippools.updatedAt') }}:</span>
            </div>
            <div class="meta-value">{{ formatDate(pool.updated_at) }}</div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        icon="visibility"
        size="sm"
        flat
        round
        @click="$emit('view', pool)"
        :title="$t('ippools.view')"
      />
      <q-btn
        icon="edit"
        size="sm"
        flat
        round
        @click="$emit('edit', pool)"
        :title="$t('ippools.edit')"
      />
      <q-btn
        icon="settings"
        size="sm"
        flat
        round
        @click="$emit('manage', pool)"
        :title="$t('ippools.manage')"
      />
      <q-btn
        icon="delete"
        size="sm"
        flat
        round
        color="negative"
        @click="$emit('delete', pool)"
        :title="$t('ippools.delete')"
      />
    </q-card-actions>

    <q-card-section v-if="showSelection" class="absolute-top-right q-pa-sm">
      <q-checkbox
        :model-value="isSelected"
        @update:model-value="$emit('update:selected', $event)"
        color="primary"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IPPool } from '../../types/ippool'

interface Props {
  pool: IPPool
  showSelection?: boolean
  isSelected?: boolean
}

interface Emits {
  (e: 'view', pool: IPPool): void
  (e: 'edit', pool: IPPool): void
  (e: 'manage', pool: IPPool): void
  (e: 'delete', pool: IPPool): void
  (e: 'update:selected', selected: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  showSelection: false,
  isSelected: false
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const cardClass = computed(() => {
  return {
    'pool-card-selected': props.isSelected,
    'pool-card-available': props.pool.status === 'available',
    'pool-card-allocated': props.pool.status === 'allocated'
  }
})

const getUsagePercent = (pool: IPPool): number => {
  if (!pool.total_ips || pool.total_ips === 0) return 0
  return Math.round(((pool.used_ips || 0) / pool.total_ips) * 100)
}

const getUsageColor = (percent: number): string => {
  if (percent >= 80) return 'negative'
  if (percent >= 60) return 'warning'
  return 'positive'
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available': return 'positive'
    case 'allocated': return 'warning'
    case 'full': return 'negative'
    default: return 'grey'
  }
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.ip-pool-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.pool-card-selected {
    border: 2px solid var(--q-primary);
    transform: translateY(-1px);
  }
  
  &.pool-card-available {
    border-left: 4px solid var(--q-positive);
  }
  
  &.pool-card-allocated {
    border-left: 4px solid var(--q-warning);
  }
}

.pool-info {
  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .info-label {
      font-weight: 500;
      color: var(--q-text-grey-7);
      min-width: 80px;
    }
    
    .info-value {
      font-weight: 600;
      
      &.text-mono {
        font-family: 'Courier New', monospace;
      }
    }
  }
}

.usage-section {
  .usage-stats {
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .stat-label {
        font-size: 0.875rem;
        color: var(--q-text-grey-6);
      }
      
      .stat-value {
        font-weight: 600;
        font-size: 0.875rem;
      }
    }
  }
}

.meta-info {
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
    
    .meta-label {
      font-size: 0.75rem;
      color: var(--q-text-grey-6);
    }
  }
  
  .meta-value {
    font-size: 0.75rem;
    color: var(--q-text-grey-7);
  }
}

.absolute-top-right {
  top: 0;
  right: 0;
  z-index: 1;
}
</style>
