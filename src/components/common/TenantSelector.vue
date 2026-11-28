<template>
  <q-btn
    flat
    dense
    no-caps
    :round="!showName"
    @click="showDialog = true"
    class="zone-selector"
    :class="{ 'zone-selector--pill': showName }"
  >
    <div v-if="showName" class="row items-center no-wrap q-gutter-xs">
      <q-icon name="travel_explore" size="16px" class="zone-icon" />
      <span class="zone-name ellipsis">{{ currentTenant?.name || $t('zones.selectZone') }}</span>
      <q-icon name="expand_more" size="15px" class="zone-chevron" />
    </div>
    <q-icon v-else name="travel_explore" size="18px" />

    <q-tooltip>
      {{ currentTenant?.name ? `${$t('zones.switchZone')}：${currentTenant.name}` : $t('zones.selectZone') }}
    </q-tooltip>

    <!-- Tenant 切换弹窗 -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('zones.switchZone') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item
              v-for="tenant in availableTenants"
              :key="tenant.tenant_id"
              clickable
              @click="handleSwitch(tenant.tenant_id)"
              :active="tenant.tenant_id === currentTenant?.tenant_id"
            >
              <q-item-section avatar>
                <q-icon
                  name="travel_explore"
                  :color="tenant.status === 'active' ? 'primary' : 'grey'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tenant.name }}</q-item-label>
                <q-item-label caption>{{ tenant.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end">
                  <q-chip
                    :label="tenant.status === 'active' ? $t('common.active') : $t('common.inactive')"
                    :color="tenant.status === 'active' ? 'positive' : 'grey'"
                    text-color="white"
                    size="sm"
                  />
                  <q-icon
                    v-if="tenant.tenant_id === currentTenant?.tenant_id"
                    name="check"
                    color="positive"
                    class="q-mt-xs"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import debug from 'src/utils/debug'
import { useTenants } from '../../composables/useTenants'

withDefaults(defineProps<{
  showName?: boolean
}>(), {
  showName: false
})

// 状态与提示都走 useTenants/authStore：这里只负责展示与触发，
// 不再自己找目标网络区、自己发通知（同一动作两处实现会提示口径不一致）。
const { currentTenant, availableTenants, switchTenant } = useTenants()

const showDialog = ref(false)

const handleSwitch = async (tenantId: number) => {
  debug.log('🔧 [TenantSelector] Switching to tenant:', tenantId)
  const switched = await switchTenant(tenantId)
  if (switched) {
    showDialog.value = false
  }
}
</script>

<style lang="scss" scoped>
.zone-selector {
  transition: all 0.15s ease;
  border-radius: 6px;

  &--pill {
    height: 30px;
    padding: 0 10px;
    border-radius: 8px;
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.18);
    color: #1e40af;

    &:hover {
      background: rgba(37, 99, 235, 0.13);
      border-color: rgba(37, 99, 235, 0.28);
    }

    .zone-icon {
      color: #2563eb;
    }

    .zone-name {
      font-size: 13px;
      font-weight: 500;
      max-width: 180px;
    }

    .zone-chevron {
      opacity: 0.7;
    }
  }
}

.body--dark {
  .zone-selector--pill {
    background: rgba(59, 130, 246, 0.14);
    border-color: rgba(59, 130, 246, 0.28);
    color: #dbeafe;

    &:hover {
      background: rgba(59, 130, 246, 0.22);
    }

    .zone-icon {
      color: #60a5fa;
    }
  }
}
</style>
