<!-- components/HealthSummaryCard.vue -->
<template>
  <v-card elevation="0" rounded="lg" class="summary-card health-summary">
    <v-card-text class="pa-4">
      <!-- Card icon and title -->
      <div class="text-center mb-3">
        <v-icon size="32" color="red">mdi-heart-pulse</v-icon>
        <div class="text-caption text-uppercase font-weight-medium mt-2" style="letter-spacing: 0.5px;">
          HEALTH
        </div>
      </div>

      <!-- Main status -->
      <div class="text-center mb-2">
        <div class="text-h6 font-weight-bold">{{ healthData.status }}</div>
      </div>

      <!-- Symptoms message -->
      <div class="text-center mb-3">
        <div class="text-body-2 text-grey-darken-1">{{ healthData.message }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  healthData: {
    type: Object,
    default: () => ({
      status: 'Healthy',
      message: 'No symptoms today'
    })
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

.health-summary {
  min-height: 180px;
}
</style>