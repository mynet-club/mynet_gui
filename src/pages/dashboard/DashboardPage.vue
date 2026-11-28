<template>
  <q-page class="cloud-dashboard q-pa-md">
    <div class="dashboard-shell">
      <!-- 顶部标题栏（紧凑，与本机页视觉密度对齐） -->
      <div class="dash-header row items-center justify-between q-mb-md">
        <div>
          <div class="dash-title">{{ $t('dashboard.title') }}</div>
          <div class="dash-subtitle">
            <span v-if="currentTenantName">网络区：{{ currentTenantName }}</span>
            <span v-if="currentTenantName" class="q-mx-xs">·</span>
            <span>最后更新 {{ lastUpdateText }}</span>
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            dense
            no-caps
            color="grey-7"
            icon="refresh"
            :label="$t('common.refresh')"
            :loading="pageLoading"
            @click="handleRefresh"
          />
          <q-btn
            unelevated
            dense
            no-caps
            color="primary"
            icon="add"
            :label="$t('nodes.createNode')"
            to="/cloud/nodes/create"
            class="q-px-md"
          />
        </div>
      </div>

      <!-- 首次创建设备引导（仅 0 设备时展示） -->
      <div v-if="!pageLoading && dashboardData.totalNodes === 0" class="empty-hero q-mb-md">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm">
            <div class="text-subtitle1 text-weight-bold">{{ $t('workflow.createFirstDevice') }}</div>
            <div class="text-body2 text-grey-7 q-mt-xs">{{ $t('workflow.automaticDefaults') }}</div>
          </div>
          <div class="col-auto">
            <q-btn
              unelevated
              color="primary"
              icon="add"
              :label="$t('nodes.createNode')"
              to="/cloud/nodes/create"
            />
          </div>
        </div>
      </div>

      <!-- 待关注事项集中条（仅存在异常或待处理时出现，不重复堆叠卡片） -->
      <div v-if="attentionItems.length > 0" class="attention-bar q-mb-md">
        <div class="attention-label">
          <q-icon name="notifications_active" size="16px" />
          <span>待关注</span>
        </div>
        <div class="attention-chips">
          <button
            v-for="item in attentionItems"
            :key="item.key"
            type="button"
            class="attention-chip"
            :class="`attention-chip--${item.tone}`"
            @click="router.push(item.to)"
          >
            <q-icon :name="item.icon" size="14px" />
            <span>{{ item.text }}</span>
            <q-icon name="chevron_right" size="14px" class="chip-arrow" />
          </button>
        </div>
      </div>

      <!-- 第一行：4 张紧凑横向资产 KPI 卡 -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- 1. 我的设备 -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi-card" @click="router.push('/cloud/nodes')">
            <div class="kpi-top">
              <span class="kpi-label">我的设备</span>
              <span class="kpi-icon kpi-icon--blue">
                <q-icon name="devices" size="18px" />
              </span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ dashboardData.onlineNodes }}</span>
              <span class="kpi-denom">/ {{ dashboardData.totalNodes }} 在线</span>
            </div>
            <div class="kpi-foot">
              <span class="status-dot" :class="dashboardData.onlineNodes > 0 ? 'dot--ok' : 'dot--muted'" />
              <span>在线率 {{ onlineRate }}%</span>
            </div>
          </div>
        </div>

        <!-- 2. 连接与路由 -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi-card" @click="router.push('/cloud/routes')">
            <div class="kpi-top">
              <span class="kpi-label">连接与路由</span>
              <span class="kpi-icon kpi-icon--indigo">
                <q-icon name="alt_route" size="18px" />
              </span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ dashboardData.activeRoutes }}</span>
              <span class="kpi-denom">活跃路由</span>
            </div>
            <div class="kpi-foot">
              <span v-if="pendingConnections.length > 0" class="text-warning text-weight-medium">
                {{ pendingConnections.length }} 个待处理连接申请
              </span>
              <span v-else>已连对端 {{ dashboardData.totalRoutes }} 台</span>
            </div>
          </div>
        </div>

        <!-- 3. IP 资源 -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi-card" @click="router.push('/cloud/ip-resources')">
            <div class="kpi-top">
              <span class="kpi-label">IP 资源</span>
              <span class="kpi-icon kpi-icon--teal">
                <q-icon name="layers" size="18px" />
              </span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ ipStats.allocated_pools }}</span>
              <span class="kpi-denom">/ {{ ipStats.user_quota || 3 }} 资源包</span>
            </div>
            <div class="kpi-foot">
              <span v-if="ipStats.blocked_by === 'quota'" class="text-negative text-weight-medium">
                配额已满 · 可扩容
              </span>
              <span v-else-if="ipStats.blocked_by === 'platform'" class="text-negative text-weight-medium">
                平台维护停用
              </span>
              <span v-else>
                已用 {{ ipStats.allocated_ips }} / {{ ipStats.total_ips }} IP
              </span>
            </div>
          </div>
        </div>

        <!-- 4. 网络加速 -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi-card" @click="router.push('/cloud/utc/nodes')">
            <div class="kpi-top">
              <span class="kpi-label">网络加速</span>
              <span class="kpi-icon kpi-icon--amber">
                <q-icon name="speed" size="18px" />
              </span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ utcSummary.effective }}</span>
              <span class="kpi-denom">/ {{ utcSummary.total }} 已生效</span>
            </div>
            <div class="kpi-foot">
              <span v-if="utcSummary.blockedLabel" class="text-warning text-weight-medium">
                {{ utcSummary.blockedLabel }}
              </span>
              <span v-else-if="utcSummary.total === 0">暂未开启加速节点</span>
              <span v-else>UTC 加速通道正常</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：核心工作区（左：我的设备速览，右：好友协作 + 快捷入口） -->
      <div class="row q-col-gutter-md">
        <!-- 左栏：我的设备速览 -->
        <div class="col-12 col-lg-8">
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                <q-icon name="devices" size="18px" class="q-mr-xs text-primary" />
                <span>我的设备</span>
                <span class="panel-count">{{ dashboardData.totalNodes }}</span>
              </div>
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                label="查看全部"
                icon-right="arrow_forward"
                to="/cloud/nodes"
              />
            </div>

            <div v-if="pageLoading && sortedNodes.length === 0" class="q-pa-lg text-center">
              <q-spinner color="primary" size="28px" />
            </div>

            <div v-else-if="sortedNodes.length === 0" class="panel-empty">
              <q-icon name="devices_other" size="36px" color="grey-5" />
              <div class="text-body2 text-grey-6 q-mt-sm">当前网络区还没有设备</div>
              <q-btn
                outline
                dense
                no-caps
                color="primary"
                label="立即创建"
                to="/cloud/nodes/create"
                class="q-mt-sm"
              />
            </div>

            <div v-else class="device-list">
              <div
                v-for="node in sortedNodes"
                :key="node.id"
                class="device-row"
                @click="router.push(`/cloud/nodes/${node.id}`)"
              >
                <div class="device-main">
                  <span class="status-dot" :class="nodeStatusDotClass(node.node_status)" />
                  <div class="device-info">
                    <div class="device-name ellipsis">{{ node.node_name || `节点 ${node.id}` }}</div>
                    <div class="device-meta mono">
                      <span>{{ formatNodeIp(node) }}</span>
                      <span v-if="node.last_seen" class="q-ml-sm">· {{ formatSeen(node.last_seen) }}</span>
                    </div>
                  </div>
                </div>
                <div class="device-right">
                  <span class="node-status-pill" :class="nodeStatusPillClass(node.node_status)">
                    {{ nodeStatusText(node.node_status) }}
                  </span>
                  <q-icon name="chevron_right" size="18px" class="row-arrow" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右栏：好友协作摘要 + 快捷操作 -->
        <div class="col-12 col-lg-4 column q-gutter-md">
          <!-- 好友与协作摘要 -->
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                <q-icon name="people" size="18px" class="q-mr-xs text-primary" />
                <span>好友与协作</span>
              </div>
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                label="进入好友"
                to="/cloud/social/friends"
              />
            </div>

            <div class="social-stats-row">
              <div class="social-stat" @click="router.push('/cloud/social/friends')">
                <div class="social-stat__val">{{ socialSummary.friendsCount }}</div>
                <div class="social-stat__lbl">好友</div>
              </div>
              <div class="social-stat-divider" />
              <div class="social-stat" @click="router.push('/cloud/social/requests')">
                <div
                  class="social-stat__val"
                  :class="{ 'text-warning': socialSummary.pendingRequests > 0 }"
                >
                  {{ socialSummary.pendingRequests }}
                </div>
                <div class="social-stat__lbl">待处理申请</div>
              </div>
            </div>

            <div class="row q-gutter-xs q-pa-sm q-pt-none">
              <q-btn
                outline
                dense
                no-caps
                size="sm"
                color="primary"
                icon="hub"
                label="发起连接"
                to="/cloud/routes/create"
                class="col"
              />
              <q-btn
                outline
                dense
                no-caps
                size="sm"
                color="grey-7"
                icon="send"
                label="邀请码"
                to="/cloud/social/invitations"
                class="col"
              />
            </div>
          </div>

          <!-- 快捷入口 2×2 -->
          <div class="panel-card">
            <div class="panel-head">
              <div class="panel-title">
                <q-icon name="bolt" size="18px" class="q-mr-xs text-primary" />
                <span>快捷入口</span>
              </div>
            </div>
            <div class="quick-grid">
              <button
                v-for="act in quickActions"
                :key="act.to"
                type="button"
                class="quick-tile"
                @click="router.push(act.to)"
              >
                <q-icon :name="act.icon" size="20px" class="quick-tile__icon" />
                <span class="quick-tile__label">{{ act.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useDashboard } from '../../composables/useDashboard'
import { useIPPools } from '../../composables/useIPPools'
import { utcService } from '../../services/utc/utcService'
import { socialService } from '../../services/social/socialService'
import { formatRelativeTime } from '../../utils/dateFormat'
import { NODE_STATUS, type Node } from '../../types/node'

const router = useRouter()
const authStore = useAuthStore()

const {
  dashboardData,
  nodes,
  pendingConnections,
  onlineRate,
  isLoading,
  fetchDashboardData
} = useDashboard()

const { statistics: ipStats, fetchStatistics } = useIPPools()

const extraLoading = ref(false)
const pageLoading = computed(() => isLoading.value || extraLoading.value)

const currentTenantName = computed(() => authStore.currentTenant?.name || '')

const lastUpdateText = computed(() => {
  const d = dashboardData.value.lastUpdate
  if (!d) return '—'
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
})

const utcSummary = reactive({
  total: 0,
  effective: 0,
  blockedLabel: ''
})

const socialSummary = reactive({
  friendsCount: 0,
  pendingRequests: 0
})

const quickActions = [
  { label: '新增设备', icon: 'add_circle_outline', to: '/cloud/nodes/create' },
  { label: '发起连接', icon: 'alt_route', to: '/cloud/routes/create' },
  { label: 'IP 资源包', icon: 'layers', to: '/cloud/ip-resources' },
  { label: '服务与出口', icon: 'apps', to: '/cloud/services' }
]

const attentionItems = computed(() => {
  const items: Array<{ key: string; icon: string; text: string; tone: 'warn' | 'err'; to: string }> = []
  const offlineCount = dashboardData.value.abnormalItems.offlineNodes.length
  const unconfiguredCount = dashboardData.value.abnormalItems.unconfiguredNodes.length

  if (offlineCount > 0) {
    items.push({
      key: 'offline',
      icon: 'wifi_off',
      text: `${offlineCount} 台设备离线`,
      tone: 'err',
      to: '/cloud/nodes?filter=offline'
    })
  }
  if (pendingConnections.value.length > 0) {
    items.push({
      key: 'pending-routes',
      icon: 'schedule',
      text: `${pendingConnections.value.length} 个待处理连接申请`,
      tone: 'warn',
      to: '/cloud/routes/pending'
    })
  }
  if (socialSummary.pendingRequests > 0) {
    items.push({
      key: 'pending-friends',
      icon: 'person_add',
      text: `${socialSummary.pendingRequests} 条好友申请`,
      tone: 'warn',
      to: '/cloud/social/requests'
    })
  }
  if (unconfiguredCount > 0) {
    items.push({
      key: 'unconfigured',
      icon: 'build',
      text: `${unconfiguredCount} 台设备未配置`,
      tone: 'warn',
      to: '/cloud/nodes?filter=unconfigured'
    })
  }
  return items
})

// 按在线 > 离线 > 未配置排序，最多展示 6 台
const sortedNodes = computed(() => {
  const weight = (status: number) => {
    if (status === NODE_STATUS.ONLINE) return 0
    if (status === NODE_STATUS.ENABLED) return 1
    if (status === NODE_STATUS.UNCONFIGURED) return 2
    return 3
  }
  return [...nodes.value]
    .sort((a, b) => weight(a.node_status) - weight(b.node_status))
    .slice(0, 6)
})

function formatNodeIp(node: Node): string {
  const ip = (node as unknown as { virtual_ip?: string | number; node_ip?: string | number }).virtual_ip
    ?? (node as unknown as { node_ip?: string | number }).node_ip
  if (typeof ip === 'number' && ip > 0) {
    return [(ip >>> 24) & 255, (ip >>> 16) & 255, (ip >>> 8) & 255, ip & 255].join('.')
  }
  return ip ? String(ip) : '未分配虚拟 IP'
}

function formatSeen(ts: string): string {
  try {
    return formatRelativeTime(ts)
  } catch {
    return ''
  }
}

function nodeStatusText(status: number): string {
  if (status === NODE_STATUS.ONLINE) return '在线'
  if (status === NODE_STATUS.ENABLED) return '离线'
  if (status === NODE_STATUS.UNCONFIGURED) return '未配置'
  return '已停用'
}

function nodeStatusDotClass(status: number): string {
  if (status === NODE_STATUS.ONLINE) return 'dot--ok'
  if (status === NODE_STATUS.ENABLED) return 'dot--warn'
  return 'dot--muted'
}

function nodeStatusPillClass(status: number): string {
  if (status === NODE_STATUS.ONLINE) return 'pill--ok'
  if (status === NODE_STATUS.ENABLED) return 'pill--warn'
  return 'pill--muted'
}

async function fetchSecondaryAssets() {
  extraLoading.value = true
  try {
    await Promise.allSettled([
      fetchStatistics(),
      utcService.getAcceleration().then((res) => {
        const items = res?.items || []
        utcSummary.total = items.length
        utcSummary.effective = items.filter((i) => i.effective_enabled).length
        const blocked = items.find((i) => i.blocked_by && i.blocked_by !== 'user')
        if (blocked?.blocked_by === 'quota') utcSummary.blockedLabel = '加速配额已满'
        else if (blocked?.blocked_by === 'tenant') utcSummary.blockedLabel = '当前网络区未开启加速'
        else if (blocked?.blocked_by === 'platform') utcSummary.blockedLabel = '平台加速维护中'
        else utcSummary.blockedLabel = ''
      }),
      socialService.getOverview().then((res) => {
        socialSummary.friendsCount = res?.stats?.friends_count ?? res?.friends?.length ?? 0
        socialSummary.pendingRequests = res?.stats?.pending_count ?? res?.pending_requests?.length ?? 0
      })
    ])
  } finally {
    extraLoading.value = false
  }
}

async function handleRefresh() {
  await Promise.allSettled([fetchDashboardData(), fetchSecondaryAssets()])
}

onMounted(() => {
  void fetchSecondaryAssets()
})
</script>

<style lang="scss" scoped>
.dashboard-shell {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.dash-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.dash-subtitle {
  font-size: 12.5px;
  color: #64748b;
  margin-top: 2px;
}

.empty-hero {
  padding: 18px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #bfdbfe;
}

.attention-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.attention-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 600;
  color: #b45309;
  flex-shrink: 0;
}

.attention-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attention-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.12s ease, background-color 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &--err {
    background: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
  }

  &--warn {
    background: #ffffff;
    border-color: #fcd34d;
    color: #92400e;
  }

  .chip-arrow {
    opacity: 0.7;
  }
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);
    transform: translateY(-1px);
  }
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.kpi-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--blue { background: #eff6ff; color: #2563eb; }
  &--indigo { background: #eef2ff; color: #4f46e5; }
  &--teal { background: #f0fdfa; color: #0f766e; }
  &--amber { background: #fffbeb; color: #d97706; }
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 10px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}

.kpi-denom {
  font-size: 12.5px;
  color: #64748b;
}

.kpi-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}

.panel-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-title {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.panel-count {
  margin-left: 6px;
  font-size: 11.5px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
}

.panel-empty {
  padding: 36px 16px;
  text-align: center;
}

.device-list {
  display: flex;
  flex-direction: column;
}

.device-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }
}

.device-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.device-info {
  min-width: 0;
}

.device-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
}

