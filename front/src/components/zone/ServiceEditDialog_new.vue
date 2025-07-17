<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 480px">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ isEdit ? $t('zoneServices.editService') : $t('zoneServices.addService') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- 服务名称 -->
          <q-input
            v-model="formData.service_name"
            :label="$t('zoneServices.form.serviceName')"
            :rules="[val => !!val || $t('zoneServices.form.serviceNameRequired')]"
            outlined
            dense
          />

          <!-- 服务类型 -->
          <q-select
            v-model="formData.service_type"
            :options="serviceTypeOptions"
            :label="$t('zoneServices.form.serviceType')"
            :rules="[val => !!val || $t('zoneServices.form.serviceTypeRequired')]"
            outlined
            dense
            emit-value
            map-options
            @update:model-value="onServiceTypeChange"
          />

          <!-- 服务描述 -->
          <q-input
            v-model="formData.service_description"
            :label="$t('zoneServices.form.serviceDescription')"
            type="textarea"
            rows="2"
            outlined
            dense
          />

          <!-- IP/URL -->
          <q-input
            v-model="formData.service_url"
            :label="$t('zoneServices.form.serviceUrl')"
            :rules="[val => !!val || $t('zoneServices.form.serviceUrlRequired')]"
            outlined
            dense
            placeholder="192.168.1.100 or https://example.com"
          />

          <!-- 端口 -->
          <q-input
            v-model.number="formData.service_port"
            :label="$t('zoneServices.form.servicePort')"
            :rules="[val => !!val || $t('zoneServices.form.servicePortRequired'), val => val > 0 && val <= 65535 || $t('zoneServices.form.servicePortInvalid')]"
            outlined
            dense
            type="number"
            min="1"
            max="65535"
          />

          <!-- 协议 -->
          <q-select
            v-model="formData.service_protocol"
            :options="protocolOptions"
            :label="$t('zoneServices.form.serviceProtocol')"
            :rules="[val => !!val || $t('zoneServices.form.serviceProtocolRequired')]"
            outlined
            dense
            emit-value
            map-options
          />

          <!-- 认证设置 -->
          <div class="q-gutter-sm">
            <q-checkbox
              v-model="formData.service_auth_required"
              :label="$t('zoneServices.form.authRequired')"
            />

            <div v-if="formData.service_auth_required" class="q-pl-lg">
              <q-select
                v-model="formData.service_auth_type"
                :options="authTypeOptions"
                :label="$t('zoneServices.form.authType')"
                outlined
                dense
                emit-value
                map-options
                class="q-mb-md"
              />

              <q-input
                v-if="formData.service_auth_type !== 'none'"
                v-model="formData.service_auth_token"
                :label="$t('zoneServices.form.authToken')"
                :type="showToken ? 'text' : 'password'"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-btn
                    :icon="showToken ? 'visibility_off' : 'visibility'"
                    flat
                    round
                    dense
                    @click="showToken = !showToken"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="handleCancel"
        />
        <q-btn
          color="primary"
          :label="isEdit ? $t('common.update') : $t('common.create')"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useZoneServices } from '../../composables/useZoneServices'
import type { ZoneService, CreateZoneServiceRequest, UpdateZoneServiceRequest, ServiceType } from '../../types/zoneService'

interface Props {
  modelValue: boolean
  service?: ZoneService
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { createService, updateService, serviceTypes, loading } = useZoneServices()

// 状态
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.service)
const showToken = ref(false)

// 表单数据
const formData = ref<CreateZoneServiceRequest & { service_id?: number }>({
  service_name: '',
  service_type: 'gnb_index',
  service_description: '',
  service_url: '',
  service_port: 9000,
  service_protocol: 'http',
  service_auth_required: false,
  service_auth_type: 'none',
  service_auth_token: ''
})

// 选项
const serviceTypeOptions = computed(() => 
  serviceTypes.value.map(type => ({
    label: type.label,
    value: type.key,
    icon: type.icon,
    description: type.description
  }))
)

const protocolOptions = [
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' }
]

const authTypeOptions = [
  { label: t('zoneServices.form.authTypes.none'), value: 'none' },
  { label: t('zoneServices.form.authTypes.bearer'), value: 'bearer' },
  { label: t('zoneServices.form.authTypes.basic'), value: 'basic' }
]

// 监听服务类型变化，自动设置默认端口和协议
const onServiceTypeChange = (serviceType: ServiceType) => {
  const typeConfig = serviceTypes.value.find(t => t.key === serviceType)
  if (typeConfig) {
    formData.value.service_port = typeConfig.defaultPort
    formData.value.service_protocol = typeConfig.defaultProtocol
  }
}

// 监听对话框打开，初始化表单
watch(() => props.modelValue, (show) => {
  if (show) {
    if (props.service) {
      // 编辑模式：填充现有数据
      formData.value = {
        service_id: props.service.service_id,
        service_name: props.service.service_name,
        service_type: props.service.service_type,
        service_description: props.service.service_description || '',
        service_url: props.service.service_url,
        service_port: props.service.service_port,
        service_protocol: props.service.service_protocol,
        service_auth_required: props.service.service_auth_required,
        service_auth_type: props.service.service_auth_type,
        service_auth_token: props.service.service_auth_token || ''
      }
    } else {
      // 新建模式：重置表单
      formData.value = {
        service_name: '',
        service_type: 'gnb_index',
        service_description: '',
        service_url: '',
        service_port: 9000,
        service_protocol: 'http',
        service_auth_required: false,
        service_auth_type: 'none',
        service_auth_token: ''
      }
    }
    showToken.value = false
  }
})

// 提交表单
const handleSubmit = async () => {
  if (isEdit.value && props.service) {
    // 编辑模式
    const updateData: UpdateZoneServiceRequest = {
      service_name: formData.value.service_name,
      service_url: formData.value.service_url,
      service_port: formData.value.service_port,
      service_protocol: formData.value.service_protocol,
      service_auth_required: formData.value.service_auth_required,
      service_auth_type: formData.value.service_auth_type
    }
    
    // 只有当字段有值时才添加到更新数据中
    if (formData.value.service_description) {
      updateData.service_description = formData.value.service_description
    }
    if (formData.value.service_auth_token) {
      updateData.service_auth_token = formData.value.service_auth_token
    }
    
    const success = await updateService(props.service.service_id, updateData)
    if (success) {
      emit('success')
      showDialog.value = false
    }
  } else {
    // 新建模式
    const success = await createService(formData.value)
    if (success) {
      emit('success')
      showDialog.value = false
    }
  }
}

// 取消
const handleCancel = () => {
  showDialog.value = false
}
</script>
