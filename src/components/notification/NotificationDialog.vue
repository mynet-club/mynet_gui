<template>
  <q-dialog v-model="show" position="right" maximized>
    <q-card style="width: 450px; max-width: 90vw">
      <!-- 头部 -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('common.notifications') }}</div>
        <q-space />
        
        <!-- 操作按钮 -->
        <q-btn
          flat
          dense
          round
          icon="filter_list"
          @click="toggleFilter"
        >
          <q-tooltip>{{ $t('notifications.filter') }}</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          icon="done_all"
          :disable="!hasUnread"
          @click="handleMarkAllAsRead"
        >
          <q-tooltip>{{ $t('notifications.markAllRead') }}</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          round
          icon="delete_sweep"
          @click="handleClearRead"
        >
          <q-tooltip>{{ $t('notifications.clearRead') }}</q-tooltip>
        </q-btn>
        
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- 过滤器 -->
      <q-slide-transition>
        <q-card-section v-if="showFilter" class="q-pt-none">
          <div class="row q-gutter-sm">
            <q-btn
              :outline="!showUnreadOnly"
              :flat="showUnreadOnly"
              color="primary"
              :label="$t('notifications.all')"
              @click="handleShowAll"
              size="sm"
            />
            <q-btn
              :outline="showUnreadOnly"
              :flat="!showUnreadOnly"
              color="primary"
              :label="$t('notifications.unreadOnly')"
              @click="handleShowUnreadOnly"
              size="sm"
            />
          </div>
        </q-card-section>
      </q-slide-transition>

      <!-- 通知列表 -->
      <q-card-section class="q-pt-none scroll-area" style="max-height: calc(100vh - 180px)">
        <!-- 加载中 -->
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="3em" />
        </div>

        <!-- 空状态 -->
        <div v-else-if="notifications.length === 0" class="text-center text-grey-6 q-py-xl">
          <q-icon name="notifications_none" size="4em" class="q-mb-md" />
          <div>{{ $t('notifications.empty') }}</div>
        </div>

        <!-- 通知项 -->
        <q-list v-else separator>
          <q-item
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'bg-blue-1': !notification.read }"
            class="notification-item"
          >
            <!-- 图标 -->
            <q-item-section avatar top>
              <q-avatar
                :icon="getNotificationIcon(notification.type)"
                :color="getNotificationColor(notification.type)"
                text-color="white"
              />
            </q-item-section>

            <!-- 内容 -->
            <q-item-section 
              @click="handleMarkAsRead(notification.id)"
              class="cursor-pointer"
              style="padding-right: 8px;"
            >
              <q-item-label class="text-weight-medium">
                {{ notification.title }}
              </q-item-label>
              <q-item-label caption lines="2">
                {{ notification.message }}
              </q-item-label>
              <q-item-label caption class="text-grey-6 q-mt-xs">
                {{ formatTime(notification.timestamp) }}
              </q-item-label>
            </q-item-section>

            <!-- 状态和操作 -->
            <q-item-section side top>
              <div class="row items-center q-gutter-sm">
                <q-badge
                  v-if="!notification.read"
                  color="primary"
                  rounded
                  style="width: 8px; height: 8px;"
                />
                <div v-else style="width: 8px;"></div>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="delete"
                  @click.stop="handleDelete(notification.id)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- 分页 -->
      <q-card-section v-if="lastPage > 1" class="q-pt-none">
        <q-pagination
          v-model="currentPage"
          :max="lastPage"
          :max-pages="5"
          direction-links
          boundary-links
          @update:model-value="handlePageChange"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotifications } from '../../composables/useNotifications'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const $q = useQuasar()
const { t } = useI18n()

// 使用通知状态管理
const {
  notifications,
  loading,
  currentPage,
  lastPage,
  hasUnread,
  loadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearRead,
  showUnreadOnly: filterUnreadOnly,
  showAll: filterShowAll,
  goToPage,
  getNotificationIcon,
  getNotificationColor
} = useNotifications()

// 本地状态
const show = ref(props.modelValue)
const showFilter = ref(false)
const showUnreadOnly = ref(false)

// 监听外部变化
watch(() => props.modelValue, (val) => {
  show.value = val
  if (val) {
    loadNotifications()
  }
})

// 监听内部变化
watch(show, (val) => {
  emit('update:modelValue', val)
})

// 方法
function toggleFilter() {
  showFilter.value = !showFilter.value
}

async function handleMarkAsRead(id: string) {
  try {
    await markAsRead(id)
    $q.notify({
      type: 'positive',
      message: t('notifications.markedAsRead'),
      timeout: 1000
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notifications.markAsReadFailed'),
      timeout: 2000
    })
  }
}

async function handleMarkAllAsRead() {
  try {
    await markAllAsRead()
    $q.notify({
      type: 'positive',
      message: t('notifications.allMarkedAsRead'),
      timeout: 2000
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notifications.markAllAsReadFailed'),
      timeout: 2000
    })
  }
}

async function handleDelete(id: string) {
  try {
    await deleteNotification(id)
    $q.notify({
      type: 'positive',
      message: t('notifications.deleted'),
      timeout: 1000
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notifications.deleteFailed'),
      timeout: 2000
    })
  }
}

async function handleClearRead() {
  $q.dialog({
    title: t('notifications.clearRead'),
    message: t('notifications.clearReadConfirm'),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await clearRead()
      $q.notify({
        type: 'positive',
        message: t('notifications.readCleared'),
        timeout: 2000
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('notifications.clearReadFailed'),
        timeout: 2000
      })
    }
  })
}

async function handleShowUnreadOnly() {
  showUnreadOnly.value = true
  await filterUnreadOnly()
}

async function handleShowAll() {
  showUnreadOnly.value = false
  await filterShowAll()
}

async function handlePageChange(page: number) {
  await goToPage(page)
}

function formatTime(timestamp: string): string {
  if (!timestamp) return 'N/A'
  return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped lang="scss">
.notification-item {
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  // 确保未读标记和删除按钮垂直对齐
  :deep(.q-item__section--side) {
    padding-top: 12px;
    
    .row {
      align-items: center;
    }
  }
}

.scroll-area {
  overflow-y: auto;
}
</style>
