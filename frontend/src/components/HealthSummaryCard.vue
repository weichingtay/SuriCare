<template>
  <BaseSummaryCard
    title="Health"
    icon="mdi-heart"
    :main-value="healthData?.status || 'Healthy'"
    :status-note="healthData?.message || 'No symptoms today'"
    :status-class="statusClass"
    @check-in="handleCheckIn"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseSummaryCard from './BaseSummaryCard.vue'
import { useHealthStore } from '@/stores/health'
import { storeToRefs } from 'pinia'

// Get health store
const healthStore = useHealthStore()
const { getHealthForDate } = storeToRefs(healthStore)

// Get current date
const currentDate = computed(() => new Date().toISOString().split('T')[0])

// Get health data
const healthData = computed(() => getHealthForDate.value(currentDate.value))

// Compute status class based on health status
const statusClass = computed(() => {
  if (!healthData.value) return 'status-positive'
  
  switch (healthData.value.status) {
    case 'High Fever':
      return 'status-negative'
    case 'Low Fever':
    case 'Cold Symptoms':
      return 'status-warning'
    case 'Allergies':
      return 'status-neutral'
    default:
      return 'status-positive'
  }
})

const handleCheckIn = () => {
  console.log('Health check-in clicked')
  // TODO: Implement health check-in functionality
}
</script>

<style scoped>
/* Health card has larger main value */
:deep(.main-value) {
  font-size: 20px !important;
}
</style>
