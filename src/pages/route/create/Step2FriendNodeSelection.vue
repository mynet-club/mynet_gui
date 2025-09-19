<template>
  <q-page class="route-create-step2-page">
    <div class="q-pa-md">
      <!-- 页面标题和导航 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('routes.create.step2.title') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('routes.create.step2.subtitle', { friendName: selectedFriend?.name || '' }) }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="arrow_back"
            :label="$t('common.back')"
            @click="goBack"
          />
        </div>
      </div>

      <!-- 步骤指示器 -->
      <q-stepper
        v-model="currentStep"
        ref="stepper"
        color="primary"
        animated
        flat
        class="q-mb-lg"
      >
        <q-step
          :name="1"
          :title="$t('routes.create.steps.selectFriend')"
          icon="people"
          :done="currentStep > 1"
          active-icon="people"
        />
        <q-step
          :name="2"
          :title="$t('routes.create.steps.selectFriendNode')"
          icon="device_hub"
          :done="currentStep > 2"
          active-icon="device_hub"
        />
        <q-step
          :name="3"
          :title="$t('routes.create.steps.selectMyNode')"
          icon="router"
          :done="currentStep > 3"
          active-icon="router"
        />
        <q-step
          :name="4"
          :title="$t('routes.create.steps.submitRequest')"
          icon="send"
          active-icon="send"
        />
      </q-stepper>

      <!-- 选中的好友信息 -->
      <q-card class="q-mb-md" v-if="selectedFriend">
        <q-card-section class="row items-center">
          <q-avatar :color="getStatusColor(selectedFriend.status)" class="q-mr-md">
            <q-icon name="person" color="white" />
          </q-avatar>
          <div class="col">
            <div class="text-h6">{{ selectedFriend.name }}</div>
            <div class="text-body2 text-grey-6">
              {{ $t('routes.create.step2.selectedFriend') }}
            </div>
          </div>
          <q-btn
            flat
            icon="edit"
            :label="$t('routes.create.step2.changeFriend')"
            @click="changeFriend"
          />
        </q-card-section>
      </q-card>

      <!-- 好友节点列表 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step2.selectFriendNode') }}</div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center q-py-lg">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-md">{{ $t('routes.create.step2.loadingNodes') }}</div>
          </div>

          <!-- 无节点状态 -->
          <div v-else-if="friendNodes.length === 0" class="text-center q-py-lg text-grey-6">
            <q-icon name="device_hub" size="3em" class="q-mb-md" />
            <div>{{ $t('routes.create.step2.noNodes') }}</div>
          </div>

          <!-- 节点卡片列表 -->
          <div v-else class="row q-gutter-md">
            <div
              v-for="node in friendNodes"
              :key="node.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                class="node-card cursor-pointer"
                :class="{ 
                  'selected': selectedNode?.id === node.id,
                  'disabled': !node.can_connect 
                }"
                @click="selectNode(node)"
                bordered
                flat
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-center">
                    <div class="col">
                      <div class="text-h6">{{ node.name }}</div>
                      <div class="text-body2 text-grey-6 q-mt-xs">
                        {{ node.location || $t('routes.create.step2.unknownLocation') }}
                      </div>
                    </div>
                    <div>
                      <q-avatar 
                        size="40px" 
                        :color="node.can_connect ? 'positive' : 'grey'"
                      >
                        <q-icon name="device_hub" color="white" />
                      </q-avatar>
                    </div>
                  </div>

                  <!-- 节点状态信息 -->
                  <div class="row q-mt-md">
                    <div class="col-4">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step2.nodeStatus') }}</div>
                      <q-chip 
                        :color="node.status === 'online' ? 'positive' : 'grey'" 
                        text-color="white" 
                        size="sm"
                      >
                        {{ node.status }}
                      </q-chip>
                    </div>
                    <div class="col-4">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step2.connections') }}</div>
                      <div class="text-h6">{{ node.current_connections || 0 }}/{{ node.max_connections || 0 }}</div>
                    </div>
                    <div class="col-4">
                      <div class="text-caption text-grey-6">{{ $t('routes.create.step2.latency') }}</div>
                      <div class="text-h6">{{ node.latency || '--' }}ms</div>
                    </div>
                  </div>

                  <!-- 连接限制警告 -->
                  <div v-if="!node.can_connect" class="q-mt-md">
                    <q-banner class="bg-warning text-white" rounded dense>
                      <template v-slot:avatar>
                        <q-icon name="warning" />
                      </template>
                      {{ $t('routes.create.step2.connectionsFull') }}
                    </q-banner>
                  </div>

                  <!-- 选中指示器 -->
                  <q-icon
                    v-if="selectedNode?.id === node.id"
                    name="check_circle"
                    color="positive"
                    size="1.5em"
                    class="absolute-top-right q-ma-sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            :label="$t('common.previous')"
            @click="goBack"
          />
          <q-btn
            color="primary"
            :label="$t('routes.create.step2.nextStep')"
            :disable="!selectedNode || !selectedNode.can_connect"
            @click="goToNextStep"
            icon-right="arrow_forward"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSocial } from '../../../composables/useSocial'