.device-meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.device-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.dot--ok { background: #16a34a; }
  &.dot--warn { background: #f59e0b; }
  &.dot--muted { background: #cbd5e1; }
}

.node-status-pill {
  font-size: 11.5px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;

  &.pill--ok { background: #dcfce7; color: #166534; }
  &.pill--warn { background: #fef3c7; color: #92400e; }
  &.pill--muted { background: #f1f5f9; color: #475569; }
}

.row-arrow {
  color: #94a3b8;
}

.social-stats-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
}

.social-stat {
  flex: 1;
  text-align: center;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 8px;
  transition: background-color 0.12s ease;

  &:hover {
    background: #f8fafc;
  }

  &__val {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }

  &__lbl {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
}

.social-stat-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px;
}

.quick-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #93c5fd;
    background: #eff6ff;
    color: #1d4ed8;
  }

  &__icon {
    color: #2563eb;
  }

  &__label {
    font-size: 12.5px;
    font-weight: 500;
  }
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.body--dark {
  .dash-title,
  .kpi-value,
  .panel-title,
  .device-name,
  .social-stat__val {
    color: #f8fafc;
  }

  .dash-subtitle,
  .kpi-label,
  .kpi-denom,
  .kpi-foot,
  .device-meta,
  .social-stat__lbl {
    color: #94a3b8;
  }

  .kpi-card,
  .panel-card {
    background: #0f172a;
    border-color: #1e293b;
  }

  .panel-head,
  .device-row {
    border-color: #1e293b;
  }

  .device-row:hover,
  .social-stat:hover {
    background: #1e293b;
  }

  .quick-tile {
    background: #1e293b;
    border-color: #334155;
    color: #e2e8f0;

    &:hover {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.16);
      color: #93c5fd;
    }
  }

  .attention-bar {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.3);
  }
}
</style>
