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
  import AlertCard from './AlertCard.vue'
  import { useGuidanceAlert } from '@/composables/useGuidanceAlert'

  const { alerts, removeAlert } = useGuidanceAlert()

  const handleReadAlert = id => {
    removeAlert(id)
  }
</script>
