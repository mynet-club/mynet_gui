<template>
  <PageLayout
    title="发起好友连接申请"
    subtitle="在同一页面内动态选择好友、多选好友节点与我的节点，一键批量提交连接申请"
    icon="hub"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn
          flat
          color="grey-7"
          icon="schedule"
          label="待处理连接"
          to="/app/routes/pending"
        />
        <q-btn
          flat
          color="grey-7"
          icon="arrow_back"
          label="返回路由总览"
          to="/app/routes"
        />
      </div>
    </template>

    <div class="row q-col-gutter-md">
      <!-- 第 1 区：选择好友（联动动态抽取好友节点） -->
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">1. 选择好友</div>
              <div class="text-caption text-grey-6">选择后自动抽取该好友的可用节点</div>
            </div>
            <q-badge color="primary" outline>{{ friends.length }}</q-badge>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="friendSearch"
              dense
              outlined
              clearable
              placeholder="搜索好友名称..."
              class="q-mb-sm"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <div v-if="loadingFriends" class="row justify-center q-py-lg">
              <q-spinner-dots color="primary" size="2em" />
            </div>

            <div v-else-if="filteredFriends.length === 0" class="text-center q-py-lg text-grey-6">
              <q-icon name="group_off" size="2.5rem" class="q-mb-sm" />
              <div>暂无可选好友</div>
              <q-btn
                flat
                color="primary"
                size="sm"
                label="去添加好友"
                to="/app/social/friends"
                class="q-mt-sm"
              />
            </div>

            <q-list v-else bordered separator class="rounded-borders scroll-panel">
              <q-item
                v-for="friend in filteredFriends"
                :key="friend.id"
                clickable
                v-ripple
                :active="String(selectedFriendId) === String(friend.id)"
                active-class="bg-blue-1 text-primary"
                @click="selectFriend(friend)"
              >
                <q-item-section avatar>
                  <q-avatar size="36px" color="primary" text-color="white">
                    <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" />
                    <span v-else>{{ (friend.name || '?').slice(0, 1).toUpperCase() }}</span>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ friend.name }}</q-item-label>
                  <q-item-label caption>
                    节点 {{ friend.node_count ?? 0 }} 个
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="String(selectedFriendId) === String(friend.id)">
                  <q-icon name="check_circle" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 第 2 区：选择好友节点（多选，动态加载） -->
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">2. 选择好友节点（可多选）</div>
              <div class="text-caption text-grey-6">
                {{ selectedFriend ? `${selectedFriend.name} 的节点` : '请先在左侧选择一位好友' }}
              </div>
            </div>
            <div v-if="selectableFriendNodes.length > 0" class="row q-gutter-xs">
              <q-btn flat dense size="sm" color="primary" label="全选" @click="selectAllFriendNodes" />
              <q-btn flat dense size="sm" color="grey-7" label="清空" @click="selectedFriendNodeIds = []" />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="!selectedFriend" class="text-center q-py-xl text-grey-5">
              <q-icon name="touch_app" size="2.5rem" class="q-mb-sm" />
              <div>选择好友后将动态加载节点</div>
            </div>

            <div v-else-if="loadingFriendNodes" class="row justify-center q-py-lg">
              <q-spinner-dots color="primary" size="2em" />
            </div>

            <div v-else-if="friendNodes.length === 0" class="text-center q-py-lg text-grey-6">
              <q-icon name="router" size="2.5rem" class="q-mb-sm" />
              <div>该好友当前没有节点</div>
            </div>

            <q-list v-else bordered separator class="rounded-borders scroll-panel">
              <q-item
                v-for="node in friendNodes"
                :key="node.id"
                tag="label"
                :clickable="node.selectable"
                :class="{ 'disabled-item': !node.selectable }"
              >
                <q-item-section side top>
                  <q-checkbox
                    v-model="selectedFriendNodeIds"
                    :val="String(node.id)"
                    :disable="!node.selectable"
                    color="primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ node.name }}
                  </q-item-label>
                  <q-item-label caption class="row items-center q-gutter-xs q-mt-xs">
                    <q-badge :color="node.online ? 'positive' : 'grey-6'" outline>
                      {{ node.online ? '在线' : '离线' }}
                    </q-badge>
                    <q-badge color="info" outline>{{ node.vpnTypeLabel }}</q-badge>
                    <span v-if="node.ip" class="text-grey-7">{{ node.ip }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 第 3 区：选择我的节点（多选） -->
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">3. 选择我的节点（可多选）</div>
              <div class="text-caption text-grey-6">将与已选好友节点组合生成连接申请</div>
            </div>
            <div v-if="myNodes.length > 0" class="row q-gutter-xs">
              <q-btn flat dense size="sm" color="primary" label="全选" @click="selectAllMyNodes" />
              <q-btn flat dense size="sm" color="grey-7" label="清空" @click="selectedMyNodeIds = []" />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="loadingMyNodes" class="row justify-center q-py-lg">
              <q-spinner-dots color="primary" size="2em" />
            </div>

            <div v-else-if="myNodes.length === 0" class="text-center q-py-lg text-grey-6">
              <q-icon name="dns" size="2.5rem" class="q-mb-sm" />
              <div>您当前网络区还没有节点</div>
              <q-btn
                flat
                color="primary"
                size="sm"
                label="去创建节点"
                to="/app/nodes/create"
                class="q-mt-sm"
              />
            </div>

            <q-list v-else bordered separator class="rounded-borders scroll-panel">
              <q-item
                v-for="node in myNodes"
                :key="node.id"
                tag="label"
                clickable
              >
                <q-item-section side top>
                  <q-checkbox
                    v-model="selectedMyNodeIds"
                    :val="String(node.id)"
                    color="primary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ node.name }}</q-item-label>
                  <q-item-label caption class="row items-center q-gutter-xs q-mt-xs">
                    <q-badge :color="node.online ? 'positive' : 'grey-6'" outline>
                      {{ node.online ? '在线' : '离线' }}
                    </q-badge>
                    <q-badge color="secondary" outline>{{ node.vpnTypeLabel }}</q-badge>
                    <span v-if="node.ip" class="text-grey-7">{{ node.ip }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 第 4 区：连接组合预览与一键提交 -->
    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold">4. 确认连接组合并提交</div>
            <div class="text-caption text-grey-6">
              已选 {{ selectedMyNodeIds.length }} 个我的节点 × {{ selectedFriendNodeIds.length }} 个好友节点，
              其中 <strong class="text-primary">{{ actionablePairs.length }}</strong> 组可新发起申请
              <span v-if="skippedExistingPairs.length > 0">
                （自动跳过 {{ skippedExistingPairs.length }} 组已连接/待审批）
              </span>
            </div>
          </div>
          <q-btn
            color="primary"
            icon="send"
            :label="`提交 ${actionablePairs.length} 条连接申请`"
            :disable="actionablePairs.length === 0 || submitting"
            :loading="submitting"
            @click="submitBatch"
          />
        </div>

        <div v-if="candidatePairs.length > 0" class="row q-gutter-xs q-mb-md">
          <q-chip
            v-for="pair in candidatePairs"
            :key="`${pair.sourceNodeId}-${pair.targetNodeId}`"
            dense
            :color="pair.existingStatus ? 'grey-3' : 'blue-1'"
            :text-color="pair.existingStatus ? 'grey-7' : 'primary'"
            :icon="pair.existingStatus ? 'block' : 'sync_alt'"
          >
            {{ pair.sourceNodeName }} → {{ pair.targetNodeName }}
            <span v-if="pair.existingStatus" class="q-ml-xs">({{ pair.existingStatus }})</span>
          </q-chip>
        </div>

        <q-input
          v-model="requestMessage"
          outlined
          dense
          type="textarea"
          rows="2"
          maxlength="500"
          counter
          placeholder="可选：填写连接申请附言（将同步应用到本次所有申请）"
        />

        <!-- 批量提交结果反馈 -->
        <q-banner
          v-if="lastSubmitResult"
          rounded
          class="q-mt-md"
          :class="lastSubmitResult.summary.created_count > 0 ? 'bg-green-1 text-positive' : 'bg-orange-1 text-warning'"
        >
          <div class="text-weight-medium">
            提交完成：成功 {{ lastSubmitResult.summary.created_count }} 条，跳过 {{ lastSubmitResult.summary.skipped_count }} 条。
          </div>
          <div v-if="lastSubmitResult.skipped.length > 0" class="text-caption text-grey-8 q-mt-xs">
            <div v-for="(item, idx) in lastSubmitResult.skipped" :key="idx">
              跳过（{{ item.source_node_id }} → {{ item.target_node_id }}）：{{ item.reason }}
            </div>
          </div>
          <template #action>
            <q-btn flat color="primary" label="查看待处理连接" to="/app/routes/pending" />
          </template>
        </q-banner>
      </q-card-section>
    </q-card>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import PageLayout from '../../components/layout/PageLayout.vue'
import { socialService } from '../../services/social/socialService'
import { nodeService } from '../../services/node/nodeService'
import { routesService, type BatchRouteRequestResult } from '../../services/route/routesService'
import type { Friend } from '../../types'

interface NormalizedNode {
  id: string
  name: string
  online: boolean
  vpnType: 'gnb' | 'wireguard'
  vpnTypeLabel: string
  ip: string
  selectable: boolean
}

const route = useRoute()
const $q = useQuasar()

const loadingFriends = ref(false)
const loadingFriendNodes = ref(false)
const loadingMyNodes = ref(false)
const submitting = ref(false)

const friends = ref<Friend[]>([])
const friendSearch = ref('')
const selectedFriendId = ref<string>('')
const friendNodes = ref<NormalizedNode[]>([])
const selectedFriendNodeIds = ref<string[]>([])

const myNodes = ref<NormalizedNode[]>([])
const selectedMyNodeIds = ref<string[]>([])
const requestMessage = ref('')
const lastSubmitResult = ref<BatchRouteRequestResult | null>(null)

// 已存在的活跃路由与待处理申请，用于实时标记跳过
const existingPairStatus = ref<Record<string, string>>({})

const filteredFriends = computed(() => {
  const kw = friendSearch.value.trim().toLowerCase()
  if (!kw) return friends.value
  return friends.value.filter((f) => (f.name || '').toLowerCase().includes(kw))
})

const selectedFriend = computed(() =>
  friends.value.find((f) => String(f.id) === String(selectedFriendId.value)) || null
)

const selectableFriendNodes = computed(() => friendNodes.value.filter((n) => n.selectable))

const normalizeVpnType = (raw: any): { vpnType: 'gnb' | 'wireguard'; label: string } => {
  const s = String(raw || 'gnb').toLowerCase()
  if (s === 'wireguard' || s === 'wg') {
    return { vpnType: 'wireguard', label: 'WireGuard' }
  }
  return { vpnType: 'gnb', label: 'GNB' }
}

const normalizeNode = (raw: any): NormalizedNode => {
  const id = String(raw.id ?? raw.node_id ?? '')
  const name = raw.node_name || raw.name || `节点 ${id}`
  const status = raw.status ?? raw.node_status
  const online = status === 'online' || status === 'active' || status === 1 || status === 2
  const { vpnType, label } = normalizeVpnType(raw.vpn_type ?? raw.driver_type)
  const ip = raw.virtual_ip || raw.ip_address || raw.primary_ip || ''
  return {
    id,
    name,
    online,
    vpnType,
    vpnTypeLabel: label,
    ip,
    selectable: true
  }
}

const selectFriend = async (friend: Friend, preselectNodeId?: string) => {
  selectedFriendId.value = String(friend.id)
  selectedFriendNodeIds.value = []
  lastSubmitResult.value = null
  loadingFriendNodes.value = true
  try {
    const list = await socialService.getFriendNodes(String(friend.id))
    const arr = Array.isArray(list) ? list : []
    friendNodes.value = arr.map(normalizeNode)
    if (preselectNodeId && friendNodes.value.some((n) => n.id === preselectNodeId)) {
      selectedFriendNodeIds.value = [preselectNodeId]
    }
  } catch (error: any) {
    friendNodes.value = []
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || '加载好友节点失败'
    })
  } finally {
    loadingFriendNodes.value = false
  }
}

