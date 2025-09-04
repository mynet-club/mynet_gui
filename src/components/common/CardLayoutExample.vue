<template>
  <div class="card-layout-example">
    <div class="q-pa-md">
      <h4>响应式卡片布局示例</h4>
      
      <!-- 控制面板 -->
      <div class="row q-gutter-md q-mb-lg">
        <q-select
          v-model="variant"
          :options="variantOptions"
          label="网格变体"
          style="min-width: 150px"
        />
        <q-select
          v-model="spacing"
          :options="spacingOptions"
          label="间距"
          style="min-width: 120px"
        />
        <q-toggle v-model="loading" label="加载状态" />
        <q-toggle v-model="selectable" label="可选择" />
      </div>

      <!-- 卡片网格 -->
      <ResponsiveCardGrid
        :items="sampleData"
        :loading="loading"
        :loading-count="12"
        :variant="variant"
        :spacing="spacing"
        :selectable="selectable"
        :selected-items="selectedItems"
        empty-icon="widgets"
        empty-title="暂无数据"
        empty-description="这里还没有任何内容"
        @selection-change="selectedItems = $event"
      >
        <template #default="{ item, index, isSelected }">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-avatar 
                :color="item.color" 
                text-color="white" 
                :icon="item.icon"
                size="40px"
              />
              <div class="q-ml-md">
                <div class="text-h6">{{ item.title }}</div>
                <div class="text-caption text-grey-6">{{ item.category }}</div>
              </div>
            </div>
            <div class="text-body2 q-mb-md">
              {{ item.description }}
            </div>
            <div class="row items-center justify-between">
              <q-chip 
                :color="item.status === 'active' ? 'positive' : 'grey'" 
                text-color="white"
                size="sm"
                :label="item.status"
              />
              <div class="text-caption text-grey-6">
                {{ item.date }}
              </div>
            </div>
          </q-card-section>
          
          <q-card-actions align="right">
            <q-btn flat color="primary" label="查看" size="sm" />
            <q-btn flat color="secondary" label="编辑" size="sm" />
          </q-card-actions>
        </template>

        <template #emptyAction>
          <q-btn 
            color="primary" 
            label="添加内容" 
            @click="addSampleData"
          />
        </template>
      </ResponsiveCardGrid>

      <!-- 选择信息 -->
      <div v-if="selectable && selectedItems.length > 0" class="q-mt-lg">
        <q-banner class="bg-blue-1 text-blue-8">
          <template #avatar>
            <q-icon name="info" color="blue" />
          </template>
          已选择 {{ selectedItems.length }} 个项目
        </q-banner>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ResponsiveCardGrid from './ResponsiveCardGrid.vue'

interface SampleItem {
  id: string
  title: string
  description: string
  category: string
  status: 'active' | 'inactive'
  color: string
  icon: string
  date: string
}

const variant = ref<'standard' | 'compact' | 'spacious'>('standard')
const spacing = ref<'tight' | 'normal' | 'loose' | 'xl'>('normal')
const loading = ref(false)
const selectable = ref(false)
const selectedItems = ref<SampleItem[]>([])

const variantOptions = [
  { label: '标准 (1-2-3-4)', value: 'standard' },
  { label: '紧凑 (1-2-4-6)', value: 'compact' },
  { label: '宽松 (1-1-2-3)', value: 'spacious' }
]

const spacingOptions = [
  { label: '紧凑', value: 'tight' },
  { label: '正常', value: 'normal' },
  { label: '宽松', value: 'loose' },
  { label: '超大', value: 'xl' }
]

const sampleData = ref<SampleItem[]>([
  {
    id: '1',
    title: '用户管理',
    description: '管理系统用户账户、权限和配置文件',
    category: '系统管理',
    status: 'active',
    color: 'primary',
    icon: 'people',
    date: '2024-01-15'
  },
  {
    id: '2',
    title: '数据分析',
    description: '实时数据监控和业务分析报表',
    category: '数据服务',
    status: 'active',
    color: 'secondary',
    icon: 'analytics',
    date: '2024-01-14'
  },
  {
    id: '3',
    title: '通知系统',
    description: '消息推送和通知管理服务',
    category: '通信服务',
    status: 'inactive',
    color: 'accent',
    icon: 'notifications',
    date: '2024-01-13'
  },
  {
    id: '4',
    title: '文件存储',
    description: '云端文件存储和管理系统',
    category: '存储服务',
    status: 'active',
    color: 'positive',
    icon: 'cloud',
    date: '2024-01-12'
  },
  {
    id: '5',
    title: '安全中心',
    description: '系统安全监控和威胁检测',
    category: '安全服务',
    status: 'active',
    color: 'negative',
    icon: 'security',
    date: '2024-01-11'
  },
  {
    id: '6',
    title: 'API 网关',
    description: 'RESTful API 接口管理和路由',
    category: '接口服务',
    status: 'active',
    color: 'info',
    icon: 'api',
    date: '2024-01-10'
  },
  {
    id: '7',
    title: '监控面板',
    description: '系统性能和资源使用监控',
    category: '监控服务',
    status: 'active',
    color: 'warning',
    icon: 'dashboard',
    date: '2024-01-09'
  },
  {
    id: '8',
    title: '备份恢复',
    description: '数据备份和灾难恢复管理',
    category: '备份服务',
    status: 'inactive',
    color: 'grey',
    icon: 'backup',
    date: '2024-01-08'
  }
])

const addSampleData = () => {
  const newItem: SampleItem = {
    id: Date.now().toString(),
    title: '新服务',
    description: '这是一个新添加的服务示例',
    category: '示例服务',
    status: 'active',
    color: 'primary',
    icon: 'add_circle',
    date: new Date().toISOString().split('T')[0] || '2024-01-01'
  }
  sampleData.value.push(newItem)
}
</script>

<style lang="scss" scoped>
.card-layout-example {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
