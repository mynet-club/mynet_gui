<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- 用户信息卡片 -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-center">
            <q-avatar size="100px" class="q-mb-md">
              <img :src="user?.avatar || 'https://via.placeholder.com/100'" />
            </q-avatar>
            <div class="text-h6">{{ user?.name }}</div>
            <div class="text-caption text-grey-6">{{ user?.email }}</div>
            <q-chip 
              :label="currentZone?.name || 'No Zone'"
              color="primary"
              class="q-mt-sm"
            />
          </q-card-section>
          
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">{{ $t('user.profileInfo') }}</div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('user.userId') }}</q-item-label>
                  <q-item-label>{{ user?.user_id }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('user.currentZone') }}</q-item-label>
                  <q-item-label>{{ currentZone?.name }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ $t('user.permissions') }}</q-item-label>
                  <q-item-label>
                    <q-chip 
                      v-for="permission in user?.permissions" 
                      :key="permission"
                      :label="permission"
                      size="sm"
                      class="q-mr-xs q-mb-xs"
                    />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- 编辑资料表单 -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ $t('user.editProfile') }}</div>
          </q-card-section>
          
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input 
                    v-model="form.name"
                    :label="$t('user.name')"
                    outlined
                    :rules="[val => !!val || $t('user.nameRequired')]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input 
                    v-model="form.email"
                    :label="$t('user.email')"
                    type="email"
                    outlined
                    :rules="[
                      val => !!val || $t('user.emailRequired'),
                      val => validateEmail(val) || $t('user.emailInvalid')
                    ]"
                  />
                </div>
              </div>
              
              <q-input 
                v-model="form.avatar"
                :label="$t('user.avatarUrl')"
                outlined
                hint="Enter avatar image URL"
              />
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-btn
                    type="submit"
                    color="primary"
                    :label="$t('user.saveChanges')"
                    :loading="isLoading"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-btn
                    :label="$t('user.cancel')"
                    outline
                    @click="resetForm"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
        
        <!-- 安全设置 -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">{{ $t('user.securitySettings') }}</div>
          </q-card-section>
          
          <q-card-section>
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
                  />
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>{{ $t('user.twoFactorAuth') }}</q-item-label>
                  <q-item-label caption>{{ $t('user.twoFactorAuthDesc') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="twoFactorEnabled" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
    
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
              :label="$t('user.confirmNewPassword')"
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
                  :label="$t('user.save')"
                  :loading="isChangingPassword"
                />
              </div>
              <div class="col-6">
                <q-btn
                  :label="$t('user.cancel')"
                  outline
                  v-close-popup
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const currentZone = computed(() => authStore.currentZone)

const isLoading = ref(false)
const isChangingPassword = ref(false)
const showChangePasswordDialog = ref(false)
const twoFactorEnabled = ref(false)

const form = reactive({
  name: '',
  email: '',
  avatar: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

onMounted(() => {
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
    form.avatar = user.value.avatar || ''
  }
})

const onSubmit = async () => {
  isLoading.value = true
  try {
    // TODO: 实现更新用户资料逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully!',
      timeout: 3000
    })
  } catch (error) {
    console.error('Update profile failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile. Please try again.',
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
    form.avatar = user.value.avatar || ''
  }
}

const changePassword = async () => {
  isChangingPassword.value = true
  try {
    // TODO: 实现修改密码逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    showChangePasswordDialog.value = false
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    $q.notify({
      type: 'positive',
      message: 'Password changed successfully!',
      timeout: 3000
    })
  } catch (error) {
    console.error('Change password failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to change password. Please try again.',
      timeout: 3000
    })
  } finally {
    isChangingPassword.value = false
  }
}
</script> 