<!-- components/PoopSummaryCard.vue -->
<template>
  <v-card elevation="0" rounded="lg" class="summary-card poop-summary">
    <v-card-text class="pa-4">
      <!-- Card icon and title -->
      <div class="text-center mb-3">
        <v-icon size="32" color="orange-darken-2">mdi-emoticon-poop</v-icon>
        <div class="text-caption text-uppercase font-weight-medium mt-2" style="letter-spacing: 0.5px;">
          POOP
        </div>
      </div>

      <!-- Main metric -->
      <div class="text-center mb-2">
        <div class="text-h5 font-weight-bold">{{ poopData.count }} times</div>
      </div>

      <!-- Status tags -->
      <div class="text-center mb-3">
        <div class="d-flex justify-center gap-2 flex-wrap">
          <v-chip 
            size="x-small" 
            :color="getStatusColor('unusual')" 
            variant="tonal"
            v-if="poopData.unusual"
          >
            <v-icon start size="x-small">mdi-alert</v-icon>
            1 unusual
          </v-chip>
          <v-chip 
            size="x-small" 
            :color="getStatusColor('normal')" 
            variant="tonal"
            v-if="poopData.normal"
          >
            <v-icon start size="x-small">mdi-check</v-icon>
            1 normal
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  poopData: {
    type: Object,
    default: () => ({
      count: 2,
      unusual: 1,
      normal: 1
    })
  }
})

const getStatusColor = (type) => {
  return type === 'unusual' ? 'error' : 'success'
}
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

.poop-summary {
  min-height: 180px;
}

.gap-2 {
  gap: 8px;
}
</style>