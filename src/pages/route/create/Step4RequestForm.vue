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
            :disable="submitting || showSuccessDialog"
          />
        </div>
      </div>

      <!-- 步骤指示器 -->
      <RouteCreateProgress :step="4" :busy="submitting || showSuccessDialog" />

      <!-- 选择总结 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('routes.create.step4.selectionSummary') }}</div>
          
          <div class="row q-col-gutter-lg">
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
          
          <q-form ref="requestFormRef" @submit="submitRequest" class="q-gutter-md">
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
              :readonly="submitting || showSuccessDialog"
              lazy-rules
              :rules="[
                val => !!val?.trim() || $t('routes.create.step4.messageRequired'),
                val => (val?.trim().length ?? 0) >= 10 || $t('routes.create.step4.messageMinLength'),
                val => (val?.length ?? 0) <= 500 || $t('routes.create.step4.messageMaxLength')
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
            :disable="submitting || showSuccessDialog"
          />
          <q-btn
            color="primary"
            :label="$t('routes.create.step4.submitRequest')"
            @click="submitRequest"
            :loading="submitting"
            :disable="showSuccessDialog"
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
              :label="$t('workflow.viewPending')"
              @click="goToPending"
            />
            <q-btn flat :label="$t('routes.create.step4.viewRoutes')" @click="goToRoutes" />
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
import RouteCreateProgress from '../../../components/route/RouteCreateProgress.vue'
import { createRouteDraft } from '../../../utils/routeCreateDraft'

import { ref, reactive, onMounted, watch } from 'vue'
import debug from 'src/utils/debug'
import { useI18n } from 'vue-i18n'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useRoutes } from '../../../composables/useRoutes'
import { useNotify } from '../../../composables/useNotify'
import type { QForm } from 'quasar'
import type { Friend } from '../../../types'

const { t } = useI18n()
const router = useRouter()
const draft = createRouteDraft(sessionStorage)
const notify = useNotify()

const { createRouteRequest } = useRoutes()

// 页面状态
const submitting = ref(false)
const showSuccessDialog = ref(false)
const requestFormRef = ref<QForm | null>(null)
onBeforeRouteLeave(() => !submitting.value)
const selectedFriend = ref<Friend | null>(null)
const selectedFriendNode = ref<any | null>(null)
const selectedMyNode = ref<any | null>(null)

// 请求表单
const requestForm = reactive({
  message: ''
})

// 方法
const goBack = () => {
  router.push('/app/routes/create/prev_3')
}

const submitRequest = async () => {
  if (submitting.value || showSuccessDialog.value) return
  if (!selectedFriend.value || !selectedFriendNode.value || !selectedMyNode.value) {
    notify.error(t('routes.create.step4.incompleteSelection'))
    return
  }

  if (!await requestFormRef.value?.validate()) return
  if (submitting.value || showSuccessDialog.value) return

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
    draft.reset()
    
    showSuccessDialog.value = true
  } catch (error) {
    debug.error('提交路由请求失败:', error)
    notify.error(t('routes.create.step4.submitError'))
  } finally {
    submitting.value = false
  }
}

const goToPending = () => {
  showSuccessDialog.value = false
  router.push('/app/routes/pending')
}

const goToRoutes = () => {
  showSuccessDialog.value = false
  router.push('/app/routes')
}

const createAnother = () => {
  showSuccessDialog.value = false
  router.push('/app/routes/create/prev_1')
}

// Retain the edited message when going back or refreshing; clear after submission.
watch(() => requestForm.message, message => {
  if (!showSuccessDialog.value) draft.saveMessage(message)
}, { flush: 'sync' })

onMounted(() => {
  const saved = draft.read()
  if (saved.requiredStep < 4) { router.replace(`/app/routes/create/prev_${saved.requiredStep}`); return }
  selectedFriend.value = saved.friend as Friend
  selectedFriendNode.value = saved.friendNode
  selectedMyNode.value = saved.myNode
  requestForm.message = saved.message ?? t('routes.create.step4.defaultMessage', {
    friendName: selectedFriend.value.name,
    friendNode: selectedFriendNode.value.name,
    myNode: selectedMyNode.value.name
  })
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
