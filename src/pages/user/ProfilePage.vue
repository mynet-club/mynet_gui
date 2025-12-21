<template>
  <div class="profile-page q-pa-md">
    <div class="row q-gutter-md">
      <!-- 侧边栏用户信息 -->
      <div class="col-12 col-md-4">
        <q-card class="user-card">
          <q-card-section class="text-center">
            <UserAvatar
              ref="userAvatarRef"
              :user-id="user?.user_id || user?.id"
              size="80px"
              editable
              :uploading="loading.avatar"
              @edit="changeAvatar"
              class="q-mb-md"
            />
            <div class="text-h6 q-mb-xs">{{ user?.name || $t('common.unknown') }}</div>
            <div class="text-caption text-grey-7">{{ user?.email || '' }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 主要内容区域 -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
          >
            <q-tab name="overview" icon="dashboard" :label="$t('user.overview')" />
            <q-tab name="edit" icon="edit" :label="$t('user.editProfile')" />
            <q-tab name="security" icon="security" :label="$t('user.security')" />
            <q-tab name="preferences" icon="settings" :label="$t('user.preferences')" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- 概览标签页 -->
            <q-tab-panel name="overview">
              <div class="text-h6 q-mb-md">{{ $t('user.basicInfo') }}</div>
              <q-list separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('user.userId') }}</q-item-label>
                    <q-item-label>{{ user?.user_id || user?.id || 'N/A' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      icon="content_copy"
                      flat
                      round
                      size="sm"
                      @click="copyUserId"
                    >
                      <q-tooltip>{{ $t('common.copy') }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('user.name') }}</q-item-label>
                    <q-item-label>{{ user?.name || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('user.email') }}</q-item-label>
                    <q-item-label>{{ user?.email || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="user?.phone">
                  <q-item-section>
                    <q-item-label caption>{{ $t('user.phone') }}</q-item-label>
                    <q-item-label>{{ user.phone }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="user?.signature">
                  <q-item-section>
                    <q-item-label caption>{{ $t('user.signature') }}</q-item-label>
                    <q-item-label>{{ user.signature }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <!-- 编辑资料标签页 -->
            <q-tab-panel name="edit">
              <div class="text-h6 q-mb-md">{{ $t('user.editProfile') }}</div>
              <q-form class="q-gutter-md">
                <q-input
                  v-model="profileForm.name"
                  :placeholder="$t('user.name')"
                  outlined
                  dense
                />
                <q-input
                  v-model="profileForm.phone"
                  :placeholder="$t('user.phone')"
                  outlined
                  dense
                />
                <q-input
                  v-model="profileForm.signature"
                  :placeholder="$t('user.signature')"
                  type="textarea"
                  outlined
                  dense
                  rows="3"
                  :hint="$t('user.signatureHint')"
                />
                <div class="row q-gutter-sm justify-start">
                  <q-btn 
                    :label="$t('user.saveChanges')" 
                    color="primary" 
                    @click="updateUserProfile"
                    :loading="loading.profile"
                  />
                  <q-btn 
                    :label="$t('user.cancel')" 
                    color="grey-7" 
                    flat 
                    @click="resetForm"
                    :disable="loading.profile"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <!-- 安全设置标签页 -->
            <q-tab-panel name="security">
              <div class="text-h6 q-mb-md">{{ $t('user.security') }}</div>
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ $t('user.passwordSecurity') }}</q-item-label>
                    <q-item-label caption>{{ $t('user.changePasswordDesc') }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn 
                      :label="$t('user.change')" 
                      color="primary" 
                      flat 
                      @click="changePassword"
                      :loading="loading.password"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <!-- 偏好设置标签页 -->
            <q-tab-panel name="preferences">
              <div class="text-h6 q-mb-md">{{ $t('user.preferences') }}</div>
              
              <!-- 主题设置 -->
              <div class="q-mb-lg">
                <div class="text-subtitle2 q-mb-sm">{{ $t('user.theme') }}</div>
                <q-btn-toggle
                  v-model="preferences.theme"
                  :options="themeOptions.map(option => ({
                    label: $t(`settings.themes.${option.value}`),
                    value: option.value,
                    icon: option.icon
                  }))"
                  color="primary"
                  toggle-color="primary"
                  outline
                  @update:model-value="onThemeChange"
                />
              </div>

              <!-- 语言设置 -->
              <div class="q-mb-lg">
                <div class="text-subtitle2 q-mb-sm">{{ $t('user.language') }}</div>
                <q-btn-toggle
                  v-model="preferences.language"
                  :options="supportedLanguages.map(lang => ({
                    label: lang.nativeName,
                    value: lang.value,
                    icon: lang.icon
                  }))"
                  color="primary"
                  toggle-color="primary"
                  outline
                  @update:model-value="onLanguageChange"
                />
              </div>

              <div class="row q-gutter-sm justify-start">
                <q-btn 
                  :label="$t('user.saveChanges')" 
                  color="primary" 
                  @click="savePreferences"
                  :loading="loading.preferences"
                />
                <q-btn 
                  :label="$t('user.resetToDefault')" 
                  color="grey-6" 
                  outline
                  @click="resetPreferences"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- 密码修改对话框 -->
    <q-dialog v-model="showPasswordDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('user.changePassword') }}</div>
          <div class="text-caption text-grey-7">{{ $t('user.changePasswordDesc') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitPasswordChange" class="q-gutter-md">
            <q-input
              v-model="passwordForm.currentPassword"
              :label="$t('user.currentPassword')"
              type="password"
              outlined
              dense
              :rules="[val => !!val || $t('user.currentPasswordRequired')]"
            />
            <q-input
              v-model="passwordForm.newPassword"
              :label="$t('user.newPassword')"
              type="password"
              outlined
              dense
              :rules="[
                val => !!val || $t('user.newPasswordRequired'),
                val => val.length >= 8 || $t('user.passwordMinLength')
              ]"
            />
            <q-input
              v-model="passwordForm.confirmPassword"
              :label="$t('user.confirmPassword')"
              type="password"
              outlined
              dense
              :rules="[
                val => !!val || $t('user.confirmPasswordRequired'),
                val => val === passwordForm.newPassword || $t('user.passwordMismatch')
              ]"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            :label="$t('common.cancel')" 
            color="grey-7" 
            @click="closePasswordDialog"
            :disable="loading.password"
          />
          <q-btn 
            :label="$t('user.change')" 
            color="primary" 
            @click="submitPasswordChange"
            :loading="loading.password"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import debug from "src/utils/debug"
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth'
import { useTheme } from '../../composables/useTheme'
import { useProfile } from '../../composables/useProfile'
import { usePasswordManagement } from '../../composables/usePasswordManagement'
import { useAvatarManagement } from '../../composables/useAvatarManagement'
import { usePreferencesManagement } from '../../composables/usePreferencesManagement'
import UserAvatar from '../../components/avatar/UserAvatar.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// 主题管理
const { themeMode, setThemeMode, getThemeOptions } = useTheme()

