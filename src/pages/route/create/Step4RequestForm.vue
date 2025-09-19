<template>
  <q-page class="route-create-step4-page">
    <div class="q-pa-md">
      <!-- 页面标题和导航 -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none">{{ $t('routes.create.step4.title') }}</h4>
          <p class="text-grey-6 q-mt-xs q-mb-none">
            {{ $t('routes.create.step4.subtitle') }}
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="arrow_back"
            :label="$t('common.back')"
            @click="goBack"
          />
        </div>
      </div>

      <!-- 步骤指示器 -->
      <q-stepper
        v-model="currentStep"
        ref="stepper"
        color="primary"
        animated
        flat
        class="q-mb-lg"
      >
        <q-step
          :name="1"
          :title="$t('routes.create.steps.selectFriend')"
          icon="people"
          :done="currentStep > 1"
          active-icon="people"
        />
        <q-step
          :name="2"
          :title="$t('routes.create.steps.selectFriendNode')"
          icon="device_hub"
          :done="currentStep > 2"
          active-icon="device_hub"
        />
        <q-step
          :name="3"
          :title="$t('routes.create.steps.selectMyNode')"
          icon="router"
          :done="currentStep > 3"
          active-icon="router"
        />
        <q-step
          :name="4"
          :title="$t('routes.create.steps.submitRequest')"
          icon="send"
          active-icon="send"
        />
      </q-stepper>

      <!-- 选择总结 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step4.selectionSummary') }}</div>
          
          <div class="row q-gutter-lg">
            <!-- 好友信息 -->
            <div class="col-12 col-md-4">
              <q-item class="q-pa-none">
                <q-item-section avatar>
                  <q-avatar color="primary" size="lg">
                    <q-icon name="person" color="white" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6">{{ selectedFriend?.name }}</q-item-label>
                  <q-item-label caption class="text-body2">{{ $t('routes.create.step4.targetFriend') }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <!-- 好友节点信息 -->
            <div class="col-12 col-md-4">
              <q-item class="q-pa-none">
                <q-item-section avatar>
                  <q-avatar color="positive" size="lg">
                    <q-icon name="device_hub" color="white" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6">{{ selectedFriendNode?.name }}</q-item-label>
                  <q-item-label caption class="text-body2">{{ $t('routes.create.step4.targetNode') }}</q-item-label>
                  <q-item-label caption>{{ selectedFriendNode?.location }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <!-- 我的节点信息 -->
            <div class="col-12 col-md-4">
              <q-item class="q-pa-none">
                <q-item-section avatar>
                  <q-avatar color="secondary" size="lg">
                    <q-icon name="router" color="white" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6">{{ selectedMyNode?.name }}</q-item-label>
                  <q-item-label caption class="text-body2">{{ $t('routes.create.step4.sourceNode') }}</q-item-label>
                  <q-item-label caption>{{ selectedMyNode?.location }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 申请表单 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step4.requestForm') }}</div>
          
          <q-form @submit="submitRequest" class="q-gutter-md">
            <!-- 请求消息 -->
            <q-input
              v-model="requestForm.message"
              :label="$t('routes.create.step4.requestMessage')"
              :placeholder="$t('routes.create.step4.messagePlaceholder')"
              type="textarea"
              rows="4"
              outlined
              maxlength="500"
              counter
              :rules="[
                val => !!val || $t('routes.create.step4.messageRequired'),
                val => val.length >= 10 || $t('routes.create.step4.messageMinLength'),
                val => val.length <= 500 || $t('routes.create.step4.messageMaxLength')
              ]"
            >
              <template v-slot:hint>
                {{ $t('routes.create.step4.messageHint') }}
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            :label="$t('common.previous')"
            @click="goBack"
            :disable="submitting"
          />
          <q-btn
            color="primary"
            :label="$t('routes.create.step4.submitRequest')"
            @click="submitRequest"
            :loading="submitting"
            icon-right="send"
          />
        </q-card-actions>
      </q-card>

      <!-- 提交成功对话框 -->
      <q-dialog v-model="showSuccessDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="text-center">
            <q-icon name="check_circle" color="positive" size="4em" class="q-mb-md" />
            <div class="text-h6 q-mb-sm">{{ $t('routes.create.step4.requestSubmitted') }}</div>
            <div class="text-body2 text-grey-6">
              {{ $t('routes.create.step4.requestSubmittedMessage') }}
            </div>
          </q-card-section>
          
          <q-card-actions align="center">
            <q-btn
              color="primary"
              :label="$t('routes.create.step4.viewRoutes')"
              @click="goToRoutes"
            />
            <q-btn
              flat
              :label="$t('routes.create.step4.createAnother')"
              @click="createAnother"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoutes } from '../../../composables/useRoutes'
import { useNotify } from '../../../composables/useNotify'
import type { Friend } from '../../../types'

const { t } = useI18n()
const router = useRouter()
const notify = useNotify()

const { createRouteRequest } = useRoutes()

// 页面状态
const currentStep = ref(4)
const submitting = ref(false)
const showSuccessDialog = ref(false)
const selectedFriend = ref<Friend | null>(null)
const selectedFriendNode = ref<any | null>(null)
const selectedMyNode = ref<any | null>(null)

// 请求表单
const requestForm = reactive({
  message: ''
})

// 方法
const goBack = () => {
  router.push('/routes/create/prev_3')
}

const submitRequest = async () => {
  if (!selectedFriend.value || !selectedFriendNode.value || !selectedMyNode.value) {
    notify.error(t('routes.create.step4.incompleteSelection'))
    return
  }

  if (!requestForm.message || requestForm.message.length < 10) {
    notify.error(t('routes.create.step4.messageRequired'))
    return
  }

  try {
    submitting.value = true
    
    const requestData = {
      target_user_id: selectedFriend.value.id,
      target_node_id: selectedFriendNode.value.id,
      source_node_id: selectedMyNode.value.id,
      message: requestForm.message
    }

    await createRouteRequest(requestData)
    
    // 清除会话存储
    sessionStorage.removeItem('route-create-friend')
    sessionStorage.removeItem('route-create-friend-node')
    sessionStorage.removeItem('route-create-my-node')
    
    showSuccessDialog.value = true
  } catch (error) {
    debug.error('提交路由请求失败:', error)
    notify.error(t('routes.create.step4.submitError'))
  } finally {
    submitting.value = false
  }
}

const goToRoutes = () => {
  showSuccessDialog.value = false
  router.push('/routes')
}

const createAnother = () => {
  showSuccessDialog.value = false
  router.push('/routes/create/prev_1')
}

// 初始化
onMounted(() => {
  // 检查是否有完整的选择数据
  const savedFriend = sessionStorage.getItem('route-create-friend')
  const savedFriendNode = sessionStorage.getItem('route-create-friend-node')
  const savedMyNode = sessionStorage.getItem('route-create-my-node')
  
  if (!savedFriend || !savedFriendNode || !savedMyNode) {
    notify.error(t('routes.create.step4.incompleteSelection'))
    router.push('/routes/create/prev_1')
    return
  }
  
  try {
    selectedFriend.value = JSON.parse(savedFriend)
    selectedFriendNode.value = JSON.parse(savedFriendNode)
    selectedMyNode.value = JSON.parse(savedMyNode)
  } catch (error) {
    debug.error('解析已保存的数据失败:', error)
    router.push('/routes/create/prev_1')
    return
  }

  // 生成默认请求消息
  if (selectedFriend.value && selectedFriendNode.value && selectedMyNode.value) {
    requestForm.message = t('routes.create.step4.defaultMessage', {
      friendName: selectedFriend.value.name,
      friendNode: selectedFriendNode.value.name,
      myNode: selectedMyNode.value.name
    })
  }
})
</script>

<style lang="scss" scoped>
.route-create-step4-page {
  .selection-summary {
    .q-item {
      border-radius: 8px;
      background: rgba(var(--q-primary), 0.05);
      margin-bottom: 1rem;
    }
  }
}
</style>
