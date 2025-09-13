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
            :rules="[val => !!val || $t('zoneServices.form.serviceNameRequired')]"
            outlined
            dense
            :placeholder="$t('zoneServices.form.serviceName')"
          />

          <!-- 服务类型 -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('zoneServices.form.serviceType') }}</div>
            <div class="service-type-buttons">
              <q-btn
                v-for="option in serviceTypeOptions"
                :key="option.value"
                :label="option.label"
                :color="formData.service_type === option.value ? 'primary' : 'grey-5'"
                :text-color="formData.service_type === option.value ? 'white' : 'dark'"
                :unelevated="formData.service_type === option.value"
                :outline="formData.service_type !== option.value"
                size="sm"
                class="service-type-btn"
                @click="handleServiceTypeChange(option.value)"
              />
            </div>
          </div>

          <!-- 服务描述 -->
          <q-input
            v-model="formData.service_description"
            type="textarea"
            rows="2"
            outlined
            dense
            :placeholder="$t('zoneServices.form.serviceDescription')"
          />

          <!-- IP/URL -->
          <q-input
            v-model="formData.service_address"
            :rules="[val => !!val || $t('zoneServices.form.serviceAddressRequired')]"
            outlined
            dense
            :placeholder="`${$t('zoneServices.form.serviceAddress')} (192.168.1.100 or example.com)`"
          />

          <!-- 关联节点 -->
          <q-input
            v-model="formData.associated_node"
            outlined
            dense
            :placeholder="$t('zoneServices.form.associatedNode')"
          />

          <!-- 端口 -->
          <q-input
            v-model="formData.service_port"
            :rules="[val => !!val || $t('zoneServices.form.servicePortRequired'), val => val > 0 && val <= 65535 || $t('zoneServices.form.servicePortInvalid')]"
            outlined
            dense
            :placeholder="$t('zoneServices.form.servicePort')"
          />

          <!-- 协议 -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('zoneServices.form.serviceProtocol') }}</div>
            <div class="protocol-buttons">
              <q-btn
                v-for="option in protocolOptions"
                :key="option.value"
                :label="option.label"
                :color="formData.service_protocol === option.value ? 'primary' : 'grey-5'"
                :text-color="formData.service_protocol === option.value ? 'white' : 'dark'"
                :unelevated="formData.service_protocol === option.value"
                :outline="formData.service_protocol !== option.value"
                size="sm"
                class="protocol-btn"
                @click="handleProtocolChange(option.value)"
              />
            </div>
          </div>

          <!-- 分享设置 -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">分享设置</div>
            <div class="share-options q-gutter-sm">
              <q-checkbox
                v-model="formData.share_to_friends"
                label="分享给好友"
                color="primary"
              />
              <q-checkbox
                v-model="formData.share_to_public"
                label="申请公开分享"
                color="primary"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              选择服务的分享范围，公开分享需要管理员审核
            </div>
          </div>

          <!-- 认证设置 -->
          <div class="q-gutter-sm">
            <q-checkbox
              v-model="formData.service_auth_required"
              :label="$t('zoneServices.form.authRequired')"
            />

            <div v-if="formData.service_auth_required" class="q-pl-lg">
              <!-- Auth Type Selection -->
              <div v-if="formData.service_auth_required" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">{{ $t('zoneServices.form.authType') }}</div>
                <div class="auth-type-buttons">
                  <q-btn
                    v-for="option in authTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :color="formData.service_auth_type === option.value ? 'primary' : 'grey-5'"
                    :text-color="formData.service_auth_type === option.value ? 'white' : 'dark'"
                    :unelevated="formData.service_auth_type === option.value"
                    :outline="formData.service_auth_type !== option.value"
                    size="sm"
                    class="auth-type-btn"
                    @click="handleAuthTypeChange(option.value)"
                  />
                </div>
              </div>

              <!-- Bearer Token -->
              <q-input
                v-if="formData.service_auth_type === 'bearer'"
                v-model="formData.service_auth_token"
                :type="showToken ? 'text' : 'password'"
                outlined
                dense
                :placeholder="$t('zoneServices.form.authToken')"
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

              <!-- Basic Auth -->
              <div v-if="formData.service_auth_type === 'basic'" class="q-gutter-md">
                <q-input
                  v-model="formData.service_auth_username"
                  outlined
                  dense
                  :placeholder="$t('zoneServices.form.authUsername')"
                />
                <q-input
                  v-model="formData.service_auth_password"
                  :type="showPassword ? 'text' : 'password'"
                  outlined
                  dense
                  :placeholder="$t('zoneServices.form.authPassword')"
                >
                  <template v-slot:append>
                    <q-btn
                      :icon="showPassword ? 'visibility_off' : 'visibility'"
                      flat
                      round
                      dense
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>
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
const showPassword = ref(false)

