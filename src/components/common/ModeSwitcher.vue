<template>
  <div class="mode-switcher" role="tablist" aria-label="视图切换">
    <button
      type="button"
      role="tab"
      :aria-selected="!isCloud"
      class="mode-pill mode-pill--local"
      :class="{ 'is-active': !isCloud }"
      @click="goLocal"
    >
      <q-icon name="computer" size="15px" class="q-mr-xs" />
      <span>本机设备</span>
    </button>
    <button
      type="button"
      role="tab"
      :aria-selected="isCloud"
      class="mode-pill mode-pill--cloud"
      :class="{ 'is-active': isCloud }"
      @click="goCloud"
    >
      <q-icon name="cloud" size="15px" class="q-mr-xs" />
      <span>云端空间</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExperienceStore } from '../../stores/experience'

const route = useRoute()
const router = useRouter()
const experienceStore = useExperienceStore()

const isCloud = computed(() => {
  const p = route.path || ''
  return p === '/cloud' || p.startsWith('/cloud/') || p === '/app' || p.startsWith('/app/')
})

function goLocal() {
  if (!isCloud.value) return
  const target = experienceStore.isGateway ? '/local/overview' : '/local/home'
  router.push(target).catch(() => undefined)
}

function goCloud() {
  if (isCloud.value) return
  router.push('/cloud/dashboard').catch(() => undefined)
}
</script>

<style lang="scss" scoped>
.mode-switcher {
  display: inline-flex;
  align-items: center;
  padding: 3px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.26);
  gap: 2px;
  flex-shrink: 0;
}

.mode-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 11px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #475569;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(.is-active) {
    color: #0f172a;
    background: rgba(148, 163, 184, 0.14);
  }

  &.mode-pill--local.is-active {
    background: #0f766e;
    color: #ffffff;
    box-shadow: 0 1px 3px rgba(15, 118, 110, 0.32);
  }

  &.mode-pill--cloud.is-active {
    background: #2563eb;
    color: #ffffff;
    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.32);
  }
}

.body--dark {
  .mode-switcher {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(148, 163, 184, 0.22);
  }

  .mode-pill {
    color: #cbd5e1;

    &:hover:not(.is-active) {
      color: #f8fafc;
      background: rgba(148, 163, 184, 0.16);
    }

    &.mode-pill--local.is-active {
      background: #0d9488;
      color: #ffffff;
    }

    &.mode-pill--cloud.is-active {
      background: #2563eb;
      color: #ffffff;
    }
  }
}
</style>