const selectAllFriendNodes = () => {
  selectedFriendNodeIds.value = selectableFriendNodes.value.map((n) => n.id)
}

const selectAllMyNodes = () => {
  selectedMyNodeIds.value = myNodes.value.map((n) => n.id)
}

const candidatePairs = computed(() => {
  if (!selectedFriend.value) return []
  const myMap = new Map(myNodes.value.map((n) => [n.id, n]))
  const friendMap = new Map(friendNodes.value.map((n) => [n.id, n]))

  const pairs: Array<{
    sourceNodeId: string
    sourceNodeName: string
    targetNodeId: string
    targetNodeName: string
    targetUserId: string
    vpnType: 'gnb' | 'wireguard'
    existingStatus: string | null
  }> = []

  for (const sourceId of selectedMyNodeIds.value) {
    const src = myMap.get(sourceId)
    if (!src) continue
    for (const targetId of selectedFriendNodeIds.value) {
      const dst = friendMap.get(targetId)
      if (!dst) continue
      const key = `${sourceId}:${targetId}`
      const reverseKey = `${targetId}:${sourceId}`
      const existing = existingPairStatus.value[key] || existingPairStatus.value[reverseKey] || null
      pairs.push({
        sourceNodeId: sourceId,
        sourceNodeName: src.name,
        targetNodeId: targetId,
        targetNodeName: dst.name,
        targetUserId: String(selectedFriend.value.id),
        vpnType: dst.vpnType || src.vpnType || 'gnb',
        existingStatus: existing
      })
    }
  }
  return pairs
})

