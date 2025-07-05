<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Nodes Management</div>
    <q-table
      title="Network Nodes"
      :rows="nodes"
      :columns="columns"
      row-key="id"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const nodes = ref([
  { id: 1, name: 'Node 1', type: 'Server', status: 'Active' },
  { id: 2, name: 'Node 2', type: 'Client', status: 'Inactive' },
])

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
]
</script>