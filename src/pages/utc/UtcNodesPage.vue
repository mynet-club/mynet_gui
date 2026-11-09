<template>
  <PageLayout title="UTC 节点" subtitle="hub scope、Edge 目录与 transport 身份" icon="hub">
    <template #actions>
      <q-btn
        class="btn-ghost"
        icon="refresh"
        label="刷新"
        :loading="loading"
        @click="load"
      />
    </template>

    <UtcSourceNotice :scope="scope" :source="source" />

    <MynetErrorPanel
      v-if="error"
      :message="error"
      retryable
      @retry="load"
    />

    <template v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard label="scope" :value="scope || '—'" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard
            label="可调度 Edge"
            :value="String(hub?.eligible ?? 0)"
            :sub="`目录 ${hub?.edge_count ?? 0} 个`"
            :tone="(hub?.eligible ?? 0) > 0 ? 'ok' : 'warn'"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard label="我的 transport" :value="String(transports.length)" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <MynetMetricCard
            label="最近上报"
            :value="formatUtcTime(hub?.observed_at)"
            sub="Edge 自报时间"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section class="row items-center q-pb-none">
              <div class="text-subtitle1">Edge 目录</div>
              <q-space />
              <q-chip dense size="sm" :color="(hub?.eligible ?? 0) > 0 ? 'positive' : 'warning'">
                {{ hub?.eligible ?? 0 }} / {{ hub?.edge_count ?? 0 }} 可调度
              </q-chip>
            </q-card-section>
            <q-table
              :rows="hub?.edges ?? []"
              :columns="edgeColumns"
              row-key="edge_id"
              dense
              flat
              :pagination="{ rowsPerPage: 10 }"
              no-data-label="暂无 Edge 上报"
            >
              <template #body-cell-endpoint="props">
                <q-td :props="props">
                  <span class="mono">{{ props.row.endpoint || '—' }}:{{ props.row.port || '—' }}</span>
                </q-td>
              </template>
              <template #body-cell-online="props">
                <q-td :props="props">
                  <q-chip dense size="sm" :color="props.row.online ? 'positive' : 'grey'">
                    {{ props.row.online ? '在线' : '离线' }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-eligible="props">
                <q-td :props="props">
                  <q-chip dense size="sm" :color="props.row.eligible ? 'positive' : 'warning'">
                    {{ props.row.eligible ? '可调度' : '不可调度' }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-last_seen_at="props">
                <q-td :props="props">{{ formatUtcTime(props.row.last_seen_at) }}</q-td>
              </template>
            </q-table>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1">transport 身份</div>
              <div class="text-caption text-grey-7">注册主体由认证账号决定；同一 scope 内 node_id 与 SPKI 1:1</div>
            </q-card-section>
            <q-table
              :rows="transports"
              :columns="transportColumns"
              row-key="transport_id"
              dense
              flat
              :pagination="{ rowsPerPage: 10 }"
              no-data-label="当前账号尚未注册 transport"
            >
              <template #body-cell-spki_sha256="props">
                <q-td :props="props">
                  <span class="mono" :title="props.row.spki_sha256">{{ shortSpki(props.row.spki_sha256) }}</span>
                </q-td>
              </template>
              <template #body-cell-registered_at="props">
                <q-td :props="props">{{ formatUtcTime(props.row.registered_at) }}</q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import MynetMetricCard from '../../components/mynet/MynetMetricCard.vue'
import MynetErrorPanel from '../../components/mynet/MynetErrorPanel.vue'
import UtcSourceNotice from '../../components/utc/UtcSourceNotice.vue'
import { describeUtcError, utcService } from '../../services/utc/utcService'
import type { UtcDataSource, UtcHubStatus, UtcTransport } from '../../types/utc'
import { formatUtcTime } from '../../utils/utcFormat'

const loading = ref(false)
const error = ref('')
const hub = ref<UtcHubStatus | null>(null)
const transports = ref<UtcTransport[]>([])
const scope = ref('')
const source = ref<UtcDataSource | null>(null)

const edgeColumns = [
  { name: 'edge_id', label: 'Edge', field: 'edge_id', align: 'left' as const, sortable: true },
  { name: 'endpoint', label: '端点', field: 'endpoint', align: 'left' as const },
  { name: 'family', label: '地址族', field: 'family', align: 'left' as const },
  { name: 'shard', label: 'shard', field: 'shard', align: 'left' as const },
  { name: 'online', label: '在线', field: 'online', align: 'left' as const },
  { name: 'eligible', label: '可调度', field: 'eligible', align: 'left' as const },
  { name: 'last_seen_at', label: '最近上报', field: 'last_seen_at', align: 'left' as const }
]

const transportColumns = [
  { name: 'transport_id', label: 'transport', field: 'transport_id', align: 'left' as const },
  { name: 'node_id', label: 'node 别名', field: 'node_id', align: 'left' as const },
  { name: 'spki_sha256', label: 'SPKI SHA-256', field: 'spki_sha256', align: 'left' as const },
  { name: 'registered_at', label: '注册时间', field: 'registered_at', align: 'left' as const }
]

function shortSpki(value: string): string {
  if (!value) return '—'
  return `${value.slice(0, 12)}…${value.slice(-8)}`
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [status, list] = await Promise.all([
      utcService.getHubStatus(),
      utcService.listTransports()
    ])
    hub.value = status
    scope.value = status.scope
    source.value = status.data_source
    transports.value = list.transports
  } catch (e) {
    error.value = describeUtcError(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