const actionablePairs = computed(() => candidatePairs.value.filter((p) => !p.existingStatus))
const skippedExistingPairs = computed(() => candidatePairs.value.filter((p) => Boolean(p.existingStatus)))

const loadExistingConnections = async () => {
  try {
    const overview = await routesService.getOverview()
    const map: Record<string, string> = {}
    for (const r of overview?.routes || []) {
      map[`${r.node_id}:${r.target_node_id}`] = '已连接'
    }
    for (const req of overview?.requests?.pending || []) {
      map[`${req.source_node_id}:${req.target_node_id}`] = '待审批'
    }
    for (const req of overview?.requests?.sent || []) {
      map[`${req.source_node_id}:${req.target_node_id}`] = '待审批'
    }
    existingPairStatus.value = map
  } catch {
    existingPairStatus.value = {}
  }
}

const submitBatch = async () => {
  if (actionablePairs.value.length === 0 || submitting.value) return
  submitting.value = true
  lastSubmitResult.value = null
  try {
    const msg = requestMessage.value.trim()
    const payload = actionablePairs.value.map((p) => ({
      source_node_id: p.sourceNodeId,
      target_node_id: p.targetNodeId,
      target_user_id: p.targetUserId,
      vpn_type: p.vpnType,
      message: msg
    }))
    const res = await routesService.createBatchRouteRequests(payload, msg || undefined)
    if (res.data) {
      lastSubmitResult.value = res.data
    }
    await loadExistingConnections()
    $q.notify({
      type: (res.data?.summary.created_count ?? 0) > 0 ? 'positive' : 'warning',
      message: res.message || '连接申请已提交'
    })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || error?.message || '批量提交连接申请失败'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loadingFriends.value = true
  loadingMyNodes.value = true
  try {
    const [socialData, myNodeRes] = await Promise.all([
      socialService.getOverview(),
      nodeService.getNodes(),
      loadExistingConnections()
    ])
    friends.value = socialData?.friends || []
    const rawMyNodes = Array.isArray((myNodeRes as any)?.data)
      ? (myNodeRes as any).data
      : Array.isArray(myNodeRes)
        ? myNodeRes
        : []
    myNodes.value = rawMyNodes.map(normalizeNode)

    // 支持从好友页或好友节点页带参数预选
    const qFriendId = String(route.query.friendId || route.query.friend_id || '').trim()
    const qFriendNodeId = String(route.query.friendNodeId || route.query.friend_node_id || '').trim()
    if (qFriendId) {
      const target = friends.value.find((f) => String(f.id) === qFriendId)
      if (target) {
        await selectFriend(target, qFriendNodeId || undefined)
      }
    } else if (friends.value.length === 1 && friends.value[0]) {
      await selectFriend(friends.value[0])
    }
  } finally {
    loadingFriends.value = false
    loadingMyNodes.value = false
  }
})
</script>

<style lang="scss" scoped>
.scroll-panel {
  max-height: 360px;
  overflow-y: auto;
}

.disabled-item {
  opacity: 0.55;
}
</style>
