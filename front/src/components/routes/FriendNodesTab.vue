<template>
  <div class="friend-nodes-tab">
    <!-- 搜索和过滤栏 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          :placeholder="$t('routes.friendNodes.searchPlaceholder')"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          :label="$t('routes.friendNodes.statusFilter')"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- 节点列表 -->
    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else-if="filteredNodes.length === 0" class="text-center q-py-lg">
      <q-icon name="lan" size="3rem" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6">
        {{ searchQuery ? $t('routes.friendNodes.noSearchResults') : $t('routes.friendNodes.noNodes') }}
      </div>
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="node in filteredNodes"
        :key="node.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="node-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="row items-center q-mb-sm">
                  <q-avatar size="40px" class="q-mr-sm">
                    <img v-if="node.friend_avatar" :src="node.friend_avatar" :alt="node.friend_name" />
                    <q-icon v-else name="person" size="24px" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-medium">{{ node.friend_name }}</div>
                    <div class="text-caption text-grey-6">{{ node.node_name }}</div>
                  </div>
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getStatusColor(node.connection_status)"
                  :label="$t(`routes.nodeStatus.${node.connection_status}`)"
                  size="sm"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-gutter-md text-center">
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ node.ip_address }}</div>
                <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.ipAddress') }}</div>
              </div>
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ node.port }}</div>
                <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.port') }}</div>
              </div>
              <div class="col">
                <div class="text-body2 text-weight-medium">{{ node.node_type }}</div>
                <div class="text-caption text-grey-6">{{ $t('routes.friendNodes.nodeType') }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row items-center">
              <div class="col">
                <div class="text-caption text-grey-6">
                  {{ $t('routes.friendNodes.zone') }}: {{ node.zone_name }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ $t('routes.friendNodes.lastSeen') }}: {{ formatDate(node.last_seen) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="$t('routes.friendNodes.viewFriend')"
              color="primary"
              @click="$emit('view-friend', node.friend_id)"
            />
            <q-btn
              v-if="node.connection_status === 'available'"
              flat
              :label="$t('routes.friendNodes.connect')"
              color="primary"
              @click="$emit('connect', node.id, node.node_name, node.friend_name)"
            />
            <q-btn
              v-else-if="node.connection_status === 'pending'"
              flat
              :label="$t('routes.friendNodes.pending')"
              color="orange"
              disable
            />
            <q-btn
              v-else-if="node.connection_status === 'connected'"
              flat
              :label="$t('routes.friendNodes.connected')"
              color="positive"
              disable
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FriendNode } from '../../types'

interface Props {
  friendNodes: FriendNode[]
  loading: boolean
}

interface Emits {
  (e: 'connect', nodeId: string, nodeName: string, friendName: string): void
  (e: 'view-friend', friendId: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

// 搜索和过滤
const searchQuery = ref('')
const statusFilter = ref('')

const statusOptions = [
  { label: t('routes.nodeStatus.available'), value: 'available' },
  { label: t('routes.nodeStatus.connected'), value: 'connected' },
  { label: t('routes.nodeStatus.pending'), value: 'pending' },
  { label: t('routes.nodeStatus.unavailable'), value: 'unavailable' }
]

// 过滤后的节点
const filteredNodes = computed(() => {
  let filtered = props.friendNodes

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(node => 
      node.friend_name.toLowerCase().includes(query) ||
      node.node_name.toLowerCase().includes(query) ||
      node.ip_address.includes(query) ||
      node.zone_name.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(node => node.connection_status === statusFilter.value)
  }

  return filtered
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'positive'
    case 'connected': return 'info'
    case 'pending': return 'orange'
    case 'unavailable': return 'negative'
    default: return 'grey'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style lang="scss" scoped>
.friend-nodes-tab {
  .node-card {
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
