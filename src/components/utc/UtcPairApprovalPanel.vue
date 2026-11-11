<template>
  <q-card flat bordered class="utc-pair-approvals">
    <q-card-section class="row items-center q-pb-none">
      <div>
        <div class="text-subtitle1">已批准 pair（scoped rollout 名单）</div>
        <div class="text-caption text-grey-7">
          名单内才允许动态库存，名单外继续静态；空名单 = 一个都不批准
        </div>
      </div>
      <q-space />
      <q-chip dense size="sm" class="q-mr-sm">
        {{ counts.approved }} / {{ counts.cap }}
      </q-chip>
      <q-btn color="primary" unelevated icon="check" label="批准 pair" @click="openApprove" />
      <q-btn class="btn-ghost q-ml-sm" icon="refresh" label="刷新" :loading="loading" @click="load" />
    </q-card-section>

    <q-card-section v-if="!forbidden" class="q-pt-sm">
      <q-linear-progress
        :value="cohortPercent(counts.approved, counts.cap) / 100"
        size="6px"
        rounded
        color="primary"
        track-color="grey-3"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        cohort 上限 {{ counts.cap }}；当前 {{ counts.approved }} 条 approved。
      </div>
    </q-card-section>

    <q-banner dense rounded class="utc-pair-approvals__notice q-mx-md q-mt-md">
      <template #avatar>
        <q-icon name="sync_problem" />
      </template>
      {{ delivery?.note || 'Hub 管理面下发未接通：名单只用于管理面预置，未改变 Hub 的静态派单。' }}
    </q-banner>

    <q-banner v-if="actionError" dense rounded class="utc-pair-approvals__error q-mx-md q-mt-md">
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
        <q-icon name="alt_route" />
      </template>
      名单为空：当前没有任何 pair 被批准使用动态库存（不是“全部批准”）。
    </q-banner>

    <q-table
      v-else
      :rows="items"
      :columns="columns"
      row-key="id"
      dense
      flat
      :pagination="{ rowsPerPage: 20 }"
      no-data-label="名单为空"
    >
      <template #body-cell-transport_id="props">
        <q-td :props="props">
          <span class="mono">{{ props.row.transport_id }}</span>
        </q-td>
      </template>
      <template #body-cell-pair="props">
        <q-td :props="props">
          pair {{ props.row.pair_id }} · side {{ sideLabel(props.row.side) }}
          <div class="text-caption text-grey-7">rev {{ props.row.revision }}</div>
        </q-td>
      </template>
      <template #body-cell-state="props">
        <q-td :props="props">
          <q-chip dense size="sm" :color="props.row.state === 'approved' ? 'positive' : 'grey'">
            {{ props.row.state === 'approved' ? '已批准' : '已撤销' }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-approved_at="props">
        <q-td :props="props">{{ formatUtcTime(props.row.approved_at) }}</q-td>
      </template>
      <template #body-cell-reason="props">
        <q-td :props="props">
          <div>{{ props.row.reason }}</div>
          <div class="text-caption text-grey-7">audit {{ props.row.audit_ref }}</div>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.state === 'approved'"
            dense
            flat
            color="negative"
            label="撤销"
            @click="openRevoke(props.row)"
          />
          <span v-else class="text-caption text-grey-7">终态行</span>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="approveOpen" persistent>
      <q-card class="utc-pair-approvals__dialog">
        <q-card-section class="text-subtitle1">批准 pair</q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <div class="text-caption text-grey-7">
            只接受本租户、本 scope 已登记的 transport；同一 pair/side 重复批准是幂等的。
          </div>
          <q-input v-model="form.transport_id" dense outlined label="transport_id" />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model.number="form.pair_id" type="number" min="0" dense outlined label="pair_id" />
            </div>
            <div class="col-6">
              <q-select
                v-model.number="form.side"
                :options="sideOptions"
                dense
                outlined
                emit-value
                map-options
                label="side"
              />
            </div>
          </div>
          <q-input v-model="form.reason" dense outlined label="批准原因" />
          <q-input v-model="form.audit_ref" dense outlined label="audit_ref" />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="submitting" @click="approveOpen = false" />
          <q-btn color="primary" unelevated label="批准" :loading="submitting" @click="submitApprove" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="revokeOpen" persistent>
      <q-card class="utc-pair-approvals__dialog">
        <q-card-section class="text-subtitle1">撤销 pair 批准</q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <div class="text-caption text-grey-7">
            transport {{ revokeRow?.transport_id }} · pair {{ revokeRow?.pair_id }} ·
            side {{ sideLabel(revokeRow?.side) }} · rev {{ revokeRow?.revision }}
          </div>
          <q-input v-model="revokeReason" dense outlined label="撤销原因" />
          <q-input v-model="revokeAuditRef" dense outlined label="audit_ref" />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="submitting" @click="revokeOpen = false" />
          <q-btn color="negative" unelevated label="确认撤销" :loading="submitting" @click="submitRevoke" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import MynetErrorPanel from '../mynet/MynetErrorPanel.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type { UtcPairApprovalItem, UtcRelayDelivery } from '../../types/utc'
import { cohortPercent, formatUtcTime, sideLabel } from '../../utils/utcFormat'

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const actionError = ref('')
const forbidden = ref(false)
const items = ref<UtcPairApprovalItem[]>([])
const delivery = ref<UtcRelayDelivery | null>(null)
const counts = reactive({ approved: 0, cap: 4096 })

const approveOpen = ref(false)
const revokeOpen = ref(false)
const revokeRow = ref<UtcPairApprovalItem | null>(null)
const revokeReason = ref('')
const revokeAuditRef = ref('')

const sideOptions = [
  { label: 'A (0)', value: 0 },
  { label: 'B (1)', value: 1 }
]

const columns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const },
  { name: 'pair', label: 'pair / side', field: 'pair_id', align: 'left' as const },
  { name: 'state', label: '状态', field: 'state', align: 'left' as const },
  { name: 'approved_at', label: '批准时间', field: 'approved_at', align: 'left' as const },
  { name: 'reason', label: '原因 / 审计', field: 'reason', align: 'left' as const },
  { name: 'actions', label: '操作', field: 'id', align: 'left' as const }
]

