<template>
  <div class="local-logs">
    <div class="row items-center q-mb-md">
      <div class="text-h5">日志</div>
      <q-space />
      <q-btn outline color="primary" dense label="刷新" :loading="loading" @click="loadLogs" />
    </div>

    <q-tabs v-model="tab" dense align="left" class="q-mb-sm" active-color="primary" indicator-color="primary">
      <q-tab name="events" label="服务事件" />
      <q-tab v-for="f in files" :key="f.name" :name="'file:' + f.name" :label="f.name" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="events" class="panel-pad">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <q-slider v-model="lines" :min="20" :max="400" :step="20" label style="max-width:240px" />
          <span class="text-caption text-grey-7">最近 {{ lines }} 行</span>
          <q-space />
          <q-btn flat dense label="清空" :loading="clearing" @click="onClear" />
        </div>
        <q-table
          v-if="eventRows.length"
          flat dense
          :rows="eventRows"
          :columns="eventCols"
          row-key="id"
          :pagination="noPaging"
        />
        <MynetEmpty v-else text="暂无服务事件" icon="article" action-label="刷新" @action="loadLogs" />
        <div v-if="moreAvailable" class="row justify-center q-mt-sm">
          <q-btn outline color="primary" dense label="加载更多" :loading="loading" @click="loadMore" />
        </div>
        <div v-else class="text-caption text-grey-7 q-mt-sm text-center">已到末尾</div>
      </q-tab-panel>

      <q-tab-panel v-for="f in files" :key="f.name" :name="'file:' + f.name" class="panel-pad">
        <pre class="raw mono">{{ f.text }}</pre>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { localGatewayApi } from '../../services/local/localApi'
import MynetEmpty from '../../components/mynet/MynetEmpty.vue'

const $q = useQuasar()
const tab = ref('events')
const lines = ref(80)
const loading = ref(false)
const clearing = ref(false)
const events = ref<{ time?: string; level?: string; comp?: string; msg?: string; attrs?: string }[]>([])
const noPaging = { rowsPerPage: 0, sortBy: 'time' }
const moreAvailable = computed(() => events.value.length > 0 && events.value.length >= lines.value)
const files = ref<{ name: string; text: string }[]>([])

const eventRows = computed(() =>
  events.value.map((e, i) => ({
    id: i,
    time: e.time || '',
    level: e.level || '',
    comp: e.comp || '',
    msg: e.msg || '',
    attrs: e.attrs || ''
  }))
)
const eventCols = [
  { name: 'time', label: '时间', field: 'time', align: 'left' as const, style: 'width:80px' },
  { name: 'level', label: '级别', field: 'level', align: 'left' as const, style: 'width:70px' },
  { name: 'comp', label: '组件', field: 'comp', align: 'left' as const, style: 'width:100px' },
  { name: 'msg', label: '消息', field: 'msg', align: 'left' as const },
  { name: 'attrs', label: '详情', field: 'attrs', align: 'left' as const }
]

async function loadLogs() {
  loading.value = true
  try {
    const raw = await localGatewayApi.getLogs(lines.value) as unknown as {
      events?: { time?: string; level?: string; comp?: string; msg?: string; attrs?: string }[]
      files?: { name: string; text: string }[]
    }
    events.value = raw.events || []
    files.value = raw.files || []
    if (tab.value.startsWith('file:') && !files.value.some((f) => 'file:' + f.name === tab.value)) {
      tab.value = 'events'
    }
  } catch {
    events.value = []
    files.value = []
  } finally {
    loading.value = false
  }
}

function onClear() {
  $q.dialog({ title: '清空服务事件日志？', message: '仅清空本机内存事件环，文件日志保留。', cancel: true }).onOk(async () => {
    clearing.value = true
    try {
      await localGatewayApi.runCommand(['logs', 'clear'], 15000)
      await loadLogs()
    } catch { /* 保留当前列表 */ } finally {
      clearing.value = false
    }
  })
}

function loadMore() {
  lines.value = Math.min(lines.value + 100, 400)
  loadLogs().catch(() => undefined)
}

watch(lines, () => { loadLogs().catch(() => undefined) })
onMounted(loadLogs)
</script>
