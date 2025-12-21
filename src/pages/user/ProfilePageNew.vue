<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="profile-header q-pa-lg">
      <div class="container">
        <div class="row items-center q-col-gutter-lg">
          <div class="col-auto">
            <q-avatar size="120px" class="profile-avatar">
              <img :src="user?.avatar || defaultAvatar" @error="onAvatarError" />
              <q-btn
                round
                color="primary"
                icon="camera_alt"
                size="sm"
                class="avatar-edit-btn"
                @click="showAvatarDialog = true"
              >
                <q-tooltip>{{ $t('user.changeAvatar') }}</q-tooltip>
              </q-btn>
            </q-avatar>
          </div>
          <div class="col">
            <h1 class="text-h4 text-weight-bold q-ma-none">{{ user?.name || 'Unknown User' }}</h1>
            <p class="text-h6 text-grey-6 q-ma-none q-mt-sm">{{ user?.email }}</p>
            <div class="q-mt-md">
              <q-chip 
                :label="user?.user_id || 'N/A'"
                color="primary"
                outline
                icon="person"
                class="q-mr-sm"
              />
              <q-chip 
                :label="currentZone?.name || 'No Zone'"
                color="secondary"
                outline
                icon="location_on"
                class="q-mr-sm"
              />
              <q-chip 
                :label="user?.user_role || 'User'"
                color="accent"
                outline
                icon="admin_panel_settings"
              />
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="edit"
              :label="$t('user.editProfile')"
              @click="activeTab = 'edit'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 导航标签页 -->
    <div class="profile-content">
      <div class="container">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="overview" icon="dashboard" :label="$t('user.overview')" />
          <q-tab name="edit" icon="edit" :label="$t('user.editProfile')" />
          <q-tab name="security" icon="security" :label="$t('user.security')" />
          <q-tab name="preferences" icon="settings" :label="$t('user.preferences')" />
          <q-tab name="activity" icon="history" :label="$t('user.activity')" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="q-mt-lg">
          <!-- 概览标签页 -->
          <q-tab-panel name="overview">
            <div class="row q-col-gutter-lg">
              <!-- 基本信息 -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="full-height">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="person" class="q-mr-sm" />
                      {{ $t('user.basicInfo') }}
                    </div>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('user.userId') }}</q-item-label>
                          <q-item-label class="text-weight-medium">{{ user?.user_id || 'N/A' }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            dense
                            icon="content_copy"
                            @click="copyToClipboard(user?.user_id)"
                          >
                            <q-tooltip>{{ $t('common.copy') }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('user.name') }}</q-item-label>
                          <q-item-label class="text-weight-medium">{{ user?.name || 'N/A' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('user.email') }}</q-item-label>
                          <q-item-label class="text-weight-medium">{{ user?.email || 'N/A' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('user.role') }}</q-item-label>
                          <q-item-label class="text-weight-medium">
                            <q-chip 
                              :label="user?.user_role || 'User'"
                              :color="getRoleColor(user?.user_role)"
                              text-color="white"
                              size="sm"
                            />
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>{{ $t('user.joinDate') }}</q-item-label>
                          <q-item-label class="text-weight-medium">{{ formatDate(user?.created_at) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- 统计信息 -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="full-height">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="analytics" class="q-mr-sm" />
                      {{ $t('user.statistics') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <div class="stat-card">
                          <div class="stat-number">{{ userStats.nodes || 0 }}</div>
                          <div class="stat-label">{{ $t('user.totalNodes') }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="stat-card">
                          <div class="stat-number">{{ userStats.routes || 0 }}</div>
                          <div class="stat-label">{{ $t('user.totalRoutes') }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="stat-card">
                          <div class="stat-number">{{ userStats.friends || 0 }}</div>
                          <div class="stat-label">{{ $t('user.totalFriends') }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="stat-card">
                          <div class="stat-number">{{ userStats.loginCount || 0 }}</div>
                          <div class="stat-label">{{ $t('user.totalLogins') }}</div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- 权限信息 -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="admin_panel_settings" class="q-mr-sm" />
                      {{ $t('user.permissions') }}
                    </div>
                    <div class="row">
                      <div class="col-12" v-if="user?.permissions && user.permissions.length > 0">
                        <q-chip 
                          v-for="permission in user.permissions" 
                          :key="permission"
                          :label="permission"
                          color="primary"
                          outline
                          class="q-mr-sm q-mb-sm"
                        />
                      </div>
                      <div class="col-12" v-else>
                        <div class="text-grey-6">{{ $t('user.noPermissions') }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- 编辑资料标签页 -->
          <q-tab-panel name="edit">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="edit" class="q-mr-sm" />
                  {{ $t('user.editProfile') }}
                </div>
                <q-form @submit="onSubmit" class="q-gutter-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input 
                        v-model="form.name"
                        :placeholder="$t('user.name')"
                        outlined
                        :rules="[val => !!val || $t('user.nameRequired')]"
                        :disable="isLoading"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input 
                        v-model="form.email"
                        :placeholder="$t('user.email')"
                        type="email"
                        outlined
                        :rules="[
                          val => !!val || $t('user.emailRequired'),
                          val => validateEmail(val) || $t('user.emailInvalid')
                        ]"
                        :disable="isLoading"
                      />
                    </div>
                  </div>
                  
                  <q-input 
                    v-model="form.phone"
                    :placeholder="$t('user.phone')"
                    outlined
                    :disable="isLoading"
                  />
  
  <q-input 
    v-model="form.bio"
    :placeholder="$t('user.bio')"
    type="textarea"
    rows="3"
    outlined
    :disable="isLoading"
    maxlength="500"
    :hint="$t('user.bioHint')"
  />
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-btn
                        type="submit"
                        color="primary"
                        :label="$t('user.saveChanges')"
                        :loading="isLoading"
                        icon="save"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-btn
                        :label="$t('user.cancel')"
                        outline
                        @click="resetForm"
                        :disable="isLoading"
                        icon="refresh"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- 安全设置标签页 -->
          <q-tab-panel name="security">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="lock" class="q-mr-sm" />
                      {{ $t('user.passwordSecurity') }}
                    </div>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.changePassword') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.changePasswordDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn 
                            :label="$t('user.change')"
                            color="primary"
                            outline
                            @click="showChangePasswordDialog = true"
                            icon="key"
                          />
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.lastPasswordChange') }}</q-item-label>
                          <q-item-label caption>{{ formatDate(user?.updated_at) || $t('user.never') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="verified_user" class="q-mr-sm" />
                      {{ $t('user.twoFactorAuth') }}
                    </div>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.enable2FA') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.twoFactorAuthDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle 
                            v-model="twoFactorEnabled" 
                            @update:model-value="toggle2FA"
                            :disable="isLoading"
                          />
                        </q-item-section>
                      </q-item>
                      
                      <q-item v-if="twoFactorEnabled">
                        <q-item-section>
                          <q-item-label>{{ $t('user.backupCodes') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.backupCodesDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn 
                            :label="$t('user.generateCodes')"
                            color="secondary"
                            outline
                            size="sm"
                            icon="backup"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- 登录会话 -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="devices" class="q-mr-sm" />
                      {{ $t('user.activeSessions') }}
                    </div>
                    <q-list>
                      <q-item v-for="session in activeSessions" :key="session.id">
                        <q-item-section avatar>
                          <q-icon :name="getDeviceIcon(session.device_type)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ session.device_name }}</q-item-label>
                          <q-item-label caption>
                            {{ session.ip_address }} • {{ formatDate(session.last_activity) }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-chip 
                            :label="session.is_current ? $t('user.currentSession') : $t('user.activeSession')"
                            :color="session.is_current ? 'positive' : 'grey'"
                            size="sm"
                          />
                          <q-btn
                            v-if="!session.is_current"
                            flat
                            round
                            dense
                            icon="logout"
                            @click="revokeSession(session.id)"
                            class="q-ml-sm"
                          >
                            <q-tooltip>{{ $t('user.revokeSession') }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- 偏好设置标签页 -->
          <q-tab-panel name="preferences">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="palette" class="q-mr-sm" />
                      {{ $t('user.appearance') }}
                    </div>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.theme') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.themeDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-select
                            v-model="preferences.theme"
                            :options="themeOptions"
                            emit-value
                            map-options
                            outlined
                            dense
                            style="min-width: 120px"
                          />
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.language') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.languageDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-select
                            v-model="preferences.language"
                            :options="languageOptions"
                            emit-value
                            map-options
                            outlined
                            dense
                            style="min-width: 120px"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="notifications" class="q-mr-sm" />
                      {{ $t('user.notifications') }}
                    </div>
                    <q-list>
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.emailNotifications') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.emailNotificationsDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="preferences.emailNotifications" />
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.pushNotifications') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.pushNotificationsDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="preferences.pushNotifications" />
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{ $t('user.systemAlerts') }}</q-item-label>
                          <q-item-label caption>{{ $t('user.systemAlertsDesc') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="preferences.systemAlerts" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- 活动记录标签页 -->
          <q-tab-panel name="activity">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="history" class="q-mr-sm" />
                  {{ $t('user.recentActivity') }}
                </div>
                <q-timeline color="secondary">
                  <q-timeline-entry 
                    v-for="activity in recentActivities"
                    :key="activity.id"
                    :title="activity.title"
                    :subtitle="formatDate(activity.created_at)"
                    :icon="getActivityIcon(activity.type)"
                  >
                    {{ activity.description }}
                  </q-timeline-entry>
                </q-timeline>
                
                <div v-if="!recentActivities.length" class="text-center q-pa-lg text-grey-6">
                  <q-icon name="history" size="3rem" class="q-mb-sm" />
                  <div>{{ $t('user.noActivity') }}</div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <q-dialog v-model="showAvatarDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('user.changeAvatar') }}</div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-center q-mb-md">
            <q-avatar size="120px">
              <img :src="previewAvatar || user?.avatar || defaultAvatar" />
            </q-avatar>
          </div>
          
          <q-input
            v-model="avatarUrl"
            :placeholder="$t('user.avatarUrl')"
            outlined
            :hint="$t('user.avatarUrlHint')"
            @update:model-value="(val) => updateAvatarPreview(val as string)"
          />
          
          <div class="q-mt-md">
            <q-file
              v-model="avatarFile"
              :placeholder="$t('user.uploadAvatar')"
              outlined
              accept="image/*"
              @update:model-value="handleAvatarUpload"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn 
            color="primary" 
            :label="$t('common.save')"
            @click="saveAvatar"
            :loading="isUploadingAvatar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 修改密码对话框 -->
    <q-dialog v-model="showChangePasswordDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('user.changePassword') }}</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="changePassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.currentPassword"
              :label="$t('user.currentPassword')"
              type="password"
              outlined
              :rules="[val => !!val || $t('user.currentPasswordRequired')]"
            />
            
            <q-input
              v-model="passwordForm.newPassword"
              :label="$t('user.newPassword')"
              type="password"
              outlined
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
              :rules="[
                val => !!val || $t('user.confirmPasswordRequired'),
                val => val === passwordForm.newPassword || $t('user.passwordMismatch')
              ]"
            />
            
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="$t('user.changePassword')"
                  :loading="isChangingPassword"
                  class="full-width"
                />
              </div>
              <div class="col-6">
                <q-btn
                  :label="$t('common.cancel')"
                  outline
                  v-close-popup
                  class="full-width"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import debug from "src/utils/debug"
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

// 计算属性
const user = computed(() => authStore.user)
const currentZone = computed(() => authStore.currentZone)

// 状态管理
const activeTab = ref('overview')
const isLoading = ref(false)
const isChangingPassword = ref(false)
const isUploadingAvatar = ref(false)
const showChangePasswordDialog = ref(false)
const showAvatarDialog = ref(false)
const twoFactorEnabled = ref(false)

// 默认头像
const defaultAvatar = 'https://via.placeholder.com/120/4A90E2/FFFFFF?text=U'

// 表单数据
const form = reactive({
  name: '',
  email: '',
  phone: '',
  bio: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像相关
const avatarUrl = ref('')
const avatarFile = ref(null)
const previewAvatar = ref('')

// 偏好设置
const preferences = reactive({
  theme: 'auto',
  language: 'zh-CN',
  emailNotifications: true,
  pushNotifications: true,
  systemAlerts: true
})

// 模拟数据
const userStats = ref({
  nodes: 3,
  routes: 7,
  friends: 12,
  loginCount: 156
})

const activeSessions = ref([
  {
    id: '1',
    device_name: 'Chrome on MacBook Pro',
    device_type: 'desktop',
    ip_address: '192.168.1.100',
    last_activity: '2024-01-15T10:30:00Z',
    is_current: true
  },
  {
    id: '2',
    device_name: 'Safari on iPhone',
    device_type: 'mobile',
    ip_address: '10.0.0.50',
    last_activity: '2024-01-14T16:20:00Z',
    is_current: false
  }
])

const recentActivities = ref([
  {
    id: '1',
    type: 'login',
    title: '用户登录',
    description: '从新设备登录系统',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'profile_update',
    title: '更新资料',
    description: '修改了个人资料信息',
    created_at: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    type: 'password_change',
    title: '密码修改',
    description: '成功修改登录密码',
    created_at: '2024-01-13T09:15:00Z'
  }
])

// 选项数据
const themeOptions = [
  { label: t('user.themeAuto'), value: 'auto' },
  { label: t('user.themeLight'), value: 'light' },
  { label: t('user.themeDark'), value: 'dark' }
]

const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// 工具函数
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('zh-CN')
}

const getRoleColor = (role: string | undefined) => {
  switch (role) {
    case 'admin': return 'negative'
    case 'moderator': return 'warning'
    case 'vip': return 'info'
    default: return 'primary'
  }
}

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case 'desktop': return 'computer'
    case 'mobile': return 'smartphone'
    case 'tablet': return 'tablet'
    default: return 'device_unknown'
  }
}

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'login': return 'login'
    case 'profile_update': return 'edit'
    case 'password_change': return 'key'
    case 'security': return 'security'
    default: return 'info'
  }
}

const copyToClipboard = async (text: string | number | undefined) => {
  if (!text) return
  
  try {
    await navigator.clipboard.writeText(String(text))
    $q.notify({
      type: 'positive',
      message: t('common.copiedToClipboard'),
      timeout: 2000
    })
  } catch (error) {
    debug.error('复制失败:', error)
    $q.notify({
      type: 'negative',
      message: t('common.copyFailed'),
      timeout: 2000
    })
  }
}

const onAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
}

const updateAvatarPreview = (url: string) => {
  previewAvatar.value = url
}

const handleAvatarUpload = (file: File | null) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewAvatar.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const saveAvatar = async () => {
  isUploadingAvatar.value = true
  try {
    // TODO: 实现头像上传逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showAvatarDialog.value = false
    $q.notify({
      type: 'positive',
      message: t('user.avatarUpdated'),
      timeout: 3000
    })
  } catch (error) {
    debug.error('头像上传失败:', error)
    $q.notify({
      type: 'negative',
      message: t('user.avatarUpdateFailed'),
      timeout: 3000
    })
  } finally {
    isUploadingAvatar.value = false
  }
}

const toggle2FA = async (enabled: boolean) => {
  try {
    // TODO: 实现2FA切换逻辑
    await new Promise(resolve => setTimeout(resolve, 500))
    
    $q.notify({
      type: 'positive',
      message: enabled ? t('user.2faEnabled') : t('user.2faDisabled'),
      timeout: 3000
    })
  } catch (error) {
    debug.error('2FA设置失败:', error)
    twoFactorEnabled.value = !enabled // 恢复原状态
    $q.notify({
      type: 'negative',
      message: t('user.2faUpdateFailed'),
      timeout: 3000
    })
  }
}

const revokeSession = async (sessionId: string) => {
  try {
    // TODO: 实现会话撤销逻辑
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从列表中移除
    const index = activeSessions.value.findIndex(s => s.id === sessionId)
    if (index > -1) {
      activeSessions.value.splice(index, 1)
    }
    
    $q.notify({
      type: 'positive',
      message: t('user.sessionRevoked'),
      timeout: 3000
    })
  } catch (error) {
    debug.error('撤销会话失败:', error)
    $q.notify({
      type: 'negative',
      message: t('user.sessionRevokeFailed'),
      timeout: 3000
    })
  }
}

// 表单操作
const onSubmit = async () => {
  isLoading.value = true
  try {
    // TODO: 实现更新用户资料逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    $q.notify({
      type: 'positive',
      message: t('user.profileUpdated'),
      timeout: 3000
    })
  } catch (error) {
    debug.error('更新资料失败:', error)
    $q.notify({
      type: 'negative',
      message: t('user.profileUpdateFailed'),
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
    form.phone = user.value.phone || ''
    form.bio = '' // bio 不存在于 user 类型中，设置为空字符串
  }
}

const changePassword = async () => {
  isChangingPassword.value = true
  try {
    // TODO: 实现修改密码逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showChangePasswordDialog.value = false
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    $q.notify({
      type: 'positive',
      message: t('user.passwordChanged'),
      timeout: 3000
    })
  } catch (error) {
    debug.error('修改密码失败:', error)
    $q.notify({
      type: 'negative',
      message: t('user.passwordChangeFailed'),
      timeout: 3000
    })
  } finally {
    isChangingPassword.value = false
  }
}

// 初始化
onMounted(() => {
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
    form.phone = user.value.phone || ''
    form.bio = '' // bio 不存在于 user 类型中，设置为空字符串
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
  margin-bottom: 2rem;
}

.profile-avatar {
  position: relative;
  border: 4px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.profile-content {
  background: white;
  min-height: 60vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--q-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.full-height {
  height: 100%;
}

/* 深色模式支持 */
.body--dark .profile-page {
  background: var(--q-dark-page);
}

.body--dark .profile-content {
  background: var(--q-dark);
}

.body--dark .stat-card {
  background: var(--q-dark-page);
  border-color: var(--q-dark-separator);
}
</style>
