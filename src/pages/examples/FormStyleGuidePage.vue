<template>
  <q-page class="form-style-guide q-pa-md">
    <div class="page-header q-mb-lg">
      <h4 class="text-h4 q-mb-sm">表单输入风格指南</h4>
      <div class="text-subtitle1 text-grey-7">
        展示不同场景下推荐的表单输入交互风格
      </div>
    </div>

    <!-- 风格1: 认证表单 - 纯 Placeholder 风格 -->
    <section class="style-section q-mb-xl">
      <div class="section-header q-mb-md">
        <h5 class="text-h5 q-mb-xs">1. 认证表单风格 - 纯 Placeholder</h5>
        <div class="text-body2 text-grey-6">
          适用场景：登录、注册、找回密码等认证相关表单
        </div>
      </div>
      
      <q-card class="demo-card q-pa-md" outlined>
        <div class="text-h6 q-mb-md">用户登录</div>
        <q-form class="q-gutter-md" style="max-width: 400px;">
          <q-input
            v-model="authForm.email"
            :placeholder="$t('auth.email')"
            type="email"
            outlined
            class="form-field"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="authForm.password"
            :placeholder="$t('auth.password')"
            type="password"
            outlined
            class="form-field"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-btn
            color="primary"
            :label="$t('auth.login')"
            class="full-width"
            unelevated
          />
        </q-form>
      </q-card>
    </section>

    <!-- 风格2: 搜索框风格 -->
    <section class="style-section q-mb-xl">
      <div class="section-header q-mb-md">
        <h5 class="text-h5 q-mb-xs">2. 搜索框风格 - 简洁 Placeholder</h5>
        <div class="text-body2 text-grey-6">
          适用场景：各种搜索功能
        </div>
      </div>
      
      <q-card class="demo-card q-pa-md" outlined>
        <q-input
          v-model="searchQuery"
          :placeholder="$t('common.searchPlaceholder')"
          outlined
          dense
          clearable
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card>
    </section>

    <!-- 风格3: 编辑表单 - 纯 Placeholder 风格 -->
    <section class="style-section q-mb-xl">
      <div class="section-header q-mb-md">
        <h5 class="text-h5 q-mb-xs">3. 编辑表单风格 - 纯 Placeholder</h5>
        <div class="text-body2 text-grey-6">
          适用场景：用户资料编辑、节点配置等正式表单（统一后的风格）
        </div>
      </div>
      
      <q-card class="demo-card q-pa-md" outlined>
        <div class="text-h6 q-mb-md">用户资料编辑</div>
        <q-form class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="profileForm.name"
                :placeholder="$t('user.name')"
                outlined
                :rules="[val => !!val || '姓名不能为空']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="profileForm.email"
                :placeholder="$t('user.email')"
                type="email"
                outlined
                :rules="[val => !!val || '邮箱不能为空']"
              />
            </div>
          </div>

          <q-input
            v-model="profileForm.phone"
            :placeholder="$t('user.phone')"
            outlined
          />

          <q-input
            v-model="profileForm.bio"
            :placeholder="$t('user.bio')"
            type="textarea"
            rows="3"
            outlined
          />

          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              :label="$t('common.save')"
              unelevated
            />
            <q-btn
              flat
              :label="$t('common.cancel')"
            />
          </div>
        </q-form>
      </q-card>
    </section>

    <!-- 风格4: 对话框表单 - 详细 Placeholder -->
    <section class="style-section q-mb-xl">
      <div class="section-header q-mb-md">
        <h5 class="text-h5 q-mb-xs">4. 对话框表单风格 - 详细 Placeholder</h5>
        <div class="text-body2 text-grey-6">
          适用场景：弹窗、对话框中的紧凑表单
        </div>
      </div>
      
      <q-card class="demo-card q-pa-md" outlined>
        <div class="text-h6 q-mb-md">添加服务</div>
        <q-form class="q-gutter-md">
          <q-input
            v-model="serviceForm.name"
            placeholder="服务名称 (如：Web服务器)"
            outlined
            dense
          />

          <q-input
            v-model="serviceForm.address"
            placeholder="服务地址 (192.168.1.100 或 example.com)"
            outlined
            dense
          />

          <q-input
            v-model="serviceForm.port"
            placeholder="端口号 (1-65535)"
            type="number"
            outlined
            dense
          />

          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              label="确认添加"
              size="sm"
              unelevated
            />
            <q-btn
              flat
              label="取消"
              size="sm"
            />
          </div>
        </q-form>
      </q-card>
    </section>

    <!-- 风格5: 只读显示 - q-field 包装 -->
    <section class="style-section q-mb-xl">
      <div class="section-header q-mb-md">
        <h5 class="text-h5 q-mb-xs">5. 只读显示风格 - q-field 包装</h5>
        <div class="text-body2 text-grey-6">
          适用场景：信息展示、只读字段、复杂布局
        </div>
      </div>
      
      <q-card class="demo-card q-pa-md" outlined>
        <div class="text-h6 q-mb-md">节点详细信息</div>
        <div class="q-gutter-md">
          <q-field label="节点ID" stack-label>
            <template v-slot:control>
              <div class="self-center full-width no-outline">
                node_12345678
              </div>
            </template>
          </q-field>

          <q-field label="节点类型" stack-label>
            <template v-slot:control>
              <div class="self-center full-width no-outline">
                <q-chip color="primary" text-color="white" size="sm">
                  标准节点
                </q-chip>
              </div>
            </template>
          </q-field>

          <q-field label="公钥信息" stack-label>
            <template v-slot:control>
              <q-input
                v-model="readonlyData.publicKey"
                type="textarea"
                readonly
                rows="3"
                outlined
                dense
              />
            </template>
          </q-field>
        </div>
      </q-card>
    </section>

    <!-- 风格对比总结 -->
    <section class="style-section">
      <div class="section-header q-mb-md">
        <h5 class="text-h5 q-mb-xs">风格使用指南总结</h5>
      </div>
      
      <q-card class="summary-card q-pa-md" outlined>
        <q-list>
          <q-item>
            <q-item-section side>
              <q-icon name="login" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">认证表单</q-item-label>
              <q-item-label caption>使用纯 Placeholder，简洁直观</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side>
              <q-icon name="search" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">搜索功能</q-item-label>
              <q-item-label caption>使用简洁 Placeholder，配合图标</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side>
              <q-icon name="edit" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">编辑表单</q-item-label>
              <q-item-label caption>使用纯 Label，清晰标识字段</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side>
              <q-icon name="add_circle" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">对话框表单</q-item-label>
              <q-item-label caption>使用详细 Placeholder，节省空间</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side>
              <q-icon name="visibility" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">只读显示</q-item-label>
              <q-item-label caption>使用 q-field 包装，支持复杂布局</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 表单数据
const authForm = ref({
  email: '',
  password: ''
})

const searchQuery = ref('')

const profileForm = ref({
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '+86 138 0013 8000',
  bio: '这是一个示例用户简介...'
})

const serviceForm = ref({
  name: '',
  address: '',
  port: ''
})

const readonlyData = ref({
  publicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDhA...'
})
</script>

<style lang="scss" scoped>
.form-style-guide {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 24px;
}

.style-section {
  .section-header {
    h5 {
      margin: 0;
      color: #1976d2;
    }
  }
}

.demo-card {
  background: #fafafa;
  border-radius: 8px;
  
  .form-field {
    background: white;
  }
}

.search-input {
  max-width: 400px;
}

.summary-card {
  background: linear-gradient(145deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .q-item {
    border-radius: 8px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.7);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 深层样式调整
:deep(.q-field__control) {
  min-height: 40px;
}

:deep(.q-field__label) {
  font-weight: 500;
}
</style>