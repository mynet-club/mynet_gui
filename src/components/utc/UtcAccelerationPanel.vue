<template>
  <q-card flat bordered class="utc-acceleration q-mb-md">
    <q-card-section class="row items-center q-pb-none">
      <div>
        <div class="text-subtitle1">{{ t('utcAcceleration.title') }}</div>
        <div class="text-caption text-grey-7">{{ t('utcAcceleration.subtitle') }}</div>
      </div>
      <q-space />
      <q-badge
        v-if="source"
        :color="source.durable ? 'positive' : 'warning'"
        class="q-mr-sm"
      >
        {{ source.mode }}
      </q-badge>
      <q-btn
        class="btn-ghost"
        icon="refresh"
        :label="t('utcAcceleration.refresh')"
        :loading="loading"
        @click="load"
      />
    </q-card-section>

    <q-banner dense rounded class="utc-acceleration__notice q-mx-md q-mt-md">
      <template #avatar>
        <q-icon name="sync_problem" />
      </template>
      {{ t('utcAcceleration.pendingNotice') }}
    </q-banner>

    <q-banner
      v-if="actionError"
      dense
      rounded
      class="utc-acceleration__error q-mx-md q-mt-md"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ actionError }}
      <template #action>
        <q-btn flat dense icon="close" :aria-label="t('common.cancel')" @click="actionError = ''" />
      </template>
    </q-banner>

    <MynetErrorPanel
      v-if="error"
      :message="error"
      retryable
      class="q-mx-md q-mt-md"
      @retry="load"
    />

    <q-banner
      v-else-if="!loading && rows.length === 0"
      dense
      rounded
      class="q-mx-md q-mt-md"
    >
      <template #avatar>
        <q-icon name="router" />
      </template>
      {{ t('utcAcceleration.empty') }}
    </q-banner>

    <q-list v-else separator>
      <q-item v-for="row in rows" :key="row.transport_id">
        <q-item-section>
          <q-item-label class="mono">{{ row.transport_id }}</q-item-label>
          <q-item-label caption>
            {{ t('utcAcceleration.account') }} {{ row.account_id }}
            <span v-if="row.updated_at">
              · {{ t('utcAcceleration.updatedAt') }} {{ formatUtcTime(row.updated_at) }}
            </span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-sm">
            <q-chip dense size="sm" :color="metaOf(row).color">
              {{ t(metaOf(row).labelKey) }}
            </q-chip>
            <q-toggle
              :model-value="row.desired_enabled"
              :disable="row.saving"
              :color="row.desired_enabled ? 'primary' : 'grey'"
              :aria-label="t('utcAcceleration.toggleAria', { transport: row.transport_id })"
              @update:model-value="(value: boolean) => toggle(row, value)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <q-inner-loading :showing="loading" />
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import MynetErrorPanel from '../mynet/MynetErrorPanel.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type { UtcAccelerationItem, UtcDataSource } from '../../types/utc'
import { accelerationState, formatUtcTime, type UtcAccelerationState } from '../../utils/utcFormat'

type Row = UtcAccelerationItem & { saving: boolean }

const STATE_META: Record<UtcAccelerationState, { color: string; labelKey: string }> = {
  applied: { color: 'positive', labelKey: 'utcAcceleration.stateApplied' },
  pending: { color: 'warning', labelKey: 'utcAcceleration.statePending' },
  disabled: { color: 'grey', labelKey: 'utcAcceleration.stateDisabled' }
}

const { t } = useI18n()
const $q = useQuasar()

const loading = ref(false)
const error = ref('')
const actionError = ref('')
const rows = ref<Row[]>([])
const source = ref<UtcDataSource | null>(null)

function metaOf(row: Row) {
  return STATE_META[accelerationState(row.desired_enabled, row.observed_state)]
}

function isUnauthorized(e: unknown): boolean {
  const status = (e as { response?: { status?: number } })?.response?.status
  return status === 401 || status === 403
}

function confirmDisable(row: Row): Promise<boolean> {
  return new Promise((resolve) => {
    $q.dialog({
      title: t('utcAcceleration.confirmDisableTitle'),
      message: t('utcAcceleration.confirmDisableMessage', { transport: row.transport_id }),
      cancel: { label: t('common.cancel'), flat: true },
      ok: { label: t('utcAcceleration.confirmDisable'), color: 'negative', unelevated: true },
      persistent: true
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}

async function toggle(row: Row, next: boolean): Promise<void> {
  if (row.saving) return
  if (!next && !(await confirmDisable(row))) return
  const previous = row.desired_enabled
  row.desired_enabled = next
  row.saving = true
  actionError.value = ''
  try {
    const updated = await utcService.setAcceleration(row.transport_id, next)
    Object.assign(row, updated, { saving: false })
  } catch (e) {
    row.desired_enabled = previous
    row.saving = false
    const base = next
      ? t('utcAcceleration.enableFailed')
      : t('utcAcceleration.disableFailed')
    const reason = isUnauthorized(e) ? t('utcAcceleration.unauthorized') : describeUtcError(e)
    actionError.value = `${base} ${reason}`
  }
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  actionError.value = ''
  try {
    const data = await utcService.getAcceleration()
    source.value = data.data_source
    rows.value = data.items.map((item) => ({ ...item, saving: false }))
  } catch (e) {
    rows.value = []
    error.value = isUnauthorized(e) ? t('utcAcceleration.unauthorized') : describeUtcError(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.utc-acceleration__notice {
  background: rgba(245, 158, 11, 0.08);
}
.utc-acceleration__error {
  background: rgba(220, 38, 38, 0.06);
  color: var(--err, var(--color-error, #dc2626));
}
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
