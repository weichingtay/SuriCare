<template>
  <div class="mb-6">
    <h2 class="text-body-1 font-weight-medium mb-3">
      {{ currentChild.name }}'s Smart Alert
    </h2>
    
    <!-- DEBUG: Show current state -->
    <div class="mb-2 p-2 bg-yellow-lighten-4 rounded">
      <p><strong>DEBUG:</strong> isLoading={{ isLoading }}, hasAlert={{ hasAlert }}, alerts.length={{ alerts.length }}</p>
      <p><strong>Current Date:</strong> {{ currentDateString }}</p>
      <p><strong>Alert Title:</strong> {{ topAlert?.title || 'NULL' }}</p>
      <p><strong>Alert Type:</strong> {{ topAlert?.type || 'NULL' }}</p>
      <v-btn size="small" @click="triggerAnalysis" class="mr-2">Force Analysis</v-btn>
    </div>
    
    <!-- Case 1: Has Alert -->
    <div v-if="hasAlert && topAlert">
      <v-alert 
        class="health-alert" 
        :color="alertBackgroundColor" 
        variant="tonal" 
        :style="`border: 2px solid ${alertBorderColor} !important;`"
      >
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-3" :color="alertIconColor">{{ alertIcon }}</v-icon>
            <div>
              <div class="text-body-1 font-weight-medium mb-1">{{ topAlert.title }}</div>
              <div class="text-body-2 text-grey-darken-1">{{ topAlert.description }}</div>
            </div>
          </div>
          <v-btn 
            class="text-white" 
            :color="alertButtonColor" 
            size="small" 
            variant="flat" 
            @click="navigateToAlerts"
          >
            View More
          </v-btn>
        </div>
      </v-alert>
    </div>

    <!-- Case 2: Loading -->
    <div v-else-if="isLoading">
      <v-alert class="health-alert" color="#F5F5F5" variant="tonal">
        <div class="d-flex align-center">
          <v-progress-circular class="mr-3" color="primary" indeterminate size="20" />
          <div>
            <div class="text-body-1 font-weight-medium mb-1">
              AI Analyzing Health Patterns...
            </div>
            <div class="text-body-2 text-grey-darken-1">
              Checking data for {{ currentDateString }}
            </div>
          </div>
        </div>
      </v-alert>
    </div>

    <!-- Case 3: All Normal -->
    <div v-else>
      <v-alert class="health-alert" color="#E8F5E5" variant="tonal">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#4CAF50">mdi-check-circle</v-icon>
          <div>
            <div class="text-body-1 font-weight-medium mb-1">All Patterns Normal</div>
            <div class="text-body-2 text-grey-darken-1">No concerning patterns detected for {{ currentDateString }}</div>
          </div>
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthAlert } from '@/composables/useHealthAlert'

const props = defineProps({
  currentChild: { type: Object, required: true },
  currentDate: { type: Date, required: false, default: () => new Date() },
})

const router = useRouter()

// STABLE: Consistent date format (Shanghai timezone)
const currentDateString = computed(() => {
  const date = props.currentDate || new Date()
  
  // Convert to Shanghai timezone for display
  const shanghaiOffset = 8 * 60 // Shanghai is UTC+8
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const shanghaiTime = new Date(utc + (shanghaiOffset * 60000))
  
  // Return YYYY-MM-DD format in Shanghai time
  const year = shanghaiTime.getFullYear()
  const month = String(shanghaiTime.getMonth() + 1).padStart(2, '0')
  const day = String(shanghaiTime.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
})

// STABLE: Simple loading state
const isLoading = ref(false)

// STABLE: Initialize composable
const { alerts, analyzeForDate } = useHealthAlert()

// STABLE: Simple computed properties
const hasAlert = computed(() => alerts.value && alerts.value.length > 0)
const topAlert = computed(() => hasAlert.value ? alerts.value[0] : null)

// NEW: Dynamic alert styling using your design system colors
const alertBackgroundColor = computed(() => {
  if (!topAlert.value) return 'rgba(255, 152, 0, 0.08)' // Light orange using your opacity pattern
  
  switch (topAlert.value.type) {
    case 'error':
      return 'rgba(244, 67, 54, 0.08)' // Light red background using your app's opacity style
    case 'warning':
      return 'rgba(255, 152, 0, 0.08)' // Light orange background
    case 'info':
      return 'rgba(216, 113, 121, 0.08)' // Light pink using your $app-primary
    default:
      return 'rgba(255, 152, 0, 0.08)'
  }
})

const alertBorderColor = computed(() => {
  if (!topAlert.value) return '#ff9800' // Your $status-warning
  
  switch (topAlert.value.type) {
    case 'error':
      return '#f44336' // Your $status-negative
    case 'warning':
      return '#ff9800' // Your $status-warning
    case 'info':
      return '#d87179' // Your $app-primary
    default:
      return '#ff9800'
  }
})

const alertIconColor = computed(() => {
  if (!topAlert.value) return '#ff9800'
  
  switch (topAlert.value.type) {
    case 'error':
      return '#f44336' // Your $status-negative
    case 'warning':
      return '#ff9800' // Your $status-warning
    case 'info':
      return '#d87179' // Your $app-primary
    default:
      return '#ff9800'
  }
})

const alertIcon = computed(() => {
  if (!topAlert.value) return 'mdi-alert'
  
  switch (topAlert.value.type) {
    case 'error':
      return 'mdi-alert-circle' // More severe icon for errors
    case 'warning':
      return 'mdi-alert' // Standard warning icon
    case 'info':
      return 'mdi-information' // Info icon
    default:
      return 'mdi-alert'
  }
})

const alertButtonColor = computed(() => {
  if (!topAlert.value) return '#ff9800'
  
  switch (topAlert.value.type) {
    case 'error':
      return '#f44336' // Your $status-negative
    case 'warning':
      return '#ff9800' // Your $status-warning
    case 'info':
      return '#d87179' // Your $app-primary
    default:
      return '#ff9800'
  }
})

// STABLE: Manual analysis trigger
const triggerAnalysis = async () => {
  console.log(`🎯 Triggering analysis for: ${currentDateString.value}`)
  
  isLoading.value = true
  
  try {
    await analyzeForDate(currentDateString.value)
    console.log(`✅ Analysis completed for: ${currentDateString.value}`)
  } catch (error) {
    console.error('❌ Analysis failed:', error)
  } finally {
    // Always stop loading after 1 second minimum
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
  }
}

// STABLE: Watch for date changes (no race conditions)
watch(currentDateString, (newDate, oldDate) => {
  if (oldDate && newDate !== oldDate) {
    console.log(`📅 Date changed from ${oldDate} to ${newDate}`)
    triggerAnalysis()
  }
}, { immediate: false })

// STABLE: Initialize on mount
onMounted(() => {
  console.log(`🚀 HealthAlert mounted for: ${currentDateString.value}`)
  // Trigger initial analysis after 500ms
  setTimeout(triggerAnalysis, 500)
})

const navigateToAlerts = () => {
  router.push('/guidance?tab=alert')
}
</script>

<style scoped>
.health-alert {
  border: 1px solid currentColor !important;
}
</style>