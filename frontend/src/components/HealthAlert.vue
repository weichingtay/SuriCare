<template>
  <!-- Debug Info - Temporary -->
  <div class="mb-4 p-4 bg-grey-lighten-4 rounded">
    <h4 class="text-h6 mb-2">🔍 Debug Info</h4>
    <p><strong>Current Date:</strong> {{ currentDateString }}</p>
    <p><strong>hasHealthAlert:</strong> {{ hasHealthAlert }}</p>
    <p><strong>alerts.length:</strong> {{ alerts.length }}</p>
    <p><strong>topAlert exists:</strong> {{ !!topAlert }}</p>
    <p><strong>currentChild:</strong> {{ currentChild?.name }}</p>
    <v-btn size="small" @click="safeForceAnalysis" class="mr-2">Force Analysis</v-btn>
    <v-btn size="small" @click="logDetails">Log Details</v-btn>
  </div>

  <div v-if="hasHealthAlert" class="mb-6">
    <h2 class="text-body-1 font-weight-medium mb-3">
      {{ currentChild.name }}'s Smart Alert
    </h2>
    <v-alert class="health-alert" :color="alertColor" variant="tonal">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="mr-3 ml-1" :color="alertIconColor">
            {{ alertIcon }}
          </v-icon>
          <div>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ topAlert.title }}
            </div>
            <div class="text-body-2 text-grey-darken-1">
              {{ topAlert.description }}
            </div>
          </div>
        </div>
        <v-btn
          class="text-white mr-3"
          :color="alertIconColor"
          size="small"
          variant="flat"
          @click="navigateToAlerts"
        >
          View More
        </v-btn>
      </div>
    </v-alert>
  </div>

  <!-- Fallback: Always show something for testing -->
  <div v-else class="mb-6">
    <h2 class="text-body-1 font-weight-medium mb-3">
      {{ currentChild.name }}'s Smart Alert (No Alerts Found)
    </h2>
    <v-alert class="health-alert" color="#E8F5E8" variant="tonal">
      <div class="d-flex align-center">
        <v-icon class="mr-3 ml-1" color="#4CAF50">
          mdi-check-circle
        </v-icon>
        <div>
          <div class="text-body-1 font-weight-medium mb-1">
            All Patterns Normal
          </div>
          <div class="text-body-2 text-grey-darken-1">
            No concerning patterns detected for {{ currentDateString }}
          </div>
        </div>
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthAlert } from '@/composables/useHealthAlert'

const props = defineProps({
  currentChild: {
    type: Object,
    required: true,
  },
  currentDate: {
    type: Date,
    required: false,
    default: () => new Date(),
  },
})

const emit = defineEmits(['view-more'])
const router = useRouter()

// Convert the date to string format for the composable
const currentDateString = computed(() => {
  return props.currentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
})

console.log('🔍 HealthAlert Debug:')
console.log('- props.currentDate:', props.currentDate)
console.log('- currentDateString:', currentDateString.value)
console.log('- Calling useHealthAlert with:', currentDateString.value)

// Use the simplified health alerts - get the full composable object
const healthAlert = useHealthAlert(currentDateString.value)
const { hasHealthAlert, alerts, forceAnalysis, updateContext } = healthAlert

// CRITICAL: Watch for date changes and update context
watch(currentDateString, (newDateString) => {
  console.log('🔄 HealthAlert: Date changed to:', newDateString)
  if (updateContext) {
    updateContext(newDateString)
  }
}, { immediate: false })

// Safely access forceAnalysis function
const safeForceAnalysis = forceAnalysis || (() => {
  console.log('⚠️ forceAnalysis function not available')
})

// Get the top priority alert
const topAlert = computed(() => {
  if (alerts.value && alerts.value.length > 0) {
    return alerts.value[0]
  }
  return null
})

// Debug function for the Log Details button
const logDetails = () => {
  console.log('🔍 HealthAlert Debug Details:')
  console.log('- currentDate:', props.currentDate)
  console.log('- currentDateString:', currentDateString.value)
  console.log('- hasHealthAlert:', hasHealthAlert.value)
  console.log('- alerts.length:', alerts.value?.length || 0)
  console.log('- alerts:', alerts.value)
  console.log('- topAlert:', topAlert.value)
  console.log('- currentChild:', props.currentChild?.name)
  
  // Also log the raw composable state
  console.log('- Raw healthAlert composable:', healthAlert)
}

// Dynamic alert styling based on alert type
const alertColor = computed(() => {
  if (!topAlert.value) return '#FFF2F0'
  
  const colorMap = {
    error: '#FFEBEE',    // Light red background
    warning: '#FFF8E1',  // Light orange background  
    info: '#E3F2FD'      // Light blue background
  }
  
  return colorMap[topAlert.value.type] || '#FFF2F0'
})

const alertIconColor = computed(() => {
  if (!topAlert.value) return '#FF5252'
  
  const colorMap = {
    error: '#F44336',    // Red
    warning: '#FF9800',  // Orange
    info: '#2196F3'      // Blue
  }
  
  return colorMap[topAlert.value.type] || '#FF5252'
})

const alertIcon = computed(() => {
  if (!topAlert.value) return 'mdi-alert'
  
  const iconMap = {
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  
  return iconMap[topAlert.value.type] || 'mdi-alert'
})

const navigateToAlerts = () => {
  // Navigate to guidance page with alert tab active
  router.push('/guidance?tab=alert')
  
  // Also emit the event for any parent component that might need it
  emit('view-more', topAlert.value)
}
</script>

<style scoped>
.health-alert {
  border: 1px solid currentColor !important;
}
</style>