// 活动标签页
const activeTab = ref('overview')

// 监听路由参数变化，设置活动标签页
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    activeTab.value = newTab
  }
}, { immediate: true })

// 用户资料管理
const { 
  form: profileForm,
  loading: profileLoading,
  initializeForm,
  updateProfile: updateUserProfile
} = useProfile()

// 密码管理
const {
  passwordForm,
  loading: passwordLoading,
  showPasswordDialog,
  resetPasswordForm,
  validatePasswordForm,
  changePassword: submitPasswordChange
} = usePasswordManagement()

// 头像管理
const { 
  loading: avatarLoading,
  changeAvatar: selectAvatarFile
} = useAvatarManagement()

// 偏好设置管理
const {
  preferences,
  loading: preferencesLoading,
  options: preferencesOptions,
  savePreferences,
  resetPreferences,
  updateLanguage,
  updateTheme: updatePreferenceTheme
} = usePreferencesManagement()

// 头像组件引用
const userAvatarRef = ref<InstanceType<typeof UserAvatar> | null>(null)

// 统一的加载状态
const loading = computed(() => ({
  profile: profileLoading.value.profile,
  password: passwordLoading.value.password,
  avatar: avatarLoading.value.avatar,
  preferences: preferencesLoading.value.preferences || preferencesLoading.value.saving
}))

// 支持的语言选项
const supportedLanguages = computed(() => [
  { label: 'Chinese', value: 'zh-CN', icon: 'translate', nativeName: 'Chinese' },
  { label: 'English', value: 'en-US', icon: 'translate', nativeName: 'English' }
])

// 主题选项
const themeOptions = computed(() => getThemeOptions())

// 切换语言
const changeLanguage = (newLanguage: string) => {
  locale.value = newLanguage
  updateLanguage(newLanguage)
}

// 切换主题
const changeTheme = (newTheme: string) => {
  setThemeMode(newTheme as any)
  updatePreferenceTheme(newTheme)
}

// 密码修改对话框
const changePassword = () => {
  resetPasswordForm()
  showPasswordDialog.value = true
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  resetPasswordForm()
}

// 头像修改
const changeAvatar = () => {
  selectAvatarFile()
}

// 重置表单
const resetForm = () => {
  initializeForm()
}

// 复制用户ID到剪贴板
const copyUserId = async () => {
  const userId = user.value?.user_id || user.value?.id
  if (!userId) return
  
  try {
    await navigator.clipboard.writeText(String(userId))
    // 使用 Quasar 的 notify 插件
    const $q = useQuasar()
    $q.notify({
      type: 'positive',
      message: t('common.copiedToClipboard')
    })
  } catch (error) {
    debug.error('复制失败:', error)
    const $q = useQuasar()
    $q.notify({
      type: 'negative',
      message: t('common.copyFailed')
    })
  }
}

// 主题变化处理
const onThemeChange = (value: any) => {
  debug.log('主题切换到:', value)
  changeTheme(value)
}

// 语言变化处理
const onLanguageChange = (value: string) => {
  debug.log('语言切换到:', value)
  changeLanguage(value)
}

// 初始化数据
onMounted(() => {
  debug.log('🔧 [Avatar] Profile page mounted, user avatar:', user.value?.avatar)
  debug.log('🔧 [User] Complete user object:', JSON.stringify(user.value, null, 2))
  debug.log('🔧 [User] User ID (id):', user.value?.id)
  debug.log('🔧 [User] User ID (user_id):', user.value?.user_id)
  debug.log('🔧 [User] All user properties:', Object.keys(user.value || {}))
  
  // 初始化表单数据
  initializeForm()
  
  // 调试表单数据
  debug.log('🔧 [Profile] Form after initialization:', {
    name: profileForm.name,
    phone: profileForm.phone,
    signature: profileForm.signature
  })
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.user-card {
  position: sticky;
  top: 20px;
}

.q-tab-panel {
  padding: 24px 16px;
}
</style>
