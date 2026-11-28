<template>
  <q-banner
    v-if="gate.blocked"
    dense
    rounded
    class="capability-gate-banner"
    :class="`is-${gate.tone}`"
  >
    <template #avatar>
      <q-icon :name="gate.icon" :color="gate.chipColor" size="22px" />
    </template>

    <div class="row items-center q-gutter-xs">
      <q-chip dense size="sm" :color="gate.chipColor" text-color="white" class="q-ma-none">
        {{ gate.chipLabel }}
      </q-chip>
      <span class="text-weight-medium">{{ gate.reason }}</span>
    </div>
    <div v-if="gate.actionHint" class="text-caption text-grey-7 q-mt-xs">
      {{ gate.actionHint }}
    </div>

    <template v-if="gate.showUpgradeAction || $slots.action" #action>
      <slot name="action">
        <q-btn
          v-if="gate.showUpgradeAction"
          flat
          dense
          color="primary"
          icon="upgrade"
          :label="upgradeLabel"
          @click="$emit('upgrade')"
        />
      </slot>
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveCapabilityGate, type CapabilityGateState } from '../../utils/capabilityGate'

const props = withDefaults(defineProps<{
  state: CapabilityGateState
  upgradeLabel?: string
}>(), {
  upgradeLabel: '申请扩容'
})

defineEmits<{
  (e: 'upgrade'): void
}>()

const gate = computed(() => resolveCapabilityGate(props.state))
</script>

<style lang="scss" scoped>
.capability-gate-banner {
  border: 1px solid transparent;

  &.is-err {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.25);
  }

  &.is-warn {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.28);
  }
}
</style>
