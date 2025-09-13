<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-h4 q-mb-md">
          <q-icon name="add_circle" class="q-mr-sm" />
          创建节点
        </div>

        <!-- 创建表单 -->
        <q-card>
          <q-card-section>
            <!-- IP池信息提示 -->
            <q-banner
              v-if="showIpPoolInfo"
              class="bg-blue-1 text-blue-8 q-mb-lg"
              rounded
              dense
            >
              <template v-slot:avatar>
                <q-icon name="info" color="blue" />
              </template>
              <div class="text-body2">
                <div v-if="ipPoolId">IP池ID: <strong>{{ ipPoolId }}</strong></div>
                <div v-if="ipGroupSequenceNumber">IP组序号: <strong>{{ ipGroupSequenceNumber }}</strong></div>
                <div class="text-caption q-mt-xs">节点将自动关联到指定的IP池</div>
              </div>
            </q-banner>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- 基础信息 -->
              <div class="text-h6 q-mb-md">基础信息</div>
              
              <q-input
                v-model="form.node_name"
                label="节点名称"
                required
                :rules="[
                  val => !!val || '节点名称不能为空',
                  val => (val.length >= 3 && val.length <= 255) || '节点名称长度必须在3-255字符之间'
                ]"
                outlined
                maxlength="255"
              />

              <q-input
                v-model="form.description"
                label="节点描述"
                type="textarea"
                rows="3"
                outlined
                maxlength="1000"
                :rules="[
                  val => !val || val.length <= 1000 || '描述长度不能超过1000字符'
                ]"
              />

              <!-- VPN类型选择 -->
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">VPN类型</div>
                <div class="row q-gutter-md">
                  <q-btn
                    :class="form.vpn_type === 'gnb' ? 'vpn-btn-selected' : 'vpn-btn-unselected'"
                    @click="onVpnTypeChange('gnb')"
                    no-caps
                    rounded
                    unelevated
                  >
                    GNB
                  </q-btn>
                  <q-btn
                    :class="form.vpn_type === 'wireguard' ? 'vpn-btn-selected' : 'vpn-btn-unselected'"
                    @click="onVpnTypeChange('wireguard')"
                    no-caps
                    rounded
                    unelevated
                  >
                    WireGuard
                  </q-btn>
                  <q-btn
                    :class="form.vpn_type === 'openvpn' ? 'vpn-btn-selected' : 'vpn-btn-unselected'"
                    @click="onVpnTypeChange('openvpn')"
                    no-caps
                    rounded
                    unelevated
                  >
                    OpenVPN
                  </q-btn>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="row q-gutter-sm q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  :loading="isCreating"
                  :disable="!isFormValid"
                >
                  <q-icon name="add" class="q-mr-sm" />
                  创建节点
                </q-btn>
                
                <q-btn
                  color="grey-7"
                  outline
                  @click="onCancel"
                  :disable="isCreating"
                >
                  取消
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNodes, useNotify } from '../../composables'
import { CreateNodeRequest, VpnType } from '../../types/node'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { createNode } = useNodes()
const { success: notifySuccess, error: notifyError } = useNotify()

// 表单数据接口
interface CreateNodeForm {
  node_name: string
  description: string
  vpn_type: VpnType
  ip_pool_id?: string
  ip_group_sequence_number?: string
}

const form = ref<CreateNodeForm>({
  node_name: '',
  description: '',
  vpn_type: 'gnb'
})

// 从URL参数获取IP池相关信息
const ipPoolId = computed(() => route.query.ip_pool_id as string)
const ipGroupSequenceNumber = computed(() => route.query.ip_group_sequence_number as string)

// 是否显示IP池提示
const showIpPoolInfo = computed(() => {
  return !!(ipPoolId.value || ipGroupSequenceNumber.value)
})

// VPN类型改变时的处理
const onVpnTypeChange = (value: VpnType) => {
  form.value.vpn_type = value
}

// 状态
const isCreating = ref(false)

// 计算属性
const isFormValid = computed(() => {
  return form.value.node_name && 
         form.value.node_name.length >= 3 && 
         form.value.node_name.length <= 255 &&
         form.value.vpn_type &&
         (!form.value.description || form.value.description.length <= 1000)
})

// 提交表单
const onSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isCreating.value = true
    
    const nodeData: CreateNodeRequest = {
      node_name: form.value.node_name,
      vpn_type: form.value.vpn_type,
      ...(form.value.description && { description: form.value.description }),
      ...(ipPoolId.value && { ip_pool_id: ipPoolId.value }),
      ...(ipGroupSequenceNumber.value && { ip_group_sequence_number: ipGroupSequenceNumber.value })
    }

    const newNode = await createNode(nodeData)
    
    if (newNode) {
      console.log('创建的节点数据:', newNode)
      notifySuccess('节点创建成功')
      // 跳转到节点详情页 - 使用node_id或id字段
      const nodeId = newNode.node_id || newNode.id
      console.log('节点ID:', nodeId, '(node_id:', newNode.node_id, ', id:', newNode.id, ')')
      if (nodeId) {
        router.push(`/nodes/${nodeId}`)
      } else {
        console.warn('节点创建成功但无法获取节点ID，跳转到节点列表')
        router.push('/nodes')
      }
    }
    
  } catch (error) {
    console.error('创建节点失败:', error)
    notifyError('创建节点失败，请重试')
  } finally {
    isCreating.value = false
  }
}

// 取消操作
const onCancel = () => {
  router.push('/nodes')
}

// 组件挂载时加载数据
onMounted(async () => {
  // 可以在这里加载区域列表等数据
})
</script>

<style scoped>
.q-page {
  min-height: calc(100vh - 150px);
}

.vpn-btn-selected {
  background-color: #1976d2 !important;
  color: white !important;
}

.vpn-btn-unselected {
  background-color: rgba(25, 118, 210, 0.3) !important;
  color: #1976d2 !important;
}
</style>
