<!-- components/SleepSummaryCard.vue -->
<template>
  <v-card elevation="0" rounded="lg" class="summary-card sleep-summary">
    <v-card-text class="pa-4">
      <!-- Card icon and title -->
      <div class="text-center mb-3">
        <v-icon size="32" color="deep-purple">mdi-moon-waning-crescent</v-icon>
        <div class="text-caption text-uppercase font-weight-medium mt-2" style="letter-spacing: 0.5px;">
          SLEEP
        </div>
      </div>

      <!-- No data state -->
      <template v-if="!sleepData || sleepData.noData">
        <div class="text-center">
          <div class="text-h5 font-weight-bold text-grey">--</div>
          <div class="text-body-2 text-grey mt-2">No check-in today</div>
        </div>
      </template>

      <!-- Data available state -->
      <template v-else>
        <!-- Main metric -->
        <div class="text-center mb-2">
          <div class="text-h5 font-weight-bold">{{ totalSleepHours }} hrs</div>
        </div>

        <!-- Sleep quality -->
        <div class="text-center mb-3">
          <div class="text-body-2 text-grey-darken-1">{{ sleepQualityStatement }}</div>
        </div>

        <!-- Sleep times -->
        <div class="sleep-times">
          <div class="d-flex align-center justify-center text-caption">
            <v-icon size="16" color="grey" class="mr-1">mdi-weather-night</v-icon>
            <span class="text-grey">Night {{ sleepData.nightHours || 0 }}h</span>
            <v-divider vertical class="mx-2" style="height: 12px;"></v-divider>
            <v-icon size="16" color="blue" class="mr-1">mdi-power-nap</v-icon>
            <span class="text-blue">Nap {{ sleepData.napHours || 0 }}h</span>
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  sleepData: {
    type: Object,
    default: () => ({
      nightHours: 9,      // Night sleep hours (8 PM - 8 AM typically)
      napHours: 1.5,      // Daytime nap hours (20 min - 3 hours)
      wakeCount: 0,       // Number of times woke during night
      childAge: 3         // Child's age for recommendations
    })
  }
})

// Calculate total sleep hours
const totalSleepHours = computed(() => {
  if (!props.sleepData || props.sleepData.noData) return 0
  const total = (props.sleepData.nightHours || 0) + (props.sleepData.napHours || 0)
  return total % 1 === 0 ? total : total.toFixed(1)
})

// Calculate sleep quality statement based on multiple factors
const sleepQualityStatement = computed(() => {
  if (!props.sleepData || props.sleepData.noData) return ''
  
  const nightHours = props.sleepData.nightHours || 0
  const napHours = props.sleepData.napHours || 0
  const totalHours = nightHours + napHours
  const wakeCount = props.sleepData.wakeCount || 0
  const age = props.sleepData.childAge || 3
  
  // Age-based recommended sleep ranges
  let recommendedRange = { min: 10, max: 13 } // Default for 3-5 years
  if (age < 1) {
    recommendedRange = { min: 12, max: 16 }
  } else if (age >= 1 && age < 3) {
    recommendedRange = { min: 11, max: 14 }
  } else if (age >= 6 && age <= 12) {
    recommendedRange = { min: 9, max: 12 }
  }
  
  // Calculate sleep quality score
  let qualityScore = 0
  
  // Check total hours (50% weight)
  if (totalHours >= recommendedRange.min && totalHours <= recommendedRange.max) {
    qualityScore += 50
  } else if (totalHours >= recommendedRange.min - 1 && totalHours <= recommendedRange.max + 1) {
    qualityScore += 25
  }
  
  // Check night sleep continuity (35% weight)
  if (wakeCount === 0) {
    qualityScore += 35
  } else if (wakeCount === 1) {
    qualityScore += 25
  } else if (wakeCount === 2) {
    qualityScore += 15
  }
  
  // Check night sleep duration (15% weight)
  if (nightHours >= 9) {
    qualityScore += 15
  } else if (nightHours >= 8) {
    qualityScore += 10
  } else if (nightHours >= 7) {
    qualityScore += 5
  }
  
  // Generate statement based on score
  if (qualityScore >= 80) {
    return 'Sleep was excellent'
  } else if (qualityScore >= 60) {
    return 'Sleep was good'
  } else if (qualityScore >= 40) {
    return 'Sleep was fair'
  } else {
    return 'Sleep was poor'
  }
})
</script>

<style scoped>
.summary-card {
  height: 100%;
  background-color: #FAFAFA;
  border: 1px solid #E0E0E0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.sleep-summary {
  min-height: 180px;
}
</style>