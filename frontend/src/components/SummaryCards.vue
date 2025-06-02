<template>
  <v-row>
    <!-- Sleep Card -->
    <v-col cols="12" sm="6" md="4">
      <SleepCard 
        :hours="sleepHours"
        :quality="sleepQuality"
        :bedtime="sleepBedtime"
        :wakeTime="sleepWakeTime"
      />
    </v-col>
    
    <!-- Food Card -->
    <v-col cols="12" sm="6" md="4">
      <FoodCard 
        :meals="foodMeals"
        :snacks="foodSnacks"
        :waterIntake="foodWaterIntake"
      />
    </v-col>
    
    <!-- Mood Card -->
    <v-col cols="12" sm="6" md="4">
      <MoodCard 
        :mood="mood"
        :activities="moodActivities"
        :notes="moodNotes"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import SleepCard from './SleepCard.vue'
import FoodCard from './FoodCard.vue'
import MoodCard from './MoodCard.vue'

defineProps({
  sleepHours: {
    type: Number,
    default: 0
  },
  sleepQuality: {
    type: String,
    default: ''
  },
  sleepBedtime: {
    type: String,
    default: ''
  },
  sleepWakeTime: {
    type: String,
    default: ''
  },
  foodMeals: {
    type: Array,
    default: () => []
  },
  foodSnacks: {
    type: Array,
    default: () => []
  },
  foodWaterIntake: {
    type: Number,
    default: 0
  },
  mood: {
    type: String,
    default: ''
  },
  moodActivities: {
    type: Array,
    default: () => []
  },
  moodNotes: {
    type: String,
    default: ''
  }
})
</script>
