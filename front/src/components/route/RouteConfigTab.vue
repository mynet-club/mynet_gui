<template>
  <div class="route-config-tab">
    <!-- 配置信息 -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-banner class="bg-blue-1 text-primary">
          <template v-slot:avatar>
            <q-icon name="info" />
          </template>
          <div class="text-body1">{{ $t('routes.config.description') }}</div>
        </q-banner>
      </div>
    </div>

    <!-- 配置状态 -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ $t('routes.config.configStatus') }}</div>
                <div class="text-body2 text-grey-6">
                  {{ config ? $t('routes.config.configReady') : $t('routes.config.configNotReady') }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon 
                  :name="config ? 'check_circle' : 'error'" 
                  :color="config ? 'positive' : 'negative'"
                  size="2rem"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ $t('routes.config.lastUpdated') }}</div>
                <div class="text-body2 text-grey-6">
                  {{ config ? formatDate(config.last_updated) : $t('routes.config.never') }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="update" color="info" size="2rem" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 配置详情 -->
    <div v-if="config" class="row q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('routes.config.configDetails') }}</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-4">
                <div class="text-body2">
                  <strong>{{ $t('routes.config.version') }}:</strong> {{ config.version }}
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-body2">
                  <strong>{{ $t('routes.config.format') }}:</strong> {{ config.config_format }}
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-body2">
                  <strong>{{ $t('routes.config.entries') }}:</strong> {{ config.routes.length }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 配置内容预览 -->
    <div v-if="config" class="row q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">{{ $t('routes.config.preview') }}</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  icon="copy"
                  :label="$t('routes.config.copy')"
                  @click="copyConfig"
                />
              </div>
            </div>
            <q-separator class="q-mb-md" />
            <pre class="config-preview">{{ config.config_content }}</pre>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="row q-gutter-md">
      <div class="col-12 col-md-6">
        <q-btn
          color="primary"
          icon="download"
          :label="$t('routes.config.download')"
          @click="$emit('download')"
          :loading="loading"
          :disable="!config"
          class="full-width"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-btn
          color="secondary"
          icon="refresh"
          :label="$t('routes.config.refresh')"
          @click="$emit('refresh')"
          :loading="loading"
          class="full-width"
        />
      </div>
    </div>

    <!-- 配置入口列表 -->
    <div v-if="config && config.routes.length > 0" class="row q-mt-lg">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('routes.config.routeEntries') }}</div>
            <q-table
              :rows="config.routes"
              :columns="columns"
              :loading="loading"
              row-key="node_id"
              flat
              bordered
              dense
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    icon="info"
                    size="sm"
                    @click="showEntryDetails(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import type { RouteConfig } from '../../types'

interface Props {
  config: RouteConfig | null
  loading: boolean
}

interface Emits {
  (e: 'download'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
const $q = useQuasar()

// 表格列定义
const columns = computed(() => [
  {
    name: 'node_id',
    required: true,
    label: t('routes.config.nodeId'),
    align: 'left' as const,
    field: 'node_id'
  },
  {
    name: 'ip_address',
    required: true,
    label: t('routes.config.ipAddress'),
    align: 'left' as const,
    field: 'ip_address'
  },
  {
    name: 'mask',
    required: true,
    label: t('routes.config.mask'),
    align: 'left' as const,
    field: 'mask'
  },
  {
    name: 'gateway',
    label: t('routes.config.gateway'),
    align: 'left' as const,
    field: 'gateway'
  },
  {
    name: 'metric',
    label: t('routes.config.metric'),
    align: 'left' as const,
    field: 'metric'
  },
  {
    name: 'actions',
    label: t('routes.config.actions'),
    align: 'center' as const,
    field: 'actions'
  }
])

// 复制配置
const copyConfig = () => {
  if (props.config) {
    navigator.clipboard.writeText(props.config.config_content).then(() => {
      $q.notify({
        type: 'positive',
        message: t('routes.config.copied')
      })
    })
  }
}

// 显示入口详情
const showEntryDetails = (entry: any) => {
  $q.dialog({
    title: t('routes.config.entryDetails'),
    message: `
      ${t('routes.config.nodeId')}: ${entry.node_id}
      ${t('routes.config.ipAddress')}: ${entry.ip_address}
      ${t('routes.config.mask')}: ${entry.mask}
      ${entry.gateway ? t('routes.config.gateway') + ': ' + entry.gateway : ''}
      ${entry.metric ? t('routes.config.metric') + ': ' + entry.metric : ''}
    `
  })
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<style lang="scss" scoped>
.route-config-tab {
  .config-preview {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.4;
    overflow-x: auto;
    white-space: pre-wrap;
  }
}
</style>
