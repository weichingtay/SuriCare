<template>
  <BaseSummaryCard
    icon="mdi-heart"
    :main-value="healthData?.status || 'Healthy'"
    :status-class="statusClass"
    :status-note="healthData?.message || 'No symptoms today'"
    title="Health"
    @check-in="handleCheckIn"
  />
</template>

<script setup lang="ts">
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

  const emit = defineEmits(['check-in'])

  const handleCheckIn = () => {
    emit('check-in')
  }
</script>

<style scoped>
/* NOTE: Health card has larger main value */
:deep(.main-value) {
  font-size: 20px !important;
}
</style>
