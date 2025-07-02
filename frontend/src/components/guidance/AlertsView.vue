<template>
  <div>
    <!-- Alert Cards -->
    <div class="mb-6">
      <AlertCard
        v-for="alert in alerts"
        :key="alert.id"
        :alert="alert"
        class="mb-8"
        @read-alert="handleReadAlert(alert.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import AlertCard from './AlertCard.vue'

  // TODO: Replace with actual alerts from store
  const alerts = ref([])

  const handleReadAlert = (id: number) => {
    alerts.value = alerts.value.filter(alert => alert.id !== id)
  }
</script>
