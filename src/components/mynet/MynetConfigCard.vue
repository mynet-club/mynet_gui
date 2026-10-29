<template>
  <q-card class="mynet-config-card">
    <q-card-section class="row items-start no-wrap">
      <div class="col">
        <div class="card-title">{{ title }}</div>
        <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
      </div>
      <q-badge v-if="badge" :color="badgeTone" align="middle">{{ badge }}</q-badge>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <slot />
    </q-card-section>
    <q-card-actions v-if="actionLabel" align="right">
      <q-btn
        color="primary"
        :label="actionLabel"
        :loading="busy"
        :disable="busy"
        @click="$emit('action')"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  badge?: string
  badgeTone?: 'primary' | 'positive' | 'warning' | 'negative' | 'grey'
  actionLabel?: string
  busy?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  badge: '',
  badgeTone: 'primary',
  actionLabel: '',
  busy: false
})

defineEmits<{ action: [] }>()
</script>

<style lang="scss" scoped>
.mynet-config-card {
  border-radius: var(--r-card, 12px);
  height: 100%;
}
.card-title { font-size: 15px; font-weight: 650; }
.card-subtitle {
  font-size: 12px;
  color: var(--ink-3, var(--color-text-secondary, #6b7280));
  margin-top: 2px;
}
</style>
