<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? $t('ippools.editPoolDialog') : $t('ippools.createPoolDialog') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            :label="$t('ippools.poolNameLabel')"
            :hint="$t('ippools.poolNameHint')"
            outlined
            :rules="[val => !!val || $t('ippools.poolNameRequired')]"
          />

          <q-input
            v-model="form.network"
            :label="$t('ippools.networkLabel')"
            :hint="$t('ippools.networkHint')"
            outlined
          />

          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="form.ip_range.start"
                :label="$t('ippools.startIPLabel')"
                :hint="$t('ippools.startIPHint')"
                outlined
                :rules="[
                  val => !!val || $t('ippools.startIPRequired'),
                  val => isValidIP(val) || $t('ippools.invalidIPFormat')
                ]"
              />
            </div>
            <div class="col">
              <q-input
                v-model="form.ip_range.end"
                :label="$t('ippools.endIPLabel')"
                :hint="$t('ippools.endIPHint')"
                outlined
                :rules="[
                  val => !!val || $t('ippools.endIPRequired'),
                  val => isValidIP(val) || $t('ippools.invalidIPFormat'),
                  val => validateIPRange(form.ip_range.start, val) || $t('ippools.invalidIPRange')
                ]"
              />
            </div>
          </div>

          <q-select
            v-model="form.zone_id"
            :options="zoneOptions"
            :label="$t('ippools.zoneLabel')"
            :hint="$t('ippools.zoneHint')"
            :loading="zonesLoading"
            outlined
            emit-value
            map-options
            :rules="[val => !!val || $t('ippools.zoneRequired')]"
          />

          <div class="text-caption text-grey-6" v-if="form.ip_range.start && form.ip_range.end">
            {{ $t('ippools.totalCount') }}: {{ calculateIPCount(form.ip_range.start, form.ip_range.end) }}
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" @click="onCancel" />
        <q-btn
          color="primary"
          :label="isEdit ? $t('common.save') : $t('common.add')"
          :loading="loading"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useIPPools } from '../../composables/useIPPools'
import { api } from '../../services/api'
import type { IPPool, IPPoolForm } from '../../types/ippool'

interface Zone {
  id: string
  zone_name: string
  zone_id: string
}

interface Props {
  modelValue: boolean
  pool?: IPPool | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = withDefaults(defineProps<Props>(), {
  pool: null
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { createPool, updatePool, calculateIPCount, validateIPRange, isValidIP } = useIPPools()

const loading = ref(false)
const zonesLoading = ref(false)
const form = ref<IPPoolForm>({
  name: '',
  network: '',
  ip_range: {
    start: '',
    end: ''
  },
  zone_id: ''
})

const zoneOptions = ref<Array<{ label: string; value: string }>>([])

const isEdit = computed(() => !!props.pool)

// 获取Zone列表
const fetchZones = async () => {
  zonesLoading.value = true
  try {
    const response = await api.get('/tenants')
    if (response.data.success) {
      const zones: Zone[] = response.data.data || []
      zoneOptions.value = zones.map(zone => ({
        label: zone.zone_name || zone.name || '',
        value: String(zone.zone_id ?? (zone as any).tenant_id ?? '')
      }))
    }
  } catch (error) {
    debug.error('Failed to fetch zones:', error)
  } finally {
    zonesLoading.value = false
  }
}

const resetForm = () => {
  if (props.pool) {
    form.value = {
      name: props.pool.name || '',
      network: props.pool.network || '',
      ip_range: {
        start: props.pool.ip_range.start,
        end: props.pool.ip_range.end
      },
      zone_id: props.pool.zone_id
    }
  } else {
    form.value = {
      name: '',
      network: '',
      ip_range: {
        start: '',
        end: ''
      },
      zone_id: ''
    }
  }
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value && props.pool) {
      await updatePool(props.pool.id, form.value)
    } else {
      await createPool(form.value)
    }
    emit('saved')
  } catch (error) {
    debug.error('Failed to save pool:', error)
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

onMounted(() => {
  fetchZones()
})
</script>
