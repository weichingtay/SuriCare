import { computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health'
import { storeToRefs } from 'pinia'

export function useHealthAlert() {
  const healthStore = useHealthStore()
  const { getHealthForDate } = storeToRefs(healthStore)

  // Get current date
  const currentDate = computed(() => new Date().toISOString().split('T')[0])

  // Get health data
  const healthData = computed(() => getHealthForDate.value(currentDate.value))

  // Check if we should show the alert
  const hasHealthAlert = computed(() => healthData.value?.status !== 'Healthy')

  // Fetch health data on mount
  onMounted(async () => {
    await healthStore.fetchHealthForDate(currentDate.value)
  })

  return {
    healthData,
    hasHealthAlert
  }
} 