// 表单数据
const formData = ref<CreateZoneServiceRequest & { 
  service_id?: number
  service_address?: string
  associated_node?: string
  service_auth_username?: string
  service_auth_password?: string
  share_to_friends?: boolean
  share_to_public?: boolean
}>({
  service_name: '',
  service_type: 'gnb_index',
  service_description: '',
  service_address: '',
  service_port: 9000,
  service_protocol: 'http',
  service_auth_required: false,
  service_auth_type: 'none',
  service_auth_token: '',
  associated_node: '',
  service_auth_username: '',
  service_auth_password: '',
  share_to_friends: false,
  share_to_public: false
})

// 选项
const serviceTypeOptions = computed(() => 
  serviceTypes.value.map(type => ({
    label: type.label,
    value: type.key
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

// 处理服务类型按钮点击
const handleServiceTypeChange = (serviceType: string) => {
  formData.value.service_type = serviceType as ServiceType
  onServiceTypeChange(serviceType as ServiceType)
}

// 处理协议按钮点击
const handleProtocolChange = (protocol: string) => {
  formData.value.service_protocol = protocol as any
}

// 处理认证类型按钮点击
const handleAuthTypeChange = (authType: string) => {
  formData.value.service_auth_type = authType as any
}

// 监听对话框打开，初始化表单
watch(() => props.modelValue, (show) => {
  if (show) {
    if (props.service) {
      // 编辑模式：填充现有数据
      const authConfig = (props.service as any).service_config?.auth
      formData.value = {
        service_id: parseInt(props.service.service_id as any) || 0,
        service_name: props.service.service_name,
        service_type: props.service.service_type,
        service_description: props.service.service_description || '',
        service_address: props.service.service_address,
        service_port: props.service.service_port,
        service_protocol: props.service.service_protocol,
        service_auth_required: authConfig?.required || false,
        service_auth_type: authConfig?.type || 'none',
        service_auth_token: authConfig?.token || '',
        associated_node: (props.service as any).associated_node || '',
        service_auth_username: authConfig?.username || '',
        service_auth_password: authConfig?.password || '',
        share_to_friends: (props.service as any).share_to_friends || false,
        share_to_public: (props.service as any).share_to_public || false
      }
    } else {
      // 新建模式：重置表单
      formData.value = {
        service_name: '',
        service_type: 'gnb_index',
        service_description: '',
        service_address: '',
        service_port: 9000,
        service_protocol: 'http',
        service_auth_required: false,
        service_auth_type: 'none',
        service_auth_token: '',
        associated_node: '',
        service_auth_username: '',
        service_auth_password: '',
        share_to_friends: false,
        share_to_public: false
      }
    }
    showToken.value = false
    showPassword.value = false
  }
})

// 提交表单
const handleSubmit = async () => {
  // 确保端口是数字类型
  const portNumber = parseInt(formData.value.service_port as any)
  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    return
  }
  
  const submitData = {
    ...formData.value,
    service_port: portNumber
  }

  if (isEdit.value && props.service) {
    // 编辑模式
    const updateData: UpdateZoneServiceRequest & {
      associated_node?: string
      service_auth_username?: string
      service_auth_password?: string
    } = {
      service_name: submitData.service_name,
      service_address: submitData.service_address,
      service_port: submitData.service_port,
      service_protocol: submitData.service_protocol,
      service_auth_required: submitData.service_auth_required,
      service_auth_type: submitData.service_auth_type
    }
    
    // 只有当字段有值时才添加到更新数据中
    if (submitData.service_description) {
      updateData.service_description = submitData.service_description
    }
    if (submitData.service_auth_token) {
      updateData.service_auth_token = submitData.service_auth_token
    }
    if (submitData.associated_node) {
      updateData.associated_node = submitData.associated_node
    }
    if (submitData.service_auth_username) {
      updateData.service_auth_username = submitData.service_auth_username
    }
    if (submitData.service_auth_password) {
      updateData.service_auth_password = submitData.service_auth_password
    }
    
    const success = await updateService(parseInt(props.service.service_id), updateData)
    if (success) {
      emit('success')
      showDialog.value = false
    }
  } else {
    // 新建模式
    const createData = {
      ...submitData,
      ...(submitData.associated_node && { associated_node: submitData.associated_node }),
      ...(submitData.service_auth_username && { service_auth_username: submitData.service_auth_username }),
      ...(submitData.service_auth_password && { service_auth_password: submitData.service_auth_password })
    }
    
    const success = await createService(createData)
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

<style scoped lang="scss">
.service-type-buttons,
.protocol-buttons,
.auth-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .q-btn {
    min-width: 80px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
}

.service-type-btn,
.protocol-btn,
.auth-type-btn {
  flex: 0 0 auto;
}

// 响应式设计
@media (max-width: 600px) {
  .service-type-buttons,
  .protocol-buttons,
  .auth-type-buttons {
    .q-btn {
      flex: 1 1 calc(50% - 4px);
      min-width: 0;
    }
  }
}
</style>