import { useNotify } from '../../../composables/useNotify'
import type { Friend } from '../../../types'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()

const { getFriendNodes } = useSocial()

// 页面状态
const currentStep = ref(2)
const loading = ref(false)
const selectedFriend = ref<Friend | null>(null)
const selectedNode = ref<any | null>(null)
const friendNodes = ref<any[]>([])

// 方法
const selectNode = (node: any) => {
  if (!node.can_connect) {
    notify.warning(t('routes.create.step2.nodeCannotConnect'))
    return
  }
  selectedNode.value = node
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'positive'
    case 'offline':
      return 'grey'
    default:
      return 'grey'
  }
}

const changeFriend = () => {
  router.push('/routes/create/prev_1')
}

const goBack = () => {
  router.push('/routes/create/prev_1')
}

const goToNextStep = () => {
  if (!selectedNode.value || !selectedNode.value.can_connect) {
    notify.error(t('routes.create.step2.pleaseSelectNode'))
    return
  }
  
  // 将选中的节点存储到会话存储中
  sessionStorage.setItem('route-create-friend-node', JSON.stringify(selectedNode.value))
  
  router.push('/routes/create/prev_3')
}

// 获取好友节点列表
const fetchFriendNodes = async () => {
  if (!selectedFriend.value) return
  
  try {
    loading.value = true
    const nodes = await getFriendNodes(selectedFriend.value.id)
    
    // 为每个节点添加连接能力判断
    friendNodes.value = nodes.map((node: any) => ({
      ...node,
      can_connect: node.current_connections < node.max_connections && node.status === 'online'
    }))
  } catch (error) {
    debug.error('获取好友节点失败:', error)
    notify.error(t('routes.create.step2.fetchNodesError'))
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  // 检查是否有选择的好友
  const savedFriend = sessionStorage.getItem('route-create-friend')
  if (!savedFriend) {
    notify.error(t('routes.create.step2.noFriendSelected'))
    router.push('/routes/create/prev_1')
    return
  }
  
  try {
    selectedFriend.value = JSON.parse(savedFriend)
  } catch (error) {
    debug.error('解析已保存的好友数据失败:', error)
    router.push('/routes/create/prev_1')
    return
  }
  
  // 检查是否有已选择的节点
  const savedNode = sessionStorage.getItem('route-create-friend-node')
  if (savedNode) {
    try {
      selectedNode.value = JSON.parse(savedNode)
    } catch (error) {
      debug.error('解析已保存的节点数据失败:', error)
    }
  }
  
  // 获取好友节点列表
  await fetchFriendNodes()
})
</script>

<style lang="scss" scoped>
.route-create-step2-page {
  .node-card {
    transition: all 0.2s ease;
    
    &:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.selected {
      border-color: var(--q-positive);
      box-shadow: 0 0 0 2px rgba(var(--q-positive), 0.2);
    }
    
    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
