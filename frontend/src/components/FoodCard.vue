<!-- components/FoodCard.vue -->
<template>
  <!-- Food summary card with custom styling -->
  <v-card elevation="0" rounded="lg" class="food-card">
    <v-card-text>
      <!-- Card header with title and last updated time -->
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-subtitle-2">Food</span>
        <!-- Last updated chip -->
        <v-chip size="x-small" variant="flat" color="grey-lighten-3">
          Last Updated: {{ lastUpdated }}
        </v-chip>
      </div>

      <!-- Food status description -->
      <p class="text-body-2 mb-3">{{ foodData.description }}</p>

      <!-- Meals count display with icon -->
      <div class="d-flex align-center justify-center">
        <!-- Food icon -->
        <v-icon size="x-large" color="orange" class="mr-3">mdi-food</v-icon>
        
        <!-- Meals count -->
        <div class="text-center">
          <div class="text-h4 font-weight-bold">{{ foodData.meals }}</div>
          <div class="text-caption text-grey">meals</div>
        </div>
      </div>

      <!-- Food intake status -->
      <v-divider class="my-3"></v-divider>
      
      <!-- Status indicator with appropriate icon and color -->
      <div class="d-flex justify-center">
        <v-chip 
          :color="statusColor" 
          variant="tonal"
          size="small"
          :prepend-icon="statusIcon"
        >
          {{ statusText }}
        </v-chip>
      </div>

      <!-- Optional: Meal breakdown if available -->
      <div v-if="foodData.breakdown" class="mt-3">
        <div class="text-caption text-grey mb-1">Today's meals:</div>
        <v-row dense>
          <v-col cols="4" class="text-center">
            <v-icon size="small" :color="foodData.breakdown.breakfast ? 'success' : 'grey'">
              mdi-weather-sunset-up
            </v-icon>
            <div class="text-caption">Breakfast</div>
          </v-col>
          <v-col cols="4" class="text-center">
            <v-icon size="small" :color="foodData.breakdown.lunch ? 'success' : 'grey'">
              mdi-weather-sunny
            </v-icon>
            <div class="text-caption">Lunch</div>
          </v-col>
          <v-col cols="4" class="text-center">
            <v-icon size="small" :color="foodData.breakdown.dinner ? 'success' : 'grey'">
              mdi-weather-night
            </v-icon>
            <div class="text-caption">Dinner</div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

// Props - data passed from parent component
const props = defineProps({
  // Food data object
  foodData: {
    type: Object,
    required: true,
    default: () => ({
      meals: 0,
      status: 'unknown',
      description: 'No food data available',
      breakdown: null
    })
  },
  // Last updated timestamp
  lastUpdated: {
    type: String,
    default: 'Unknown'
  }
})

// Computed property for status color based on eating status
const statusColor = computed(() => {
  const status = props.foodData.status?.toLowerCase()
  
  if (status === 'completed' || status === 'finished') {
    return 'success' // Green for completed meals
  } else if (status === 'partial' || status === 'some') {
    return 'warning' // Yellow for partial eating
  } else if (status === 'refused' || status === 'none') {
    return 'error' // Red for refused meals
  }
  
  return 'grey' // Default grey
})

// Computed property for status icon
const statusIcon = computed(() => {
  const status = props.foodData.status?.toLowerCase()
  
  if (status === 'completed' || status === 'finished') {
    return 'mdi-check-circle'
  } else if (status === 'partial' || status === 'some') {
    return 'mdi-circle-half-full'
  } else if (status === 'refused' || status === 'none') {
    return 'mdi-close-circle'
  }
  
  return 'mdi-help-circle'
})

// Computed property for status text
const statusText = computed(() => {
  const status = props.foodData.status?.toLowerCase()
  
  if (status === 'completed' || status === 'finished') {
    return 'All meals completed'
  } else if (status === 'partial' || status === 'some') {
    return 'Partially eaten'
  } else if (status === 'refused' || status === 'none') {
    return 'Meals refused'
  }
  
  return 'Status unknown'
})
</script>

<style scoped>
/* Component-specific styles */
.food-card {
  height: 100%;
  transition: all 0.3s ease;
}

/* Hover effect for the card */
.food-card:hover {
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