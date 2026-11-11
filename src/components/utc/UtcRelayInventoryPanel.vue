<template>
  <q-card flat bordered class="utc-relay-inventory q-mb-md">
    <q-card-section class="row items-center q-pb-none">
      <div>
        <div class="text-subtitle1">Relay 库存</div>
        <div class="text-caption text-grey-7">
          谁可以成为 Edge/Relay；新声明默认“待批准”，材料变更会重新打回待批准
        </div>
      </div>
      <q-space />
      <q-chip dense size="sm" class="q-mr-sm">
        {{ items.length }} 条
      </q-chip>
      <q-chip dense size="sm" color="positive" text-color="white">
        {{ eligibleCount }} 可调度
      </q-chip>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="新增 Relay"
        class="q-ml-sm"
        @click="openCreate"
      />
      <q-btn class="btn-ghost q-ml-sm" icon="refresh" label="刷新" :loading="loading" @click="load" />
    </q-card-section>

    <q-banner dense rounded class="utc-relay-inventory__notice q-mx-md q-mt-md">
      <template #avatar>
        <q-icon name="sync_problem" />
      </template>
      {{ delivery?.note || 'Hub 管理面下发未接通：以下记录只是管理面配置，不产生 placement，也未在 Hub 生效。' }}
    </q-banner>

    <q-banner v-if="actionError" dense rounded class="utc-relay-inventory__error q-mx-md q-mt-md">
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ actionError }}
      <template #action>
        <q-btn flat dense icon="close" aria-label="关闭" @click="actionError = ''" />
      </template>
    </q-banner>

    <MynetErrorPanel
      v-if="error"
      :message="error"
      :retryable="!forbidden"
      class="q-mx-md q-mt-md"
      @retry="load"
    />

    <q-banner v-else-if="!loading && items.length === 0" dense rounded class="q-mx-md q-mt-md">
      <template #avatar>
        <q-icon name="dns" />
      </template>
      尚未声明任何 Relay。没有显式批准与有效声明的 Edge 不会被当作可调度库存。
    </q-banner>

    <q-table
      v-else
      :rows="items"
      :columns="columns"
      row-key="edge_id"
      dense
      flat
      :pagination="{ rowsPerPage: 20 }"
      no-data-label="尚未声明任何 Relay"
    >
      <template #body-cell-edge_id="props">
        <q-td :props="props">
          <div class="mono">{{ props.row.edge_id }}</div>
          <div class="text-caption text-grey-7">rev {{ props.row.inventory_revision }}</div>
        </q-td>
      </template>
      <template #body-cell-endpoint="props">
        <q-td :props="props">
          <span class="mono">{{ formatEndpoint(props.row.address, props.row.port) }}</span>
          <div class="text-caption text-grey-7">IPv{{ props.row.family }} · {{ props.row.modes.join('/') }}</div>
        </q-td>
      </template>
      <template #body-cell-pool="props">
        <q-td :props="props">
          <div>{{ props.row.pool_id }}</div>
          <div class="text-caption text-grey-7">{{ props.row.region }}<span v-if="props.row.zone"> / {{ props.row.zone }}</span></div>
        </q-td>
      </template>
      <template #body-cell-approval_state="props">
        <q-td :props="props">
          <q-chip dense size="sm" :color="approvalMeta(props.row).color">
            {{ approvalMeta(props.row).label }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-eligibility="props">
        <q-td :props="props">
          <q-chip dense size="sm" :color="stateMeta(props.row).color">
            {{ stateMeta(props.row).label }}
          </q-chip>
          <div v-if="props.row.eligibility_reasons.length > 0" class="text-caption text-grey-7">
            {{ props.row.eligibility_reasons.map(reasonLabel).join(' · ') }}
          </div>
        </q-td>
      </template>
      <template #body-cell-valid_until="props">
        <q-td :props="props">{{ formatUtcTime(props.row.valid_until) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-xs no-wrap">
            <q-btn
              v-if="props.row.approval_state !== 'approved' && props.row.declared_state !== 'revoked'"
              dense
              flat
              color="positive"
              label="批准"
              @click="openApprove(props.row)"
            />
            <q-btn
              dense
              flat
              label="编辑"
              :disable="props.row.declared_state === 'revoked'"
              @click="openEdit(props.row)"
            />
            <q-btn
              v-if="props.row.declared_state !== 'revoked'"
              dense
              flat
              color="negative"
              label="撤销"
              @click="openRevoke(props.row)"
            />
            <q-chip v-if="props.row.declared_state === 'revoked'" dense size="sm" color="grey">
              终态
            </q-chip>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- 声明/编辑表单 -->
    <q-dialog v-model="formOpen" persistent>
      <q-card class="utc-relay-inventory__dialog">
        <q-card-section class="text-subtitle1">
          {{ editing ? `编辑 Relay ${editing.edge_id}` : '新增 Relay 声明' }}
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <div class="text-caption text-grey-7">
            提交后仍为“待批准”；批准与声明分离，配置不会下发 Hub。
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-input
                v-model.number="form.edge_id"
                type="number"
                min="1"
                dense
                outlined
                label="edge_id"
                :disable="!!editing"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.address" dense outlined label="地址（IPv4/IPv6 字面量）" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.port" type="number" min="1" max="65535" dense outlined label="端口" />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model.number="form.family"
                :options="[4, 6]"
                dense
                outlined
                emit-value
                map-options
                label="地址族"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.pool_id" dense outlined label="pool_id" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.region" dense outlined label="region（小写字母/数字/-）" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.zone" dense outlined label="zone（可选）" />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="form.visibility"
                :options="visibilityOptions"
                dense
                outlined
                emit-value
                map-options
                label="visibility"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="form.trust_tier"
                :options="trustOptions"
                dense
                outlined
                emit-value
                map-options
                label="trust_tier"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="form.modes"
                :options="modeOptions"
                dense
                outlined
                multiple
                emit-value
                map-options
                label="modes"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.cost_tier" type="number" min="0" max="9" dense outlined label="cost_tier" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.shard_count" type="number" min="1" dense outlined label="shard_count" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.reactor_count" type="number" min="1" dense outlined label="reactor_count" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.max_streams" type="number" min="1" dense outlined label="max_streams" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.max_mbps" type="number" min="1" dense outlined label="max_mbps" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.headroom_pct" type="number" min="0" max="50" dense outlined label="headroom %" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.weight" type="number" min="1" max="100" dense outlined label="weight" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.valid_until" type="datetime-local" dense outlined label="valid_until（≤7 天）" />
            </div>
            <div class="col-12 col-sm-4" v-if="editing">
              <q-select
                v-model="form.declared_state"
                :options="declaredOptions"
                dense
                outlined
                emit-value
                map-options
                label="declared_state"
              />
            </div>
            <div class="col-12">
              <q-input v-model="form.descriptor_digest" dense outlined label="descriptor_digest（64 hex）" />
            </div>
            <div class="col-12">
              <q-input v-model="form.spki_sha256_current" dense outlined label="spki_sha256_current（64 hex）" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.cert_epoch" type="number" min="1" dense outlined label="cert_epoch" />
            </div>
            <div class="col-12 col-sm-8">
              <q-input v-model="form.audit_ref" dense outlined label="audit_ref（工单/审计引用）" />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="submitting" @click="formOpen = false" />
          <q-btn color="primary" unelevated label="保存" :loading="submitting" @click="submitForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 批准 / 撤销确认 -->
    <q-dialog v-model="actionOpen" persistent>
      <q-card class="utc-relay-inventory__dialog">
        <q-card-section class="text-subtitle1">
          {{ actionMode === 'approve' ? '批准 Relay 声明' : '撤销 Relay 声明' }}
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <div class="text-caption text-grey-7">
            edge_id {{ actionRow?.edge_id }} · revision {{ actionRow?.inventory_revision }}
            <span v-if="actionMode === 'approve'">（批准仅让配置可调度，仍不下发 Hub）</span>
            <span v-else>（撤销是终态，管理面不能复活）</span>
          </div>
          <q-input
            v-if="actionMode === 'revoke'"
            v-model="actionReason"
            dense
            outlined
            label="撤销原因"
          />
          <q-input v-model="actionAuditRef" dense outlined label="audit_ref" />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="submitting" @click="actionOpen = false" />
          <q-btn
            :color="actionMode === 'approve' ? 'positive' : 'negative'"
            unelevated
            :label="actionMode === 'approve' ? '确认批准' : '确认撤销'"
            :loading="submitting"
            @click="submitAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import MynetErrorPanel from '../mynet/MynetErrorPanel.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type {
  UtcRelayDelivery,
  UtcRelayInventoryDraft,
  UtcRelayInventoryItem
} from '../../types/utc'
import {
  formatEndpoint,
  formatUtcTime,
  relayInventoryState,
  type UtcRelayState
} from '../../utils/utcFormat'

const REASON_LABELS: Record<string, string> = {
  NOT_APPROVED: '未批准',
  REVOKED: '已撤销',
  DRAINING: 'draining',
  NOT_YET_VALID: '未到生效时间',
  EXPIRED: '已过期'
}

const STATE_META: Record<UtcRelayState, { color: string; label: string }> = {
  eligible: { color: 'positive', label: '可调度（仅配置）' },
  pending: { color: 'warning', label: '待批准' },
  draining: { color: 'orange', label: 'draining' },
  revoked: { color: 'grey', label: '已撤销' },
  expired: { color: 'grey', label: '已过期' }
}

const APPROVAL_META: Record<string, { color: string; label: string }> = {
  pending: { color: 'warning', label: '待批准' },
  approved: { color: 'positive', label: '已批准' },
  revoked: { color: 'grey', label: '已撤销' }
}

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const actionError = ref('')
const forbidden = ref(false)
const items = ref<UtcRelayInventoryItem[]>([])
const delivery = ref<UtcRelayDelivery | null>(null)

const formOpen = ref(false)
const editing = ref<UtcRelayInventoryItem | null>(null)

const actionOpen = ref(false)
const actionMode = ref<'approve' | 'revoke'>('approve')
const actionRow = ref<UtcRelayInventoryItem | null>(null)
const actionReason = ref('')
const actionAuditRef = ref('')

const visibilityOptions = [
  { label: 'tenant（本租户）', value: 'tenant' },
  { label: 'pool（资源池）', value: 'pool' },
  { label: 'public（公共）', value: 'public' }
]
const trustOptions = [
  { label: 'platform', value: 'platform' },
  { label: 'verified', value: 'verified' },
  { label: 'community', value: 'community' }
]
const modeOptions = [
  { label: 'A-S', value: 'A-S' },
  { label: 'A-D', value: 'A-D' }
]
const declaredOptions = [
  { label: 'active', value: 'active' },
  { label: 'draining', value: 'draining' }
]

const columns = [
  { name: 'edge_id', label: 'edge', field: 'edge_id', align: 'left' as const, sortable: true },
  { name: 'endpoint', label: '端点', field: 'address', align: 'left' as const },
  { name: 'pool', label: 'pool / region', field: 'pool_id', align: 'left' as const },
  { name: 'approval_state', label: '批准', field: 'approval_state', align: 'left' as const },
  { name: 'eligibility', label: '可调度', field: 'eligible', align: 'left' as const },
  { name: 'valid_until', label: '有效期至', field: 'valid_until', align: 'left' as const },
  { name: 'actions', label: '操作', field: 'edge_id', align: 'left' as const }
]

const eligibleCount = computed(() => items.value.filter((item) => item.eligible).length)

const form = reactive({
  edge_id: 1001 as number | undefined,
  address: '',
  port: 4433,
  family: 4,
  pool_id: 'pool-east',
  region: 'cn-east',
  zone: '',
  visibility: 'tenant',
  trust_tier: 'verified',
  modes: ['A-D'] as string[],
  cost_tier: 3,
  shard_count: 4,
  reactor_count: 2,
  max_streams: 2048,
  max_mbps: 500,
  headroom_pct: 10,
  weight: 10,
  valid_until: toLocalInput(new Date(Date.now() + 24 * 3600 * 1000)),
  descriptor_digest: '',
  spki_sha256_current: '',
  cert_epoch: 1,
  audit_ref: '',
  declared_state: 'active' as 'active' | 'draining'
})

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function reasonLabel(code: string): string {
  return REASON_LABELS[code] || code
}

function approvalMeta(row: UtcRelayInventoryItem) {
  return APPROVAL_META[row.approval_state] || { color: 'grey', label: row.approval_state }
}

function stateMeta(row: UtcRelayInventoryItem) {
  return STATE_META[relayInventoryState(row.approval_state, row.declared_state, row.eligible, row.eligibility_reasons)]
}

function isForbidden(e: unknown): boolean {
  const status = (e as { response?: { status?: number } })?.response?.status
  return status === 401 || status === 403
}

function resetError(): void {
  error.value = ''
  actionError.value = ''
  forbidden.value = false
}

function openCreate(): void {
  editing.value = null
  Object.assign(form, {
    edge_id: 1001,
    address: '',
    port: 4433,
    family: 4,
    pool_id: 'pool-east',
    region: 'cn-east',
    zone: '',
    visibility: 'tenant',
    trust_tier: 'verified',
    modes: ['A-D'],
    cost_tier: 3,
    shard_count: 4,
    reactor_count: 2,
    max_streams: 2048,
    max_mbps: 500,
    headroom_pct: 10,
    weight: 10,
    valid_until: toLocalInput(new Date(Date.now() + 24 * 3600 * 1000)),
    descriptor_digest: '',
    spki_sha256_current: '',
    cert_epoch: 1,
    audit_ref: '',
    declared_state: 'active'
  })
  formOpen.value = true
}

function openEdit(row: UtcRelayInventoryItem): void {
  editing.value = row
  Object.assign(form, {
    edge_id: Number(row.edge_id),
    address: row.address,
    port: row.port,
    family: row.family,
    pool_id: row.pool_id,
    region: row.region,
    zone: row.zone || '',
    visibility: row.visibility,
    trust_tier: row.trust_tier,
    modes: [...row.modes],
    cost_tier: row.cost_tier,
    shard_count: row.shard_count,
    reactor_count: row.reactor_count,
    max_streams: row.max_streams,
    max_mbps: row.max_mbps,
    headroom_pct: row.headroom_pct,
    weight: row.weight,
    valid_until: toLocalInput(new Date(row.valid_until)),
    descriptor_digest: row.descriptor_digest,
    spki_sha256_current: row.spki_sha256_current,
    cert_epoch: row.cert_epoch,
    audit_ref: row.audit_ref,
    declared_state: row.declared_state === 'draining' ? 'draining' : 'active'
  })
  formOpen.value = true
}

function openApprove(row: UtcRelayInventoryItem): void {
  actionMode.value = 'approve'
  actionRow.value = row
  actionReason.value = ''
  actionAuditRef.value = row.audit_ref
  actionOpen.value = true
}

function openRevoke(row: UtcRelayInventoryItem): void {
  actionMode.value = 'revoke'
  actionRow.value = row
  actionReason.value = ''
  actionAuditRef.value = row.audit_ref
  actionOpen.value = true
}

function draft(): UtcRelayInventoryDraft | null {
  if (!form.edge_id || !form.address || !form.audit_ref || form.modes.length === 0) {
    actionError.value = 'edge_id / 地址 / modes / audit_ref 必填'
    return null
  }
  const validUntil = new Date(form.valid_until)
  if (Number.isNaN(validUntil.getTime())) {
    actionError.value = 'valid_until 不是有效时间'
    return null
  }

  return {
    edge_id: form.edge_id,
    address: form.address,
    port: form.port,
    family: form.family,
    pool_id: form.pool_id,
    region: form.region,
    zone: form.zone || null,
    visibility: form.visibility,
    trust_tier: form.trust_tier,
    modes: form.modes,
    cost_tier: form.cost_tier,
    shard_count: form.shard_count,
    reactor_count: form.reactor_count,
    max_streams: form.max_streams,
    max_mbps: form.max_mbps,
    headroom_pct: form.headroom_pct,
    weight: form.weight,
    valid_until: validUntil.toISOString(),
    descriptor_digest: form.descriptor_digest,
    spki_sha256_current: form.spki_sha256_current,
    cert_epoch: form.cert_epoch,
    audit_ref: form.audit_ref,
    declared_state: form.declared_state
  }
}

async function submitForm(): Promise<void> {
  if (submitting.value) return
  actionError.value = ''
  const payload = draft()
  if (!payload) return

  submitting.value = true
  try {
    if (editing.value) {
      await utcService.updateRelayInventory(editing.value.edge_id, {
        ...payload,
        edge_id: undefined,
        expected_revision: editing.value.inventory_revision
      })
    } else {
      // 新建不接受 declared_state（服务端固定 active）；声明状态只经撤销/更新流转
      const createPayload = { ...payload }
      delete createPayload.declared_state
      await utcService.createRelayInventory(createPayload)
    }
    formOpen.value = false
    await load()
  } catch (e) {
    actionError.value = `保存失败：${describeUtcError(e)}`
  } finally {
    submitting.value = false
  }
}

async function submitAction(): Promise<void> {
  const row = actionRow.value
  if (!row || submitting.value) return
  if (!actionAuditRef.value) {
    actionError.value = 'audit_ref 必填'
    return
  }

  submitting.value = true
  actionError.value = ''
  try {
    if (actionMode.value === 'approve') {
      await utcService.approveRelayInventory(row.edge_id, row.inventory_revision, actionAuditRef.value)
    } else {
      if (!actionReason.value) {
        actionError.value = '撤销必须填写原因'
        return
      }
      await utcService.revokeRelayInventory(
        row.edge_id,
        row.inventory_revision,
        actionReason.value,
        actionAuditRef.value
      )
    }
    actionOpen.value = false
    await load()
  } catch (e) {
    actionError.value = `${actionMode.value === 'approve' ? '批准' : '撤销'}失败：${describeUtcError(e)}`
  } finally {
    submitting.value = false
  }
}

async function load(): Promise<void> {
  loading.value = true
  resetError()
  try {
    const data = await utcService.listRelayInventory()
    items.value = data.items
    delivery.value = data.delivery
  } catch (e) {
    items.value = []
    forbidden.value = isForbidden(e)
    error.value = forbidden.value
      ? '需要管理员权限：当前账号不在 UTC 管理面白名单内。'
      : describeUtcError(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.utc-relay-inventory__notice {
  background: rgba(245, 158, 11, 0.08);
}
.utc-relay-inventory__error {
  background: rgba(220, 38, 38, 0.06);
  color: var(--err, var(--color-error, #dc2626));
}
.utc-relay-inventory__dialog {
  width: 860px;
  max-width: 92vw;
}
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
