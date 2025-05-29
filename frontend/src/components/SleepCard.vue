<!-- components/SleepCard.vue -->
<template>
  <!-- Sleep summary card with custom styling -->
  <v-card elevation="0" rounded="lg" class="sleep-card">
    <v-card-text>
      <!-- Card header with title and last updated time -->
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-subtitle-2">Sleep</span>
        <!-- Last updated chip -->
        <v-chip size="x-small" variant="flat" color="grey-lighten-3">
          Last Updated: {{ lastUpdated }}
        </v-chip>
      </div>

      <!-- Sleep description -->
      <p class="text-body-2 mb-3">{{ sleepData.description }}</p>

      <!-- Sleep hours display with icon -->
      <div class="d-flex align-center justify-center">
        <!-- Alarm clock icon -->
        <v-icon size="x-large" color="red" class="mr-3">mdi-alarm</v-icon>
        
        <!-- Hours display -->
        <div class="text-center">
          <div class="text-h4 font-weight-bold">{{ sleepData.hours }}</div>
          <div class="text-caption text-grey">hours</div>
        </div>
      </div>

      <!-- Sleep quality indicator -->
      <v-divider class="my-3"></v-divider>
      
      <!-- Quality chips showing sleep quality -->
      <div class="d-flex justify-center">
        <v-chip 
          :color="qualityColor" 
          variant="tonal"
          size="small"
          prepend-icon="mdi-bed"
        >
          Slept {{ sleepData.quality }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

// Props - data passed from parent component
const props = defineProps({
  // Sleep data object containing hours, quality, and description
  sleepData: {
    type: Object,
    required: true,
    default: () => ({
      hours: 0,
      quality: 'Unknown',
      description: 'No sleep data available'
    })
  },
  // Last updated timestamp
  lastUpdated: {
    type: String,
    default: 'Unknown'
  }
})

// Computed property to determine chip color based on sleep quality
const qualityColor = computed(() => {
  // Map sleep quality to colors
  const quality = props.sleepData.quality?.toLowerCase()
  
  if (quality === 'well' || quality === 'good') {
    return 'success' // Green for good sleep
  } else if (quality === 'fair' || quality === 'okay') {
    return 'warning' // Yellow for fair sleep
  } else if (quality === 'poor' || quality === 'bad') {
    return 'error' // Red for poor sleep
  }
  
  return 'grey' // Default grey for unknown
})
</script>

<style scoped>
/* Component-specific styles */
.sleep-card {
  height: 100%;
  transition: all 0.3s ease;
}

/* Hover effect for the card */
.sleep-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Ensure consistent card height */
.v-card-text {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>