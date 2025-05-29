<!-- components/MoodCard.vue -->
<template>
  <!-- Mood summary card with custom styling -->
  <v-card elevation="0" rounded="lg" class="mood-card">
    <v-card-text>
      <!-- Card header with title and last updated time -->
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-subtitle-2">Mood</span>
        <!-- Last updated chip -->
        <v-chip size="x-small" variant="flat" color="grey-lighten-3">
          Last Updated: {{ lastUpdated }}
        </v-chip>
      </div>

      <!-- Mood description -->
      <p class="text-body-2 mb-3">{{ moodData.description }}</p>

      <!-- Mood emoji selector/display -->
      <div class="mood-selector">
        <!-- Display all mood options -->
        <div class="d-flex justify-space-around align-center my-4">
          <div
            v-for="mood in moodOptions"
            :key="mood.value"
            class="mood-option"
            :class="{ 'active': mood.value === moodData.current }"
          >
            <!-- Mood emoji -->
            <div class="mood-emoji text-h4">{{ mood.emoji }}</div>
            <!-- Optional: Show mood label on hover -->
            <v-tooltip :text="mood.label" location="bottom">
              <template v-slot:activator="{ props }">
                <div v-bind="props" class="mood-indicator"></div>
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>

      <!-- Current mood status chip -->
      <div class="d-flex justify-center mt-3">
        <v-chip 
          :color="moodColor" 
          variant="flat"
          size="small"
          prepend-icon="mdi-emoticon"
        >
          {{ moodLabel }}
        </v-chip>
      </div>

      <!-- Optional: Mood trend indicator -->
      <div v-if="moodData.trend" class="mt-3 text-center">
        <v-icon 
          :icon="trendIcon" 
          :color="trendColor"
          size="small"
        ></v-icon>
        <span class="text-caption text-grey ml-1">
          {{ trendText }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

// Props - data passed from parent component
const props = defineProps({
  // Mood data object
  moodData: {
    type: Object,
    required: true,
    default: () => ({
      current: 'neutral',
      emoji: '😐',
      description: 'No mood data available',
      trend: null // 'improving', 'stable', or 'declining'
    })
  },
  // Last updated timestamp
  lastUpdated: {
    type: String,
    default: 'Unknown'
  }
})

// Define all available mood options
const moodOptions = [
  { value: 'very-sad', emoji: '😢', label: 'Very Sad' },
  { value: 'sad', emoji: '😐', label: 'Sad' },
  { value: 'neutral', emoji: '😊', label: 'Neutral' },
  { value: 'happy', emoji: '😄', label: 'Happy' },
  { value: 'very-happy', emoji: '🤗', label: 'Very Happy' }
]

// Computed property for current mood label
const moodLabel = computed(() => {
  const currentMood = moodOptions.find(m => m.value === props.moodData.current)
  return currentMood ? currentMood.label : 'Unknown'
})

// Computed property for mood color
const moodColor = computed(() => {
  const mood = props.moodData.current
  
  if (mood === 'very-happy' || mood === 'happy') {
    return 'success' // Green for happy moods
  } else if (mood === 'neutral') {
    return 'info' // Blue for neutral
  } else if (mood === 'sad' || mood === 'very-sad') {
    return 'warning' // Yellow/Orange for sad moods
  }
  
  return 'grey'
})

// Computed properties for trend indicators
const trendIcon = computed(() => {
  if (props.moodData.trend === 'improving') return 'mdi-trending-up'
  if (props.moodData.trend === 'declining') return 'mdi-trending-down'
  return 'mdi-trending-neutral'
})

const trendColor = computed(() => {
  if (props.moodData.trend === 'improving') return 'success'
  if (props.moodData.trend === 'declining') return 'warning'
  return 'grey'
})

const trendText = computed(() => {
  if (props.moodData.trend === 'improving') return 'Mood improving'
  if (props.moodData.trend === 'declining') return 'Mood declining'
  return 'Mood stable'
})
</script>

<style scoped>
/* Component-specific styles */
.mood-card {
  height: 100%;
  transition: all 0.3s ease;
}

/* Hover effect for the card */
.mood-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Mood option styling */
.mood-option {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.3;
}

/* Active mood styling */
.mood-option.active {
  opacity: 1;
  transform: scale(1.1);
}

/* Mood emoji container */
.mood-emoji {
  user-select: none;
  transition: transform 0.2s ease;
}

/* Hover effect for mood options */
.mood-option:hover .mood-emoji {
  transform: scale(1.2);
}

/* Indicator dot below active mood */
.mood-option.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4CAF50;
}

/* Ensure consistent card height */
.v-card-text {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>