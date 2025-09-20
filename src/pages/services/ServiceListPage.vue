<template>
  <PageLayout
    :title="$t('navigation.services')"
    :subtitle="$t('zoneServices.subtitle')"
    icon="apps"
  >
    <template #actions>
      <div class="row q-gutter-sm items-center">
        <q-btn
          color="primary"
          icon="add"
          :label="$t('zoneServices.addService')"
          @click="navigateToMyServices"
        />
        <q-btn
          color="grey-7"
          icon="refresh"
          :label="$t('common.refresh')"
          @click="handleRefresh"
          :loading="loading"
        />
      </div>
    </template>

    <!-- 服务概览统计 -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="overview-card">
          <q-card-section class="text-center">
            <q-icon name="public" size="2rem" color="primary" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-primary">{{ publicServices.length }}</div>
            <div class="text-body2 text-grey-6">{{ $t('zoneServices.categories.public') }}</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="overview-card">
          <q-card-section class="text-center">
            <q-icon name="group" size="2rem" color="positive" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-positive">{{ friendServices.length }}</div>
            <div class="text-body2 text-grey-6">{{ $t('zoneServices.categories.friend') }}</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="overview-card">
          <q-card-section class="text-center">
            <q-icon name="visibility_off" size="2rem" color="warning" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-warning">{{ anonymousServices.length }}</div>
            <div class="text-body2 text-grey-6">{{ $t('zoneServices.categories.anonymous') }}</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="overview-card">
          <q-card-section class="text-center">
            <q-icon name="person_add" size="2rem" color="accent" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-accent">{{ myServices.length }}</div>
            <div class="text-body2 text-grey-6">{{ $t('zoneServices.categories.my') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 服务管理导航 -->
    <div class="section-header q-mb-md">
      <h5 class="q-my-none">{{ $t('navigation.services.title') }}</h5>
      <p class="text-grey-6 q-mt-xs q-mb-none">
        {{ $t('navigation.services.description') }}
      </p>
    </div>

    <ResponsiveCardGrid
      :items="navigationItems"
      :loading="false"
      variant="standard"
      spacing="normal"
    >
      <template #default="{ item }">
        <q-card 
          class="navigation-card cursor-pointer"
          @click="item.action"
          v-ripple
        >
          <q-card-section class="text-center q-py-lg">
            <q-icon 
              :name="item.icon" 
              :color="item.color" 
              size="3rem" 
              class="q-mb-md" 
            />
            <div class="text-h6 q-mb-sm">{{ item.title }}</div>
            <div class="text-body2 text-grey-6">{{ item.description }}</div>
            
            <!-- 服务数量徽章 -->
            <q-chip 
              v-if="item.count !== undefined"
              :color="item.color"
              text-color="white"
              :label="item.count"
              size="sm"
              class="q-mt-sm"
            />
          </q-card-section>
          
          <q-card-actions class="justify-center q-pb-md">
            <q-btn
              :color="item.color"
              :label="$t('common.enter')"
              flat
              no-caps
            />
          </q-card-actions>
        </q-card>
      </template>
    </ResponsiveCardGrid>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageLayout from '../../components/layout/PageLayout.vue'
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid.vue'
import { useZoneServices } from '../../composables/useZoneServices'

const router = useRouter()
const { t } = useI18n()

// 使用服务管理 composable
const {
  loading,
  publicServices,
  friendServices,
  anonymousServices,
  myServices,
  loadAllServices
} = useZoneServices()

// 导航项配置
const navigationItems = computed(() => [
  {
    title: t('navigation.services.publicServices'),
    description: t('navigation.services.publicServicesDescription'),
    icon: 'public',
    color: 'primary',
    count: publicServices.value.length,
    action: () => router.push('/app/services/public')
  },
  {
    title: t('navigation.services.friendServices'),
    description: t('navigation.services.friendServicesDescription'),
    icon: 'group', 
    color: 'positive',
    count: friendServices.value.length,
    action: () => router.push('/app/services/friends')
  },
  {
    title: t('navigation.services.anonymousServices'),
    description: t('navigation.services.anonymousServicesDescription'),
    icon: 'visibility_off',
    color: 'warning',
    count: anonymousServices.value.length,
    action: () => router.push('/app/services/anonymous')
  },
  {
    title: t('navigation.services.myServices'),
    description: t('navigation.services.myServicesDescription'),
    icon: 'person_add',
    color: 'accent',
    count: myServices.value.length,
    action: () => router.push('/app/services/my')
  }
])

// 页面初始化
onMounted(async () => {
  await handleRefresh()
})

// 刷新数据
const handleRefresh = async () => {
  await loadAllServices()
}

// 快速导航到我的服务
const navigateToMyServices = () => {
  router.push('/app/services/my')
}
</script>

<style scoped lang="scss">
.overview-card {
  min-height: 120px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

.navigation-card {
  min-height: 200px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
}

.section-header {
  h5 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
  }
}
</style>