const form = reactive({
  transport_id: '',
  pair_id: 1,
  side: 0,
  reason: '',
  audit_ref: ''
})

function isForbidden(e: unknown): boolean {
  const status = (e as { response?: { status?: number } })?.response?.status
  return status === 401 || status === 403
}

function openApprove(): void {
  Object.assign(form, { transport_id: '', pair_id: 1, side: 0, reason: '', audit_ref: '' })
  actionError.value = ''
  approveOpen.value = true
}

function openRevoke(row: UtcPairApprovalItem): void {
  revokeRow.value = row
  revokeReason.value = ''
  revokeAuditRef.value = row.audit_ref
  actionError.value = ''
  revokeOpen.value = true
}

async function submitApprove(): Promise<void> {
  if (submitting.value) return
  if (!form.transport_id || !form.reason || !form.audit_ref) {
    actionError.value = 'transport_id / 原因 / audit_ref 必填'
    return
  }

  submitting.value = true
  actionError.value = ''
  try {
    await utcService.approvePair({
      transport_id: form.transport_id,
      pair_id: form.pair_id,
      side: form.side,
      reason: form.reason,
      audit_ref: form.audit_ref
    })
    approveOpen.value = false
    await load()
  } catch (e) {
    actionError.value = `批准失败：${describeUtcError(e)}`
  } finally {
    submitting.value = false
  }
}

async function submitRevoke(): Promise<void> {
  const row = revokeRow.value
  if (!row || submitting.value) return
  if (!revokeReason.value || !revokeAuditRef.value) {
    actionError.value = '撤销原因与 audit_ref 必填'
    return
  }

  submitting.value = true
  actionError.value = ''
  try {
    await utcService.revokePairApproval(row.id, row.revision, revokeReason.value, revokeAuditRef.value)
    revokeOpen.value = false
    await load()
  } catch (e) {
    actionError.value = `撤销失败：${describeUtcError(e)}`
  } finally {
    submitting.value = false
  }
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  actionError.value = ''
  forbidden.value = false
  try {
    const data = await utcService.listPairApprovals()
    items.value = data.items
    delivery.value = data.delivery
    counts.approved = data.counts.approved
    counts.cap = data.counts.cap
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
.utc-pair-approvals__notice {
  background: rgba(245, 158, 11, 0.08);
}
.utc-pair-approvals__error {
  background: rgba(220, 38, 38, 0.06);
  color: var(--err, var(--color-error, #dc2626));
}
.utc-pair-approvals__dialog {
  width: 520px;
  max-width: 92vw;
}
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
