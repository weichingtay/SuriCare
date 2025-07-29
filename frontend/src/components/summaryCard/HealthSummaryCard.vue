<template>
  <BaseSummaryCard
    icon="mdi-heart"
    :main-value="healthData?.status || 'Healthy'"
    :status-class="statusClass"
    :status-note="statusNote"
    title="Health"
    @check-in="handleCheckIn"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseSummaryCard from './BaseSummaryCard.vue'
import { useHealthStore } from '@/stores/health'
import { storeToRefs } from 'pinia'

const props = defineProps({
  date: {
    type: Date,
    required: true,
  },
})

// Get health store
const healthStore = useHealthStore()
const { getHealthForDate } = storeToRefs(healthStore)

// Convert date to string (following your pattern)
const dateString = computed(() => {
  const year = props.date.getFullYear()
  const month = String(props.date.getMonth() + 1).padStart(2, '0')
  const day = String(props.date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Get health data
const healthData = computed(() => getHealthForDate.value(dateString.value))

// Enhanced status note showing health details (following your pattern)
const statusNote = computed(() => {
  const data = healthData.value

  if (!data || !data.lastUpdated) {
    return 'No symptoms today'
  }

  const symptomCount = data.symptoms?.length || 0
  const status = data.status || 'Healthy'
  const symptoms = data.symptoms || []

  // No symptoms - healthy
  if (symptomCount === 0) {
    return 'No symptoms today'
  }

  // Show temperature if available (for fever cases)
  if (data.temperature) {
    return `Temperature: ${data.temperature}°C`
  }

  // Show specific symptoms for non-fever cases
  if (symptomCount === 1) {
    return symptoms[0]
  } else if (symptomCount === 2) {
    return symptoms.join(', ')
  } else {
    // 3+ symptoms - show first two and indicate more
    return `${symptoms.slice(0, 2).join(', ')}, +${symptomCount - 2} more`
  }
})

// Status class based on health severity (following your pattern)
const statusClass = computed(() => {
  const data = healthData.value
  
  if (!data || !data.lastUpdated) {
    return 'status-neutral'
  }

  const status = data.status || 'Healthy'

  // Red: High fever or critical conditions
  if (status.includes('High Fever') || status.includes('Critical')) {
    return 'status-negative'
  }
  // Yellow: Low fever, cold symptoms, allergies
  else if (status.includes('Low Fever') || status.includes('Cold') || status.includes('Allergies')) {
    return 'status-warning'
  }
  // Green: Healthy
  else if (status === 'Healthy') {
    return 'status-positive'
  }
  // Neutral: Other cases
  else {
    return 'status-neutral'
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