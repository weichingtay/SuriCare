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
      <v-btn size="small" @click="triggerAnalysis" class="mr-2">Force Analysis</v-btn>
    </div>
    
    <!-- Case 1: Has Alert -->
    <div v-if="hasAlert && topAlert">
      <v-alert class="health-alert" color="#FFF8E1" variant="tonal" style="border: 2px solid orange !important;">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="#FF9800">mdi-alert</v-icon>
            <div>
              <div class="text-body-1 font-weight-medium mb-1">{{ topAlert.title }}</div>
              <div class="text-body-2 text-grey-darken-1">{{ topAlert.description }}</div>
            </div>
          </div>
          <v-btn class="text-white" color="#FF9800" size="small" variant="flat" @click="navigateToAlerts">
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