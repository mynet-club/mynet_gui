<template>
  <nav class="route-progress q-mb-lg" :aria-label="$t('workflow.connectionSteps')">
    <div class="text-caption q-mb-sm" aria-live="polite">
      {{ $t('workflow.stepCount', { current: step, total: 4 }) }}
    </div>
    <ol>
      <li v-for="(item, index) in steps" :key="item.key" :aria-current="step === index + 1 ? 'step' : false">
        <q-btn
          flat no-caps align="left"
          :color="step === index + 1 ? 'primary' : undefined"
          :icon="index + 1 < step ? 'check_circle' : item.icon"
          :label="$t(item.key)"
          :disable="busy || index + 1 > step"
          :to="index + 1 < step ? `/app/routes/create/prev_${index + 1}` : undefined"
          :class="{ 'current-step': step === index + 1 }"
        />
      </li>
    </ol>
  </nav>
</template>
<script setup lang="ts">
defineProps<{ step: number; busy?: boolean }>()
const steps = [
  { key: 'routes.create.steps.selectFriend', icon: 'people' },
  { key: 'routes.create.steps.selectFriendNode', icon: 'device_hub' },
  { key: 'routes.create.steps.selectMyNode', icon: 'router' },
  { key: 'routes.create.steps.submitRequest', icon: 'send' }
]
</script>
<style scoped lang="scss">
.route-progress {
  color: var(--text-secondary);
  ol { list-style: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding: 0; margin: 0; }
  .q-btn { width: 100%; min-height: 48px; }
  .current-step { background: var(--primary-soft); }
  @media (max-width: 599px) { ol { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
}
</style>
